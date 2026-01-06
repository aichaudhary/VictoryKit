const mongoose = require('mongoose');

const complianceReportSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true },
  reportType: {
    type: String,
    enum: ['risk_assessment', 'audit', 'breach_summary', 'annual_review', 'ocr_request', 'custom'],
    required: true
  },
  reportDate: { type: Date, default: Date.now },
  coveragePeriod: {
    startDate: Date,
    endDate: Date
  },
  status: { type: String, enum: ['draft', 'finalized', 'submitted'], default: 'draft' },
  overallCompliance: { type: Number, min: 0, max: 100 },
  sections: [{
    title: String,
    content: String,
    findings: Number,
    compliant: Boolean
  }],
  findings: {
    total: Number,
    critical: Number,
    high: Number,
    medium: Number,
    low: Number
  },
  recommendations: [String],
  fileUrl: String,
  generatedBy: String,
  reviewedBy: String,
  approvedBy: String,
  submittedTo: String,
  submittedDate: Date
}, { timestamps: true });

complianceReportSchema.index({ reportId: 1 });
complianceReportSchema.index({ reportDate: -1 });
complianceReportSchema.index({ reportType: 1 });
complianceReportSchema.index({ status: 1 });

module.exports = mongoose.model('ComplianceReport', complianceReportSchema);
