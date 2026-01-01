const axios = require('axios');
const { getConnectors } = require('../../../../../../shared/connectors');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8038';

class FirewallService {
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

    // Microsoft Sentinel - Log firewall security events
    if (connectors.sentinel) {
      integrationPromises.push(
        connectors.sentinel.ingestData({
          table: 'FirewallAIEvents',
          data: {
            entityId,
            timestamp: new Date().toISOString(),
            blockedConnections: data.blockedConnections || [],
            suspiciousTraffic: data.suspiciousTraffic || [],
            portScans: data.portScans || [],
            threatLevel: data.threatLevel || 'low',
            protocols: data.protocols || [],
            sourceIPs: data.sourceIPs || [],
            destinationPorts: data.destinationPorts || [],
            firewallRules: data.firewallRules || []
          }
        }).catch(err => ({ error: `Sentinel integration failed: ${err.message}` }))
      );
    }

    // Cortex XSOAR - Create incidents for firewall breaches
    if (connectors.xsoar && (data.threatLevel === 'high' || data.threatLevel === 'critical')) {
      integrationPromises.push(
        connectors.xsoar.createIncident({
          type: 'FirewallAIAlert',
          severity: data.threatLevel === 'critical' ? 'high' : 'medium',
          title: `Firewall AI Alert: ${data.blockedConnections?.length || 0} connections blocked`,
          description: `Automated firewall analysis detected potential security breach or suspicious network activity`,
          labels: ['firewall-ai', 'automated-detection'],
          details: {
            entityId,
            blockedConnections: data.blockedConnections,
            suspiciousTraffic: data.suspiciousTraffic,
            portScans: data.portScans,
            sourceIPs: data.sourceIPs
          }
        }).catch(err => ({ error: `XSOAR integration failed: ${err.message}` }))
      );
    }

    // CrowdStrike - Network containment and isolation
    if (connectors.crowdstrike && data.sourceIPs?.length > 0 && data.threatLevel !== 'low') {
      integrationPromises.push(
        connectors.crowdstrike.networkContainment({
          action: 'isolate',
          sourceIPs: data.sourceIPs,
          reason: 'Firewall AI automated containment',
          duration: data.threatLevel === 'critical' ? 3600 : 1800 // 1 hour or 30 minutes
        }).catch(err => ({ error: `CrowdStrike integration failed: ${err.message}` }))
      );
    }

    // Cloudflare - Update firewall and WAF rules
    if (connectors.cloudflare && data.blockedConnections?.length > 0) {
      integrationPromises.push(
        connectors.cloudflare.updateFirewallRules({
          action: 'block',
          ips: data.sourceIPs,
          ports: data.destinationPorts,
          reason: 'Firewall AI automated blocking',
          priority: data.threatLevel === 'critical' ? 1 : 2
        }).catch(err => ({ error: `Cloudflare integration failed: ${err.message}` }))
      );
    }

    // Kong - API firewall and rate limiting
    if (connectors.kong && data.sourceIPs?.length > 0 && data.threatLevel !== 'low') {
      integrationPromises.push(
        connectors.kong.createFirewallRule({
          sourceIPs: data.sourceIPs,
          blockedPorts: data.destinationPorts,
          reason: 'Firewall AI suspicious activity',
          rateLimit: data.threatLevel === 'critical' ? 10 : 50
        }).catch(err => ({ error: `Kong integration failed: ${err.message}` }))
      );
    }

    // Okta - Network access control updates
    if (connectors.okta && data.sourceIPs) {
      integrationPromises.push(
        connectors.okta.updateNetworkPolicy({
          blockedIPs: data.sourceIPs,
          threatLevel: data.threatLevel,
          reason: 'Firewall AI automated policy update',
          protocols: data.protocols
        }).catch(err => ({ error: `Okta integration failed: ${err.message}` }))
      );
    }

    // OpenCTI - Network-based threat indicators
    if (connectors.opencti && data.sourceIPs?.length > 0) {
      integrationPromises.push(
        connectors.opencti.createIndicators({
          type: 'ipv4-addr',
          values: data.sourceIPs,
          labels: ['firewall-ai', 'automated-detection'],
          confidence: data.threatLevel === 'critical' ? 90 : data.threatLevel === 'high' ? 75 : 60,
          description: `Firewall AI detected suspicious network activity from source IPs`
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
}

module.exports = new FirewallService();