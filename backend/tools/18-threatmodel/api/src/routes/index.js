const express = require("express");
const router = express.Router();

const threatModelController = require("../controllers/threatModelController");
const threatController = require("../controllers/threatController");
const mitigationController = require("../controllers/mitigationController");
const componentController = require("../controllers/componentController");

// Threat Model routes
router.post("/threat-models", threatModelController.create);
router.get("/threat-models", threatModelController.getAll);
router.get("/threat-models/:id", threatModelController.getById);
router.put("/threat-models/:id", threatModelController.update);
router.delete("/threat-models/:id", threatModelController.delete);
router.post("/threat-models/:id/analyze", threatModelController.analyze);
router.post("/threat-models/:id/stride", threatModelController.analyzeSTRIDE);
router.post("/threat-models/:id/pasta", threatModelController.analyzePASTA);
router.get("/threat-models/:id/report", threatModelController.generateReport);
router.get("/dashboard", threatModelController.getDashboard);

// Threat routes
router.post("/threats", threatController.create);
router.get("/threats", threatController.getAll);
router.get("/threats/:id", threatController.getById);
router.put("/threats/:id", threatController.update);
router.delete("/threats/:id", threatController.delete);
router.post("/threats/:id/assess", threatController.assessRisk);

// Mitigation routes
router.post("/mitigations", mitigationController.create);
router.get("/mitigations", mitigationController.getAll);
router.get("/mitigations/:id", mitigationController.getById);
router.put("/mitigations/:id", mitigationController.update);
router.delete("/mitigations/:id", mitigationController.delete);
router.post("/mitigations/:id/apply", mitigationController.apply);

// Component routes
router.post("/components", componentController.create);
router.get("/components", componentController.getAll);
router.get("/components/:id", componentController.getById);
router.put("/components/:id", componentController.update);
router.delete("/components/:id", componentController.delete);
router.get("/components/:id/threats", componentController.getThreats);

module.exports = router;
