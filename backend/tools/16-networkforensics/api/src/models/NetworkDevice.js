/**
 * NetworkDevice Model
 * Stores network device information and status
 */

const mongoose = require("mongoose");

const networkDeviceSchema = new mongoose.Schema({
  // Basic Device Information
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  hostname: {
    type: String,
    trim: true
  },
  ip: {
    type: String,
    required: true,
    index: true
  },
  mac: {
    type: String,
    uppercase: true,
    index: true
  },
  
  // Device Classification
  type: {
    type: String,
    enum: ["router", "switch", "firewall", "server", "endpoint", "access-point", "load-balancer", "printer", "iot", "unknown"],
    default: "unknown",
    index: true
  },
  vendor: {
    type: String,
    default: "Unknown"
  },
  model: {
    type: String
  },
  
  // Status Information
  status: {
    type: String,
    enum: ["online", "offline", "warning", "critical", "maintenance"],
    default: "offline",
    index: true
  },
  lastSeen: {
    type: Date,
    default: Date.now,
    index: true
  },
  uptime: {
    type: Number,
    default: 0
  },
  
  // Network Details
  network: {
    subnet: String,
    gateway: String,
    vlan: Number,
    zone: { type: String, enum: ["dmz", "internal", "external", "management", "guest"], default: "internal" }
  },
  
  // Ports & Interfaces
  interfaces: [{
    name: String,
    ip: String,
    mac: String,
    status: { type: String, enum: ["up", "down", "admin-down"] },
    speed: Number,
    duplex: { type: String, enum: ["full", "half", "auto"] },
    mtu: Number
  }],
  
  openPorts: [{
    port: Number,
    protocol: { type: String, enum: ["tcp", "udp"] },
    service: String,
    state: { type: String, enum: ["open", "closed", "filtered"] }
  }],
  
  // Bandwidth & Traffic
  bandwidth: {
    in: { type: Number, default: 0 },
    out: { type: Number, default: 0 },
    inPeak: { type: Number, default: 0 },
    outPeak: { type: Number, default: 0 },
    utilization: { type: Number, default: 0 }
  },
  
  // Performance Metrics
  metrics: {
    latency: { type: Number, default: 0 },
    packetLoss: { type: Number, default: 0 },
    jitter: { type: Number, default: 0 },
    cpu: { type: Number, default: 0 },
    memory: { type: Number, default: 0 },
    disk: { type: Number, default: 0 }
  },
  
  // SNMP Information
  snmp: {
    enabled: { type: Boolean, default: false },
    community: String,
    version: { type: String, enum: ["1", "2c", "3"], default: "2c" },
    sysDescr: String,
    sysObjectID: String,
    sysContact: String,
    sysLocation: String
  },
  
  // Discovery & Monitoring
  discovery: {
    method: { type: String, enum: ["manual", "snmp", "arp", "nmap", "api"], default: "manual" },
    discoveredAt: { type: Date, default: Date.now },
    lastScanned: Date,
    autoDiscovered: { type: Boolean, default: false }
  },
  
  // Grouping & Organization
  groups: [{ type: String }],
  tags: [{
    key: String,
    value: String
  }],
  location: {
    building: String,
    floor: String,
    room: String,
    rack: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  // Monitoring Configuration
  monitoring: {
    enabled: { type: Boolean, default: true },
    interval: { type: Number, default: 60 },
    protocol: { type: String, enum: ["icmp", "snmp", "agent", "api"], default: "icmp" },
    thresholds: {
      latency: { warning: Number, critical: Number },
      packetLoss: { warning: Number, critical: Number },
      cpu: { warning: Number, critical: Number },
      memory: { warning: Number, critical: Number },
      bandwidth: { warning: Number, critical: Number }
    }
  },
  
  // Relationships
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NetworkDevice"
  },
  connectedDevices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "NetworkDevice"
  }],
  
  // Audit
  createdBy: {
    type: String,
    default: "system"
  },
  lastModifiedBy: String
}, {
  timestamps: true,
  collection: "network_devices"
});

// Indexes
networkDeviceSchema.index({ ip: 1, mac: 1 });
networkDeviceSchema.index({ status: 1, type: 1 });
networkDeviceSchema.index({ "network.zone": 1 });
networkDeviceSchema.index({ groups: 1 });

module.exports = mongoose.model("NetworkDevice", networkDeviceSchema);
