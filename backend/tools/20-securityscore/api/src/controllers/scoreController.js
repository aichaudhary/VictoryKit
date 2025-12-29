const SecurityScore = require("../models/SecurityScore");
const Metric = require("../models/Metric");
const scoreService = require("../services/scoreService");

// Create score
exports.create = async (req, res, next) => {
  try {
    const score = new SecurityScore(req.body);
    await score.save();
    res.status(201).json(score);
  } catch (error) {
    next(error);
  }
};

// Get all scores
exports.getAll = async (req, res, next) => {
  try {
    const { entityType, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (entityType) filter.entityType = entityType;

    const skip = (page - 1) * limit;
    const [scores, total] = await Promise.all([
      SecurityScore.find(filter)
        .sort({ "overallScore.value": -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      SecurityScore.countDocuments(filter),
    ]);

    res.json({
      data: scores,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get score by ID
exports.getById = async (req, res, next) => {
  try {
    const score = await SecurityScore.findById(req.params.id)
      .populate("improvements")
      .populate("benchmarks");

    if (!score) {
      return res.status(404).json({ error: "Security score not found" });
    }
    res.json(score);
  } catch (error) {
    next(error);
  }
};

// Update score
exports.update = async (req, res, next) => {
  try {
    const score = await SecurityScore.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!score) {
      return res.status(404).json({ error: "Security score not found" });
    }
    res.json(score);
  } catch (error) {
    next(error);
  }
};

// Delete score
exports.delete = async (req, res, next) => {
  try {
    const score = await SecurityScore.findByIdAndDelete(req.params.id);
    if (!score) {
      return res.status(404).json({ error: "Security score not found" });
    }
    res.json({ message: "Security score deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Calculate score
exports.calculate = async (req, res, next) => {
  try {
    const score = await SecurityScore.findById(req.params.id);
    if (!score) {
      return res.status(404).json({ error: "Security score not found" });
    }

    // Get all metrics
    const metrics = await Metric.find();

    // Calculate score
    const calculation = await scoreService.calculateScore(score, metrics);

    // Update score
    score.overallScore.value = calculation.overallScore;
    score.categories = calculation.categories;
    score.risks = calculation.risks;
    score.schedule.lastCalculated = new Date();

    // Add to history
    score.history.push({
      date: new Date(),
      score: calculation.overallScore,
      grade: score.overallScore.grade,
      categories: calculation.categories,
    });

    await score.save();

    res.json({
      score,
      calculation,
    });
  } catch (error) {
    next(error);
  }
};

// Get score breakdown
exports.getBreakdown = async (req, res, next) => {
  try {
    const score = await SecurityScore.findById(req.params.id);
    if (!score) {
      return res.status(404).json({ error: "Security score not found" });
    }

    const metrics = await Metric.find();
    const breakdown = scoreService.getBreakdown(score, metrics);

    res.json(breakdown);
  } catch (error) {
    next(error);
  }
};

// Get score trend
exports.getTrend = async (req, res, next) => {
  try {
    const { period = "30d" } = req.query;
    const score = await SecurityScore.findById(req.params.id);

    if (!score) {
      return res.status(404).json({ error: "Security score not found" });
    }

    const trend = scoreService.analyzeTrend(score.history, period);
    res.json(trend);
  } catch (error) {
    next(error);
  }
};

// Get dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const [scores, metrics] = await Promise.all([
      SecurityScore.find().select("name entityType overallScore categories"),
      Metric.find().select("name category score trend"),
    ]);

    const dashboard = {
      summary: {
        totalEntities: scores.length,
        averageScore:
          scores.length > 0
            ? Math.round(
                scores.reduce((sum, s) => sum + s.overallScore.value, 0) /
                  scores.length
              )
            : 0,
        gradeDistribution: scores.reduce((acc, s) => {
          const grade = s.overallScore.grade || "F";
          acc[grade] = (acc[grade] || 0) + 1;
          return acc;
        }, {}),
      },
      topPerformers: scores
        .sort((a, b) => b.overallScore.value - a.overallScore.value)
        .slice(0, 5)
        .map((s) => ({
          name: s.name,
          score: s.overallScore.value,
          grade: s.overallScore.grade,
        })),
      needsAttention: scores
        .filter((s) => s.overallScore.value < 70)
        .map((s) => ({
          name: s.name,
          score: s.overallScore.value,
          grade: s.overallScore.grade,
        })),
      categoryAverages: calculateCategoryAverages(scores),
      criticalMetrics: metrics
        .filter((m) => m.score?.status === "critical")
        .map((m) => ({
          name: m.name,
          category: m.category,
          score: m.score?.value,
        })),
    };

    res.json(dashboard);
  } catch (error) {
    next(error);
  }
};

function calculateCategoryAverages(scores) {
  const categories = [
    "network",
    "endpoint",
    "identity",
    "data",
    "application",
    "cloud",
    "compliance",
  ];
  const averages = {};

  for (const cat of categories) {
    const values = scores
      .filter((s) => s.categories?.[cat]?.score)
      .map((s) => s.categories[cat].score);
    averages[cat] =
      values.length > 0
        ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
        : 0;
  }

  return averages;
}
