const mongoose = require('mongoose');

const auditPolicySchema = new mongoose.Schema({
  // Core identifiers
  policyId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  policy_name: {
    type: String,
    required: true,
    index: true
  },
  
  // Policy details
  policy: {
    description: String,
    purpose: String,
    status: {
      type: String,
      enum: ['draft', 'active', 'inactive', 'archived'],
      default: 'draft',
      index: true
    },
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium'
    },
    category: {
      type: String,
      enum: ['security', 'compliance', 'operational', 'forensic', 'performance'],
      index: true
    }
  },
  
  // Audit sources configuration
  sources: {
    enabled_sources: {
      type: [String],
      enum: ['windows_events', 'linux_syslog', 'database_logs', 'application_logs', 'cloud_logs', 'network_logs', 'container_logs', 'web_server', 'auth_system'],
      required: true
    },
    source_configs: [{
      source_type: String,
      source_name: String,
      connection: {
        host: String,
        port: Number,
        protocol: String,
        authentication: mongoose.Schema.Types.Mixed
      },
      enabled: {
        type: Boolean,
        default: true
      },
      collection_interval: String,
      batch_size: Number
    }]
  },
  
  // Collection rules
  collection: {
    event_types: {
      type: [String],
      required: true
    },
    severity_levels: {
      type: [String],
      enum: ['critical', 'high', 'medium', 'low', 'info'],
      default: ['critical', 'high', 'medium', 'low', 'info']
    },
    include_users: [String],
    exclude_users: [String],
    include_systems: [String],
    exclude_systems: [String],
    include_applications: [String],
    exclude_applications: [String],
    time_filters: {
      business_hours_only: {
        type: Boolean,
        default: false
      },
      start_time: String,
      end_time: String,
      days_of_week: [String],
      exclude_holidays: {
        type: Boolean,
        default: false
      }
    },
    advanced_filters: [{
      field: String,
      operator: String,
      value: mongoose.Schema.Types.Mixed,
      condition: String
    }]
  },
  
  // Retention policy
  retention: {
    duration_days: {
      type: Number,
      required: true,
      min: 1
    },
    long_term_archive: {
      enabled: {
        type: Boolean,
        default: false
      },
      archive_after_days: Number,
      archive_location: String,
      archive_format: {
        type: String,
        enum: ['json', 'parquet', 'avro', 'compressed']
      }
    },
    deletion_policy: {
      auto_delete: {
        type: Boolean,
        default: true
      },
      require_approval: {
        type: Boolean,
        default: false
      },
      legal_hold_check: {
        type: Boolean,
        default: true
      }
    },
    compliance_requirements: [{
      framework: String,
      minimum_retention_days: Number,
      archival_required: Boolean
    }]
  },
  
  // Processing and enrichment
  processing: {
    real_time_processing: {
      type: Boolean,
      default: true
    },
    batch_processing: {
      enabled: Boolean,
      interval: String,
      batch_size: Number
    },
    enrichment: {
      geo_location: {
        type: Boolean,
        default: true
      },
      threat_intel: {
        type: Boolean,
        default: false
      },
      user_context: {
        type: Boolean,
        default: true
      },
      asset_context: {
        type: Boolean,
        default: true
      }
    },
    normalization: {
      enabled: {
        type: Boolean,
        default: true
      },
      schema: String,
      field_mappings: mongoose.Schema.Types.Mixed
    }
  },
  
  // Analytics and detection
  analytics: {
    anomaly_detection: {
      enabled: {
        type: Boolean,
        default: false
      },
      models: [String],
      sensitivity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
      },
      baseline_period_days: Number
    },
    correlation_rules: [{
      rule_name: String,
      rule_type: String,
      conditions: mongoose.Schema.Types.Mixed,
      time_window: String,
      action: String,
      enabled: Boolean
    }],
    behavioral_analysis: {
      enabled: Boolean,
      profile_users: Boolean,
      profile_systems: Boolean,
      deviation_threshold: Number
    }
  },
  
  // Alerting configuration
  alerting: {
    enabled: {
      type: Boolean,
      default: true
    },
    alert_rules: [{
      rule_name: String,
      conditions: mongoose.Schema.Types.Mixed,
      severity: String,
      notification_channels: [String],
      throttling: {
        enabled: Boolean,
        max_alerts_per_hour: Number
      },
      active: {
        type: Boolean,
        default: true
      }
    }],
    notification_channels: [{
      channel_type: {
        type: String,
        enum: ['email', 'slack', 'webhook', 'sms', 'pagerduty', 'teams']
      },
      name: String,
      config: mongoose.Schema.Types.Mixed,
      enabled: Boolean
    }],
    escalation: {
      enabled: Boolean,
      escalation_levels: [{
        level: Number,
        delay_minutes: Number,
        recipients: [String]
      }]
    }
  },
  
  // Compliance mapping
  compliance_mapping: {
    frameworks: [{
      framework_name: String,
      controls: [String],
      requirements: [String],
      evidence_collection: {
        auto_collect: Boolean,
        collection_frequency: String
      }
    }],
    audit_requirements: {
      attestation_required: Boolean,
      audit_frequency: String,
      report_templates: [String]
    }
  },
  
  // Integrity and security
  integrity: {
    tamper_protection: {
      enabled: {
        type: Boolean,
        default: true
      },
      verification_method: {
        type: String,
        enum: ['hash_chain', 'merkle_tree', 'digital_signature', 'blockchain'],
        default: 'hash_chain'
      }
    },
    encryption: {
      at_rest: {
        type: Boolean,
        default: true
      },
      in_transit: {
        type: Boolean,
        default: true
      },
      encryption_algorithm: String
    },
    access_control: {
      restricted_access: Boolean,
      authorized_roles: [String],
      authorized_users: [String]
    }
  },
  
  // Performance and limits
  performance: {
    collection_rate_limit: {
      events_per_second: Number,
      burst_capacity: Number
    },
    storage_limits: {
      max_size_gb: Number,
      warn_threshold_percentage: Number,
      action_on_limit: {
        type: String,
        enum: ['stop_collection', 'archive_old', 'delete_old', 'alert_only']
      }
    },
    query_limits: {
      max_results: Number,
      max_time_range_days: Number
    }
  },
  
  // Schedule and activation
  schedule: {
    start_date: {
      type: Date,
      default: Date.now
    },
    end_date: Date,
    recurrence: {
      type: String,
      enum: ['continuous', 'daily', 'weekly', 'monthly', 'custom']
    },
    maintenance_windows: [{
      day_of_week: String,
      start_time: String,
      end_time: String,
      action: {
        type: String,
        enum: ['pause_collection', 'reduce_rate', 'continue']
      }
    }]
  },
  
  // Policy management
  management: {
    owner: {
      user_id: {
        type: String,
        required: true
      },
      name: String,
      email: String,
      department: String
    },
    approvers: [{
      user_id: String,
      name: String,
      approved: Boolean,
      approved_date: Date,
      comments: String
    }],
    last_reviewed: Date,
    review_frequency_days: Number,
    next_review_date: Date,
    version: {
      type: Number,
      default: 1
    },
    change_log: [{
      version: Number,
      changed_by: String,
      changed_at: Date,
      changes: String
    }]
  },
  
  // Statistics
  statistics: {
    total_logs_collected: {
      type: Number,
      default: 0
    },
    collection_start_date: Date,
    last_collection_date: Date,
    average_logs_per_day: Number,
    storage_used_gb: Number,
    errors_encountered: Number,
    last_error: {
      timestamp: Date,
      message: String,
      source: String
    }
  },
  
  // Metadata
  metadata: {
    tags: [String],
    custom_fields: mongoose.Schema.Types.Mixed,
    related_policies: [String]
  }
}, {
  timestamps: true,
  collection: 'audit_policies'
});

// Indexes
auditPolicySchema.index({ 'policy.status': 1, 'policy.priority': 1 });
auditPolicySchema.index({ 'management.owner.user_id': 1 });
auditPolicySchema.index({ 'schedule.start_date': 1, 'schedule.end_date': 1 });
auditPolicySchema.index({ 'compliance_mapping.frameworks.framework_name': 1 });

// Instance methods
auditPolicySchema.methods.activate = function() {
  this.policy.status = 'active';
  this.schedule.start_date = new Date();
  this.statistics.collection_start_date = new Date();
};

auditPolicySchema.methods.deactivate = function() {
  this.policy.status = 'inactive';
  this.schedule.end_date = new Date();
};

auditPolicySchema.methods.updateStatistics = function(logsCollected, storageUsed) {
  this.statistics.total_logs_collected += logsCollected;
  this.statistics.last_collection_date = new Date();
  this.statistics.storage_used_gb = storageUsed;
  
  const daysSinceStart = (Date.now() - new Date(this.statistics.collection_start_date).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceStart > 0) {
    this.statistics.average_logs_per_day = Math.round(this.statistics.total_logs_collected / daysSinceStart);
  }
};

auditPolicySchema.methods.logError = function(errorMessage, source) {
  this.statistics.errors_encountered += 1;
  this.statistics.last_error = {
    timestamp: new Date(),
    message: errorMessage,
    source: source
  };
};

auditPolicySchema.methods.incrementVersion = function(changedBy, changes) {
  this.management.version += 1;
  this.management.change_log.push({
    version: this.management.version,
    changed_by: changedBy,
    changed_at: new Date(),
    changes: changes
  });
};

// Static methods
auditPolicySchema.statics.findActive = function() {
  return this.find({
    'policy.status': 'active',
    $or: [
      { 'schedule.end_date': { $exists: false } },
      { 'schedule.end_date': { $gte: new Date() } }
    ]
  }).sort({ 'policy.priority': -1 });
};

auditPolicySchema.statics.findByOwner = function(userId) {
  return this.find({
    'management.owner.user_id': userId
  }).sort({ createdAt: -1 });
};

auditPolicySchema.statics.findByComplianceFramework = function(framework) {
  return this.find({
    'compliance_mapping.frameworks.framework_name': framework,
    'policy.status': 'active'
  });
};

auditPolicySchema.statics.findRequiringReview = function() {
  return this.find({
    'management.next_review_date': { $lte: new Date() },
    'policy.status': { $in: ['active', 'draft'] }
  }).sort({ 'management.next_review_date': 1 });
};

module.exports = mongoose.model('AuditPolicy', auditPolicySchema);
