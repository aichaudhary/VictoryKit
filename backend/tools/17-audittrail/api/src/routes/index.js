/**
 * AuditTrail API - Routes
 */

const express = require("express");
const router = express.Router();

const auditLogController = require("../controllers/auditLogController");
const logSourceController = require("../controllers/logSourceController");
const alertRuleController = require("../controllers/alertRuleController");
const reportController = require("../controllers/reportController");

// Audit Log routes
router.get("/logs", auditLogController.getAll);
router.get("/logs/:id", auditLogController.getById);
router.post("/logs", auditLogController.create);
router.post("/logs/batch", auditLogController.createBatch);
router.get("/logs/search", auditLogController.search);
router.post("/logs/analyze", auditLogController.analyze);
router.get("/logs/verify/:id", auditLogController.verifyIntegrity);

// Log Source routes
router.get("/sources", logSourceController.getAll);
router.get("/sources/:id", logSourceController.getById);
router.post("/sources", logSourceController.create);
router.put("/sources/:id", logSourceController.update);
router.delete("/sources/:id", logSourceController.delete);

// Alert Rule routes
router.get("/alerts/rules", alertRuleController.getAll);
router.get("/alerts/rules/:id", alertRuleController.getById);
router.post("/alerts/rules", alertRuleController.create);
router.put("/alerts/rules/:id", alertRuleController.update);
router.delete("/alerts/rules/:id", alertRuleController.delete);
router.get("/alerts/triggered", alertRuleController.getTriggeredAlerts);

// Report routes
router.get("/reports", reportController.getAll);
router.get("/reports/:id", reportController.getById);
router.post("/reports", reportController.create);
router.post("/reports/generate", reportController.generate);

// Dashboard
router.get("/dashboard", auditLogController.getDashboard);

module.exports = router;
