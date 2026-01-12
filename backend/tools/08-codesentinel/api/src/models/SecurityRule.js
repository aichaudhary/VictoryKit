/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🛡️ CODESENTINEL - Security Rule Model
 * SAST Rule Engine for Code Security Analysis
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const mongoose = require('mongoose');

const securityRuleSchema = new mongoose.Schema({
  // ═══════════════════════════════════════════════════════════════════════════
  // Rule Identification
  // ═══════════════════════════════════════════════════════════════════════════
  ruleId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Rule Classification
  // ═══════════════════════════════════════════════════════════════════════════
  category: {
    type: String,
    enum: [
      'injection', 'xss', 'csrf', 'authentication', 'authorization',
      'cryptography', 'configuration', 'data-exposure', 'xml-security',
      'code-quality', 'secrets', 'dependencies', 'api-security',
      'input-validation', 'output-encoding', 'session-management',
      'error-handling', 'logging', 'deserialization', 'ssrf'
    ],
    required: true,
    index: true
  },
  severity: { 
    type: String, 
    enum: ['critical', 'high', 'medium', 'low', 'info'], 
    required: true,
    index: true
  },
  confidenceLevel: {
    type: String,
    enum: ['certain', 'firm', 'tentative'],
    default: 'firm'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Language & Pattern Matching
  // ═══════════════════════════════════════════════════════════════════════════
  languages: [{
    type: String,
    enum: [
      'javascript', 'typescript', 'python', 'java', 'csharp', 'go',
      'ruby', 'php', 'swift', 'kotlin', 'rust', 'cpp', 'c', 'scala',
      'solidity', 'sql', 'shell', 'yaml', 'json', 'xml', 'html', 'all'
    ]
  }],
  patterns: [{
    type: { 
      type: String, 
      enum: ['regex', 'ast', 'semantic', 'taint-flow'] 
    },
    pattern: String,
    flags: String,
    testCases: [{
      code: String,
      shouldMatch: Boolean
    }]
  }],

  // ═══════════════════════════════════════════════════════════════════════════
  // Compliance & Standards
  // ═══════════════════════════════════════════════════════════════════════════
  compliance: {
    cwe: [{ 
      id: String, 
      name: String 
    }],
    owasp: [{
      category: String,
      year: { type: Number, enum: [2017, 2021, 2023] }
    }],
    sans: [String],
    pciDss: [String],
    gdpr: [String],
    hipaa: [String],
    soc2: [String],
    iso27001: [String]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Remediation Guidance
  // ═══════════════════════════════════════════════════════════════════════════
  remediation: {
    description: String,
    effort: { 
      type: String, 
      enum: ['trivial', 'easy', 'medium', 'hard', 'complex'] 
    },
    autoFixable: { type: Boolean, default: false },
    fixTemplate: String,
    references: [{
      title: String,
      url: String
    }],
    codeExamples: {
      vulnerable: String,
      secure: String
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AI Enhancement
  // ═══════════════════════════════════════════════════════════════════════════
  aiConfig: {
    useAiVerification: { type: Boolean, default: true },
    contextWindow: { type: Number, default: 10 },
    promptTemplate: String,
    falsePositiveThreshold: { type: Number, default: 0.3 }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Rule Management
  // ═══════════════════════════════════════════════════════════════════════════
  status: { 
    type: String, 
    enum: ['active', 'deprecated', 'experimental', 'disabled'], 
    default: 'active',
    index: true
  },
  version: { 
    type: String, 
    default: '1.0.0' 
  },
  author: String,
  source: {
    type: String,
    enum: ['built-in', 'community', 'custom', 'semgrep', 'codeql'],
    default: 'built-in'
  },
  tags: [String],

  // ═══════════════════════════════════════════════════════════════════════════
  // Performance Metrics
  // ═══════════════════════════════════════════════════════════════════════════
  metrics: {
    totalMatches: { type: Number, default: 0 },
    truePositives: { type: Number, default: 0 },
    falsePositives: { type: Number, default: 0 },
    averageScanTime: { type: Number, default: 0 },
    lastTriggered: Date
  },

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
securityRuleSchema.index({ languages: 1, status: 1, severity: 1 });
securityRuleSchema.index({ category: 1, status: 1 });
securityRuleSchema.index({ 'compliance.cwe.id': 1 });
securityRuleSchema.index({ 'compliance.owasp.category': 1 });
securityRuleSchema.index({ tags: 1 });
securityRuleSchema.index({ source: 1, status: 1 });

module.exports = mongoose.model('SecurityRule', securityRuleSchema);
