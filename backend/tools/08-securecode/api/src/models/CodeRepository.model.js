const mongoose = require('mongoose');

/**
 * CodeRepository Model
 * Tracks code repositories connected for security scanning
 */
const CodeRepositorySchema = new mongoose.Schema({
  // Repository identification
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  fullName: {
    type: String,  // e.g., 'owner/repo'
    required: true,
    unique: true
  },
  description: String,
  
  // Repository source
  provider: {
    type: String,
    enum: ['github', 'gitlab', 'bitbucket', 'azure-devops', 'local', 'upload'],
    required: true,
    index: true
  },
  
  // Repository details
  url: {
    type: String,
    required: true
  },
  cloneUrl: String,
  defaultBranch: {
    type: String,
    default: 'main'
  },
  
  // Authentication (encrypted)
  credentials: {
    type: {
      type: String,
      enum: ['token', 'ssh-key', 'app', 'oauth', 'none']
    },
    tokenRef: String,  // Reference to encrypted token in vault
    sshKeyRef: String
  },
  
  // Repository metadata
  language: {
    primary: String,
    all: [String]
  },
  size: Number,  // in KB
  visibility: {
    type: String,
    enum: ['public', 'private', 'internal'],
    default: 'private'
  },
  
  // Owner information
  owner: {
    id: String,
    username: String,
    type: {
      type: String,
      enum: ['user', 'organization']
    },
    avatarUrl: String
  },
  
  // Scan configuration
  scanConfig: {
    enabled: {
      type: Boolean,
      default: true
    },
    autoScan: {
      type: Boolean,
      default: true  // Auto-scan on push
    },
    branches: {
      include: [String],  // e.g., ['main', 'develop', 'release/*']
      exclude: [String]   // e.g., ['feature/*']
    },
    paths: {
      include: [String],  // e.g., ['src/**', 'lib/**']
      exclude: [String]   // e.g., ['test/**', 'docs/**', 'node_modules/**']
    },
    scanTypes: {
      sast: { type: Boolean, default: true },
      secrets: { type: Boolean, default: true },
      dependencies: { type: Boolean, default: true },
      iac: { type: Boolean, default: false },  // Infrastructure as Code
      containers: { type: Boolean, default: false }
    },
    severity: {
      minLevel: {
        type: String,
        enum: ['info', 'low', 'medium', 'high', 'critical'],
        default: 'low'
      },
      failOn: {
        type: String,
        enum: ['info', 'low', 'medium', 'high', 'critical', 'none'],
        default: 'high'
      }
    },
    customRules: [{
      ruleId: String,
      enabled: Boolean,
      severity: String
    }]
  },
  
  // Webhooks
  webhooks: {
    secret: String,  // Encrypted webhook secret
    events: [{
      type: String,
      enabled: Boolean
    }],
    lastDelivery: Date,
    deliveryStatus: String
  },
  
  // Statistics
  stats: {
    totalScans: { type: Number, default: 0 },
    lastScanDate: Date,
    lastScanStatus: {
      type: String,
      enum: ['success', 'failed', 'cancelled', 'in-progress']
    },
    issuesOpen: { type: Number, default: 0 },
    issuesResolved: { type: Number, default: 0 },
    issuesBySeveity: {
      critical: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
      info: { type: Number, default: 0 }
    },
    securityScore: {
      type: Number,
      min: 0,
      max: 100
    },
    trend: {
      type: String,
      enum: ['improving', 'stable', 'degrading']
    }
  },
  
  // Integration status
  integrations: {
    cicd: {
      enabled: Boolean,
      provider: String,  // github-actions, gitlab-ci, jenkins, etc.
      configPath: String
    },
    notifications: {
      slack: {
        enabled: Boolean,
        channel: String,
        webhookRef: String
      },
      email: {
        enabled: Boolean,
        recipients: [String]
      },
      jira: {
        enabled: Boolean,
        projectKey: String,
        issueType: String
      }
    }
  },
  
  // Metadata
  tags: [String],
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Sync status
  syncStatus: {
    lastSync: Date,
    status: {
      type: String,
      enum: ['synced', 'syncing', 'failed', 'pending']
    },
    error: String
  }
}, {
  timestamps: true,
  collection: 'securecode_repositories'
});

// Indexes for performance
CodeRepositorySchema.index({ provider: 1, 'owner.username': 1 });
CodeRepositorySchema.index({ 'stats.lastScanDate': -1 });
CodeRepositorySchema.index({ 'stats.securityScore': 1 });
CodeRepositorySchema.index({ tags: 1 });
CodeRepositorySchema.index({ 'scanConfig.enabled': 1 });

// Virtual for full repository URL
CodeRepositorySchema.virtual('fullUrl').get(function() {
  const providerUrls = {
    github: 'https://github.com',
    gitlab: 'https://gitlab.com',
    bitbucket: 'https://bitbucket.org',
    'azure-devops': 'https://dev.azure.com'
  };
  return `${providerUrls[this.provider] || ''}/${this.fullName}`;
});

// Method to check if branch should be scanned
CodeRepositorySchema.methods.shouldScanBranch = function(branchName) {
  const { include, exclude } = this.scanConfig.branches;
  
  // Check exclusions first
  if (exclude?.length) {
    for (const pattern of exclude) {
      if (matchPattern(branchName, pattern)) return false;
    }
  }
  
  // If no inclusions specified, include all
  if (!include?.length) return true;
  
  // Check inclusions
  for (const pattern of include) {
    if (matchPattern(branchName, pattern)) return true;
  }
  
  return false;
};

// Helper for glob-like pattern matching
function matchPattern(str, pattern) {
  const regexPattern = pattern
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(`^${regexPattern}$`).test(str);
}

// Static method to find repositories needing scan
CodeRepositorySchema.statics.findDueForScan = function(hoursThreshold = 24) {
  const threshold = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);
  return this.find({
    'scanConfig.enabled': true,
    'scanConfig.autoScan': true,
    $or: [
      { 'stats.lastScanDate': { $lt: threshold } },
      { 'stats.lastScanDate': null }
    ]
  });
};

module.exports = mongoose.model('CodeRepository', CodeRepositorySchema);
