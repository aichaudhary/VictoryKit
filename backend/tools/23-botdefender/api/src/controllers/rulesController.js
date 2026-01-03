/**
 * Detection Rules Controller
 * Manages custom bot detection rules
 */

const mongoose = require("mongoose");

// Rule Schema (inline for simplicity)
const ruleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  enabled: { type: Boolean, default: true },
  priority: { type: Number, default: 0 },
  conditions: [{
    field: { type: String, required: true }, // userAgent, ip, path, method, header, etc.
    operator: { type: String, required: true }, // equals, contains, matches, startsWith, endsWith, in
    value: mongoose.Schema.Types.Mixed,
    caseSensitive: { type: Boolean, default: false }
  }],
  conditionLogic: { type: String, default: "AND", enum: ["AND", "OR"] },
  action: {
    type: { type: String, required: true, enum: ["allow", "block", "challenge", "rate_limit", "monitor", "flag"] },
    challengeType: String, // recaptcha, hcaptcha, turnstile
    rateLimit: {
      requests: Number,
      window: Number // seconds
    },
    message: String
  },
  metadata: {
    createdBy: String,
    lastModifiedBy: String,
    hitCount: { type: Number, default: 0 },
    lastHit: Date
  }
}, { timestamps: true });

const Rule = mongoose.models.Rule || mongoose.model("Rule", ruleSchema);

/**
 * Get all rules
 */
exports.getAll = async (req, res, next) => {
  try {
    const { enabled, action } = req.query;
    
    const filter = {};
    if (enabled !== undefined) filter.enabled = enabled === "true";
    if (action) filter["action.type"] = action;
    
    const rules = await Rule.find(filter).sort({ priority: -1, createdAt: -1 });
    
    res.json({
      success: true,
      total: rules.length,
      rules
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get rule by ID
 */
exports.getById = async (req, res, next) => {
  try {
    const rule = await Rule.findById(req.params.id);
    
    if (!rule) {
      return res.status(404).json({
        success: false,
        error: "Rule not found"
      });
    }
    
    res.json({
      success: true,
      rule
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new rule
 */
exports.create = async (req, res, next) => {
  try {
    const { name, description, conditions, conditionLogic, action, priority, enabled } = req.body;
    
    if (!name || !conditions || !action) {
      return res.status(400).json({
        success: false,
        error: "Name, conditions, and action are required"
      });
    }
    
    const rule = new Rule({
      name,
      description,
      conditions,
      conditionLogic: conditionLogic || "AND",
      action,
      priority: priority || 0,
      enabled: enabled !== false,
      metadata: {
        createdBy: req.user?.id || "system"
      }
    });
    
    await rule.save();
    
    res.status(201).json({
      success: true,
      message: "Rule created successfully",
      rule
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update rule
 */
exports.update = async (req, res, next) => {
  try {
    const { name, description, conditions, conditionLogic, action, priority, enabled } = req.body;
    
    const rule = await Rule.findById(req.params.id);
    
    if (!rule) {
      return res.status(404).json({
        success: false,
        error: "Rule not found"
      });
    }
    
    if (name) rule.name = name;
    if (description !== undefined) rule.description = description;
    if (conditions) rule.conditions = conditions;
    if (conditionLogic) rule.conditionLogic = conditionLogic;
    if (action) rule.action = action;
    if (priority !== undefined) rule.priority = priority;
    if (enabled !== undefined) rule.enabled = enabled;
    rule.metadata.lastModifiedBy = req.user?.id || "system";
    
    await rule.save();
    
    res.json({
      success: true,
      message: "Rule updated successfully",
      rule
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete rule
 */
exports.delete = async (req, res, next) => {
  try {
    const rule = await Rule.findByIdAndDelete(req.params.id);
    
    if (!rule) {
      return res.status(404).json({
        success: false,
        error: "Rule not found"
      });
    }
    
    res.json({
      success: true,
      message: "Rule deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle rule enabled/disabled
 */
exports.toggle = async (req, res, next) => {
  try {
    const rule = await Rule.findById(req.params.id);
    
    if (!rule) {
      return res.status(404).json({
        success: false,
        error: "Rule not found"
      });
    }
    
    rule.enabled = !rule.enabled;
    rule.metadata.lastModifiedBy = req.user?.id || "system";
    await rule.save();
    
    res.json({
      success: true,
      message: `Rule ${rule.enabled ? "enabled" : "disabled"}`,
      enabled: rule.enabled
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Test rule against sample request
 */
exports.test = async (req, res, next) => {
  try {
    const { rule, request } = req.body;
    
    if (!rule || !request) {
      return res.status(400).json({
        success: false,
        error: "Rule and request data are required"
      });
    }
    
    const matchedConditions = [];
    let allMatch = rule.conditionLogic === "AND";
    let anyMatch = false;
    
    for (const condition of rule.conditions) {
      const value = getNestedValue(request, condition.field);
      const matched = evaluateCondition(value, condition);
      
      if (matched) {
        matchedConditions.push(condition.field);
        anyMatch = true;
      } else if (rule.conditionLogic === "AND") {
        allMatch = false;
      }
    }
    
    const ruleMatched = rule.conditionLogic === "AND" ? allMatch : anyMatch;
    
    res.json({
      success: true,
      matched: ruleMatched,
      matchedConditions,
      action: ruleMatched ? rule.action : null,
      details: {
        conditionLogic: rule.conditionLogic,
        totalConditions: rule.conditions.length,
        matchedCount: matchedConditions.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reorder rules (update priorities)
 */
exports.reorder = async (req, res, next) => {
  try {
    const { order } = req.body; // Array of { id, priority }
    
    if (!order || !Array.isArray(order)) {
      return res.status(400).json({
        success: false,
        error: "Order array is required"
      });
    }
    
    const bulkOps = order.map(({ id, priority }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { priority } }
      }
    }));
    
    await Rule.bulkWrite(bulkOps);
    
    res.json({
      success: true,
      message: "Rules reordered successfully"
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions
function getNestedValue(obj, path) {
  return path.split(".").reduce((o, k) => (o || {})[k], obj);
}

function evaluateCondition(value, condition) {
  if (value === undefined || value === null) return false;
  
  const compareValue = condition.caseSensitive 
    ? String(value) 
    : String(value).toLowerCase();
  const conditionValue = condition.caseSensitive 
    ? String(condition.value) 
    : String(condition.value).toLowerCase();
  
  switch (condition.operator) {
    case "equals":
      return compareValue === conditionValue;
    case "contains":
      return compareValue.includes(conditionValue);
    case "startsWith":
      return compareValue.startsWith(conditionValue);
    case "endsWith":
      return compareValue.endsWith(conditionValue);
    case "matches":
      try {
        const regex = new RegExp(condition.value, condition.caseSensitive ? "" : "i");
        return regex.test(String(value));
      } catch {
        return false;
      }
    case "in":
      if (Array.isArray(condition.value)) {
        return condition.value.some(v => 
          condition.caseSensitive 
            ? String(v) === String(value)
            : String(v).toLowerCase() === compareValue
        );
      }
      return false;
    case "greaterThan":
      return Number(value) > Number(condition.value);
    case "lessThan":
      return Number(value) < Number(condition.value);
    default:
      return false;
  }
}
