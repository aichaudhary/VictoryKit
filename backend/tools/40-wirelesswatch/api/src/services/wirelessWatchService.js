const axios = require('axios');
const { getConnectors } = require('../../../../../../shared/connectors');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8040';

class WirelessWatchService {
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

    // Microsoft Sentinel - Log wireless security events
    if (connectors.sentinel) {
      integrationPromises.push(
        connectors.sentinel.ingestData({
          table: 'WirelessWatchEvents',
          data: {
            entityId,
            timestamp: new Date().toISOString(),
            rogueAccessPoints: data.rogueAccessPoints || [],
            deauthAttacks: data.deauthAttacks || [],
            encryptionWeaknesses: data.encryptionWeaknesses || [],
            threatLevel: data.threatLevel || 'low',
            ssidAnomalies: data.ssidAnomalies || [],
            macAddressSpoofing: data.macAddressSpoofing || [],
            signalStrengthAnomalies: data.signalStrengthAnomalies || [],
            connectionAttempts: data.connectionAttempts || []
          }
        }).catch(err => ({ error: `Sentinel integration failed: ${err.message}` }))
      );
    }

    // Cortex XSOAR - Create incidents for wireless security breaches
    if (connectors.xsoar && (data.threatLevel === 'high' || data.threatLevel === 'critical')) {
      integrationPromises.push(
        connectors.xsoar.createIncident({
          type: 'WirelessWatchAlert',
          severity: data.threatLevel === 'critical' ? 'high' : 'medium',
          title: `Wireless Watch Alert: ${data.rogueAccessPoints?.length || 0} rogue access points detected`,
          description: `Automated wireless network analysis detected potential security breach or unauthorized access points`,
          labels: ['wireless-watch', 'automated-detection'],
          details: {
            entityId,
            rogueAccessPoints: data.rogueAccessPoints,
            deauthAttacks: data.deauthAttacks,
            macAddressSpoofing: data.macAddressSpoofing,
            ssidAnomalies: data.ssidAnomalies
          }
        }).catch(err => ({ error: `XSOAR integration failed: ${err.message}` }))
      );
    }

    // CrowdStrike - Wireless endpoint protection
    if (connectors.crowdstrike && data.macAddressSpoofing?.length > 0 && data.threatLevel !== 'low') {
      integrationPromises.push(
        connectors.crowdstrike.wirelessProtection({
          action: 'block',
          macAddresses: data.macAddressSpoofing,
          reason: 'Wireless Watch automated protection',
          severity: data.threatLevel
        }).catch(err => ({ error: `CrowdStrike integration failed: ${err.message}` }))
      );
    }

    // Cloudflare - Wireless traffic analysis (if applicable)
    if (connectors.cloudflare && data.connectionAttempts?.length > 0) {
      integrationPromises.push(
        connectors.cloudflare.updateWirelessRules({
          action: 'monitor',
          connectionAttempts: data.connectionAttempts,
          suspiciousSSIDs: data.ssidAnomalies,
          reason: 'Wireless Watch automated monitoring',
          priority: data.threatLevel === 'critical' ? 1 : 2
        }).catch(err => ({ error: `Cloudflare integration failed: ${err.message}` }))
      );
    }

    // Kong - Wireless API security controls
    if (connectors.kong && data.connectionAttempts?.length > 0 && data.threatLevel !== 'low') {
      integrationPromises.push(
        connectors.kong.createWirelessSecurityPolicy({
          blockedMACs: data.macAddressSpoofing,
          suspiciousSSIDs: data.ssidAnomalies,
          reason: 'Wireless Watch suspicious activity',
          rateLimit: data.threatLevel === 'critical' ? 10 : 50
        }).catch(err => ({ error: `Kong integration failed: ${err.message}` }))
      );
    }

    // Okta - Wireless authentication and access control
    if (connectors.okta && data.connectionAttempts) {
      integrationPromises.push(
        connectors.okta.updateWirelessAuthentication({
          suspiciousAttempts: data.connectionAttempts,
          threatLevel: data.threatLevel,
          reason: 'Wireless Watch automated policy update',
          blockedMACs: data.macAddressSpoofing
        }).catch(err => ({ error: `Okta integration failed: ${err.message}` }))
      );
    }

    // OpenCTI - Wireless-based threat indicators
    if (connectors.opencti && data.macAddressSpoofing?.length > 0) {
      integrationPromises.push(
        connectors.opencti.createIndicators({
          type: 'mac-addr',
          values: data.macAddressSpoofing,
          labels: ['wireless-watch', 'automated-detection'],
          confidence: data.threatLevel === 'critical' ? 90 : data.threatLevel === 'high' ? 75 : 60,
          description: `Wireless Watch detected suspicious MAC address spoofing and rogue access points`
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

module.exports = new WirelessWatchService();