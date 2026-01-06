const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
  logId: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now },
  userId: { type: String, required: true },
  userName: String,
  userRole: String,
  action: {
    type: String,
    enum: ['view', 'create', 'update', 'delete', 'export', 'print', 'share'],
    required: true
  },
  resourceType: { type: String, enum: ['patient_record', 'phi', 'report', 'system'], required: true },
  resourceId: String,
  patientId: String,
  ipAddress: String,
  deviceInfo: String,
  location: String,
  accessGranted: Boolean,
  denialReason: String,
  minimumNecessary: Boolean,
  businessJustification: String,
  suspicious: Boolean,
  suspicionReasons: [String]
}, { timestamps: true });

accessLogSchema.index({ logId: 1 });
accessLogSchema.index({ timestamp: -1 });
accessLogSchema.index({ userId: 1 });
accessLogSchema.index({ patientId: 1 });
accessLogSchema.index({ suspicious: 1 });

module.exports = mongoose.model('AccessLog', accessLogSchema);
