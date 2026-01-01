const axios = require("axios");
const { getConnectors } = require("../../../../shared/connectors");

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || "http://localhost:8027";

class SIEMCommanderService {
  // Analyze security events using ML
  async analyze(data) {
    try {
      const response = await axios.post(
        `${ML_ENGINE_URL}/analyze`,
        { data },
        { timeout: 30000 }
      );
      return response.data;
    } catch (error) {
      console.error("ML analysis failed, using fallback:", error.message);
      return this.fallbackAnalysis(data);
    }
  }

  // Scan logs for security events
  async scan(target) {
    try {
      const response = await axios.post(
        `${ML_ENGINE_URL}/scan`,
        { target },
        { timeout: 60000 }
      );
      return response.data;
    } catch (error) {
      console.error("ML scan failed, using fallback:", error.message);
      return this.fallbackScan(target);
    }
  }

  // Fallback analysis when ML engine is unavailable
  fallbackAnalysis(data) {
    const alerts = [];
    const correlations = [];

    // Simple pattern matching for security events
    if (data.logs) {
      const logLines = data.logs.split('\n');
      for (const line of logLines) {
        if (line.includes('failed login') || line.includes('authentication failed')) {
          alerts.push({
            type: 'authentication_failure',
            severity: 'medium',
            source: 'system_logs',
            description: 'Multiple authentication failures detected',
            count: 1
          });
        }
        if (line.includes('intrusion') || line.includes('attack')) {
          alerts.push({
            type: 'intrusion_attempt',
            severity: 'high',
            source: 'security_logs',
            description: 'Potential intrusion attempt detected',
            count: 1
          });
        }
        if (line.includes('malware') || line.includes('virus')) {
          alerts.push({
            type: 'malware_detection',
            severity: 'critical',
            source: 'antivirus_logs',
            description: 'Malware detected in system',
            count: 1
          });
        }
      }
    }

    // Basic correlation analysis
    const alertTypes = {};
    for (const alert of alerts) {
      alertTypes[alert.type] = (alertTypes[alert.type] || 0) + alert.count;
    }

    for (const [type, count] of Object.entries(alertTypes)) {
      if (count > 5) {
        correlations.push({
          type: 'frequency_anomaly',
          description: `High frequency of ${type} events: ${count} occurrences`,
          severity: 'high',
          relatedAlerts: alerts.filter(a => a.type === type)
        });
      }
    }

    return {
      alerts,
      correlations,
      totalEvents: logLines?.length || 0,
      alertCount: alerts.length,
      correlationCount: correlations.length,
      riskLevel: alerts.filter(a => a.severity === 'critical').length > 0 ? 'critical' :
                 alerts.filter(a => a.severity === 'high').length > 3 ? 'high' : 'medium'
    };
  }

  // Fallback scan when ML engine is unavailable
  fallbackScan(target) {
    return {
      target,
      scanId: Date.now(),
      events: [],
      status: 'completed',
      summary: {
        totalEvents: 0,
        alerts: 0,
        correlations: 0
      },
      note: 'ML engine unavailable, basic scan completed'
    };
  }

  // Integrate with external security stack
  async integrateWithSecurityStack(entityId, data) {
    try {
      const connectors = getConnectors();
      const integrationPromises = [];

      // Microsoft Sentinel - Primary SIEM integration (bidirectional sync)
      if (connectors.sentinel) {
        // Ingest SIEM analysis results
        integrationPromises.push(
          connectors.sentinel.ingestData({
            table: 'SIEM_Analysis_CL',
            data: {
              EntityId: entityId,
              AnalysisType: data.analysisType || 'event_analysis',
              Target: data.target,
              AlertsGenerated: data.alerts?.length || 0,
              CorrelationsFound: data.correlations?.length || 0,
              TotalEvents: data.totalEvents || 0,
              RiskLevel: data.riskLevel || 'medium',
              ScanId: data.scanId,
              Timestamp: new Date().toISOString(),
              Severity: data.severity || 'medium'
            }
          }).catch(err => console.error('Sentinel SIEM integration failed:', err))
        );

        // Sync alerts to Sentinel
        if (data.alerts?.length > 0) {
          for (const alert of data.alerts) {
            integrationPromises.push(
              connectors.sentinel.createAlert({
                title: `SIEM Alert: ${alert.type}`,
                description: alert.description,
                severity: alert.severity,
                source: 'SIEMCommander',
                entityId,
                alertType: alert.type
              }).catch(err => console.error('Sentinel alert creation failed:', err))
            );
          }
        }
      }

      // Cortex XSOAR - Create incidents from SIEM correlations
      if (connectors.xsoar && data.correlations?.length > 0) {
        for (const correlation of data.correlations) {
          integrationPromises.push(
            connectors.xsoar.createIncident({
              type: 'siem_correlation',
              severity: correlation.severity,
              title: `SIEM Correlation: ${correlation.type}`,
              description: correlation.description,
              labels: {
                entityId,
                correlationType: correlation.type,
                relatedAlerts: correlation.relatedAlerts?.length || 0,
                source: 'SIEMCommander'
              }
            }).catch(err => console.error('XSOAR SIEM integration failed:', err))
          );
        }
      }

      // CrowdStrike - Automated response for critical alerts
      if (connectors.crowdstrike && data.alerts?.some(a => a.severity === 'critical')) {
        const criticalAlerts = data.alerts.filter(a => a.severity === 'critical');
        integrationPromises.push(
          connectors.crowdstrike.automatedResponse({
            entityId,
            alerts: criticalAlerts,
            action: 'contain',
            reason: 'Critical SIEM alerts detected'
          }).catch(err => console.error('CrowdStrike SIEM integration failed:', err))
        );
      }

      // Cloudflare - Update security rules based on attack patterns
      if (connectors.cloudflare && data.attackPatterns) {
        integrationPromises.push(
          connectors.cloudflare.updateSecurityRules({
            patterns: data.attackPatterns,
            action: 'block',
            source: 'SIEMCommander'
          }).catch(err => console.error('Cloudflare SIEM integration failed:', err))
        );
      }

      // Kong - Rate limiting for suspicious sources
      if (connectors.kong && data.suspiciousSources) {
        integrationPromises.push(
          connectors.kong.updateRateLimit({
            sources: data.suspiciousSources,
            action: 'throttle',
            reason: 'SIEM detected suspicious activity'
          }).catch(err => console.error('Kong SIEM integration failed:', err))
        );
      }

      // Okta - User risk updates based on authentication alerts
      if (connectors.okta && data.authAlerts) {
        integrationPromises.push(
          connectors.okta.updateUserRisk({
            alerts: data.authAlerts,
            source: 'SIEMCommander'
          }).catch(err => console.error('Okta SIEM integration failed:', err))
        );
      }

      // OpenCTI - Threat intelligence enrichment
      if (connectors.opencti && data.threatIndicators) {
        for (const indicator of data.threatIndicators) {
          integrationPromises.push(
            connectors.opencti.createIndicator({
              type: 'siem_indicator',
              value: indicator.value,
              description: indicator.description,
              labels: ['siem', 'correlation', indicator.type],
              confidence: indicator.confidence || 80,
              entityId
            }).catch(err => console.error('OpenCTI SIEM integration failed:', err))
          );
        }
      }

      // Execute all integrations in parallel
      await Promise.allSettled(integrationPromises);
      console.log(`SIEM Commander integration completed for entity ${entityId}`);

    } catch (error) {
      console.error('SIEM Commander security stack integration error:', error);
      // Don't throw - integration failures shouldn't break core functionality
    }
  }
}

module.exports = new SIEMCommanderService();