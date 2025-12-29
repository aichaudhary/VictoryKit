/**
 * AccessControl - Assignment Controller
 */

const Assignment = require("../models/Assignment");
const Role = require("../models/Role");
const { v4: uuidv4 } = require("uuid");

exports.getAll = async (req, res) => {
  try {
    const {
      principalType,
      principalId,
      roleId,
      status,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (principalType) filter.principalType = principalType;
    if (principalId) filter.principalId = principalId;
    if (roleId) filter.roleId = roleId;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [assignments, total] = await Promise.all([
      Assignment.find(filter)
        .populate("roleId", "name roleId displayName")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ grantedAt: -1 }),
      Assignment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: assignments,
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
    const assignment = await Assignment.findById(req.params.id).populate(
      "roleId"
    );

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, error: "Assignment not found" });
    }
    res.json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { principalType, principalId, roleId, scope, reason, expiresAt } =
      req.body;

    // Validate role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ success: false, error: "Role not found" });
    }

    // Check if assignment already exists
    const existing = await Assignment.findOne({
      principalType,
      principalId,
      roleId,
      status: "active",
    });

    if (existing) {
      return res
        .status(400)
        .json({ success: false, error: "Assignment already exists" });
    }

    const assignment = new Assignment({
      assignmentId: `asgn-${uuidv4().substring(0, 8)}`,
      principalType,
      principalId,
      roleId,
      scope,
      reason,
      expiresAt,
      status: role.constraints?.requireApproval ? "pending_approval" : "active",
    });

    await assignment.save();

    // Update role member count
    if (assignment.status === "active") {
      await Role.findByIdAndUpdate(roleId, { $inc: { memberCount: 1 } });
    }

    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.revoke = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, error: "Assignment not found" });
    }

    const wasActive = assignment.status === "active";
    assignment.status = "revoked";
    await assignment.save();

    // Update role member count
    if (wasActive) {
      await Role.findByIdAndUpdate(assignment.roleId, {
        $inc: { memberCount: -1 },
      });
    }

    res.json({ success: true, message: "Assignment revoked successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.approve = async (req, res) => {
  try {
    const { decision, comments } = req.body;

    if (!["approved", "rejected"].includes(decision)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid decision" });
    }

    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, error: "Assignment not found" });
    }

    if (assignment.status !== "pending_approval") {
      return res
        .status(400)
        .json({ success: false, error: "Assignment is not pending approval" });
    }

    assignment.approvals.push({
      decision,
      comments,
      timestamp: new Date(),
    });

    if (decision === "approved") {
      assignment.status = "active";
      await Role.findByIdAndUpdate(assignment.roleId, {
        $inc: { memberCount: 1 },
      });
    } else {
      assignment.status = "revoked";
    }

    await assignment.save();

    res.json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
