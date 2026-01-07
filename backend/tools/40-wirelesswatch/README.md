# WirelessWatch - Wireless Security Monitor

**Tool #40** | Part of the VictoryKit Security Suite

## Overview

WirelessWatch is an AI-powered wireless network security platform that provides comprehensive WiFi protection with rogue AP detection, vulnerability scanning, RF spectrum analysis, and wireless intrusion prevention (WIPS). It ensures secure wireless infrastructure across your organization.

## Key Features

- 📡 **Rogue AP Detection** - Identify unauthorized access points
- 🔍 **Vulnerability Scanning** - Detect WPA, KRACK, and FragAttack vulnerabilities
- 📊 **Spectrum Analysis** - RF interference detection and channel optimization
- 🛡️ **WIPS** - Wireless intrusion prevention with auto-containment
- 🗺️ **Heat Mapping** - Visual WiFi coverage analysis
- 🚨 **Evil Twin Detection** - Identify fake access points
- 📱 **Client Monitoring** - Track connected devices and behavior

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       WirelessWatch                              │
│                   wirelesswatch.maula.ai                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Rogue AP  │  │  Spectrum   │  │    WIPS     │              │
│  │  Detection  │  │  Analyzer   │  │   Engine    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Vuln      │  │   Client    │  │    AP       │              │
│  │  Scanner    │  │  Monitor    │  │  Manager    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│                    AI Assistant (Gemini 1.5 Pro)                 │
│                    WebSocket: ws://localhost:6040/maula-ai       │
└─────────────────────────────────────────────────────────────────┘
```

## Ports

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3040 | React/TypeScript dashboard |
| Backend API | 4040 | Express REST API |
| AI WebSocket | 6040 | Gemini-powered AI assistant |
| SNMP | 161 | Network management |
| Syslog | 514 | Log collection |

## AI Functions

WirelessWatch includes 10 specialized AI functions:

### 1. `scan_wireless_network`
Discover and inventory all wireless access points and clients.

### 2. `detect_rogue_ap`
Identify unauthorized or suspicious access points on the network.

### 3. `analyze_spectrum`
Analyze RF spectrum for interference and optimize channel allocation.

### 4. `scan_vulnerabilities`
Scan for WPA, KRACK, FragAttack, Dragonblood, and other WiFi vulnerabilities.

### 5. `detect_evil_twin`
Identify fake access points mimicking legitimate networks.

### 6. `contain_threat`
Automatically contain rogue devices and deauth attackers.

### 7. `monitor_clients`
Track client connections, behavior, and security posture.

### 8. `optimize_channels`
Recommend optimal channel configuration to reduce interference.

### 9. `audit_compliance`
Audit wireless security against PCI-DSS, HIPAA, and other frameworks.

### 10. `generate_report`
Generate wireless security assessment and inventory reports.

## Database Models

| Model | Description |
|-------|-------------|
| `AccessPoint.js` | Access point inventory |
| `Device.js` | Connected client devices |
| `ScanResult.js` | Vulnerability scan results |
| `SecurityAssessment.js` | Security assessments |
| `ComplianceReport.js` | Compliance audit reports |

## Database Collections

- `access_points` - AP inventory and status
- `clients` - Connected devices
- `rf_scans` - RF spectrum scans
- `rogue_devices` - Detected rogue APs
- `security_events` - Security alerts
- `wips_alerts` - WIPS detection events
- `spectrum_data` - RF analysis data
- `policies` - Wireless policies
- `vulnerabilities` - Detected vulnerabilities
- `audit_logs` - Audit trail

## Installation

### Backend AI Assistant

```bash
cd backend/tools/40-wirelesswatch/ai-assistant
npm install
```

### Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key
PORT=6040
MONGODB_URI=mongodb://localhost:27017/wirelesswatch_db
NODE_ENV=production
```

### Running

```bash
npm start          # Production
npm run dev        # Development
```

## Wireless Vulnerabilities Detected

| Vulnerability | CVE | Description |
|--------------|-----|-------------|
| **KRACK** | CVE-2017-13077 | Key reinstallation attacks |
| **FragAttack** | CVE-2020-24586 | Fragmentation attacks |
| **Dragonblood** | CVE-2019-9494 | WPA3 SAE vulnerabilities |
| **PMKID** | - | Offline WPA2 cracking |
| **Deauth Flood** | - | DoS attack detection |

## WIPS Capabilities

- **Deauth Protection** - Detect and block deauthentication attacks
- **Evil Twin Detection** - Identify spoofed SSIDs
- **Karma Attack Prevention** - Block fake AP responses
- **Auto-Containment** - Automatically isolate rogue devices
- **Client Isolation** - Prevent client-to-client attacks

## Directory Structure

```
40-wirelesswatch/
├── ai-assistant/
│   ├── package.json
│   ├── server.js
│   └── functionExecutor.js
├── api/
│   └── src/
│       └── models/
│           ├── AccessPoint.js
│           ├── Device.js
│           ├── ScanResult.js
│           ├── SecurityAssessment.js
│           └── ComplianceReport.js
├── src/
│   └── services/
│       ├── config.ts
│       ├── aiService.ts
│       └── wirelessWatchAPI.ts
└── README.md
```

## Deployment

Deploy to: **wirelesswatch.maula.ai**

## Related Tools

- **Tool #38** - FirewallAI (Network protection)
- **Tool #39** - VPNGuardian (VPN security)
- **Tool #42** - IoTSecure (IoT security)

## License

MIT License - VictoryKit Team
