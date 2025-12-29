/**
 * IdentityShield - Role Controller
 */

const Role = require("../models/Role");
const Identity = require("../models/Identity");
const identityService = require("../services/identityService");

exports.getAll = async (req, res) => {
  try {
    const { type, provider, status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (provider) filter.provider = provider;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [roles, total] = await Promise.all([
      Role.find(filter)
        .populate("permissions")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ riskScore: -1, name: 1 }),
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
    const role = await Role.findById(req.params.id).populate("permissions");

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
    const role = new Role(req.body);
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
    const role = await Role.findByIdAndDelete(req.params.id);

    if (!role) {
      return res.status(404).json({ success: false, error: "Role not found" });
    }

    // Remove role reference from identities
    await Identity.updateMany(
      { roles: role._id },
      { $pull: { roles: role._id } }
    );

    res.json({ success: true, message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.analyzeRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id).populate("permissions");

    if (!role) {
      return res.status(404).json({ success: false, error: "Role not found" });
    }

    const analysis = await identityService.analyzeRole(role);

    // Update role with analysis
    role.riskScore = analysis.riskScore;
    role.riskFactors = analysis.riskFactors;
    role.lastAnalyzed = new Date();
    await role.save();

    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMembers = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({ success: false, error: "Role not found" });
    }

    const members = await Identity.find({ roles: role._id }).select(
      "name type email status riskLevel"
    );

    res.json({
      success: true,
      data: {
        roleId: role._id,
        roleName: role.name,
        memberCount: members.length,
        members,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
