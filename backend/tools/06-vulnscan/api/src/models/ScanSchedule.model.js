/**
 * VulnScan - Scan Schedule Model
 * Automated scan scheduling with cron expressions and recurrence patterns
 */

const mongoose = require('mongoose');

// Schedule Window Sub-schema
const scheduleWindowSchema = new mongoose.Schema({
  enabled: {
    type: Boolean,
    default: false
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  allowedDays: [{
    type: String,
    enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
  }],
  startTime: {
    type: String,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    description: 'Start time in HH:MM format'
  },
  endTime: {
    type: String,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    description: 'End time in HH:MM format'
  },
  blackoutPeriods: [{
    name: String,
    startDate: Date,
    endDate: Date,
    reason: String
  }]
}, { _id: false });

// Notification Configuration Sub-schema
const notificationConfigSchema = new mongoose.Schema({
  onScheduleStart: { type: Boolean, default: false },
  onScanStart: { type: Boolean, default: true },
  onScanComplete: { type: Boolean, default: true },
  onScanFailed: { type: Boolean, default: true },
  onCriticalFound: { type: Boolean, default: true },
  onSlaWarning: { type: Boolean, default: true },
  channels: [{
    type: {
      type: String,
      enum: ['EMAIL', 'SLACK', 'TEAMS', 'WEBHOOK', 'PAGERDUTY', 'SMS']
    },
    target: String,
    template: String,
    enabled: { type: Boolean, default: true }
  }],
  recipients: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: String,
    notificationTypes: [String]
  }]
}, { _id: false });

// Scan Schedule Schema
const scanScheduleSchema = new mongoose.Schema({
  // Identifiers
  scheduleId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Organization Context
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Schedule Information
  name: {
    type: String,
    required: true
  },
  description: String,

  // Recurrence Pattern
  frequency: {
    type: String,
    enum: ['ONCE', 'HOURLY', 'DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'CUSTOM'],
    required: true,
    index: true
  },
  cronExpression: {
    type: String,
    description: 'Cron expression for custom schedules'
  },
  interval: {
    value: Number,
    unit: {
      type: String,
      enum: ['MINUTES', 'HOURS', 'DAYS', 'WEEKS', 'MONTHS']
    }
  },
  dayOfWeek: [{
    type: Number,
    min: 0,
    max: 6
  }],
  dayOfMonth: [{
    type: Number,
    min: 1,
    max: 31
  }],
  monthOfYear: [{
    type: Number,
    min: 1,
    max: 12
  }],
  time: {
    hour: { type: Number, min: 0, max: 23 },
    minute: { type: Number, min: 0, max: 59 }
  },
  timezone: {
    type: String,
    default: 'UTC'
  },

  // Schedule Window
  window: scheduleWindowSchema,

  // Date Range
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  noEndDate: {
    type: Boolean,
    default: true
  },

  // Scan Configuration Reference
  scanConfig: {
    scanType: {
      type: String,
      enum: ['NETWORK', 'WEB_APPLICATION', 'API', 'CONTAINER', 'CLOUD', 'COMPLIANCE', 'FULL', 'CUSTOM'],
      required: true
    },
    scanProfile: {
      type: String,
      enum: ['QUICK', 'STANDARD', 'COMPREHENSIVE', 'PCI_DSS', 'HIPAA', 'PENETRATION', 'CUSTOM'],
      default: 'STANDARD'
    },
    policyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ScanPolicy'
    },
    configSnapshot: mongoose.Schema.Types.Mixed
  },

  // Targets
  targets: [{
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'VulnScanAsset' },
    assetGroupId: { type: mongoose.Schema.Types.ObjectId, ref: 'AssetGroup' },
    targetType: String,
    target: String
  }],
  targetGroups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AssetGroup'
  }],
  dynamicTargets: {
    enabled: { type: Boolean, default: false },
    filters: {
      assetTypes: [String],
      environments: [String],
      criticalities: [String],
      tags: [String],
      complianceFrameworks: [String]
    }
  },

  // Execution Settings
  maxConcurrentScans: {
    type: Number,
    default: 1
  },
  skipIfPreviousRunning: {
    type: Boolean,
    default: true
  },
  retryOnFailure: {
    enabled: { type: Boolean, default: false },
    maxRetries: { type: Number, default: 3 },
    retryDelay: { type: Number, default: 300000 }
  },
  timeout: {
    type: Number,
    default: 86400000,
    description: 'Max scan duration in ms'
  },

  // Notifications
  notifications: notificationConfigSchema,

  // Status
  status: {
    type: String,
    enum: ['ACTIVE', 'PAUSED', 'DISABLED', 'EXPIRED', 'COMPLETED'],
    default: 'ACTIVE',
    index: true
  },
  statusHistory: [{
    status: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    reason: String
  }],

  // Execution History
  lastRun: {
    scanId: { type: mongoose.Schema.Types.ObjectId, ref: 'VulnScan' },
    startedAt: Date,
    completedAt: Date,
    status: String,
    summary: {
      totalVulns: Number,
      criticalCount: Number,
      highCount: Number,
      riskScore: Number
    }
  },
  nextRun: {
    type: Date,
    index: true
  },
  runCount: {
    type: Number,
    default: 0
  },
  successCount: {
    type: Number,
    default: 0
  },
  failureCount: {
    type: Number,
    default: 0
  },
  executionHistory: [{
    scanId: { type: mongoose.Schema.Types.ObjectId, ref: 'VulnScan' },
    scheduledFor: Date,
    startedAt: Date,
    completedAt: Date,
    status: { type: String, enum: ['COMPLETED', 'FAILED', 'SKIPPED', 'TIMEOUT', 'CANCELLED'] },
    duration: Number,
    vulnsFound: Number,
    riskScore: Number,
    errorMessage: String
  }],

  // Ownership
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Tags
  tags: [String],

  // Metadata
  metadata: mongoose.Schema.Types.Mixed,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'vulnscan_schedules'
});

// Indexes
scanScheduleSchema.index({ organizationId: 1, status: 1 });
scanScheduleSchema.index({ nextRun: 1, status: 1 });
scanScheduleSchema.index({ 'targets.assetId': 1 });
scanScheduleSchema.index({ targetGroups: 1 });
scanScheduleSchema.index({ frequency: 1 });

// Virtual for is due
scanScheduleSchema.virtual('isDue').get(function() {
  if (this.status !== 'ACTIVE') return false;
  if (!this.nextRun) return false;
  return new Date() >= this.nextRun;
});

// Method to calculate next run
scanScheduleSchema.methods.calculateNextRun = function() {
  const now = new Date();
  
  if (this.endDate && now > this.endDate) {
    this.status = 'EXPIRED';
    this.nextRun = null;
    return null;
  }
  
  let nextRun;
  
  switch (this.frequency) {
    case 'ONCE':
      nextRun = this.startDate > now ? this.startDate : null;
      break;
    case 'HOURLY':
      nextRun = new Date(now.getTime() + 60 * 60 * 1000);
      break;
    case 'DAILY':
      nextRun = new Date(now);
      nextRun.setDate(nextRun.getDate() + 1);
      nextRun.setHours(this.time?.hour || 0, this.time?.minute || 0, 0, 0);
      break;
    case 'WEEKLY':
      nextRun = new Date(now);
      nextRun.setDate(nextRun.getDate() + 7);
      nextRun.setHours(this.time?.hour || 0, this.time?.minute || 0, 0, 0);
      break;
    case 'BIWEEKLY':
      nextRun = new Date(now);
      nextRun.setDate(nextRun.getDate() + 14);
      nextRun.setHours(this.time?.hour || 0, this.time?.minute || 0, 0, 0);
      break;
    case 'MONTHLY':
      nextRun = new Date(now);
      nextRun.setMonth(nextRun.getMonth() + 1);
      nextRun.setHours(this.time?.hour || 0, this.time?.minute || 0, 0, 0);
      break;
    case 'QUARTERLY':
      nextRun = new Date(now);
      nextRun.setMonth(nextRun.getMonth() + 3);
      nextRun.setHours(this.time?.hour || 0, this.time?.minute || 0, 0, 0);
      break;
    default:
      // For CUSTOM, use cron expression parsing (would need cron-parser library)
      nextRun = null;
  }
  
  this.nextRun = nextRun;
  return nextRun;
};

// Method to record execution
scanScheduleSchema.methods.recordExecution = function(scanResult) {
  this.lastRun = {
    scanId: scanResult._id,
    startedAt: scanResult.startedAt,
    completedAt: scanResult.completedAt,
    status: scanResult.status,
    summary: {
      totalVulns: scanResult.summary?.totalVulnerabilities,
      criticalCount: scanResult.summary?.criticalCount,
      highCount: scanResult.summary?.highCount,
      riskScore: scanResult.summary?.riskScore
    }
  };
  
  this.executionHistory.unshift({
    scanId: scanResult._id,
    scheduledFor: this.nextRun,
    startedAt: scanResult.startedAt,
    completedAt: scanResult.completedAt,
    status: scanResult.status === 'COMPLETED' ? 'COMPLETED' : 'FAILED',
    duration: scanResult.duration,
    vulnsFound: scanResult.summary?.totalVulnerabilities,
    riskScore: scanResult.summary?.riskScore
  });
  
  // Keep only last 100 executions
  if (this.executionHistory.length > 100) {
    this.executionHistory = this.executionHistory.slice(0, 100);
  }
  
  this.runCount += 1;
  if (scanResult.status === 'COMPLETED') {
    this.successCount += 1;
  } else {
    this.failureCount += 1;
  }
  
  // Calculate next run
  this.calculateNextRun();
  
  return this.save();
};

// Pre-save hook
scanScheduleSchema.pre('save', function(next) {
  if (this.isNew || !this.nextRun) {
    this.calculateNextRun();
  }
  
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date()
    });
  }
  
  next();
});

// Static method for due schedules
scanScheduleSchema.statics.getDueSchedules = async function() {
  return this.find({
    status: 'ACTIVE',
    nextRun: { $lte: new Date() },
    $or: [
      { endDate: null },
      { noEndDate: true },
      { endDate: { $gte: new Date() } }
    ]
  }).sort({ nextRun: 1 });
};

module.exports = mongoose.model('VulnScanSchedule', scanScheduleSchema);
