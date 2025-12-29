/**
 * AccessControl - Policy Controller
 */

const Policy = require("../models/Policy");
const Role = require("../models/Role");
const accessService = require("../services/accessService");
const { v4: uuidv4 } = require("uuid");

exports.getAll = async (req, res) => {
  try {
    const { type, effect, isActive, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (effect) filter.effect = effect;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const skip = (page - 1) * limit;

    const [policies, total] = await Promise.all([
      Policy.find(filter)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ priority: 1, createdAt: -1 }),
      Policy.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: policies,
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
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res
        .status(404)
        .json({ success: false, error: "Policy not found" });
    }
    res.json({ success: true, data: policy });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const policy = new Policy({
      ...req.body,
      policyId: req.body.policyId || `pol-${uuidv4().substring(0, 8)}`,
    });
    await policy.save();
    res.status(201).json({ success: true, data: policy });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const policy = await Policy.findByIdAndUpdate(
      req.params.id,
      { ...req.body, version: (req.body.version || 1) + 1 },
      { new: true, runValidators: true }
    );
    if (!policy) {
      return res
        .status(404)
        .json({ success: false, error: "Policy not found" });
    }
    res.json({ success: true, data: policy });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const policy = await Policy.findByIdAndDelete(req.params.id);
    if (!policy) {
      return res
        .status(404)
        .json({ success: false, error: "Policy not found" });
    }
    res.json({ success: true, message: "Policy deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.evaluate = async (req, res) => {
  try {
    const { subject, resource, action, context } = req.body;

    if (!subject || !resource || !action) {
      return res.status(400).json({
        success: false,
        error: "subject, resource, and action are required",
      });
    }

    const result = await accessService.evaluateAccess({
      subject,
      resource,
      action,
      context,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.analyze = async (req, res) => {
  try {
    const analysis = await accessService.analyzePolicy(req.body.policyId);
    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const [totalPolicies, activePolicies, totalRoles, policyByType] =
      await Promise.all([
        Policy.countDocuments(),
        Policy.countDocuments({ isActive: true }),
        Role.countDocuments(),
        Policy.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]),
      ]);

    res.json({
      success: true,
      data: {
        statistics: {
          totalPolicies,
          activePolicies,
          totalRoles,
        },
        policyByType: policyByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recentActivity: [],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
