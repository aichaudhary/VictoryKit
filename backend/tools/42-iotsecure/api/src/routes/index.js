const express = require('express');
const router = express.Router();

// Import route modules
const deviceRoutes = require('./deviceRoutes');
const vulnerabilityRoutes = require('./vulnerabilityRoutes');
const scanRoutes = require('./scanRoutes');
const alertRoutes = require('./alertRoutes');
const segmentRoutes = require('./segmentRoutes');
const firmwareRoutes = require('./firmwareRoutes');
const baselineRoutes = require('./baselineRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const integrationRoutes = require('./integrationRoutes');

// API Health & Status
router.get('/status', (req, res) => {
  res.json({ 
    status: 'operational', 
    service: 'IoTSecure', 
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    features: {
      deviceManagement: true,
      vulnerabilityScanning: true,
      firmwareAnalysis: true,
      networkSegmentation: true,
      behavioralBaseline: true,
      realTimeAlerts: true,
      threatIntelligence: true
    }
  });
});

// Device Management
router.use('/devices', deviceRoutes);

// Vulnerability Management
router.use('/vulnerabilities', vulnerabilityRoutes);

// Scanning Operations
router.use('/scans', scanRoutes);

// Alerts & Notifications
router.use('/alerts', alertRoutes);

// Network Segmentation
router.use('/segments', segmentRoutes);

// Firmware Management
router.use('/firmware', firmwareRoutes);

// Behavioral Baselines
router.use('/baselines', baselineRoutes);

// Dashboard & Analytics
router.use('/dashboard', dashboardRoutes);

// External Integrations
router.use('/integrations', integrationRoutes);

// Legacy routes (backward compatibility)
const legacyController = require('../controllers/legacyController');
router.post('/analyze', legacyController.analyze);
router.post('/scan', legacyController.scan);
router.get('/reports', legacyController.getReports);
router.get('/reports/:id', legacyController.getReportById);
router.get('/config', legacyController.getConfig);
router.put('/config', legacyController.updateConfig);

module.exports = router;
