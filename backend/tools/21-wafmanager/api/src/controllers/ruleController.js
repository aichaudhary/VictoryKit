const Rule = require("../models/Rule");
const wafService = require("../services/wafService");

// Create rule
exports.create = async (req, res, next) => {
  try {
    const rule = new Rule(req.body);
    await rule.save();
    res.status(201).json(rule);
  } catch (error) {
    next(error);
  }
};

// Get all rules
exports.getAll = async (req, res, next) => {
  try {
    const {
      instanceId,
      type,
      category,
      enabled,
      page = 1,
      limit = 50,
    } = req.query;
    const filter = {};
    if (instanceId) filter.instanceId = instanceId;
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (enabled !== undefined) filter.enabled = enabled === "true";

    const skip = (page - 1) * limit;
    const [rules, total] = await Promise.all([
      Rule.find(filter).sort({ priority: 1 }).skip(skip).limit(parseInt(limit)),
      Rule.countDocuments(filter),
    ]);

    res.json({
      data: rules,
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

// Get rule by ID
exports.getById = async (req, res, next) => {
  try {
    const rule = await Rule.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({ error: "Rule not found" });
    }
    res.json(rule);
  } catch (error) {
    next(error);
  }
};

// Update rule
exports.update = async (req, res, next) => {
  try {
    const rule = await Rule.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({ error: "Rule not found" });
    }

    Object.assign(rule, req.body);
    rule.metadata.version = (rule.metadata?.version || 0) + 1;
    rule.deployed = false; // Mark as needing redeployment
    await rule.save();

    res.json(rule);
  } catch (error) {
    next(error);
  }
};

// Delete rule
exports.delete = async (req, res, next) => {
  try {
    const rule = await Rule.findByIdAndDelete(req.params.id);
    if (!rule) {
      return res.status(404).json({ error: "Rule not found" });
    }
    res.json({ message: "Rule deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Deploy rule
exports.deploy = async (req, res, next) => {
  try {
    const rule = await Rule.findById(req.params.id).populate("instanceId");
    if (!rule) {
      return res.status(404).json({ error: "Rule not found" });
    }

    // Deploy to WAF provider
    const deployResult = await wafService.deployRule(rule);

    rule.deployed = true;
    await rule.save();

    // Trigger external security integrations
    wafService.integrateWithSecurityStack(rule._id, {
      eventType: 'rule_deployment',
      instanceName: rule.instanceId?.name,
      provider: rule.instanceId?.provider,
      ruleDeployment: true,
      deployedRules: [rule],
      severity: 'medium'
    }).catch(error => {
      console.error('Integration error:', error);
      // Don't fail the deployment if integration fails
    });

    res.json({
      rule,
      deployment: deployResult,
    });
  } catch (error) {
    next(error);
  }
};

// Optimize rules
exports.optimize = async (req, res, next) => {
  try {
    const { instanceId, rules: ruleIds } = req.body;

    let rules;
    if (ruleIds) {
      rules = await Rule.find({ _id: { $in: ruleIds } });
    } else if (instanceId) {
      rules = await Rule.find({ instanceId });
    } else {
      rules = await Rule.find({});
    }

    // Get optimization suggestions from ML service
    const optimization = await wafService.optimizeRules(rules);

    res.json({
      analyzed: rules.length,
      recommendations: optimization.recommendations,
      falsePositiveRisks: optimization.falsePositiveRisks,
      redundantRules: optimization.redundantRules,
      suggestedMerges: optimization.suggestedMerges,
      performanceImpact: optimization.performanceImpact,
    });
  } catch (error) {
    next(error);
  }
};
