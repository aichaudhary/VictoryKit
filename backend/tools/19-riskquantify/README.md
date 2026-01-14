# 🛡️ RiskQuantify - IP Risk Scanner & Payment Sandbox

![RiskQuantify Logo](https://img.shields.io/badge/RiskQuantify-IP%20Risk%20Scanner-8b5cf6?style=for-the-badge&logo=shield&logoColor=white)

[![Version](https://img.shields.io/badge/version-19.1.0-8b5cf6.svg)](https://github.com/aichaudhary/VictoryKit)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248.svg)](https://mongodb.com/)

**Real-time IP Risk Analysis, Device Fingerprinting & Payment Simulation Platform**

🌐 **Live:** https://riskquantify.maula.ai

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [Architecture](#-architecture)
4. [Technology Stack](#-technology-stack)
5. [Installation](#-installation)
6. [API Reference](#-api-reference)
7. [Database Schema](#-database-schema)
8. [Third-Party APIs](#-third-party-apis)
9. [Deployment](#-deployment)

---

## 🎯 Overview

**RiskQuantify** is a user-facing IP risk scanner and payment sandbox platform. Similar to ip-score.com, it allows users to check their IP reputation, risk scores, blacklist status, and simulate payment scenarios to understand potential payment declines.

### Why RiskQuantify?

- **Auto IP Detection**: Automatically detects visitor's IP on page load
- **Real-time Risk Scoring**: Risk, Fraud, and Abuse scores (0-100)
- **Blacklist Checking**: 10+ major blacklist databases
- **Device Fingerprinting**: Browser, OS, canvas, WebGL fingerprints
- **Payment Sandbox**: Test payment scenarios with different configurations
- **VPN/Proxy Detection**: Identifies VPN, Proxy, Tor, Datacenter IPs

### Use Cases

| Use Case | Description |
|----------|-------------|
| **IP Risk Check** | Users check their own IP reputation |
| **Payment Troubleshooting** | Understand why payments get declined |
| **VPN Detection** | Check if VPN/Proxy is detected |
| **Blacklist Lookup** | See if IP is on any blacklists |
| **Device Trust** | Analyze device fingerprint trust score |
| **Payment Testing** | Simulate payments before real transactions |

---

## ✨ Key Features

### 🔍 Tab 1: My IP Scanner (Auto-Detection)

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTO IP DETECTION                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐   │
│   │  Visitor     │     │  IP Risk     │     │  Device      │   │
│   │  IP Detect   │────▶│  Analysis    │────▶│  Fingerprint │   │
│   └──────────────┘     └──────────────┘     └──────────────┘   │
│                                                                  │
│   Outputs:                                                       │
│   • Risk Score (0-100)      • VPN/Proxy Detection               │
│   • Fraud Score (0-100)     • Tor Exit Node Check               │
│   • Abuse Score (0-100)     • Datacenter IP Detection           │
│   • Blacklist Status        • Bot/Crawler Detection             │
│   • Reputation Level        • Device Trust Score                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Risk Scores:**
- **Risk Score**: Overall IP risk (0-100)
- **Fraud Score**: Likelihood of fraudulent activity
- **Abuse Score**: History of abuse reports

**Detection Flags:**
| Flag | Description |
|------|-------------|
| VPN | Virtual Private Network detected |
| Proxy | HTTP/SOCKS proxy detected |
| Tor | Tor exit node detected |
| Datacenter | Cloud/hosting provider IP |
| Bot | Automated traffic detected |
| Relay | Mail/open relay detected |

**Reputation Levels:**
- 🟢 **Excellent** (0-10 risk)
- 🟢 **Good** (10-20 risk)
- ⚪ **Neutral** (20-40 risk)
- 🟡 **Suspicious** (40-60 risk)
- 🟠 **Bad** (60-80 risk)
- 🔴 **Critical** (80-100 risk)

### 🌐 Tab 2: IP Lookup (Manual)

```
┌─────────────────────────────────────────────────────────────────┐
│                    MANUAL IP LOOKUP                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Enter any IP ──▶ [192.168.1.1] ──▶ [Analyze]                 │
│                                                                  │
│   Quick Examples: 8.8.8.8 | 1.1.1.1 | 185.220.101.1            │
│                                                                  │
│   Returns same analysis as auto-detection:                       │
│   • Risk/Fraud/Abuse Scores                                      │
│   • Detection Flags (VPN, Proxy, Tor, etc.)                     │
│   • Location (Country, City, Region, Timezone)                  │
│   • Network Info (ISP, Organization, ASN)                       │
│   • Blacklist Status (10 databases)                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 🎮 Tab 3: Payment Sandbox (Playground)

```
┌─────────────────────────────────────────────────────────────────┐
│                   PAYMENT SANDBOX                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Configuration:                                                 │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│   │  Amount      │  │  Currency    │  │  Region      │         │
│   │  [$100]      │  │  [USD ▼]     │  │  [US ▼]      │         │
│   └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│   ┌──────────────┐                                              │
│   │  Method      │  [💳 Card ▼]                                 │
│   └──────────────┘                                              │
│                                                                  │
│   Quick Scenarios:                                               │
│   • Small Purchase ($25 USD)                                    │
│   • Medium Purchase ($150 EUR)                                  │
│   • Large Purchase ($1500 USD)                                  │
│   • High Risk Region ($100 RU)                                  │
│                                                                  │
│   [🚀 Simulate Payment]                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Payment Simulation Checks:**
| Check | Description |
|-------|-------------|
| IP Reputation | IP risk score threshold |
| VPN/Proxy Check | VPN/Proxy detection |
| Datacenter IP | Cloud provider detection |
| Device Trust | Device fingerprint score |
| Blacklist Check | IP blacklist status |
| Geographic Risk | High-risk region detection |
| Amount Check | Transaction amount threshold |
| Tor Network | Tor exit node detection |

**Result Statuses:**
- ✅ **Approved** - Payment would succeed
- 🔄 **Pending** - Additional verification needed
- ⚠️ **Review** - Manual review required
- ❌ **Declined** - Payment blocked with reason

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    RISKQUANTIFY ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   FRONTEND (React + Vite)           Port: 3019                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │   │
│   │  │ Scanner  │  │ Lookup   │  │ Payment Playground   │  │   │
│   │  │ Tab      │  │ Tab      │  │ Tab                  │  │   │
│   │  └──────────┘  └──────────┘  └──────────────────────┘  │   │
│   └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│   BACKEND API (Node.js + Express)   Port: 4019                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│   │  │ IP Analysis  │  │ Device       │  │ Payment      │  │   │
│   │  │ Service      │  │ Fingerprint  │  │ Simulator    │  │   │
│   │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│   │                                                         │   │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│   │  │ Blacklist    │  │ GeoIP        │  │ Reputation   │  │   │
│   │  │ Checker      │  │ Service      │  │ Service      │  │   │
│   │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│   └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│   EXTERNAL APIS                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  • ipify.org (IP detection)                             │   │
│   │  • IP-API (Geolocation)                                 │   │
│   │  • AbuseIPDB (Abuse reports)                            │   │
│   │  • IPQualityScore (Fraud scoring)                       │   │
│   │  • Shodan (Network intelligence)                        │   │
│   │  • MaxMind GeoIP2 (Premium geolocation)                 │   │
│   └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│   DATABASE (MongoDB)                                             │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  • ip_lookups (lookup history & caching)                │   │
│   │  • device_fingerprints (device tracking)                │   │
│   │  • payment_simulations (sandbox results)                │   │
│   │  • blacklist_cache (cached blacklist data)              │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 6.x | Build tool |
| TailwindCSS | 3.x | Styling |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | 4.x | API framework |
| MongoDB | 7.0 | Database |
| Redis | 7.x | Caching |

### External APIs
| Service | Purpose |
|---------|---------|
| ipify.org | IP detection |
| IP-API | Geolocation |
| AbuseIPDB | Abuse reports |
| IPQualityScore | Fraud scoring |
| Shodan | Network intel |
| MaxMind | Premium GeoIP |

---

## 📦 Installation

### Prerequisites

- Node.js 18+
- MongoDB 7.0+
- Redis 7.x (optional, for caching)
- API keys for external services

### Quick Start

```bash
# Clone repository
git clone https://github.com/aichaudhary/VictoryKit.git
cd VictoryKit/backend/tools/19-riskquantify

# Install dependencies
cd api && npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev

# Frontend (separate terminal)
cd ../../frontend/tools/19-riskquantify
npm install
npm run dev
```

---

## 📡 API Reference

### IP Analysis

#### GET /api/v1/ip/analyze
Analyze an IP address for risk factors.

**Request:**
```bash
GET /api/v1/ip/analyze?ip=192.168.1.1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ip": "192.168.1.1",
    "riskScore": 25,
    "fraudScore": 30,
    "abuseScore": 15,
    "flags": {
      "isVpn": false,
      "isProxy": false,
      "isTor": false,
      "isDatacenter": false,
      "isBot": false,
      "isRelay": false
    },
    "location": {
      "country": "United States",
      "countryCode": "US",
      "city": "New York",
      "region": "New York",
      "timezone": "America/New_York"
    },
    "network": {
      "isp": "Comcast Cable",
      "org": "Comcast Corporation",
      "asn": "AS7922"
    },
    "blacklists": [
      { "name": "Spamhaus ZEN", "listed": false, "type": "spam" },
      { "name": "AbuseIPDB", "listed": false, "type": "abuse" }
    ],
    "reputation": "good",
    "reportCount": 0
  }
}
```

#### GET /api/v1/ip/my
Get visitor's own IP analysis.

**Response:** Same as above, using request IP.

### Device Fingerprint

#### POST /api/v1/device/analyze
Analyze device fingerprint for trust score.

**Request:**
```json
{
  "userAgent": "Mozilla/5.0...",
  "screenResolution": "1920x1080",
  "language": "en-US",
  "timezone": "America/New_York",
  "plugins": 5,
  "canvas": "abc123...",
  "webgl": "def456..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fingerprint": "FP-A1B2C3D4E5F6",
    "trustScore": 85,
    "browser": "Chrome",
    "browserVersion": "120",
    "os": "Windows",
    "osVersion": "11",
    "device": "Desktop",
    "flags": []
  }
}
```

### Payment Simulation

#### POST /api/v1/payment/simulate
Simulate a payment with current IP and device.

**Request:**
```json
{
  "amount": 100,
  "currency": "USD",
  "region": "US",
  "method": "card",
  "ipData": { ... },
  "deviceData": { ... }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "TXN-ABC123",
    "status": "approved",
    "riskScore": 25,
    "checks": [
      { "name": "IP Reputation", "passed": true, "message": "IP has good reputation" },
      { "name": "VPN/Proxy Check", "passed": true, "message": "No VPN/Proxy detected" }
    ],
    "processingTime": 245
  }
}
```

---

## 💾 Database Schema

### IP Lookups Collection
```javascript
{
  _id: ObjectId,
  ip: String,                    // IP address
  riskScore: Number,             // 0-100
  fraudScore: Number,            // 0-100
  abuseScore: Number,            // 0-100
  flags: {
    isVpn: Boolean,
    isProxy: Boolean,
    isTor: Boolean,
    isDatacenter: Boolean,
    isBot: Boolean,
    isRelay: Boolean
  },
  location: {
    country: String,
    countryCode: String,
    city: String,
    region: String,
    timezone: String
  },
  network: {
    isp: String,
    org: String,
    asn: String
  },
  blacklists: [{
    name: String,
    listed: Boolean,
    type: String
  }],
  reputation: String,            // excellent|good|neutral|suspicious|bad|critical
  reportCount: Number,
  lookupCount: Number,           // Times this IP was looked up
  lastLookup: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Device Fingerprints Collection
```javascript
{
  _id: ObjectId,
  fingerprint: String,           // Unique device ID
  trustScore: Number,            // 0-100
  browser: String,
  browserVersion: String,
  os: String,
  osVersion: String,
  device: String,
  screenResolution: String,
  language: String,
  timezone: String,
  plugins: Number,
  canvas: String,
  webgl: String,
  flags: [String],
  seenIPs: [String],             // IPs seen with this device
  seenCount: Number,
  lastSeen: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Payment Simulations Collection
```javascript
{
  _id: ObjectId,
  transactionId: String,
  status: String,                // approved|declined|review|pending
  amount: Number,
  currency: String,
  region: String,
  method: String,
  riskScore: Number,
  checks: [{
    name: String,
    passed: Boolean,
    message: String
  }],
  declineReason: String,
  processingTime: Number,
  ipAddress: String,
  deviceFingerprint: String,
  createdAt: Date
}
```

---

## 🔑 Third-Party APIs

### Required API Keys

| Service | Purpose | Get Key |
|---------|---------|---------|
| **AbuseIPDB** | Abuse reports & blacklist | https://www.abuseipdb.com/api |
| **IPQualityScore** | Fraud scoring & VPN detection | https://www.ipqualityscore.com/api |
| **MaxMind GeoIP2** | Premium geolocation | https://www.maxmind.com/en/geoip2-services |

### Optional API Keys

| Service | Purpose | Get Key |
|---------|---------|---------|
| **Shodan** | Network intelligence | https://shodan.io/api |
| **VirusTotal** | IP reputation | https://virustotal.com/api |
| **Greynoise** | Internet noise filtering | https://greynoise.io/api |

### Free APIs (No Key Required)

| Service | Purpose |
|---------|---------|
| ipify.org | IP detection |
| IP-API.com | Basic geolocation |

---

## 🚀 Deployment

### Production URLs
- **Frontend:** https://riskquantify.maula.ai
- **API:** https://api.riskquantify.maula.ai

### Docker Deployment

```bash
# Build image
docker build -t riskquantify-api .

# Run container
docker run -d \
  --name riskquantify \
  -p 4019:4019 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://... \
  riskquantify-api
```

### PM2 Deployment

```bash
# Start with PM2
pm2 start ecosystem.config.js --env production

# Monitor
pm2 monit
```

---

## 📊 VictoryKit Integration

RiskQuantify is **Tool 19** in the VictoryKit Security Platform.

| Property | Value |
|----------|-------|
| Tool Number | 19 |
| Tool Name | RiskQuantify |
| Theme Color | Violet (#8b5cf6) |
| Frontend Port | 3019 |
| API Port | 4019 |
| WebSocket Port | 4119 |
| Production URL | https://riskquantify.maula.ai |

### Related Tools
- **Tool 18:** ThreatModel - Threat modeling & analysis
- **Tool 20:** SecurityScore - Security posture scoring

---

## 📄 License

MIT License - VictoryKit Security Platform

---

## 🙏 Credits

Built with ❤️ for **Maula.AI** - The ONE Platform for 100+ Security Tools

Part of the VictoryKit Security Suite by AI Chaudhary
