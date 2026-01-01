const axios = require('axios');
const { getConnectors } = require('../../../../../../shared/connectors');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8044';

class DRPlanService {
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

    // Microsoft Sentinel - Log disaster recovery events
    if (connectors.sentinel) {
      integrationPromises.push(
        connectors.sentinel.ingestData({
          table: 'DRPlanEvents',
          data: {
            entityId,
            timestamp: new Date().toISOString(),
            planFailures: data.planFailures || [],
            recoveryDelays: data.recoveryDelays || [],
            dataLossIncidents: data.dataLossIncidents || [],
            threatLevel: data.threatLevel || 'low',
            recoveryObjectives: data.recoveryObjectives || [],
            backupIntegrity: data.backupIntegrity || [],
            failoverEvents: data.failoverEvents || [],
            testingResults: data.testingResults || []
          }
        }).catch(err => ({ error: `Sentinel integration failed: ${err.message}` }))
      );
    }

    // Cortex XSOAR - Create incidents for DR plan issues
    if (connectors.xsoar && (data.threatLevel === 'high' || data.threatLevel === 'critical')) {
      integrationPromises.push(
        connectors.xsoar.createIncident({
          type: 'DRPlanAlert',
          severity: data.threatLevel === 'critical' ? 'high' : 'medium',
          title: `DR Plan Alert: ${data.planFailures?.length || 0} recovery plan failures detected`,
          description: `Automated disaster recovery analysis detected potential business continuity issues`,
          labels: ['dr-plan', 'automated-detection'],
          details: {
            entityId,
            planFailures: data.planFailures,
            dataLossIncidents: data.dataLossIncidents,
            recoveryDelays: data.recoveryDelays,
            recoveryObjectives: data.recoveryObjectives
          }
        }).catch(err => ({ error: `XSOAR integration failed: ${err.message}` }))
      );
    }

    // CrowdStrike - DR environment protection
    if (connectors.crowdstrike && data.failoverEvents?.length > 0 && data.threatLevel !== 'low') {
      integrationPromises.push(
        connectors.crowdstrike.drProtection({
          action: 'secure',
          failoverEvents: data.failoverEvents,
          recoveryObjectives: data.recoveryObjectives,
          reason: 'DR Plan automated protection',
          severity: data.threatLevel
        }).catch(err => ({ error: `CrowdStrike integration failed: ${err.message}` }))
      );
    }

    // Cloudflare - DR traffic routing and failover
    if (connectors.cloudflare && data.failoverEvents?.length > 0) {
      integrationPromises.push(
        connectors.cloudflare.updateDRTrafficRules({
          action: 'failover',
          failoverEvents: data.failoverEvents,
          recoveryObjectives: data.recoveryObjectives,
          reason: 'DR Plan automated routing',
          priority: data.threatLevel === 'critical' ? 1 : 2
        }).catch(err => ({ error: `Cloudflare integration failed: ${err.message}` }))
      );
    }

    // Kong - DR API failover and routing
    if (connectors.kong && data.recoveryObjectives?.length > 0 && data.threatLevel !== 'low') {
      integrationPromises.push(
        connectors.kong.createDRSecurityPolicy({
          recoveryObjectives: data.recoveryObjectives,
          failoverEvents: data.failoverEvents,
          reason: 'DR Plan failover protection',
          rateLimit: data.threatLevel === 'critical' ? 10 : 50
        }).catch(err => ({ error: `Kong integration failed: ${err.message}` }))
      );
    }

    // Okta - DR authentication and access
    if (connectors.okta && data.failoverEvents) {
      integrationPromises.push(
        connectors.okta.updateDRAuthentication({
          failoverEvents: data.failoverEvents,
          threatLevel: data.threatLevel,
          reason: 'DR Plan automated failover authentication',
          recoveryObjectives: data.recoveryObjectives
        }).catch(err => ({ error: `Okta integration failed: ${err.message}` }))
      );
    }

    // OpenCTI - DR-related threat intelligence
    if (connectors.opencti && data.dataLossIncidents?.length > 0) {
      integrationPromises.push(
        connectors.opencti.createIndicators({
          type: 'incident',
          values: data.dataLossIncidents,
          labels: ['dr-plan', 'automated-detection'],
          confidence: data.threatLevel === 'critical' ? 90 : data.threatLevel === 'high' ? 75 : 60,
          description: `DR Plan detected data loss incidents and recovery plan failures`
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

module.exports = new DRPlanService();