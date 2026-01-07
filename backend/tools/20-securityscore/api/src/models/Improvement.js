const mongoose = require('mongoose');

/**
 * Improvement Model
 * 
 * Manages security improvement recommendations, action items,
 * and remediation plans to enhance security posture scores.
 */

const improvementSchema = new mongoose.Schema({
  // Basic Information
  improvementId: {
    type: String,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Improvement title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },

  // Classification
  category: {
    type: String,
    enum: ['network', 'endpoint', 'identity', 'data', 'application', 'cloud', 'compliance', 'process', 'policy'],
    required: true,
    index: true
  },
  subCategory: String,

  // Type and Timeline
  type: {
    type: String,
    enum: ['quick_win', 'short_term', 'medium_term', 'long_term', 'strategic', 'continuous'],
    default: 'short_term',
    index: true
  },
  timeline: {
    estimatedDuration: Number, // in days
    startDate: Date,
    targetDate: Date,
    completedDate: Date,
    milestones: [{
      name: String,
      description: String,
      dueDate: Date,
      completedDate: Date,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'delayed']
      }
    }]
  },

  // Priority and Status
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
