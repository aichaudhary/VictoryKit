const express = require('express');
const router = express.Router();
const zerotrustController = require('../controllers/zerotrustController');

// ==================== ACCESS REQUEST ROUTES ====================
router.post('/access-requests', zerotrustController.createAccessRequest);
router.get('/access-requests', zerotrustController.getAccessRequests);
router.get('/access-requests/:requestId', zerotrustController.getAccessRequestById);
router.post('/access-requests/:requestId/approve', zerotrustController.approveAccessRequest);
router.post('/access-requests/:requestId/deny', zerotrustController.denyAccessRequest);

// ==================== TRUST SCORE ROUTES ====================
router.post('/trust-score/calculate', zerotrustController.calculateTrustScore);
router.get('/trust-score/history', zerotrustController.getTrustScoreHistory);

// ==================== POLICY ROUTES ====================
router.post('/policies', zerotrustController.createPolicy);
router.get('/policies', zerotrustController.getPolicies);
router.get('/policies/:policyId', zerotrustController.getPolicyById);
router.put('/policies/:policyId', zerotrustController.updatePolicy);
router.post('/policies/:policyId/activate', zerotrustController.activatePolicy);
router.post('/policies/:policyId/deactivate', zerotrustController.deactivatePolicy);
router.post('/policies/:policyId/evaluate', zerotrustController.evaluatePolicy);

// ==================== BEHAVIOR ROUTES ====================
router.post('/behavior/analyze', zerotrustController.analyzeBehavior);
router.get('/behavior/anomalies', zerotrustController.getBehaviorAnomalies);

// ==================== DEVICE ROUTES ====================
router.post('/devices/assess', zerotrustController.assessDevice);
router.get('/devices', zerotrustController.getDevices);
router.get('/devices/:deviceId', zerotrustController.getDeviceById);
router.post('/devices/:deviceId/quarantine', zerotrustController.quarantineDevice);

// ==================== USER ROUTES ====================
router.post('/users', zerotrustController.createUser);
router.get('/users', zerotrustController.getUsers);
router.get('/users/:userId', zerotrustController.getUserById);
router.post('/users/:userId/watchlist', zerotrustController.addToWatchlist);

// ==================== NETWORK SEGMENT ROUTES ====================
router.post('/segments', zerotrustController.createSegment);
router.get('/segments', zerotrustController.getSegments);
router.get('/segments/:segmentId', zerotrustController.getSegmentById);
router.post('/segments/:segmentId/allow-inbound', zerotrustController.allowInbound);
router.post('/segments/:segmentId/block', zerotrustController.blockSegment);
router.post('/segments/:segmentId/firewall-rules', zerotrustController.addFirewallRule);
router.post('/segments/:segmentId/detect-lateral-movement', zerotrustController.detectLateralMovement);
router.post('/segments/:segmentId/quarantine', zerotrustController.quarantineSegment);
router.post('/segments/:segmentId/enable-microsegmentation', zerotrustController.enableMicroSegmentation);

// ==================== CONTINUOUS AUTH ROUTES ====================
router.post('/auth/validate-session', zerotrustController.validateSession);

// ==================== REPORTING ROUTES ====================
router.get('/reports/access', zerotrustController.generateAccessReport);
router.get('/dashboard/stats', zerotrustController.getDashboardStats);

module.exports = router;
