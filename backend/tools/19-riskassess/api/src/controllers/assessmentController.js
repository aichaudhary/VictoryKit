const Assessment = require("../models/Assessment");
const Risk = require("../models/Risk");
const riskService = require("../services/riskService");

// Create assessment
exports.create = async (req, res, next) => {
  try {
    const assessment = new Assessment(req.body);
    await assessment.save();
    res.status(201).json(assessment);
  } catch (error) {
    next(error);
  }
};

// Get all assessments
exports.getAll = async (req, res, next) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [assessments, total] = await Promise.all([
      Assessment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Assessment.countDocuments(filter),
    ]);

    res.json({
      data: assessments,
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

// Get assessment by ID
exports.getById = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate("risks")
      .populate("controls");

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }
    res.json(assessment);
  } catch (error) {
    next(error);
  }
};

// Update assessment
exports.update = async (req, res, next) => {
  try {
    const assessment = await Assessment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }
    res.json(assessment);
  } catch (error) {
    next(error);
  }
};

// Delete assessment
exports.delete = async (req, res, next) => {
  try {
    const assessment = await Assessment.findByIdAndDelete(req.params.id);

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }
    res.json({ message: "Assessment deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Calculate risk for assessment
exports.calculateRisk = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate("risks")
      .populate("controls");

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    const calculation = await riskService.calculateAssessmentRisk(assessment);

    // Update summary
    assessment.summary = calculation.summary;
    await assessment.save();

    res.json(calculation);
  } catch (error) {
    next(error);
  }
};

// Analyze assessment
exports.analyze = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate("risks")
      .populate("controls");

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    const analysis = await riskService.analyzeAssessment(assessment);
    res.json(analysis);
  } catch (error) {
    next(error);
  }
};

// Generate report
exports.generateReport = async (req, res, next) => {
  try {
    const { format = "json" } = req.query;
    const assessment = await Assessment.findById(req.params.id)
      .populate("risks")
      .populate("controls");

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    const report = await riskService.generateReport(assessment, format);
    res.json(report);
  } catch (error) {
    next(error);
  }
};

// Get dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const [assessments, risks] = await Promise.all([
      Assessment.find().select("name type status summary createdAt"),
      Risk.find().select("category inherentRisk residualRisk status treatment"),
    ]);

    const dashboard = {
      overview: {
        totalAssessments: assessments.length,
        totalRisks: risks.length,
        byAssessmentStatus: assessments.reduce((acc, a) => {
          acc[a.status] = (acc[a.status] || 0) + 1;
          return acc;
        }, {}),
      },
      riskProfile: {
        byLevel: risks.reduce((acc, r) => {
          const level = r.residualRisk?.level || "unknown";
          acc[level] = (acc[level] || 0) + 1;
          return acc;
        }, {}),
        byCategory: risks.reduce((acc, r) => {
          acc[r.category] = (acc[r.category] || 0) + 1;
          return acc;
        }, {}),
        byTreatment: risks.reduce((acc, r) => {
          const strategy = r.treatment?.strategy || "unknown";
          acc[strategy] = (acc[strategy] || 0) + 1;
          return acc;
        }, {}),
      },
      topRisks: risks
        .filter(
          (r) =>
            r.residualRisk?.level === "critical" ||
            r.residualRisk?.level === "high"
        )
        .slice(0, 10)
        .map((r) => ({
          id: r._id,
          category: r.category,
          level: r.residualRisk?.level,
          score: r.residualRisk?.score,
        })),
      recentAssessments: assessments
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5),
    };

    res.json(dashboard);
  } catch (error) {
    next(error);
  }
};
