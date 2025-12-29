const express = require("express");
const router = express.Router();

const assessmentController = require("../controllers/assessmentController");
const riskController = require("../controllers/riskController");
const controlController = require("../controllers/controlController");
const registerController = require("../controllers/registerController");

// Assessment routes
router.post("/assessments", assessmentController.create);
router.get("/assessments", assessmentController.getAll);
router.get("/assessments/:id", assessmentController.getById);
router.put("/assessments/:id", assessmentController.update);
router.delete("/assessments/:id", assessmentController.delete);
router.post("/assessments/:id/calculate", assessmentController.calculateRisk);
router.post("/assessments/:id/analyze", assessmentController.analyze);
router.get("/assessments/:id/report", assessmentController.generateReport);
router.get("/dashboard", assessmentController.getDashboard);

// Risk routes
router.post("/risks", riskController.create);
router.get("/risks", riskController.getAll);
router.get("/risks/:id", riskController.getById);
router.put("/risks/:id", riskController.update);
router.delete("/risks/:id", riskController.delete);
router.post("/risks/:id/evaluate", riskController.evaluate);
router.post("/risks/:id/treat", riskController.treat);

// Control routes
router.post("/controls", controlController.create);
router.get("/controls", controlController.getAll);
router.get("/controls/:id", controlController.getById);
router.put("/controls/:id", controlController.update);
router.delete("/controls/:id", controlController.delete);
router.post("/controls/:id/test", controlController.testEffectiveness);

// Risk Register routes
router.post("/registers", registerController.create);
router.get("/registers", registerController.getAll);
router.get("/registers/:id", registerController.getById);
router.put("/registers/:id", registerController.update);
router.delete("/registers/:id", registerController.delete);
router.get("/registers/:id/risks", registerController.getRisks);
router.post("/registers/:id/export", registerController.export);

module.exports = router;
