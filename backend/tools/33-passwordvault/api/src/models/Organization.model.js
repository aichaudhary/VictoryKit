const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  domain: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: String,
  logo: String,
  website: String,

  // Subscription and billing
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'starter', 'professional', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'cancelled'],
      default: 'active'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    autoRenew: {
      type: Boolean,
      default: true
    },
    limits: {
      users: { type: Number, default: 5 },
      vaults: { type: Number, default: 10 },
      secrets: { type: Number, default: 100 },
      storage: { type: Number, default: 100 }, // MB
      apiCalls: { type: Number, default: 1000 } // per month
    }
  },

  // Organization settings
  settings: {
    allowPublicSignups: { type: Boolean, default: false },
    requireEmailVerification: { type: Boolean, default: true },
    requireMFA: { type: Boolean, default: false },
    passwordPolicy: {
      minLength: { type: Number, default: 12 },
      requireUppercase: { type: Boolean, default: true },
      requireLowercase: { type: Boolean, default: true },
      requireNumbers: { type: Boolean, default: true },
      requireSymbols: { type: Boolean, default: true },
      preventReuse: { type: Number, default: 5 }
    },
    sessionTimeout: { type: Number, default: 30 }, // minutes
    auditRetention: { type: Number, default: 90 }, // days
    backupFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily'
    }
  },

  // Compliance settings
  compliance: {
    gdpr: {
      enabled: { type: Boolean, default: false },
      dataRetention: { type: Number, default: 2555 }, // days (7 years)
      consentRequired: { type: Boolean, default: true }
    },
    hipaa: {
      enabled: { type: Boolean, default: false },
      businessAssociateAgreement: { type: Boolean, default: false }
    },
    pci: {
      enabled: { type: Boolean, default: false },
      level: {
        type: String,
        enum: ['1', '2', '3', '4'],
        default: '4'
      }
    },
    sox: {
      enabled: { type: Boolean, default: false },
      auditorAccess: { type: Boolean, default: false }
    },
    custom: [{
      name: String,
      enabled: { type: Boolean, default: false },
      requirements: [String],
      auditorEmail: String
    }]
  },

  // Team management
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['member', 'admin', 'auditor', 'readonly'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Invitations
  invitations: [{
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    role: {
      type: String,
      enum: ['member', 'admin', 'auditor', 'readonly'],
      default: 'member'
    },
    token: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Statistics
  stats: {
    totalUsers: { type: Number, default: 1 },
    totalVaults: { type: Number, default: 0 },
    totalSecrets: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 1 },
    lastActivity: Date,
    storageUsed: { type: Number, default: 0 }, // MB
    apiCallsThisMonth: { type: Number, default: 0 }
  },

  // Branding
  branding: {
    primaryColor: { type: String, default: '#3B82F6' },
    secondaryColor: { type: String, default: '#6B7280' },
    logo: String,
    favicon: String,
    customDomain: String
  },

  // Integrations
  integrations: {
    ldap: {
      enabled: { type: Boolean, default: false },
      url: String,
      bindDn: String,
      bindPassword: String,
      baseDn: String,
      userSearchFilter: String
    },
    sso: {
      enabled: { type: Boolean, default: false },
      provider: {
        type: String,
        enum: ['okta', 'auth0', 'azure-ad', 'google', 'custom']
      },
      config: mongoose.Schema.Types.Mixed
    },
    slack: {
      enabled: { type: Boolean, default: false },
      webhookUrl: String,
      channels: [String]
    },
    webhook: {
      enabled: { type: Boolean, default: false },
      url: String,
      secret: String,
      events: [String]
    }
  },

  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  suspendedAt: Date,
  suspensionReason: String,

  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes
organizationSchema.index({ domain: 1 }, { unique: true });
organizationSchema.index({ owner: 1 });
organizationSchema.index({ 'subscription.status': 1 });
organizationSchema.index({ 'members.user': 1 });

// Virtual for member count
organizationSchema.virtual('memberCount').get(function() {
  return this.members.length + 1; // +1 for owner
});

// Method to check if user is member
organizationSchema.methods.isMember = function(userId) {
  if (this.owner.toString() === userId.toString()) return true;
  return this.members.some(member => member.user.toString() === userId.toString());
};

// Method to check if user is admin
organizationSchema.methods.isAdmin = function(userId) {
  if (this.owner.toString() === userId.toString()) return true;
  return this.admins.some(admin => admin.toString() === userId.toString());
};

// Method to add member
organizationSchema.methods.addMember = function(userId, role = 'member', invitedBy = null) {
  if (this.isMember(userId)) {
    throw new Error('User is already a member');
  }

  this.members.push({
    user: userId,
    role,
    invitedBy
  });

  this.stats.totalUsers = this.memberCount;
  return this.save();
};

// Method to remove member
organizationSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(
    member => member.user.toString() !== userId.toString()
  );

  // Remove from admins if applicable
  this.admins = this.admins.filter(
    admin => admin.toString() !== userId.toString()
  );

  this.stats.totalUsers = this.memberCount;
  return this.save();
};

// Method to check subscription limits
organizationSchema.methods.checkLimits = function(resource, count = 1) {
  const limit = this.subscription.limits[resource];
  if (!limit) return true; // No limit set

  const current = this.stats[`total${resource.charAt(0).toUpperCase() + resource.slice(1)}`] || 0;
  return (current + count) <= limit;
};

module.exports = mongoose.model('Organization', organizationSchema);