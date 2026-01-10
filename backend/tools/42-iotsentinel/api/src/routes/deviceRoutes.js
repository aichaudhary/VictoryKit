/**
 * Device Routes - IoT Device Management Endpoints
 */

const express = require('express');
const router = express.Router();
const { Device, Vulnerability, Baseline, Segment } = require('../models');

// GET /devices - List all devices with filters
router.get('/', async (req, res) => {
  try {
    const { 
      status, type, riskLevel, segment, manufacturer,
      search, page = 1, limit = 50, sort = '-lastSeen' 
    } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (riskLevel) query.riskLevel = riskLevel;
    if (segment) query.networkSegment = segment;
    if (manufacturer) query.manufacturer = { $regex: manufacturer, $options: 'i' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } },
        { macAddress: { $regex: search, $options: 'i' } }
      ];
    }
    
    const [devices, total] = await Promise.all([
      Device.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('networkSegment', 'name type')
        .populate('firmware', 'name version'),
      Device.countDocuments(query)
    ]);
    
    res.json({ 
      success: true, 
      data: devices, 
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /devices/stats - Get device statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Device.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /devices/high-risk - Get high-risk devices
router.get('/high-risk', async (req, res) => {
  try {
    const devices = await Device.getHighRisk();
    res.json({ success: true, data: devices });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /devices/offline - Get offline devices
router.get('/offline', async (req, res) => {
  try {
    const devices = await Device.getOffline();
    res.json({ success: true, data: devices });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /devices/:id - Get device by ID
router.get('/:id', async (req, res) => {
  try {
    const device = await Device.findById(req.params.id)
      .populate('vulnerabilities')
      .populate('networkSegment')
      .populate('firmware')
      .populate('baseline');
    
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }
    
    res.json({ success: true, data: device });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /devices - Create/Register new device
router.post('/', async (req, res) => {
  try {
    const deviceData = {
      ...req.body,
      deviceId: req.body.deviceId || `dev_${Date.now()}`,
      firstDiscovered: new Date(),
      lastSeen: new Date()
    };
    
    const device = new Device(deviceData);
    await device.save();
    
    // Emit real-time update
    if (global.io) {
      global.io.to('dashboard').emit('device-created', device);
    }
    
    res.status(201).json({ success: true, data: device });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /devices/:id - Update device
router.put('/:id', async (req, res) => {
  try {
    const device = await Device.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.body.userId || 'system' },
      { new: true, runValidators: true }
    );
    
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }
    
    // Emit real-time update
    if (global.io) {
      global.io.to(`device-${device._id}`).emit('device-updated', device);
      global.io.to('dashboard').emit('device-updated', device);
    }
    
    res.json({ success: true, data: device });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /devices/:id - Delete device
router.delete('/:id', async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);
    
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }
    
    // Emit real-time update
    if (global.io) {
      global.io.to('dashboard').emit('device-deleted', { id: req.params.id });
    }
    
    res.json({ success: true, message: 'Device deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /devices/:id/quarantine - Quarantine device
router.post('/:id/quarantine', async (req, res) => {
  try {
    const device = await Device.findByIdAndUpdate(
      req.params.id,
      { status: 'quarantined', notes: req.body.reason || 'Manual quarantine' },
      { new: true }
    );
    
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }
    
    if (global.io) {
      global.io.to('alerts').emit('device-quarantined', device);
    }
    
    res.json({ success: true, data: device });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /devices/:id/unquarantine - Remove from quarantine
router.post('/:id/unquarantine', async (req, res) => {
  try {
    const device = await Device.findByIdAndUpdate(
      req.params.id,
      { status: 'online', notes: '' },
      { new: true }
    );
    
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }
    
    res.json({ success: true, data: device });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /devices/:id/scan - Trigger scan for specific device
router.post('/:id/scan', async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }
    
    // This would trigger an actual scan - for now return mock
    res.json({ 
      success: true, 
      message: 'Scan initiated',
      scanId: `scan_${Date.now()}`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /devices/:id/recalculate-risk - Recalculate device risk score
router.post('/:id/recalculate-risk', async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }
    
    await device.updateRiskScore();
    
    res.json({ success: true, data: { riskScore: device.riskScore, riskLevel: device.riskLevel } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
