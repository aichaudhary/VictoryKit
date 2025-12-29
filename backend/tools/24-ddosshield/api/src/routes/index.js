/**
 * DDoSShield API Routes
 */

const express = require("express");
const router = express.Router();

const attackController = require("../controllers/attackController");
const protectionController = require("../controllers/protectionController");
const trafficController = require("../controllers/trafficController");
const analyticsController = require("../controllers/analyticsController");

// Attack routes
router.get("/attacks", attackController.getAll);
router.get("/attacks/active", attackController.getActive);
router.get("/attacks/:id", attackController.getById);
router.post("/attacks/detect", attackController.detect);
router.put("/attacks/:id", attackController.update);
router.post("/attacks/:id/mitigate", attackController.mitigate);

// Protection routes
router.get("/protections", protectionController.getAll);
router.get("/protections/:id", protectionController.getById);
router.post("/protections", protectionController.create);
router.put("/protections/:id", protectionController.update);
router.delete("/protections/:id", protectionController.delete);
router.post("/protections/:id/activate", protectionController.activate);

// Traffic routes
router.get("/traffic", trafficController.getAll);
router.get("/traffic/realtime", trafficController.getRealtime);
router.post("/traffic/analyze", trafficController.analyze);
router.get("/traffic/baseline", trafficController.getBaseline);

// Analytics routes
router.get("/analytics/overview", analyticsController.getOverview);
router.get("/analytics/attacks", analyticsController.getAttackStats);
router.get("/analytics/traffic", analyticsController.getTrafficStats);
router.get("/analytics/dashboard", analyticsController.getDashboard);

module.exports = router;
