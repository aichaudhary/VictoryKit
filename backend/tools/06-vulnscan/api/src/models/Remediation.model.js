/**
 * VulnScan - Remediation Model
 * Vulnerability remediation tracking with workflow and verification
 */

const mongoose = require('mongoose');

// Task Sub-schema
const remediationTaskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  taskType: {
    type: String,
    enum: ['PATCH', 'CONFIGURATION', 'UPGRADE', 'CODE_FIX', 'MITIGATION', 'DOCUMENTATION', 'VERIFICATION', 'OTHER'],
    required: true
  },
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  status: {
    type: String,
    enum: ['NOT_STARTED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'SKIPPED', 'CANCELLED'],
    default: 'NOT_STARTED'
  },
  assignee: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    email: String
  },
  dueDate: Date,
  completedAt: Date,
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  effort: {
    estimated: String,
    actual: String
  },
  blockedReason: String,
  dependencies: [{
    taskId: String,
    type: { type: String, enum: ['REQUIRES', 'BLOCKS'] }
  }],
  notes: String,
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: Date
  }],
  statusHistory: [{
    status: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    notes: String
  }]
}, { _id: true });

// Verification Sub-schema
const verificationSchema = new mongoose.Schema({
  verificationType: {
    type: String,
    enum: ['RESCAN', 'MANUAL_CHECK', 'AUTOMATED_TEST', 'PEER_REVIEW', 'CHANGE_VALIDATION'],
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED', 'PARTIAL'],
    default: 'PENDING'
  },
  verifiedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    method: String
  },
  verifiedAt: Date,
  scanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VulnScan'
  },
  evidence: {
    type: { type: String, enum: ['SCREENSHOT', 'LOG', 'SCAN_OUTPUT', 'DOCUMENT', 'OTHER'] },
    data: String,
    url: String,
    notes: String
  },
  result: {
    vulnerabilityStillPresent: Boolean,
    partiallyRemediated: Boolean,
    newIssuesFound: Boolean,
    newIssueDetails: String
  },
  scheduledDate: Date,
  attemptNumber: { type: Number, default: 1 },
  failureReason: String,
  notes: String
}, { _id: true });

// Timeline Event Sub-schema
const timelineEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: [
      'CREATED', 'ASSIGNED', 'STATUS_CHANGED', 'PRIORITY_CHANGED',
      'TASK_ADDED', 'TASK_COMPLETED', 'VERIFICATION_STARTED', 'VERIFICATION_COMPLETED',
      'SLA_WARNING', 'SLA_BREACH', 'ESCALATED', 'COMMENT_ADDED',
      'ATTACHMENT_ADDED', 'INTEGRATION_SYNC', 'REOPENED', 'CLOSED'
    ],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userName: String,
  description: String,
  details: mongoose.Schema.Types.Mixed,
  visibility: {
    type: String,
    enum: ['INTERNAL', 'PUBLIC'],
    default: 'INTERNAL'
  }
}, { _id: false });

// Remediation Schema
const remediationSchema = new mongoose.Schema({
  // Identifiers
  remediationId: {
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

  // Remediation Information
  title: {
    type: String,
    required: true
  },
  description: String,
  remediationType: {
    type: String,
    enum: ['VULNERABILITY', 'COMPLIANCE', 'CONFIGURATION', 'POLICY_VIOLATION', 'CUSTOM'],
    default: 'VULNERABILITY'
  },

  // Associated Vulnerability
  vulnerability: {
    vulnId: { type: mongoose.Schema.Types.ObjectId, ref: 'VulnScanVulnerability' },
    cve: String,
    title: String,
    severity: String,
    cvss: Number
  },
  vulnerabilities: [{
    vulnId: { type: mongoose.Schema.Types.ObjectId, ref: 'VulnScanVulnerability' },
    cve: String,
    severity: String
  }],

  // Affected Assets
  affectedAssets: [{
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'VulnScanAsset' },
    assetName: String,
    assetType: String,
    target: String,
    environment: String,
    criticality: String,
    instanceStatus: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'REMEDIATED', 'RISK_ACCEPTED', 'FALSE_POSITIVE']
    }
  }],
  affectedAssetCount: {
    type: Number,
    default: 0
  },

  // Remediation Plan
  plan: {
    approach: {
      type: String,
      enum: ['PATCH', 'UPGRADE', 'CONFIGURATION', 'CODE_FIX', 'REPLACEMENT', 'MITIGATION', 'RISK_ACCEPTANCE', 'CUSTOM']
    },
    solution: String,
    workaround: String,
    patchInfo: {
      vendor: String,
      patchId: String,
      patchUrl: String,
      releaseDate: Date,
      targetVersion: String
    },
    steps: [{
      order: Number,
      description: String,
      notes: String
    }],
    testingRequired: Boolean,
    testingNotes: String,
    rollbackPlan: String,
    requiresDowntime: Boolean,
    estimatedDowntime: String,
    changeWindow: {
      required: Boolean,
      windowId: String,
      scheduledDate: Date
    }
  },

  // Tasks
  tasks: [remediationTaskSchema],
  tasksSummary: {
    total: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    inProgress: { type: Number, default: 0 },
    blocked: { type: Number, default: 0 }
  },

  // Effort & Resources
  effort: {
    estimated: {
      hours: Number,
      complexity: { type: String, enum: ['TRIVIAL', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'] },
      teamSize: Number
    },
    actual: {
      hours: Number,
      startDate: Date,
      endDate: Date
    }
  },
  resources: [{
    type: { type: String, enum: ['PERSON', 'TOOL', 'LICENSE', 'BUDGET'] },
    name: String,
    quantity: Number,
    cost: Number,
    notes: String
  }],
  totalCost: Number,

  // Priority & Risk
  priority: {
    type: String,
    enum: ['P1_CRITICAL', 'P2_HIGH', 'P3_MEDIUM', 'P4_LOW'],
    required: true,
    index: true
  },
  priorityScore: {
    type: Number,
    min: 0,
    max: 100
  },
  riskAcceptance: {
    accepted: { type: Boolean, default: false },
    acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    acceptedAt: Date,
    reason: String,
    expiresAt: Date,
    reviewDate: Date,
    approvalChain: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: String,
      role: String,
      decision: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'] },
      decidedAt: Date,
      comments: String
    }]
  },

  // Assignment
  assignee: {
    primary: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: String,
      email: String,
      assignedAt: Date
    },
    team: String,
    additionalAssignees: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: String,
      role: String
    }]
  },
  escalationPath: [{
    level: Number,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    triggerAfterHours: Number
  }],

  // SLA & Dates
  sla: {
    dueDate: {
      type: Date,
      index: true
    },
    slaPolicy: String,
    breached: { type: Boolean, default: false },
    breachedAt: Date,
    warningThresholdHours: { type: Number, default: 24 },
    warningNotificationSent: Boolean,
    extensionRequested: Boolean,
    extensionApproved: Boolean,
    extensionReason: String,
    newDueDate: Date,
    extensionHistory: [{
      requestedAt: Date,
      requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      previousDueDate: Date,
      newDueDate: Date,
      reason: String,
      approved: Boolean,
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }]
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  targetCompletionDate: Date,

  // Status
  status: {
    type: String,
    enum: [
      'OPEN',
      'ASSIGNED',
      'IN_PROGRESS',
      'BLOCKED',
      'PENDING_VERIFICATION',
      'VERIFICATION_FAILED',
      'REMEDIATED',
      'RISK_ACCEPTED',
      'FALSE_POSITIVE',
      'CLOSED',
      'REOPENED'
    ],
    default: 'OPEN',
    index: true
  },
  statusHistory: [{
    status: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    reason: String,
    notes: String
  }],

  // Verification
  verifications: [verificationSchema],
  lastVerification: {
    status: String,
    date: Date,
    method: String
  },
  verificationRequired: {
    type: Boolean,
    default: true
  },
  autoVerification: {
    enabled: { type: Boolean, default: false },
    scheduleRescan: Boolean,
    daysAfterRemediation: { type: Number, default: 3 }
  },

  // Completion
  completedAt: Date,
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolutionNotes: String,
  lessonsLearned: String,

  // Timeline
  timeline: [timelineEventSchema],

  // Comments
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    text: String,
    type: { type: String, enum: ['NOTE', 'UPDATE', 'QUESTION', 'ESCALATION', 'RESOLUTION'] },
    visibility: { type: String, enum: ['INTERNAL', 'PUBLIC'], default: 'INTERNAL' },
    createdAt: { type: Date, default: Date.now },
    editedAt: Date,
    attachments: [{
      filename: String,
      url: String,
      mimeType: String
    }]
  }],

  // Integration
  integrationRefs: {
    jiraTicket: {
      key: String,
      url: String,
      status: String,
      lastSync: Date
    },
    serviceNowIncident: {
      number: String,
      url: String,
      state: String,
      lastSync: Date
    },
    githubIssue: {
      number: Number,
      url: String,
      state: String,
      lastSync: Date
    },
    customTicket: {
      id: String,
      system: String,
      url: String
    }
  },
  syncEnabled: {
    type: Boolean,
    default: false
  },

  // Source
  source: {
    type: { type: String, enum: ['SCAN', 'MANUAL', 'IMPORT', 'INTEGRATION'] },
    scanId: { type: mongoose.Schema.Types.ObjectId, ref: 'VulnScan' },
    reference: String
  },

  // Tags & Labels
  tags: [String],
  labels: [{
    key: String,
    value: String,
    color: String
  }],

  // Attachments
  attachments: [{
    filename: String,
    url: String,
    mimeType: String,
    size: Number,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now },
    description: String
  }],

  // Watchers
  watchers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: String,
    notificationPrefs: {
      statusChanges: Boolean,
      comments: Boolean,
      slaWarnings: Boolean
    }
  }],

  // Metrics
  metrics: {
    timeToRemediation: Number,
    timeToVerification: Number,
    reopenCount: { type: Number, default: 0 },
    verificationAttempts: { type: Number, default: 0 }
  },

  // Metadata
  metadata: mongoose.Schema.Types.Mixed,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'vulnscan_remediations'
});

// Indexes
remediationSchema.index({ organizationId: 1, status: 1, 'sla.dueDate': 1 });
remediationSchema.index({ organizationId: 1, priority: 1 });
remediationSchema.index({ 'vulnerability.vulnId': 1 });
remediationSchema.index({ 'affectedAssets.assetId': 1 });
remediationSchema.index({ 'assignee.primary.userId': 1 });
remediationSchema.index({ 'sla.breached': 1 });
remediationSchema.index({ tags: 1 });

// Text search
remediationSchema.index({
  title: 'text',
  description: 'text',
  'plan.solution': 'text'
});

// Virtual for is overdue
remediationSchema.virtual('isOverdue').get(function() {
  if (!this.sla?.dueDate) return false;
  if (['REMEDIATED', 'RISK_ACCEPTED', 'FALSE_POSITIVE', 'CLOSED'].includes(this.status)) return false;
  return new Date() > this.sla.dueDate;
});

// Virtual for hours remaining
remediationSchema.virtual('hoursRemaining').get(function() {
  if (!this.sla?.dueDate) return null;
  return Math.round((new Date(this.sla.dueDate) - new Date()) / (1000 * 60 * 60));
});

// Virtual for completion percentage
remediationSchema.virtual('completionPercent').get(function() {
  if (!this.tasksSummary?.total) return 0;
  return Math.round((this.tasksSummary.completed / this.tasksSummary.total) * 100);
});

// Method to update status with history
remediationSchema.methods.updateStatus = function(newStatus, userId, reason, notes) {
  const previousStatus = this.status;
  this.status = newStatus;
  
  this.statusHistory.push({
    status: newStatus,
    changedBy: userId,
    changedAt: new Date(),
    reason,
    notes
  });
  
  this.timeline.push({
    eventType: 'STATUS_CHANGED',
    timestamp: new Date(),
    userId,
    description: `Status changed from ${previousStatus} to ${newStatus}`,
    details: { previousStatus, newStatus, reason }
  });
  
  if (newStatus === 'REMEDIATED' || newStatus === 'CLOSED') {
    this.completedAt = new Date();
    this.completedBy = userId;
    
    // Calculate time to remediation
    this.metrics.timeToRemediation = Math.round(
      (this.completedAt - this.createdAt) / (1000 * 60 * 60)
    );
  }
  
  if (newStatus === 'REOPENED') {
    this.metrics.reopenCount += 1;
    this.completedAt = null;
    this.completedBy = null;
  }
  
  return this.save();
};

// Method to add task
remediationSchema.methods.addTask = function(taskData) {
  this.tasks.push(taskData);
  this.updateTasksSummary();
  
  this.timeline.push({
    eventType: 'TASK_ADDED',
    timestamp: new Date(),
    description: `Task added: ${taskData.title}`,
    details: { taskId: taskData.taskId }
  });
  
  return this.save();
};

// Method to update tasks summary
remediationSchema.methods.updateTasksSummary = function() {
  this.tasksSummary = {
    total: this.tasks.length,
    completed: this.tasks.filter(t => t.status === 'COMPLETED').length,
    inProgress: this.tasks.filter(t => t.status === 'IN_PROGRESS').length,
    blocked: this.tasks.filter(t => t.status === 'BLOCKED').length
  };
};

// Method to add verification
remediationSchema.methods.addVerification = function(verificationData) {
  this.verifications.push(verificationData);
  this.metrics.verificationAttempts += 1;
  
  this.lastVerification = {
    status: verificationData.status,
    date: new Date(),
    method: verificationData.verificationType
  };
  
  this.timeline.push({
    eventType: verificationData.status === 'PENDING' ? 'VERIFICATION_STARTED' : 'VERIFICATION_COMPLETED',
    timestamp: new Date(),
    userId: verificationData.verifiedBy?.userId,
    description: `Verification ${verificationData.status.toLowerCase()}`,
    details: { verificationType: verificationData.verificationType, status: verificationData.status }
  });
  
  return this.save();
};

// Method to check and update SLA breach
remediationSchema.methods.checkSlaBreach = function() {
  if (!this.sla?.dueDate || this.sla.breached) return false;
  
  if (new Date() > this.sla.dueDate) {
    this.sla.breached = true;
    this.sla.breachedAt = new Date();
    
    this.timeline.push({
      eventType: 'SLA_BREACH',
      timestamp: new Date(),
      description: 'SLA deadline has been breached'
    });
    
    return true;
  }
  
  return false;
};

// Pre-save hook
remediationSchema.pre('save', function(next) {
  this.updateTasksSummary();
  this.affectedAssetCount = this.affectedAssets?.length || 0;
  this.checkSlaBreach();
  next();
});

// Static method for overdue remediations
remediationSchema.statics.getOverdue = async function(organizationId) {
  return this.find({
    organizationId,
    status: { $nin: ['REMEDIATED', 'RISK_ACCEPTED', 'FALSE_POSITIVE', 'CLOSED'] },
    'sla.dueDate': { $lt: new Date() },
    isActive: true
  }).sort({ 'sla.dueDate': 1 });
};

// Static method for remediation metrics
remediationSchema.statics.getMetrics = async function(organizationId, dateRange = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - dateRange);
  
  return this.aggregate([
    {
      $match: {
        organizationId: new mongoose.Types.ObjectId(organizationId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'REMEDIATED'] }, 1, 0] }
        },
        avgTimeToRemediation: { $avg: '$metrics.timeToRemediation' },
        slaBreaches: {
          $sum: { $cond: ['$sla.breached', 1, 0] }
        },
        byPriority: {
          $push: '$priority'
        }
      }
    }
  ]);
};

module.exports = mongoose.model('VulnScanRemediation', remediationSchema);
