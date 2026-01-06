const mongoose = require('mongoose');

const complianceCheckSchema = new mongoose.Schema({
  checkId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  policyId: {
    type: String,
    required: true,
    index: true
  },
  policyName: String,
  checkType: {
    type: String,
    required: true,
    enum: ['manual', 'automated', 'continuous', 'scheduled']
  },
  scope: {
    type: String,
    required: true,
    enum: ['organization', 'department', 'system', 'user', 'application']
  },
  scopeId: String,
  scopeName: String,
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending'
  },
  result: {
    overall: {
      type: String,
      enum: ['compliant', 'non_compliant', 'partial', 'not_applicable']
    },
    complianceScore: { type: Number, min: 0, max: 100 },
    totalControls: Number,
    compliantControls: Number,
    nonCompliantControls: Number,
    notApplicableControls: Number
  },
  findings: [{
    findingId: String,
    severity: { type: String, enum: ['critical', 'high', 'medium', 'low', 'info'] },
    control: String,
    requirement: String,
    finding: String,
    evidence: String,
    remediation: String,
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'accepted_risk'] },
    assignedTo: String,
    dueDate: Date
  }],
  violations: [{
    violationId: String,
    timestamp: Date,
    violationType: String,
    severity: String,
    entity: String,
    entityType: String,
    description: String,
    automaticRemediation: Boolean,
    remediationStatus: String
  }],
  evidence: [{
    evidenceType: String,
    description: String,
    source: String,
    collectedAt: Date,
    filePath: String,
    hash: String
  }],
  schedule: {
    frequency: { type: String, enum: ['hourly', 'daily', 'weekly', 'monthly', 'quarterly'] },
    nextRun: Date,
    lastRun: Date
  },
  execution: {
    startTime: Date,
    endTime: Date,
    duration: Number,  // milliseconds
    executor: String,
    automated: Boolean
  },
  metadata: {
    triggeredBy: String,
    reason: String,
    notes: String
  }
}, {
  timestamps: true
});

// Indexes
complianceCheckSchema.index({ policyId: 1, status: 1 });
complianceCheckSchema.index({ scope: 1, scopeId: 1 });
complianceCheckSchema.index({ 'result.overall': 1 });
complianceCheckSchema.index({ 'execution.startTime': -1 });

// Methods
complianceCheckSchema.methods.calculateComplianceScore = function() {
  if (this.result.totalControls === 0) return 0;
  const score = (this.result.compliantControls / this.result.totalControls) * 100;
  this.result.complianceScore = Math.round(score);
  return this.result.complianceScore;
};

complianceCheckSchema.methods.addViolation = function(violation) {
  this.violations.push({
    violationId: `viol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    ...violation
  });
  this.result.nonCompliantControls += 1;
  this.calculateComplianceScore();
};

module.exports = mongoose.model('ComplianceCheck', complianceCheckSchema);
