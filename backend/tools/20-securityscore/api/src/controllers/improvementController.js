const Improvement = require("../models/Improvement");
const Metric = require("../models/Metric");
const SecurityScore = require("../models/SecurityScore");

// Create improvement
exports.create = async (req, res, next) => {
  try {
    const improvement = new Improvement(req.body);
    await improvement.save();
    res.status(201).json(improvement);
  } catch (error) {
    next(error);
  }
};

// Get all improvements
exports.getAll = async (req, res, next) => {
  try {
    const { category, priority, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [improvements, total] = await Promise.all([
      Improvement.find(filter)
        .sort({ priority: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Improvement.countDocuments(filter),
    ]);

    res.json({
      data: improvements,
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

// Get improvement by ID
exports.getById = async (req, res, next) => {
  try {
    const improvement = await Improvement.findById(req.params.id).populate(
      "metrics.metricId"
    );
    if (!improvement) {
      return res.status(404).json({ error: "Improvement not found" });
    }
    res.json(improvement);
  } catch (error) {
    next(error);
  }
};

// Update improvement
exports.update = async (req, res, next) => {
  try {
    const improvement = await Improvement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!improvement) {
      return res.status(404).json({ error: "Improvement not found" });
    }
    res.json(improvement);
  } catch (error) {
    next(error);
  }
};

// Delete improvement
exports.delete = async (req, res, next) => {
  try {
    const improvement = await Improvement.findByIdAndDelete(req.params.id);
    if (!improvement) {
      return res.status(404).json({ error: "Improvement not found" });
    }
    res.json({ message: "Improvement deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Implement improvement
exports.implement = async (req, res, next) => {
  try {
    const improvement = await Improvement.findById(req.params.id);
    if (!improvement) {
      return res.status(404).json({ error: "Improvement not found" });
    }

    const { evidence, validatedBy } = req.body;

    improvement.status = "completed";
    improvement.implementation.completedDate = new Date();
    improvement.validation = {
      method: "manual_verification",
      evidence: evidence || "Improvement implemented",
      validatedBy: validatedBy || "system",
      validatedDate: new Date(),
    };

    await improvement.save();

    res.json({
      improvement,
      message: "Improvement implemented successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get recommendations
exports.getRecommendations = async (req, res, next) => {
  try {
    const { scoreId } = req.query;

    // Get metrics with low scores
    const criticalMetrics = await Metric.find({
      "score.status": { $in: ["critical", "warning"] },
    });

    const recommendations = [];
    const categories = [
      "network",
      "endpoint",
      "identity",
      "data",
      "application",
      "cloud",
      "compliance",
    ];

    // Group by category
    const byCategory = {};
    for (const metric of criticalMetrics) {
      const cat = metric.category;
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(metric);
    }

    // Generate recommendations
    for (const cat of categories) {
      const metrics = byCategory[cat] || [];
      if (metrics.length === 0) continue;

      const avgScore =
        metrics.reduce((sum, m) => sum + (m.score?.value || 0), 0) /
        metrics.length;
      const potentialIncrease = 100 - avgScore;

      recommendations.push({
        category: cat,
        priority:
          avgScore < 50 ? "critical" : avgScore < 70 ? "high" : "medium",
        affectedMetrics: metrics.length,
        currentScore: Math.round(avgScore),
        potentialIncrease: Math.round(potentialIncrease * 0.5),
        suggestions: getImprovementSuggestions(cat, metrics),
        quickWins: getQuickWins(cat),
      });
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    recommendations.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );

    res.json({
      recommendations,
      summary: {
        totalCategories: recommendations.length,
        criticalCount: recommendations.filter((r) => r.priority === "critical")
          .length,
        estimatedScoreIncrease: Math.round(
          recommendations.reduce((sum, r) => sum + r.potentialIncrease, 0) /
            Math.max(recommendations.length, 1)
        ),
      },
    });
  } catch (error) {
    next(error);
  }
};

function getImprovementSuggestions(category, metrics) {
  const suggestions = {
    network: [
      "Implement network segmentation",
      "Enable intrusion detection/prevention",
      "Review firewall rules",
    ],
    endpoint: [
      "Deploy EDR solution",
      "Enable full disk encryption",
      "Update endpoint protection",
    ],
    identity: [
      "Enable MFA for all users",
      "Implement privileged access management",
      "Review access permissions",
    ],
    data: [
      "Encrypt sensitive data at rest",
      "Implement DLP controls",
      "Enable data classification",
    ],
    application: [
      "Perform security testing",
      "Enable WAF protection",
      "Update vulnerable dependencies",
    ],
    cloud: [
      "Enable CSPM monitoring",
      "Review IAM policies",
      "Enable logging and monitoring",
    ],
    compliance: [
      "Complete compliance assessment",
      "Document security controls",
      "Schedule regular audits",
    ],
  };
  return suggestions[category] || [];
}

function getQuickWins(category) {
  const quickWins = {
    network: ["Enable logging on firewalls", "Block known malicious IPs"],
    endpoint: ["Enable automatic updates", "Configure screen lock policies"],
    identity: ["Enforce password complexity", "Review inactive accounts"],
    data: ["Enable access logging", "Review sharing permissions"],
    application: ["Update to latest versions", "Remove unused applications"],
    cloud: ["Enable MFA for admin accounts", "Review public access"],
    compliance: [
      "Update policy documentation",
      "Complete security awareness training",
    ],
  };
  return quickWins[category] || [];
}
