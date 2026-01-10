const mongoose = require('mongoose');

/**
 * SecurityDashboard Model
 * 
 * Manages comprehensive security posture scoring for organizations, departments,
 * systems, and applications with multi-dimensional scoring, trend analysis, and
 * risk assessment.
 */

const securityScoreSchema = new mongoose.Schema({
  // Basic Information
  scoreId: {
    type: String,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Security score name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Entity Information
  entity: {
    type: {
      type: String,
      enum: ['organization', 'department', 'business_unit', 'system', 'application', 'asset', 'vendor', 'third_party', 'project'],
      required: true,
      index: true
    },
    id: {
      type: String,
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    department: String,
    businessUnit: String,
    owner: {
      name: String,
      email: String,
      userId: String
    },
    criticality: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium'
    }
  },

  // Overall Score
  overallScore: {
    value: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      index: true
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'],
      index: true
    },
    percentile: {
      type: Number,
      min: 0,
      max: 100
    },
    trend: {
      direction: {
        type: String,
        enum: ['improving', 'stable', 'declining', 'unknown'],
        default: 'unknown'
      },
      change: {
        type: Number,
        default: 0
      },
      changePercent: {
        type: Number,
        default: 0
      },
      period: {
        type: String,
        enum: ['day', 'week', 'month', 'quarter', 'year'],
        default: 'month'
      }
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },

  // Category Scores (7 categories)
  categories: {
    // Network Security
    network: {
      score: { type: Number, min: 0, max: 100, default: 0 },
      weight: { type: Number, min: 0, max: 1, default: 0.15 },
      metrics: [{
        metricId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScoreMetric' },
        weight: Number,
        score: Number
      }],
      subCategories: {
        perimeter: { type: Number, min: 0, max: 100 },
        internal: { type: Number, min: 0, max: 100 },
        wireless: { type: Number, min: 0, max: 100 },
        segmentation: { type: Number, min: 0, max: 100 }
      },
      trend: { type: String, enum: ['improving', 'stable', 'declining'] },
      lastUpdated: Date
    },

    // Endpoint Security
    endpoint: {
      score: { type: Number, min: 0, max: 100, default: 0 },
      weight: { type: Number, min: 0, max: 1, default: 0.15 },
      metrics: [{
        metricId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScoreMetric' },
        weight: Number,
        score: Number
      }],
      subCategories: {
        antivirus: { type: Number, min: 0, max: 100 },
        edr: { type: Number, min: 0, max: 100 },
        patching: { type: Number, min: 0, max: 100 },
        configuration: { type: Number, min: 0, max: 100 }
      },
      trend: { type: String, enum: ['improving', 'stable', 'declining'] },
      lastUpdated: Date
    },

    // Identity & Access Management
    identity: {
      score: { type: Number, min: 0, max: 100, default: 0 },
      weight: { type: Number, min: 0, max: 1, default: 0.15 },
      metrics: [{
        metricId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScoreMetric' },
        weight: Number,
        score: Number
      }],
      subCategories: {
        authentication: { type: Number, min: 0, max: 100 },
        authorization: { type: Number, min: 0, max: 100 },
        privileged_access: { type: Number, min: 0, max: 100 },
        identity_governance: { type: Number, min: 0, max: 100 }
      },
      trend: { type: String, enum: ['improving', 'stable', 'declining'] },
      lastUpdated: Date
    },

    // Data Protection
    data: {
      score: { type: Number, min: 0, max: 100, default: 0 },
      weight: { type: Number, min: 0, max: 1, default: 0.15 },
      metrics: [{
        metricId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScoreMetric' },
        weight: Number,
        score: Number
      }],
      subCategories: {
        encryption: { type: Number, min: 0, max: 100 },
        dlp: { type: Number, min: 0, max: 100 },
        backup: { type: Number, min: 0, max: 100 },
        classification: { type: Number, min: 0, max: 100 }
      },
      trend: { type: String, enum: ['improving', 'stable', 'declining'] },
      lastUpdated: Date
    },

    // Application Security
    application: {
      score: { type: Number, min: 0, max: 100, default: 0 },
      weight: { type: Number, min: 0, max: 1, default: 0.15 },
      metrics: [{
        metricId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScoreMetric' },
        weight: Number,
        score: Number
      }],
      subCategories: {
        code_security: { type: Number, min: 0, max: 100 },
        vulnerability_management: { type: Number, min: 0, max: 100 },
        secure_development: { type: Number, min: 0, max: 100 },
        api_security: { type: Number, min: 0, max: 100 }
      },
      trend: { type: String, enum: ['improving', 'stable', 'declining'] },
      lastUpdated: Date
    },

    // Cloud Security
    cloud: {
      score: { type: Number, min: 0, max: 100, default: 0 },
      weight: { type: Number, min: 0, max: 1, default: 0.10 },
      metrics: [{
        metricId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScoreMetric' },
        weight: Number,
        score: Number
      }],
      subCategories: {
        configuration: { type: Number, min: 0, max: 100 },
        access_control: { type: Number, min: 0, max: 100 },
        encryption: { type: Number, min: 0, max: 100 },
        monitoring: { type: Number, min: 0, max: 100 }
      },
      trend: { type: String, enum: ['improving', 'stable', 'declining'] },
      lastUpdated: Date
    },

    // Compliance
    compliance: {
      score: { type: Number, min: 0, max: 100, default: 0 },
      weight: { type: Number, min: 0, max: 1, default: 0.15 },
      metrics: [{
        metricId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScoreMetric' },
        weight: Number,
        score: Number
      }],
      subCategories: {
        regulatory: { type: Number, min: 0, max: 100 },
        policy: { type: Number, min: 0, max: 100 },
        audit: { type: Number, min: 0, max: 100 },
        documentation: { type: Number, min: 0, max: 100 }
      },
      frameworks: [{
        name: String,
        compliance: Number,
        gaps: Number
      }],
      trend: { type: String, enum: ['improving', 'stable', 'declining'] },
      lastUpdated: Date
    }
  },

  // Risk Assessment
  risks: {
    summary: {
      critical: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
    topRisks: [{
      riskId: String,
      title: String,
      severity: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
      category: String,
      impact: Number,
      likelihood: Number,
      score: Number
    }],
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    exposureScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },

  // Vulnerabilities
  vulnerabilities: {
    summary: {
      critical: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
      info: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
    cvssAverage: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    exploitable: {
      type: Number,
      default: 0
    },
    patchable: {
      type: Number,
      default: 0
    },
    averageAge: {
      type: Number,
      default: 0
    }
  },

  // Improvements and Recommendations
  improvements: [{
    improvementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Improvement' },
    priority: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
    status: { type: String, enum: ['identified', 'planned', 'in_progress', 'completed', 'deferred'] },
    estimatedImpact: Number,
    effort: String,
    dueDate: Date
  }],

  // Benchmarking
  benchmarks: [{
    benchmarkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Benchmark' },
    type: { type: String, enum: ['industry', 'peer', 'regulatory', 'internal'] },
    name: String,
    score: Number,
    percentile: Number,
    difference: Number
  }],

  // Historical Data
  history: [{
    date: { type: Date, default: Date.now, index: true },
    score: Number,
    grade: String,
    categories: {
      network: Number,
      endpoint: Number,
      identity: Number,
      data: Number,
      application: Number,
      cloud: Number,
      compliance: Number
    },
    risks: {
      critical: Number,
      high: Number,
      medium: Number,
      low: Number
    },
    vulnerabilities: {
      critical: Number,
      high: Number,
      medium: Number,
      low: Number
    }
  }],

  // Calculation Settings
  calculation: {
    method: {
      type: String,
      enum: ['weighted_average', 'weighted_sum', 'custom', 'ai_driven'],
      default: 'weighted_average'
    },
    formula: String,
    lastCalculated: {
      type: Date,
      default: Date.now
    },
    nextCalculation: Date,
    schedule: {
      enabled: { type: Boolean, default: true },
      frequency: {
        type: String,
        enum: ['hourly', 'daily', 'weekly', 'monthly', 'on_demand'],
        default: 'daily'
      },
      time: String,
      timezone: { type: String, default: 'UTC' }
    },
    autoUpdate: {
      type: Boolean,
      default: true
    }
  },

  // Assessments
  assessments: [{
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
    type: String,
    date: Date,
    score: Number,
    findings: Number
  }],

  // Alerts and Notifications
  alerts: {
    enabled: { type: Boolean, default: true },
    thresholds: {
      scoreDecrease: { type: Number, default: 5 },
      gradeChange: { type: Boolean, default: true },
      criticalRisks: { type: Number, default: 1 }
    },
    channels: [{
      type: { type: String, enum: ['email', 'slack', 'webhook', 'sms', 'pagerduty'] },
      destination: String,
      enabled: { type: Boolean, default: true }
    }],
    history: [{
      date: Date,
      type: String,
      message: String,
      acknowledged: Boolean,
      acknowledgedBy: String,
      acknowledgedDate: Date
    }]
  },

  // Integration Data
  integrations: {
    sources: [{
      name: String,
      type: String,
      lastSync: Date,
      status: { type: String, enum: ['active', 'inactive', 'error'] },
      metricsCollected: Number
    }],
    externalRatings: [{
      provider: String,
      rating: String,
      score: Number,
      date: Date,
      url: String
    }]
  },

  // Metadata
  metadata: {
    createdBy: {
      userId: String,
      name: String,
      email: String
    },
    lastModifiedBy: {
      userId: String,
      name: String,
      email: String
    },
    version: {
      type: Number,
      default: 1
    },
    tags: [String],
    customFields: mongoose.Schema.Types.Mixed,
    notes: String,
    framework: String,
    industry: String,
    size: { type: String, enum: ['small', 'medium', 'large', 'enterprise'] }
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived', 'draft'],
    default: 'active',
    index: true
  }
}, {
  timestamps: true,
  collection: 'securitydashboards'
});

// Indexes
securityScoreSchema.index({ scoreId: 1 });
securityScoreSchema.index({ 'entity.type': 1, 'entity.id': 1 });
securityScoreSchema.index({ 'overallScore.value': -1 });
securityScoreSchema.index({ 'overallScore.grade': 1 });
securityScoreSchema.index({ status: 1 });
securityScoreSchema.index({ 'calculation.lastCalculated': 1 });
securityScoreSchema.index({ 'metadata.industry': 1 });

// Generate scoreId
securityScoreSchema.pre('save', function(next) {
  if (!this.scoreId) {
    this.scoreId = 'SCORE-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

// Calculate grade from score
securityScoreSchema.pre('save', function(next) {
  const score = this.overallScore.value;
  
  if (score >= 97) this.overallScore.grade = 'A+';
  else if (score >= 93) this.overallScore.grade = 'A';
  else if (score >= 90) this.overallScore.grade = 'A-';
  else if (score >= 87) this.overallScore.grade = 'B+';
  else if (score >= 83) this.overallScore.grade = 'B';
  else if (score >= 80) this.overallScore.grade = 'B-';
  else if (score >= 77) this.overallScore.grade = 'C+';
  else if (score >= 73) this.overallScore.grade = 'C';
  else if (score >= 70) this.overallScore.grade = 'C-';
  else if (score >= 67) this.overallScore.grade = 'D+';
  else if (score >= 63) this.overallScore.grade = 'D';
  else if (score >= 60) this.overallScore.grade = 'D-';
  else this.overallScore.grade = 'F';
  
  next();
});

// Instance Methods

/**
 * Calculate overall score from categories
 */
securityScoreSchema.methods.calculateOverallScore = function() {
  const categories = this.categories;
  let totalScore = 0;
  let totalWeight = 0;

  for (const [key, category] of Object.entries(categories)) {
    if (category && typeof category.score === 'number' && typeof category.weight === 'number') {
      totalScore += category.score * category.weight;
      totalWeight += category.weight;
    }
  }

  this.overallScore.value = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  return this.overallScore.value;
};

/**
 * Add history entry
 */
securityScoreSchema.methods.addHistoryEntry = function() {
  this.history.push({
    date: new Date(),
    score: this.overallScore.value,
    grade: this.overallScore.grade,
    categories: {
      network: this.categories.network.score,
      endpoint: this.categories.endpoint.score,
      identity: this.categories.identity.score,
      data: this.categories.data.score,
      application: this.categories.application.score,
      cloud: this.categories.cloud.score,
      compliance: this.categories.compliance.score
    },
    risks: {
      critical: this.risks.summary.critical,
      high: this.risks.summary.high,
      medium: this.risks.summary.medium,
      low: this.risks.summary.low
    },
    vulnerabilities: {
      critical: this.vulnerabilities.summary.critical,
      high: this.vulnerabilities.summary.high,
      medium: this.vulnerabilities.summary.medium,
      low: this.vulnerabilities.summary.low
    }
  });

  // Keep only last 365 days
  if (this.history.length > 365) {
    this.history = this.history.slice(-365);
  }
};

/**
 * Calculate trend
 */
securityScoreSchema.methods.calculateTrend = function(period = 'month') {
  if (this.history.length < 2) {
    this.overallScore.trend.direction = 'unknown';
    return;
  }

  const now = new Date();
  let periodMs;
  
  switch(period) {
    case 'day': periodMs = 24 * 60 * 60 * 1000; break;
    case 'week': periodMs = 7 * 24 * 60 * 60 * 1000; break;
    case 'month': periodMs = 30 * 24 * 60 * 60 * 1000; break;
    case 'quarter': periodMs = 90 * 24 * 60 * 60 * 1000; break;
    case 'year': periodMs = 365 * 24 * 60 * 60 * 1000; break;
    default: periodMs = 30 * 24 * 60 * 60 * 1000;
  }

  const periodStart = new Date(now - periodMs);
  const historicalEntry = this.history.find(h => h.date <= periodStart);

  if (!historicalEntry) {
    this.overallScore.trend.direction = 'unknown';
    return;
  }

  const oldScore = historicalEntry.score;
  const currentScore = this.overallScore.value;
  const change = currentScore - oldScore;
  const changePercent = oldScore > 0 ? ((change / oldScore) * 100) : 0;

  this.overallScore.trend.change = Math.round(change * 10) / 10;
  this.overallScore.trend.changePercent = Math.round(changePercent * 10) / 10;
  this.overallScore.trend.period = period;

  if (change > 2) this.overallScore.trend.direction = 'improving';
  else if (change < -2) this.overallScore.trend.direction = 'declining';
  else this.overallScore.trend.direction = 'stable';
};

// Static Methods

/**
 * Find by entity
 */
securityScoreSchema.statics.findByEntity = function(entityType, entityId) {
  return this.findOne({ 'entity.type': entityType, 'entity.id': entityId, status: 'active' });
};

/**
 * Find top performers
 */
securityScoreSchema.statics.findTopPerformers = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ 'overallScore.value': -1 })
    .limit(limit)
    .populate('improvements.improvementId')
    .exec();
};

/**
 * Find low performers
 */
securityScoreSchema.statics.findLowPerformers = function(threshold = 60) {
  return this.find({ 
    'overallScore.value': { $lt: threshold },
    status: 'active'
  })
    .sort({ 'overallScore.value': 1 })
    .populate('improvements.improvementId')
    .exec();
};

/**
 * Get statistics
 */
securityScoreSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        averageScore: { $avg: '$overallScore.value' },
        highestScore: { $max: '$overallScore.value' },
        lowestScore: { $min: '$overallScore.value' },
        criticalRisks: { $sum: '$risks.summary.critical' },
        highRisks: { $sum: '$risks.summary.high' },
        criticalVulns: { $sum: '$vulnerabilities.summary.critical' },
        highVulns: { $sum: '$vulnerabilities.summary.high' }
      }
    }
  ]);

  return stats[0] || {};
};

module.exports = mongoose.model('SecurityDashboard', securityScoreSchema);
