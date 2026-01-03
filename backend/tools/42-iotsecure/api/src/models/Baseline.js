const mongoose = require('mongoose');

const baselineSchema = new mongoose.Schema({
  // Baseline Identification
  baselineId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Name & Description
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  
  // Baseline Type
  type: {
    type: String,
    enum: ['device', 'network', 'traffic', 'behavior', 'protocol', 'composite'],
    required: true,
    index: true
  },
  
  // Associated Device (for device baselines)
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    index: true
  },
  
  // Associated Network Segment (for network baselines)
  segment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Segment',
    index: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['learning', 'active', 'paused', 'outdated', 'disabled'],
    default: 'learning',
    index: true
  },
  
  // Learning Configuration
  learning: {
    startedAt: Date,
    completedAt: Date,
    duration: { type: Number, default: 7 * 24 * 60 * 60 * 1000 }, // 7 days default
    samplesRequired: { type: Number, default: 1000 },
    samplesCollected: { type: Number, default: 0 },
    progressPercent: { type: Number, default: 0, min: 0, max: 100 }
  },
  
  // Network Traffic Baseline
  traffic: {
    avgBytesPerSecond: { type: Number, default: 0 },
    avgPacketsPerSecond: { type: Number, default: 0 },
    peakBytesPerSecond: Number,
    peakPacketsPerSecond: Number,
    avgConnectionsPerHour: Number,
    peakConnectionsPerHour: Number,
    protocols: [{
      name: String,
      percentage: Number,
      avgBandwidth: Number
    }],
    topDestinations: [{
      ip: String,
      hostname: String,
      percentage: Number,
      avgConnections: Number
    }],
    topPorts: [{
      port: Number,
      protocol: String,
      percentage: Number
    }],
    hourlyPattern: [{
      hour: { type: Number, min: 0, max: 23 },
      avgBytes: Number,
      avgPackets: Number,
      stdDevBytes: Number,
      stdDevPackets: Number
    }],
    dailyPattern: [{
      day: { type: Number, min: 0, max: 6 },
      avgBytes: Number,
      avgPackets: Number
    }]
  },
  
  // Behavior Baseline
  behavior: {
    // Communication patterns
    normalCommunicationPartners: [{
      ip: String,
      hostname: String,
      frequency: Number, // times per day
      avgDuration: Number,
      direction: { type: String, enum: ['inbound', 'outbound', 'bidirectional'] }
    }],
    
    // Timing patterns
    activeHours: [{
      start: Number, // 0-23
      end: Number,
      confidence: Number
    }],
    avgIdlePeriod: Number,
    maxIdlePeriod: Number,
    
    // Authentication patterns
    avgAuthAttempts: Number,
    failedAuthThreshold: Number,
    normalAuthSources: [String],
    
    // Data patterns
    avgDataTransfer: {
      inbound: Number,
      outbound: Number
    },
    maxDataTransfer: {
      inbound: Number,
      outbound: Number
    },
    
    // Protocol usage
    normalProtocols: [String],
    normalPorts: [Number],
    
    // DNS patterns
    avgDnsQueries: Number,
    normalDomains: [String],
    
    // Update patterns
    updateFrequency: Number,
    lastUpdateCheck: Date
  },
  
  // Device State Baseline
  deviceState: {
    normalPorts: [{
      port: Number,
      protocol: String,
      service: String,
      state: String
    }],
    normalServices: [{
      name: String,
      version: String,
      port: Number
    }],
    expectedFirmware: {
      version: String,
      hash: String
    },
    expectedConfig: {
      hash: String,
      criticalSettings: mongoose.Schema.Types.Mixed
    }
  },
  
  // Protocol Baseline
  protocol: {
    name: String,
    normalCommands: [String],
    normalResponses: [String],
    avgRequestSize: Number,
    avgResponseSize: Number,
    maxRequestSize: Number,
    maxResponseSize: Number,
    avgLatency: Number,
    maxLatency: Number,
    normalSequences: [{
      commands: [String],
      frequency: Number
    }]
  },
  
  // Thresholds & Sensitivity
  thresholds: {
    trafficDeviationPercent: { type: Number, default: 50 },
    newDestinationAlert: { type: Boolean, default: true },
    newPortAlert: { type: Boolean, default: true },
    newProtocolAlert: { type: Boolean, default: true },
    offHoursAlert: { type: Boolean, default: true },
    authFailureThreshold: { type: Number, default: 5 },
    dataTransferMultiplier: { type: Number, default: 3 },
    latencyMultiplier: { type: Number, default: 5 }
  },
  
  // Sensitivity Level
  sensitivity: {
    type: String,
    enum: ['low', 'medium', 'high', 'custom'],
    default: 'medium'
  },
  
  // Exceptions/Whitelist
  exceptions: [{
    type: { type: String, enum: ['ip', 'port', 'protocol', 'domain', 'time_window'] },
    value: String,
    reason: String,
    addedBy: String,
    addedAt: Date,
    expiresAt: Date
  }],
  
  // Statistics
  stats: {
    alertsGenerated: { type: Number, default: 0 },
    truePositives: { type: Number, default: 0 },
    falsePositives: { type: Number, default: 0 },
    lastAlertAt: Date,
    accuracyRate: Number
  },
  
  // Versioning
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    version: Number,
    createdAt: Date,
    traffic: mongoose.Schema.Types.Mixed,
    behavior: mongoose.Schema.Types.Mixed
  }],
  
  // Auto-update Settings
  autoUpdate: {
    enabled: { type: Boolean, default: false },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'weekly' },
    lastUpdatedAt: Date,
    nextUpdateAt: Date,
    requiresApproval: { type: Boolean, default: true }
  },
  
  // Metadata
  createdBy: String,
  tags: [String],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Tenant (multi-tenancy)
  tenantId: {
    type: String,
    index: true
  }
}, {
  timestamps: true
});

// Indexes
baselineSchema.index({ device: 1, type: 1 });
baselineSchema.index({ segment: 1, type: 1 });
baselineSchema.index({ status: 1, type: 1 });

// Pre-save to generate baselineId
baselineSchema.pre('save', function(next) {
  if (!this.baselineId) {
    this.baselineId = `baseline_${this.type}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }
  next();
});

// Virtual for learning completion
baselineSchema.virtual('learningComplete').get(function() {
  return this.status !== 'learning' || 
    (this.learning.samplesCollected >= this.learning.samplesRequired);
});

// Virtual for accuracy
baselineSchema.virtual('accuracy').get(function() {
  const total = this.stats.truePositives + this.stats.falsePositives;
  if (total === 0) return null;
  return (this.stats.truePositives / total) * 100;
});

// Static method to get active baselines for device
baselineSchema.statics.getForDevice = function(deviceId) {
  return this.find({
    device: deviceId,
    status: 'active'
  });
};

// Static method to get network baselines
baselineSchema.statics.getNetworkBaselines = function(tenantId) {
  const match = { type: 'network', status: 'active' };
  if (tenantId) match.tenantId = tenantId;
  return this.find(match);
};

// Static method to get learning baselines
baselineSchema.statics.getLearning = function() {
  return this.find({ status: 'learning' });
};

// Instance method to activate
baselineSchema.methods.activate = async function() {
  this.status = 'active';
  this.learning.completedAt = new Date();
  this.learning.progressPercent = 100;
  return this.save();
};

// Instance method to update with sample
baselineSchema.methods.addSample = async function(sampleData) {
  this.learning.samplesCollected += 1;
  this.learning.progressPercent = Math.min(
    100,
    Math.round((this.learning.samplesCollected / this.learning.samplesRequired) * 100)
  );
  
  // Update baseline metrics based on sample
  // This would be implemented with actual baseline calculation logic
  
  if (this.learning.samplesCollected >= this.learning.samplesRequired) {
    await this.activate();
  }
  
  return this.save();
};

// Instance method to check deviation
baselineSchema.methods.checkDeviation = function(currentMetrics) {
  const deviations = [];
  
  // Traffic deviation check
  if (this.traffic && currentMetrics.traffic) {
    const bytesDev = Math.abs(
      (currentMetrics.traffic.bytesPerSecond - this.traffic.avgBytesPerSecond) / 
      this.traffic.avgBytesPerSecond * 100
    );
    
    if (bytesDev > this.thresholds.trafficDeviationPercent) {
      deviations.push({
        type: 'traffic_volume',
        metric: 'bytesPerSecond',
        expected: this.traffic.avgBytesPerSecond,
        actual: currentMetrics.traffic.bytesPerSecond,
        deviationPercent: bytesDev
      });
    }
  }
  
  // Add more deviation checks for behavior, ports, etc.
  
  return deviations;
};

// Instance method to add exception
baselineSchema.methods.addException = async function(type, value, reason, addedBy, expiresAt) {
  this.exceptions.push({
    type,
    value,
    reason,
    addedBy,
    addedAt: new Date(),
    expiresAt
  });
  return this.save();
};

// Instance method to record alert outcome
baselineSchema.methods.recordAlertOutcome = async function(isTruePositive) {
  this.stats.alertsGenerated += 1;
  if (isTruePositive) {
    this.stats.truePositives += 1;
  } else {
    this.stats.falsePositives += 1;
  }
  this.stats.lastAlertAt = new Date();
  this.stats.accuracyRate = this.accuracy;
  return this.save();
};

module.exports = mongoose.model('Baseline', baselineSchema);
