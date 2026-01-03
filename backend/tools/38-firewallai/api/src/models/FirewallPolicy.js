const mongoose = require('mongoose');

const firewallPolicySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    unique: true
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
  type: {
    type: String,
    enum: ['security', 'application', 'user', 'global', 'pre-rulebase', 'post-rulebase'],
    default: 'security'
  },
  rules: [{
    ruleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FirewallRule',
      required: true
    },
    order: {
      type: Number,
      required: true
    },
    enabled: {
      type: Boolean,
      default: true
    }
  }],
  defaultAction: {
    type: String,
    enum: ['allow', 'deny', 'reject'],
    default: 'deny'
  },
  scope: {
    zones: [{
      type: String,
      trim: true
    }],
    interfaces: [{
      type: String,
      trim: true
    }],
    networks: [{
      type: String,
      trim: true
    }]
  },
  schedule: {
    enabled: {
      type: Boolean,
      default: false
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    rules: [{
      daysOfWeek: [{
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      }],
      startTime: String, // HH:MM format
      endTime: String,   // HH:MM format
      action: {
        type: String,
        enum: ['enable', 'disable', 'modify']
      }
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
    },
    destinations: [{
      type: {
        type: String,
        enum: ['syslog', 'file', 'database', 'siem', 'cloud']
      },
      config: mongoose.Schema.Types.Mixed
    }]
  },
  threatPrevention: {
    enabled: {
      type: Boolean,
      default: false
    },
    profiles: [{
      name: String,
      type: {
        type: String,
        enum: ['ips', 'av', 'url-filtering', 'file-blocking', 'data-filtering']
      },
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      action: {
        type: String,
        enum: ['alert', 'drop', 'reset', 'block']
      }
    }]
  },
  nat: {
    enabled: {
      type: Boolean,
      default: false
    },
    rules: [{
      name: String,
      type: {
        type: String,
        enum: ['static', 'dynamic', 'port-forwarding']
      },
      original: {
        ip: String,
        port: String
      },
      translated: {
        ip: String,
        port: String
      }
    }]
  },
  vpn: {
    enabled: {
      type: Boolean,
      default: false
    },
    tunnels: [{
      name: String,
      type: {
        type: String,
        enum: ['ipsec', 'ssl', 'wireguard', 'openvpn']
      },
      localEndpoint: String,
      remoteEndpoint: String,
      status: {
        type: String,
        enum: ['up', 'down', 'pending'],
        default: 'down'
      }
    }]
  },
  enabled: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    min: 1,
    max: 1000,
    default: 500
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
    status: {
      type: String,
      enum: ['compliant', 'non-compliant', 'pending-review'],
      default: 'pending-review'
    },
    lastAudit: Date,
    nextAudit: Date
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
    assessment: {
      lastAssessment: Date,
      assessor: String,
      findings: [{
        issue: String,
        severity: String,
        recommendation: String
      }]
    }
  }
}, {
  timestamps: true,
  collection: 'firewall_policies'
});

// Indexes for performance
firewallPolicySchema.index({ vendor: 1, enabled: 1 });
firewallPolicySchema.index({ type: 1 });
firewallPolicySchema.index({ priority: -1 });
firewallPolicySchema.index({ 'metadata.createdAt': -1 });
firewallPolicySchema.index({ tags: 1 });

// Pre-save middleware
firewallPolicySchema.pre('save', function(next) {
  this.metadata.lastModifiedAt = new Date();
  this.metadata.version += 1;
  next();
});

// Virtual for active rules count
firewallPolicySchema.virtual('activeRulesCount').get(function() {
  return this.rules.filter(rule => rule.enabled).length;
});

// Instance method to add rule
firewallPolicySchema.methods.addRule = function(ruleId, order) {
  const existingRule = this.rules.find(r => r.ruleId.toString() === ruleId.toString());
  if (existingRule) {
    existingRule.order = order;
    existingRule.enabled = true;
  } else {
    this.rules.push({ ruleId, order, enabled: true });
  }
  this.rules.sort((a, b) => a.order - b.order);
};

// Instance method to remove rule
firewallPolicySchema.methods.removeRule = function(ruleId) {
  this.rules = this.rules.filter(r => r.ruleId.toString() !== ruleId.toString());
};

// Instance method to reorder rules
firewallPolicySchema.methods.reorderRules = function(ruleOrder) {
  // ruleOrder should be an array of ruleIds in desired order
  this.rules.forEach((rule, index) => {
    rule.order = index + 1;
  });
};

// Static method to find policies by vendor
firewallPolicySchema.statics.findByVendor = function(vendor) {
  return this.find({ vendor, enabled: true }).sort({ priority: -1 });
};

// Static method to find policies by type
firewallPolicySchema.statics.findByType = function(type) {
  return this.find({ type, enabled: true }).sort({ priority: -1 });
};

module.exports = mongoose.model('FirewallPolicy', firewallPolicySchema);