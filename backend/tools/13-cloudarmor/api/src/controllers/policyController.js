/**
 * Policy Controller
 */

const Policy = require("../models/Policy");
const CloudResource = require("../models/CloudResource");

exports.getAll = async (req, res) => {
  try {
    const { provider, category, enabled, page = 1, limit = 50 } = req.query;
    const query = {};

    if (provider) query.provider = { $in: [provider, "all"] };
    if (category) query.category = category;
    if (enabled !== undefined) query.enabled = enabled === "true";

    const policies = await Policy.find(query)
      .sort({ severity: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Policy.countDocuments(query);

    res.json({
      success: true,
      data: policies,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
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
    const policy = new Policy(req.body);
    await policy.save();
    res.status(201).json({ success: true, data: policy });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const policy = await Policy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
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
    res.json({ success: true, message: "Policy deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.evaluate = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res
        .status(404)
        .json({ success: false, error: "Policy not found" });
    }

    // Find resources matching policy types
    const query = {};
    if (policy.resourceTypes?.length) {
      query.type = { $in: policy.resourceTypes };
    }

    const resources = await CloudResource.find(query);

    // Evaluate policy against resources
    const violations = [];
    const compliant = [];

    for (const resource of resources) {
      let isViolation = false;

      for (const condition of policy.conditions) {
        const value = getNestedValue(resource, condition.field);
        isViolation = evaluateCondition(
          value,
          condition.operator,
          condition.value
        );
        if (isViolation) break;
      }

      if (isViolation) {
        violations.push({
          resourceId: resource._id,
          resourceName: resource.name,
          resourceType: resource.type,
        });
      } else {
        compliant.push(resource._id);
      }
    }

    // Update policy statistics
    policy.statistics.evaluations++;
    policy.statistics.violations = violations.length;
    policy.statistics.lastEvaluated = new Date();
    await policy.save();

    res.json({
      success: true,
      data: {
        policy: policy.name,
        totalEvaluated: resources.length,
        violations: violations.length,
        compliant: compliant.length,
        violationDetails: violations,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

function getNestedValue(obj, path) {
  return path.split(".").reduce((o, k) => o?.[k], obj);
}

function evaluateCondition(value, operator, expected) {
  switch (operator) {
    case "equals":
      return value === expected;
    case "not_equals":
      return value !== expected;
    case "contains":
      return String(value).includes(expected);
    case "not_contains":
      return !String(value).includes(expected);
    case "exists":
      return value !== undefined && value !== null;
    case "not_exists":
      return value === undefined || value === null;
    case "greater_than":
      return value > expected;
    case "less_than":
      return value < expected;
    default:
      return false;
  }
}
