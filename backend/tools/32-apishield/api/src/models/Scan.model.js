const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: true
  },
  specId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'APISpec'
  },
  targetUrl: {
    type: String,
    required: true
  },

  // Scan Configuration
  scanType: {
    type: String,
    enum: ['full', 'quick', 'auth-only', 'injection', 'fuzzing', 'custom'],
    default: 'full'
  },
  scanProfile: {
    type: String,
    enum: ['passive', 'active', 'aggressive'],
    default: 'active'
  },
  
  // Test Categories
  testCategories: [{
    type: String,
    enum: [
      'owasp-top-10',
      'injection',
      'auth-testing',
      'rate-limiting',
      'data-exposure',
      'business-logic',
      'fuzzing',
      'graphql',
      'jwt',
      'cors',
      'headers'
    ]
  }],

  // Authentication for Target
  authentication: {
    type: {
      type: String,
      enum: ['none', 'bearer', 'apiKey', 'basic', 'oauth2', 'custom']
    },
    token: String,
    apiKey: String,
    apiKeyLocation: String,
    apiKeyName: String,
    username: String,
    password: String,
    customHeaders: mongoose.Schema.Types.Mixed
  },

  // Scan Status
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled', 'paused'],
    default: 'pending'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  currentPhase: {
    type: String,
    enum: ['init', 'discovery', 'testing', 'fuzzing', 'analysis', 'reporting', 'done']
  },
  currentEndpoint: String,
  currentTest: String,

  // Timing
  startedAt: Date,
  completedAt: Date,
  duration: Number, // in seconds
  estimatedTimeRemaining: Number,

  // Results Summary
  results: {
    totalEndpoints: { type: Number, default: 0 },
    testedEndpoints: { type: Number, default: 0 },
    totalRequests: { type: Number, default: 0 },
    
    vulnerabilities: {
      critical: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
      info: { type: Number, default: 0 }
    },
    
    securityScore: {
      type: Number,
      min: 0,
      max: 100
    },
    
    categories: [{
      name: String,
      count: Number,
      severity: String
    }],

    owaspCoverage: [{
      category: String,
      tested: Boolean,
      passed: Boolean,
      findings: Number
    }]
  },

  // Errors & Warnings
  errors: [{
    timestamp: Date,
    endpoint: String,
    message: String,
    code: String
  }],
  warnings: [String],

  // Settings
  settings: {
    maxRequestsPerSecond: { type: Number, default: 10 },
    requestTimeout: { type: Number, default: 30000 },
    followRedirects: { type: Boolean, default: true },
    maxRedirects: { type: Number, default: 5 },
    verifySsl: { type: Boolean, default: true },
    userAgent: String,
    excludePatterns: [String],
    includePatterns: [String]
  },

  // Metadata
  triggeredBy: {
    type: String,
    enum: ['manual', 'scheduled', 'ci-cd', 'webhook'],
    default: 'manual'
  },
  cicdInfo: {
    provider: String,
    buildId: String,
    branch: String,
    commitHash: String
  }

}, {
  timestamps: true
});

// Indexes
scanSchema.index({ status: 1, createdAt: -1 });
scanSchema.index({ specId: 1 });

module.exports = mongoose.model('APIScan', scanSchema);
