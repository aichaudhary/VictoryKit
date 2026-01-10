const mongoose = require('mongoose');

/**
 * ThreatFeed Model
 * Manages external threat intelligence feeds and sources
 */
const ThreatFeedSchema = new mongoose.Schema({
  // Feed identification
  feedId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  name: {
    type: String,
    required: true,
    index: true
  },

  provider: {
    type: String,
    required: true
  },

  description: String,

  // Feed classification
  feedType: {
    type: String,
    enum: ['commercial', 'community', 'government', 'internal', 'partner', 'osint'],
    required: true,
    index: true
  },

  category: {
    type: String,
    enum: ['malware', 'phishing', 'ransomware', 'botnet', 'vulnerability', 'threat_actor', 
           'general', 'domain_reputation', 'ip_reputation', 'file_reputation'],
    required: true
  },

  // Connection configuration
  connection: {
    url: {
      type: String,
      required: true
    },
    apiKey: String,
    apiSecret: String,
    authentication: {
      type: String,
      enum: ['none', 'api_key', 'oauth', 'basic_auth', 'bearer_token'],
      default: 'none'
    },
    headers: mongoose.Schema.Types.Mixed,
    format: {
      type: String,
      enum: ['json', 'xml', 'csv', 'stix', 'taxii', 'misp', 'custom'],
      required: true
    },
    method: {
      type: String,
      enum: ['GET', 'POST'],
      default: 'GET'
    },
    timeout: {
      type: Number,
      default: 30000 // 30 seconds
    }
  },

  // Update schedule
  schedule: {
    updateFrequency: {
      type: String,
      enum: ['realtime', 'hourly', 'daily', 'weekly', 'monthly', 'manual'],
      required: true
    },
    cron: String, // Cron expression for scheduling
    lastSync: {
      type: Date,
      index: true
    },
    nextSync: Date,
    autoSync: {
      type: Boolean,
      default: true
    }
  },

  // Data types collected
  dataTypes: {
    iocTypes: [{
      type: String,
      enum: ['ip', 'domain', 'url', 'email', 'file_hash', 'filename', 'registry_key', 
             'mutex', 'user_agent', 'certificate', 'asn', 'cve']
    }],
    threatTypes: [String],
    additionalData: [String]
  },

  // Feed status
  status: {
    enabled: {
      type: Boolean,
      default: true,
      index: true
    },
    health: {
      type: String,
      enum: ['healthy', 'degraded', 'offline', 'error'],
      default: 'healthy',
      index: true
    },
    lastStatus: String,
    lastError: {
      message: String,
      timestamp: Date,
      code: String
    }
  },

  // Sync statistics
  statistics: {
    totalSyncs: {
      type: Number,
      default: 0
    },
    successfulSyncs: {
      type: Number,
      default: 0
    },
    failedSyncs: {
      type: Number,
      default: 0
    },
    totalIOCs: {
      type: Number,
      default: 0
    },
    newIOCs: {
      type: Number,
      default: 0
    },
    updatedIOCs: {
      type: Number,
      default: 0
    },
    expiredIOCs: {
      type: Number,
      default: 0
    },
    lastSyncDuration: Number, // milliseconds
    averageSyncDuration: Number, // milliseconds
    dataTransferred: Number // bytes
  },

  // Quality metrics
  quality: {
    reliability: {
      type: String,
      enum: ['unknown', 'low', 'medium', 'high', 'verified'],
      default: 'medium'
    },
    reliabilityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    falsePositiveRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    coverage: {
      type: String,
      enum: ['limited', 'moderate', 'comprehensive', 'extensive']
    },
    accuracy: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    timeliness: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent']
    }
  },

  // Processing rules
  processing: {
    parsingRules: mongoose.Schema.Types.Mixed,
    enrichmentEnabled: {
      type: Boolean,
      default: true
    },
    deduplication: {
      type: Boolean,
      default: true
    },
    validation: {
      type: Boolean,
      default: true
    },
    autoTagging: {
      type: Boolean,
      default: true
    },
    defaultTLP: {
      type: String,
      enum: ['TLP:WHITE', 'TLP:GREEN', 'TLP:AMBER', 'TLP:RED'],
      default: 'TLP:GREEN'
    },
    defaultSeverity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    expirationDays: {
      type: Number,
      default: 90
    }
  },

  // Alerting configuration
  alerting: {
    enabled: {
      type: Boolean,
      default: false
    },
    thresholds: {
      newIOCsPerHour: Number,
      errorRate: Number,
      syncFailures: Number
    },
    notifications: [{
      type: String,
      enum: ['email', 'slack', 'webhook', 'sms'],
      config: mongoose.Schema.Types.Mixed
    }]
  },

  // Rate limiting
  rateLimit: {
    enabled: {
      type: Boolean,
      default: false
    },
    requestsPerMinute: Number,
    requestsPerHour: Number,
    requestsPerDay: Number
  },

  // Cost tracking (for commercial feeds)
  cost: {
    subscription: {
      price: Number,
      currency: String,
      billingPeriod: String // monthly, annual, etc.
    },
    apiCalls: {
      costPerCall: Number,
      monthlyAllowance: Number,
      currentUsage: Number
    }
  },

  // Sync history
  syncHistory: [{
    syncDate: Date,
    success: Boolean,
    duration: Number,
    iocsProcessed: Number,
    newIOCs: Number,
    errors: [String],
    summary: String
  }],

  // Tags
  tags: [String],

  // Custom configuration
  customConfig: mongoose.Schema.Types.Mixed,

  // Metadata
  metadata: {
    createdBy: String,
    lastModifiedBy: String,
    notes: String
  }

}, {
  timestamps: true,
  collection: 'threatfeeds'
});

// Indexes
ThreatFeedSchema.index({ feedId: 1 });
ThreatFeedSchema.index({ feedType: 1, 'status.enabled': 1 });
ThreatFeedSchema.index({ 'schedule.lastSync': -1 });
ThreatFeedSchema.index({ 'status.health': 1 });

// Virtual: Success rate
ThreatFeedSchema.virtual('successRate').get(function() {
  if (this.statistics.totalSyncs === 0) return 0;
  return Math.round((this.statistics.successfulSyncs / this.statistics.totalSyncs) * 100);
});

// Virtual: Is overdue
ThreatFeedSchema.virtual('isOverdue').get(function() {
  if (!this.schedule.nextSync) return false;
  return this.schedule.nextSync < new Date();
});

// Instance method: Record sync start
ThreatFeedSchema.methods.startSync = function() {
  this.syncStartTime = new Date();
  return this;
};

// Instance method: Record sync success
ThreatFeedSchema.methods.recordSyncSuccess = function(iocStats) {
  const duration = new Date() - this.syncStartTime;
  
  this.schedule.lastSync = new Date();
  this.status.health = 'healthy';
  this.status.lastStatus = 'success';
  
  this.statistics.totalSyncs += 1;
  this.statistics.successfulSyncs += 1;
  this.statistics.lastSyncDuration = duration;
  
  if (iocStats) {
    this.statistics.totalIOCs = iocStats.total || this.statistics.totalIOCs;
    this.statistics.newIOCs += iocStats.new || 0;
    this.statistics.updatedIOCs += iocStats.updated || 0;
    this.statistics.expiredIOCs += iocStats.expired || 0;
  }
  
  // Calculate average sync duration
  if (this.statistics.averageSyncDuration) {
    this.statistics.averageSyncDuration = 
      (this.statistics.averageSyncDuration * (this.statistics.successfulSyncs - 1) + duration) / 
      this.statistics.successfulSyncs;
  } else {
    this.statistics.averageSyncDuration = duration;
  }
  
  // Add to sync history
  this.syncHistory.push({
    syncDate: new Date(),
    success: true,
    duration,
    iocsProcessed: iocStats?.total || 0,
    newIOCs: iocStats?.new || 0,
    summary: `Successfully synced ${iocStats?.total || 0} IOCs`
  });
  
  // Keep only last 100 sync records
  if (this.syncHistory.length > 100) {
    this.syncHistory = this.syncHistory.slice(-100);
  }
  
  // Calculate next sync
  this.calculateNextSync();
  
  return this.save();
};

// Instance method: Record sync failure
ThreatFeedSchema.methods.recordSyncFailure = function(error) {
  this.schedule.lastSync = new Date();
  this.status.health = 'error';
  this.status.lastStatus = 'failed';
  this.status.lastError = {
    message: error.message || error,
    timestamp: new Date(),
    code: error.code || 'UNKNOWN'
  };
  
  this.statistics.totalSyncs += 1;
  this.statistics.failedSyncs += 1;
  
  // Add to sync history
  this.syncHistory.push({
    syncDate: new Date(),
    success: false,
    errors: [error.message || error],
    summary: `Sync failed: ${error.message || error}`
  });
  
  // Keep only last 100 sync records
  if (this.syncHistory.length > 100) {
    this.syncHistory = this.syncHistory.slice(-100);
  }
  
  // Check if health should be degraded
  const recentFailures = this.syncHistory.slice(-5).filter(s => !s.success).length;
  if (recentFailures >= 3) {
    this.status.health = 'offline';
  } else if (recentFailures >= 2) {
    this.status.health = 'degraded';
  }
  
  return this.save();
};

// Instance method: Calculate next sync time
ThreatFeedSchema.methods.calculateNextSync = function() {
  if (!this.schedule.autoSync) return;
  
  const now = new Date();
  const frequencyMap = {
    'realtime': 5 * 60 * 1000, // 5 minutes
    'hourly': 60 * 60 * 1000,
    'daily': 24 * 60 * 60 * 1000,
    'weekly': 7 * 24 * 60 * 60 * 1000,
    'monthly': 30 * 24 * 60 * 60 * 1000
  };
  
  const interval = frequencyMap[this.schedule.updateFrequency];
  if (interval) {
    this.schedule.nextSync = new Date(now.getTime() + interval);
  }
};

// Instance method: Update quality metrics
ThreatFeedSchema.methods.updateQualityMetrics = function(metrics) {
  Object.assign(this.quality, metrics);
  
  // Calculate reliability score
  let score = 50; // base score
  
  if (metrics.accuracy) score += (metrics.accuracy - 50) * 0.4;
  if (metrics.falsePositiveRate) score -= metrics.falsePositiveRate * 0.3;
  if (this.successRate) score += (this.successRate - 50) * 0.3;
  
  this.quality.reliabilityScore = Math.max(0, Math.min(100, Math.round(score)));
  
  // Update reliability level
  if (this.quality.reliabilityScore >= 90) this.quality.reliability = 'verified';
  else if (this.quality.reliabilityScore >= 70) this.quality.reliability = 'high';
  else if (this.quality.reliabilityScore >= 50) this.quality.reliability = 'medium';
  else this.quality.reliability = 'low';
  
  return this.save();
};

// Static: Find active feeds
ThreatFeedSchema.statics.findActiveFeeds = function() {
  return this.find({
    'status.enabled': true,
    'status.health': { $in: ['healthy', 'degraded'] }
  });
};

// Static: Find feeds due for sync
ThreatFeedSchema.statics.findDueForSync = function() {
  return this.find({
    'status.enabled': true,
    'schedule.autoSync': true,
    $or: [
      { 'schedule.nextSync': { $lte: new Date() } },
      { 'schedule.nextSync': { $exists: false } }
    ]
  });
};

// Static: Get statistics
ThreatFeedSchema.statics.getStatistics = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        enabled: {
          $sum: { $cond: ['$status.enabled', 1, 0] }
        },
        healthy: {
          $sum: { $cond: [{ $eq: ['$status.health', 'healthy'] }, 1, 0] }
        },
        totalIOCs: { $sum: '$statistics.totalIOCs' },
        totalSyncs: { $sum: '$statistics.totalSyncs' }
      }
    }
  ]);
};

// Pre-save: Calculate next sync on creation
ThreatFeedSchema.pre('save', function(next) {
  if (this.isNew && this.schedule.autoSync && !this.schedule.nextSync) {
    this.calculateNextSync();
  }
  next();
});

module.exports = mongoose.model('ThreatFeed', ThreatFeedSchema);
