/**
 * Threat Model - Mobile Security Threats
 * Tracks detected threats, incidents, and security events
 */

const mongoose = require('mongoose');

const threatSchema = new mongoose.Schema({
  threatId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Threat Classification
  type: {
    type: String,
    required: true,
    enum: [
      'malware', 'phishing', 'network_attack', 'data_leak', 'jailbreak',
      'root_detection', 'ssl_pinning_bypass', 'man_in_the_middle', 
      'rogue_wifi', 'device_tampering', 'suspicious_app', 'policy_violation',
      'unauthorized_access', 'credential_theft', 'ransomware', 'spyware',
      'sms_fraud', 'call_fraud', 'sim_swap', 'other'
    ],
    index: true
  },
  
  category: {
    type: String,
    enum: ['app_threat', 'network_threat', 'device_threat', 'data_threat', 'identity_threat'],
    required: true,
    index: true
  },
  
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'info'],
    required: true,
    index: true
  },
  
  // Affected Resources
  device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', index: true },
  app: { type: mongoose.Schema.Types.ObjectId, ref: 'App' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: String,
  
  // Threat Details
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Detection Info
  detection: {
    method: {
      type: String,
      enum: ['signature', 'behavioral', 'heuristic', 'ml_model', 'policy_engine', 'manual', 'external_feed'],
      required: true
    },
    engine: String,
    confidence: { type: Number, min: 0, max: 100 },
    detectedAt: { type: Date, default: Date.now, index: true },
    source: String
  },
  
  // Indicators of Compromise
  iocs: [{
    type: { type: String, enum: ['hash', 'domain', 'ip', 'url', 'email', 'file_path', 'package_name', 'certificate'] },
    value: String,
    description: String
  }],
  
  // Network Attack Details
  networkDetails: {
    sourceIp: String,
    destinationIp: String,
    domain: String,
    port: Number,
    protocol: String,
    sslCertificate: {
      issuer: String,
      subject: String,
      validFrom: Date,
      validTo: Date,
      selfSigned: Boolean
    }
  },
  
  // Malware Details
  malwareDetails: {
    family: String,
    variant: String,
    campaign: String,
    hashMd5: String,
    hashSha256: String,
    c2Servers: [String],
    capabilities: [String]
  },
  
  // Status & Resolution
  status: {
    type: String,
    enum: ['detected', 'analyzing', 'confirmed', 'mitigated', 'resolved', 'false_positive', 'ignored'],
    default: 'detected',
    index: true
  },
  
  resolution: {
    action: {
      type: String,
      enum: ['none', 'app_removed', 'device_wiped', 'quarantined', 'blocked', 'user_notified', 'auto_remediated']
    },
    resolvedAt: Date,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: String
  },
  
  // Impact Assessment
  impact: {
    dataAtRisk: [String],
    estimatedRisk: { type: String, enum: ['critical', 'high', 'medium', 'low', 'unknown'] },
    affectedUsers: Number,
    affectedDevices: Number,
    businessImpact: String
  },
  
  // Response Actions
  responseActions: [{
    action: String,
    timestamp: Date,
    performedBy: String,
    automated: { type: Boolean, default: false },
    result: String
  }],
  
  // Integration References
  externalReferences: [{
    source: { type: String, enum: ['sentinel', 'xsoar', 'crowdstrike', 'virustotal', 'mitre', 'nvd', 'other'] },
    referenceId: String,
    url: String
  }],
  
  // MITRE ATT&CK Mapping
  mitre: {
    tactics: [String],
    techniques: [{
      id: String,
      name: String
    }]
  },
  
  // Metadata
  tags: [String],
  notes: String,
  
  // Audit
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true,
  collection: 'mobiledefend_threats'
});

// Indexes
threatSchema.index({ type: 1, severity: 1, status: 1 });
threatSchema.index({ 'detection.detectedAt': -1 });
threatSchema.index({ device: 1, status: 1 });
threatSchema.index({ createdAt: -1 });

// Generate threat ID
threatSchema.pre('save', function(next) {
  if (!this.threatId) {
    const prefix = 'MDT';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.threatId = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

// Virtual for age
threatSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.detection.detectedAt) / (1000 * 60 * 60)); // hours
});

// Method to add response action
threatSchema.methods.addResponseAction = function(action, performedBy, automated = false, result = '') {
  this.responseActions.push({
    action,
    timestamp: new Date(),
    performedBy,
    automated,
    result
  });
  return this.save();
};

// Method to resolve threat
threatSchema.methods.resolve = function(action, resolvedBy, notes = '') {
  this.status = 'resolved';
  this.resolution = {
    action,
    resolvedAt: new Date(),
    resolvedBy,
    notes
  };
  return this.save();
};

module.exports = mongoose.model('Threat', threatSchema);
