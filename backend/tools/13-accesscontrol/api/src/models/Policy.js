/**
 * Policy Model
 * AccessControl Tool 13 - ABAC Policies
 */

const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Policy name is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Policy name must be at least 3 characters'],
    maxlength: [100, 'Policy name cannot exceed 100 characters']
  },

  description: {
    type: String,
    required: [true, 'Policy description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },

  type: {
    type: String,
    enum: ['rbac', 'abac', 'temporal', 'contextual', 'risk-based'],
    default: 'rbac'
  },

  effect: {
    type: String,
    enum: ['allow', 'deny'],
    required: [true, 'Effect is required']
  },

  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  isActive: {
    type: Boolean,
    default: true
  },

  rules: [{
    resource: {
      type: String,
      required: true,
      trim: true
    },
    actions: [{
      type: String,
      required: true,
      trim: true
    }],
    conditions: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],

  conditions: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  scope: {
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    roles: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role'
    }],
    departments: [{
      type: String,
      trim: true
    }],
    ipRanges: [{
      type: String,
      match: [/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?:\/(?:[0-9]|[1-2][0-9]|3[0-2]))?$/, 'Invalid IP range format']
    }],
    timeWindows: [{
      days: [{
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      }],
      startTime: {
        type: String,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
      },
      endTime: {
        type: String,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
      }
    }]
  },

  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    tags: [{
      type: String,
      trim: true
    }],
    category: {
      type: String,
      enum: ['security', 'compliance', 'operational', 'emergency'],
      default: 'security'
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    }
  },

  validity: {
    startsAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date
    },
    isExpired: {
      type: Boolean,
      default: false
    }
  },

  statistics: {
    evaluations: {
      type: Number,
      default: 0
    },
    allows: {
      type: Number,
      default: 0
    },
    denies: {
      type: Number,
      default: 0
    },
    lastEvaluated: {
      type: Date
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
policySchema.index({ name: 1 });
policySchema.index({ type: 1 });
policySchema.index({ effect: 1 });
policySchema.index({ priority: -1 });
policySchema.index({ isActive: 1 });
policySchema.index({ 'validity.expiresAt': 1 });
policySchema.index({ 'metadata.category': 1 });
policySchema.index({ createdAt: -1 });

// Virtual for isExpired
policySchema.virtual('isExpired').get(function() {
  return this.validity.expiresAt && this.validity.expiresAt < new Date();
});

// Pre-save middleware to update isExpired
policySchema.pre('save', function(next) {
  this.validity.isExpired = this.isExpired;
  next();
});

// Static method to find active policies
policySchema.statics.findActive = function() {
  return this.find({
    isActive: true,
    $or: [
      { 'validity.expiresAt': { $exists: false } },
      { 'validity.expiresAt': { $gt: new Date() } }
    ]
  }).sort({ priority: -1 });
};

// Static method to find policies for user
policySchema.statics.findForUser = function(userId, userRoles = [], userDepartment = '') {
  return this.find({
    isActive: true,
    $or: [
      { 'validity.expiresAt': { $exists: false } },
      { 'validity.expiresAt': { $gt: new Date() } }
    ],
    $or: [
      { 'scope.users': userId },
      { 'scope.roles': { $in: userRoles } },
      { 'scope.departments': userDepartment },
      { 'scope.users': { $size: 0 }, 'scope.roles': { $size: 0 }, 'scope.departments': { $size: 0 } } // Global policies
    ]
  }).sort({ priority: -1 });
};

// Instance method to evaluate policy against context
policySchema.methods.evaluate = async function(context) {
  const { user, resource, action, environment } = context;

  // Update statistics
  this.statistics.evaluations += 1;
  this.statistics.lastEvaluated = new Date();

  try {
    // Check scope
    if (!this.isInScope(user, environment)) {
      return { decision: 'not-applicable', reason: 'Not in policy scope' };
    }

    // Check rules
    for (const rule of this.rules) {
      if (this.matchesRule(rule, resource, action, context)) {
        // Check conditions
        if (this.evaluateConditions(rule.conditions, context)) {
          this.statistics[this.effect === 'allow' ? 'allows' : 'denies'] += 1;
          await this.save();
          return {
            decision: this.effect,
            reason: `Rule matched: ${rule.resource}:${rule.actions.join(',')}`,
            rule: rule
          };
        }
      }
    }

    return { decision: 'not-applicable', reason: 'No rules matched' };
  } catch (error) {
    console.error('Policy evaluation error:', error);
    return { decision: 'deny', reason: 'Evaluation error' };
  }
};

// Helper method to check if context is in policy scope
policySchema.methods.isInScope = function(user, environment) {
  // Check users
  if (this.scope.users.length > 0 && !this.scope.users.includes(user._id)) {
    return false;
  }

  // Check roles
  if (this.scope.roles.length > 0) {
    const userRoleIds = user.roles.map(r => r.toString());
    if (!this.scope.roles.some(roleId => userRoleIds.includes(roleId.toString()))) {
      return false;
    }
  }

  // Check departments
  if (this.scope.departments.length > 0 && !this.scope.departments.includes(user.profile?.department)) {
    return false;
  }

  // Check IP ranges
  if (this.scope.ipRanges.length > 0 && environment?.ip) {
    if (!this.isIpInRange(environment.ip, this.scope.ipRanges)) {
      return false;
    }
  }

  // Check time windows
  if (this.scope.timeWindows.length > 0) {
    if (!this.isInTimeWindow(environment?.timestamp || new Date())) {
      return false;
    }
  }

  return true;
};

// Helper method to check if rule matches
policySchema.methods.matchesRule = function(rule, resource, action, context) {
  // Check resource
  if (rule.resource !== '*' && rule.resource !== resource) {
    return false;
  }

  // Check actions
  if (!rule.actions.includes('*') && !rule.actions.includes(action)) {
    return false;
  }

  return true;
};

// Helper method to evaluate conditions
policySchema.methods.evaluateConditions = function(conditions, context) {
  if (!conditions || Object.keys(conditions).length === 0) {
    return true;
  }

  // Simple condition evaluation (can be extended for complex logic)
  for (const [key, value] of Object.entries(conditions)) {
    const contextValue = this.getNestedProperty(context, key);
    if (contextValue !== value) {
      return false;
    }
  }

  return true;
};

// Helper method to check IP in range
policySchema.methods.isIpInRange = function(ip, ranges) {
  // Simplified IP range check (can be enhanced with proper CIDR support)
  return ranges.some(range => {
    if (range.includes('/')) {
      // CIDR notation - simplified check
      const [network] = range.split('/');
      return ip.startsWith(network.split('.').slice(0, -1).join('.'));
    } else {
      return ip === range;
    }
  });
};

// Helper method to check time window
policySchema.methods.isInTimeWindow = function(timestamp) {
  const date = new Date(timestamp);
  const day = date.toLocaleLowerCase('en-US', { weekday: 'long' });
  const time = date.toTimeString().slice(0, 5); // HH:MM

  return this.scope.timeWindows.some(window => {
    if (window.days.length > 0 && !window.days.includes(day)) {
      return false;
    }

    if (window.startTime && window.endTime) {
      return time >= window.startTime && time <= window.endTime;
    }

    return true;
  });
};

// Helper method to get nested property
policySchema.methods.getNestedProperty = function(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

module.exports = mongoose.model('Policy', policySchema);