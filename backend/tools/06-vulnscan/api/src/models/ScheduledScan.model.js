const mongoose = require('mongoose');

const scheduledScanSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  
  scheduleId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  
  // Schedule name and description
  name: { 
    type: String, 
    required: true 
  },
  description: String,
  
  // Target configuration
  targets: [{
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
    targetType: { 
      type: String, 
      enum: ['host', 'network', 'web_application', 'api', 'container', 'cloud'] 
    },
    targetIdentifier: String  // IP, hostname, URL, etc.
  }],
  
  // Scan configuration
  scanConfig: {
    scanType: { 
      type: String, 
      enum: ['full', 'quick', 'compliance', 'authenticated', 'custom'],
      default: 'quick'
    },
    ports: {
      range: String,  // e.g., '1-1000' or '22,80,443,8080'
      topPorts: Number  // Alternative: scan top N ports
    },
    depth: { 
      type: String, 
      enum: ['quick', 'standard', 'deep'],
      default: 'standard'
    },
    options: {
      cveDetection: { type: Boolean, default: true },
      osDetection: { type: Boolean, default: true },
      serviceDetection: { type: Boolean, default: true },
      sslAnalysis: { type: Boolean, default: true },
      headerCheck: { type: Boolean, default: true },
      nucleiScan: { type: Boolean, default: false },
      authenticated: { type: Boolean, default: false }
    },
    credentials: {
      // Encrypted credentials for authenticated scans
      type: { type: String, enum: ['ssh', 'winrm', 'api_key', 'basic_auth'] },
      username: String,
      encryptedPassword: String,
      privateKey: String,
      apiKey: String
    },
    excludePorts: [Number],
    excludeHosts: [String],
    maxConcurrent: { type: Number, default: 10 },
    timeout: { type: Number, default: 300 }  // seconds
  },
  
  // Schedule configuration
  schedule: {
    type: { 
      type: String, 
      enum: ['once', 'hourly', 'daily', 'weekly', 'monthly', 'cron'],
      default: 'weekly'
    },
    cronExpression: String,  // For custom cron schedules
    timezone: { type: String, default: 'UTC' },
    
    // Simple schedule options
    dayOfWeek: { type: Number, min: 0, max: 6 },  // 0 = Sunday
    dayOfMonth: { type: Number, min: 1, max: 31 },
    hour: { type: Number, min: 0, max: 23, default: 2 },  // Default 2 AM
    minute: { type: Number, min: 0, max: 59, default: 0 },
    
    // Next scheduled run
    nextRun: Date,
    lastRun: Date
  },
  
  // Notification settings
  notifications: {
    enabled: { type: Boolean, default: true },
    channels: [{
      type: { type: String, enum: ['email', 'slack', 'webhook', 'pagerduty'] },
      target: String,  // Email address, webhook URL, etc.
      events: [{ type: String, enum: ['scan_complete', 'critical_found', 'high_found', 'scan_failed'] }]
    }],
    thresholds: {
      criticalCount: { type: Number, default: 1 },  // Alert if >= N critical vulns
      highCount: { type: Number, default: 5 },
      riskScoreChange: { type: Number, default: 10 }  // Alert if score changes by N%
    }
  },
  
  // Execution history
  executionHistory: [{
    scanId: { type: mongoose.Schema.Types.ObjectId, ref: 'VulnerabilityScan' },
    startedAt: Date,
    completedAt: Date,
    status: { type: String, enum: ['running', 'completed', 'failed', 'cancelled'] },
    summary: {
      totalVulnerabilities: Number,
      criticalCount: Number,
      highCount: Number,
      mediumCount: Number,
      lowCount: Number
    },
    error: String
  }],
  
  // Statistics
  stats: {
    totalRuns: { type: Number, default: 0 },
    successfulRuns: { type: Number, default: 0 },
    failedRuns: { type: Number, default: 0 },
    averageDuration: Number,  // seconds
    lastSuccessfulRun: Date
  },
  
  // Status
  status: { 
    type: String, 
    enum: ['active', 'paused', 'disabled', 'expired'],
    default: 'active'
  },
  
  // Validity period
  validFrom: { type: Date, default: Date.now },
  validUntil: Date,
  
  // Tags
  tags: [String],
  
  // Compliance association
  compliance: {
    frameworks: [String],
    requirement: String
  }

}, { timestamps: true });

// Indexes
scheduledScanSchema.index({ userId: 1, status: 1 });
scheduledScanSchema.index({ 'schedule.nextRun': 1 });
scheduledScanSchema.index({ status: 1, 'schedule.nextRun': 1 });

// Method to calculate next run time
scheduledScanSchema.methods.calculateNextRun = function() {
  const now = new Date();
  const schedule = this.schedule;
  
  switch (schedule.type) {
    case 'hourly':
      const nextHour = new Date(now);
      nextHour.setHours(nextHour.getHours() + 1, schedule.minute, 0, 0);
      return nextHour;
      
    case 'daily':
      const nextDay = new Date(now);
      nextDay.setHours(schedule.hour, schedule.minute, 0, 0);
      if (nextDay <= now) nextDay.setDate(nextDay.getDate() + 1);
      return nextDay;
      
    case 'weekly':
      const nextWeek = new Date(now);
      const daysUntil = (schedule.dayOfWeek + 7 - now.getDay()) % 7 || 7;
      nextWeek.setDate(nextWeek.getDate() + daysUntil);
      nextWeek.setHours(schedule.hour, schedule.minute, 0, 0);
      return nextWeek;
      
    case 'monthly':
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1, schedule.dayOfMonth);
      nextMonth.setHours(schedule.hour, schedule.minute, 0, 0);
      return nextMonth;
      
    default:
      return null;
  }
};

// Method to update after execution
scheduledScanSchema.methods.recordExecution = function(scanResult, status, error = null) {
  const execution = {
    scanId: scanResult?._id,
    startedAt: scanResult?.startedAt || new Date(),
    completedAt: new Date(),
    status,
    summary: scanResult?.summary || {},
    error
  };
  
  this.executionHistory.unshift(execution);
  // Keep only last 50 executions
  if (this.executionHistory.length > 50) {
    this.executionHistory = this.executionHistory.slice(0, 50);
  }
  
  // Update stats
  this.stats.totalRuns += 1;
  if (status === 'completed') {
    this.stats.successfulRuns += 1;
    this.stats.lastSuccessfulRun = new Date();
  } else if (status === 'failed') {
    this.stats.failedRuns += 1;
  }
  
  // Update last run and calculate next
  this.schedule.lastRun = new Date();
  this.schedule.nextRun = this.calculateNextRun();
  
  return this.save();
};

module.exports = mongoose.model('ScheduledScan', scheduledScanSchema);
