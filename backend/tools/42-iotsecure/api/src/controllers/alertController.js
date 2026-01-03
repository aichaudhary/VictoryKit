/**
 * Alert Controller
 * Handles security alerts and incident management
 */

const { Alert, Device, Vulnerability } = require('../models');

// Helper for pagination
const getPagination = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Get all alerts with filtering
 */
exports.getAlerts = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    
    const filter = {};
    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.alertType = req.query.type;
    if (req.query.category) filter.category = req.query.category;
    
    const [alerts, total] = await Promise.all([
      Alert.find(filter)
        .sort({ createdAt: -1, severity: -1 })
        .skip(skip)
        .limit(limit)
        .populate('deviceId', 'name ipAddress type'),
      Alert.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: alerts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get alert statistics
 */
exports.getAlertStats = async (req, res) => {
  try {
    const stats = await Alert.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get open alerts
 */
exports.getOpenAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ status: 'open' })
      .sort({ severity: -1, createdAt: -1 })
      .populate('deviceId', 'name ipAddress');
    res.json({ success: true, data: alerts, count: alerts.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get critical unresolved alerts
 */
exports.getCriticalAlerts = async (req, res) => {
  try {
    const alerts = await Alert.getCriticalUnresolved();
    res.json({ success: true, data: alerts, count: alerts.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get recent alerts
 */
exports.getRecentAlerts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const alerts = await Alert.getRecent(limit);
    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get alerts by severity
 */
exports.getBySeverity = async (req, res) => {
  try {
    const { severity } = req.params;
    const { page, limit, skip } = getPagination(req);
    
    const [alerts, total] = await Promise.all([
      Alert.find({ severity }).skip(skip).limit(limit).populate('deviceId', 'name ipAddress'),
      Alert.countDocuments({ severity })
    ]);
    
    res.json({
      success: true,
      data: alerts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get alerts by category
 */
exports.getByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page, limit, skip } = getPagination(req);
    
    const [alerts, total] = await Promise.all([
      Alert.find({ category }).skip(skip).limit(limit),
      Alert.countDocuments({ category })
    ]);
    
    res.json({
      success: true,
      data: alerts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get alerts for a device
 */
exports.getDeviceAlerts = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const alerts = await Alert.getByDevice(deviceId);
    res.json({ success: true, data: alerts, count: alerts.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Search alerts
 */
exports.searchAlerts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, error: 'Search query required' });
    }
    
    const searchRegex = new RegExp(q, 'i');
    const alerts = await Alert.find({
      $or: [
        { alertId: searchRegex },
        { title: searchRegex },
        { description: searchRegex },
        { 'source.name': searchRegex }
      ]
    }).limit(50).populate('deviceId', 'name ipAddress');
    
    res.json({ success: true, data: alerts, count: alerts.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get single alert
 */
exports.getAlertById = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('deviceId')
      .populate('vulnerabilityId');
    
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create alert
 */
exports.createAlert = async (req, res) => {
  try {
    const alert = await Alert.create(req.body);
    res.status(201).json({ success: true, data: alert });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Update alert
 */
exports.updateAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Delete alert
 */
exports.deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    
    res.json({ success: true, message: 'Alert deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Acknowledge alert
 */
exports.acknowledgeAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    
    await alert.acknowledge(req.body.userId, req.body.notes);
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Resolve alert
 */
exports.resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    
    await alert.resolve(req.body.resolution, req.body.notes);
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Dismiss alert
 */
exports.dismissAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'dismissed',
        resolution: { 
          resolvedBy: req.body.userId,
          resolvedAt: new Date(),
          notes: req.body.reason || 'Dismissed by user'
        }
      },
      { new: true }
    );
    
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Escalate alert
 */
exports.escalateAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    
    await alert.escalate(req.body.level, req.body.reason, req.body.assignee);
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Assign alert
 */
exports.assignAlert = async (req, res) => {
  try {
    const { userId, userName } = req.body;
    
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { 
        'assignment.userId': userId,
        'assignment.userName': userName,
        'assignment.assignedAt': new Date(),
        status: 'assigned'
      },
      { new: true }
    );
    
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Add comment to alert
 */
exports.addComment = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    
    await alert.addComment(req.body.userId, req.body.userName, req.body.content);
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get alert comments
 */
exports.getComments = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    
    res.json({ success: true, data: alert.comments || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Add evidence to alert
 */
exports.addEvidence = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    
    await alert.addEvidence(
      req.body.type,
      req.body.description,
      req.body.data,
      req.body.source
    );
    
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get alert evidence
 */
exports.getEvidence = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    
    res.json({ success: true, data: alert.evidence || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Bulk acknowledge
 */
exports.bulkAcknowledge = async (req, res) => {
  try {
    const { alertIds, userId } = req.body;
    
    const result = await Alert.updateMany(
      { _id: { $in: alertIds } },
      { 
        $set: { 
          status: 'acknowledged',
          'acknowledgement.userId': userId,
          'acknowledgement.timestamp': new Date()
        }
      }
    );
    
    res.json({ success: true, modified: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Bulk resolve
 */
exports.bulkResolve = async (req, res) => {
  try {
    const { alertIds, resolution, userId } = req.body;
    
    const result = await Alert.updateMany(
      { _id: { $in: alertIds } },
      { 
        $set: { 
          status: 'resolved',
          'resolution.resolvedBy': userId,
          'resolution.resolvedAt': new Date(),
          'resolution.notes': resolution
        }
      }
    );
    
    res.json({ success: true, modified: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Bulk dismiss
 */
exports.bulkDismiss = async (req, res) => {
  try {
    const { alertIds, reason, userId } = req.body;
    
    const result = await Alert.updateMany(
      { _id: { $in: alertIds } },
      { 
        $set: { 
          status: 'dismissed',
          'resolution.resolvedBy': userId,
          'resolution.resolvedAt': new Date(),
          'resolution.notes': reason || 'Bulk dismissed'
        }
      }
    );
    
    res.json({ success: true, modified: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get alert rules
 */
exports.getAlertRules = async (req, res) => {
  try {
    // TODO: Implement alert rules management
    res.json({ 
      success: true, 
      data: [],
      message: 'Alert rules not yet implemented'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create alert rule
 */
exports.createAlertRule = async (req, res) => {
  try {
    // TODO: Implement alert rules management
    res.status(201).json({ 
      success: true, 
      message: 'Alert rules not yet implemented'
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Update alert rule
 */
exports.updateAlertRule = async (req, res) => {
  try {
    // TODO: Implement alert rules management
    res.json({ 
      success: true, 
      message: 'Alert rules not yet implemented'
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Delete alert rule
 */
exports.deleteAlertRule = async (req, res) => {
  try {
    // TODO: Implement alert rules management
    res.json({ 
      success: true, 
      message: 'Alert rules not yet implemented'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Export alerts to CSV
 */
exports.exportCSV = async (req, res) => {
  try {
    const alerts = await Alert.find({}).lean();
    
    const headers = ['alertId', 'title', 'alertType', 'severity', 'status', 'category', 'createdAt'];
    const rows = alerts.map(a => 
      headers.map(h => a[h] || '').join(',')
    );
    
    const csv = [headers.join(','), ...rows].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=alerts.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Export alerts to JSON
 */
exports.exportJSON = async (req, res) => {
  try {
    const alerts = await Alert.find({}).lean();
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=alerts.json');
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
