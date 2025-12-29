const Policy = require("../models/Policy");
const API = require("../models/API");

// Create policy
exports.create = async (req, res, next) => {
  try {
    const policy = new Policy(req.body);
    await policy.save();
    res.status(201).json(policy);
  } catch (error) {
    next(error);
  }
};

// Get all policies
exports.getAll = async (req, res, next) => {
  try {
    const { type, category, isActive, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const skip = (page - 1) * limit;
    const [policies, total] = await Promise.all([
      Policy.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Policy.countDocuments(filter),
    ]);

    res.json({
      data: policies,
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

// Get policy by ID
exports.getById = async (req, res, next) => {
  try {
    const policy = await Policy.findById(req.params.id)
      .populate("scope.apis", "name")
      .populate("scope.endpoints", "path method");
    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }
    res.json(policy);
  } catch (error) {
    next(error);
  }
};

// Update policy
exports.update = async (req, res, next) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }

    Object.assign(policy, req.body);
    policy.metadata.version = (policy.metadata?.version || 0) + 1;
    await policy.save();

    res.json(policy);
  } catch (error) {
    next(error);
  }
};

// Delete policy
exports.delete = async (req, res, next) => {
  try {
    const policy = await Policy.findByIdAndDelete(req.params.id);
    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }
    res.json({ message: "Policy deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Apply policy to APIs
exports.apply = async (req, res, next) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }

    const { apiIds } = req.body;

    // Apply to specified APIs
    const results = [];
    for (const apiId of apiIds) {
      try {
        const api = await API.findById(apiId);
        if (api) {
          if (!api.policies.includes(policy._id)) {
            api.policies.push(policy._id);
            await api.save();
          }
          results.push({ apiId, status: "applied" });
        } else {
          results.push({ apiId, status: "not_found" });
        }
      } catch (err) {
        results.push({ apiId, status: "error", error: err.message });
      }
    }

    // Update policy scope
    policy.scope.apis = [...new Set([...policy.scope.apis, ...apiIds])];
    await policy.save();

    res.json({
      policy,
      results,
      summary: {
        applied: results.filter((r) => r.status === "applied").length,
        failed: results.filter((r) => r.status !== "applied").length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Validate policy
exports.validate = async (req, res, next) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }

    const validationResults = {
      valid: true,
      errors: [],
      warnings: [],
    };

    // Check rules
    if (!policy.rules || policy.rules.length === 0) {
      validationResults.warnings.push("Policy has no rules defined");
    }

    // Check scope
    if (
      !policy.scope.global &&
      !policy.scope.apis?.length &&
      !policy.scope.endpoints?.length
    ) {
      validationResults.warnings.push(
        "Policy has no scope - it will not apply to any resources"
      );
    }

    // Check date validity
    if (policy.effectiveUntil && new Date(policy.effectiveUntil) < new Date()) {
      validationResults.errors.push("Policy has expired");
      validationResults.valid = false;
    }

    res.json(validationResults);
  } catch (error) {
    next(error);
  }
};
