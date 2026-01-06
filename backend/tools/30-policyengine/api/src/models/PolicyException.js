const mongoose = require('mongoose');

const policyExceptionSchema = new mongoose.Schema({
  exceptionId: {
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
  status: {
    type: String,
    required: true,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'expired', 'revoked'],
    default: 'pending'
  },
  requestor: {
    userId: String,
    userName: String,
    email: String,
    department: String
  },
  justification: {
    businessReason: { type: String, required: true },
    technicalReason: String,
    urgency: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    impact: String
  },
  scope: {
    type: { type: String, enum: ['user', 'system', 'application', 'department', 'organization'] },
    targetEntity: String,
    targetId: String,
    affectedControls: [String]
  },
  duration: {
    startDate: Date,
    endDate: Date,
    duration: String,  // 30d, 90d, 180d, permanent
    permanent: { type: Boolean, default: false }
  },
  riskAssessment: {
    riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    riskScore: { type: Number, min: 0, max: 100 },
    impactAnalysis: String,
    likelihoodAssessment: String,
    residualRisk: String
  },
  compensatingControls: [{
    controlId: String,
    controlName: String,
    description: String,
    effectiveness: { type: String, enum: ['low', 'medium', 'high'] },
    implementationStatus: { type: String, enum: ['planned', 'implemented', 'verified'] }
  }],
  approval: {
    required: [String],  // List of required approver roles
    approvals: [{
      approverId: String,
      approverName: String,
      approverRole: String,
      decision: { type: String, enum: ['approved', 'rejected', 'pending'] },
      decisionDate: Date,
      comments: String
    }],
    finalDecision: {
      type: String,
      enum: ['approved', 'rejected', 'pending'],
      default: 'pending'
    },
    finalDecisionDate: Date,
    finalDecisionBy: String
  },
  monitoring: {
    reviewFrequency: { type: String, enum: ['weekly', 'monthly', 'quarterly'] },
    lastReviewDate: Date,
    nextReviewDate: Date,
    complianceChecks: Number,
    violations: Number
  },
  audit: {
    created: Date,
    updated: Date,
    statusHistory: [{
      status: String,
      timestamp: Date,
      changedBy: String,
      reason: String
    }]
  },
  metadata: {
    tags: [String],
    relatedExceptions: [String],
    attachments: [{
      filename: String,
      url: String,
      uploadedAt: Date
    }]
  }
}, {
  timestamps: true
});

// Indexes
policyExceptionSchema.index({ policyId: 1, status: 1 });
policyExceptionSchema.index({ 'requestor.userId': 1 });
policyExceptionSchema.index({ 'duration.endDate': 1 });
policyExceptionSchema.index({ 'approval.finalDecision': 1 });

// Methods
policyExceptionSchema.methods.checkExpiration = function() {
  if (this.duration.permanent) return false;
  if (this.duration.endDate < new Date()) {
    this.status = 'expired';
    return true;
  }
  return false;
};

policyExceptionSchema.methods.addApproval = function(approval) {
  this.approval.approvals.push({
    ...approval,
    decisionDate: new Date()
  });
  
  // Check if all required approvals are obtained
  const requiredRoles = this.approval.required;
  const approvedRoles = this.approval.approvals
    .filter(a => a.decision === 'approved')
    .map(a => a.approverRole);
  
  const allApproved = requiredRoles.every(role => approvedRoles.includes(role));
  
  if (allApproved) {
    this.approval.finalDecision = 'approved';
    this.approval.finalDecisionDate = new Date();
    this.status = 'approved';
  }
};

module.exports = mongoose.model('PolicyException', policyExceptionSchema);
