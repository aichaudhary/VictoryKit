const express = require('express');
const { body, query, param } = require('express-validator');
const { validate, authenticate } = require('../../../../../shared');
const sampleController = require('../controllers/sample.controller');
const analysisController = require('../controllers/analysis.controller');
const reportController = require('../controllers/report.controller');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Sample routes
router.post('/samples/upload',
  validate([
    body('fileName').isString().notEmpty(),
    body('fileSize').isInt({ min: 1 }),
    body('fileType').isString().notEmpty(),
    body('mimeType').isString().notEmpty(),
    body('fileData').isString().notEmpty()
  ]),
  sampleController.uploadSample
);

router.get('/samples',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('malwareType').optional().isString(),
    query('severity').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    query('isMalicious').optional().isBoolean()
  ]),
  sampleController.getAllSamples
);

router.get('/samples/:id',
  validate([param('id').isMongoId()]),
  sampleController.getSampleById
);

router.delete('/samples/:id',
  validate([param('id').isMongoId()]),
  sampleController.deleteSample
);

router.get('/samples/statistics',
  validate([
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ]),
  sampleController.getStatistics
);

router.post('/samples/scan-hash',
  validate([body('hash').isString().notEmpty()]),
  sampleController.scanHash
);

// Analysis routes
router.post('/analyses',
  validate([
    body('analysisType').isIn(['static', 'dynamic', 'behavioral', 'comprehensive', 'quick_scan']),
    body('timeRange').optional().isObject(),
    body('timeRange.start').optional().isISO8601(),
    body('timeRange.end').optional().isISO8601()
  ]),
  analysisController.createAnalysis
);

router.get('/analyses/:id',
  validate([param('id').isMongoId()]),
  analysisController.getAnalysisById
);

router.get('/analyses',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ]),
  analysisController.getAllAnalyses
);

router.delete('/analyses/:id',
  validate([param('id').isMongoId()]),
  analysisController.deleteAnalysis
);

// Report routes
router.post('/reports/generate',
  validate([
    body('reportType').isIn(['daily', 'weekly', 'monthly', 'incident', 'forensic', 'executive']),
    body('title').optional().isString(),
    body('timeRange').optional().isObject(),
    body('timeRange.start').optional().isISO8601(),
    body('timeRange.end').optional().isISO8601(),
    body('format').optional().isIn(['pdf', 'html', 'json'])
  ]),
  reportController.generateReport
);

router.get('/reports/:id',
  validate([param('id').isMongoId()]),
  reportController.getReportById
);

router.get('/reports',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ]),
  reportController.getAllReports
);

router.get('/reports/:id/export',
  validate([param('id').isMongoId()]),
  reportController.exportReport
);

router.delete('/reports/:id',
  validate([param('id').isMongoId()]),
  reportController.deleteReport
);

// ============================================
// THREAT INTELLIGENCE ROUTES
// ============================================

const threatIntelController = require('../controllers/threatIntel.controller');

// API Status
router.get('/threat-intel/status', threatIntelController.getApiStatus);

// Comprehensive lookup (all services)
router.get('/threat-intel/lookup/:hash', threatIntelController.comprehensiveLookup);

// VirusTotal
router.get('/threat-intel/virustotal/:hash', threatIntelController.virusTotalLookup);
router.post('/threat-intel/virustotal/upload',
  validate([
    body('fileData').isString().notEmpty(),
    body('fileName').isString().notEmpty()
  ]),
  threatIntelController.virusTotalUpload
);
router.get('/threat-intel/virustotal/analysis/:analysisId', threatIntelController.virusTotalAnalysis);

// Hybrid Analysis
router.get('/threat-intel/hybrid-analysis/:hash', threatIntelController.hybridAnalysisLookup);
router.post('/threat-intel/hybrid-analysis/submit',
  validate([
    body('fileData').isString().notEmpty(),
    body('fileName').isString().notEmpty(),
    body('environmentId').optional().isInt()
  ]),
  threatIntelController.hybridAnalysisSubmit
);
router.get('/threat-intel/hybrid-analysis/report/:sha256', threatIntelController.hybridAnalysisReport);

// MalwareBazaar
router.get('/threat-intel/malwarebazaar/:hash', threatIntelController.malwareBazaarLookup);
router.get('/threat-intel/malwarebazaar/recent', threatIntelController.malwareBazaarRecent);

// ANY.RUN
router.post('/threat-intel/anyrun/submit',
  validate([
    body('fileUrl').isURL(),
    body('fileName').isString().notEmpty()
  ]),
  threatIntelController.anyRunSubmit
);
router.get('/threat-intel/anyrun/report/:taskId', threatIntelController.anyRunReport);

// Intezer
router.get('/threat-intel/intezer/:sha256', threatIntelController.intezerAnalyze);

// Joe Sandbox
router.post('/threat-intel/joesandbox/submit',
  validate([
    body('fileData').isString().notEmpty(),
    body('fileName').isString().notEmpty()
  ]),
  threatIntelController.joeSandboxSubmit
);
router.get('/threat-intel/joesandbox/report/:webId', threatIntelController.joeSandboxReport);

// ============================================
// YARA SCANNING ROUTES
// ============================================

router.post('/yara/scan',
  validate([
    body('data').notEmpty(),
    body('dataType').optional().isIn(['text', 'base64', 'strings'])
  ]),
  threatIntelController.yaraScan
);
router.get('/yara/rules', threatIntelController.yaraGetRules);
router.post('/yara/rules',
  validate([
    body('name').isString().notEmpty(),
    body('strings').isArray({ min: 1 }),
    body('category').optional().isString(),
    body('severity').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  ]),
  threatIntelController.yaraAddRule
);
router.get('/yara/stats', threatIntelController.yaraStats);

// ============================================
// MITRE ATT&CK ROUTES
// ============================================

router.get('/mitre/tactics', threatIntelController.mitreGetTactics);
router.get('/mitre/techniques', threatIntelController.mitreGetTechniques);
router.get('/mitre/techniques/:techniqueId', threatIntelController.mitreGetTechnique);
router.get('/mitre/search', 
  validate([query('q').isString().isLength({ min: 2 })]),
  threatIntelController.mitreSearch
);
router.post('/mitre/map-behaviors',
  validate([body('behaviors').isArray({ min: 1 })]),
  threatIntelController.mitreMapBehaviors
);
router.post('/mitre/report',
  validate([body('techniqueIds').isArray({ min: 1 })]),
  threatIntelController.mitreGenerateReport
);

module.exports = router;
