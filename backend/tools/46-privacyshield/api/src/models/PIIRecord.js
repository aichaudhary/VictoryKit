const mongoose = require('mongoose');

/**
 * PIIRecord Model - Personally Identifiable Information Detection & Tracking
 * Stores detected PII across systems with classification, remediation status
 */
const PIIRecordSchema = new mongoose.Schema({
  // Unique identifier
  recordId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Detection details
  detectionSource: {
    sourceType: {
      type: String,
      enum: ['database', 'file', 'api', 'email', 'document', 'log', 'backup', 'cloud_storage', 'local_storage', 'memory'],
      required: true
    },
    sourceName: String, // Database name, filename, API endpoint
    sourceLocation: String, // Full path or URL
    tableName: String, // For database sources
    columnName: String, // For database sources
    lineNumber: Number, // For file sources
    detectedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },

  // PII Classification
  piiCategory: {
    type: String,
    enum: [
      'identifiers', // name, email, phone, SSN
      'financial', // credit card, bank account
      'health', // medical records, diagnoses
      'biometric', // fingerprint, facial recognition
      'location', // GPS, IP address, address
      'online_identifiers', // cookies, device IDs
      'demographic', // age, gender, race
      'behavioral', // browsing history, preferences
      'special_category' // GDPR Article 9 - sensitive data
    ],
    required: true,
    index: true
  },

  // Specific PII type
  piiType: {
    type: String,
    enum: [
      // Identifiers
      'full_name', 'email', 'phone_number', 'ssn', 'passport', 'drivers_license', 'national_id',
      // Financial
      'credit_card', 'bank_account', 'routing_number', 'iban', 'swift_code', 'crypto_wallet',
      // Health
      'medical_record', 'diagnosis', 'prescription', 'health_insurance', 'biometric_health',
      // Biometric
      'fingerprint', 'facial_recognition', 'iris_scan', 'voice_pattern', 'dna', 'retina',
      // Location
      'gps_coordinates', 'ip_address', 'mac_address', 'address', 'zip_code', 'geofence',
      // Online
      'cookie_id', 'device_id', 'session_id', 'advertising_id', 'user_agent',
      // Demographic
      'age', 'date_of_birth', 'gender', 'race', 'ethnicity', 'religion', 'political_opinion',
      // Behavioral
      'browsing_history', 'search_history', 'purchase_history', 'preferences'
    ],
    required: true
  },

  // Detected value (masked for security)
  detectedValue: {
    original: String, // Full value (encrypted in production)
    masked: String, // e.g., "****@example.com", "****-****-1234"
    hash: String, // SHA256 hash for deduplication
    length: Number
  },

  // Detection confidence
  confidence: {
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    detectionMethod: {
      type: String,
      enum: ['regex', 'nlp', 'ml_classifier', 'pattern_matching', 'dictionary', 'heuristic', 'manual'],
      required: true
    },
    validationStatus: {
      type: String,
      enum: ['auto_validated', 'manually_validated', 'false_positive', 'pending_review'],
      default: 'pending_review'
    }
  },

  // Data Subject association
  dataSubject: {
    identified: Boolean,
    dataSubjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DataSubject'
    },
    email: String,
    name: String
  },

  // Context information
  context: {
    purpose: String, // Why this data is collected
    legalBasis: {
      type: String,
      enum: ['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests']
    },
    retentionPeriod: String,
    dataClassification: {
      type: String,
      enum: ['public', 'internal', 'confidential', 'restricted', 'highly_confidential']
    }
  },

  // Sensitivity assessment
  sensitivity: {
    level: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    isSpecialCategory: Boolean, // GDPR Article 9
    isSensitiveUnderCCPA: Boolean,
    isPHI: Boolean, // HIPAA Protected Health Information
    isPCI: Boolean // PCI DSS payment card data
  },

  // Compliance frameworks
  frameworks: [{
    framework: {
      type: String,
      enum: ['gdpr', 'ccpa', 'pipeda', 'lgpd', 'hipaa', 'pci_dss', 'coppa']
    },
    applicable: Boolean,
    protectionRequired: Boolean
  }],

  // Remediation
  remediation: {
    status: {
      type: String,
      enum: ['detected', 'under_review', 'approved', 'requires_action', 'remediated', 'false_positive', 'accepted_risk'],
      default: 'detected',
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    actions: [{
      actionType: {
        type: String,
        enum: ['encrypt', 'mask', 'anonymize', 'delete', 'relocate', 'access_control', 'document', 'accept_risk']
      },
      actionTaken: String,
      takenBy: String,
      takenAt: Date,
      notes: String
    }],
    assignedTo: String,
    dueDate: Date,
    completedAt: Date,
    remediationNotes: String
  },

  // Risk assessment
  risk: {
    riskScore: {
      type: Number,
      min: 0,
      max: 100
    },
    impactIfExposed: {
      type: String,
      enum: ['negligible', 'low', 'moderate', 'high', 'severe']
    },
    likelihood: {
      type: String,
      enum: ['rare', 'unlikely', 'possible', 'likely', 'certain']
    },
    mitigations: [String]
  },

  // Storage and access
  storage: {
    encrypted: Boolean,
    encryptionMethod: String,
    accessControls: [String],
    backupIncluded: Boolean,
    geographicLocation: String
  },

  // Audit trail
  auditLog: [{
    action: String,
    performedBy: String,
    performedAt: {
      type: Date,
      default: Date.now
    },
    details: String
  }],

  // Metadata
  tags: [String],
  notes: String,
  lastReviewedAt: Date,
  lastReviewedBy: String,
  nextReviewDate: Date

}, {
  timestamps: true,
  collection: 'pii_records'
});

// Indexes
PIIRecordSchema.index({ 'detectionSource.sourceType': 1, 'piiCategory': 1 });
PIIRecordSchema.index({ 'sensitivity.level': 1, 'remediation.status': 1 });
PIIRecordSchema.index({ 'confidence.score': 1, 'confidence.validationStatus': 1 });
PIIRecordSchema.index({ 'detectedValue.hash': 1 });
PIIRecordSchema.index({ 'dataSubject.dataSubjectId': 1 });

// Virtual: Risk level
PIIRecordSchema.virtual('isHighRisk').get(function() {
  return this.sensitivity.level === 'critical' || this.sensitivity.level === 'high';
});

// Virtual: Requires immediate action
PIIRecordSchema.virtual('requiresImmediateAction').get(function() {
  return this.remediation.status === 'requires_action' && this.remediation.priority === 'critical';
});

// Instance method: Mask PII value
PIIRecordSchema.methods.maskValue = function(value, type) {
  if (!value) return '****';
  
  switch(type) {
    case 'email':
      const [local, domain] = value.split('@');
      return `${local.substring(0, 2)}****@${domain}`;
    case 'phone_number':
      return `****-****-${value.slice(-4)}`;
    case 'ssn':
      return `***-**-${value.slice(-4)}`;
    case 'credit_card':
      return `****-****-****-${value.slice(-4)}`;
    default:
      return value.length > 4 ? `${'*'.repeat(value.length - 4)}${value.slice(-4)}` : '****';
  }
};

// Instance method: Calculate risk score
PIIRecordSchema.methods.calculateRiskScore = function() {
  let score = 0;
  
  // Sensitivity weight (40%)
  const sensitivityScores = { low: 10, medium: 20, high: 30, critical: 40 };
  score += sensitivityScores[this.sensitivity.level] || 0;
  
  // Special category bonus (20%)
  if (this.sensitivity.isSpecialCategory) score += 20;
  
  // Encryption status (20%)
  if (!this.storage.encrypted) score += 20;
  
  // Access controls (10%)
  if (!this.storage.accessControls || this.storage.accessControls.length === 0) score += 10;
  
  // Remediation status (10%)
  if (this.remediation.status === 'detected' || this.remediation.status === 'requires_action') {
    score += 10;
  }
  
  this.risk.riskScore = Math.min(score, 100);
  return this.risk.riskScore;
};

// Instance method: Add remediation action
PIIRecordSchema.methods.addRemediationAction = function(actionType, actionDetails, user) {
  this.remediation.actions.push({
    actionType,
    actionTaken: actionDetails,
    takenBy: user,
    takenAt: new Date()
  });
  
  this.auditLog.push({
    action: `Remediation action: ${actionType}`,
    performedBy: user,
    details: actionDetails
  });
  
  return this.save();
};

// Instance method: Mark as remediated
PIIRecordSchema.methods.markRemediated = function(notes, user) {
  this.remediation.status = 'remediated';
  this.remediation.completedAt = new Date();
  this.remediation.remediationNotes = notes;
  
  this.auditLog.push({
    action: 'Marked as remediated',
    performedBy: user,
    details: notes
  });
  
  return this.save();
};

// Static: Find high-risk PII
PIIRecordSchema.statics.findHighRisk = function() {
  return this.find({
    $or: [
      { 'sensitivity.level': { $in: ['high', 'critical'] } },
      { 'sensitivity.isSpecialCategory': true },
      { 'risk.riskScore': { $gte: 70 } }
    ]
  }).sort({ 'risk.riskScore': -1 });
};

// Static: Find unremediated PII
PIIRecordSchema.statics.findUnremediated = function() {
  return this.find({
    'remediation.status': { $in: ['detected', 'under_review', 'requires_action'] }
  }).sort({ 'remediation.priority': -1, 'detectionSource.detectedAt': 1 });
};

// Static: Find PII by data subject
PIIRecordSchema.statics.findByDataSubject = function(dataSubjectId) {
  return this.find({ 'dataSubject.dataSubjectId': dataSubjectId });
};

// Static: Get PII statistics
PIIRecordSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $facet: {
        byCategory: [
          { $group: { _id: '$piiCategory', count: { $sum: 1 } } }
        ],
        bySensitivity: [
          { $group: { _id: '$sensitivity.level', count: { $sum: 1 } } }
        ],
        byStatus: [
          { $group: { _id: '$remediation.status', count: { $sum: 1 } } }
        ],
        highRisk: [
          { $match: { 'sensitivity.level': { $in: ['high', 'critical'] } } },
          { $count: 'count' }
        ],
        unencrypted: [
          { $match: { 'storage.encrypted': false } },
          { $count: 'count' }
        ]
      }
    }
  ]);
  
  return stats[0];
};

// Pre-save: Auto-calculate risk score
PIIRecordSchema.pre('save', function(next) {
  if (this.isModified('sensitivity') || this.isModified('storage') || this.isModified('remediation.status')) {
    this.calculateRiskScore();
  }
  next();
});

module.exports = mongoose.model('PIIRecord', PIIRecordSchema);
