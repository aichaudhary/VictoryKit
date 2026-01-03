const mongoose = require('mongoose');

// URL Analysis Schema
const urlAnalysisSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  domain: { type: String, required: true },
  path: { type: String, default: '' },
  query: { type: String, default: '' },

  // Analysis Results
  threatLevel: {
    type: String,
    enum: ['safe', 'suspicious', 'malicious', 'blocked'],
    default: 'safe'
  },
  riskScore: { type: Number, min: 0, max: 100, default: 0 },

  // Content Categories
  categories: [{
    name: { type: String, required: true },
    confidence: { type: Number, min: 0, max: 100, default: 0 },
    source: { type: String }
  }],

  // Threat Intelligence
  malwareDetected: { type: Boolean, default: false },
  phishingDetected: { type: Boolean, default: false },
  spamDetected: { type: Boolean, default: false },

  // Reputation Scores
  reputationScore: { type: Number, min: 0, max: 100, default: 50 },
  trustScore: { type: Number, min: 0, max: 100, default: 50 },

  // Analysis Metadata
  analyzedBy: [{ type: String }], // API sources used
  analysisTimestamp: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },

  // Caching
  cacheExpiry: { type: Date },
  isCached: { type: Boolean, default: false }
});

// Filter Policy Schema
const filterPolicySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  type: {
    type: String,
    enum: ['category_filter', 'url_filter', 'domain_filter', 'keyword_filter', 'time_filter'],
    required: true
  },

  // Policy Rules
  rules: {
    blockedCategories: [{ type: String }],
    blockedUrls: [{ type: String }],
    blockedDomains: [{ type: String }],
    blockedKeywords: [{ type: String }],
    allowedUrls: [{ type: String }],
    allowedDomains: [{ type: String }],

    // Time-based restrictions
    timeRestrictions: {
      enabled: { type: Boolean, default: false },
      allowedHours: {
        start: { type: String }, // HH:MM format
        end: { type: String }
      },
      blockedDays: [{ type: String }] // ['monday', 'tuesday', etc.]
    },

    // Content filtering
    contentFiltering: {
      adultContent: { type: Boolean, default: true },
      gambling: { type: Boolean, default: true },
      violence: { type: Boolean, default: true },
      hateSpeech: { type: Boolean, default: true },
      malware: { type: Boolean, default: true },
      phishing: { type: Boolean, default: true }
    }
  },

  // Policy Scope
  scope: {
    type: {
      type: String,
      enum: ['global', 'user', 'group', 'department'],
      default: 'global'
    },
    targetIds: [{ type: String }] // user IDs, group IDs, etc.
  },

  // Policy Settings
  action: {
    type: String,
    enum: ['block', 'warn', 'log', 'redirect'],
    default: 'block'
  },
  redirectUrl: { type: String },
  customMessage: { type: String },

  // Policy Status
  enabled: { type: Boolean, default: true },
  priority: { type: Number, default: 0 },

  // Metadata
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// User Profile Schema
const userProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  email: { type: String, required: true },

  // User Preferences
  preferences: {
    safeSearch: { type: Boolean, default: true },
    parentalControls: { type: Boolean, default: false },
    contentFiltering: { type: Boolean, default: true },
    realTimeAlerts: { type: Boolean, default: true }
  },

  // Parental Controls
  parentalSettings: {
    enabled: { type: Boolean, default: false },
    ageRestriction: {
      type: String,
      enum: ['child', 'teen', 'adult'],
      default: 'adult'
    },
    timeLimits: {
      dailyLimit: { type: Number }, // minutes
      sessionLimit: { type: Number } // minutes
    },
    blockedCategories: [{ type: String }]
  },

  // Usage Statistics
  statistics: {
    totalRequests: { type: Number, default: 0 },
    blockedRequests: { type: Number, default: 0 },
    suspiciousRequests: { type: Number, default: 0 },
    lastActivity: { type: Date }
  },

  // Custom Policies
  customPolicies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FilterPolicy' }],

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Access Log Schema
const accessLogSchema = new mongoose.Schema({
  userId: { type: String },
  sessionId: { type: String },

  // Request Details
  url: { type: String, required: true },
  domain: { type: String, required: true },
  method: { type: String, default: 'GET' },
  userAgent: { type: String },
  referrer: { type: String },

  // Client Information
  ipAddress: { type: String },
  country: { type: String },
  city: { type: String },
  isp: { type: String },

  // Filtering Results
  action: {
    type: String,
    enum: ['allowed', 'blocked', 'warned', 'redirected'],
    required: true
  },
  reason: { type: String },
  categories: [{ type: String }],
  riskScore: { type: Number, min: 0, max: 100 },

  // Policy Information
  policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'FilterPolicy' },
  policyName: { type: String },

  // Response Details
  responseTime: { type: Number }, // milliseconds
  contentType: { type: String },
  contentLength: { type: Number },

  // Timestamp
  timestamp: { type: Date, default: Date.now }
});

// Alert Schema
const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['threat_detected', 'policy_violation', 'suspicious_activity', 'system_alert'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },

  // Alert Details
  title: { type: String, required: true },
  description: { type: String, required: true },
  details: { type: mongoose.Schema.Types.Mixed },

  // Related Entities
  userId: { type: String },
  url: { type: String },
  domain: { type: String },
  ipAddress: { type: String },

  // Analysis Data
  riskScore: { type: Number, min: 0, max: 100 },
  categories: [{ type: String }],
  threatSources: [{ type: String }],

  // Status
  status: {
    type: String,
    enum: ['new', 'investigating', 'resolved', 'dismissed'],
    default: 'new'
  },
  assignedTo: { type: String },
  resolvedBy: { type: String },
  resolvedAt: { type: Date },

  // Notifications
  notificationsSent: [{ type: String }], // email, slack, etc.
  escalationLevel: { type: Number, default: 0 },

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Report Schema
const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['usage', 'threats', 'compliance', 'performance', 'custom'],
    required: true
  },
  title: { type: String, required: true },
  description: { type: String },

  // Report Parameters
  parameters: {
    dateRange: {
      start: { type: Date },
      end: { type: Date }
    },
    filters: {
      users: [{ type: String }],
      categories: [{ type: String }],
      domains: [{ type: String }],
      riskLevels: [{ type: String }]
    }
  },

  // Report Data
  data: { type: mongoose.Schema.Types.Mixed },

  // Summary Statistics
  summary: {
    totalRequests: { type: Number, default: 0 },
    blockedRequests: { type: Number, default: 0 },
    suspiciousRequests: { type: Number, default: 0 },
    uniqueUsers: { type: Number, default: 0 },
    topCategories: [{ category: String, count: Number }],
    topDomains: [{ domain: String, count: Number }]
  },

  // Report Status
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed'],
    default: 'generating'
  },
  progress: { type: Number, min: 0, max: 100, default: 0 },

  // Generated Files
  fileUrl: { type: String },
  fileSize: { type: Number },

  // Metadata
  generatedBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

// Create indexes
urlAnalysisSchema.index({ url: 1 });
urlAnalysisSchema.index({ domain: 1 });
urlAnalysisSchema.index({ threatLevel: 1 });
urlAnalysisSchema.index({ analysisTimestamp: -1 });

filterPolicySchema.index({ type: 1 });
filterPolicySchema.index({ 'scope.type': 1 });
filterPolicySchema.index({ enabled: 1 });
filterPolicySchema.index({ priority: -1 });

userProfileSchema.index({ userId: 1 });
userProfileSchema.index({ email: 1 });

accessLogSchema.index({ userId: 1 });
accessLogSchema.index({ timestamp: -1 });
accessLogSchema.index({ action: 1 });
accessLogSchema.index({ domain: 1 });

alertSchema.index({ type: 1 });
alertSchema.index({ severity: 1 });
alertSchema.index({ status: 1 });
alertSchema.index({ createdAt: -1 });

reportSchema.index({ type: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ createdAt: -1 });

// Create models
const UrlAnalysis = mongoose.model('UrlAnalysis', urlAnalysisSchema);
const FilterPolicy = mongoose.model('FilterPolicy', filterPolicySchema);
const UserProfile = mongoose.model('UserProfile', userProfileSchema);
const AccessLog = mongoose.model('AccessLog', accessLogSchema);
const Alert = mongoose.model('Alert', alertSchema);
const Report = mongoose.model('Report', reportSchema);

module.exports = {
  UrlAnalysis,
  FilterPolicy,
  UserProfile,
  AccessLog,
  Alert,
  Report
};