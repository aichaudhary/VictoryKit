const express = require('express');
const router = express.Router();
const controller = require('../controllers');

// ==================== STATUS & DASHBOARD ====================
router.get('/status', controller.getStatus);
router.get('/dashboard', controller.getDashboard);

// ==================== NETWORK MANAGEMENT ====================
router.get('/networks', controller.getAllNetworks);
router.get('/networks/:id', controller.getNetworkById);
router.post('/networks', controller.createNetwork);
router.put('/networks/:id', controller.updateNetwork);
router.delete('/networks/:id', controller.deleteNetwork);

// ==================== ACCESS POINT MANAGEMENT ====================
router.get('/access-points', controller.getAllAccessPoints);
router.get('/access-points/:id', controller.getAccessPointById);
router.post('/access-points', controller.createAccessPoint);
router.put('/access-points/:id', controller.updateAccessPoint);
router.delete('/access-points/:id', controller.deleteAccessPoint);

// ==================== CLIENT MANAGEMENT ====================
router.get('/clients', controller.getAllClients);
router.get('/clients/:id', controller.getClientById);
router.get('/clients/mac/:mac', controller.getClientByMac);
router.post('/clients', controller.createClient);
router.put('/clients/:id', controller.updateClient);
router.post('/clients/:id/block', controller.blockClient);

// ==================== SECURITY ALERTS ====================
router.get('/alerts', controller.getAllAlerts);
router.get('/alerts/:id', controller.getAlertById);
router.post('/alerts', controller.createAlert);
router.post('/alerts/:id/acknowledge', controller.acknowledgeAlert);
router.post('/alerts/:id/resolve', controller.resolveAlert);

// ==================== THREAT DETECTION ====================
router.post('/scan/rogue-aps', controller.detectRogueAPs);
router.post('/scan/weak-encryption', controller.detectWeakEncryption);
router.post('/scan/signal-anomalies', controller.analyzeSignalAnomalies);
router.post('/threat-hunting', controller.performThreatHunting);

// ==================== PROVIDER INTEGRATION ====================
router.get('/providers', controller.getProviderStatus);
router.post('/providers/:provider/sync', controller.syncWithProvider);

// ==================== CONFIG & REPORTS ====================
router.get('/config', controller.getConfig);
router.put('/config', controller.updateConfig);
router.get('/reports', controller.getReports);
router.get('/reports/:id', controller.getReportById);

module.exports = router;
