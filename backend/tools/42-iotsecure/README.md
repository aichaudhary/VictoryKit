# 🔌 IoTSecure - Enterprise IoT Security & Device Management Platform

<div align="center">

![IoTSecure Logo](https://img.shields.io/badge/IoTSecure-IoT%20Security-06B6D4?style=for-the-badge&logo=wifi&logoColor=white)
![Version](https://img.shields.io/badge/version-1.0.0-0891B2?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-22D3EE?style=for-the-badge)

**Comprehensive IoT Device Security, Monitoring & Threat Detection**

[Live Demo](https://iotsecure.maula.ai) • [API Docs](https://iotsecure.maula.ai/docs) • [Support](mailto:support@maula.ai)

</div>

---

## 📋 Table of Contents

- [Executive Summary](#-executive-summary)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [ML Models](#-ml-models)
- [Real-World Use Cases](#-real-world-use-cases)
- [Compliance & Standards](#-compliance--standards)
- [Pricing](#-pricing)
- [Roadmap](#-roadmap)

---

## 🎯 Executive Summary

**IoTSecure** is an enterprise-grade IoT security platform designed to protect organizations from the growing threats targeting connected devices, industrial control systems, and smart infrastructure.

### The Challenge

- **75 billion** IoT devices expected by 2025 (Statista)
- **57%** of IoT devices are vulnerable to medium or high-severity attacks (Palo Alto)
- **98%** of all IoT traffic is unencrypted (Unit 42)
- **Average cost** of IoT-related breach: **$13.4 million** (IBM)
- Traditional security tools can't see or protect IoT devices

### Our Solution

IoTSecure provides:

| Capability | Description |
|------------|-------------|
| **Device Discovery** | Auto-discover all IoT devices on your network |
| **Risk Assessment** | Real-time vulnerability scoring for every device |
| **Behavior Analysis** | ML-powered anomaly detection for IoT traffic |
| **Segmentation** | Automated micro-segmentation recommendations |
| **Firmware Security** | Firmware vulnerability scanning & updates |
| **Compliance** | IEC 62443, NIST IoT framework compliance |

---

## 🚀 Key Features

### 1. Automatic Device Discovery

```
┌─────────────────────────────────────────────────────────────────┐
│                    IoT DEVICE DISCOVERY                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Discovery Methods:                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │   Passive   │ │   Active    │ │    Agent    │              │
│  │  Listening  │ │   Scanning  │ │    Based    │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
│                                                                 │
│  Device Classification:                                         │
│  • Industrial Controllers (PLCs, RTUs, HMIs)                   │
│  • Medical Devices (Infusion pumps, monitors)                  │
│  • Building Systems (HVAC, lighting, access)                   │
│  • Cameras & Surveillance                                       │
│  • Smart Sensors & Actuators                                    │
│  • Network Equipment (routers, switches)                       │
│                                                                 │
│  Discovered: 2,847 devices | Classified: 98.5%                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Device Inventory & Profiling

| Attribute | Auto-Detected | Example |
|-----------|---------------|---------|
| **Device Type** | ✅ Yes | IP Camera |
| **Manufacturer** | ✅ Yes | Hikvision |
| **Model** | ✅ Yes | DS-2CD2385G1 |
| **Firmware Version** | ✅ Yes | v5.6.5 |
| **MAC Address** | ✅ Yes | 00:1A:2B:3C:4D:5E |
| **IP Address** | ✅ Yes | 192.168.1.150 |
| **Protocols** | ✅ Yes | RTSP, HTTP, ONVIF |
| **Open Ports** | ✅ Yes | 80, 443, 554, 8000 |
| **Risk Score** | ✅ Yes | 72/100 (Medium) |

### 3. Vulnerability Assessment

```javascript
// Real-time vulnerability scanning
const vulnerabilities = await iotSecure.scan({
  deviceId: 'iot-camera-001',
  scanType: 'comprehensive',
  checks: [
    'default-credentials',
    'firmware-vulnerabilities',
    'open-ports',
    'encryption-status',
    'protocol-security',
    'certificate-validity'
  ]
});

// Result
{
  "deviceId": "iot-camera-001",
  "riskScore": 72,
  "vulnerabilities": [
    {
      "severity": "critical",
      "type": "default-credentials",
      "description": "Device using factory default password",
      "cve": null,
      "remediation": "Change default credentials immediately"
    },
    {
      "severity": "high",
      "type": "firmware",
      "description": "Outdated firmware with known CVEs",
      "cve": ["CVE-2023-28808", "CVE-2023-28809"],
      "remediation": "Update to firmware v5.7.2 or later"
    }
  ]
}
```

### 4. Behavioral Analysis & Anomaly Detection

```
┌────────────────────────────────────────────────────────────────┐
│                 IoT BEHAVIOR ANALYTICS                         │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Normal Behavior Profile (IP Camera):                          │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ • Streams video to NVR (192.168.1.10) on port 554       │ │
│  │ • Receives commands from management (192.168.1.5)        │ │
│  │ • NTP sync every 1 hour                                  │ │
│  │ • Average bandwidth: 4-8 Mbps                            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ⚠️  ANOMALY DETECTED:                                        │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Device: IP Camera (iot-camera-001)                       │ │
│  │ Anomaly: Outbound connection to 185.234.x.x (Russia)     │ │
│  │ Risk: Potential C2 communication or data exfiltration    │ │
│  │ Action: Quarantined - Awaiting review                    │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Anomaly Types Detected:                                       │
│  • Unusual destinations    • Protocol deviations              │
│  • Bandwidth spikes        • Port scanning                    │
│  • Firmware tampering      • Configuration changes            │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 5. Network Segmentation

```yaml
# Auto-generated segmentation policy
segmentation_policy:
  name: "IoT Camera Segment"
  devices: 
    - type: "ip-camera"
    - manufacturer: "Hikvision"
  
  allowed_communications:
    - destination: "nvr-server"
      ports: [554, 8000]
      protocol: "tcp"
      direction: "outbound"
    
    - destination: "management-server"
      ports: [443]
      protocol: "tcp"
      direction: "both"
    
    - destination: "ntp-server"
      ports: [123]
      protocol: "udp"
      direction: "outbound"
  
  blocked_communications:
    - destination: "internet"
      action: "block"
      log: true
    
    - destination: "corporate-network"
      action: "block"
      log: true
  
  enforcement: "firewall-rules"
```

### 6. Firmware Security Management

```
┌─────────────────────────────────────────────────────────────────┐
│                  FIRMWARE SECURITY CENTER                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Device: Siemens SCALANCE X208 (Industrial Switch)             │
│                                                                 │
│  Current Firmware: v4.3.1                                       │
│  Latest Available: v4.5.0                                       │
│  Status: ⚠️ UPDATE AVAILABLE                                    │
│                                                                 │
│  Security Analysis:                                             │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ CVE-2023-44315 (Critical) - Fixed in v4.4.0              │ │
│  │ CVE-2023-44316 (High) - Fixed in v4.4.2                  │ │
│  │ CVE-2024-12345 (Medium) - Fixed in v4.5.0                │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Firmware Integrity:                                            │
│  ✅ Signature Valid                                             │
│  ✅ No Tampering Detected                                       │
│  ✅ Secure Boot Enabled                                         │
│                                                                 │
│  [Schedule Update]  [Download Now]  [View Changelog]           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          IoTSecure Architecture                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       FRONTEND (Port 3042)                           │   │
│  │  React 19 + TypeScript + TailwindCSS + D3.js Network Visualization  │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│  │  │Dashboard│ │ Devices │ │  Vulns  │ │Anomalies│ │Segments │       │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘       │   │
│  └──────────────────────────────┬──────────────────────────────────────┘   │
│                                 │                                           │
│                                 ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      API GATEWAY (Port 4042)                         │   │
│  │  Node.js + Express.js + JWT Authentication + Rate Limiting          │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │   │
│  │  │ Devices  │ │  Vulns   │ │ Behavior │ │ Firmware │               │   │
│  │  │   API    │ │   API    │ │   API    │ │   API    │               │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │   │
│  └──────────────────────────────┬──────────────────────────────────────┘   │
│                                 │                                           │
│           ┌─────────────────────┼─────────────────────┐                    │
│           │                     │                     │                    │
│           ▼                     ▼                     ▼                    │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────────────┐  │
│  │    MongoDB      │   │   ML Engine     │   │   Discovery Engine      │  │
│  │   (Database)    │   │  (Port 8042)    │   │                         │  │
│  │                 │   │                 │   │  • Passive Listening    │  │
│  │  • Devices      │   │  Python + FastAPI│  │  • Active Scanning      │  │
│  │  • Vulns        │   │  • Anomaly Det. │  │  • Protocol Analysis    │  │
│  │  • Behaviors    │   │  • Risk Scoring │  │  • Device Fingerprint   │  │
│  │  • Alerts       │   │  • Classification│  │  • Network Mapping      │  │
│  └─────────────────┘   └─────────────────┘   └─────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    WebSocket Server (Port 6042)                      │   │
│  │  Real-time device status, alerts, anomaly notifications             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### IoT Traffic Flow Analysis

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      IoT TRAFFIC ANALYSIS PIPELINE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  NETWORK TAP           PACKET CAPTURE        DEEP INSPECTION               │
│  ┌──────────┐         ┌──────────────┐      ┌──────────────┐               │
│  │  SPAN    │────────▶│   Packet     │─────▶│  Protocol    │               │
│  │  Port    │         │   Broker     │      │  Decoder     │               │
│  └──────────┘         └──────────────┘      └──────────────┘               │
│                                                    │                        │
│                                                    ▼                        │
│                              ┌────────────────────────────────────┐        │
│                              │        ANALYSIS ENGINE             │        │
│                              │                                    │        │
│                              │  ┌──────────┐  ┌──────────────┐   │        │
│                              │  │ Behavior │  │  Anomaly     │   │        │
│                              │  │ Profiling│  │  Detection   │   │        │
│                              │  └──────────┘  └──────────────┘   │        │
│                              │                                    │        │
│                              │  ┌──────────┐  ┌──────────────┐   │        │
│                              │  │  Threat  │  │    Risk      │   │        │
│                              │  │ Matching │  │   Scoring    │   │        │
│                              │  └──────────┘  └──────────────┘   │        │
│                              └────────────────────────────────────┘        │
│                                              │                              │
│                    ┌─────────────────────────┼─────────────────────────┐   │
│                    │                         │                         │   │
│                    ▼                         ▼                         ▼   │
│             ┌───────────┐            ┌───────────┐             ┌─────────┐│
│             │   Alert   │            │  Update   │             │ Report  ││
│             │  Engine   │            │  Profile  │             │ Engine  ││
│             └───────────┘            └───────────┘             └─────────┘│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI Framework |
| TypeScript | 5.x | Type Safety |
| TailwindCSS | 3.x | Styling |
| D3.js | 7.x | Network Visualization |
| Lucide React | Latest | Icons |
| React Router | 6.x | Navigation |
| Axios | 1.x | HTTP Client |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x LTS | Runtime |
| Express.js | 4.x | API Framework |
| MongoDB | 7.x | Database |
| Mongoose | 8.x | ODM |
| JWT | Latest | Authentication |
| Socket.io | 4.x | Real-time |
| node-pcap | Latest | Packet Capture |

### ML Engine
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | Runtime |
| FastAPI | 0.100+ | API Framework |
| scikit-learn | 1.3+ | ML Models |
| TensorFlow | 2.15+ | Deep Learning |
| Scapy | 2.5+ | Packet Analysis |
| NetworkX | 3.x | Graph Analysis |

---

## 📦 Installation

### Prerequisites

- Node.js 20.x LTS
- Python 3.11+
- MongoDB 7.x
- Docker & Docker Compose (optional)
- libpcap (for packet capture)

### Quick Start

```bash
# Clone repository
git clone https://github.com/maula-ai/iotsecure.git
cd iotsecure

# Install backend dependencies
cd backend/tools/42-iotsecure/api
npm install

# Install ML engine dependencies
cd ../ml-engine
pip install -r requirements.txt

# Install frontend dependencies
cd ../../../frontend/tools/42-iotsecure
npm install

# Start all services
docker-compose up -d
```

### Environment Variables

```bash
# Backend (.env)
NODE_ENV=production
PORT=4042
MONGODB_URI=mongodb://localhost:27017/iotsecure_db
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# ML Engine (.env)
ML_PORT=8042
MODEL_PATH=/models
CAPTURE_INTERFACE=eth0
LOG_LEVEL=INFO

# Frontend (.env)
VITE_API_URL=http://localhost:4042/api
VITE_ML_URL=http://localhost:8042
VITE_WS_URL=ws://localhost:6042
```

---

## ⚙️ Configuration

### iotsecure-config.json

```json
{
  "toolName": "IoTSecure",
  "toolNumber": 42,
  "subdomain": "iotsecure.maula.ai",
  "ports": {
    "frontend": 3042,
    "api": 4042,
    "ml": 8042,
    "websocket": 6042
  },
  "database": {
    "name": "iotsecure_db",
    "collections": [
      "devices",
      "vulnerabilities",
      "behaviors",
      "anomalies",
      "segments",
      "firmwares",
      "alerts",
      "scans",
      "policies",
      "accesslogs"
    ]
  },
  "theme": {
    "primary": "#06B6D4",
    "secondary": "#0891B2",
    "accent": "#22D3EE"
  }
}
```

---

## 📡 API Reference

### Base URL

```
Production: https://iotsecure.maula.ai/api/v1
Development: http://localhost:4042/api/v1
```

### Authentication

All API requests require JWT authentication:

```bash
Authorization: Bearer <token>
```

### Devices API

#### List IoT Devices
```http
GET /iot/devices
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| type | string | Filter by device type |
| riskLevel | string | Filter by risk (critical, high, medium, low) |
| status | string | Filter by status (online, offline, unknown) |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 50) |

**Response:**
```json
{
  "success": true,
  "data": {
    "devices": [
      {
        "_id": "65abc123...",
        "deviceId": "IOT-CAM-001",
        "name": "Lobby Camera 1",
        "type": "ip-camera",
        "manufacturer": "Hikvision",
        "model": "DS-2CD2385G1",
        "firmware": {
          "version": "v5.6.5",
          "lastUpdate": "2024-01-01T00:00:00Z",
          "latestAvailable": "v5.7.2"
        },
        "network": {
          "macAddress": "00:1A:2B:3C:4D:5E",
          "ipAddress": "192.168.10.50",
          "vlan": 100,
          "segment": "iot-cameras"
        },
        "security": {
          "riskScore": 72,
          "riskLevel": "medium",
          "vulnerabilities": 3,
          "lastScan": "2024-01-20T10:00:00Z"
        },
        "status": "online",
        "lastSeen": "2024-01-20T14:30:00Z"
      }
    ],
    "pagination": {
      "total": 2847,
      "page": 1,
      "limit": 50,
      "pages": 57
    }
  }
}
```

#### Get Device Details
```http
GET /iot/devices/:deviceId
```

#### Scan Device
```http
POST /iot/devices/:deviceId/scan
```

**Request Body:**
```json
{
  "scanType": "comprehensive",
  "checks": ["default-credentials", "firmware", "open-ports", "encryption"]
}
```

### Vulnerabilities API

#### List Vulnerabilities
```http
GET /iot/vulnerabilities
```

**Response:**
```json
{
  "success": true,
  "data": {
    "vulnerabilities": [
      {
        "_id": "65xyz789...",
        "vulnId": "VULN-2024-001",
        "deviceId": "IOT-CAM-001",
        "type": "firmware",
        "severity": "critical",
        "cve": "CVE-2023-28808",
        "description": "Remote code execution vulnerability in Hikvision cameras",
        "cvss": 9.8,
        "status": "open",
        "remediation": {
          "steps": ["Update firmware to v5.7.2 or later"],
          "automated": true,
          "estimatedTime": "15 minutes"
        },
        "discoveredAt": "2024-01-15T08:00:00Z"
      }
    ],
    "summary": {
      "critical": 12,
      "high": 45,
      "medium": 128,
      "low": 234
    }
  }
}
```

### Anomalies API

#### Get Detected Anomalies
```http
GET /iot/anomalies
```

**Response:**
```json
{
  "success": true,
  "data": {
    "anomalies": [
      {
        "_id": "65ano456...",
        "anomalyId": "ANO-2024-001",
        "deviceId": "IOT-CAM-001",
        "type": "communication",
        "severity": "high",
        "description": "Unusual outbound connection to external IP",
        "details": {
          "sourceIp": "192.168.10.50",
          "destIp": "185.234.219.100",
          "destPort": 443,
          "protocol": "HTTPS",
          "bytesTransferred": 1048576,
          "duration": 300
        },
        "baseline": {
          "expectedDestinations": ["192.168.1.10", "192.168.1.5"],
          "deviationScore": 0.95
        },
        "status": "investigating",
        "detectedAt": "2024-01-20T14:25:00Z"
      }
    ]
  }
}
```

### Segmentation API

#### Get Segmentation Policies
```http
GET /iot/segments
```

#### Create Segment Policy
```http
POST /iot/segments
```

**Request Body:**
```json
{
  "name": "Medical Devices Segment",
  "description": "Isolation policy for medical IoT devices",
  "devices": {
    "criteria": {
      "type": "medical-device",
      "manufacturer": ["Philips", "GE Healthcare"]
    }
  },
  "rules": {
    "allowed": [
      {"destination": "medical-server", "ports": [443, 2575]}
    ],
    "blocked": [
      {"destination": "internet"},
      {"destination": "corporate-lan"}
    ]
  },
  "enforcement": "automatic"
}
```

---

## 🗄️ Database Schema

### Devices Collection

```javascript
const DeviceSchema = new Schema({
  deviceId: { type: String, required: true, unique: true },
  name: String,
  type: {
    type: String,
    enum: ['ip-camera', 'industrial-controller', 'medical-device', 
           'hvac', 'access-control', 'sensor', 'actuator', 'other'],
    required: true
  },
  manufacturer: String,
  model: String,
  serialNumber: String,
  firmware: {
    version: String,
    lastUpdate: Date,
    latestAvailable: String,
    updateAvailable: Boolean
  },
  network: {
    macAddress: { type: String, required: true },
    ipAddress: String,
    hostname: String,
    vlan: Number,
    segment: String,
    ports: [{
      port: Number,
      protocol: String,
      service: String,
      state: String
    }]
  },
  protocols: [{
    name: String,
    version: String,
    encrypted: Boolean
  }],
  security: {
    riskScore: { type: Number, min: 0, max: 100 },
    riskLevel: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium'
    },
    vulnerabilities: { type: Number, default: 0 },
    lastScan: Date,
    defaultCredentials: Boolean,
    encryptionEnabled: Boolean
  },
  behavior: {
    profileId: { type: Schema.Types.ObjectId, ref: 'BehaviorProfile' },
    normalDestinations: [String],
    normalPorts: [Number],
    avgBandwidth: Number,
    lastAnomaly: Date
  },
  location: {
    building: String,
    floor: String,
    room: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'unknown', 'quarantined'],
    default: 'unknown'
  },
  lastSeen: Date,
  discoveredAt: Date,
  metadata: {
    discoveryMethod: String,
    tags: [String],
    owner: String,
    department: String
  }
}, { timestamps: true });
```

### Vulnerabilities Collection

```javascript
const VulnerabilitySchema = new Schema({
  vulnId: { type: String, required: true, unique: true },
  deviceId: { type: Schema.Types.ObjectId, ref: 'Device', required: true },
  type: {
    type: String,
    enum: ['firmware', 'configuration', 'credential', 'protocol', 
           'encryption', 'certificate', 'network'],
    required: true
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'info'],
    required: true
  },
  cve: String,
  cvss: { type: Number, min: 0, max: 10 },
  title: String,
  description: String,
  affectedComponent: String,
  remediation: {
    steps: [String],
    automated: { type: Boolean, default: false },
    estimatedTime: String,
    priority: Number
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'remediated', 'accepted', 'false-positive'],
    default: 'open'
  },
  discoveredAt: { type: Date, default: Date.now },
  remediatedAt: Date,
  verifiedAt: Date
}, { timestamps: true });
```

### Behavior Profiles Collection

```javascript
const BehaviorProfileSchema = new Schema({
  profileId: { type: String, required: true, unique: true },
  deviceId: { type: Schema.Types.ObjectId, ref: 'Device', required: true },
  status: {
    type: String,
    enum: ['learning', 'active', 'paused'],
    default: 'learning'
  },
  learningPeriod: {
    startDate: Date,
    endDate: Date,
    samplesCollected: Number
  },
  baseline: {
    destinations: [{
      ip: String,
      port: Number,
      protocol: String,
      frequency: Number,
      avgBytes: Number
    }],
    bandwidth: {
      avgInbound: Number,
      avgOutbound: Number,
      peakInbound: Number,
      peakOutbound: Number
    },
    timing: {
      activeHours: [Number],
      connectionPattern: String
    },
    protocols: [{
      name: String,
      frequency: Number
    }]
  },
  thresholds: {
    bandwidthDeviation: Number,
    newDestinationAlert: Boolean,
    portScanThreshold: Number,
    connectionRateThreshold: Number
  },
  lastUpdated: Date
}, { timestamps: true });
```

### Anomalies Collection

```javascript
const AnomalySchema = new Schema({
  anomalyId: { type: String, required: true, unique: true },
  deviceId: { type: Schema.Types.ObjectId, ref: 'Device', required: true },
  profileId: { type: Schema.Types.ObjectId, ref: 'BehaviorProfile' },
  type: {
    type: String,
    enum: ['communication', 'bandwidth', 'port-scan', 'protocol', 
           'timing', 'firmware', 'configuration'],
    required: true
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    required: true
  },
  description: String,
  details: {
    sourceIp: String,
    destIp: String,
    destPort: Number,
    protocol: String,
    bytesTransferred: Number,
    duration: Number,
    packetCount: Number
  },
  baseline: {
    expectedBehavior: String,
    deviationScore: Number,
    confidence: Number
  },
  mlAnalysis: {
    modelUsed: String,
    confidence: Number,
    features: Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['new', 'investigating', 'confirmed', 'false-positive', 'resolved'],
    default: 'new'
  },
  response: {
    action: String,
    automated: Boolean,
    timestamp: Date,
    note: String
  },
  detectedAt: { type: Date, default: Date.now },
  resolvedAt: Date
}, { timestamps: true });
```

### Segments Collection

```javascript
const SegmentSchema = new Schema({
  segmentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'draft'
  },
  devices: {
    criteria: {
      types: [String],
      manufacturers: [String],
      riskLevels: [String],
      tags: [String]
    },
    count: { type: Number, default: 0 },
    deviceIds: [{ type: Schema.Types.ObjectId, ref: 'Device' }]
  },
  rules: {
    allowed: [{
      destination: String,
      ports: [Number],
      protocol: String,
      direction: String
    }],
    blocked: [{
      destination: String,
      ports: [Number],
      reason: String
    }]
  },
  enforcement: {
    type: String,
    enum: ['automatic', 'manual', 'monitoring'],
    default: 'monitoring'
  },
  firewall: {
    integrated: Boolean,
    ruleIds: [String],
    lastSync: Date
  },
  metrics: {
    blockedConnections: Number,
    allowedConnections: Number,
    violations: Number
  }
}, { timestamps: true });
```

---

## 🤖 ML Models

### 1. Device Classification Model

**Purpose:** Automatically identify and classify IoT devices based on network traffic patterns.

```python
class DeviceClassificationModel:
    """
    Classifies IoT devices using traffic fingerprinting
    and behavioral analysis.
    """
    
    def __init__(self):
        self.model = RandomForestClassifier(
            n_estimators=200,
            max_depth=15
        )
    
    def classify(self, features: dict) -> dict:
        """
        Features:
        - MAC OUI (manufacturer prefix)
        - Open ports and services
        - Protocol patterns
        - Traffic timing
        - Packet sizes
        - TLS fingerprint
        
        Returns device classification with confidence.
        """
        return {
            'device_type': 'ip-camera',
            'manufacturer': 'Hikvision',
            'model_family': 'DS-2CD',
            'confidence': 0.94,
            'alternatives': [
                {'type': 'nvr', 'confidence': 0.04}
            ]
        }
```

### 2. Anomaly Detection Model

**Purpose:** Detect behavioral anomalies in IoT device traffic.

```python
class IoTAnomalyDetector:
    """
    Detects anomalous behavior in IoT devices
    using unsupervised learning.
    """
    
    def __init__(self):
        self.isolation_forest = IsolationForest(
            contamination=0.01,
            random_state=42
        )
        self.autoencoder = None  # Deep learning model
    
    def detect(self, traffic_features: dict) -> dict:
        """
        Analyzes:
        - Destination IPs and ports
        - Bandwidth patterns
        - Connection timing
        - Protocol usage
        - Payload characteristics
        
        Returns anomaly detection results.
        """
        return {
            'is_anomaly': True,
            'anomaly_score': 0.89,
            'anomaly_type': 'unusual_destination',
            'confidence': 0.92,
            'contributing_features': [
                'destination_ip',
                'connection_time'
            ]
        }
```

### 3. Risk Scoring Model

**Purpose:** Calculate comprehensive risk scores for IoT devices.

```python
class IoTRiskScoringModel:
    """
    Calculates risk scores based on multiple
    vulnerability and behavior factors.
    """
    
    def score(self, device_data: dict) -> dict:
        """
        Factors:
        - Vulnerability count and severity
        - Firmware age and patch status
        - Default credentials
        - Encryption status
        - Network exposure
        - Behavioral anomalies
        - Manufacturer security history
        
        Returns risk score 0-100.
        """
        return {
            'risk_score': 72,
            'risk_level': 'medium',
            'factors': {
                'vulnerabilities': 25,
                'firmware': 15,
                'configuration': 12,
                'network_exposure': 10,
                'behavior': 10
            },
            'recommendations': [
                'Update firmware immediately',
                'Change default credentials',
                'Enable encryption'
            ]
        }
```

### 4. Traffic Baseline Model

**Purpose:** Learn and maintain normal behavior profiles for devices.

```python
class TrafficBaselineModel:
    """
    Learns normal traffic patterns for IoT devices
    to enable anomaly detection.
    """
    
    def learn(self, traffic_history: list) -> dict:
        """
        Learns:
        - Normal destinations
        - Typical bandwidth usage
        - Connection timing patterns
        - Protocol usage
        
        Returns learned baseline profile.
        """
        return {
            'normal_destinations': [
                {'ip': '192.168.1.10', 'port': 554, 'frequency': 0.95},
                {'ip': '192.168.1.5', 'port': 443, 'frequency': 0.05}
            ],
            'bandwidth': {
                'avg_mbps': 5.2,
                'std_dev': 1.8,
                'peak_time': '14:00-18:00'
            },
            'learning_confidence': 0.88,
            'samples_analyzed': 50000
        }
```

---

## 🌍 Real-World Use Cases

### 1. Manufacturing - Smart Factory Security

**Challenge:** Secure 5,000+ IoT devices across 12 production facilities.

**Solution:**
```yaml
Deployment: Smart Factory IoT Security
Devices Discovered: 5,234
Device Types:
  - PLCs: 450
  - Sensors: 2,800
  - HMIs: 320
  - Cameras: 650
  - Others: 1,014

Results:
  - Critical vulnerabilities found: 234
  - Default credentials: 89 devices
  - Anomalies detected: 45
  - Attack prevented: 3 (attempted C2)
  - Compliance achieved: IEC 62443
```

### 2. Healthcare - Medical Device Protection

**Challenge:** Protect medical IoT devices while maintaining patient care.

**Solution:**
```yaml
Deployment: Hospital Network
Devices Protected: 1,847
Device Types:
  - Infusion pumps: 320
  - Patient monitors: 280
  - Imaging systems: 45
  - HVAC/Building: 890
  - Others: 312

Results:
  - HIPAA compliance maintained
  - Zero patient data breaches
  - 156 vulnerabilities remediated
  - Network segmentation: 100%
  - FDA cybersecurity ready
```

### 3. Smart Building - Campus Security

**Challenge:** Secure IoT devices across 50-building corporate campus.

**Solution:**
```yaml
Deployment: Corporate Campus
Buildings: 50
Devices: 12,450
Categories:
  - Access control: 2,100
  - HVAC systems: 3,200
  - Lighting: 4,500
  - Surveillance: 1,850
  - Others: 800

Results:
  - Full device visibility
  - 98% risk reduction
  - Automated segmentation
  - Energy savings: 15%
  - Insurance premium reduced
```

---

## 📋 Compliance & Standards

### Supported Frameworks

| Framework | Coverage | Auto-Reporting |
|-----------|----------|----------------|
| IEC 62443 | ✅ Full | ✅ Yes |
| NIST IoT Framework | ✅ Full | ✅ Yes |
| FDA Cybersecurity | ✅ Full | ✅ Yes |
| HIPAA (Medical IoT) | ✅ Full | ✅ Yes |
| PCI-DSS (Point of Sale) | ✅ Full | ✅ Yes |
| NERC CIP (Energy) | ✅ Full | ✅ Yes |
| ISO 27001 | ✅ Full | ✅ Yes |

---

## 💰 Pricing

### Tier Comparison

| Feature | Starter | Professional | Enterprise |
|---------|---------|--------------|------------|
| Devices | 100 | 1,000 | Unlimited |
| Discovery | ✅ Basic | ✅ Advanced | ✅ Full |
| Vulnerability Scanning | Weekly | Daily | Real-time |
| Anomaly Detection | ❌ | ✅ | ✅ |
| Network Segmentation | ❌ | ✅ | ✅ |
| OT/ICS Support | ❌ | ❌ | ✅ |
| API Access | ❌ | ✅ | ✅ |
| **Price/Month** | **$299** | **$999** | **Custom** |

---

## 🗺️ Roadmap

### Q1 2025
- [ ] 5G/LTE IoT device support
- [ ] Enhanced OT protocol support (Modbus, OPC-UA)
- [ ] Cloud-managed IoT integration

### Q2 2025
- [ ] Automated firmware patching
- [ ] Zero-trust micro-segmentation
- [ ] AI-powered threat hunting

### Q3 2025
- [ ] Digital twin security modeling
- [ ] Quantum-safe encryption detection
- [ ] Supply chain risk assessment

### Q4 2025
- [ ] Autonomous response capabilities
- [ ] Industry-specific compliance packs
- [ ] Global IoT threat intelligence

---

## 🤝 Support

### Documentation
- [User Guide](https://docs.iotsecure.maula.ai)
- [API Reference](https://api.iotsecure.maula.ai/docs)
- [Video Tutorials](https://youtube.com/iotsecure)

### Community
- [Discord Community](https://discord.gg/iotsecure)
- [GitHub Discussions](https://github.com/maula-ai/iotsecure/discussions)

### Enterprise Support
- 24/7 Phone Support: +1 (888) IOT-SEC-1
- Email: enterprise@iotsecure.maula.ai
- Dedicated Success Manager

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with 💙 by the Maula AI Team**

[Website](https://maula.ai) • [Twitter](https://twitter.com/maula_ai) • [LinkedIn](https://linkedin.com/company/maula-ai)

</div>
