const mongoose = require('mongoose');

const firmwareSchema = new mongoose.Schema({
  // Firmware Identification
  firmwareId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Basic Info
  name: {
    type: String,
    required: true,
    maxlength: 200
  },
  version: {
    type: String,
    required: true,
    index: true
  },
  
  // Device Association
  deviceType: {
    type: String,
    enum: [
      'camera', 'router', 'switch', 'access_point', 'sensor', 'thermostat',
      'smart_lock', 'lighting', 'hvac', 'plc', 'scada', 'gateway',
      'medical_device', 'industrial_controller', 'smart_meter', 'other'
    ],
    index: true
  },
  manufacturer: String,
  model: String,
  
  // Device References
  installedOn: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device'
  }],
  
  // File Information
  file: {
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimeType: String,
    uploadedAt: Date,
    uploadedBy: String
  },
  
  // Hashes
  hashes: {
    md5: String,
    sha1: String,
    sha256: {
      type: String,
      index: true
    },
    sha512: String,
    ssdeep: String  // Fuzzy hash for similarity
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending_analysis', 'analyzing', 'analyzed', 'approved', 'rejected', 'deprecated'],
    default: 'pending_analysis',
    index: true
  },
  
  // Source
  source: {
    type: String,
    enum: ['manufacturer', 'third_party', 'extracted', 'user_upload', 'auto_discovered'],
    default: 'user_upload'
  },
  sourceUrl: String,
  
  // Version Info
  releaseDate: Date,
  endOfLife: Date,
  isLatest: { type: Boolean, default: false },
  previousVersion: String,
  changelog: String,
  
  // Security Analysis
  analysis: {
    startedAt: Date,
    completedAt: Date,
    duration: Number,
    analyzedBy: {
      type: String,
      enum: ['manual', 'automated', 'virustotal', 'binwalk', 'firmwalker', 'ai']
    },
    
    // Structure Analysis
    structure: {
      fileSystem: String,
      compression: String,
      encryption: Boolean,
      signature: {
        present: Boolean,
        valid: Boolean,
        signer: String
      },
      bootloader: String,
      kernel: {
        version: String,
        customized: Boolean
      }
    },
    
    // Component Detection
    components: [{
      name: String,
      version: String,
      type: { type: String, enum: ['library', 'binary', 'script', 'config', 'other'] },
      path: String,
      license: String
    }],
    
    // Binary Analysis
    binaries: [{
      name: String,
      path: String,
      arch: String,
      stripped: Boolean,
      staticLinked: Boolean,
      securityFeatures: {
        pie: Boolean,
        nx: Boolean,
        canary: Boolean,
        relro: String,
        aslr: Boolean
      }
    }],
    
    // Credential Findings
    credentials: [{
      type: { type: String, enum: ['hardcoded_password', 'api_key', 'private_key', 'certificate', 'token'] },
      location: String,
      value: String, // Should be encrypted/masked
      severity: String,
      context: String
    }],
    
    // Sensitive Data
    sensitiveData: [{
      type: { type: String, enum: ['email', 'ip_address', 'url', 'domain', 'phone', 'other'] },
      value: String,
      location: String,
      context: String
    }],
    
    // Network Services
    services: [{
      name: String,
      port: Number,
      protocol: String,
      configPath: String,
      defaultEnabled: Boolean
    }],
    
    // Crypto Analysis
    crypto: {
      algorithms: [String],
      weakCrypto: [{
        algorithm: String,
        location: String,
        recommendation: String
      }],
      certificates: [{
        subject: String,
        issuer: String,
        validFrom: Date,
        validTo: Date,
        selfSigned: Boolean
      }]
    }
  },
  
  // Vulnerabilities
  vulnerabilities: [{
    cveId: String,
    severity: String,
    cvssScore: Number,
    component: String,
    componentVersion: String,
    description: String,
    patchAvailable: Boolean,
    vulnerabilityRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vulnerability'
    }
  }],
  
  // Risk Assessment
  risk: {
    score: { type: Number, min: 0, max: 100 },
    level: { type: String, enum: ['critical', 'high', 'medium', 'low', 'minimal'] },
    factors: [{
      name: String,
      score: Number,
      weight: Number,
      details: String
    }],
    recommendation: {
      type: String,
      enum: ['do_not_install', 'install_with_caution', 'safe_to_install', 'update_immediately']
    }
  },
  
  // VirusTotal Results
  virusTotal: {
    scanned: Boolean,
    scanDate: Date,
    permalink: String,
    positives: Number,
    total: Number,
    scanResults: [{
      engine: String,
      result: String,
      detected: Boolean
    }]
  },
  
  // Compliance
  compliance: {
    checks: [{
      standard: String,
      requirement: String,
      status: { type: String, enum: ['pass', 'fail', 'warning', 'not_applicable'] },
      details: String
    }],
    overallStatus: { type: String, enum: ['compliant', 'non_compliant', 'partial'] }
  },
  
  // Approval Workflow
  approval: {
    required: { type: Boolean, default: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'] },
    approvedBy: String,
    approvedAt: Date,
    rejectionReason: String,
    comments: [{
      userId: String,
      userName: String,
      comment: String,
      timestamp: Date
    }]
  },
  
  // Update Tracking
  deployments: [{
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device'
    },
    deviceName: String,
    status: { type: String, enum: ['pending', 'in_progress', 'completed', 'failed', 'rolled_back'] },
    scheduledAt: Date,
    startedAt: Date,
    completedAt: Date,
    previousVersion: String,
    error: String
  }],
  
  // Tags & Categories
  tags: [String],
  category: String,
  
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Tenant
  tenantId: {
    type: String,
    index: true
  }
}, {
  timestamps: true
});

// Indexes
firmwareSchema.index({ manufacturer: 1, model: 1, version: 1 });
firmwareSchema.index({ deviceType: 1, status: 1 });
firmwareSchema.index({ 'risk.level': 1 });
firmwareSchema.index({ 'vulnerabilities.cveId': 1 });

// Pre-save to generate firmwareId
firmwareSchema.pre('save', function(next) {
  if (!this.firmwareId) {
    this.firmwareId = `fw_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }
  next();
});

// Virtual for age
firmwareSchema.virtual('age').get(function() {
  if (!this.releaseDate) return null;
  return Date.now() - this.releaseDate;
});

// Virtual for days until EOL
firmwareSchema.virtual('daysUntilEol').get(function() {
  if (!this.endOfLife) return null;
  return Math.ceil((this.endOfLife - Date.now()) / (1000 * 60 * 60 * 24));
});

// Virtual for installed device count
firmwareSchema.virtual('installedCount').get(function() {
  return this.installedOn ? this.installedOn.length : 0;
});

// Static method to find vulnerable firmware
firmwareSchema.statics.findVulnerable = function(minSeverity = 'high') {
  const severityOrder = ['low', 'medium', 'high', 'critical'];
  const minIndex = severityOrder.indexOf(minSeverity);
  const severities = severityOrder.slice(minIndex);
  
  return this.find({
    'vulnerabilities.severity': { $in: severities },
    status: { $ne: 'deprecated' }
  }).sort({ 'risk.score': -1 });
};

// Static method to find outdated
firmwareSchema.statics.findOutdated = function() {
  return this.find({
    isLatest: false,
    status: 'approved',
    installedOn: { $exists: true, $ne: [] }
  });
};

// Static method to find by hash
firmwareSchema.statics.findByHash = function(hash) {
  return this.findOne({
    $or: [
      { 'hashes.md5': hash },
      { 'hashes.sha1': hash },
      { 'hashes.sha256': hash }
    ]
  });
};

// Static method to get stats
firmwareSchema.statics.getStats = async function(tenantId) {
  const match = tenantId ? { tenantId } : {};
  
  const [total, byStatus, byRisk, vulnerable] = await Promise.all([
    this.countDocuments(match),
    this.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    this.aggregate([
      { $match: match },
      { $group: { _id: '$risk.level', count: { $sum: 1 } } }
    ]),
    this.countDocuments({
      ...match,
      'vulnerabilities.0': { $exists: true }
    })
  ]);
  
  return {
    total,
    byStatus: byStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
    byRisk: byRisk.reduce((acc, r) => ({ ...acc, [r._id || 'unknown']: r.count }), {}),
    vulnerable
  };
};

// Instance method to approve
firmwareSchema.methods.approve = async function(userId, comments) {
  this.status = 'approved';
  this.approval.status = 'approved';
  this.approval.approvedBy = userId;
  this.approval.approvedAt = new Date();
  if (comments) {
    this.approval.comments.push({
      userId,
      comment: comments,
      timestamp: new Date()
    });
  }
  return this.save();
};

// Instance method to reject
firmwareSchema.methods.reject = async function(userId, reason) {
  this.status = 'rejected';
  this.approval.status = 'rejected';
  this.approval.rejectionReason = reason;
  this.approval.comments.push({
    userId,
    comment: `Rejected: ${reason}`,
    timestamp: new Date()
  });
  return this.save();
};

// Instance method to mark as analyzed
firmwareSchema.methods.markAnalyzed = async function(analysisResults, riskAssessment) {
  this.status = 'analyzed';
  this.analysis = {
    ...this.analysis,
    ...analysisResults,
    completedAt: new Date()
  };
  if (riskAssessment) {
    this.risk = riskAssessment;
  }
  return this.save();
};

// Instance method to add vulnerability
firmwareSchema.methods.addVulnerability = async function(vulnerability) {
  this.vulnerabilities.push(vulnerability);
  // Recalculate risk score
  this.risk.score = this.calculateRiskScore();
  return this.save();
};

// Instance method to calculate risk score
firmwareSchema.methods.calculateRiskScore = function() {
  let score = 0;
  
  // Base score from vulnerabilities
  this.vulnerabilities.forEach(vuln => {
    switch (vuln.severity) {
      case 'critical': score += 25; break;
      case 'high': score += 15; break;
      case 'medium': score += 8; break;
      case 'low': score += 3; break;
    }
  });
  
  // Add points for hardcoded credentials
  if (this.analysis?.credentials?.length > 0) {
    score += this.analysis.credentials.length * 10;
  }
  
  // Add points for weak crypto
  if (this.analysis?.crypto?.weakCrypto?.length > 0) {
    score += this.analysis.crypto.weakCrypto.length * 5;
  }
  
  // Add points for binary security issues
  this.analysis?.binaries?.forEach(bin => {
    if (!bin.securityFeatures?.pie) score += 2;
    if (!bin.securityFeatures?.nx) score += 3;
    if (!bin.securityFeatures?.canary) score += 2;
  });
  
  return Math.min(100, score);
};

module.exports = mongoose.model('Firmware', firmwareSchema);
