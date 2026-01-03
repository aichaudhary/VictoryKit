/**
 * Alert Model - Security Alerts and Notifications
 * Manages IoT security alerts and notification rules
 */

const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  alertId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: { type: String, required: true },
  description: String,
  
  // Alert Type
  type: {
    type: String,
    enum: [
      'device_compromised', 'unauthorized_device', 'vulnerability_critical',
      'firmware_outdated', 'anomaly_detected', 'credential_attack',
      'network_breach', 'policy_violation', 'device_offline', 
      'port_scan', 'malware_detected', 'data_exfiltration'
    ],
    required: true,
    index: true
  },
  
  // Severity
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'info'],
    required: true,
    index: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['new', 'acknowledged', 'investigating', 'resolved', 'false_positive', 'escalated'],
    default: 'new',
    index: true
  },
  
  // Source
  source: {
    type: { type: String, enum: ['device', 'scan', 'baseline', 'rule', 'external', 'ai'] },
    deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
    scanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scan' },
    baselineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Baseline' },
    ruleId: String,
    externalSource: String
  },
  
  // Affected Resources
  affectedDevices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' }],
  affectedSegments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Segment' }],
  affectedIPs: [String],
  
  // Details
  details: {
    indicator: String,
    observedValue: mongoose.Schema.Types.Mixed,
    expectedValue: mongoose.Schema.Types.Mixed,
    threshold: Number,
    additionalInfo: mongoose.Schema.Types.Mixed
  },
  
  // Risk Assessment
  riskScore: { type: Number, min: 0, max: 100, default: 50 },
  confidence: { type: Number, min: 0, max: 100, default: 80 },
  falsePositiveLikelihood: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  
  // Timeline
  triggeredAt: { type: Date, default: Date.now, index: true },
  acknowledgedAt: Date,
  resolvedAt: Date,
  escalatedAt: Date,
  
  // Assignment
  assignedTo: String,
  escalatedTo: String,
  
  // Response
  response: {
    actions: [{
      action: String,
      performedBy: String,
      performedAt: Date,
      result: String
    }],
    resolution: String,
    rootCause: String,
    preventiveMeasures: String
  },
  
  // Notifications
  notifications: {
    sent: { type: Boolean, default: false },
    channels: [{ type: String, enum: ['email', 'slack', 'webhook', 'sms', 'pagerduty'] }],
    sentAt: Date,
    recipients: [String]
  },
  
  // Related Alerts
  relatedAlerts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Alert' }],
  parentAlert: { type: mongoose.Schema.Types.ObjectId, ref: 'Alert' },
  childAlerts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Alert' }],
  
  // Tags and Notes
  tags: [String],
  notes: [{
    content: String,
    author: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Audit
  createdBy: String,
  updatedBy: String
}, { timestamps: true });

// Indexes
alertSchema.index({ severity: 1, status: 1, triggeredAt: -1 });
alertSchema.index({ type: 1, status: 1 });
alertSchema.index({ 'source.deviceId': 1 });

// Static methods
alertSchema.statics.getStats = async function() {
  const [total, bySeverity, byStatus, byType] = await Promise.all([
    this.countDocuments(),
    this.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]),
    this.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    this.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }])
  ]);
  return { 
    total, 
    bySeverity: bySeverity.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
    byStatus: byStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
    byType: byType.reduce((acc, t) => ({ ...acc, [t._id]: t.count }), {})
  };
};

alertSchema.statics.getActive = function() {
  return this.find({ status: { $in: ['new', 'acknowledged', 'investigating'] } })
    .sort({ severity: 1, triggeredAt: -1 })
    .populate('affectedDevices', 'name ipAddress type');
};

alertSchema.statics.getCritical = function() {
  return this.find({ severity: 'critical', status: { $ne: 'resolved' } })
    .sort({ triggeredAt: -1 })
    .populate('affectedDevices', 'name ipAddress type');
};

alertSchema.statics.getRecent = function(limit = 20) {
  return this.find()
    .sort({ triggeredAt: -1 })
    .limit(limit)
    .populate('affectedDevices', 'name ipAddress type');
};

alertSchema.statics.getByDevice = function(deviceId) {
  return this.find({ 'source.deviceId': deviceId })
    .sort({ triggeredAt: -1 });
};

// Instance methods
alertSchema.methods.acknowledge = async function(userId) {
  this.status = 'acknowledged';
  this.acknowledgedAt = new Date();
  this.assignedTo = userId;
  return this.save();
};

alertSchema.methods.resolve = async function(resolution, userId) {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  this.response.resolution = resolution;
  this.updatedBy = userId;
  return this.save();
};

alertSchema.methods.escalate = async function(escalatedTo, userId) {
  this.status = 'escalated';
  this.escalatedAt = new Date();
  this.escalatedTo = escalatedTo;
  this.updatedBy = userId;
  return this.save();
};

alertSchema.methods.addAction = async function(action, userId, result) {
  this.response.actions.push({
    action,
    performedBy: userId,
    performedAt: new Date(),
    result
  });
  return this.save();
};

alertSchema.methods.addNote = async function(content, author) {
  this.notes.push({ content, author, createdAt: new Date() });
  return this.save();
};

module.exports = mongoose.model('Alert', alertSchema);
