/**
 * VulnScan - Scan Policy Model
 * Customizable scanning policies for different security requirements
 */

const mongoose = require('mongoose');

// Check Definition Sub-schema
const checkDefinitionSchema = new mongoose.Schema({
  checkId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: [
      'VULNERABILITY', 'CONFIGURATION', 'COMPLIANCE', 'NETWORK', 'WEB',
      'AUTHENTICATION', 'ENCRYPTION', 'ACCESS_CONTROL', 'LOGGING', 'CUSTOM'
    ]
  },
  severity: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL']
  },
  enabled: {
    type: Boolean,
    default: true
  },
  parameters: mongoose.Schema.Types.Mixed,
  template: String,
  plugin: String,
  script: String,
  expectedResult: String,
  remediationGuidance: String,
  references: [String],
  compliance: [{
    framework: String,
    requirement: String
  }]
}, { _id: false });

// Threshold Definition Sub-schema
const thresholdSchema = new mongoose.Schema({
  metric: {
    type: String,
    enum: [
      'CRITICAL_COUNT', 'HIGH_COUNT', 'MEDIUM_COUNT', 'LOW_COUNT',
      'TOTAL_COUNT', 'RISK_SCORE', 'CVSS_AVG', 'CVSS_MAX',
      'EXPLOITABLE_COUNT', 'SLA_BREACH_COUNT', 'COMPLIANCE_SCORE'
    ],
    required: true
  },
  operator: {
    type: String,
    enum: ['GREATER_THAN', 'LESS_THAN', 'EQUALS', 'GREATER_THAN_OR_EQUAL', 'LESS_THAN_OR_EQUAL'],
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  action: {
    type: String,
    enum: ['WARN', 'FAIL', 'BLOCK', 'NOTIFY', 'ESCALATE'],
    required: true
  },
  notificationChannel: String,
  description: String
}, { _id: false });

// Exclusion Rule Sub-schema
const exclusionRuleSchema = new mongoose.Schema({
  ruleId: {
    type: String,
    required: true
  },
  name: String,
  enabled: { type: Boolean, default: true },
  type: {
    type: String,
    enum: ['CVE', 'CWE', 'PLUGIN', 'SEVERITY', 'ASSET', 'PATH', 'PORT', 'SERVICE', 'REGEX', 'CUSTOM'],
    required: true
  },
  pattern: String,
  values: [String],
  reason: String,
  expiresAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: false });

// SLA Definition Sub-schema
const slaDefinitionSchema = new mongoose.Schema({
  severity: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL'],
    required: true
  },
  environment: {
    type: String,
    enum: ['PRODUCTION', 'STAGING', 'DEVELOPMENT', 'ALL'],
    default: 'ALL'
  },
  remediationHours: {
    type: Number,
    required: true
  },
  warningHours: Number,
  escalationHours: Number,
  escalationTarget: String,
  autoAssign: Boolean,
  assignmentGroup: String
}, { _id: false });

// Scan Policy Schema
const scanPolicySchema = new mongoose.Schema({
  // Identifiers
  policyId: {
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

  // Policy Information
  name: {
    type: String,
    required: true
  },
  description: String,
  version: {
    type: String,
    default: '1.0.0'
  },
  policyType: {
    type: String,
    enum: ['STANDARD', 'COMPLIANCE', 'CUSTOM', 'INHERITED'],
    default: 'STANDARD'
  },

  // Scope
  scope: {
    applicableTo: {
      type: String,
      enum: ['ALL', 'ASSET_GROUPS', 'ASSET_TYPES', 'ENVIRONMENTS', 'TAGS'],
      default: 'ALL'
    },
    assetGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AssetGroup' }],
    assetTypes: [String],
    environments: [String],
    tags: [String],
    excludedAssets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'VulnScanAsset' }]
  },

  // Scan Configuration
  scanConfig: {
    scanType: {
      type: String,
      enum: ['NETWORK', 'WEB_APPLICATION', 'API', 'CONTAINER', 'CLOUD', 'COMPLIANCE', 'FULL', 'CUSTOM'],
      required: true
    },
    profile: {
      type: String,
      enum: ['QUICK', 'STANDARD', 'COMPREHENSIVE', 'AGGRESSIVE', 'CUSTOM'],
      default: 'STANDARD'
    },
    ports: {
      mode: { type: String, enum: ['TOP_100', 'TOP_1000', 'ALL', 'CUSTOM'], default: 'TOP_1000' },
      customPorts: [Number],
      excludePorts: [Number]
    },
    timing: {
      type: Number,
      min: 0,
      max: 5,
      default: 3
    },
    depth: {
      type: Number,
      min: 1,
      max: 5,
      default: 2
    },
    maxConcurrent: {
      type: Number,
      default: 10
    },
    timeout: {
      type: Number,
      default: 3600000
    },
    features: {
      serviceDetection: { type: Boolean, default: true },
      osDetection: { type: Boolean, default: true },
      vulnerabilityCheck: { type: Boolean, default: true },
      complianceCheck: { type: Boolean, default: false },
      webCrawling: { type: Boolean, default: false },
      sslAnalysis: { type: Boolean, default: true }
    },
    authentication: {
      enabled: { type: Boolean, default: false },
      credentialTypes: [String],
      fallbackToUnauthenticated: { type: Boolean, default: true }
    }
  },

  // Security Checks
  checks: [checkDefinitionSchema],
  enabledCheckCategories: [{
    type: String,
    enum: [
      'INJECTION', 'XSS', 'BROKEN_AUTH', 'SENSITIVE_DATA', 'XXE',
      'BROKEN_ACCESS', 'SECURITY_MISCONFIG', 'INSECURE_DESERIALIZATION',
      'VULNERABLE_COMPONENTS', 'INSUFFICIENT_LOGGING', 'SSRF',
      'SSL_TLS', 'CONFIGURATION', 'COMPLIANCE', 'ALL'
    ]
  }],
  disabledChecks: [String],
  customChecks: [{
    checkId: String,
    template: String,
    script: String,
    severity: String
  }],

  // Exclusions
  exclusions: [exclusionRuleSchema],
  globalExclusions: {
    cves: [String],
    cwes: [String],
    plugins: [String],
    paths: [String],
    ports: [Number]
  },

  // Thresholds & Gates
  thresholds: [thresholdSchema],
  qualityGate: {
    enabled: { type: Boolean, default: false },
    mustPass: { type: Boolean, default: false },
    conditions: [{
      metric: String,
      operator: String,
      value: Number
    }],
    action: {
      type: String,
      enum: ['WARN', 'FAIL', 'BLOCK_DEPLOYMENT']
    }
  },

  // SLA Configuration
  slaConfig: {
    enabled: { type: Boolean, default: true },
    definitions: [slaDefinitionSchema],
    defaultSla: {
      critical: { type: Number, default: 24 },
      high: { type: Number, default: 72 },
      medium: { type: Number, default: 168 },
      low: { type: Number, default: 720 }
    },
    businessHoursOnly: { type: Boolean, default: false },
    timezone: { type: String, default: 'UTC' }
  },

  // Compliance Mapping
  compliance: {
    frameworks: [{
      frameworkId: String,
      name: String,
      version: String,
      enabled: { type: Boolean, default: true },
      requirements: [{
        requirementId: String,
        name: String,
        description: String,
        checks: [String],
        weight: Number
      }]
    }],
    reportingLevel: {
      type: String,
      enum: ['BASIC', 'DETAILED', 'COMPREHENSIVE'],
      default: 'DETAILED'
    }
  },

  // Notification Configuration
  notifications: {
    onScanComplete: {
      enabled: { type: Boolean, default: true },
      channels: [{
        type: { type: String, enum: ['EMAIL', 'SLACK', 'TEAMS', 'WEBHOOK'] },
        target: String,
        conditions: mongoose.Schema.Types.Mixed
      }]
    },
    onCriticalFound: {
      enabled: { type: Boolean, default: true },
      channels: [{
        type: { type: String, enum: ['EMAIL', 'SLACK', 'TEAMS', 'WEBHOOK', 'PAGERDUTY'] },
        target: String
      }],
      escalationDelay: Number
    },
    onThresholdBreach: {
      enabled: { type: Boolean, default: true },
      channels: [{
        type: { type: String, enum: ['EMAIL', 'SLACK', 'TEAMS', 'WEBHOOK'] },
        target: String
      }]
    }
  },

  // Reporting
  reporting: {
    autoGenerate: { type: Boolean, default: true },
    formats: [{ type: String, enum: ['PDF', 'HTML', 'JSON', 'CSV'] }],
    template: String,
    distribution: [{
      method: { type: String, enum: ['EMAIL', 'STORAGE', 'API'] },
      target: String
    }],
    includeSections: [String]
  },

  // Integration Settings
  integrations: {
    ticketing: {
      enabled: { type: Boolean, default: false },
      system: { type: String, enum: ['JIRA', 'SERVICENOW', 'GITHUB', 'GITLAB'] },
      autoCreate: { type: Boolean, default: false },
      severityThreshold: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
      projectKey: String,
      issueType: String,
      assignmentRules: mongoose.Schema.Types.Mixed
    },
    cicd: {
      enabled: { type: Boolean, default: false },
      failOnThreshold: { type: Boolean, default: false },
      thresholds: mongoose.Schema.Types.Mixed
    }
  },

  // Status
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'DRAFT', 'DEPRECATED'],
    default: 'ACTIVE',
    index: true
  },
  statusHistory: [{
    status: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    reason: String
  }],

  // Version Control
  versionHistory: [{
    version: String,
    changes: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now }
  }],
  parentPolicyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VulnScanPolicy'
  },

  // Usage Stats
  usageStats: {
    totalScans: { type: Number, default: 0 },
    lastUsed: Date,
    assignedAssets: { type: Number, default: 0 }
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
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isSystem: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'vulnscan_policies'
});

// Indexes
scanPolicySchema.index({ organizationId: 1, status: 1 });
scanPolicySchema.index({ organizationId: 1, isDefault: 1 });
scanPolicySchema.index({ policyType: 1 });
scanPolicySchema.index({ tags: 1 });

// Virtual for is editable
scanPolicySchema.virtual('isEditable').get(function() {
  return !this.isSystem && this.status !== 'DEPRECATED';
});

// Method to create new version
scanPolicySchema.methods.createVersion = function(changes, userId) {
  const versionParts = this.version.split('.');
  versionParts[2] = parseInt(versionParts[2]) + 1;
  this.version = versionParts.join('.');
  
  this.versionHistory.push({
    version: this.version,
    changes,
    changedBy: userId,
    changedAt: new Date()
  });
  
  this.lastModifiedBy = userId;
  
  return this.save();
};

// Method to get effective SLA
scanPolicySchema.methods.getEffectiveSla = function(severity, environment = 'ALL') {
  // Check specific definition first
  const specific = this.slaConfig.definitions.find(
    d => d.severity === severity && (d.environment === environment || d.environment === 'ALL')
  );
  
  if (specific) return specific.remediationHours;
  
  // Fall back to defaults
  const severityKey = severity.toLowerCase();
  return this.slaConfig.defaultSla[severityKey] || 720;
};

// Method to evaluate quality gate
scanPolicySchema.methods.evaluateQualityGate = function(scanResults) {
  if (!this.qualityGate?.enabled) return { passed: true, results: [] };
  
  const results = [];
  let passed = true;
  
  for (const condition of this.qualityGate.conditions) {
    const value = scanResults[condition.metric];
    let conditionPassed = false;
    
    switch (condition.operator) {
      case 'GREATER_THAN':
        conditionPassed = value > condition.value;
        break;
      case 'LESS_THAN':
        conditionPassed = value < condition.value;
        break;
      case 'EQUALS':
        conditionPassed = value === condition.value;
        break;
      case 'GREATER_THAN_OR_EQUAL':
        conditionPassed = value >= condition.value;
        break;
      case 'LESS_THAN_OR_EQUAL':
        conditionPassed = value <= condition.value;
        break;
    }
    
    results.push({
      metric: condition.metric,
      expected: `${condition.operator} ${condition.value}`,
      actual: value,
      passed: conditionPassed
    });
    
    if (!conditionPassed) passed = false;
  }
  
  return { passed, results, action: !passed ? this.qualityGate.action : null };
};

// Pre-save hook
scanPolicySchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date()
    });
  }
  next();
});

// Static method for default policy
scanPolicySchema.statics.getDefaultPolicy = async function(organizationId) {
  return this.findOne({
    organizationId,
    isDefault: true,
    status: 'ACTIVE'
  });
};

module.exports = mongoose.model('VulnScanPolicy', scanPolicySchema);
