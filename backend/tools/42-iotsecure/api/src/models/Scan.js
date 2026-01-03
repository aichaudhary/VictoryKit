const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  // Scan Identification
  scanId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Scan Type
  type: {
    type: String,
    enum: [
      'discovery',        // Find new devices
      'vulnerability',    // CVE/Security scan
      'firmware',         // Firmware analysis
      'port',             // Port scanning
      'service',          // Service detection
      'compliance',       // Compliance check
      'behavioral',       // Behavior baseline
      'full'              // All of the above
    ],
    required: true,
    index: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'queued', 'running', 'paused', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  // Target Configuration
  target: {
    type: {
      type: String,
      enum: ['ip', 'ip_range', 'subnet', 'device', 'device_group', 'network_segment', 'all'],
      required: true
    },
    value: String,
    ipStart: String,
    ipEnd: String,
    subnet: String,
    deviceIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device'
    }],
    excludeIps: [String],
    excludeDevices: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device'
    }]
  },
  
  // Scan Configuration
  config: {
    // Port scan settings
    portRange: {
      start: { type: Number, default: 1 },
      end: { type: Number, default: 65535 }
    },
    specificPorts: [Number],
    commonPortsOnly: { type: Boolean, default: true },
    
    // Speed/Aggressiveness
    scanSpeed: {
      type: String,
      enum: ['slow', 'normal', 'fast', 'aggressive'],
      default: 'normal'
    },
    timeout: { type: Number, default: 5000 },
    retries: { type: Number, default: 2 },
    concurrent: { type: Number, default: 50 },
    
    // Feature toggles
    serviceDetection: { type: Boolean, default: true },
    osDetection: { type: Boolean, default: true },
    bannerGrabbing: { type: Boolean, default: true },
    vulnerabilityCheck: { type: Boolean, default: true },
    credentialCheck: { type: Boolean, default: false },
    
    // External APIs
    useShodan: { type: Boolean, default: false },
    useCensys: { type: Boolean, default: false },
    useNvd: { type: Boolean, default: true },
    useVirusTotal: { type: Boolean, default: false }
  },
  
  // Scheduling
  schedule: {
    type: {
      type: String,
      enum: ['once', 'hourly', 'daily', 'weekly', 'monthly', 'custom']
    },
    cronExpression: String,
    nextRun: Date,
    lastRun: Date,
    enabled: { type: Boolean, default: true }
  },
  
  // Timing
  startedAt: Date,
  completedAt: Date,
  pausedAt: Date,
  estimatedDuration: Number,
  actualDuration: Number,
  
  // Progress
  progress: {
    percentage: { type: Number, default: 0, min: 0, max: 100 },
    currentPhase: String,
    currentTarget: String,
    targetsTotal: { type: Number, default: 0 },
    targetsScanned: { type: Number, default: 0 },
    portsScanned: { type: Number, default: 0 }
  },
  
  // Results Summary
  results: {
    devicesFound: { type: Number, default: 0 },
    newDevices: { type: Number, default: 0 },
    devicesOnline: { type: Number, default: 0 },
    devicesOffline: { type: Number, default: 0 },
    openPorts: { type: Number, default: 0 },
    servicesDetected: { type: Number, default: 0 },
    vulnerabilitiesFound: { type: Number, default: 0 },
    criticalVulns: { type: Number, default: 0 },
    highVulns: { type: Number, default: 0 },
    mediumVulns: { type: Number, default: 0 },
    lowVulns: { type: Number, default: 0 },
    defaultCredentials: { type: Number, default: 0 },
    weakPasswords: { type: Number, default: 0 }
  },
  
  // Discovered Devices (for discovery scans)
  discoveredDevices: [{
    ipAddress: String,
    macAddress: String,
    hostname: String,
    type: String,
    manufacturer: String,
    isNew: Boolean,
    deviceRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device'
    }
  }],
  
  // Vulnerabilities Found
  vulnerabilitiesDetected: [{
    cveId: String,
    severity: String,
    cvssScore: Number,
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device'
    },
    vulnerabilityRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vulnerability'
    }
  }],
  
  // Errors/Warnings
  errors: [{
    timestamp: Date,
    target: String,
    code: String,
    message: String,
    fatal: Boolean
  }],
  warnings: [{
    timestamp: Date,
    target: String,
    message: String
  }],
  
  // Initiator
  initiatedBy: {
    type: String,
    enum: ['user', 'schedule', 'api', 'system', 'alert_trigger'],
    default: 'user'
  },
  userId: String,
  userName: String,
  
  // Raw Data (optional, for detailed analysis)
  rawOutput: {
    enabled: { type: Boolean, default: false },
    path: String,
    size: Number
  },
  
  // Notifications
  notifications: {
    onComplete: Boolean,
    onCriticalVuln: Boolean,
    onNewDevice: Boolean,
    channels: [{
      type: { type: String, enum: ['email', 'slack', 'webhook', 'sms'] },
      destination: String
    }]
  },
  
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Tags
  tags: [String]
}, {
  timestamps: true
});

// Indexes
scanSchema.index({ status: 1, startedAt: -1 });
scanSchema.index({ type: 1, status: 1 });
scanSchema.index({ 'schedule.nextRun': 1, 'schedule.enabled': 1 });
scanSchema.index({ userId: 1, createdAt: -1 });

// Virtual for scan duration
scanSchema.virtual('duration').get(function() {
  if (this.startedAt && this.completedAt) {
    return this.completedAt - this.startedAt;
  }
  if (this.startedAt) {
    return Date.now() - this.startedAt;
  }
  return 0;
});

// Virtual for is running
scanSchema.virtual('isRunning').get(function() {
  return this.status === 'running';
});

// Pre-save to generate scanId
scanSchema.pre('save', function(next) {
  if (!this.scanId) {
    this.scanId = `scan_${this.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

// Static method to get active scans
scanSchema.statics.getActive = function() {
  return this.find({
    status: { $in: ['running', 'pending', 'queued'] }
  }).sort({ startedAt: -1 });
};

// Static method to get scheduled scans
scanSchema.statics.getScheduled = function() {
  return this.find({
    'schedule.enabled': true,
    'schedule.nextRun': { $exists: true }
  }).sort({ 'schedule.nextRun': 1 });
};

// Static method to get recent completed
scanSchema.statics.getRecent = function(limit = 10) {
  return this.find({
    status: 'completed'
  })
  .sort({ completedAt: -1 })
  .limit(limit);
};

// Instance method to start scan
scanSchema.methods.start = async function() {
  this.status = 'running';
  this.startedAt = new Date();
  this.progress.percentage = 0;
  this.progress.currentPhase = 'initializing';
  return this.save();
};

// Instance method to update progress
scanSchema.methods.updateProgress = async function(percentage, phase, currentTarget) {
  this.progress.percentage = percentage;
  this.progress.currentPhase = phase;
  this.progress.currentTarget = currentTarget;
  return this.save();
};

// Instance method to complete scan
scanSchema.methods.complete = async function(results) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.progress.percentage = 100;
  this.actualDuration = this.completedAt - this.startedAt;
  if (results) {
    Object.assign(this.results, results);
  }
  return this.save();
};

// Instance method to fail scan
scanSchema.methods.fail = async function(error) {
  this.status = 'failed';
  this.completedAt = new Date();
  this.errors.push({
    timestamp: new Date(),
    message: error.message || error,
    fatal: true
  });
  return this.save();
};

// Instance method to cancel scan
scanSchema.methods.cancel = async function(reason) {
  this.status = 'cancelled';
  this.completedAt = new Date();
  this.metadata.cancelReason = reason;
  return this.save();
};

module.exports = mongoose.model('Scan', scanSchema);
