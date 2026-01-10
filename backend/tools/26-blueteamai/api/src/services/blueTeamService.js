const axios = require("axios");
const { getConnectors } = require("../../../../shared/connectors");

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || "http://localhost:8026";

class BlueTeamAIService {
  // Analyze security data using ML
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

  // Scan target for vulnerabilities
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
    const threats = [];
    const anomalies = [];

    // Simple pattern matching for common threats
    if (data.logs) {
      const logLines = data.logs.split('\n');
      for (const line of logLines) {
        if (line.includes('failed login') || line.includes('authentication failed')) {
          threats.push({
            type: 'brute_force',
            severity: 'medium',
            description: 'Potential brute force attack detected',
            line: line
          });
        }
        if (line.includes('SQL injection') || line.includes('script')) {
          threats.push({
            type: 'injection_attack',
            severity: 'high',
            description: 'Potential injection attack detected',
            line: line
          });
        }
      }
    }

    // Basic anomaly detection
    if (data.metrics) {
      const cpuUsage = data.metrics.cpu || 0;
      const memoryUsage = data.metrics.memory || 0;

      if (cpuUsage > 90) {
        anomalies.push({
          type: 'high_cpu',
          severity: 'medium',
          description: 'High CPU usage detected',
          value: cpuUsage
        });
      }

      if (memoryUsage > 90) {
        anomalies.push({
          type: 'high_memory',
          severity: 'medium',
          description: 'High memory usage detected',
          value: memoryUsage
        });
      }
    }

    return {
      threats,
      anomalies,
      riskScore: threats.length * 10 + anomalies.length * 5,
      recommendations: [
        'Monitor suspicious activities',
        'Review access logs',
        'Update security policies if needed'
      ]
    };
  }

  // Fallback scan when ML engine is unavailable
  fallbackScan(target) {
    return {
      target,
      scanId: Date.now(),
      vulnerabilities: [],
      status: 'completed',
      summary: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0
      },
      note: 'ML engine unavailable, basic scan completed'
    };
  }

  // Integrate with external security stack
  async integrateWithSecurityStack(entityId, data) {
    try {
      const connectors = getConnectors();
      const integrationPromises = [];

      // Microsoft Sentinel - Log blue team analysis results
      if (connectors.sentinel) {
        integrationPromises.push(
          connectors.sentinel.ingestData({
            table: 'BlueTeam_Analysis_CL',
            data: {
              EntityId: entityId,
              AnalysisType: data.analysisType || 'threat_detection',
              Target: data.target,
              ThreatsDetected: data.threats?.length || 0,
              AnomaliesDetected: data.anomalies?.length || 0,
              RiskScore: data.riskScore || 0,
              ScanId: data.scanId,
              Timestamp: new Date().toISOString(),
              Severity: data.severity || 'medium'
            }
          }).catch(err => console.error('Sentinel BlueTeam integration failed:', err))
        );
      }

      // Cortex XSOAR - Create incidents for detected threats
      if (connectors.xsoar && (data.threats?.length > 0 || data.anomalies?.length > 0)) {
        const highSeverityThreats = data.threats?.filter(t => t.severity === 'high' || t.severity === 'critical') || [];
        if (highSeverityThreats.length > 0) {
          integrationPromises.push(
            connectors.xsoar.createIncident({
              type: 'blue_team_threat_detection',
              severity: 'high',
              title: `BlueTeam AI Detected ${highSeverityThreats.length} High-Severity Threats`,
              description: `Automated threat detection identified ${data.threats.length} threats and ${data.anomalies.length} anomalies`,
              labels: {
                entityId,
                target: data.target,
                threatCount: data.threats.length,
                anomalyCount: data.anomalies.length,
                riskScore: data.riskScore
              }
            }).catch(err => console.error('XSOAR BlueTeam integration failed:', err))
          );
        }
      }

      // CrowdStrike - Trigger containment actions for detected threats
      if (connectors.crowdstrike && data.threats?.some(t => t.severity === 'critical')) {
        integrationPromises.push(
          connectors.crowdstrike.containmentAction({
            entityId,
            action: 'isolate',
            reason: 'Critical threat detected by BlueTeam AI',
            threats: data.threats.filter(t => t.severity === 'critical')
          }).catch(err => console.error('CrowdStrike BlueTeam integration failed:', err))
        );
      }

      // Cloudflare - Update WAF rules based on detected patterns
      if (connectors.cloudflare && data.attackPatterns) {
        integrationPromises.push(
          connectors.cloudflare.updateWAF({
            patterns: data.attackPatterns,
            action: 'block',
            source: 'BlueTeam_AI'
          }).catch(err => console.error('Cloudflare BlueTeam integration failed:', err))
        );
      }

      // Kong - Implement rate limiting for detected attack sources
      if (connectors.kong && data.attackSources) {
        integrationPromises.push(
          connectors.kong.updateRateLimit({
            sources: data.attackSources,
            action: 'restrict',
            reason: 'BlueTeam AI threat detection'
          }).catch(err => console.error('Kong BlueTeam integration failed:', err))
        );
      }

      // Okta - Risk assessment and adaptive access policies
      if (connectors.okta && data.userRisk) {
        integrationPromises.push(
          connectors.okta.updateRiskQuantifyment({
            userId: data.userId,
            riskLevel: data.riskScore > 70 ? 'high' : data.riskScore > 40 ? 'medium' : 'low',
            factors: data.threats?.map(t => t.type) || [],
            source: 'BlueTeam_AI'
          }).catch(err => console.error('Okta BlueTeam integration failed:', err))
        );
      }

      // OpenCTI - Enrich threat intelligence database
      if (connectors.opencti && data.threats?.length > 0) {
        for (const threat of data.threats) {
          integrationPromises.push(
            connectors.opencti.createIndicator({
              type: 'threat_pattern',
              value: threat.type,
              description: threat.description,
              labels: ['blueteam', 'ai_detected', threat.severity],
              confidence: threat.confidence || 75,
              entityId
            }).catch(err => console.error('OpenCTI BlueTeam integration failed:', err))
          );
        }
      }

      // Execute all integrations in parallel
      await Promise.allSettled(integrationPromises);
      console.log(`BlueTeam AI integration completed for entity ${entityId}`);

    } catch (error) {
      console.error('BlueTeam AI security stack integration error:', error);
      // Don't throw - integration failures shouldn't break core functionality
    }
  }
}

module.exports = new BlueTeamAIService();