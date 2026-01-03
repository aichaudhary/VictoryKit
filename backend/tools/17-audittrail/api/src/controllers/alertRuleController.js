/**
 * AuditTrail - AlertRule Controller
 */

const AlertRule = require("../models/AlertRule");
const AuditLog = require("../models/AuditLog");
const { v4: uuidv4 } = require("uuid");

exports.getAll = async (req, res) => {
  try {
    const { severity, isActive, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (severity) filter.severity = severity;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const skip = (page - 1) * limit;

    const [rules, total] = await Promise.all([
      AlertRule.find(filter)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ severity: -1, name: 1 }),
      AlertRule.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: rules,
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
    const rule = await AlertRule.findById(req.params.id);
    if (!rule) {
      return res
        .status(404)
        .json({ success: false, error: "Alert rule not found" });
    }
    res.json({ success: true, data: rule });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const rule = new AlertRule({
      ...req.body,
      ruleId: req.body.ruleId || `rule-${uuidv4().substring(0, 8)}`,
    });
    await rule.save();
    res.status(201).json({ success: true, data: rule });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const rule = await AlertRule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!rule) {
      return res
        .status(404)
        .json({ success: false, error: "Alert rule not found" });
    }
    res.json({ success: true, data: rule });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const rule = await AlertRule.findByIdAndDelete(req.params.id);
    if (!rule) {
      return res
        .status(404)
        .json({ success: false, error: "Alert rule not found" });
    }
    res.json({ success: true, message: "Alert rule deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.toggle = async (req, res) => {
  try {
    const rule = await AlertRule.findById(req.params.id);
    if (!rule) {
      return res
        .status(404)
        .json({ success: false, error: "Alert rule not found" });
    }
    
    rule.enabled = !rule.enabled;
    rule.isActive = rule.enabled; // For compatibility
    await rule.save();
    
    res.json({ 
      success: true, 
      data: rule,
      message: `Rule ${rule.enabled ? 'enabled' : 'disabled'}`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTriggeredAlerts = async (req, res) => {
  try {
    const { startDate, endDate, limit = 100 } = req.query;

    const filter = { "statistics.lastTriggered": { $exists: true } };
    if (startDate || endDate) {
      filter["statistics.lastTriggered"] = {};
      if (startDate)
        filter["statistics.lastTriggered"].$gte = new Date(startDate);
      if (endDate) filter["statistics.lastTriggered"].$lte = new Date(endDate);
    }

    const rules = await AlertRule.find(filter)
      .sort({ "statistics.lastTriggered": -1 })
      .limit(parseInt(limit));

    res.json({ success: true, data: rules });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
