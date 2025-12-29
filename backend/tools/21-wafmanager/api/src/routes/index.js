const express = require("express");
const router = express.Router();

const wafController = require("../controllers/wafController");
const ruleController = require("../controllers/ruleController");
const policyController = require("../controllers/policyController");
const eventController = require("../controllers/eventController");

// WAF Instance routes
router.post("/instances", wafController.create);
router.get("/instances", wafController.getAll);
router.get("/instances/:id", wafController.getById);
router.put("/instances/:id", wafController.update);
router.delete("/instances/:id", wafController.delete);
router.post("/instances/:id/sync", wafController.sync);
router.get("/dashboard", wafController.getDashboard);

// Rule routes
router.post("/rules", ruleController.create);
router.get("/rules", ruleController.getAll);
router.get("/rules/:id", ruleController.getById);
router.put("/rules/:id", ruleController.update);
router.delete("/rules/:id", ruleController.delete);
router.post("/rules/:id/deploy", ruleController.deploy);
router.post("/rules/optimize", ruleController.optimize);

// Policy routes
router.post("/policies", policyController.create);
router.get("/policies", policyController.getAll);
router.get("/policies/:id", policyController.getById);
router.put("/policies/:id", policyController.update);
router.delete("/policies/:id", policyController.delete);
router.post("/policies/:id/apply", policyController.apply);

// Event routes
router.get("/events", eventController.getAll);
router.get("/events/:id", eventController.getById);
router.patch("/events/:id", eventController.update);
router.get("/events/analytics", eventController.getAnalytics);

module.exports = router;
