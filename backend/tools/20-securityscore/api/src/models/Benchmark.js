const mongoose = require('mongoose');

/**
 * Benchmark Model
 * 
 * Manages security score benchmarks for industry comparisons,
 * peer analysis, and best practice standards.
 */

const benchmarkSchema = new mongoose.Schema({
  // Basic Information
  benchmarkId: {
    type: String,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Benchmark name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },

  // Benchmark Type and Classification
  type: {
    type: String,
    enum: ['industry', 'peer', 'regulatory', 'internal', 'best_practice', 'custom', 'geographic', 'maturity_level'],
    required: true,
    index: true
  },
  classification: {
    type: String,
    enum: ['public', 'private', 'proprietary', 'research'],
    default: 'public'
  },

  // Industry and Organization Details
  industry: {
    primary: {
      type: String,
      enum: ['finance', 'healthcare', 'technology', 'retail', 'manufacturing', 'government', 'education', 'energy', 'telecommunications', 'transportation', 'insurance', 'legal', 'media', 'hospitality', 'general'],
      index: true
    },
    subIndustry: String,
    sicCode: String,
    naicsCode: String
  },

  // Organization Size Criteria
  size: {
    classification: {
      type: String,
      enum: ['micro', 'small', 'medium', 'large', 'enterprise', 'global'],
      index: true
    },
    employeeRange: {
      min: Number,
      max: Number
    },
    revenueRange: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'USD' }
    },
    assetRange: {
      min: Number,
      max: Number
    }
  },

  // Geographic Scope
  geographic: {
    scope: {
      type: String,
      enum: ['global', 'regional', 'national', 'local']
    },
    regions: [String],
    countries: [String],
    states: [String]
  },

  // Security Maturity Level
  maturityLevel: {
    type: String,
    enum: ['initial', 'developing', 'defined', 'managed', 'optimizing'],
    index: true
  },

  // Score Benchmarks
  scores: {
    overall: {
      mean: { type: Number, min: 0, max: 100 },
      median: { type: Number, min: 0, max: 100 },
      mode: { type: Number, min: 0, max: 100 },
      standardDeviation: Number,
      min: { type: Number, min: 0, max: 100 },
      max: { type: Number, min: 0, max: 100 }
    },
    
    // Category Scores
    network: {
      mean: { type: Number, min: 0, max: 100 },
      median: { type: Number, min: 0, max: 100 },
      percentile25: Number,
      percentile75: Number,
      percentile90: Number,
      percentile95: Number,
      percentile99: Number
    },
    
    endpoint: {
      mean: { type: Number, min: 0, max: 100 },
      median: { type: Number, min: 0, max: 100 },
      percentile25: Number,
      percentile75: Number,
      percentile90: Number,
      percentile95: Number,
      percentile99: Number
    },
    
    identity: {
      mean: { type: Number, min: 0, max: 100 },
      median: { type: Number, min: 0, max: 100 },
      percentile25: Number,
      percentile75: Number,
      percentile90: Number,
      percentile95: Number,
      percentile99: Number
    },
    
    data: {
      mean: { type: Number, min: 0, max: 100 },
      median: { type: Number, min: 0, max: 100 },
      percentile25: Number,
      percentile75: Number,
      percentile90: Number,
      percentile95: Number,
      percentile99: Number
    },
    
    application: {
      mean: { type: Number, min: 0, max: 100 },
      median: { type: Number, min: 0, max: 100 },
      percentile25: Number,
      percentile75: Number,
      percentile90: Number,
      percentile95: Number,
      percentile99: Number
    },
    
    cloud: {
      mean: { type: Number, min: 0, max: 100 },
      median: { type: Number, min: 0, max: 100 },
      percentile25: Number,
      percentile75: Number,
      percentile90: Number,
      percentile95: Number,
      percentile99: Number
    },
    
    compliance: {
      mean: { type: Number, min: 0, max: 100 },
      median: { type: Number, min: 0, max: 100 },
      percentile25: Number,
      percentile75: Number,
      percentile90: Number,
      percentile95: Number,
      percentile99: Number
    }
  },

  // Percentile Distribution
  percentiles: {
    p10: { type: Number, min: 0, max: 100 },
    p25: { type: Number, min: 0, max: 100 },
    p50: { type: Number, min: 0, max: 100 },
    p75: { type: Number, min: 0, max: 100 },
    p90: { type: Number, min: 0, max: 100 },
    p95: { type: Number, min: 0, max: 100 },
    p99: { type: Number, min: 0, max: 100 }
  },

  // Grade Distribution
  gradeDistribution: {
    aPlus: { percentage: Number, count: Number },
    a: { percentage: Number, count: Number },
    aMinus: { percentage: Number, count: Number },
    bPlus: { percentage: Number, count: Number },
    b: { percentage: Number, count: Number },
    bMinus: { percentage: Number, count: Number },
    cPlus: { percentage: Number, count: Number },
    c: { percentage: Number, count: Number },
    cMinus: { percentage: Number, count: Number },
    d: { percentage: Number, count: Number },
    f: { percentage: Number, count: Number }
  },

  // Risk Benchmarks
  risks: {
    averageCritical: Number,
    averageHigh: Number,
    averageMedium: Number,
    averageLow: Number,
    averageTotal: Number,
    percentileDistribution: {
      p25: Number,
      p50: Number,
      p75: Number,
      p90: Number
    }
  },

  // Vulnerability Benchmarks
  vulnerabilities: {
    averageCritical: Number,
    averageHigh: Number,
    averageMedium: Number,
    averageLow: Number,
    averageTotal: Number,
    averageAgeInDays: Number,
    averagePatchTime: Number,
    percentileDistribution: {
      p25: Number,
      p50: Number,
      p75: Number,
      p90: Number
    }
  },

  // Key Metrics Benchmarks
  metrics: [{
    metricName: String,
    metricId: String,
    category: String,
    mean: Number,
    median: Number,
    percentile25: Number,
    percentile75: Number,
    percentile90: Number,
    bestPractice: Number,
    unit: String
  }],

  // Sample Data
  sample: {
    size: {
      type: Number,
      required: true,
      min: [1, 'Sample size must be at least 1']
    },
    organizations: Number,
    dataPoints: Number,
    collectionMethod: {
      type: String,
      enum: ['survey', 'assessment', 'automated', 'aggregated', 'research']
    },
    demographics: {
      industryBreakdown: mongoose.Schema.Types.Mixed,
      sizeBreakdown: mongoose.Schema.Types.Mixed,
      geographicBreakdown: mongoose.Schema.Types.Mixed
    }
  },

  // Validity Period
  validity: {
    from: {
      type: Date,
      required: true,
      index: true
    },
    to: {
      type: Date,
      required: true,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    dataCollectionPeriod: {
      start: Date,
      end: Date
    }
  },

  // Data Source
  source: {
    provider: {
      type: String,
      required: true
    },
    organization: String,
    url: String,
    contactEmail: String,
    methodology: String,
    dataQuality: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    updateFrequency: {
      type: String,
      enum: ['real_time', 'daily', 'weekly', 'monthly', 'quarterly', 'annually']
    },
    nextUpdate: Date
  },

  // Compliance Framework Mapping
  frameworks: [{
    name: {
      type: String,
      enum: ['PCI-DSS', 'HIPAA', 'SOC2', 'ISO27001', 'NIST-CSF', 'NIST-800-53', 'CIS', 'GDPR', 'CCPA', 'FedRAMP']
    },
    version: String,
    averageCompliance: Number,
    controlsBenchmark: [{
      controlId: String,
      averageScore: Number,
      percentile90: Number
    }]
  }],

  // Trend Data
  trends: {
    historicalData: [{
      period: String,
      date: Date,
      overallScore: Number,
      change: Number,
      changePercent: Number
    }],
    forecast: [{
      period: String,
      date: Date,
      predictedScore: Number,
      confidence: Number
    }],
    seasonality: {
      hasPattern: Boolean,
      pattern: String,
      description: String
    }
  },

  // Comparison Groups
  comparisonGroups: [{
    name: String,
    description: String,
    criteria: mongoose.Schema.Types.Mixed,
    averageScore: Number,
    sampleSize: Number
  }],

  // Statistical Significance
  statistics: {
    confidenceLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 95
    },
    marginOfError: Number,
    pValue: Number,
    isSignificant: Boolean,
    sampleAdequacy: {
      type: String,
      enum: ['adequate', 'limited', 'insufficient']
    }
  },

  // Usage Analytics
  usage: {
    views: { type: Number, default: 0 },
    comparisons: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    lastAccessed: Date,
    topUsers: [{
      userId: String,
      name: String,
      accessCount: Number
    }]
  },

  // Access Control
  access: {
    visibility: {
      type: String,
      enum: ['public', 'restricted', 'private'],
      default: 'public'
    },
    allowedOrganizations: [String],
    allowedUsers: [String],
    requiresAuthentication: {
      type: Boolean,
      default: false
    }
  },

  // Quality Metrics
  quality: {
    completeness: {
      type: Number,
      min: 0,
      max: 100
    },
    accuracy: {
      type: Number,
      min: 0,
      max: 100
    },
    reliability: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    validatedBy: String,
    validationDate: Date,
    issues: [{
      type: String,
      description: String,
      severity: String,
      resolved: Boolean
    }]
  },

  // Metadata
  metadata: {
    createdBy: {
      name: String,
      email: String,
      organization: String
    },
    lastModifiedBy: {
      name: String,
      email: String
    },
    version: {
      type: Number,
      default: 1
    },
    tags: [String],
    keywords: [String],
    customFields: mongoose.Schema.Types.Mixed,
    notes: String,
    references: [{
      title: String,
      url: String,
      type: String
    }],
    certifications: [String]
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'deprecated', 'draft', 'under_review'],
    default: 'draft',
    index: true
  }
}, {
  timestamps: true,
  collection: 'benchmarks'
});

// Indexes
benchmarkSchema.index({ benchmarkId: 1 });
benchmarkSchema.index({ type: 1, 'industry.primary': 1, 'size.classification': 1 });
benchmarkSchema.index({ 'validity.from': 1, 'validity.to': 1 });
benchmarkSchema.index({ 'validity.isActive': 1, status: 1 });
benchmarkSchema.index({ 'source.provider': 1 });

// Generate benchmarkId
benchmarkSchema.pre('save', function(next) {
  if (!this.benchmarkId) {
    this.benchmarkId = 'BENCH-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  
  // Update isActive based on validity dates
  const now = new Date();
  this.validity.isActive = (now >= this.validity.from && now <= this.validity.to);
  
  next();
});

// Instance Methods

/**
 * Get percentile for a score
 */
benchmarkSchema.methods.getPercentile = function(score, category = 'overall') {
  const categoryScores = category === 'overall' ? this.scores.overall : this.scores[category];
  
  if (!categoryScores) return null;

  const percentiles = [
    { value: this.percentiles.p99, percentile: 99 },
    { value: this.percentiles.p95, percentile: 95 },
    { value: this.percentiles.p90, percentile: 90 },
    { value: this.percentiles.p75, percentile: 75 },
    { value: this.percentiles.p50, percentile: 50 },
    { value: this.percentiles.p25, percentile: 25 },
    { value: this.percentiles.p10, percentile: 10 }
  ];

  for (const p of percentiles) {
    if (score >= p.value) {
      return p.percentile;
    }
  }

  return 0;
};

/**
 * Compare score to benchmark
 */
benchmarkSchema.methods.compareScore = function(score, category = 'overall') {
  const categoryScores = category === 'overall' ? this.scores.overall : this.scores[category];
  
  if (!categoryScores) return null;

  const mean = categoryScores.mean;
  const median = categoryScores.median;
  
  return {
    score: score,
    mean: mean,
    median: median,
    differenceFromMean: score - mean,
    differenceFromMedian: score - median,
    percentile: this.getPercentile(score, category),
    status: score >= mean ? 'above_average' : 'below_average'
  };
};

/**
 * Check if benchmark is current
 */
benchmarkSchema.methods.isCurrent = function() {
  const now = new Date();
  return this.validity.isActive && 
         now >= this.validity.from && 
         now <= this.validity.to &&
         this.status === 'active';
};

// Static Methods

/**
 * Find active benchmarks
 */
benchmarkSchema.statics.findActive = function(type, industry, size) {
  const query = {
    'validity.isActive': true,
    status: 'active',
    'validity.to': { $gte: new Date() }
  };

  if (type) query.type = type;
  if (industry) query['industry.primary'] = industry;
  if (size) query['size.classification'] = size;

  return this.find(query)
    .sort({ 'source.lastUpdated': -1 })
    .exec();
};

/**
 * Find by criteria
 */
benchmarkSchema.statics.findByCriteria = function(industry, size, type = 'industry') {
  return this.findOne({
    type: type,
    'industry.primary': industry,
    'size.classification': size,
    'validity.isActive': true,
    status: 'active'
  })
    .sort({ 'source.lastUpdated': -1 })
    .exec();
};

/**
 * Get best practice benchmark
 */
benchmarkSchema.statics.getBestPractice = function(category) {
  return this.findOne({
    type: 'best_practice',
    'validity.isActive': true,
    status: 'active'
  })
    .sort({ 'source.lastUpdated': -1 })
    .exec();
};

/**
 * Get statistics
 */
benchmarkSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        averageScore: { $avg: '$scores.overall.mean' },
        totalSampleSize: { $sum: '$sample.size' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return stats;
};

module.exports = mongoose.model('Benchmark', benchmarkSchema);
