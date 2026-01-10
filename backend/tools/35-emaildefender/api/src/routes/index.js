const express = require('express');
const router = express.Router();
const emailGuardController = require('../controllers/emailGuardController');

// Email processing routes
router.post('/process', emailGuardController.processEmail);
router.post('/process/bulk', emailGuardController.processBulkEmails);

// Analysis routes
router.get('/analysis/:emailId', emailGuardController.getEmailAnalysis);

// Quarantine management routes
router.get('/quarantine', emailGuardController.getQuarantine);
router.put('/quarantine/:quarantineId', emailGuardController.releaseFromQuarantine);

// Policy management routes
router.get('/policies', emailGuardController.getPolicies);
router.post('/policies', emailGuardController.createPolicy);
router.put('/policies/:policyId', emailGuardController.updatePolicy);
router.delete('/policies/:policyId', emailGuardController.deletePolicy);

// Alert management routes
router.get('/alerts', emailGuardController.getAlerts);
router.put('/alerts/:alertId/resolve', emailGuardController.resolveAlert);

// Report routes
router.get('/reports', emailGuardController.getReports);
router.post('/reports/generate', emailGuardController.generateReport);

// Statistics and dashboard routes
router.get('/stats', emailGuardController.getStats);
router.get('/dashboard', emailGuardController.getDashboard);

// User management routes
router.get('/users', emailGuardController.getUsers);
router.put('/users/:userId/risk', emailGuardController.updateUserRisk);

// Health check
router.get('/health', (req, res) => {
  res.json({
    service: 'EmailDefender',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;
