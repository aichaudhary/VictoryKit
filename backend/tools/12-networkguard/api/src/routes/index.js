/**
 * NetworkGuard API Routes
 */

const express = require("express");
const router = express.Router();

const networkController = require("./controllers/networkController");
const alertController = require("./controllers/alertController");
const ruleController = require("./controllers/ruleController");
const trafficController = require("./controllers/trafficController");

// Network monitoring endpoints
router.get("/networks", networkController.getAll);
router.get("/networks/:id", networkController.getById);
router.post("/networks", networkController.create);
router.put("/networks/:id", networkController.update);
router.delete("/networks/:id", networkController.delete);
router.get("/networks/:id/topology", networkController.getTopology);
router.get("/networks/:id/stats", networkController.getStats);

// Alert management
router.get("/alerts", alertController.getAll);
router.get("/alerts/:id", alertController.getById);
router.post("/alerts", alertController.create);
router.put("/alerts/:id/acknowledge", alertController.acknowledge);
router.put("/alerts/:id/resolve", alertController.resolve);
router.get("/alerts/stats", alertController.getStats);
router.post("/alerts/analyze", alertController.analyze);

// IDS/IPS Rules
router.get("/rules", ruleController.getAll);
router.get("/rules/:id", ruleController.getById);
router.post("/rules", ruleController.create);
router.put("/rules/:id", ruleController.update);
router.delete("/rules/:id", ruleController.delete);
router.put("/rules/:id/enable", ruleController.enable);
router.put("/rules/:id/disable", ruleController.disable);
router.post("/rules/import", ruleController.importRules);

// Traffic analysis
router.get("/traffic", trafficController.getSummary);
router.post("/traffic/analyze", trafficController.analyze);
router.get("/traffic/flows", trafficController.getFlows);
router.post("/traffic/capture", trafficController.startCapture);
router.get("/traffic/anomalies", trafficController.getAnomalies);

// Dashboard
router.get("/dashboard", networkController.getDashboard);

module.exports = router;
