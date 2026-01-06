const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // Core audit identifiers
  auditId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  logId: {
    type: String,
    required: true,
    index: true
  },
  
  // Timestamp and source information
  timestamp: {
    type: Date,
    required: true,
    index: true,
    default: Date.now
  },
  source: {
    type: {
      type: String,
      required: true,
      enum: ['system', 'application', 'database', 'network', 'user_activity', 'security_tool', 'cloud', 'container', 'web_server', 'auth_system'],
      index: true
    },
    name: String,
    hostname: String,
    ip_address: String,
    platform: String,
    version: String
  },
  
  // Event details
  event: {
    category: {
      type: String,
      required: true,
      enum: ['authentication', 'access_control', 'data_access', 'data_modification', 'config_change', 'admin_action', 'privilege_escalation', 'security_event', 'compliance_violation', 'system_failure'],
      index: true
    },
    type: {
      type: String,
      required: true,
      index: true
    },
    action: String,
    outcome: {
      type: String,
      enum: ['success', 'failure', 'partial', 'blocked', 'warning'],
      index: true
    },
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low', 'info'],
      index: true,
      default: 'info'
    },
    description: String,
    details: mongoose.Schema.Types.Mixed
  },
  
  // Actor information (who performed the action)
  actor: {
    user_id: {
      type: String,
      index: true
    },
    username: String,
    email: String,
    roles: [String],
    privileges: [String],
    authentication_method: String,
    session_id: String,
    ip_address: {
      type: String,
      index: true
    },
    geo_location: {
      country: String,
      region: String,
      city: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    user_agent: String,
    device_info: {
      type: String,
      os: String,
      browser: String
    }
  },
  
  // Target information (what was accessed/modified)
  target: {
    resource_type: {
      type: String,
      index: true
    },
    resource_id: String,
    resource_name: String,
    resource_path: String,
    parent_resource: String,
    owner: String,
    sensitivity_level: {
      type: String,
      enum: ['public', 'internal', 'confidential', 'restricted', 'top_secret']
    },
    data_classification: [String]
  },
  
  // Changes made (before/after for modifications)
  changes: {
    operation: {
      type: String,
      enum: ['create', 'read', 'update', 'delete', 'execute', 'access', 'modify']
    },
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
    fields_modified: [String],
    change_summary: String
  },
  
  // Compliance and risk metadata
  compliance: {
    frameworks: {
      type: [String],
      enum: ['SOX', 'HIPAA', 'PCI-DSS', 'ISO-27001', 'GDPR', 'NIST-800-53', 'FISMA', 'CMMC', 'SOC2', 'GLBA', 'FERPA'],
      index: true
    },
    controls: [String],
    requirements: [String],
    violation: {
      type: Boolean,
      default: false,
      index: true
    },
    violation_type: String,
    violation_severity: String
  },
  
  // Risk and anomaly scoring
  risk: {
    score: {
      type: Number,
      min: 0,
      max: 100,
      index: true
    },
    level: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      index: true
    },
    factors: [String],
    anomaly_detected: {
      type: Boolean,
      default: false,
      index: true
    },
    anomaly_type: [String],
    confidence_score: Number
  },
  
  // Context and correlation
  context: {
    session_context: mongoose.Schema.Types.Mixed,
    request_id: String,
    correlation_id: String,
    parent_audit_id: String,
    related_audit_ids: [String],
    workflow_id: String,
    transaction_id: String
  },
  
  // Integrity verification
  integrity: {
    hash: {
      type: String,
      required: true
    },
    algorithm: {
      type: String,
      default: 'SHA-256'
    },
    signature: String,
    previous_hash: String,
    merkle_root: String,
    blockchain_verified: {
      type: Boolean,
      default: false
    }
  },
  
  // Retention and archival
  retention: {
    policy: String,
    expiry_date: Date,
    legal_hold: {
      type: Boolean,
      default: false
    },
    archived: {
      type: Boolean,
      default: false,
      index: true
    },
    archive_location: String,
    deletion_scheduled: Date
  },
  
  // Investigation and evidence
  investigation: {
    flagged: {
      type: Boolean,
      default: false,
      index: true
    },
    flagged_by: String,
    flagged_reason: String,
    investigation_ids: [String],
    evidence_preservation: {
      type: Boolean,
      default: false
    },
    chain_of_custody: [{
      handler: String,
      timestamp: Date,
      action: String,
      notes: String
    }]
  },
  
  // Metadata
  metadata: {
    ingestion_timestamp: {
      type: Date,
      default: Date.now
    },
    processing_status: {
      type: String,
      enum: ['pending', 'processed', 'enriched', 'analyzed', 'failed'],
      default: 'pending'
    },
    enrichment: {
      threat_intel: mongoose.Schema.Types.Mixed,
      user_behavior: mongoose.Schema.Types.Mixed,
      risk_context: mongoose.Schema.Types.Mixed
    },
    tags: [String],
    custom_fields: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  collection: 'audit_logs'
});

// Compound indexes for common queries
auditLogSchema.index({ timestamp: -1, 'event.category': 1 });
auditLogSchema.index({ 'actor.user_id': 1, timestamp: -1 });
auditLogSchema.index({ 'target.resource_type': 1, timestamp: -1 });
auditLogSchema.index({ 'event.severity': 1, 'risk.level': 1, timestamp: -1 });
auditLogSchema.index({ 'compliance.frameworks': 1, 'compliance.violation': 1 });
auditLogSchema.index({ 'risk.anomaly_detected': 1, 'risk.score': -1 });
auditLogSchema.index({ 'investigation.flagged': 1, timestamp: -1 });

// Text index for full-text search
auditLogSchema.index({
  'event.description': 'text',
  'event.action': 'text',
  'actor.username': 'text',
  'target.resource_name': 'text'
});

// Instance methods
auditLogSchema.methods.calculateRiskScore = function() {
  let score = 0;
  
  // Severity contribution
  const severityScores = { critical: 40, high: 30, medium: 20, low: 10, info: 0 };
  score += severityScores[this.event.severity] || 0;
  
  // Outcome contribution
  if (this.event.outcome === 'failure') score += 15;
  if (this.event.outcome === 'blocked') score += 10;
  
  // Compliance violation
  if (this.compliance.violation) score += 25;
  
  // Anomaly detection
  if (this.risk.anomaly_detected) score += 20;
  
  // Sensitive data access
  if (this.target.sensitivity_level === 'top_secret') score += 15;
  else if (this.target.sensitivity_level === 'restricted') score += 10;
  
  this.risk.score = Math.min(100, score);
  this.risk.level = score >= 75 ? 'critical' : score >= 50 ? 'high' : score >= 25 ? 'medium' : 'low';
  
  return this.risk.score;
};

auditLogSchema.methods.generateHash = function() {
  const crypto = require('crypto');
  const data = JSON.stringify({
    auditId: this.auditId,
    timestamp: this.timestamp,
    event: this.event,
    actor: this.actor,
    target: this.target,
    changes: this.changes
  });
  
  this.integrity.hash = crypto.createHash('sha256').update(data).digest('hex');
  return this.integrity.hash;
};

auditLogSchema.methods.verifyIntegrity = function() {
  const currentHash = this.integrity.hash;
  const calculatedHash = this.generateHash();
  return currentHash === calculatedHash;
};

// Static methods
auditLogSchema.statics.findByTimeRange = function(startTime, endTime, filters = {}) {
  const query = {
    timestamp: {
      $gte: new Date(startTime),
      $lte: new Date(endTime)
    },
    ...filters
  };
  
  return this.find(query).sort({ timestamp: -1 });
};

auditLogSchema.statics.findAnomalies = function(options = {}) {
  const query = {
    'risk.anomaly_detected': true,
    ...options.filters
  };
  
  if (options.minScore) {
    query['risk.score'] = { $gte: options.minScore };
  }
  
  return this.find(query).sort({ 'risk.score': -1 }).limit(options.limit || 100);
};

auditLogSchema.statics.findComplianceViolations = function(framework) {
  return this.find({
    'compliance.violation': true,
    'compliance.frameworks': framework
  }).sort({ timestamp: -1 });
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
