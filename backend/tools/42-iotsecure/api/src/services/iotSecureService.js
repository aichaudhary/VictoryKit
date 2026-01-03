const axios = require('axios');
const { getConnectors } = require('../../../../../../shared/connectors');
const externalAPIs = require('./externalAPIs');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8041';

class IoTSecureService {
  async analyze(data) {
    try {
      const mlResponse = await axios.post(`${ML_ENGINE_URL}/analyze`, { data });
      return mlResponse.data;
    } catch (error) {
      throw new Error(`ML analysis failed: ${error.message}`);
    }
  }

  async scan(target) {
    try {
      const mlResponse = await axios.post(`${ML_ENGINE_URL}/scan`, { target });
      return mlResponse.data;
    } catch (error) {
      throw new Error(`ML scan failed: ${error.message}`);
    }
  }

  async integrateWithSecurityStack(entityId, data) {
    const connectors = getConnectors();
    const integrationPromises = [];

    // Microsoft Sentinel - Log IoT security events
    if (connectors.sentinel) {
      integrationPromises.push(
        connectors.sentinel.ingestData({
          table: 'IoTSecureEvents',
          data: {
            entityId,
            timestamp: new Date().toISOString(),
            deviceAnomalies: data.deviceAnomalies || [],
            firmwareVulnerabilities: data.firmwareVulnerabilities || [],
            unauthorizedDevices: data.unauthorizedDevices || [],
            threatLevel: data.threatLevel || 'low',
            deviceTypes: data.deviceTypes || [],
            networkTraffic: data.networkTraffic || [],
            powerConsumption: data.powerConsumption || [],
            communicationPatterns: data.communicationPatterns || []
          }
        }).catch(err => ({ error: `Sentinel integration failed: ${err.message}` }))
      );
    }

    // Cortex XSOAR - Create incidents for IoT security breaches
    if (connectors.xsoar && (data.threatLevel === 'high' || data.threatLevel === 'critical')) {
      integrationPromises.push(
        connectors.xsoar.createIncident({
          type: 'IoTSecureAlert',
          severity: data.threatLevel === 'critical' ? 'high' : 'medium',
          title: `IoT Secure Alert: ${data.unauthorizedDevices?.length || 0} unauthorized devices detected`,
          description: `Automated IoT analysis detected potential security breach or compromised devices`,
          labels: ['iot-secure', 'automated-detection'],
          details: {
            entityId,
            unauthorizedDevices: data.unauthorizedDevices,
            firmwareVulnerabilities: data.firmwareVulnerabilities,
            deviceAnomalies: data.deviceAnomalies,
            deviceTypes: data.deviceTypes
          }
        }).catch(err => ({ error: `XSOAR integration failed: ${err.message}` }))
      );
    }

    // CrowdStrike - IoT endpoint protection
    if (connectors.crowdstrike && data.unauthorizedDevices?.length > 0 && data.threatLevel !== 'low') {
      integrationPromises.push(
        connectors.crowdstrike.iotProtection({
          action: 'isolate',
          devices: data.unauthorizedDevices,
          reason: 'IoT Secure automated protection',
          severity: data.threatLevel
        }).catch(err => ({ error: `CrowdStrike integration failed: ${err.message}` }))
      );
    }

    // Cloudflare - IoT traffic analysis and blocking
    if (connectors.cloudflare && data.networkTraffic?.length > 0) {
      integrationPromises.push(
        connectors.cloudflare.updateIoTTrafficRules({
          action: 'block',
          suspiciousTraffic: data.networkTraffic,
          deviceTypes: data.deviceTypes,
          reason: 'IoT Secure automated blocking',
          priority: data.threatLevel === 'critical' ? 1 : 2
        }).catch(err => ({ error: `Cloudflare integration failed: ${err.message}` }))
      );
    }

    // Kong - IoT API security controls
    if (connectors.kong && data.deviceTypes?.length > 0 && data.threatLevel !== 'low') {
      integrationPromises.push(
        connectors.kong.createIoTSecurityPolicy({
          deviceTypes: data.deviceTypes,
          blockedCommunications: data.communicationPatterns,
          reason: 'IoT Secure suspicious activity',
          rateLimit: data.threatLevel === 'critical' ? 10 : 50
        }).catch(err => ({ error: `Kong integration failed: ${err.message}` }))
      );
    }

    // Okta - IoT device authentication
    if (connectors.okta && data.unauthorizedDevices) {
      integrationPromises.push(
        connectors.okta.updateIoTAuthentication({
          unauthorizedDevices: data.unauthorizedDevices,
          threatLevel: data.threatLevel,
          reason: 'IoT Secure automated policy update',
          deviceTypes: data.deviceTypes
        }).catch(err => ({ error: `Okta integration failed: ${err.message}` }))
      );
    }

    // OpenCTI - IoT-based threat indicators
    if (connectors.opencti && data.firmwareVulnerabilities?.length > 0) {
      integrationPromises.push(
        connectors.opencti.createIndicators({
          type: 'vulnerability',
          values: data.firmwareVulnerabilities,
          labels: ['iot-secure', 'automated-detection'],
          confidence: data.threatLevel === 'critical' ? 90 : data.threatLevel === 'high' ? 75 : 60,
          description: `IoT Secure detected firmware vulnerabilities and unauthorized device access`
        }).catch(err => ({ error: `OpenCTI integration failed: ${err.message}` }))
      );
    }

    // Execute all integrations in parallel with error resilience
    const results = await Promise.allSettled(integrationPromises);
    const failures = results.filter(result => result.status === 'rejected').map(result => result.reason);

    if (failures.length > 0) {
      console.warn('Some security stack integrations failed:', failures);
    }

    return {
      success: true,
      integrationsAttempted: integrationPromises.length,
      failures: failures.length,
      details: results.map((result, index) => ({
        integration: index,
        success: result.status === 'fulfilled',
        error: result.status === 'rejected' ? result.reason.message : null
      }))
    };
  }

  /**
   * Discover IoT devices using external APIs (Shodan, Censys)
   */
  async discoverDevices(network, options = {}) {
    const results = {
      shodan: null,
      censys: null,
      combined: []
    };

    // Query Shodan for IoT devices
    const shodanQuery = options.query || `net:${network} product:camera OR product:router OR product:iot`;
    results.shodan = await externalAPIs.shodan.searchDevices(shodanQuery);

    // Query Censys for additional coverage
    const censysQuery = options.query || `services.service_name: http AND ip: ${network}`;
    results.censys = await externalAPIs.censys.searchHosts(censysQuery);

    // Combine and deduplicate results
    const deviceMap = new Map();
    
    if (results.shodan.success && results.shodan.data?.matches) {
      results.shodan.data.matches.forEach(match => {
        deviceMap.set(match.ip_str, {
          ip: match.ip_str,
          hostname: match.hostnames?.[0] || null,
          deviceType: this.classifyDevice(match.product || ''),
          manufacturer: match.org || 'Unknown',
          openPorts: [match.port],
          services: [match.product],
          vulnerabilities: match.vulns || [],
          lastSeen: new Date().toISOString(),
          source: 'shodan'
        });
      });
    }

    if (results.censys.success && results.censys.data?.result?.hits) {
      results.censys.data.result.hits.forEach(hit => {
        const existing = deviceMap.get(hit.ip);
        if (existing) {
          existing.source = 'shodan+censys';
        } else {
          deviceMap.set(hit.ip, {
            ip: hit.ip,
            hostname: hit.dns?.reverse?.[0] || null,
            deviceType: this.classifyDevice(hit.services?.map(s => s.service_name).join(' ') || ''),
            manufacturer: hit.autonomous_system?.name || 'Unknown',
            openPorts: hit.services?.map(s => s.port) || [],
            services: hit.services?.map(s => s.service_name) || [],
            vulnerabilities: [],
            lastSeen: new Date().toISOString(),
            source: 'censys'
          });
        }
      });
    }

    results.combined = Array.from(deviceMap.values());
    return results;
  }

  /**
   * Scan device for vulnerabilities using NVD and Shodan
   */
  async scanDeviceVulnerabilities(ip, deviceInfo = {}) {
    const results = {
      ip,
      vulnerabilities: [],
      riskScore: 0,
      recommendations: []
    };

    // Get host info from Shodan
    const shodanHost = await externalAPIs.shodan.getHostInfo(ip);
    if (shodanHost.success && shodanHost.data?.vulns) {
      for (const cveId of shodanHost.data.vulns) {
        const cveDetails = await externalAPIs.nvd.getCVE(cveId);
        if (cveDetails.success && cveDetails.data?.vulnerabilities?.[0]) {
          const vuln = cveDetails.data.vulnerabilities[0].cve;
          results.vulnerabilities.push({
            cveId,
            description: vuln.descriptions?.[0]?.value || 'No description',
            severity: vuln.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity || 'UNKNOWN',
            score: vuln.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore || 0,
            exploitAvailable: vuln.cisaExploitAdd ? true : false
          });
        }
      }
    }

    // Check with GreyNoise for malicious activity
    const greyNoiseResult = await externalAPIs.greyNoise.checkIP(ip);
    if (greyNoiseResult.success && greyNoiseResult.data?.noise) {
      results.recommendations.push({
        type: 'warning',
        message: 'This IP has been observed in internet scanning activity',
        action: 'Investigate network activity patterns'
      });
    }

    // Calculate risk score
    results.riskScore = this.calculateRiskScore(results.vulnerabilities);
    results.recommendations.push(...this.generateRecommendations(results.vulnerabilities));

    return results;
  }

  /**
   * Analyze firmware for malware using VirusTotal
   */
  async analyzeFirmware(firmwareHash, metadata = {}) {
    const vtResult = await externalAPIs.virusTotal.analyzeFirmware(firmwareHash);
    
    if (!vtResult.success) {
      return {
        hash: firmwareHash,
        status: 'not_found',
        message: vtResult.error || 'Firmware not found in VirusTotal database',
        recommendation: 'Consider uploading firmware for analysis'
      };
    }

    const analysis = vtResult.data?.data?.attributes;
    return {
      hash: firmwareHash,
      status: 'analyzed',
      malicious: analysis?.last_analysis_stats?.malicious || 0,
      suspicious: analysis?.last_analysis_stats?.suspicious || 0,
      undetected: analysis?.last_analysis_stats?.undetected || 0,
      lastAnalysis: analysis?.last_analysis_date,
      threatLabels: analysis?.popular_threat_classification?.suggested_threat_label || null,
      recommendation: analysis?.last_analysis_stats?.malicious > 0 
        ? 'CRITICAL: Malicious firmware detected - do not deploy'
        : 'Firmware appears clean'
    };
  }

  /**
   * Get threat intelligence for IoT indicators
   */
  async getThreatIntelligence(indicators) {
    const results = [];

    for (const indicator of indicators) {
      if (indicator.type === 'ip') {
        const [vtResult, gnResult] = await Promise.all([
          externalAPIs.virusTotal.getIPReport(indicator.value),
          externalAPIs.greyNoise.checkIP(indicator.value)
        ]);

        results.push({
          indicator: indicator.value,
          type: 'ip',
          virustotal: vtResult.success ? {
            malicious: vtResult.data?.data?.attributes?.last_analysis_stats?.malicious || 0,
            reputation: vtResult.data?.data?.attributes?.reputation || 0
          } : null,
          greynoise: gnResult.success ? {
            noise: gnResult.data?.noise,
            classification: gnResult.data?.classification,
            name: gnResult.data?.name
          } : null
        });
      }
    }

    return results;
  }

  /**
   * Classify device type based on product/service info
   */
  classifyDevice(productInfo) {
    const info = productInfo.toLowerCase();
    if (info.includes('camera') || info.includes('hikvision') || info.includes('dahua')) return 'camera';
    if (info.includes('router') || info.includes('gateway')) return 'router';
    if (info.includes('thermostat') || info.includes('nest') || info.includes('hvac')) return 'thermostat';
    if (info.includes('printer') || info.includes('hp') || info.includes('epson')) return 'printer';
    if (info.includes('switch')) return 'switch';
    if (info.includes('sensor')) return 'sensor';
    if (info.includes('lock') || info.includes('access')) return 'smart_lock';
    if (info.includes('light') || info.includes('hue') || info.includes('bulb')) return 'smart_light';
    return 'unknown';
  }

  /**
   * Calculate risk score from vulnerabilities
   */
  calculateRiskScore(vulnerabilities) {
    if (!vulnerabilities || vulnerabilities.length === 0) return 0;

    let score = 0;
    for (const vuln of vulnerabilities) {
      const cvssScore = vuln.score || 0;
      const multiplier = vuln.exploitAvailable ? 1.5 : 1;
      score += cvssScore * multiplier;
    }

    // Normalize to 0-100 scale
    return Math.min(100, Math.round(score * 10 / vulnerabilities.length));
  }

  /**
   * Generate security recommendations
   */
  generateRecommendations(vulnerabilities) {
    const recommendations = [];

    const critical = vulnerabilities.filter(v => v.severity === 'CRITICAL');
    const high = vulnerabilities.filter(v => v.severity === 'HIGH');

    if (critical.length > 0) {
      recommendations.push({
        type: 'critical',
        message: `${critical.length} critical vulnerabilities found - immediate action required`,
        action: 'Patch or isolate affected devices immediately'
      });
    }

    if (high.length > 0) {
      recommendations.push({
        type: 'high',
        message: `${high.length} high severity vulnerabilities found`,
        action: 'Schedule patching within 24-48 hours'
      });
    }

    const exploitable = vulnerabilities.filter(v => v.exploitAvailable);
    if (exploitable.length > 0) {
      recommendations.push({
        type: 'urgent',
        message: `${exploitable.length} vulnerabilities have known exploits`,
        action: 'Prioritize patching - active exploitation possible'
      });
    }

    return recommendations;
  }
}

module.exports = new IoTSecureService();