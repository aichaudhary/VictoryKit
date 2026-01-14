/**
 * EDR Integration Service
 * Real-world integrations for endpoint detection and response
 *
 * Integrates with: CrowdStrike Falcon, SentinelOne, Microsoft Defender, Carbon Black
 */

const axios = require('axios');

class EDRService {
  constructor() {
    // CrowdStrike
    this.csClientId = process.env.incidentcommand_CROWDSTRIKE_CLIENT_ID;
    this.csClientSecret = process.env.incidentcommand_CROWDSTRIKE_CLIENT_SECRET;
    this.csBaseUrl =
      process.env.incidentcommand_CROWDSTRIKE_BASE_URL || 'https://api.crowdstrike.com';
    this.csToken = null;
    this.csTokenExpiry = null;

    // SentinelOne
    this.s1ApiKey = process.env.incidentcommand_SENTINELONE_API_KEY;
    this.s1BaseUrl = process.env.incidentcommand_SENTINELONE_BASE_URL;

    // Microsoft Defender
    this.msDefenderApiKey = process.env.incidentcommand_MS_DEFENDER_API_KEY;
    this.msDefenderBaseUrl =
      process.env.incidentcommand_MS_DEFENDER_BASE_URL || 'https://api.security.microsoft.com/api';

    // Carbon Black
    this.cbApiId = process.env.incidentcommand_CARBONBLACK_API_ID;
    this.cbApiKey = process.env.incidentcommand_CARBONBLACK_API_KEY;
    this.cbBaseUrl = process.env.incidentcommand_CARBONBLACK_BASE_URL;
  }

  /**
   * Search for indicators across all EDR platforms
   */
  async searchIndicators(indicators) {
    const results = {
      matches: [],
      affectedEndpoints: [],
      sources: [],
      searchedAt: new Date().toISOString(),
    };

    const searches = [];

    if (this.csClientId && this.csClientSecret) {
      searches.push(this.searchCrowdStrike(indicators));
    }
    if (this.s1ApiKey && this.s1BaseUrl) {
      searches.push(this.searchSentinelOne(indicators));
    }
    if (this.msDefenderApiKey) {
      searches.push(this.searchDefender(indicators));
    }

    if (searches.length === 0) {
      return this.simulatedEDRResults(indicators);
    }

    const searchResults = await Promise.allSettled(searches);

    searchResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        results.sources.push(result.value.source);
        results.matches.push(...(result.value.matches || []));
        results.affectedEndpoints.push(...(result.value.affectedEndpoints || []));
      }
    });

    // Deduplicate endpoints
    results.affectedEndpoints = [
      ...new Map(results.affectedEndpoints.map((e) => [e.hostname || e.id, e])).values(),
    ];

    return results;
  }

  /**
   * CrowdStrike Falcon - Search and containment
   */
  async searchCrowdStrike(indicators) {
    try {
      await this.ensureCrowdStrikeToken();

      const matches = [];
      const affectedEndpoints = [];

      // Search for each indicator
      for (const ioc of indicators) {
        let filter = '';
        switch (ioc.type) {
          case 'hash':
            filter = `sha256:'${ioc.value}' OR md5:'${ioc.value}'`;
            break;
          case 'ip':
            filter = `device.external_ip:'${ioc.value}' OR device.local_ip:'${ioc.value}'`;
            break;
          case 'domain':
            filter = `behaviors.dns_requests:'${ioc.value}'`;
            break;
          default:
            continue;
        }

        const response = await axios.get(`${this.csBaseUrl}/detects/queries/detects/v1`, {
          params: { filter, limit: 50 },
          headers: { Authorization: `Bearer ${this.csToken}` },
        });

        if (response.data.resources?.length > 0) {
          // Get detection details
          const detailsResponse = await axios.post(
            `${this.csBaseUrl}/detects/entities/summaries/GET/v1`,
            { ids: response.data.resources },
            { headers: { Authorization: `Bearer ${this.csToken}` } }
          );

          detailsResponse.data.resources?.forEach((detection) => {
            matches.push({
              source: 'CrowdStrike',
              detectionId: detection.detection_id,
              indicator: ioc.value,
              severity: detection.max_severity_displayname,
              tactic: detection.behaviors?.[0]?.tactic,
              technique: detection.behaviors?.[0]?.technique,
              timestamp: detection.first_behavior,
            });

            if (detection.device) {
              affectedEndpoints.push({
                source: 'CrowdStrike',
                id: detection.device.device_id,
                hostname: detection.device.hostname,
                platform: detection.device.platform_name,
                status: detection.device.status,
                lastSeen: detection.device.last_seen,
              });
            }
          });
        }
      }

      return { source: 'CrowdStrike', matches, affectedEndpoints };
    } catch (error) {
      console.error('CrowdStrike search error:', error.message);
      return null;
    }
  }

  /**
   * SentinelOne - Search and containment
   */
  async searchSentinelOne(indicators) {
    try {
      const matches = [];
      const affectedEndpoints = [];

      for (const ioc of indicators) {
        const response = await axios.get(`${this.s1BaseUrl}/threats`, {
          params: {
            limit: 50,
            ...(ioc.type === 'hash' && { contentHashes__contains: ioc.value }),
            ...(ioc.type === 'ip' && { networkInterfaceInet__contains: ioc.value }),
          },
          headers: { Authorization: `ApiToken ${this.s1ApiKey}` },
        });

        response.data.data?.forEach((threat) => {
          matches.push({
            source: 'SentinelOne',
            threatId: threat.id,
            indicator: ioc.value,
            classification: threat.classification,
            threatName: threat.threatName,
            status: threat.mitigationStatus,
            timestamp: threat.createdAt,
          });

          affectedEndpoints.push({
            source: 'SentinelOne',
            id: threat.agentId,
            hostname: threat.agentComputerName,
            platform: threat.osType,
            status: threat.agentIsActive ? 'online' : 'offline',
            lastSeen: threat.agentLastActiveAt,
          });
        });
      }

      return { source: 'SentinelOne', matches, affectedEndpoints };
    } catch (error) {
      console.error('SentinelOne search error:', error.message);
      return null;
    }
  }

  /**
   * Microsoft Defender - Search and containment
   */
  async searchDefender(indicators) {
    try {
      const matches = [];
      const affectedEndpoints = [];

      for (const ioc of indicators) {
        // Advanced hunting query
        const query =
          ioc.type === 'hash'
            ? `DeviceFileEvents | where SHA256 == "${ioc.value}" or MD5 == "${ioc.value}" | take 50`
            : ioc.type === 'ip'
              ? `DeviceNetworkEvents | where RemoteIP == "${ioc.value}" | take 50`
              : `DeviceNetworkEvents | where RemoteUrl contains "${ioc.value}" | take 50`;

        const response = await axios.post(
          `${this.msDefenderBaseUrl}/advancedqueries/run`,
          { Query: query },
          {
            headers: {
              Authorization: `Bearer ${this.msDefenderApiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        response.data.Results?.forEach((result) => {
          matches.push({
            source: 'Microsoft Defender',
            indicator: ioc.value,
            deviceName: result.DeviceName,
            fileName: result.FileName,
            timestamp: result.Timestamp,
          });

          affectedEndpoints.push({
            source: 'Microsoft Defender',
            id: result.DeviceId,
            hostname: result.DeviceName,
            platform: 'Windows',
            status: 'unknown',
          });
        });
      }

      return { source: 'Microsoft Defender', matches, affectedEndpoints };
    } catch (error) {
      console.error('Defender search error:', error.message);
      return null;
    }
  }

  /**
   * Isolate endpoint across EDR platforms
   */
  async isolateEndpoint(endpointId, platform) {
    switch (platform.toLowerCase()) {
      case 'crowdstrike':
        return this.isolateCrowdStrike(endpointId);
      case 'sentinelone':
        return this.isolateSentinelOne(endpointId);
      case 'defender':
        return this.isolateDefender(endpointId);
      default:
        return { success: false, error: 'Unknown platform' };
    }
  }

  async isolateCrowdStrike(deviceId) {
    try {
      await this.ensureCrowdStrikeToken();
      await axios.post(
        `${this.csBaseUrl}/devices/entities/devices-actions/v2`,
        { ids: [deviceId], action_parameters: [{ name: 'action_name', value: 'contain' }] },
        { headers: { Authorization: `Bearer ${this.csToken}` } }
      );
      return { success: true, platform: 'CrowdStrike', action: 'isolated' };
    } catch (error) {
      return { success: false, platform: 'CrowdStrike', error: error.message };
    }
  }

  async isolateSentinelOne(agentId) {
    try {
      await axios.post(
        `${this.s1BaseUrl}/agents/actions/disconnect`,
        { filter: { ids: [agentId] } },
        { headers: { Authorization: `ApiToken ${this.s1ApiKey}` } }
      );
      return { success: true, platform: 'SentinelOne', action: 'isolated' };
    } catch (error) {
      return { success: false, platform: 'SentinelOne', error: error.message };
    }
  }

  async isolateDefender(machineId) {
    try {
      await axios.post(
        `${this.msDefenderBaseUrl}/machines/${machineId}/isolate`,
        { Comment: 'Isolated via VictoryKit incidentcommand', IsolationType: 'Full' },
        { headers: { Authorization: `Bearer ${this.msDefenderApiKey}` } }
      );
      return { success: true, platform: 'Microsoft Defender', action: 'isolated' };
    } catch (error) {
      return { success: false, platform: 'Microsoft Defender', error: error.message };
    }
  }

  /**
   * Get endpoint details from EDR
   */
  async getEndpointDetails(hostname) {
    const results = [];

    if (this.csClientId && this.csClientSecret) {
      try {
        await this.ensureCrowdStrikeToken();
        const response = await axios.get(`${this.csBaseUrl}/devices/queries/devices/v1`, {
          params: { filter: `hostname:'${hostname}'` },
          headers: { Authorization: `Bearer ${this.csToken}` },
        });
        if (response.data.resources?.length > 0) {
          const detailsResponse = await axios.post(
            `${this.csBaseUrl}/devices/entities/devices/v2`,
            { ids: response.data.resources },
            { headers: { Authorization: `Bearer ${this.csToken}` } }
          );
          results.push({ source: 'CrowdStrike', data: detailsResponse.data.resources[0] });
        }
      } catch (error) {
        console.error('CrowdStrike endpoint lookup error:', error.message);
      }
    }

    if (results.length === 0) {
      return this.simulatedEndpointDetails(hostname);
    }

    return results;
  }

  /**
   * Ensure CrowdStrike OAuth token
   */
  async ensureCrowdStrikeToken() {
    if (this.csToken && this.csTokenExpiry && Date.now() < this.csTokenExpiry) {
      return;
    }

    const response = await axios.post(
      `${this.csBaseUrl}/oauth2/token`,
      new URLSearchParams({
        client_id: this.csClientId,
        client_secret: this.csClientSecret,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    this.csToken = response.data.access_token;
    this.csTokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
  }

  // ============= Simulated Responses =============

  simulatedEDRResults(indicators) {
    return {
      matches: indicators.map((ioc, idx) => ({
        source: 'Simulated EDR',
        indicator: ioc.value,
        severity: idx % 3 === 0 ? 'High' : 'Medium',
        detected: new Date(Date.now() - idx * 3600000).toISOString(),
      })),
      affectedEndpoints: [
        {
          source: 'Simulated',
          id: 'SIM-001',
          hostname: 'WORKSTATION-001',
          platform: 'Windows',
          status: 'online',
        },
        {
          source: 'Simulated',
          id: 'SIM-002',
          hostname: 'SERVER-WEB-01',
          platform: 'Linux',
          status: 'online',
        },
      ],
      sources: ['Simulated EDR'],
      searchedAt: new Date().toISOString(),
      simulated: true,
    };
  }

  simulatedEndpointDetails(hostname) {
    return [
      {
        source: 'Simulated',
        data: {
          hostname,
          platform: 'Windows 11',
          osVersion: '10.0.22621',
          lastSeen: new Date().toISOString(),
          status: 'online',
          agent: { version: '7.10.0', status: 'active' },
          policies: ['Default Policy', 'High Security'],
          tags: ['production', 'workstation'],
        },
        simulated: true,
      },
    ];
  }
}

module.exports = new EDRService();
