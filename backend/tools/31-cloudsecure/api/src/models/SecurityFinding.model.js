const mongoose = require('mongoose');

const securityFindingSchema = new mongoose.Schema({
  // Finding identification
  findingId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Affected resource
  resourceId: {
    type: String,
    required: true,
    index: true
  },
  resourceArn: String,
  resourceName: String,
  resourceType: String,
  
  // Provider info
  provider: {
    type: String,
    required: true,
    enum: ['aws', 'azure', 'gcp', 'kubernetes', 'multi-cloud']
  },
  region: String,
  accountId: String,
  
  // Finding details
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'identity-access',
      'data-protection',
      'network-security',
      'logging-monitoring',
      'encryption',
      'vulnerability',
      'misconfiguration',
      'compliance',
      'secrets-management',
      'container-security',
      'serverless-security',
      'storage-security',
      'compute-security',
      'database-security'
    ]
  },
  
  // Severity
  severity: {
    type: String,
    required: true,
    enum: ['critical', 'high', 'medium', 'low', 'info']
  },
  severityScore: {
    type: Number,
    min: 0,
    max: 10
  },
  
  // Compliance mapping
  compliance: [{
    framework: {
      type: String,
      enum: ['CIS', 'SOC2', 'PCI-DSS', 'HIPAA', 'GDPR', 'NIST', 'ISO27001', 'FedRAMP', 'CCPA']
    },
    control: String,
    requirement: String
  }],
  
  // Remediation
  recommendation: {
    type: String,
    required: true
  },
  remediationSteps: [String],
  remediationCode: {
    terraform: String,
    cloudformation: String,
    azureArm: String,
    cli: String,
    console: String
  },
  remediationEffort: {
    type: String,
    enum: ['immediate', 'short-term', 'long-term'],
    default: 'short-term'
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'suppressed', 'false-positive', 'accepted-risk'],
    default: 'open'
  },
  statusHistory: [{
    status: String,
    changedBy: String,
    changedAt: Date,
    reason: String
  }],
  
  // Risk assessment
  exploitability: {
    type: String,
    enum: ['easy', 'moderate', 'difficult', 'theoretical']
  },
  attackVector: String,
  impactDescription: String,
  
  // Attack path
  isPartOfAttackPath: {
    type: Boolean,
    default: false
  },
  attackPathId: String,
  attackPathStep: Number,
  
  // Detection info
  detectedBy: {
    type: String,
    enum: ['prowler', 'scoutsuite', 'cloudsploit', 'native-api', 'manual', 'ai-detection']
  },
  checkId: String,
  ruleId: String,
  
  // Timestamps
  firstSeenAt: {
    type: Date,
    default: Date.now
  },
  lastSeenAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: Date,
  
  // Evidence
  evidence: mongoose.Schema.Types.Mixed,
  
  // Organization
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    index: true
  },
  
  // Assignee
  assignedTo: String,
  assignedAt: Date
}, {
  timestamps: true,
  collection: 'security_findings'
});

// Indexes
securityFindingSchema.index({ severity: 1, status: 1 });
securityFindingSchema.index({ provider: 1, category: 1 });
securityFindingSchema.index({ 'compliance.framework': 1 });
securityFindingSchema.index({ firstSeenAt: -1 });

module.exports = mongoose.model('SecurityFinding', securityFindingSchema);
