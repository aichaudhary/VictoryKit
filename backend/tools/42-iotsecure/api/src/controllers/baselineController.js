/**
 * Baseline Controller
 * Handles behavioral baselines and anomaly detection
 */

const { Baseline, Device } = require('../models');

// Helper for pagination
const getPagination = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Get all baselines with filtering
 */
exports.getBaselines = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    
    const filter = {};
    if (req.query.deviceId) filter.deviceId = req.query.deviceId;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    
    const [baselines, total] = await Promise.all([
      Baseline.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('deviceId', 'name ipAddress type'),
      Baseline.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: baselines,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get baseline statistics
 */
exports.getBaselineStats = async (req, res) => {
  try {
    const stats = await Baseline.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get active baselines
 */
exports.getActiveBaselines = async (req, res) => {
  try {
    const baselines = await Baseline.getActive();
    res.json({ success: true, data: baselines, count: baselines.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get baselines by device
 */
exports.getBaselinesByDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const baselines = await Baseline.find({ deviceId }).sort({ createdAt: -1 });
    
    res.json({ success: true, data: baselines, count: baselines.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get baselines by type
 */
exports.getBaselinesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { page, limit, skip } = getPagination(req);
    
    const [baselines, total] = await Promise.all([
      Baseline.find({ type }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Baseline.countDocuments({ type })
    ]);
    
    res.json({
      success: true,
      data: baselines,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get single baseline
 */
exports.getBaselineById = async (req, res) => {
  try {
    const baseline = await Baseline.findById(req.params.id)
      .populate('deviceId', 'name ipAddress type manufacturer');
    
    if (!baseline) {
      return res.status(404).json({ success: false, error: 'Baseline not found' });
    }
    
    res.json({ success: true, data: baseline });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create baseline
 */
exports.createBaseline = async (req, res) => {
  try {
    const baseline = await Baseline.create(req.body);
    res.status(201).json({ success: true, data: baseline });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Update baseline
 */
exports.updateBaseline = async (req, res) => {
  try {
    const baseline = await Baseline.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!baseline) {
      return res.status(404).json({ success: false, error: 'Baseline not found' });
    }
    
    res.json({ success: true, data: baseline });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Delete baseline
 */
exports.deleteBaseline = async (req, res) => {
  try {
    const baseline = await Baseline.findByIdAndDelete(req.params.id);
    
    if (!baseline) {
      return res.status(404).json({ success: false, error: 'Baseline not found' });
    }
    
    res.json({ success: true, message: 'Baseline deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Start baseline learning
 */
exports.startLearning = async (req, res) => {
  try {
    const baseline = await Baseline.findById(req.params.id);
    
    if (!baseline) {
      return res.status(404).json({ success: false, error: 'Baseline not found' });
    }
    
    await baseline.startLearning(req.body.duration || 7 * 24 * 60 * 60 * 1000); // 7 days default
    res.json({ success: true, data: baseline });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Stop baseline learning
 */
exports.stopLearning = async (req, res) => {
  try {
    const baseline = await Baseline.findById(req.params.id);
    
    if (!baseline) {
      return res.status(404).json({ success: false, error: 'Baseline not found' });
    }
    
    await baseline.stopLearning();
    res.json({ success: true, data: baseline });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update baseline thresholds
 */
exports.updateThresholds = async (req, res) => {
  try {
    const baseline = await Baseline.findById(req.params.id);
    
    if (!baseline) {
      return res.status(404).json({ success: false, error: 'Baseline not found' });
    }
    
    baseline.thresholds = { ...baseline.thresholds, ...req.body.thresholds };
    await baseline.save();
    
    res.json({ success: true, data: baseline });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get baseline anomalies
 */
exports.getAnomalies = async (req, res) => {
  try {
    const baseline = await Baseline.findById(req.params.id);
    
    if (!baseline) {
      return res.status(404).json({ success: false, error: 'Baseline not found' });
    }
    
    const anomalies = await baseline.getAnomalies();
    res.json({ success: true, data: anomalies, count: anomalies.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Add exception to baseline
 */
exports.addException = async (req, res) => {
  try {
    const baseline = await Baseline.findById(req.params.id);
    
    if (!baseline) {
      return res.status(404).json({ success: false, error: 'Baseline not found' });
    }
    
    baseline.exceptions.push({
      type: req.body.type,
      pattern: req.body.pattern,
      reason: req.body.reason,
      addedBy: req.body.userId,
      addedAt: new Date()
    });
    
    await baseline.save();
    res.json({ success: true, data: baseline });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Remove exception from baseline
 */
exports.removeException = async (req, res) => {
  try {
    const baseline = await Baseline.findById(req.params.id);
    
    if (!baseline) {
      return res.status(404).json({ success: false, error: 'Baseline not found' });
    }
    
    baseline.exceptions = baseline.exceptions.filter(
      exception => exception._id.toString() !== req.params.exceptionId
    );
    
    await baseline.save();
    res.json({ success: true, data: baseline });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get baseline metrics
 */
exports.getMetrics = async (req, res) => {
  try {
    const baseline = await Baseline.findById(req.params.id);
    
    if (!baseline) {
      return res.status(404).json({ success: false, error: 'Baseline not found' });
    }
    
    const metrics = await baseline.getMetrics();
    res.json({ success: true, data: metrics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Compare baseline with current data
 */
exports.compareWithCurrent = async (req, res) => {
  try {
    const baseline = await Baseline.findById(req.params.id);
    
    if (!baseline) {
      return res.status(404).json({ success: false, error: 'Baseline not found' });
    }
    
    const comparison = await baseline.compareWithCurrent();
    res.json({ success: true, data: comparison });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Reset baseline
 */
exports.resetBaseline = async (req, res) => {
  try {
    const baseline = await Baseline.findById(req.params.id);
    
    if (!baseline) {
      return res.status(404).json({ success: false, error: 'Baseline not found' });
    }
    
    await baseline.reset();
    res.json({ success: true, data: baseline });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Clone baseline
 */
exports.cloneBaseline = async (req, res) => {
  try {
    const original = await Baseline.findById(req.params.id);
    
    if (!original) {
      return res.status(404).json({ success: false, error: 'Baseline not found' });
    }
    
    const cloned = await Baseline.create({
      deviceId: req.body.deviceId || original.deviceId,
      type: original.type,
      name: req.body.name || `${original.name} (Copy)`,
      description: req.body.description || original.description,
      thresholds: original.thresholds,
      patterns: original.patterns,
      exceptions: original.exceptions,
      status: 'inactive'
    });
    
    res.status(201).json({ success: true, data: cloned });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Bulk update baselines
 */
exports.bulkUpdate = async (req, res) => {
  try {
    const { baselineIds, updates } = req.body;
    
    const result = await Baseline.updateMany(
      { _id: { $in: baselineIds } },
      { $set: updates }
    );
    
    res.json({ success: true, modified: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Bulk delete baselines
 */
exports.bulkDelete = async (req, res) => {
  try {
    const { baselineIds } = req.body;
    
    const result = await Baseline.deleteMany({ _id: { $in: baselineIds } });
    res.json({ success: true, deleted: result.deletedCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Export baselines to JSON
 */
exports.exportJSON = async (req, res) => {
  try {
    const baselines = await Baseline.find({}).lean();
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=baselines.json');
    res.json(baselines);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
