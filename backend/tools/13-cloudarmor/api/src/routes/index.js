/**
 * CloudArmor API Routes
 */

const express = require("express");
const router = express.Router();

const cloudAccountController = require("./controllers/cloudAccountController");
const resourceController = require("./controllers/resourceController");
const findingController = require("./controllers/findingController");
const policyController = require("./controllers/policyController");

// Cloud account management
router.get("/accounts", cloudAccountController.getAll);
router.get("/accounts/:id", cloudAccountController.getById);
router.post("/accounts", cloudAccountController.create);
router.put("/accounts/:id", cloudAccountController.update);
router.delete("/accounts/:id", cloudAccountController.delete);
router.post("/accounts/:id/scan", cloudAccountController.triggerScan);
router.get("/accounts/:id/status", cloudAccountController.getStatus);

// Cloud resources
router.get("/resources", resourceController.getAll);
router.get("/resources/:id", resourceController.getById);
router.get("/resources/:id/findings", resourceController.getFindings);
router.post("/resources/scan", resourceController.scan);
router.get("/resources/types", resourceController.getTypes);

// Security findings
router.get("/findings", findingController.getAll);
router.get("/findings/:id", findingController.getById);
router.put("/findings/:id/remediate", findingController.remediate);
router.put("/findings/:id/suppress", findingController.suppress);
router.post("/findings/analyze", findingController.analyze);
router.get("/findings/stats", findingController.getStats);

// Security policies
router.get("/policies", policyController.getAll);
router.get("/policies/:id", policyController.getById);
router.post("/policies", policyController.create);
router.put("/policies/:id", policyController.update);
router.delete("/policies/:id", policyController.delete);
router.post("/policies/:id/evaluate", policyController.evaluate);

// Dashboard
router.get("/dashboard", cloudAccountController.getDashboard);

module.exports = router;
