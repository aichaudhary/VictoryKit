const Risk = require("../models/Risk");
const Assessment = require("../models/Assessment");
const Control = require("../models/Control");

// Create risk
exports.create = async (req, res, next) => {
  try {
    const risk = new Risk(req.body);
    await risk.save();

    // Update assessment if linked
    if (risk.assessmentId) {
      await Assessment.findByIdAndUpdate(risk.assessmentId, {
        $push: { risks: risk._id },
        $inc: {
          "summary.totalRisks": 1,
          [`summary.risksByLevel.${risk.inherentRisk.level}`]: 1,
          "summary.risksByStatus.identified": 1,
        },
      });
    }

    res.status(201).json(risk);
  } catch (error) {
    next(error);
  }
};

// Get all risks
exports.getAll = async (req, res, next) => {
  try {
    const {
      assessmentId,
      registerId,
      category,
      level,
      status,
      page = 1,
      limit = 20,
    } = req.query;
    const filter = {};

    if (assessmentId) filter.assessmentId = assessmentId;
    if (registerId) filter.registerId = registerId;
    if (category) filter.category = category;
    if (level) filter["inherentRisk.level"] = level;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [risks, total] = await Promise.all([
      Risk.find(filter)
        .populate("controls.controlId", "name type effectiveness")
        .sort({ "inherentRisk.score": -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Risk.countDocuments(filter),
    ]);

    res.json({
      data: risks,
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

// Get risk by ID
exports.getById = async (req, res, next) => {
  try {
    const risk = await Risk.findById(req.params.id)
      .populate("assessmentId", "name")
      .populate("registerId", "name")
      .populate("controls.controlId");

    if (!risk) {
      return res.status(404).json({ error: "Risk not found" });
    }
    res.json(risk);
  } catch (error) {
    next(error);
  }
};

// Update risk
exports.update = async (req, res, next) => {
  try {
    const risk = await Risk.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!risk) {
      return res.status(404).json({ error: "Risk not found" });
    }
    res.json(risk);
  } catch (error) {
    next(error);
  }
};

// Delete risk
exports.delete = async (req, res, next) => {
  try {
    const risk = await Risk.findByIdAndDelete(req.params.id);

    if (!risk) {
      return res.status(404).json({ error: "Risk not found" });
    }

    // Update assessment
    if (risk.assessmentId) {
      await Assessment.findByIdAndUpdate(risk.assessmentId, {
        $pull: { risks: risk._id },
        $inc: {
          "summary.totalRisks": -1,
          [`summary.risksByLevel.${risk.inherentRisk.level}`]: -1,
          [`summary.risksByStatus.${risk.status}`]: -1,
        },
      });
    }

    res.json({ message: "Risk deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Evaluate risk
exports.evaluate = async (req, res, next) => {
  try {
    const risk = await Risk.findById(req.params.id);

    if (!risk) {
      return res.status(404).json({ error: "Risk not found" });
    }

    // Update likelihood and impact from request
    if (req.body.likelihood) {
      risk.likelihood = { ...risk.likelihood, ...req.body.likelihood };
    }
    if (req.body.impact) {
      risk.impact = { ...risk.impact, ...req.body.impact };
    }

    risk.status = "assessed";
    risk.metadata.lastAssessedDate = new Date();
    await risk.save();

    // Calculate risk matrix position
    const matrix = {
      position: {
        x: risk.likelihood.score,
        y: risk.impact.score,
      },
      zone: risk.inherentRisk.level,
      recommendation: getRecommendation(risk.inherentRisk.level),
    };

    res.json({
      risk,
      evaluation: {
        inherentRisk: risk.inherentRisk,
        residualRisk: risk.residualRisk,
        matrix,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Treat risk
exports.treat = async (req, res, next) => {
  try {
    const risk = await Risk.findById(req.params.id);

    if (!risk) {
      return res.status(404).json({ error: "Risk not found" });
    }

    const { strategy, plan, controlIds, dueDate } = req.body;

    // Update treatment
    risk.treatment = {
      strategy: strategy || risk.treatment?.strategy || "mitigate",
      plan: plan || risk.treatment?.plan,
      status: "in_progress",
      dueDate: dueDate ? new Date(dueDate) : risk.treatment?.dueDate,
    };

    // Link controls if provided
    if (controlIds && controlIds.length > 0) {
      const controls = await Control.find({ _id: { $in: controlIds } });
      risk.controls = controls.map((c) => ({
        controlId: c._id,
        effectiveness: c.effectiveness?.score || 50,
      }));
    }

    risk.status = "treated";
    await risk.save();

    res.json({
      risk,
      message: "Risk treatment applied",
    });
  } catch (error) {
    next(error);
  }
};

function getRecommendation(level) {
  const recommendations = {
    critical: "Immediate action required. Escalate to senior management.",
    high: "Prioritize treatment within 30 days.",
    medium: "Plan treatment within 90 days.",
    low: "Monitor and review periodically.",
    informational: "Accept and document.",
  };
  return recommendations[level] || "Review and assess.";
}
