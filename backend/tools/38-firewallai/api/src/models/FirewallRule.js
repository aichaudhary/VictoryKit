const mongoose = require('mongoose');

const firewallRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  vendor: {
    type: String,
    required: true,
    enum: ['pfsense', 'palo-alto', 'fortinet', 'checkpoint', 'cisco-asa', 'aws', 'azure', 'gcp', 'other'],
    index: true
  },
  vendorRuleId: {
    type: String,
    sparse: true
  },
  action: {
    type: String,
    required: true,
    enum: ['allow', 'deny', 'reject', 'drop', 'log', 'alert'],
    default: 'allow'
  },
  protocol: {
    type: String,
    enum: ['tcp', 'udp', 'icmp', 'ip', 'any'],
    default: 'any'
  },
  source: {
    type: {
      type: String,
      enum: ['ip', 'network', 'interface', 'any'],
      default: 'any'
    },
    value: {
      type: String,
      default: 'any'
    },
    port: {
      type: String,
      default: 'any'
    }
  },
  destination: {
    type: {
      type: String,
      enum: ['ip', 'network', 'interface', 'any'],
      default: 'any'
    },
    value: {
      type: String,
      default: 'any'
    },
    port: {
      type: String,
      default: 'any'
    }
  },
  direction: {
    type: String,
    enum: ['inbound', 'outbound', 'bidirectional'],
    default: 'bidirectional'
  },
  interface: {
    type: String,
    default: 'any'
  },
  schedule: {
    enabled: {
      type: Boolean,
      default: false
    },
    startTime: Date,
    endTime: Date,
    daysOfWeek: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }]
  },
  logging: {
    enabled: {
      type: Boolean,
      default: true
    },
    level: {
      type: String,
      enum: ['none', 'basic', 'detailed', 'debug'],
      default: 'basic'
    }
  },
  priority: {
    type: Number,
    min: 1,
    max: 1000,
    default: 500
  },
  enabled: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  metadata: {
    createdBy: {
      type: String,
      required: true
    },
    lastModifiedBy: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastModifiedAt: {
      type: Date,
      default: Date.now
    },
    version: {
      type: Number,
      default: 1
    }
  },
  compliance: {
    frameworks: [{
      type: String,
      enum: ['pci-dss', 'hipaa', 'sox', 'gdpr', 'nist', 'iso-27001']
    }],
    requirements: [{
      framework: String,
      requirement: String,
      description: String
    }]
  },
  risk: {
    level: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    factors: [{
      type: String,
      description: String,
      weight: Number
    }]
  },
  // Advanced ML and AI features
  mlAnalysis: {
    threatScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    anomalyScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    behavioralScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    lastAnalyzed: Date,
    analysisHistory: [{
      timestamp: Date,
      threatScore: Number,
      anomalyScore: Number,
      behavioralScore: Number,
      confidence: Number,
      indicators: [String],
      recommendations: [String]
    }]
  },
  // Real-time monitoring and performance
  performance: {
    hitCount: {
      type: Number,
      default: 0
    },
    lastHit: Date,
    avgProcessingTime: {
      type: Number,
      default: 0
    },
    throughput: {
      type: Number,
      default: 0
    },
    efficiency: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    }
  },
  // Enterprise integrations
  integrations: {
    siem: {
      enabled: {
        type: Boolean,
        default: false
      },
      systems: [{
        name: {
          type: String,
          enum: ['splunk', 'elk', 'qradar', 'sentinel', 'other']
        },
        config: mongoose.Schema.Types.Mixed
      }]
    },
    soar: {
      enabled: {
        type: Boolean,
        default: false
      },
      systems: [{
        name: {
          type: String,
          enum: ['cortex-xsoar', 'swimlane', 'resilient', 'other']
        },
        playbooks: [String],
        config: mongoose.Schema.Types.Mixed
      }]
    },
    edr: {
      enabled: {
        type: Boolean,
        default: false
      },
      systems: [{
        name: {
          type: String,
          enum: ['crowdstrike', 'defender', 'sentinelone', 'other']
        },
        policies: [String],
        config: mongoose.Schema.Types.Mixed
      }]
    },
    threatIntel: {
      enabled: {
        type: Boolean,
        default: false
      },
      feeds: [{
        name: {
          type: String,
          enum: ['alienvault-otx', 'recorded-future', 'mandiant', 'other']
        },
        updateFrequency: {
          type: String,
          enum: ['realtime', 'hourly', 'daily', 'weekly'],
          default: 'daily'
        },
        config: mongoose.Schema.Types.Mixed
      }]
    }
  },
  // Advanced policy features
  policy: {
    inheritance: {
      enabled: {
        type: Boolean,
        default: false
      },
      parentRule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FirewallRule'
      },
      overrides: mongoose.Schema.Types.Mixed
    },
    conditions: [{
      type: {
        type: String,
        enum: ['time', 'geo', 'user', 'device', 'application', 'threat-level']
      },
      operator: {
        type: String,
        enum: ['equals', 'not-equals', 'contains', 'not-contains', 'greater-than', 'less-than', 'in-range']
      },
      value: mongoose.Schema.Types.Mixed,
      negate: {
        type: Boolean,
        default: false
      }
    }],
    actions: [{
      type: {
        type: String,
        enum: ['allow', 'deny', 'redirect', 'rate-limit', 'log', 'alert', 'quarantine']
      },
      parameters: mongoose.Schema.Types.Mixed
    }]
  },
  // Compliance and audit
  audit: {
    changeHistory: [{
      timestamp: Date,
      user: String,
      action: {
        type: String,
        enum: ['created', 'modified', 'enabled', 'disabled', 'deleted']
      },
      changes: mongoose.Schema.Types.Mixed,
      reason: String
    }],
    approval: {
      required: {
        type: Boolean,
        default: false
      },
      workflow: String,
      approvers: [String],
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      }
    }
  },
  // Real-time features
  realtime: {
    monitoring: {
      enabled: {
        type: Boolean,
        default: true
      },
      alertThresholds: {
        hitRate: {
          type: Number,
          default: 1000
        },
        threatScore: {
          type: Number,
          default: 70
        },
        anomalyScore: {
          type: Number,
          default: 80
        }
      }
    },
    notifications: {
      enabled: {
        type: Boolean,
        default: true
      },
      channels: [{
        type: {
          type: String,
          enum: ['email', 'slack', 'teams', 'webhook', 'sms']
        },
        config: mongoose.Schema.Types.Mixed
      }]
    }
  }
}, {
  timestamps: true,
  collection: 'firewall_rules'
});

// Indexes for performance
firewallRuleSchema.index({ vendor: 1, enabled: 1 });
firewallRuleSchema.index({ priority: -1 });
firewallRuleSchema.index({ 'source.value': 1 });
firewallRuleSchema.index({ 'destination.value': 1 });
firewallRuleSchema.index({ 'metadata.createdAt': -1 });
firewallRuleSchema.index({ tags: 1 });

// Pre-save middleware to update lastModifiedAt
firewallRuleSchema.pre('save', function(next) {
  this.metadata.lastModifiedAt = new Date();
  this.metadata.version += 1;
  next();
});

// Virtual for rule summary
firewallRuleSchema.virtual('summary').get(function() {
  return `${this.action.toUpperCase()} ${this.protocol} from ${this.source.value}:${this.source.port} to ${this.destination.value}:${this.destination.port}`;
});

// Instance method to check if rule applies to traffic
firewallRuleSchema.methods.appliesTo = function(traffic) {
  // Implementation for checking if rule applies to specific traffic
  // This would include IP matching, port matching, protocol matching, etc.
  return true; // Placeholder
};

// Static method to find rules by vendor
firewallRuleSchema.statics.findByVendor = function(vendor) {
  return this.find({ vendor, enabled: true }).sort({ priority: -1 });
};

// Static method to find rules by tag
firewallRuleSchema.statics.findByTag = function(tag) {
  return this.find({ tags: tag, enabled: true }).sort({ priority: -1 });
};

module.exports = mongoose.model('FirewallRule', firewallRuleSchema);