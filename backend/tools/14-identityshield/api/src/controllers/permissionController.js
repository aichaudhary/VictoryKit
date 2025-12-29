/**
 * IdentityShield - Permission Controller
 */

const Permission = require("../models/Permission");
const identityService = require("../services/identityService");

exports.getAll = async (req, res) => {
  try {
    const {
      provider,
      category,
      isPrivileged,
      isSensitive,
      page = 1,
      limit = 50,
    } = req.query;

    const filter = {};
    if (provider) filter.provider = provider;
    if (category) filter.category = category;
    if (isPrivileged !== undefined)
      filter.isPrivileged = isPrivileged === "true";
    if (isSensitive !== undefined) filter.isSensitive = isSensitive === "true";

    const skip = (page - 1) * limit;

    const [permissions, total] = await Promise.all([
      Permission.find(filter)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ isPrivileged: -1, action: 1 }),
      Permission.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: permissions,
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
    const permission = await Permission.findById(req.params.id);

    if (!permission) {
      return res
        .status(404)
        .json({ success: false, error: "Permission not found" });
    }

    res.json({ success: true, data: permission });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const permission = new Permission(req.body);
    await permission.save();
    res.status(201).json({ success: true, data: permission });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const permission = await Permission.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!permission) {
      return res
        .status(404)
        .json({ success: false, error: "Permission not found" });
    }

    res.json({ success: true, data: permission });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const permission = await Permission.findByIdAndDelete(req.params.id);

    if (!permission) {
      return res
        .status(404)
        .json({ success: false, error: "Permission not found" });
    }

    res.json({ success: true, message: "Permission deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.analyzePermissions = async (req, res) => {
  try {
    const { permissions } = req.body;

    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        error: "Permissions array required",
      });
    }

    const analysis = await identityService.analyzePermissions(permissions);

    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUnused = async (req, res) => {
  try {
    const { days = 90 } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const unusedPermissions = await Permission.find({
      $or: [{ lastUsed: { $lt: cutoffDate } }, { lastUsed: null }],
    }).limit(100);

    res.json({
      success: true,
      data: {
        period: `${days} days`,
        count: unusedPermissions.length,
        permissions: unusedPermissions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
