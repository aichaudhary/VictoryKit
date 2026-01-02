const axios = require('axios');
const { getConnectors } = require('../../../../../../shared/connectors');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8042';

class MobileDefendService {
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

    // Microsoft Sentinel - Log mobile security events
    if (connectors.sentinel) {
      integrationPromises.push(
        connectors.sentinel.ingestData({
          table: 'MobileDefendEvents',
          data: {
            entityId,
            timestamp: new Date().toISOString(),
            maliciousApps: data.maliciousApps || [],
            deviceJailbreaks: data.deviceJailbreaks || [],
            suspiciousPermissions: data.suspiciousPermissions || [],
            threatLevel: data.threatLevel || 'low',
            deviceTypes: data.deviceTypes || [],
            appBehavior: data.appBehavior || [],
            networkRequests: data.networkRequests || [],
            batteryAnomalies: data.batteryAnomalies || []
          }
        }).catch(err => ({ error: `Sentinel integration failed: ${err.message}` }))
      );
    }

    // Cortex XSOAR - Create incidents for mobile security breaches
    if (connectors.xsoar && (data.threatLevel === 'high' || data.threatLevel === 'critical')) {
      integrationPromises.push(
        connectors.xsoar.createIncident({
          type: 'MobileDefendAlert',
          severity: data.threatLevel === 'critical' ? 'high' : 'medium',
          title: `Mobile Defend Alert: ${data.maliciousApps?.length || 0} malicious apps detected`,
          description: `Automated mobile analysis detected potential security breach or compromised devices`,
          labels: ['mobile-defend', 'automated-detection'],
          details: {
            entityId,
            maliciousApps: data.maliciousApps,
            deviceJailbreaks: data.deviceJailbreaks,
            suspiciousPermissions: data.suspiciousPermissions,
            deviceTypes: data.deviceTypes
          }
        }).catch(err => ({ error: `XSOAR integration failed: ${err.message}` }))
      );
    }

    // CrowdStrike - Mobile endpoint protection
    if (connectors.crowdstrike && data.maliciousApps?.length > 0 && data.threatLevel !== 'low') {
      integrationPromises.push(
        connectors.crowdstrike.mobileProtection({
          action: 'quarantine',
          apps: data.maliciousApps,
          devices: data.deviceJailbreaks,
          reason: 'Mobile Defend automated protection',
          severity: data.threatLevel
        }).catch(err => ({ error: `CrowdStrike integration failed: ${err.message}` }))
      );
    }

    // Cloudflare - Mobile traffic analysis and blocking
    if (connectors.cloudflare && data.networkRequests?.length > 0) {
      integrationPromises.push(
        connectors.cloudflare.updateMobileTrafficRules({
          action: 'block',
          suspiciousRequests: data.networkRequests,
          deviceTypes: data.deviceTypes,
          reason: 'Mobile Defend automated blocking',
          priority: data.threatLevel === 'critical' ? 1 : 2
        }).catch(err => ({ error: `Cloudflare integration failed: ${err.message}` }))
      );
    }

    // Kong - Mobile API security controls
    if (connectors.kong && data.deviceTypes?.length > 0 && data.threatLevel !== 'low') {
      integrationPromises.push(
        connectors.kong.createMobileSecurityPolicy({
          deviceTypes: data.deviceTypes,
          blockedPermissions: data.suspiciousPermissions,
          reason: 'Mobile Defend suspicious activity',
          rateLimit: data.threatLevel === 'critical' ? 10 : 50
        }).catch(err => ({ error: `Kong integration failed: ${err.message}` }))
      );
    }

    // Okta - Mobile device authentication
    if (connectors.okta && data.deviceJailbreaks) {
      integrationPromises.push(
        connectors.okta.updateMobileAuthentication({
          compromisedDevices: data.deviceJailbreaks,
          threatLevel: data.threatLevel,
          reason: 'Mobile Defend automated policy update',
          deviceTypes: data.deviceTypes
        }).catch(err => ({ error: `Okta integration failed: ${err.message}` }))
      );
    }

    // OpenCTI - Mobile-based threat indicators
    if (connectors.opencti && data.maliciousApps?.length > 0) {
      integrationPromises.push(
        connectors.opencti.createIndicators({
          type: 'malware',
          values: data.maliciousApps,
          labels: ['mobile-defend', 'automated-detection'],
          confidence: data.threatLevel === 'critical' ? 90 : data.threatLevel === 'high' ? 75 : 60,
          description: `Mobile Defend detected malicious applications and jailbroken devices`
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

module.exports = new MobileDefendService();