const mongoose = require('mongoose');

const findingSchema = new mongoose.Schema({
  findingId: { type: String, required: true, unique: true },
  scanId: { type: String, required: true, ref: 'Scan' },
  requirement: {
    type: String,
    enum: ['req1', 'req2', 'req3', 'req4', 'req5', 'req6', 'req7', 'req8', 'req9', 'req10', 'req11', 'req12'],
    required: true
  },
  subRequirement: String,
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'info'],
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'accepted_risk', 'false_positive', 'compensating_control'],
    default: 'open'
  },
  cvssScore: Number,
  riskScore: { type: Number, min: 0, max: 100 },
  affectedAssets: [{
    assetId: String,
    assetType: String,
    assetName: String,
    ipAddress: String,
    hostname: String
  }],
  evidence: [{
    type: String,
    description: String,
    timestamp: Date,
    fileUrl: String,
    screenshot: String
  }],
  remediation: {
    recommendation: String,
    effort: { type: String, enum: ['low', 'medium', 'high'] },
    estimatedTime: String,
    priority: { type: String, enum: ['p1', 'p2', 'p3', 'p4'] },
    compensatingControl: String,
    steps: [String]
  },
  assignedTo: String,
  dueDate: Date,
  resolvedDate: Date,
  resolvedBy: String,
  resolutionNotes: String,
  tags: [String],
  references: [{
    title: String,
    url: String,
    type: { type: String, enum: ['pci_dss', 'cve', 'cwe', 'owasp', 'external'] }
  }]
}, { timestamps: true });

findingSchema.index({ findingId: 1 });
findingSchema.index({ scanId: 1 });
findingSchema.index({ requirement: 1 });
findingSchema.index({ severity: 1 });
findingSchema.index({ status: 1 });
findingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Finding', findingSchema);
