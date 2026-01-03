const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');

/**
 * Scanning Operations Routes
 * Base path: /api/v1/iotsecure/scans
 */

// Get all scans with filtering
router.get('/', scanController.getScans);

// Get scan statistics
router.get('/stats', scanController.getScanStats);

// Get active scans
router.get('/active', scanController.getActiveScans);

// Get scheduled scans
router.get('/scheduled', scanController.getScheduledScans);

// Get recent completed scans
router.get('/recent', scanController.getRecentScans);

// Get scans by type
router.get('/type/:type', scanController.getScansByType);

// Start a new scan
router.post('/start', scanController.startScan);

// Quick scan presets
router.post('/quick/discovery', scanController.quickDiscoveryScan);
router.post('/quick/vulnerability', scanController.quickVulnerabilityScan);
router.post('/quick/full', scanController.quickFullScan);

// Get single scan
router.get('/:id', scanController.getScanById);

// Update scan configuration
router.put('/:id', scanController.updateScan);

// Delete scan
router.delete('/:id', scanController.deleteScan);

// Scan actions
router.post('/:id/pause', scanController.pauseScan);
router.post('/:id/resume', scanController.resumeScan);
router.post('/:id/cancel', scanController.cancelScan);
router.post('/:id/restart', scanController.restartScan);

// Scan results
router.get('/:id/results', scanController.getScanResults);
router.get('/:id/devices', scanController.getScanDevices);
router.get('/:id/vulnerabilities', scanController.getScanVulnerabilities);

// Schedule scan
router.post('/schedule', scanController.scheduleScan);
router.put('/schedule/:id', scanController.updateScheduledScan);
router.delete('/schedule/:id', scanController.deleteScheduledScan);

// Export scan results
router.get('/:id/export/pdf', scanController.exportScanPDF);
router.get('/:id/export/csv', scanController.exportScanCSV);

module.exports = router;
