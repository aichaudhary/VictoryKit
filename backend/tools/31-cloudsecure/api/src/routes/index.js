const express = require('express');
const router = express.Router();

// Controllers
const scanController = require('../controllers/scan.controller');
const findingsController = require('../controllers/findings.controller');
const resourcesController = require('../controllers/resources.controller');
const complianceController = require('../controllers/compliance.controller');
const attackPathController = require('../controllers/attackpath.controller');
const dashboardController = require('../controllers/dashboard.controller');

// ============================================
// DASHBOARD ROUTES
// ============================================
router.get('/dashboard', dashboardController.getDashboard);
router.get('/dashboard/posture', dashboardController.getSecurityPosture);
router.get('/dashboard/stats', dashboardController.getQuickStats);

// ============================================
// SCAN ROUTES
// ============================================
router.post('/scans', scanController.startScan);
router.get('/scans', scanController.getScans);
router.get('/scans/:scanId', scanController.getScanStatus);
router.get('/scans/:scanId/results', scanController.getScanResults);
router.delete('/scans/:scanId', scanController.cancelScan);

// ============================================
// FINDINGS ROUTES
// ============================================
router.get('/findings', findingsController.getFindings);
router.get('/findings/stats', findingsController.getFindingStats);
router.get('/findings/:findingId', findingsController.getFindingById);
router.patch('/findings/:findingId/status', findingsController.updateFindingStatus);
router.patch('/findings/bulk', findingsController.bulkUpdateFindings);
router.get('/findings/:findingId/remediation', findingsController.getRemediationCode);

// ============================================
// RESOURCES ROUTES
// ============================================
router.get('/resources', resourcesController.getResources);
router.get('/resources/inventory', resourcesController.getInventorySummary);
router.get('/resources/types', resourcesController.getResourceTypes);
router.get('/resources/:resourceId', resourcesController.getResourceById);
router.get('/resources/:resourceId/drift', resourcesController.detectDrift);

// ============================================
// COMPLIANCE ROUTES
// ============================================
router.get('/compliance', complianceController.getComplianceOverview);
router.get('/compliance/:framework', complianceController.getComplianceReport);
router.post('/compliance/report', complianceController.generateReport);
router.get('/compliance/:framework/history', complianceController.getComplianceHistory);
router.get('/compliance/export/:reportId', complianceController.exportReport);

// ============================================
// ATTACK PATH ROUTES
// ============================================
router.get('/attack-paths', attackPathController.getAttackPaths);
router.get('/attack-paths/:pathId', attackPathController.getAttackPathById);
router.patch('/attack-paths/:pathId/status', attackPathController.updateAttackPathStatus);
router.get('/attack-paths/:pathId/blast-radius', attackPathController.getBlastRadius);
router.get('/attack-paths/:pathId/mitre', attackPathController.getMitreMapping);
router.get('/attack-paths/:pathId/remediation', attackPathController.getRemediationPlan);

module.exports = router;
