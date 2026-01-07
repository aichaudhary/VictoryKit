const mongoose = require('mongoose');

/**
 * Improvement Model - Security improvement recommendations and action items
 */

const improvementSchema = new mongoose.Schema({
  improvementId: { type: String, unique: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, maxlength: 2000 },
  
  category: {
    type: String,
    enum: ['network', 'endpoint', 'identity', 'data', 'application', 'cloud', 'compliance'],
    required: true,
    index: true
  },
  
  type: {
    type: String,
    enum: ['quick_win', 'short_term', 'medium_term', 'long_term', 'strategic'],
    default: 'short_term'
  },
  
  priority: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium',
    index: true
  },
  
  status: {
    type: String,
    enum: ['identified', 'planned', 'approved', 'in_progress', 'completed', 'deferred', 'rejected'],
    default: 'identified',
    index: true
  },
  
  impact: {
    scoreIncrease: { type: Number, min: 0, max: 100 },
    categoryImpacts: mongoose.Schema.Types.Mixed,
    affectedMetrics: [{ metricId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScoreMetric' }, expectedImprovement: Number }],
    riskReduction: String,
    complianceImprovement: [{ framework: String, improvement: Number }],
    businessImpact: { type: String, enum: ['critical', 'high', 'medium', 'low'] }
  },
  
  effort: {
    level: { type: String, enum: ['minimal', 'low', 'medium', 'high', 'very_high'] },
    estimatedHours: Number,
    actualHours: Number,
    complexity: { type: String, enum: ['simple', 'moderate', 'complex', 'very_complex'] },
    skillsRequired: [String]
  },
  
  cost: {
    estimated: { total: Number, labor: Number, tools: Number, licenses: Number, currency: { type: String, default: 'USD' } },
    actual: { total: Number, currency: { type: String, default: 'USD' } },
    roi: { value: Number, period: String }
  },





























































































































module.exports = mongoose.model('Improvement', improvementSchema);};  ]);    { $group: { _id: '$status', count: { $sum: 1 }, totalImpact: { $sum: '$impact.scoreIncrease' } } }  return await this.aggregate([improvementSchema.statics.getStatistics = async function() {};    .sort({ 'timeline.targetDate': 1 }).exec();  return this.find({ 'timeline.targetDate': { $lt: new Date() }, status: { $nin: ['completed', 'rejected'] } })improvementSchema.statics.findOverdue = function() {};    .sort({ priority: 1 }).exec();  return this.find({ priority: { $in: ['critical', 'high'] }, status: { $in: ['identified', 'planned', 'in_progress'] } })improvementSchema.statics.findHighPriority = function() {};  }    this.status = 'approved';    this.approval.finalStatus = 'approved';  if (allApproved) {  const allApproved = this.approval.approvers.every(a => a.status === 'approved');  }    approver.comments = comments;    approver.date = new Date();    approver.status = 'approved';  if (approver) {  const approver = this.approval.approvers.find(a => a.email === approverEmail);improvementSchema.methods.approve = function(approverEmail, comments) {};  }    this.timeline.completedDate = new Date();    this.status = 'completed';  if (percentage === 100) {  this.progress.updates.push({ date: new Date(), percentage, description, updatedBy });  this.progress.lastUpdate = new Date();  this.progress.percentage = Math.min(100, Math.max(0, percentage));improvementSchema.methods.updateProgress = function(percentage, description, updatedBy) {// Methods});  next();  }    this.improvementId = 'IMP-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();  if (!this.improvementId) {improvementSchema.pre('save', function(next) {improvementSchema.index({ category: 1, priority: 1, status: 1 });improvementSchema.index({ improvementId: 1 });// Indexes and Hooks});  collection: 'improvements'  timestamps: true,}, {  }    customFields: mongoose.Schema.Types.Mixed    tags: [String],    version: { type: Number, default: 1 },    lastModifiedBy: { name: String, email: String },    createdBy: { name: String, email: String, userId: String },  metadata: {    },    confidence: Number    system: String,    type: { type: String, enum: ['automated_analysis', 'manual_review', 'assessment', 'best_practice', 'ai_recommendation'] },  source: {    },    approvedDate: Date    finalStatus: { type: String, enum: ['pending', 'approved', 'rejected'] },    approvers: [{ name: String, email: String, status: String, date: Date, comments: String }],    required: { type: Boolean, default: false },  approval: {    },    validatedDate: Date    validatedBy: String,    validated: Boolean,    results: [{ date: Date, result: String, notes: String }],    method: String,    required: { type: Boolean, default: true },  validation: {    },    findings: [{ findingId: String, severity: String, title: String }]    assessments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' }],    controls: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Control' }],    metrics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ScoreMetric' }],    securityScore: { type: mongoose.Schema.Types.ObjectId, ref: 'SecurityScore' },  relatedEntities: {    },    milestones: [{ name: String, dueDate: Date, completedDate: Date, status: String }]    completedDate: Date,    targetDate: Date,    startDate: Date,    estimatedDuration: Number,  timeline: {    },    blockers: [{ description: String, severity: String, resolved: Boolean }]    updates: [{ date: Date, percentage: Number, description: String, updatedBy: String }],    lastUpdate: Date,    percentage: { type: Number, min: 0, max: 100, default: 0 },  progress: {    },    team: [{ userId: String, name: String, role: String }]    assignee: { userId: String, name: String, email: String },    owner: { userId: String, name: String, email: String },  assignment: {    },    risks: [{ description: String, severity: String, mitigation: String }]    dependencies: [{ improvementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Improvement' }, type: String }],    requirements: [{ type: String, description: String, met: Boolean }],    steps: [{ order: Number, title: String, description: String, status: String, assignee: String, completedDate: Date }],  implementation: {    // Priority and Status
  priority: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium',
    index: true
  },
  status: {
    type: String,
    enum: ['identified', 'planned', 'approved', 'in_progress', 'on_hold', 'completed', 'deferred', 'rejected', 'cancelled'],
    default: 'identified',
    index: true
  },
  statusHistory: [{
    status: String,
    date: Date,
    changedBy: String,
    reason: String
  }],

  // Impact Assessment
  impact: {
    scoreIncrease: {
      type: Number,
      min: 0,
      max: 100
    },
    categoryImpacts: {
      network: Number,
      endpoint: Number,
      identity: Number,
      data: Number,
      application: Number,
      cloud: Number,
      compliance: Number
    },
    affectedMetrics: [{
      metricId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScoreMetric' },
      name: String,
      currentValue: Number,
      targetValue: Number,
      expectedImprovement: Number
    }],
    riskReduction: {
      current: Number,
      target: Number,
      reduction: Number,
      affectedRisks: [String]
    },
    complianceImprovement: [{
      framework: String,
      currentCompliance: Number,
      targetCompliance: Number,
      improvement: Number
    }],
    businessImpact: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low', 'none']
    },
    operationalImpact: {
      type: String,
      enum: ['high', 'medium', 'low', 'minimal']
    }
  },

  // Effort and Resources
  effort: {
    level: {
      type: String,
      enum: ['minimal', 'low', 'medium', 'high', 'very_high'],
      default: 'medium'
    },
    estimatedHours: Number,
    actualHours: Number,
    complexity: {
      type: String,
      enum: ['simple', 'moderate', 'complex', 'very_complex']
    },
    skillsRequired: [String],
    toolsRequired: [String]
  },

  // Cost Estimation
  cost: {
    estimated: {
      total: Number,
      breakdown: {
        labor: Number,
        tools: Number,
        licenses: Number,
        hardware: Number,
        services: Number,
        training: Number,
        other: Number
      },
      currency: { type: String, default: 'USD' }
    },
    actual: {
      total: Number,
      breakdown: {
        labor: Number,
        tools: Number,
        licenses: Number,
        hardware: Number,
        services: Number,
        training: Number,
        other: Number
      },
      currency: { type: String, default: 'USD' }
    },
    roi: {
      value: Number,
      period: String,
      breakEvenMonths: Number
    }
  },

  // Implementation Details
  implementation: {
    approach: {
      type: String,
      enum: ['automated', 'manual', 'hybrid', 'outsourced']
    },
    steps: [{
      order: Number,
      title: String,
      description: String,
      estimatedDuration: Number,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'blocked']
      },
      assignee: String,
      completedDate: Date,
      notes: String
    }],
    requirements: [{
      type: {
        type: String,
        enum: ['technical', 'business', 'compliance', 'operational']
      },
      description: String,
      priority: String,
      met: Boolean
    }],
    dependencies: [{
      improvementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Improvement' },
      title: String,
      type: {
        type: String,
        enum: ['prerequisite', 'parallel', 'follow_up']
      },
      status: String
    }],
    risks: [{
      description: String,
      severity: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low']
      },
      likelihood: {
        type: String,
        enum: ['high', 'medium', 'low']
      },
      mitigation: String,
      owner: String
    }]
  },

  // Assignment and Ownership
  assignment: {
    owner: {
      userId: String,
      name: String,
      email: String,
      department: String
    },
    assignee: {
      userId: String,
      name: String,
      email: String,
      department: String
    },
    team: [{
      userId: String,
      name: String,
      email: String,
      role: String
    }],
    vendor: {
      name: String,
      contactPerson: String,
      email: String,
      phone: String
    }
  },

  // Progress Tracking
  progress: {
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    stepsCompleted: Number,
    stepsTotal: Number,
    lastUpdate: Date,
    updates: [{
      date: Date,
      percentage: Number,
      description: String,
      updatedBy: String
    }],
    blockers: [{
      description: String,
      severity: String,
      reportedDate: Date,
      resolvedDate: Date,
      resolved: Boolean
    }]
  },

  // Related Entities
  relatedEntities: {
    securityScore: { type: mongoose.Schema.Types.ObjectId, ref: 'SecurityScore' },
    metrics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ScoreMetric' }],
    controls: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Control' }],
    assessments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' }],
    findings: [{
      findingId: String,
      source: String,
      severity: String,
      title: String
    }],
    vulnerabilities: [{
      vulnId: String,
      cveId: String,
      severity: String,
      title: String
    }]
  },

  // Validation and Testing
  validation: {
    required: {
      type: Boolean,
      default: true
    },
    method: {
      type: String,
      enum: ['automated_test', 'manual_test', 'security_scan', 'compliance_check', 'user_acceptance', 'penetration_test']
    },
    criteria: [String],
    testPlan: String,
    results: [{
      date: Date,
      method: String,
      result: {
        type: String,
        enum: ['passed', 'failed', 'partial']
      },
      notes: String,
      evidence: String
    }],
    validated: Boolean,
    validatedBy: String,
    validatedDate: Date
  },

  // Approval Workflow
  approval: {
    required: {
      type: Boolean,
      default: false
    },
    approvers: [{
      name: String,
      email: String,
      role: String,
      level: Number,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'delegated']
      },
      date: Date,
      comments: String
    }],
    finalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected']
    },
    approvedDate: Date,
    rejectionReason: String
  },

  // Communication
  communication: {
    stakeholders: [{
      name: String,
      email: String,
      role: String,
      notificationPreference: {
        type: String,
        enum: ['email', 'slack', 'teams', 'none']
      }
    }],
    notifications: [{
      date: Date,
      type: String,
      recipients: [String],
      subject: String,
      delivered: Boolean
    }],
    meetings: [{
      date: Date,
      title: String,
      attendees: [String],
      notes: String,
      decisions: [String]
    }]
  },

  // Documentation
  documentation: {
    technicalDoc: String,
    userGuide: String,
    runbook: String,
    references: [{
      title: String,
      url: String,
      type: String
    }],
    attachments: [{
      filename: String,
      url: String,
      type: String,
      size: Number,
      uploadedDate: Date,
      uploadedBy: String
    }],
    notes: String
  },

  // Lessons Learned
  lessonsLearned: {
    whatWorked: [String],
    whatDidntWork: [String],
    recommendations: [String],
    bestPractices: [String],
    documentedBy: String,
    documentedDate: Date
  },

  // Source and Recommendation
  source: {
    type: {
      type: String,
      enum: ['automated_analysis', 'manual_review', 'assessment', 'audit', 'vulnerability_scan', 'best_practice', 'industry_standard', 'ai_recommendation', 'user_suggestion']
    },
    system: String,
    assessmentId: String,
    framework: String,
    control: String,
    confidence: {
      type: Number,
      min: 0,
      max: 100
    }
  },

  // Metadata
  metadata: {
    createdBy: {
      name: String,
      email: String,
      userId: String
    },
    lastModifiedBy: {
      name: String,
      email: String,
      userId: String
    },
    version: {
      type: Number,
      default: 1
    },
    tags: [String],
    labels: [{
      key: String,
      value: String
    }],
    customFields: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  collection: 'improvements'
});

// Indexes
improvementSchema.index({ improvementId: 1 });
improvementSchema.index({ category: 1, priority: 1 });
improvementSchema.index({ status: 1 });
improvementSchema.index({ 'timeline.targetDate': 1 });
improvementSchema.index({ 'assignment.owner.userId': 1 });

// Generate improvementId
improvementSchema.pre('save', function(next) {
  if (!this.improvementId) {
    this.improvementId = 'IMP-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

// Instance Methods

improvementSchema.methods.updateProgress = function(percentage, description, updatedBy) {
  this.progress.percentage = Math.min(100, Math.max(0, percentage));
  this.progress.lastUpdate = new Date();
  
  this.progress.updates.push({
    date: new Date(),
    percentage: percentage,
    description: description,
    updatedBy: updatedBy
  });

  if (percentage === 100 && this.status !== 'completed') {
    this.status = 'completed';
    this.timeline.completedDate = new Date();
  }
};

improvementSchema.methods.addMilestone = function(name, description, dueDate) {
  this.timeline.milestones.push({
    name: name,
    description: description,
    dueDate: dueDate,
    status: 'pending'
  });
};

improvementSchema.methods.approve = function(approverName, approverEmail, comments) {
  const approver = this.approval.approvers.find(a => a.email === approverEmail);
  if (approver) {
    approver.status = 'approved';
    approver.date = new Date();
    approver.comments = comments;
  }

  const allApproved = this.approval.approvers.every(a => a.status === 'approved');
  if (allApproved) {
    this.approval.finalStatus = 'approved';
    this.approval.approvedDate = new Date();
    if (this.status === 'planned') {
      this.status = 'approved';
    }
  }
};

improvementSchema.methods.reject = function(approverEmail, reason) {
  const approver = this.approval.approvers.find(a => a.email === approverEmail);
  if (approver) {
    approver.status = 'rejected';
    approver.date = new Date();
    approver.comments = reason;
  }

  this.approval.finalStatus = 'rejected';
  this.approval.rejectionReason = reason;
  this.status = 'rejected';
};

improvementSchema.methods.complete = function(completedBy) {
  this.status = 'completed';
  this.progress.percentage = 100;
  this.timeline.completedDate = new Date();
  this.metadata.lastModifiedBy = completedBy;
};

// Static Methods

improvementSchema.statics.findHighPriority = function() {
  return this.find({
    priority: { $in: ['critical', 'high'] },
    status: { $in: ['identified', 'planned', 'approved', 'in_progress'] }
  })
    .sort({ priority: 1, 'timeline.targetDate': 1 })
    .exec();
};

improvementSchema.statics.findOverdue = function() {
  return this.find({
    'timeline.targetDate': { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled', 'rejected'] }
  })
    .sort({ 'timeline.targetDate': 1 })
    .exec();
};

improvementSchema.statics.findByCategory = function(category) {
  return this.find({ category, status: { $ne: 'cancelled' } })
    .sort({ priority: 1, createdAt: -1 })
    .exec();
};

improvementSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalImpact: { $sum: '$impact.scoreIncrease' },
        totalCost: { $sum: '$cost.estimated.total' }
      }
    }
  ]);

  return stats;
};

module.exports = mongoose.model('Improvement', improvementSchema);
