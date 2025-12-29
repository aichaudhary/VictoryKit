const Threat = require("../models/Threat");
const ThreatModel = require("../models/ThreatModel");

// Create threat
exports.create = async (req, res, next) => {
  try {
    const threat = new Threat(req.body);
    await threat.save();

    // Update threat model
    if (threat.threatModelId) {
      await ThreatModel.findByIdAndUpdate(threat.threatModelId, {
        $push: { threats: threat._id },
        $inc: {
          "riskSummary.totalThreats": 1,
          [`riskSummary.${threat.riskLevel}`]: 1,
        },
      });
    }

    res.status(201).json(threat);
  } catch (error) {
    next(error);
  }
};

// Get all threats
exports.getAll = async (req, res, next) => {
  try {
    const {
      threatModelId,
      category,
      riskLevel,
      status,
      page = 1,
      limit = 20,
    } = req.query;
    const filter = {};

    if (threatModelId) filter.threatModelId = threatModelId;
    if (category) filter.category = category;
    if (riskLevel) filter.riskLevel = riskLevel;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [threats, total] = await Promise.all([
      Threat.find(filter)
        .populate("affectedComponents")
        .populate("mitigations")
        .sort({ riskScore: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Threat.countDocuments(filter),
    ]);

    res.json({
      data: threats,
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

// Get threat by ID
exports.getById = async (req, res, next) => {
  try {
    const threat = await Threat.findById(req.params.id)
      .populate("threatModelId", "name")
      .populate("affectedComponents")
      .populate("mitigations");

    if (!threat) {
      return res.status(404).json({ error: "Threat not found" });
    }
    res.json(threat);
  } catch (error) {
    next(error);
  }
};

// Update threat
exports.update = async (req, res, next) => {
  try {
    const oldThreat = await Threat.findById(req.params.id);
    const threat = await Threat.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!threat) {
      return res.status(404).json({ error: "Threat not found" });
    }

    // Update risk summary if risk level changed
    if (oldThreat && oldThreat.riskLevel !== threat.riskLevel) {
      await ThreatModel.findByIdAndUpdate(threat.threatModelId, {
        $inc: {
          [`riskSummary.${oldThreat.riskLevel}`]: -1,
          [`riskSummary.${threat.riskLevel}`]: 1,
        },
      });
    }

    res.json(threat);
  } catch (error) {
    next(error);
  }
};

// Delete threat
exports.delete = async (req, res, next) => {
  try {
    const threat = await Threat.findByIdAndDelete(req.params.id);

    if (!threat) {
      return res.status(404).json({ error: "Threat not found" });
    }

    // Update threat model
    if (threat.threatModelId) {
      await ThreatModel.findByIdAndUpdate(threat.threatModelId, {
        $pull: { threats: threat._id },
        $inc: {
          "riskSummary.totalThreats": -1,
          [`riskSummary.${threat.riskLevel}`]: -1,
        },
      });
    }

    res.json({ message: "Threat deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Assess risk
exports.assessRisk = async (req, res, next) => {
  try {
    const threat = await Threat.findById(req.params.id);

    if (!threat) {
      return res.status(404).json({ error: "Threat not found" });
    }

    // Get STRIDE mappings
    const strideMappings = {
      spoofing: "S",
      tampering: "T",
      repudiation: "R",
      information_disclosure: "I",
      denial_of_service: "D",
      elevation_of_privilege: "E",
    };

    threat.strideCategory = strideMappings[threat.category] || null;
    threat.metadata.lastAssessedBy = req.body.assessedBy || "system";
    threat.metadata.lastAssessedDate = new Date();

    await threat.save();

    res.json({
      threat,
      assessment: {
        riskScore: threat.riskScore,
        riskLevel: threat.riskLevel,
        strideCategory: threat.strideCategory,
        recommendation: getRiskRecommendation(threat.riskLevel),
      },
    });
  } catch (error) {
    next(error);
  }
};

function getRiskRecommendation(level) {
  const recommendations = {
    critical: "Immediate mitigation required. Block deployment until resolved.",
    high: "Prioritize mitigation within current sprint. Consider temporary controls.",
    medium: "Schedule mitigation within next 2 sprints.",
    low: "Include in regular security backlog.",
    informational: "Document and monitor. No immediate action required.",
  };
  return recommendations[level] || "Review and assess.";
}
