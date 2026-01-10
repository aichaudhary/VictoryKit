const express = require('express');
const router = express.Router();
const controller = require('../controllers');

// Health & Status
router.get('/status', controller.getStatus);
router.get('/health', controller.getHealth);
router.get('/dashboard', controller.getDashboard);

// Backups
router.get('/backups', controller.getBackups);
router.get('/backups/:id', controller.getBackupById);
router.post('/backups', controller.createBackup);
router.put('/backups/:id', controller.updateBackup);
router.delete('/backups/:id', controller.deleteBackup);
router.post('/backups/:id/start', controller.startBackup);
router.post('/backups/:id/cancel', controller.cancelBackup);
router.get('/backups/:id/progress', controller.getBackupProgress);

// Restores
router.post('/backups/:id/restore', controller.initiateRestore);
router.get('/restores', controller.getRestores);
router.get('/restores/:id', controller.getRestoreById);
router.post('/restores/:id/cancel', controller.cancelRestore);

// Storage Locations
router.get('/storage', controller.getStorageLocations);
router.get('/storage/:id', controller.getStorageLocationById);
router.post('/storage', controller.createStorageLocation);
router.put('/storage/:id', controller.updateStorageLocation);
router.delete('/storage/:id', controller.deleteStorageLocation);
router.post('/storage/:id/test', controller.testStorageConnection);
router.get('/storage/:id/capacity', controller.getStorageCapacity);

// Integrity Checks
router.get('/integrity', controller.getIntegrityChecks);
router.get('/integrity/:id', controller.getIntegrityCheckById);
router.post('/integrity', controller.createIntegrityCheck);
router.post('/backups/:id/verify', controller.verifyBackup);

// Retention Policies
router.get('/policies', controller.getPolicies);
router.get('/policies/:id', controller.getPolicyById);
router.post('/policies', controller.createPolicy);
router.put('/policies/:id', controller.updatePolicy);
router.delete('/policies/:id', controller.deletePolicy);
router.post('/policies/:id/apply', controller.applyPolicy);

// Alerts
router.get('/alerts', controller.getAlerts);
router.get('/alerts/count', controller.getAlertsCount);
router.get('/alerts/:id', controller.getAlertById);
router.post('/alerts/:id/acknowledge', controller.acknowledgeAlert);
router.post('/alerts/:id/resolve', controller.resolveAlert);
router.post('/alerts/:id/dismiss', controller.dismissAlert);

// Access Logs / Audit
router.get('/logs', controller.getAccessLogs);
router.get('/logs/activity', controller.getActivitySummary);
router.get('/logs/suspicious', controller.getSuspiciousActivity);

// Reports
router.get('/reports', controller.getReports);
router.get('/reports/:id', controller.getReportById);
router.post('/reports/generate', controller.generateReport);

// Config
router.get('/config', controller.getConfig);
router.put('/config', controller.updateConfig);

// AI Analysis
router.post('/analyze', controller.analyze);
router.post('/scan', controller.scan);

module.exports = router;
