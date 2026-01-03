/**
 * Firmware Model - IoT Device Firmware Management
 * Tracks firmware versions, vulnerabilities, and updates
 */

const mongoose = require('mongoose');

const firmwareSchema = new mongoose.Schema({
  firmwareId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: { type: String, required: true },
  version: { type: String, required: true },
  
  // Device Info
  vendor: { type: String, required: true },
  model: String,
  deviceType: String,
  
  // File Details
  file: {
    filename: String,
    originalName: String,
    size: Number,
    hash: {
      md5: String,
      sha1: String,
      sha256: String
    },
    uploadedAt: Date,
    storagePath: String,
    s3Key: String
  },
  
  // Security Analysis
  analysis: {
    status: {
      type: String,
      enum: ['pending', 'analyzing', 'completed', 'failed'],
      default: 'pending'
    },
    startedAt: Date,
    completedAt: Date,
    
    // VirusTotal Results
    virusTotal: {
      scanned: { type: Boolean, default: false },
      detections: { type: Number, default: 0 },
      totalEngines: { type: Number, default: 0 },
      permalink: String,
      scanDate: Date,
      results: mongoose.Schema.Types.Mixed
    },
    
    // Static Analysis
    staticAnalysis: {
      hasHardcodedCredentials: Boolean,
      hasPrivateKeys: Boolean,
      hasWeakCrypto: Boolean,
      hasDebugSymbols: Boolean,
      hasTelnet: Boolean,
      hasSSH: Boolean,
      suspiciousStrings: [String],
      libraries: [{ name: String, version: String, vulnerable: Boolean }],
      certificates: [{
        issuer: String,
        subject: String,
        validFrom: Date,
        validTo: Date,
        expired: Boolean
      }]
    },
    
    // Vulnerability Findings
    vulnerabilities: [{
      cveId: String,
      severity: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
      title: String,
      component: String,
      version: String,
      fixAvailable: Boolean
    }],
    
    // Risk Assessment
    riskScore: { type: Number, min: 0, max: 100, default: 0 },
    riskLevel: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low', 'none'],
      default: 'none'
    }
  },
  
  // Version Status
  status: {
    current: { type: Boolean, default: true },
    outdated: { type: Boolean, default: false },
    deprecated: { type: Boolean, default: false },
    endOfLife: { type: Boolean, default: false },
    endOfLifeDate: Date
  },
  
  // Updates
  updates: {
    available: { type: Boolean, default: false },
    latestVersion: String,
    releaseDate: Date,
    releaseNotes: String,
    downloadUrl: String,
    critical: { type: Boolean, default: false }
  },
  
  // Deployed Devices
  deployedDevices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' }],
  deployedCount: { type: Number, default: 0 },
  
  // Release Info
  releaseDate: Date,
  changelog: String,
  downloadUrl: String,
  
  // Tags and Notes
  tags: [String],
  notes: String,
  
  // Audit
  uploadedBy: String,
  analyzedBy: String,
  createdBy: String,
  updatedBy: String
}, { timestamps: true });

// Indexes
firmwareSchema.index({ vendor: 1, model: 1, version: 1 });
firmwareSchema.index({ 'analysis.status': 1 });
firmwareSchema.index({ 'analysis.riskLevel': 1 });
firmwareSchema.index({ 'status.outdated': 1 });
firmwareSchema.index({ 'file.hash.sha256': 1 });

// Static methods
firmwareSchema.statics.getStats = async function() {
  const [total, byRisk, byStatus, withUpdates, outdated] = await Promise.all([
    this.countDocuments(),
    this.aggregate([{ $group: { _id: '$analysis.riskLevel', count: { $sum: 1 } } }]),
    this.aggregate([{ $group: { _id: '$analysis.status', count: { $sum: 1 } } }]),
    this.countDocuments({ 'updates.available': true }),
    this.countDocuments({ 'status.outdated': true })
  ]);
  return { 
    total, 
    byRisk: byRisk.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}),
    byStatus: byStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
    withUpdates,
    outdated
  };
};

firmwareSchema.statics.getVulnerable = function() {
  return this.find({ 'analysis.riskLevel': { $in: ['critical', 'high'] } })
    .sort({ 'analysis.riskScore': -1 })
    .populate('deployedDevices', 'name ipAddress type');
};

firmwareSchema.statics.getOutdated = function() {
  return this.find({ 'status.outdated': true })
    .sort({ updatedAt: -1 })
    .populate('deployedDevices', 'name ipAddress type');
};

firmwareSchema.statics.getWithUpdates = function() {
  return this.find({ 'updates.available': true })
    .sort({ 'updates.critical': -1, 'updates.releaseDate': -1 });
};

firmwareSchema.statics.findByHash = function(hash) {
  return this.findOne({
    $or: [
      { 'file.hash.md5': hash },
      { 'file.hash.sha1': hash },
      { 'file.hash.sha256': hash }
    ]
  });
};

firmwareSchema.statics.getPendingAnalysis = function() {
  return this.find({ 'analysis.status': 'pending' }).sort({ createdAt: 1 });
};

// Instance methods
firmwareSchema.methods.startAnalysis = async function() {
  this.analysis.status = 'analyzing';
  this.analysis.startedAt = new Date();
  return this.save();
};

firmwareSchema.methods.completeAnalysis = async function(results) {
  this.analysis.status = 'completed';
  this.analysis.completedAt = new Date();
  
  if (results.virusTotal) this.analysis.virusTotal = results.virusTotal;
  if (results.staticAnalysis) this.analysis.staticAnalysis = results.staticAnalysis;
  if (results.vulnerabilities) this.analysis.vulnerabilities = results.vulnerabilities;
  
  // Calculate risk score
  let score = 0;
  if (results.virusTotal?.detections > 0) score += 40;
  if (results.staticAnalysis?.hasHardcodedCredentials) score += 25;
  if (results.staticAnalysis?.hasPrivateKeys) score += 20;
  if (results.staticAnalysis?.hasWeakCrypto) score += 15;
  score += Math.min(results.vulnerabilities?.length * 5 || 0, 30);
  
  this.analysis.riskScore = Math.min(score, 100);
  this.analysis.riskLevel = this.calculateRiskLevel(this.analysis.riskScore);
  
  return this.save();
};

firmwareSchema.methods.calculateRiskLevel = function(score) {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  if (score >= 20) return 'low';
  return 'none';
};

firmwareSchema.methods.markOutdated = async function(latestVersion, releaseDate, releaseNotes) {
  this.status.outdated = true;
  this.status.current = false;
  this.updates.available = true;
  this.updates.latestVersion = latestVersion;
  this.updates.releaseDate = releaseDate;
  this.updates.releaseNotes = releaseNotes;
  return this.save();
};

module.exports = mongoose.model('Firmware', firmwareSchema);
