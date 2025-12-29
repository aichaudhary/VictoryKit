/**
 * AccessControl - Role Controller
 */

const Role = require("../models/Role");
const Assignment = require("../models/Assignment");
const { v4: uuidv4 } = require("uuid");

exports.getAll = async (req, res) => {
  try {
    const { type, scope, isActive, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (scope) filter.scope = scope;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const skip = (page - 1) * limit;

    const [roles, total] = await Promise.all([
      Role.find(filter)
        .populate("inheritsFrom", "name roleId")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ name: 1 }),
      Role.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: roles,
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
    const role = await Role.findById(req.params.id)
      .populate("inheritsFrom", "name roleId")
      .populate("permissions.permissionId");

    if (!role) {
      return res.status(404).json({ success: false, error: "Role not found" });
    }
    res.json({ success: true, data: role });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const role = new Role({
      ...req.body,
      roleId: req.body.roleId || `role-${uuidv4().substring(0, 8)}`,
    });
    await role.save();
    res.status(201).json({ success: true, data: role });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!role) {
      return res.status(404).json({ success: false, error: "Role not found" });
    }
    res.json({ success: true, data: role });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    // Check for active assignments
    const activeAssignments = await Assignment.countDocuments({
      roleId: req.params.id,
      status: "active",
    });

    if (activeAssignments > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete role with ${activeAssignments} active assignments`,
      });
    }

    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, error: "Role not found" });
    }
    res.json({ success: true, message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMembers = async (req, res) => {
  try {
    const assignments = await Assignment.find({
      roleId: req.params.id,
      status: "active",
    });

    res.json({
      success: true,
      data: {
        roleId: req.params.id,
        memberCount: assignments.length,
        members: assignments.map((a) => ({
          principalType: a.principalType,
          principalId: a.principalId,
          grantedAt: a.grantedAt,
          expiresAt: a.expiresAt,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
