/**
 * ScanSchedule Model
 * Automated Scan Scheduling & Execution
 * 
 * Manages recurring vulnerability scans with flexible scheduling,
 * notifications, and execution history tracking
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const executionHistorySchema = new Schema({
  scanId: { type: Schema.Types.ObjectId, ref: 'Scan' },
  executedAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['success', 'failed', 'partial', 'cancelled'],
    default: 'success'
  },
  duration: Number, // seconds
  vulnerabilitiesFound: {
    total: Number,
    critical: Number,
    high: Number,
    medium: Number,
    low: Number
  },
  assetsScanned: Number,
  errors: [String],
  notes: String
}, { _id: true });

const scanScheduleSchema = new Schema({
  // Identification
  scheduleId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  name: { type: String, required: true },
  description: String,
  
  // Status
  enabled: { type: Boolean, default: true, index: true },
  status: {
    type: String,
    enum: ['active', 'paused', 'disabled', 'expired', 'error'],
    default: 'active'
  },
  
  // Schedule Configuration
  scheduleType: {
    type: String,
    required: true,
    enum: ['one_time', 'recurring'],
    default: 'recurring'
  },
  
  // Recurrence Pattern
  recurrence: {
    frequency: {
      type: String,
      required: true,
      enum: ['once', 'hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'],
      default: 'weekly'
    },
    interval: { type: Number, default: 1 }, // e.g., every 2 weeks
    
    // For weekly schedules
    daysOfWeek: [{
      type: Number,
      min: 0,
      max: 6 // 0 = Sunday, 6 = Saturday
    }],
    
    // For monthly schedules
    dayOfMonth: { type: Number, min: 1, max: 31 },
    weekOfMonth: { type: Number, min: 1, max: 5 }, // 1st, 2nd, 3rd, 4th, 5th
    
    // Time of day
    hour: { type: Number, required: true, min: 0, max: 23, default: 2 },
    minute: { type: Number, required: true, min: 0, max: 59, default: 0 },
    timezone: { type: String, default: 'UTC' },
    
    // Custom cron expression (for advanced scheduling)
    cronExpression: String
  },
  
  // Time Window (maintenance window)
  timeWindow: {
    enabled: { type: Boolean, default: false },
    startTime: String, // HH:MM format
    endTime: String,   // HH:MM format
    timezone: { type: String, default: 'UTC' }
  },
  
  // Execution Timing
  timing: {
    nextRun: { type: Date, index: true },
    lastRun: Date,
    lastSuccess: Date,
    lastFailure: Date,
    startDate: { type: Date, default: Date.now },
    endDate: Date, // Schedule expiration
    maxDuration: Number // Maximum scan duration in minutes
  },
  
  // Scan Configuration (references scan profile)
  scanConfig: {
    scanType: {
      type: String,
      required: true,
      enum: [
        'network',
        'web_application',
        'database',
        'api',
        'cloud',
        'container',
        'mobile',
        'compliance'
      ]
    },
    profile: {
      name: String,
      type: { type: String, enum: ['quick', 'full', 'deep', 'custom'], default: 'full' }
    },
    scanner: {
      engine: String,
      version: String
    }
  },
  
  // Targets
  targets: [{
    type: { type: String, enum: ['ip', 'cidr', 'domain', 'asset_id', 'asset_group', 'tag'] },
    value: String,
    asset: { type: Schema.Types.ObjectId, ref: 'Asset' }
  }],
  targetSelectionMode: {
    type: String,
    enum: ['static', 'dynamic', 'tag_based', 'query'],
    default: 'static'
  },
  dynamicTargetQuery: { type: Map, of: Schema.Types.Mixed }, // MongoDB query for dynamic target selection
  
  // Execution Settings
  execution: {
    parallel: { type: Boolean, default: false },
    maxConcurrentScans: { type: Number, default: 1 },
    retryOnFailure: { type: Boolean, default: true },
    maxRetries: { type: Number, default: 3 },
    retryDelay: { type: Number, default: 300 }, // seconds
    timeoutMinutes: { type: Number, default: 720 } // 12 hours
  },
  
  // Notifications
  notifications: {
    enabled: { type: Boolean, default: true },
    events: {
      onStart: { type: Boolean, default: false },
      onComplete: { type: Boolean, default: true },
      onFailure: { type: Boolean, default: true },
      onCriticalVulns: { type: Boolean, default: true },
      onNewVulns: { type: Boolean, default: true }
    },
    channels: {
      email: {
        enabled: { type: Boolean, default: true },
        recipients: [String]
      },
      slack: {
        enabled: { type: Boolean, default: false },
        webhookUrl: String,
        channel: String
      },
      webhook: {
        enabled: { type: Boolean, default: false },
        url: String,
        method: { type: String, enum: ['POST', 'PUT'], default: 'POST' },
        headers: { type: Map, of: String }
      },
      sms: {
        enabled: { type: Boolean, default: false },
        phoneNumbers: [String]
      }
    },
    thresholds: {
      criticalVulns: { type: Number, default: 1 },
      highVulns: { type: Number, default: 5 },
      newVulns: { type: Number, default: 10 }
    }
  },
  
  // Auto-remediation
  autoRemediation: {
    enabled: { type: Boolean, default: false },
    autoCreateTickets: { type: Boolean, default: false },
    autoAssign: { type: Boolean, default: false },
    assignTo: String,
    severityThreshold: { type: String, enum: ['critical', 'high', 'medium', 'low'] }
  },
  
  // Report Generation
  reporting: {
    autoGenerate: { type: Boolean, default: true },
    formats: [{ type: String, enum: ['pdf', 'html', 'csv', 'json', 'xml'] }],
    recipients: [String],
    includeTrends: { type: Boolean, default: true },
    compareWithPrevious: { type: Boolean, default: true }
  },
  
  // Execution History
  executionHistory: [executionHistorySchema],
  executionCount: { type: Number, default: 0 },
  successCount: { type: Number, default: 0 },
  failureCount: { type: Number, default: 0 },
  
  // Statistics
  statistics: {
    averageDuration: Number,
    averageVulnsFound: Number,
    lastVulnsFound: {
      total: Number,
      critical: Number,
      high: Number,
      medium: Number,
      low: Number
    },
    trend: { type: String, enum: ['improving', 'stable', 'worsening', 'unknown'], default: 'unknown' }
  },
  
  // Ownership
  owner: {
    userId: String,
    username: String,
    department: String
  },
  
  // Tags & Labels
  tags: [String],
  labels: { type: Map, of: String },
  
  // Notes
  notes: [{
    author: String,
    content: String,
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Metadata
  metadata: { type: Map, of: Schema.Types.Mixed }
}, {
  timestamps: true,
  collection: 'scanschedules'
});

// Indexes
scanScheduleSchema.index({ scheduleId: 1 });
scanScheduleSchema.index({ enabled: 1, status: 1 });
scanScheduleSchema.index({ 'timing.nextRun': 1 });
scanScheduleSchema.index({ 'owner.userId': 1 });
scanScheduleSchema.index({ tags: 1 });

// Virtual for is due
scanScheduleSchema.virtual('isDue').get(function() {
  if (!this.enabled || !this.timing.nextRun) return false;
  return this.timing.nextRun <= new Date();
});

// Virtual for is expired
scanScheduleSchema.virtual('isExpired').get(function() {
  if (!this.timing.endDate) return false;
  return new Date() > this.timing.endDate;
});

// Virtual for success rate
scanScheduleSchema.virtual('successRate').get(function() {
  if (this.executionCount === 0) return 0;
  return Math.round((this.successCount / this.executionCount) * 100);
});

// Method: Calculate next run time
scanScheduleSchema.methods.calculateNextRun = function() {
  const now = new Date();
  const { frequency, interval, daysOfWeek, dayOfMonth, hour, minute, cronExpression } = this.recurrence;
  
  let nextRun = new Date();
  nextRun.setHours(hour, minute, 0, 0);
  
  // If time has passed today, start from tomorrow
  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }
  
  switch (frequency) {
    case 'once':
      // One-time schedule
      nextRun = this.timing.startDate || now;
      break;
      
    case 'hourly':
      nextRun = new Date(now);
      nextRun.setMinutes(minute);
      if (nextRun <= now) {
        nextRun.setHours(nextRun.getHours() + interval);
      }
      break;
      
    case 'daily':
      // Add interval days
      while (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + interval);
      }
      break;
      
    case 'weekly':
      // Find next occurrence of specified day(s)
      if (daysOfWeek && daysOfWeek.length > 0) {
        const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
        const currentDay = nextRun.getDay();
        let targetDay = sortedDays.find(day => day > currentDay);
        
        if (!targetDay) {
          // Next week
          targetDay = sortedDays[0];
          nextRun.setDate(nextRun.getDate() + (7 - currentDay + targetDay));
        } else {
          nextRun.setDate(nextRun.getDate() + (targetDay - currentDay));
        }
      }
      break;
      
    case 'monthly':
      // Set to specific day of month
      if (dayOfMonth) {
        nextRun.setDate(dayOfMonth);
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + interval);
        }
      }
      break;
      
    case 'quarterly':
      nextRun.setMonth(nextRun.getMonth() + (3 * interval));
      break;
      
    case 'yearly':
      nextRun.setFullYear(nextRun.getFullYear() + interval);
      break;
      
    case 'custom':
      // Use cron expression parser (would need a library like node-cron)
      // For now, fallback to daily
      nextRun.setDate(nextRun.getDate() + 1);
      break;
  }
  
  // Check if within time window
  if (this.timeWindow.enabled) {
    // Adjust to time window if needed
    // (Implementation would check startTime/endTime)
  }
  
  this.timing.nextRun = nextRun;
  return nextRun;
};

// Method: Execute schedule
scanScheduleSchema.methods.execute = async function() {
  if (!this.enabled) {
    throw new Error('Schedule is disabled');
  }
  
  if (this.isExpired) {
    this.status = 'expired';
    await this.save();
    throw new Error('Schedule has expired');
  }
  
  // Create scan from schedule configuration
  const Scan = mongoose.model('Scan');
  
  const scanData = {
    scanId: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: `${this.name} - ${new Date().toISOString()}`,
    description: `Scheduled scan: ${this.description}`,
    scanType: this.scanConfig.scanType,
    profile: this.scanConfig.profile,
    scanner: this.scanConfig.scanner,
    targets: this.targets,
    schedule: {
      isRecurring: true,
      scheduleId: this._id,
      recurrence: this.recurrence
    },
    notifications: this.notifications,
    initiator: {
      userId: this.owner.userId,
      username: this.owner.username,
      source: 'scheduled'
    }
  };
  
  const scan = new Scan(scanData);
  await scan.save();
  
  // Update execution history
  this.timing.lastRun = new Date();
  this.executionCount++;
  
  // Calculate next run
  this.calculateNextRun();
  
  await this.save();
  
  return scan;
};

// Method: Record execution result
scanScheduleSchema.methods.recordExecution = function(executionData) {
  this.executionHistory.push(executionData);
  
  if (executionData.status === 'success') {
    this.successCount++;
    this.timing.lastSuccess = executionData.executedAt;
  } else if (executionData.status === 'failed') {
    this.failureCount++;
    this.timing.lastFailure = executionData.executedAt;
  }
  
  // Update statistics
  this.updateStatistics();
  
  // Keep only last 100 executions
  if (this.executionHistory.length > 100) {
    this.executionHistory = this.executionHistory.slice(-100);
  }
};

// Method: Update statistics
scanScheduleSchema.methods.updateStatistics = function() {
  if (this.executionHistory.length === 0) return;
  
  const recentExecutions = this.executionHistory.slice(-10);
  
  // Average duration
  const totalDuration = recentExecutions.reduce((sum, exec) => sum + (exec.duration || 0), 0);
  this.statistics.averageDuration = Math.round(totalDuration / recentExecutions.length);
  
  // Average vulnerabilities found
  const totalVulns = recentExecutions.reduce((sum, exec) => 
    sum + (exec.vulnerabilitiesFound?.total || 0), 0);
  this.statistics.averageVulnsFound = Math.round(totalVulns / recentExecutions.length);
  
  // Update last vulns found
  const lastExecution = this.executionHistory[this.executionHistory.length - 1];
  if (lastExecution.vulnerabilitiesFound) {
    this.statistics.lastVulnsFound = lastExecution.vulnerabilitiesFound;
  }
  
  // Calculate trend
  if (recentExecutions.length >= 3) {
    const first = recentExecutions[0].vulnerabilitiesFound?.total || 0;
    const last = lastExecution.vulnerabilitiesFound?.total || 0;
    
    if (last < first * 0.8) {
      this.statistics.trend = 'improving';
    } else if (last > first * 1.2) {
      this.statistics.trend = 'worsening';
    } else {
      this.statistics.trend = 'stable';
    }
  }
};

// Method: Notify
scanScheduleSchema.methods.notify = async function(event, data) {
  if (!this.notifications.enabled) return;
  
  if (!this.notifications.events[event]) return;
  
  // Email notification
  if (this.notifications.channels.email.enabled) {
    // Send email (implementation would use email service)
    console.log(`Sending email to: ${this.notifications.channels.email.recipients.join(', ')}`);
  }
  
  // Slack notification
  if (this.notifications.channels.slack.enabled) {
    // Send to Slack (implementation would use Slack API)
    console.log(`Sending Slack notification to: ${this.notifications.channels.slack.channel}`);
  }
  
  // Webhook notification
  if (this.notifications.channels.webhook.enabled) {
    // Call webhook (implementation would use HTTP client)
    console.log(`Calling webhook: ${this.notifications.channels.webhook.url}`);
  }
};

// Static: Find schedules due for execution
scanScheduleSchema.statics.findDue = function() {
  return this.find({
    enabled: true,
    status: 'active',
    'timing.nextRun': { $lte: new Date() }
  }).sort({ 'timing.nextRun': 1 });
};

// Static: Find active schedules
scanScheduleSchema.statics.findActive = function() {
  return this.find({
    enabled: true,
    status: 'active'
  }).sort({ 'timing.nextRun': 1 });
};

// Static: Get statistics
scanScheduleSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $facet: {
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        byFrequency: [
          { $group: { _id: '$recurrence.frequency', count: { $sum: 1 } } }
        ],
        summary: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              enabled: { $sum: { $cond: ['$enabled', 1, 0] } },
              totalExecutions: { $sum: '$executionCount' },
              totalSuccesses: { $sum: '$successCount' },
              totalFailures: { $sum: '$failureCount' }
            }
          }
        ]
      }
    }
  ]);
  
  return stats[0];
};

// Pre-save hook
scanScheduleSchema.pre('save', function(next) {
  // Check if expired
  if (this.timing.endDate && new Date() > this.timing.endDate) {
    this.status = 'expired';
    this.enabled = false;
  }
  
  // Calculate next run if not set
  if (!this.timing.nextRun && this.enabled) {
    this.calculateNextRun();
  }
  
  next();
});

const ScanSchedule = mongoose.model('ScanSchedule', scanScheduleSchema);

module.exports = ScanSchedule;
