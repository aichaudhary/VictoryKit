const mongoose = require('mongoose');

/**
 * RiskRegister Model - Risk register with mitigation tracking
 * Comprehensive risk management and tracking system
 */
const riskRegisterSchema = new mongoose.Schema({
  registerId: {
    type: String,
    required: true,
    unique: true,
    default: () => 'RR-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase()
  },
  
  // Register metadata
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  type: {
    type: String,
    enum: ['enterprise', 'department', 'project', 'system', 'application', 'vendor', 'regulatory'],
    required: true
  },
  scope: {
    type: String,
    enum: ['organization_wide', 'department', 'business_unit', 'system', 'application', 'process'],
    required: true
  },
  
  // Register status
  status: {
    type: String,
    enum: ['active', 'archived', 'draft', 'review', 'approved'],
    default: 'active'
  },
  version: { type: Number, default: 1 },
  lastReviewDate: Date,
  nextReviewDate: Date,
  
  // Risk entries
  risks: [{
    riskId: {
      type: String,
      default: () => 'R-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase()
    },
    
    // Risk identification
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: {
      type: String,
      enum: ['strategic', 'operational', 'financial', 'compliance', 'reputational', 'security', 'technological', 'external'],
      required: true
    },
    subcategory: String,
    
    // Risk assessment
    inherentRisk: {
      likelihood: { type: Number, min: 1, max: 5, required: true },
      impact: { type: Number, min: 1, max: 5, required: true },
      score: { type: Number, min: 1, max: 25 }, // Auto-calculated
      level: {
        type: String,
        enum: ['very_low', 'low', 'medium', 'high', 'very_high', 'critical']
      }
    },
    
    residualRisk: {
      likelihood: { type: Number, min: 1, max: 5, default: 1 },
      impact: { type: Number, min: 1, max: 5, default: 1 },
      score: { type: Number, min: 1, max: 25 }, // Auto-calculated
      level: {
        type: String,
        enum: ['very_low', 'low', 'medium', 'high', 'very_high', 'critical']
      }
    },
    
    targetRisk: {
      likelihood: { type: Number, min: 1, max: 5 },
      impact: { type: Number, min: 1, max: 5 },
      score: { type: Number, min: 1, max: 25 },
      level: {
        type: String,
        enum: ['very_low', 'low', 'medium', 'high', 'very_high', 'critical']
      }
    },
    
    // Risk details
    causes: [String],
    consequences: [String],
    indicators: [String], // Early warning signs
    
    // Risk ownership
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    secondaryOwners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
    // Risk appetite and tolerance
    riskAppetite: {
      level: { type: String, enum: ['avoid', 'mitigate', 'accept', 'transfer', 'exploit'] },
      rationale: String
    },
    
    // Controls and treatments
    existingControls: [{
      controlId: { type: mongoose.Schema.Types.ObjectId, ref: 'Control' },
      description: String,
      effectiveness: { type: Number, min: 0, max: 100 },
      status: { type: String, enum: ['effective', 'partially_effective', 'ineffective'] }
    }],
    
    treatmentPlan: {
      strategy: {
        type: String,
        enum: ['avoid', 'mitigate', 'transfer', 'accept', 'exploit'],
        required: true
      },
      actions: [{
        actionId: String,
        description: String,
        type: { type: String, enum: ['preventive', 'detective', 'corrective', 'compensating'] },
        priority: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        dueDate: Date,
        status: { type: String, enum: ['planned', 'in_progress', 'completed', 'cancelled'], default: 'planned' },
        progress: { type: Number, min: 0, max: 100, default: 0 },
        budget: Number,
        resources: [String]
      }],
      timeline: {
        startDate: Date,
        endDate: Date,
        milestones: [{
          name: String,
          date: Date,
          completed: { type: Boolean, default: false }
        }]
      },
      budget: {
        allocated: Number,
        spent: Number,
        currency: { type: String, default: 'USD' }
      }
    },
    
    // Monitoring and review
    monitoring: {
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly', 'annually'] },
      method: String,
      responsible: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      kpis: [{
        name: String,
        target: Number,
        current: Number,
        status: { type: String, enum: ['on_track', 'at_risk', 'off_track'] }
      }],
      lastMonitored: Date,
      nextMonitoring: Date
    },
    
    // Risk incidents and events
    incidents: [{
      incidentId: String,
      date: Date,
      description: String,
      impact: String,
      response: String,
      lessonsLearned: String
    }],
    
    // Financial impact
    financialImpact: {
      potentialLoss: Number,
      actualLoss: Number,
      insuranceCoverage: Number,
      currency: { type: String, default: 'USD' }
    },
    
    // Compliance mapping
    compliance: [{
      framework: String,
      requirement: String,
      relevance: { type: Number, min: 0, max: 100 }
    }],
    
    // Risk status
    status: {
      type: String,
      enum: ['identified', 'assessed', 'treated', 'monitored', 'closed', 'escalated'],
      default: 'identified'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    
    // Dates
    identifiedDate: { type: Date, default: Date.now },
    assessedDate: Date,
    treatmentStartDate: Date,
    treatmentCompletionDate: Date,
    closedDate: Date,
    
    // Review and approval
    reviewHistory: [{
      reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      date: Date,
      comments: String,
      decision: { type: String, enum: ['approved', 'rejected', 'needs_revision'] }
    }],
    
    // Associated entities
    relatedAssets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }],
    relatedThreats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Threat' }],
    relatedControls: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Control' }],
    relatedMitigations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mitigation' }],
    
    // Custom fields
    customFields: mongoose.Schema.Types.Mixed
  }],
  
  // Register summary statistics
  summary: {
    totalRisks: { type: Number, default: 0 },
    riskDistribution: {
      very_low: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      very_high: { type: Number, default: 0 },
      critical: { type: Number, default: 0 }
    },
    treatmentProgress: {
      planned: { type: Number, default: 0 },
      in_progress: { type: Number, default: 0 },
      completed: { type: Number, default: 0 }
    },
    totalBudget: Number,
    spentBudget: Number
  },
  
  // Register configuration
  configuration: {
    riskScoring: {
      method: { type: String, enum: ['qualitative', 'quantitative', 'semi_quantitative'], default: 'semi_quantitative' },
      scale: { type: String, enum: ['1-5', '1-10'], default: '1-5' },
      thresholds: {
        very_low: { max: 4 },
        low: { min: 5, max: 8 },
        medium: { min: 9, max: 12 },
        high: { min: 13, max: 16 },
        very_high: { min: 17, max: 20 },
        critical: { min: 21 }
      }
    },
    categories: [String],
    customFields: [{
      name: String,
      type: { type: String, enum: ['text', 'number', 'date', 'select', 'multiselect'] },
      required: { type: Boolean, default: false },
      options: [String] // For select/multiselect
    }]
  },
  
  // Access control
  accessControl: {
    viewPermissions: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String, enum: ['viewer', 'editor', 'approver', 'admin'] }
    }],
    editPermissions: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String, enum: ['editor', 'approver', 'admin'] }
    }],
    approvePermissions: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String, enum: ['approver', 'admin'] }
    }]
  },
  
  // Audit trail
  auditTrail: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'risk_added', 'risk_updated', 'risk_removed', 'approved', 'reviewed', 'archived']
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    details: mongoose.Schema.Types.Mixed,
    ipAddress: String
  }],
  
  // Associated assessments
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'RiskAssessment' },
  
  // Metadata
  tags: [String],
  customFields: mongoose.Schema.Types.Mixed,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
riskRegisterSchema.index({ registerId: 1 });
riskRegisterSchema.index({ type: 1, status: 1 });
riskRegisterSchema.index({ 'risks.category': 1 });
riskRegisterSchema.index({ 'risks.status': 1 });
riskRegisterSchema.index({ 'risks.owner': 1 });
riskRegisterSchema.index({ createdBy: 1 });

// Virtual for risk reduction percentage
riskRegisterSchema.virtual('riskReductionPercentage').get(function() {
  if (this.risks.length === 0) return 0;
  
  let totalReduction = 0;
  this.risks.forEach(risk => {
    const inherent = risk.inherentRisk.score || 0;
    const residual = risk.residualRisk.score || 0;
    if (inherent > 0) {
      totalReduction += ((inherent - residual) / inherent) * 100;
    }
  });
  
  return Math.round(totalReduction / this.risks.length);
});

// Pre-save middleware
riskRegisterSchema.pre('save', function(next) {
  // Calculate risk scores and update summary
  this.updateRiskCalculations();
  this.updateSummary();
  
  if (this.isModified()) {
    this.version += 1;
    this.updatedBy = this.updatedBy || this.createdBy;
  }
  next();
});

// Instance methods
riskRegisterSchema.methods.updateRiskCalculations = function() {
  this.risks.forEach(risk => {
    // Calculate inherent risk score
    risk.inherentRisk.score = risk.inherentRisk.likelihood * risk.inherentRisk.impact;
    risk.inherentRisk.level = this.calculateRiskLevel(risk.inherentRisk.score);
    
    // Calculate residual risk score
    risk.residualRisk.score = risk.residualRisk.likelihood * risk.residualRisk.impact;
    risk.residualRisk.level = this.calculateRiskLevel(risk.residualRisk.score);
    
    // Calculate target risk score if set
    if (risk.targetRisk.likelihood && risk.targetRisk.impact) {
      risk.targetRisk.score = risk.targetRisk.likelihood * risk.targetRisk.impact;
      risk.targetRisk.level = this.calculateRiskLevel(risk.targetRisk.score);
    }
  });
};

riskRegisterSchema.methods.calculateRiskLevel = function(score) {
  const thresholds = this.configuration.riskScoring.thresholds;
  
  if (score >= thresholds.critical.min) return 'critical';
  if (score >= thresholds.very_high.min) return 'very_high';
  if (score >= thresholds.high.min) return 'high';
  if (score >= thresholds.medium.min) return 'medium';
  if (score >= thresholds.low.min) return 'low';
  return 'very_low';
};

riskRegisterSchema.methods.updateSummary = function() {
  this.summary.totalRisks = this.risks.length;
  
  // Reset distribution
  this.summary.riskDistribution = {
    very_low: 0, low: 0, medium: 0, high: 0, very_high: 0, critical: 0
  };
  
  // Reset treatment progress
  this.summary.treatmentProgress = {
    planned: 0, in_progress: 0, completed: 0
  };
  
  // Calculate distributions
  this.risks.forEach(risk => {
    const level = risk.residualRisk.level;
    if (this.summary.riskDistribution.hasOwnProperty(level)) {
      this.summary.riskDistribution[level]++;
    }
    
    // Treatment progress
    risk.treatmentPlan.actions.forEach(action => {
      if (this.summary.treatmentProgress.hasOwnProperty(action.status)) {
        this.summary.treatmentProgress[action.status]++;
      }
    });
  });
  
  // Calculate budget totals
  this.summary.totalBudget = this.risks.reduce((total, risk) => {
    return total + (risk.treatmentPlan.budget?.allocated || 0);
  }, 0);
  
  this.summary.spentBudget = this.risks.reduce((total, risk) => {
    return total + (risk.treatmentPlan.budget?.spent || 0);
  }, 0);
};

riskRegisterSchema.methods.addRisk = function(riskData, userId) {
  const newRisk = {
    ...riskData,
    riskId: 'R-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
    identifiedDate: new Date(),
    status: 'identified'
  };
  
  this.risks.push(newRisk);
  
  this.addAuditEntry('risk_added', userId, { riskId: newRisk.riskId, title: newRisk.title });
  
  return newRisk;
};

riskRegisterSchema.methods.updateRisk = function(riskId, updates, userId) {
  const risk = this.risks.find(r => r.riskId === riskId);
  if (!risk) throw new Error('Risk not found');
  
  Object.assign(risk, updates);
  risk.assessedDate = new Date();
  
  this.addAuditEntry('risk_updated', userId, { riskId, updates });
  
  return risk;
};

riskRegisterSchema.methods.removeRisk = function(riskId, userId) {
  const riskIndex = this.risks.findIndex(r => r.riskId === riskId);
  if (riskIndex === -1) throw new Error('Risk not found');
  
  const removedRisk = this.risks.splice(riskIndex, 1)[0];
  
  this.addAuditEntry('risk_removed', userId, { riskId, title: removedRisk.title });
  
  return removedRisk;
};

riskRegisterSchema.methods.addAuditEntry = function(action, userId, details, ipAddress) {
  this.auditTrail.push({
    action,
    userId,
    details,
    ipAddress
  });
};

// Static methods
riskRegisterSchema.statics.findByType = function(type) {
  return this.find({ type });
};

riskRegisterSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

riskRegisterSchema.statics.findHighRisk = function(threshold = 16) {
  return this.find({
    'risks.residualRisk.score': { $gte: threshold }
  });
};

riskRegisterSchema.statics.getRiskStatistics = async function() {
  const stats = await this.aggregate([
    {
      $unwind: '$risks'
    },
    {
      $group: {
        _id: null,
        totalRisks: { $sum: 1 },
        averageInherentRisk: { $avg: '$risks.inherentRisk.score' },
        averageResidualRisk: { $avg: '$risks.residualRisk.score' },
        highRiskCount: {
          $sum: { $cond: [{ $gte: ['$risks.residualRisk.score', 16] }, 1, 0] }
        },
        byCategory: {
          $push: '$risks.category'
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalRisks: 0,
    averageInherentRisk: 0,
    averageResidualRisk: 0,
    highRiskCount: 0,
    byCategory: []
  };
};

module.exports = mongoose.model('RiskRegister', riskRegisterSchema);
