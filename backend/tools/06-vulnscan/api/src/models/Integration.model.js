/**
 * VulnScan - Integration Model
 * External system integrations and connectors
 */

const mongoose = require('mongoose');

// Credential Configuration Sub-schema
const credentialConfigSchema = new mongoose.Schema({
  credentialType: {
    type: String,
    enum: ['API_KEY', 'OAUTH2', 'BASIC', 'TOKEN', 'CERTIFICATE', 'AWS_IAM', 'AZURE_AD', 'GCP_SERVICE_ACCOUNT'],
    required: true
  },
  // Encrypted credential data
  apiKey: {
    type: String,
    select: false
  },
  apiSecret: {
    type: String,
    select: false
  },
  username: String,
  password: {
    type: String,
    select: false
  },
  token: {
    type: String,
    select: false
  },
  refreshToken: {
    type: String,
    select: false
  },
  tokenExpiresAt: Date,
  oauth2: {
    clientId: String,
    clientSecret: { type: String, select: false },
    authUrl: String,
    tokenUrl: String,
    scope: [String],
    accessToken: { type: String, select: false },
    refreshToken: { type: String, select: false },
    expiresAt: Date
  },
  certificate: {
    cert: { type: String, select: false },
    key: { type: String, select: false },
    ca: { type: String, select: false },
    passphrase: { type: String, select: false }
  },
  awsIam: {
    accessKeyId: { type: String, select: false },
    secretAccessKey: { type: String, select: false },
    sessionToken: { type: String, select: false },
    roleArn: String,
    region: String
  },
  azureAd: {
    tenantId: String,
    clientId: String,
    clientSecret: { type: String, select: false },
    subscriptionId: String
  },
  gcpServiceAccount: {
    projectId: String,
    privateKeyId: String,
    privateKey: { type: String, select: false },
    clientEmail: String,
    clientId: String
  }
}, { _id: false });

// Webhook Configuration Sub-schema
const webhookConfigSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  method: {
    type: String,
    enum: ['POST', 'PUT', 'PATCH'],
    default: 'POST'
  },
  headers: mongoose.Schema.Types.Mixed,
  authentication: {
    type: { type: String, enum: ['NONE', 'BASIC', 'BEARER', 'API_KEY', 'HMAC'] },
    token: { type: String, select: false },
    username: String,
    password: { type: String, select: false },
    apiKeyHeader: String,
    hmacSecret: { type: String, select: false }
  },
  retryConfig: {
    enabled: { type: Boolean, default: true },
    maxRetries: { type: Number, default: 3 },
    retryDelay: { type: Number, default: 1000 }
  },
  timeout: {
    type: Number,
    default: 30000
  },
  format: {
    type: String,
    enum: ['JSON', 'XML', 'FORM'],
    default: 'JSON'
  },
  payloadTemplate: String
}, { _id: false });

// Sync Configuration Sub-schema
const syncConfigSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  direction: {
    type: String,
    enum: ['INBOUND', 'OUTBOUND', 'BIDIRECTIONAL'],
    default: 'BIDIRECTIONAL'
  },
  frequency: {
    type: String,
    enum: ['REALTIME', 'HOURLY', 'DAILY', 'WEEKLY', 'MANUAL'],
    default: 'HOURLY'
  },
  cronExpression: String,
  lastSync: Date,
  nextSync: Date,
  syncScope: {
    assets: { type: Boolean, default: true },
    vulnerabilities: { type: Boolean, default: true },
    remediations: { type: Boolean, default: true },
    scans: { type: Boolean, default: false }
  },
  filters: mongoose.Schema.Types.Mixed,
  fieldMapping: [{
    sourceField: String,
    targetField: String,
    transformation: String
  }]
}, { _id: false });

// Event Configuration Sub-schema
const eventConfigSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: [
      'SCAN_STARTED', 'SCAN_COMPLETED', 'SCAN_FAILED',
      'VULNERABILITY_FOUND', 'CRITICAL_VULNERABILITY', 'HIGH_VULNERABILITY',
      'REMEDIATION_CREATED', 'REMEDIATION_COMPLETED', 'REMEDIATION_OVERDUE',
      'SLA_WARNING', 'SLA_BREACH',
      'ASSET_DISCOVERED', 'ASSET_REMOVED',
      'REPORT_GENERATED', 'THRESHOLD_BREACH',
      'INTEGRATION_ERROR', 'CUSTOM'
    ],
    required: true
  },
  enabled: { type: Boolean, default: true },
  filters: mongoose.Schema.Types.Mixed,
  transform: String,
  customPayload: mongoose.Schema.Types.Mixed
}, { _id: false });

// Integration Schema
const integrationSchema = new mongoose.Schema({
  // Identifiers
  integrationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

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
    required: true
  },

  // Integration Information
  name: {
    type: String,
    required: true
  },
  description: String,
  integrationType: {
    type: String,
    enum: [
      // Ticketing Systems
      'JIRA', 'SERVICENOW', 'GITHUB_ISSUES', 'GITLAB_ISSUES', 'AZURE_DEVOPS',
      // Communication
      'SLACK', 'TEAMS', 'EMAIL', 'PAGERDUTY', 'OPSGENIE',
      // SIEM/SOAR
      'SPLUNK', 'ELASTIC', 'QRADAR', 'SENTINEL', 'DEMISTO',
      // Cloud Providers
      'AWS', 'AZURE', 'GCP', 'OCI',
      // Container Registries
      'DOCKER_HUB', 'ECR', 'GCR', 'ACR', 'HARBOR',
      // CI/CD
      'JENKINS', 'GITHUB_ACTIONS', 'GITLAB_CI', 'AZURE_PIPELINES', 'CIRCLECI',
      // Vulnerability Sources
      'NVD', 'EXPLOIT_DB', 'CISA_KEV', 'VULNDB',
      // CMDB/Asset Management
      'SERVICENOW_CMDB', 'SNOW_CMDB', 'CUSTOM_CMDB',
      // Webhooks
      'WEBHOOK_INBOUND', 'WEBHOOK_OUTBOUND',
      // Custom
      'CUSTOM', 'API'
    ],
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['TICKETING', 'COMMUNICATION', 'SIEM', 'CLOUD', 'CONTAINER', 'CICD', 'THREAT_INTEL', 'CMDB', 'WEBHOOK', 'CUSTOM'],
    required: true
  },

  // Connection Configuration
  connection: {
    baseUrl: String,
    apiVersion: String,
    region: String,
    environment: {
      type: String,
      enum: ['PRODUCTION', 'SANDBOX', 'STAGING', 'DEVELOPMENT']
    },
    timeout: { type: Number, default: 30000 },
    retries: { type: Number, default: 3 },
    rateLimit: {
      requests: Number,
      period: String
    }
  },

  // Credentials
  credentials: credentialConfigSchema,

  // Webhooks
  webhooks: {
    outbound: [webhookConfigSchema],
    inbound: {
      enabled: { type: Boolean, default: false },
      path: String,
      secret: { type: String, select: false },
      allowedIps: [String],
      events: [String]
    }
  },

  // Sync Configuration
  sync: syncConfigSchema,

  // Events Configuration
  events: [eventConfigSchema],

  // Integration-Specific Configuration
  config: {
    // JIRA Configuration
    jira: {
      projectKey: String,
      issueType: String,
      priorityMapping: mongoose.Schema.Types.Mixed,
      statusMapping: mongoose.Schema.Types.Mixed,
      customFields: mongoose.Schema.Types.Mixed,
      workflow: String
    },
    // ServiceNow Configuration
    servicenow: {
      tableName: String,
      assignmentGroup: String,
      category: String,
      subcategory: String,
      customFields: mongoose.Schema.Types.Mixed
    },
    // Slack Configuration
    slack: {
      channel: String,
      channelId: String,
      botToken: { type: String, select: false },
      messageTemplate: String,
      includeDetails: Boolean
    },
    // Teams Configuration
    teams: {
      teamId: String,
      channelId: String,
      connectorUrl: String,
      messageTemplate: String
    },
    // AWS Configuration
    aws: {
      regions: [String],
      services: [String],
      assumeRoleArn: String,
      externalId: String
    },
    // Azure Configuration
    azure: {
      subscriptions: [String],
      resourceGroups: [String]
    },
    // GCP Configuration
    gcp: {
      projects: [String],
      zones: [String]
    },
    // SIEM Configuration
    siem: {
      indexName: String,
      sourcetype: String,
      eventFormat: String
    },
    // CI/CD Configuration
    cicd: {
      pipelineId: String,
      repository: String,
      branch: String,
      qualityGate: {
        enabled: Boolean,
        thresholds: mongoose.Schema.Types.Mixed
      }
    },
    // Custom Configuration
    custom: mongoose.Schema.Types.Mixed
  },

  // Status
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'ERROR', 'PENDING_AUTH', 'TESTING'],
    default: 'PENDING_AUTH',
    index: true
  },
  statusMessage: String,
  statusHistory: [{
    status: String,
    message: String,
    changedAt: { type: Date, default: Date.now }
  }],

  // Health & Metrics
  health: {
    lastCheck: Date,
    isHealthy: Boolean,
    latency: Number,
    errorRate: Number,
    lastError: {
      timestamp: Date,
      message: String,
      code: String
    }
  },
  metrics: {
    totalRequests: { type: Number, default: 0 },
    successfulRequests: { type: Number, default: 0 },
    failedRequests: { type: Number, default: 0 },
    totalSynced: { type: Number, default: 0 },
    lastRequestAt: Date,
    avgResponseTime: Number
  },

  // Sync History
  syncHistory: [{
    syncId: String,
    startedAt: Date,
    completedAt: Date,
    status: { type: String, enum: ['SUCCESS', 'PARTIAL', 'FAILED'] },
    itemsProcessed: Number,
    itemsCreated: Number,
    itemsUpdated: Number,
    itemsFailed: Number,
    errors: [{
      item: String,
      error: String
    }],
    duration: Number
  }],

  // Event History
  eventHistory: [{
    eventId: String,
    eventType: String,
    timestamp: Date,
    payload: mongoose.Schema.Types.Mixed,
    response: {
      status: Number,
      body: String
    },
    success: Boolean,
    errorMessage: String
  }],

  // Testing
  testResults: {
    lastTest: Date,
    status: { type: String, enum: ['PASSED', 'FAILED', 'NOT_TESTED'] },
    tests: [{
      name: String,
      status: { type: String, enum: ['PASSED', 'FAILED', 'SKIPPED'] },
      message: String,
      duration: Number
    }]
  },

  // Ownership
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Tags
  tags: [String],

  // Metadata
  metadata: mongoose.Schema.Types.Mixed,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'vulnscan_integrations'
});

// Indexes
integrationSchema.index({ organizationId: 1, integrationType: 1 });
integrationSchema.index({ organizationId: 1, status: 1 });
integrationSchema.index({ category: 1 });
integrationSchema.index({ 'sync.nextSync': 1 });

// Virtual for needs sync
integrationSchema.virtual('needsSync').get(function() {
  if (!this.sync?.enabled) return false;
  if (!this.sync?.nextSync) return true;
  return new Date() >= this.sync.nextSync;
});

// Method to test connection
integrationSchema.methods.recordTestResult = function(results) {
  this.testResults = {
    lastTest: new Date(),
    status: results.every(r => r.status === 'PASSED') ? 'PASSED' : 'FAILED',
    tests: results
  };
  
  if (this.testResults.status === 'PASSED') {
    this.status = 'ACTIVE';
    this.statusMessage = 'Connection test passed';
  } else {
    this.status = 'ERROR';
    this.statusMessage = results.find(r => r.status === 'FAILED')?.message || 'Connection test failed';
  }
  
  return this.save();
};

// Method to record sync
integrationSchema.methods.recordSync = function(syncResult) {
  this.syncHistory.unshift({
    syncId: syncResult.syncId,
    startedAt: syncResult.startedAt,
    completedAt: new Date(),
    status: syncResult.errors?.length ? (syncResult.itemsProcessed > 0 ? 'PARTIAL' : 'FAILED') : 'SUCCESS',
    itemsProcessed: syncResult.itemsProcessed,
    itemsCreated: syncResult.itemsCreated,
    itemsUpdated: syncResult.itemsUpdated,
    itemsFailed: syncResult.itemsFailed,
    errors: syncResult.errors?.slice(0, 100),
    duration: Math.round((new Date() - syncResult.startedAt) / 1000)
  });
  
  // Keep last 100 syncs
  if (this.syncHistory.length > 100) {
    this.syncHistory = this.syncHistory.slice(0, 100);
  }
  
  this.sync.lastSync = new Date();
  this.metrics.totalSynced += syncResult.itemsProcessed;
  
  // Calculate next sync
  this.calculateNextSync();
  
  return this.save();
};

// Method to calculate next sync
integrationSchema.methods.calculateNextSync = function() {
  if (!this.sync?.enabled || this.sync.frequency === 'MANUAL') {
    this.sync.nextSync = null;
    return;
  }
  
  const now = new Date();
  
  switch (this.sync.frequency) {
    case 'REALTIME':
      this.sync.nextSync = now;
      break;
    case 'HOURLY':
      this.sync.nextSync = new Date(now.getTime() + 60 * 60 * 1000);
      break;
    case 'DAILY':
      this.sync.nextSync = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      break;
    case 'WEEKLY':
      this.sync.nextSync = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      break;
  }
};

// Method to record event delivery
integrationSchema.methods.recordEvent = function(eventData) {
  this.eventHistory.unshift({
    eventId: eventData.eventId,
    eventType: eventData.eventType,
    timestamp: new Date(),
    payload: eventData.payload,
    response: eventData.response,
    success: eventData.success,
    errorMessage: eventData.errorMessage
  });
  
  // Keep last 1000 events
  if (this.eventHistory.length > 1000) {
    this.eventHistory = this.eventHistory.slice(0, 1000);
  }
  
  this.metrics.totalRequests += 1;
  if (eventData.success) {
    this.metrics.successfulRequests += 1;
  } else {
    this.metrics.failedRequests += 1;
  }
  this.metrics.lastRequestAt = new Date();
  
  return this.save();
};

// Method to update health
integrationSchema.methods.updateHealth = function(healthData) {
  this.health = {
    lastCheck: new Date(),
    isHealthy: healthData.isHealthy,
    latency: healthData.latency,
    errorRate: this.metrics.totalRequests > 0 
      ? (this.metrics.failedRequests / this.metrics.totalRequests) * 100 
      : 0,
    lastError: healthData.error ? {
      timestamp: new Date(),
      message: healthData.error.message,
      code: healthData.error.code
    } : this.health?.lastError
  };
  
  if (!healthData.isHealthy && this.status === 'ACTIVE') {
    this.status = 'ERROR';
    this.statusMessage = healthData.error?.message || 'Health check failed';
  } else if (healthData.isHealthy && this.status === 'ERROR') {
    this.status = 'ACTIVE';
    this.statusMessage = 'Connection restored';
  }
  
  return this.save();
};

// Pre-save hook
integrationSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      message: this.statusMessage,
      changedAt: new Date()
    });
  }
  next();
});

// Static method for integrations needing sync
integrationSchema.statics.getIntegrationsForSync = async function() {
  return this.find({
    'sync.enabled': true,
    status: 'ACTIVE',
    $or: [
      { 'sync.nextSync': { $lte: new Date() } },
      { 'sync.nextSync': null }
    ],
    isActive: true
  });
};

module.exports = mongoose.model('VulnScanIntegration', integrationSchema);
