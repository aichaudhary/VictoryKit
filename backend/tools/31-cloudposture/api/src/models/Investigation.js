const mongoose = require('mongoose');

const investigationSchema = new mongoose.Schema({
  // Core identifiers
  investigationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  case_number: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Investigation details
  investigation: {
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['security_incident', 'compliance_violation', 'fraud', 'data_breach', 'unauthorized_access', 'policy_violation', 'insider_threat', 'malware', 'exfiltration', 'other'],
      index: true
    },
    category: String,
    description: String,
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      index: true
    },
    priority: {
      type: String,
      enum: ['P1', 'P2', 'P3', 'P4'],
      default: 'P3'
    },
    status: {
      type: String,
      enum: ['new', 'assigned', 'in_progress', 'under_review', 'closed', 'suspended', 'escalated'],
      default: 'new',
      index: true
    }
  },
  
  // Incident timeline
  timeline: {
    incident_detected: {
      type: Date,
      index: true
    },
    incident_occurred: Date,
    investigation_started: {
      type: Date,
      default: Date.now
    },
    investigation_closed: Date,
    time_to_detect: Number,  // milliseconds
    time_to_investigate: Number  // milliseconds
  },
  
  // Scope of investigation
  scope: {
    affected_systems: [String],
    affected_users: [String],
    affected_data: [String],
    affected_applications: [String],
    networks: [String],
    locations: [String],
    departments: [String],
    time_range: {
      start: Date,
      end: Date
    },
    estimated_impact: {
      type: String,
      enum: ['minimal', 'moderate', 'significant', 'critical']
    }
  },
  
  // Investigation team
  team: {
    lead_investigator: {
      user_id: {
        type: String,
        required: true
      },
      name: String,
      email: String,
      role: String
    },
    investigators: [{
      user_id: String,
      name: String,
      email: String,
      role: String,
      assigned_date: Date,
      responsibilities: [String]
    }],
    external_support: [{
      organization: String,
      contact_person: String,
      role: String,
      engagement_type: String
    }]
  },
  
  // Evidence collection
  evidence: {
    audit_log_ids: {
      type: [String],
      index: true
    },
    digital_evidence: [{
      evidence_id: String,
      type: String,
      description: String,
      source: String,
      collected_by: String,
      collected_at: Date,
      hash: String,
      file_path: String,
      preservation_status: String
    }],
    physical_evidence: [{
      description: String,
      location: String,
      custodian: String,
      secured_at: Date
    }],
    witness_statements: [{
      witness_name: String,
      statement: String,
      date: Date,
      recorded_by: String
    }],
    total_evidence_items: {
      type: Number,
      default: 0
    }
  },
  
  // Analysis and correlation
  analysis: {
    correlation_depth: {
      type: String,
      enum: ['basic', 'moderate', 'deep', 'comprehensive'],
      default: 'moderate'
    },
    techniques_used: [String],
    tools_used: [String],
    ml_models_applied: [String],
    findings: [{
      finding_id: String,
      type: String,
      description: String,
      severity: String,
      confidence: Number,
      evidence_ids: [String],
      timestamp: Date,
      analyst: String
    }],
    indicators: [{
      indicator_type: String,  // IOC, TTP, anomaly
      indicator_value: String,
      description: String,
      confidence: Number,
      source: String
    }],
    timeline_reconstruction: [{
      timestamp: Date,
      event_type: String,
      description: String,
      evidence_ids: [String],
      confidence: String
    }]
  },
  
  // Root cause analysis
  rootCause: {
    primary_cause: String,
    contributing_factors: [String],
    vulnerability_exploited: String,
    attack_vector: String,
    attack_pattern: String,
    threat_actor: {
      type: String,
      sophistication: String,
      motivation: String,
      attribution_confidence: Number
    }
  },
  
  // Impact assessment
  impact: {
    confidentiality: {
      type: String,
      enum: ['none', 'low', 'medium', 'high', 'critical']
    },
    integrity: {
      type: String,
      enum: ['none', 'low', 'medium', 'high', 'critical']
    },
    availability: {
      type: String,
      enum: ['none', 'low', 'medium', 'high', 'critical']
    },
    financial_impact: {
      estimated_loss: Number,
      currency: {
        type: String,
        default: 'USD'
      },
      loss_categories: [String]
    },
    reputational_impact: String,
    legal_implications: String,
    regulatory_implications: [String],
    affected_records_count: Number,
    downtime_minutes: Number
  },
  
  // Remediation
  remediation: {
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'verified'],
      default: 'not_started'
    },
    immediate_actions: [{
      action: String,
      taken_by: String,
      taken_at: Date,
      status: String
    }],
    corrective_actions: [{
      action: String,
      responsible_party: String,
      due_date: Date,
      status: String,
      completion_date: Date
    }],
    preventive_measures: [{
      measure: String,
      implementation_plan: String,
      owner: String,
      target_date: Date
    }],
    lessons_learned: [String]
  },
  
  // Compliance and reporting
  compliance: {
    frameworks_affected: [String],
    controls_failed: [String],
    regulatory_notification_required: {
      type: Boolean,
      default: false
    },
    regulators_notified: [{
      regulator: String,
      notification_date: Date,
      reference_number: String
    }],
    customer_notification_required: {
      type: Boolean,
      default: false
    },
    notification_sent: Date,
    customers_notified: Number
  },
  
  // Investigation report
  report: {
    executive_summary: String,
    detailed_findings: String,
    technical_analysis: String,
    recommendations: [String],
    report_generated: Date,
    report_file_path: String,
    report_approved_by: String,
    report_approved_date: Date
  },
  
  // Legal and chain of custody
  legal: {
    legal_hold: {
      type: Boolean,
      default: false
    },
    law_enforcement_involved: {
      type: Boolean,
      default: false
    },
    case_number_le: String,  // Law enforcement case number
    attorney_involved: {
      type: Boolean,
      default: false
    },
    attorney_details: String,
    chain_of_custody_maintained: {
      type: Boolean,
      default: true
    },
    custody_log: [{
      timestamp: Date,
      handler: String,
      action: String,
      location: String,
      notes: String
    }]
  },
  
  // Notes and communications
  notes: [{
    note_id: String,
    author: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    content: String,
    visibility: {
      type: String,
      enum: ['team_only', 'management', 'public'],
      default: 'team_only'
    }
  }],
  
  // Metadata
  metadata: {
    created_by: {
      user_id: String,
      name: String,
      email: String
    },
    tags: [String],
    related_investigations: [String],
    parent_investigation: String,
    child_investigations: [String],
    custom_fields: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  collection: 'investigations'
});

// Indexes
investigationSchema.index({ 'investigation.status': 1, 'investigation.severity': 1 });
investigationSchema.index({ 'timeline.incident_detected': -1 });
investigationSchema.index({ 'team.lead_investigator.user_id': 1 });
investigationSchema.index({ 'investigation.type': 1, 'investigation.status': 1 });

// Instance methods
investigationSchema.methods.calculateTimeMetrics = function() {
  if (this.timeline.incident_detected && this.timeline.investigation_started) {
    this.timeline.time_to_detect = this.timeline.investigation_started.getTime() - this.timeline.incident_detected.getTime();
  }
  
  if (this.timeline.investigation_started && this.timeline.investigation_closed) {
    this.timeline.time_to_investigate = this.timeline.investigation_closed.getTime() - this.timeline.investigation_started.getTime();
  }
};

investigationSchema.methods.addEvidence = function(evidenceData) {
  this.evidence.digital_evidence.push({
    ...evidenceData,
    evidence_id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    collected_at: new Date()
  });
  
  this.evidence.total_evidence_items = this.evidence.digital_evidence.length + this.evidence.physical_evidence.length;
};

investigationSchema.methods.addFinding = function(findingData) {
  this.analysis.findings.push({
    ...findingData,
    finding_id: `find_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date()
  });
};

investigationSchema.methods.addNote = function(content, author, visibility = 'team_only') {
  this.notes.push({
    note_id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    content,
    author,
    visibility,
    timestamp: new Date()
  });
};

investigationSchema.methods.updateStatus = function(newStatus) {
  this.investigation.status = newStatus;
  
  if (newStatus === 'closed') {
    this.timeline.investigation_closed = new Date();
    this.calculateTimeMetrics();
  }
};

// Static methods
investigationSchema.statics.findActive = function() {
  return this.find({
    'investigation.status': { $in: ['assigned', 'in_progress', 'under_review'] }
  }).sort({ 'investigation.severity': -1, 'timeline.investigation_started': -1 });
};

investigationSchema.statics.findByInvestigator = function(userId) {
  return this.find({
    $or: [
      { 'team.lead_investigator.user_id': userId },
      { 'team.investigators.user_id': userId }
    ]
  }).sort({ 'timeline.investigation_started': -1 });
};

investigationSchema.statics.findByType = function(type, status) {
  const query = { 'investigation.type': type };
  if (status) {
    query['investigation.status'] = status;
  }
  
  return this.find(query).sort({ 'timeline.investigation_started': -1 });
};

module.exports = mongoose.model('Investigation', investigationSchema);
