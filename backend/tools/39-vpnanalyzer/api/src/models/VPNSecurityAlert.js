const mongoose = require('mongoose');

const vpnSecurityAlertSchema = new mongoose.Schema({
  alertId: { type: String, required: true, unique: true },
  connectionId: { type: String, required: true },
  userId: { type: String, required: true },
  alertType: {
    type: String,
    required: true,
    enum: [
      'unauthorized-access',
      'suspicious-traffic',
      'weak-encryption',
      'certificate-expiry',
      'protocol-anomaly',
      'geographic-anomaly',
      'brute-force',
      'malware-detected',
      'data-leak',
      'policy-violation',
      'session-anomaly',
      'bandwidth-abuse'
    ]
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  details: {
    sourceIP: String,
    destinationIP: String,
    protocol: String,
    port: Number,
    userAgent: String,
    location: {
      country: String,
      city: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    deviceInfo: {
      os: String,
      browser: String,
      deviceType: String
    },
    threatIndicators: [String],
    riskScore: { type: Number, min: 0, max: 100 },
    anomalyScore: Number
  },
  status: {
    type: String,
    enum: ['new', 'investigating', 'resolved', 'dismissed', 'escalated'],
    default: 'new'
  },
  assignedTo: String,
  resolution: {
    action: {
      type: String,
      enum: ['block-connection', 'disconnect-user', 'update-policy', 'monitor', 'ignore', 'escalate']
    },
    notes: String,
    resolvedBy: String,
    resolvedAt: Date
  },
  integrations: {
    sentToSIEM: { type: Boolean, default: false },
    sentToSOAR: { type: Boolean, default: false },
    ticketCreated: { type: Boolean, default: false },
    ticketId: String
  },
  metadata: {
    vpnProvider: String,
    connectionType: String,
    sessionDuration: Number,
    dataTransferred: Number,
    encryptionStrength: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
vpnSecurityAlertSchema.index({ connectionId: 1 });
vpnSecurityAlertSchema.index({ userId: 1 });
vpnSecurityAlertSchema.index({ alertType: 1 });
vpnSecurityAlertSchema.index({ severity: 1 });
vpnSecurityAlertSchema.index({ status: 1 });
vpnSecurityAlertSchema.index({ createdAt: -1 });
vpnSecurityAlertSchema.index({ 'details.riskScore': -1 });

module.exports = mongoose.model('VPNSecurityAlert', vpnSecurityAlertSchema);