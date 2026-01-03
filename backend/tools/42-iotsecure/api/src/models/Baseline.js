/**
 * Baseline Model - Behavioral Baselines for Anomaly Detection
 * Establishes normal behavior patterns for IoT devices
 */

const mongoose = require('mongoose');

const baselineSchema = new mongoose.Schema({
  baselineId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: { type: String, required: true },
  description: String,
  
  // Scope
  scope: {
    type: { type: String, enum: ['device', 'type', 'segment', 'global'], required: true },
    deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
    deviceType: String,
    segmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Segment' }
  },
  
  // Status
  status: {
    type: String,
    enum: ['learning', 'active', 'paused', 'outdated'],
    default: 'learning',
    index: true
  },
  learningProgress: { type: Number, min: 0, max: 100, default: 0 },
  
  // Baseline Metrics
  metrics: {
    // Network Traffic
    traffic: {
      avgBytesInPerHour: { mean: Number, stdDev: Number, min: Number, max: Number },
      avgBytesOutPerHour: { mean: Number, stdDev: Number, min: Number, max: Number },
      avgPacketsPerHour: { mean: Number, stdDev: Number, min: Number, max: Number },
      avgConnectionsPerHour: { mean: Number, stdDev: Number, min: Number, max: Number }
    },
    
    // Connection Patterns
    connections: {
      commonDestinations: [{ ip: String, count: Number, percentage: Number }],
      commonPorts: [{ port: Number, protocol: String, count: Number, percentage: Number }],
      commonProtocols: [{ protocol: String, count: Number, percentage: Number }],
      avgConnectionDuration: { mean: Number, stdDev: Number }
    },
    
    // Temporal Patterns
    temporal: {
      activeHours: [{ hour: Number, activityLevel: Number }],
      activeDays: [{ day: Number, activityLevel: Number }],
      avgUptimePerDay: Number,
      avgDowntimePerDay: Number
    },
    
    // Power/Resource Usage (for smart devices)
    resource: {
      avgCpuUsage: { mean: Number, stdDev: Number },
      avgMemoryUsage: { mean: Number, stdDev: Number },
      avgPowerConsumption: { mean: Number, stdDev: Number }
    },
    
    // DNS Queries
    dns: {
      commonDomains: [{ domain: String, count: Number, percentage: Number }],
      avgQueriesPerHour: { mean: Number, stdDev: Number }
    }
  },
  
  // Anomaly Detection Settings
  detection: {
    sensitivity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    stdDevThreshold: { type: Number, default: 2.5 },
    minConfidence: { type: Number, default: 0.7 },
    cooldownMinutes: { type: Number, default: 15 }
  },
  
  // Current Anomalies
  anomalies: [{
    type: { 
      type: String, 
      enum: ['traffic_spike', 'new_connection', 'unusual_port', 'unusual_protocol',
             'unusual_timing', 'new_destination', 'resource_anomaly', 'dns_anomaly']
    },
    severity: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
    description: String,
    observedValue: mongoose.Schema.Types.Mixed,
    expectedValue: mongoose.Schema.Types.Mixed,
    deviation: Number,
    detectedAt: Date,
    resolved: { type: Boolean, default: false },
    resolvedAt: Date,
    alertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alert' }
  }],
  
  // Learning Data
  learning: {
    startedAt: Date,
    completedAt: Date,
    dataPointsCollected: { type: Number, default: 0 },
    requiredDataPoints: { type: Number, default: 1000 },
    lastDataPointAt: Date
  },
  
  // Schedule
  schedule: {
    relearning: {
      enabled: { type: Boolean, default: true },
      intervalDays: { type: Number, default: 30 },
      nextRelearn: Date
    },
    validation: {
      enabled: { type: Boolean, default: true },
      intervalHours: { type: Number, default: 24 },
      lastValidation: Date
    }
  },
  
  // Tags and Notes
  tags: [String],
  notes: String,
  
  // Audit
  createdBy: String,
  updatedBy: String
}, { timestamps: true });

// Indexes
baselineSchema.index({ 'scope.type': 1, status: 1 });
baselineSchema.index({ 'scope.deviceId': 1 });
baselineSchema.index({ 'anomalies.resolved': 1, 'anomalies.detectedAt': -1 });

// Static methods
baselineSchema.statics.getStats = async function() {
  const [total, byStatus, byScope, withAnomalies] = await Promise.all([
    this.countDocuments(),
    this.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    this.aggregate([{ $group: { _id: '$scope.type', count: { $sum: 1 } } }]),
    this.countDocuments({ 'anomalies.resolved': false })
  ]);
  return { 
    total, 
    byStatus: byStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
    byScope: byScope.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
    withAnomalies
  };
};

baselineSchema.statics.getAnomalies = function() {
  return this.find({ 'anomalies.resolved': false })
    .select('baselineId name scope anomalies')
    .populate('scope.deviceId', 'name ipAddress type');
};

baselineSchema.statics.getByDevice = function(deviceId) {
  return this.findOne({ 'scope.deviceId': deviceId, status: 'active' });
};

baselineSchema.statics.getLearning = function() {
  return this.find({ status: 'learning' })
    .select('baselineId name scope learningProgress learning');
};

// Instance methods
baselineSchema.methods.addDataPoint = async function(data) {
  this.learning.dataPointsCollected++;
  this.learning.lastDataPointAt = new Date();
  this.learningProgress = Math.min(
    Math.round((this.learning.dataPointsCollected / this.learning.requiredDataPoints) * 100),
    100
  );
  
  if (this.learningProgress >= 100 && this.status === 'learning') {
    this.status = 'active';
    this.learning.completedAt = new Date();
  }
  
  return this.save();
};

baselineSchema.methods.detectAnomaly = function(metric, observedValue) {
  const metricPath = metric.split('.');
  let expected = this.metrics;
  for (const key of metricPath) {
    expected = expected?.[key];
  }
  
  if (!expected || !expected.mean || !expected.stdDev) return null;
  
  const deviation = Math.abs(observedValue - expected.mean) / expected.stdDev;
  const thresholds = { low: 3.5, medium: 2.5, high: 1.5 };
  const threshold = thresholds[this.detection.sensitivity];
  
  if (deviation > threshold) {
    return {
      isAnomaly: true,
      deviation,
      expectedValue: expected,
      severity: deviation > threshold * 2 ? 'critical' : deviation > threshold * 1.5 ? 'high' : 'medium'
    };
  }
  
  return { isAnomaly: false, deviation };
};

baselineSchema.methods.recordAnomaly = async function(anomaly) {
  this.anomalies.push({
    ...anomaly,
    detectedAt: new Date()
  });
  return this.save();
};

baselineSchema.methods.resolveAnomaly = async function(anomalyIndex) {
  if (this.anomalies[anomalyIndex]) {
    this.anomalies[anomalyIndex].resolved = true;
    this.anomalies[anomalyIndex].resolvedAt = new Date();
  }
  return this.save();
};

module.exports = mongoose.model('Baseline', baselineSchema);
