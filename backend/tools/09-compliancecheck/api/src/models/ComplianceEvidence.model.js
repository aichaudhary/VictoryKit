/**
 * ComplianceEvidence Model - Evidence Document Management
 * Tool 09 - ComplianceCheck
 * 
 * Comprehensive evidence tracking with validation,
 * expiry management, and automated collection
 */

const mongoose = require('mongoose');

const evidenceVersionSchema = new mongoose.Schema({
  version: { type: Number, required: true },
  fileUrl: { type: String, required: true },
  fileName: { type: String },
  fileSize: { type: Number },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now },
  notes: { type: String },
  checksum: { type: String }
}, { _id: false });

const validationResultSchema = new mongoose.Schema({
  validatedAt: { type: Date, default: Date.now },
  validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  validationType: { 
    type: String, 
    enum: ['manual', 'automated', 'ai-assisted'] 
  },
  isValid: { type: Boolean, required: true },
  validationScore: { type: Number, min: 0, max: 100 },
  findings: [{ type: String }],
  issues: [{
    severity: { type: String, enum: ['critical', 'high', 'medium', 'low', 'info'] },
    description: String,
    recommendation: String
  }],
  aiAnalysis: {
    confidence: { type: Number, min: 0, max: 100 },
    extractedData: { type: mongoose.Schema.Types.Mixed },
    suggestions: [{ type: String }],
    matchedControls: [{ type: String }]
  }
}, { _id: false });

const complianceEvidenceSchema = new mongoose.Schema({
  // Identification
  evidenceId: { 
    type: String, 
    required: true, 
    unique: true,
    default: function() {
      return `EVID-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
  },
  
  // Relationships
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'ComplianceAssessment' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  controlIds: [{ type: String }], // Controls this evidence supports
  frameworkIds: [{ type: String }], // Applicable frameworks
  
  // Evidence Information
  name: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    enum: [
      'policy', 'procedure', 'standard', 'guideline',
      'configuration', 'screenshot', 'log', 'report',
      'attestation', 'certificate', 'contract', 'training',
      'assessment', 'audit-report', 'vulnerability-scan',
      'penetration-test', 'code-review', 'incident-record',
      'risk-assessment', 'business-continuity', 'other'
    ],
    required: true
  },
  subcategory: { type: String },
  
  // Evidence Type & Source
  evidenceType: { 
    type: String, 
    enum: ['document', 'screenshot', 'log', 'config', 'attestation', 'video', 'automated', 'interview', 'observation'],
    required: true 
  },
  source: {
    type: { 
      type: String, 
      enum: ['manual-upload', 'automated-collection', 'integration', 'link', 'attestation'],
      default: 'manual-upload'
    },
    provider: { type: String }, // e.g., 'aws-config', 'vanta', 'jira'
    integrationId: { type: String },
    externalId: { type: String },
    collectedAt: { type: Date }
  },
  
  // File Information
  file: {
    url: { type: String },
    bucket: { type: String },
    key: { type: String },
    fileName: { type: String },
    originalName: { type: String },
    mimeType: { type: String },
    fileSize: { type: Number },
    checksum: { type: String },
    encryptionStatus: { 
      type: String, 
      enum: ['encrypted', 'unencrypted', 'pending'],
      default: 'pending'
    }
  },
  
  // For link-based evidence
  externalLink: {
    url: { type: String },
    title: { type: String },
    lastVerified: { type: Date },
    isAccessible: { type: Boolean }
  },
  
  // For attestation-based evidence
  attestation: {
    statement: { type: String },
    attestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    attestedAt: { type: Date },
    attestorTitle: { type: String },
    attestorEmail: { type: String },
    signatureUrl: { type: String }
  },
  
  // Version Control
  currentVersion: { type: Number, default: 1 },
  versions: [evidenceVersionSchema],
  
  // Status & Lifecycle
  status: { 
    type: String, 
    enum: ['draft', 'pending-review', 'approved', 'rejected', 'expired', 'archived'],
    default: 'draft' 
  },
  reviewStatus: {
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    reviewNotes: { type: String },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'requires-changes'] }
  },
  
  // Validity Period
  validity: {
    effectiveDate: { type: Date, default: Date.now },
    expiryDate: { type: Date },
    renewalDate: { type: Date },
    isExpired: { type: Boolean, default: false },
    reminderSent: { type: Boolean, default: false },
    reminderDate: { type: Date }
  },
  
  // Collection Frequency (for automated evidence)
  collection: {
    isRecurring: { type: Boolean, default: false },
    frequency: { 
      type: String, 
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'annually', 'on-demand'] 
    },
    lastCollected: { type: Date },
    nextCollection: { type: Date },
    collectionConfig: { type: mongoose.Schema.Types.Mixed }
  },
  
  // Validation
  validation: validationResultSchema,
  validationHistory: [validationResultSchema],
  
  // AI Analysis
  aiExtraction: {
    processedAt: { type: Date },
    extractedText: { type: String },
    detectedLanguage: { type: String },
    entities: [{
      type: { type: String },
      value: String,
      confidence: Number
    }],
    suggestedControls: [{ type: String }],
    complianceIndicators: [{
      indicator: String,
      present: Boolean,
      location: String
    }],
    riskIndicators: [{
      risk: String,
      severity: String,
      description: String
    }]
  },
  
  // Metadata
  tags: [{ type: String }],
  labels: [{
    key: String,
    value: String
  }],
  notes: { type: String },
  
  // Ownership & Access
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  accessControl: {
    visibility: { 
      type: String, 
      enum: ['private', 'team', 'organization', 'auditor'],
      default: 'organization'
    },
    allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    allowedRoles: [{ type: String }]
  },
  
  // Audit Trail
  auditLog: [{
    action: { type: String },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    performedAt: { type: Date, default: Date.now },
    details: { type: mongoose.Schema.Types.Mixed },
    ipAddress: { type: String }
  }]
}, {
  timestamps: true,
  collection: 'compliance_evidence'
});

// Indexes
complianceEvidenceSchema.index({ evidenceId: 1 }, { unique: true });
complianceEvidenceSchema.index({ assessmentId: 1, status: 1 });
complianceEvidenceSchema.index({ organizationId: 1, category: 1 });
complianceEvidenceSchema.index({ controlIds: 1 });
complianceEvidenceSchema.index({ frameworkIds: 1 });
complianceEvidenceSchema.index({ 'validity.expiryDate': 1, 'validity.isExpired': 1 });
complianceEvidenceSchema.index({ status: 1, category: 1 });
complianceEvidenceSchema.index({ tags: 1 });
complianceEvidenceSchema.index({ uploadedBy: 1 });

// Virtual for checking if evidence is current
complianceEvidenceSchema.virtual('isCurrent').get(function() {
  if (!this.validity.expiryDate) return true;
  return new Date() < this.validity.expiryDate;
});

// Virtual for days until expiry
complianceEvidenceSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.validity.expiryDate) return null;
  const diff = this.validity.expiryDate - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Pre-save hook to check expiry
complianceEvidenceSchema.pre('save', function(next) {
  if (this.validity.expiryDate && new Date() > this.validity.expiryDate) {
    this.validity.isExpired = true;
    if (this.status === 'approved') {
      this.status = 'expired';
    }
  }
  next();
});

// Methods
complianceEvidenceSchema.methods.addVersion = function(fileUrl, fileName, fileSize, uploadedBy, notes) {
  this.currentVersion++;
  this.versions.push({
    version: this.currentVersion,
    fileUrl,
    fileName,
    fileSize,
    uploadedBy,
    uploadedAt: new Date(),
    notes
  });
  
  this.file.url = fileUrl;
  this.file.fileName = fileName;
  this.file.fileSize = fileSize;
  
  this.addAuditLog('version-added', uploadedBy, { version: this.currentVersion, notes });
};

complianceEvidenceSchema.methods.validate = function(validatedBy, isValid, validationType, findings, score) {
  const validation = {
    validatedAt: new Date(),
    validatedBy,
    validationType,
    isValid,
    validationScore: score,
    findings
  };
  
  // Store current validation in history
  if (this.validation) {
    this.validationHistory.push(this.validation);
  }
  
  this.validation = validation;
  this.addAuditLog('validated', validatedBy, { isValid, score });
};

complianceEvidenceSchema.methods.approve = function(reviewedBy, notes) {
  this.status = 'approved';
  this.reviewStatus = {
    reviewedBy,
    reviewedAt: new Date(),
    reviewNotes: notes,
    approvalStatus: 'approved'
  };
  this.addAuditLog('approved', reviewedBy, { notes });
};

complianceEvidenceSchema.methods.reject = function(reviewedBy, notes) {
  this.status = 'rejected';
  this.reviewStatus = {
    reviewedBy,
    reviewedAt: new Date(),
    reviewNotes: notes,
    approvalStatus: 'rejected'
  };
  this.addAuditLog('rejected', reviewedBy, { notes });
};

complianceEvidenceSchema.methods.addAuditLog = function(action, userId, details, ipAddress = null) {
  this.auditLog.push({
    action,
    performedBy: userId,
    performedAt: new Date(),
    details,
    ipAddress
  });
};

complianceEvidenceSchema.methods.linkToControls = function(controlIds) {
  const newControls = controlIds.filter(id => !this.controlIds.includes(id));
  this.controlIds.push(...newControls);
  return newControls;
};

// Static methods
complianceEvidenceSchema.statics.getEvidenceByControl = function(controlId, assessmentId = null) {
  const query = { controlIds: controlId, status: 'approved' };
  if (assessmentId) query.assessmentId = assessmentId;
  return this.find(query).sort({ createdAt: -1 });
};

complianceEvidenceSchema.statics.getExpiringEvidence = function(organizationId, daysAhead = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);
  
  return this.find({
    organizationId,
    status: 'approved',
    'validity.isExpired': false,
    'validity.expiryDate': { $lte: futureDate, $gte: new Date() }
  }).sort({ 'validity.expiryDate': 1 });
};

complianceEvidenceSchema.statics.getExpiredEvidence = function(organizationId) {
  return this.find({
    organizationId,
    'validity.isExpired': true
  });
};

complianceEvidenceSchema.statics.getEvidenceByCategory = function(category, organizationId) {
  return this.find({ 
    category, 
    organizationId,
    status: { $in: ['approved', 'pending-review'] }
  }).sort({ createdAt: -1 });
};

complianceEvidenceSchema.statics.getEvidenceStats = function(assessmentId) {
  return this.aggregate([
    { $match: { assessmentId: mongoose.Types.ObjectId(assessmentId) } },
    { $group: {
      _id: '$status',
      count: { $sum: 1 }
    }}
  ]);
};

module.exports = mongoose.model('ComplianceEvidence', complianceEvidenceSchema);
