/**
 * VulnScan Routes
 * RESTful API Routes for Vulnerability Management Platform
 */

const express = require('express');
const router = express.Router();
const controllers = require('../controllers');

// ============================================================================
// SYSTEM & DASHBOARD ROUTES
// ============================================================================

router.get('/status', controllers.getStatus);
router.get('/dashboard', controllers.getDashboard);

// ============================================================================
// ASSET MANAGEMENT ROUTES
// ============================================================================

router.post('/assets', controllers.createAsset);
router.get('/assets', controllers.getAssets);
router.get('/assets/high-risk', controllers.getHighRiskAssets);
router.get('/assets/:id', controllers.getAssetById);
router.put('/assets/:id', controllers.updateAsset);
router.delete('/assets/:id', controllers.deleteAsset);
router.get('/assets/:id/vulnerabilities', controllers.getAssetVulnerabilities);

// ============================================================================
// VULNERABILITY MANAGEMENT ROUTES
// ============================================================================

router.post('/vulnerabilities', controllers.createVulnerability);
router.get('/vulnerabilities', controllers.getVulnerabilities);
router.get('/vulnerabilities/critical', controllers.getCriticalVulnerabilities);
router.get('/vulnerabilities/exploitable', controllers.getExploitableVulnerabilities);
router.get('/vulnerabilities/:id', controllers.getVulnerabilityById);
router.post('/vulnerabilities/:id/assign-remediation', controllers.assignRemediationToVulnerability);
router.post('/vulnerabilities/:id/patch', controllers.patchVulnerability);

// ============================================================================
// SCAN MANAGEMENT ROUTES
// ============================================================================

router.post('/scans', controllers.createScan);
router.get('/scans', controllers.getScans);
router.get('/scans/active', controllers.getActiveScans);
router.get('/scans/:id', controllers.getScanById);
router.post('/scans/:id/start', controllers.startScan);
router.post('/scans/:id/pause', controllers.pauseScan);
router.post('/scans/:id/resume', controllers.resumeScan);
router.post('/scans/:id/cancel', controllers.cancelScan);

// ============================================================================
// SCAN SCHEDULE ROUTES
// ============================================================================

router.post('/schedules', controllers.createSchedule);
router.get('/schedules', controllers.getSchedules);
router.post('/schedules/:id/execute', controllers.executeSchedule);

// ============================================================================
// PATCH MANAGEMENT ROUTES
// ============================================================================

router.post('/patches', controllers.createPatch);
router.get('/patches', controllers.getPatches);
router.get('/patches/critical', controllers.getCriticalPatches);
router.post('/patches/:id/deploy', controllers.deployPatch);
router.post('/patches/:id/test', controllers.testPatch);

// ============================================================================
// COMPLIANCE MANAGEMENT ROUTES
// ============================================================================

router.post('/compliance', controllers.createRuntimeGuard);
router.get('/compliance', controllers.getRuntimeGuards);
router.get('/compliance/:id', controllers.getRuntimeGuardById);
router.post('/compliance/:id/complete', controllers.completeRuntimeGuard);

// ============================================================================
// REMEDIATION MANAGEMENT ROUTES
// ============================================================================

router.post('/remediation', controllers.createRemediationPlan);
router.get('/remediation', controllers.getRemediationPlans);
router.post('/remediation/:id/approve', controllers.approveRemediationPlan);
router.post('/remediation/:id/complete', controllers.completeRemediationPlan);

// ============================================================================
// REPORTING ROUTES
// ============================================================================

router.post('/reports', controllers.generateReport);
router.get('/reports', controllers.getReports);
router.get('/reports/:id', controllers.getReportById);

module.exports = router;
