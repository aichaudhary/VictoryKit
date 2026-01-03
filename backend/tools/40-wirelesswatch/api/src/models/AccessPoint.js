const mongoose = require('mongoose');

const accessPointSchema = new mongoose.Schema({
  // Access Point Identification
  apId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  macAddress: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['online', 'offline', 'degraded', 'maintenance', 'rebooting', 'updating'],
    default: 'offline',
    index: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  uptime: {
    type: Number,
    default: 0
  },
  
  // Hardware Information
  hardware: {
    manufacturer: {
      type: String,
      required: true
    },
    model: {
      type: String,
      required: true
    },
    serialNumber: String,
    firmwareVersion: String,
    hardwareVersion: String,
    antennaType: {
      type: String,
      enum: ['internal', 'external', 'directional', 'omnidirectional']
    },
    antennaCount: Number,
    supportedStandards: [{
      type: String,
      enum: ['802.11a', '802.11b', '802.11g', '802.11n', '802.11ac', '802.11ax', '802.11be']
    }],
    poeCapable: Boolean,
    meshCapable: Boolean
  },
  
  // Radio Configuration
  radios: [{
    radioId: String,
    band: {
      type: String,
      enum: ['2.4GHz', '5GHz', '6GHz']
    },
    channel: Number,
    channelWidth: {
      type: String,
      enum: ['20MHz', '40MHz', '80MHz', '160MHz', '320MHz']
    },
    txPower: Number,
    mode: {
      type: String,
      enum: ['access', 'monitor', 'hybrid', 'mesh', 'sensor']
    },
    enabled: {
      type: Boolean,
      default: true
    }
  }],
  
  // SSIDs Broadcast
  ssids: [{
    ssid: String,
    enabled: Boolean,
    hidden: Boolean,
    vlanId: Number,
    security: {
      type: String,
      enum: ['WPA3-Enterprise', 'WPA3-Personal', 'WPA2-Enterprise', 'WPA2-Personal', 'WPA', 'WEP', 'Open']
    },
    radiuServer: String,
    bandSteering: Boolean,
    clientIsolation: Boolean,
    maxClients: Number
  }],
  
  // Location
  location: {
    building: String,
    floor: Number,
    zone: String,
    room: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    mountType: {
      type: String,
      enum: ['ceiling', 'wall', 'desk', 'outdoor', 'pole']
    },
    height: Number,
    floorPlanPosition: {
      x: Number,
      y: Number
    }
  },
  
  // Network Configuration
  network: {
    ipAddress: String,
    subnetMask: String,
    gateway: String,
    dnsServers: [String],
    vlan: Number,
    dhcp: Boolean,
    mgmtVlan: Number
  },
  
  // Performance Metrics
  performance: {
    clientCount: {
      type: Number,
      default: 0
    },
    maxClients: {
      type: Number,
      default: 100
    },
    throughput: {
      upload: Number,
      download: Number
    },
    utilization: {
      cpu: Number,
      memory: Number,
      channel: Number
    },
    interference: {
      level: {
        type: String,
        enum: ['none', 'low', 'medium', 'high']
      },
      sources: [String]
    },
    retryRate: Number,
    errorRate: Number,
    avgClientRssi: Number
  },
  
  // Security Features
  security: {
    wipsEnabled: Boolean,
    rogueApDetection: Boolean,
    clientIsolation: Boolean,
    pmfRequired: Boolean,
    radiusAccountig: Boolean,
    macFiltering: {
      enabled: Boolean,
      mode: {
        type: String,
        enum: ['whitelist', 'blacklist']
      },
      entries: [String]
    }
  },
  
  // Management
  management: {
    controller: {
      type: String,
      enum: ['meraki', 'aruba-central', 'unifi', 'ruckus-cloud', 'mist', 'fortinet', 'standalone']
    },
    controllerId: String,
    controllerUrl: String,
    sshEnabled: Boolean,
    snmpEnabled: Boolean,
    webUiEnabled: Boolean,
    lastConfigSync: Date,
    configVersion: String
  },
  
  // Monitoring
  monitoring: {
    syslogServer: String,
    snmpTrapReceiver: String,
    alertsEnabled: Boolean,
    healthCheckInterval: {
      type: Number,
      default: 60
    }
  },
  
  // Connected Clients (summary)
  connectedClients: {
    total: {
      type: Number,
      default: 0
    },
    band24: {
      type: Number,
      default: 0
    },
    band5: {
      type: Number,
      default: 0
    },
    band6: {
      type: Number,
      default: 0
    }
  },
  
  // Traffic Statistics
  trafficStats: {
    daily: {
      bytesReceived: Number,
      bytesSent: Number,
      clientSessions: Number
    },
    weekly: {
      bytesReceived: Number,
      bytesSent: Number,
      clientSessions: Number
    },
    monthly: {
      bytesReceived: Number,
      bytesSent: Number,
      clientSessions: Number
    }
  },
  
  // Neighbor APs
  neighborAps: [{
    bssid: String,
    ssid: String,
    channel: Number,
    rssi: Number,
    isManaged: Boolean,
    lastSeen: Date
  }],
  
  // Compliance
  compliance: {
    lastAudit: Date,
    issues: [{
      type: String,
      severity: String,
      description: String,
      remediation: String
    }],
    score: Number
  },
  
  // Metadata
  tags: [String],
  notes: String,
  organizationId: String,
  siteId: String,
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
accessPointSchema.index({ status: 1, 'location.building': 1 });
accessPointSchema.index({ 'hardware.manufacturer': 1, 'hardware.model': 1 });
accessPointSchema.index({ 'management.controller': 1 });
accessPointSchema.index({ lastSeen: -1 });
accessPointSchema.index({ organizationId: 1, siteId: 1 });

module.exports = mongoose.model('AccessPoint', accessPointSchema);
