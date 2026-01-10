/**
 * Scan Model - Mobile Security Scans
 * Tracks device and app security scanning operations
 */

const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  scanId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Scan Type
  type: {
    type: String,
    required: true,
    enum: [
      'full_device', 'quick_device', 'app_scan', 'network_scan',
      'compliance_check', 'vulnerability_scan', 'malware_scan',
      'permission_audit', 'policy_check', 'scheduled'
    ],
    index: true
  },
  
  // Target
  target: {
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
    app: { type: mongoose.Schema.Types.ObjectId, ref: 'App' },
    scope: {
      type: String,
      enum: ['single_device', 'device_group', 'all_devices', 'single_app', 'all_apps'],
      default: 'single_device'
    },
    deviceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' }]
  },
  
  // Scan Configuration
  config: {
    deep: { type: Boolean, default: false },
    includeApps: { type: Boolean, default: true },
    includeNetwork: { type: Boolean, default: true },
    includePermissions: { type: Boolean, default: true },
    includeMalware: { type: Boolean, default: true },
    includeCompliance: { type: Boolean, default: true },
    timeout: { type: Number, default: 300 }, // seconds
    priority: { type: String, enum: ['low', 'normal', 'high', 'critical'], default: 'normal' }
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'queued', 'running', 'completed', 'failed', 'cancelled', 'timeout'],
    default: 'pending',
    index: true
  },
  
  progress: {
    percentage: { type: Number, min: 0, max: 100, default: 0 },
    currentStep: String,
    stepsCompleted: { type: Number, default: 0 },
    totalSteps: { type: Number, default: 0 }
  },
  
  // Timing
  scheduledAt: Date,
  startedAt: Date,
  completedAt: Date,
  duration: Number, // milliseconds
  
  // Results Summary
  results: {
    devicesScanned: { type: Number, default: 0 },
    appsScanned: { type: Number, default: 0 },
    
    // Threat Findings
    threatsFound: { type: Number, default: 0 },
    criticalThreats: { type: Number, default: 0 },
    highThreats: { type: Number, default: 0 },
    mediumThreats: { type: Number, default: 0 },
    lowThreats: { type: Number, default: 0 },
    
    // Malware Findings
    malwareFound: { type: Number, default: 0 },
    suspiciousApps: { type: Number, default: 0 },
    
    // Compliance
    policyViolations: { type: Number, default: 0 },
    complianceRate: { type: Number, min: 0, max: 100 },
    
    // Vulnerabilities
    vulnerabilities: { type: Number, default: 0 },
    criticalVulns: { type: Number, default: 0 },
    highVulns: { type: Number, default: 0 },
    
    // Risk Summary
    overallRiskScore: { type: Number, min: 0, max: 100 },
    riskLevel: { type: String, enum: ['critical', 'high', 'medium', 'low', 'none'] }
  },
  
  // Detailed Findings
  findings: [{
    type: { type: String, enum: ['threat', 'malware', 'vulnerability', 'policy_violation', 'warning', 'info'] },
    severity: { type: String, enum: ['critical', 'high', 'medium', 'low', 'info'] },
    title: String,
    description: String,
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
    app: { type: mongoose.Schema.Types.ObjectId, ref: 'App' },
    recommendation: String,
    reference: String
  }],
  
  // Triggered Threats
  triggeredThreats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Threat' }],
  
  // Engine Info
  engine: {
    name: String,
    version: String,
    signatureVersion: String,
    signatureDate: Date
  },
  
  // Error Info
  error: {
    code: String,
    message: String,
    details: String,
    stack: String
  },
  
  // Audit
  triggeredBy: {
    type: { type: String, enum: ['user', 'schedule', 'policy', 'api', 'system'], default: 'user' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    scheduleName: String,
    policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy' }
  },
  
  tags: [String],
  notes: String
}, {
  timestamps: true,
  collection: 'mobileshield_scans'
});

// Indexes
scanSchema.index({ type: 1, status: 1 });
scanSchema.index({ startedAt: -1 });
scanSchema.index({ 'target.device': 1 });
scanSchema.index({ 'triggeredBy.userId': 1 });

// Generate scan ID
scanSchema.pre('save', function(next) {
  if (!this.scanId) {
    const prefix = 'MDS';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.scanId = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

// Method to start scan
scanSchema.methods.start = function() {
  this.status = 'running';
  this.startedAt = new Date();
  this.progress.percentage = 0;
  return this.save();
};

// Method to complete scan
scanSchema.methods.complete = function(results) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.duration = this.completedAt - this.startedAt;
  this.progress.percentage = 100;
  
  if (results) {
    Object.assign(this.results, results);
  }
  
  // Calculate risk level
  const score = this.results.overallRiskScore || 0;
  if (score >= 80) this.results.riskLevel = 'critical';
  else if (score >= 60) this.results.riskLevel = 'high';
  else if (score >= 40) this.results.riskLevel = 'medium';
  else if (score >= 20) this.results.riskLevel = 'low';
  else this.results.riskLevel = 'none';
  
  return this.save();
};

// Method to fail scan
scanSchema.methods.fail = function(errorCode, errorMessage, errorDetails = '') {
  this.status = 'failed';
  this.completedAt = new Date();
  this.duration = this.completedAt - this.startedAt;
  this.error = {
    code: errorCode,
    message: errorMessage,
    details: errorDetails
  };
  return this.save();
};

// Method to update progress
scanSchema.methods.updateProgress = function(percentage, currentStep) {
  this.progress.percentage = percentage;
  this.progress.currentStep = currentStep;
  return this.save();
};

module.exports = mongoose.model('Scan', scanSchema);
