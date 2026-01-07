/**
 * Patch Model
 * Security Patch Management & Deployment
 * 
 * Manages security patches with deployment tracking,
 * testing workflows, and rollback capabilities
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const patchSchema = new Schema({
  // Identification
  patchId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  
  // Patch Information
  name: { type: String, required: true },
  description: String,
  vendor: { type: String, required: true },
  product: { type: String, required: true },
  version: String,
  
  // Patch Identifiers
  kbNumber: String, // Microsoft KB number
  bulletinId: String, // Security bulletin ID
  patchNumber: String, // Vendor-specific patch number
  releaseId: String,
  
  // Patch Type
  patchType: {
    type: String,
    required: true,
    enum: [
      'security',
      'critical',
      'important',
      'moderate',
      'low',
      'feature',
      'bugfix',
      'update',
      'service_pack',
      'rollup',
      'hotfix'
    ],
    default: 'security'
  },
  
  // Severity
  severity: {
    type: String,
    required: true,
    enum: ['critical', 'high', 'medium', 'low'],
    index: true
  },
  
  // CVE Addressed
  cveIds: [String],
  vulnerabilities: [{ type: Schema.Types.ObjectId, ref: 'Vulnerability' }],
  
  // Release Information
  releaseDate: { type: Date, required: true },
  discoveryDate: Date,
  supersedes: [String], // Previous patches superseded by this one
  supersededBy: String, // Newer patch that supersedes this one
  
  // Applicability
  applicability: {
    operatingSystems: [{
      name: String,
      versions: [String],
      architectures: [{ type: String, enum: ['x86', 'x64', 'arm', 'arm64'] }]
    }],
    products: [{
      name: String,
      versions: [String]
    }],
    conditions: [String], // Conditions under which patch applies
    exclusions: [String]  // Systems excluded from patch
  },
  
  // Affected Assets
  applicableAssets: [{
    asset: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    applicable: { type: Boolean, default: true },
    reason: String,
    assessedDate: Date
  }],
  applicableAssetsCount: { type: Number, default: 0 },
  
  // Prerequisites & Dependencies
  prerequisites: [{
    type: { type: String, enum: ['patch', 'software', 'configuration', 'other'] },
    name: String,
    version: String,
    required: { type: Boolean, default: true },
    installed: { type: Boolean, default: false }
  }],
  dependencies: [String],
  conflicts: [String], // Known conflicting patches or software
  
  // Testing Status
  testing: {
    status: {
      type: String,
      enum: ['not_tested', 'in_testing', 'test_passed', 'test_failed', 'approved', 'rejected'],
      default: 'not_tested',
      index: true
    },
    testEnvironment: String,
    testedBy: String,
    testDate: Date,
    testResults: {
      functionalityTest: { type: String, enum: ['pass', 'fail', 'not_tested'], default: 'not_tested' },
      compatibilityTest: { type: String, enum: ['pass', 'fail', 'not_tested'], default: 'not_tested' },
      performanceTest: { type: String, enum: ['pass', 'fail', 'not_tested'], default: 'not_tested' },
      securityTest: { type: String, enum: ['pass', 'fail', 'not_tested'], default: 'not_tested' }
    },
    issues: [String],
    notes: String
  },
  
  // Deployment
  deployment: {
    status: {
      type: String,
      required: true,
      enum: [
        'available',
        'planned',
        'scheduled',
        'in_progress',
        'deployed',
        'partially_deployed',
        'failed',
        'rolled_back',
        'cancelled'
      ],
      default: 'available',
      index: true
    },
    method: {
      type: String,
      enum: ['manual', 'automated', 'wsus', 'sccm', 'ansible', 'puppet', 'chef', 'script', 'package_manager'],
      default: 'manual'
    },
    priority: {
      type: String,
      enum: ['emergency', 'urgent', 'normal', 'low'],
      default: 'normal'
    },
    scheduledDate: Date,
    startDate: Date,
    completedDate: Date,
    deployedBy: String,
    approvedBy: String,
    approvalDate: Date
  },
  
  // Target Assets
  targetAssets: [{
    asset: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    status: {
      type: String,
      enum: ['pending', 'downloading', 'installing', 'installed', 'failed', 'skipped'],
      default: 'pending'
    },
    installDate: Date,
    installedBy: String,
    attempts: { type: Number, default: 0 },
    lastAttempt: Date,
    error: String,
    rollbackAvailable: { type: Boolean, default: true }
  }],
  
  // Deployment Statistics
  deploymentStats: {
    total: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    installing: { type: Number, default: 0 },
    installed: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    skipped: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 }
  },
  
  // Installation Details
  installation: {
    installer: String,
    installerUrl: String,
    installerSize: Number, // bytes
    installerHash: {
      md5: String,
      sha1: String,
      sha256: String
    },
    installCommand: String,
    silentInstallArgs: [String],
    uninstallCommand: String,
    estimatedDuration: Number, // minutes
    diskSpaceRequired: Number // MB
  },
  
  // Impact Assessment
  impact: {
    requiresReboot: { type: Boolean, default: false },
    requiresDowntime: { type: Boolean, default: false },
    estimatedDowntime: Number, // minutes
    affectsServices: [String],
    businessImpact: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low', 'none'],
      default: 'low'
    },
    riskLevel: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'low'
    },
    userImpact: String
  },
  
  // Rollback Plan
  rollback: {
    available: { type: Boolean, default: true },
    automatic: { type: Boolean, default: false },
    procedure: String,
    tested: { type: Boolean, default: false },
    backupRequired: { type: Boolean, default: true },
    rollbackCommand: String
  },
  
  // Compliance
  compliance: {
    required: { type: Boolean, default: false },
    frameworks: [{ type: String, enum: ['pci-dss', 'hipaa', 'soc2', 'iso27001', 'nist', 'cis'] }],
    dueDate: Date,
    mandatoryBy: Date
  },
  
  // SLA & Timelines
  sla: {
    critical: { type: Number, default: 24 }, // hours
    high: { type: Number, default: 72 },
    medium: { type: Number, default: 168 }, // 1 week
    low: { type: Number, default: 720 } // 30 days
  },
  dueDate: Date,
  
  // Notifications
  notifications: {
    sent: { type: Boolean, default: false },
    sentDate: Date,
    recipients: [String],
    acknowledgedBy: [String]
  },
  
  // Known Issues
  knownIssues: [{
    title: String,
    description: String,
    severity: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
    workaround: String,
    affectedVersions: [String],
    resolved: { type: Boolean, default: false }
  }],
  
  // References & Documentation
  references: [{
    type: { type: String, enum: ['vendor_advisory', 'kb_article', 'release_notes', 'installation_guide', 'other'] },
    title: String,
    url: { type: String, required: true },
    date: Date
  }],
  documentationUrl: String,
  releaseNotesUrl: String,
  
  // Change Management
  changeRequest: {
    ticketId: String,
    system: String,
    status: String,
    approver: String,
    approvalDate: Date
  },
  
  // History
  history: [{
    action: {
      type: String,
      enum: ['created', 'tested', 'approved', 'scheduled', 'deployed', 'failed', 'rolled_back', 'superseded']
    },
    user: String,
    date: { type: Date, default: Date.now },
    notes: String,
    changes: { type: Map, of: Schema.Types.Mixed }
  }],
  
  // Tags & Labels
  tags: [String],
  labels: { type: Map, of: String },
  
  // Notes
  notes: [{
    author: String,
    content: String,
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Metadata
  metadata: { type: Map, of: Schema.Types.Mixed }
}, {
  timestamps: true,
  collection: 'patches'
});

// Indexes
patchSchema.index({ patchId: 1 });
patchSchema.index({ severity: 1 });
patchSchema.index({ 'testing.status': 1 });
patchSchema.index({ 'deployment.status': 1 });
patchSchema.index({ cveIds: 1 });
patchSchema.index({ releaseDate: -1 });
patchSchema.index({ dueDate: 1 });
patchSchema.index({ tags: 1 });

// Virtual for age (days since release)
patchSchema.virtual('age').get(function() {
  if (!this.releaseDate) return 0;
  const now = new Date();
  const diff = now - this.releaseDate;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Virtual for is overdue
patchSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate) return false;
  return new Date() > this.dueDate && this.deployment.status !== 'deployed';
});

// Virtual for deployment progress
patchSchema.virtual('deploymentProgress').get(function() {
  if (this.deploymentStats.total === 0) return 0;
  return Math.round((this.deploymentStats.installed / this.deploymentStats.total) * 100);
});

// Method: Deploy to assets
patchSchema.methods.deployToAssets = async function(assetIds, deployedBy) {
  const Asset = mongoose.model('Asset');
  
  for (const assetId of assetIds) {
    const asset = await Asset.findById(assetId);
    if (asset) {
      this.targetAssets.push({
        asset: assetId,
        status: 'pending'
      });
    }
  }
  
  this.deployment.status = 'scheduled';
  this.deployment.deployedBy = deployedBy;
  this.updateDeploymentStats();
  
  this.history.push({
    action: 'scheduled',
    user: deployedBy,
    date: new Date(),
    notes: `Scheduled deployment to ${assetIds.length} assets`
  });
  
  await this.save();
};

// Method: Update deployment stats
patchSchema.methods.updateDeploymentStats = function() {
  const stats = {
    total: this.targetAssets.length,
    pending: 0,
    installing: 0,
    installed: 0,
    failed: 0,
    skipped: 0
  };
  
  this.targetAssets.forEach(target => {
    stats[target.status]++;
  });
  
  stats.successRate = stats.total > 0 
    ? Math.round((stats.installed / stats.total) * 100) 
    : 0;
  
  this.deploymentStats = stats;
  
  // Update overall deployment status
  if (stats.installed === stats.total && stats.total > 0) {
    this.deployment.status = 'deployed';
    this.deployment.completedDate = new Date();
  } else if (stats.installed > 0) {
    this.deployment.status = 'partially_deployed';
  }
};

// Method: Mark asset deployment status
patchSchema.methods.updateAssetDeployment = function(assetId, status, error = null) {
  const targetIndex = this.targetAssets.findIndex(
    t => t.asset.toString() === assetId.toString()
  );
  
  if (targetIndex >= 0) {
    this.targetAssets[targetIndex].status = status;
    this.targetAssets[targetIndex].lastAttempt = new Date();
    this.targetAssets[targetIndex].attempts++;
    
    if (status === 'installed') {
      this.targetAssets[targetIndex].installDate = new Date();
    }
    
    if (error) {
      this.targetAssets[targetIndex].error = error;
    }
    
    this.updateDeploymentStats();
  }
};

// Method: Rollback deployment
patchSchema.methods.rollbackDeployment = async function(userId, reason) {
  if (!this.rollback.available) {
    throw new Error('Rollback not available for this patch');
  }
  
  this.deployment.status = 'rolled_back';
  
  // Reset target assets
  this.targetAssets.forEach(target => {
    if (target.status === 'installed') {
      target.status = 'pending';
      target.installDate = null;
    }
  });
  
  this.updateDeploymentStats();
  
  this.history.push({
    action: 'rolled_back',
    user: userId,
    date: new Date(),
    notes: reason
  });
  
  await this.save();
};

// Method: Test patch
patchSchema.methods.testPatch = function(testData) {
  this.testing.status = testData.status;
  this.testing.testEnvironment = testData.environment;
  this.testing.testedBy = testData.testedBy;
  this.testing.testDate = new Date();
  this.testing.testResults = testData.results;
  this.testing.notes = testData.notes;
  
  if (testData.issues) {
    this.testing.issues = testData.issues;
  }
  
  this.history.push({
    action: 'tested',
    user: testData.testedBy,
    date: new Date(),
    notes: `Test ${testData.status}`
  });
};

// Method: Approve patch
patchSchema.methods.approve = function(userId) {
  this.testing.status = 'approved';
  this.deployment.approvedBy = userId;
  this.deployment.approvalDate = new Date();
  
  this.history.push({
    action: 'approved',
    user: userId,
    date: new Date(),
    notes: 'Patch approved for deployment'
  });
};

// Static: Find critical patches
patchSchema.statics.findCritical = function() {
  return this.find({ 
    severity: 'critical',
    'deployment.status': { $nin: ['deployed', 'cancelled'] }
  }).sort({ releaseDate: 1 });
};

// Static: Find overdue patches
patchSchema.statics.findOverdue = function() {
  return this.find({
    dueDate: { $lt: new Date() },
    'deployment.status': { $nin: ['deployed', 'cancelled'] }
  }).sort({ dueDate: 1 });
};

// Static: Find patches by CVE
patchSchema.statics.findByCVE = function(cveId) {
  return this.find({ cveIds: cveId });
};

// Static: Get patch statistics
patchSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $facet: {
        bySeverity: [
          { $group: { _id: '$severity', count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ],
        byStatus: [
          { $group: { _id: '$deployment.status', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        byTestStatus: [
          { $group: { _id: '$testing.status', count: { $sum: 1 } } }
        ],
        summary: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              deployed: { $sum: { $cond: [{ $eq: ['$deployment.status', 'deployed'] }, 1, 0] } },
              pending: { $sum: { $cond: [{ $in: ['$deployment.status', ['available', 'planned', 'scheduled']] }, 1, 0] } },
              failed: { $sum: { $cond: [{ $eq: ['$deployment.status', 'failed'] }, 1, 0] } }
            }
          }
        ]
      }
    }
  ]);
  
  return stats[0];
};

// Pre-save hook
patchSchema.pre('save', function(next) {
  // Update applicable assets count
  this.applicableAssetsCount = this.applicableAssets.length;
  
  // Calculate due date based on severity and SLA
  if (!this.dueDate && this.releaseDate) {
    const slaHours = this.sla[this.severity] || this.sla.medium;
    this.dueDate = new Date(this.releaseDate.getTime() + (slaHours * 60 * 60 * 1000));
  }
  
  next();
});

const Patch = mongoose.model('Patch', patchSchema);

module.exports = Patch;
