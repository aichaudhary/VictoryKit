const Mitigation = require("../models/Mitigation");
const Threat = require("../models/Threat");
const ThreatModel = require("../models/ThreatModel");

// Create mitigation
exports.create = async (req, res, next) => {
  try {
    const mitigation = new Mitigation(req.body);
    await mitigation.save();

    // Link to threat model
    if (mitigation.threatModelId) {
      await ThreatModel.findByIdAndUpdate(mitigation.threatModelId, {
        $push: { mitigations: mitigation._id },
      });
    }

    // Link to threat
    if (mitigation.threatId) {
      await Threat.findByIdAndUpdate(mitigation.threatId, {
        $push: { mitigations: mitigation._id },
      });
    }

    res.status(201).json(mitigation);
  } catch (error) {
    next(error);
  }
};

// Get all mitigations
exports.getAll = async (req, res, next) => {
  try {
    const {
      threatModelId,
      threatId,
      status,
      type,
      page = 1,
      limit = 20,
    } = req.query;
    const filter = {};

    if (threatModelId) filter.threatModelId = threatModelId;
    if (threatId) filter.threatId = threatId;
    if (status) filter["implementation.status"] = status;
    if (type) filter.type = type;

    const skip = (page - 1) * limit;
    const [mitigations, total] = await Promise.all([
      Mitigation.find(filter)
        .populate("threatId", "name category riskLevel")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Mitigation.countDocuments(filter),
    ]);

    res.json({
      data: mitigations,
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

// Get mitigation by ID
exports.getById = async (req, res, next) => {
  try {
    const mitigation = await Mitigation.findById(req.params.id)
      .populate("threatModelId", "name")
      .populate("threatId");

    if (!mitigation) {
      return res.status(404).json({ error: "Mitigation not found" });
    }
    res.json(mitigation);
  } catch (error) {
    next(error);
  }
};

// Update mitigation
exports.update = async (req, res, next) => {
  try {
    const mitigation = await Mitigation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!mitigation) {
      return res.status(404).json({ error: "Mitigation not found" });
    }
    res.json(mitigation);
  } catch (error) {
    next(error);
  }
};

// Delete mitigation
exports.delete = async (req, res, next) => {
  try {
    const mitigation = await Mitigation.findByIdAndDelete(req.params.id);

    if (!mitigation) {
      return res.status(404).json({ error: "Mitigation not found" });
    }

    // Remove from threat model
    if (mitigation.threatModelId) {
      await ThreatModel.findByIdAndUpdate(mitigation.threatModelId, {
        $pull: { mitigations: mitigation._id },
      });
    }

    // Remove from threat
    if (mitigation.threatId) {
      await Threat.findByIdAndUpdate(mitigation.threatId, {
        $pull: { mitigations: mitigation._id },
      });
    }

    res.json({ message: "Mitigation deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Apply mitigation
exports.apply = async (req, res, next) => {
  try {
    const mitigation = await Mitigation.findById(req.params.id);

    if (!mitigation) {
      return res.status(404).json({ error: "Mitigation not found" });
    }

    // Update implementation status
    mitigation.implementation.status = "implemented";
    mitigation.implementation.actualEnd = new Date();
    await mitigation.save();

    // Update threat status if linked
    if (mitigation.threatId) {
      const threat = await Threat.findById(mitigation.threatId);
      if (threat) {
        // Calculate residual risk
        const riskReduction = mitigation.riskReduction || 50;
        threat.residualRisk = {
          score: Math.max(
            0,
            threat.riskScore - (threat.riskScore * riskReduction) / 100
          ),
          level: calculateResidualLevel(threat.riskScore, riskReduction),
        };
        threat.status = "mitigated";
        await threat.save();

        // Update threat model risk summary
        await ThreatModel.findByIdAndUpdate(threat.threatModelId, {
          $inc: { "riskSummary.mitigated": 1 },
        });
      }
    }

    res.json({
      mitigation,
      message: "Mitigation applied successfully",
    });
  } catch (error) {
    next(error);
  }
};

function calculateResidualLevel(originalScore, reductionPercent) {
  const residual = originalScore - (originalScore * reductionPercent) / 100;
  if (residual >= 80) return "critical";
  if (residual >= 60) return "high";
  if (residual >= 40) return "medium";
  if (residual >= 20) return "low";
  return "informational";
}
