/**
 * Baseline Routes - Behavioral Baselines and Anomaly Detection
 */

const express = require('express');
const router = express.Router();
const { Baseline, Device, Alert } = require('../models');

// GET /baselines - List all baselines
router.get('/', async (req, res) => {
  try {
    const { deviceId, status, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (deviceId) query.device = deviceId;
    if (status) query.status = status;
    
    const [baselines, total] = await Promise.all([
      Baseline.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('device', 'name ipAddress type'),
      Baseline.countDocuments(query)
    ]);
    
    res.json({ 
      success: true, 
      data: baselines,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /baselines/stats - Get baseline statistics
router.get('/stats', async (req, res) => {
  try {
    const [total, active, learning, anomalies] = await Promise.all([
      Baseline.countDocuments(),
      Baseline.countDocuments({ status: 'active' }),
      Baseline.countDocuments({ status: 'learning' }),
      Baseline.aggregate([
        { $group: { _id: null, total: { $sum: '$anomalyCount' } } }
      ])
    ]);
    
    const recentAnomalies = await Baseline.aggregate([
      { $unwind: '$anomalyHistory' },
      { $match: { 'anomalyHistory.timestamp': { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } },
      { $count: 'count' }
    ]);
    
    res.json({
      success: true,
      data: {
        total,
        active,
        learning,
        totalAnomalies: anomalies[0]?.total || 0,
        last24hAnomalies: recentAnomalies[0]?.count || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /baselines/anomalies - Get recent anomalies across all baselines
router.get('/anomalies', async (req, res) => {
  try {
    const { hours = 24, severity, limit = 100 } = req.query;
    const since = new Date(Date.now() - parseInt(hours) * 60 * 60 * 1000);
    
    const pipeline = [
      { $unwind: '$anomalyHistory' },
      { $match: { 'anomalyHistory.timestamp': { $gte: since } } }
    ];
    
    if (severity) {
      pipeline.push({ $match: { 'anomalyHistory.severity': severity } });
    }
    
    pipeline.push(
      { $sort: { 'anomalyHistory.timestamp': -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'devices',
          localField: 'device',
          foreignField: '_id',
          as: 'deviceInfo'
        }
      },
      {
        $project: {
          anomaly: '$anomalyHistory',
          baselineId: '$baselineId',
          device: { $arrayElemAt: ['$deviceInfo', 0] }
        }
      }
    );
    
    const anomalies = await Baseline.aggregate(pipeline);
    
    res.json({ success: true, data: anomalies });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /baselines/device/:deviceId - Get baselines for a device
router.get('/device/:deviceId', async (req, res) => {
  try {
    const baselines = await Baseline.find({ device: req.params.deviceId })
      .populate('device', 'name ipAddress type');
    
    res.json({ success: true, data: baselines });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /baselines/:id - Get baseline by ID
router.get('/:id', async (req, res) => {
  try {
    const baseline = await Baseline.findById(req.params.id)
      .populate('device');
    
    if (!baseline) {
      return res.status(404).json({ success: false, error: 'Baseline not found' });
    }
    
    res.json({ success: true, data: baseline });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /baselines - Create new baseline
router.post('/', async (req, res) => {
  try {
    const baselineData = {
      ...req.body,
      baselineId: req.body.baselineId || `bl_${Date.now()}`,
      status: 'learning',
      learningStarted: new Date()
    };
    
    const baseline = new Baseline(baselineData);
    await baseline.save();
    
    if (global.io) {
      global.io.to('baselines').emit('baseline-created', baseline);
    }
    
    res.status(201).json({ success: true, data: baseline });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /baselines/auto-create - Auto-create baselines for devices without them
router.post('/auto-create', async (req, res) => {
  try {
    // Find devices without baselines
    const devicesWithBaselines = await Baseline.distinct('device');
    const devicesWithoutBaselines = await Device.find({
      _id: { $nin: devicesWithBaselines },
      status: 'online'
    }).limit(req.body.limit || 50);
    
    const created = [];
    for (const device of devicesWithoutBaselines) {
      const baseline = new Baseline({
        baselineId: `bl_${Date.now()}_${device._id}`,
        device: device._id,
        status: 'learning',
        learningStarted: new Date(),
        config: {
          learningPeriod: 7,
          updateInterval: 300,
          anomalyThreshold: 2.5
        }
      });
      await baseline.save();
      created.push(baseline);
    }
    
    res.json({ 
      success: true, 
      data: created,
      message: `Created ${created.length} baselines`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /baselines/:id - Update baseline
router.put('/:id', async (req, res) => {
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
});

// POST /baselines/:id/data - Add data point to baseline
router.post('/:id/data', async (req, res) => {
  try {
    const baseline = await Baseline.findById(req.params.id);
    
    if (!baseline) {
      return res.status(404).json({ success: false, error: 'Baseline not found' });
    }
    
    const { trafficMetrics, connectionMetrics, temporalMetrics, resourceMetrics } = req.body;
    
    // Update metrics
    if (trafficMetrics) {
      await baseline.addDataPoint('traffic', trafficMetrics);
    }
    if (connectionMetrics) {
      await baseline.addDataPoint('connection', connectionMetrics);
    }
    if (temporalMetrics) {
      await baseline.addDataPoint('temporal', temporalMetrics);
    }
    if (resourceMetrics) {
      await baseline.addDataPoint('resource', resourceMetrics);
    }
    
    res.json({ success: true, data: baseline });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /baselines/:id/analyze - Analyze current metrics against baseline
router.post('/:id/analyze', async (req, res) => {
  try {
    const baseline = await Baseline.findById(req.params.id).populate('device');
    
    if (!baseline) {
      return res.status(404).json({ success: false, error: 'Baseline not found' });
    }
    
    const { metrics } = req.body;
    const anomalies = [];
    
    // Check each metric type
    for (const [metricType, values] of Object.entries(metrics)) {
      const isAnomaly = baseline.detectAnomaly(metricType, values);
      if (isAnomaly) {
        anomalies.push({
          type: metricType,
          values,
          timestamp: new Date()
        });
        
        await baseline.recordAnomaly(metricType, values, 'medium');
      }
    }
    
    // Create alerts for anomalies
    if (anomalies.length > 0) {
      await Alert.create({
        alertId: `alert_${Date.now()}`,
        type: 'behavioral_anomaly',
        severity: anomalies.length > 2 ? 'high' : 'medium',
        title: `Behavioral Anomaly Detected: ${baseline.device?.name || 'Unknown Device'}`,
        description: `${anomalies.length} anomalies detected in ${anomalies.map(a => a.type).join(', ')}`,
        source: 'ml_engine',
        device: baseline.device?._id,
        metadata: { anomalies, baselineId: baseline._id }
      });
      
      if (global.io) {
        global.io.to('alerts').emit('anomaly-detected', {
          baselineId: baseline._id,
          deviceId: baseline.device?._id,
          anomalies
        });
      }
    }
    
    res.json({ 
      success: true, 
      data: {
        anomalyDetected: anomalies.length > 0,
        anomalies,
        baseline: baseline._id
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /baselines/:id/activate - Activate baseline (end learning)
router.post('/:id/activate', async (req, res) => {
  try {
    const baseline = await Baseline.findById(req.params.id);
    
    if (!baseline) {
      return res.status(404).json({ success: false, error: 'Baseline not found' });
    }
    
    baseline.status = 'active';
    baseline.learningCompleted = new Date();
    await baseline.save();
    
    res.json({ success: true, data: baseline });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /baselines/:id/reset - Reset baseline learning
router.post('/:id/reset', async (req, res) => {
  try {
    const baseline = await Baseline.findById(req.params.id);
    
    if (!baseline) {
      return res.status(404).json({ success: false, error: 'Baseline not found' });
    }
    
    baseline.status = 'learning';
    baseline.learningStarted = new Date();
    baseline.learningCompleted = null;
    baseline.dataPointCount = 0;
    baseline.anomalyCount = 0;
    baseline.anomalyHistory = [];
    
    // Reset metrics to defaults
    baseline.trafficMetrics = { avgBytesIn: 0, avgBytesOut: 0, avgPacketsIn: 0, avgPacketsOut: 0 };
    baseline.connectionMetrics = { avgActiveConnections: 0, avgNewConnections: 0, typicalPorts: [] };
    baseline.temporalMetrics = { activeHours: [], avgSessionDuration: 0 };
    baseline.resourceMetrics = { avgCpuUsage: 0, avgMemoryUsage: 0, avgBandwidthUsage: 0 };
    
    await baseline.save();
    
    res.json({ success: true, data: baseline, message: 'Baseline reset to learning mode' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /baselines/:id - Delete baseline
router.delete('/:id', async (req, res) => {
  try {
    const baseline = await Baseline.findByIdAndDelete(req.params.id);
    
    if (!baseline) {
      return res.status(404).json({ success: false, error: 'Baseline not found' });
    }
    
    res.json({ success: true, message: 'Baseline deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /baselines/bulk/analyze - Bulk analyze multiple devices
router.post('/bulk/analyze', async (req, res) => {
  try {
    const { deviceMetrics } = req.body; // Array of { deviceId, metrics }
    const results = [];
    
    for (const { deviceId, metrics } of deviceMetrics) {
      const baseline = await Baseline.findOne({ device: deviceId, status: 'active' });
      
      if (!baseline) {
        results.push({ deviceId, status: 'no_baseline' });
        continue;
      }
      
      let hasAnomaly = false;
      for (const [metricType, values] of Object.entries(metrics)) {
        if (baseline.detectAnomaly(metricType, values)) {
          hasAnomaly = true;
          await baseline.recordAnomaly(metricType, values, 'medium');
        }
      }
      
      results.push({ deviceId, status: hasAnomaly ? 'anomaly_detected' : 'normal' });
    }
    
    const anomalyCount = results.filter(r => r.status === 'anomaly_detected').length;
    
    if (anomalyCount > 0 && global.io) {
      global.io.to('alerts').emit('bulk-anomalies-detected', {
        count: anomalyCount,
        devices: results.filter(r => r.status === 'anomaly_detected').map(r => r.deviceId)
      });
    }
    
    res.json({ 
      success: true, 
      data: results,
      summary: {
        analyzed: results.length,
        anomalies: anomalyCount,
        noBaseline: results.filter(r => r.status === 'no_baseline').length,
        normal: results.filter(r => r.status === 'normal').length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
