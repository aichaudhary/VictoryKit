const mongoose = require('mongoose');

const wirelessClientSchema = new mongoose.Schema({
  // Client Identification
  clientId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  macAddress: {
    type: String,
    required: true,
    index: true
  },
  
  // Device Information
  device: {
    hostname: String,
    deviceType: {
      type: String,
      enum: ['laptop', 'desktop', 'smartphone', 'tablet', 'iot', 'printer', 'camera', 'sensor', 'wearable', 'gaming', 'voip', 'unknown'],
      default: 'unknown'
    },
    manufacturer: String,
    model: String,
    os: {
      name: String,
      version: String
    },
    userAgent: String
  },
  
  // Connection Status
  connectionStatus: {
    type: String,
    enum: ['connected', 'disconnected', 'roaming', 'authenticating', 'blocked'],
    default: 'disconnected',
    index: true
  },
  
  // Current Connection
  currentConnection: {
    ssid: String,
    bssid: String,
    apId: String,
    apName: String,
    channel: Number,
    frequency: String,
    ipAddress: String,
    vlan: Number,
    connectedAt: Date,
    authMethod: String,
    encryptionType: String
  },
  
  // Signal Quality
  signalQuality: {
    rssi: Number,
    snr: Number,
    txRate: Number,
    rxRate: Number,
    signalStrength: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'critical']
    }
  },
  
  // Traffic Statistics
  trafficStats: {
    bytesReceived: {
      type: Number,
      default: 0
    },
    bytesSent: {
      type: Number,
      default: 0
    },
    packetsReceived: {
      type: Number,
      default: 0
    },
    packetsSent: {
      type: Number,
      default: 0
    },
    retryRate: Number,
    errorRate: Number
  },
  
  // Session History
  sessionHistory: [{
    ssid: String,
    apId: String,
    connectedAt: Date,
    disconnectedAt: Date,
    duration: Number,
    bytesTransferred: Number,
    disconnectReason: String
  }],
  
  // Location Tracking
  location: {
    current: {
      building: String,
      floor: Number,
      zone: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      },
      accuracy: Number,
      timestamp: Date
    },
    history: [{
      building: String,
      floor: Number,
      zone: String,
      timestamp: Date
    }]
  },
  
  // User Information
  user: {
    userId: String,
    username: String,
    email: String,
    department: String,
    role: String,
    authenticationMethod: {
      type: String,
      enum: ['802.1X', 'PSK', 'MAC-Auth', 'Guest', 'Certificate', 'Unknown']
    }
  },
  
  // Security Assessment
  security: {
    trustLevel: {
      type: String,
      enum: ['trusted', 'verified', 'unknown', 'suspicious', 'blocked'],
      default: 'unknown'
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    threatIndicators: [{
      type: String,
      detectedAt: Date,
      severity: String,
      resolved: Boolean
    }],
    lastSecurityScan: Date,
    complianceStatus: {
      antivirus: Boolean,
      firewall: Boolean,
      osPatched: Boolean,
      encryptionEnabled: Boolean
    },
    posture: {
      type: String,
      enum: ['compliant', 'non-compliant', 'unknown', 'remediation-needed']
    }
  },
  
  // Policy Assignment
  policies: [{
    policyId: String,
    policyName: String,
    appliedAt: Date,
    status: {
      type: String,
      enum: ['applied', 'pending', 'failed']
    }
  }],
  
  // Authorization
  authorization: {
    isAuthorized: {
      type: Boolean,
      default: false
    },
    authorizationType: {
      type: String,
      enum: ['employee', 'contractor', 'guest', 'byod', 'iot', 'unknown']
    },
    expiresAt: Date,
    registeredAt: Date,
    registeredBy: String,
    notes: String
  },
  
  // Roaming Information
  roaming: {
    enabled: Boolean,
    roamCount: {
      type: Number,
      default: 0
    },
    lastRoamTime: Date,
    roamHistory: [{
      fromAp: String,
      toAp: String,
      timestamp: Date,
      roamTime: Number,
      reason: String
    }],
    ft11rEnabled: Boolean,
    okc: Boolean
  },
  
  // Bandwidth Management
  bandwidth: {
    currentUsage: {
      upload: Number,
      download: Number
    },
    limits: {
      uploadLimit: Number,
      downloadLimit: Number
    },
    quotaUsed: Number,
    quotaTotal: Number,
    throttled: Boolean
  },
  
  // Application Usage
  applications: [{
    name: String,
    category: String,
    bytesTransferred: Number,
    lastSeen: Date
  }],
  
  // Metadata
  tags: [String],
  notes: String,
  organizationId: String,
  firstSeen: {
    type: Date,
    default: Date.now
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
wirelessClientSchema.index({ macAddress: 1 });
wirelessClientSchema.index({ connectionStatus: 1 });
wirelessClientSchema.index({ 'device.deviceType': 1 });
wirelessClientSchema.index({ 'security.trustLevel': 1, 'security.riskScore': 1 });
wirelessClientSchema.index({ 'currentConnection.ssid': 1, 'currentConnection.apId': 1 });
wirelessClientSchema.index({ 'user.userId': 1 });
wirelessClientSchema.index({ lastSeen: -1 });
wirelessClientSchema.index({ organizationId: 1 });

module.exports = mongoose.model('WirelessClient', wirelessClientSchema);
