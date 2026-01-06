const express = require('express');
const router = express.Router();
const riskController = require('../controllers/riskController');

// ==================== ASSET RISK ROUTES ====================

// Calculate asset risk score
router.post('/api/v1/risk/assets/calculate', riskController.calculateAssetRisk.bind(riskController));

// Get all asset risks
router.get('/api/v1/risk/assets', riskController.getAssetRisks.bind(riskController));

// Get specific asset risk
router.get('/api/v1/risk/assets/:id', riskController.getAssetRiskById.bind(riskController));

// ==================== USER RISK ROUTES ====================

// Calculate user risk score
router.post('/api/v1/risk/users/calculate', riskController.calculateUserRisk.bind(riskController));

// Get all user risks
router.get('/api/v1/risk/users', riskController.getUserRisks.bind(riskController));

// Get specific user risk
router.get('/api/v1/risk/users/:id', riskController.getUserRiskById.bind(riskController));

// ==================== THREAT RISK ROUTES ====================

// Assess threat risk
router.post('/api/v1/risk/threats/assess', riskController.assessThreatRisk.bind(riskController));

// Get all threat risks
router.get('/api/v1/risk/threats', riskController.getThreatRisks.bind(riskController));

// ==================== VENDOR RISK ROUTES ====================

// Calculate vendor risk
router.post('/api/v1/risk/vendors/calculate', riskController.calculateVendorRisk.bind(riskController));

// Get all vendor risks
router.get('/api/v1/risk/vendors', riskController.getVendorRisks.bind(riskController));

// ==================== RISK HEATMAP ROUTES ====================

// Generate risk heatmap
router.post('/api/v1/risk/heatmap', riskController.generateRiskHeatmap.bind(riskController));

// ==================== PREDICTION ROUTES ====================

// Predict risk trajectory
router.post('/api/v1/risk/predictions/trajectory', riskController.predictRiskTrajectory.bind(riskController));

// ==================== AGGREGATION ROUTES ====================

// Aggregate risk scores
router.post('/api/v1/risk/aggregate', riskController.aggregateRiskScore.bind(riskController));

// ==================== DASHBOARD ROUTES ====================

// Get dashboard statistics
router.get('/api/v1/risk/dashboard/stats', riskController.getDashboardStats.bind(riskController));

// ==================== HEALTH CHECK ====================

router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'riskscoreai-api',
    timestamp: new Date(),
    version: '1.0.0'
  });
});

module.exports = router;
