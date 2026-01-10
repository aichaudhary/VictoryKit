const axios = require("axios");
const { getConnectors } = require('../../../../../shared/connectors');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || "http://localhost:8019";

class RiskService {
  // Calculate assessment risk
  async calculateAssessmentRisk(assessment) {
    const risks = assessment.risks || [];
    const controls = assessment.controls || [];

    // Calculate summary
    const summary = {
      totalRisks: risks.length,
      risksByLevel: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        informational: 0,
      },
      risksByStatus: {
        identified: 0,
        assessed: 0,
        treated: 0,
        accepted: 0,
        closed: 0,
      },
      averageRiskScore: 0,
      residualRiskScore: 0,
      controlEffectiveness: 0,
    };

    let totalInherent = 0;
    let totalResidual = 0;

    for (const risk of risks) {
      // Count by level
      const level = risk.inherentRisk?.level || "informational";
      summary.risksByLevel[level] = (summary.risksByLevel[level] || 0) + 1;

      // Count by status
      const status = risk.status || "identified";
      summary.risksByStatus[status] = (summary.risksByStatus[status] || 0) + 1;

      // Sum scores
      totalInherent += risk.inherentRisk?.score || 0;
      totalResidual += risk.residualRisk?.score || 0;
    }

    if (risks.length > 0) {
      summary.averageRiskScore = Math.round(totalInherent / risks.length);
      summary.residualRiskScore = Math.round(totalResidual / risks.length);
    }

    // Calculate control effectiveness
    if (controls.length > 0) {
      const totalEffectiveness = controls.reduce(
        (sum, c) => sum + (c.effectiveness?.score || 0),
        0
      );
      summary.controlEffectiveness = Math.round(
        totalEffectiveness / controls.length
      );
    }

    return {
      summary,
      riskReduction: summary.averageRiskScore - summary.residualRiskScore,
      riskReductionPercent:
        summary.averageRiskScore > 0
          ? Math.round(
              (1 - summary.residualRiskScore / summary.averageRiskScore) * 100
            )
          : 0,
    };
  }

  // Analyze assessment
  async analyzeAssessment(assessment) {
    try {
      // Try ML engine
      const response = await axios.post(
        `${ML_ENGINE_URL}/analyze/assessment`,
        {
          assessment: assessment.toObject(),
        },
        { timeout: 10000 }
      );
      return response.data;
    } catch (error) {
      // Fallback to local analysis
      return this.localAnalysis(assessment);
    }
  }

  // Local analysis fallback
  localAnalysis(assessment) {
    const risks = assessment.risks || [];
    const controls = assessment.controls || [];

    // Risk analysis
    const riskAnalysis = {
      topRisks: risks
        .sort(
          (a, b) => (b.inherentRisk?.score || 0) - (a.inherentRisk?.score || 0)
        )
        .slice(0, 5)
        .map((r) => ({
          name: r.name,
          category: r.category,
          score: r.inherentRisk?.score,
          level: r.inherentRisk?.level,
        })),
      byCategory: this.groupRisksByCategory(risks),
      untreatedCritical: risks.filter(
        (r) => r.inherentRisk?.level === "critical" && r.status !== "treated"
      ).length,
    };

    // Control analysis
    const controlAnalysis = {
      totalControls: controls.length,
      implemented: controls.filter(
        (c) => c.implementation?.status === "implemented"
      ).length,
      gaps: controls
        .filter((c) => c.implementation?.status !== "implemented")
        .map((c) => ({
          name: c.name,
          status: c.implementation?.status,
        })),
      averageEffectiveness:
        controls.length > 0
          ? Math.round(
              controls.reduce(
                (sum, c) => sum + (c.effectiveness?.score || 0),
                0
              ) / controls.length
            )
          : 0,
    };

    return {
      riskAnalysis,
      controlAnalysis,
      recommendations: this.generateRecommendations(risks, controls),
      maturityAssessment: this.assessMaturity(assessment),
    };
  }

  // Group risks by category
  groupRisksByCategory(risks) {
    return risks.reduce((acc, risk) => {
      const cat = risk.category || "other";
      if (!acc[cat]) {
        acc[cat] = { count: 0, avgScore: 0, scores: [] };
      }
      acc[cat].count++;
      acc[cat].scores.push(risk.inherentRisk?.score || 0);
      acc[cat].avgScore = Math.round(
        acc[cat].scores.reduce((a, b) => a + b, 0) / acc[cat].scores.length
      );
      return acc;
    }, {});
  }

  // Generate recommendations
  generateRecommendations(risks, controls) {
    const recommendations = [];

    // Check for critical risks without controls
    const criticalWithoutControls = risks.filter(
      (r) =>
        r.inherentRisk?.level === "critical" &&
        (!r.controls || r.controls.length === 0)
    );
    if (criticalWithoutControls.length > 0) {
      recommendations.push({
        priority: "critical",
        recommendation: `${criticalWithoutControls.length} critical risks have no assigned controls`,
        action: "Implement controls for critical risks immediately",
      });
    }

    // Check for untested controls
    const untestedControls = controls.filter(
      (c) => c.effectiveness?.rating === "not_tested"
    );
    if (untestedControls.length > 0) {
      recommendations.push({
        priority: "high",
        recommendation: `${untestedControls.length} controls have not been tested`,
        action: "Schedule control effectiveness testing",
      });
    }

    // Check for overdue treatments
    const overdueRisks = risks.filter((r) => {
      return (
        r.treatment?.dueDate &&
        new Date(r.treatment.dueDate) < new Date() &&
        r.treatment?.status !== "completed"
      );
    });
    if (overdueRisks.length > 0) {
      recommendations.push({
        priority: "high",
        recommendation: `${overdueRisks.length} risk treatments are overdue`,
        action: "Review and update treatment plans",
      });
    }

    return recommendations;
  }

  // Assess maturity
  assessMaturity(assessment) {
    let score = 0;
    const factors = [];

    // Check if methodology is defined
    if (assessment.methodology) {
      score += 10;
      factors.push({ factor: "Methodology defined", points: 10 });
    }

    // Check for defined scope
    if (assessment.scope?.description) {
      score += 10;
      factors.push({ factor: "Scope defined", points: 10 });
    }

    // Check for team assignment
    if (assessment.team?.length > 0) {
      score += 10;
      factors.push({ factor: "Team assigned", points: 10 });
    }

    // Check for controls
    if (assessment.controls?.length > 0) {
      score += 20;
      factors.push({ factor: "Controls defined", points: 20 });
    }

    // Check for risk appetite
    if (assessment.riskAppetite?.level) {
      score += 15;
      factors.push({ factor: "Risk appetite defined", points: 15 });
    }

    // Check for schedule
    if (assessment.schedule?.nextReview) {
      score += 10;
      factors.push({ factor: "Review scheduled", points: 10 });
    }

    const level =
      score >= 80
        ? "optimized"
        : score >= 60
        ? "managed"
        : score >= 40
        ? "defined"
        : score >= 20
        ? "developing"
        : "initial";

    return {
      score,
      level,
      factors,
    };
  }

  // Generate report
  async generateReport(assessment, format) {
    const calculation = await this.calculateAssessmentRisk(assessment);
    const analysis = await this.analyzeAssessment(assessment);

    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        format,
        assessmentName: assessment.name,
        assessmentType: assessment.type,
      },
      executiveSummary: {
        overview: `Risk assessment for ${assessment.name}`,
        totalRisks: assessment.risks?.length || 0,
        averageRiskScore: calculation.summary.averageRiskScore,
        residualRiskScore: calculation.summary.residualRiskScore,
        riskReductionPercent: calculation.riskReductionPercent,
      },
      riskProfile: calculation.summary.risksByLevel,
      analysis: analysis.riskAnalysis,
      controls: analysis.controlAnalysis,
      maturity: analysis.maturityAssessment,
      recommendations: analysis.recommendations,
      nextSteps: [
        "Review and validate identified risks",
        "Implement recommended controls",
        "Schedule follow-up assessment",
        "Report to stakeholders",
      ],
    };
  }

  // Integration with external security stack
  async integrateWithSecurityStack(assessmentId, assessmentData) {
    try {
      const connectors = getConnectors();
      const integrationPromises = [];

      // Microsoft Sentinel - Log risk assessment results
      if (connectors.sentinel) {
        integrationPromises.push(
          connectors.sentinel.ingestData({
            table: 'RiskQuantifyment_CL',
            data: {
              AssessmentId: assessmentId,
              AssessmentName: assessmentData.name,
              AssessmentType: assessmentData.type,
              TotalRisks: assessmentData.totalRisks,
              CriticalRisks: assessmentData.criticalRisks,
              HighRisks: assessmentData.highRisks,
              AverageRiskScore: assessmentData.averageRiskScore,
              ResidualRiskScore: assessmentData.residualRiskScore,
              Timestamp: new Date().toISOString(),
              Source: 'RiskQuantify'
            }
          }).catch(err => console.error('Sentinel integration failed:', err.message))
        );
      }

      // Cortex XSOAR - Create incident for high-risk assessments
      if (connectors.cortexXSOAR && assessmentData.criticalRisks > 0) {
        integrationPromises.push(
          connectors.cortexXSOAR.createIncident({
            name: `Critical Risk Assessment - ${assessmentData.name}`,
            type: 'Risk Assessment',
            severity: 'High',
            details: {
              assessmentId,
              name: assessmentData.name,
              type: assessmentData.type,
              totalRisks: assessmentData.totalRisks,
              criticalRisks: assessmentData.criticalRisks,
              averageRiskScore: assessmentData.averageRiskScore
            }
          }).catch(err => console.error('XSOAR integration failed:', err.message))
        );
      }

      // OpenCTI - Enrich with threat intelligence for risk factors
      if (connectors.opencti && assessmentData.risks) {
        const tiPromises = assessmentData.risks.map(risk =>
          connectors.opencti.searchIndicators({
            pattern: risk.category || risk.name,
            pattern_type: 'threat-actor'
          }).catch(err => console.error('OpenCTI enrichment failed:', err.message))
        );
        integrationPromises.push(...tiPromises);
      }

      await Promise.allSettled(integrationPromises);
      console.log('RiskQuantify security stack integration completed');

    } catch (error) {
      console.error('RiskQuantify integration error:', error);
    }
  }
}

module.exports = new RiskService();
