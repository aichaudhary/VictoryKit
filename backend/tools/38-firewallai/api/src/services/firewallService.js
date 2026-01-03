const axios = require('axios');
const WebSocket = require('ws');
let getConnectors;
try {
  ({ getConnectors } = require('../../../../../../shared/connectors'));
} catch (error) {
  console.warn('Connectors not available, security stack integration disabled');
  getConnectors = () => ({});
}
const FirewallRule = require('../models/FirewallRule');
const FirewallPolicy = require('../models/FirewallPolicy');
const TrafficLog = require('../models/TrafficLog');
const Alert = require('../models/Alert');
const Analytics = require('../models/Analytics');
const AuditTrail = require('../models/AuditTrail');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8038';

// Firewall vendor API configurations
const FIREWALL_APIS = {
  pfsense: {
    baseUrl: process.env.FIREWALLAI_PFSENSE_BASE_URL,
    apiKey: process.env.FIREWALLAI_PFSENSE_API_KEY,
    username: process.env.FIREWALLAI_PFSENSE_USERNAME,
    password: process.env.FIREWALLAI_PFSENSE_PASSWORD
  },
  'palo-alto': {
    baseUrl: process.env.FIREWALLAI_PALO_ALTO_BASE_URL,
    apiKey: process.env.FIREWALLAI_PALO_ALTO_API_KEY,
    username: process.env.FIREWALLAI_PALO_ALTO_USERNAME,
    password: process.env.FIREWALLAI_PALO_ALTO_PASSWORD
  },
  fortinet: {
    baseUrl: process.env.FIREWALLAI_FORTINET_BASE_URL,
    apiKey: process.env.FIREWALLAI_FORTINET_API_KEY,
    username: process.env.FIREWALLAI_FORTINET_USERNAME,
    password: process.env.FIREWALLAI_FORTINET_PASSWORD
  },
  checkpoint: {
    baseUrl: process.env.FIREWALLAI_CHECKPOINT_BASE_URL,
    apiKey: process.env.FIREWALLAI_CHECKPOINT_API_KEY,
    username: process.env.FIREWALLAI_CHECKPOINT_USERNAME,
    password: process.env.FIREWALLAI_CHECKPOINT_PASSWORD,
    domain: process.env.FIREWALLAI_CHECKPOINT_DOMAIN
  },
  'cisco-asa': {
    baseUrl: process.env.FIREWALLAI_CISCO_ASA_BASE_URL,
    apiKey: process.env.FIREWALLAI_CISCO_ASA_API_KEY,
    username: process.env.FIREWALLAI_CISCO_ASA_USERNAME,
    password: process.env.FIREWALLAI_CISCO_ASA_PASSWORD
  },
  aws: {
    baseUrl: process.env.FIREWALLAI_AWS_FIREWALL_BASE_URL,
    accessKeyId: process.env.FIREWALLAI_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.FIREWALLAI_AWS_SECRET_ACCESS_KEY,
    region: process.env.FIREWALLAI_AWS_REGION
  },
  azure: {
    baseUrl: process.env.FIREWALLAI_AZURE_FIREWALL_BASE_URL,
    subscriptionId: process.env.FIREWALLAI_AZURE_SUBSCRIPTION_ID,
    clientId: process.env.FIREWALLAI_AZURE_CLIENT_ID,
    clientSecret: process.env.FIREWALLAI_AZURE_CLIENT_SECRET,
    tenantId: process.env.FIREWALLAI_AZURE_TENANT_ID
  },
  'google-cloud': {
    baseUrl: process.env.FIREWALLAI_GOOGLE_CLOUD_FIREWALL_BASE_URL,
    projectId: process.env.FIREWALLAI_GOOGLE_CLOUD_PROJECT_ID
  },
  gcp: {
    baseUrl: process.env.GCP_FIREWALL_URL,
    apiKey: process.env.GCP_SERVICE_ACCOUNT_KEY,
    projectId: process.env.GCP_PROJECT_ID
  }
};

class FirewallService {
  constructor() {
    this.activeConnections = new Map();
    this.threatPatterns = new Map();
    this.realTimeClients = new Set();
    this.monitoringIntervals = new Map();
  }

  // Multi-vendor firewall API integrations
  async getFirewallRules(vendor, deviceId = null) {
    try {
      const config = FIREWALL_APIS[vendor];
      if (!config) throw new Error(`Unsupported vendor: ${vendor}`);

      let url, headers;
      switch (vendor) {
        case 'pfsense':
          url = `${config.baseUrl}/api/v1/firewall/rule`;
          headers = {
            'X-API-Key': config.apiKey,
            'X-API-Secret': config.apiSecret
          };
          break;
        case 'palo-alto':
          url = `${config.baseUrl}/restapi/v10.1/Policies/SecurityRules`;
          headers = {
            'X-PAN-KEY': config.apiKey
          };
          break;
        case 'fortinet':
          url = `${config.baseUrl}/api/v2/cmdb/firewall/policy`;
          headers = {
            'Authorization': `Bearer ${config.apiKey}`
          };
          break;
        case 'checkpoint':
          url = `${config.baseUrl}/web_api/show-access-rule`;
          headers = {
            'X-chkp-sid': config.apiKey
          };
          break;
        case 'cisco-asa':
          url = `${config.baseUrl}/api/access/in`;
          headers = {
            'Authorization': `Bearer ${config.apiKey}`
          };
          break;
        case 'aws':
          url = `${config.baseUrl}/v1/firewalls/${deviceId}/rules`;
          headers = {
            'Authorization': `AWS4-HMAC-SHA256 ${config.apiKey}`
          };
          break;
        case 'azure':
          url = `${config.baseUrl}/subscriptions/${config.subscriptionId}/resourceGroups/${config.resourceGroup}/providers/Microsoft.Network/azureFirewalls/${deviceId}/rules`;
          headers = {
            'Authorization': `Bearer ${config.apiKey}`
          };
          break;
        case 'gcp':
          url = `${config.baseUrl}/compute/v1/projects/${config.projectId}/global/firewalls`;
          headers = {
            'Authorization': `Bearer ${config.apiKey}`
          };
          break;
      }

      const response = await axios.get(url, { headers, timeout: 10000 });
      return this.normalizeFirewallRules(response.data, vendor);
    } catch (error) {
      throw new Error(`Failed to get firewall rules from ${vendor}: ${error.message}`);
    }
  }

  async createFirewallRule(vendor, ruleData, deviceId = null) {
    try {
      const config = FIREWALL_APIS[vendor];
      if (!config) throw new Error(`Unsupported vendor: ${vendor}`);

      const normalizedRule = this.denormalizeFirewallRule(ruleData, vendor);
      let url, headers, method = 'post';

      switch (vendor) {
        case 'pfsense':
          url = `${config.baseUrl}/api/v1/firewall/rule`;
          headers = {
            'X-API-Key': config.apiKey,
            'X-API-Secret': config.apiSecret
          };
          break;
        case 'palo-alto':
          url = `${config.baseUrl}/restapi/v10.1/Policies/SecurityRules`;
          headers = {
            'X-PAN-KEY': config.apiKey
          };
          break;
        case 'fortinet':
          url = `${config.baseUrl}/api/v2/cmdb/firewall/policy`;
          headers = {
            'Authorization': `Bearer ${config.apiKey}`
          };
          break;
        case 'checkpoint':
          url = `${config.baseUrl}/web_api/add-access-rule`;
          headers = {
            'X-chkp-sid': config.apiKey
          };
          break;
        case 'cisco-asa':
          url = `${config.baseUrl}/api/access/in`;
          headers = {
            'Authorization': `Bearer ${config.apiKey}`
          };
          break;
        case 'aws':
          url = `${config.baseUrl}/v1/firewalls/${deviceId}/rules`;
          headers = {
            'Authorization': `AWS4-HMAC-SHA256 ${config.apiKey}`
          };
          break;
        case 'azure':
          url = `${config.baseUrl}/subscriptions/${config.subscriptionId}/resourceGroups/${config.resourceGroup}/providers/Microsoft.Network/azureFirewalls/${deviceId}/rules`;
          headers = {
            'Authorization': `Bearer ${config.apiKey}`
          };
          break;
        case 'gcp':
          url = `${config.baseUrl}/compute/v1/projects/${config.projectId}/global/firewalls`;
          headers = {
            'Authorization': `Bearer ${config.apiKey}`
          };
          break;
      }

      const response = await axios({ method, url, data: normalizedRule, headers, timeout: 15000 });

      // Create audit trail
      await AuditTrail.create({
        auditId: `rule-create-${Date.now()}`,
        action: 'create',
        category: 'configuration',
        vendor,
        device: { id: deviceId },
        resource: { type: 'rule', name: ruleData.name },
        changes: { after: ruleData },
        details: { description: `Created firewall rule: ${ruleData.name}` }
      });

      return this.normalizeFirewallRule(response.data, vendor);
    } catch (error) {
      throw new Error(`Failed to create firewall rule on ${vendor}: ${error.message}`);
    }
  }

  async updateFirewallRule(vendor, ruleId, ruleData, deviceId = null) {
    try {
      const config = FIREWALL_APIS[vendor];
      if (!config) throw new Error(`Unsupported vendor: ${vendor}`);

      // Get current rule for audit trail
      const currentRule = await this.getFirewallRule(vendor, ruleId, deviceId);

      const normalizedRule = this.denormalizeFirewallRule(ruleData, vendor);
      let url, headers, method = 'put';

      switch (vendor) {
        case 'pfsense':
          url = `${config.baseUrl}/api/v1/firewall/rule/${ruleId}`;
          headers = {
            'X-API-Key': config.apiKey,
            'X-API-Secret': config.apiSecret
          };
          break;
        case 'palo-alto':
          url = `${config.baseUrl}/restapi/v10.1/Policies/SecurityRules/${ruleId}`;
          headers = {
            'X-PAN-KEY': config.apiKey
          };
          break;
        case 'fortinet':
          url = `${config.baseUrl}/api/v2/cmdb/firewall/policy/${ruleId}`;
          headers = {
            'Authorization': `Bearer ${config.apiKey}`
          };
          break;
        case 'checkpoint':
          url = `${config.baseUrl}/web_api/set-access-rule`;
          headers = {
            'X-chkp-sid': config.apiKey
          };
          normalizedRule['uid'] = ruleId;
          break;
        case 'cisco-asa':
          url = `${config.baseUrl}/api/access/in/${ruleId}`;
          headers = {
            'Authorization': `Bearer ${config.apiKey}`
          };
          break;
        case 'aws':
          url = `${config.baseUrl}/v1/firewalls/${deviceId}/rules/${ruleId}`;
          headers = {
            'Authorization': `AWS4-HMAC-SHA256 ${config.apiKey}`
          };
          break;
        case 'azure':
          url = `${config.baseUrl}/subscriptions/${config.subscriptionId}/resourceGroups/${config.resourceGroup}/providers/Microsoft.Network/azureFirewalls/${deviceId}/rules/${ruleId}`;
          headers = {
            'Authorization': `Bearer ${config.apiKey}`
          };
          method = 'patch';
          break;
        case 'gcp':
          url = `${config.baseUrl}/compute/v1/projects/${config.projectId}/global/firewalls/${ruleId}`;
          headers = {
            'Authorization': `Bearer ${config.apiKey}`
          };
          method = 'patch';
          break;
      }

      const response = await axios({ method, url, data: normalizedRule, headers, timeout: 15000 });

      // Create audit trail
      await AuditTrail.create({
        auditId: `rule-update-${Date.now()}`,
        action: 'update',
        category: 'configuration',
        vendor,
        device: { id: deviceId },
        resource: { type: 'rule', id: ruleId, name: ruleData.name },
        changes: { before: currentRule, after: ruleData },
        details: { description: `Updated firewall rule: ${ruleData.name}` }
      });

      return this.normalizeFirewallRule(response.data, vendor);
    } catch (error) {
      throw new Error(`Failed to update firewall rule on ${vendor}: ${error.message}`);
    }
  }

  async deleteFirewallRule(vendor, ruleId, deviceId = null) {
    try {
      const config = FIREWALL_APIS[vendor];
      if (!config) throw new Error(`Unsupported vendor: ${vendor}`);

      // Get current rule for audit trail
      const currentRule = await this.getFirewallRule(vendor, ruleId, deviceId);

      let url, headers;

      switch (vendor) {
        case 'pfsense':
          url = `${config.baseUrl}/api/v1/firewall/rule/${ruleId}`;
          headers = {
            'X-API-Key': config.apiKey,
            'X-API-Secret': config.apiSecret
          };
          break;
        case 'palo-alto':
          url = `${config.baseUrl}/restapi/v10.1/Policies/SecurityRules/${ruleId}`;
          headers = {
            'X-PAN-KEY': config.apiKey
          };
          break;
        case 'fortinet':
          url = `${config.baseUrl}/api/v2/cmdb/firewall/policy/${ruleId}`;
          headers = {
            'Authorization': `Bearer ${config.apiKey}`
          };
          break;
        case 'checkpoint':
          url = `${config.baseUrl}/web_api/delete-access-rule`;
          headers = {
            'X-chkp-sid': config.apiKey
          };
          break;
        case 'cisco-asa':
          url = `${config.baseUrl}/api/access/in/${ruleId}`;
          headers = {
            'Authorization': `Bearer ${config.apiKey}`
          };
          break;
        case 'aws':
          url = `${config.baseUrl}/v1/firewalls/${deviceId}/rules/${ruleId}`;
          headers = {
            'Authorization': `AWS4-HMAC-SHA256 ${config.apiKey}`
          };
          break;
        case 'azure':
          url = `${config.baseUrl}/subscriptions/${config.subscriptionId}/resourceGroups/${config.resourceGroup}/providers/Microsoft.Network/azureFirewalls/${deviceId}/rules/${ruleId}`;
          headers = {
            'Authorization': `Bearer ${config.apiKey}`
          };
          break;
        case 'gcp':
          url = `${config.baseUrl}/compute/v1/projects/${config.projectId}/global/firewalls/${ruleId}`;
          headers = {
            'Authorization': `Bearer ${config.apiKey}`
          };
          break;
      }

      await axios.delete(url, { headers, timeout: 15000 });

      // Create audit trail
      await AuditTrail.create({
        auditId: `rule-delete-${Date.now()}`,
        action: 'delete',
        category: 'configuration',
        vendor,
        device: { id: deviceId },
        resource: { type: 'rule', id: ruleId, name: currentRule.name },
        changes: { before: currentRule },
        details: { description: `Deleted firewall rule: ${currentRule.name}` }
      });

      return { success: true, ruleId };
    } catch (error) {
      throw new Error(`Failed to delete firewall rule on ${vendor}: ${error.message}`);
    }
  }

  async getFirewallLogs(vendor, deviceId = null, options = {}) {
    try {
      const config = FIREWALL_APIS[vendor];
      if (!config) throw new Error(`Unsupported vendor: ${vendor}`);

      const { startTime, endTime, limit = 1000, filter = {} } = options;
      let url, headers, params = {};

      switch (vendor) {
        case 'pfsense':
          url = `${config.baseUrl}/api/v1/firewall/log`;
          headers = {
            'X-API-Key': config.apiKey,
            'X-API-Secret': config.apiSecret
          };
          params = { limit, start: startTime, end: endTime, ...filter };
          break;
        case 'palo-alto':
          url = `${config.baseUrl}/restapi/v10.1/Logs/TrafficLog`;
          headers = {
            'X-PAN-KEY': config.apiKey
          };
          params = {
            nlogs: limit,
            query: this.buildPaloAltoQuery(filter, startTime, endTime)
          };
          break;
        case 'fortinet':
          url = `${config.baseUrl}/api/v2/log/firewall/traffic`;
          headers = {
            'Authorization': `Bearer ${config.apiKey}`
          };
          params = { limit, start: startTime, end: endTime, ...filter };
          break;
        case 'checkpoint':
          url = `${config.baseUrl}/web_api/show-logs`;
          headers = {
            'X-chkp-sid': config.apiKey
          };
          params = {
            limit,
            fromDate: startTime,
            toDate: endTime,
            ...filter
          };
          break;
        case 'cisco-asa':
          url = `${config.baseUrl}/api/monitoring/syslog`;
          headers = {
            'Authorization': `Bearer ${config.apiKey}`
          };
          params = { limit, start_time: startTime, end_time: endTime, ...filter };
          break;
        case 'aws':
          url = `${config.baseUrl}/v1/firewalls/${deviceId}/logs`;
          headers = {
            'Authorization': `AWS4-HMAC-SHA256 ${config.apiKey}`
          };
          params = { limit, startTime, endTime, ...filter };
          break;
        case 'azure':
          url = `${config.baseUrl}/subscriptions/${config.subscriptionId}/resourceGroups/${config.resourceGroup}/providers/Microsoft.Network/azureFirewalls/${deviceId}/logs`;
          headers = {
            'Authorization': `Bearer ${config.apiKey}`
          };
          params = { limit, startTime, endTime, ...filter };
          break;
        case 'gcp':
          url = `${config.baseUrl}/compute/v1/projects/${config.projectId}/global/firewalls/${deviceId}/logs`;
          headers = {
            'Authorization': `Bearer ${config.apiKey}`
          };
          params = { limit, startTime, endTime, ...filter };
          break;
      }

      const response = await axios.get(url, { headers, params, timeout: 30000 });
      return this.normalizeFirewallLogs(response.data, vendor);
    } catch (error) {
      throw new Error(`Failed to get firewall logs from ${vendor}: ${error.message}`);
    }
  }

  // Real-time monitoring and WebSocket support
  startRealTimeMonitoring(vendor, deviceId, clientId) {
    const monitoringKey = `${vendor}-${deviceId}`;

    if (this.monitoringIntervals.has(monitoringKey)) {
      return; // Already monitoring
    }

    const interval = setInterval(async () => {
      try {
        const logs = await this.getFirewallLogs(vendor, deviceId, {
          limit: 50,
          startTime: new Date(Date.now() - 60000).toISOString() // Last minute
        });

        // Process logs for threats and anomalies
        const processedData = await this.processRealTimeData(logs, vendor, deviceId);

        // Send to connected clients
        this.broadcastToClients(clientId, {
          type: 'firewall-logs',
          vendor,
          deviceId,
          data: processedData,
          timestamp: new Date().toISOString()
        });

        // Check for alerts
        await this.checkForAlerts(processedData, vendor, deviceId);

      } catch (error) {
        console.error(`Real-time monitoring error for ${monitoringKey}:`, error);
      }
    }, 30000); // Check every 30 seconds

    this.monitoringIntervals.set(monitoringKey, interval);
  }

  stopRealTimeMonitoring(vendor, deviceId) {
    const monitoringKey = `${vendor}-${deviceId}`;
    const interval = this.monitoringIntervals.get(monitoringKey);

    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(monitoringKey);
    }
  }

  addRealTimeClient(client) {
    this.realTimeClients.add(client);
  }

  removeRealTimeClient(client) {
    this.realTimeClients.delete(client);
  }

  broadcastToClients(clientId, data) {
    this.realTimeClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN && client.clientId === clientId) {
        client.send(JSON.stringify(data));
      }
    });
  }

  // Advanced threat detection and ML analysis
  async analyze(data) {
    try {
      // Enhanced ML analysis with multiple models
      const mlPromises = [
        axios.post(`${ML_ENGINE_URL}/analyze/threat`, { data }),
        axios.post(`${ML_ENGINE_URL}/analyze/anomaly`, { data }),
        axios.post(`${ML_ENGINE_URL}/analyze/behavior`, { data })
      ];

      const [threatResponse, anomalyResponse, behaviorResponse] = await Promise.allSettled(mlPromises);

      const results = {
        threat: threatResponse.status === 'fulfilled' ? threatResponse.value.data : null,
        anomaly: anomalyResponse.status === 'fulfilled' ? anomalyResponse.value.data : null,
        behavior: behaviorResponse.status === 'fulfilled' ? behaviorResponse.value.data : null
      };

      // Combine results for comprehensive analysis
      return this.combineAnalysisResults(results, data);
    } catch (error) {
      throw new Error(`ML analysis failed: ${error.message}`);
    }
  }

  async scan(target) {
    try {
      const scanPromises = [
        axios.post(`${ML_ENGINE_URL}/scan/network`, { target }),
        axios.post(`${ML_ENGINE_URL}/scan/vulnerability`, { target }),
        axios.post(`${ML_ENGINE_URL}/scan/compliance`, { target })
      ];

      const [networkScan, vulnScan, complianceScan] = await Promise.allSettled(scanPromises);

      return {
        network: networkScan.status === 'fulfilled' ? networkScan.value.data : null,
        vulnerability: vulnScan.status === 'fulfilled' ? vulnScan.value.data : null,
        compliance: complianceScan.status === 'fulfilled' ? complianceScan.value.data : null,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`ML scan failed: ${error.message}`);
    }
  }

  async detectAdvancedThreats(logs, vendor, deviceId) {
    try {
      // Pattern-based threat detection
      const patterns = await this.analyzeTrafficPatterns(logs);

      // ML-based threat detection
      const mlThreats = await axios.post(`${ML_ENGINE_URL}/detect/threats`, {
        logs,
        vendor,
        deviceId,
        patterns
      });

      // Behavioral analysis
      const behavioralAnalysis = await axios.post(`${ML_ENGINE_URL}/analyze/behavior`, {
        logs,
        historicalPatterns: this.threatPatterns.get(`${vendor}-${deviceId}`) || []
      });

      // Combine all threat detection methods
      const threats = this.correlateThreats([
        patterns.threats,
        mlThreats.data.threats,
        behavioralAnalysis.data.anomalies
      ]);

      // Update threat patterns for learning
      this.updateThreatPatterns(`${vendor}-${deviceId}`, threats);

      return threats;
    } catch (error) {
      console.error('Advanced threat detection failed:', error);
      return [];
    }
  }

  // Security stack integration (enhanced)
  async integrateWithSecurityStack(entityId, data) {
    const connectors = getConnectors();
    const integrationPromises = [];

    // Microsoft Sentinel - Enhanced logging with structured data
    if (connectors.sentinel) {
      integrationPromises.push(
        connectors.sentinel.ingestData({
          table: 'FirewallAIEvents',
          data: {
            entityId,
            timestamp: new Date().toISOString(),
            eventType: data.eventType || 'firewall-analysis',
            severity: data.severity || 'medium',
            blockedConnections: data.blockedConnections || [],
            suspiciousTraffic: data.suspiciousTraffic || [],
            portScans: data.portScans || [],
            threatLevel: data.threatLevel || 'low',
            protocols: data.protocols || [],
            sourceIPs: data.sourceIPs || [],
            destinationPorts: data.destinationPorts || [],
            firewallRules: data.firewallRules || [],
            mlAnalysis: data.mlAnalysis || {},
            complianceViolations: data.complianceViolations || [],
            riskScore: data.riskScore || 0
          }
        }).catch(err => ({ error: `Sentinel integration failed: ${err.message}` }))
      );
    }

    // Cortex XSOAR - Enhanced incident creation with more context
    if (connectors.xsoar && (data.threatLevel === 'high' || data.threatLevel === 'critical')) {
      integrationPromises.push(
        connectors.xsoar.createIncident({
          type: 'FirewallAIAlert',
          severity: data.threatLevel === 'critical' ? 'high' : 'medium',
          title: `Firewall AI Alert: ${data.blockedConnections?.length || 0} connections blocked`,
          description: `Advanced firewall analysis detected ${data.threatLevel} level security threat with ML correlation`,
          labels: ['firewall-ai', 'automated-detection', 'ml-enhanced'],
          details: {
            entityId,
            blockedConnections: data.blockedConnections,
            suspiciousTraffic: data.suspiciousTraffic,
            portScans: data.portScans,
            sourceIPs: data.sourceIPs,
            mlAnalysis: data.mlAnalysis,
            complianceViolations: data.complianceViolations,
            riskScore: data.riskScore,
            recommendedActions: data.recommendedActions
          },
          playbook: 'FirewallAI-Incident-Response'
        }).catch(err => ({ error: `XSOAR integration failed: ${err.message}` }))
      );
    }

    // CrowdStrike - Enhanced network containment with ML insights
    if (connectors.crowdstrike && data.sourceIPs?.length > 0 && data.threatLevel !== 'low') {
      integrationPromises.push(
        connectors.crowdstrike.networkContainment({
          action: 'isolate',
          sourceIPs: data.sourceIPs,
          reason: 'Firewall AI automated containment with ML analysis',
          duration: data.threatLevel === 'critical' ? 3600 : 1800,
          confidence: data.mlAnalysis?.confidence || 0.8,
          indicators: data.mlAnalysis?.indicators || []
        }).catch(err => ({ error: `CrowdStrike integration failed: ${err.message}` }))
      );
    }

    // Cloudflare - Enhanced WAF rule updates
    if (connectors.cloudflare && data.blockedConnections?.length > 0) {
      integrationPromises.push(
        connectors.cloudflare.updateFirewallRules({
          action: 'block',
          ips: data.sourceIPs,
          ports: data.destinationPorts,
          reason: 'Firewall AI automated blocking with ML correlation',
          priority: data.threatLevel === 'critical' ? 1 : 2,
          rules: data.mlAnalysis?.recommendedRules || []
        }).catch(err => ({ error: `Cloudflare integration failed: ${err.message}` }))
      );
    }

    // Kong - Enhanced API firewall rules
    if (connectors.kong && data.sourceIPs?.length > 0 && data.threatLevel !== 'low') {
      integrationPromises.push(
        connectors.kong.createFirewallRule({
          sourceIPs: data.sourceIPs,
          blockedPorts: data.destinationPorts,
          reason: 'Firewall AI suspicious activity with ML analysis',
          rateLimit: data.threatLevel === 'critical' ? 10 : 50,
          mlInsights: data.mlAnalysis
        }).catch(err => ({ error: `Kong integration failed: ${err.message}` }))
      );
    }

    // Okta - Enhanced network access control
    if (connectors.okta && data.sourceIPs) {
      integrationPromises.push(
        connectors.okta.updateNetworkPolicy({
          blockedIPs: data.sourceIPs,
          threatLevel: data.threatLevel,
          reason: 'Firewall AI automated policy update with ML analysis',
          protocols: data.protocols,
          mlConfidence: data.mlAnalysis?.confidence || 0.5
        }).catch(err => ({ error: `Okta integration failed: ${err.message}` }))
      );
    }

    // OpenCTI - Enhanced threat intelligence sharing
    if (connectors.opencti && data.sourceIPs?.length > 0) {
      integrationPromises.push(
        connectors.opencti.createIndicators({
          type: 'ipv4-addr',
          values: data.sourceIPs,
          labels: ['firewall-ai', 'automated-detection', 'ml-enhanced'],
          confidence: data.threatLevel === 'critical' ? 90 : data.threatLevel === 'high' ? 75 : 60,
          description: `Firewall AI detected suspicious network activity from source IPs with ML correlation`,
          mlAnalysis: data.mlAnalysis,
          riskScore: data.riskScore
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

  // Helper methods for data normalization and processing
  normalizeFirewallRules(data, vendor) {
    // Normalize rules from different vendors to common format
    switch (vendor) {
      case 'pfsense':
        return data.map(rule => ({
          id: rule.id,
          name: rule.descr,
          action: rule.action,
          protocol: rule.protocol,
          source: rule.src,
          destination: rule.dst,
          port: rule.dport,
          enabled: rule.disabled !== '1'
        }));
      case 'palo-alto':
        return data.map(rule => ({
          id: rule.id,
          name: rule.name,
          action: rule.action,
          protocol: rule.protocol,
          source: rule.source,
          destination: rule.destination,
          port: rule.destination_port,
          enabled: rule.disabled !== true
        }));
      // Add normalization for other vendors...
      default:
        return data;
    }
  }

  denormalizeFirewallRule(rule, vendor) {
    // Convert common format to vendor-specific format
    switch (vendor) {
      case 'pfsense':
        return {
          descr: rule.name,
          action: rule.action,
          protocol: rule.protocol,
          src: rule.source,
          dst: rule.destination,
          dport: rule.port,
          disabled: rule.enabled ? '0' : '1'
        };
      case 'palo-alto':
        return {
          name: rule.name,
          action: rule.action,
          protocol: rule.protocol,
          source: rule.source,
          destination: rule.destination,
          destination_port: rule.port,
          disabled: !rule.enabled
        };
      // Add denormalization for other vendors...
      default:
        return rule;
    }
  }

  normalizeFirewallLogs(data, vendor) {
    // Normalize logs from different vendors to common format
    // Implementation would convert vendor-specific log formats to common TrafficLog schema
    return data;
  }

  buildPaloAltoQuery(filter, startTime, endTime) {
    // Build Palo Alto specific query string
    let query = '';
    if (startTime) query += `(receive_time geq '${startTime}')`;
    if (endTime) query += ` and (receive_time leq '${endTime}')`;
    // Add filter conditions...
    return query;
  }

  async processRealTimeData(logs, vendor, deviceId) {
    // Process logs for real-time analysis
    const threats = await this.detectAdvancedThreats(logs, vendor, deviceId);
    const analytics = await this.calculateRealTimeAnalytics(logs, vendor, deviceId);

    return {
      logs,
      threats,
      analytics,
      timestamp: new Date().toISOString()
    };
  }

  async checkForAlerts(data, vendor, deviceId) {
    // Check processed data for alert conditions
    const alerts = [];

    // Threat-based alerts
    if (data.threats.length > 0) {
      alerts.push({
        vendor,
        device: { id: deviceId },
        severity: 'high',
        category: 'threat',
        type: 'intrusion',
        title: `Threat detected on ${vendor} device ${deviceId}`,
        description: `Detected ${data.threats.length} threats in recent traffic`,
        threat: { detected: true, type: 'multiple', severity: 'high' }
      });
    }

    // Performance-based alerts
    if (data.analytics.performance.cpu > 90) {
      alerts.push({
        vendor,
        device: { id: deviceId },
        severity: 'medium',
        category: 'performance',
        type: 'high-cpu',
        title: `High CPU usage on ${vendor} device ${deviceId}`,
        description: `CPU usage exceeded 90% threshold`
      });
    }

    // Create alerts in database
    for (const alertData of alerts) {
      await Alert.create({
        alertId: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...alertData
      });
    }
  }

  async analyzeTrafficPatterns(logs) {
    // Analyze traffic patterns for anomalies
    const patterns = {
      threats: [],
      anomalies: [],
      statistics: {}
    };

    // Implement pattern analysis logic
    // This would include port scanning detection, DDoS detection, etc.

    return patterns;
  }

  combineAnalysisResults(results, data) {
    // Combine multiple ML analysis results
    return {
      threatLevel: this.calculateOverallThreatLevel(results),
      confidence: this.calculateOverallConfidence(results),
      indicators: this.consolidateIndicators(results),
      recommendations: this.generateRecommendations(results, data),
      timestamp: new Date().toISOString()
    };
  }

  calculateOverallThreatLevel(results) {
    // Calculate overall threat level from multiple analyses
    const levels = ['low', 'medium', 'high', 'critical'];
    const scores = [];

    if (results.threat?.threatLevel) {
      scores.push(levels.indexOf(results.threat.threatLevel));
    }
    if (results.anomaly?.severity) {
      scores.push(results.anomaly.severity === 'high' ? 2 : results.anomaly.severity === 'critical' ? 3 : 1);
    }
    if (results.behavior?.risk) {
      scores.push(results.behavior.risk === 'high' ? 2 : results.behavior.risk === 'critical' ? 3 : 1);
    }

    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    return levels[Math.round(avgScore)] || 'low';
  }

  calculateOverallConfidence(results) {
    // Calculate overall confidence score
    const confidences = [];

    if (results.threat?.confidence) confidences.push(results.threat.confidence);
    if (results.anomaly?.confidence) confidences.push(results.anomaly.confidence);
    if (results.behavior?.confidence) confidences.push(results.behavior.confidence);

    return confidences.length > 0 ? confidences.reduce((a, b) => a + b, 0) / confidences.length : 0.5;
  }

  consolidateIndicators(results) {
    // Consolidate indicators from all analyses
    const indicators = [];

    if (results.threat?.indicators) indicators.push(...results.threat.indicators);
    if (results.anomaly?.indicators) indicators.push(...results.anomaly.indicators);
    if (results.behavior?.indicators) indicators.push(...results.behavior.indicators);

    return [...new Set(indicators)]; // Remove duplicates
  }

  generateRecommendations(results, data) {
    // Generate actionable recommendations based on analysis
    const recommendations = [];

    if (results.threat?.threatLevel === 'high' || results.threat?.threatLevel === 'critical') {
      recommendations.push('Implement immediate blocking rules for identified threats');
    }

    if (results.anomaly?.detected) {
      recommendations.push('Review and update firewall policies based on anomaly detection');
    }

    if (results.behavior?.risk === 'high') {
      recommendations.push('Monitor for behavioral pattern changes and adjust security controls');
    }

    return recommendations;
  }

  updateThreatPatterns(key, threats) {
    // Update threat patterns for machine learning
    const existing = this.threatPatterns.get(key) || [];
    existing.push(...threats);
    // Keep only last 1000 patterns
    if (existing.length > 1000) {
      existing.splice(0, existing.length - 1000);
    }
    this.threatPatterns.set(key, existing);
  }

  async calculateRealTimeAnalytics(logs, vendor, deviceId) {
    // Calculate real-time analytics from logs
    const analytics = {
      traffic: {
        total: logs.length,
        byProtocol: {},
        byAction: {}
      },
      performance: {
        throughput: 0,
        connections: logs.length
      },
      security: {
        threats: 0,
        blocks: 0
      }
    };

    // Aggregate log data
    logs.forEach(log => {
      // Protocol aggregation
      analytics.traffic.byProtocol[log.protocol] = (analytics.traffic.byProtocol[log.protocol] || 0) + 1;

      // Action aggregation
      analytics.traffic.byAction[log.action] = (analytics.traffic.byAction[log.action] || 0) + 1;

      // Security metrics
      if (log.threat?.detected) analytics.security.threats++;
      if (log.action === 'block' || log.action === 'deny') analytics.security.blocks++;
    });

    return analytics;
  }

  // Cleanup method
  cleanup() {
    // Clear all monitoring intervals
    for (const [key, interval] of this.monitoringIntervals) {
      clearInterval(interval);
    }
    this.monitoringIntervals.clear();
    this.realTimeClients.clear();
    this.threatPatterns.clear();
  }
}

module.exports = new FirewallService();