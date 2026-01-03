/**
 * SecurityScore API Routes - Enhanced v2.0
 * Comprehensive security scoring with AI, compliance, and real-time features
 */

const express = require('express');
const router = express.Router();

// Controllers
const scoreController = require('../controllers/scoreController');
const metricController = require('../controllers/metricController');
const benchmarkController = require('../controllers/benchmarkController');
const improvementController = require('../controllers/improvementController');

// Services
const aiScoringService = require('../services/aiScoringService');
const externalRatingsService = require('../services/externalRatingsService');
const vulnerabilityService = require('../services/vulnerabilityService');
const advancedReportingService = require('../services/advancedReportingService');
const complianceMappingService = require('../services/complianceMappingService');
const predictiveAnalyticsService = require('../services/predictiveAnalyticsService');

// ======================
// Score Routes (CRUD)
// ======================
router.post('/scores', scoreController.create);
router.get('/scores', scoreController.getAll);
router.get('/scores/:id', scoreController.getById);
router.put('/scores/:id', scoreController.update);
router.delete('/scores/:id', scoreController.delete);
router.post('/scores/:id/calculate', scoreController.calculate);
router.get('/scores/:id/breakdown', scoreController.getBreakdown);
router.get('/scores/:id/trend', scoreController.getTrend);
router.get('/dashboard', scoreController.getDashboard);

// ======================
// Metric Routes
// ======================
router.post('/metrics', metricController.create);
router.get('/metrics', metricController.getAll);
router.get('/metrics/:id', metricController.getById);
router.put('/metrics/:id', metricController.update);
router.delete('/metrics/:id', metricController.delete);
router.post('/metrics/:id/collect', metricController.collectData);

// ======================
// Benchmark Routes
// ======================
router.post('/benchmarks', benchmarkController.create);
router.get('/benchmarks', benchmarkController.getAll);
router.get('/benchmarks/:id', benchmarkController.getById);
router.put('/benchmarks/:id', benchmarkController.update);
router.delete('/benchmarks/:id', benchmarkController.delete);
router.post('/benchmarks/:id/compare', benchmarkController.compare);

// ======================
// Improvement Routes
// ======================
router.post('/improvements', improvementController.create);
router.get('/improvements', improvementController.getAll);
router.get('/improvements/:id', improvementController.getById);
router.put('/improvements/:id', improvementController.update);
router.delete('/improvements/:id', improvementController.delete);
router.post('/improvements/:id/implement', improvementController.implement);
router.get('/improvements/recommendations', improvementController.getRecommendations);

// ======================
// AI Scoring Routes
// ======================
router.post('/ai/analyze', async (req, res, next) => {
  try {
    const { securityData, options } = req.body;
    const analysis = await aiScoringService.analyzeSecurityPosture(securityData, options);
    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
});

router.post('/ai/recommendations', async (req, res, next) => {
  try {
    const { securityScore, context } = req.body;
    const recommendations = await aiScoringService.generateImprovementPlan(securityScore, context);
    res.json({ success: true, data: recommendations });
  } catch (error) {
    next(error);
  }
});

router.post('/ai/predict', async (req, res, next) => {
  try {
    const { historicalData, periods } = req.body;
    const prediction = await aiScoringService.predictScoreTrend(historicalData, periods);
    res.json({ success: true, data: prediction });
  } catch (error) {
    next(error);
  }
});

router.post('/ai/compare', async (req, res, next) => {
  try {
    const { score, industry } = req.body;
    const comparison = await aiScoringService.compareToIndustry(score, industry);
    res.json({ success: true, data: comparison });
  } catch (error) {
    next(error);
  }
});

router.post('/ai/anomalies', async (req, res, next) => {
  try {
    const { metrics } = req.body;
    const anomalies = await aiScoringService.detectAnomalies(metrics);
    res.json({ success: true, data: anomalies });
  } catch (error) {
    next(error);
  }
});

router.post('/ai/vendor-risk', async (req, res, next) => {
  try {
    const { vendors } = req.body;
    const assessment = await aiScoringService.assessVendorRisk(vendors);
    res.json({ success: true, data: assessment });
  } catch (error) {
    next(error);
  }
});

// ======================
// External Ratings Routes
// ======================
router.get('/external/ratings/:organizationId', async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    const { platforms } = req.query;
    const platformList = platforms ? platforms.split(',') : undefined;
    const ratings = await externalRatingsService.getAggregatedRatings(organizationId, platformList);
    res.json({ success: true, data: ratings });
  } catch (error) {
    next(error);
  }
});

router.get('/external/benchmarks', async (req, res, next) => {
  try {
    const { industry, size } = req.query;
    const benchmarks = await externalRatingsService.getIndustryBenchmarks(industry, size);
    res.json({ success: true, data: benchmarks });
  } catch (error) {
    next(error);
  }
});

router.get('/external/peers/:organizationId', async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    const comparison = await externalRatingsService.getPeerComparison(organizationId);
    res.json({ success: true, data: comparison });
  } catch (error) {
    next(error);
  }
});

router.get('/external/history/:organizationId', async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    const { months } = req.query;
    const history = await externalRatingsService.getRatingHistory(organizationId, parseInt(months) || 12);
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
});

// ======================
// Vulnerability Routes
// ======================
router.get('/vulnerabilities/:organizationId', async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    const summary = await vulnerabilityService.getVulnerabilitySummary(organizationId);
    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
});

router.get('/vulnerabilities/:organizationId/trend', async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    const { days } = req.query;
    const trend = await vulnerabilityService.getVulnerabilityTrend(organizationId, parseInt(days) || 90);
    res.json({ success: true, data: trend });
  } catch (error) {
    next(error);
  }
});

router.get('/vulnerabilities/:organizationId/assets', async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    const assets = await vulnerabilityService.getAffectedAssets(organizationId);
    res.json({ success: true, data: assets });
  } catch (error) {
    next(error);
  }
});

router.get('/vulnerabilities/:organizationId/score', async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    const score = await vulnerabilityService.calculateVulnerabilityScore(organizationId);
    res.json({ success: true, data: score });
  } catch (error) {
    next(error);
  }
});

// ======================
// Compliance Routes
// ======================
router.get('/compliance/frameworks', async (req, res, next) => {
  try {
    const frameworks = await complianceMappingService.getAvailableFrameworks();
    res.json({ success: true, data: frameworks });
  } catch (error) {
    next(error);
  }
});

router.post('/compliance/status', async (req, res, next) => {
  try {
    const { securityScore, frameworks } = req.body;
    const status = await complianceMappingService.getComplianceStatus(securityScore, frameworks);
    res.json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
});

router.post('/compliance/gaps/:frameworkId', async (req, res, next) => {
  try {
    const { frameworkId } = req.params;
    const { securityScore } = req.body;
    const gaps = await complianceMappingService.getFrameworkGaps(securityScore, frameworkId);
    res.json({ success: true, data: gaps });
  } catch (error) {
    next(error);
  }
});

router.get('/compliance/mapping', async (req, res, next) => {
  try {
    const { source, target } = req.query;
    const mapping = await complianceMappingService.getCrossFrameworkMapping(source, target);
    res.json({ success: true, data: mapping });
  } catch (error) {
    next(error);
  }
});

// ======================
// Predictive Analytics Routes
// ======================
router.post('/predictive/forecast', async (req, res, next) => {
  try {
    const { organizationId, historicalScores, periods } = req.body;
    const forecast = await predictiveAnalyticsService.predictFutureScores(
      organizationId, 
      historicalScores, 
      periods || 6
    );
    res.json({ success: true, data: forecast });
  } catch (error) {
    next(error);
  }
});

router.post('/predictive/risks', async (req, res, next) => {
  try {
    const { organizationId, currentScores } = req.body;
    const risks = await predictiveAnalyticsService.predictCategoryRisks(organizationId, currentScores);
    res.json({ success: true, data: risks });
  } catch (error) {
    next(error);
  }
});

router.post('/predictive/anomalies', async (req, res, next) => {
  try {
    const { organizationId, historicalScores } = req.body;
    const anomalies = await predictiveAnalyticsService.analyzeAnomalies(organizationId, historicalScores);
    res.json({ success: true, data: anomalies });
  } catch (error) {
    next(error);
  }
});

router.post('/predictive/scenarios', async (req, res, next) => {
  try {
    const { organizationId, currentScore } = req.body;
    const scenarios = await predictiveAnalyticsService.generateRiskScenarios(organizationId, currentScore);
    res.json({ success: true, data: scenarios });
  } catch (error) {
    next(error);
  }
});

// ======================
// Reporting Routes
// ======================
router.get('/reports/templates', async (req, res, next) => {
  try {
    const templates = await advancedReportingService.getAvailableTemplates();
    res.json({ success: true, data: templates });
  } catch (error) {
    next(error);
  }
});

router.post('/reports/generate', async (req, res, next) => {
  try {
    const { type, data, options } = req.body;
    const report = await advancedReportingService.generateReport(type, data, options);
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
});

router.get('/reports/:reportId', async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const report = await advancedReportingService.getReport(reportId);
    
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }
    
    res.download(report.path, report.filename);
  } catch (error) {
    next(error);
  }
});

router.delete('/reports/:reportId', async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const deleted = await advancedReportingService.deleteReport(reportId);
    res.json({ success: deleted, message: deleted ? 'Report deleted' : 'Report not found' });
  } catch (error) {
    next(error);
  }
});

router.post('/reports/schedule', async (req, res, next) => {
  try {
    const { schedule, type, options } = req.body;
    const scheduleId = await advancedReportingService.scheduleReport(schedule, type, options);
    res.json({ success: true, data: { scheduleId } });
  } catch (error) {
    next(error);
  }
});

// ======================
// Combined Analysis Routes
// ======================
router.post('/analyze/comprehensive', async (req, res, next) => {
  try {
    const { organizationId, securityScore, options } = req.body;
    
    const [
      aiAnalysis,
      complianceStatus,
      vulnerabilities,
      predictions
    ] = await Promise.all([
      aiScoringService.analyzeSecurityPosture(securityScore, options),
      complianceMappingService.getComplianceStatus(securityScore),
      vulnerabilityService.getVulnerabilitySummary(organizationId),
      predictiveAnalyticsService.predictFutureScores(organizationId, [], 3)
    ]);
    
    res.json({
      success: true,
      data: {
        organizationId,
        currentScore: securityScore,
        aiAnalysis,
        complianceStatus,
        vulnerabilities,
        predictions,
        analyzedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/analyze/quick', async (req, res, next) => {
  try {
    const { securityScore, industry } = req.body;
    
    const [analysis, comparison] = await Promise.all([
      aiScoringService.analyzeSecurityPosture(securityScore),
      aiScoringService.compareToIndustry(securityScore, industry)
    ]);
    
    res.json({
      success: true,
      data: {
        analysis: analysis.overview,
        recommendations: analysis.recommendations?.slice(0, 3),
        industryComparison: comparison,
        analyzedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// ======================
// Bulk Operations Routes
// ======================
router.post('/bulk/scores', async (req, res, next) => {
  try {
    const { scores } = req.body;
    const results = await Promise.all(
      scores.map(score => scoreController.createScore(score))
    );
    res.json({ success: true, data: results, count: results.length });
  } catch (error) {
    next(error);
  }
});

router.post('/bulk/analyze', async (req, res, next) => {
  try {
    const { organizations } = req.body;
    const results = await Promise.all(
      organizations.map(org => 
        aiScoringService.analyzeSecurityPosture(org.securityScore, org.options)
      )
    );
    res.json({ success: true, data: results, count: results.length });
  } catch (error) {
    next(error);
  }
});

// ======================
// Export Routes
// ======================
router.post('/export/scores', async (req, res, next) => {
  try {
    const { format, filters } = req.body;
    
    // Get scores based on filters (simplified - would use actual query in production)
    const data = {
      scores: [],
      exportedAt: new Date().toISOString(),
      format
    };
    
    const report = await advancedReportingService.generateReport('trend_analysis', data, { format });
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
