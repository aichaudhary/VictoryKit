const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: ['SAQ-A', 'SAQ-A-EP', 'SAQ-B', 'SAQ-B-IP', 'SAQ-C', 'SAQ-C-VT', 'SAQ-D-Merchant', 'SAQ-D-SP', 'AOC', 'ROC', 'Executive_Summary', 'Detailed_Assessment', 'Gap_Analysis', 'Remediation_Plan'],
    required: true
  },
  title: { type: String, required: true },
  status: {
    type: String,
    enum: ['draft', 'in_review', 'completed', 'archived'],
    default: 'draft'
  },
  assessmentDate: { type: Date, required: true },
  reportDate: { type: Date, default: Date.now },
  merchantInfo: {
    name: String,
    level: { type: String, enum: ['level1', 'level2', 'level3', 'level4'] },
    industry: String,
    contactPerson: String,
    email: String,
    phone: String
  },
  scope: {
    description: String,
    includedSystems: [String],
    excludedSystems: [String],
    cardholderDataEnvironment: String
  },
  overallCompliance: {
    score: { type: Number, min: 0, max: 100 },
    status: { type: String, enum: ['compliant', 'non_compliant', 'conditionally_compliant'] }
  },
  requirementSummary: [{
    requirement: String,
    compliant: Boolean,
    score: Number,
    findings: Number,
    notes: String
  }],
  findings: {
    total: Number,
    critical: Number,
    high: Number,
    medium: Number,
    low: Number,
    info: Number
  },
  scans: [{ type: String, ref: 'Scan' }],
  evidence: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evidence' }],
  content: {
    executiveSummary: String,
    methodology: String,
    findings: String,
    recommendations: String,
    conclusion: String,
    appendices: [String]
  },
  format: {
    type: String,
    enum: ['pdf', 'docx', 'html', 'json'],
    default: 'pdf'
  },
  fileUrl: String,
  fileSize: Number,
  generatedBy: String,
  reviewedBy: String,
  approvedBy: String,
  approvalDate: Date,
  validUntil: Date,
  tags: [String],
  isPublic: { type: Boolean, default: false }
}, { timestamps: true });

reportSchema.index({ reportId: 1 });
reportSchema.index({ type: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ assessmentDate: -1 });
reportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
