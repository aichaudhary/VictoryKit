const mongoose = require('mongoose');

/**
 * Threat Model - Threat scenario modeling and analysis
 * Manages threat actors, vectors, and risk calculations
 */
const threatSchema = new mongoose.Schema({
  threatId: {
    type: String,
    required: true,
    unique: true,
    default: () => 'TH-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase()
  },
  
  // Threat identification
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  type: {
    type: String,
    enum: ['cyber_attack', 'physical_intrusion', 'natural_disaster', 'human_error', 'supply_chain_disruption', 'regulatory_change', 'technological_failure', 'social_engineering'],
    required: true
  },
  category: {
    type: String,
    enum: ['malware', 'phishing', 'denial_of_service', 'unauthorized_access', 'data_breach', 'ransomware', 'insider_threat', 'third_party_risk', 'environmental', 'operational'],
    required: true
  },
  subcategory: String, // More specific classification
  
  // Threat actor profile
  actor: {
    type: {
      type: String,
      enum: ['individual', 'organized_crime', 'nation_state', 'hacktivist', 'insider', 'competitor', 'supplier', 'customer', 'natural', 'accidental']
    },
    motivation: {
      type: String,
      enum: ['financial_gain', 'espionage', 'disruption', 'ideological', 'revenge', 'competitive_advantage', 'accidental', 'natural_cause']
    },
    capability: {
      type: String,
      enum: ['low', 'medium', 'high', 'advanced', 'state_level']
    },
    resources: {
      type: String,
      enum: ['limited', 'moderate', 'extensive', 'unlimited']
    },
    sophistication: {
      type: String,
      enum: ['novice', 'intermediate', 'advanced', 'expert']
    }
  },
  
  // Threat characteristics
  vector: {
    primary: {
      type: String,
      enum: ['network', 'physical', 'email', 'usb', 'social_engineering', 'supply_chain', 'insider', 'environmental', 'operational']
    },
    secondary: [String],
    entryPoint: String,
    targetAsset: String
  },
  
  // Risk assessment
  riskMetrics: {
    inherentLikelihood: { type: Number, min: 0, max: 5, default: 1 }, // 1-5 scale
    inherentImpact: { type: Number, min: 0, max: 5, default: 1 }, // 1-5 scale
    inherentRiskScore: { type: Number, min: 0, max: 25, default: 1 }, // likelihood * impact
    
    residualLikelihood: { type: Number, min: 0, max: 5, default: 1 },
    residualImpact: { type: Number, min: 0, max: 5, default: 1 },
    residualRiskScore: { type: Number, min: 0, max: 25, default: 1 },
    
    riskLevel: {
      type: String,
      enum: ['very_low', 'low', 'medium', 'high', 'very_high', 'critical'],
      default: 'medium'
    }
  },
  
  // Vulnerability assessment
  vulnerabilities: [{
    vulnerabilityId: String,
    cveId: String,
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    cvssScore: { type: Number, min: 0, max: 10 },
    exploitability: {
      type: String,
      enum: ['unproven', 'proof_of_concept', 'functional', 'high', 'automated']
    },
    affectedAssets: [{
      assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
      exposure: { type: Number, min: 0, max: 100 }
    }]
  }],
  
  // Controls and mitigations
  controls: [{
    controlId: { type: mongoose.Schema.Types.ObjectId, ref: 'Control' },
    effectiveness: { type: Number, min: 0, max: 100 },
    implementationStatus: {
      type: String,
      enum: ['not_implemented', 'planned', 'implementing', 'implemented', 'testing', 'operational']
    },
    coverage: { type: Number, min: 0, max: 100 }, // Percentage of threat mitigated
    lastTested: Date,
    testResults: String
  }],
  
  // Threat intelligence
  intelligence: {
    source: {
      type: String,
      enum: ['internal', 'commercial_feed', 'open_source', 'government', 'industry_sharing', 'dark_web']
    },
    confidence: { type: Number, min: 0, max: 100 },
    lastUpdated: { type: Date, default: Date.now },
    indicators: [{
      type: {
        type: String,
        enum: ['ip_address', 'domain', 'email', 'file_hash', 'url', 'behavior', 'signature']
      },
      value: String,
      confidence: { type: Number, min: 0, max: 100 },
      lastSeen: Date
    }],
    tactics: [String], // MITRE ATT&CK tactics
    techniques: [String], // MITRE ATT&CK techniques
    attribution: String
  },
  
  // Historical data
  history: [{
    date: { type: Date, default: Date.now },
    event: String,
    impact: String,
    response: String,
    lessonsLearned: String
  }],
  
  // Trend analysis
  trends: {
    frequency: {
      type: String,
      enum: ['increasing', 'decreasing', 'stable', 'emerging', 'declining']
    },
    velocity: {
      type: String,
      enum: ['slow', 'moderate', 'rapid', 'explosive']
    },
    prediction: {
      likelihood: { type: Number, min: 0, max: 5 },
      timeframe: String, // e.g., "next 6 months"
      confidence: { type: Number, min: 0, max: 100 }
    }
  },
  
  // Impact assessment
  impact: {
    categories: {
      confidentiality: { type: Number, min: 0, max: 5 },
      integrity: { type: Number, min: 0, max: 5 },
      availability: { type: Number, min: 0, max: 5 },
      financial: { type: Number, min: 0, max: 5 },
      operational: { type: Number, min: 0, max: 5 },
      reputational: { type: Number, min: 0, max: 5 },
      legal: { type: Number, min: 0, max: 5 },
      regulatory: { type: Number, min: 0, max: 5 }
    },
    scenarios: [{
      name: String,
      description: String,
      likelihood: { type: Number, min: 0, max: 5 },
      impact: { type: Number, min: 0, max: 5 },
      consequences: [String],
      recoveryTime: String,
      costEstimate: Number
    }],
    worstCase: {
      description: String,
      impact: { type: Number, min: 0, max: 5 },
      cost: Number,
      duration: String
    }
  },
  
  // Detection and response
  detection: {
    methods: [String],
    indicators: [{
      type: String,
      description: String,
      reliability: { type: Number, min: 0, max: 100 }
    }],
    meanTimeToDetect: Number, // hours
    falsePositiveRate: { type: Number, min: 0, max: 100 }
  },
  
  response: {
    strategies: [{
      name: String,
      description: String,
      effectiveness: { type: Number, min: 0, max: 100 },
      cost: Number,
      implementationTime: String
    }],
    playbooks: [{
      name: String,
      location: String, // URL or file path
      lastReviewed: Date,
      version: String
    }],
    escalationProcedures: String,
    communicationPlan: String
  },
  
  // Compliance mapping
  compliance: [{
    framework: {
      type: String,
      enum: ['NIST-CSF', 'ISO27001', 'PCI-DSS', 'HIPAA', 'SOX', 'GDPR', 'CCPA']
    },
    controls: [{
      controlId: String,
      description: String,
      relevance: { type: Number, min: 0, max: 100 }
    }],
    requirements: [String]
  }],
  
  // Status and lifecycle
  status: {
    type: String,
    enum: ['active', 'mitigated', 'monitored', 'retired', 'emerging'],
    default: 'active'
  },
  lifecycle: {
    discovered: { type: Date, default: Date.now },
    firstSeen: Date,
    lastObserved: { type: Date, default: Date.now },
    expectedDuration: String,
    retirementDate: Date
  },
  
  // Associated assets and assessments
  affectedAssets: [{
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
    exposure: { type: Number, min: 0, max: 100 },
    criticality: { type: String, enum: ['low', 'medium', 'high', 'critical'] }
  }],
  
  riskAssessments: [{
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'RiskAssessment' },
    included: { type: Boolean, default: true },
    lastAssessed: Date
  }],
  
  // Audit trail
  auditTrail: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'assessed', 'mitigated', 'detected', 'responded', 'retired']
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    details: mongoose.Schema.Types.Mixed,
    ipAddress: String
  }],
  
  // Metadata
  tags: [String],
  customFields: mongoose.Schema.Types.Mixed,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  version: { type: Number, default: 1 }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
threatSchema.index({ threatId: 1 });
threatSchema.index({ type: 1, category: 1 });
threatSchema.index({ 'riskMetrics.inherentRiskScore': -1 });
threatSchema.index({ 'riskMetrics.residualRiskScore': -1 });
threatSchema.index({ status: 1 });
threatSchema.index({ 'actor.type': 1 });

// Virtual for risk reduction
threatSchema.virtual('riskReduction').get(function() {
  const inherent = this.riskMetrics.inherentRiskScore;
  const residual = this.riskMetrics.residualRiskScore;
  if (inherent === 0) return 0;
  return Math.round(((inherent - residual) / inherent) * 100);
});

// Virtual for overall impact
threatSchema.virtual('overallImpact').get(function() {
  const categories = this.impact.categories;
  const values = Object.values(categories).filter(val => val > 0);
  return values.length > 0 ? Math.round(values.reduce((sum, val) => sum + val, 0) / values.length) : 0;
});

// Pre-save middleware
threatSchema.pre('save', function(next) {
  // Calculate inherent risk score
  this.riskMetrics.inherentRiskScore = this.riskMetrics.inherentLikelihood * this.riskMetrics.inherentImpact;
  
  // Calculate residual risk score
  this.riskMetrics.residualRiskScore = this.riskMetrics.residualLikelihood * this.riskMetrics.residualImpact;
  
  // Set risk level based on residual risk score
  const score = this.riskMetrics.residualRiskScore;
  if (score >= 20) this.riskMetrics.riskLevel = 'critical';
  else if (score >= 15) this.riskMetrics.riskLevel = 'very_high';
  else if (score >= 10) this.riskMetrics.riskLevel = 'high';
  else if (score >= 5) this.riskMetrics.riskLevel = 'medium';
  else if (score >= 2) this.riskMetrics.riskLevel = 'low';
  else this.riskMetrics.riskLevel = 'very_low';
  
  if (this.isModified()) {
    this.version += 1;
    this.updatedBy = this.updatedBy || this.createdBy;
  }
  next();
});

// Instance methods
threatSchema.methods.calculateRiskScore = function(likelihood, impact) {
  this.riskMetrics.residualLikelihood = likelihood;
  this.riskMetrics.residualImpact = impact;
  this.riskMetrics.residualRiskScore = likelihood * impact;
  
  // Update risk level
  const score = this.riskMetrics.residualRiskScore;
  if (score >= 20) this.riskMetrics.riskLevel = 'critical';
  else if (score >= 15) this.riskMetrics.riskLevel = 'very_high';
  else if (score >= 10) this.riskMetrics.riskLevel = 'high';
  else if (score >= 5) this.riskMetrics.riskLevel = 'medium';
  else if (score >= 2) this.riskMetrics.riskLevel = 'low';
  else this.riskMetrics.riskLevel = 'very_low';
  
  return this.riskMetrics.residualRiskScore;
};

threatSchema.methods.addControl = function(controlId, effectiveness, coverage) {
  const existingControl = this.controls.find(c => c.controlId.toString() === controlId.toString());
  
  if (existingControl) {
    existingControl.effectiveness = effectiveness;
    existingControl.coverage = coverage;
    existingControl.lastTested = new Date();
  } else {
    this.controls.push({
      controlId,
      effectiveness,
      coverage,
      implementationStatus: 'implemented',
      lastTested: new Date()
    });
  }
  
  // Recalculate residual risk based on controls
  this.updateResidualRisk();
};

threatSchema.methods.updateResidualRisk = function() {
  const inherentLikelihood = this.riskMetrics.inherentLikelihood;
  const inherentImpact = this.riskMetrics.inherentImpact;
  
  // Calculate average control effectiveness
  let avgEffectiveness = 0;
  if (this.controls.length > 0) {
    avgEffectiveness = this.controls.reduce((sum, control) => 
      sum + (control.effectiveness * control.coverage / 100), 0) / this.controls.length;
  }
  
  // Reduce likelihood and impact based on controls
  const reductionFactor = avgEffectiveness / 100;
  this.riskMetrics.residualLikelihood = Math.max(1, inherentLikelihood * (1 - reductionFactor));
  this.riskMetrics.residualImpact = Math.max(1, inherentImpact * (1 - reductionFactor));
  this.riskMetrics.residualRiskScore = this.riskMetrics.residualLikelihood * this.riskMetrics.residualImpact;
};

threatSchema.methods.addHistoryEntry = function(event, impact, response, lessonsLearned) {
  this.history.push({
    event,
    impact,
    response,
    lessonsLearned
  });
};

threatSchema.methods.addAuditEntry = function(action, userId, details, ipAddress) {
  this.auditTrail.push({
    action,
    userId,
    details,
    ipAddress
  });
};

// Static methods
threatSchema.statics.findByType = function(type) {
  return this.find({ type });
};

threatSchema.statics.findHighRisk = function(threshold = 15) {
  return this.find({ 'riskMetrics.residualRiskScore': { $gte: threshold } });
};

threatSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

threatSchema.statics.findByActorType = function(actorType) {
  return this.find({ 'actor.type': actorType });
};

threatSchema.statics.getRiskDistribution = async function() {
  const distribution = await this.aggregate([
    {
      $group: {
        _id: '$riskMetrics.riskLevel',
        count: { $sum: 1 },
        averageScore: { $avg: '$riskMetrics.residualRiskScore' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
  
  return distribution;
};

threatSchema.statics.getThreatStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalThreats: { $sum: 1 },
        activeThreats: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        criticalThreats: {
          $sum: { $cond: [{ $eq: ['$riskMetrics.riskLevel', 'critical'] }, 1, 0] }
        },
        averageRiskScore: { $avg: '$riskMetrics.residualRiskScore' },
        maxRiskScore: { $max: '$riskMetrics.residualRiskScore' }
      }
    }
  ]);
  
  return stats[0] || {
    totalThreats: 0,
    activeThreats: 0,
    criticalThreats: 0,
    averageRiskScore: 0,
    maxRiskScore: 0
  };
};

module.exports = mongoose.model('Threat', threatSchema);
