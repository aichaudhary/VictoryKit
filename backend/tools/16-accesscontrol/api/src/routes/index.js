/**
 * AccessControl API - Routes
 */

const express = require("express");
const router = express.Router();

const policyController = require("../controllers/policyController");
const roleController = require("../controllers/roleController");
const permissionController = require("../controllers/permissionController");
const assignmentController = require("../controllers/assignmentController");

// Policy routes
router.get("/policies", policyController.getAll);
router.get("/policies/:id", policyController.getById);
router.post("/policies", policyController.create);
router.put("/policies/:id", policyController.update);
router.delete("/policies/:id", policyController.delete);
router.post("/policies/evaluate", policyController.evaluate);
router.post("/policies/analyze", policyController.analyze);

// Role routes
router.get("/roles", roleController.getAll);
router.get("/roles/:id", roleController.getById);
router.post("/roles", roleController.create);
router.put("/roles/:id", roleController.update);
router.delete("/roles/:id", roleController.delete);
router.get("/roles/:id/members", roleController.getMembers);

// Permission routes
router.get("/permissions", permissionController.getAll);
router.get("/permissions/:id", permissionController.getById);
router.post("/permissions", permissionController.create);
router.put("/permissions/:id", permissionController.update);
router.delete("/permissions/:id", permissionController.delete);

// Assignment routes
router.get("/assignments", assignmentController.getAll);
router.get("/assignments/:id", assignmentController.getById);
router.post("/assignments", assignmentController.create);
router.delete("/assignments/:id", assignmentController.revoke);
router.post("/assignments/:id/approve", assignmentController.approve);

// Dashboard
router.get("/dashboard", policyController.getDashboard);

module.exports = router;
