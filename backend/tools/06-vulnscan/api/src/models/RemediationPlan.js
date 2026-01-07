/**
 * RemediationPlan Model
 * Vulnerability Remediation Planning & Tracking
 * 
 * Manages remediation workflows with task assignment,
 * progress tracking, and verification
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const actionSchema = new Schema({
  actionId: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  type: {
    type: String,
    enum: ['patch', 'configuration', 'update', 'upgrade', 'workaround', 'mitigation', 'removal', 'isolation', 'other'],
    default: 'patch'
  },
  
  // Order & Dependencies
  order: { type: Number, required: true },
  dependencies: [String], // Action IDs that must be completed first
  blockedBy: [String],
  
  // Assignment
  assignedTo: String,
  assignedDate: Date,
  team: String,
  
  // Status & Progress
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'blocked', 'completed', 'verified', 'failed', 'cancelled'],
    default: 'pending'
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  
  // Timing
  estimatedEffort: Number, // hours
  actualEffort: Number,
  startDate: Date,
  targetDate: Date,
  completedDate: Date,
  
  // Affected Assets
  targetAssets: [{ type: Schema.Types.ObjectId, ref: 'Asset' }],
  completedAssets: [{ type: Schema.Types.ObjectId, ref: 'Asset' }],
  
  // Verification
  verification: {
    required: { type: Boolean, default: true },
    method: String,
    verifiedBy: String,
    verifiedDate: Date,
    passed: Boolean,
    notes: String
  },
  
  // Impact
  requiresDowntime: { type: Boolean, default: false },
  estimatedDowntime: Number, // minutes
  requiresReboot: { type: Boolean, default: false },
  
  // Results
  result: {
    success: Boolean,
    outcome: String,
    issuesEncountered: [String],
    lessonsLearned: String
  },
  
  // Documentation
  procedure: String,
  references: [String],
  
  notes: String
}, { _id: true });

const remediationPlanSchema = new Schema({
  // Identification
  planId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  name: { type: String, required: true },
  description: String,
  
  // Priority & Urgency
  priority: {
    type: String,
    required: true,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium',
    index: true
  },
  urgency: {
    type: String,
    enum: ['immediate', 'urgent', 'normal', 'low'],
    default: 'normal'
  },
  
  // Related Vulnerabilities
  vulnerabilities: [{
    vulnerability: { type: Schema.Types.ObjectId, ref: 'Vulnerability', required: true },
    cveId: String,
    severity: String,
    affectedAssetsCount: Number,
    threatScore: Number,
    exploitable: Boolean
  }],
  vulnerabilitiesCount: { type: Number, default: 0 },
  
  // Affected Assets
  affectedAssets: [{
    asset: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    criticality: String,
    vulnerabilitiesCount: Number,
    remediationStatus: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'verified', 'failed'],
      default: 'pending'
    },
    completedActions: Number,
    totalActions: Number
  }],
  affectedAssetsCount: { type: Number, default: 0 },
  
  // Risk Assessment
  risk: {
    currentRiskScore: { type: Number, min: 0, max: 100 },
    residualRiskScore: { type: Number, min: 0, max: 100 },
    riskReduction: { type: Number, default: 0 },
    businessImpact: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low', 'none'],
      default: 'medium'
    },
    exploitProbability: {
      type: String,
      enum: ['very_high', 'high', 'medium', 'low', 'very_low'],
      default: 'medium'
    }
  },
  
  // Remediation Strategy
  strategy: {
    approach: {
      type: String,
      enum: ['patch', 'workaround', 'configuration', 'upgrade', 'compensating_controls', 'accept_risk', 'mixed'],
      default: 'patch'
    },
    methodology: String,
    phased: { type: Boolean, default: false },
    phases: [{
      name: String,
      description: String,
      targetDate: Date,
      actions: [String] // Action IDs
    }]
  },
  
  // Actions
  actions: [actionSchema],
  totalActions: { type: Number, default: 0 },
  completedActions: { type: Number, default: 0 },
  
  // Resources
  resources: {
    team: [{
      userId: String,
      name: String,
      role: String,
      allocation: Number // percentage
    }],
    budget: {
      estimated: Number,
      actual: Number,
      currency: { type: String, default: 'USD' }
    },
    tools: [String],
    externalVendors: [{
      name: String,
      service: String,
      contact: String
    }]
  },
  
  // Timeline
  timeline: {
    created: { type: Date, default: Date.now },
    planned: Date,
    started: Date,
    targetCompletion: Date,
    actualCompletion: Date,
    duration: Number, // hours
    estimatedDuration: Number
  },
  
  // Status
  status: {
    type: String,
    required: true,
    enum: [
      'draft',
      'under_review',
      'approved',
      'scheduled',
      'in_progress',
      'on_hold',
      'blocked',
      'completed',
      'verified',
      'closed',
      'cancelled'
    ],
    default: 'draft',
    index: true
  },
  
  // Progress Tracking
  progress: {
    overall: { type: Number, default: 0, min: 0, max: 100 },
    assetProgress: { type: Number, default: 0 },
    actionProgress: { type: Number, default: 0 },
    currentPhase: String,
    milestones: [{
      name: String,
      targetDate: Date,
      completedDate: Date,
      status: { type: String, enum: ['pending', 'completed', 'missed'] }
    }]
  },
  
  // Approval Workflow
  approval: {
    required: { type: Boolean, default: true },
    requestedBy: String,
    requestDate: Date,
    approvers: [{
      userId: String,
      name: String,
      role: String,
      approved: Boolean,
      approvalDate: Date,
      comments: String
    }],
    finalApprover: String,
    finalApprovalDate: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'not_required'],
      default: 'pending'
    }
  },
  
  // Change Management
  changeManagement: {
    required: { type: Boolean, default: false },
    changeTicketId: String,
    changeRequestSystem: String,
    changeWindow: {
      start: Date,
      end: Date,
      timezone: String
    },
    rollbackPlan: String,
    communicationPlan: String,
    stakeholders: [String]
  },
  
  // Testing & Validation
  testing: {
    required: { type: Boolean, default: true },
    environment: String,
    testPlan: String,
    testResults: [{
      testId: String,
      type: { type: String, enum: ['functionality', 'security', 'performance', 'integration'] },
      result: { type: String, enum: ['pass', 'fail', 'inconclusive'] },
      testedBy: String,
      testedDate: Date,
      notes: String
    }],
    allTestsPassed: { type: Boolean, default: false }
  },
  
  // Verification
  verification: {
    required: { type: Boolean, default: true },
    method: {
      type: String,
      enum: ['rescan', 'manual_test', 'configuration_review', 'penetration_test', 'automated_check'],
      default: 'rescan'
    },
    verifiedBy: String,
    verificationDate: Date,
    passed: { type: Boolean, default: false },
    scanResults: {
      vulnerabilitiesBefore: Number,
      vulnerabilitiesAfter: Number,
      vulnerabilitiesRemaining: Number,
      newVulnerabilitiesFound: Number
    },
    notes: String
  },
  
  // Impact Assessment
  impact: {
    systems: [String],
    services: [String],
    users: [String],
    departments: [String],
    estimatedDowntime: Number, // minutes
    actualDowntime: Number,
    businessDisruption: { type: String, enum: ['none', 'minimal', 'moderate', 'significant', 'severe'] },
    financialImpact: Number
  },
  
  // Communication
  communication: {
    notificationsEnabled: { type: Boolean, default: true },
    recipients: {
      stakeholders: [String],
      management: [String],
      technicalTeam: [String],
      endUsers: [String]
    },
    updates: [{
      date: { type: Date, default: Date.now },
      author: String,
      message: String,
      type: { type: String, enum: ['info', 'warning', 'success', 'error'] }
    }]
  },
  
  // Rollback
  rollback: {
    available: { type: Boolean, default: false },
    plan: String,
    triggers: [String],
    executed: { type: Boolean, default: false },
    executedBy: String,
    executedDate: Date,
    reason: String,
    successful: Boolean
  },
  
  // Lessons Learned
  lessonsLearned: {
    whatWorked: [String],
    whatDidntWork: [String],
    improvements: [String],
    recommendations: [String]
  },
  
  // Success Metrics
  successMetrics: {
    vulnerabilitiesRemediated: { type: Number, default: 0 },
    assetsSecured: { type: Number, default: 0 },
    riskReduction: { type: Number, default: 0 },
    onTimeCompletion: { type: Boolean, default: false },
    withinBudget: { type: Boolean, default: true },
    noIncidents: { type: Boolean, default: true }
  },
  
  // Ownership
  owner: {
    userId: String,
    name: String,
    email: String,
    department: String
  },
  
  // Tags & Labels
  tags: [String],
  labels: { type: Map, of: String },
  
  // Notes & Comments
  notes: [{
    author: String,
    content: String,
    timestamp: { type: Date, default: Date.now },
    visibility: { type: String, enum: ['public', 'internal', 'private'], default: 'internal' }
  }],
  
  // History
  history: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'approved', 'started', 'completed', 'verified', 'closed', 'cancelled']
    },
    user: String,
    date: { type: Date, default: Date.now },
    notes: String,
    changes: { type: Map, of: Schema.Types.Mixed }
  }],
  
  // Metadata
  metadata: { type: Map, of: Schema.Types.Mixed }
}, {
  timestamps: true,
  collection: 'remediationplans'
});

// Indexes
remediationPlanSchema.index({ planId: 1 });
remediationPlanSchema.index({ priority: 1 });
remediationPlanSchema.index({ status: 1 });
remediationPlanSchema.index({ 'timeline.targetCompletion': 1 });
remediationPlanSchema.index({ 'owner.userId': 1 });
remediationPlanSchema.index({ tags: 1 });

// Virtual for is overdue
remediationPlanSchema.virtual('isOverdue').get(function() {
  if (!this.timeline.targetCompletion) return false;
  return new Date() > this.timeline.targetCompletion && 
         !['completed', 'verified', 'closed', 'cancelled'].includes(this.status);
});

// Virtual for days remaining
remediationPlanSchema.virtual('daysRemaining').get(function() {
  if (!this.timeline.targetCompletion) return null;
  const now = new Date();
  const diff = this.timeline.targetCompletion - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Method: Add action
remediationPlanSchema.methods.addAction = function(actionData) {
  const actionId = `action-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  
  this.actions.push({
    actionId,
    ...actionData,
    order: this.actions.length + 1
  });
  
  this.totalActions = this.actions.length;
};

// Method: Update action status
remediationPlanSchema.methods.updateActionStatus = function(actionId, status, updates = {}) {
  const action = this.actions.id(actionId);
  
  if (action) {
    action.status = status;
    
    if (status === 'completed') {
      action.completedDate = new Date();
      this.completedActions++;
    }
    
    Object.assign(action, updates);
    this.updateProgress();
  }
};

// Method: Update progress
remediationPlanSchema.methods.updateProgress = function() {
  // Calculate action progress
  this.progress.actionProgress = this.totalActions > 0 
    ? Math.round((this.completedActions / this.totalActions) * 100) 
    : 0;
  
  // Calculate asset progress
  const completedAssets = this.affectedAssets.filter(
    a => a.remediationStatus === 'completed' || a.remediationStatus === 'verified'
  ).length;
  
  this.progress.assetProgress = this.affectedAssetsCount > 0 
    ? Math.round((completedAssets / this.affectedAssetsCount) * 100) 
    : 0;
  
  // Calculate overall progress
  this.progress.overall = Math.round((this.progress.actionProgress + this.progress.assetProgress) / 2);
};

// Method: Approve plan
remediationPlanSchema.methods.approve = function(approverData) {
  const approver = this.approval.approvers.find(a => a.userId === approverData.userId);
  
  if (approver) {
    approver.approved = true;
    approver.approvalDate = new Date();
    approver.comments = approverData.comments;
  }
  
  // Check if all approvers have approved
  const allApproved = this.approval.approvers.every(a => a.approved);
  
  if (allApproved) {
    this.approval.status = 'approved';
    this.approval.finalApprovalDate = new Date();
    this.status = 'approved';
    
    this.history.push({
      action: 'approved',
      user: approverData.userId,
      date: new Date(),
      notes: 'Plan approved by all approvers'
    });
  }
};

// Method: Start execution
remediationPlanSchema.methods.start = function(userId) {
  this.status = 'in_progress';
  this.timeline.started = new Date();
  
  this.history.push({
    action: 'started',
    user: userId,
    date: new Date(),
    notes: 'Remediation plan execution started'
  });
};

// Method: Complete plan
remediationPlanSchema.methods.complete = function(userId) {
  this.status = 'completed';
  this.timeline.actualCompletion = new Date();
  
  if (this.timeline.started) {
    this.timeline.duration = Math.round(
      (this.timeline.actualCompletion - this.timeline.started) / (1000 * 60 * 60)
    );
  }
  
  // Update success metrics
  this.successMetrics.onTimeCompletion = 
    !this.timeline.targetCompletion || 
    this.timeline.actualCompletion <= this.timeline.targetCompletion;
  
  this.history.push({
    action: 'completed',
    user: userId,
    date: new Date(),
    notes: 'Remediation plan completed'
  });
};

// Method: Verify remediation
remediationPlanSchema.methods.verify = function(verificationData) {
  this.verification.verifiedBy = verificationData.verifiedBy;
  this.verification.verificationDate = new Date();
  this.verification.passed = verificationData.passed;
  this.verification.notes = verificationData.notes;
  
  if (verificationData.scanResults) {
    this.verification.scanResults = verificationData.scanResults;
  }
  
  if (verificationData.passed) {
    this.status = 'verified';
    
    // Calculate risk reduction
    if (this.verification.scanResults) {
      const before = this.verification.scanResults.vulnerabilitiesBefore || 0;
      const after = this.verification.scanResults.vulnerabilitiesAfter || 0;
      
      if (before > 0) {
        this.successMetrics.riskReduction = Math.round(((before - after) / before) * 100);
      }
    }
  } else {
    this.status = 'in_progress'; // Needs more work
  }
  
  this.history.push({
    action: 'verified',
    user: verificationData.verifiedBy,
    date: new Date(),
    notes: verificationData.notes
  });
};

// Static: Find high priority plans
remediationPlanSchema.statics.findHighPriority = function() {
  return this.find({ 
    priority: { $in: ['critical', 'high'] },
    status: { $in: ['draft', 'under_review', 'approved', 'scheduled', 'in_progress'] }
  }).sort({ priority: 1, 'timeline.targetCompletion': 1 });
};

// Static: Find overdue plans
remediationPlanSchema.statics.findOverdue = function() {
  return this.find({
    'timeline.targetCompletion': { $lt: new Date() },
    status: { $nin: ['completed', 'verified', 'closed', 'cancelled'] }
  }).sort({ 'timeline.targetCompletion': 1 });
};

// Static: Get statistics
remediationPlanSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $facet: {
        byPriority: [
          { $group: { _id: '$priority', count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ],
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        summary: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              avgProgress: { $avg: '$progress.overall' },
              totalVulns: { $sum: '$vulnerabilitiesCount' },
              totalAssets: { $sum: '$affectedAssetsCount' },
              avgRiskReduction: { $avg: '$successMetrics.riskReduction' }
            }
          }
        ]
      }
    }
  ]);
  
  return stats[0];
};

// Pre-save hook
remediationPlanSchema.pre('save', function(next) {
  // Update counts
  this.vulnerabilitiesCount = this.vulnerabilities.length;
  this.affectedAssetsCount = this.affectedAssets.length;
  this.totalActions = this.actions.length;
  
  // Update completed actions count
  this.completedActions = this.actions.filter(
    a => a.status === 'completed' || a.status === 'verified'
  ).length;
  
  // Update progress
  this.updateProgress();
  
  next();
});

const RemediationPlan = mongoose.model('RemediationPlan', remediationPlanSchema);

module.exports = RemediationPlan;
