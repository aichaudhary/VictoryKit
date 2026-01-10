const express = require('express');
const router = express.Router();
const controller = require('../controllers');

// Status & Health
router.get('/status', controller.getStatus);
router.get('/dashboard', controller.getDashboard);

// Scanning
router.post('/scans', controller.startScan);
router.get('/scans', controller.getAllScans);
router.get('/scans/:scanId', controller.getScanStatus);

// Requirements
router.get('/requirements', controller.getRequirements);
router.get('/requirements/:id', controller.getRequirementById);
router.post('/requirements/analyze', controller.analyzeRequirement);

// Findings
router.get('/findings', controller.getFindings);
router.get('/findings/:id', controller.getFindingById);
router.put('/findings/:id', controller.updateFinding);

// Remediation
router.get('/remediations', controller.getRemediations);
router.post('/remediations/plan', controller.createRemediationPlan);
router.put('/remediations/:id', controller.updateRemediation);

// Assets
router.get('/assets', controller.getAssets);
router.post('/assets/detect-chd', controller.detectCardholderData);

// Reports
router.get('/reports', controller.getReports);
router.post('/reports/generate', controller.generateReport);
router.get('/reports/:id', controller.getReportById);

// Evidence
router.get('/evidence', controller.getEvidence);
router.post('/evidence', controller.uploadEvidence);

// Configuration
router.get('/config', controller.getConfig);
router.put('/config', controller.updateConfig);

module.exports = router;

