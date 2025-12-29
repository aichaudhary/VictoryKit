/**
 * Rule Controller
 * Handle IDS/IPS rules
 */

const Rule = require("../models/Rule");

exports.getAll = async (req, res) => {
  try {
    const { category, severity, enabled, page = 1, limit = 100 } = req.query;
    const query = {};

    if (category) query.category = category;
    if (severity) query.severity = severity;
    if (enabled !== undefined) query.enabled = enabled === "true";

    const rules = await Rule.find(query)
      .sort({ hitCount: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Rule.countDocuments(query);

    res.json({
      success: true,
      data: rules,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const rule = await Rule.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({ success: false, error: "Rule not found" });
    }
    res.json({ success: true, data: rule });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    // Auto-generate SID if not provided
    if (!req.body.sid) {
      const lastRule = await Rule.findOne().sort({ sid: -1 });
      req.body.sid = lastRule ? lastRule.sid + 1 : 1000000;
    }

    const rule = new Rule(req.body);
    await rule.save();
    res.status(201).json({ success: true, data: rule });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const rule = await Rule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!rule) {
      return res.status(404).json({ success: false, error: "Rule not found" });
    }
    res.json({ success: true, data: rule });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const rule = await Rule.findByIdAndDelete(req.params.id);
    if (!rule) {
      return res.status(404).json({ success: false, error: "Rule not found" });
    }
    res.json({ success: true, message: "Rule deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.enable = async (req, res) => {
  try {
    const rule = await Rule.findByIdAndUpdate(
      req.params.id,
      { enabled: true },
      { new: true }
    );
    if (!rule) {
      return res.status(404).json({ success: false, error: "Rule not found" });
    }
    res.json({ success: true, data: rule });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.disable = async (req, res) => {
  try {
    const rule = await Rule.findByIdAndUpdate(
      req.params.id,
      { enabled: false },
      { new: true }
    );
    if (!rule) {
      return res.status(404).json({ success: false, error: "Rule not found" });
    }
    res.json({ success: true, data: rule });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.importRules = async (req, res) => {
  try {
    const { rules, source = "custom" } = req.body;

    if (!Array.isArray(rules)) {
      return res
        .status(400)
        .json({ success: false, error: "Rules must be an array" });
    }

    const results = { imported: 0, failed: 0, errors: [] };

    for (const ruleData of rules) {
      try {
        ruleData.source = source;
        if (!ruleData.sid) {
          const lastRule = await Rule.findOne().sort({ sid: -1 });
          ruleData.sid = lastRule ? lastRule.sid + 1 : 1000000;
        }

        await Rule.findOneAndUpdate({ sid: ruleData.sid }, ruleData, {
          upsert: true,
          new: true,
        });
        results.imported++;
      } catch (err) {
        results.failed++;
        results.errors.push({ sid: ruleData.sid, error: err.message });
      }
    }

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
