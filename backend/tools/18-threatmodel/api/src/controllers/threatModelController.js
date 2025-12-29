const ThreatModel = require("../models/ThreatModel");
const Threat = require("../models/Threat");
const threatModelService = require("../services/threatModelService");

// Create threat model
exports.create = async (req, res, next) => {
  try {
    const threatModel = new ThreatModel(req.body);
    await threatModel.save();
    res.status(201).json(threatModel);
  } catch (error) {
    next(error);
  }
};

// Get all threat models
exports.getAll = async (req, res, next) => {
  try {
    const { status, methodology, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (methodology) filter.methodology = methodology;

    const skip = (page - 1) * limit;
    const [threatModels, total] = await Promise.all([
      ThreatModel.find(filter)
        .populate("components")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ThreatModel.countDocuments(filter),
    ]);

    res.json({
      data: threatModels,
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

// Get threat model by ID
exports.getById = async (req, res, next) => {
  try {
    const threatModel = await ThreatModel.findById(req.params.id)
      .populate("components")
      .populate("threats")
      .populate("mitigations");

    if (!threatModel) {
      return res.status(404).json({ error: "Threat model not found" });
    }
    res.json(threatModel);
  } catch (error) {
    next(error);
  }
};

// Update threat model
exports.update = async (req, res, next) => {
  try {
    const threatModel = await ThreatModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!threatModel) {
      return res.status(404).json({ error: "Threat model not found" });
    }
    res.json(threatModel);
  } catch (error) {
    next(error);
  }
};

// Delete threat model
exports.delete = async (req, res, next) => {
  try {
    const threatModel = await ThreatModel.findByIdAndDelete(req.params.id);

    if (!threatModel) {
      return res.status(404).json({ error: "Threat model not found" });
    }

    // Delete associated threats and mitigations
    await Threat.deleteMany({ threatModelId: req.params.id });

    res.json({ message: "Threat model deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Analyze threat model
exports.analyze = async (req, res, next) => {
  try {
    const threatModel = await ThreatModel.findById(req.params.id)
      .populate("components")
      .populate("threats");

    if (!threatModel) {
      return res.status(404).json({ error: "Threat model not found" });
    }

    const analysis = await threatModelService.analyze(threatModel);
    res.json(analysis);
  } catch (error) {
    next(error);
  }
};

// STRIDE analysis
exports.analyzeSTRIDE = async (req, res, next) => {
  try {
    const threatModel = await ThreatModel.findById(req.params.id).populate(
      "components"
    );

    if (!threatModel) {
      return res.status(404).json({ error: "Threat model not found" });
    }

    const strideAnalysis = await threatModelService.analyzeSTRIDE(threatModel);

    // Update threat model with STRIDE analysis
    threatModel.strideAnalysis = strideAnalysis;
    await threatModel.save();

    res.json(strideAnalysis);
  } catch (error) {
    next(error);
  }
};

// PASTA analysis
exports.analyzePASTA = async (req, res, next) => {
  try {
    const threatModel = await ThreatModel.findById(req.params.id)
      .populate("components")
      .populate("threats");

    if (!threatModel) {
      return res.status(404).json({ error: "Threat model not found" });
    }

    const pastaAnalysis = await threatModelService.analyzePASTA(threatModel);

    // Update threat model with PASTA analysis
    threatModel.pastaAnalysis = pastaAnalysis;
    await threatModel.save();

    res.json(pastaAnalysis);
  } catch (error) {
    next(error);
  }
};

// Generate report
exports.generateReport = async (req, res, next) => {
  try {
    const { format = "json" } = req.query;
    const threatModel = await ThreatModel.findById(req.params.id)
      .populate("components")
      .populate("threats")
      .populate("mitigations");

    if (!threatModel) {
      return res.status(404).json({ error: "Threat model not found" });
    }

    const report = await threatModelService.generateReport(threatModel, format);
    res.json(report);
  } catch (error) {
    next(error);
  }
};

// Get dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const [threatModels, threats] = await Promise.all([
      ThreatModel.find().select(
        "name status methodology riskSummary createdAt"
      ),
      Threat.find().select("category riskLevel status"),
    ]);

    const dashboard = {
      overview: {
        totalThreatModels: threatModels.length,
        byStatus: threatModels.reduce((acc, tm) => {
          acc[tm.status] = (acc[tm.status] || 0) + 1;
          return acc;
        }, {}),
        byMethodology: threatModels.reduce((acc, tm) => {
          acc[tm.methodology] = (acc[tm.methodology] || 0) + 1;
          return acc;
        }, {}),
      },
      threats: {
        total: threats.length,
        byCategory: threats.reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + 1;
          return acc;
        }, {}),
        byRiskLevel: threats.reduce((acc, t) => {
          acc[t.riskLevel] = (acc[t.riskLevel] || 0) + 1;
          return acc;
        }, {}),
        byStatus: threats.reduce((acc, t) => {
          acc[t.status] = (acc[t.status] || 0) + 1;
          return acc;
        }, {}),
      },
      recentModels: threatModels
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5)
        .map((tm) => ({
          id: tm._id,
          name: tm.name,
          status: tm.status,
          riskSummary: tm.riskSummary,
        })),
    };

    res.json(dashboard);
  } catch (error) {
    next(error);
  }
};
