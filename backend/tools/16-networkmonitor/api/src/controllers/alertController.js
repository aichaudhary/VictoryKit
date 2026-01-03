/**
 * Alert Controller
 * Handles network alert management endpoints
 */

const { alertService, websocketService } = require("../services");
const { NetworkAlert } = require("../models");

// Get all alerts
exports.getAlerts = async (req, res) => {
  try {
    const options = {
      severity: req.query.severity,
      type: req.query.type,
      status: req.query.status,
      resolved: req.query.resolved === "true" ? true : req.query.resolved === "false" ? false : undefined,
      sourceIp: req.query.sourceIp,
      deviceId: req.query.deviceId,
      startTime: req.query.startTime,
      endTime: req.query.endTime,
      limit: parseInt(req.query.limit) || 100,
      offset: parseInt(req.query.offset) || 0
    };

    const result = await alertService.getAlerts(options);

    res.json({
      success: true,
      count: result.alerts.length,
      total: result.total,
      data: result.alerts
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get alert by ID
exports.getAlert = async (req, res) => {
  try {
    const alert = await NetworkAlert.findById(req.params.id)
      .populate("source.deviceId", "name ip type");

    if (!alert) {
      return res.status(404).json({ success: false, error: "Alert not found" });
    }

    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create alert
exports.createAlert = async (req, res) => {
  try {
    const alert = await alertService.createAlert(req.body);

    websocketService.notifyNewAlert(alert);

    res.status(201).json({ success: true, data: alert });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Acknowledge alert
exports.acknowledgeAlert = async (req, res) => {
  try {
    const userId = req.user?.id || "system";
    const alert = await alertService.acknowledgeAlert(req.params.id, userId);

    websocketService.notifyAlertUpdate(alert);

    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Resolve alert
exports.resolveAlert = async (req, res) => {
  try {
    const userId = req.user?.id || "system";
    const { resolution } = req.body;
    
    const alert = await alertService.resolveAlert(req.params.id, userId, resolution);

    websocketService.notifyAlertUpdate(alert);

    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update alert status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const alert = await NetworkAlert.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ success: false, error: "Alert not found" });
    }

    websocketService.notifyAlertUpdate(alert);

    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Add note to alert
exports.addNote = async (req, res) => {
  try {
    const { note } = req.body;
    const author = req.user?.name || "System";

    const alert = await alertService.addNote(req.params.id, note, author);

    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get alert statistics
exports.getStats = async (req, res) => {
  try {
    const stats = await alertService.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Bulk acknowledge alerts
exports.bulkAcknowledge = async (req, res) => {
  try {
    const { alertIds } = req.body;
    const userId = req.user?.id || "system";

    const results = await Promise.all(
      alertIds.map(id => alertService.acknowledgeAlert(id, userId).catch(e => ({ error: e.message, id })))
    );

    const acknowledged = results.filter(r => !r.error);
    const failed = results.filter(r => r.error);

    res.json({
      success: true,
      acknowledged: acknowledged.length,
      failed: failed.length,
      errors: failed
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Bulk resolve alerts
exports.bulkResolve = async (req, res) => {
  try {
    const { alertIds, resolution } = req.body;
    const userId = req.user?.id || "system";

    const results = await Promise.all(
      alertIds.map(id => alertService.resolveAlert(id, userId, resolution).catch(e => ({ error: e.message, id })))
    );

    const resolved = results.filter(r => !r.error);
    const failed = results.filter(r => r.error);

    res.json({
      success: true,
      resolved: resolved.length,
      failed: failed.length,
      errors: failed
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete alert
exports.deleteAlert = async (req, res) => {
  try {
    const alert = await NetworkAlert.findByIdAndDelete(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, error: "Alert not found" });
    }
    res.json({ success: true, message: "Alert deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
