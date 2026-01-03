const mongoose = require('mongoose');

/**
 * SecurityRule Model
 * Custom and built-in security rules for code analysis
 */
const SecurityRuleSchema = new mongoose.Schema({
  // Rule identification
  ruleId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Rule categorization
  category: {
    type: String,
    required: true,
    enum: [
      'injection',           // SQL, NoSQL, LDAP, OS Command, XPath
      'xss',                 // Cross-Site Scripting
      'authentication',      // Auth bypass, weak auth
      'authorization',       // Access control, privilege escalation
      'cryptography',        // Weak crypto, insecure random
      'secrets',             // Hardcoded credentials, API keys
      'configuration',       // Misconfigurations
      'data-exposure',       // Sensitive data exposure
      'deserialization',     // Insecure deserialization
      'logging',             // Missing/excessive logging
      'validation',          // Input validation issues
      'race-condition',      // TOCTOU, race conditions
      'memory',              // Buffer overflow, memory leaks
      'dependency',          // Vulnerable dependencies
      'code-quality',        // Code quality issues with security impact
      'custom'               // User-defined rules
    ],
    index: true
  },
  
  // OWASP/CWE mapping
  standards: {
    owasp: {
      top10_2021: [String],  // e.g., ['A03:2021']
      asvs: [String],        // OWASP ASVS controls
      proactiveControls: [String]
    },
    cwe: [{
      id: Number,            // CWE-89, CWE-79, etc.
      name: String
    }],
    sans: [String],          // SANS Top 25
    pci: [String],           // PCI-DSS requirements
    hipaa: [String],         // HIPAA requirements
    gdpr: [String]           // GDPR articles
  },
  
  // Severity and scoring
  severity: {
    type: String,
    required: true,
    enum: ['critical', 'high', 'medium', 'low', 'info'],
    index: true
  },
  cvssScore: {
    base: {
      type: Number,
      min: 0,
      max: 10
    },
    vector: String  // CVSS vector string
  },
  
  // Languages this rule applies to
  languages: [{
    type: String,
    enum: [
      'javascript', 'typescript', 'python', 'java', 'go', 
      'ruby', 'php', 'csharp', 'rust', 'kotlin', 'swift',
      'c', 'cpp', 'scala', 'groovy', 'all'
    ]
  }],
  
  // Rule source
  source: {
    type: String,
    enum: ['builtin', 'semgrep', 'codeql', 'sonarqube', 'custom', 'community'],
    default: 'builtin'
  },
  
  // Pattern matching
  patterns: {
    // Simple regex patterns
    regex: [{
      pattern: String,
      flags: String,
      matchType: {
        type: String,
        enum: ['source', 'sink', 'sanitizer', 'pattern']
      }
    }],
    
    // Semgrep rule definition
    semgrep: {
      rule: mongoose.Schema.Types.Mixed,  // Full Semgrep YAML rule
      rulePath: String  // Or path to external rule file
    },
    
    // CodeQL query
    codeql: {
      query: String,
      queryPath: String,
      suite: String
    },
    
    // AST-based patterns
    ast: [{
      nodeType: String,
      condition: mongoose.Schema.Types.Mixed
    }]
  },
  
  // Detection configuration
  detection: {
    confidence: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    },
    falsePositiveRate: {
      type: String,
      enum: ['very-low', 'low', 'medium', 'high'],
      default: 'medium'
    },
    dataFlowAnalysis: {
      type: Boolean,
      default: false
    },
    taintTracking: {
      type: Boolean,
      default: false
    }
  },
  
  // Fix information
  fix: {
    suggestion: String,
    codeExample: {
      bad: String,
      good: String
    },
    autofix: {
      available: Boolean,
      pattern: String,
      replacement: String
    },
    references: [{
      title: String,
      url: String
    }],
    effort: {
      type: String,
      enum: ['trivial', 'easy', 'moderate', 'difficult', 'complex'],
      default: 'moderate'
    }
  },
  
  // Rule status
  status: {
    type: String,
    enum: ['active', 'deprecated', 'experimental', 'disabled'],
    default: 'active',
    index: true
  },
  
  // Usage statistics
  stats: {
    timesTriggered: { type: Number, default: 0 },
    truePositives: { type: Number, default: 0 },
    falsePositives: { type: Number, default: 0 },
    fixedCount: { type: Number, default: 0 },
    avgTimeToFix: Number,  // in hours
    lastTriggered: Date
  },
  
  // Metadata
  tags: [String],
  version: {
    type: String,
    default: '1.0.0'
  },
  author: {
    name: String,
    email: String,
    organization: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  }
}, {
  timestamps: true,
  collection: 'securecode_rules'
});

// Indexes for performance
SecurityRuleSchema.index({ category: 1, severity: 1 });
SecurityRuleSchema.index({ languages: 1 });
SecurityRuleSchema.index({ source: 1, status: 1 });
SecurityRuleSchema.index({ 'standards.cwe.id': 1 });
SecurityRuleSchema.index({ 'standards.owasp.top10_2021': 1 });
SecurityRuleSchema.index({ tags: 1 });

// Text index for search
SecurityRuleSchema.index({
  name: 'text',
  description: 'text',
  ruleId: 'text'
});

// Virtual for accuracy rate
SecurityRuleSchema.virtual('accuracyRate').get(function() {
  const total = this.stats.truePositives + this.stats.falsePositives;
  if (total === 0) return 100;
  return Math.round((this.stats.truePositives / total) * 100);
});

// Static method to find rules for a language
SecurityRuleSchema.statics.findForLanguage = function(language, options = {}) {
  const query = {
    status: 'active',
    $or: [
      { languages: language },
      { languages: 'all' }
    ]
  };
  
  if (options.severity) {
    query.severity = { $in: options.severity };
  }
  
  if (options.categories) {
    query.category = { $in: options.categories };
  }
  
  return this.find(query).sort({ severity: 1, category: 1 });
};

// Static method to find rules by CWE
SecurityRuleSchema.statics.findByCWE = function(cweId) {
  return this.find({
    status: 'active',
    'standards.cwe.id': cweId
  });
};

// Static method to find rules by OWASP category
SecurityRuleSchema.statics.findByOWASP = function(owaspId) {
  return this.find({
    status: 'active',
    'standards.owasp.top10_2021': owaspId
  });
};

// Method to update statistics
SecurityRuleSchema.methods.recordMatch = async function(isTruePositive) {
  this.stats.timesTriggered++;
  this.stats.lastTriggered = new Date();
  
  if (isTruePositive) {
    this.stats.truePositives++;
  } else {
    this.stats.falsePositives++;
  }
  
  await this.save();
};

module.exports = mongoose.model('SecurityRule', SecurityRuleSchema);
