/**
 * Asset Model
 * Enterprise Asset Inventory & Management
 * 
 * Manages IT assets with comprehensive vulnerability tracking,
 * risk scoring, compliance status, and lifecycle management
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const softwareSchema = new Schema({
  name: { type: String, required: true },
  version: String,
  vendor: String,
  installDate: Date,
  licenseKey: String,
  cpe: String, // Common Platform Enumeration
  vulnerabilities: [{ type: Schema.Types.ObjectId, ref: 'Vulnerability' }]
}, { _id: false });

const serviceSchema = new Schema({
  name: { type: String, required: true },
  port: { type: Number, required: true },
  protocol: { type: String, enum: ['tcp', 'udp', 'sctp'], default: 'tcp' },
  version: String,
  banner: String,
  state: { type: String, enum: ['open', 'closed', 'filtered'], default: 'open' },
  vulnerabilities: [{ type: Schema.Types.ObjectId, ref: 'Vulnerability' }]
}, { _id: false });

const networkInterfaceSchema = new Schema({
  name: String,
  ipAddress: { type: String, required: true },
  macAddress: String,
  netmask: String,
  gateway: String,
  type: { type: String, enum: ['ipv4', 'ipv6'], default: 'ipv4' }
}, { _id: false });

const assetSchema = new Schema({
  // Identification
  assetId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  name: { type: String, required: true },
  hostname: String,
  fqdn: String, // Fully Qualified Domain Name
  
  // Asset Type & Category
  type: {
    type: String,
    required: true,
    enum: [
      'server',
      'workstation',
      'laptop',
      'mobile',
      'tablet',
      'network_device',
      'router',
      'switch',
      'firewall',
      'load_balancer',
      'iot',
      'printer',
      'cloud_resource',
      'vm',
      'container',
      'application',
      'database',
      'web_server',
      'storage',
      'other'
    ]
  },
  category: {
    type: String,
    enum: ['endpoint', 'infrastructure', 'network', 'cloud', 'application', 'iot'],
    default: 'infrastructure'
  },
  
  // Discovery Information
  discoveryMethod: {
    type: String,
    enum: [
      'active_scan',
      'passive_scan',
      'agent',
      'manual',
      'api_import',
      'cmdb_sync',
      'cloud_api',
      'siem_integration'
    ],
    default: 'active_scan'
  },
  firstDiscovered: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
  
  // Network Configuration
  networkInterfaces: [networkInterfaceSchema],
  primaryIp: String,
  macAddress: String,
  
  // Operating System
  operatingSystem: {
    name: String,
    version: String,
    architecture: { type: String, enum: ['x86', 'x64', 'arm', 'arm64', 'other'] },
    kernel: String,
    servicePackLevel: String,
    buildNumber: String,
    cpe: String
  },
  
  // Hardware Information
  hardware: {
    manufacturer: String,
    model: String,
    serialNumber: String,
    cpuModel: String,
    cpuCores: Number,
    memoryGB: Number,
    diskGB: Number
  },
  
  // Services & Ports
  services: [serviceSchema],
  openPorts: [Number],
  
  // Software Inventory
  installedSoftware: [softwareSchema],
  
  // Cloud Information (if applicable)
  cloud: {
    provider: { type: String, enum: ['aws', 'azure', 'gcp', 'oracle', 'ibm', 'alibaba', 'other'] },
    region: String,
    availabilityZone: String,
    instanceId: String,
    instanceType: String,
    accountId: String,
    tags: [{ key: String, value: String }]
  },
  
  // Container Information (if applicable)
  container: {
    runtime: { type: String, enum: ['docker', 'containerd', 'cri-o', 'podman'] },
    imageId: String,
    imageName: String,
    imageTag: String,
    containerId: String,
    orchestrator: { type: String, enum: ['kubernetes', 'docker-swarm', 'ecs', 'openshift'] },
    namespace: String,
    podName: String
  },
  
  // Ownership & Organization
  ownership: {
    department: String,
    businessUnit: String,
    costCenter: String,
    owner: String,
    ownerEmail: String,
    technicalContact: String,
    technicalContactEmail: String,
    location: String,
    site: String,
    building: String,
    room: String
  },
  
  // Criticality & Risk
  criticality: {
    type: String,
    required: true,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium'
  },
  businessImpact: {
    confidentiality: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    integrity: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    availability: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' }
  },
  riskScore: { type: Number, default: 0, min: 0, max: 100 },
  exposureScore: { type: Number, default: 0, min: 0, max: 100 },
  
  // Vulnerability Summary
  vulnerabilitySummary: {
    total: { type: Number, default: 0 },
    critical: { type: Number, default: 0 },
    high: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    low: { type: Number, default: 0 },
    informational: { type: Number, default: 0 },
    lastAssessed: Date
  },
  vulnerabilities: [{ type: Schema.Types.ObjectId, ref: 'Vulnerability' }],
  
  // Compliance
  complianceFrameworks: [{
    framework: { type: String, enum: ['pci-dss', 'hipaa', 'soc2', 'iso27001', 'nist', 'cis', 'gdpr', 'fedramp'] },
    status: { type: String, enum: ['compliant', 'non_compliant', 'partially_compliant', 'not_applicable'] },
    lastAssessed: Date,
    score: Number,
    findings: [String]
  }],
  
  // Patch Management
  patchStatus: {
    lastPatched: Date,
    patchLevel: String,
    pendingPatches: { type: Number, default: 0 },
    criticalPatchesPending: { type: Number, default: 0 },
    nextPatchWindow: Date
  },
  
  // Agent Information (if agent-based)
  agent: {
    installed: { type: Boolean, default: false },
    version: String,
    lastContact: Date,
    status: { type: String, enum: ['online', 'offline', 'error'], default: 'offline' }
  },
  
  // Scan History
  lastScan: {
    scanId: { type: Schema.Types.ObjectId, ref: 'Scan' },
    date: Date,
    type: String,
    result: String
  },
  scanCount: { type: Number, default: 0 },
  
  // Status & Lifecycle
  status: {
    type: String,
    required: true,
    enum: [
      'active',
      'inactive',
      'maintenance',
      'decommissioned',
      'quarantined',
      'pending_approval',
      'unknown'
    ],
    default: 'active'
  },
  lifecycle: {
    purchaseDate: Date,
    deploymentDate: Date,
    warrantyExpiration: Date,
    endOfLife: Date,
    endOfSupport: Date
  },
  
  // Flags & Attributes
  isInternetFacing: { type: Boolean, default: false },
  isVirtual: { type: Boolean, default: false },
  isPCI: { type: Boolean, default: false },
  isProduction: { type: Boolean, default: true },
  requiresAuthentication: { type: Boolean, default: true },
  
  // Tags & Labels
  tags: [String],
  labels: { type: Map, of: String },
  
  // Notes & Comments
  notes: [{
    author: String,
    content: String,
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Metadata
  metadata: { type: Map, of: Schema.Types.Mixed },
  customFields: { type: Map, of: String }
}, {
  timestamps: true,
  collection: 'assets'
});

// Indexes
assetSchema.index({ assetId: 1 });
assetSchema.index({ type: 1 });
assetSchema.index({ criticality: 1 });
assetSchema.index({ status: 1 });
assetSchema.index({ primaryIp: 1 });
assetSchema.index({ 'ownership.department': 1 });
assetSchema.index({ riskScore: -1 });
assetSchema.index({ 'vulnerabilitySummary.critical': -1 });
assetSchema.index({ lastSeen: -1 });
assetSchema.index({ tags: 1 });

// Virtual for asset age
assetSchema.virtual('assetAge').get(function() {
  if (!this.firstDiscovered) return null;
  const now = new Date();
  const diff = now - this.firstDiscovered;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return days;
});

// Virtual for days since last seen
assetSchema.virtual('daysSinceLastSeen').get(function() {
  if (!this.lastSeen) return null;
  const now = new Date();
  const diff = now - this.lastSeen;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return days;
});

// Virtual for is stale (not seen in 30 days)
assetSchema.virtual('isStale').get(function() {
  const days = this.daysSinceLastSeen;
  return days !== null && days > 30;
});

// Method: Update vulnerability count
assetSchema.methods.updateVulnerabilityCount = async function(counts) {
  this.vulnerabilitySummary = {
    total: counts.total || 0,
    critical: counts.critical || 0,
    high: counts.high || 0,
    medium: counts.medium || 0,
    low: counts.low || 0,
    informational: counts.informational || 0,
    lastAssessed: new Date()
  };
  await this.save();
};

// Method: Calculate risk score
assetSchema.methods.calculateRiskScore = function() {
  let score = 0;
  
  // Vulnerability severity weighted score
  const vulnScore = (
    (this.vulnerabilitySummary.critical * 10) +
    (this.vulnerabilitySummary.high * 7) +
    (this.vulnerabilitySummary.medium * 4) +
    (this.vulnerabilitySummary.low * 1)
  );
  
  // Criticality multiplier
  const criticalityMultiplier = {
    critical: 2.0,
    high: 1.5,
    medium: 1.0,
    low: 0.5
  }[this.criticality] || 1.0;
  
  // Internet-facing multiplier
  const exposureMultiplier = this.isInternetFacing ? 1.5 : 1.0;
  
  // Calculate base score
  score = vulnScore * criticalityMultiplier * exposureMultiplier;
  
  // Normalize to 0-100
  score = Math.min(100, Math.round(score));
  
  this.riskScore = score;
  return score;
};

// Method: Add service
assetSchema.methods.addService = function(serviceData) {
  const existingIndex = this.services.findIndex(
    s => s.port === serviceData.port && s.protocol === serviceData.protocol
  );
  
  if (existingIndex >= 0) {
    this.services[existingIndex] = { ...this.services[existingIndex], ...serviceData };
  } else {
    this.services.push(serviceData);
    if (!this.openPorts.includes(serviceData.port)) {
      this.openPorts.push(serviceData.port);
    }
  }
};

// Method: Add software
assetSchema.methods.addSoftware = function(softwareData) {
  const existingIndex = this.installedSoftware.findIndex(
    s => s.name === softwareData.name && s.version === softwareData.version
  );
  
  if (existingIndex >= 0) {
    this.installedSoftware[existingIndex] = { ...this.installedSoftware[existingIndex], ...softwareData };
  } else {
    this.installedSoftware.push(softwareData);
  }
};

// Method: Update last seen
assetSchema.methods.updateLastSeen = function() {
  this.lastSeen = new Date();
};

// Static: Find high risk assets
assetSchema.statics.findHighRisk = function(threshold = 70) {
  return this.find({ 
    riskScore: { $gte: threshold },
    status: 'active'
  }).sort({ riskScore: -1 });
};

// Static: Find assets with critical vulnerabilities
assetSchema.statics.findWithCriticalVulns = function() {
  return this.find({ 
    'vulnerabilitySummary.critical': { $gt: 0 },
    status: 'active'
  }).sort({ 'vulnerabilitySummary.critical': -1 });
};

// Static: Find internet-facing assets
assetSchema.statics.findInternetFacing = function() {
  return this.find({ 
    isInternetFacing: true,
    status: 'active'
  });
};

// Static: Find stale assets
assetSchema.statics.findStale = function(days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return this.find({ 
    lastSeen: { $lt: cutoffDate },
    status: { $in: ['active', 'unknown'] }
  });
};

// Static: Get asset statistics
assetSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $facet: {
        byType: [
          { $group: { _id: '$type', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        byCriticality: [
          { $group: { _id: '$criticality', count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ],
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        riskDistribution: [
          {
            $bucket: {
              groupBy: '$riskScore',
              boundaries: [0, 25, 50, 75, 100],
              default: 'Other',
              output: { count: { $sum: 1 } }
            }
          }
        ],
        vulnerabilitySummary: [
          {
            $group: {
              _id: null,
              totalAssets: { $sum: 1 },
              totalVulns: { $sum: '$vulnerabilitySummary.total' },
              criticalVulns: { $sum: '$vulnerabilitySummary.critical' },
              highVulns: { $sum: '$vulnerabilitySummary.high' },
              mediumVulns: { $sum: '$vulnerabilitySummary.medium' },
              lowVulns: { $sum: '$vulnerabilitySummary.low' }
            }
          }
        ]
      }
    }
  ]);
  
  return stats[0];
};

// Pre-save hook: Update last seen on save
assetSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('vulnerabilitySummary')) {
    this.calculateRiskScore();
  }
  next();
});

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;
