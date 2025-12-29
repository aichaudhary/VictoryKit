const Benchmark = require("../models/Benchmark");
const SecurityScore = require("../models/SecurityScore");

// Create benchmark
exports.create = async (req, res, next) => {
  try {
    const benchmark = new Benchmark(req.body);
    await benchmark.save();
    res.status(201).json(benchmark);
  } catch (error) {
    next(error);
  }
};

// Get all benchmarks
exports.getAll = async (req, res, next) => {
  try {
    const { type, industry, size, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (industry) filter.industry = industry;
    if (size) filter.size = size;

    const skip = (page - 1) * limit;
    const [benchmarks, total] = await Promise.all([
      Benchmark.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Benchmark.countDocuments(filter),
    ]);

    res.json({
      data: benchmarks,
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

// Get benchmark by ID
exports.getById = async (req, res, next) => {
  try {
    const benchmark = await Benchmark.findById(req.params.id);
    if (!benchmark) {
      return res.status(404).json({ error: "Benchmark not found" });
    }
    res.json(benchmark);
  } catch (error) {
    next(error);
  }
};

// Update benchmark
exports.update = async (req, res, next) => {
  try {
    const benchmark = await Benchmark.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!benchmark) {
      return res.status(404).json({ error: "Benchmark not found" });
    }
    res.json(benchmark);
  } catch (error) {
    next(error);
  }
};

// Delete benchmark
exports.delete = async (req, res, next) => {
  try {
    const benchmark = await Benchmark.findByIdAndDelete(req.params.id);
    if (!benchmark) {
      return res.status(404).json({ error: "Benchmark not found" });
    }
    res.json({ message: "Benchmark deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Compare score against benchmark
exports.compare = async (req, res, next) => {
  try {
    const benchmark = await Benchmark.findById(req.params.id);
    if (!benchmark) {
      return res.status(404).json({ error: "Benchmark not found" });
    }

    const { scoreId } = req.body;
    const score = await SecurityScore.findById(scoreId);
    if (!score) {
      return res.status(404).json({ error: "Security score not found" });
    }

    const categories = [
      "network",
      "endpoint",
      "identity",
      "data",
      "application",
      "cloud",
      "compliance",
    ];
    const comparison = {
      overall: {
        yourScore: score.overallScore.value,
        benchmark: benchmark.scores.overall,
        difference: score.overallScore.value - benchmark.scores.overall,
        percentile: calculatePercentile(
          score.overallScore.value,
          benchmark.percentiles
        ),
      },
      categories: {},
    };

    for (const cat of categories) {
      const yourScore = score.categories?.[cat]?.score || 0;
      const benchmarkScore = benchmark.scores?.[cat] || 0;
      comparison.categories[cat] = {
        yourScore,
        benchmark: benchmarkScore,
        difference: yourScore - benchmarkScore,
        status: yourScore >= benchmarkScore ? "above" : "below",
      };
    }

    // Recommendations
    const belowBenchmark = categories.filter(
      (cat) =>
        (score.categories?.[cat]?.score || 0) < (benchmark.scores?.[cat] || 0)
    );

    comparison.recommendations = belowBenchmark.map((cat) => ({
      category: cat,
      gap:
        (benchmark.scores?.[cat] || 0) - (score.categories?.[cat]?.score || 0),
      action: `Improve ${cat} security to reach industry benchmark`,
    }));

    comparison.summary = {
      categoriesAbove: categories.length - belowBenchmark.length,
      categoriesBelow: belowBenchmark.length,
      overallStatus:
        score.overallScore.value >= benchmark.scores.overall
          ? "Above Benchmark"
          : "Below Benchmark",
    };

    res.json(comparison);
  } catch (error) {
    next(error);
  }
};

function calculatePercentile(score, percentiles) {
  if (!percentiles) return 50;
  if (score >= percentiles.p90) return 90;
  if (score >= percentiles.p75) return 75;
  if (score >= percentiles.p50) return 50;
  if (score >= percentiles.p25) return 25;
  return 10;
}
