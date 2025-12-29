/**
 * IdentityShield API - Routes
 */

const express = require("express");
const router = express.Router();

const identityController = require("../controllers/identityController");
const roleController = require("../controllers/roleController");
const permissionController = require("../controllers/permissionController");
const policyController = require("../controllers/policyController");

// Identity routes
router.get("/identities", identityController.getAll);
router.get("/identities/:id", identityController.getById);
router.post("/identities", identityController.create);
router.put("/identities/:id", identityController.update);
router.delete("/identities/:id", identityController.delete);
router.post("/identities/:id/analyze", identityController.analyze);
router.get("/identities/:id/permissions", identityController.getPermissions);
router.get("/identities/:id/activity", identityController.getActivity);
router.get("/identities/risk/summary", identityController.getRiskSummary);

// Role routes
router.get("/roles", roleController.getAll);
router.get("/roles/:id", roleController.getById);
router.post("/roles", roleController.create);
router.put("/roles/:id", roleController.update);
router.delete("/roles/:id", roleController.delete);
router.post("/roles/:id/analyze", roleController.analyzeRole);
router.get("/roles/:id/members", roleController.getMembers);

// Permission routes
router.get("/permissions", permissionController.getAll);
router.get("/permissions/:id", permissionController.getById);
router.post("/permissions", permissionController.create);
router.put("/permissions/:id", permissionController.update);
router.delete("/permissions/:id", permissionController.delete);
router.post("/permissions/analyze", permissionController.analyzePermissions);
router.get("/permissions/unused", permissionController.getUnused);

// Policy routes
router.get("/policies", policyController.getAll);
router.get("/policies/:id", policyController.getById);
router.post("/policies", policyController.create);
router.put("/policies/:id", policyController.update);
router.delete("/policies/:id", policyController.delete);
router.post("/policies/:id/evaluate", policyController.evaluate);
router.post("/policies/:id/simulate", policyController.simulate);

module.exports = router;
