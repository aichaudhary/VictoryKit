/**
 * Scan Model - Network and Security Scan Operations
 * Tracks device discovery and vulnerability scans
 */

const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  scanId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['discovery', 'vulnerability', 'firmware', 'compliance', 'full', 'quick'],
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled', 'paused'],
    default: 'pending',
    index: true
  },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  
  // Target Configuration
  targets: {
    type: { type: String, enum: ['network', 'devices', 'segment', 'all'] },
    networks: [String],
    devices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' }],
    segments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Segment' }],
    excludeIPs: [String]
  },
  
  // Scan Configuration
  config: {
    portRange: { type: String, default: '1-1024' },
    scanSpeed: { type: String, enum: ['slow', 'normal', 'fast', 'aggressive'], default: 'normal' },
    deepScan: { type: Boolean, default: false },
    checkVulnerabilities: { type: Boolean, default: true },
    checkFirmware: { type: Boolean, default: false },
    checkCredentials: { type: Boolean, default: true },
    maxConcurrency: { type: Number, default: 10 }
  },
  
  // Timing
  scheduledAt: Date,
  startedAt: Date,
  completedAt: Date,
  duration: Number, // in seconds
  
  // Results Summary
  results: {
    devicesScanned: { type: Number, default: 0 },
    devicesDiscovered: { type: Number, default: 0 },
    vulnerabilitiesFound: { type: Number, default: 0 },
    criticalVulns: { type: Number, default: 0 },
    highVulns: { type: Number, default: 0 },
    mediumVulns: { type: Number, default: 0 },
    lowVulns: { type: Number, default: 0 },
    portsFound: { type: Number, default: 0 },
    servicesFound: { type: Number, default: 0 },
    defaultCredentials: { type: Number, default: 0 }
  },
  
  // Detailed Findings
  findings: [{
    deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
    ipAddress: String,
    type: { type: String, enum: ['vulnerability', 'service', 'credential', 'anomaly', 'firmware'] },
    severity: { type: String, enum: ['critical', 'high', 'medium', 'low', 'info'] },
    title: String,
    description: String,
    details: mongoose.Schema.Types.Mixed
  }],
  
  // Errors
  errors: [{
    target: String,
    error: String,
    timestamp: Date
  }],
  
  // Schedule (for recurring scans)
  schedule: {
    enabled: { type: Boolean, default: false },
    cronExpression: String,
    nextRun: Date,
    lastRun: Date
  },
  
  // Notifications
  notifications: {
    onComplete: { type: Boolean, default: true },
    onCritical: { type: Boolean, default: true },
    channels: [{ type: String, enum: ['email', 'slack', 'webhook', 'sms'] }],
    recipients: [String]
  },
  
  // Metadata
  tags: [String],
  notes: String,
  createdBy: String
}, { timestamps: true });

// Indexes
scanSchema.index({ status: 1, createdAt: -1 });
scanSchema.index({ type: 1, status: 1 });
scanSchema.index({ 'schedule.nextRun': 1 });

// Static methods
scanSchema.statics.getStats = async function() {
  const [total, byStatus, byType, avgDuration] = await Promise.all([
    this.countDocuments(),
    this.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    this.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
    this.aggregate([
      { $match: { status: 'completed', duration: { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$duration' } } }
    ])
  ]);
  return { 
    total, 
    byStatus: byStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
    byType: byType.reduce((acc, t) => ({ ...acc, [t._id]: t.count }), {}),
    avgDuration: avgDuration[0]?.avg || 0
  };
};

scanSchema.statics.getRecent = function(limit = 10) {
  return this.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('scanId name type status progress results startedAt completedAt');
};

scanSchema.statics.getRunning = function() {
  return this.find({ status: 'running' }).sort({ startedAt: -1 });
};

scanSchema.statics.getScheduled = function() {
  return this.find({ 'schedule.enabled': true, 'schedule.nextRun': { $exists: true } })
    .sort({ 'schedule.nextRun': 1 });
};

// Instance methods
scanSchema.methods.start = async function() {
  this.status = 'running';
  this.startedAt = new Date();
  this.progress = 0;
  return this.save();
};

scanSchema.methods.complete = async function(results) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.progress = 100;
  this.duration = Math.floor((this.completedAt - this.startedAt) / 1000);
  if (results) this.results = { ...this.results, ...results };
  return this.save();
};

scanSchema.methods.fail = async function(error) {
  this.status = 'failed';
  this.completedAt = new Date();
  this.errors.push({ target: 'scan', error: error.message || error, timestamp: new Date() });
  return this.save();
};

scanSchema.methods.updateProgress = async function(progress, findings = []) {
  this.progress = progress;
  if (findings.length > 0) {
    this.findings.push(...findings);
  }
  return this.save();
};

module.exports = mongoose.model('Scan', scanSchema);
