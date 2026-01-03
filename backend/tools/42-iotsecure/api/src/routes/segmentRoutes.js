/**
 * Segment Routes - Network Segmentation and Access Control
 */

const express = require('express');
const router = express.Router();
const { Segment, Device } = require('../models');

// GET /segments - List all segments
router.get('/', async (req, res) => {
  try {
    const { type, status, securityLevel, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (securityLevel) query.securityLevel = securityLevel;
    
    const [segments, total] = await Promise.all([
      Segment.find(query)
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('devices', 'name ipAddress type status riskLevel'),
      Segment.countDocuments(query)
    ]);
    
    res.json({ 
      success: true, 
      data: segments,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /segments/stats - Get segment statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Segment.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /segments/topology - Get network topology
router.get('/topology', async (req, res) => {
  try {
    const segments = await Segment.find({ status: 'active' })
      .select('segmentId name type securityLevel network devices allowedSegments blockedSegments color')
      .populate('devices', 'name ipAddress type status')
      .populate('allowedSegments', 'segmentId name')
      .populate('blockedSegments', 'segmentId name');
    
    // Format for topology visualization
    const nodes = segments.map(s => ({
      id: s._id,
      segmentId: s.segmentId,
      name: s.name,
      type: s.type,
      securityLevel: s.securityLevel,
      deviceCount: s.devices.length,
      color: s.color,
      subnet: s.network?.subnet
    }));
    
    const edges = [];
    segments.forEach(s => {
      s.allowedSegments?.forEach(target => {
        edges.push({
          source: s._id,
          target: target._id,
          type: 'allowed'
        });
      });
    });
    
    res.json({ success: true, data: { nodes, edges } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /segments/:id - Get segment by ID
router.get('/:id', async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id)
      .populate('devices')
      .populate('allowedSegments', 'segmentId name type')
      .populate('blockedSegments', 'segmentId name type');
    
    if (!segment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }
    
    res.json({ success: true, data: segment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /segments - Create new segment
router.post('/', async (req, res) => {
  try {
    const segmentData = {
      ...req.body,
      segmentId: req.body.segmentId || `seg_${Date.now()}`,
      createdBy: req.body.userId || 'system'
    };
    
    const segment = new Segment(segmentData);
    await segment.save();
    
    if (global.io) {
      global.io.to('dashboard').emit('segment-created', segment);
    }
    
    res.status(201).json({ success: true, data: segment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /segments/:id - Update segment
router.put('/:id', async (req, res) => {
  try {
    const segment = await Segment.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.body.userId || 'system' },
      { new: true, runValidators: true }
    );
    
    if (!segment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }
    
    if (global.io) {
      global.io.to(`segment-${segment._id}`).emit('segment-updated', segment);
    }
    
    res.json({ success: true, data: segment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /segments/:id - Delete segment
router.delete('/:id', async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    
    if (!segment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }
    
    // Check if segment has devices
    if (segment.devices?.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete segment with assigned devices. Remove devices first.' 
      });
    }
    
    await segment.deleteOne();
    
    res.json({ success: true, message: 'Segment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /segments/:id/devices - Add devices to segment
router.post('/:id/devices', async (req, res) => {
  try {
    const { deviceIds } = req.body;
    const segment = await Segment.findById(req.params.id);
    
    if (!segment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }
    
    for (const deviceId of deviceIds) {
      await segment.addDevice(deviceId);
      await Device.findByIdAndUpdate(deviceId, { networkSegment: segment._id });
    }
    
    res.json({ success: true, data: segment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /segments/:id/devices/:deviceId - Remove device from segment
router.delete('/:id/devices/:deviceId', async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    
    if (!segment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }
    
    await segment.removeDevice(req.params.deviceId);
    await Device.findByIdAndUpdate(req.params.deviceId, { $unset: { networkSegment: 1 } });
    
    res.json({ success: true, data: segment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /segments/:id/firewall-rules - Add firewall rule
router.post('/:id/firewall-rules', async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    
    if (!segment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }
    
    await segment.addFirewallRule(req.body);
    
    res.json({ success: true, data: segment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /segments/:id/firewall-rules/:ruleId - Update firewall rule
router.put('/:id/firewall-rules/:ruleId', async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    
    if (!segment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }
    
    await segment.updateFirewallRule(req.params.ruleId, req.body);
    
    res.json({ success: true, data: segment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /segments/:id/firewall-rules/:ruleId - Delete firewall rule
router.delete('/:id/firewall-rules/:ruleId', async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    
    if (!segment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }
    
    await segment.deleteFirewallRule(req.params.ruleId);
    
    res.json({ success: true, data: segment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /segments/:id/quarantine - Quarantine segment
router.post('/:id/quarantine', async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    
    if (!segment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }
    
    await segment.quarantine(req.body.reason || 'Manual quarantine');
    
    if (global.io) {
      global.io.to('alerts').emit('segment-quarantined', segment);
    }
    
    res.json({ success: true, data: segment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /segments/:id/activate - Activate segment
router.post('/:id/activate', async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    
    if (!segment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }
    
    await segment.activate();
    
    res.json({ success: true, data: segment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /segments/:id/access-policies - Add access policy
router.post('/:id/access-policies', async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    
    if (!segment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }
    
    const policy = {
      ...req.body,
      policyId: `policy_${Date.now()}`
    };
    
    segment.accessPolicies.push(policy);
    segment.accessPolicies.sort((a, b) => a.priority - b.priority);
    await segment.save();
    
    res.json({ success: true, data: segment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
