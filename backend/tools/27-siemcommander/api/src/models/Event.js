const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  sourceType: {
    type: String,
    required: true,
    enum: ['firewall', 'ids', 'ips', 'endpoint', 'cloud', 'application', 'network', 'database'],
    index: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    index: true
  },
  category: {
    type: String,
    enum: ['malware', 'phishing', 'ddos', 'data_breach', 'insider_threat', 'apt', 'ransomware', 'unauthorized_access', 'other'],
    index: true
  },
  sourceIp: {
    type: String,
    index: true
  },
  destinationIp: {
    type: String,
    index: true
  },
  sourcePort: Number,
  destinationPort: Number,
  protocol: String,
  action: {
    type: String,
    enum: ['allowed', 'blocked', 'logged', 'alerted']
  },
  message: {
    type: String,
    required: true
  },
  rawLog: String,
  normalized: {
    type: Boolean,
    default: false
  },
  correlationId: {
    type: String,
    index: true
  },
  indicators: [{
    type: String,
    description: String
  }],
  threatScore: {
    type: Number,
    min: 0,
    max: 100
  },
  incidentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident',
    index: true
  },
  metadata: {
    hostname: String,
    username: String,
    processName: String,
    fileName: String,
    hash: String,
    url: String,
    geoLocation: {
      country: String,
      city: String,
      latitude: Number,
      longitude: Number
    }
  },
  tags: [String],
  processed: {
    type: Boolean,
    default: false,
    index: true
  },
  aiAnalyzed: {
    type: Boolean,
    default: false
  },
  aiInsights: {
    summary: String,
    recommendations: [String],
    relatedEvents: [String]
  }
}, {
  timestamps: true
});

// Indexes for performance
eventSchema.index({ timestamp: -1, severity: 1 });
eventSchema.index({ sourceType: 1, timestamp: -1 });
eventSchema.index({ correlationId: 1, timestamp: -1 });
eventSchema.index({ 'metadata.username': 1 });
eventSchema.index({ tags: 1 });

module.exports = mongoose.model('Event', eventSchema);
