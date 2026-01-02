const axios = require('axios');
const { getConnectors } = require('../../../../../../shared/connectors');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8043';

class BackupGuardService {
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

    // Microsoft Sentinel - Log backup security events
    if (connectors.sentinel) {
      integrationPromises.push(
        connectors.sentinel.ingestData({
          table: 'BackupGuardEvents',
          data: {
            entityId,
            timestamp: new Date().toISOString(),
            backupFailures: data.backupFailures || [],
            integrityViolations: data.integrityViolations || [],
            unauthorizedAccess: data.unauthorizedAccess || [],
            threatLevel: data.threatLevel || 'low',
            backupTypes: data.backupTypes || [],
            storageLocations: data.storageLocations || [],
            encryptionStatus: data.encryptionStatus || [],
            retentionPolicies: data.retentionPolicies || []
          }
        }).catch(err => ({ error: `Sentinel integration failed: ${err.message}` }))
      );
    }

    // Cortex XSOAR - Create incidents for backup security breaches
    if (connectors.xsoar && (data.threatLevel === 'high' || data.threatLevel === 'critical')) {
      integrationPromises.push(
        connectors.xsoar.createIncident({
          type: 'BackupGuardAlert',
          severity: data.threatLevel === 'critical' ? 'high' : 'medium',
          title: `Backup Guard Alert: ${data.integrityViolations?.length || 0} integrity violations detected`,
          description: `Automated backup analysis detected potential security breach or data tampering`,
          labels: ['backup-guard', 'automated-detection'],
          details: {
            entityId,
            integrityViolations: data.integrityViolations,
            unauthorizedAccess: data.unauthorizedAccess,
            backupFailures: data.backupFailures,
            storageLocations: data.storageLocations
          }
        }).catch(err => ({ error: `XSOAR integration failed: ${err.message}` }))
      );
    }

    // CrowdStrike - Backup data protection
    if (connectors.crowdstrike && data.unauthorizedAccess?.length > 0 && data.threatLevel !== 'low') {
      integrationPromises.push(
        connectors.crowdstrike.backupProtection({
          action: 'secure',
          unauthorizedAccess: data.unauthorizedAccess,
          storageLocations: data.storageLocations,
          reason: 'Backup Guard automated protection',
          severity: data.threatLevel
        }).catch(err => ({ error: `CrowdStrike integration failed: ${err.message}` }))
      );
    }

    // Cloudflare - Backup traffic security
    if (connectors.cloudflare && data.storageLocations?.length > 0) {
      integrationPromises.push(
        connectors.cloudflare.updateBackupTrafficRules({
          action: 'protect',
          storageLocations: data.storageLocations,
          unauthorizedAccess: data.unauthorizedAccess,
          reason: 'Backup Guard automated security',
          priority: data.threatLevel === 'critical' ? 1 : 2
        }).catch(err => ({ error: `Cloudflare integration failed: ${err.message}` }))
      );
    }

    // Kong - Backup API security controls
    if (connectors.kong && data.backupTypes?.length > 0 && data.threatLevel !== 'low') {
      integrationPromises.push(
        connectors.kong.createBackupSecurityPolicy({
          backupTypes: data.backupTypes,
          blockedAccess: data.unauthorizedAccess,
          reason: 'Backup Guard suspicious activity',
          rateLimit: data.threatLevel === 'critical' ? 10 : 50
        }).catch(err => ({ error: `Kong integration failed: ${err.message}` }))
      );
    }

    // Okta - Backup access control
    if (connectors.okta && data.unauthorizedAccess) {
      integrationPromises.push(
        connectors.okta.updateBackupAuthentication({
          unauthorizedAccess: data.unauthorizedAccess,
          threatLevel: data.threatLevel,
          reason: 'Backup Guard automated policy update',
          backupTypes: data.backupTypes
        }).catch(err => ({ error: `Okta integration failed: ${err.message}` }))
      );
    }

    // OpenCTI - Backup-related threat indicators
    if (connectors.opencti && data.integrityViolations?.length > 0) {
      integrationPromises.push(
        connectors.opencti.createIndicators({
          type: 'attack-pattern',
          values: data.integrityViolations,
          labels: ['backup-guard', 'automated-detection'],
          confidence: data.threatLevel === 'critical' ? 90 : data.threatLevel === 'high' ? 75 : 60,
          description: `Backup Guard detected data integrity violations and unauthorized backup access`
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

module.exports = new BackupGuardService();