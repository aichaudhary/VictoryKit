/**
 * TrafficLog Model
 * Stores network traffic flow data
 */

const mongoose = require("mongoose");

const trafficLogSchema = new mongoose.Schema({
  // Flow Identification
  flowId: {
    type: String,
    index: true
  },
  
  // Source
  source: {
    ip: { type: String, required: true, index: true },
    port: Number,
    mac: String,
    hostname: String,
    country: String,
    asn: String,
    org: String
  },
  
  // Destination
  destination: {
    ip: { type: String, required: true, index: true },
    port: Number,
    mac: String,
    hostname: String,
    country: String,
    asn: String,
    org: String
  },
  
  // Protocol Information
  protocol: {
    type: String,
    enum: ["tcp", "udp", "icmp", "igmp", "gre", "esp", "ah", "other"],
    required: true,
    index: true
  },
  application: {
    type: String,
    index: true
  },
  service: String,
  
  // Traffic Metrics
  bytes: {
    in: { type: Number, default: 0 },
    out: { type: Number, default: 0 }
  },
  packets: {
    in: { type: Number, default: 0 },
    out: { type: Number, default: 0 }
  },
  
  // TCP Flags (for TCP flows)
  tcpFlags: {
    syn: { type: Boolean, default: false },
    ack: { type: Boolean, default: false },
    fin: { type: Boolean, default: false },
    rst: { type: Boolean, default: false },
    psh: { type: Boolean, default: false },
    urg: { type: Boolean, default: false }
  },
  
  // Flow Timing
  startTime: {
    type: Date,
    required: true,
    index: true
  },
  endTime: Date,
  duration: Number,
  
  // Collection Information
  collectedFrom: {
    deviceId: { type: mongoose.Schema.Types.ObjectId, ref: "NetworkDevice" },
    interface: String,
    type: { type: String, enum: ["netflow", "sflow", "ipfix", "pcap", "agent"], default: "netflow" }
  },
  
  // Direction
  direction: {
    type: String,
    enum: ["inbound", "outbound", "internal", "external"],
    index: true
  },
  
  // Classification
  classification: {
    category: String,
    risk: { type: String, enum: ["safe", "suspicious", "malicious", "unknown"], default: "unknown" },
    confidence: { type: Number, min: 0, max: 100 }
  },
  
  // Quality of Service
  qos: {
    dscp: Number,
    tos: Number
  },
  
  // Geo Information
  geo: {
    srcCountry: String,
    srcCity: String,
    dstCountry: String,
    dstCity: String
  },
  
  // Aggregation (for summarized flows)
  aggregated: {
    type: Boolean,
    default: false
  },
  aggregationInterval: String,
  
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  collection: "traffic_logs",
  timeseries: {
    timeField: "timestamp",
    metaField: "collectedFrom",
    granularity: "minutes"
  }
});

// Indexes for common queries
trafficLogSchema.index({ "source.ip": 1, "destination.ip": 1, timestamp: -1 });
trafficLogSchema.index({ protocol: 1, application: 1 });
trafficLogSchema.index({ "classification.risk": 1 });

// TTL index for auto-cleanup (30 days)
trafficLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model("TrafficLog", trafficLogSchema);
