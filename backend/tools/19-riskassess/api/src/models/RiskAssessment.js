const mongoose = require('mongoose');

const riskAssessmentSchema = new mongoose.Schema({
  assessmentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  
  // Assessment Type & Scope
  type: {
    type: String,
    enum: [
      'quantitative',          // Numerical risk calculation
      'qualitative',           // Descriptive risk assessment
      'semi_quantitative',     // Mix of both
      'enterprise',            // Organization-wide
      'project',               // Project-specific
      'system',                // System/application
      'vendor',                // Third-party risk
      'cyber',                 // Cybersecurity focused
      'operational',           // Operations risk
      'strategic'              // Strategic risk
    ],
    required: true
  },
  
  methodology: {
    framework: {
      type: String,
      enum: [
        'NIST-RMF',            // NIST Risk Management Framework
        'ISO-31000',           // ISO 31000
        'FAIR',                // Factor Analysis of Information Risk
        'OCTAVE',              // Operationally Critical Threat Asset and Vulnerability Evaluation
        'COSO-ERM',            // Enterprise Risk Management
        'COBIT',               // Control Objectives for IT
        'STRIDE',              // Threat modeling
        'DREAD',               // Risk rating
        'CVSS',                // Common Vulnerability Scoring
        'Custom'
      ],
      required: true
    },
    version: String,
    approach: {
      type: String,
      enum: ['top_down', 'bottom_up', 'hybrid', 'scenario_based', 'asset_based', 'threat_based']
    },
    calculationMethod: {
      type: String,
      enum: ['likelihood_impact', 'annualized_loss_expectancy', 'monte_carlo', 'bayesian', 'custom']
    }
  },
  
  // Scope Definition
  scope: {
    type: {
      type: String,
      enum: ['organization', 'business_unit', 'department', 'system', 'application', 'process', 'project', 'asset_group', 'vendor']
    },
    entityId: String,
    entityName: String,
    description: String,
    boundaries: String,
    inclusions: [String],
    exclusions: [String],
    constraints: [String],
    assumptions: [String]
  },
  
  // Schedule
  schedule: {
    startDate: Date,
    endDate: Date,
    actualStartDate: Date,
    actualEndDate: Date,
    duration: Number,                    // Days
    frequency: {
      type: String,
      enum: ['one_time', 'monthly', 'quarterly', 'semi_annual', 'annual', 'continuous', 'ad_hoc']
    },
    nextScheduledDate: Date
  },
  
  // Status & Progress
  status: {
    type: String,
    enum: ['draft', 'planned', 'in_progress', 'review', 'approved', 'completed', 'cancelled'],
    default: 'draft'
  },
  
  progress: {
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    phase: {
      type: String,
      enum: ['initiation', 'asset_identification', 'threat_analysis', 'vulnerability_assessment', 
             'risk_analysis', 'risk_evaluation', 'treatment_planning', 'reporting', 'completed']
    },
    milestones: [{
      name: String,
      description: String,
      dueDate: Date,
      completedDate: Date,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'delayed']
      }
    }]
  },
  
  // Team & Ownership
  team: {
    owner: {
      userId: String,
      name: String,
      email: String,
      department: String
    },
    lead: {
      userId: String,
      name: String,
      email: String
    },
    members: [{
      userId: String,
      name: String,
      email: String,
      role: String
    }],
    stakeholders: [{
      name: String,
      role: String,
      email: String,
      department: String
    }]
  },
  
  // Assets Under Assessment
  assets: [{
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset'
    },
    name: String,
    type: String,
    criticality: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low']
    },
    value: Number,
    risksIdentified: Number
  }],
  
  // Threats Identified
  threats: [{
    threatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Threat'
    },
    name: String,
    type: String,
    likelihood: Number,
    impactedAssets: [String]
  }],
  
  // Vulnerabilities Found
  vulnerabilities: [{
    vulnerabilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vulnerability'
    },
    name: String,
    severity: String,
    cvssScore: Number,
    exploitable: Boolean
  }],
  
  // Risk Analysis Results
  riskAnalysis: {
    totalRisks: {
      type: Number,
      default: 0
    },
    
    // Risk by Severity
    bySeverity: {
      critical: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      low: { type: Number, default: 0 }
    },
    
    // Risk by Category
    byCategory: {
      strategic: { type: Number, default: 0 },
      operational: { type: Number, default: 0 },
      financial: { type: Number, default: 0 },
      compliance: { type: Number, default: 0 },
      reputational: { type: Number, default: 0 },
      technical: { type: Number, default: 0 },
      physical: { type: Number, default: 0 }
    },
    
    // Risk Scores
    inherentRisk: {
      score: Number,                     // 0-100
      level: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low', 'negligible']
      }
    },
    
    residualRisk: {
      score: Number,                     // 0-100
      level: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low', 'negligible']
      }
    },
    
    riskReduction: {
      score: Number,
      percentage: Number
    },
    
    // Top Risks
    topRisks: [{
      riskId: String,
      title: String,
      score: Number,
      level: String,
      category: String
    }],
    
    // Financial Impact
    financialImpact: {
      annualLossExpectancy: Number,      // ALE
      singleLossExpectancy: Number,      // SLE
      annualRateOccurrence: Number,      // ARO
      totalExposure: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    }
  },
  
  // Risk Treatment Strategies
  treatment: {
    totalStrategies: {
      type: Number,
      default: 0
    },
    byType: {
      mitigate: { type: Number, default: 0 },
      accept: { type: Number, default: 0 },
      transfer: { type: Number, default: 0 },
      avoid: { type: Number, default: 0 }
    },
    strategies: [{
      riskId: String,
      type: {
        type: String,
        enum: ['mitigate', 'accept', 'transfer', 'avoid']
      },
      description: String,
      costEstimate: Number,
      timeframe: String,
      status: String
    }]
  },
  
  // Controls Assessment
  controls: {
    total: {
      type: Number,
      default: 0
    },
    existing: {
      type: Number,
      default: 0
    },
    planned: {
      type: Number,
      default: 0
    },
    effectiveness: {
      type: String,
      enum: ['very_effective', 'effective', 'partially_effective', 'ineffective', 'not_tested']
    },
    controlsList: [{
      controlId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Control'
      },
      name: String,
      type: String,
      effectiveness: String,
      riskReduction: Number
    }]
  },
  
  // Risk Acceptance
  acceptance: {
    required: Boolean,
    approvers: [{
      name: String,
      email: String,
      role: String,
      level: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected']
      },
      date: Date,
      comments: String
    }],
    finalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected']
    },
    approvedDate: Date,
    conditions: [String],
    reviewDate: Date
  },
  
  // Compliance Mapping
  compliance: {
    frameworks: [{
      name: String,
      requirements: [String],
      gaps: [String],
      complianceScore: Number
    }],
    overallCompliance: Number
  },
  
  // Reports Generated
  reports: [{
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RiskReport'
    },
    type: String,
    generatedDate: Date,
    format: String
  }],
  
  // Findings & Recommendations
  findings: {
    summary: String,
    keyFindings: [{
      category: String,
      finding: String,
      severity: String,
      evidence: String
    }],
    recommendations: [{
      priority: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low']
      },
      title: String,
      description: String,
      expectedBenefit: String,
      estimatedCost: Number,
      timeframe: String,
      owner: String
    }]
  },
  
  // Review & Quality Assurance
  review: {
    required: Boolean,
    reviewers: [{
      name: String,
      email: String,
      role: String
    }],
    reviewDate: Date,
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed']
    },
    findings: [String],
    approved: Boolean
  },
  
  // Historical Data
  history: [{
    date: Date,
    action: String,
    performedBy: String,
    changes: mongoose.Schema.Types.Mixed,
    riskSnapshot: {
      inherentRisk: Number,
      residualRisk: Number,
      totalRisks: Number
    }
  }],
  
  // Related Assessments
  related: {
    previousAssessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RiskAssessment'
    },
    followUpAssessments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RiskAssessment'
    }]
  },
  
  // Metadata
  metadata: {
    confidentiality: {
      type: String,
      enum: ['public', 'internal', 'confidential', 'restricted'],
      default: 'internal'
    },
    tags: [String],
    customFields: mongoose.Schema.Types.Mixed,
    version: {
      type: Number,
      default: 1
    },
    createdBy: {
      userId: String,
      name: String,
      email: String
    },
    lastModifiedBy: {
      userId: String,
      name: String,
      email: String
    }
  }
  
}, {
  timestamps: true
});

// Indexes
riskAssessmentSchema.index({ type: 1, status: 1 });
riskAssessmentSchema.index({ 'scope.type': 1, 'scope.entityId': 1 });
riskAssessmentSchema.index({ 'schedule.startDate': 1 });
riskAssessmentSchema.index({ 'riskAnalysis.inherentRisk.level': 1 });

// Pre-save hook
riskAssessmentSchema.pre('save', function(next) {
  if (!this.assessmentId) {
    this.assessmentId = `RA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

// Instance Methods
riskAssessmentSchema.methods.calculateRiskScores = function() {
  // Calculate inherent and residual risk scores based on assets and threats
  let totalInherentRisk = 0;
  let totalResidualRisk = 0;
  let riskCount = 0;
  
  this.assets.forEach(asset => {
    if (asset.risksIdentified) {
      riskCount += asset.risksIdentified;
    }
  });
  
  if (riskCount > 0) {
    this.riskAnalysis.inherentRisk.score = totalInherentRisk / riskCount;
    this.riskAnalysis.residualRisk.score = totalResidualRisk / riskCount;
    this.riskAnalysis.riskReduction.score = totalInherentRisk - totalResidualRisk;
    this.riskAnalysis.riskReduction.percentage = 
      ((totalInherentRisk - totalResidualRisk) / totalInherentRisk) * 100;
  }
  
  return this;
};

riskAssessmentSchema.methods.addHistoryEntry = function(action, performedBy, changes) {
  this.history.push({
    date: new Date(),
    action,
    performedBy,
    changes,
    riskSnapshot: {
      inherentRisk: this.riskAnalysis.inherentRisk.score,
      residualRisk: this.riskAnalysis.residualRisk.score,
      totalRisks: this.riskAnalysis.totalRisks
    }
  });
  
  // Keep only last 100 history entries
  if (this.history.length > 100) {
    this.history = this.history.slice(-100);
  }
  
  return this;
};

riskAssessmentSchema.methods.complete = function() {
  this.status = 'completed';
  this.progress.percentage = 100;
  this.progress.phase = 'completed';
  this.schedule.actualEndDate = new Date();
  return this;
};

// Static Methods
riskAssessmentSchema.statics.findByScope = async function(scopeType, entityId) {
  return this.find({
    'scope.type': scopeType,
    'scope.entityId': entityId
  }).sort({ 'schedule.startDate': -1 });
};

riskAssessmentSchema.statics.findHighRisk = async function() {
  return this.find({
    'riskAnalysis.inherentRisk.level': { $in: ['critical', 'high'] },
    status: { $in: ['in_progress', 'completed'] }
  }).sort({ 'riskAnalysis.inherentRisk.score': -1 });
};

riskAssessmentSchema.statics.findRecent = async function(limit = 10) {
  return this.find()
    .sort({ 'schedule.startDate': -1 })
    .limit(limit);
};

riskAssessmentSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        inProgress: {
          $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
        },
        avgInherentRisk: { $avg: '$riskAnalysis.inherentRisk.score' },
        avgResidualRisk: { $avg: '$riskAnalysis.residualRisk.score' },
        totalRisks: { $sum: '$riskAnalysis.totalRisks' }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    completed: 0,
    inProgress: 0,
    avgInherentRisk: 0,
    avgResidualRisk: 0,
    totalRisks: 0
  };
};

module.exports = mongoose.model('RiskAssessment', riskAssessmentSchema);
