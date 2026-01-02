const mongoose = require('mongoose');

const securityScanSchema = new mongoose.Schema({
  // Scan identification
  scanId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Scan configuration
  scanType: {
    type: String,
    required: true,
    enum: ['full', 'compliance', 'configuration', 'iam', 'network', 'data', 'quick']
  },
  
  // Scope
  providers: [{
    type: String,
    enum: ['aws', 'azure', 'gcp', 'kubernetes']
  }],
  regions: [String],
  accountIds: [String],
  resourceTypes: [String],
  
  // Compliance frameworks to check
  complianceFrameworks: [{
    type: String,
    enum: ['CIS', 'SOC2', 'PCI-DSS', 'HIPAA', 'GDPR', 'NIST', 'ISO27001', 'FedRAMP', 'CCPA']
  }],
  
  // Scan execution
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  currentResource: String,
  currentPhase: String,
  
  // Timing
  scheduledAt: Date,
  startedAt: Date,
  completedAt: Date,
  duration: Number, // in seconds
  
  // Results summary
  results: {
    totalResources: { type: Number, default: 0 },
    resourcesScanned: { type: Number, default: 0 },
    totalFindings: { type: Number, default: 0 },
    findingsBySeverity: {
      critical: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
      info: { type: Number, default: 0 }
    },
    findingsByCategory: mongoose.Schema.Types.Mixed,
    findingsByProvider: mongoose.Schema.Types.Mixed,
    newFindings: { type: Number, default: 0 },
    resolvedFindings: { type: Number, default: 0 }
  },
  
  // Security posture score
  securityScore: {
    overall: { type: Number, min: 0, max: 100 },
    byProvider: {
      aws: { type: Number, min: 0, max: 100 },
      azure: { type: Number, min: 0, max: 100 },
      gcp: { type: Number, min: 0, max: 100 }
    },
    byCategory: mongoose.Schema.Types.Mixed,
    trend: {
      type: String,
      enum: ['improving', 'stable', 'declining']
    },
    previousScore: Number
  },
  
  // Compliance status
  complianceStatus: [{
    framework: String,
    score: Number,
    passedControls: Number,
    failedControls: Number,
    totalControls: Number
  }],
  
  // Errors
  errors: [{
    resource: String,
    message: String,
    code: String,
    timestamp: Date
  }],
  
  // Triggered by
  triggeredBy: {
    type: String,
    enum: ['manual', 'scheduled', 'webhook', 'api', 'drift-detection']
  },
  triggeredByUserId: String,
  
  // Organization
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    index: true
  }
}, {
  timestamps: true,
  collection: 'security_scans'
});

// Indexes
securityScanSchema.index({ status: 1, startedAt: -1 });
securityScanSchema.index({ organizationId: 1, createdAt: -1 });

module.exports = mongoose.model('SecurityScan', securityScanSchema);
