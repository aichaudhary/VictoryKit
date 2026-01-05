const mongoose = require('mongoose');

const recoverySiteSchema = new mongoose.Schema({
  siteId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  
  siteType: {
    type: String,
    enum: ['primary', 'hot-standby', 'warm-standby', 'cold-standby', 'cloud-dr', 'hybrid'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'standby', 'maintenance', 'failover-active', 'offline', 'decommissioned'],
    default: 'standby'
  },
  
  // Location
  location: {
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    postalCode: { type: String },
    timezone: { type: String },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  
  // Cloud Configuration (for cloud-based DR sites)
  cloudProvider: { type: String, enum: ['aws', 'azure', 'gcp', 'oracle', 'ibm', 'other', 'none'], default: 'none' },
  cloudRegion: { type: String },
  cloudAccountId: { type: String },
  vpcId: { type: String },
  subnetIds: [{ type: String }],
  
  // Capacity
  capacity: {
    totalServers: { type: Number, default: 0 },
    availableServers: { type: Number, default: 0 },
    totalStorageTB: { type: Number, default: 0 },
    availableStorageTB: { type: Number, default: 0 },
    networkBandwidthGbps: { type: Number, default: 0 },
    maxVMs: { type: Number, default: 0 }
  },
  
  // Infrastructure
  infrastructure: {
    dataCenter: { type: String },
    tier: { type: String, enum: ['tier-1', 'tier-2', 'tier-3', 'tier-4'] },
    powerRedundancy: { type: String },
    coolingType: { type: String },
    physicalSecurity: { type: String },
    networkConnectivity: [{ type: String }]
  },
  
  // Replication
  replicationConfig: {
    replicationType: { type: String, enum: ['synchronous', 'asynchronous', 'near-synchronous', 'snapshot', 'none'], default: 'asynchronous' },
    replicationFrequency: { type: Number }, // seconds
    lastReplicationAt: { type: Date },
    replicationLagSeconds: { type: Number, default: 0 },
    replicationStatus: { type: String, enum: ['healthy', 'degraded', 'failed', 'paused'], default: 'healthy' }
  },
  
  // Failover Configuration
  failoverConfig: {
    automaticFailover: { type: Boolean, default: false },
    failoverThreshold: { type: Number }, // seconds before auto-failover
    preFailoverChecks: [{ type: String }],
    postFailoverActions: [{ type: String }],
    estimatedFailoverTime: { type: Number } // minutes
  },
  
  // Contacts
  siteContacts: [{
    role: { type: String },
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
    isPrimary: { type: Boolean, default: false }
  }],
  
  // Vendor/Provider
  vendorInfo: {
    vendorName: { type: String },
    contractId: { type: String },
    contractExpiry: { type: Date },
    slaUptime: { type: Number }, // percentage
    supportTier: { type: String }
  },
  
  // Health Monitoring
  healthCheck: {
    lastCheckAt: { type: Date },
    status: { type: String, enum: ['healthy', 'warning', 'critical', 'unknown'], default: 'unknown' },
    checkFrequencyMinutes: { type: Number, default: 5 },
    healthEndpoint: { type: String },
    metrics: {
      cpuUtilization: { type: Number },
      memoryUtilization: { type: Number },
      storageUtilization: { type: Number },
      networkLatencyMs: { type: Number }
    }
  },
  
  // Compliance
  certifications: [{ type: String }], // SOC2, ISO27001, HIPAA, etc.
  lastAuditDate: { type: Date },
  complianceStatus: { type: String, enum: ['compliant', 'non-compliant', 'pending-audit'], default: 'pending-audit' },
  
  // Cost
  monthlyCost: { type: Number, default: 0 },
  costCenter: { type: String },
  
  // Metadata
  tags: [{ type: String }],
  notes: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes
recoverySiteSchema.index({ siteId: 1 });
recoverySiteSchema.index({ siteType: 1, status: 1 });
recoverySiteSchema.index({ cloudProvider: 1, cloudRegion: 1 });
recoverySiteSchema.index({ 'healthCheck.status': 1 });

module.exports = mongoose.model('RecoverySite', recoverySiteSchema);
