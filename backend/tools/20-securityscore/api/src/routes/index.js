const express = require("express");
const router = express.Router();

const scoreController = require("../controllers/scoreController");
const metricController = require("../controllers/metricController");
const benchmarkController = require("../controllers/benchmarkController");
const improvementController = require("../controllers/improvementController");

// Score routes
router.post("/scores", scoreController.create);
router.get("/scores", scoreController.getAll);
router.get("/scores/:id", scoreController.getById);
router.put("/scores/:id", scoreController.update);
router.delete("/scores/:id", scoreController.delete);
router.post("/scores/:id/calculate", scoreController.calculate);
router.get("/scores/:id/breakdown", scoreController.getBreakdown);
router.get("/scores/:id/trend", scoreController.getTrend);
router.get("/dashboard", scoreController.getDashboard);

// Metric routes
router.post("/metrics", metricController.create);
router.get("/metrics", metricController.getAll);
router.get("/metrics/:id", metricController.getById);
router.put("/metrics/:id", metricController.update);
router.delete("/metrics/:id", metricController.delete);
router.post("/metrics/:id/collect", metricController.collectData);

// Benchmark routes
router.post("/benchmarks", benchmarkController.create);
router.get("/benchmarks", benchmarkController.getAll);
router.get("/benchmarks/:id", benchmarkController.getById);
router.put("/benchmarks/:id", benchmarkController.update);
router.delete("/benchmarks/:id", benchmarkController.delete);
router.post("/benchmarks/:id/compare", benchmarkController.compare);

// Improvement routes
router.post("/improvements", improvementController.create);
router.get("/improvements", improvementController.getAll);
router.get("/improvements/:id", improvementController.getById);
router.put("/improvements/:id", improvementController.update);
router.delete("/improvements/:id", improvementController.delete);
router.post("/improvements/:id/implement", improvementController.implement);
router.get(
  "/improvements/recommendations",
  improvementController.getRecommendations
);

module.exports = router;
