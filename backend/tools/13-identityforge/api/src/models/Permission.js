/**
 * Permission Model
 * IdentityForge Tool 13
 */

const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Permission name is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Permission name must be at least 3 characters'],
    maxlength: [100, 'Permission name cannot exceed 100 characters']
  },

  resource: {
    type: String,
    required: [true, 'Resource is required'],
    trim: true,
    minlength: [2, 'Resource must be at least 2 characters'],
    maxlength: [50, 'Resource cannot exceed 50 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Resource can only contain letters, numbers, underscores, and hyphens']
  },

  action: {
    type: String,
    required: [true, 'Action is required'],
    trim: true,
    minlength: [2, 'Action must be at least 2 characters'],
    maxlength: [50, 'Action cannot exceed 50 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Action can only contain letters, numbers, underscores, and hyphens']
  },

  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },

  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['user', 'role', 'permission', 'policy', 'audit', 'system', 'data', 'security'],
    default: 'system'
  },

  scope: {
    type: String,
    enum: ['global', 'organization', 'department', 'team', 'personal'],
    default: 'global'
  },

  isSystem: {
    type: Boolean,
    default: false
  },

  isActive: {
    type: Boolean,
    default: true
  },

  dependencies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission'
  }],

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
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    compliance: [{
      standard: {
        type: String,
        enum: ['GDPR', 'HIPAA', 'PCI-DSS', 'SOX', 'ISO27001', 'NIST']
      },
      requirement: String
    }]
  },

  usage: {
    assignedRoles: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role'
    }],
    assignedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    lastUsed: {
      type: Date
    },
    usageCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
permissionSchema.index({ name: 1 });
permissionSchema.index({ resource: 1, action: 1 });
permissionSchema.index({ category: 1 });
permissionSchema.index({ isActive: 1 });
permissionSchema.index({ 'metadata.riskLevel': 1 });
permissionSchema.index({ createdAt: -1 });

// Compound index for resource-action uniqueness
permissionSchema.index({ resource: 1, action: 1 }, { unique: true });

// Virtual for full permission string
permissionSchema.virtual('permissionString').get(function() {
  return `${this.resource}:${this.action}`;
});

// Virtual for assigned count
permissionSchema.virtual('assignedCount').get(function() {
  return (this.usage.assignedRoles?.length || 0) + (this.usage.assignedUsers?.length || 0);
});

// Pre-save middleware to update permission string
permissionSchema.pre('save', function(next) {
  if (this.isModified('resource') || this.isModified('action')) {
    // Check for duplicate resource:action combination
    this.constructor.findOne({
      resource: this.resource,
      action: this.action,
      _id: { $ne: this._id }
    }).then(existing => {
      if (existing) {
        const error = new Error('Permission with this resource and action already exists');
        return next(error);
      }
      next();
    }).catch(next);
  } else {
    next();
  }
});

// Static method to find by resource and action
permissionSchema.statics.findByResourceAction = function(resource, action) {
  return this.findOne({ resource, action, isActive: true });
};

// Static method to get permissions by category
permissionSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ name: 1 });
};

// Static method to get system permissions
permissionSchema.statics.getSystemPermissions = function() {
  return this.find({ isSystem: true, isActive: true }).sort({ category: 1, name: 1 });
};

// Instance method to check if permission is assigned to user
permissionSchema.methods.isAssignedToUser = async function(userId) {
  const user = await this.model('User').findById(userId);
  if (!user) return false;

  // Check direct assignment
  if (user.permissions.includes(this.permissionString)) return true;

  // Check role assignments
  for (const roleId of user.roles) {
    const role = await this.model('Role').findById(roleId);
    if (role && await role.hasPermission(this.permissionString)) return true;
  }

  return false;
};

// Instance method to get dependent permissions
permissionSchema.methods.getDependencies = function() {
  return this.model('Permission').find({ _id: { $in: this.dependencies } });
};

module.exports = mongoose.model('Permission', permissionSchema);