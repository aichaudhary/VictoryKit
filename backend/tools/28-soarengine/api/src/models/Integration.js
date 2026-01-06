const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  endpoint: { type: String },
  method: { type: String, enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
  parameters: [{ type: mongoose.Schema.Types.Mixed }],
  responseMapping: { type: mongoose.Schema.Types.Mixed },
  rateLimitPerMinute: { type: Number }
}, { _id: true });

const integrationSchema = new mongoose.Schema({
  toolName: { type: String, required: true, unique: true, index: true },
  
  toolType: {
    type: String,
    enum: ['siem', 'edr', 'firewall', 'ids_ips', 'email_gateway', 'threat_intel', 'ticketing', 'chat', 'cloud_security', 'vulnerability_scanner', 'sandbox', 'proxy', 'dlp', 'casb', 'custom'],
    required: true,
    index: true
  },
  
  vendor: { type: String },
  version: { type: String },
  
  connectionType: {
    type: String,
    enum: ['api', 'webhook', 'syslog', 'file_import', 'database', 'agent'],
    required: true
  },
  
  connectionConfig: {
    baseUrl: { type: String },
    authType: { type: String, enum: ['api_key', 'oauth', 'basic', 'token', 'certificate'] },
    credentials: { type: mongoose.Schema.Types.Mixed }, // Encrypted in production
    headers: { type: mongoose.Schema.Types.Mixed },
    timeout: { type: Number, default: 30000 },
    retryAttempts: { type: Number, default: 3 }
  },
  
  status: {
    type: String,
    enum: ['active', 'inactive', 'error', 'testing'],
    default: 'testing',
    index: true
  },
  
  healthCheck: {
    lastChecked: { type: Date },
    isHealthy: { type: Boolean, default: false },
    lastError: { type: String },
    responseTime: { type: Number } // in ms
  },
  
  availableActions: [actionSchema],
  
  capabilities: {
    canQuery: { type: Boolean, default: false },
    canExecute: { type: Boolean, default: false },
    canReceiveEvents: { type: Boolean, default: false },
    supportsBulkOperations: { type: Boolean, default: false },
    supportsRealtime: { type: Boolean, default: false }
  },
  
  usageStats: {
    totalCalls: { type: Number, default: 0 },
    successfulCalls: { type: Number, default: 0 },
    failedCalls: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 },
    lastUsed: { type: Date },
    dataVolume: { type: Number, default: 0 } // in bytes
  },
  
  rateLimits: {
    callsPerMinute: { type: Number },
    callsPerHour: { type: Number },
    callsPerDay: { type: Number },
    currentUsage: {
      minute: { type: Number, default: 0 },
      hour: { type: Number, default: 0 },
      day: { type: Number, default: 0 }
    },
    resetAt: {
      minute: { type: Date },
      hour: { type: Date },
      day: { type: Date }
    }
  },
  
  webhookConfig: {
    enabled: { type: Boolean, default: false },
    url: { type: String },
    secret: { type: String },
    events: [{ type: String }]
  },
  
  dataMapping: {
    fieldMappings: { type: mongoose.Schema.Types.Mixed },
    customTransforms: [{ type: mongoose.Schema.Types.Mixed }]
  },
  
  metadata: {
    tags: [{ type: String }],
    description: { type: String },
    documentation: { type: String },
    category: { type: String },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' }
  },
  
  createdBy: { type: String },
  lastModifiedBy: { type: String }
}, {
  timestamps: true
});

integrationSchema.index({ status: 1, toolType: 1 });
integrationSchema.index({ 'metadata.tags': 1 });
integrationSchema.index({ createdAt: -1 });

integrationSchema.methods.recordUsage = async function(success, responseTime) {
  this.usageStats.totalCalls++;
  if (success) {
    this.usageStats.successfulCalls++;
  } else {
    this.usageStats.failedCalls++;
  }
  this.usageStats.averageResponseTime = 
    ((this.usageStats.averageResponseTime * (this.usageStats.totalCalls - 1)) + responseTime) / 
    this.usageStats.totalCalls;
  this.usageStats.lastUsed = new Date();
  await this.save();
};

integrationSchema.methods.checkHealth = async function() {
  // Implement health check logic
  this.healthCheck.lastChecked = new Date();
  // Health check implementation would go here
  await this.save();
};

module.exports = mongoose.model('Integration', integrationSchema);
