# 🛡️ SIEMCommander Frontend

> **Enterprise Security Information & Event Management Platform**  
> Part of the VictoryKit Security Suite

## 🎯 Overview

SIEMCommander is a comprehensive SIEM platform providing real-time security monitoring, threat detection, incident management, and automated response capabilities. Built for enterprise SOC teams to detect, investigate, and respond to security threats at scale.

**Tool #27** | **Domain:** siemcommander.maula.ai | **Theme:** Violet (#8B5CF6)

---

## ✨ Features

### 🔐 Core Capabilities
- **SOC Dashboard** - Real-time security posture with event trends, severity distribution, and threat analytics
- **Events Panel** - Security event aggregation with filtering, timeline view, and raw log access
- **Incidents Panel** - Full incident lifecycle management with timeline, IOCs, and affected assets
- **Alerts Panel** - Alert triage with batch actions, acknowledgment, and dismissal

### 🎯 Advanced Features
- **Threat Hunting** - Proactive hunting with KQL/SPL/Sigma query support
- **Playbooks (SOAR)** - Automated response playbooks with execution tracking
- **Detection Rules** - Custom rule management with MITRE ATT&CK mapping
- **Data Sources** - Multi-source ingestion with health monitoring
- **Reports** - Compliance reporting (SOC 2, PCI-DSS, HIPAA, GDPR)

### 🤖 AI Integration
- **Neural Link Interface** - AI-powered security assistant
- **Natural Language Queries** - Ask questions about your security posture
- **Automated Analysis** - AI-driven threat correlation and recommendations

---

## 🏗️ Architecture

```
siemcommander/
├── src/
│   ├── components/
│   │   ├── SOCDashboard.tsx      # Main dashboard with stats & charts
│   │   ├── EventsPanel.tsx        # Security events table
│   │   ├── IncidentsPanel.tsx     # Incident management
│   │   ├── AlertsPanel.tsx        # Alert triage
│   │   ├── ThreatHuntingPanel.tsx # Hunt management
│   │   ├── PlaybooksPanel.tsx     # SOAR playbooks
│   │   ├── RulesPanel.tsx         # Detection rules
│   │   ├── DataSourcesPanel.tsx   # Data source grid
│   │   ├── ReportsPanel.tsx       # Compliance reports
│   │   ├── AIAssistantPanel.tsx   # AI chat interface
│   │   ├── SettingsPanel.tsx      # Platform settings
│   │   └── index.ts               # Barrel export
│   │
│   ├── services/
│   │   ├── siemAPI.ts            # Backend API client
│   │   ├── aiService.ts          # AI WebSocket client
│   │   └── index.ts              # Barrel export
│   │
│   ├── types.ts                  # TypeScript definitions
│   ├── constants.ts              # Theme & navigation config
│   ├── App.tsx                   # Main application
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles (Violet theme)
│
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend API running on port 4027

### Installation

```bash
# Navigate to tool directory
cd frontend/tools/27-siemcommander

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access
- **Frontend:** http://localhost:3027
- **Backend API:** http://localhost:4027
- **AI Assistant:** ws://localhost:6027/maula/ai
- **ML Engine:** http://localhost:8027

---

## 🎨 Theme

SIEMCommander uses a sophisticated violet color scheme:

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#8B5CF6` | Main accent, buttons, active states |
| Secondary | `#A78BFA` | Hover states, gradients |
| Accent | `#7C3AED` | Highlights, focus rings |
| Background | `#0F172A` | Main dark background |
| Surface | `#1E293B` | Cards, panels |
| Border | `#334155` | Borders, dividers |

---

## 🤖 AI Functions (10 Available)

| Function | Description |
|----------|-------------|
| `ingest_security_events` | Ingest logs from firewalls, endpoints, IDS/IPS |
| `detect_threats` | ML-powered threat detection with severity analysis |
| `create_incident` | Create security incidents with auto-assignment |
| `execute_playbook` | Run automated SOAR playbooks |
| `query_events` | Advanced event search with KQL/SPL |
| `correlate_events` | Event correlation and timeline analysis |
| `threat_hunt` | Proactive threat hunting campaigns |
| `generate_compliance_report` | Generate SOC 2/PCI-DSS/HIPAA reports |
| `update_threat_intel` | Update IOC and threat feeds |
| `open_soc_dashboard` | Launch real-time SOC dashboards |

---

## 📊 Backend API Endpoints

### Events
- `POST /api/v1/siemcommander/events/ingest` - Ingest security events
- `GET /api/v1/siemcommander/events` - List events with filters
- `POST /api/v1/siemcommander/events/query` - Advanced event querying
- `POST /api/v1/siemcommander/events/correlate` - Event correlation

### Threats
- `POST /api/v1/siemcommander/threats/detect` - ML threat detection
- `POST /api/v1/siemcommander/threats/hunt` - Proactive threat hunting

### Incidents
- `POST /api/v1/siemcommander/incidents` - Create incident
- `GET /api/v1/siemcommander/incidents` - List incidents
- `PUT /api/v1/siemcommander/incidents/:id` - Update incident
- `DELETE /api/v1/siemcommander/incidents/:id` - Delete incident

### Playbooks
- `POST /api/v1/siemcommander/playbooks/execute` - Execute playbook
- `GET /api/v1/siemcommander/playbooks` - List playbooks

### Dashboard
- `GET /api/v1/siemcommander/dashboard/stats` - Real-time statistics
- `GET /api/v1/siemcommander/dashboard/timeline` - Threat timeline

---

## 🗄️ Database Schema

### Collections (MongoDB)

**events** - Security event logs
```javascript
{
  eventId: String,
  timestamp: Date,
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info',
  source: 'firewall' | 'ids' | 'endpoint' | 'cloud' | 'application' | 'network',
  message: String,
  sourceIp: String,
  destIp: String,
  category: String,
  rawLog: String,
  mitreTactics: [String],
  mitreTechniques: [String]
}
```

**incidents** - Security incidents
```javascript
{
  incidentId: String,
  title: String,
  description: String,
  severity: 'critical' | 'high' | 'medium' | 'low',
  status: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed',
  category: String,
  assignedTo: String,
  timeline: [{ action: String, timestamp: Date, actor: String }],
  iocs: [String],
  affectedAssets: [String]
}
```

**playbooks** - SOAR automation
```javascript
{
  playbookId: String,
  name: String,
  description: String,
  trigger: String,
  steps: [{ name: String, action: String, params: Object }],
  status: 'active' | 'disabled' | 'draft',
  executions: [{ startTime: Date, endTime: Date, status: String }]
}
```

**threat_intel** - IOC database
```javascript
{
  ioc: String,
  type: 'ip' | 'domain' | 'hash' | 'url' | 'email',
  threat_type: String,
  confidence: Number,
  source: String,
  lastSeen: Date,
  firstSeen: Date
}
```

---

## 🛠️ Development

### Scripts

```bash
npm run dev      # Start dev server (port 3027)
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Tech Stack
- **Framework:** React 19 + TypeScript
- **Build:** Vite 6
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts
- **HTTP:** Axios
- **Real-time:** Socket.io Client
- **Dates:** date-fns

---

## 🔗 Related Tools

| Tool | Port | Description |
|------|------|-------------|
| CentralGrid | 3001 | Central management dashboard |
| FraudGuard | 3001 | Fraud detection |
| ThreatRadar | 3003 | Threat monitoring |
| VulnScan | 3006 | Vulnerability scanning |
| **SIEMCommander** | **3027** | **SIEM platform** |
| MalwareHunter | 3028 | Malware analysis |
| DataSecurityHub | 3029 | Data protection |

---

## 📄 License

MIT License - Part of VictoryKit Security Suite

---

**Built with 💜 for Enterprise SOC Teams**
