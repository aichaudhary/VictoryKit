const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: [
      'owasp-api-1', 'owasp-api-2', 'owasp-api-3', 'owasp-api-4', 'owasp-api-5',
      'owasp-api-6', 'owasp-api-7', 'owasp-api-8', 'owasp-api-9', 'owasp-api-10',
      'injection', 'auth', 'fuzzing', 'business-logic', 'rate-limiting', 'custom'
    ]
  },
  
  // Test Configuration
  testType: {
    type: String,
    enum: ['payload', 'behavior', 'timing', 'response-analysis', 'auth-bypass', 'rate-test'],
    required: true
  },
  
  // Target Matching
  targetMatcher: {
    methods: [String],
    pathPattern: String, // regex
    contentTypes: [String],
    hasAuth: Boolean,
    parameters: [{
      name: String,
      in: String
    }]
  },

  // Payloads
  payloads: [{
    name: String,
    value: String,
    encoding: String,
    description: String,
    expectedBehavior: String
  }],

  // Detection Rules
  detection: {
    // Response-based
    statusCodes: [Number],
    statusCodeRanges: [{ min: Number, max: Number }],
    bodyContains: [String],
    bodyRegex: [String],
    headerContains: [{
      header: String,
      value: String
    }],
    
    // Timing-based
    minResponseTime: Number,
    maxResponseTime: Number,
    timingDifference: Number,
    
    // Behavior-based
    responseChanged: Boolean,
    errorTriggered: Boolean,
    authBypassed: Boolean,
    dataLeaked: Boolean,
    
    // Comparison
    compareWith: {
      type: String,
      enum: ['baseline', 'previous', 'expected']
    },
    differenceThreshold: Number
  },

  // Severity Assignment
  severityRules: [{
    condition: String,
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low', 'info']
    }
  }],
  defaultSeverity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'info'],
    default: 'medium'
  },

  // CWE/OWASP Mapping
  cweId: String,
  owaspCategory: String,
  
  // Remediation
  recommendation: String,
  references: [String],
  remediationCode: {
    language: String,
    code: String
  },

  // Test Metadata
  enabled: {
    type: Boolean,
    default: true
  },
  builtIn: {
    type: Boolean,
    default: false
  },
  riskLevel: {
    type: String,
    enum: ['safe', 'low-risk', 'medium-risk', 'high-risk', 'destructive'],
    default: 'low-risk'
  },
  requiresAuth: {
    type: Boolean,
    default: false
  },
  
  // Statistics
  timesRun: { type: Number, default: 0 },
  timesDetected: { type: Number, default: 0 },
  falsePositiveRate: Number,
  lastUpdated: Date

}, {
  timestamps: true
});

// Indexes
testCaseSchema.index({ category: 1, enabled: 1 });
testCaseSchema.index({ testType: 1 });

// Seed built-in test cases
testCaseSchema.statics.seedBuiltInTests = async function() {
  const builtInTests = [
    {
      name: 'SQL Injection - Single Quote',
      description: 'Tests for SQL injection using single quote',
      category: 'injection',
      testType: 'payload',
      payloads: [
        { name: 'single-quote', value: "'", expectedBehavior: 'error or changed response' },
        { name: 'or-true', value: "' OR '1'='1", expectedBehavior: 'auth bypass or data leak' },
        { name: 'union-select', value: "' UNION SELECT NULL--", expectedBehavior: 'additional data' }
      ],
      detection: {
        bodyContains: ['syntax error', 'mysql', 'postgresql', 'sqlite', 'oracle'],
        errorTriggered: true
      },
      defaultSeverity: 'critical',
      cweId: 'CWE-89',
      owaspCategory: 'owasp-api-8',
      builtIn: true,
      enabled: true
    },
    {
      name: 'BOLA - ID Manipulation',
      description: 'Tests for Broken Object Level Authorization by manipulating IDs',
      category: 'owasp-api-1',
      testType: 'behavior',
      targetMatcher: {
        pathPattern: '.*/:id.*|.*/[0-9]+.*',
        hasAuth: true
      },
      detection: {
        statusCodes: [200],
        authBypassed: true,
        dataLeaked: true
      },
      defaultSeverity: 'high',
      cweId: 'CWE-639',
      owaspCategory: 'owasp-api-1',
      builtIn: true,
      enabled: true
    },
    {
      name: 'Rate Limiting - Absence Check',
      description: 'Verifies rate limiting is implemented',
      category: 'rate-limiting',
      testType: 'rate-test',
      detection: {
        statusCodeRanges: [{ min: 200, max: 299 }]
      },
      defaultSeverity: 'medium',
      cweId: 'CWE-770',
      owaspCategory: 'owasp-api-4',
      builtIn: true,
      enabled: true
    },
    {
      name: 'JWT None Algorithm',
      description: 'Tests for JWT none algorithm vulnerability',
      category: 'auth',
      testType: 'auth-bypass',
      payloads: [
        { name: 'none-alg', value: '{"alg":"none","typ":"JWT"}', expectedBehavior: 'accepted token' }
      ],
      detection: {
        statusCodes: [200, 201],
        authBypassed: true
      },
      defaultSeverity: 'critical',
      cweId: 'CWE-327',
      owaspCategory: 'owasp-api-2',
      builtIn: true,
      enabled: true
    }
  ];

  for (const test of builtInTests) {
    await this.findOneAndUpdate(
      { name: test.name, builtIn: true },
      test,
      { upsert: true, new: true }
    );
  }
};

module.exports = mongoose.model('APITestCase', testCaseSchema);
