const mongoose = require('mongoose');

const wirelessNetworkSchema = new mongoose.Schema({
  // Network Identification
  networkId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  ssid: {
    type: String,
    required: true,
    index: true
  },
  bssid: {
    type: String,
    required: true,
    index: true
  },
  
  // Network Classification
  networkType: {
    type: String,
    enum: ['corporate', 'guest', 'iot', 'byod', 'public', 'rogue', 'unknown'],
    default: 'unknown'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'monitoring', 'quarantined', 'blocked'],
    default: 'active'
  },
  isAuthorized: {
    type: Boolean,
    default: false
  },
  isRogue: {
    type: Boolean,
    default: false
  },
  
  // Technical Details
  frequency: {
    band: {
      type: String,
      enum: ['2.4GHz', '5GHz', '6GHz', 'dual-band', 'tri-band'],
      required: true
    },
    channel: {
      type: Number,
      min: 1,
      max: 233
    },
    channelWidth: {
      type: String,
      enum: ['20MHz', '40MHz', '80MHz', '160MHz', '320MHz']
    }
  },
  
  // Security Configuration
  security: {
    encryptionType: {
      type: String,
      enum: ['WPA3-Enterprise', 'WPA3-Personal', 'WPA2-Enterprise', 'WPA2-Personal', 'WPA', 'WEP', 'Open', 'unknown'],
      required: true
    },
    authenticationMethod: {
      type: String,
      enum: ['802.1X', 'PSK', 'SAE', 'OWE', 'RADIUS', 'LDAP', 'Certificate', 'None'],
      default: 'None'
    },
    pmfEnabled: {
      type: Boolean,
      default: false
    },
    ftEnabled: {
      type: Boolean,
      default: false
    },
    mfpCapable: {
      type: Boolean,
      default: false
    }
  },
  
  // WiFi Standard
  wifiStandard: {
    type: String,
    enum: ['802.11a', '802.11b', '802.11g', '802.11n', '802.11ac', '802.11ax', '802.11be', 'mixed'],
    default: '802.11ac'
  },
  
  // Signal & Performance
  signalMetrics: {
    rssi: {
      type: Number,
      min: -100,
      max: 0
    },
    noiseFloor: {
      type: Number
    },
    snr: {
      type: Number
    },
    txPower: {
      type: Number
    },
    maxDataRate: {
      type: Number
    }
  },
  
  // Location Information
  location: {
    building: String,
    floor: Number,
    zone: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    accessPointId: String,
    accessPointName: String
  },
  
  // Connected Clients
  connectedClients: {
    count: {
      type: Number,
      default: 0
    },
    maxClients: {
      type: Number,
      default: 50
    },
    clients: [{
      macAddress: String,
      ipAddress: String,
      hostname: String,
      deviceType: String,
      connectedSince: Date,
      signalStrength: Number,
      dataUsage: {
        upload: Number,
        download: Number
      }
    }]
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
    retryRate: {
      type: Number,
      default: 0
    },
    errorRate: {
      type: Number,
      default: 0
    }
  },
  
  // Threat Assessment
  threatAssessment: {
    threatLevel: {
      type: String,
      enum: ['none', 'low', 'medium', 'high', 'critical'],
      default: 'none'
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    threatIndicators: [{
      type: {
        type: String,
        enum: ['rogue-ap', 'evil-twin', 'deauth-attack', 'weak-encryption', 'mac-spoofing', 'unauthorized-access', 'interference', 'signal-anomaly']
      },
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      description: String,
      detectedAt: Date,
      resolved: Boolean
    }],
    lastThreatScan: Date
  },
  
  // Compliance
  compliance: {
    pciDss: {
      compliant: Boolean,
      issues: [String],
      lastCheck: Date
    },
    hipaa: {
      compliant: Boolean,
      issues: [String],
      lastCheck: Date
    },
    gdpr: {
      compliant: Boolean,
      issues: [String],
      lastCheck: Date
    },
    nist: {
      compliant: Boolean,
      issues: [String],
      lastCheck: Date
    }
  },
  
  // Vendor Information
  vendor: {
    manufacturer: String,
    model: String,
    firmwareVersion: String,
    serialNumber: String,
    managementPlatform: {
      type: String,
      enum: ['meraki', 'aruba', 'unifi', 'ruckus', 'mist', 'fortinet', 'extreme', 'standalone', 'other']
    }
  },
  
  // Audit Trail
  auditLog: [{
    action: String,
    performedBy: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: mongoose.Schema.Types.Mixed
  }],
  
  // Metadata
  tags: [String],
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
wirelessNetworkSchema.index({ ssid: 1, bssid: 1 });
wirelessNetworkSchema.index({ 'location.building': 1, 'location.floor': 1 });
wirelessNetworkSchema.index({ 'threatAssessment.threatLevel': 1 });
wirelessNetworkSchema.index({ status: 1, isRogue: 1 });
wirelessNetworkSchema.index({ lastSeen: -1 });

module.exports = mongoose.model('WirelessNetwork', wirelessNetworkSchema);
