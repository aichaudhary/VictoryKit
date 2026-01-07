/**
 * Role Model
 * AccessControl Tool 13
 */

const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Role name must be at least 2 characters'],
    maxlength: [50, 'Role name cannot exceed 50 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Role name can only contain letters, numbers, underscores, and hyphens']
  },

  description: {
    type: String,
    required: [true, 'Role description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },

  permissions: [{
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Validate permission format: resource:action or resource:* or *
        return /^(\*|[a-zA-Z0-9_-]+:(\*|[a-zA-Z0-9_-]+))$/.test(v);
      },
      message: 'Permission must be in format "resource:action", "resource:*", or "*"'
    }
  }],

  parentRole: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    default: null
  },

  childRoles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }],

  isSystem: {
    type: Boolean,
    default: false
  },

  isActive: {
    type: Boolean,
    default: true
  },

  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  color: {
    type: String,
    default: '#6B7280',
    match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color']
  },

  icon: {
    type: String,
    default: '🔐',
    maxlength: [10, 'Icon cannot exceed 10 characters']
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
    department: {
      type: String,
      trim: true
    }
  },

  restrictions: {
    maxUsers: {
      type: Number,
      default: -1, // -1 means unlimited
      min: -1
    },
    expiresAt: {
      type: Date
    },
    ipWhitelist: [{
      type: String,
      match: [/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'Invalid IP address format']
    }],
    timeRestrictions: {
      allowedDays: [{
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      }],
      allowedHours: {
        start: {
          type: Number,
          min: 0,
          max: 23
        },
        end: {
          type: Number,
          min: 0,
          max: 23
        }
      }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
roleSchema.index({ name: 1 });
roleSchema.index({ parentRole: 1 });
roleSchema.index({ isActive: 1 });
roleSchema.index({ priority: -1 });
roleSchema.index({ 'metadata.department': 1 });
roleSchema.index({ createdAt: -1 });

// Virtual for user count
roleSchema.virtual('userCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'roles',
  count: true
});

// Virtual for inherited permissions
roleSchema.virtual('inheritedPermissions').get(async function() {
  if (!this.parentRole) return [];

  const parentRole = await this.model('Role').findById(this.parentRole);
  if (!parentRole) return [];

  return [...new Set([...parentRole.permissions, ...parentRole.inheritedPermissions])];
});

// Virtual for all permissions (own + inherited)
roleSchema.virtual('allPermissions').get(async function() {
  const inherited = await this.inheritedPermissions;
  return [...new Set([...this.permissions, ...inherited])];
});

// Pre-save middleware to update child roles
roleSchema.pre('save', async function(next) {
  if (this.isNew && this.parentRole) {
    await this.model('Role').findByIdAndUpdate(
      this.parentRole,
      { $addToSet: { childRoles: this._id } }
    );
  }
  next();
});

// Pre-remove middleware to clean up references
roleSchema.pre('remove', async function(next) {
  // Remove from parent role's childRoles
  if (this.parentRole) {
    await this.model('Role').findByIdAndUpdate(
      this.parentRole,
      { $pull: { childRoles: this._id } }
    );
  }

  // Remove this role from all users
  await this.model('User').updateMany(
    { roles: this._id },
    { $pull: { roles: this._id } }
  );

  // Update child roles to remove parent reference
  await this.model('Role').updateMany(
    { parentRole: this._id },
    { $unset: { parentRole: 1 } }
  );

  next();
});

// Static method to get role hierarchy
roleSchema.statics.getHierarchy = async function(roleId, depth = 0, maxDepth = 5) {
  if (depth > maxDepth) return null;

  const role = await this.findById(roleId).populate('childRoles');
  if (!role) return null;

  const hierarchy = {
    ...role.toObject(),
    children: []
  };

  if (role.childRoles && role.childRoles.length > 0) {
    for (const childId of role.childRoles) {
      const childHierarchy = await this.getHierarchy(childId, depth + 1, maxDepth);
      if (childHierarchy) {
        hierarchy.children.push(childHierarchy);
      }
    }
  }

  return hierarchy;
};

// Instance method to check if role has permission
roleSchema.methods.hasPermission = async function(permission) {
  const allPermissions = await this.allPermissions;
  return allPermissions.includes('*') ||
         allPermissions.includes(permission) ||
         allPermissions.some(p => {
           if (p.endsWith(':*')) {
             return permission.startsWith(p.slice(0, -1));
           }
           return false;
         });
};

module.exports = mongoose.model('Role', roleSchema);