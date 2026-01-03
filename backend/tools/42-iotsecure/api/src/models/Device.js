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
  type: {
    type: String,
    required: true,
    enum: [
      'camera', 'thermostat', 'hub', 'sensor', 'smart_lock', 
      'smart_light', 'smart_plug', 'router', 'gateway', 'nas',
      'printer', 'medical_device', 'industrial_plc', 'hvac',
      'access_control', 'voice_assistant', 'doorbell', 'tv',
      'appliance', 'wearable', 'unknown'
    ],
    default: 'unknown'
  },
  manufacturer: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  firmwareVersion: {
    type: String,
    trim: true
  },
  // Network Information
  ipAddress: {
    type: String,
    required: true,
    index: true
  },
  macAddress: {
    type: String,
    uppercase: true,
    match: /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/
  },
  networkSegment: {
    type: String,
    trim: true
  },
  hostname: String,
  dnsName: String,
  
  // Location
  location: {
    building: String,
    floor: String,
    room: String,
    zone: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  // Status & Risk
  status: {
    type: String,
    enum: ['online', 'offline', 'compromised', 'quarantined', 'unknown'],
    default: 'unknown',
    index: true
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
    index: true
  },
  riskLevel: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'none'],
    default: 'none'
  },
  
  // Timing
  lastSeen: {
    type: Date,
    default: Date.now,
    index: true
  },
  firstDiscovered: {
    type: Date,
    default: Date.now
  },
  lastScanned: Date,
  
  // Network Services
  openPorts: [{
    type: Number
  }],
  services: [{
    port: Number,
    protocol: {
      type: String,
      enum: ['tcp', 'udp']
    },
    service: String,
    version: String,
    banner: String,
    vulnerable: Boolean
  }],
  
  // Protocol Support
  protocols: [{
    type: String,
    enum: [
      'mqtt', 'coap', 'http', 'https', 'telnet', 'ssh',
      'zigbee', 'zwave', 'bluetooth', 'ble', 'wifi',
      'modbus', 'bacnet', 'dnp3', 'opcua', 'rtsp'
    ]
  }],
  
  // Security Details
  credentials: {
    defaultCredentials: Boolean,
    weakPassword: Boolean,
    noAuthentication: Boolean,
    lastPasswordChange: Date
  },
  
  // Vulnerabilities (references)
  vulnerabilities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vulnerability'
  }],
  vulnerabilityCount: {
    type: Number,
    default: 0
  },
  
  // Network Behavior
  behavior: {
    avgBytesPerHour: Number,
    avgConnectionsPerHour: Number,
    commonDestinations: [String],
    commonPorts: [Number],
    activeHours: [Number],
    lastBehaviorUpdate: Date
  },
  
  // Power & Hardware
  powerConsumption: {
    current: Number,
    average: Number,
    unit: { type: String, default: 'watts' }
  },
  batteryLevel: Number,
  
  // Classification
  tags: [{
    type: String,
    trim: true
  }],
  groups: [{
    type: String,
    trim: true
  }],
  criticality: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium'
  },
  
  // Ownership
  owner: {
    name: String,
    department: String,
    email: String
  },
  
  // Additional Data
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Audit
  createdBy: String,
  updatedBy: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
deviceSchema.index({ type: 1, status: 1 });
deviceSchema.index({ riskScore: -1 });
deviceSchema.index({ manufacturer: 1 });
deviceSchema.index({ 'location.building': 1, 'location.floor': 1 });
deviceSchema.index({ tags: 1 });
deviceSchema.index({ networkSegment: 1 });

// Virtual for display name
deviceSchema.virtual('displayName').get(function() {
  return this.name || this.hostname || this.ipAddress;
});

// Virtual for age (days since discovery)
deviceSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.firstDiscovered) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update risk level based on score
deviceSchema.pre('save', function(next) {
  if (this.riskScore >= 80) {
    this.riskLevel = 'critical';
  } else if (this.riskScore >= 60) {
    this.riskLevel = 'high';
  } else if (this.riskScore >= 40) {
    this.riskLevel = 'medium';
  } else if (this.riskScore >= 20) {
    this.riskLevel = 'low';
  } else {
    this.riskLevel = 'none';
  }
  next();
});

// Static method to find high-risk devices
deviceSchema.statics.findHighRisk = function(threshold = 60) {
  return this.find({ riskScore: { $gte: threshold } })
    .sort({ riskScore: -1 })
    .populate('vulnerabilities');
};

// Static method to find offline devices
deviceSchema.statics.findOffline = function(minutesAgo = 30) {
  const cutoff = new Date(Date.now() - minutesAgo * 60 * 1000);
  return this.find({ 
    $or: [
      { status: 'offline' },
      { lastSeen: { $lt: cutoff } }
    ]
  });
};

// Instance method to quarantine device
deviceSchema.methods.quarantine = async function(reason) {
  this.status = 'quarantined';
  this.metadata.quarantineReason = reason;
  this.metadata.quarantinedAt = new Date();
  return this.save();
};

// Instance method to calculate risk score
deviceSchema.methods.calculateRiskScore = function() {
  let score = 0;
  
  // Default credentials (+30)
  if (this.credentials?.defaultCredentials) score += 30;
  if (this.credentials?.weakPassword) score += 20;
  if (this.credentials?.noAuthentication) score += 25;
  
  // Vulnerability count
  score += Math.min(this.vulnerabilityCount * 5, 30);
  
  // Risky open ports (telnet, ftp, etc.)
  const riskyPorts = [21, 23, 25, 110, 143, 445, 3389];
  const hasRiskyPorts = this.openPorts?.some(p => riskyPorts.includes(p));
  if (hasRiskyPorts) score += 15;
  
  // Old firmware (if we can detect it)
  // Status-based adjustments
  if (this.status === 'compromised') score = 100;
  
  return Math.min(score, 100);
};

module.exports = mongoose.model('Device', deviceSchema);
