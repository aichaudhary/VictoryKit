const mongoose = require('mongoose');

const vaultSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['personal', 'team', 'shared', 'enterprise'],
    default: 'personal'
  },
  encryptionKey: {
    type: String,
    required: true
  },
  encryptionAlgorithm: {
    type: String,
    default: 'aes-256-gcm'
  },
  accessControl: {
    type: {
      type: String,
      enum: ['owner-only', 'whitelist', 'role-based'],
      default: 'owner-only'
    },
    allowedUsers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: {
        type: String,
        enum: ['viewer', 'editor', 'admin'],
        default: 'viewer'
      },
      permissions: [String], // ['read', 'write', 'delete', 'share']
      grantedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      grantedAt: {
        type: Date,
        default: Date.now
      }
    }],
    allowedRoles: [{
      role: String,
      permissions: [String]
    }]
  },
  settings: {
    requireMFA: {
      type: Boolean,
      default: false
    },
    autoLock: {
      enabled: { type: Boolean, default: true },
      timeout: { type: Number, default: 30 } // minutes
    },
    passwordPolicy: {
      minLength: { type: Number, default: 12 },
      requireUppercase: { type: Boolean, default: true },
      requireLowercase: { type: Boolean, default: true },
      requireNumbers: { type: Boolean, default: true },
      requireSymbols: { type: Boolean, default: true },
      preventReuse: { type: Number, default: 5 } // last N passwords
    },
    backup: {
      enabled: { type: Boolean, default: true },
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
      retention: { type: Number, default: 30 } // days
    }
  },
  stats: {
    totalSecrets: { type: Number, default: 0 },
    totalUsers: { type: Number, default: 1 },
    lastAccessed: Date,
    createdSecrets: { type: Number, default: 0 },
    accessedSecrets: { type: Number, default: 0 },
    sharedSecrets: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes for performance
vaultSchema.index({ organization: 1 });
vaultSchema.index({ owner: 1 });
vaultSchema.index({ type: 1 });
vaultSchema.index({ 'accessControl.allowedUsers.user': 1 });
vaultSchema.index({ tags: 1 });

// Virtual for total secrets count
vaultSchema.virtual('secretCount').get(function() {
  return this.stats.totalSecrets;
});

// Method to check if user has access
vaultSchema.methods.hasAccess = function(userId, permission = 'read') {
  // Owner always has full access
  if (this.owner.toString() === userId.toString()) {
    return true;
  }

  // Check whitelist access
  const userAccess = this.accessControl.allowedUsers.find(
    access => access.user.toString() === userId.toString()
  );

  if (userAccess) {
    return userAccess.permissions.includes(permission);
  }

  return false;
};

// Method to add user access
vaultSchema.methods.addUserAccess = function(userId, role, permissions, grantedBy) {
  const existingAccess = this.accessControl.allowedUsers.find(
    access => access.user.toString() === userId.toString()
  );

  if (existingAccess) {
    existingAccess.role = role;
    existingAccess.permissions = permissions;
    existingAccess.grantedBy = grantedBy;
    existingAccess.grantedAt = new Date();
  } else {
    this.accessControl.allowedUsers.push({
      user: userId,
      role,
      permissions,
      grantedBy,
      grantedAt: new Date()
    });
  }

  this.stats.totalUsers = this.accessControl.allowedUsers.length + 1; // +1 for owner
  return this.save();
};

// Method to remove user access
vaultSchema.methods.removeUserAccess = function(userId) {
  this.accessControl.allowedUsers = this.accessControl.allowedUsers.filter(
    access => access.user.toString() !== userId.toString()
  );
  this.stats.totalUsers = this.accessControl.allowedUsers.length + 1; // +1 for owner
  return this.save();
};

module.exports = mongoose.model('Vault', vaultSchema);