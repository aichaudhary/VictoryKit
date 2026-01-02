const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  
  assetId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  
  // Asset identification
  name: { 
    type: String, 
    required: true 
  },
  description: String,
  
  // Asset type
  assetType: { 
    type: String, 
    enum: ['host', 'network', 'web_application', 'api', 'container', 'cloud_resource', 'database', 'iot_device'],
    required: true 
  },
  
  // Target information
  target: {
    hostname: String,
    ipAddress: String,
    ipv6Address: String,
    cidr: String,  // For network ranges
    url: String,   // For web apps/APIs
    containerImage: String,  // For containers
    cloudResourceId: String  // For cloud resources
  },
  
  // Environment classification
  environment: { 
    type: String, 
    enum: ['production', 'staging', 'development', 'testing', 'unknown'],
    default: 'unknown'
  },
  
  // Criticality
  criticality: { 
    type: String, 
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium'
  },
  
  // Owner & Team
  owner: {
    name: String,
    email: String,
    team: String,
    department: String
  },
  
  // Tags for organization
  tags: [String],
  
  // Last scan information
  lastScan: {
    scanId: { type: mongoose.Schema.Types.ObjectId, ref: 'VulnerabilityScan' },
    date: Date,
    status: String,
    riskLevel: String,
    riskScore: Number,
    vulnerabilities: {
      critical: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
      info: { type: Number, default: 0 }
    }
  },
  
  // Discovered services
  services: [{
    port: Number,
    protocol: { type: String, enum: ['tcp', 'udp'] },
    service: String,
    version: String,
    state: { type: String, enum: ['open', 'closed', 'filtered'] },
    lastSeen: Date
  }],
  
  // Operating system detection
  osDetection: {
    os: String,
    version: String,
    confidence: Number,
    lastDetected: Date
  },
  
  // Technology stack (for web apps)
  technologies: [{
    name: String,
    version: String,
    category: String,  // e.g., 'framework', 'cms', 'server', 'language'
    confidence: Number
  }],
  
  // SSL/TLS information
  ssl: {
    enabled: Boolean,
    grade: String,
    expiryDate: Date,
    issuer: String,
    protocol: String,
    lastChecked: Date
  },
  
  // Compliance mapping
  compliance: {
    frameworks: [String],  // e.g., ['PCI-DSS', 'HIPAA', 'SOC2']
    scope: Boolean,
    notes: String
  },
  
  // Scan history summary
  scanHistory: {
    totalScans: { type: Number, default: 0 },
    lastScanDate: Date,
    averageRiskScore: Number,
    vulnerabilityTrend: { type: String, enum: ['improving', 'stable', 'degrading', 'unknown'], default: 'unknown' }
  },
  
  // Status
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'decommissioned', 'pending_removal'],
    default: 'active'
  },
  
  // Discovery source
  discoveredBy: {
    method: { type: String, enum: ['manual', 'network_scan', 'cloud_sync', 'import'] },
    source: String,
    date: { type: Date, default: Date.now }
  },
  
  // Metadata
  metadata: mongoose.Schema.Types.Mixed,
  
  // Notes
  notes: String

}, { timestamps: true });

// Indexes for common queries
assetSchema.index({ userId: 1, assetType: 1 });
assetSchema.index({ userId: 1, status: 1 });
assetSchema.index({ 'target.hostname': 1 });
assetSchema.index({ 'target.ipAddress': 1 });
assetSchema.index({ tags: 1 });
assetSchema.index({ criticality: 1 });
assetSchema.index({ 'lastScan.riskLevel': 1 });

// Virtual for full target string
assetSchema.virtual('targetString').get(function() {
  const t = this.target;
  return t.url || t.hostname || t.ipAddress || t.cidr || t.containerImage || t.cloudResourceId || 'Unknown';
});

// Method to update from scan results
assetSchema.methods.updateFromScan = function(scanResult) {
  this.lastScan = {
    scanId: scanResult._id,
    date: new Date(),
    status: scanResult.status,
    riskLevel: scanResult.mlPrediction?.riskLevel || 'UNKNOWN',
    riskScore: scanResult.summary?.avgCvssScore || 0,
    vulnerabilities: {
      critical: scanResult.summary?.criticalCount || 0,
      high: scanResult.summary?.highCount || 0,
      medium: scanResult.summary?.mediumCount || 0,
      low: scanResult.summary?.lowCount || 0,
      info: 0
    }
  };
  
  // Update services if available
  if (scanResult.openPorts && scanResult.openPorts.length > 0) {
    this.services = scanResult.openPorts.map(p => ({
      port: p.port,
      protocol: p.protocol || 'tcp',
      service: p.service,
      version: p.version,
      state: p.state,
      lastSeen: new Date()
    }));
  }
  
  // Update scan history
  this.scanHistory.totalScans += 1;
  this.scanHistory.lastScanDate = new Date();
  
  return this.save();
};

module.exports = mongoose.model('Asset', assetSchema);
