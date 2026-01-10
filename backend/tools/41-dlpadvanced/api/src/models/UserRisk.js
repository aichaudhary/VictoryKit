const mongoose = require('mongoose');

const userRiskSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  department: String,
  role: String,
  manager: {
    userId: String,
    name: String
  },
  
  // Risk Score
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  previousRiskScore: Number,
  riskTrend: {
    type: String,
    enum: ['increasing', 'decreasing', 'stable'],
    default: 'stable'
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  
  // Risk Factors
  riskFactors: [{
    factor: {
      type: String,
      enum: ['high_violation_count', 'sensitive_data_access', 'unusual_activity', 
             'policy_overrides', 'after_hours_access', 'bulk_downloads', 
             'external_shares', 'location_anomaly', 'device_anomaly', 'other']
    },
    weight: Number,
    description: String,
    detectedAt: {
      type: Date,
      default: Date.now
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    }
  }],
  
  // Behavior Analysis
  normalBehavior: {
    avgFilesAccessedPerDay: Number,
    avgDataTransferPerDay: Number, // bytes
    commonAccessTimes: [{
      hour: Number,
      frequency: Number
    }],
    commonLocations: [{
      country: String,
      city: String,
      frequency: Number
    }],
    commonDevices: [{
      deviceId: String,
      deviceType: String,
      frequency: Number
    }],
    baselineEstablishedAt: Date,
    lastUpdated: Date
  },
  
  // Recent Activity
  recentActivity: {
    last24Hours: {
      filesAccessed: Number,
      dataTransferred: Number,
      policyViolations: Number,
      sensitiveFilesAccessed: Number
    },
    last7Days: {
      filesAccessed: Number,
      dataTransferred: Number,
      policyViolations: Number,
      sensitiveFilesAccessed: Number
    },
    last30Days: {
      filesAccessed: Number,
      dataTransferred: Number,
      policyViolations: Number,
      sensitiveFilesAccessed: Number
    }
  },
  
  // Incidents
  incidents: {
    total: {
      type: Number,
      default: 0
    },
    open: {
      type: Number,
      default: 0
    },
    resolved: {
      type: Number,
      default: 0
    },
    bySeverity: {
      low: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      critical: { type: Number, default: 0 }
    },
    recentIncidents: [{
      incidentId: String,
      severity: String,
      timestamp: Date,
      resolved: Boolean
    }]
  },
  
  // Data Access Patterns
  dataAccess: {
    sensitiveCategoriesAccessed: [{
      category: String,
      count: Number,
      lastAccess: Date
    }],
    filesAccessedCount: Number,
    totalDataAccessed: Number, // bytes
    unusualAccess: [{
      fileId: String,
      fileName: String,
      reason: String,
      timestamp: Date
    }]
  },
  
  // Peer Comparison
  peerComparison: {
    department: String,
    avgDepartmentRisk: Number,
    percentile: Number, // User's risk vs department (0-100)
    ranking: Number // Within department
  },
  
  // Anomalies Detected
  anomalies: [{
    type: {
      type: String,
      enum: ['time', 'location', 'volume', 'access_pattern', 'device', 'behavior']
    },
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    detectedAt: {
      type: Date,
      default: Date.now
    },
    resolved: Boolean,
    falsePositive: Boolean
  }],
  
  // Training & Compliance
  training: {
    lastCompletedDate: Date,
    nextDueDate: Date,
    completionRate: {
      type: Number,
      min: 0,
      max: 100
    },
    coursesCompleted: [{
      courseName: String,
      completedDate: Date,
      score: Number
    }]
  },
  
  // Actions & Interventions
  interventions: [{
    type: {
      type: String,
      enum: ['warning_sent', 'access_restricted', 'manager_notified', 
             'training_assigned', 'account_suspended', 'escalated']
    },
    reason: String,
    performedBy: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    effectiveness: String
  }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'monitoring', 'restricted', 'suspended', 'terminated'],
    default: 'active'
  },
  watchlist: {
    type: Boolean,
    default: false
  },
  watchlistReason: String,
  watchlistAddedAt: Date,
  
  // Assessment
  lastAssessment: {
    date: Date,
    assessedBy: String,
    notes: String,
    recommendedActions: [String]
  },
  nextReviewDate: Date,
  
  // Metadata
  tags: [String],
  notes: String
}, {
  timestamps: true
});

// Indexes
userRiskSchema.index({ userId: 1 });
userRiskSchema.index({ email: 1 });
userRiskSchema.index({ department: 1 });
userRiskSchema.index({ riskScore: -1 });
userRiskSchema.index({ riskLevel: 1 });
userRiskSchema.index({ status: 1 });
userRiskSchema.index({ watchlist: 1 });

// Methods
userRiskSchema.methods.calculateRiskScore = function() {
  let score = 0;
  
  // Incident severity weight
  score += this.incidents.bySeverity.critical * 20;
  score += this.incidents.bySeverity.high * 10;
  score += this.incidents.bySeverity.medium * 5;
  score += this.incidents.bySeverity.low * 2;
  
  // Open incidents
  score += this.incidents.open * 5;
  
  // Risk factors
  this.riskFactors.forEach(factor => {
    score += (factor.weight || 10);
  });
  
  // Anomalies
  const unresolvedAnomalies = this.anomalies.filter(a => !a.resolved);
  score += unresolvedAnomalies.length * 3;
  
  // Training compliance
  if (this.training.completionRate < 50) score += 15;
  else if (this.training.completionRate < 80) score += 5;
  
  this.previousRiskScore = this.riskScore;
  this.riskScore = Math.min(score, 100);
  
  // Update risk level
  if (this.riskScore >= 75) this.riskLevel = 'critical';
  else if (this.riskScore >= 50) this.riskLevel = 'high';
  else if (this.riskScore >= 25) this.riskLevel = 'medium';
  else this.riskLevel = 'low';
  
  // Update trend
  if (this.previousRiskScore !== undefined) {
    if (this.riskScore > this.previousRiskScore + 5) this.riskTrend = 'increasing';
    else if (this.riskScore < this.previousRiskScore - 5) this.riskTrend = 'decreasing';
    else this.riskTrend = 'stable';
  }
  
  return this.riskScore;
};

userRiskSchema.methods.addRiskFactor = function(factor, weight, description, severity) {
  this.riskFactors.push({
    factor,
    weight,
    description,
    severity,
    detectedAt: new Date()
  });
  this.calculateRiskScore();
  return this.save();
};

userRiskSchema.methods.addAnomaly = function(type, description, severity) {
  this.anomalies.push({
    type,
    description,
    severity,
    detectedAt: new Date(),
    resolved: false
  });
  this.calculateRiskScore();
  return this.save();
};

userRiskSchema.methods.addIntervention = function(type, reason, performedBy) {
  this.interventions.push({
    type,
    reason,
    performedBy,
    timestamp: new Date()
  });
  return this.save();
};

userRiskSchema.methods.addToWatchlist = function(reason) {
  this.watchlist = true;
  this.watchlistReason = reason;
  this.watchlistAddedAt = new Date();
  this.status = 'monitoring';
  return this.save();
};

userRiskSchema.methods.removeFromWatchlist = function() {
  this.watchlist = false;
  this.watchlistReason = null;
  this.watchlistAddedAt = null;
  this.status = 'active';
  return this.save();
};

// Statics
userRiskSchema.statics.getHighRiskUsers = function(threshold = 70) {
  return this.find({ 
    riskScore: { $gte: threshold },
    status: { $ne: 'terminated' }
  }).sort({ riskScore: -1 });
};

userRiskSchema.statics.getWatchlistUsers = function() {
  return this.find({ watchlist: true });
};

userRiskSchema.statics.getUsersByDepartment = function(department) {
  return this.find({ department, status: 'active' });
};

userRiskSchema.statics.getTopRiskUsers = function(limit = 10) {
  return this.find({ status: { $ne: 'terminated' } })
    .sort({ riskScore: -1 })
    .limit(limit);
};

userRiskSchema.statics.getDepartmentStats = async function(department) {
  return this.aggregate([
    {
      $match: { department, status: 'active' }
    },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        avgRiskScore: { $avg: '$riskScore' },
        highRiskUsers: {
          $sum: { $cond: [{ $gte: ['$riskScore', 70] }, 1, 0] }
        },
        totalIncidents: { $sum: '$incidents.total' }
      }
    }
  ]);
};

module.exports = mongoose.model('UserRisk', userRiskSchema);
