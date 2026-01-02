const mongoose = require('mongoose');

const secretSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  vault: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vault',
    required: true
  },
  type: {
    type: String,
    enum: ['password', 'api-key', 'certificate', 'ssh-key', 'database', 'token', 'other'],
    default: 'password'
  },
  category: {
    type: String,
    enum: ['login', 'api', 'database', 'ssl', 'ssh', 'token', 'other'],
    default: 'login'
  },

  // Encrypted data
  encryptedData: {
    type: String,
    required: true
  },
  encryptionKey: {
    type: String,
    required: true
  },
  encryptionAlgorithm: {
    type: String,
    default: 'aes-256-gcm'
  },
  iv: String, // Initialization vector for encryption
  tag: String, // Authentication tag for GCM

  // Metadata (not encrypted)
  url: String,
  username: String, // For login credentials
  email: String,
  notes: String,
  tags: [String],

  // Security settings
  autoRotate: {
    enabled: { type: Boolean, default: false },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'monthly' },
    lastRotated: Date,
    nextRotation: Date
  },

  expiryDate: Date,
  notifyBeforeExpiry: {
    type: Number,
    default: 30 // days
  },

  // Access control
  accessControl: {
    inheritFromVault: { type: Boolean, default: true },
    allowedUsers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      permissions: [String], // ['read', 'write', 'delete']
      grantedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      grantedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },

  // Version control
  versions: [{
    version: { type: Number, default: 1 },
    encryptedData: String,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    modifiedAt: {
      type: Date,
      default: Date.now
    },
    changeReason: String
  }],

  // Audit and compliance
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastAccessed: Date,
  accessCount: {
    type: Number,
    default: 0
  },

  // Compliance
  compliance: {
    gdpr: { type: Boolean, default: false },
    hipaa: { type: Boolean, default: false },
    pci: { type: Boolean, default: false },
    sox: { type: Boolean, default: false },
    custom: [String]
  },

  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isExpired: {
    type: Boolean,
    default: false
  },
  isCompromised: {
    type: Boolean,
    default: false
  },

  // Custom fields
  customFields: [{
    name: String,
    type: {
      type: String,
      enum: ['text', 'password', 'number', 'date', 'boolean', 'url', 'email']
    },
    value: mongoose.Schema.Types.Mixed,
    required: { type: Boolean, default: false },
    encrypted: { type: Boolean, default: true }
  }],

  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes for performance
secretSchema.index({ vault: 1 });
secretSchema.index({ type: 1 });
secretSchema.index({ category: 1 });
secretSchema.index({ tags: 1 });
secretSchema.index({ createdBy: 1 });
secretSchema.index({ expiryDate: 1 });
secretSchema.index({ 'accessControl.allowedUsers.user': 1 });

// Virtual for current version
secretSchema.virtual('currentVersion').get(function() {
  return this.versions.length > 0 ? Math.max(...this.versions.map(v => v.version)) : 1;
});

// Method to check if secret is expired
secretSchema.methods.isExpiredCheck = function() {
  return this.expiryDate && this.expiryDate < new Date();
};

// Method to check if user has access
secretSchema.methods.hasAccess = function(userId, permission = 'read') {
  // Check individual access control first
  if (!this.accessControl.inheritFromVault) {
    const userAccess = this.accessControl.allowedUsers.find(
      access => access.user.toString() === userId.toString()
    );
    if (userAccess) {
      return userAccess.permissions.includes(permission);
    }
    return false;
  }

  // Inherit from vault - this would need vault context
  return true; // Placeholder - actual check would be in service layer
};

// Method to create new version
secretSchema.methods.createVersion = function(newData, modifiedBy, reason = '') {
  const newVersion = {
    version: this.currentVersion + 1,
    encryptedData: newData,
    modifiedBy,
    modifiedAt: new Date(),
    changeReason: reason
  };

  this.versions.push(newVersion);
  this.lastModifiedBy = modifiedBy;
  return this.save();
};

// Method to get version history
secretSchema.methods.getVersionHistory = function() {
  return this.versions.sort((a, b) => b.version - a.version);
};

// Pre-save middleware to update expiry status
secretSchema.pre('save', function(next) {
  this.isExpired = this.isExpiredCheck();
  next();
});

module.exports = mongoose.model('Secret', secretSchema);