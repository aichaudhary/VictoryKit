const mongoose = require('mongoose');

const systemSchema = new mongoose.Schema({
  systemId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  
  systemType: {
    type: String,
    enum: ['application', 'database', 'server', 'network', 'storage', 'service', 'container', 'virtual-machine', 'saas', 'infrastructure'],
    required: true
  },
  criticality: {
    type: String,
    enum: ['mission-critical', 'business-critical', 'important', 'standard', 'low'],
    required: true
  },
  status: {
    type: String,
    enum: ['operational', 'degraded', 'down', 'maintenance', 'recovering', 'unknown'],
    default: 'operational'
  },
  
  // Recovery Objectives
  rto: { type: Number, required: true }, // Recovery Time Objective in minutes
  rpo: { type: Number, required: true }, // Recovery Point Objective in minutes
  actualRecoveryTime: { type: Number }, // Last measured recovery time
  
  // Dependencies
  dependencies: [{
    systemId: { type: mongoose.Schema.Types.ObjectId, ref: 'System' },
    dependencyType: { type: String, enum: ['hard', 'soft', 'optional'] },
    description: { type: String }
  }],
  dependents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'System' }],
  
  // Infrastructure Details
  infrastructure: {
    primarySite: { type: mongoose.Schema.Types.ObjectId, ref: 'RecoverySite' },
    drSite: { type: mongoose.Schema.Types.ObjectId, ref: 'RecoverySite' },
    servers: [{ type: String }],
    ipAddresses: [{ type: String }],
    ports: [{ type: Number }],
    loadBalancer: { type: String },
    dnsRecord: { type: String }
  },
  
  // Cloud Resources
  cloudResources: {
    provider: { type: String, enum: ['aws', 'azure', 'gcp', 'on-premise', 'hybrid'] },
    region: { type: String },
    resourceIds: [{ type: String }],
    autoScalingGroup: { type: String },
    containerCluster: { type: String }
  },
  
  // Data & Backup
  dataProfile: {
    dataClassification: { type: String, enum: ['public', 'internal', 'confidential', 'restricted'] },
    dataVolumeTB: { type: Number },
    dailyChangeRateGB: { type: Number },
    retentionPeriodDays: { type: Number },
    backupSchedule: { type: String },
    lastBackupAt: { type: Date },
    backupLocation: { type: String }
  },
  
  // Replication
  replication: {
    isReplicated: { type: Boolean, default: false },
    replicationType: { type: String, enum: ['sync', 'async', 'near-sync', 'snapshot'] },
    replicationTarget: { type: String },
    lastReplicatedAt: { type: Date },
    replicationLagSeconds: { type: Number }
  },
  
  // Recovery Procedures
  recoveryProcedure: {
    runbookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Runbook' },
    automationLevel: { type: String, enum: ['fully-automated', 'semi-automated', 'manual'], default: 'manual' },
    estimatedRecoverySteps: { type: Number },
    specialInstructions: { type: String }
  },
  
  // Ownership
  ownership: {
    businessOwner: { type: String },
    technicalOwner: { type: String },
    supportTeam: { type: String },
    vendorSupport: { type: String },
    escalationContact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }
  },
  
  // Business Impact
  businessImpact: {
    revenueImpactPerHour: { type: Number },
    affectedUsers: { type: Number },
    affectedProcesses: [{ type: String }],
    regulatoryImpact: { type: String },
    reputationImpact: { type: String, enum: ['none', 'low', 'medium', 'high', 'severe'] }
  },
  
  // Health & Monitoring
  monitoring: {
    monitoringTool: { type: String },
    healthEndpoint: { type: String },
    lastHealthCheck: { type: Date },
    healthStatus: { type: String, enum: ['healthy', 'warning', 'critical', 'unknown'], default: 'unknown' },
    alertThresholds: {
      cpuPercent: { type: Number },
      memoryPercent: { type: Number },
      diskPercent: { type: Number },
      responseTimeMs: { type: Number }
    }
  },
  
  // Compliance
  compliance: {
    frameworks: [{ type: String }],
    dataResidency: { type: String },
    encryptionRequired: { type: Boolean, default: true },
    auditLogging: { type: Boolean, default: true }
  },
  
  // Documentation
  documentation: {
    architectureDiagram: { type: String },
    runbookUrl: { type: String },
    wikiUrl: { type: String },
    configurationDocs: { type: String }
  },
  
  // Metadata
  environment: { type: String, enum: ['production', 'staging', 'development', 'test'] },
  tags: [{ type: String }],
  notes: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes
systemSchema.index({ systemId: 1 });
systemSchema.index({ criticality: 1, status: 1 });
systemSchema.index({ systemType: 1 });
systemSchema.index({ 'infrastructure.primarySite': 1 });
systemSchema.index({ 'ownership.technicalOwner': 1 });

module.exports = mongoose.model('System', systemSchema);
