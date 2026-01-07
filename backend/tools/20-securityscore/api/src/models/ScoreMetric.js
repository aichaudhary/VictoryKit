const mongoose = require('mongoose');

/**
 * ScoreMetric Model
 * 
 * Manages individual security metrics that contribute to security scores.
 * Tracks metric values, thresholds, trends, and data collection methods.
 */

const scoreMetricSchema = new mongoose.Schema({
  // Basic Information
  metricId: {
    type: String,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Metric name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  shortName: {
    type: String,
    trim: true,
    maxlength: [50, 'Short name cannot exceed 50 characters']
  },

  // Category Classification
  category: {
    type: String,
    enum: ['network', 'endpoint', 'identity', 'data', 'application', 'cloud', 'compliance'],
    required: true,
    index: true
  },
  subCategory: {
    type: String,
    index: true
  },

  // Metric Type and Measurement
  type: {
    type: String,
    enum: ['percentage', 'count', 'ratio', 'boolean', 'time', 'score', 'currency', 'custom'],
    default: 'percentage',
    required: true
  },
  unit: {
    type: String,
    default: '%'
  },

  // Data Source
  source: {
    type: {
      type: String,
      enum: ['manual', 'automated', 'api', 'agent', 'integration', 'calculated'],
      required: true
    },
    system: String,
    integration: String,
    endpoint: String,
    method: String,
    query: String,
    lastCollected: Date,
    nextCollection: Date,
    collectionStatus: {
      type: String,
      enum: ['success', 'pending', 'failed', 'disabled'],
      default: 'pending'
    },
    errors: [{
      date: Date,
      message: String,
      code: String
    }]
  },

  // Current Value and Target
  value: {
    current: {
      type: Number,
      default: 0
    },
    target: {
      type: Number,
      default: 100
    },
    baseline: Number,
    previous: Number,
    change: Number,
    changePercent: Number
  },

  // Thresholds for Scoring
  thresholds: {
    excellent: {
      type: Number,
      default: 95
    },
    good: {
      type: Number,
      default: 80
    },
    fair: {
      type: Number,
      default: 60
    },
    poor: {
      type: Number,
      default: 40
    },
    critical: {
      type: Number,
      default: 20
    },
    direction: {
      type: String,
      enum: ['higher_is_better', 'lower_is_better'],
      default: 'higher_is_better'
    }
  },

  // Calculated Score
  score: {
    value: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    status: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'critical', 'unknown'],
      default: 'unknown'
    },
    color: {
      type: String,
      enum: ['green', 'yellow', 'orange', 'red', 'gray'],
      default: 'gray'
    },
    lastCalculated: Date
  },

  // Weighting
  weight: {
    categoryWeight: {
      type: Number,
      min: 0,
      max: 1,
      default: 1
    },
    globalWeight: {
      type: Number,
      min: 0,
      max: 1,
      default: 1
    },
    adjustmentFactor: {
      type: Number,
      min: 0,
      max: 2,
      default: 1
    }
  },

  // Trend Analysis
  trend: {
    direction: {
      type: String,
      enum: ['improving', 'stable', 'declining', 'unknown'],
      default: 'unknown'
    },
    change: Number,
    changePercent: Number,
    period: {
      type: String,
      enum: ['hour', 'day', 'week', 'month', 'quarter', 'year'],
      default: 'month'
    },
    velocity: Number,
    forecast: {
      nextValue: Number,
      confidence: Number,
      date: Date
    }
  },

  // Historical Data
  history: [{
    date: {
      type: Date,
      default: Date.now,
      index: true
    },
    value: Number,
    score: Number,
    source: String,
    collectionMethod: String
  }],

  // Data Collection Schedule
  schedule: {
    enabled: {
      type: Boolean,
      default: true
    },
    frequency: {
      type: String,
      enum: ['real_time', 'hourly', 'daily', 'weekly', 'monthly', 'on_demand'],
      default: 'daily'
    },
    time: String,
    timezone: {
      type: String,
      default: 'UTC'
    },
    cronExpression: String,
    lastRun: Date,
    nextRun: Date
  },

  // Alerts
  alerts: {
    enabled: {
      type: Boolean,
      default: false
    },
    conditions: [{
      type: {
        type: String,
        enum: ['threshold_breach', 'value_change', 'collection_failure', 'trend_change']
      },
      operator: {
        type: String,
        enum: ['greater_than', 'less_than', 'equals', 'not_equals', 'change_by']
      },
      value: Number,
      severity: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low', 'info']
      },
      notificationChannels: [String]
    }],
    history: [{
      date: Date,
      condition: String,
      value: Number,
      severity: String,
      acknowledged: Boolean
    }]
  },

  // Compliance Mapping
  compliance: {
    frameworks: [{
      name: {
        type: String,
        enum: ['PCI-DSS', 'HIPAA', 'SOC2', 'ISO27001', 'NIST-CSF', 'NIST-800-53', 'CIS', 'GDPR', 'CCPA', 'FedRAMP', 'CMMC']
      },
      controls: [String],
      requirement: String,
      importance: {
        type: String,
        enum: ['required', 'recommended', 'optional']
      }
    }],
    evidenceRequired: Boolean,
    evidence: [{
      date: Date,
      type: String,
      description: String,
      url: String
    }]
  },

  // Related Entities
  relatedEntities: {
    securityScores: [{
      scoreId: { type: mongoose.Schema.Types.ObjectId, ref: 'SecurityScore' },
      weight: Number
    }],
    controls: [{
      controlId: { type: mongoose.Schema.Types.ObjectId, ref: 'Control' },
      relationship: String
    }],
    assessments: [{
      assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
      result: String
    }]
  },

  // Calculation Formula
  calculation: {
    method: {
      type: String,
      enum: ['direct', 'formula', 'aggregation', 'custom', 'ai_prediction'],
      default: 'direct'
    },
    formula: String,
    dependencies: [{
      metricId: String,
      weight: Number
    }],
    parameters: mongoose.Schema.Types.Mixed
  },

  // Validation Rules
  validation: {
    rules: [{
      type: {
        type: String,
        enum: ['range', 'format', 'required', 'custom']
      },
      parameters: mongoose.Schema.Types.Mixed,
      errorMessage: String
    }],
    lastValidation: Date,
    isValid: {
      type: Boolean,
      default: true
    },
    validationErrors: [String]
  },

  // Benchmarking
  benchmarks: [{
    type: {
      type: String,
      enum: ['industry', 'peer', 'internal', 'best_practice']
    },
    value: Number,
    percentile: Number,
    source: String,
    date: Date
  }],

  // Recommendations
  recommendations: [{
    title: String,
    description: String,
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low']
    },
    estimatedImpact: Number,
    effort: {
      type: String,
      enum: ['low', 'medium', 'high', 'very_high']
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed', 'dismissed']
    },
    dueDate: Date
  }],

  // Metadata
  metadata: {
    category_display: String,
    icon: String,
    color: String,
    displayOrder: Number,
    isVisible: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    owner: {
      name: String,
      email: String,
      userId: String
    },
    tags: [String],
    customFields: mongoose.Schema.Types.Mixed,
    documentation: {
      description: String,
      howToImprove: String,
      references: [String],
      bestPractices: [String]
    },
    notes: String
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'deprecated', 'testing'],
    default: 'active',
    index: true
  }
}, {
  timestamps: true,
  collection: 'scoremetrics'
});

// Indexes
scoreMetricSchema.index({ metricId: 1 });
scoreMetricSchema.index({ category: 1, subCategory: 1 });
scoreMetricSchema.index({ 'score.status': 1 });
scoreMetricSchema.index({ 'source.lastCollected': 1 });
scoreMetricSchema.index({ status: 1 });

// Generate metricId
scoreMetricSchema.pre('save', function(next) {
  if (!this.metricId) {
    this.metricId = 'MTR-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

// Calculate score before save
scoreMetricSchema.pre('save', function(next) {
  this.calculateScore();
  next();
});

// Instance Methods

/**
 * Calculate score from value and thresholds
 */
scoreMetricSchema.methods.calculateScore = function() {
  const current = this.value.current;
  const { excellent, good, fair, poor, critical, direction } = this.thresholds;
  
  let score = 0;
  let status = 'unknown';
  let color = 'gray';

  if (direction === 'higher_is_better') {
    if (current >= excellent) {
      score = 100;
      status = 'excellent';
      color = 'green';
    } else if (current >= good) {
      score = 80 + ((current - good) / (excellent - good)) * 20;
      status = 'good';
      color = 'green';
    } else if (current >= fair) {
      score = 60 + ((current - fair) / (good - fair)) * 20;
      status = 'fair';
      color = 'yellow';
    } else if (current >= poor) {
      score = 40 + ((current - poor) / (fair - poor)) * 20;
      status = 'poor';
      color = 'orange';
    } else if (current >= critical) {
      score = 20 + ((current - critical) / (poor - critical)) * 20;
      status = 'critical';
      color = 'red';
    } else {
      score = (current / critical) * 20;
      status = 'critical';
      color = 'red';
    }
  } else { // lower_is_better
    if (current <= excellent) {
      score = 100;
      status = 'excellent';
      color = 'green';
    } else if (current <= good) {
      score = 80 + ((good - current) / (good - excellent)) * 20;
      status = 'good';
      color = 'green';
    } else if (current <= fair) {
      score = 60 + ((fair - current) / (fair - good)) * 20;
      status = 'fair';
      color = 'yellow';
    } else if (current <= poor) {
      score = 40 + ((poor - current) / (poor - fair)) * 20;
      status = 'poor';
      color = 'orange';
    } else if (current <= critical) {
      score = 20 + ((critical - current) / (critical - poor)) * 20;
      status = 'critical';
      color = 'red';
    } else {
      score = Math.max(0, 20 - ((current - critical) / critical) * 20);
      status = 'critical';
      color = 'red';
    }
  }

  this.score.value = Math.round(score);
  this.score.status = status;
  this.score.color = color;
  this.score.lastCalculated = new Date();

  return this.score.value;
};

/**
 * Add history entry
 */
scoreMetricSchema.methods.addHistoryEntry = function(value, source = 'system') {
  this.history.push({
    date: new Date(),
    value: value || this.value.current,
    score: this.score.value,
    source: source,
    collectionMethod: this.source.type
  });

  // Keep only last 365 entries
  if (this.history.length > 365) {
    this.history = this.history.slice(-365);
  }
};

/**
 * Calculate trend
 */
scoreMetricSchema.methods.calculateTrend = function(period = 'month') {
  if (this.history.length < 2) {
    this.trend.direction = 'unknown';
    return;
  }

  const now = new Date();
  let periodMs;
  
  switch(period) {
    case 'hour': periodMs = 60 * 60 * 1000; break;
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
    this.trend.direction = 'unknown';
    return;
  }

  const oldValue = historicalEntry.value;
  const currentValue = this.value.current;
  const change = currentValue - oldValue;
  const changePercent = oldValue !== 0 ? ((change / oldValue) * 100) : 0;

  this.trend.change = Math.round(change * 100) / 100;
  this.trend.changePercent = Math.round(changePercent * 10) / 10;
  this.trend.period = period;

  // Determine direction based on threshold direction
  if (this.thresholds.direction === 'higher_is_better') {
    if (change > 2) this.trend.direction = 'improving';
    else if (change < -2) this.trend.direction = 'declining';
    else this.trend.direction = 'stable';
  } else {
    if (change < -2) this.trend.direction = 'improving';
    else if (change > 2) this.trend.direction = 'declining';
    else this.trend.direction = 'stable';
  }

  // Calculate velocity (rate of change)
  this.trend.velocity = change / (periodMs / (24 * 60 * 60 * 1000)); // per day
};

/**
 * Update value
 */
scoreMetricSchema.methods.updateValue = function(newValue, source = 'system') {
  this.value.previous = this.value.current;
  this.value.current = newValue;
  this.value.change = newValue - this.value.previous;
  this.value.changePercent = this.value.previous !== 0 ? ((this.value.change / this.value.previous) * 100) : 0;
  
  this.source.lastCollected = new Date();
  this.source.collectionStatus = 'success';
  
  this.calculateScore();
  this.addHistoryEntry(newValue, source);
  this.calculateTrend();
};

// Static Methods

/**
 * Find by category
 */
scoreMetricSchema.statics.findByCategory = function(category) {
  return this.find({ category, status: 'active' })
    .sort({ 'metadata.displayOrder': 1 })
    .exec();
};

/**
 * Find critical metrics
 */
scoreMetricSchema.statics.findCritical = function() {
  return this.find({ 
    'score.status': 'critical',
    status: 'active'
  })
    .sort({ 'score.value': 1 })
    .exec();
};

/**
 * Find by compliance framework
 */
scoreMetricSchema.statics.findByFramework = function(framework) {
  return this.find({
    'compliance.frameworks.name': framework,
    status: 'active'
  })
    .sort({ 'weight.globalWeight': -1 })
    .exec();
};

/**
 * Get statistics
 */
scoreMetricSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        averageScore: { $avg: '$score.value' },
        excellentCount: {
          $sum: { $cond: [{ $eq: ['$score.status', 'excellent'] }, 1, 0] }
        },
        goodCount: {
          $sum: { $cond: [{ $eq: ['$score.status', 'good'] }, 1, 0] }
        },
        fairCount: {
          $sum: { $cond: [{ $eq: ['$score.status', 'fair'] }, 1, 0] }
        },
        poorCount: {
          $sum: { $cond: [{ $eq: ['$score.status', 'poor'] }, 1, 0] }
        },
        criticalCount: {
          $sum: { $cond: [{ $eq: ['$score.status', 'critical'] }, 1, 0] }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return stats;
};

module.exports = mongoose.model('ScoreMetric', scoreMetricSchema);
