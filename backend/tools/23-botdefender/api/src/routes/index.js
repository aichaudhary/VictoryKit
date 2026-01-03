/**
 * BotDefender API Routes
 * Enhanced with real-time detection and external API integrations
 */

const express = require("express");
const router = express.Router();

const botController = require("../controllers/botController");
const challengeController = require("../controllers/challengeController");
const fingerprintController = require("../controllers/fingerprintController");
const analyticsController = require("../controllers/analyticsController");
const reputationController = require("../controllers/reputationController");
const rulesController = require("../controllers/rulesController");
const incidentController = require("../controllers/incidentController");
const captchaController = require("../controllers/captchaController");

// Bot detection routes
router.get("/bots", botController.getAll);
router.get("/bots/:id", botController.getById);
router.post("/bots/detect", botController.detect);
router.put("/bots/:id", botController.update);
router.post("/bots/:id/block", botController.block);
router.post("/bots/:id/allow", botController.allow);
router.get("/bots/statistics/summary", botController.getStatistics);
router.get("/bots/traffic/live", botController.getLiveTraffic);
router.post("/bots/bulk-action", botController.bulkAction);

// Challenge routes
router.get("/challenges", challengeController.getAll);
router.get("/challenges/:id", challengeController.getById);
router.post("/challenges", challengeController.create);
router.put("/challenges/:id", challengeController.update);
router.delete("/challenges/:id", challengeController.delete);
router.post("/challenges/:id/verify", challengeController.verify);
router.get("/challenges/config", challengeController.getConfig);
router.put("/challenges/config", challengeController.updateConfig);

// CAPTCHA verification routes
router.post("/captcha/verify", captchaController.verify);
router.get("/captcha/config", captchaController.getConfig);
router.put("/captcha/config", captchaController.updateConfig);

// Fingerprint routes
router.get("/fingerprints", fingerprintController.getAll);
router.get("/fingerprints/:id", fingerprintController.getById);
router.post("/fingerprints/analyze", fingerprintController.analyze);
router.post("/fingerprints/:id/flag", fingerprintController.flag);
router.get("/fingerprints/compare/:id1/:id2", fingerprintController.compare);
router.get("/fingerprints/clusters", fingerprintController.getClusters);

// IP Reputation routes
router.get("/reputation/ip/:ip", reputationController.checkIP);
router.get("/reputation/comprehensive/:ip", reputationController.getComprehensive);
router.get("/reputation/blacklist", reputationController.getBlacklist);
router.post("/reputation/blacklist", reputationController.addToBlacklist);
router.delete("/reputation/blacklist/:ip", reputationController.removeFromBlacklist);
router.get("/reputation/whitelist", reputationController.getWhitelist);
router.post("/reputation/whitelist", reputationController.addToWhitelist);
router.delete("/reputation/whitelist/:ip", reputationController.removeFromWhitelist);

// Rules engine routes
router.get("/rules", rulesController.getAll);
router.get("/rules/:id", rulesController.getById);
router.post("/rules", rulesController.create);
router.put("/rules/:id", rulesController.update);
router.delete("/rules/:id", rulesController.delete);
router.put("/rules/:id/toggle", rulesController.toggle);
router.post("/rules/test", rulesController.test);
router.put("/rules/reorder", rulesController.reorder);

// Incident routes
router.get("/incidents", incidentController.getAll);
router.get("/incidents/:id", incidentController.getById);
router.post("/incidents", incidentController.create);
router.put("/incidents/:id", incidentController.update);
router.put("/incidents/:id/resolve", incidentController.resolve);
router.get("/incidents/active", incidentController.getActive);
router.get("/incidents/timeline/:id", incidentController.getTimeline);

// Analytics routes
router.get("/analytics/traffic", analyticsController.getTraffic);
router.get("/analytics/bots", analyticsController.getBotBreakdown);
router.get("/analytics/challenges", analyticsController.getChallengeStats);
router.get("/analytics/dashboard", analyticsController.getDashboard);
router.get("/analytics/trends", analyticsController.getTrends);
router.get("/analytics/geographic", analyticsController.getGeographic);
router.get("/analytics/realtime", analyticsController.getRealtime);
router.get("/analytics/threats", analyticsController.getThreats);

// Settings routes
router.get("/settings", analyticsController.getSettings);
router.put("/settings", analyticsController.updateSettings);
router.get("/settings/integrations", analyticsController.getIntegrations);
router.put("/settings/integrations", analyticsController.updateIntegrations);

module.exports = router;
