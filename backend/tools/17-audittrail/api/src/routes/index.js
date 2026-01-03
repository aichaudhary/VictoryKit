/**
 * AuditTrail API - Routes
 * Enhanced with real-time events and advanced search
 */

const express = require("express");
const router = express.Router();

const auditLogController = require("../controllers/auditLogController");
const logSourceController = require("../controllers/logSourceController");
const alertRuleController = require("../controllers/alertRuleController");
const reportController = require("../controllers/reportController");
const searchController = require("../controllers/searchController");
const alertController = require("../controllers/alertController");
const statsController = require("../controllers/statsController");

// ===========================================
// Audit Log routes
// ===========================================
router.get("/logs", auditLogController.getAll);
router.get("/logs/:id", auditLogController.getById);
router.post("/logs", auditLogController.create);
router.post("/logs/batch", auditLogController.createBatch);
router.get("/logs/verify/:id", auditLogController.verifyIntegrity);

// Events endpoint (for frontend compatibility)
router.get("/events", auditLogController.getEvents);
router.get("/events/stream", auditLogController.getEventStream);

// ===========================================
// Advanced Search routes
// ===========================================
router.get("/search", searchController.search);
router.post("/search", searchController.search);
router.get("/search/suggestions", searchController.getSuggestions);
router.get("/search/filters", searchController.getFilterOptions);
router.get("/search/correlated/:correlationId", searchController.findCorrelated);
router.get("/search/actor/:actorId/timeline", searchController.getActorTimeline);
router.get("/search/resource/:resourceType/:resourceId", searchController.getResourceHistory);

// ===========================================
// Log Source routes
// ===========================================
router.get("/sources", logSourceController.getAll);
router.get("/sources/:id", logSourceController.getById);
router.post("/sources", logSourceController.create);
router.put("/sources/:id", logSourceController.update);
router.delete("/sources/:id", logSourceController.delete);
router.post("/sources/:id/test", logSourceController.testConnection);

// ===========================================
// Alert Rule routes (CRUD)
// ===========================================
router.get("/rules", alertRuleController.getAll);
router.get("/rules/:id", alertRuleController.getById);
router.post("/rules", alertRuleController.create);
router.put("/rules/:id", alertRuleController.update);
router.delete("/rules/:id", alertRuleController.delete);
router.post("/rules/:id/toggle", alertRuleController.toggle);

// ===========================================
// Active Alerts routes
// ===========================================
router.get("/alerts", alertController.getActiveAlerts);
router.get("/alerts/history", alertController.getAlertHistory);
router.get("/alerts/stats", alertController.getAlertStats);
router.post("/alerts/:id/acknowledge", alertController.acknowledgeAlert);
router.post("/alerts/:id/resolve", alertController.resolveAlert);

// Legacy alert routes for compatibility
router.get("/alerts/rules", alertRuleController.getAll);
router.get("/alerts/rules/:id", alertRuleController.getById);
router.post("/alerts/rules", alertRuleController.create);
router.put("/alerts/rules/:id", alertRuleController.update);
router.delete("/alerts/rules/:id", alertRuleController.delete);
router.get("/alerts/triggered", alertController.getActiveAlerts);

// ===========================================
// Report routes
// ===========================================
router.get("/reports", reportController.getAll);
router.get("/reports/templates", reportController.getTemplates);
router.get("/reports/:id", reportController.getById);
router.post("/reports", reportController.create);
router.post("/reports/generate", reportController.generate);
router.get("/reports/executive-summary", reportController.getExecutiveSummary);
router.delete("/reports/:id", reportController.delete);

// ===========================================
// Dashboard & Stats routes
// ===========================================
router.get("/dashboard", statsController.getDashboard);
router.get("/stats", statsController.getStats);
router.get("/stats/timeline", statsController.getTimeline);
router.get("/stats/actors", statsController.getTopActors);
router.get("/stats/resources", statsController.getTopResources);
router.get("/stats/risk", statsController.getRiskDistribution);

// ===========================================
// Integrity & Compliance routes
// ===========================================
router.get("/integrity/verify", auditLogController.verifyChainIntegrity);
router.get("/integrity/status", auditLogController.getIntegrityStatus);

module.exports = router;
