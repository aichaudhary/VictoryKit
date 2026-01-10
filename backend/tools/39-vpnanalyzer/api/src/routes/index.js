const express = require('express');
const router = express.Router();
const controller = require('../controllers');

// Status and legacy endpoints
router.get('/status', controller.getStatus);
router.post('/analyze', controller.analyze);
router.get('/reports', controller.getReports);
router.get('/reports/:id', controller.getReportById);
router.post('/scan', controller.scan);
router.get('/config', controller.getConfig);
router.put('/config', controller.updateConfig);

// VPN Connection Management
router.post('/connections', controller.createConnection);
router.get('/connections', controller.getConnections);
router.put('/connections/:connectionId', controller.updateConnection);
router.delete('/connections/:connectionId/disconnect', controller.disconnectConnection);
router.get('/connections/:connectionId/metrics', controller.getConnectionMetrics);

// VPN Policy Management
router.post('/policies', controller.createPolicy);
router.get('/policies', controller.getPolicies);
router.post('/policies/:policyId/apply/:userId', controller.applyPolicyToUser);

// Security Analysis and Alerts
router.get('/connections/:connectionId/security', controller.analyzeConnectionSecurity);
router.post('/alerts', controller.createSecurityAlert);
router.get('/alerts', controller.getSecurityAlerts);

// User Management
router.post('/users', controller.createUser);
router.post('/users/authenticate', controller.authenticateUser);
router.get('/users', controller.getUsers);

// VPN Provider Integrations
router.get('/providers/:provider/status', controller.getProviderStatus);
router.post('/providers/:provider/connect', controller.connectToProvider);

module.exports = router;
