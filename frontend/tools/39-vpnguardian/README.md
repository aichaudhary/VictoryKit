# 🔐 VPNGuardian - AI-Powered VPN Security Management

> **Tool #39** | Secure VPN Management Platform with Zero-Trust Network Access

[![Version](https://img.shields.io/badge/version-1.0.0-cyan.svg)](https://vpnguardian.maula.ai)
[![AI Powered](https://img.shields.io/badge/AI-Gemini%201.5%20Pro-blue.svg)]()
[![Compliance](https://img.shields.io/badge/compliance-NIST%20%7C%20SOC2%20%7C%20ISO27001-green.svg)]()

## 📋 Overview

VPNGuardian is an enterprise-grade VPN security management platform that combines traditional VPN controls with AI-powered threat detection and zero-trust network access principles. The platform provides comprehensive visibility into VPN traffic, endpoint security, and access policies.

### Key Capabilities

- **🔒 VPN Tunnel Management** - OpenVPN, WireGuard, IKEv2, L2TP support
- **🎯 Zero-Trust Access** - Continuous verification and least-privilege access
- **📊 Traffic Analysis** - Deep packet inspection and anomaly detection
- **🛡️ Endpoint Security** - Device compliance and certificate management
- **🤖 AI-Powered Insights** - Intelligent threat detection and policy generation
- **📋 Compliance Monitoring** - NIST, SOC2, ISO 27001, GDPR, HIPAA

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      VPNGuardian Platform                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Frontend   │  │   Backend    │  │   AI Assistant       │  │
│  │   Port 3039  │  │   Port 4039  │  │   WebSocket 6039     │  │
│  │              │  │              │  │                      │  │
│  │  • Dashboard │  │  • REST API  │  │  • Gemini 1.5 Pro    │  │
│  │  • Sessions  │  │  • Auth      │  │  • 10 AI Functions   │  │
│  │  • Policies  │  │  • MongoDB   │  │  • Real-time Chat    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────┴────────────────────────────────┐ │
│  │                     VPN Infrastructure                      │ │
│  │  • OpenVPN Gateway (1194) • WireGuard (51820)              │ │
│  │  • Certificate Authority  • Policy Engine                  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 6+
- Gemini API Key

### Installation

```bash
# Clone and navigate
cd backend/tools/39-vpnguardian

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
PORT=4039
MONGODB_URI=mongodb://localhost:27017/vpnguardian_db
JWT_SECRET=your-jwt-secret

# AI Assistant
AI_WS_PORT=6039
GEMINI_API_KEY=your-gemini-api-key
```

## 📁 Project Structure

```
39-vpnguardian/
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── services/
│   │   │   ├── config.ts       # Configuration wrapper
│   │   │   ├── aiService.ts    # AI WebSocket client
│   │   │   └── vpnGuardianAPI.ts  # REST API client
│   │   └── types/              # TypeScript definitions
│   └── vpnguardian-config.json # Tool configuration
│
└── backend/
    ├── api/                    # REST API routes
    ├── ml-engine/              # ML models
    └── ai-assistant/
        ├── package.json
        ├── server.js           # WebSocket server
        └── functionExecutor.js # AI function implementations
```

## 🤖 AI Functions (10 Total)

The AI assistant provides 10 specialized functions for VPN security:

| Function | Category | Description |
|----------|----------|-------------|
| `analyze_vpn_traffic` | Analysis | Traffic pattern analysis and threat detection |
| `assess_endpoint_security` | Security | Device security posture evaluation |
| `generate_access_policy` | Policy | Zero-trust policy generation |
| `detect_tunnel_compromise` | Threat Detection | MITM and session hijacking detection |
| `optimize_routing` | Optimization | Performance-aware route optimization |
| `audit_user_access` | Audit | User access pattern analysis |
| `manage_certificates` | Certificate Management | PKI operations (renew, revoke, rotate) |
| `configure_split_tunnel` | Configuration | Split tunneling rule management |
| `generate_threat_report` | Reporting | Comprehensive threat reports |
| `enforce_compliance` | Compliance | Regulatory compliance enforcement |

### AI Chat Examples

```typescript
import { vpnGuardianAI } from './services/aiService';

// Connect to AI assistant
await vpnGuardianAI.connect();

// Ask about VPN security
const response = await vpnGuardianAI.sendMessage(
  "Analyze the traffic patterns for the last 24 hours and identify any anomalies"
);

// Direct function call
const result = await vpnGuardianAI.executeFunction('assess_endpoint_security', {
  endpointId: 'endpoint-123',
  checkType: 'full',
  strictMode: true
});
```

## 🔧 API Reference

### Sessions API

```http
GET    /api/sessions              # List VPN sessions
GET    /api/sessions/:id          # Get session details
POST   /api/sessions/:id/terminate # Terminate session
```

### Endpoints API

```http
GET    /api/endpoints             # List endpoints
GET    /api/endpoints/:id         # Get endpoint details
PATCH  /api/endpoints/:id         # Update endpoint
POST   /api/endpoints/:id/revoke  # Revoke endpoint access
```

### Policies API

```http
GET    /api/policies              # List access policies
POST   /api/policies              # Create policy
PATCH  /api/policies/:id          # Update policy
DELETE /api/policies/:id          # Delete policy
```

### Certificates API

```http
GET    /api/certificates          # List certificates
POST   /api/certificates          # Create certificate
POST   /api/certificates/:id/revoke  # Revoke certificate
POST   /api/certificates/:id/renew   # Renew certificate
```

### Compliance API

```http
GET    /api/compliance/:framework  # Get compliance report
POST   /api/compliance/:framework/audit  # Run compliance audit
```

## 🔐 Security Features

### Zero-Trust Implementation

- **Continuous Verification** - Every access request is authenticated
- **Least Privilege** - Minimal permissions granted
- **Device Posture** - Endpoint compliance required
- **Microsegmentation** - Network zone isolation

### VPN Protocols

| Protocol | Port | Security Level | Performance |
|----------|------|----------------|-------------|
| WireGuard | 51820 | High | Excellent |
| OpenVPN | 1194 | High | Good |
| IKEv2 | 500/4500 | High | Good |
| L2TP | 1701 | Medium | Fair |

### Encryption Standards

- **At Rest**: AES-256-GCM
- **In Transit**: TLS 1.3 / ChaCha20-Poly1305
- **Key Exchange**: ECDHE with P-384

## 📊 Monitoring & Analytics

### Dashboard Metrics

- Active VPN sessions
- Traffic throughput (Gbps)
- Threat detection rate
- Endpoint compliance percentage
- Certificate expiration status
- Policy violation alerts

### Alert Types

| Severity | Example |
|----------|---------|
| Critical | Tunnel compromise detected |
| High | Unauthorized access attempt |
| Medium | Certificate expiring soon |
| Low | Unusual traffic pattern |

## 📋 Compliance

VPNGuardian supports the following compliance frameworks:

- **NIST 800-53** - Federal security controls
- **SOC 2** - Trust service criteria
- **ISO 27001** - Information security management
- **GDPR** - Data protection
- **HIPAA** - Healthcare data security
- **PCI-DSS** - Payment card security

### Certifications

- FIPS 140-2 validated cryptography
- Common Criteria EAL4+

## 🔗 Integration

### Identity Providers

- Okta
- Azure AD
- Google Workspace
- LDAP/Active Directory

### SIEM Platforms

- Splunk
- Elastic (ELK)
- Google Chronicle
- Microsoft Sentinel

### Endpoint Security

- CrowdStrike
- Carbon Black
- SentinelOne

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
cd frontend/tools/39-vpnguardian
npm run build

# Backend
cd backend/tools/39-vpnguardian
npm run build
```

## 📝 Changelog

### v1.0.0 (2024)

- Initial release
- 10 AI-powered functions
- Zero-trust access implementation
- Multi-protocol VPN support
- Compliance monitoring

## 📄 License

MIT License - See [LICENSE](../../../LICENSE) for details.

## 🔗 Links

- **Production**: https://vpnguardian.maula.ai
- **AI Assistant**: https://vpnguardian.maula.ai/maula/ai
- **API Docs**: https://vpnguardian.maula.ai/api/docs
- **Status**: https://status.maula.ai

---

**VPNGuardian** is part of the **VictoryKit** security platform.  
For support, contact: security@maula.ai
