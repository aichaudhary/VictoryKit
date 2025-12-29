/**
 * AccessControl - Permission Controller
 */

const Permission = require("../models/Permission");
const { v4: uuidv4 } = require("uuid");

exports.getAll = async (req, res) => {
  try {
    const { resourceType, scope, isActive, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (resourceType) filter["resource.type"] = resourceType;
    if (scope) filter.scope = scope;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const skip = (page - 1) * limit;

    const [permissions, total] = await Promise.all([
      Permission.find(filter)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ "resource.type": 1, name: 1 }),
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
    const permission = new Permission({
      ...req.body,
      permissionId: req.body.permissionId || `perm-${uuidv4().substring(0, 8)}`,
    });
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
