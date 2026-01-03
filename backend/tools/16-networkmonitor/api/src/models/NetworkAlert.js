/**
 * NetworkAlert Model
 * Stores network alerts and incidents
 */

const mongoose = require("mongoose");

const networkAlertSchema = new mongoose.Schema({
  // Alert Identification
  alertId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  
  // Alert Type & Classification
  type: {
    type: String,
    enum: [
      "intrusion", "anomaly", "threshold", "connectivity", "performance",
      "security", "configuration", "hardware", "bandwidth", "latency",
      "packet-loss", "port-scan", "ddos", "malware", "unauthorized-access"
    ],
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ["security", "performance", "availability", "configuration", "compliance"],
    default: "availability"
  },
  
  // Severity
  severity: {
    type: String,
    enum: ["info", "low", "medium", "high", "critical"],
    required: true,
    index: true
  },
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  
  // Source Information
  source: {
    deviceId: { type: mongoose.Schema.Types.ObjectId, ref: "NetworkDevice" },
    ip: { type: String, index: true },
    mac: String,
    hostname: String,
    port: Number,
    interface: String
  },
  
  // Target Information (if applicable)
  target: {
    deviceId: { type: mongoose.Schema.Types.ObjectId, ref: "NetworkDevice" },
    ip: String,
    mac: String,
    hostname: String,
    port: Number
  },
  
  // Alert Details
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Threshold Information
  threshold: {
    metric: String,
    value: Number,
    limit: Number,
    unit: String
  },
  
  // Status & Resolution
  status: {
    type: String,
    enum: ["open", "acknowledged", "investigating", "resolved", "closed", "suppressed"],
    default: "open",
    index: true
  },
  acknowledged: {
    type: Boolean,
    default: false
  },
  acknowledgedBy: String,
  acknowledgedAt: Date,
  
  resolved: {
    type: Boolean,
    default: false,
    index: true
  },
  resolvedBy: String,
  resolvedAt: Date,
  resolution: String,
  
  // Timing
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  firstOccurrence: {
    type: Date,
    default: Date.now
  },
  lastOccurrence: {
    type: Date,
    default: Date.now
  },
  occurrenceCount: {
    type: Number,
    default: 1
  },
  
  // Notification Status
  notifications: {
    sent: { type: Boolean, default: false },
    sentAt: Date,
    channels: [{ type: String, enum: ["email", "slack", "pagerduty", "webhook", "sms"] }],
    recipients: [String]
  },
  
  // Related Alerts
  correlatedAlerts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "NetworkAlert"
  }],
  parentAlert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NetworkAlert"
  },
  
  // Tags & Notes
  tags: [String],
  notes: [{
    text: String,
    author: String,
    timestamp: { type: Date, default: Date.now }
  }],
  
  // TTL for auto-cleanup
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true,
  collection: "network_alerts"
});

// Compound indexes
networkAlertSchema.index({ severity: 1, status: 1, timestamp: -1 });
networkAlertSchema.index({ "source.ip": 1, type: 1 });
networkAlertSchema.index({ resolved: 1, timestamp: -1 });

// Auto-generate alertId
networkAlertSchema.pre("save", function(next) {
  if (!this.alertId) {
    this.alertId = `NM-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model("NetworkAlert", networkAlertSchema);
