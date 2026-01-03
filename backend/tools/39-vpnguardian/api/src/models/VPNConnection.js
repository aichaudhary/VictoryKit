const mongoose = require('mongoose');

const vpnConnectionSchema = new mongoose.Schema({
  connectionId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  vpnProvider: {
    type: String,
    required: true,
    enum: ['openvpn', 'wireguard', 'cisco', 'paloalto', 'fortinet', 'checkpoint', 'juniper', 'microsoft', 'aws', 'azure', 'gcp', 'cloudflare', 'nordvpn', 'expressvpn', 'other']
  },
  connectionType: {
    type: String,
    enum: ['remote-access', 'site-to-site', 'client-to-site'],
    default: 'remote-access'
  },
  status: {
    type: String,
    enum: ['connected', 'disconnected', 'connecting', 'failed', 'suspended'],
    default: 'disconnected'
  },
  ipAddress: { type: String },
  publicIP: { type: String },
  location: {
    country: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  deviceInfo: {
    os: String,
    browser: String,
    deviceType: String
  },
  securityMetrics: {
    encryptionStrength: { type: String, enum: ['weak', 'medium', 'strong', 'excellent'] },
    protocol: { type: String, enum: ['openvpn', 'wireguard', 'ikev2', 'ipsec', 'pptp', 'sstp', 'l2tp'] },
    certificateValid: { type: Boolean, default: true },
    lastHandshake: Date,
    dataTransferred: {
      upload: { type: Number, default: 0 }, // bytes
      download: { type: Number, default: 0 } // bytes
    }
  },
  sessionInfo: {
    connectedAt: Date,
    disconnectedAt: Date,
    duration: Number, // seconds
    bytesTransferred: Number
  },
  threatLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  alerts: [{
    type: { type: String, enum: ['security', 'performance', 'connectivity'] },
    severity: { type: String, enum: ['info', 'warning', 'error'] },
    message: String,
    timestamp: { type: Date, default: Date.now }
  }],
  complianceStatus: {
    gdpr: { type: Boolean, default: true },
    hipaa: { type: Boolean, default: true },
    pci: { type: Boolean, default: true },
    sox: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
vpnConnectionSchema.index({ userId: 1, status: 1 });
vpnConnectionSchema.index({ vpnProvider: 1 });
vpnConnectionSchema.index({ 'location.country': 1 });
vpnConnectionSchema.index({ 'securityMetrics.protocol': 1 });
vpnConnectionSchema.index({ createdAt: -1 });
vpnConnectionSchema.index({ 'threatLevel': 1 });

module.exports = mongoose.model('VPNConnection', vpnConnectionSchema);