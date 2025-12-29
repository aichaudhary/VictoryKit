/**
 * Alert Controller
 * Handle network security alerts
 */

const Alert = require("../models/Alert");
const Rule = require("../models/Rule");
const alertService = require("../services/alertService");

exports.getAll = async (req, res) => {
  try {
    const { severity, status, category, page = 1, limit = 50 } = req.query;
    const query = {};

    if (severity) query.severity = severity;
    if (status) query.status = status;
    if (category) query.category = category;

    const alerts = await Alert.find(query)
      .populate("network", "name cidr")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Alert.countDocuments(query);

    res.json({
      success: true,
      data: alerts,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id).populate("network");
    if (!alert) {
      return res.status(404).json({ success: false, error: "Alert not found" });
    }
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const alert = new Alert(req.body);

    // Update rule hit count if associated
    if (req.body.rule?.sid) {
      await Rule.findOneAndUpdate(
        { sid: req.body.rule.sid },
        { $inc: { hitCount: 1 }, lastHit: new Date() }
      );
    }

    await alert.save();
    res.status(201).json({ success: true, data: alert });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.acknowledge = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, error: "Alert not found" });
    }

    alert.status = "acknowledged";
    alert.timeline.push({
      action: "acknowledged",
      user: req.body.user || "system",
      notes: req.body.notes,
    });

    await alert.save();
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.resolve = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, error: "Alert not found" });
    }

    alert.status = req.body.falsePositive ? "false_positive" : "resolved";
    alert.resolution = {
      action: req.body.action,
      notes: req.body.notes,
      resolvedBy: req.body.user || "system",
      resolvedAt: new Date(),
    };
    alert.timeline.push({
      action: "resolved",
      user: req.body.user || "system",
      notes: req.body.notes,
    });

    await alert.save();
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [bySeverity, byStatus, byCategory, recent] = await Promise.all([
      Alert.aggregate([{ $group: { _id: "$severity", count: { $sum: 1 } } }]),
      Alert.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Alert.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
      Alert.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
    ]);

    res.json({
      success: true,
      data: { bySeverity, byStatus, byCategory, last24Hours: recent },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.analyze = async (req, res) => {
  try {
    const { alertId, alertData } = req.body;

    let alert;
    if (alertId) {
      alert = await Alert.findById(alertId);
      if (!alert) {
        return res
          .status(404)
          .json({ success: false, error: "Alert not found" });
      }
    } else if (alertData) {
      alert = alertData;
    } else {
      return res
        .status(400)
        .json({ success: false, error: "Alert ID or data required" });
    }

    const analysis = await alertService.analyzeAlert(alert);

    // Save analysis if updating existing alert
    if (alertId) {
      await Alert.findByIdAndUpdate(alertId, {
        mlAnalysis: {
          ...analysis,
          analyzedAt: new Date(),
        },
      });
    }

    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
