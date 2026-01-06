const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  logId: { type: String, required: true, unique: true },
  action: { type: String, required: true },
  category: {
    type: String,
    enum: ['scan', 'finding', 'remediation', 'report', 'configuration', 'user', 'access', 'system'],
    required: true
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'info'
  },
  user: {
    userId: String,
    username: String,
    email: String,
    role: String
  },
  ipAddress: String,
  userAgent: String,
  details: mongoose.Schema.Types.Mixed,
  resource: {
    type: String,
    id: String,
    name: String
  },
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  },
  errorMessage: String,
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

auditLogSchema.index({ logId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ category: 1 });
auditLogSchema.index({ 'user.userId': 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ severity: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
