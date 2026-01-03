const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

/**
 * Device Management Routes
 * Base path: /api/v1/iotsecure/devices
 */

// Get all devices with filtering & pagination
router.get('/', deviceController.getDevices);

// Get device statistics
router.get('/stats', deviceController.getDeviceStats);

// Get high-risk devices
router.get('/high-risk', deviceController.getHighRiskDevices);

// Get offline devices
router.get('/offline', deviceController.getOfflineDevices);

// Get devices by type
router.get('/type/:type', deviceController.getDevicesByType);

// Get devices by segment
router.get('/segment/:segmentId', deviceController.getDevicesBySegment);

// Search devices
router.get('/search', deviceController.searchDevices);

// Bulk operations
router.post('/bulk/update', deviceController.bulkUpdateDevices);
router.post('/bulk/delete', deviceController.bulkDeleteDevices);
router.post('/bulk/quarantine', deviceController.bulkQuarantineDevices);

// Device discovery
router.post('/discover', deviceController.discoverDevices);

// Get single device
router.get('/:id', deviceController.getDeviceById);

// Create new device
router.post('/', deviceController.createDevice);

// Update device
router.put('/:id', deviceController.updateDevice);

// Delete device
router.delete('/:id', deviceController.deleteDevice);

// Device actions
router.post('/:id/quarantine', deviceController.quarantineDevice);
router.post('/:id/unquarantine', deviceController.unquarantineDevice);
router.post('/:id/scan', deviceController.scanDevice);
router.post('/:id/reboot', deviceController.rebootDevice);
router.post('/:id/reset-credentials', deviceController.resetDeviceCredentials);

// Device vulnerabilities
router.get('/:id/vulnerabilities', deviceController.getDeviceVulnerabilities);

// Device alerts
router.get('/:id/alerts', deviceController.getDeviceAlerts);

// Device baseline
router.get('/:id/baseline', deviceController.getDeviceBaseline);
router.post('/:id/baseline', deviceController.createDeviceBaseline);

// Device firmware
router.get('/:id/firmware', deviceController.getDeviceFirmware);
router.post('/:id/firmware/update', deviceController.updateDeviceFirmware);

// Device network info
router.get('/:id/network', deviceController.getDeviceNetwork);

// Device history
router.get('/:id/history', deviceController.getDeviceHistory);

// Export devices
router.get('/export/csv', deviceController.exportDevicesCSV);
router.get('/export/json', deviceController.exportDevicesJSON);

module.exports = router;
