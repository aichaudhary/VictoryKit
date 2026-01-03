const express = require('express');
const router = express.Router();
const segmentController = require('../controllers/segmentController');

/**
 * Network Segmentation Routes
 * Base path: /api/v1/iotsecure/segments
 */

// Get all segments
router.get('/', segmentController.getSegments);

// Get segment statistics
router.get('/stats', segmentController.getSegmentStats);

// Get active segments
router.get('/active', segmentController.getActiveSegments);

// Get critical segments
router.get('/critical', segmentController.getCriticalSegments);

// Get segments by type
router.get('/type/:type', segmentController.getSegmentsByType);

// Get segment topology/map
router.get('/topology', segmentController.getSegmentTopology);

// Find segment by IP
router.get('/find-by-ip/:ip', segmentController.findSegmentByIP);

// Get single segment
router.get('/:id', segmentController.getSegmentById);

// Create segment
router.post('/', segmentController.createSegment);

// Update segment
router.put('/:id', segmentController.updateSegment);

// Delete segment
router.delete('/:id', segmentController.deleteSegment);

// Segment devices
router.get('/:id/devices', segmentController.getSegmentDevices);

// Segment alerts
router.get('/:id/alerts', segmentController.getSegmentAlerts);

// Segment traffic stats
router.get('/:id/traffic', segmentController.getSegmentTraffic);

// Firewall rules
router.get('/:id/firewall-rules', segmentController.getFirewallRules);
router.post('/:id/firewall-rules', segmentController.addFirewallRule);
router.put('/:id/firewall-rules/:ruleId', segmentController.updateFirewallRule);
router.delete('/:id/firewall-rules/:ruleId', segmentController.deleteFirewallRule);

// Access control
router.get('/:id/access-control', segmentController.getAccessControl);
router.put('/:id/access-control', segmentController.updateAccessControl);
router.post('/:id/allow-segment', segmentController.allowSegmentCommunication);
router.post('/:id/block-segment', segmentController.blockSegmentCommunication);

// Segment actions
router.post('/:id/calculate-risk', segmentController.calculateSegmentRisk);
router.post('/:id/isolate', segmentController.isolateSegment);
router.post('/:id/activate', segmentController.activateSegment);

// Compliance
router.get('/:id/compliance', segmentController.getSegmentCompliance);
router.post('/:id/compliance-check', segmentController.runComplianceCheck);

// Export
router.get('/export/csv', segmentController.exportCSV);
router.get('/export/json', segmentController.exportJSON);

module.exports = router;
