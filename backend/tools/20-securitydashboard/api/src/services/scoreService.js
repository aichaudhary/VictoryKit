const axios = require("axios");
const { getConnectors } = require('../../../../../shared/connectors');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || "http://localhost:8020";

class ScoreService {
  // Calculate overall security score
  async calculateScore(score, metrics) {
    const categories = [
      "network",
      "endpoint",
      "identity",
      "data",
      "application",
      "cloud",
      "compliance",
    ];
    const categoryScores = {};
    let weightedSum = 0;
    let totalWeight = 0;

    // Calculate category scores
    for (const cat of categories) {
      const categoryMetrics = metrics.filter((m) => m.category === cat);
      if (categoryMetrics.length === 0) {
        categoryScores[cat] = {
          score: 0,
          weight: score.categories?.[cat]?.weight || 0.1,
        };
        continue;
      }

      // Calculate weighted average for category
      let catWeightedSum = 0;
      let catTotalWeight = 0;

      for (const metric of categoryMetrics) {
        const metricWeight = metric.weight || 1;
        catWeightedSum += (metric.score?.value || 0) * metricWeight;
        catTotalWeight += metricWeight;
      }

      const catScore =
        catTotalWeight > 0 ? Math.round(catWeightedSum / catTotalWeight) : 0;
      const catWeight = score.categories?.[cat]?.weight || 0.1;

      categoryScores[cat] = {
        score: catScore,
        weight: catWeight,
        metricsCount: categoryMetrics.length,
        metrics: categoryMetrics.map((m) => m._id),
      };

      weightedSum += catScore * catWeight;
      totalWeight += catWeight;
    }

    // Calculate overall score
    const overallScore =
      totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

    // Count risks
    const risks = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const metric of metrics) {
      const status = metric.score?.status;
      if (status === "critical") risks.critical++;
      else if (status === "warning") risks.high++;
      else if (metric.score?.value < 70) risks.medium++;
      else if (metric.score?.value < 85) risks.low++;
    }

    return {
      overallScore,
      categories: categoryScores,
      risks,
      metricsAnalyzed: metrics.length,
      calculatedAt: new Date().toISOString(),
    };
  }

  // Get detailed breakdown
  getBreakdown(score, metrics) {
    const categories = [
      "network",
      "endpoint",
      "identity",
      "data",
      "application",
      "cloud",
      "compliance",
    ];
    const breakdown = {
      overall: {
        score: score.overallScore.value,
        grade: score.overallScore.grade,
        trend: score.overallScore.trend,
      },
      categories: {},
    };

    for (const cat of categories) {
      const categoryMetrics = metrics.filter((m) => m.category === cat);
      const catData = score.categories?.[cat] || {};

      breakdown.categories[cat] = {
        score: catData.score || 0,
        weight: catData.weight || 0,
        contribution: Math.round((catData.score || 0) * (catData.weight || 0)),
        metrics: categoryMetrics.map((m) => ({
          id: m._id,
          name: m.name,
          value: m.value?.current,
          score: m.score?.value,
          status: m.score?.status,
          trend: m.trend?.direction,
        })),
        issues: categoryMetrics
          .filter(
            (m) =>
              m.score?.status === "critical" || m.score?.status === "warning"
          )
          .map((m) => ({
            metric: m.name,
            status: m.score?.status,
            impact: "Reducing category score",
          })),
      };
    }

    // Top improvements needed
    breakdown.improvements = Object.entries(breakdown.categories)
      .filter(([_, data]) => data.score < 80)
      .sort((a, b) => a[1].score - b[1].score)
      .slice(0, 3)
      .map(([cat, data]) => ({
        category: cat,
        currentScore: data.score,
        targetScore: 80,
        gap: 80 - data.score,
      }));

    return breakdown;
  }

  // Analyze score trend
  analyzeTrend(history, period) {
    if (!history || history.length < 2) {
      return {
        trend: "insufficient_data",
        dataPoints: history?.length || 0,
      };
    }

    // Parse period
    const periodDays = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
      "365d": 365,
    };
    const days = periodDays[period] || 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    // Filter history by period
    const relevantHistory = history.filter((h) => new Date(h.date) >= cutoff);

    if (relevantHistory.length < 2) {
      return {
        trend: "insufficient_data",
        period,
        dataPoints: relevantHistory.length,
      };
    }

    // Sort by date
    relevantHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate trend
    const firstScore = relevantHistory[0].score;
    const lastScore = relevantHistory[relevantHistory.length - 1].score;
    const change = lastScore - firstScore;

    // Calculate statistics
    const scores = relevantHistory.map((h) => h.score);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const min = Math.min(...scores);
    const max = Math.max(...scores);

    // Determine trend direction
    let direction;
    if (change > 5) direction = "improving";
    else if (change < -5) direction = "declining";
    else direction = "stable";

    return {
      trend: direction,
      period,
      change,
      changePercent: Math.round((change / Math.max(firstScore, 1)) * 100),
      dataPoints: relevantHistory.length,
      statistics: {
        first: firstScore,
        last: lastScore,
        average: Math.round(avg),
        min,
        max,
      },
      history: relevantHistory.map((h) => ({
        date: h.date,
        score: h.score,
        grade: h.grade,
      })),
    };
  }

  // Predict future score
  async predictScore(currentScore, improvements) {
    try {
      const response = await axios.post(
        `${ML_ENGINE_URL}/predict/score`,
        {
          currentScore,
          improvements,
        },
        { timeout: 10000 }
      );
      return response.data;
    } catch (error) {
      // Fallback prediction
      let predictedIncrease = 0;
      for (const imp of improvements) {
        predictedIncrease += imp.impact?.scoreIncrease || 2;
      }
      return {
        currentScore: currentScore.overallScore?.value || 0,
        predictedScore: Math.min(
          100,
          (currentScore.overallScore?.value || 0) + predictedIncrease
        ),
        confidence: 0.6,
      };
    }
  }

  // Integration with external security stack
  async integrateWithSecurityStack(scoreId, scoreData) {
    try {
      const connectors = getConnectors();
      const integrationPromises = [];

      // Microsoft Sentinel - Log security score calculations
      if (connectors.sentinel) {
        integrationPromises.push(
          connectors.sentinel.ingestData({
            table: 'SecurityDashboard_CL',
            data: {
              ScoreId: scoreId,
              Organization: scoreData.organization,
              OverallScore: scoreData.overallScore,
              PreviousScore: scoreData.previousScore,
              ScoreChange: scoreData.scoreChange,
              CriticalIssues: scoreData.criticalIssues,
              HighIssues: scoreData.highIssues,
              RiskLevel: scoreData.riskLevel,
              Timestamp: new Date().toISOString(),
              Source: 'SecurityDashboard'
            }
          }).catch(err => console.error('Sentinel integration failed:', err.message))
        );
      }

      // Cortex XSOAR - Create incident for critically low security scores
      if (connectors.cortexXSOAR && scoreData.overallScore < 40) {
        integrationPromises.push(
          connectors.cortexXSOAR.createIncident({
            name: `Critical Security Score - ${scoreData.organization}`,
            type: 'Security Score',
            severity: 'Critical',
            details: {
              scoreId,
              organization: scoreData.organization,
              overallScore: scoreData.overallScore,
              criticalIssues: scoreData.criticalIssues,
              highIssues: scoreData.highIssues,
              riskLevel: scoreData.riskLevel
            }
          }).catch(err => console.error('XSOAR integration failed:', err.message))
        );
      }

      // OpenCTI - Enrich with threat intelligence based on score weaknesses
      if (connectors.opencti && scoreData.weakCategories) {
        const tiPromises = scoreData.weakCategories.map(category =>
          connectors.opencti.searchIndicators({
            pattern: category,
            pattern_type: 'attack-pattern'
          }).catch(err => console.error('OpenCTI enrichment failed:', err.message))
        );
        integrationPromises.push(...tiPromises);
      }

      await Promise.allSettled(integrationPromises);
      console.log('SecurityDashboard security stack integration completed');

    } catch (error) {
      console.error('SecurityDashboard integration error:', error);
    }
  }
}

module.exports = new ScoreService();
