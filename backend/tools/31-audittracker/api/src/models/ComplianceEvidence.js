const mongoose = require('mongoose');

const complianceEvidenceSchema = new mongoose.Schema({
  // Core identifiers
  evidenceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Compliance framework details
  framework: {
    name: {
      type: String,
      required: true,
      enum: ['SOX', 'HIPAA', 'PCI-DSS', 'ISO-27001', 'GDPR', 'NIST-800-53', 'FISMA', 'CMMC', 'SOC2', 'GLBA', 'FERPA'],
      index: true
    },
    version: String,
    domain: String
  },
  
  // Control mapping
  control: {
    control_id: {
      type: String,
      required: true,
      index: true
    },
    control_name: String,
    control_description: String,
    control_family: String,
    control_priority: {
      type: String,
      enum: ['P1', 'P2', 'P3']
    }
  },
  
  // Audit period
  auditPeriod: {
    start_date: {
      type: Date,
      required: true,
      index: true
    },
    end_date: {
      type: Date,
      required: true,
      index: true
    },
    period_name: String
  },
  
  // Evidence details
  evidence: {
    type: {
      type: String,
      required: true,
      enum: ['access_logs', 'change_logs', 'approval_records', 'config_snapshots', 'screenshots', 'documentation', 'attestation', 'scan_results', 'test_results'],
      index: true
    },
    title: String,
    description: String,
    collection_method: {
      type: String,
      enum: ['automated', 'manual', 'semi-automated']
    },
    source_systems: [String],
    audit_log_ids: [String],
    file_attachments: [{
      filename: String,
      file_path: String,
      file_size: Number,
      mime_type: String,
      hash: String,
      uploaded_at: Date
    }],
    data: mongoose.Schema.Types.Mixed
  },
  
  // Compliance status
  compliance: {
    status: {
      type: String,
      enum: ['compliant', 'non_compliant', 'partially_compliant', 'not_applicable', 'compensating_control'],
      index: true,
      default: 'compliant'
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    findings: [{
      finding_type: {
        type: String,
        enum: ['pass', 'fail', 'gap', 'weakness', 'observation']
      },
      severity: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low', 'info']
      },
      description: String,
      recommendation: String,
      remediation_plan: String,
      due_date: Date
    }],
    gaps: [{
      gap_description: String,
      impact: String,
      remediation: String,
      responsible_party: String,
      target_date: Date
    }]
  },
  
  // Attestation and verification
  attestation: {
    required: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['pending', 'attested', 'rejected', 'expired']
    },
    attestor: {
      user_id: String,
      name: String,
      email: String,
      role: String
    },
    attestation_date: Date,
    attestation_statement: String,
    digital_signature: String,
    expiry_date: Date
  },
  
  // Review and approval
  review: {
    status: {
      type: String,
      enum: ['pending_review', 'in_review', 'approved', 'rejected', 'needs_revision'],
      default: 'pending_review'
    },
    reviewer: {
      user_id: String,
      name: String,
      email: String,
      role: String
    },
    review_date: Date,
    review_notes: String,
    approval_chain: [{
      approver: String,
      role: String,
      decision: String,
      timestamp: Date,
      comments: String
    }]
  },
  
  // Sampling and testing
  sampling: {
    sample_size: Number,
    total_population: Number,
    sampling_method: {
      type: String,
      enum: ['random', 'systematic', 'stratified', 'judgmental', 'complete']
    },
    testing_performed: {
      type: Boolean,
      default: false
    },
    test_results: [{
      test_name: String,
      test_date: Date,
      result: String,
      pass_rate: Number,
      exceptions: Number
    }]
  },
  
  // Evidence quality and reliability
  quality: {
    completeness_score: {
      type: Number,
      min: 0,
      max: 100
    },
    reliability_score: {
      type: Number,
      min: 0,
      max: 100
    },
    timeliness_score: {
      type: Number,
      min: 0,
      max: 100
    },
    overall_quality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    },
    issues: [String],
    enhancements: [String]
  },
  
  // Chain of custody
  custody: {
    collected_by: {
      user_id: String,
      name: String,
      timestamp: Date
    },
    chain: [{
      handler: String,
      action: String,
      timestamp: Date,
      location: String,
      notes: String
    }],
    integrity_verified: {
      type: Boolean,
      default: false
    },
    verification_method: String,
    hash_chain: [String]
  },
  
  // Related evidence and dependencies
  relationships: {
    parent_evidence_id: String,
    related_evidence_ids: [String],
    dependent_controls: [String],
    supporting_evidence: [String],
    contradicting_evidence: [String]
  },
  
  // Metadata
  metadata: {
    collected_at: {
      type: Date,
      default: Date.now
    },
    last_updated: Date,
    auditor: {
      name: String,
      firm: String,
      contact: String
    },
    tags: [String],
    custom_fields: mongoose.Schema.Types.Mixed,
    retention_until: Date,
    archived: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  collection: 'compliance_evidence'
});

// Indexes
complianceEvidenceSchema.index({ 'framework.name': 1, 'control.control_id': 1 });
complianceEvidenceSchema.index({ 'auditPeriod.start_date': 1, 'auditPeriod.end_date': 1 });
complianceEvidenceSchema.index({ 'compliance.status': 1, 'framework.name': 1 });
complianceEvidenceSchema.index({ 'review.status': 1, 'metadata.collected_at': -1 });

// Instance methods
complianceEvidenceSchema.methods.calculateQualityScore = function() {
  // Calculate completeness
  let completeness = 100;
  if (!this.evidence.description) completeness -= 15;
  if (!this.evidence.audit_log_ids || this.evidence.audit_log_ids.length === 0) completeness -= 20;
  if (!this.attestation.status || this.attestation.status === 'pending') completeness -= 15;
  
  // Calculate reliability based on source and verification
  let reliability = 80;
  if (this.evidence.collection_method === 'automated') reliability += 10;
  if (this.custody.integrity_verified) reliability += 10;
  
  // Calculate timeliness
  const collectionAge = Date.now() - new Date(this.metadata.collected_at).getTime();
  const daysOld = collectionAge / (1000 * 60 * 60 * 24);
  let timeliness = Math.max(0, 100 - (daysOld * 2));
  
  this.quality.completeness_score = Math.max(0, completeness);
  this.quality.reliability_score = Math.min(100, reliability);
  this.quality.timeliness_score = Math.max(0, Math.min(100, timeliness));
  
  const avgScore = (this.quality.completeness_score + this.quality.reliability_score + this.quality.timeliness_score) / 3;
  
  this.quality.overall_quality = avgScore >= 90 ? 'excellent' : avgScore >= 70 ? 'good' : avgScore >= 50 ? 'fair' : 'poor';
  
  return avgScore;
};

complianceEvidenceSchema.methods.addToChainOfCustody = function(handler, action, notes) {
  this.custody.chain.push({
    handler,
    action,
    timestamp: new Date(),
    notes
  });
};

// Static methods
complianceEvidenceSchema.statics.findByFramework = function(framework, controlId) {
  const query = {
    'framework.name': framework
  };
  
  if (controlId) {
    query['control.control_id'] = controlId;
  }
  
  return this.find(query).sort({ 'metadata.collected_at': -1 });
};

complianceEvidenceSchema.statics.findByAuditPeriod = function(startDate, endDate) {
  return this.find({
    'auditPeriod.start_date': { $gte: new Date(startDate) },
    'auditPeriod.end_date': { $lte: new Date(endDate) }
  }).sort({ 'framework.name': 1, 'control.control_id': 1 });
};

complianceEvidenceSchema.statics.findGapsAndFindings = function(framework) {
  return this.find({
    'framework.name': framework,
    $or: [
      { 'compliance.status': 'non_compliant' },
      { 'compliance.status': 'partially_compliant' },
      { 'compliance.gaps.0': { $exists: true } }
    ]
  }).sort({ 'compliance.score': 1 });
};

module.exports = mongoose.model('ComplianceEvidence', complianceEvidenceSchema);
