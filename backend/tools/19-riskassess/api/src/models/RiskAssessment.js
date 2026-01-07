const mongoose = require('mongoose');

/**
 * RiskAssessment Model - Main risk assessment entity
 * Comprehensive risk assessment with quantitative and qualitative analysis
 */
const riskAssessmentSchema = new mongoose.Schema({
  assessmentId: {
    type: String,
    required: true,
    unique: true,
    default: () => 'RA-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase()
  },
  
  // Assessment metadata
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  type: {
    type: String,
    enum: ['enterprise', 'department', 'system', 'application', 'project', 'vendor', 'third_party', 'regulatory'],
    required: true
  },
  scope: {
    type: String,
    enum: ['organization_wide', 'department', 'business_unit', 'system', 'application', 'process', 'asset', 'vendor'],
    required: true
  },
  
  // Assessment details
  methodology: {
    type: String,
    enum: ['qualitative', 'quantitative', 'semi_quantitative', 'hybrid'],
    default: 'semi_quantitative'
  },
  approach: {
    type: String,
    enum: ['top_down', 'bottom_up', 'hybrid'],
    default: 'hybrid'
  },
  framework: {
    type: String,
    enum: ['NIST_SP_800_30', 'ISO_31000', 'COSO', 'OCTAVE', 'FAIR', 'Custom'],
    default: 'NIST_SP_800_30'
  },
  
  // Assessment schedule
  schedule: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    actualStartDate: { type: Date },
    actualEndDate: { type: Date },
    frequency: {
      type: String,
      enum: ['one_time', 'quarterly', 'semi_annual', 'annual', 'continuous'],
      default: 'annual'
    },
    nextScheduledDate: { type: Date }
  },
  
  // Assessment status
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'review', 'approved', 'completed', 'cancelled'],
    default: 'planned'
  },
  progress: {
    percentage: { type: Number, min: 0, max: 100, default: 0 },
    currentPhase: {
      type: String,
      enum: ['planning', 'asset_identification', 'threat_identification', 'vulnerability_assessment', 'impact_analysis', 'risk_calculation', 'mitigation_planning', 'reporting', 'review']
    },
    milestones: [{
      name: String,
      description: String,
      dueDate: Date,
      completedDate: Date,
      status: { type: String, enum: ['pending', 'in_progress', 'completed', 'overdue'], default: 'pending' }
    }]
  },
  
  // Assessment team
  assessor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  team: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: {
      type: String,
      enum: ['lead_assessor', 'assessor', 'subject_matter_expert', 'stakeholder', 'reviewer']
    },
    responsibilities: [String]
  }],
  
  // Risk analysis results
  riskAnalysis: {
    totalRisks: { type: Number, default: 0 },
    riskDistribution: {
      critical: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      low: { type: Number, default: 0 }
    },
    overallRiskScore: { type: Number, min: 0, max: 100, default: 0 },
    riskAppetite: {
      level: { type: String, enum: ['very_low', 'low', 'moderate', 'high', 'very_high'] },
      threshold: { type: Number, min: 0, max: 100 }
    },
    riskTolerance: {
      financial: { type: Number, min: 0 },
      operational: { type: Number, min: 0, max: 100 },
      reputational: { type: Number, min: 0, max: 100 }
    }
  },
  
  // Assets and threats
  assets: [{
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
    criticality: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
    exposure: { type: Number, min: 0, max: 100 }
  }],
  
  threats: [{
    threatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Threat' },
    likelihood: { type: Number, min: 0, max: 5 },
    impact: { type: Number, min: 0, max: 5 },
    riskScore: { type: Number, min: 0, max: 25 }
  }],
  
  // Risk register reference
  riskRegister: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RiskRegister'
  },
  
  // Controls and mitigations
  controls: [{
    controlId: { type: mongoose.Schema.Types.ObjectId, ref: 'Control' },
    effectiveness: { type: Number, min: 0, max: 100 },
    implementationStatus: { type: String, enum: ['planned', 'implemented', 'tested', 'optimized'] }
  }],
  
  mitigations: [{
    mitigationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mitigation' },
    status: { type: String, enum: ['planned', 'in_progress', 'completed', 'cancelled'] },
    effectiveness: { type: Number, min: 0, max: 100 }
  }],
  
  // Compliance mapping
  compliance: [{
    framework: { type: String, enum: ['NIST-CSF', 'ISO27001', 'PCI-DSS', 'HIPAA', 'SOX', 'GDPR', 'CCPA'] },
    requirements: [{
      requirementId: String,
      description: String,
      compliance: { type: String, enum: ['compliant', 'non_compliant', 'not_applicable'] },
      evidence: String
    }],
    overallCompliance: { type: Number, min: 0, max: 100 }
  }],
  
  // Financial impact analysis
  financialImpact: {
    totalPotentialLoss: { type: Number, min: 0 },
    annualizedLossExpectancy: { type: Number, min: 0 },
    riskAdjustedValue: { type: Number, min: 0 },
    insuranceCoverage: { type: Number, min: 0 },
    currency: { type: String, default: 'USD' }
  },
  
  // Operational impact
  operationalImpact: {
    downtime: { type: Number, min: 0 }, // hours
    productivityLoss: { type: Number, min: 0, max: 100 }, // percentage
    recoveryTime: { type: Number, min: 0 }, // hours
    alternativeProcesses: { type: Boolean, default: false }
  },
  
  // Reporting and documentation
  reports: [{
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'RiskReport' },
    type: { type: String, enum: ['executive', 'technical', 'compliance', 'detailed'] },
    generatedDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['draft', 'final', 'archived'], default: 'draft' }
  }],
  
  // Approval and review
  approval: {
    required: { type: Boolean, default: true },
    approvers: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: String,
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      date: Date,
      comments: String
    }],
    finalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    approvedDate: Date
  },
  
  // Quality assurance
  qualityAssurance: {
    reviewed: { type: Boolean, default: false },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewDate: Date,
    issues: [{
      issueId: String,
      description: String,
      severity: { type: String, enum: ['critical', 'major', 'minor'] },
      status: { type: String, enum: ['open', 'resolved', 'accepted'], default: 'open' },
      resolution: String
    }],
    approved: { type: Boolean, default: false }
  },
  
  // Audit trail
  auditTrail: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'status_changed', 'approved', 'reviewed', 'reported']
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
riskAssessmentSchema.index({ assessmentId: 1 });
riskAssessmentSchema.index({ type: 1, status: 1 });
riskAssessmentSchema.index({ 'schedule.startDate': -1 });
riskAssessmentSchema.index({ 'riskAnalysis.overallRiskScore': -1 });
riskAssessmentSchema.index({ createdBy: 1 });

// Virtual for duration
riskAssessmentSchema.virtual('duration').get(function() {
  if (this.schedule.actualStartDate && this.schedule.actualEndDate) {
    return Math.ceil((this.schedule.actualEndDate - this.schedule.actualStartDate) / (1000 * 60 * 60 * 24));
  }
  return Math.ceil((this.schedule.endDate - this.schedule.startDate) / (1000 * 60 * 60 * 24));
});

// Virtual for risk level
riskAssessmentSchema.virtual('riskLevel').get(function() {
  const score = this.riskAnalysis.overallRiskScore;
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  if (score >= 20) return 'low';
  return 'very_low';
});

// Pre-save middleware
riskAssessmentSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.version += 1;
    this.updatedBy = this.updatedBy || this.createdBy;
  }
  next();
});

// Instance methods
riskAssessmentSchema.methods.calculateOverallRiskScore = function() {
  if (this.threats.length === 0) return 0;
  
  const totalRiskScore = this.threats.reduce((sum, threat) => sum + threat.riskScore, 0);
  this.riskAnalysis.overallRiskScore = Math.round((totalRiskScore / this.threats.length) * 4); // Scale to 0-100
  return this.riskAnalysis.overallRiskScore;
};

riskAssessmentSchema.methods.updateProgress = function(percentage, phase, updatedBy) {
  this.progress.percentage = Math.min(100, Math.max(0, percentage));
  if (phase) this.progress.currentPhase = phase;
  
  this.auditTrail.push({
    action: 'updated',
    userId: updatedBy,
    details: { progress: this.progress.percentage, phase: this.progress.currentPhase }
  });
};

riskAssessmentSchema.methods.addAuditEntry = function(action, userId, details, ipAddress) {
  this.auditTrail.push({
    action,
    userId,
    details,
    ipAddress
  });
};

// Static methods
riskAssessmentSchema.statics.findByType = function(type) {
  return this.find({ type });
};

riskAssessmentSchema.statics.findHighRisk = function(threshold = 70) {
  return this.find({ 'riskAnalysis.overallRiskScore': { $gte: threshold } });
};

riskAssessmentSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

riskAssessmentSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        byType: { $push: '$type' },
        byStatus: { $push: '$status' },
        averageRiskScore: { $avg: '$riskAnalysis.overallRiskScore' },
        maxRiskScore: { $max: '$riskAnalysis.overallRiskScore' },
        minRiskScore: { $min: '$riskAnalysis.overallRiskScore' }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    byType: [],
    byStatus: [],
    averageRiskScore: 0,
    maxRiskScore: 0,
    minRiskScore: 0
  };
};

module.exports = mongoose.model('RiskAssessment', riskAssessmentSchema);
