/**
 * ComplianceAssessment Model - Full Assessment Tracking
 * Tool 09 - ComplianceCheck
 * 
 * Comprehensive assessment schema with control status,
 * gap analysis, remediation tracking, and AI insights
 */

const mongoose = require('mongoose');

const controlAssessmentSchema = new mongoose.Schema({
  controlId: { type: String, required: true },
  frameworkId: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String },
  subcategory: { type: String },
  
  // Assessment Status
  status: { 
    type: String, 
    enum: ['not-assessed', 'passed', 'failed', 'partial', 'not-applicable', 'in-review'], 
    default: 'not-assessed' 
  },
  previousStatus: { type: String },
  statusChangedAt: { type: Date },
  
  // Scoring
  score: { type: Number, min: 0, max: 100 },
  weight: { type: Number, default: 1 },
  priority: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium'
  },
  
  // Assessment Details
  assessment: {
    method: { type: String, enum: ['manual', 'automated', 'hybrid'], default: 'manual' },
    automationSource: { type: String }, // e.g., 'vanta', 'aws-config'
    assessedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assessedAt: { type: Date },
    notes: { type: String },
    testingPerformed: [{ type: String }]
  },
  
  // Evidence References
  evidenceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ComplianceEvidence' }],
  evidenceStatus: {
    type: String,
    enum: ['none', 'partial', 'complete', 'expired'],
    default: 'none'
  },
  
  // Gap & Risk Analysis
  gap: {
    identified: { type: Boolean, default: false },
    description: { type: String },
    riskLevel: { type: String, enum: ['critical', 'high', 'medium', 'low', 'info'] },
    businessImpact: { type: String },
    likelihood: { type: String, enum: ['very-high', 'high', 'medium', 'low', 'very-low'] },
    riskScore: { type: Number, min: 0, max: 100 }
  },
  
  // Remediation Tracking
  remediation: {
    required: { type: Boolean, default: false },
    plan: { type: String },
    steps: [{ 
      description: String, 
      completed: { type: Boolean, default: false },
      completedAt: Date 
    }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ownerEmail: { type: String },
    dueDate: { type: Date },
    estimatedEffort: { type: String }, // e.g., '2 days', '1 week'
    priority: { type: String, enum: ['immediate', 'short-term', 'long-term'] },
    status: { 
      type: String, 
      enum: ['not-started', 'in-progress', 'blocked', 'completed', 'deferred'], 
      default: 'not-started' 
    },
    completedAt: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date }
  },
  
  // AI Analysis
  aiInsights: {
    suggestedStatus: { type: String },
    confidence: { type: Number, min: 0, max: 100 },
    reasoning: { type: String },
    suggestedRemediation: [{ type: String }],
    relatedControls: [{ type: String }], // Related controls from other frameworks
    automatedEvidence: [{ type: String }],
    lastAnalyzedAt: { type: Date }
  },
  
  // History
  history: [{
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    field: { type: String },
    oldValue: { type: mongoose.Schema.Types.Mixed },
    newValue: { type: mongoose.Schema.Types.Mixed },
    reason: { type: String }
  }]
}, { _id: false });

const assessmentSummarySchema = new mongoose.Schema({
  frameworkId: { type: String, required: true },
  frameworkName: { type: String },
  totalControls: { type: Number, default: 0 },
  assessedControls: { type: Number, default: 0 },
  passedControls: { type: Number, default: 0 },
  failedControls: { type: Number, default: 0 },
  partialControls: { type: Number, default: 0 },
  notApplicableControls: { type: Number, default: 0 },
  complianceScore: { type: Number, min: 0, max: 100 },
  maturityLevel: { type: Number, min: 1, max: 5 },
  categoryScores: [{
    category: String,
    score: Number,
    passedCount: Number,
    totalCount: Number
  }]
}, { _id: false });

const complianceAssessmentSchema = new mongoose.Schema({
  // Identification
  assessmentId: { 
    type: String, 
    required: true, 
    unique: true,
    default: function() {
      return `ASSESS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
  },
  name: { type: String, required: true },
  description: { type: String },
  
  // Organization & Ownership
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  organizationName: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ownerEmail: { type: String },
  
  // Scope
  scope: {
    frameworks: [{
      frameworkId: String,
      frameworkName: String,
      version: String
    }],
    departments: [{ type: String }],
    systems: [{
      name: String,
      type: { type: String },
      criticality: { type: String, enum: ['critical', 'high', 'medium', 'low'] }
    }],
    dataTypes: [{ type: String }],
    regions: [{ type: String }],
    excludedAreas: [{ type: String }]
  },
  
  // Assessment Type & Method
  assessmentType: {
    type: String,
    enum: ['initial', 'periodic', 'readiness', 'gap-analysis', 'certification-prep', 'continuous'],
    default: 'periodic'
  },
  assessmentMethod: {
    type: String,
    enum: ['self-assessment', 'internal-audit', 'external-audit', 'automated', 'hybrid'],
    default: 'hybrid'
  },
  
  // Schedule
  schedule: {
    startDate: { type: Date },
    targetEndDate: { type: Date },
    actualEndDate: { type: Date },
    lastModified: { type: Date }
  },
  
  // Status & Progress
  status: { 
    type: String, 
    enum: ['draft', 'in-progress', 'under-review', 'pending-approval', 'completed', 'archived', 'cancelled'], 
    default: 'draft' 
  },
  progress: {
    overall: { type: Number, min: 0, max: 100, default: 0 },
    evidenceCollection: { type: Number, min: 0, max: 100, default: 0 },
    controlAssessment: { type: Number, min: 0, max: 100, default: 0 },
    gapRemediation: { type: Number, min: 0, max: 100, default: 0 }
  },
  
  // Control Assessments
  controls: [controlAssessmentSchema],
  
  // Framework Summaries
  frameworkSummaries: [assessmentSummarySchema],
  
  // Overall Results
  results: {
    overallScore: { type: Number, min: 0, max: 100 },
    overallMaturity: { type: Number, min: 1, max: 5 },
    riskLevel: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low', 'minimal'],
      default: 'medium'
    },
    totalControls: { type: Number, default: 0 },
    passedControls: { type: Number, default: 0 },
    failedControls: { type: Number, default: 0 },
    partialControls: { type: Number, default: 0 },
    notApplicable: { type: Number, default: 0 },
    notAssessed: { type: Number, default: 0 },
    criticalGaps: { type: Number, default: 0 },
    highGaps: { type: Number, default: 0 },
    pendingRemediations: { type: Number, default: 0 }
  },
  
  // AI Analysis
  aiAnalysis: {
    executiveSummary: { type: String },
    keyFindings: [{ type: String }],
    criticalGaps: [{
      controlId: String,
      description: String,
      businessImpact: String,
      recommendedAction: String
    }],
    strengthAreas: [{ type: String }],
    improvementAreas: [{ type: String }],
    recommendations: [{
      priority: { type: String, enum: ['immediate', 'short-term', 'long-term'] },
      category: String,
      recommendation: String,
      estimatedEffort: String,
      businessValue: String
    }],
    complianceRoadmap: [{
      phase: Number,
      title: String,
      description: String,
      duration: String,
      dependencies: [String]
    }],
    estimatedRemediationTime: { type: String },
    confidenceScore: { type: Number, min: 0, max: 100 },
    lastAnalyzedAt: { type: Date }
  },
  
  // Integration Data
  integrations: {
    vanta: {
      connected: { type: Boolean, default: false },
      assessmentId: String,
      lastSyncAt: Date,
      syncStatus: { type: String, enum: ['synced', 'pending', 'error'] }
    },
    drata: {
      connected: { type: Boolean, default: false },
      assessmentId: String,
      lastSyncAt: Date,
      syncStatus: { type: String, enum: ['synced', 'pending', 'error'] }
    },
    awsAuditManager: {
      connected: { type: Boolean, default: false },
      assessmentArn: String,
      lastSyncAt: Date
    }
  },
  
  // Audit Trail
  auditLog: [{
    action: { type: String },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    performedAt: { type: Date, default: Date.now },
    details: { type: mongoose.Schema.Types.Mixed },
    ipAddress: { type: String }
  }],
  
  // Report Generation
  reports: [{
    reportId: String,
    type: { type: String, enum: ['summary', 'detailed', 'executive', 'gap-analysis', 'remediation'] },
    format: { type: String, enum: ['pdf', 'html', 'excel', 'json'] },
    generatedAt: Date,
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    url: String,
    expiresAt: Date
  }],
  
  // Metadata
  tags: [{ type: String }],
  notes: { type: String },
  isTemplate: { type: Boolean, default: false },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'ComplianceAssessment' }
}, {
  timestamps: true,
  collection: 'compliance_assessments'
});

// Indexes
complianceAssessmentSchema.index({ assessmentId: 1 }, { unique: true });
complianceAssessmentSchema.index({ organizationId: 1, status: 1 });
complianceAssessmentSchema.index({ createdBy: 1, status: 1 });
complianceAssessmentSchema.index({ 'scope.frameworks.frameworkId': 1 });
complianceAssessmentSchema.index({ 'results.riskLevel': 1 });
complianceAssessmentSchema.index({ status: 1, 'schedule.targetEndDate': 1 });
complianceAssessmentSchema.index({ 'controls.controlId': 1 });

// Virtual for completion percentage
complianceAssessmentSchema.virtual('completionPercentage').get(function() {
  if (!this.controls || this.controls.length === 0) return 0;
  const assessed = this.controls.filter(c => c.status !== 'not-assessed').length;
  return Math.round((assessed / this.controls.length) * 100);
});

// Methods
complianceAssessmentSchema.methods.calculateResults = function() {
  const results = {
    totalControls: this.controls.length,
    passedControls: 0,
    failedControls: 0,
    partialControls: 0,
    notApplicable: 0,
    notAssessed: 0,
    criticalGaps: 0,
    highGaps: 0,
    pendingRemediations: 0
  };

  this.controls.forEach(control => {
    switch (control.status) {
      case 'passed': results.passedControls++; break;
      case 'failed': results.failedControls++; break;
      case 'partial': results.partialControls++; break;
      case 'not-applicable': results.notApplicable++; break;
      default: results.notAssessed++;
    }

    if (control.gap?.identified) {
      if (control.gap.riskLevel === 'critical') results.criticalGaps++;
      else if (control.gap.riskLevel === 'high') results.highGaps++;
    }

    if (control.remediation?.required && control.remediation.status !== 'completed') {
      results.pendingRemediations++;
    }
  });

  const applicableControls = results.totalControls - results.notApplicable;
  results.overallScore = applicableControls > 0
    ? Math.round(((results.passedControls + (results.partialControls * 0.5)) / applicableControls) * 100)
    : 0;

  // Determine risk level
  if (results.overallScore < 50 || results.criticalGaps > 0) results.riskLevel = 'critical';
  else if (results.overallScore < 70 || results.highGaps > 2) results.riskLevel = 'high';
  else if (results.overallScore < 85) results.riskLevel = 'medium';
  else if (results.overallScore < 95) results.riskLevel = 'low';
  else results.riskLevel = 'minimal';

  // Determine maturity level
  if (results.overallScore < 20) results.overallMaturity = 1;
  else if (results.overallScore < 40) results.overallMaturity = 2;
  else if (results.overallScore < 60) results.overallMaturity = 3;
  else if (results.overallScore < 80) results.overallMaturity = 4;
  else results.overallMaturity = 5;

  this.results = results;
  return results;
};

complianceAssessmentSchema.methods.getControlById = function(controlId) {
  return this.controls.find(c => c.controlId === controlId);
};

complianceAssessmentSchema.methods.updateControlStatus = function(controlId, status, assessedBy, notes) {
  const control = this.controls.find(c => c.controlId === controlId);
  if (control) {
    control.previousStatus = control.status;
    control.status = status;
    control.statusChangedAt = new Date();
    control.assessment = {
      ...control.assessment,
      assessedBy,
      assessedAt: new Date(),
      notes
    };
    control.history.push({
      changedAt: new Date(),
      changedBy: assessedBy,
      field: 'status',
      oldValue: control.previousStatus,
      newValue: status,
      reason: notes
    });
  }
  return control;
};

complianceAssessmentSchema.methods.addAuditLog = function(action, userId, details, ipAddress) {
  this.auditLog.push({
    action,
    performedBy: userId,
    performedAt: new Date(),
    details,
    ipAddress
  });
};

// Static methods
complianceAssessmentSchema.statics.getActiveAssessments = function(organizationId) {
  return this.find({ 
    organizationId, 
    status: { $in: ['draft', 'in-progress', 'under-review'] } 
  }).sort({ updatedAt: -1 });
};

complianceAssessmentSchema.statics.getAssessmentsByFramework = function(frameworkId) {
  return this.find({ 
    'scope.frameworks.frameworkId': frameworkId,
    status: { $ne: 'cancelled' }
  });
};

complianceAssessmentSchema.statics.getAssessmentSummary = function(assessmentId) {
  return this.findOne({ assessmentId })
    .select('assessmentId name status results progress frameworkSummaries schedule')
    .lean();
};

module.exports = mongoose.model('ComplianceAssessment', complianceAssessmentSchema);
