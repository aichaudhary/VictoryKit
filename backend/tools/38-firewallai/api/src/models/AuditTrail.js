const mongoose = require('mongoose');

const auditTrailSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
    index: true,
    default: Date.now
  },
  auditId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'create', 'update', 'delete', 'enable', 'disable', 'start', 'stop', 'restart',
      'login', 'logout', 'config-change', 'rule-change', 'policy-change',
      'backup', 'restore', 'export', 'import', 'sync', 'deploy', 'rollback',
      'alert-acknowledge', 'alert-resolve', 'alert-escalate', 'threat-response',
      'compliance-check', 'report-generate', 'user-create', 'user-update', 'user-delete'
    ],
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ['configuration', 'security', 'administration', 'monitoring', 'compliance', 'system'],
    index: true
  },
  vendor: {
    type: String,
    enum: ['pfsense', 'palo-alto', 'fortinet', 'checkpoint', 'cisco-asa', 'aws', 'azure', 'gcp', 'firewallai'],
    index: true
  },
  device: {
    id: String,
    name: String,
    ip: String,
    location: String
  },
  user: {
    id: {
      type: String,
      required: true,
      index: true
    },
    username: {
      type: String,
      required: true
    },
    email: String,
    role: String,
    department: String,
    ip: String,
    userAgent: String
  },
  session: {
    id: String,
    startTime: Date,
    source: {
      type: String,
      enum: ['web-ui', 'api', 'cli', 'automation', 'scheduled']
    }
  },
  resource: {
    type: {
      type: String,
      required: true,
      enum: ['rule', 'policy', 'interface', 'zone', 'user', 'group', 'device', 'alert', 'report', 'backup', 'system']
    },
    id: String,
    name: String,
    path: String // For hierarchical resources
  },
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
    diff: [{
      field: String,
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed,
      operation: {
        type: String,
        enum: ['add', 'remove', 'modify', 'replace']
      }
    }]
  },
  details: {
    description: {
      type: String,
      maxlength: 500
    },
    reason: String,
    ticketId: String,
    approvalRequired: {
      type: Boolean,
      default: false
    },
    approvedBy: {
      userId: String,
      username: String,
      timestamp: Date
    },
    automated: {
      type: Boolean,
      default: false
    },
    script: String,
    parameters: mongoose.Schema.Types.Mixed
  },
  impact: {
    scope: {
      type: String,
      enum: ['local', 'device', 'network', 'organization']
    },
    risk: {
      type: String,
      enum: ['none', 'low', 'medium', 'high', 'critical']
    },
    affected: {
      rules: Number,
      policies: Number,
      devices: Number,
      users: Number,
      services: Number
    }
  },
  compliance: {
    frameworks: [{
      type: String,
      enum: ['pci-dss', 'hipaa', 'sox', 'gdpr', 'nist', 'iso-27001']
    }],
    requirements: [String],
    violations: [{
      framework: String,
      requirement: String,
      description: String
    }]
  },
  status: {
    type: String,
    required: true,
    enum: ['success', 'failure', 'pending', 'cancelled', 'rolled-back'],
    default: 'success',
    index: true
  },
  error: {
    code: String,
    message: String,
    details: mongoose.Schema.Types.Mixed
  },
  rollback: {
    available: {
      type: Boolean,
      default: false
    },
    performed: {
      type: Boolean,
      default: false
    },
    timestamp: Date,
    by: {
      userId: String,
      username: String
    }
  },
  notifications: {
    sent: [{
      channel: {
        type: String,
        enum: ['email', 'slack', 'teams', 'webhook']
      },
      recipient: String,
      timestamp: Date,
      success: Boolean
    }],
    required: {
      type: Boolean,
      default: false
    },
    escalation: {
      triggered: Boolean,
      reason: String
    }
  },
  tags: [{
    type: String,
    index: true
  }],
  metadata: {
    correlationId: String,
    parentAuditId: String,
    childAudits: [String],
    sourceEventId: String,
    customFields: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: false, // We use timestamp field instead
  collection: 'audit_trail'
});

// Compound indexes for performance
auditTrailSchema.index({ timestamp: -1, action: 1 });
auditTrailSchema.index({ 'user.id': 1, timestamp: -1 });
auditTrailSchema.index({ category: 1, action: 1, timestamp: -1 });
auditTrailSchema.index({ 'resource.type': 1, 'resource.id': 1, timestamp: -1 });
auditTrailSchema.index({ status: 1, timestamp: -1 });

// TTL index for automatic cleanup (7 years for audit trail)
auditTrailSchema.index({ timestamp: 1 }, { expireAfterSeconds: 220752000 });

// Virtual for formatted timestamp
auditTrailSchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toISOString();
});

// Virtual for age in days
auditTrailSchema.virtual('ageDays').get(function() {
  return Math.floor((Date.now() - this.timestamp) / (1000 * 60 * 60 * 24));
});

// Instance method to check if rollback is possible
auditTrailSchema.methods.canRollback = function() {
  return this.rollback.available &&
         !this.rollback.performed &&
         this.status === 'success' &&
         this.ageDays <= 30; // Only allow rollback within 30 days
};

// Instance method to perform rollback
auditTrailSchema.methods.performRollback = function(userId, username) {
  if (!this.canRollback()) {
    throw new Error('Rollback not available for this audit entry');
  }

  this.rollback.performed = true;
  this.rollback.timestamp = new Date();
  this.rollback.by = { userId, username };

  // Create rollback audit entry
  const rollbackAudit = new this.constructor({
    auditId: `${this.auditId}-rollback`,
    action: 'rollback',
    category: this.category,
    vendor: this.vendor,
    device: this.device,
    user: {
      id: userId,
      username: username
    },
    session: this.session,
    resource: this.resource,
    details: {
      description: `Rollback of audit entry ${this.auditId}`,
      reason: 'Manual rollback performed',
      automated: false
    },
    impact: this.impact,
    compliance: this.compliance,
    metadata: {
      parentAuditId: this.auditId,
      correlationId: this.metadata.correlationId
    }
  });

  return Promise.all([
    this.save(),
    rollbackAudit.save()
  ]);
};

// Instance method to get change summary
auditTrailSchema.methods.getChangeSummary = function() {
  if (!this.changes.diff || this.changes.diff.length === 0) {
    return 'No changes recorded';
  }

  const summary = this.changes.diff.map(change => {
    const operation = change.operation || 'modify';
    return `${operation} ${change.field}: ${JSON.stringify(change.oldValue)} → ${JSON.stringify(change.newValue)}`;
  });

  return summary.join('; ');
};

// Static method to find user actions
auditTrailSchema.statics.findUserActions = function(userId, hours = 24) {
  const since = new Date(Date.now() - (hours * 60 * 60 * 1000));
  return this.find({
    'user.id': userId,
    timestamp: { $gte: since }
  }).sort({ timestamp: -1 });
};

// Static method to find resource changes
auditTrailSchema.statics.findResourceChanges = function(resourceType, resourceId, hours = 24) {
  const since = new Date(Date.now() - (hours * 60 * 60 * 1000));
  return this.find({
    'resource.type': resourceType,
    'resource.id': resourceId,
    timestamp: { $gte: since }
  }).sort({ timestamp: -1 });
};

// Static method to find failed actions
auditTrailSchema.statics.findFailedActions = function(hours = 24) {
  const since = new Date(Date.now() - (hours * 60 * 60 * 1000));
  return this.find({
    status: 'failure',
    timestamp: { $gte: since }
  }).sort({ timestamp: -1 });
};

// Static method to get audit statistics
auditTrailSchema.statics.getAuditStats = function(hours = 24) {
  const since = new Date(Date.now() - (hours * 60 * 60 * 1000));
  return this.aggregate([
    { $match: { timestamp: { $gte: since } } },
    {
      $group: {
        _id: {
          action: '$action',
          status: '$status'
        },
        count: { $sum: 1 },
        users: { $addToSet: '$user.id' }
      }
    },
    {
      $group: {
        _id: '$_id.action',
        statuses: {
          $push: {
            status: '$_id.status',
            count: '$count',
            uniqueUsers: { $size: '$users' }
          }
        },
        totalCount: { $sum: '$count' },
        totalUsers: { $addToSet: '$users' }
      }
    },
    {
      $project: {
        action: '$_id',
        statuses: 1,
        totalCount: 1,
        uniqueUsers: { $size: { $reduce: { input: '$totalUsers', initialValue: [], in: { $setUnion: ['$$value', '$$this'] } } } }
      }
    }
  ]);
};

// Static method to find compliance violations
auditTrailSchema.statics.findComplianceViolations = function(framework, hours = 24) {
  const since = new Date(Date.now() - (hours * 60 * 60 * 1000));
  return this.find({
    'compliance.frameworks': framework,
    'compliance.violations': { $exists: true, $ne: [] },
    timestamp: { $gte: since }
  }).sort({ timestamp: -1 });
};

module.exports = mongoose.model('AuditTrail', auditTrailSchema);