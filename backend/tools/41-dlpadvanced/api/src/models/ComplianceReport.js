const mongoose = require('mongoose');

const complianceReportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    required: true,
    unique: true,
    default: () => `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },
  
  // Report Information
  framework: {
    type: String,
    enum: ['GDPR', 'HIPAA', 'PCI-DSS', 'SOC2', 'ISO27001', 'CCPA', 'NIST', 'FedRAMP', 'Custom'],
    required: true
  },
  reportType: {
    type: String,
    enum: ['audit', 'assessment', 'gap_analysis', 'remediation', 'quarterly', 'annual'],
    required: true
  },
  
  // Timing
  reportingPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Overall Status
  overallStatus: {
    type: String,
    enum: ['compliant', 'non_compliant', 'partial_compliance', 'under_review'],
    required: true
  },
  complianceScore: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Requirements Assessment
  requirements: [{
    requirementId: String,
    category: String,
    title: String,
    description: String,
    status: {
      type: String,
      enum: ['met', 'not_met', 'partial', 'not_applicable', 'in_progress']
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    evidence: [{
      type: String,
      description: String,
      documentPath: String,
      timestamp: Date
    }],
    controls: [{
      controlId: String,
      name: String,
      implemented: Boolean,
      effectiveness: String
    }],
    findings: [{
      finding: String,
      severity: String,
      remediation: String
    }],
    lastAssessed: Date,
    assessedBy: String
  }],
  
  // Gaps Identified
  gaps: [{
    gapId: String,
    requirement: String,
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    impact: String,
    recommendations: [String],
    remediationPlan: {
      steps: [String],
      estimatedEffort: String,
      assignedTo: String,
      dueDate: Date,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'deferred']
      }
    },
    identifiedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Data Protection Measures
  dataProtection: {
    encryptionCoverage: {
      type: Number,
      min: 0,
      max: 100
    },
    sensitiveDataInventory: {
      total: Number,
      classified: Number,
      protected: Number
    },
    accessControls: {
      implemented: Boolean,
      effectiveness: String,
      exceptions: Number
    },
    dataRetention: {
      policyDefined: Boolean,
      policyEnforced: Boolean,
      expiryTracked: Boolean
    }
  },
  
  // Incident Summary
  incidentSummary: {
    totalIncidents: Number,
    bySerity: {
      low: Number,
      medium: Number,
      high: Number,
      critical: Number
    },
    resolved: Number,
    avgResolutionTime: Number, // hours
    breaches: Number,
    reportable: Number // Incidents requiring regulatory reporting
  },
  
  // Policy Compliance
  policyCompliance: {
    totalPolicies: Number,
    activePolicies: Number,
    violations: Number,
    effectiveness: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  
  // Training & Awareness
  trainingCompliance: {
    totalEmployees: Number,
    trainingCompleted: Number,
    complianceRate: {
      type: Number,
      min: 0,
      max: 100
    },
    overdue: Number
  },
  
  // Risk Assessment
  riskAssessment: {
    overallRisk: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    highRiskUsers: Number,
    highRiskData: Number,
    riskTrend: {
      type: String,
      enum: ['improving', 'stable', 'worsening']
    },
    topRisks: [{
      risk: String,
      likelihood: String,
      impact: String,
      mitigation: String
    }]
  },
  
  // Data Subject Rights (GDPR specific)
  dataSubjectRights: {
    requestsReceived: Number,
    requestsFulfilled: Number,
    avgResponseTime: Number, // hours
    overdue: Number,
    types: [{
      type: {
        type: String,
        enum: ['access', 'rectification', 'erasure', 'portability', 'objection', 'restriction']
      },
      count: Number
    }]
  },
  
  // Third-Party / Vendor Compliance
  vendorCompliance: {
    totalVendors: Number,
    assessedVendors: Number,
    compliantVendors: Number,
    dataProcessingAgreements: Number,
    dueDiligenceCompleted: Number
  },
  
  // Recommendations
  recommendations: [{
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    category: String,
    recommendation: String,
    estimatedCost: Number,
    estimatedEffort: String,
    expectedBenefit: String
  }],
  
  // Executive Summary
  executiveSummary: {
    keyFindings: [String],
    strengths: [String],
    weaknesses: [String],
    criticalActions: [String],
    investmentNeeded: String
  },
  
  // Attestation
  attestation: {
    attested: Boolean,
    attestedBy: {
      name: String,
      title: String,
      userId: String
    },
    attestationDate: Date,
    statement: String
  },
  
  // Audit Trail
  auditTrail: [{
    action: String,
    performedBy: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String
  }],
  
  // Report Metadata
  generatedBy: {
    userId: String,
    name: String
  },
  reviewedBy: [{
    userId: String,
    name: String,
    reviewDate: Date,
    comments: String
  }],
  approvedBy: {
    userId: String,
    name: String,
    approvalDate: Date
  },
  
  // Distribution
  distributedTo: [{
    email: String,
    sentAt: Date
  }],
  
  // File Exports
  exports: [{
    format: {
      type: String,
      enum: ['pdf', 'excel', 'word', 'json']
    },
    path: String,
    generatedAt: Date,
    downloadCount: Number
  }],
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'under_review', 'approved', 'published', 'archived'],
    default: 'draft'
  },
  
  // Next Assessment
  nextAssessmentDue: Date,
  
  // Tags
  tags: [String],
  notes: String
}, {
  timestamps: true
});

// Indexes
complianceReportSchema.index({ reportId: 1 });
complianceReportSchema.index({ framework: 1 });
complianceReportSchema.index({ reportType: 1 });
complianceReportSchema.index({ overallStatus: 1 });
complianceReportSchema.index({ 'reportingPeriod.startDate': 1, 'reportingPeriod.endDate': 1 });
complianceReportSchema.index({ generatedAt: -1 });
complianceReportSchema.index({ status: 1 });

// Methods
complianceReportSchema.methods.calculateComplianceScore = function() {
  if (this.requirements.length === 0) {
    this.complianceScore = 0;
    return 0;
  }
  
  let totalWeight = 0;
  let metWeight = 0;
  
  this.requirements.forEach(req => {
    const weight = req.priority === 'critical' ? 4 : 
                   req.priority === 'high' ? 3 :
                   req.priority === 'medium' ? 2 : 1;
    
    totalWeight += weight;
    
    if (req.status === 'met') {
      metWeight += weight;
    } else if (req.status === 'partial') {
      metWeight += weight * 0.5;
    }
  });
  
  this.complianceScore = Math.round((metWeight / totalWeight) * 100);
  
  // Update overall status
  if (this.complianceScore >= 95) this.overallStatus = 'compliant';
  else if (this.complianceScore >= 70) this.overallStatus = 'partial_compliance';
  else this.overallStatus = 'non_compliant';
  
  return this.complianceScore;
};

complianceReportSchema.methods.addGap = function(requirement, description, severity, impact, recommendations) {
  this.gaps.push({
    gapId: `GAP-${Date.now()}`,
    requirement,
    description,
    severity,
    impact,
    recommendations,
    identifiedAt: new Date()
  });
  return this.save();
};

complianceReportSchema.methods.approve = function(userId, userName) {
  this.approvedBy = {
    userId,
    name: userName,
    approvalDate: new Date()
  };
  this.status = 'approved';
  
  this.auditTrail.push({
    action: 'approved',
    performedBy: userName,
    timestamp: new Date(),
    details: 'Report approved for publication'
  });
  
  return this.save();
};

complianceReportSchema.methods.publish = function() {
  this.status = 'published';
  
  this.auditTrail.push({
    action: 'published',
    performedBy: this.approvedBy.name,
    timestamp: new Date(),
    details: 'Report published'
  });
  
  return this.save();
};

complianceReportSchema.methods.attest = function(userId, userName, title, statement) {
  this.attestation = {
    attested: true,
    attestedBy: {
      userId,
      name: userName,
      title
    },
    attestationDate: new Date(),
    statement
  };
  
  this.auditTrail.push({
    action: 'attested',
    performedBy: userName,
    timestamp: new Date(),
    details: 'Report attested by ' + title
  });
  
  return this.save();
};

// Statics
complianceReportSchema.statics.getByFramework = function(framework) {
  return this.find({ framework })
    .sort({ generatedAt: -1 });
};

complianceReportSchema.statics.getLatestReport = function(framework) {
  return this.findOne({ framework, status: { $in: ['approved', 'published'] } })
    .sort({ generatedAt: -1 });
};

complianceReportSchema.statics.getNonCompliantReports = function() {
  return this.find({ 
    overallStatus: { $in: ['non_compliant', 'partial_compliance'] },
    status: { $in: ['approved', 'published'] }
  });
};

complianceReportSchema.statics.getComplianceTrend = async function(framework, limit = 6) {
  return this.find({ 
    framework,
    status: { $in: ['approved', 'published'] }
  })
    .sort({ generatedAt: -1 })
    .limit(limit)
    .select('reportId generatedAt complianceScore overallStatus');
};

module.exports = mongoose.model('ComplianceReport', complianceReportSchema);
