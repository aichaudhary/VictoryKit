const mongoose = require('mongoose');

const vpnUserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  fullName: String,
  department: String,
  role: {
    type: String,
    enum: ['admin', 'user', 'auditor', 'readonly'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'active'
  },
  authentication: {
    method: {
      type: String,
      enum: ['local', 'ldap', 'saml', 'oauth', 'certificate'],
      default: 'local'
    },
    passwordHash: String,
    certificate: {
      serialNumber: String,
      issuer: String,
      validFrom: Date,
      validTo: Date,
      fingerprint: String
    },
    mfaEnabled: { type: Boolean, default: false },
    mfaMethod: {
      type: String,
      enum: ['totp', 'sms', 'email', 'hardware-token']
    },
    lastLogin: Date,
    failedLoginAttempts: { type: Number, default: 0 },
    accountLocked: { type: Boolean, default: false },
    lockoutUntil: Date
  },
  vpnAccess: {
    allowedProviders: [{
      type: String,
      enum: ['openvpn', 'wireguard', 'cisco', 'paloalto', 'fortinet', 'checkpoint', 'juniper', 'microsoft', 'aws', 'azure', 'gcp', 'cloudflare', 'nordvpn', 'expressvpn', 'other']
    }],
    allowedLocations: [{
      country: String,
      city: String
    }],
    timeRestrictions: {
      allowedHours: {
        start: String, // HH:MM
        end: String
      },
      allowedDays: [Number], // 0-6, Sunday = 0
      timezone: String
    },
    deviceRestrictions: {
      maxDevices: { type: Number, default: 1 },
      allowedDeviceTypes: [String],
      requireDeviceRegistration: { type: Boolean, default: false }
    },
    bandwidthLimits: {
      dailyLimit: Number, // GB
      monthlyLimit: Number, // GB
      throttlingEnabled: { type: Boolean, default: false }
    }
  },
  securityProfile: {
    riskScore: { type: Number, min: 0, max: 100, default: 0 },
    trustLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'excellent'],
      default: 'medium'
    },
    securityIncidents: { type: Number, default: 0 },
    lastSecurityReview: Date,
    complianceStatus: {
      gdpr: { type: Boolean, default: true },
      hipaa: { type: Boolean, default: true },
      pci: { type: Boolean, default: true },
      sox: { type: Boolean, default: true }
    }
  },
  activityLog: [{
    action: {
      type: String,
      enum: ['login', 'logout', 'connection-established', 'connection-terminated', 'policy-applied', 'alert-triggered']
    },
    timestamp: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String,
    location: {
      country: String,
      city: String
    },
    details: mongoose.Schema.Types.Mixed
  }],
  groups: [{
    groupId: String,
    groupName: String,
    role: String
  }],
  preferences: {
    notifications: {
      emailAlerts: { type: Boolean, default: true },
      securityAlerts: { type: Boolean, default: true },
      connectionAlerts: { type: Boolean, default: false },
      weeklyReports: { type: Boolean, default: true }
    },
    ui: {
      theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
      language: { type: String, default: 'en' },
      timezone: String
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastActive: Date
});

// Indexes
vpnUserSchema.index({ username: 1 });
vpnUserSchema.index({ email: 1 });
vpnUserSchema.index({ status: 1 });
vpnUserSchema.index({ 'authentication.lastLogin': -1 });
vpnUserSchema.index({ 'securityProfile.riskScore': -1 });
vpnUserSchema.index({ createdAt: -1 });

module.exports = mongoose.model('VPNUser', vpnUserSchema);