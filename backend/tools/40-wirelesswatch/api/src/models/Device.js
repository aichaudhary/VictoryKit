const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  // Device Identification
  macAddress: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  ipAddress: {
    type: String,
    index: true
  },
  hostname: String,
  
  // Device Classification
  deviceType: {
    type: String,
    enum: ['laptop', 'desktop', 'smartphone', 'tablet', 'iot', 'printer', 'camera', 'sensor', 'wearable', 'gaming', 'voip', 'medical', 'pos', 'server', 'unknown'],
    default: 'unknown',
    index: true
  },
  vendor: String,
  manufacturer: String,
  os: {
    name: String,
    version: String,
    platform: String
  },
  
  // Connection Status
  connectedAp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccessPoint'
  },
  ssid: String,
  
  // Authorization Status
  status: {
    type: String,
    enum: ['authorized', 'unauthorized', 'blocked', 'quarantined', 'pending'],
    default: 'pending',
    index: true
  },
  
  // Timestamps
  firstSeen: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastSeen: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Traffic Statistics
  trafficStats: {
    bytesSent: {
      type: Number,
      default: 0
    },
    bytesReceived: {
      type: Number,
      default: 0
    },
    packetsSent: {
      type: Number,
      default: 0
    },
    packetsReceived: {
      type: Number,
      default: 0
    },
    sessions: {
      type: Number,
      default: 0
    },
    lastActivity: Date
  },
  
  // Security Profile
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  riskFactors: [{
    factor: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    description: String,
    detectedAt: Date
  }],
  
  // Behavioral Profile
  profile: {
    typicalConnectTimes: [String],
    typicalLocations: [String],
    typicalTrafficPatterns: mongoose.Schema.Types.Mixed,
    anomalyScore: Number,
    lastProfileUpdate: Date
  },
  
  // User Information
  user: {
    username: String,
    department: String,
    email: String,
    employeeId: String
  },
  
  // Compliance
  compliance: {
    policyCompliant: Boolean,
    lastAudit: Date,
    violations: [{
      policy: String,
      description: String,
      detectedAt: Date
    }]
  },
  
  // Notes and Tags
  tags: [String],
  notes: String,
  
  // Metadata
  createdBy: String,
  updatedBy: String
}, {
  timestamps: true
});

// Indexes
deviceSchema.index({ status: 1, lastSeen: -1 });
deviceSchema.index({ riskScore: -1 });
deviceSchema.index({ 'trafficStats.lastActivity': -1 });
deviceSchema.index({ firstSeen: 1 });

// Methods
deviceSchema.methods.updateRiskScore = function() {
  let score = 0;
  
  // Calculate based on risk factors
  this.riskFactors.forEach(factor => {
    switch(factor.severity) {
      case 'critical': score += 30; break;
      case 'high': score += 20; break;
      case 'medium': score += 10; break;
      case 'low': score += 5; break;
    }
  });
  
  // Status impact
  if (this.status === 'unauthorized') score += 40;
  if (this.status === 'blocked') score += 60;
  
  // Activity impact
  const daysSinceActivity = (Date.now() - this.trafficStats.lastActivity) / (1000 * 60 * 60 * 24);
  if (daysSinceActivity < 1) score += 5;
  
  this.riskScore = Math.min(Math.max(score, 0), 100);
  return this.riskScore;
};

deviceSchema.methods.isActive = function() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.lastSeen > fiveMinutesAgo;
};

module.exports = mongoose.model('Device', deviceSchema);
