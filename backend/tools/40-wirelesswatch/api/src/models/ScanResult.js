const mongoose = require('mongoose');

const scanResultSchema = new mongoose.Schema({
  // Scan Identification
  scanId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Scan Configuration
  scanType: {
    type: String,
    required: true,
    enum: ['quick', 'full', 'deep', 'targeted', 'scheduled', 'continuous'],
    index: true
  },
  scanMode: {
    type: String,
    enum: ['passive', 'active', 'hybrid']
  },
  
  // Target Information
  target: {
    scope: {
      type: String,
      enum: ['all', 'building', 'floor', 'area', 'specific_ap', 'frequency_band']
    },
    location: String,
    frequencyBands: [String],
    channels: [Number],
    specificTargets: [String]
  },
  
  // Timing
  startTime: {
    type: Date,
    required: true,
    index: true
  },
  endTime: Date,
  duration: Number, // in seconds
  
  // Scan Status
  status: {
    type: String,
    required: true,
    enum: ['running', 'completed', 'failed', 'cancelled', 'paused'],
    default: 'running',
    index: true
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Results Summary
  summary: {
    accessPointsFound: {
      type: Number,
      default: 0
    },
    authorizedAps: {
      type: Number,
      default: 0
    },
    rogueAps: {
      type: Number,
      default: 0
    },
    suspiciousAps: {
      type: Number,
      default: 0
    },
    devicesFound: {
      type: Number,
      default: 0
    },
    vulnerabilitiesFound: {
      type: Number,
      default: 0
    },
    threatsDetected: {
      type: Number,
      default: 0
    },
    channelUtilization: mongoose.Schema.Types.Mixed,
    averageSignalStrength: Number
  },
  
  // Discovered Access Points
  accessPoints: [{
    bssid: String,
    ssid: String,
    channel: Number,
    frequency: String,
    signalStrength: Number,
    encryption: String,
    vendor: String,
    firstSeen: Date,
    lastSeen: Date,
    classification: {
      type: String,
      enum: ['authorized', 'rogue', 'suspicious', 'neighbor', 'unknown']
    },
    confidence: Number
  }],
  
  // Discovered Devices
  devices: [{
    macAddress: String,
    ipAddress: String,
    hostname: String,
    connectedTo: String,
    deviceType: String,
    vendor: String,
    firstSeen: Date,
    lastSeen: Date,
    trafficObserved: Boolean
  }],
  
  // Vulnerabilities Found
  vulnerabilities: [{
    type: String,
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low', 'info']
    },
    target: String,
    description: String,
    cvss: Number,
    cve: String,
    remediation: String
  }],
  
  // Threats Detected
  threats: [{
    threatType: String,
    severity: String,
    source: String,
    target: String,
    description: String,
    detectedAt: Date
  }],
  
  // RF Analysis
  rfAnalysis: {
    channelUsage: mongoose.Schema.Types.Mixed,
    interference: [{
      channel: Number,
      type: String,
      severity: String,
      source: String
    }],
    noiseFloor: mongoose.Schema.Types.Mixed,
    coverage: {
      strongSignal: Number,
      adequateSignal: Number,
      weakSignal: Number,
      noSignal: Number
    }
  },
  
  // Security Analysis
  securityAnalysis: {
    encryptionDistribution: mongoose.Schema.Types.Mixed,
    weakConfigurations: [{
      ap: String,
      issue: String,
      severity: String,
      recommendation: String
    }],
    openNetworks: [String],
    wpsEnabled: [String],
    outdatedEncryption: [String]
  },
  
  // Compliance Check
  complianceCheck: {
    framework: String,
    overallStatus: String,
    passedChecks: Number,
    failedChecks: Number,
    checks: [{
      requirement: String,
      status: String,
      findings: String
    }]
  },
  
  // Performance Metrics
  performance: {
    packetsAnalyzed: Number,
    dataProcessed: Number, // in bytes
    scanRate: Number, // packets per second
    memoryUsed: Number,
    cpuUsed: Number
  },
  
  // Scan Configuration Details
  configuration: {
    scanEngine: String,
    scannerVersion: String,
    parameters: mongoose.Schema.Types.Mixed,
    sensors: [String],
    filters: mongoose.Schema.Types.Mixed
  },
  
  // Initiated By
  initiatedBy: {
    user: String,
    reason: String,
    automated: Boolean,
    scheduleName: String
  },
  
  // Export and Reporting
  reports: [{
    format: String,
    generatedAt: Date,
    filePath: String,
    downloadUrl: String
  }],
  
  // Errors and Warnings
  errors: [{
    timestamp: Date,
    code: String,
    message: String,
    severity: String
  }],
  warnings: [{
    timestamp: Date,
    message: String,
    context: String
  }],
  
  // Metadata
  tags: [String],
  notes: String
}, {
  timestamps: true
});

// Indexes
scanResultSchema.index({ scanType: 1, startTime: -1 });
scanResultSchema.index({ status: 1, startTime: -1 });
scanResultSchema.index({ 'initiatedBy.user': 1 });
scanResultSchema.index({ 'summary.rogueAps': -1 });
scanResultSchema.index({ 'summary.threatsDetected': -1 });

// Methods
scanResultSchema.methods.complete = function() {
  this.status = 'completed';
  this.endTime = new Date();
  this.duration = Math.floor((this.endTime - this.startTime) / 1000);
  this.progress = 100;
};

scanResultSchema.methods.calculateRiskScore = function() {
  let score = 0;
  
  // Rogue APs are high risk
  score += this.summary.rogueAps * 20;
  
  // Critical vulnerabilities
  const criticalVulns = this.vulnerabilities.filter(v => v.severity === 'critical').length;
  score += criticalVulns * 15;
  
  // Active threats
  score += this.summary.threatsDetected * 10;
  
  // Weak encryption
  const weakEncryption = this.securityAnalysis.openNetworks?.length || 0;
  score += weakEncryption * 5;
  
  return Math.min(score, 100);
};

scanResultSchema.methods.generateExecutiveSummary = function() {
  return {
    scanId: this.scanId,
    scanType: this.scanType,
    duration: this.duration,
    timestamp: this.startTime,
    criticalFindings: this.summary.threatsDetected + this.summary.rogueAps,
    riskScore: this.calculateRiskScore(),
    status: this.status,
    recommendations: this.getRecommendations()
  };
};

scanResultSchema.methods.getRecommendations = function() {
  const recommendations = [];
  
  if (this.summary.rogueAps > 0) {
    recommendations.push({
      priority: 'critical',
      action: 'Investigate and remove rogue access points immediately'
    });
  }
  
  if (this.securityAnalysis.openNetworks?.length > 0) {
    recommendations.push({
      priority: 'high',
      action: 'Enable encryption on open networks or disable them'
    });
  }
  
  if (this.vulnerabilities.filter(v => v.severity === 'critical').length > 0) {
    recommendations.push({
      priority: 'critical',
      action: 'Apply security patches for critical vulnerabilities'
    });
  }
  
  return recommendations;
};

module.exports = mongoose.model('ScanResult', scanResultSchema);
