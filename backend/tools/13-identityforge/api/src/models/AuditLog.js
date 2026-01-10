/**
 * AuditLog Model
 * IdentityForge Tool 13
 */

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },

  user: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    ip: {
      type: String
    },
    userAgent: {
      type: String
    }
  },

  action: {
    type: {
      type: String,
      required: true,
      enum: ['create', 'read', 'update', 'delete', 'login', 'logout', 'grant', 'revoke', 'execute', 'access', 'deny']
    },
    resource: {
      type: String,
      required: true,
      enum: ['user', 'role', 'permission', 'policy', 'session', 'system', 'data', 'api']
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId
    },
    details: {
      type: mongoose.Schema.Types.Mixed
    }
  },

  result: {
    type: String,
    enum: ['success', 'failure', 'denied', 'error'],
    required: true
  },

  reason: {
    type: String,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },

  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },

  category: {
    type: String,
    enum: ['authentication', 'authorization', 'administration', 'security', 'compliance', 'operational'],
    default: 'operational'
  },

  session: {
    id: {
      type: String
    },
    device: {
      type: String
    },
    location: {
      city: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    }
  },

  metadata: {
    service: {
      type: String,
      default: 'identityforge'
    },
    version: {
      type: String
    },
    environment: {
      type: String,
      enum: ['development', 'staging', 'production'],
      default: 'production'
    },
    correlationId: {
      type: String
    },
    tags: [{
      type: String
    }]
  },

  compliance: {
    gdpr: {
      dataSubject: Boolean,
      processing: String,
      purpose: String
    },
    hipaa: {
      phi: Boolean,
      access: String
    },
    pci: {
      sensitive: Boolean,
      action: String
    }
  },

  risk: {
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    factors: [{
      type: String
    }],
    mitigation: {
      type: String
    }
  }
}, {
  timestamps: false, // We use timestamp field instead
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
auditLogSchema.index({ 'user.id': 1, timestamp: -1 });
auditLogSchema.index({ 'action.type': 1, timestamp: -1 });
auditLogSchema.index({ 'action.resource': 1, timestamp: -1 });
auditLogSchema.index({ result: 1, timestamp: -1 });
auditLogSchema.index({ severity: 1, timestamp: -1 });
auditLogSchema.index({ category: 1, timestamp: -1 });
auditLogSchema.index({ 'metadata.correlationId': 1 });
auditLogSchema.index({ timestamp: -1 }); // Main chronological index
auditLogSchema.index({ 'session.id': 1 });

// Compound indexes for common queries
auditLogSchema.index({ 'user.id': 1, 'action.resource': 1, timestamp: -1 });
auditLogSchema.index({ 'action.type': 1, result: 1, timestamp: -1 });

// TTL index for automatic cleanup (90 days)
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Virtual for formatted timestamp
auditLogSchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toISOString();
});

// Static method to log action
auditLogSchema.statics.log = async function(data) {
  try {
    const log = new this(data);
    await log.save();
    return log;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error to avoid breaking main functionality
    return null;
  }
};

// Static method to get user activity
auditLogSchema.statics.getUserActivity = function(userId, limit = 50) {
  return this.find({ 'user.id': userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('user.id', 'username email');
};

// Static method to get resource activity
auditLogSchema.statics.getResourceActivity = function(resource, resourceId = null, limit = 50) {
  const query = { 'action.resource': resource };
  if (resourceId) {
    query['action.resourceId'] = resourceId;
  }

  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('user.id', 'username email');
};

// Static method to get security events
auditLogSchema.statics.getSecurityEvents = function(severity = 'high', limit = 100) {
  return this.find({
    severity: { $in: severity === 'high' ? ['high', 'critical'] : [severity] },
    category: 'security'
  })
  .sort({ timestamp: -1 })
  .limit(limit)
  .populate('user.id', 'username email');
};

// Static method to get failed actions
auditLogSchema.statics.getFailedActions = function(limit = 50) {
  return this.find({ result: { $in: ['failure', 'denied', 'error'] } })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('user.id', 'username email');
};

// Instance method to check if log is compliant
auditLogSchema.methods.isCompliant = function(standard) {
  switch (standard) {
    case 'gdpr':
      return this.compliance?.gdpr?.dataSubject !== undefined;
    case 'hipaa':
      return this.compliance?.hipaa?.phi !== undefined;
    case 'pci':
      return this.compliance?.pci?.sensitive !== undefined;
    default:
      return false;
  }
};

module.exports = mongoose.model('AuditLog', auditLogSchema);