const RiskRegister = require("../models/RiskRegister");
const Risk = require("../models/Risk");

// Create register
exports.create = async (req, res, next) => {
  try {
    const register = new RiskRegister(req.body);
    await register.save();
    res.status(201).json(register);
  } catch (error) {
    next(error);
  }
};

// Get all registers
exports.getAll = async (req, res, next) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [registers, total] = await Promise.all([
      RiskRegister.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      RiskRegister.countDocuments(filter),
    ]);

    res.json({
      data: registers,
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

// Get register by ID
exports.getById = async (req, res, next) => {
  try {
    const register = await RiskRegister.findById(req.params.id).populate(
      "risks"
    );

    if (!register) {
      return res.status(404).json({ error: "Risk register not found" });
    }
    res.json(register);
  } catch (error) {
    next(error);
  }
};

// Update register
exports.update = async (req, res, next) => {
  try {
    const register = await RiskRegister.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!register) {
      return res.status(404).json({ error: "Risk register not found" });
    }
    res.json(register);
  } catch (error) {
    next(error);
  }
};

// Delete register
exports.delete = async (req, res, next) => {
  try {
    const register = await RiskRegister.findByIdAndDelete(req.params.id);

    if (!register) {
      return res.status(404).json({ error: "Risk register not found" });
    }
    res.json({ message: "Risk register deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Get risks for register
exports.getRisks = async (req, res, next) => {
  try {
    const register = await RiskRegister.findById(req.params.id);

    if (!register) {
      return res.status(404).json({ error: "Risk register not found" });
    }

    const risks = await Risk.find({ registerId: req.params.id })
      .populate("controls.controlId", "name type effectiveness")
      .sort({ "residualRisk.score": -1 });

    // Update summary
    const summary = {
      totalRisks: risks.length,
      openRisks: risks.filter((r) => r.status !== "closed").length,
      treatedRisks: risks.filter((r) => r.status === "treated").length,
      acceptedRisks: risks.filter((r) => r.treatment?.strategy === "accept")
        .length,
      overdue: risks.filter((r) => {
        return (
          r.treatment?.dueDate &&
          new Date(r.treatment.dueDate) < new Date() &&
          r.treatment?.status !== "completed"
        );
      }).length,
      riskProfile: {
        critical: risks.filter((r) => r.residualRisk?.level === "critical")
          .length,
        high: risks.filter((r) => r.residualRisk?.level === "high").length,
        medium: risks.filter((r) => r.residualRisk?.level === "medium").length,
        low: risks.filter((r) => r.residualRisk?.level === "low").length,
      },
      averageScore: risks.length
        ? Math.round(
            risks.reduce((sum, r) => sum + (r.residualRisk?.score || 0), 0) /
              risks.length
          )
        : 0,
    };

    // Determine trend
    const previousAvg = register.summary?.averageScore || 0;
    summary.trend =
      summary.averageScore < previousAvg
        ? "improving"
        : summary.averageScore > previousAvg
        ? "worsening"
        : "stable";

    register.summary = summary;
    await register.save();

    res.json({
      register: {
        id: register._id,
        name: register.name,
        summary,
      },
      risks,
    });
  } catch (error) {
    next(error);
  }
};

// Export register
exports.export = async (req, res, next) => {
  try {
    const { format = "json" } = req.body;
    const register = await RiskRegister.findById(req.params.id).populate(
      "risks"
    );

    if (!register) {
      return res.status(404).json({ error: "Risk register not found" });
    }

    const risks = await Risk.find({ registerId: req.params.id }).populate(
      "controls.controlId"
    );

    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        format,
        registerName: register.name,
        version: register.metadata?.version,
      },
      register: {
        name: register.name,
        type: register.type,
        scope: register.scope,
        owner: register.owner,
        summary: register.summary,
      },
      risks: risks.map((r) => ({
        riskId: r.riskId,
        name: r.name,
        category: r.category,
        likelihood: r.likelihood,
        impact: r.impact,
        inherentRisk: r.inherentRisk,
        residualRisk: r.residualRisk,
        treatment: r.treatment,
        status: r.status,
        owner: r.owner,
        controls: r.controls.map((c) => ({
          name: c.controlId?.name,
          effectiveness: c.effectiveness,
        })),
      })),
    };

    res.json(exportData);
  } catch (error) {
    next(error);
  }
};
