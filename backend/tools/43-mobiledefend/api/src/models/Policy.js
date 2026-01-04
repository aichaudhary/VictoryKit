/**
 * Policy Model - Mobile Security Policies
 * Defines and manages enterprise mobile security policies
 */

const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  policyId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Policy Classification
  type: {
    type: String,
    required: true,
    enum: [
      'device_compliance', 'app_management', 'data_protection', 
      'network_security', 'authentication', 'encryption', 
      'jailbreak_detection', 'location', 'threat_response'
    ],
    index: true
  },
  
  category: {
    type: String,
    enum: ['security', 'compliance', 'productivity', 'privacy'],
    default: 'security'
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'archived'],
    default: 'draft',
    index: true
  },
  
  priority: {
    type: Number,
    min: 1,
    max: 100,
    default: 50
  },
  
  // Target Scope
  scope: {
    allDevices: { type: Boolean, default: false },
    platforms: [{
      type: String,
      enum: ['ios', 'android', 'windows_mobile', 'harmony_os']
    }],
    deviceGroups: [String],
    userGroups: [String],
    departments: [String],
    ownershipTypes: [{
      type: String,
      enum: ['corporate', 'byod', 'shared']
    }]
  },
  
  // Device Compliance Rules
  deviceRules: {
    requireEncryption: { type: Boolean, default: true },
    requireScreenLock: { type: Boolean, default: true },
    minPasscodeLength: { type: Number, default: 6 },
    requireAlphanumericPasscode: { type: Boolean, default: false },
    requireBiometric: { type: Boolean, default: false },
    blockJailbroken: { type: Boolean, default: true },
    blockRooted: { type: Boolean, default: true },
    blockDeveloperMode: { type: Boolean, default: false },
    blockUsbDebugging: { type: Boolean, default: true },
    minOsVersion: {
      ios: String,
      android: String
    },
    maxOsVersion: {
      ios: String,
      android: String
    },
    requireMdmEnrollment: { type: Boolean, default: true },
    maxInactivityDays: { type: Number, default: 30 }
  },
  
  // App Management Rules
  appRules: {
    blockSideloading: { type: Boolean, default: true },
    blockUnknownSources: { type: Boolean, default: true },
    requireAppSigning: { type: Boolean, default: true },
    blocklist: [{
      packageName: String,
      name: String,
      reason: String
    }],
    allowlist: [{
      packageName: String,
      name: String,
      required: Boolean
    }],
    blockedCategories: [{
      type: String,
      enum: ['games', 'social', 'entertainment', 'vpn', 'browser']
    }],
    maxAppRiskScore: { type: Number, default: 60 },
    blockMaliciousApps: { type: Boolean, default: true },
    blockSuspiciousApps: { type: Boolean, default: false }
  },
  
  // Data Protection Rules
  dataRules: {
    blockClipboard: { type: Boolean, default: false },
    blockScreenshot: { type: Boolean, default: false },
    blockCopyPaste: { type: Boolean, default: false },
    requireDataEncryption: { type: Boolean, default: true },
    blockCloudBackup: { type: Boolean, default: false },
    blockExternalStorage: { type: Boolean, default: false },
    wipeOnUnenroll: { type: Boolean, default: true },
    wipeOnTheft: { type: Boolean, default: true }
  },
  
  // Network Security Rules
  networkRules: {
    requireVpn: { type: Boolean, default: false },
    vpnProviders: [String],
    blockUnsecuredWifi: { type: Boolean, default: true },
    blockPublicWifi: { type: Boolean, default: false },
    allowedWifiSsids: [String],
    blockedWifiSsids: [String],
    requireSslPinning: { type: Boolean, default: false },
    blockProxyConnections: { type: Boolean, default: false }
  },
  
  // Authentication Rules
  authRules: {
    requireMfa: { type: Boolean, default: true },
    mfaMethods: [{
      type: String,
      enum: ['push', 'totp', 'sms', 'email', 'biometric', 'hardware_key']
    }],
    sessionTimeout: { type: Number, default: 480 }, // minutes
    maxFailedAttempts: { type: Number, default: 5 },
    lockoutDuration: { type: Number, default: 30 }, // minutes
    requireReauthForSensitive: { type: Boolean, default: true }
  },
  
  // Threat Response Actions
  threatResponse: {
    autoQuarantine: { type: Boolean, default: true },
    autoWipe: { type: Boolean, default: false },
    notifyUser: { type: Boolean, default: true },
    notifyAdmin: { type: Boolean, default: true },
    blockCorporateAccess: { type: Boolean, default: true },
    revokeTokens: { type: Boolean, default: true },
    escalationEmail: String,
    escalationWebhook: String
  },
  
  // Enforcement
  enforcement: {
    mode: {
      type: String,
      enum: ['monitor', 'warn', 'enforce', 'block'],
      default: 'monitor'
    },
    gracePeriodHours: { type: Number, default: 24 },
    notifyOnViolation: { type: Boolean, default: true },
    autoRemediate: { type: Boolean, default: false }
  },
  
  // Compliance Stats
  compliance: {
    totalDevices: { type: Number, default: 0 },
    compliantDevices: { type: Number, default: 0 },
    nonCompliantDevices: { type: Number, default: 0 },
    pendingDevices: { type: Number, default: 0 },
    complianceRate: { type: Number, default: 0 },
    lastCalculated: Date
  },
  
  // Audit
  effectiveDate: Date,
  expirationDate: Date,
  version: { type: Number, default: 1 },
  previousVersions: [{
    version: Number,
    modifiedAt: Date,
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changes: String
  }],
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  
  tags: [String],
  notes: String
}, {
  timestamps: true,
  collection: 'mobiledefend_policies'
});

// Indexes
policySchema.index({ type: 1, status: 1 });
policySchema.index({ priority: -1 });
policySchema.index({ 'scope.platforms': 1 });

// Generate policy ID
policySchema.pre('save', function(next) {
  if (!this.policyId) {
    const prefix = 'MDP';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.policyId = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

// Method to calculate compliance rate
policySchema.methods.calculateComplianceRate = function() {
  const total = this.compliance.totalDevices || 0;
  const compliant = this.compliance.compliantDevices || 0;
  
  if (total === 0) {
    this.compliance.complianceRate = 0;
  } else {
    this.compliance.complianceRate = Math.round((compliant / total) * 100);
  }
  
  this.compliance.lastCalculated = new Date();
  return this.compliance.complianceRate;
};

// Method to create new version
policySchema.methods.createVersion = function(modifiedBy, changes) {
  this.previousVersions.push({
    version: this.version,
    modifiedAt: new Date(),
    modifiedBy,
    changes
  });
  this.version += 1;
  return this.save();
};

module.exports = mongoose.model('Policy', policySchema);
