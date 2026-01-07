# 📡 WirelessWatch - AI-Powered Wireless Security Monitor

> **Tool #40** | Enterprise Wireless Network Security Platform

[![Version](https://img.shields.io/badge/version-1.0.0-violet.svg)](https://wirelesswatch.maula.ai)
[![AI Powered](https://img.shields.io/badge/AI-Gemini%201.5%20Pro-blue.svg)]()
[![Compliance](https://img.shields.io/badge/compliance-PCI--DSS%20%7C%20HIPAA%20%7C%20NIST-green.svg)]()

## 📋 Overview

WirelessWatch is an enterprise-grade wireless network security monitoring platform that combines AI-powered threat detection with comprehensive RF analysis. The platform provides real-time visibility into wireless threats, rogue access points, and network performance.

### Key Capabilities

- **📡 RF Spectrum Analysis** - Detect interference and optimize channel allocation
- **🚨 Rogue AP Detection** - Identify evil twins, unauthorized APs, and honeypots
- **🛡️ WIPS** - Wireless Intrusion Prevention with auto-containment
- **🔍 Vulnerability Scanning** - KRACK, FragAttacks, Dragonblood detection
- **📊 Site Survey** - Coverage heatmaps and predictive planning
- **🤖 AI-Powered Insights** - Intelligent threat analysis and recommendations

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     WirelessWatch Platform                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Frontend   │  │   Backend    │  │   AI Assistant       │  │
│  │   Port 3040  │  │   Port 4040  │  │   WebSocket 6040     │  │
│  │              │  │              │  │                      │  │
│  │  • Dashboard │  │  • REST API  │  │  • Gemini 1.5 Pro    │  │
│  │  • Heatmaps  │  │  • MongoDB   │  │  • 10 AI Functions   │  │
│  │  • WIPS Mgmt │  │  • SNMP/161  │  │  • Real-time Chat    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────┴────────────────────────────────┐ │
│  │                  Wireless Infrastructure                    │ │
│  │  • Managed APs (up to 10,000)  • WIPS Sensors              │ │
│  │  • RF Spectrum Analyzers       • Client Monitoring          │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 6+
- Gemini API Key
- Wireless Controller Access (optional)

### Installation

```bash
# Navigate to tool directory
cd backend/tools/40-wirelesswatch

# Install backend dependencies
npm install

# Install AI assistant dependencies
cd ai-assistant
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Start services
npm run dev
```

### Environment Variables

```env
# Backend
PORT=4040
MONGODB_URI=mongodb://localhost:27017/wirelesswatch_db
JWT_SECRET=your-jwt-secret

# AI Assistant
AI_WS_PORT=6040
GEMINI_API_KEY=your-gemini-api-key

# Optional: Wireless Controller
CONTROLLER_TYPE=meraki
CONTROLLER_API_KEY=your-controller-key
```

## 📁 Project Structure

```
40-wirelesswatch/
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── services/
│   │   │   ├── config.ts       # Configuration wrapper
│   │   │   ├── aiService.ts    # AI WebSocket client
│   │   │   └── wirelessWatchAPI.ts  # REST API client
│   │   └── types/              # TypeScript definitions
│   └── wirelesswatch-config.json  # Tool configuration
│
└── backend/
    ├── api/                    # REST API routes
    ├── ml-engine/              # ML models for threat detection
    └── ai-assistant/
        ├── package.json
        ├── server.js           # WebSocket server
        └── functionExecutor.js # AI function implementations
```

## 🤖 AI Functions (10 Total)

| Function | Category | Description |
|----------|----------|-------------|
| `scan_rf_spectrum` | Analysis | RF spectrum analysis and interference detection |
| `detect_rogue_aps` | Detection | Rogue AP and evil twin identification |
| `assess_wifi_security` | Security | WiFi security posture assessment |
| `optimize_channel_plan` | Optimization | Channel allocation optimization |
| `investigate_client` | Investigation | Client behavior analysis |
| `contain_rogue_device` | Response | WIPS containment actions |
| `generate_heatmap` | Visualization | RF coverage heatmap generation |
| `audit_compliance` | Compliance | Wireless compliance auditing |
| `analyze_attack_patterns` | Threat Intelligence | Attack pattern analysis |
| `generate_security_report` | Reporting | Comprehensive security reports |

### AI Chat Examples

```typescript
import { wirelessWatchAI } from './services/aiService';

// Connect to AI assistant
await wirelessWatchAI.connect();

// Detect rogue access points
const response = await wirelessWatchAI.sendMessage(
  "Scan the entire campus for rogue access points and evil twins"
);

// Direct function call
const result = await wirelessWatchAI.executeFunction('detect_rogue_aps', {
  scanArea: 'building-a',
  deepScan: true,
  includeClients: true,
  classificationLevel: 'advanced'
});
```

## 🔧 API Reference

### Access Points API

```http
GET    /api/access-points          # List managed APs
GET    /api/access-points/:id      # Get AP details
PATCH  /api/access-points/:id      # Update AP configuration
POST   /api/access-points/:id/reboot  # Reboot AP
```

### Clients API

```http
GET    /api/clients                # List connected clients
GET    /api/clients/:mac           # Get client details
POST   /api/clients/:mac/disconnect  # Disconnect client
POST   /api/clients/:mac/blacklist   # Blacklist client
```

### Rogue Detection API

```http
GET    /api/rogues                 # List detected rogues
POST   /api/rogues/:id/contain     # Contain rogue device
POST   /api/rogues/:id/classify    # Update classification
DELETE /api/rogues/:id/whitelist   # Add to whitelist
```

### Spectrum Analysis API

```http
POST   /api/spectrum/scan          # Initiate spectrum scan
GET    /api/spectrum/results/:id   # Get scan results
GET    /api/spectrum/interference  # Get interference data
```

### Heatmap API

```http
POST   /api/heatmaps/generate      # Generate heatmap
GET    /api/heatmaps/:id           # Get heatmap data
GET    /api/heatmaps/:id/export    # Export heatmap (PNG/PDF)
```

## 🔐 Security Features

### WIPS Capabilities

| Feature | Description |
|---------|-------------|
| Deauth Protection | Detect and alert on deauthentication attacks |
| Evil Twin Detection | Identify APs spoofing legitimate SSIDs |
| KARMA Prevention | Block KARMA/honeypot attacks |
| Auto-Containment | Automatic rogue device containment |
| Client Blacklisting | Block malicious clients |

### WiFi Vulnerability Detection

| Vulnerability | CVE | Description |
|---------------|-----|-------------|
| KRACK | CVE-2017-13077 | Key reinstallation attacks |
| FragAttacks | CVE-2020-24586+ | Fragmentation attacks |
| Dragonblood | CVE-2019-9494 | WPA3 vulnerabilities |
| PMKID | N/A | Offline handshake cracking |

### Supported Standards

- **WPA3-Enterprise** (recommended)
- **WPA3-Personal** (SAE)
- **WPA2-Enterprise** (802.1X)
- **802.1X** with EAP-TLS, PEAP, EAP-TTLS

## 📊 Monitoring & Analytics

### Dashboard Widgets

- Active AP count and status
- Connected client count
- Rogue device alerts
- RF interference levels
- Coverage heatmap
- Client experience score
- Threat activity timeline

### Alert Types

| Severity | Example |
|----------|---------|
| Critical | Evil twin detected |
| High | Deauthentication attack in progress |
| Medium | Rogue AP discovered |
| Low | RF interference detected |
| Info | Client roaming anomaly |

## 📡 Vendor Support

### Wireless Controllers

| Vendor | Integration |
|--------|-------------|
| Cisco Meraki | Full API |
| Cisco DNA Center | Full API |
| Aruba Central | Full API |
| Aruba AirWave | SNMP + API |
| Ubiquiti UniFi | Full API |
| Ruckus Cloud | API |
| Fortinet | API |

### SIEM Integration

- Splunk
- Elastic (ELK)
- IBM QRadar
- Microsoft Sentinel

### NAC Integration

- Cisco ISE
- Aruba ClearPass
- Forescout

## 📋 Compliance

WirelessWatch supports wireless-specific compliance requirements:

| Framework | Wireless Controls |
|-----------|-------------------|
| PCI-DSS 4.0 | Wireless security (Req. 11.2) |
| HIPAA | ePHI wireless protection |
| SOC 2 | Wireless access controls |
| NIST 800-153 | Wireless security guidelines |

## 🛠️ Development

### Running Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Building for Production

```bash
# Frontend
cd frontend/tools/40-wirelesswatch
npm run build

# Backend
cd backend/tools/40-wirelesswatch
npm run build
```

## 📝 Changelog

### v1.0.0 (2024)

- Initial release
- 10 AI-powered functions
- WIPS with auto-containment
- Multi-vendor support
- RF spectrum analysis
- Coverage heatmaps

## 📄 License

MIT License - See [LICENSE](../../../LICENSE) for details.

## 🔗 Links

- **Production**: https://wirelesswatch.maula.ai
- **AI Assistant**: https://wirelesswatch.maula.ai/maula-ai
- **API Docs**: https://wirelesswatch.maula.ai/api/docs
- **Status**: https://status.maula.ai

---

**WirelessWatch** is part of the **VictoryKit** security platform.  
For support, contact: security@maula.ai
