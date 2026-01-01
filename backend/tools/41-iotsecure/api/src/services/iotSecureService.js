const axios = require('axios');
const { getConnectors } = require('../../../../../../shared/connectors');

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
}

module.exports = new IoTSecureService();