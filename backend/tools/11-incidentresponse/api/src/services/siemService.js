/**
 * SIEM Integration Service
 * Real-world integrations for log correlation and incident detection
 * 
 * Integrates with: Splunk, Elastic SIEM, Azure Sentinel
 */

const axios = require('axios');

class SIEMService {
  constructor() {
    // Splunk
    this.splunkToken = process.env.INCIDENTRESPONSE_SPLUNK_API_TOKEN;
    this.splunkBaseUrl = process.env.INCIDENTRESPONSE_SPLUNK_BASE_URL;
    this.splunkIndex = process.env.INCIDENTRESPONSE_SPLUNK_INDEX || 'security_incidents';
    
    // Elastic SIEM
    this.elasticApiKey = process.env.INCIDENTRESPONSE_ELASTIC_API_KEY;
    this.elasticBaseUrl = process.env.INCIDENTRESPONSE_ELASTIC_BASE_URL;
    this.elasticIndex = process.env.INCIDENTRESPONSE_ELASTIC_INDEX || 'incidents';
    
    // Azure Sentinel
    this.sentinelWorkspaceId = process.env.INCIDENTRESPONSE_AZURE_SENTINEL_WORKSPACE_ID;
    this.sentinelClientId = process.env.INCIDENTRESPONSE_AZURE_SENTINEL_CLIENT_ID;
    this.sentinelClientSecret = process.env.INCIDENTRESPONSE_AZURE_SENTINEL_CLIENT_SECRET;
    this.sentinelTenantId = process.env.INCIDENTRESPONSE_AZURE_SENTINEL_TENANT_ID;
    
    this.azureToken = null;
    this.azureTokenExpiry = null;
  }

  /**
   * Search logs across all configured SIEM platforms
   */
  async searchLogs(query, timeRange = { start: '-24h', end: 'now' }) {
    const results = {
      sources: [],
      logs: [],
      totalHits: 0,
      searchedAt: new Date().toISOString()
    };

    const searches = [];

    if (this.splunkToken && this.splunkBaseUrl) {
      searches.push(this.searchSplunk(query, timeRange));
    }
    if (this.elasticApiKey && this.elasticBaseUrl) {
      searches.push(this.searchElastic(query, timeRange));
    }
    if (this.sentinelWorkspaceId) {
      searches.push(this.searchSentinel(query, timeRange));
    }

    if (searches.length === 0) {
      return this.simulatedSearchResults(query);
    }

    const searchResults = await Promise.allSettled(searches);
    
    searchResults.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        results.sources.push(result.value.source);
        results.logs.push(...result.value.logs);
        results.totalHits += result.value.totalHits;
      }
    });

    return results;
  }

  /**
   * Splunk - Search logs
   */
  async searchSplunk(query, timeRange) {
    try {
      // Create search job
      const createJobResponse = await axios.post(
        `${this.splunkBaseUrl}/services/search/jobs`,
        new URLSearchParams({
          search: `search index=${this.splunkIndex} ${query}`,
          earliest_time: timeRange.start,
          latest_time: timeRange.end,
          output_mode: 'json'
        }),
        {
          headers: {
            'Authorization': `Bearer ${this.splunkToken}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const jobId = createJobResponse.data.sid;

      // Wait for job completion (simplified - production would poll)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get results
      const resultsResponse = await axios.get(
        `${this.splunkBaseUrl}/services/search/jobs/${jobId}/results`,
        {
          params: { output_mode: 'json', count: 100 },
          headers: { 'Authorization': `Bearer ${this.splunkToken}` }
        }
      );

      const logs = resultsResponse.data.results.map(r => ({
        source: 'Splunk',
        timestamp: r._time,
        raw: r._raw,
        host: r.host,
        sourcetype: r.sourcetype,
        data: r
      }));

      return {
        source: 'Splunk',
        logs,
        totalHits: resultsResponse.data.results.length
      };
    } catch (error) {
      console.error('Splunk search error:', error.message);
      return null;
    }
  }

  /**
   * Elastic SIEM - Search logs
   */
  async searchElastic(query, timeRange) {
    try {
      const response = await axios.post(
        `${this.elasticBaseUrl}/${this.elasticIndex}/_search`,
        {
          query: {
            bool: {
              must: [
                { query_string: { query } },
                {
                  range: {
                    '@timestamp': {
                      gte: timeRange.start,
                      lte: timeRange.end
                    }
                  }
                }
              ]
            }
          },
          size: 100,
          sort: [{ '@timestamp': 'desc' }]
        },
        {
          headers: {
            'Authorization': `ApiKey ${this.elasticApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const logs = response.data.hits.hits.map(hit => ({
        source: 'Elastic SIEM',
        timestamp: hit._source['@timestamp'],
        raw: JSON.stringify(hit._source),
        data: hit._source
      }));

      return {
        source: 'Elastic SIEM',
        logs,
        totalHits: response.data.hits.total.value
      };
    } catch (error) {
      console.error('Elastic search error:', error.message);
      return null;
    }
  }

  /**
   * Azure Sentinel - Search logs
   */
  async searchSentinel(query, timeRange) {
    try {
      await this.ensureAzureToken();

      const response = await axios.post(
        `https://api.loganalytics.io/v1/workspaces/${this.sentinelWorkspaceId}/query`,
        {
          query: `SecurityIncident | where TimeGenerated > ago(24h) | where Title contains "${query}" or Description contains "${query}" | take 100`
        },
        {
          headers: {
            'Authorization': `Bearer ${this.azureToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const logs = response.data.tables[0]?.rows.map(row => {
        const columns = response.data.tables[0].columns;
        const logObj = {};
        columns.forEach((col, idx) => { logObj[col.name] = row[idx]; });
        return {
          source: 'Azure Sentinel',
          timestamp: logObj.TimeGenerated,
          raw: JSON.stringify(logObj),
          data: logObj
        };
      }) || [];

      return {
        source: 'Azure Sentinel',
        logs,
        totalHits: logs.length
      };
    } catch (error) {
      console.error('Azure Sentinel search error:', error.message);
      return null;
    }
  }

  /**
   * Get Azure OAuth token
   */
  async ensureAzureToken() {
    if (this.azureToken && this.azureTokenExpiry && Date.now() < this.azureTokenExpiry) {
      return;
    }

    try {
      const response = await axios.post(
        `https://login.microsoftonline.com/${this.sentinelTenantId}/oauth2/v2.0/token`,
        new URLSearchParams({
          client_id: this.sentinelClientId,
          client_secret: this.sentinelClientSecret,
          scope: 'https://api.loganalytics.io/.default',
          grant_type: 'client_credentials'
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      this.azureToken = response.data.access_token;
      this.azureTokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
    } catch (error) {
      console.error('Azure token error:', error.message);
      throw error;
    }
  }

  /**
   * Correlate IOCs across SIEM logs
   */
  async correlateIOCs(indicators) {
    const correlations = [];
    
    for (const ioc of indicators) {
      const searchQuery = ioc.value;
      const results = await this.searchLogs(searchQuery, { start: '-7d', end: 'now' });
      
      if (results.totalHits > 0) {
        correlations.push({
          indicator: ioc,
          matchCount: results.totalHits,
          sources: results.sources,
          samples: results.logs.slice(0, 5)
        });
      }
    }

    return correlations;
  }

  /**
   * Push incident to SIEM for tracking
   */
  async pushIncidentToSIEM(incident) {
    const pushPromises = [];

    if (this.splunkToken && this.splunkBaseUrl) {
      pushPromises.push(this.pushToSplunk(incident));
    }
    if (this.elasticApiKey && this.elasticBaseUrl) {
      pushPromises.push(this.pushToElastic(incident));
    }

    const results = await Promise.allSettled(pushPromises);
    return results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason?.message });
  }

  async pushToSplunk(incident) {
    try {
      await axios.post(
        `${this.splunkBaseUrl}/services/collector/event`,
        {
          event: {
            type: 'incident',
            incidentId: incident.incidentId,
            title: incident.title,
            severity: incident.severity,
            status: incident.status,
            category: incident.classification?.type,
            indicators: incident.indicators,
            timestamp: new Date().toISOString()
          },
          sourcetype: 'victorykit:incident',
          index: this.splunkIndex
        },
        { headers: { 'Authorization': `Splunk ${this.splunkToken}` } }
      );
      return { source: 'Splunk', success: true };
    } catch (error) {
      return { source: 'Splunk', success: false, error: error.message };
    }
  }

  async pushToElastic(incident) {
    try {
      await axios.post(
        `${this.elasticBaseUrl}/${this.elasticIndex}/_doc`,
        {
          '@timestamp': new Date().toISOString(),
          incident_id: incident.incidentId,
          title: incident.title,
          severity: incident.severity,
          status: incident.status,
          category: incident.classification?.type,
          indicators: incident.indicators
        },
        {
          headers: {
            'Authorization': `ApiKey ${this.elasticApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return { source: 'Elastic', success: true };
    } catch (error) {
      return { source: 'Elastic', success: false, error: error.message };
    }
  }

  // ============= Simulated Response =============

  simulatedSearchResults(query) {
    return {
      sources: ['Simulated SIEM'],
      logs: [
        {
          source: 'Simulated',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          raw: `[ALERT] Suspicious activity detected matching: ${query}`,
          data: { query, matched: true, severity: 'high' }
        },
        {
          source: 'Simulated',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          raw: `[INFO] Network connection from suspicious source: ${query}`,
          data: { query, type: 'network', action: 'block' }
        }
      ],
      totalHits: 2,
      searchedAt: new Date().toISOString(),
      simulated: true
    };
  }
}

module.exports = new SIEMService();
