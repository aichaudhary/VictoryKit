const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  policyId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  policyName: {
    type: String,
    required: true
  },
  policyNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'access_control',
      'data_protection',
      'network_security',
      'incident_response',
      'asset_management',
      'change_management',
      'business_continuity',
      'physical_security',
      'hr_security',
      'compliance',
      'cryptography',
      'system_hardening',
      'vendor_management',
      'other'
    ]
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'under_review', 'approved', 'published', 'archived', 'deprecated'],
    default: 'draft'
  },
  version: {
    current: { type: String, required: true, default: '1.0' },
    major: { type: Number, default: 1 },
    minor: { type: Number, default: 0 },
    patch: { type: Number, default: 0 }
  },
  content: {
    purpose: { type: String, required: true },
    scope: { type: String, required: true },
    policyStatement: { type: String, required: true },
    responsibilities: [{
      role: String,
      responsibility: String
    }],
    procedures: [String],
    definitions: [{
      term: String,
      definition: String
    }],
    references: [String],
    exceptions: String,
    enforcement: String
  },
  framework: {
    baseFramework: {
      type: String,
      enum: ['NIST', 'ISO27001', 'CIS', 'PCI-DSS', 'HIPAA', 'GDPR', 'custom']
    },
    mappings: [{
      framework: String,
      controlId: String,
      controlName: String,
      coverage: { type: String, enum: ['full', 'partial', 'none'] }
    }]
  },
  compliance: {
    mandates: [String],  // GDPR, HIPAA, PCI-DSS, SOX
    effectiveDate: Date,
    reviewDate: Date,
    nextReviewDate: Date,
    reviewCycle: { type: String, enum: ['monthly', 'quarterly', 'semi_annual', 'annual'] },
    attestationRequired: { type: Boolean, default: false }
  },
  approval: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    approvers: [{
      userId: String,
      userName: String,
      role: String,
      approvalDate: Date,
      status: { type: String, enum: ['pending', 'approved', 'rejected'] },
      comments: String
    }],
    finalApprovalDate: Date,
    approvedBy: String
  },
  enforcement: {
    automated: { type: Boolean, default: false },
    enforcementMechanism: String,  // OPA, Sentinel, AWS SCP, Azure Policy
    codeRepository: String,
    monitoringEnabled: { type: Boolean, default: true },
    violationAction: {
      type: String,
      enum: ['alert', 'block', 'quarantine', 'log']
    }
  },
  metrics: {
    complianceRate: { type: Number, min: 0, max: 100 },
    violationCount: { type: Number, default: 0 },
    exceptionCount: { type: Number, default: 0 },
    lastComplianceCheck: Date,
    enforcementSuccess: { type: Number, min: 0, max: 100 }
  },
  applicability: {
    scope: { type: String, enum: ['organization', 'department', 'system', 'application'] },
    departments: [String],
    systems: [String],
    userGroups: [String],
    excludedEntities: [String]
  },
  owner: {
    userId: String,
    userName: String,
    email: String,
    department: String
  },
  metadata: {
    tags: [String],
    criticality: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    relatedPolicies: [String],
    supersedes: String,  // Policy ID this replaces
    customFields: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
policySchema.index({ category: 1, status: 1 });
policySchema.index({ 'compliance.mandates': 1 });
policySchema.index({ 'applicability.scope': 1 });
policySchema.index({ 'owner.userId': 1 });

// Methods
policySchema.methods.incrementVersion = function(type = 'minor') {
  if (type === 'major') {
    this.version.major += 1;
    this.version.minor = 0;
    this.version.patch = 0;
  } else if (type === 'minor') {
    this.version.minor += 1;
    this.version.patch = 0;
  } else {
    this.version.patch += 1;
  }
  this.version.current = `${this.version.major}.${this.version.minor}.${this.version.patch}`;
};

policySchema.methods.updateComplianceMetrics = function(data) {
  this.metrics.complianceRate = data.complianceRate;
  this.metrics.violationCount = data.violationCount || this.metrics.violationCount;
  this.metrics.lastComplianceCheck = new Date();
};

module.exports = mongoose.model('Policy', policySchema);
