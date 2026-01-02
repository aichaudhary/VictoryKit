const axios = require('axios');
const { getConnectors } = require('../../../../../../shared/connectors');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8045';

class PrivacyShieldService {
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

    // Microsoft Sentinel - Log privacy and compliance events
    if (connectors.sentinel) {
      integrationPromises.push(
        connectors.sentinel.ingestData({
          table: 'PrivacyShieldEvents',
          data: {
            entityId,
            timestamp: new Date().toISOString(),
            dataExposures: data.dataExposures || [],
            complianceViolations: data.complianceViolations || [],
            privacyBreaches: data.privacyBreaches || [],
            threatLevel: data.threatLevel || 'low',
            dataClassifications: data.dataClassifications || [],
            retentionViolations: data.retentionViolations || [],
            consentIssues: data.consentIssues || [],
            gdprCompliance: data.gdprCompliance || []
          }
        }).catch(err => ({ error: `Sentinel integration failed: ${err.message}` }))
      );
    }

    // Cortex XSOAR - Create incidents for privacy breaches
    if (connectors.xsoar && (data.threatLevel === 'high' || data.threatLevel === 'critical')) {
      integrationPromises.push(
        connectors.xsoar.createIncident({
          type: 'PrivacyShieldAlert',
          severity: data.threatLevel === 'critical' ? 'high' : 'medium',
          title: `Privacy Shield Alert: ${data.privacyBreaches?.length || 0} privacy breaches detected`,
          description: `Automated privacy analysis detected potential data exposure or compliance violations`,
          labels: ['privacy-shield', 'automated-detection'],
          details: {
            entityId,
            privacyBreaches: data.privacyBreaches,
            dataExposures: data.dataExposures,
            complianceViolations: data.complianceViolations,
            dataClassifications: data.dataClassifications
          }
        }).catch(err => ({ error: `XSOAR integration failed: ${err.message}` }))
      );
    }

    // CrowdStrike - Privacy-focused endpoint protection
    if (connectors.crowdstrike && data.dataExposures?.length > 0 && data.threatLevel !== 'low') {
      integrationPromises.push(
        connectors.crowdstrike.privacyProtection({
          action: 'protect',
          dataExposures: data.dataExposures,
          dataClassifications: data.dataClassifications,
          reason: 'Privacy Shield automated protection',
          severity: data.threatLevel
        }).catch(err => ({ error: `CrowdStrike integration failed: ${err.message}` }))
      );
    }

    // Cloudflare - Privacy-preserving traffic analysis
    if (connectors.cloudflare && data.consentIssues?.length > 0) {
      integrationPromises.push(
        connectors.cloudflare.updatePrivacyTrafficRules({
          action: 'block',
          consentIssues: data.consentIssues,
          dataClassifications: data.dataClassifications,
          reason: 'Privacy Shield automated compliance',
          priority: data.threatLevel === 'critical' ? 1 : 2
        }).catch(err => ({ error: `Cloudflare integration failed: ${err.message}` }))
      );
    }

    // Kong - Privacy-compliant API management
    if (connectors.kong && data.dataClassifications?.length > 0 && data.threatLevel !== 'low') {
      integrationPromises.push(
        connectors.kong.createPrivacySecurityPolicy({
          dataClassifications: data.dataClassifications,
          consentIssues: data.consentIssues,
          reason: 'Privacy Shield compliance protection',
          rateLimit: data.threatLevel === 'critical' ? 10 : 50
        }).catch(err => ({ error: `Kong integration failed: ${err.message}` }))
      );
    }

    // Okta - Privacy-focused identity and access management
    if (connectors.okta && data.consentIssues) {
      integrationPromises.push(
        connectors.okta.updatePrivacyAuthentication({
          consentIssues: data.consentIssues,
          threatLevel: data.threatLevel,
          reason: 'Privacy Shield automated consent management',
          dataClassifications: data.dataClassifications
        }).catch(err => ({ error: `Okta integration failed: ${err.message}` }))
      );
    }

    // OpenCTI - Privacy-related threat intelligence
    if (connectors.opencti && data.complianceViolations?.length > 0) {
      integrationPromises.push(
        connectors.opencti.createIndicators({
          type: 'vulnerability',
          values: data.complianceViolations,
          labels: ['privacy-shield', 'automated-detection'],
          confidence: data.threatLevel === 'critical' ? 90 : data.threatLevel === 'high' ? 75 : 60,
          description: `Privacy Shield detected compliance violations and data privacy breaches`
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

module.exports = new PrivacyShieldService();