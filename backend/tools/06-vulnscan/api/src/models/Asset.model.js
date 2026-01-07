/**
 * VulnScan - Asset Model
 * Comprehensive asset management for vulnerability scanning
 */

const mongoose = require('mongoose');

// Network Interface Sub-schema
const networkInterfaceSchema = new mongoose.Schema({
  name: String,
  macAddress: {
    type: String,
    match: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
  },
  ipv4Addresses: [String],
  ipv6Addresses: [String],
  gateway: String,
  subnet: String,
  dns: [String],
  vlan: Number,
  speed: String,
  duplex: String,
  isUp: Boolean
}, { _id: false });

// Service/Port Sub-schema
const serviceSchema = new mongoose.Schema({
  port: {
    type: Number,
    required: true,
    min: 1,
    max: 65535
  },
  protocol: {
    type: String,
    enum: ['TCP', 'UDP', 'SCTP'],
    default: 'TCP'
  },
  state: {
    type: String,
    enum: ['OPEN', 'CLOSED', 'FILTERED', 'OPEN|FILTERED', 'CLOSED|FILTERED'],
    default: 'OPEN'
  },
  serviceName: String,
  serviceVersion: String,
  serviceProduct: String,
  serviceExtraInfo: String,
  bannerText: String,
  cpe: [String],
  ssl: {
    enabled: Boolean,
    version: String,
    cipher: String,
    certIssuer: String,
    certSubject: String,
    certExpiry: Date,
    selfSigned: Boolean
  },
  vulnerabilityCount: {
    type: Number,
    default: 0
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  firstSeen: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Operating System Detection Sub-schema
const osDetectionSchema = new mongoose.Schema({
  family: {
    type: String,
    enum: ['WINDOWS', 'LINUX', 'MACOS', 'BSD', 'UNIX', 'IOS', 'ANDROID', 'EMBEDDED', 'UNKNOWN']
  },
  name: String,
  version: String,
  architecture: {
    type: String,
    enum: ['x86', 'x64', 'ARM', 'ARM64', 'MIPS', 'UNKNOWN']
  },
  kernel: String,
  servicePackLevel: String,
  buildNumber: String,
  cpe: String,
  confidence: {
    type: Number,
    min: 0,
    max: 100
  },
  detectionMethod: {
    type: String,
    enum: ['FINGERPRINT', 'BANNER', 'SNMP', 'WMI', 'SSH', 'AGENT', 'MANUAL']
  },
  lastDetected: Date,
  patchLevel: {
    current: String,
    available: String,
    lastChecked: Date
  },
  endOfLife: {
    isEol: Boolean,
    eolDate: Date,
    extendedSupportEndDate: Date
  }
}, { _id: false });

// Technology/Software Sub-schema
const technologySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: [
      'OPERATING_SYSTEM', 'WEB_SERVER', 'APPLICATION_SERVER', 'DATABASE',
      'FRAMEWORK', 'CMS', 'PROGRAMMING_LANGUAGE', 'LIBRARY', 'CDN',
      'LOAD_BALANCER', 'CACHE', 'MESSAGE_QUEUE', 'MONITORING', 'SECURITY',
      'CONTAINER', 'ORCHESTRATION', 'CI_CD', 'OTHER'
    ]
  },
  version: String,
  vendor: String,
  cpe: String,
  confidence: {
    type: Number,
    min: 0,
    max: 100
  },
  detectionMethod: String,
  vulnerableVersions: [String],
  knownVulnerabilities: {
    type: Number,
    default: 0
  },
  lastUpdated: Date
}, { _id: false });

// Cloud Resource Information Sub-schema
const cloudInfoSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ['AWS', 'AZURE', 'GCP', 'OCI', 'ALIBABA', 'IBM', 'DIGITALOCEAN', 'LINODE', 'OTHER']
  },
  region: String,
  availabilityZone: String,
  accountId: String,
  resourceId: String,
  resourceArn: String,
  resourceType: {
    type: String,
    enum: [
      'EC2', 'RDS', 'S3', 'LAMBDA', 'EKS', 'ECS', 'LOAD_BALANCER',
      'VM', 'SQL_DATABASE', 'STORAGE_ACCOUNT', 'AKS', 'FUNCTION_APP',
      'COMPUTE_ENGINE', 'CLOUD_SQL', 'GKE', 'CLOUD_FUNCTION', 'OTHER'
    ]
  },
  instanceType: String,
  vpcId: String,
  subnetId: String,
  securityGroups: [{
    id: String,
    name: String
  }],
  publicIp: String,
  privateIp: String,
  iamRole: String,
  tags: mongoose.Schema.Types.Mixed,
  launchTime: Date,
  state: String
}, { _id: false });

// Container Information Sub-schema
const containerInfoSchema = new mongoose.Schema({
  runtime: {
    type: String,
    enum: ['DOCKER', 'CONTAINERD', 'CRI-O', 'PODMAN', 'OTHER']
  },
  containerId: String,
  containerName: String,
  image: {
    repository: String,
    tag: String,
    digest: String,
    fullName: String
  },
  registry: {
    type: String,
    url: String
  },
  status: {
    type: String,
    enum: ['RUNNING', 'STOPPED', 'PAUSED', 'RESTARTING', 'CREATED', 'DEAD']
  },
  orchestrator: {
    type: {
      type: String,
      enum: ['KUBERNETES', 'DOCKER_SWARM', 'ECS', 'NOMAD', 'STANDALONE']
    },
    namespace: String,
    podName: String,
    deployment: String,
    service: String,
    cluster: String
  },
  resources: {
    cpuLimit: String,
    memoryLimit: String,
    cpuUsage: Number,
    memoryUsage: Number
  },
  securityContext: {
    privileged: Boolean,
    runAsRoot: Boolean,
    readOnlyRootFilesystem: Boolean,
    capabilities: {
      add: [String],
      drop: [String]
    }
  },
  volumes: [{
    name: String,
    mountPath: String,
    readOnly: Boolean,
    type: String
  }],
  layerCount: Number,
  baseImage: String,
  vulnerabilityCount: {
    critical: { type: Number, default: 0 },
    high: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    low: { type: Number, default: 0 }
  }
}, { _id: false });

// Web Application Information Sub-schema
const webAppInfoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  baseUrl: String,
  paths: [String],
  apiEndpoints: [{
    path: String,
    methods: [String],
    authentication: String
  }],
  framework: String,
  cms: String,
  server: String,
  technologies: [String],
  ssl: {
    enabled: Boolean,
    grade: String,
    protocol: String,
    certificate: {
      issuer: String,
      subject: String,
      validFrom: Date,
      validTo: Date,
      serialNumber: String,
      fingerprint: String
    }
  },
  headers: {
    server: String,
    xPoweredBy: String,
    contentSecurityPolicy: String,
    strictTransportSecurity: String,
    xFrameOptions: String,
    xContentTypeOptions: String,
    xXssProtection: String
  },
  cookies: [{
    name: String,
    secure: Boolean,
    httpOnly: Boolean,
    sameSite: String
  }],
  forms: [{
    action: String,
    method: String,
    inputs: [String]
  }],
  authentication: {
    type: { type: String, enum: ['NONE', 'BASIC', 'FORM', 'OAUTH', 'JWT', 'API_KEY', 'CUSTOM'] },
    loginUrl: String,
    mfaEnabled: Boolean
  },
  lastCrawled: Date,
  pageCount: Number
}, { _id: false });

// Scan Summary Sub-schema
const scanSummarySchema = new mongoose.Schema({
  lastScanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VulnScan'
  },
  lastScanDate: Date,
  lastScanStatus: String,
  lastScanDuration: Number,
  totalScans: {
    type: Number,
    default: 0
  },
  averageScanDuration: Number,
  riskScore: {
    type: Number,
    min: 0,
    max: 100
  },
  riskLevel: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL', 'UNKNOWN']
  },
  vulnerabilities: {
    critical: { type: Number, default: 0 },
    high: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    low: { type: Number, default: 0 },
    informational: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  openVulnerabilities: { type: Number, default: 0 },
  riskTrend: {
    type: String,
    enum: ['IMPROVING', 'STABLE', 'DEGRADING', 'UNKNOWN'],
    default: 'UNKNOWN'
  },
  previousRiskScore: Number,
  complianceStatus: {
    frameworks: [{
      name: String,
      status: { type: String, enum: ['COMPLIANT', 'NON_COMPLIANT', 'PARTIAL', 'NOT_ASSESSED'] },
      score: Number,
      lastAssessed: Date
    }]
  }
}, { _id: false });

// Owner Information Sub-schema
const ownerInfoSchema = new mongoose.Schema({
  primaryOwner: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    email: String,
    department: String
  },
  technicalOwner: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    email: String,
    department: String
  },
  businessOwner: {
    name: String,
    email: String,
    department: String
  },
  team: String,
  costCenter: String,
  project: String
}, { _id: false });

// Main Asset Schema
const assetSchema = new mongoose.Schema({
  // Identifiers
  assetId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  externalId: String,
  hostname: {
    type: String,
    index: true
  },
  fqdn: String,

  // Organization Context
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Basic Information
  name: {
    type: String,
    required: true
  },
  description: String,

  // Asset Classification
  assetType: {
    type: String,
    enum: [
      'HOST', 'SERVER', 'WORKSTATION', 'NETWORK_DEVICE', 'FIREWALL',
      'ROUTER', 'SWITCH', 'LOAD_BALANCER', 'WEB_APPLICATION', 'API',
      'DATABASE', 'CONTAINER', 'CONTAINER_IMAGE', 'CLOUD_RESOURCE',
      'VIRTUAL_MACHINE', 'IOT_DEVICE', 'MOBILE_DEVICE', 'NETWORK_RANGE', 'OTHER'
    ],
    required: true,
    index: true
  },
  assetSubType: String,

  // Environment & Criticality
  environment: {
    type: String,
    enum: ['PRODUCTION', 'STAGING', 'DEVELOPMENT', 'TESTING', 'QA', 'UAT', 'DR', 'UNKNOWN'],
    default: 'UNKNOWN',
    index: true
  },
  criticality: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
    default: 'MEDIUM',
    index: true
  },
  businessImpact: {
    type: String,
    enum: ['CATASTROPHIC', 'MAJOR', 'MODERATE', 'MINOR', 'NEGLIGIBLE']
  },
  dataClassification: {
    type: String,
    enum: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'TOP_SECRET']
  },

  // Network Information
  network: {
    primaryIp: {
      type: String,
      index: true
    },
    ipAddresses: [String],
    ipv6Addresses: [String],
    macAddresses: [String],
    cidr: String,
    interfaces: [networkInterfaceSchema],
    dns: {
      forward: [String],
      reverse: [String]
    },
    networkZone: {
      type: String,
      enum: ['DMZ', 'INTERNAL', 'EXTERNAL', 'MANAGEMENT', 'GUEST', 'RESTRICTED']
    },
    location: {
      datacenter: String,
      rack: String,
      site: String,
      building: String,
      floor: String,
      room: String
    }
  },

  // Target URLs (for web apps)
  urls: [{
    url: String,
    type: { type: String, enum: ['PRIMARY', 'ALIAS', 'API', 'ADMIN'] },
    authentication: Boolean
  }],

  // Services/Ports
  services: [serviceSchema],
  openPortCount: {
    type: Number,
    default: 0
  },

  // Operating System
  os: osDetectionSchema,

  // Technologies/Software
  technologies: [technologySchema],
  installedSoftware: [{
    name: String,
    version: String,
    vendor: String,
    installDate: Date,
    installPath: String,
    vulnerableVersions: [String]
  }],

  // Cloud Information
  cloud: cloudInfoSchema,
  isCloudResource: {
    type: Boolean,
    default: false
  },

  // Container Information
  container: containerInfoSchema,
  isContainer: {
    type: Boolean,
    default: false
  },

  // Web Application Information
  webApp: webAppInfoSchema,
  isWebApp: {
    type: Boolean,
    default: false
  },

  // Hardware Information
  hardware: {
    manufacturer: String,
    model: String,
    serialNumber: String,
    assetTag: String,
    cpuModel: String,
    cpuCores: Number,
    ramGb: Number,
    diskGb: Number,
    isVirtual: Boolean,
    hypervisor: String
  },

  // Scan Information
  scanSummary: scanSummarySchema,
  scanEligible: {
    type: Boolean,
    default: true
  },
  scanExclusions: [{
    reason: String,
    excludedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    excludedAt: Date,
    expiresAt: Date
  }],

  // Ownership
  owner: ownerInfoSchema,

  // Tags & Labels
  tags: [String],
  labels: [{
    key: String,
    value: String,
    color: String
  }],
  customFields: mongoose.Schema.Types.Mixed,

  // Groups & Collections
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AssetGroup'
  }],

  // Compliance
  compliance: {
    pciScope: Boolean,
    hipaaScope: Boolean,
    sox: Boolean,
    gdprScope: Boolean,
    frameworks: [String],
    lastAssessment: Date,
    nextAssessment: Date
  },

  // Discovery Information
  discovery: {
    method: {
      type: String,
      enum: ['MANUAL', 'NETWORK_SCAN', 'CLOUD_SYNC', 'AGENT', 'IMPORT', 'API_INTEGRATION']
    },
    source: String,
    discoveredAt: { type: Date, default: Date.now },
    discoveredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastConfirmed: Date,
    autoDiscovered: Boolean
  },

  // Status
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'DECOMMISSIONED', 'PENDING_REVIEW', 'PENDING_REMOVAL', 'ARCHIVED'],
    default: 'ACTIVE',
    index: true
  },
  statusHistory: [{
    status: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    reason: String
  }],
  decommissionedAt: Date,
  decommissionedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Lifecycle
  lifecycle: {
    purchaseDate: Date,
    warrantyExpiration: Date,
    endOfLife: Date,
    endOfSupport: Date,
    replacementPlanned: Boolean,
    replacementDate: Date
  },

  // Notes & Attachments
  notes: String,
  attachments: [{
    filename: String,
    url: String,
    mimeType: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now }
  }],

  // Audit
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Metadata
  metadata: mongoose.Schema.Types.Mixed,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'vulnscan_assets'
});

// Indexes
assetSchema.index({ organizationId: 1, assetType: 1, status: 1 });
assetSchema.index({ organizationId: 1, environment: 1, criticality: 1 });
assetSchema.index({ 'network.primaryIp': 1 });
assetSchema.index({ 'scanSummary.riskScore': -1 });
assetSchema.index({ 'scanSummary.lastScanDate': 1 });
assetSchema.index({ tags: 1 });
assetSchema.index({ groups: 1 });
assetSchema.index({ 'cloud.provider': 1, 'cloud.resourceType': 1 });
assetSchema.index({ 'container.image.repository': 1 });
assetSchema.index({ 'owner.primaryOwner.userId': 1 });
assetSchema.index({ 'compliance.pciScope': 1 });

// Text search
assetSchema.index({
  name: 'text',
  hostname: 'text',
  description: 'text',
  'network.primaryIp': 'text'
});

// Virtual for target string
assetSchema.virtual('targetString').get(function() {
  if (this.webApp?.url) return this.webApp.url;
  if (this.network?.primaryIp) return this.network.primaryIp;
  if (this.hostname) return this.hostname;
  if (this.cloud?.resourceId) return this.cloud.resourceId;
  if (this.container?.image?.fullName) return this.container.image.fullName;
  return this.name;
});

// Virtual for vulnerability count
assetSchema.virtual('totalVulnerabilities').get(function() {
  const v = this.scanSummary?.vulnerabilities;
  if (!v) return 0;
  return (v.critical || 0) + (v.high || 0) + (v.medium || 0) + (v.low || 0) + (v.informational || 0);
});

// Method to update from scan results
assetSchema.methods.updateFromScan = async function(scanResult) {
  this.scanSummary = {
    ...this.scanSummary,
    lastScanId: scanResult._id,
    lastScanDate: new Date(),
    lastScanStatus: scanResult.status,
    lastScanDuration: scanResult.duration,
    totalScans: (this.scanSummary?.totalScans || 0) + 1,
    riskScore: scanResult.riskScore || this.scanSummary?.riskScore,
    riskLevel: scanResult.riskLevel || this.scanSummary?.riskLevel,
    vulnerabilities: scanResult.vulnerabilities || this.scanSummary?.vulnerabilities,
    openVulnerabilities: scanResult.openVulnerabilities || 0,
    previousRiskScore: this.scanSummary?.riskScore
  };

  // Calculate risk trend
  if (this.scanSummary.previousRiskScore !== undefined) {
    const diff = this.scanSummary.riskScore - this.scanSummary.previousRiskScore;
    if (diff < -5) this.scanSummary.riskTrend = 'IMPROVING';
    else if (diff > 5) this.scanSummary.riskTrend = 'DEGRADING';
    else this.scanSummary.riskTrend = 'STABLE';
  }

  // Update services if available
  if (scanResult.services?.length) {
    this.services = scanResult.services;
    this.openPortCount = this.services.filter(s => s.state === 'OPEN').length;
  }

  // Update OS detection
  if (scanResult.osDetection) {
    this.os = { ...this.os, ...scanResult.osDetection };
  }

  return this.save();
};

// Method to calculate criticality score
assetSchema.methods.calculateCriticalityScore = function() {
  let score = 0;
  
  // Environment weight
  const envScores = { PRODUCTION: 40, STAGING: 25, UAT: 20, QA: 15, DEVELOPMENT: 10, TESTING: 5 };
  score += envScores[this.environment] || 0;
  
  // Data classification weight
  const dataScores = { TOP_SECRET: 30, RESTRICTED: 25, CONFIDENTIAL: 20, INTERNAL: 10, PUBLIC: 5 };
  score += dataScores[this.dataClassification] || 0;
  
  // Compliance scope weight
  if (this.compliance?.pciScope) score += 15;
  if (this.compliance?.hipaaScope) score += 15;
  if (this.compliance?.gdprScope) score += 10;
  
  // Public exposure
  if (this.network?.networkZone === 'DMZ' || this.network?.networkZone === 'EXTERNAL') {
    score += 10;
  }
  
  return Math.min(score, 100);
};

// Static method for risk distribution
assetSchema.statics.getRiskDistribution = async function(organizationId) {
  return this.aggregate([
    { $match: { organizationId: new mongoose.Types.ObjectId(organizationId), status: 'ACTIVE' } },
    {
      $group: {
        _id: '$scanSummary.riskLevel',
        count: { $sum: 1 },
        avgRiskScore: { $avg: '$scanSummary.riskScore' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// Static method for asset summary
assetSchema.statics.getSummary = async function(organizationId) {
  return this.aggregate([
    { $match: { organizationId: new mongoose.Types.ObjectId(organizationId), status: 'ACTIVE' } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        byType: {
          $push: '$assetType'
        },
        totalVulns: {
          $sum: {
            $add: [
              { $ifNull: ['$scanSummary.vulnerabilities.critical', 0] },
              { $ifNull: ['$scanSummary.vulnerabilities.high', 0] },
              { $ifNull: ['$scanSummary.vulnerabilities.medium', 0] },
              { $ifNull: ['$scanSummary.vulnerabilities.low', 0] }
            ]
          }
        },
        avgRiskScore: { $avg: '$scanSummary.riskScore' },
        needsScan: {
          $sum: {
            $cond: [
              { $lt: ['$scanSummary.lastScanDate', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('VulnScanAsset', assetSchema);
