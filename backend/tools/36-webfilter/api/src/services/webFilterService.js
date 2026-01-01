const axios = require('axios');
const { getConnectors } = require('../../../../../../shared/connectors');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8036';

class WebFilterService {
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

    // Microsoft Sentinel - Log web filtering events
    if (connectors.sentinel) {
      integrationPromises.push(
        connectors.sentinel.ingestData({
          table: 'WebFilterEvents',
          data: {
            entityId,
            timestamp: new Date().toISOString(),
            blockedUrls: data.blockedUrls || [],
            suspiciousDomains: data.suspiciousDomains || [],
            threatLevel: data.threatLevel || 'low',
            categories: data.categories || [],
            userAgent: data.userAgent,
            sourceIP: data.sourceIP
          }
        }).catch(err => ({ error: `Sentinel integration failed: ${err.message}` }))
      );
    }

    // Cortex XSOAR - Create incidents for high-risk web activity
    if (connectors.xsoar && (data.threatLevel === 'high' || data.threatLevel === 'critical')) {
      integrationPromises.push(
        connectors.xsoar.createIncident({
          type: 'WebFilterAlert',
          severity: data.threatLevel === 'critical' ? 'high' : 'medium',
          title: `Web Filter Alert: ${data.blockedUrls?.length || 0} URLs blocked`,
          description: `Automated web filtering detected suspicious activity from ${data.sourceIP}`,
          labels: ['web-filter', 'automated-detection'],
          details: {
            entityId,
            blockedUrls: data.blockedUrls,
            suspiciousDomains: data.suspiciousDomains,
            categories: data.categories
          }
        }).catch(err => ({ error: `XSOAR integration failed: ${err.message}` }))
      );
    }

    // CrowdStrike - Block malicious domains at endpoint level
    if (connectors.crowdstrike && data.suspiciousDomains?.length > 0) {
      integrationPromises.push(
        connectors.crowdstrike.addToBlocklist({
          type: 'domain',
          entries: data.suspiciousDomains,
          reason: 'WebFilter automated detection',
          severity: data.threatLevel
        }).catch(err => ({ error: `CrowdStrike integration failed: ${err.message}` }))
      );
    }

    // Cloudflare - Update firewall rules
    if (connectors.cloudflare && data.blockedUrls?.length > 0) {
      integrationPromises.push(
        connectors.cloudflare.updateFirewallRules({
          action: 'block',
          urls: data.blockedUrls,
          reason: 'WebFilter automated blocking',
          priority: data.threatLevel === 'critical' ? 1 : 2
        }).catch(err => ({ error: `Cloudflare integration failed: ${err.message}` }))
      );
    }

    // Kong - Implement rate limiting for suspicious IPs
    if (connectors.kong && data.sourceIP && data.threatLevel !== 'low') {
      integrationPromises.push(
        connectors.kong.createRateLimit({
          consumer: data.sourceIP,
          route: 'web-access',
          limit: data.threatLevel === 'critical' ? 10 : 50,
          window: 'minute',
          reason: 'WebFilter suspicious activity'
        }).catch(err => ({ error: `Kong integration failed: ${err.message}` }))
      );
    }

    // Okta - Log authentication attempts from filtered domains
    if (connectors.okta && data.userAgent) {
      integrationPromises.push(
        connectors.okta.logSecurityEvent({
          eventType: 'web_filter_interaction',
          userAgent: data.userAgent,
          sourceIP: data.sourceIP,
          blockedContent: data.blockedUrls?.length || 0,
          severity: data.threatLevel
        }).catch(err => ({ error: `Okta integration failed: ${err.message}` }))
      );
    }

    // OpenCTI - Enrich threat intelligence
    if (connectors.opencti && data.suspiciousDomains?.length > 0) {
      integrationPromises.push(
        connectors.opencti.createIndicators({
          type: 'domain',
          values: data.suspiciousDomains,
          labels: ['web-filter', 'automated-detection'],
          confidence: data.threatLevel === 'critical' ? 90 : data.threatLevel === 'high' ? 75 : 60,
          description: `Web filtering detected suspicious domains from ${data.sourceIP}`
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

module.exports = new WebFilterService();