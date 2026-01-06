const mongoose = require('mongoose');

const dataClassificationSchema = new mongoose.Schema({
  fileId: {
    type: String,
    required: true,
    unique: true,
    default: () => `FILE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },
  
  // Location Information
  path: {
    type: String,
    required: true
  },
  location: {
    type: String,
    enum: ['local', 'network', 'cloud', 'database', 'email', 'sharepoint', 'other'],
    required: true
  },
  cloudProvider: {
    type: String,
    enum: ['aws', 'azure', 'gcp', 'dropbox', 'onedrive', 'google_drive', 'box', 'other']
  },
  
  // Classification
  classification: {
    type: String,
    enum: ['Public', 'Internal', 'Confidential', 'Restricted'],
    required: true
  },
  autoClassified: {
    type: Boolean,
    default: true
  },
  manualOverride: {
    classification: String,
    reason: String,
    overriddenBy: {
      userId: String,
      name: String
    },
    timestamp: Date
  },
  
  // Data Types Detected
  dataTypes: [{
    type: {
      type: String,
      enum: ['PII', 'PHI', 'PCI', 'SSN', 'Credit Card', 'Email', 'Phone', 
             'Passport', 'Driver License', 'Financial', 'Medical', 
             'Trade Secret', 'Intellectual Property', 'Source Code', 'Other']
    },
    instances: Number, // Count of detected instances
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    locations: [{
      lineNumber: Number,
      columnNumber: Number,
      snippet: String // Redacted snippet
    }]
  }],
  
  // File Metadata
  fileName: String,
  fileType: String,
  mimeType: String,
  size: Number, // bytes
  hash: {
    md5: String,
    sha256: String
  },
  
  // Ownership
  owner: {
    userId: String,
    name: String,
    email: String,
    department: String
  },
  sharedWith: [{
    userId: String,
    name: String,
    permissions: [String]
  }],
  
  // Timestamps
  created: Date,
  lastModified: Date,
  lastAccessed: Date,
  
  // ML Analysis
  mlConfidence: {
    type: Number,
    min: 0,
    max: 1
  },
  mlModel: {
    name: String,
    version: String
  },
  contentAnalysis: {
    language: String,
    documentType: {
      type: String,
      enum: ['contract', 'financial_report', 'medical_record', 'source_code', 
             'presentation', 'spreadsheet', 'email', 'other']
    },
    topics: [String],
    keywords: [String],
    entities: [{
      type: String,
      value: String,
      confidence: Number
    }]
  },
  
  // Scan Information
  scanId: String,
  scannedAt: {
    type: Date,
    default: Date.now
  },
  scanType: {
    type: String,
    enum: ['full', 'quick', 'targeted', 'scheduled']
  },
  
  // Security & Compliance
  encrypted: {
    type: Boolean,
    default: false
  },
  encryptionType: String,
  compliance: {
    gdpr: {
      applicable: Boolean,
      hasConsent: Boolean,
      retentionExpiry: Date
    },
    hipaa: {
      applicable: Boolean,
      baaSigned: Boolean
    },
    pciDss: {
      applicable: Boolean,
      inScope: Boolean
    }
  },
  
  // Risk Assessment
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  riskFactors: [{
    factor: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    description: String
  }],
  
  // Data Lineage
  lineage: {
    origin: String,
    parentFiles: [String],
    derivedFrom: [String],
    copies: [{
      location: String,
      timestamp: Date
    }]
  },
  
  // Tags and Metadata
  tags: [String],
  labels: [{
    key: String,
    value: String
  }],
  customMetadata: mongoose.Schema.Types.Mixed,
  
  // Actions Taken
  actionHistory: [{
    action: {
      type: String,
      enum: ['quarantined', 'encrypted', 'deleted', 'moved', 'shared', 'accessed', 'modified']
    },
    performedBy: {
      userId: String,
      name: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String
  }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'quarantined', 'deleted', 'archived', 'under_review'],
    default: 'active'
  },
  reviewRequired: {
    type: Boolean,
    default: false
  },
  reviewNotes: String
}, {
  timestamps: true
});

// Indexes
dataClassificationSchema.index({ fileId: 1 });
dataClassificationSchema.index({ path: 1 });
dataClassificationSchema.index({ classification: 1 });
dataClassificationSchema.index({ location: 1 });
dataClassificationSchema.index({ 'owner.userId': 1 });
dataClassificationSchema.index({ 'dataTypes.type': 1 });
dataClassificationSchema.index({ riskScore: -1 });
dataClassificationSchema.index({ scannedAt: -1 });
dataClassificationSchema.index({ status: 1 });

// Methods
dataClassificationSchema.methods.calculateRiskScore = function() {
  let score = 0;
  
  // Classification weight
  const classWeight = {
    'Public': 0,
    'Internal': 25,
    'Confidential': 60,
    'Restricted': 85
  };
  score += classWeight[this.classification] || 0;
  
  // Data types weight
  const criticalTypes = ['PHI', 'PCI', 'SSN', 'Credit Card', 'Trade Secret'];
  const hasCritical = this.dataTypes.some(dt => criticalTypes.includes(dt.type));
  if (hasCritical) score += 15;
  
  // Encryption
  if (!this.encrypted && this.classification !== 'Public') score += 10;
  
  // Shared with others
  if (this.sharedWith && this.sharedWith.length > 5) score += 5;
  
  // Location risk
  if (this.location === 'cloud' && !this.encrypted) score += 10;
  
  this.riskScore = Math.min(score, 100);
  return this.riskScore;
};

dataClassificationSchema.methods.addAction = function(action, userId, userName, details) {
  this.actionHistory.push({
    action,
    performedBy: { userId, name: userName },
    timestamp: new Date(),
    details
  });
  return this.save();
};

dataClassificationSchema.methods.quarantine = function(userId, userName, reason) {
  this.status = 'quarantined';
  return this.addAction('quarantined', userId, userName, reason);
};

dataClassificationSchema.methods.overrideClassification = function(newClass, reason, userId, userName) {
  this.manualOverride = {
    classification: newClass,
    reason,
    overriddenBy: { userId, name: userName },
    timestamp: new Date()
  };
  this.classification = newClass;
  this.autoClassified = false;
  return this.save();
};

// Statics
dataClassificationSchema.statics.getByClassification = function(classification) {
  return this.find({ classification, status: 'active' });
};

dataClassificationSchema.statics.getHighRiskFiles = function(threshold = 70) {
  return this.find({ 
    riskScore: { $gte: threshold },
    status: 'active'
  }).sort({ riskScore: -1 });
};

dataClassificationSchema.statics.findSensitiveData = function(dataType) {
  return this.find({ 
    'dataTypes.type': dataType,
    status: 'active'
  });
};

dataClassificationSchema.statics.getStatsByClassification = async function() {
  return this.aggregate([
    {
      $match: { status: 'active' }
    },
    {
      $group: {
        _id: '$classification',
        count: { $sum: 1 },
        totalSize: { $sum: '$size' },
        avgRiskScore: { $avg: '$riskScore' }
      }
    }
  ]);
};

dataClassificationSchema.statics.findDuplicates = async function(hash) {
  return this.find({ 
    $or: [
      { 'hash.md5': hash },
      { 'hash.sha256': hash }
    ]
  });
};

module.exports = mongoose.model('DataClassification', dataClassificationSchema);
