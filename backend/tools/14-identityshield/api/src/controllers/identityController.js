/**
 * IdentityShield - Identity Controller
 */

const Identity = require("../models/Identity");
const identityService = require("../services/identityService");

exports.getAll = async (req, res) => {
  try {
    const {
      status,
      type,
      provider,
      riskLevel,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (provider) filter.provider = provider;
    if (riskLevel) filter.riskLevel = riskLevel;

    const skip = (page - 1) * limit;

    const [identities, total] = await Promise.all([
      Identity.find(filter)
        .populate("roles", "name type")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ riskScore: -1, updatedAt: -1 }),
      Identity.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: identities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const identity = await Identity.findById(req.params.id)
      .populate("roles")
      .populate("permissions");

    if (!identity) {
      return res
        .status(404)
        .json({ success: false, error: "Identity not found" });
    }

    res.json({ success: true, data: identity });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const identity = new Identity(req.body);
    await identity.save();
    res.status(201).json({ success: true, data: identity });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const identity = await Identity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!identity) {
      return res
        .status(404)
        .json({ success: false, error: "Identity not found" });
    }

    res.json({ success: true, data: identity });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const identity = await Identity.findByIdAndDelete(req.params.id);

    if (!identity) {
      return res
        .status(404)
        .json({ success: false, error: "Identity not found" });
    }

    res.json({ success: true, message: "Identity deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.analyze = async (req, res) => {
  try {
    const identity = await Identity.findById(req.params.id)
      .populate("roles")
      .populate("permissions");

    if (!identity) {
      return res
        .status(404)
        .json({ success: false, error: "Identity not found" });
    }

    const analysis = await identityService.analyzeIdentity(identity);

    // Update identity with analysis results
    identity.riskScore = analysis.riskScore;
    identity.riskLevel = analysis.riskLevel;
    identity.lastAnalyzed = new Date();
    await identity.save();

    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPermissions = async (req, res) => {
  try {
    const identity = await Identity.findById(req.params.id)
      .populate("roles")
      .populate("permissions");

    if (!identity) {
      return res
        .status(404)
        .json({ success: false, error: "Identity not found" });
    }

    const effectivePermissions = await identityService.getEffectivePermissions(
      identity
    );

    res.json({ success: true, data: effectivePermissions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getActivity = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const identity = await Identity.findById(req.params.id);

    if (!identity) {
      return res
        .status(404)
        .json({ success: false, error: "Identity not found" });
    }

    // Simulated activity data
    const activity = {
      identityId: identity._id,
      period: `Last ${days} days`,
      summary: {
        totalActions: Math.floor(Math.random() * 1000),
        uniqueServices: Math.floor(Math.random() * 20),
        failedAttempts: identity.authentication?.failedAttempts || 0,
        lastLogin: identity.authentication?.lastLogin,
      },
      topActions: [
        { action: "s3:GetObject", count: 245 },
        { action: "ec2:DescribeInstances", count: 156 },
        { action: "iam:GetUser", count: 89 },
      ],
    };

    res.json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getRiskSummary = async (req, res) => {
  try {
    const summary = await Identity.aggregate([
      {
        $group: {
          _id: "$riskLevel",
          count: { $sum: 1 },
          avgScore: { $avg: "$riskScore" },
        },
      },
    ]);

    const totalIdentities = await Identity.countDocuments();
    const highRiskIdentities = await Identity.countDocuments({
      riskLevel: { $in: ["high", "critical"] },
    });

    res.json({
      success: true,
      data: {
        total: totalIdentities,
        highRisk: highRiskIdentities,
        byRiskLevel: summary,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
