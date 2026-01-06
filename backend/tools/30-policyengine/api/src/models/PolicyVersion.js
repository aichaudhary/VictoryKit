const mongoose = require('mongoose');

const policyVersionSchema = new mongoose.Schema({
  versionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  policyId: {
    type: String,
    required: true,
    index: true
  },
  policyName: String,
  version: {
    number: { type: String, required: true },
    major: Number,
    minor: Number,
    patch: Number
  },
  versionType: {
    type: String,
    required: true,
    enum: ['major', 'minor', 'patch']
  },
  changeLog: {
    summary: { type: String, required: true },
    changes: [{
      type: { type: String, enum: ['added', 'modified', 'removed'] },
      section: String,
      description: String,
      oldValue: String,
      newValue: String
    }],
    reason: String,
    impactAssessment: String
  },
  content: {
    // Complete policy content snapshot
    purpose: String,
    scope: String,
    policyStatement: String,
    responsibilities: mongoose.Schema.Types.Mixed,
    procedures: [String],
    definitions: mongoose.Schema.Types.Mixed,
    references: [String],
    exceptions: String,
    enforcement: String
  },
  metadata: {
    createdBy: {
      userId: String,
      userName: String,
      email: String
    },
    createdAt: { type: Date, default: Date.now },
    approvedBy: String,
    approvalDate: Date,
    effectiveDate: Date,
    expirationDate: Date,
    supersedes: String,  // Previous version ID
    supersededBy: String,  // Next version ID
    status: {
      type: String,
      enum: ['draft', 'active', 'superseded', 'archived'],
      default: 'draft'
    }
  },
  comparison: {
    // Diff with previous version
    addedContent: [String],
    removedContent: [String],
    modifiedContent: [{
      field: String,
      before: String,
      after: String
    }]
  },
  review: {
    required: Boolean,
    reviewers: [{
      userId: String,
      userName: String,
      reviewDate: Date,
      status: { type: String, enum: ['pending', 'reviewed', 'rejected'] },
      comments: String
    }],
    consolidatedFeedback: String
  }
}, {
  timestamps: false
});

// Indexes
policyVersionSchema.index({ policyId: 1, 'version.number': -1 });
policyVersionSchema.index({ 'metadata.status': 1 });
policyVersionSchema.index({ 'metadata.effectiveDate': -1 });

module.exports = mongoose.model('PolicyVersion', policyVersionSchema);
