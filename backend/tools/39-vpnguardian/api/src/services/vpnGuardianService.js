const axios = require('axios');
const { getConnectors } = require('../../../../../../shared/connectors');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8039';

class VPNGuardianService {
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

    // Microsoft Sentinel - Log VPN security events
    if (connectors.sentinel) {
      integrationPromises.push(
        connectors.sentinel.ingestData({
          table: 'VPNGuardianEvents',
          data: {
            entityId,
            timestamp: new Date().toISOString(),
            vpnConnections: data.vpnConnections || [],
            suspiciousTunnels: data.suspiciousTunnels || [],
            protocolAnomalies: data.protocolAnomalies || [],
            threatLevel: data.threatLevel || 'low',
            encryptionStrength: data.encryptionStrength || [],
            connectionDurations: data.connectionDurations || [],
            dataVolumes: data.dataVolumes || [],
            geographicAnomalies: data.geographicAnomalies || []
          }
        }).catch(err => ({ error: `Sentinel integration failed: ${err.message}` }))
      );
    }

    // Cortex XSOAR - Create incidents for VPN security breaches
    if (connectors.xsoar && (data.threatLevel === 'high' || data.threatLevel === 'critical')) {
      integrationPromises.push(
        connectors.xsoar.createIncident({
          type: 'VPNGuardianAlert',
          severity: data.threatLevel === 'critical' ? 'high' : 'medium',
          title: `VPN Guardian Alert: ${data.suspiciousTunnels?.length || 0} suspicious tunnels detected`,
          description: `Automated VPN analysis detected potential security breach or unauthorized tunneling activity`,
          labels: ['vpn-guardian', 'automated-detection'],
          details: {
            entityId,
            suspiciousTunnels: data.suspiciousTunnels,
            protocolAnomalies: data.protocolAnomalies,
            geographicAnomalies: data.geographicAnomalies,
            vpnConnections: data.vpnConnections
          }
        }).catch(err => ({ error: `XSOAR integration failed: ${err.message}` }))
      );
    }

    // CrowdStrike - VPN endpoint protection
    if (connectors.crowdstrike && data.vpnConnections?.length > 0 && data.threatLevel !== 'low') {
      integrationPromises.push(
        connectors.crowdstrike.vpnProtection({
          action: 'quarantine',
          connections: data.vpnConnections,
          reason: 'VPN Guardian automated protection',
          severity: data.threatLevel
        }).catch(err => ({ error: `CrowdStrike integration failed: ${err.message}` }))
      );
    }

    // Cloudflare - VPN traffic analysis and blocking
    if (connectors.cloudflare && data.suspiciousTunnels?.length > 0) {
      integrationPromises.push(
        connectors.cloudflare.updateVPNTrafficRules({
          action: 'block',
          tunnels: data.suspiciousTunnels,
          protocols: data.protocolAnomalies,
          reason: 'VPN Guardian automated blocking',
          priority: data.threatLevel === 'critical' ? 1 : 2
        }).catch(err => ({ error: `Cloudflare integration failed: ${err.message}` }))
      );
    }

    // Kong - VPN API security controls
    if (connectors.kong && data.vpnConnections?.length > 0 && data.threatLevel !== 'low') {
      integrationPromises.push(
        connectors.kong.createVPNSecurityPolicy({
          connections: data.vpnConnections,
          blockedProtocols: data.protocolAnomalies,
          reason: 'VPN Guardian suspicious activity',
          rateLimit: data.threatLevel === 'critical' ? 10 : 50
        }).catch(err => ({ error: `Kong integration failed: ${err.message}` }))
      );
    }

    // Okta - VPN authentication and access control
    if (connectors.okta && data.vpnConnections) {
      integrationPromises.push(
        connectors.okta.updateVPNAuthentication({
          suspiciousConnections: data.vpnConnections,
          threatLevel: data.threatLevel,
          reason: 'VPN Guardian automated policy update',
          geographicBlocks: data.geographicAnomalies
        }).catch(err => ({ error: `Okta integration failed: ${err.message}` }))
      );
    }

    // OpenCTI - VPN-based threat indicators
    if (connectors.opencti && data.geographicAnomalies?.length > 0) {
      integrationPromises.push(
        connectors.opencti.createIndicators({
          type: 'location',
          values: data.geographicAnomalies,
          labels: ['vpn-guardian', 'automated-detection'],
          confidence: data.threatLevel === 'critical' ? 90 : data.threatLevel === 'high' ? 75 : 60,
          description: `VPN Guardian detected suspicious geographic anomalies in connection patterns`
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

module.exports = new VPNGuardianService();