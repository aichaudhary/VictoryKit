const express = require("express");
const router = express.Router();

const apiController = require("../controllers/apiController");
const endpointController = require("../controllers/endpointController");
const policyController = require("../controllers/policyController");
const analyticsController = require("../controllers/analyticsController");

// API routes
router.post("/apis", apiController.create);
router.get("/apis", apiController.getAll);
router.get("/apis/:id", apiController.getById);
router.put("/apis/:id", apiController.update);
router.delete("/apis/:id", apiController.delete);
router.post("/apis/:id/discover", apiController.discover);
router.get("/apis/:id/security-score", apiController.getSecurityScore);

// Endpoint routes
router.post("/endpoints", endpointController.create);
router.get("/endpoints", endpointController.getAll);
router.get("/endpoints/:id", endpointController.getById);
router.put("/endpoints/:id", endpointController.update);
router.delete("/endpoints/:id", endpointController.delete);
router.post("/endpoints/:id/scan", endpointController.scan);

// Policy routes
router.post("/policies", policyController.create);
router.get("/policies", policyController.getAll);
router.get("/policies/:id", policyController.getById);
router.put("/policies/:id", policyController.update);
router.delete("/policies/:id", policyController.delete);
router.post("/policies/:id/apply", policyController.apply);
router.post("/policies/:id/validate", policyController.validate);

// Analytics routes
router.get("/analytics/usage", analyticsController.getUsage);
router.get("/analytics/security", analyticsController.getSecurity);
router.get("/analytics/anomalies", analyticsController.getAnomalies);
router.get("/dashboard", analyticsController.getDashboard);

module.exports = router;
