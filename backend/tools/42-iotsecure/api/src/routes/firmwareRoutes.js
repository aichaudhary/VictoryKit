const express = require('express');
const router = express.Router();
const firmwareController = require('../controllers/firmwareController');
const multer = require('multer');

// Configure multer for firmware uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, process.env.FIRMWARE_UPLOAD_PATH || '/tmp/firmware');
    },
    filename: (req, file, cb) => {
      cb(null, `fw_${Date.now()}_${file.originalname}`);
    }
  }),
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB max
  }
});

/**
 * Firmware Management Routes
 * Base path: /api/v1/iotsecure/firmware
 */

// Get all firmware
router.get('/', firmwareController.getFirmwareList);

// Get firmware statistics
router.get('/stats', firmwareController.getFirmwareStats);

// Get vulnerable firmware
router.get('/vulnerable', firmwareController.getVulnerableFirmware);

// Get outdated firmware
router.get('/outdated', firmwareController.getOutdatedFirmware);

// Get firmware by device type
router.get('/device-type/:deviceType', firmwareController.getFirmwareByDeviceType);

// Get firmware by manufacturer
router.get('/manufacturer/:manufacturer', firmwareController.getFirmwareByManufacturer);

// Search firmware
router.get('/search', firmwareController.searchFirmware);

// Find by hash
router.get('/hash/:hash', firmwareController.findByHash);

// Upload new firmware
router.post('/upload', upload.single('firmware'), firmwareController.uploadFirmware);

// Get single firmware
router.get('/:id', firmwareController.getFirmwareById);

// Update firmware metadata
router.put('/:id', firmwareController.updateFirmware);

// Delete firmware
router.delete('/:id', firmwareController.deleteFirmware);

// Firmware analysis
router.post('/:id/analyze', firmwareController.analyzeFirmware);
router.get('/:id/analysis', firmwareController.getAnalysisResults);
router.get('/:id/vulnerabilities', firmwareController.getFirmwareVulnerabilities);
router.get('/:id/components', firmwareController.getFirmwareComponents);

// VirusTotal integration
router.post('/:id/virustotal-scan', firmwareController.scanWithVirusTotal);
router.get('/:id/virustotal-results', firmwareController.getVirusTotalResults);

// Approval workflow
router.post('/:id/approve', firmwareController.approveFirmware);
router.post('/:id/reject', firmwareController.rejectFirmware);
router.get('/:id/approval-history', firmwareController.getApprovalHistory);

// Deployment
router.get('/:id/deployments', firmwareController.getFirmwareDeployments);
router.post('/:id/deploy', firmwareController.deployFirmware);
router.post('/:id/rollback', firmwareController.rollbackFirmware);

// Compare versions
router.get('/compare/:id1/:id2', firmwareController.compareFirmware);

// Download firmware
router.get('/:id/download', firmwareController.downloadFirmware);

// Export
router.get('/export/csv', firmwareController.exportCSV);

module.exports = router;
