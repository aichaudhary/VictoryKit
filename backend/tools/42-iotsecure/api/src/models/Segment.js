/**
 * Segment Model - Network Segmentation and Access Control
 * Manages IoT network segments, policies, and isolation
 */

const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema({
  segmentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: { type: String, required: true },
  description: String,
  
  // Segment Type
  type: {
    type: String,
    enum: ['iot', 'guest', 'corporate', 'industrial', 'medical', 'dmz', 'quarantine', 'critical'],
    required: true,
    index: true
  },
  
  // Network Configuration
  network: {
    vlanId: Number,
    subnet: String,
    gateway: String,
    dnsServers: [String],
    dhcpEnabled: { type: Boolean, default: true },
    dhcpRange: { start: String, end: String }
  },
  
  // Security Level
  securityLevel: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'open'],
    default: 'medium',
    index: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'quarantined'],
    default: 'active',
    index: true
  },
  
  // Devices in Segment
  devices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' }],
  deviceCount: { type: Number, default: 0 },
  maxDevices: { type: Number, default: 254 },
  
  // Firewall Rules
  firewallRules: [{
    ruleId: String,
    name: String,
    priority: { type: Number, default: 100 },
    action: { type: String, enum: ['allow', 'deny', 'log'], required: true },
    direction: { type: String, enum: ['inbound', 'outbound', 'both'], required: true },
    source: {
      type: { type: String, enum: ['any', 'segment', 'ip', 'range', 'device'] },
      value: String,
      segmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Segment' }
    },
    destination: {
      type: { type: String, enum: ['any', 'segment', 'ip', 'range', 'device'] },
      value: String,
      segmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Segment' }
    },
    protocol: { type: String, enum: ['any', 'tcp', 'udp', 'icmp'], default: 'any' },
    ports: [Number],
    portRange: { start: Number, end: Number },
    enabled: { type: Boolean, default: true },
    logging: { type: Boolean, default: false },
    hitCount: { type: Number, default: 0 },
    lastHit: Date
  }],
  
  // Access Policies
  accessPolicies: [{
    policyId: String,
    name: String,
    description: String,
    effect: { type: String, enum: ['allow', 'deny'], required: true },
    subjects: [{
      type: { type: String, enum: ['device', 'device_type', 'user', 'role', 'segment'] },
      value: String
    }],
    resources: [{
      type: { type: String, enum: ['segment', 'service', 'internet', 'protocol'] },
      value: String
    }],
    conditions: [{
      attribute: String,
      operator: { type: String, enum: ['equals', 'not_equals', 'contains', 'gt', 'lt'] },
      value: mongoose.Schema.Types.Mixed
    }],
    schedule: {
      enabled: { type: Boolean, default: false },
      timeStart: String,
      timeEnd: String,
      daysOfWeek: [Number]
    },
    enabled: { type: Boolean, default: true },
    priority: { type: Number, default: 100 }
  }],
  
  // Inter-Segment Communication
  allowedSegments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Segment' }],
  blockedSegments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Segment' }],
  
  // Traffic Statistics
  traffic: {
    bytesIn: { type: Number, default: 0 },
    bytesOut: { type: Number, default: 0 },
    packetsIn: { type: Number, default: 0 },
    packetsOut: { type: Number, default: 0 },
    blockedConnections: { type: Number, default: 0 },
    lastUpdated: Date
  },
  
  // Compliance
  compliance: {
    pciDss: { type: Boolean, default: false },
    hipaa: { type: Boolean, default: false },
    gdpr: { type: Boolean, default: false },
    iot: { type: Boolean, default: true }
  },
  
  // Monitoring
  monitoring: {
    enabled: { type: Boolean, default: true },
    anomalyDetection: { type: Boolean, default: true },
    trafficAnalysis: { type: Boolean, default: true },
    alertThresholds: {
      trafficSpike: { type: Number, default: 200 }, // percentage
      newDevices: { type: Number, default: 5 },
      blockedConnections: { type: Number, default: 100 }
    }
  },
  
  // Tags and Notes
  tags: [String],
  notes: String,
  color: String, // For visualization
  
  // Audit
  createdBy: String,
  updatedBy: String
}, { timestamps: true });

// Indexes
segmentSchema.index({ type: 1, status: 1 });
segmentSchema.index({ securityLevel: 1 });
segmentSchema.index({ 'network.vlanId': 1 });

// Static methods
segmentSchema.statics.getStats = async function() {
  const [total, byType, bySecLevel, byStatus, totalDevices] = await Promise.all([
    this.countDocuments(),
    this.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
    this.aggregate([{ $group: { _id: '$securityLevel', count: { $sum: 1 } } }]),
    this.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    this.aggregate([{ $group: { _id: null, total: { $sum: '$deviceCount' } } }])
  ]);
  return { 
    total, 
    byType: byType.reduce((acc, t) => ({ ...acc, [t._id]: t.count }), {}),
    bySecurityLevel: bySecLevel.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
    byStatus: byStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
    totalDevices: totalDevices[0]?.total || 0
  };
};

segmentSchema.statics.getTrafficStats = async function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalBytesIn: { $sum: '$traffic.bytesIn' },
        totalBytesOut: { $sum: '$traffic.bytesOut' },
        totalBlocked: { $sum: '$traffic.blockedConnections' }
      }
    }
  ]);
};

segmentSchema.statics.getByType = function(type) {
  return this.find({ type, status: 'active' }).populate('devices', 'name ipAddress type status');
};

segmentSchema.statics.getQuarantined = function() {
  return this.find({ status: 'quarantined' }).populate('devices', 'name ipAddress type');
};

// Instance methods
segmentSchema.methods.addDevice = async function(deviceId) {
  if (!this.devices.includes(deviceId)) {
    this.devices.push(deviceId);
    this.deviceCount = this.devices.length;
  }
  return this.save();
};

segmentSchema.methods.removeDevice = async function(deviceId) {
  this.devices = this.devices.filter(d => d.toString() !== deviceId.toString());
  this.deviceCount = this.devices.length;
  return this.save();
};

segmentSchema.methods.addFirewallRule = async function(rule) {
  rule.ruleId = `rule_${Date.now()}`;
  this.firewallRules.push(rule);
  this.firewallRules.sort((a, b) => a.priority - b.priority);
  return this.save();
};

segmentSchema.methods.updateFirewallRule = async function(ruleId, updates) {
  const ruleIndex = this.firewallRules.findIndex(r => r.ruleId === ruleId);
  if (ruleIndex !== -1) {
    Object.assign(this.firewallRules[ruleIndex], updates);
    this.firewallRules.sort((a, b) => a.priority - b.priority);
  }
  return this.save();
};

segmentSchema.methods.deleteFirewallRule = async function(ruleId) {
  this.firewallRules = this.firewallRules.filter(r => r.ruleId !== ruleId);
  return this.save();
};

segmentSchema.methods.quarantine = async function(reason) {
  this.status = 'quarantined';
  this.notes = `Quarantined: ${reason} at ${new Date().toISOString()}`;
  return this.save();
};

segmentSchema.methods.activate = async function() {
  this.status = 'active';
  return this.save();
};

module.exports = mongoose.model('Segment', segmentSchema);
