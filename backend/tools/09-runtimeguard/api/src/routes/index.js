const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf', 'image/png', 'image/jpeg', 'image/gif',
      'application/json', 'text/plain', 'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Legacy controllers
const frameworkController = require('../controllers/frameworkController');
const auditController = require('../controllers/auditController');
const controlController = require('../controllers/controlController');

// Enhanced controllers
const assessmentController = require('../controllers/assessment.controller');

// ============= Enhanced Assessment Routes =============

// Assessment CRUD and workflow
router.get('/assessments', (req, res) => assessmentController.listAssessments(req, res));
router.post('/assessments', (req, res) => assessmentController.createAssessment(req, res));
router.get('/assessments/:assessmentId', (req, res) => assessmentController.getAssessment(req, res));
router.post('/assessments/:assessmentId/start', (req, res) => assessmentController.startAssessment(req, res));
router.post('/assessments/:assessmentId/run-tests', (req, res) => assessmentController.runAutomatedTests(req, res));
router.put('/assessments/:assessmentId/controls/:controlId', (req, res) => assessmentController.updateControlStatus(req, res));
router.post('/assessments/:assessmentId/analyze-gaps', (req, res) => assessmentController.analyzeGaps(req, res));
router.get('/assessments/:assessmentId/report', (req, res) => assessmentController.generateReport(req, res));

// ============= Enhanced Framework Routes =============

// Framework management (using enhanced controller)
router.get('/v2/frameworks', (req, res) => assessmentController.listFrameworks(req, res));
router.get('/v2/frameworks/mappings', (req, res) => assessmentController.getCrossFrameworkMappings(req, res));
router.get('/v2/frameworks/:frameworkId', (req, res) => assessmentController.getFrameworkDetails(req, res));
router.get('/v2/frameworks/:frameworkId/controls', (req, res) => assessmentController.getFrameworkControls(req, res));
router.post('/v2/frameworks/recommendations', (req, res) => assessmentController.getFrameworkRecommendations(req, res));

// ============= Evidence Routes =============

// Evidence management
router.get('/evidence', (req, res) => assessmentController.listEvidence(req, res));
router.post('/evidence', upload.single('file'), (req, res) => assessmentController.uploadEvidence(req, res));
router.get('/evidence/expiring', (req, res) => assessmentController.getExpiringEvidence(req, res));
router.get('/evidence/:evidenceId', (req, res) => assessmentController.getEvidence(req, res));
router.get('/evidence/:evidenceId/download', (req, res) => assessmentController.downloadEvidence(req, res));
router.post('/evidence/:evidenceId/validate', (req, res) => assessmentController.validateEvidence(req, res));
router.delete('/evidence/:evidenceId', (req, res) => assessmentController.deleteEvidence(req, res));

// Automated evidence collection
router.post('/evidence/collect/vanta', (req, res) => assessmentController.collectFromVanta(req, res));
router.post('/evidence/collect/drata', (req, res) => assessmentController.collectFromDrata(req, res));

// ============= Quick Status =============

router.get('/quick/compliance-status', (req, res) => assessmentController.getComplianceStatus(req, res));

// ============= Legacy Framework Routes =============

router.get('/frameworks', frameworkController.list);
router.get('/frameworks/:name', frameworkController.get);
router.get('/frameworks/:name/controls', frameworkController.getControls);
router.post('/frameworks/compare', frameworkController.compare);

// ============= Legacy Audit Routes =============

router.post('/audits', auditController.create);
router.get('/audits', auditController.list);
router.get('/audits/:id', auditController.get);
router.put('/audits/:id', auditController.update);
router.delete('/audits/:id', auditController.delete);
router.post('/audits/:id/assess', auditController.assess);
router.get('/audits/:id/report', auditController.report);

// ============= Legacy Control Routes =============

router.get('/controls', controlController.list);
router.get('/controls/:id', controlController.get);
router.put('/controls/:id', controlController.update);
router.post('/controls/:id/assess', controlController.assess);
router.post('/controls/:id/evidence', controlController.addEvidence);
router.post('/controls/bulk-update', controlController.bulkUpdate);

module.exports = router;
