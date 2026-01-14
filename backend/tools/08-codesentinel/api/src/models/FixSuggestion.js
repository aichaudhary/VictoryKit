/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🛡️ CODESENTINEL - Fix Suggestion Model
 * AI-Powered Code Remediation Suggestions
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const mongoose = require('mongoose');

const fixSuggestionSchema = new mongoose.Schema({
  // ═══════════════════════════════════════════════════════════════════════════
  // Fix Identification
  // ═══════════════════════════════════════════════════════════════════════════
  issueId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'CodeIssue', 
    required: true,
    index: true
  },
  codebaseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Codebase', 
    required: true,
    index: true
  },
  scanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodeScan',
    index: true
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Fix Details
  // ═══════════════════════════════════════════════════════════════════════════
  title: { 
    type: String, 
    required: true 
  },
  description: String,
  fixType: {
    type: String,
    enum: ['code-change', 'configuration', 'dependency-update', 'removal', 'refactor', 'manual'],
    required: true
  },
  
  // Original Code
  original: {
    file: { type: String, required: true },
    startLine: { type: Number, required: true },
    endLine: { type: Number, required: true },
    code: { type: String, required: true }
  },

  // Suggested Fix
  suggested: {
    code: { type: String, required: true },
    explanation: String,
    language: String
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Fix Quality Metrics
  // ═══════════════════════════════════════════════════════════════════════════
  quality: {
    confidence: { type: Number, min: 0, max: 100, default: 80 },
    safetyScore: { type: Number, min: 0, max: 100 },
    completeness: { type: Number, min: 0, max: 100 },
    aiModel: String,
    modelVersion: String,
    generatedAt: { type: Date, default: Date.now }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Risk Assessment
  // ═══════════════════════════════════════════════════════════════════════════
  risk: {
    level: {
      type: String,
      enum: ['minimal', 'low', 'medium', 'high'],
      default: 'low'
    },
    breakingChange: { type: Boolean, default: false },
    requiresReview: { type: Boolean, default: true },
    affectedTests: [String],
    sideEffects: [String],
    dependencies: [{
      file: String,
      reason: String
    }]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Validation Status
  // ═══════════════════════════════════════════════════════════════════════════
  validation: {
    syntaxValid: Boolean,
    compilable: Boolean,
    testsPass: Boolean,
    securityVerified: Boolean,
    validatedAt: Date,
    validationErrors: [String]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Application Status
  // ═══════════════════════════════════════════════════════════════════════════
  status: { 
    type: String, 
    enum: ['suggested', 'approved', 'applied', 'rejected', 'failed', 'reverted'], 
    default: 'suggested',
    index: true
  },
  application: {
    appliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    appliedAt: Date,
    method: {
      type: String,
      enum: ['auto', 'manual', 'pr', 'direct']
    },
    pullRequestUrl: String,
    commitHash: String,
    revertedAt: Date,
    revertReason: String
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Feedback & Learning
  // ═══════════════════════════════════════════════════════════════════════════
  feedback: {
    helpful: Boolean,
    accurate: Boolean,
    userRating: { type: Number, min: 1, max: 5 },
    comments: String,
    rejectionReason: {
      type: String,
      enum: [
        'incorrect-fix', 'incomplete', 'introduces-bugs', 
        'not-applicable', 'already-fixed', 'too-risky', 'other'
      ]
    },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    submittedAt: Date
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Alternative Fixes
  // ═══════════════════════════════════════════════════════════════════════════
  alternatives: [{
    code: String,
    explanation: String,
    confidence: Number,
    tradeoffs: String
  }],

  // ═══════════════════════════════════════════════════════════════════════════
  // Timestamps
  // ═══════════════════════════════════════════════════════════════════════════
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// ═══════════════════════════════════════════════════════════════════════════════
// Compound Indexes for Performance
// ═══════════════════════════════════════════════════════════════════════════════
fixSuggestionSchema.index({ issueId: 1, status: 1 });
fixSuggestionSchema.index({ codebaseId: 1, status: 1, 'quality.confidence': -1 });
fixSuggestionSchema.index({ 'original.file': 1 });
fixSuggestionSchema.index({ fixType: 1, status: 1 });
fixSuggestionSchema.index({ 'feedback.helpful': 1 });
fixSuggestionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('FixSuggestion', fixSuggestionSchema);
