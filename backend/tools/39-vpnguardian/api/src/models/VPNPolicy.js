const mongoose = require('mongoose');

const vpnPolicySchema = new mongoose.Schema({
  policyId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  vpnProvider: {
    type: String,
    required: true,
    enum: ['openvpn', 'wireguard', 'cisco', 'paloalto', 'fortinet', 'checkpoint', 'juniper', 'microsoft', 'aws', 'azure', 'gcp', 'cloudflare', 'nordvpn', 'expressvpn', 'other']
  },
  policyType: {
    type: String,
    enum: ['access-control', 'security', 'routing', 'bandwidth', 'time-based', 'location-based'],
    required: true
  },
  rules: [{
    ruleId: { type: String, required: true },
    name: String,
    action: {
      type: String,
      enum: ['allow', 'deny', 'limit', 'monitor'],
      required: true
    },
    conditions: {
      sourceIP: [String],
      destinationIP: [String],
      ports: [Number],
      protocols: [String],
      users: [String],
      groups: [String],
      timeRange: {
        start: String, // HH:MM format
        end: String,
        daysOfWeek: [Number] // 0-6, Sunday = 0
      },
      locations: [{
        country: String,
        city: String
      }],
      deviceTypes: [String],
      applications: [String]
    },
    priority: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true }
  }],
  securitySettings: {
    encryption: {
      algorithm: { type: String, enum: ['AES-128', 'AES-256', 'ChaCha20', 'Blowfish'] },
      keySize: Number
    },
    authentication: {
      method: { type: String, enum: ['certificate', 'username-password', 'two-factor', 'biometric'] },
      mfaRequired: { type: Boolean, default: false }
    },
    protocols: [{
      type: String,
      enum: ['openvpn', 'wireguard', 'ikev2', 'ipsec', 'pptp', 'sstp', 'l2tp']
    }],
    certificateValidation: {
      required: { type: Boolean, default: true },
      crlCheck: { type: Boolean, default: true },
      ocspCheck: { type: Boolean, default: false }
    }
  },
  bandwidthLimits: {
    uploadLimit: Number, // Mbps
    downloadLimit: Number, // Mbps
    burstLimit: Number, // Mbps
    throttlingEnabled: { type: Boolean, default: false }
  },
  monitoring: {
    loggingEnabled: { type: Boolean, default: true },
    alertOnViolation: { type: Boolean, default: true },
    sessionTimeout: Number, // minutes
    idleTimeout: Number // minutes
  },
  compliance: {
    gdpr: { type: Boolean, default: true },
    hipaa: { type: Boolean, default: true },
    pci: { type: Boolean, default: true },
    sox: { type: Boolean, default: true },
    customFrameworks: [String]
  },
  appliedTo: [{
    type: { type: String, enum: ['user', 'group', 'device', 'location'] },
    id: String,
    name: String
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft', 'archived'],
    default: 'active'
  },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastApplied: Date
});

// Indexes
vpnPolicySchema.index({ vpnProvider: 1 });
vpnPolicySchema.index({ policyType: 1 });
vpnPolicySchema.index({ status: 1 });
vpnPolicySchema.index({ 'appliedTo.id': 1 });
vpnPolicySchema.index({ createdAt: -1 });

module.exports = mongoose.model('VPNPolicy', vpnPolicySchema);