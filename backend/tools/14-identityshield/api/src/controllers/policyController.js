/**
 * IdentityShield - Policy Controller
 */

const Policy = require("../models/Policy");
const identityService = require("../services/identityService");

exports.getAll = async (req, res) => {
  try {
    const { type, provider, status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (provider) filter.provider = provider;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [policies, total] = await Promise.all([
      Policy.find(filter)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ riskScore: -1, name: 1 }),
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

    res.json({ success: true, message: "Policy deleted successfully" });
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

    const evaluation = await identityService.evaluatePolicy(policy);

    // Update policy with evaluation
    policy.riskScore = evaluation.riskScore;
    policy.findings = evaluation.findings;
    policy.lastEvaluated = new Date();
    await policy.save();

    res.json({ success: true, data: evaluation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.simulate = async (req, res) => {
  try {
    const { action, resource, principal } = req.body;
    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      return res
        .status(404)
        .json({ success: false, error: "Policy not found" });
    }

    // Simulate policy evaluation
    let decision = "Deny";
    let matchedStatement = null;

    if (policy.document && policy.document.statements) {
      for (const stmt of policy.document.statements) {
        const actionMatch = stmt.actions?.some(
          (a) =>
            a === "*" || a === action || action.startsWith(a.replace("*", ""))
        );
        const resourceMatch = stmt.resources?.some(
          (r) =>
            r === "*" ||
            r === resource ||
            resource.startsWith(r.replace("*", ""))
        );

        if (actionMatch && resourceMatch) {
          decision = stmt.effect;
          matchedStatement = stmt;
          break;
        }
      }
    }

    res.json({
      success: true,
      data: {
        decision,
        action,
        resource,
        principal,
        matchedStatement: matchedStatement
          ? {
              sid: matchedStatement.sid,
              effect: matchedStatement.effect,
            }
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
