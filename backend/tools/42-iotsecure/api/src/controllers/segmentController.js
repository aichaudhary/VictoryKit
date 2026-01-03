/**
 * Segment Controller
 * Handles network segmentation and zone management
 */

const { Segment, Device } = require('../models');

// Helper for pagination
const getPagination = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Get all segments
 */
exports.getSegments = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.zone) filter.zone = req.query.zone;
    
    const [segments, total] = await Promise.all([
      Segment.find(filter).sort({ zone: 1, name: 1 }).skip(skip).limit(limit),
      Segment.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: segments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get segment statistics
 */
exports.getSegmentStats = async (req, res) => {
  try {
    const [total, byType, byZone, withViolations] = await Promise.all([
      Segment.countDocuments(),
      Segment.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Segment.aggregate([
        { $group: { _id: '$zone', count: { $sum: 1 } } }
      ]),
      Segment.countDocuments({ policyViolations: { $ne: [] } })
    ]);
    
    res.json({
      success: true,
      data: {
        total,
        byType: byType.reduce((acc, t) => ({ ...acc, [t._id]: t.count }), {}),
        byZone: byZone.reduce((acc, z) => ({ ...acc, [z._id]: z.count }), {}),
        withViolations
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get network topology
 */
exports.getTopology = async (req, res) => {
  try {
    const segments = await Segment.find({})
      .select('name segmentId type zone cidr gateway vlan connectedSegments deviceCount')
      .lean();
    
    // Build topology graph
    const nodes = segments.map(s => ({
      id: s.segmentId,
      name: s.name,
      type: s.type,
      zone: s.zone,
      cidr: s.cidr,
      deviceCount: s.deviceCount || 0
    }));
    
    const edges = [];
    segments.forEach(s => {
      (s.connectedSegments || []).forEach(cs => {
        edges.push({
          source: s.segmentId,
          target: cs.segmentId,
          type: cs.type
        });
      });
    });
    
    res.json({ 
      success: true, 
      data: { nodes, edges, totalSegments: segments.length }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get segments by zone
 */
exports.getByZone = async (req, res) => {
  try {
    const { zone } = req.params;
    const segments = await Segment.find({ zone }).sort({ name: 1 });
    res.json({ success: true, data: segments, count: segments.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Search segments
 */
exports.searchSegments = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, error: 'Search query required' });
    }
    
    const searchRegex = new RegExp(q, 'i');
    const segments = await Segment.find({
      $or: [
        { name: searchRegex },
        { segmentId: searchRegex },
        { description: searchRegex },
        { cidr: searchRegex }
      ]
    }).limit(50);
    
    res.json({ success: true, data: segments, count: segments.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get single segment
 */
exports.getSegmentById = async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    
    if (!segment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }
    
    res.json({ success: true, data: segment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create segment
 */
exports.createSegment = async (req, res) => {
  try {
    const segment = await Segment.create(req.body);
    res.status(201).json({ success: true, data: segment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Update segment
 */
exports.updateSegment = async (req, res) => {
  try {
    const segment = await Segment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!segment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }
    
    res.json({ success: true, data: segment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Delete segment
 */
exports.deleteSegment = async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    
    if (!segment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }
    
    // Check if segment has devices
    const deviceCount = await Device.countDocuments({ 'network.segmentId': segment._id });
    if (deviceCount > 0) {
      return res.status(400).json({ 
        success: false, 
        error: `Cannot delete segment with ${deviceCount} devices. Reassign devices first.`
      });
    }
    
    await segment.deleteOne();
    res.json({ success: true, message: 'Segment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get devices in segment
 */
exports.getSegmentDevices = async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    
    if (!segment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }
    
    const devices = await Device.find({ 'network.segmentId': segment._id })
      .select('name ipAddress macAddress type status riskScore');
    
    res.json({ success: true, data: devices, count: devices.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get firewall rules for segment
 */
exports.getFirewallRules = async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    
    if (!segment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }
    
    res.json({ 
      success: true, 
      data: segment.firewallRules || [],
      count: segment.firewallRules?.length || 0
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Add firewall rule
 */
exports.addFirewallRule = async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    
    if (!segment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }
    
    await segment.addFirewallRule(req.body);
    res.status(201).json({ success: true, data: segment.firewallRules });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Update firewall rule
 */
exports.updateFirewallRule = async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    
    if (!segment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }
    
    const ruleIndex = segment.firewallRules.findIndex(
      r => r.ruleId === req.params.ruleId
    );
    
    if (ruleIndex === -1) {
      return res.status(404).json({ success: false, error: 'Firewall rule not found' });
    }
    
    Object.assign(segment.firewallRules[ruleIndex], req.body);
    await segment.save();
    
    res.json({ success: true, data: segment.firewallRules[ruleIndex] });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Delete firewall rule
 */
exports.deleteFirewallRule = async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    
    if (!segment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }
    
    await segment.removeFirewallRule(req.params.ruleId);
    res.json({ success: true, message: 'Firewall rule deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get access control lists
 */
exports.getAccessControl = async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    
    if (!segment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }
    
    res.json({ success: true, data: segment.accessControl || {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update access control
 */
exports.updateAccessControl = async (req, res) => {
  try {
    const segment = await Segment.findByIdAndUpdate(
      req.params.id,
      { accessControl: req.body },
      { new: true }
    );
    
    if (!segment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }
    
    res.json({ success: true, data: segment.accessControl });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Add ACL entry
 */
exports.addACLEntry = async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    
    if (!segment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }
    
    if (!segment.accessControl) {
      segment.accessControl = { entries: [] };
    }
    
    segment.accessControl.entries = segment.accessControl.entries || [];
    segment.accessControl.entries.push({
      ...req.body,
      aclId: `ACL-${Date.now()}`,
      createdAt: new Date()
    });
    
    await segment.save();
    res.status(201).json({ success: true, data: segment.accessControl });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Delete ACL entry
 */
exports.deleteACLEntry = async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    
    if (!segment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }
    
    if (segment.accessControl?.entries) {
      segment.accessControl.entries = segment.accessControl.entries.filter(
        e => e.aclId !== req.params.entryId
      );
      await segment.save();
    }
    
    res.json({ success: true, message: 'ACL entry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Check policy compliance
 */
exports.checkCompliance = async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    
    if (!segment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }
    
    // Run compliance check
    const violations = [];
    
    // Check if default policy is set
    if (!segment.defaultPolicy) {
      violations.push({ rule: 'default_policy', message: 'No default policy defined' });
    }
    
    // Check firewall rules
    if (!segment.firewallRules || segment.firewallRules.length === 0) {
      violations.push({ rule: 'firewall_rules', message: 'No firewall rules defined' });
    }
    
    // Check for any-any rules
    const anyAnyRules = (segment.firewallRules || []).filter(
      r => r.source === 'any' && r.destination === 'any' && r.action === 'allow'
    );
    if (anyAnyRules.length > 0) {
      violations.push({ 
        rule: 'any_any_rule', 
        message: 'Overly permissive any-to-any allow rules detected',
        count: anyAnyRules.length
      });
    }
    
    // Update segment with violations
    segment.policyViolations = violations;
    segment.lastComplianceCheck = new Date();
    await segment.save();
    
    res.json({ 
      success: true, 
      data: {
        compliant: violations.length === 0,
        violations,
        checkedAt: segment.lastComplianceCheck
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get connected segments
 */
exports.getConnectedSegments = async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    
    if (!segment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }
    
    // Get connected segment details
    const connectedIds = (segment.connectedSegments || []).map(cs => cs.segmentId);
    const connectedSegments = await Segment.find({ segmentId: { $in: connectedIds } })
      .select('name segmentId type zone cidr');
    
    res.json({ success: true, data: connectedSegments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Connect segments
 */
exports.connectSegments = async (req, res) => {
  try {
    const { targetSegmentId, connectionType } = req.body;
    
    const [sourceSegment, targetSegment] = await Promise.all([
      Segment.findById(req.params.id),
      Segment.findOne({ segmentId: targetSegmentId })
    ]);
    
    if (!sourceSegment || !targetSegment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }
    
    // Add connection both ways
    await sourceSegment.addConnection(
      targetSegment.segmentId,
      targetSegment.name,
      connectionType || 'vlan'
    );
    
    await targetSegment.addConnection(
      sourceSegment.segmentId,
      sourceSegment.name,
      connectionType || 'vlan'
    );
    
    res.json({ 
      success: true, 
      message: 'Segments connected',
      data: { source: sourceSegment.segmentId, target: targetSegmentId }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Disconnect segments
 */
exports.disconnectSegments = async (req, res) => {
  try {
    const { targetSegmentId } = req.body;
    
    const [sourceSegment, targetSegment] = await Promise.all([
      Segment.findById(req.params.id),
      Segment.findOne({ segmentId: targetSegmentId })
    ]);
    
    if (!sourceSegment || !targetSegment) {
      return res.status(404).json({ success: false, error: 'Segment not found' });
    }
    
    // Remove connection both ways
    sourceSegment.connectedSegments = sourceSegment.connectedSegments.filter(
      cs => cs.segmentId !== targetSegmentId
    );
    await sourceSegment.save();
    
    targetSegment.connectedSegments = targetSegment.connectedSegments.filter(
      cs => cs.segmentId !== sourceSegment.segmentId
    );
    await targetSegment.save();
    
    res.json({ success: true, message: 'Segments disconnected' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Export to CSV
 */
exports.exportCSV = async (req, res) => {
  try {
    const segments = await Segment.find({}).lean();
    
    const headers = ['segmentId', 'name', 'type', 'zone', 'cidr', 'vlan', 'deviceCount'];
    const rows = segments.map(s => 
      headers.map(h => s[h] || '').join(',')
    );
    
    const csv = [headers.join(','), ...rows].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=segments.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
