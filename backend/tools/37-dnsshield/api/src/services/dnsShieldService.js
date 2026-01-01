const axios = require('axios');
const { getConnectors } = require('../../../../../../shared/connectors');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8037';

class DNSShieldService {
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

    // Microsoft Sentinel - Log DNS security events
    if (connectors.sentinel) {
      integrationPromises.push(
        connectors.sentinel.ingestData({
          table: 'DNSShieldEvents',
          data: {
            entityId,
            timestamp: new Date().toISOString(),
            dnsQueries: data.dnsQueries || [],
            suspiciousDomains: data.suspiciousDomains || [],
            blockedResolutions: data.blockedResolutions || [],
            threatLevel: data.threatLevel || 'low',
            queryTypes: data.queryTypes || [],
            sourceIP: data.sourceIP,
            responseCodes: data.responseCodes || []
          }
        }).catch(err => ({ error: `Sentinel integration failed: ${err.message}` }))
      );
    }

    // Cortex XSOAR - Create incidents for DNS-based threats
    if (connectors.xsoar && (data.threatLevel === 'high' || data.threatLevel === 'critical')) {
      integrationPromises.push(
        connectors.xsoar.createIncident({
          type: 'DNSShieldAlert',
          severity: data.threatLevel === 'critical' ? 'high' : 'medium',
          title: `DNS Shield Alert: ${data.blockedResolutions?.length || 0} suspicious resolutions blocked`,
          description: `Automated DNS analysis detected potential DNS tunneling or malicious domain resolution from ${data.sourceIP}`,
          labels: ['dns-shield', 'automated-detection'],
          details: {
            entityId,
            suspiciousDomains: data.suspiciousDomains,
            blockedResolutions: data.blockedResolutions,
            dnsQueries: data.dnsQueries
          }
        }).catch(err => ({ error: `XSOAR integration failed: ${err.message}` }))
      );
    }

    // CrowdStrike - Block malicious domains at DNS level
    if (connectors.crowdstrike && data.suspiciousDomains?.length > 0) {
      integrationPromises.push(
        connectors.crowdstrike.addToBlocklist({
          type: 'domain',
          entries: data.suspiciousDomains,
          reason: 'DNS Shield automated detection',
          severity: data.threatLevel
        }).catch(err => ({ error: `CrowdStrike integration failed: ${err.message}` }))
      );
    }

    // Cloudflare - Update DNS firewall rules
    if (connectors.cloudflare && data.blockedResolutions?.length > 0) {
      integrationPromises.push(
        connectors.cloudflare.updateDNSFirewall({
          action: 'block',
          domains: data.blockedResolutions,
          reason: 'DNS Shield automated blocking',
          priority: data.threatLevel === 'critical' ? 1 : 2
        }).catch(err => ({ error: `Cloudflare integration failed: ${err.message}` }))
      );
    }

    // Kong - DNS-based security routing
    if (connectors.kong && data.sourceIP && data.threatLevel !== 'low') {
      integrationPromises.push(
        connectors.kong.createDNSFilter({
          sourceIP: data.sourceIP,
          blockedDomains: data.suspiciousDomains || [],
          reason: 'DNS Shield suspicious activity',
          ttl: 3600
        }).catch(err => ({ error: `Kong integration failed: ${err.message}` }))
      );
    }

    // Okta - DNS security for authentication flows
    if (connectors.okta && data.dnsQueries) {
      integrationPromises.push(
        connectors.okta.logSecurityEvent({
          eventType: 'dns_security_analysis',
          dnsQueries: data.dnsQueries.length,
          suspiciousDomains: data.suspiciousDomains?.length || 0,
          sourceIP: data.sourceIP,
          severity: data.threatLevel
        }).catch(err => ({ error: `Okta integration failed: ${err.message}` }))
      );
    }

    // OpenCTI - DNS-based threat indicators
    if (connectors.opencti && data.suspiciousDomains?.length > 0) {
      integrationPromises.push(
        connectors.opencti.createIndicators({
          type: 'domain',
          values: data.suspiciousDomains,
          labels: ['dns-shield', 'automated-detection'],
          confidence: data.threatLevel === 'critical' ? 90 : data.threatLevel === 'high' ? 75 : 60,
          description: `DNS analysis detected suspicious domain resolutions from ${data.sourceIP}`
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

module.exports = new DNSShieldService();