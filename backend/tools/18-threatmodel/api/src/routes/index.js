const express = require("express");
const router = express.Router();

const threatModelController = require("../controllers/threatModelController");
const threatController = require("../controllers/threatController");
const mitigationController = require("../controllers/mitigationController");
const componentController = require("../controllers/componentController");
const aiAnalysisService = require("../services/aiAnalysisService");
const threatIntelService = require("../services/threatIntelService");
const reportService = require("../services/reportService");

// ============ Threat Model routes ============
router.post("/threat-models", threatModelController.create);
router.get("/threat-models", threatModelController.getAll);
router.get("/threat-models/:id", threatModelController.getById);
router.put("/threat-models/:id", threatModelController.update);
router.delete("/threat-models/:id", threatModelController.delete);
router.post("/threat-models/:id/analyze", threatModelController.analyze);
router.post("/threat-models/:id/stride", threatModelController.analyzeSTRIDE);
router.post("/threat-models/:id/pasta", threatModelController.analyzePASTA);
router.get("/threat-models/:id/report", threatModelController.generateReport);
router.get("/dashboard", threatModelController.getDashboard);

// ============ Threat routes ============
router.post("/threats", threatController.create);
router.get("/threats", threatController.getAll);
router.get("/threats/:id", threatController.getById);
router.put("/threats/:id", threatController.update);
router.delete("/threats/:id", threatController.delete);
router.post("/threats/:id/assess", threatController.assessRisk);

// ============ Mitigation routes ============
router.post("/mitigations", mitigationController.create);
router.get("/mitigations", mitigationController.getAll);
router.get("/mitigations/:id", mitigationController.getById);
router.put("/mitigations/:id", mitigationController.update);
router.delete("/mitigations/:id", mitigationController.delete);
router.post("/mitigations/:id/apply", mitigationController.apply);

// ============ Component routes ============
router.post("/components", componentController.create);
router.get("/components", componentController.getAll);
router.get("/components/:id", componentController.getById);
router.put("/components/:id", componentController.update);
router.delete("/components/:id", componentController.delete);
router.get("/components/:id/threats", componentController.getThreats);

// ============ AI Analysis routes ============

// AI-powered threat model analysis
router.post("/ai/analyze", async (req, res, next) => {
  try {
    const { threatModel } = req.body;
    const analysis = await aiAnalysisService.analyzeThreatModel(threatModel);
    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
});

// Auto-detect threats from architecture description
router.post("/ai/auto-detect", async (req, res, next) => {
  try {
    const { description } = req.body;
    const threats = await aiAnalysisService.autoDetectThreats(description);
    res.json({ success: true, data: threats });
  } catch (error) {
    next(error);
  }
});

// AI-powered STRIDE analysis
router.post("/ai/stride", async (req, res, next) => {
  try {
    const { components, dataFlows } = req.body;
    const analysis = await aiAnalysisService.generateSTRIDEAnalysis(components, dataFlows);
    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
});

// AI-powered PASTA analysis
router.post("/ai/pasta", async (req, res, next) => {
  try {
    const { threatModel } = req.body;
    const analysis = await aiAnalysisService.generatePASTAAnalysis(threatModel);
    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
});

// Generate attack trees
router.post("/ai/attack-trees", async (req, res, next) => {
  try {
    const { threat, targetAsset } = req.body;
    const attackTree = await aiAnalysisService.generateAttackTrees(threat, targetAsset);
    res.json({ success: true, data: attackTree });
  } catch (error) {
    next(error);
  }
});

// Suggest mitigations for a threat
router.post("/ai/suggest-mitigations", async (req, res, next) => {
  try {
    const { threat, context } = req.body;
    const mitigations = await aiAnalysisService.suggestMitigations(threat, context);
    res.json({ success: true, data: mitigations });
  } catch (error) {
    next(error);
  }
});

// Calculate DREAD score with AI
router.post("/ai/dread-score", async (req, res, next) => {
  try {
    const { threat } = req.body;
    const score = await aiAnalysisService.calculateDREADScore(threat);
    res.json({ success: true, data: score });
  } catch (error) {
    next(error);
  }
});

// Map threats to compliance frameworks
router.post("/ai/compliance-mapping", async (req, res, next) => {
  try {
    const { threats, framework } = req.body;
    const mapping = await aiAnalysisService.mapToCompliance(threats, framework);
    res.json({ success: true, data: mapping });
  } catch (error) {
    next(error);
  }
});

// Generate executive summary
router.post("/ai/executive-summary", async (req, res, next) => {
  try {
    const { threatModel, analysis } = req.body;
    const summary = await aiAnalysisService.generateExecutiveSummary(threatModel, analysis);
    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
});

// ============ Threat Intelligence routes ============

// Search CVEs
router.get("/intel/cve/search", async (req, res, next) => {
  try {
    const { query, limit } = req.query;
    const results = await threatIntelService.searchCVEs(query, { limit: parseInt(limit) || 20 });
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
});

// Get CVE by ID
router.get("/intel/cve/:cveId", async (req, res, next) => {
  try {
    const result = await threatIntelService.getCVEById(req.params.cveId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Get MITRE ATT&CK techniques
router.get("/intel/mitre/techniques", async (req, res, next) => {
  try {
    const { category } = req.query;
    const results = await threatIntelService.getMITRETechniques(category);
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
});

// Map threat to MITRE ATT&CK
router.post("/intel/mitre/map", async (req, res, next) => {
  try {
    const { threat } = req.body;
    const mapping = await threatIntelService.mapThreatToMITRE(threat);
    res.json({ success: true, data: mapping });
  } catch (error) {
    next(error);
  }
});

// Analyze URL with VirusTotal
router.post("/intel/virustotal/url", async (req, res, next) => {
  try {
    const { url } = req.body;
    const analysis = await threatIntelService.analyzeURL(url);
    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
});

// Analyze domain with VirusTotal
router.post("/intel/virustotal/domain", async (req, res, next) => {
  try {
    const { domain } = req.body;
    const analysis = await threatIntelService.analyzeDomain(domain);
    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
});

// Search AlienVault OTX
router.get("/intel/otx/search", async (req, res, next) => {
  try {
    const { query, type } = req.query;
    const results = await threatIntelService.searchOTX(query, type);
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
});

// Get OTX indicators for IP
router.get("/intel/otx/ip/:ip", async (req, res, next) => {
  try {
    const results = await threatIntelService.getOTXIndicatorsForIP(req.params.ip);
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
});

// Search Shodan
router.get("/intel/shodan/search", async (req, res, next) => {
  try {
    const { query } = req.query;
    const results = await threatIntelService.searchShodan(query);
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
});

// Get Shodan host info
router.get("/intel/shodan/host/:ip", async (req, res, next) => {
  try {
    const results = await threatIntelService.getShodanHost(req.params.ip);
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
});

// Get OWASP Top 10
router.get("/intel/owasp/top10", async (req, res, next) => {
  try {
    const results = await threatIntelService.getOWASPTop10();
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
});

// Get comprehensive threat intelligence
router.post("/intel/comprehensive", async (req, res, next) => {
  try {
    const { indicators } = req.body;
    const results = await threatIntelService.getComprehensiveIntel(indicators);
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
});

// ============ Report routes ============

// Generate comprehensive report
router.post("/reports/generate", async (req, res, next) => {
  try {
    const { threatModel, options } = req.body;
    const report = await reportService.generateReport(threatModel, options);
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
});

// Generate report for threat model by ID
router.get("/reports/threat-model/:id", async (req, res, next) => {
  try {
    const ThreatModel = require("../models/ThreatModel");
    const threatModel = await ThreatModel.findById(req.params.id)
      .populate("components")
      .populate("threats")
      .populate("mitigations");

    if (!threatModel) {
      return res.status(404).json({ success: false, error: "Threat model not found" });
    }

    const format = req.query.format || "json";
    const report = await reportService.generateReport(threatModel.toObject(), { format });
    
    if (format === 'html') {
      res.setHeader('Content-Type', 'text/html');
      return res.send(report.content);
    }
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="threat-model-${req.params.id}.csv"`);
      return res.send(report.content);
    }
    
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
});

// Export report in specific format
router.post("/reports/export", async (req, res, next) => {
  try {
    const { threatModel, format, options } = req.body;
    const report = await reportService.generateReport(threatModel, { format, ...options });
    
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
