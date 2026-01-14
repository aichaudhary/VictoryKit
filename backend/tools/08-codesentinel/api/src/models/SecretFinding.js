/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🛡️ CODESENTINEL - Secret Finding Model
 * Credential & Secret Detection in Source Code
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const mongoose = require('mongoose');

const secretFindingSchema = new mongoose.Schema({
  // ═══════════════════════════════════════════════════════════════════════════
  // Finding Identification
  // ═══════════════════════════════════════════════════════════════════════════
  scanId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'CodeScan', 
    required: true,
    index: true
  },
  codebaseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Codebase', 
    required: true,
    index: true
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Secret Classification
  // ═══════════════════════════════════════════════════════════════════════════
  secretType: {
    type: String,
    enum: [
      'api-key', 'oauth-token', 'jwt', 'bearer-token',
      'aws-access-key', 'aws-secret-key', 'azure-key', 'gcp-key',
      'database-password', 'database-connection-string',
      'private-key', 'ssh-key', 'certificate',
      'password', 'password-hash', 'encryption-key',
      'github-token', 'gitlab-token', 'npm-token',
      'slack-token', 'discord-token', 'telegram-token',
      'stripe-key', 'paypal-key', 'payment-credential',
      'smtp-credential', 'sendgrid-key', 'twilio-key',
      'firebase-key', 'mongodb-uri', 'redis-url',
      'generic-secret', 'custom'
    ],
    required: true,
    index: true
  },
  provider: {
    type: String,
    enum: [
      'aws', 'azure', 'gcp', 'github', 'gitlab', 'bitbucket',
      'slack', 'discord', 'stripe', 'paypal', 'twilio',
      'sendgrid', 'mailgun', 'firebase', 'mongodb', 'redis',
      'docker', 'npm', 'pypi', 'auth0', 'okta', 'datadog',
      'newrelic', 'sentry', 'pagerduty', 'generic', 'unknown'
    ],
    default: 'unknown'
  },
  severity: { 
    type: String, 
    enum: ['critical', 'high', 'medium', 'low'], 
    required: true,
    index: true
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Location Information
  // ═══════════════════════════════════════════════════════════════════════════
  location: {
    file: { 
      type: String, 
      required: true,
      index: true
    },
    line: { type: Number, required: true },
    column: Number,
    endLine: Number,
    endColumn: Number,
    snippet: String,
    contextBefore: [String],
    contextAfter: [String]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Secret Details (Sanitized)
  // ═══════════════════════════════════════════════════════════════════════════
  secret: {
    masked: String,
    prefix: String,
    suffix: String,
    length: Number,
    entropy: Number,
    pattern: String,
    variableName: String
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Verification & Validation
  // ═══════════════════════════════════════════════════════════════════════════
  verification: {
    status: {
      type: String,
      enum: ['unverified', 'verified-active', 'verified-inactive', 'invalid', 'rotated'],
      default: 'unverified'
    },
    verifiedAt: Date,
    validFormat: { type: Boolean, default: true },
    isActive: Boolean,
    isExpired: Boolean,
    expiresAt: Date,
    lastUsed: Date,
    permissions: [String],
    associatedAccount: String
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Git History Analysis
  // ═══════════════════════════════════════════════════════════════════════════
  gitInfo: {
    commit: String,
    author: String,
    authorEmail: String,
    date: Date,
    message: String,
    branch: String,
    isInHistory: { type: Boolean, default: false },
    firstCommit: String,
    commitCount: { type: Number, default: 1 }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Risk Assessment
  // ═══════════════════════════════════════════════════════════════════════════
  risk: {
    score: { type: Number, min: 0, max: 100 },
    exposure: {
      type: String,
      enum: ['public', 'internal', 'private', 'unknown'],
      default: 'unknown'
    },
    publiclyExposed: { type: Boolean, default: false },
    inProductionCode: { type: Boolean, default: false },
    inTestCode: { type: Boolean, default: false },
    inIgnoredFile: { type: Boolean, default: false },
    accessScope: {
      type: String,
      enum: ['full', 'read-only', 'write-only', 'limited', 'unknown'],
      default: 'unknown'
    },
    potentialImpact: {
      dataExfiltration: Boolean,
      accountTakeover: Boolean,
      financialLoss: Boolean,
      serviceDisruption: Boolean,
      lateralMovement: Boolean
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Status & Resolution
  // ═══════════════════════════════════════════════════════════════════════════
  status: { 
    type: String, 
    enum: ['open', 'reviewing', 'rotating', 'rotated', 'false-positive', 'ignored', 'resolved'], 
    default: 'open',
    index: true
  },
  resolution: {
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
    method: {
      type: String,
      enum: ['rotated', 'removed', 'encrypted', 'moved-to-vault', 'false-positive', 'accepted-risk']
    },
    notes: String,
    newSecretLocation: String
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Detection Metadata
  // ═══════════════════════════════════════════════════════════════════════════
  detection: {
    method: {
      type: String,
      enum: ['regex', 'entropy', 'ai', 'pattern-match', 'known-format'],
      default: 'pattern-match'
    },
    confidence: { type: Number, min: 0, max: 100 },
    ruleName: String,
    ruleId: String,
    falsePositiveProbability: { type: Number, min: 0, max: 1 }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Remediation Guidance
  // ═══════════════════════════════════════════════════════════════════════════
  remediation: {
    recommendation: String,
    steps: [String],
    rotationGuide: String,
    references: [{
      title: String,
      url: String
    }],
    estimatedEffort: {
      type: String,
      enum: ['immediate', 'hours', 'days', 'weeks']
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Timestamps
  // ═══════════════════════════════════════════════════════════════════════════
  detectedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// ═══════════════════════════════════════════════════════════════════════════════
// Compound Indexes for Performance
// ═══════════════════════════════════════════════════════════════════════════════
secretFindingSchema.index({ codebaseId: 1, status: 1, severity: 1 });
secretFindingSchema.index({ scanId: 1, secretType: 1 });
secretFindingSchema.index({ 'location.file': 1, 'location.line': 1 });
secretFindingSchema.index({ provider: 1, severity: 1 });
secretFindingSchema.index({ 'verification.status': 1 });
secretFindingSchema.index({ 'risk.publiclyExposed': 1, status: 1 });
secretFindingSchema.index({ 'gitInfo.commit': 1 });
secretFindingSchema.index({ detectedAt: -1 });

module.exports = mongoose.model('SecretFinding', secretFindingSchema);
