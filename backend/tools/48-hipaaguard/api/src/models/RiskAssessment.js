const mongoose = require('mongoose');

const riskAssessmentSchema = new mongoose.Schema({
  assessmentId: { type: String, required: true, unique: true },
  organizationName: String,
  assessmentDate: { type: Date, default: Date.now },
  assessmentType: {
    type: String,
    enum: ['initial', 'annual', 'incident_triggered', 'pre_audit'],
    required: true
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'remediation', 'approved'],
    default: 'in_progress'
  },
  overallRiskScore: { type: Number, min: 0, max: 100, default: 0 },
  safeguardScores: {
    administrative: { type: Number, default: 0 },
    physical: { type: Number, default: 0 },
    technical: { type: Number, default: 0 }
  },
  ruleCompliance: {
    privacyRule: { type: Number, default: 0 },
    securityRule: { type: Number, default: 0 },
    breachNotification: { type: Number, default: 0 },
    enforcement: { type: Number, default: 0 }
  },
  findings: [{
    findingId: String,
    severity: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
    category: String,
    description: String,
    status: { type: String, default: 'open' }
  }],
  assessedBy: String,
  approvedBy: String,
  approvalDate: Date,
  nextAssessmentDue: Date
}, { timestamps: true });

riskAssessmentSchema.index({ assessmentId: 1 });
riskAssessmentSchema.index({ status: 1 });
riskAssessmentSchema.index({ assessmentDate: -1 });

module.exports = mongoose.model('RiskQuantifyment', riskAssessmentSchema);
