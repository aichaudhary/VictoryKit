/**
 * Device Model - Mobile Device Inventory
 * Manages mobile device discovery, status, and security metadata
 */

const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: {
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
  platform: {
    type: String,
    required: true,
    enum: ['ios', 'android', 'windows_mobile', 'harmony_os', 'unknown'],
    default: 'unknown',
    index: true
  },
  osVersion: {
    type: String,
    trim: true
  },
  manufacturer: { type: String, trim: true },
  model: { type: String, trim: true },
  
  // Device Identifiers
  imei: { type: String, trim: true },
  serialNumber: { type: String, trim: true },
  udid: { type: String, trim: true },
  
  // Ownership
  ownership: {
    type: String,
    enum: ['corporate', 'byod', 'shared', 'unknown'],
    default: 'unknown'
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: { type: String, trim: true, lowercase: true },
  department: { type: String, trim: true },
  
  // Status & Risk
  status: {
    type: String,
    enum: ['active', 'inactive', 'compromised', 'lost', 'stolen', 'wiped', 'quarantined'],
    default: 'active',
    index: true
  },
  riskScore: { type: Number, min: 0, max: 100, default: 0, index: true },
  riskLevel: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'none'],
    default: 'none'
  },
  
  // Security Status
  securityStatus: {
    jailbroken: { type: Boolean, default: false },
    rooted: { type: Boolean, default: false },
    encryptionEnabled: { type: Boolean, default: true },
    screenLockEnabled: { type: Boolean, default: true },
    biometricEnabled: { type: Boolean, default: false },
    passcodeCompliant: { type: Boolean, default: true },
    developerModeEnabled: { type: Boolean, default: false },
    usbDebuggingEnabled: { type: Boolean, default: false },
    unknownSourcesEnabled: { type: Boolean, default: false }
  },
  
  // MDM Integration
  mdm: {
    enrolled: { type: Boolean, default: false },
    provider: { type: String, enum: ['intune', 'jamf', 'workspace_one', 'mobileiron', 'other', 'none'], default: 'none' },
    lastCheckIn: Date,
    complianceStatus: { type: String, enum: ['compliant', 'non_compliant', 'pending', 'unknown'], default: 'unknown' }
  },
  
  // Installed Apps
  installedApps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'App' }],
  appCount: { type: Number, default: 0 },
  maliciousAppCount: { type: Number, default: 0 },
  
  // Network
  network: {
    lastKnownIp: String,
    macAddress: String,
    vpnEnabled: Boolean,
    lastVpnConnection: Date,
    wifiSsid: String,
    cellularCarrier: String
  },
  
  // Location (if enabled)
  location: {
    enabled: { type: Boolean, default: false },
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    lastUpdated: Date,
    country: String,
    city: String
  },
  
  // Timing
  enrolledAt: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now, index: true },
  lastScanned: Date,
  
  // Threats detected
  threats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Threat' }],
  threatCount: { type: Number, default: 0 },
  
  // Tags & Notes
  tags: [String],
  notes: String,
  
  // Audit
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true,
  collection: 'mobileshield_devices'
});

// Indexes
deviceSchema.index({ platform: 1, status: 1 });
deviceSchema.index({ riskScore: -1 });
deviceSchema.index({ 'securityStatus.jailbroken': 1 });
deviceSchema.index({ 'securityStatus.rooted': 1 });
deviceSchema.index({ 'mdm.enrolled': 1, 'mdm.complianceStatus': 1 });
deviceSchema.index({ userEmail: 1 });
deviceSchema.index({ createdAt: -1 });

// Calculate risk score
deviceSchema.methods.calculateRiskScore = function() {
  let score = 0;
  
  if (this.securityStatus.jailbroken || this.securityStatus.rooted) score += 40;
  if (!this.securityStatus.encryptionEnabled) score += 20;
  if (!this.securityStatus.screenLockEnabled) score += 15;
  if (this.securityStatus.developerModeEnabled) score += 10;
  if (this.securityStatus.usbDebuggingEnabled) score += 10;
  if (this.securityStatus.unknownSourcesEnabled) score += 15;
  if (!this.mdm.enrolled) score += 10;
  if (this.maliciousAppCount > 0) score += Math.min(this.maliciousAppCount * 10, 30);
  
  this.riskScore = Math.min(score, 100);
  
  if (this.riskScore >= 80) this.riskLevel = 'critical';
  else if (this.riskScore >= 60) this.riskLevel = 'high';
  else if (this.riskScore >= 40) this.riskLevel = 'medium';
  else if (this.riskScore >= 20) this.riskLevel = 'low';
  else this.riskLevel = 'none';
  
  return this.riskScore;
};

// Virtual for display name
deviceSchema.virtual('displayName').get(function() {
  return this.name || `${this.manufacturer} ${this.model}` || this.deviceId;
});

// Pre-save hook
deviceSchema.pre('save', function(next) {
  if (this.isModified('securityStatus') || this.isModified('maliciousAppCount')) {
    this.calculateRiskScore();
  }
  next();
});

module.exports = mongoose.model('Device', deviceSchema);
