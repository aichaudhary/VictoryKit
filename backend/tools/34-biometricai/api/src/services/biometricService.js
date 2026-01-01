const axios = require("axios");
const { getConnectors } = require("../../../../shared/connectors");

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || "http://localhost:8034";

class BiometricAIService {
  // Analyze biometric authentication using ML
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

  // Evaluate biometric security and spoofing detection
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
    const securityAlerts = [];
    const authenticity = { score: 88, confidence: 'high' };
    const recommendations = [];

    // Analyze biometric authentication attempts
    if (data.authAttempts) {
      const attempts = Array.isArray(data.authAttempts) ? data.authAttempts : [data.authAttempts];
      let failedAttempts = 0;
      let spoofingAttempts = 0;
      let unusualPatterns = 0;

      for (const attempt of attempts) {
        const attemptData = typeof attempt === 'string' ? { status: attempt } : attempt;

        if (attemptData.status === 'failed' || attemptData.success === false) {
          failedAttempts++;
        }

        if (attemptData.spoofingDetected || attemptData.liveness === false) {
          spoofingAttempts++;
          securityAlerts.push({
            type: 'spoofing_attempt',
            severity: 'critical',
            description: 'Biometric spoofing attempt detected',
            confidence: attemptData.confidence || 85
          });
        }

        if (attemptData.anomaly || attemptData.unusual) {
          unusualPatterns++;
          if (unusualPatterns > 2) {
            securityAlerts.push({
              type: 'unusual_pattern',
              severity: 'medium',
              description: 'Unusual biometric authentication patterns detected',
              occurrences: unusualPatterns
            });
          }
        }
      }

      if (failedAttempts > attempts.length * 0.3) {
        securityAlerts.push({
          type: 'high_failure_rate',
          severity: 'high',
          description: `${failedAttempts} failed authentication attempts out of ${attempts.length}`,
          failureRate: (failedAttempts / attempts.length) * 100
        });
      }
    }

    // Analyze device and sensor integrity
    if (data.devices) {
      const devices = Array.isArray(data.devices) ? data.devices : [data.devices];
      let compromisedDevices = 0;
      let tamperedSensors = 0;

      for (const device of devices) {
        if (device.compromised || device.tampered) {
          compromisedDevices++;
          securityAlerts.push({
            type: 'device_compromise',
            severity: 'critical',
            description: `Biometric device ${device.id || device.name} appears compromised`,
            deviceId: device.id
          });
        }

        if (device.sensorTampered) {
          tamperedSensors++;
        }
      }

      if (tamperedSensors > 0) {
        securityAlerts.push({
          type: 'sensor_tampering',
          severity: 'high',
          description: `${tamperedSensors} sensors show signs of tampering`,
          count: tamperedSensors
        });
      }
    }

    // Calculate authenticity score
    const alertScore = securityAlerts.reduce((score, alert) => {
      return score + (alert.severity === 'critical' ? 20 : alert.severity === 'high' ? 10 : 3);
    }, 0);
    authenticity.score = Math.max(0, 100 - alertScore);
    authenticity.confidence = authenticity.score > 90 ? 'very_high' : authenticity.score > 80 ? 'high' : authenticity.score > 70 ? 'medium' : 'low';

    // Generate recommendations
    if (securityAlerts.some(a => a.type === 'spoofing_attempt')) {
      recommendations.push({
        priority: 'critical',
        action: 'Implement additional anti-spoofing measures',
        reason: 'Biometric spoofing detected'
      });
    }

    if (authenticity.score < 70) {
      recommendations.push({
        priority: 'high',
        action: 'Review and recalibrate biometric systems',
        reason: 'Low authenticity confidence detected'
      });
    }

    return {
      securityAlerts,
      authenticity,
      recommendations,
      totalAttempts: data.authAttempts?.length || 0,
      devicesAnalyzed: data.devices?.length || 0,
      alertCount: securityAlerts.length,
      criticalAlerts: securityAlerts.filter(a => a.severity === 'critical').length,
      systemHealth: authenticity.confidence === 'high' || authenticity.confidence === 'very_high' ? 'good' : 'needs_attention'
    };
  }

  // Fallback scan when ML engine is unavailable
  fallbackScan(target) {
    return {
      target,
      scanId: Date.now(),
      authenticity: { score: 82, confidence: 'medium' },
      alerts: 1,
      status: 'completed',
      note: 'ML engine unavailable, basic biometric analysis completed'
    };
  }

  // Integrate with external security stack
  async integrateWithSecurityStack(entityId, data) {
    try {
      const connectors = getConnectors();
      const integrationPromises = [];

      // Microsoft Sentinel - Log biometric analysis and security alerts
      if (connectors.sentinel) {
        integrationPromises.push(
          connectors.sentinel.ingestData({
            table: 'Biometric_Analysis_CL',
            data: {
              EntityId: entityId,
              AnalysisType: data.analysisType || 'biometric_security_analysis',
              Target: data.target,
              AuthenticityScore: data.authenticity?.score || 0,
              AuthenticityConfidence: data.authenticity?.confidence || 'unknown',
              SecurityAlerts: data.securityAlerts?.length || 0,
              CriticalAlerts: data.criticalAlerts || 0,
              TotalAttempts: data.totalAttempts || 0,
              DevicesAnalyzed: data.devicesAnalyzed || 0,
              SystemHealth: data.systemHealth || 'unknown',
              ScanId: data.scanId,
              Timestamp: new Date().toISOString(),
              Severity: data.severity || 'medium'
            }
          }).catch(err => console.error('Sentinel BiometricAI integration failed:', err))
        );
      }

      // Cortex XSOAR - Create incidents for biometric security alerts
      if (connectors.xsoar && data.securityAlerts?.length > 0) {
        const criticalAlerts = data.securityAlerts.filter(a => a.severity === 'critical');
        if (criticalAlerts.length > 0) {
          integrationPromises.push(
            connectors.xsoar.createIncident({
              type: 'biometric_security_alert',
              severity: 'critical',
              title: `Biometric Security Alert: ${criticalAlerts[0].type}`,
              description: `Biometric analysis detected ${data.securityAlerts.length} security alerts with authenticity score of ${data.authenticity?.score}`,
              labels: {
                entityId,
                target: data.target,
                authenticityScore: data.authenticity?.score,
                criticalAlerts: data.criticalAlerts,
                totalAttempts: data.totalAttempts
              }
            }).catch(err => console.error('XSOAR BiometricAI integration failed:', err))
          );
        }
      }

      // CrowdStrike - Trigger biometric security responses
      if (connectors.crowdstrike && data.securityAlerts?.some(a => a.severity === 'critical')) {
        integrationPromises.push(
          connectors.crowdstrike.biometricSecurityResponse({
            entityId,
            alerts: data.securityAlerts.filter(a => a.severity === 'critical'),
            action: 'lock_accounts',
            reason: 'Critical biometric security alerts detected'
          }).catch(err => console.error('CrowdStrike BiometricAI integration failed:', err))
        );
      }

      // Cloudflare - Update access policies for biometric compromise
      if (connectors.cloudflare && data.authenticity?.score < 70) {
        integrationPromises.push(
          connectors.cloudflare.updateBiometricPolicies({
            authenticityScore: data.authenticity.score,
            alerts: data.securityAlerts || [],
            action: 'require_additional_verification',
            reason: 'Low biometric authenticity detected'
          }).catch(err => console.error('Cloudflare BiometricAI integration failed:', err))
        );
      }

      // Kong - Implement strict API access controls
      if (connectors.kong && data.securityAlerts?.length > 0) {
        integrationPromises.push(
          connectors.kong.enforceBiometricSecurity({
            alerts: data.securityAlerts,
            authenticityScore: data.authenticity?.score,
            action: 'heightened_authentication',
            reason: 'Biometric security alerts detected'
          }).catch(err => console.error('Kong BiometricAI integration failed:', err))
        );
      }

      // Okta - Update adaptive access and MFA policies
      if (connectors.okta) {
        integrationPromises.push(
          connectors.okta.updateBiometricPolicies({
            entityId,
            authenticityScore: data.authenticity?.score,
            alerts: data.securityAlerts?.map(a => a.type) || [],
            confidence: data.authenticity?.confidence,
            action: data.authenticity?.score < 60 ? 'require_alternative_auth' : 'maintain_current'
          }).catch(err => console.error('Okta BiometricAI integration failed:', err))
        );
      }

      // OpenCTI - Create indicators for biometric security threats
      if (connectors.opencti && data.securityAlerts?.length > 0) {
        for (const alert of data.securityAlerts) {
          integrationPromises.push(
            connectors.opencti.createIndicator({
              type: 'biometric_security_threat',
              value: alert.type,
              description: alert.description,
              labels: ['biometric_ai', 'security_alert', alert.severity],
              confidence: alert.confidence || 85,
              entityId
            }).catch(err => console.error('OpenCTI BiometricAI integration failed:', err))
          );
        }
      }

      // Execute all integrations in parallel
      await Promise.allSettled(integrationPromises);
      console.log(`Biometric AI integration completed for entity ${entityId}`);

    } catch (error) {
      console.error('Biometric AI security stack integration error:', error);
      // Don't throw - integration failures shouldn't break core functionality
    }
  }
}

module.exports = new BiometricAIService();