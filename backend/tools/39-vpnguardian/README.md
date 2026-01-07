# VPNGuardian - Secure VPN Management

**Tool #39** | Part of the VictoryKit Security Suite

## Overview

VPNGuardian is an AI-powered VPN security platform that provides comprehensive VPN management with traffic analysis, endpoint protection, split tunneling control, and zero-trust network access. It supports multiple VPN protocols and ensures secure remote connectivity.

## Key Features

- 🔐 **Multi-Protocol VPN** - OpenVPN, WireGuard, IKEv2, L2TP support
- 🔍 **Traffic Analysis** - Deep packet inspection and anomaly detection
- 🛡️ **Zero Trust** - Continuous verification and least privilege access
- 📱 **Endpoint Security** - Device compliance and certificate management
- 🌐 **Split Tunneling** - Intelligent traffic routing control
- 🚨 **Kill Switch** - Automatic connection protection
- 🔒 **DNS Leak Protection** - Prevent DNS request exposure

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        VPNGuardian                               │
│                    vpnguardian.maula.ai                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │     VPN     │  │  Zero Trust │  │   Traffic   │              │
│  │   Manager   │  │    Engine   │  │  Analyzer   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Endpoint   │  │ Certificate │  │   Policy    │              │
│  │  Security   │  │   Manager   │  │   Engine    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│                    AI Assistant (Gemini 1.5 Pro)                 │
│                    WebSocket: ws://localhost:6039/maula-ai       │
└─────────────────────────────────────────────────────────────────┘
```

## Ports

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3039 | React/TypeScript dashboard |
| Backend API | 4039 | Express REST API |
| AI WebSocket | 6039 | Gemini-powered AI assistant |
| VPN Gateway | 1194 | OpenVPN gateway |
| WireGuard | 51820 | WireGuard interface |

## AI Functions

VPNGuardian includes 10 specialized AI functions:

### 1. `analyze_vpn_traffic`
Analyze VPN traffic patterns, detect anomalies, and identify potential security threats.

### 2. `manage_vpn_session`
Create, monitor, and terminate VPN sessions with detailed logging.

### 3. `configure_split_tunnel`
Configure split tunneling rules to route specific traffic through VPN.

### 4. `assess_endpoint_posture`
Evaluate device security posture before allowing VPN access.

### 5. `generate_certificates`
Generate and manage VPN certificates for secure authentication.

### 6. `detect_vpn_threats`
Identify VPN-specific threats like credential stuffing and session hijacking.

### 7. `configure_zero_trust`
Set up zero-trust network access policies and microsegmentation.

### 8. `audit_vpn_compliance`
Audit VPN configuration against security standards and compliance frameworks.

### 9. `monitor_bandwidth`
Monitor VPN bandwidth usage and optimize performance.

### 10. `generate_vpn_report`
Generate comprehensive VPN security and usage reports.

## Database Models

| Model | Description |
|-------|-------------|
| `VPNConnection.js` | Active VPN session tracking |
| `VPNPolicy.js` | VPN access policies |
| `VPNSecurityAlert.js` | Security event alerts |
| `VPNUser.js` | VPN user management |

## Database Collections

- `vpn_sessions` - Active VPN connections
- `vpn_users` - User accounts and profiles
- `endpoints` - Registered devices
- `traffic_logs` - Traffic analysis data
- `policies` - Access policies
- `access_rules` - Network access rules
- `threat_events` - Security events
- `audit_logs` - Audit trail
- `certificates` - VPN certificates
- `network_zones` - Network segmentation

## Installation

### Backend AI Assistant

```bash
cd backend/tools/39-vpnguardian/ai-assistant
npm install
```

### Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key
PORT=6039
MONGODB_URI=mongodb://localhost:27017/vpnguardian_db
NODE_ENV=production
```

### Running

```bash
npm start          # Production
npm run dev        # Development
```

## VPN Protocols Supported

- **OpenVPN** - Industry standard with strong encryption
- **WireGuard** - Modern, fast, and lightweight
- **IKEv2/IPsec** - Mobile-friendly with quick reconnection
- **L2TP/IPsec** - Legacy support with wide compatibility

## Directory Structure

```
39-vpnguardian/
├── ai-assistant/
│   ├── package.json
│   ├── server.js
│   └── functionExecutor.js
├── api/
│   └── src/
│       └── models/
│           ├── VPNConnection.js
│           ├── VPNPolicy.js
│           ├── VPNSecurityAlert.js
│           └── VPNUser.js
├── src/
│   └── services/
│       ├── config.ts
│       ├── aiService.ts
│       └── vpnGuardianAPI.ts
└── README.md
```

## Deployment

Deploy to: **vpnguardian.maula.ai**

## Related Tools

- **Tool #38** - FirewallAI (Network protection)
- **Tool #40** - WirelessWatch (Wireless security)
- **Tool #36** - WebFilter (Web filtering)

## License

MIT License - VictoryKit Team
