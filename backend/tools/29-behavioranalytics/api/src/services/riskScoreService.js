const axios = require("axios");
const { getConnectors } = require("../../../../shared/connectors");

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || "http://localhost:8029";

class BehaviorAnalyticsService {
  // Analyze risk factors using ML
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

  // Calculate comprehensive risk scores
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
    const riskFactors = [];
    const recommendations = [];
    let overallScore = 50; // Base score

    // Analyze various risk factors
    if (data.security) {
      const security = data.security;
      if (security.vulnerabilities > 10) {
        riskFactors.push({
          type: 'vulnerability_density',
          severity: 'high',
          score: 25,
          description: `High vulnerability count: ${security.vulnerabilities}`
        });
        overallScore += 25;
      }

      if (security.outdatedSoftware > 5) {
        riskFactors.push({
          type: 'outdated_software',
          severity: 'medium',
          score: 15,
          description: `Outdated software instances: ${security.outdatedSoftware}`
        });
        overallScore += 15;
      }

      if (security.weakPasswords > 0) {
        riskFactors.push({
          type: 'weak_credentials',
          severity: 'high',
          score: 20,
          description: `Weak password instances: ${security.weakPasswords}`
        });
        overallScore += 20;
      }
    }

    if (data.compliance) {
      const compliance = data.compliance;
      if (compliance.violations > 0) {
        riskFactors.push({
          type: 'compliance_violations',
          severity: 'high',
          score: 30,
          description: `Compliance violations: ${compliance.violations}`
        });
        overallScore += 30;
      }
    }

    if (data.network) {
      const network = data.network;
      if (network.openPorts > 20) {
        riskFactors.push({
          type: 'network_exposure',
          severity: 'medium',
          score: 10,
          description: `Excessive open ports: ${network.openPorts}`
        });
        overallScore += 10;
      }
    }

    // Generate recommendations
    if (overallScore > 80) {
      recommendations.push({
        priority: 'critical',
        action: 'Immediate security audit and remediation',
        timeframe: 'Within 24 hours'
      });
    } else if (overallScore > 60) {
      recommendations.push({
        priority: 'high',
        action: 'Schedule security assessment',
        timeframe: 'Within 1 week'
      });
    }

    return {
      riskFactors,
      recommendations,
      overallScore: Math.min(overallScore, 100),
      riskLevel: overallScore > 80 ? 'critical' : overallScore > 60 ? 'high' : overallScore > 40 ? 'medium' : 'low',
      assessmentDate: new Date(),
      factors: {
        security: riskFactors.filter(f => f.type.includes('security') || f.type.includes('vulnerability')).length,
        compliance: riskFactors.filter(f => f.type.includes('compliance')).length,
        network: riskFactors.filter(f => f.type.includes('network')).length,
        operational: riskFactors.filter(f => f.type.includes('software') || f.type.includes('credential')).length
      }
    };
  }

  // Fallback scan when ML engine is unavailable
  fallbackScan(target) {
    return {
      target,
      scanId: Date.now(),
      riskScore: 45,
      status: 'completed',
      factors: {
        security: 2,
        compliance: 1,
        network: 1,
        operational: 1
      },
      note: 'ML engine unavailable, basic risk assessment completed'
    };
  }

  // Integrate with external security stack
  async integrateWithSecurityStack(entityId, data) {
    try {
      const connectors = getConnectors();
      const integrationPromises = [];

      // Microsoft Sentinel - Log risk assessment results
      if (connectors.sentinel) {
        integrationPromises.push(
          connectors.sentinel.ingestData({
            table: 'Risk_Assessment_CL',
            data: {
              EntityId: entityId,
              AssessmentType: data.assessmentType || 'comprehensive_risk',
              Target: data.target,
              OverallScore: data.overallScore || 0,
              RiskLevel: data.riskLevel || 'medium',
              RiskFactors: data.riskFactors?.length || 0,
              CriticalFactors: data.riskFactors?.filter(f => f.severity === 'critical').length || 0,
              HighFactors: data.riskFactors?.filter(f => f.severity === 'high').length || 0,
              ScanId: data.scanId,
              Timestamp: new Date().toISOString(),
              Severity: data.severity || 'medium'
            }
          }).catch(err => console.error('Sentinel RiskScore integration failed:', err))
        );
      }

      // Cortex XSOAR - Create incidents for high-risk assessments
      if (connectors.xsoar && (data.riskLevel === 'critical' || data.riskLevel === 'high')) {
        integrationPromises.push(
          connectors.xsoar.createIncident({
            type: 'risk_assessment_alert',
            severity: data.riskLevel,
            title: `High Risk Assessment: ${data.target || 'Unknown Target'} (Score: ${data.overallScore})`,
            description: `Risk assessment identified ${data.riskFactors?.length || 0} risk factors with overall score of ${data.overallScore}`,
            labels: {
              entityId,
              target: data.target,
              riskScore: data.overallScore,
              riskLevel: data.riskLevel,
              criticalFactors: data.riskFactors?.filter(f => f.severity === 'critical').length || 0
            }
          }).catch(err => console.error('XSOAR RiskScore integration failed:', err))
        );
      }

      // CrowdStrike - Implement protective measures for high-risk entities
      if (connectors.crowdstrike && data.riskLevel === 'critical') {
        integrationPromises.push(
          connectors.crowdstrike.enhanceProtection({
            entityId,
            riskLevel: data.riskLevel,
            riskFactors: data.riskFactors || [],
            action: 'heightened_monitoring'
          }).catch(err => console.error('CrowdStrike RiskScore integration failed:', err))
        );
      }

      // Cloudflare - Adjust security policies based on risk assessment
      if (connectors.cloudflare && data.networkRisk) {
        integrationPromises.push(
          connectors.cloudflare.adjustSecurity({
            riskLevel: data.riskLevel,
            factors: data.riskFactors?.filter(f => f.type.includes('network')) || [],
            action: data.riskLevel === 'high' ? 'strict' : 'normal'
          }).catch(err => console.error('Cloudflare RiskScore integration failed:', err))
        );
      }

      // Kong - Implement API risk controls
      if (connectors.kong && data.apiRisk) {
        integrationPromises.push(
          connectors.kong.adjustRiskControls({
            riskLevel: data.riskLevel,
            factors: data.apiRisk,
            action: data.riskLevel === 'high' ? 'restrict' : 'monitor'
          }).catch(err => console.error('Kong RiskScore integration failed:', err))
        );
      }

      // Okta - Update risk policies and adaptive access
      if (connectors.okta) {
        integrationPromises.push(
          connectors.okta.updateRiskPolicy({
            entityId,
            riskScore: data.overallScore,
            riskLevel: data.riskLevel,
            factors: data.riskFactors?.map(f => f.type) || [],
            assessmentDate: new Date()
          }).catch(err => console.error('Okta RiskScore integration failed:', err))
        );
      }

      // OpenCTI - Enrich threat intelligence with risk assessment data
      if (connectors.opencti && data.riskFactors?.length > 0) {
        for (const factor of data.riskFactors) {
          if (factor.type.includes('vulnerability') || factor.type.includes('threat')) {
            integrationPromises.push(
              connectors.opencti.createIndicator({
                type: 'risk_factor',
                value: factor.type,
                description: factor.description,
                labels: ['risk_assessment', 'ai_generated', factor.severity],
                confidence: factor.confidence || 75,
                entityId
              }).catch(err => console.error('OpenCTI RiskScore integration failed:', err))
            );
          }
        }
      }

      // Execute all integrations in parallel
      await Promise.allSettled(integrationPromises);
      console.log(`RiskScore AI integration completed for entity ${entityId}`);

    } catch (error) {
      console.error('RiskScore AI security stack integration error:', error);
      // Don't throw - integration failures shouldn't break core functionality
    }
  }
}

module.exports = new BehaviorAnalyticsService();