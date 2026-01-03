const express = require("express");
const router = express.Router();

const assessmentController = require("../controllers/assessmentController");
const riskController = require("../controllers/riskController");
const controlController = require("../controllers/controlController");
const registerController = require("../controllers/registerController");

// Enhanced Services
const aiRiskAnalysisService = require("../services/aiRiskAnalysisService");
const riskIntelligenceService = require("../services/riskIntelligenceService");
const complianceMappingService = require("../services/complianceMappingService");
const realTimeCollaborationService = require("../services/realTimeCollaborationService");
const advancedReportingService = require("../services/advancedReportingService");
const predictiveAnalyticsService = require("../services/predictiveAnalyticsService");

// Assessment routes
router.post("/assessments", assessmentController.create);
router.get("/assessments", assessmentController.getAll);
router.get("/assessments/:id", assessmentController.getById);
router.put("/assessments/:id", assessmentController.update);
router.delete("/assessments/:id", assessmentController.delete);
router.post("/assessments/:id/calculate", assessmentController.calculateRisk);
router.post("/assessments/:id/analyze", assessmentController.analyze);
router.get("/assessments/:id/report", assessmentController.generateReport);
router.get("/dashboard", assessmentController.getDashboard);

// Risk routes
router.post("/risks", riskController.create);
router.get("/risks", riskController.getAll);
router.get("/risks/:id", riskController.getById);
router.put("/risks/:id", riskController.update);
router.delete("/risks/:id", riskController.delete);
router.post("/risks/:id/evaluate", riskController.evaluate);
router.post("/risks/:id/treat", riskController.treat);

// Control routes
router.post("/controls", controlController.create);
router.get("/controls", controlController.getAll);
router.get("/controls/:id", controlController.getById);
router.put("/controls/:id", controlController.update);
router.delete("/controls/:id", controlController.delete);
router.post("/controls/:id/test", controlController.testEffectiveness);

// Risk Register routes
router.post("/registers", registerController.create);
router.get("/registers", registerController.getAll);
router.get("/registers/:id", registerController.getById);
router.put("/registers/:id", registerController.update);
router.delete("/registers/:id", registerController.delete);
router.get("/registers/:id/risks", registerController.getRisks);
router.post("/registers/:id/export", registerController.export);

// AI Risk Analysis routes
router.post("/ai/analyze", async (req, res) => {
  try {
    const result = await aiRiskAnalysisService.analyzeRisk(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/ai/analyze/batch", async (req, res) => {
  try {
    const result = await aiRiskAnalysisService.analyzeRiskBatch(req.body.risks);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/ai/models", async (req, res) => {
  try {
    const models = await aiRiskAnalysisService.getAvailableModels();
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/ai/train", async (req, res) => {
  try {
    const result = await aiRiskAnalysisService.trainModel(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Risk Intelligence routes
router.get("/intelligence/feeds", async (req, res) => {
  try {
    const feeds = await riskIntelligenceService.getThreatFeeds();
    res.json(feeds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/intelligence/search", async (req, res) => {
  try {
    const results = await riskIntelligenceService.searchIntelligence(req.body);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/intelligence/cves", async (req, res) => {
  try {
    const cves = await riskIntelligenceService.getCVEs(req.query);
    res.json(cves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/intelligence/threat-actors", async (req, res) => {
  try {
    const actors = await riskIntelligenceService.getThreatActors(req.query);
    res.json(actors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/intelligence/update", async (req, res) => {
  try {
    const result = await riskIntelligenceService.updateThreatIntelligence();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Compliance Mapping routes
router.get("/compliance/frameworks", async (req, res) => {
  try {
    const frameworks = await complianceMappingService.getComplianceFrameworks();
    res.json(frameworks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/compliance/map", async (req, res) => {
  try {
    const mapping = await complianceMappingService.mapRiskToCompliance(req.body);
    res.json(mapping);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/compliance/assessment/:riskId", async (req, res) => {
  try {
    const assessment = await complianceMappingService.assessCompliance(req.params.riskId);
    res.json(assessment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/compliance/gap-analysis", async (req, res) => {
  try {
    const analysis = await complianceMappingService.performGapAnalysis(req.body);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/compliance/reports", async (req, res) => {
  try {
    const reports = await complianceMappingService.generateComplianceReports(req.query);
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Real-time Collaboration routes
router.post("/collaboration/session", async (req, res) => {
  try {
    const session = await realTimeCollaborationService.createSession(req.body);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/collaboration/sessions", async (req, res) => {
  try {
    const sessions = await realTimeCollaborationService.getActiveSessions();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/collaboration/session/:sessionId/join", async (req, res) => {
  try {
    const result = await realTimeCollaborationService.joinSession(req.params.sessionId, req.body.userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/collaboration/session/:sessionId/leave", async (req, res) => {
  try {
    const result = await realTimeCollaborationService.leaveSession(req.params.sessionId, req.body.userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/collaboration/session/:sessionId/users", async (req, res) => {
  try {
    const users = await realTimeCollaborationService.getSessionUsers(req.params.sessionId);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Advanced Reporting routes
router.get("/reports/templates", async (req, res) => {
  try {
    const templates = await advancedReportingService.getTemplates(req.query.type);
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/reports/generate", async (req, res) => {
  try {
    const report = await advancedReportingService.generateReport(
      req.body.templateId,
      req.body.parameters,
      req.body.format,
      req.body.userId
    );
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/reports/generated", async (req, res) => {
  try {
    const reports = await advancedReportingService.getGeneratedReports(req.query.userId);
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/reports/:reportId/download", async (req, res) => {
  try {
    const report = await advancedReportingService.getGeneratedReports(null, 1)
      .then(reports => reports.find(r => r._id.toString() === req.params.reportId));

    if (!report || !report.filePath) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.download(report.filePath, report.title + "." + report.format);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Predictive Analytics routes
router.get("/analytics/models", async (req, res) => {
  try {
    const models = await predictiveAnalyticsService.getModels(req.query.type);
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/analytics/predict/trends", async (req, res) => {
  try {
    const predictions = await predictiveAnalyticsService.predictRiskTrends(req.body);
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/analytics/predict/severity", async (req, res) => {
  try {
    const prediction = await predictiveAnalyticsService.predictRiskSeverity(req.body);
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/analytics/predict/impact", async (req, res) => {
  try {
    const prediction = await predictiveAnalyticsService.predictRiskImpact(req.body);
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/analytics/scenario", async (req, res) => {
  try {
    const analysis = await predictiveAnalyticsService.performScenarioAnalysis(req.body);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/analytics/scenarios", async (req, res) => {
  try {
    const analyses = await predictiveAnalyticsService.getScenarioAnalyses(req.query.status);
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/analytics/history", async (req, res) => {
  try {
    const history = await predictiveAnalyticsService.getPredictionHistory(req.query.modelId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/analytics/train/:modelId", async (req, res) => {
  try {
    const result = await predictiveAnalyticsService.trainModel(req.params.modelId, req.body.trainingData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check routes
router.get("/health/ai", async (req, res) => {
  try {
    const health = aiRiskAnalysisService.getHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/health/intelligence", async (req, res) => {
  try {
    const health = riskIntelligenceService.getHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/health/compliance", async (req, res) => {
  try {
    const health = complianceMappingService.getHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/health/collaboration", async (req, res) => {
  try {
    const health = realTimeCollaborationService.getHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/health/reporting", async (req, res) => {
  try {
    const health = advancedReportingService.getHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/health/analytics", async (req, res) => {
  try {
    const health = predictiveAnalyticsService.getHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// General health check
router.get("/health", async (req, res) => {
  try {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "RiskAssess API v2.0",
      version: "2.0.0",
      environment: process.env.NODE_ENV || "development",
      services: {
        ai: await aiRiskAnalysisService.getHealth(),
        intelligence: await riskIntelligenceService.getHealth(),
        compliance: await complianceMappingService.getHealth(),
        collaboration: await realTimeCollaborationService.getHealth(),
        reporting: await advancedReportingService.getHealth(),
        analytics: await predictiveAnalyticsService.getHealth()
      },
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
