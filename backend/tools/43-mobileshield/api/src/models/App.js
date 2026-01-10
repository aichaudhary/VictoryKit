/**
 * App Model - Mobile Application Inventory & Security
 * Tracks installed apps, permissions, and malware detection
 */

const mongoose = require('mongoose');

const appSchema = new mongoose.Schema({
  appId: {
    type: String,
    required: true,
    index: true
  },
  packageName: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  version: {
    type: String,
    trim: true
  },
  versionCode: Number,
  
  // Platform
  platform: {
    type: String,
    required: true,
    enum: ['ios', 'android', 'windows_mobile', 'harmony_os', 'cross_platform'],
    index: true
  },
  
  // Source
  source: {
    type: String,
    enum: ['app_store', 'play_store', 'enterprise', 'sideloaded', 'unknown'],
    default: 'unknown'
  },
  developer: { type: String, trim: true },
  developerEmail: { type: String, trim: true },
  
  // App Category
  category: {
    type: String,
    enum: [
      'business', 'productivity', 'communication', 'social', 'entertainment',
      'games', 'utilities', 'finance', 'health', 'education', 'travel',
      'shopping', 'news', 'music', 'photo_video', 'developer_tools',
      'security', 'vpn', 'browser', 'email', 'other'
    ],
    default: 'other'
  },
  
  // Security Classification
  classification: {
    type: String,
    enum: ['safe', 'suspicious', 'malicious', 'pup', 'adware', 'spyware', 'unknown'],
    default: 'unknown',
    index: true
  },
  riskScore: { type: Number, min: 0, max: 100, default: 0, index: true },
  riskLevel: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'none'],
    default: 'none'
  },
  
  // Permissions
  permissions: [{
    name: String,
    description: String,
    dangerous: { type: Boolean, default: false },
    granted: { type: Boolean, default: true }
  }],
  dangerousPermissionCount: { type: Number, default: 0 },
  
  // Suspicious Permissions
  suspiciousPermissions: [{
    permission: String,
    reason: String,
    severity: { type: String, enum: ['critical', 'high', 'medium', 'low'] }
  }],
  
  // Malware Analysis
  malwareAnalysis: {
    scanned: { type: Boolean, default: false },
    scanDate: Date,
    scanEngine: String,
    detectionName: String,
    malwareFamily: String,
    malwareType: { 
      type: String, 
      enum: ['trojan', 'ransomware', 'spyware', 'adware', 'banker', 'rootkit', 'worm', 'pup', 'none'],
      default: 'none'
    },
    confidence: { type: Number, min: 0, max: 100 },
    signatures: [String],
    hashMd5: String,
    hashSha1: String,
    hashSha256: String
  },
  
  // Behavior Analysis
  behavior: {
    networkActivity: {
      sendsData: Boolean,
      externalDomains: [String],
      suspiciousConnections: [String],
      dataExfiltration: Boolean
    },
    systemAccess: {
      accessesContacts: Boolean,
      accessesSms: Boolean,
      accessesCallLog: Boolean,
      accessesCamera: Boolean,
      accessesMicrophone: Boolean,
      accessesLocation: Boolean,
      accessesStorage: Boolean,
      rootAccess: Boolean
    },
    backgroundActivity: {
      runsInBackground: Boolean,
      batteryDrain: Boolean,
      suspiciousServices: [String]
    }
  },
  
  // Policy Compliance
  policyCompliance: {
    allowed: { type: Boolean, default: true },
    blocklisted: { type: Boolean, default: false },
    whitelisted: { type: Boolean, default: false },
    enterpriseApproved: { type: Boolean, default: false },
    violatedPolicies: [String]
  },
  
  // Installation Stats
  installationStats: {
    totalInstalls: { type: Number, default: 0 },
    activeInstalls: { type: Number, default: 0 },
    deviceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' }]
  },
  
  // Metadata
  size: Number, // bytes
  minOsVersion: String,
  targetOsVersion: String,
  releaseDate: Date,
  lastUpdateDate: Date,
  
  // Audit
  firstSeen: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
  
  tags: [String],
  notes: String
}, {
  timestamps: true,
  collection: 'mobileshield_apps'
});

// Compound indexes
appSchema.index({ packageName: 1, platform: 1 });
appSchema.index({ classification: 1, riskScore: -1 });
appSchema.index({ 'policyCompliance.blocklisted': 1 });
appSchema.index({ 'malwareAnalysis.malwareType': 1 });

// Calculate risk based on permissions and behavior
appSchema.methods.calculateRiskScore = function() {
  let score = 0;
  
  // Dangerous permissions
  score += this.dangerousPermissionCount * 5;
  score += (this.suspiciousPermissions?.length || 0) * 10;
  
  // Malware detection
  if (this.malwareAnalysis.malwareType !== 'none') {
    score += 50;
  }
  
  // Behavior flags
  if (this.behavior.networkActivity?.dataExfiltration) score += 30;
  if (this.behavior.systemAccess?.rootAccess) score += 25;
  if (this.behavior.backgroundActivity?.suspiciousServices?.length) score += 15;
  
  // Source
  if (this.source === 'sideloaded') score += 20;
  if (this.source === 'unknown') score += 10;
  
  // Policy
  if (this.policyCompliance.blocklisted) score += 40;
  
  this.riskScore = Math.min(score, 100);
  
  if (this.riskScore >= 80) this.riskLevel = 'critical';
  else if (this.riskScore >= 60) this.riskLevel = 'high';
  else if (this.riskScore >= 40) this.riskLevel = 'medium';
  else if (this.riskScore >= 20) this.riskLevel = 'low';
  else this.riskLevel = 'none';
  
  return this.riskScore;
};

// Pre-save hook
appSchema.pre('save', function(next) {
  // Count dangerous permissions
  this.dangerousPermissionCount = this.permissions?.filter(p => p.dangerous).length || 0;
  
  // Calculate risk score
  this.calculateRiskScore();
  
  // Set classification based on malware analysis
  if (this.malwareAnalysis.malwareType !== 'none') {
    this.classification = 'malicious';
  } else if (this.riskScore >= 60) {
    this.classification = 'suspicious';
  } else if (this.riskScore < 20 && this.malwareAnalysis.scanned) {
    this.classification = 'safe';
  }
  
  next();
});

module.exports = mongoose.model('App', appSchema);
