const mongoose = require('mongoose');

const breachSchema = new mongoose.Schema({
  breachId: { type: String, required: true, unique: true },
  incidentDate: { type: Date, required: true },
  discoveryDate: { type: Date, required: true },
  reportedDate: Date,
  breachType: {
    type: String,
    enum: ['unauthorized_access', 'theft', 'loss', 'improper_disposal', 'hacking', 'ransomware', 'insider', 'other'],
    required: true
  },
  location: { type: String, enum: ['electronic', 'paper', 'both'], required: true },
  affectedIndividuals: { type: Number, required: true },
  phiCompromised: [{
    type: String,
    enum: ['name', 'ssn', 'mrn', 'dob', 'address', 'phone', 'email', 'insurance', 'diagnosis', 'treatment', 'financial']
  }],
  status: {
    type: String,
    enum: ['identified', 'investigating', 'notification_required', 'notified', 'resolved'],
    default: 'identified'
  },
  severity: { type: String, enum: ['critical', 'high', 'medium', 'low'], required: true },
  notificationRequired: {
    individuals: Boolean,
    hhs: Boolean,
    media: Boolean
  },
  notifications: {
    individualsNotified: { type: Number, default: 0 },
    individualsNotifiedDate: Date,
    hhsNotified: Boolean,
    hhsNotifiedDate: Date,
    mediaNotified: Boolean,
    mediaNotifiedDate: Date
  },
  rootCause: String,
  remediationSteps: [String],
  investigationNotes: String,
  reportedBy: String,
  investigatedBy: String
}, { timestamps: true });

breachSchema.index({ breachId: 1 });
breachSchema.index({ incidentDate: -1 });
breachSchema.index({ status: 1 });
breachSchema.index({ severity: 1 });

module.exports = mongoose.model('Breach', breachSchema);
