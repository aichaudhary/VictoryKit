const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

/**
 * Dashboard & Analytics Routes
 * Base path: /api/v1/iotsecure/dashboard
 */

// Main dashboard data
router.get('/', dashboardController.getDashboardData);

// Overview statistics
router.get('/overview', dashboardController.getOverview);

// Device statistics
router.get('/devices/stats', dashboardController.getDeviceStats);
router.get('/devices/by-type', dashboardController.getDevicesByType);
router.get('/devices/by-status', dashboardController.getDevicesByStatus);
router.get('/devices/by-risk', dashboardController.getDevicesByRisk);
router.get('/devices/by-location', dashboardController.getDevicesByLocation);

// Vulnerability statistics
router.get('/vulnerabilities/stats', dashboardController.getVulnerabilityStats);
router.get('/vulnerabilities/by-severity', dashboardController.getVulnerabilitiesBySeverity);
router.get('/vulnerabilities/trends', dashboardController.getVulnerabilityTrends);
router.get('/vulnerabilities/top-cves', dashboardController.getTopCVEs);

// Alert statistics
router.get('/alerts/stats', dashboardController.getAlertStats);
router.get('/alerts/by-type', dashboardController.getAlertsByType);
router.get('/alerts/by-severity', dashboardController.getAlertsBySeverity);
router.get('/alerts/trends', dashboardController.getAlertTrends);
router.get('/alerts/mttr', dashboardController.getMeanTimeToResolve);

// Scan statistics
router.get('/scans/stats', dashboardController.getScanStats);
router.get('/scans/recent', dashboardController.getRecentScans);
router.get('/scans/scheduled', dashboardController.getScheduledScans);

// Network statistics
router.get('/network/stats', dashboardController.getNetworkStats);
router.get('/network/segments', dashboardController.getSegmentStats);
router.get('/network/traffic', dashboardController.getTrafficStats);
router.get('/network/topology', dashboardController.getNetworkTopology);

// Risk assessment
router.get('/risk/overview', dashboardController.getRiskOverview);
router.get('/risk/score', dashboardController.getOverallRiskScore);
router.get('/risk/by-segment', dashboardController.getRiskBySegment);
router.get('/risk/by-device-type', dashboardController.getRiskByDeviceType);
router.get('/risk/trends', dashboardController.getRiskTrends);

// Compliance
router.get('/compliance/overview', dashboardController.getComplianceOverview);
router.get('/compliance/by-standard', dashboardController.getComplianceByStandard);
router.get('/compliance/gaps', dashboardController.getComplianceGaps);

// Firmware
router.get('/firmware/stats', dashboardController.getFirmwareStats);
router.get('/firmware/vulnerable', dashboardController.getVulnerableFirmwareCount);

// Time-based analytics
router.get('/analytics/hourly', dashboardController.getHourlyAnalytics);
router.get('/analytics/daily', dashboardController.getDailyAnalytics);
router.get('/analytics/weekly', dashboardController.getWeeklyAnalytics);
router.get('/analytics/monthly', dashboardController.getMonthlyAnalytics);

// Activity feed
router.get('/activity', dashboardController.getActivityFeed);
router.get('/activity/recent', dashboardController.getRecentActivity);

// Health checks
router.get('/health', dashboardController.getSystemHealth);
router.get('/health/integrations', dashboardController.getIntegrationHealth);

// Export dashboard data
router.get('/export/pdf', dashboardController.exportDashboardPDF);
router.get('/export/csv', dashboardController.exportDashboardCSV);

// Custom widgets
router.get('/widgets', dashboardController.getWidgets);
router.post('/widgets', dashboardController.createWidget);
router.put('/widgets/:id', dashboardController.updateWidget);
router.delete('/widgets/:id', dashboardController.deleteWidget);

// Real-time metrics (for WebSocket fallback)
router.get('/realtime/metrics', dashboardController.getRealtimeMetrics);

module.exports = router;
