const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
  trainingId: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  employeeRole: String,
  department: String,
  courseType: {
    type: String,
    enum: ['initial_hipaa', 'annual_refresher', 'privacy_rule', 'security_rule', 'breach_notification', 'role_specific', 'incident_response'],
    required: true
  },
  courseName: String,
  trainingDate: { type: Date, default: Date.now },
  completionDate: Date,
  expirationDate: Date,
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'expired', 'failed'],
    default: 'not_started'
  },
  score: Number,
  passingScore: { type: Number, default: 80 },
  certificateUrl: String,
  nextTrainingDue: Date,
  reminders: [{
    sentDate: Date,
    type: { type: String, enum: ['initial', 'reminder', 'final'] }
  }]
}, { timestamps: true });

trainingSchema.index({ trainingId: 1 });
trainingSchema.index({ employeeId: 1 });
trainingSchema.index({ status: 1 });
trainingSchema.index({ expirationDate: 1 });
trainingSchema.index({ nextTrainingDue: 1 });

module.exports = mongoose.model('Training', trainingSchema);
