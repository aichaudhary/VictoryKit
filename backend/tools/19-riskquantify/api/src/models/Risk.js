const mongoose = require('mongoose');

const riskSchema = new mongoose.Schema({
  riskId: {
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
  
  // Risk Classification
  category: {
    type: String,
    enum: [
      'strategic',           // Business strategy risks
      'operational',         // Day-to-day operations
      'financial',           // Financial losses
      'compliance',          // Regulatory non-compliance
      'reputational',        // Brand/reputation damage
      'technical',           // Technology/IT risks
      'physical',            // Physical security
      'cyber',               // Cybersecurity
      'third_party',         // Vendor/supplier risks
      'environmental'        // Natural disasters, etc.
    ],
    required: true
  },
  
  subCategory: String,
  
  type: {
    type: String,
    enum: ['threat', 'vulnerability', 'incident', 'compliance_gap', 'process_failure', 'external_event']
  },
  
  // Associated Assessment
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RiskQuantifyment',
    required: true
  },
  
  // Risk Owner & Stakeholders
  owner: {
    userId: String,
    name: String,
    email: String,
    department: String
  },
  
  stakeholders: [{
    name: String,
    role: String,
    email: String,
    interest: {
      type: String,
      enum: ['high', 'medium', 'low']
    }
  }],
  
  // Affected Assets
  affectedAssets: [{
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset'
    },
    name: String,
    type: String,
    criticality: String,
    value: Number,
    impactLevel: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low', 'negligible']
    }
  }],
  
  // Threat Information
  threat: {
    source: {
      type: String,
      enum: ['internal', 'external', 'environmental', 'technical', 'human', 'process']
    },
    actor: {
      type: String,
      enum: ['nation_state', 'organized_crime', 'insider', 'hacktivist', 'competitor', 
             'natural', 'accidental', 'unknown']
    },
    capability: {
      type: String,
      enum: ['very_high', 'high', 'medium', 'low', 'very_low']
    },
    intent: {
      type: String,
      enum: ['malicious', 'accidental', 'negligence', 'natural']
    },
    description: String
  },
  
  // Vulnerability Information
  vulnerability: {
    type: String,
    description: String,
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low']
    },
    cvssScore: Number,
    cveId: String,
    exploitability: {
      type: String,
      enum: ['very_easy', 'easy', 'moderate', 'difficult', 'very_difficult']
    },
    publiclyKnown: Boolean,
    exploitAvailable: Boolean
  },
  
  // Likelihood Assessment
  likelihood: {
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    level: {
      type: String,
      enum: ['very_high', 'high', 'medium', 'low', 'very_low'],
      required: true
    },
    factors: [{
      factor: String,
      weight: Number,
      value: Number
    }],
    frequency: {
      value: Number,
      unit: {
        type: String,
        enum: ['per_year', 'per_month', 'per_week', 'per_day']
      }
    },
    probability: Number,              // 0-1
    confidence: {
      type: String,
      enum: ['very_high', 'high', 'medium', 'low', 'very_low']
    }
  },
  
  // Impact Assessment
  impact: {
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    level: {
      type: String,
      enum: ['catastrophic', 'critical', 'major', 'moderate', 'minor', 'negligible'],
      required: true
    },
    
    // Impact by Category
    categories: {
      financial: {
        value: Number,
        currency: String,
        description: String
      },
      operational: {
        downtime: Number,              // Hours
        productivityLoss: Number,
        description: String
      },
      reputational: {
        score: Number,
        description: String
      },
      compliance: {
        fines: Number,
        penalties: [String],
        description: String
      },
      safety: {
        injuries: Number,
        fatalities: Number,
        description: String
      },
      environmental: {
        score: Number,
        description: String
      }
    },
    
    // Quantitative Impact
    quantitative: {
      singleLossExpectancy: Number,    // SLE
      annualRateOccurrence: Number,    // ARO
      annualLossExpectancy: Number,    // ALE = SLE * ARO
      exposureFactor: Number,          // 0-1
      assetValue: Number
    },
    
    // Time Horizon
    timeHorizon: {
      type: String,
      enum: ['immediate', 'short_term', 'medium_term', 'long_term']
    }
  },
  
  // Risk Score Calculation
  riskScore: {
    inherent: {
      score: Number,                   // Likelihood × Impact
      level: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low', 'negligible']
      },
      calculatedDate: Date
    },
    
    residual: {
      score: Number,                   // After controls
      level: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low', 'negligible']
      },
      calculatedDate: Date
    },
    
    target: {
      score: Number,
      level: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low', 'negligible']
      }
    },
    
    method: {
      type: String,
      enum: ['qualitative', 'quantitative', 'semi_quantitative']
    },
    
    matrix: String                     // e.g., "5x5", "3x3"
  },
  
  // Risk Status
  status: {
    type: String,
    enum: ['identified', 'analyzing', 'evaluated', 'treatment_planned', 'treating', 
           'monitoring', 'accepted', 'transferred', 'mitigated', 'closed'],
    default: 'identified'
  },
  
  // Risk Response/Treatment
  treatment: {
    strategy: {
      type: String,
      enum: ['mitigate', 'accept', 'transfer', 'avoid'],
      required: true
    },
    
    justification: String,
    
    // Mitigation Actions
    actions: [{
      actionId: String,
      title: String,
      description: String,
      type: {
        type: String,
        enum: ['control_implementation', 'process_change', 'policy_update', 
               'training', 'technology_deployment', 'insurance', 'outsourcing']
      },
      priority: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low']
      },
      status: {
        type: String,
        enum: ['planned', 'in_progress', 'completed', 'deferred', 'cancelled']
      },
      owner: String,
      dueDate: Date,
      completedDate: Date,
      cost: Number,
      effectiveness: Number            // Expected risk reduction %
    }],
    
    // Associated Controls
    controls: [{
      controlId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Control'
      },
      name: String,
      type: String,
      effectiveness: Number,
      status: String
    }],
    
    // Cost-Benefit Analysis
    costBenefit: {
      treatmentCost: Number,
      expectedBenefit: Number,
      roi: Number,
      paybackPeriod: Number,
      netPresentValue: Number
    },
    
    // Timeline
    timeline: {
      startDate: Date,
      targetDate: Date,
      completedDate: Date,
      reviewDate: Date
    }
  },
  
  // Risk Appetite & Tolerance
  appetite: {
    organizationalAppetite: {
      type: String,
      enum: ['zero', 'low', 'moderate', 'high', 'aggressive']
    },
    toleranceThreshold: Number,
    exceedsTolerance: Boolean,
    justification: String
  },
  
  // Compliance & Regulatory
  compliance: {
    frameworks: [String],
    requirements: [String],
    violations: [String],
    reportingRequired: Boolean,
    reportingTo: [String]
  },
  
  // Historical Data & Trends
  history: [{
    date: Date,
    inherentScore: Number,
    residualScore: Number,
    likelihood: Number,
    impact: Number,
    status: String,
    notes: String
  }],
  
  trend: {
    direction: {
      type: String,
      enum: ['increasing', 'stable', 'decreasing']
    },
    changeRate: Number,
    lastAssessed: Date
  },
  
  // Incidents Related
  incidents: [{
    incidentId: String,
    date: Date,
    description: String,
    impact: Number,
    resolved: Boolean
  }],
  
  // Documentation
  documentation: {
    evidence: [String],
    references: [String],
    notes: String,
    attachments: [{
      filename: String,
      url: String,
      type: String,
      uploadedDate: Date
    }]
  },
  
  // Review & Monitoring
  review: {
    frequency: {
      type: String,
      enum: ['continuous', 'weekly', 'monthly', 'quarterly', 'semi_annual', 'annual']
    },
    lastReviewDate: Date,
    nextReviewDate: Date,
    reviewer: String,
    findings: [String]
  },
  
  // Metadata
  metadata: {
    tags: [String],
    customFields: mongoose.Schema.Types.Mixed,
    createdBy: {
      userId: String,
      name: String
    },
    lastModifiedBy: {
      userId: String,
      name: String
    }
  }
  
}, {
  timestamps: true
});

// Indexes
riskSchema.index({ category: 1, status: 1 });
riskSchema.index({ assessmentId: 1 });
riskSchema.index({ 'riskScore.inherent.level': 1 });
riskSchema.index({ 'owner.userId': 1 });

// Pre-save hook
riskSchema.pre('save', function(next) {
  if (!this.riskId) {
    this.riskId = `RISK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  
  // Calculate inherent risk score
  if (this.likelihood.score && this.impact.score) {
    this.riskScore.inherent.score = (this.likelihood.score * this.impact.score) / 100;
    this.riskScore.inherent.calculatedDate = new Date();
    
    // Determine risk level
    if (this.riskScore.inherent.score >= 80) this.riskScore.inherent.level = 'critical';
    else if (this.riskScore.inherent.score >= 60) this.riskScore.inherent.level = 'high';
    else if (this.riskScore.inherent.score >= 40) this.riskScore.inherent.level = 'medium';
    else if (this.riskScore.inherent.score >= 20) this.riskScore.inherent.level = 'low';
    else this.riskScore.inherent.level = 'negligible';
  }
  
  next();
});

// Instance Methods
riskSchema.methods.calculateResidualRisk = function() {
  let riskReduction = 0;
  
  this.treatment.controls.forEach(control => {
    if (control.effectiveness) {
      riskReduction += control.effectiveness;
    }
  });
  
  riskReduction = Math.min(riskReduction, 100);
  this.riskScore.residual.score = this.riskScore.inherent.score * (1 - (riskReduction / 100));
  this.riskScore.residual.calculatedDate = new Date();
  
  if (this.riskScore.residual.score >= 80) this.riskScore.residual.level = 'critical';
  else if (this.riskScore.residual.score >= 60) this.riskScore.residual.level = 'high';
  else if (this.riskScore.residual.score >= 40) this.riskScore.residual.level = 'medium';
  else if (this.riskScore.residual.score >= 20) this.riskScore.residual.level = 'low';
  else this.riskScore.residual.level = 'negligible';
  
  return this;
};

riskSchema.methods.addHistoryEntry = function() {
  this.history.push({
    date: new Date(),
    inherentScore: this.riskScore.inherent.score,
    residualScore: this.riskScore.residual.score,
    likelihood: this.likelihood.score,
    impact: this.impact.score,
    status: this.status
  });
  
  if (this.history.length > 100) {
    this.history = this.history.slice(-100);
  }
  
  return this;
};

// Static Methods
riskSchema.statics.findByLevel = async function(level) {
  return this.find({ 'riskScore.inherent.level': level })
    .sort({ 'riskScore.inherent.score': -1 });
};

riskSchema.statics.findCritical = async function() {
  return this.find({
    'riskScore.inherent.level': { $in: ['critical', 'high'] },
    status: { $nin: ['closed', 'accepted'] }
  }).sort({ 'riskScore.inherent.score': -1 });
};

riskSchema.statics.findByAssessment = async function(assessmentId) {
  return this.find({ assessmentId })
    .sort({ 'riskScore.inherent.score': -1 });
};

riskSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        avgInherentScore: { $avg: '$riskScore.inherent.score' },
        avgResidualScore: { $avg: '$riskScore.residual.score' },
        critical: {
          $sum: { $cond: [{ $eq: ['$riskScore.inherent.level', 'critical'] }, 1, 0] }
        },
        high: {
          $sum: { $cond: [{ $eq: ['$riskScore.inherent.level', 'high'] }, 1, 0] }
        },
        medium: {
          $sum: { $cond: [{ $eq: ['$riskScore.inherent.level', 'medium'] }, 1, 0] }
        },
        low: {
          $sum: { $cond: [{ $eq: ['$riskScore.inherent.level', 'low'] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    avgInherentScore: 0,
    avgResidualScore: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  };
};

module.exports = mongoose.model('Risk', riskSchema);
