const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

/**
 * Alert Management Routes
 * Base path: /api/v1/iotsecure/alerts
 */

// Get all alerts with filtering
router.get('/', alertController.getAlerts);

// Get alert statistics
router.get('/stats', alertController.getAlertStats);

// Get alert counts by severity
router.get('/counts', alertController.getAlertCounts);

// Get critical unresolved alerts
router.get('/critical', alertController.getCriticalAlerts);

// Get alerts by type
router.get('/type/:type', alertController.getAlertsByType);

// Get alerts by severity
router.get('/severity/:severity', alertController.getAlertsBySeverity);

// Get alerts by device
router.get('/device/:deviceId', alertController.getAlertsByDevice);

// Get alerts by segment
router.get('/segment/:segmentId', alertController.getAlertsBySegment);

// Get my assigned alerts
router.get('/assigned/me', alertController.getMyAlerts);

// Search alerts
router.get('/search', alertController.searchAlerts);

// Get single alert
router.get('/:id', alertController.getAlertById);

// Create manual alert
router.post('/', alertController.createAlert);

// Update alert
router.put('/:id', alertController.updateAlert);

// Delete alert
router.delete('/:id', alertController.deleteAlert);

// Alert actions
router.post('/:id/acknowledge', alertController.acknowledgeAlert);
router.post('/:id/investigate', alertController.startInvestigation);
router.post('/:id/resolve', alertController.resolveAlert);
router.post('/:id/escalate', alertController.escalateAlert);
router.post('/:id/assign', alertController.assignAlert);
router.post('/:id/suppress', alertController.suppressAlert);
router.post('/:id/false-positive', alertController.markFalsePositive);

// Alert comments
router.get('/:id/comments', alertController.getAlertComments);
router.post('/:id/comments', alertController.addAlertComment);

// Alert evidence
router.get('/:id/evidence', alertController.getAlertEvidence);
router.post('/:id/evidence', alertController.uploadEvidence);

// Related alerts
router.get('/:id/related', alertController.getRelatedAlerts);
router.post('/:id/link', alertController.linkAlerts);

// Bulk operations
router.post('/bulk/acknowledge', alertController.bulkAcknowledge);
router.post('/bulk/resolve', alertController.bulkResolve);
router.post('/bulk/assign', alertController.bulkAssign);

// Alert rules
router.get('/rules', alertController.getAlertRules);
router.post('/rules', alertController.createAlertRule);
router.put('/rules/:ruleId', alertController.updateAlertRule);
router.delete('/rules/:ruleId', alertController.deleteAlertRule);

// Notification settings
router.get('/notifications/settings', alertController.getNotificationSettings);
router.put('/notifications/settings', alertController.updateNotificationSettings);

// Export
router.get('/export/csv', alertController.exportCSV);
router.get('/export/json', alertController.exportJSON);

module.exports = router;
