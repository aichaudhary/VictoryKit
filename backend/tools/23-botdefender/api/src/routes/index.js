/**
 * BotDefender API Routes
 */

const express = require("express");
const router = express.Router();

const botController = require("../controllers/botController");
const challengeController = require("../controllers/challengeController");
const fingerprintController = require("../controllers/fingerprintController");
const analyticsController = require("../controllers/analyticsController");

// Bot detection routes
router.get("/bots", botController.getAll);
router.get("/bots/:id", botController.getById);
router.post("/bots/detect", botController.detect);
router.put("/bots/:id", botController.update);
router.post("/bots/:id/block", botController.block);
router.post("/bots/:id/allow", botController.allow);
router.get("/bots/statistics/summary", botController.getStatistics);

// Challenge routes
router.get("/challenges", challengeController.getAll);
router.get("/challenges/:id", challengeController.getById);
router.post("/challenges", challengeController.create);
router.put("/challenges/:id", challengeController.update);
router.delete("/challenges/:id", challengeController.delete);
router.post("/challenges/:id/verify", challengeController.verify);

// Fingerprint routes
router.get("/fingerprints", fingerprintController.getAll);
router.get("/fingerprints/:id", fingerprintController.getById);
router.post("/fingerprints/analyze", fingerprintController.analyze);
router.post("/fingerprints/:id/flag", fingerprintController.flag);

// Analytics routes
router.get("/analytics/traffic", analyticsController.getTraffic);
router.get("/analytics/bots", analyticsController.getBotBreakdown);
router.get("/analytics/challenges", analyticsController.getChallengeStats);
router.get("/analytics/dashboard", analyticsController.getDashboard);

module.exports = router;
