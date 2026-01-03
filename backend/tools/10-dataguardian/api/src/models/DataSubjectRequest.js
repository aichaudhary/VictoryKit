const mongoose = require('mongoose');

/**
 * Data Subject Request (DSR/DSAR) Model
 * Tracks GDPR Article 15-22 requests: Access, Rectification, Erasure, Portability, etc.
 */
const dataSubjectRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Request Information
  requestId: { type: String, unique: true, required: true },
  type: { 
    type: String, 
    enum: [
      'access',           // Right to access (GDPR Art. 15)
      'rectification',    // Right to rectification (GDPR Art. 16)
      'erasure',          // Right to erasure/deletion (GDPR Art. 17)
      'restriction',      // Right to restriction (GDPR Art. 18)
      'portability',      // Right to data portability (GDPR Art. 20)
      'objection',        // Right to object (GDPR Art. 21)
      'automated-decision', // Rights related to automated decisions (GDPR Art. 22)
      'opt-out',          // CCPA opt-out of sale
      'disclosure',       // CCPA right to know
      'deletion'          // CCPA deletion request
    ],
    required: true 
  },
  
  // Data Subject Information
  dataSubject: {
    email: { type: String, required: true },
    firstName: String,
    lastName: String,
    phone: String,
    alternateEmail: String,
    identifiers: [{
      type: { type: String, enum: ['customer_id', 'account_id', 'user_id', 'device_id', 'ip_address', 'cookie_id'] },
      value: String
    }],
    verificationStatus: { 
      type: String, 
      enum: ['pending', 'verified', 'failed', 'bypassed'], 
      default: 'pending' 
    },
    verificationMethod: { type: String, enum: ['email', 'phone', 'document', 'oauth', 'knowledge'] },
    verifiedAt: Date
  },
  
  // Applicable Regulations
  regulation: { 
    type: String, 
    enum: ['gdpr', 'ccpa', 'lgpd', 'pipeda', 'pdpa', 'hipaa', 'other'],
    required: true 
  },
  jurisdiction: String,
  
  // Request Details
  details: {
    description: String,
    specificData: [String], // Specific data types requested
    dataCategories: [String],
    dataSources: [String],
    timeRange: {
      from: Date,
      to: Date
    },
    format: { type: String, enum: ['json', 'csv', 'pdf', 'xml'], default: 'json' },
    deliveryMethod: { type: String, enum: ['email', 'portal', 'secure_link', 'mail'], default: 'email' }
  },
  
  // Discovery Results
  discovery: {
    status: { type: String, enum: ['pending', 'in-progress', 'completed', 'failed'], default: 'pending' },
    startedAt: Date,
    completedAt: Date,
    dataSources: [{
      source: String,
      sourceType: { type: String, enum: ['database', 'file-storage', 'api', 'application', 'cloud-service'] },
      recordsFound: Number,
      status: { type: String, enum: ['pending', 'scanning', 'completed', 'error'] },
      error: String
    }],
    totalRecords: { type: Number, default: 0 },
    dataCategories: [{
      category: String,
      count: Number,
      locations: [String]
    }]
  },
  
  // Processing Status
  status: { 
    type: String, 
    enum: [
      'received',      // Request received
      'pending',       // Awaiting verification
      'verified',      // Identity verified
      'processing',    // Being processed
      'review',        // Pending review
      'completed',     // Request fulfilled
      'denied',        // Request denied
      'partially-completed', // Partially fulfilled
      'cancelled'      // Cancelled by data subject
    ], 
    default: 'received' 
  },
  
  // Timeline & SLA
  timeline: {
    receivedAt: { type: Date, default: Date.now },
    acknowledgedAt: Date,
    verifiedAt: Date,
    processingStartedAt: Date,
    dueDate: Date,
    completedAt: Date,
    extensionRequested: { type: Boolean, default: false },
    extensionReason: String,
    originalDueDate: Date
  },
  
  // Actions Taken
  actions: [{
    action: { 
      type: String, 
      enum: ['acknowledged', 'identity_verified', 'data_collected', 'data_reviewed', 'data_exported', 'data_deleted', 'data_rectified', 'response_sent', 'extended', 'denied', 'escalated'] 
    },
    performedBy: String,
    performedAt: { type: Date, default: Date.now },
    notes: String,
    affectedRecords: Number,
    dataSources: [String]
  }],
  
  // Response
  response: {
    status: { type: String, enum: ['pending', 'approved', 'denied', 'partial'] },
    method: { type: String, enum: ['email', 'portal', 'secure_link', 'mail'] },
    sentAt: Date,
    expiresAt: Date,
    downloadLink: String,
    denialReason: String,
    partialReason: String,
    recordsProvided: Number,
    recordsDeleted: Number,
    recordsRectified: Number
  },
  
  // AI Analysis
  aiAnalysis: {
    riskScore: { type: Number, min: 0, max: 100 },
    complexity: { type: String, enum: ['low', 'medium', 'high'] },
    estimatedEffort: String,
    recommendations: [String],
    potentialIssues: [String],
    analyzedAt: Date
  },
  
  // Audit Trail
  auditLog: [{
    event: String,
    actor: String,
    timestamp: { type: Date, default: Date.now },
    details: mongoose.Schema.Types.Mixed,
    ipAddress: String
  }],
  
  // Assignee
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  
  // Notes
  internalNotes: String,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for efficient queries
dataSubjectRequestSchema.index({ userId: 1, status: 1 });
dataSubjectRequestSchema.index({ 'dataSubject.email': 1 });
dataSubjectRequestSchema.index({ requestId: 1 });
dataSubjectRequestSchema.index({ type: 1, status: 1 });
dataSubjectRequestSchema.index({ 'timeline.dueDate': 1, status: 1 });
dataSubjectRequestSchema.index({ regulation: 1 });
dataSubjectRequestSchema.index({ createdAt: -1 });

// Pre-save hook to generate request ID and update timestamps
dataSubjectRequestSchema.pre('save', function(next) {
  if (!this.requestId) {
    const prefix = this.type.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.requestId = `DSR-${prefix}-${timestamp}-${random}`;
  }
  
  // Set due date based on regulation
  if (!this.timeline.dueDate && this.timeline.receivedAt) {
    const receivedDate = new Date(this.timeline.receivedAt);
    const daysToAdd = this.regulation === 'gdpr' ? 30 : 
                      this.regulation === 'ccpa' ? 45 : 
                      this.regulation === 'lgpd' ? 15 : 30;
    this.timeline.dueDate = new Date(receivedDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  }
  
  this.updatedAt = new Date();
  next();
});

// Virtual for days remaining
dataSubjectRequestSchema.virtual('daysRemaining').get(function() {
  if (!this.timeline.dueDate || this.status === 'completed' || this.status === 'denied') return null;
  const now = new Date();
  const due = new Date(this.timeline.dueDate);
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
});

// Virtual for is overdue
dataSubjectRequestSchema.virtual('isOverdue').get(function() {
  if (this.status === 'completed' || this.status === 'denied' || this.status === 'cancelled') return false;
  return this.daysRemaining !== null && this.daysRemaining < 0;
});

module.exports = mongoose.model('DataSubjectRequest', dataSubjectRequestSchema);
