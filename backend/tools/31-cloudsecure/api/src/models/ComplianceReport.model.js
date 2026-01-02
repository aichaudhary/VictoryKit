const mongoose = require('mongoose');

const complianceReportSchema = new mongoose.Schema({
  // Report identification
  reportId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Framework
  framework: {
    type: String,
    required: true,
    enum: ['CIS', 'SOC2', 'PCI-DSS', 'HIPAA', 'GDPR', 'NIST', 'ISO27001', 'FedRAMP', 'CCPA']
  },
  frameworkVersion: String,
  
  // Scope
  provider: {
    type: String,
    enum: ['aws', 'azure', 'gcp', 'multi-cloud']
  },
  accountIds: [String],
  regions: [String],
  
  // Report period
  periodStart: Date,
  periodEnd: Date,
  generatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Overall score
  overallScore: {
    type: Number,
    min: 0,
    max: 100
  },
  previousScore: Number,
  scoreTrend: {
    type: String,
    enum: ['improving', 'stable', 'declining']
  },
  
  // Control assessment
  controlSummary: {
    total: Number,
    passed: Number,
    failed: Number,
    notApplicable: Number,
    manual: Number
  },
  
  // Detailed controls
  controls: [{
    controlId: String,
    controlName: String,
    section: String,
    description: String,
    status: {
      type: String,
      enum: ['passed', 'failed', 'not-applicable', 'manual-review', 'partial']
    },
    severity: String,
    findings: [String], // Finding IDs
    resources: [{
      resourceId: String,
      resourceName: String,
      status: String
    }],
    evidence: mongoose.Schema.Types.Mixed,
    remediation: String
  }],
  
  // Risk summary
  riskSummary: {
    criticalRisks: Number,
    highRisks: Number,
    mediumRisks: Number,
    lowRisks: Number,
    topRisks: [{
      description: String,
      impact: String,
      recommendation: String
    }]
  },
  
  // Recommendations
  recommendations: [{
    priority: {
      type: String,
      enum: ['immediate', 'short-term', 'long-term']
    },
    category: String,
    description: String,
    expectedImprovement: Number,
    affectedControls: [String]
  }],
  
  // Export
  exportFormats: {
    pdf: String,
    csv: String,
    json: String,
    html: String
  },
  
  // Scan reference
  scanId: String,
  
  // Organization
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    index: true
  }
}, {
  timestamps: true,
  collection: 'compliance_reports'
});

// Indexes
complianceReportSchema.index({ framework: 1, generatedAt: -1 });
complianceReportSchema.index({ organizationId: 1, framework: 1 });

module.exports = mongoose.model('ComplianceReport', complianceReportSchema);
