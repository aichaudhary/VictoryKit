const express = require('express');
const router = express.Router();
const baselineController = require('../controllers/baselineController');

/**
 * Behavioral Baseline Routes
 * Base path: /api/v1/iotsecure/baselines
 */

// Get all baselines
router.get('/', baselineController.getBaselines);

// Get baseline statistics
router.get('/stats', baselineController.getBaselineStats);

// Get active baselines
router.get('/active', baselineController.getActiveBaselines);

// Get learning baselines
router.get('/learning', baselineController.getLearningBaselines);

// Get baselines by type
router.get('/type/:type', baselineController.getBaselinesByType);

// Get baselines for device
router.get('/device/:deviceId', baselineController.getDeviceBaselines);

// Get network baselines
router.get('/network', baselineController.getNetworkBaselines);

// Get single baseline
router.get('/:id', baselineController.getBaselineById);

// Create baseline
router.post('/', baselineController.createBaseline);

// Update baseline
router.put('/:id', baselineController.updateBaseline);

// Delete baseline
router.delete('/:id', baselineController.deleteBaseline);

// Baseline actions
router.post('/:id/activate', baselineController.activateBaseline);
router.post('/:id/pause', baselineController.pauseBaseline);
router.post('/:id/reset', baselineController.resetBaseline);
router.post('/:id/recalculate', baselineController.recalculateBaseline);

// Add sample data
router.post('/:id/sample', baselineController.addSample);

// Check deviation
router.post('/:id/check-deviation', baselineController.checkDeviation);

// Exceptions/whitelist
router.get('/:id/exceptions', baselineController.getExceptions);
router.post('/:id/exceptions', baselineController.addException);
router.delete('/:id/exceptions/:exceptionId', baselineController.removeException);

// Update thresholds
router.get('/:id/thresholds', baselineController.getThresholds);
router.put('/:id/thresholds', baselineController.updateThresholds);

// Alert outcomes
router.post('/:id/record-outcome', baselineController.recordAlertOutcome);

// Version history
router.get('/:id/versions', baselineController.getVersionHistory);
router.post('/:id/rollback/:version', baselineController.rollbackToVersion);

// Auto-update settings
router.get('/:id/auto-update', baselineController.getAutoUpdateSettings);
router.put('/:id/auto-update', baselineController.updateAutoUpdateSettings);

// Export
router.get('/:id/export', baselineController.exportBaseline);
router.get('/export/all', baselineController.exportAllBaselines);

module.exports = router;
