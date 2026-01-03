/**
 * NetworkMonitor API Routes
 */

const express = require("express");
const router = express.Router();
const {
  deviceController,
  alertController,
  trafficController,
  dashboardController
} = require("../controllers");

// ==================== Dashboard Routes ====================
router.get("/dashboard/overview", dashboardController.getOverview);
router.get("/dashboard/health", dashboardController.getHealth);
router.get("/dashboard/timeline", dashboardController.getTimeline);
router.get("/dashboard/network-map", dashboardController.getNetworkMap);

// ==================== Device Routes ====================
router.get("/devices", deviceController.getDevices);
router.get("/devices/stats", deviceController.getDeviceStats);
router.post("/devices", deviceController.createDevice);
router.get("/devices/:id", deviceController.getDevice);
router.put("/devices/:id", deviceController.updateDevice);
router.delete("/devices/:id", deviceController.deleteDevice);

// Device Discovery
router.post("/devices/discover", deviceController.discover);
router.post("/devices/auto-discover", deviceController.autoDiscover);

// Device Status & Monitoring
router.get("/devices/:id/status", deviceController.checkStatus);
router.post("/devices/check-all", deviceController.checkAllStatus);
router.post("/devices/:id/poll", deviceController.pollDevice);
router.get("/devices/:id/interfaces", deviceController.getInterfaces);

// ==================== Alert Routes ====================
router.get("/alerts", alertController.getAlerts);
router.get("/alerts/stats", alertController.getStats);
router.post("/alerts", alertController.createAlert);
router.get("/alerts/:id", alertController.getAlert);
router.delete("/alerts/:id", alertController.deleteAlert);

// Alert Actions
router.post("/alerts/:id/acknowledge", alertController.acknowledgeAlert);
router.post("/alerts/:id/resolve", alertController.resolveAlert);
router.put("/alerts/:id/status", alertController.updateStatus);
router.post("/alerts/:id/notes", alertController.addNote);

// Bulk Operations
router.post("/alerts/bulk/acknowledge", alertController.bulkAcknowledge);
router.post("/alerts/bulk/resolve", alertController.bulkResolve);

// ==================== Traffic Routes ====================
router.get("/traffic/stats", trafficController.getStats);
router.get("/traffic/bandwidth", trafficController.getBandwidth);
router.get("/traffic/flows", trafficController.getFlows);
router.post("/traffic/flows", trafficController.logFlow);
router.post("/traffic/flows/bulk", trafficController.bulkLogFlows);

// Traffic Analysis
router.get("/traffic/top-talkers", trafficController.getTopTalkers);
router.get("/traffic/protocols", trafficController.getProtocols);
router.get("/traffic/applications", trafficController.getApplications);
router.get("/traffic/geo", trafficController.getGeoDistribution);
router.get("/traffic/anomalies/:deviceId", trafficController.detectAnomalies);

// ==================== Health Check ====================
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "NetworkMonitor API",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
