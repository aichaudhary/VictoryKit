# 🔐 SSLMonitor - Tool #25

> **Enterprise SSL/TLS Certificate Monitoring Platform**  
> Part of the VictoryKit Security Suite

## 🎯 Overview

SSLMonitor is a comprehensive SSL/TLS certificate monitoring platform that provides real-time certificate tracking, expiration alerts, vulnerability scanning, and compliance reporting. Built for enterprise security teams to ensure certificate health across all domains.

**Tool #25** | **Domain:** sslmonitor.maula.ai | **Theme:** Emerald (#10B981)

---

## ✨ Features

### 🔒 Core Capabilities
- **Certificate Dashboard** - Real-time overview of all monitored certificates
- **Domain Management** - Add, monitor, and manage multiple domains
- **Expiry Alerts** - Automated notifications before certificate expiration
- **Certificate Scanning** - On-demand and scheduled certificate scans

### 🛡️ Security Analysis
- **Chain Validation** - Full certificate chain verification
- **Vulnerability Detection** - POODLE, BEAST, Heartbleed, DROWN checks
- **Protocol Analysis** - TLS 1.2/1.3 support verification
- **Cipher Suite Evaluation** - Strength assessment of cipher suites

### 📊 Compliance & Reporting
- **PCI-DSS** - Payment Card Industry compliance checks
- **HIPAA** - Healthcare data security compliance
- **GDPR** - EU data protection compliance
- **NIST** - Federal security standards

### 🤖 AI Integration
- **Neural Link Interface** - AI-powered certificate analysis
- **Natural Language Queries** - Ask about certificate status
- **Automated Recommendations** - Security improvement suggestions

---

## 🏗️ Architecture

```
25-sslmonitor/
├── frontend/                    # React Frontend (Port 3025)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx      # Top navigation
│   │   │   └── Sidebar.tsx     # Side navigation
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx          # Main dashboard
│   │   │   ├── CertificateMonitor.tsx # Certificate management
│   │   │   ├── DomainManager.tsx      # Domain management
│   │   │   ├── AlertCenter.tsx        # Alert notifications
│   │   │   ├── ScanManager.tsx        # Scan scheduling
│   │   │   ├── Analytics.tsx          # Analytics & metrics
│   │   │   ├── Compliance.tsx         # Compliance reports
│   │   │   └── Settings.tsx           # Configuration
│   │   ├── services/
│   │   │   ├── api.ts          # Backend API client
│   │   │   ├── aiService.ts    # AI WebSocket client
│   │   │   └── websocket.ts    # Real-time updates
│   │   └── types/
│   │       └── index.ts        # TypeScript definitions
│   ├── package.json
│   ├── vite.config.ts
│   └── sslmonitor-config.json
│
├── backend/
│   ├── api/                    # REST API (Port 4025)
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   │   ├── certificateController.js
│   │   │   │   ├── domainController.js
│   │   │   │   ├── alertController.js
│   │   │   │   └── analyticsController.js
│   │   │   ├── models/
│   │   │   │   ├── Certificate.js
│   │   │   │   ├── Domain.js
│   │   │   │   ├── Alert.js
│   │   │   │   └── ScanResult.js
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── server.js
│   │   └── package.json
│   │
│   ├── ai-assistant/           # AI Service (Port 6025)
│   │   ├── src/
│   │   │   ├── server.js       # WebSocket server
│   │   │   └── functionExecutor.js
│   │   └── package.json
│   │
│   └── ml-engine/              # ML Engine (Port 8025)
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- npm or yarn

### Installation

```bash
# Frontend
cd frontend/tools/25-sslmonitor
npm install
npm run dev

# Backend API
cd backend/tools/25-sslmonitor/api
npm install
npm start

# AI Assistant
cd backend/tools/25-sslmonitor/ai-assistant
npm install
npm start
```

### Access
| Service | Port | URL |
|---------|------|-----|
| Frontend | 3025 | http://localhost:3025 |
| API | 4025 | http://localhost:4025/api/v1 |
| AI Assistant | 6025 | ws://localhost:6025/maula-ai |
| ML Engine | 8025 | http://localhost:8025 |

---

## 🎨 Theme

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#10B981` | Main accent (Emerald) |
| Secondary | `#059669` | Buttons, links |
| Accent | `#34D399` | Highlights |
| Background | `#0F172A` | Dark background |
| Surface | `#1E293B` | Cards, panels |

---

## 🤖 AI Functions (10 Available)

| Function | Description |
|----------|-------------|
| `scan_certificate` | Scan domain for SSL/TLS certificate info |
| `get_expiring_certificates` | Get certificates expiring soon |
| `analyze_certificate_chain` | Analyze certificate chain security |
| `check_ssl_vulnerabilities` | Detect SSL/TLS vulnerabilities |
| `generate_compliance_report` | Generate compliance reports |
| `add_domain_monitoring` | Add domain for monitoring |
| `get_certificate_analytics` | Get analytics and statistics |
| `configure_alerts` | Configure alert settings |
| `bulk_scan_domains` | Scan multiple domains |
| `open_dashboard` | Open specific dashboard view |

---

## 📊 API Endpoints

### Certificates
```
GET    /api/v1/certificates          # List all certificates
GET    /api/v1/certificates/:id      # Get certificate by ID
POST   /api/v1/certificates/scan     # Scan domain certificate
GET    /api/v1/certificates/expiring # Get expiring certificates
POST   /api/v1/certificates/check    # Check certificate status
```

### Domains
```
GET    /api/v1/domains               # List all domains
POST   /api/v1/domains               # Add new domain
PUT    /api/v1/domains/:id           # Update domain
DELETE /api/v1/domains/:id           # Remove domain
POST   /api/v1/domains/:id/scan      # Trigger domain scan
```

### Alerts
```
GET    /api/v1/alerts                # List all alerts
PUT    /api/v1/alerts/:id/acknowledge # Acknowledge alert
PUT    /api/v1/alerts/:id/resolve    # Resolve alert
```

### Analytics
```
GET    /api/v1/analytics/overview    # Get analytics overview
GET    /api/v1/analytics/trends      # Get trend data
```

### Compliance
```
POST   /api/v1/compliance/generate   # Generate report
GET    /api/v1/compliance/reports    # List reports
```

---

## 🗄️ Database Schema

### Collections (MongoDB)

**certificates**
```javascript
{
  certificateId: String,
  domain: String,
  hostname: String,
  port: Number,
  subject: { commonName, organization, country },
  issuer: { commonName, organization },
  validity: { notBefore, notAfter, daysRemaining, isExpired },
  serialNumber: String,
  fingerprints: { sha256, sha1, md5 },
  publicKey: { algorithm, size },
  signatureAlgorithm: String,
  grade: String,  // A+, A, B, C, D, F
  score: Number,  // 0-100
  issues: [String],
  chain: [Certificate],
  status: 'valid' | 'expired' | 'expiring_soon' | 'invalid',
  lastScanned: Date,
  createdAt: Date
}
```

**domains**
```javascript
{
  domainId: String,
  name: String,
  type: 'apex' | 'subdomain' | 'wildcard',
  scanFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly',
  status: 'active' | 'inactive' | 'suspended',
  lastScanned: Date,
  nextScan: Date,
  tags: [String]
}
```

**alerts**
```javascript
{
  alertId: String,
  type: 'certificate_expiring' | 'certificate_expired' | 'ssl_vulnerability',
  severity: 'low' | 'medium' | 'high' | 'critical',
  title: String,
  message: String,
  certificateId: String,
  domainId: String,
  acknowledged: Boolean,
  resolved: Boolean,
  createdAt: Date
}
```

**scan_results**
```javascript
{
  scanId: String,
  domain: String,
  certificate: Certificate,
  grade: String,
  score: Number,
  issues: [String],
  vulnerabilities: [{ id, title, severity, cve, remediation }],
  scanDuration: Number,
  scannedAt: Date
}
```

---

## 🛠️ Development

### Scripts

```bash
npm run dev      # Start Vite dev server (port 3025)
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Tech Stack
- **Framework:** React 19 + TypeScript
- **Build:** Vite 6
- **Styling:** CSS + Tailwind CSS
- **Charts:** Recharts
- **HTTP:** Axios
- **Real-time:** Socket.io Client
- **Routing:** React Router v7
- **Icons:** Lucide React

---

## 🔗 Related Tools

| Tool | Port | Description |
|------|------|-------------|
| CentralGrid | 3001 | Central management |
| **SSLMonitor** | **3025** | **Certificate monitoring** |
| ThreatRadar | 3003 | Threat monitoring |
| VulnScan | 3006 | Vulnerability scanning |
| SIEMCommander | 3027 | SIEM platform |

---

## 📄 License

MIT License - Part of VictoryKit Security Suite

---

**Built with 💚 for Enterprise Security Teams**
