const mongoose = require('mongoose');

// Sensitive Data Pattern Schema
const sensitivePatternSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['pii', 'financial', 'health', 'credentials', 'intellectual_property', 'custom'],
    required: true 
  },
  pattern: { type: String, required: true }, // Regex pattern
  description: String,
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  enabled: { type: Boolean, default: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }
}, { timestamps: true });

// DLP Policy Schema
const dlpPolicySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  enabled: { type: Boolean, default: true },
  priority: { type: Number, default: 0 },
  
  // Conditions
  conditions: {
    dataTypes: [{ type: String }], // SSN, CC, PII, PHI, etc.
    sensitivityLevels: [{ type: String }], // public, internal, confidential, restricted
    fileTypes: [{ type: String }], // pdf, doc, xlsx, etc.
    destinations: [{ type: String }], // email, usb, cloud, print
    userGroups: [{ type: mongoose.Schema.Types.ObjectId }],
    locations: [{ type: String }], // geo-locations
    timeWindow: {
      enabled: { type: Boolean, default: false },
      startTime: String,
      endTime: String,
      days: [{ type: Number }] // 0-6, Sunday-Saturday
    }
  },
  
  // Actions
  actions: {
    primary: { 
      type: String, 
      enum: ['allow', 'block', 'quarantine', 'encrypt', 'redact', 'warn', 'audit'],
      default: 'audit'
    },
    secondary: [{
      type: { type: String },
      config: mongoose.Schema.Types.Mixed
    }],
    notifyUser: { type: Boolean, default: true },
    notifyAdmin: { type: Boolean, default: true },
    requireJustification: { type: Boolean, default: false },
    autoRemediate: { type: Boolean, default: false }
  },
  
  // Exceptions
  exceptions: {
    users: [{ type: mongoose.Schema.Types.ObjectId }],
    groups: [{ type: mongoose.Schema.Types.ObjectId }],
    domains: [{ type: String }],
    applications: [{ type: String }]
  },
  
  // Compliance mapping
  compliance: [{
    framework: { type: String }, // GDPR, HIPAA, PCI-DSS, SOX, etc.
    requirement: { type: String }
  }]
}, { timestamps: true });

// Data Classification Schema
const dataClassificationSchema = new mongoose.Schema({
  resourceId: { type: String, required: true }, // file path, URL, etc.
  resourceType: { type: String, required: true }, // file, email, database, api
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  
  // Classification results
  classification: {
    level: { 
      type: String, 
      enum: ['public', 'internal', 'confidential', 'restricted', 'top_secret'],
      required: true
    },
    confidence: { type: Number, min: 0, max: 100 },
    method: { 
      type: String, 
      enum: ['manual', 'auto_content', 'auto_metadata', 'ml_predicted', 'inherited']
    },
    classifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    classifiedAt: { type: Date, default: Date.now }
  },
  
  // Detected sensitive data
  sensitiveData: [{
    type: { type: String }, // SSN, CC, PHI, etc.
    count: { type: Number },
    locations: [{ 
      page: Number,
      line: Number,
      column: Number,
      snippet: String // redacted snippet
    }],
    confidence: { type: Number }
  }],
  
  // Metadata
  metadata: {
    fileName: String,
    fileSize: Number,
    mimeType: String,
    checksum: String,
    owner: String,
    lastModified: Date,
    location: String
  },
  
  // Labels/Tags
  labels: [{ type: String }],
  
  // Retention
  retention: {
    policy: String,
    expiresAt: Date,
    legalHold: { type: Boolean, default: false }
  }
}, { timestamps: true });

// DLP Incident Schema
const dlpIncidentSchema = new mongoose.Schema({
  incidentId: { type: String, required: true, unique: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  
  // Incident details
  type: { 
    type: String, 
    enum: ['data_exfiltration', 'policy_violation', 'unauthorized_access', 
           'sensitive_data_exposure', 'encryption_bypass', 'abnormal_transfer'],
    required: true
  },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  status: { 
    type: String, 
    enum: ['open', 'investigating', 'contained', 'remediated', 'closed', 'false_positive'],
    default: 'open'
  },
  
  // What happened
  details: {
    policyViolated: { type: mongoose.Schema.Types.ObjectId, ref: 'DLPPolicy' },
    dataTypes: [{ type: String }],
    sensitivityLevel: String,
    recordCount: Number,
    dataVolume: Number // bytes
  },
  
  // Who/What was involved
  source: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    userEmail: String,
    department: String,
    ipAddress: String,
    deviceId: String,
    deviceType: String,
    application: String,
    location: String
  },
  
  // Where it was going
  destination: {
    type: { type: String }, // email, usb, cloud, print, api
    address: String, // email address, cloud URL, etc.
    service: String, // Dropbox, Gmail, etc.
    external: { type: Boolean, default: false }
  },
  
  // What was the content
  content: {
    resourceId: String,
    resourceType: String,
    fileName: String,
    fileType: String,
    fileSize: Number,
    matchedPatterns: [{
      pattern: String,
      count: Number,
      samples: [String] // redacted samples
    }]
  },
  
  // Actions taken
  actionsTaken: [{
    action: String,
    timestamp: { type: Date, default: Date.now },
    automated: { type: Boolean, default: true },
    performedBy: String,
    result: String
  }],
  
  // Investigation
  investigation: {
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: [{ 
      note: String, 
      author: String, 
      timestamp: { type: Date, default: Date.now }
    }],
    evidence: [{ 
      type: String, 
      url: String, 
      description: String 
    }],
    rootCause: String,
    remediation: String
  },
  
  // Risk assessment
  riskAssessment: {
    score: { type: Number, min: 0, max: 100 },
    factors: [{
      factor: String,
      weight: Number,
      value: Number
    }],
    businessImpact: String,
    complianceImpact: [{ type: String }]
  },
  
  // Timestamps
  detectedAt: { type: Date, default: Date.now },
  acknowledgedAt: Date,
  resolvedAt: Date
}, { timestamps: true });

// Endpoint Activity Log Schema
const endpointActivitySchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deviceId: { type: String, required: true },
  
  activity: {
    type: { 
      type: String, 
      enum: ['file_copy', 'file_move', 'file_delete', 'file_upload', 'file_download',
             'usb_connect', 'usb_write', 'print', 'screen_capture', 'clipboard_copy',
             'email_send', 'email_attachment', 'browser_upload', 'cloud_sync',
             'application_launch', 'network_transfer'],
      required: true
    },
    application: String,
    processName: String,
    processPath: String
  },
  
  file: {
    name: String,
    path: String,
    type: String,
    size: Number,
    checksum: String,
    classification: String
  },
  
  destination: {
    type: String,
    path: String,
    url: String,
    deviceName: String
  },
  
  context: {
    ipAddress: String,
    networkType: String, // corporate, vpn, public
    location: String,
    timestamp: { type: Date, default: Date.now }
  },
  
  risk: {
    score: { type: Number, min: 0, max: 100 },
    flags: [{ type: String }],
    blocked: { type: Boolean, default: false }
  }
}, { timestamps: true });

// Scan Result Schema
const scanResultSchema = new mongoose.Schema({
  scanId: { type: String, required: true, unique: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  target: {
    type: { type: String }, // file, directory, email, database, cloud_storage, api
    location: String,
    scope: String
  },
  
  status: { 
    type: String, 
    enum: ['pending', 'scanning', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  
  progress: {
    totalItems: Number,
    scannedItems: Number,
    percentage: Number
  },
  
  results: {
    filesScanned: Number,
    sensitivFilesFound: Number,
    violations: [{
      resourceId: String,
      resourceType: String,
      fileName: String,
      dataTypes: [String],
      matchCount: Number,
      severity: String,
      details: mongoose.Schema.Types.Mixed
    }],
    summary: {
      byDataType: mongoose.Schema.Types.Mixed,
      bySeverity: mongoose.Schema.Types.Mixed,
      byClassification: mongoose.Schema.Types.Mixed
    }
  },
  
  timing: {
    startedAt: Date,
    completedAt: Date,
    duration: Number // milliseconds
  },
  
  error: {
    message: String,
    code: String,
    details: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

// Create models
const SensitivePattern = mongoose.model('SensitivePattern', sensitivePatternSchema);
const DLPPolicy = mongoose.model('DLPPolicy', dlpPolicySchema);
const DataClassification = mongoose.model('DataClassification', dataClassificationSchema);
const DLPIncident = mongoose.model('DLPIncident', dlpIncidentSchema);
const EndpointActivity = mongoose.model('EndpointActivity', endpointActivitySchema);
const ScanResult = mongoose.model('ScanResult', scanResultSchema);

module.exports = {
  SensitivePattern,
  DLPPolicy,
  DataClassification,
  DLPIncident,
  EndpointActivity,
  ScanResult
};
