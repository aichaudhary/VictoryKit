/**
 * Alert Routes - Security Alerts and Notifications
 */

const express = require('express');
const router = express.Router();
const { Alert, Device, Segment } = require('../models');

// GET /alerts - List all alerts
router.get('/', async (req, res) => {
  try {
    const { 
      severity, status, type, 
      page = 1, limit = 50, sort = '-triggeredAt' 
    } = req.query;
    
    const query = {};
    if (severity) query.severity = severity;
    if (status) query.status = status;
    if (type) query.type = type;
    
    const [alerts, total] = await Promise.all([
      Alert.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('affectedDevices', 'name ipAddress type status'),
      Alert.countDocuments(query)
    ]);
    
    res.json({ 
      success: true, 
      data: alerts,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /alerts/stats - Get alert statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Alert.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /alerts/active - Get active alerts
router.get('/active', async (req, res) => {
  try {
    const alerts = await Alert.getActive();
    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /alerts/critical - Get critical alerts
router.get('/critical', async (req, res) => {
  try {
    const alerts = await Alert.getCritical();
    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /alerts/recent - Get recent alerts
router.get('/recent', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const alerts = await Alert.getRecent(parseInt(limit));
    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /alerts/:id - Get alert by ID
router.get('/:id', async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('affectedDevices')
      .populate('affectedSegments')
      .populate('relatedAlerts', 'alertId title severity status')
      .populate('source.deviceId', 'name ipAddress type')
      .populate('source.scanId', 'scanId name type');
    
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /alerts - Create new alert
router.post('/', async (req, res) => {
  try {
    const alertData = {
      ...req.body,
      alertId: `alert_${Date.now()}`,
      triggeredAt: new Date(),
      createdBy: req.body.userId || 'system'
    };
    
    const alert = new Alert(alertData);
    await alert.save();
    
    // Real-time notification
    if (global.io) {
      global.io.to('alerts').emit('alert-created', alert);
      
      if (alert.severity === 'critical') {
        global.io.to('dashboard').emit('critical-alert', alert);
      }
    }
    
    res.status(201).json({ success: true, data: alert });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /alerts/:id - Update alert
router.put('/:id', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.body.userId || 'system' },
      { new: true, runValidators: true }
    );
    
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    
    if (global.io) {
      global.io.to('alerts').emit('alert-updated', alert);
    }
    
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /alerts/:id/acknowledge - Acknowledge alert
router.post('/:id/acknowledge', async (req, res) => {
  try {
    const { userId } = req.body;
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    
    await alert.acknowledge(userId);
    
    if (global.io) {
      global.io.to('alerts').emit('alert-acknowledged', alert);
    }
    
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /alerts/:id/resolve - Resolve alert
router.post('/:id/resolve', async (req, res) => {
  try {
    const { resolution, userId } = req.body;
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    
    await alert.resolve(resolution, userId);
    
    if (global.io) {
      global.io.to('alerts').emit('alert-resolved', alert);
    }
    
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /alerts/:id/escalate - Escalate alert
router.post('/:id/escalate', async (req, res) => {
  try {
    const { escalatedTo, userId } = req.body;
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    
    await alert.escalate(escalatedTo, userId);
    
    if (global.io) {
      global.io.to('alerts').emit('alert-escalated', alert);
    }
    
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /alerts/:id/action - Add action to alert
router.post('/:id/action', async (req, res) => {
  try {
    const { action, userId, result } = req.body;
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    
    await alert.addAction(action, userId, result);
    
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /alerts/:id/note - Add note to alert
router.post('/:id/note', async (req, res) => {
  try {
    const { content, author } = req.body;
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    
    await alert.addNote(content, author);
    
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /alerts/:id - Delete alert
router.delete('/:id', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    
    if (global.io) {
      global.io.to('alerts').emit('alert-deleted', { id: req.params.id });
    }
    
    res.json({ success: true, message: 'Alert deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /alerts/bulk/acknowledge - Bulk acknowledge alerts
router.post('/bulk/acknowledge', async (req, res) => {
  try {
    const { alertIds, userId } = req.body;
    
    await Alert.updateMany(
      { _id: { $in: alertIds } },
      { 
        status: 'acknowledged', 
        acknowledgedAt: new Date(),
        assignedTo: userId
      }
    );
    
    res.json({ success: true, message: `${alertIds.length} alerts acknowledged` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /alerts/bulk/resolve - Bulk resolve alerts
router.post('/bulk/resolve', async (req, res) => {
  try {
    const { alertIds, resolution } = req.body;
    
    await Alert.updateMany(
      { _id: { $in: alertIds } },
      { 
        status: 'resolved', 
        resolvedAt: new Date(),
        'response.resolution': resolution
      }
    );
    
    res.json({ success: true, message: `${alertIds.length} alerts resolved` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
