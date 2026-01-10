const mongoose = require('mongoose');

// Email Schema
const emailSchema = new mongoose.Schema({
  messageId: { type: String, unique: true, required: true },
  from: {
    email: { type: String, required: true },
    name: { type: String },
    domain: { type: String }
  },
  to: [{
    email: { type: String, required: true },
    name: { type: String },
    domain: { type: String }
  }],
  cc: [{
    email: { type: String },
    name: { type: String },
    domain: { type: String }
  }],
  bcc: [{
    email: { type: String },
    name: { type: String },
    domain: { type: String }
  }],
  subject: { type: String, required: true },
  body: {
    text: { type: String },
    html: { type: String }
  },
  attachments: [{
    filename: { type: String },
    contentType: { type: String },
    size: { type: Number },
    hash: { type: String },
    virusScan: {
      status: { type: String, enum: ['clean', 'infected', 'suspicious', 'pending'] },
      threats: [{ type: String }],
      scannedAt: { type: Date }
    }
  }],
  headers: { type: mongoose.Schema.Types.Mixed },
  receivedAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
  size: { type: Number },
  priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' }
});

// Email Security Analysis Schema
const emailAnalysisSchema = new mongoose.Schema({
  emailId: { type: mongoose.Schema.Types.ObjectId, ref: 'Email', required: true },
  messageId: { type: String, required: true },

  // Threat Analysis
  threatScore: { type: Number, min: 0, max: 100, default: 0 },
  threatLevel: {
    type: String,
    enum: ['clean', 'low', 'medium', 'high', 'critical'],
    default: 'clean'
  },
  threats: [{
    type: { type: String, enum: ['phishing', 'malware', 'spam', 'suspicious_links', 'data_leak', 'impersonation'] },
    confidence: { type: Number, min: 0, max: 100 },
    description: { type: String },
    indicators: [{ type: String }]
  }],

  // Content Analysis
  contentAnalysis: {
    language: { type: String },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
    topics: [{ type: String }],
    keywords: [{ type: String }],
    entities: [{
      type: { type: String, enum: ['person', 'organization', 'location', 'email', 'url', 'phone'] },
      value: { type: String },
      confidence: { type: Number }
    }]
  },

  // URL Analysis
  urls: [{
    url: { type: String },
    domain: { type: String },
    isMalicious: { type: Boolean, default: false },
    threatScore: { type: Number, default: 0 },
    categories: [{ type: String }],
    redirectChain: [{ type: String }]
  }],

  // Compliance Analysis
  compliance: {
    gdpr: {
      score: { type: Number, min: 0, max: 100 },
      issues: [{ type: String }],
      recommendations: [{ type: String }]
    },
    hipaa: {
      score: { type: Number, min: 0, max: 100 },
      issues: [{ type: String }],
      recommendations: [{ type: String }]
    },
    pci: {
      score: { type: Number, min: 0, max: 100 },
      issues: [{ type: String }],
      recommendations: [{ type: String }]
    }
  },

  // Processing Metadata
  processingTime: { type: Number }, // in milliseconds
  engines: [{
    name: { type: String },
    version: { type: String },
    result: { type: mongoose.Schema.Types.Mixed },
    processingTime: { type: Number }
  }],

  analyzedAt: { type: Date, default: Date.now },
  analyzerVersion: { type: String }
});

// Quarantine Schema
const quarantineSchema = new mongoose.Schema({
  emailId: { type: mongoose.Schema.Types.ObjectId, ref: 'Email', required: true },
  analysisId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailAnalysis', required: true },
  reason: {
    type: String,
    enum: ['malware', 'phishing', 'spam', 'policy_violation', 'suspicious_content', 'manual_review'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  quarantinedBy: { type: String }, // system or user ID
  quarantinedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  status: {
    type: String,
    enum: ['quarantined', 'released', 'deleted', 'expired'],
    default: 'quarantined'
  },
  actions: [{
    action: {
      type: String,
      enum: ['release', 'delete', 'forward', 'notify_sender', 'notify_recipient']
    },
    performedBy: { type: String },
    performedAt: { type: Date, default: Date.now },
    notes: { type: String }
  }],
  reviewRequired: { type: Boolean, default: false },
  reviewedBy: { type: String },
  reviewedAt: { type: Date }
});

// Email Policy Schema
const emailPolicySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  type: {
    type: String,
    enum: ['content_filter', 'attachment_filter', 'sender_filter', 'recipient_filter', 'size_limit', 'rate_limit'],
    required: true
  },
  conditions: {
    senderDomains: [{ type: String }],
    recipientDomains: [{ type: String }],
    keywords: [{ type: String }],
    fileTypes: [{ type: String }],
    fileSize: { min: Number, max: Number },
    rateLimit: { count: Number, window: Number }, // messages per window (minutes)
    threatScore: { min: Number, max: Number }
  },
  actions: {
    quarantine: { type: Boolean, default: false },
    block: { type: Boolean, default: false },
    tag: { type: String },
    notify: {
      recipients: [{ type: String }],
      template: { type: String }
    },
    // encrypt: { type: Boolean, default: false },
    encryptionType: {
      type: String,
      enum: ['pgp', 's-mime', 'tls', 'none'],
      required: true,
      default: 'none'
    },
    archive: { type: Boolean, default: false }
  },
  priority: { type: Number, default: 0 },
  enabled: { type: Boolean, default: true },
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Email User Schema
const emailUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  domain: { type: String, required: true },
  displayName: { type: String },
  department: { type: String },
  role: { type: String },
  riskProfile: {
    score: { type: Number, min: 0, max: 100, default: 50 },
    level: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    factors: [{ type: String }]
  },
  preferences: {
    quarantineNotifications: { type: Boolean, default: true },
    securityAlerts: { type: Boolean, default: true },
    weeklyReports: { type: Boolean, default: false },
    language: { type: String, default: 'en' }
  },
  statistics: {
    emailsReceived: { type: Number, default: 0 },
    emailsSent: { type: Number, default: 0 },
    threatsBlocked: { type: Number, default: 0 },
    quarantinedEmails: { type: Number, default: 0 },
    lastActivity: { type: Date }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Email Report Schema
const emailReportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'custom', 'incident'],
    required: true
  },
  period: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  summary: {
    totalEmails: { type: Number, default: 0 },
    cleanEmails: { type: Number, default: 0 },
    quarantinedEmails: { type: Number, default: 0 },
    blockedEmails: { type: Number, default: 0 },
    threatBreakdown: {
      phishing: { type: Number, default: 0 },
      malware: { type: Number, default: 0 },
      spam: { type: Number, default: 0 },
      suspicious: { type: Number, default: 0 }
    }
  },
  topThreats: [{
    type: { type: String },
    count: { type: Number },
    percentage: { type: Number }
  }],
  topSenders: [{
    email: { type: String },
    domain: { type: String },
    count: { type: Number },
    threatCount: { type: Number }
  }],
  compliance: {
    gdpr: { score: Number, issues: [String] },
    hipaa: { score: Number, issues: [String] },
    pci: { score: Number, issues: [String] }
  },
  generatedAt: { type: Date, default: Date.now },
  generatedBy: { type: String },
  format: { type: String, enum: ['json', 'pdf', 'html'], default: 'json' }
});

// Email Alert Schema
const emailAlertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['threat_detected', 'policy_violation', 'system_error', 'compliance_issue', 'performance_alert'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  emailId: { type: mongoose.Schema.Types.ObjectId, ref: 'Email' },
  analysisId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailAnalysis' },
  userId: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  status: {
    type: String,
    enum: ['new', 'acknowledged', 'resolved', 'dismissed'],
    default: 'new'
  },
  acknowledgedBy: { type: String },
  acknowledgedAt: { type: Date },
  resolvedBy: { type: String },
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create indexes
emailSchema.index({ 'from.email': 1, receivedAt: -1 });
emailSchema.index({ 'to.email': 1, receivedAt: -1 });
emailSchema.index({ messageId: 1 });
emailSchema.index({ receivedAt: -1 });

emailAnalysisSchema.index({ emailId: 1 });
emailAnalysisSchema.index({ threatScore: -1 });
emailAnalysisSchema.index({ analyzedAt: -1 });

quarantineSchema.index({ status: 1, quarantinedAt: -1 });
quarantineSchema.index({ expiresAt: 1 });

emailPolicySchema.index({ type: 1, enabled: 1, priority: -1 });

emailUserSchema.index({ email: 1 });
emailUserSchema.index({ domain: 1 });

emailReportSchema.index({ type: 1, 'period.startDate': 1, 'period.endDate': 1 });

emailAlertSchema.index({ type: 1, severity: 1, status: 1, createdAt: -1 });

// Create models
const Email = mongoose.model('Email', emailSchema);
const EmailAnalysis = mongoose.model('EmailAnalysis', emailAnalysisSchema);
const Quarantine = mongoose.model('Quarantine', quarantineSchema);
const EmailPolicy = mongoose.model('EmailPolicy', emailPolicySchema);
const EmailUser = mongoose.model('EmailUser', emailUserSchema);
const EmailReport = mongoose.model('EmailReport', emailReportSchema);
const EmailAlert = mongoose.model('EmailAlert', emailAlertSchema);

module.exports = {
  Email,
  EmailAnalysis,
  Quarantine,
  EmailPolicy,
  EmailUser,
  EmailReport,
  EmailAlert
};