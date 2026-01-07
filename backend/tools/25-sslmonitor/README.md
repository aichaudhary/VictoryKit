# SSLMonitor

**Tool #25** | AI-Powered SSL/TLS Certificate Management Platform

[![Port: 4025](https://img.shields.io/badge/API-4025-blue.svg)](http://localhost:4025)
[![AI WebSocket: 6025](https://img.shields.io/badge/AI_WS-6025-purple.svg)](ws://localhost:6025)
[![Frontend: 3025](https://img.shields.io/badge/Frontend-3025-green.svg)](http://localhost:3025)
[![ML: 8025](https://img.shields.io/badge/ML-8025-orange.svg)](http://localhost:8025)

## Overview

SSLMonitor is a comprehensive SSL/TLS certificate monitoring and management platform. It tracks certificate expiration, validates certificate chains, analyzes security configurations, and ensures compliance with industry standards.

**Production URL:** `https://sslmonitor.maula.ai`

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       SSLMonitor System                          │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React/TypeScript)           Port 3025                 │
│  ├── Certificate Dashboard                                       │
│  ├── Domain Monitor                                              │
│  ├── Expiration Alerts                                           │
│  ├── Security Scanner                                            │
│  └── Maula AI Chat Interface                                     │
├─────────────────────────────────────────────────────────────────┤
│  AI Assistant (TypeScript/WebSocket)   Port 6025                 │
│  ├── Certificate Scanning                                        │
│  ├── Expiration Monitoring                                       │
│  ├── Chain Validation                                            │
│  ├── Security Analysis                                           │
│  ├── Compliance Checking                                         │
│  └── Recommendation Engine                                       │
├─────────────────────────────────────────────────────────────────┤
│  Backend API (Node.js/Express)         Port 4025                 │
│  ├── Certificate Management                                      │
│  ├── Domain Tracking                                             │
│  ├── Alert System                                                │
│  └── Scan Scheduling                                             │
├─────────────────────────────────────────────────────────────────┤
│  ML Engine (Python)                    Port 8025                 │
│  ├── Anomaly Detection                                           │
│  └── Risk Prediction                                             │
├─────────────────────────────────────────────────────────────────┤
│  MongoDB Database: sslmonitor_db                                 │
│  ├── Certificate                                                 │
│  ├── Domain                                                      │
│  ├── Alert                                                       │
│  └── ScanResult                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Features

| Feature | Description |
|---------|-------------|
| 🔐 **Certificate Discovery** | Automatic discovery of SSL certificates |
| ⏰ **Expiration Monitoring** | Track expiration with configurable alerts |
| 🔗 **Chain Validation** | Validate complete certificate chains |
| 🛡️ **Security Analysis** | Protocol, cipher, and vulnerability scanning |
| 📋 **Compliance Checking** | PCI-DSS, HIPAA, NIST, SOC2 compliance |
| 🌐 **Multi-Domain Support** | Monitor thousands of domains |
| 🔔 **Smart Alerts** | Configurable notification channels |
| 📊 **Security Grading** | A+ to F security grades |
| 🤖 **AI Recommendations** | Intelligent improvement suggestions |
| 📈 **Trend Analysis** | Historical security trends |

## AI Functions (10)

### 1. `scan_certificate`
Scan and analyze SSL certificate for a domain.
```typescript
await sslMonitorAI.scanCertificate({
  domain: 'example.com',
  port: 443,
  includeChain: true,
  checkOcsp: true
});
```

### 2. `check_expiration`
Check certificate expiration across domains.
```typescript
await sslMonitorAI.checkExpiration({
  warningDays: 30,
  criticalDays: 7,
  includeWildcards: true
});
```

### 3. `validate_chain`
Validate complete certificate chain.
```typescript
await sslMonitorAI.validateChain({
  domain: 'api.example.com',
  checkRevocation: true,
  verifyIntermediate: true,
  checkRootStore: true
});
```

### 4. `analyze_security`
Comprehensive SSL/TLS security analysis.
```typescript
await sslMonitorAI.analyzeSecurity({
  domain: 'example.com',
  checkProtocols: true,
  checkCiphers: true,
  checkVulnerabilities: true
});
```

### 5. `monitor_domain`
Add or configure domain monitoring.
```typescript
await sslMonitorAI.monitorDomain({
  domain: 'app.example.com',
  action: 'add',
  checkInterval: '6h',
  alertContacts: ['security@example.com']
});
```

### 6. `check_compliance`
Check compliance against security standards.
```typescript
await sslMonitorAI.checkCompliance({
  domain: 'payments.example.com',
  standards: ['PCI-DSS', 'SOC2'],
  includeHsts: true,
  includeCaa: true
});
```

### 7. `discover_certificates`
Discover certificates in domain or network.
```typescript
await sslMonitorAI.discoverCertificates({
  target: 'example.com',
  ports: [443, 8443],
  includeSubdomains: true,
  maxDepth: 3
});
```

### 8. `compare_configs`
Compare SSL configurations.
```typescript
await sslMonitorAI.compareConfigs({
  domains: ['prod.example.com', 'staging.example.com'],
  compareType: 'between-domains',
  metrics: ['grade', 'protocols', 'ciphers']
});
```

### 9. `get_recommendations`
Get AI-powered improvement recommendations.
```typescript
await sslMonitorAI.getRecommendations({
  domain: 'example.com',
  priority: 'security',
  includeSteps: true,
  considerBrowserSupport: true
});
```

### 10. `generate_report`
Generate SSL/TLS status reports.
```typescript
await sslMonitorAI.generateReport({
  reportType: 'compliance',
  format: 'pdf',
  includeHistory: true
});
```

## Database Models

| Model | Description |
|-------|-------------|
| **Certificate** | SSL certificate details and metadata |
| **Domain** | Monitored domain configurations |
| **Alert** | Expiration and security alerts |
| **ScanResult** | Historical scan results |

## Security Grades

| Grade | Description | Requirements |
|-------|-------------|--------------|
| A+ | Exceptional | TLS 1.3, HSTS preload, perfect forward secrecy |
| A | Excellent | TLS 1.2+, strong ciphers, valid chain |
| B | Good | Minor issues, deprecated protocols disabled |
| C | Adequate | Some weak ciphers or configurations |
| D | Poor | Significant security issues |
| F | Fail | Critical vulnerabilities or invalid certificate |

## TLS Protocol Support

| Protocol | Secure | Recommended |
|----------|--------|-------------|
| TLS 1.3 | ✅ Yes | ✅ Yes |
| TLS 1.2 | ✅ Yes | ✅ Yes |
| TLS 1.1 | ❌ No | ❌ No |
| TLS 1.0 | ❌ No | ❌ No |
| SSL 3.0 | ❌ No | ❌ No |

## Compliance Standards

- **PCI-DSS** - Payment Card Industry Data Security Standard
- **HIPAA** - Health Insurance Portability and Accountability Act
- **NIST** - National Institute of Standards and Technology
- **SOC2** - Service Organization Control 2
- **GDPR** - General Data Protection Regulation

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- Gemini API key

### Environment Variables
```bash
MONGODB_URI=mongodb://localhost:27017/sslmonitor_db
GEMINI_API_KEY=your_gemini_key
AI_WS_PORT=6025
```

### Installation

```bash
# Backend API
cd backend/tools/25-sslmonitor/api
npm install
npm run dev

# AI Assistant
cd backend/tools/25-sslmonitor/ai-assistant
npm install
npm run dev

# Frontend
cd frontend/tools/25-sslmonitor
npm install
npm start
```

## Project Structure

```
25-sslmonitor/
├── api/
│   └── src/
│       ├── models/
│       │   ├── Certificate.js
│       │   ├── Domain.js
│       │   ├── Alert.js
│       │   └── ScanResult.js
│       ├── controllers/
│       ├── routes/
│       └── services/
├── ai-assistant/
│   └── src/
│       ├── server.ts
│       └── functions/
│           └── sslmonitorFunctions.ts
├── ml-engine/
└── frontend/
    └── src/
        ├── services/
        │   ├── config.ts
        │   └── aiService.ts
        ├── components/
        └── pages/
```

## Theme

| Property | Value |
|----------|-------|
| Primary | `#00ff88` (Secure Green) |
| Secondary | `#8855ff` (Certificate Purple) |
| Accent | `#ffaa00` (Warning Amber) |
| Background | `#0a0f1c` (Deep Navy) |

## Related Documentation

- [SSL Best Practices](../../../docs/SSL-SECURITY.md)
- [API Gateway Integration](../shared-services/api-gateway/README.md)

## License

MIT License - Part of VictoryKit Security Suite

---

**Tool #25 of 43** | VictoryKit Security Suite | maula.ai
