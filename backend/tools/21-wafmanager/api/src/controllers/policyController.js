const Policy = require("../models/Policy");
const WAFInstance = require("../models/WAFInstance");
const wafService = require("../services/wafService");

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
    const { template, isActive, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (template) filter.template = template;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const skip = (page - 1) * limit;
    const [policies, total] = await Promise.all([
      Policy.find(filter)
        .populate("rules", "name type category enabled")
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
      .populate("rules")
      .populate("instances", "name provider status");
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

// Apply policy to instances
exports.apply = async (req, res, next) => {
  try {
    const policy = await Policy.findById(req.params.id).populate("rules");
    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }

    const { instanceIds } = req.body;

    // Apply to specified instances or all associated instances
    const targetInstances = instanceIds
      ? await WAFInstance.find({ _id: { $in: instanceIds } })
      : await WAFInstance.find({ _id: { $in: policy.instances } });

    const results = [];
    for (const instance of targetInstances) {
      try {
        const deployResult = await wafService.applyPolicy(instance, policy);
        results.push({
          instanceId: instance._id,
          instanceName: instance.name,
          status: "success",
          details: deployResult,
        });
      } catch (err) {
        results.push({
          instanceId: instance._id,
          instanceName: instance.name,
          status: "failed",
          error: err.message,
        });
      }
    }

    policy.isActive = true;
    policy.instances = [
      ...new Set([...policy.instances, ...targetInstances.map((i) => i._id)]),
    ];
    await policy.save();

    // Trigger external security integrations
    wafService.integrateWithSecurityStack(policy._id, {
      eventType: 'policy_application',
      instanceName: targetInstances.map(i => i.name).join(', '),
      provider: targetInstances[0]?.provider,
      rulesDeployed: policy.rules?.length || 0,
      ruleDeployment: true,
      deployedRules: policy.rules || [],
      severity: 'medium'
    }).catch(error => {
      console.error('Integration error:', error);
      // Don't fail the policy application if integration fails
    });

    res.json({
      policy,
      deploymentResults: results,
      summary: {
        total: results.length,
        succeeded: results.filter((r) => r.status === "success").length,
        failed: results.filter((r) => r.status === "failed").length,
      },
    });
  } catch (error) {
    next(error);
  }
};
