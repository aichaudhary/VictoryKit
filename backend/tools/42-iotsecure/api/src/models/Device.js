/**
 * Device Model - IoT Device Inventory
 * Manages IoT device discovery, status, and security metadata
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
  type: {
    type: String,
    required: true,
    enum: [
      'camera', 'thermostat', 'hub', 'sensor', 'smart_lock', 
      'smart_light', 'smart_plug', 'router', 'gateway', 'nas',
      'printer', 'medical_device', 'industrial_plc', 'hvac',
      'access_control', 'voice_assistant', 'doorbell', 'tv',
      'appliance', 'wearable', 'drone', 'vehicle', 'unknown'
    ],
    default: 'unknown'
  },
  manufacturer: { type: String, trim: true },
  model: { type: String, trim: true },
  firmwareVersion: { type: String, trim: true },
  
  // Network Information
  ipAddress: { type: String, required: true, index: true },
  macAddress: { type: String, uppercase: true },
  networkSegment: { type: mongoose.Schema.Types.ObjectId, ref: 'Segment' },
  hostname: String,
  dnsName: String,
  
  // Location
  location: {
    building: String,
    floor: String,
    room: String,
    zone: String,
    coordinates: { lat: Number, lng: Number }
  },
  
  // Status & Risk
  status: {
    type: String,
    enum: ['online', 'offline', 'compromised', 'quarantined', 'unknown'],
    default: 'unknown',
    index: true
  },
  riskScore: { type: Number, min: 0, max: 100, default: 0, index: true },
  riskLevel: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'none'],
    default: 'none'
  },
  
  // Timing
  lastSeen: { type: Date, default: Date.now, index: true },
  firstDiscovered: { type: Date, default: Date.now },
  lastScanned: Date,
  
  // Network Services
  openPorts: [Number],
  services: [{
    port: Number,
    protocol: { type: String, enum: ['tcp', 'udp'] },
    service: String,
    version: String,
    banner: String,
    vulnerable: Boolean
  }],
  
  // Protocol Support
  protocols: [{
    type: String,
    enum: ['mqtt', 'coap', 'http', 'https', 'telnet', 'ssh', 'zigbee', 'zwave', 
           'bluetooth', 'ble', 'wifi', 'modbus', 'bacnet', 'dnp3', 'opcua', 'rtsp']
  }],
  
  // Security Details
  credentials: {
    defaultCredentials: Boolean,
    weakPassword: Boolean,
    noAuthentication: Boolean,
    lastPasswordChange: Date
  },
  
  // Vulnerabilities
  vulnerabilities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vulnerability' }],
  vulnerabilityCount: { type: Number, default: 0 },
  
  // Firmware
  firmware: { type: mongoose.Schema.Types.ObjectId, ref: 'Firmware' },
  
  // Behavioral Data
  behavior: {
    avgBytesPerHour: Number,
    avgConnectionsPerHour: Number,
    commonDestinations: [String],
    commonPorts: [Number],
    lastBehaviorUpdate: Date
  },
  
  // Baseline
  baseline: { type: mongoose.Schema.Types.ObjectId, ref: 'Baseline' },
  anomalyScore: { type: Number, default: 0 },
  
  // Tags and metadata
  tags: [String],
  owner: String,
  department: String,
  notes: String,
  
  // External References
  shodanData: mongoose.Schema.Types.Mixed,
  censysData: mongoose.Schema.Types.Mixed,
  
  // Audit
  createdBy: String,
  updatedBy: String
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
deviceSchema.index({ manufacturer: 1, model: 1 });
deviceSchema.index({ riskScore: -1 });
deviceSchema.index({ status: 1, riskLevel: 1 });
deviceSchema.index({ 'location.building': 1, 'location.floor': 1 });

// Virtual for age
deviceSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.firstDiscovered) / (1000 * 60 * 60 * 24));
});

// Virtual for offline duration
deviceSchema.virtual('offlineDuration').get(function() {
  if (this.status === 'online') return 0;
  return Math.floor((Date.now() - this.lastSeen) / (1000 * 60));
});

// Static methods
deviceSchema.statics.getStats = async function() {
  const [total, byStatus, byType, byRisk] = await Promise.all([
    this.countDocuments(),
    this.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    this.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
    this.aggregate([{ $group: { _id: '$riskLevel', count: { $sum: 1 } } }])
  ]);
  return { 
    total, 
    byStatus: byStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
    byType: byType.reduce((acc, t) => ({ ...acc, [t._id]: t.count }), {}),
    byRisk: byRisk.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {})
  };
};

deviceSchema.statics.getHighRisk = function() {
  return this.find({ riskLevel: { $in: ['critical', 'high'] } })
    .sort({ riskScore: -1 })
    .limit(50);
};

deviceSchema.statics.getOffline = function() {
  const threshold = new Date(Date.now() - 60 * 60 * 1000); // 1 hour
  return this.find({ lastSeen: { $lt: threshold }, status: { $ne: 'offline' } });
};

deviceSchema.statics.getBySegment = function(segmentId) {
  return this.find({ networkSegment: segmentId });
};

deviceSchema.statics.searchDevices = function(query, options = {}) {
  const searchQuery = {
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { ipAddress: { $regex: query, $options: 'i' } },
      { macAddress: { $regex: query, $options: 'i' } },
      { manufacturer: { $regex: query, $options: 'i' } },
      { model: { $regex: query, $options: 'i' } }
    ]
  };
  return this.find(searchQuery)
    .skip(options.skip || 0)
    .limit(options.limit || 50)
    .sort(options.sort || { lastSeen: -1 });
};

// Instance methods
deviceSchema.methods.calculateRiskLevel = function() {
  if (this.riskScore >= 80) return 'critical';
  if (this.riskScore >= 60) return 'high';
  if (this.riskScore >= 40) return 'medium';
  if (this.riskScore >= 20) return 'low';
  return 'none';
};

deviceSchema.methods.updateRiskScore = async function() {
  let score = 0;
  
  // Default credentials (+30)
  if (this.credentials?.defaultCredentials) score += 30;
  if (this.credentials?.weakPassword) score += 20;
  if (this.credentials?.noAuthentication) score += 25;
  
  // Vulnerabilities (+5 each, max 40)
  score += Math.min(this.vulnerabilityCount * 5, 40);
  
  // Open risky ports
  const riskyPorts = [23, 21, 80, 8080, 554];
  const openRisky = this.openPorts?.filter(p => riskyPorts.includes(p)).length || 0;
  score += openRisky * 5;
  
  // Outdated firmware (+15)
  if (this.firmware?.outdated) score += 15;
  
  // Behavioral anomalies
  score += Math.min(this.anomalyScore * 10, 20);
  
  this.riskScore = Math.min(score, 100);
  this.riskLevel = this.calculateRiskLevel();
  return this.save();
};

module.exports = mongoose.model('Device', deviceSchema);
