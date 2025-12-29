/**
 * SSLMonitor API Routes
 */

const express = require('express');
const router = express.Router();

const certificateController = require('../controllers/certificateController');
const domainController = require('../controllers/domainController');
const alertController = require('../controllers/alertController');
const analyticsController = require('../controllers/analyticsController');

// Certificate routes
router.get('/certificates', certificateController.getAll);
router.get('/certificates/expiring', certificateController.getExpiring);
router.get('/certificates/:id', certificateController.getById);
router.post('/certificates/scan', certificateController.scan);
router.post('/certificates/check', certificateController.check);
router.delete('/certificates/:id', certificateController.delete);

// Domain routes
router.get('/domains', domainController.getAll);
router.get('/domains/:id', domainController.getById);
router.post('/domains', domainController.create);
router.put('/domains/:id', domainController.update);
router.delete('/domains/:id', domainController.delete);
router.post('/domains/:id/scan', domainController.scan);

// Alert routes
router.get('/alerts', alertController.getAll);
router.get('/alerts/:id', alertController.getById);
router.put('/alerts/:id/acknowledge', alertController.acknowledge);
router.post('/alerts/settings', alertController.updateSettings);

// Analytics routes
router.get('/analytics/overview', analyticsController.getOverview);
router.get('/analytics/expiration', analyticsController.getExpirationStats);
router.get('/analytics/issues', analyticsController.getIssueStats);
router.get('/analytics/dashboard', analyticsController.getDashboard);

module.exports = router;
