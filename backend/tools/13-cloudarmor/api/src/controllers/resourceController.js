/**
 * Resource Controller
 */

const CloudResource = require("../models/CloudResource");
const Finding = require("../models/Finding");

exports.getAll = async (req, res) => {
  try {
    const {
      account,
      type,
      publiclyAccessible,
      page = 1,
      limit = 50,
    } = req.query;
    const query = {};

    if (account) query.account = account;
    if (type) query.type = type;
    if (publiclyAccessible)
      query["security.publiclyAccessible"] = publiclyAccessible === "true";

    const resources = await CloudResource.find(query)
      .populate("account", "name provider")
      .sort({ riskScore: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await CloudResource.countDocuments(query);

    res.json({
      success: true,
      data: resources,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const resource = await CloudResource.findById(req.params.id).populate(
      "account",
      "name provider"
    );
    if (!resource) {
      return res
        .status(404)
        .json({ success: false, error: "Resource not found" });
    }
    res.json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getFindings = async (req, res) => {
  try {
    const findings = await Finding.find({ resource: req.params.id }).sort({
      severity: 1,
    });

    res.json({ success: true, data: findings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.scan = async (req, res) => {
  try {
    const { resourceId, configuration } = req.body;

    // In production, this would analyze actual cloud resource
    const mockFindings = [];

    if (configuration?.publicAccess) {
      mockFindings.push({
        type: "public_access",
        title: "Resource is publicly accessible",
        severity: "high",
        category: "public_exposure",
      });
    }

    if (!configuration?.encryption?.enabled) {
      mockFindings.push({
        type: "no_encryption",
        title: "Resource is not encrypted",
        severity: "medium",
        category: "encryption",
      });
    }

    res.json({
      success: true,
      data: {
        resourceId,
        findingsCount: mockFindings.length,
        findings: mockFindings,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTypes = async (req, res) => {
  try {
    const types = await CloudResource.distinct("type");
    res.json({ success: true, data: types });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
