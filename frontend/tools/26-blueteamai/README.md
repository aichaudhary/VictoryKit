# BlueTeam AI - Security Operations Center Tool

**Tool #26** | Port: 3026 | Domain: `blueteamai.maula.ai`

BlueTeam AI is an AI-powered Security Operations Center (SOC) platform designed to help security analysts detect, investigate, and respond to cyber threats efficiently.

---

## 🎯 Overview

BlueTeam AI provides defensive security teams with:
- **Alert Triage** - Prioritize and manage security alerts
- **Incident Investigation** - Deep-dive into security incidents
- **Threat Hunting** - Proactive threat detection campaigns
- **MITRE ATT&CK Mapping** - Technique and tactic visualization
- **Playbook Management** - Automated response workflows
- **AI-Powered Analysis** - Intelligent security insights

---

## 📁 Project Structure

```
26-blueteamai/
├── README.md                    # This file
├── blueteamai-config.json       # Tool configuration
├── package.json                 # Dependencies & scripts
├── vite.config.ts               # Vite bundler config
├── tailwind.config.js           # Tailwind CSS config
├── tsconfig.json                # TypeScript config
├── index.html                   # Entry HTML
│
├── src/
│   ├── App.tsx                  # Main application component
│   ├── main.tsx                 # React entry point
│   ├── index.css                # Global styles
│   ├── types.ts                 # TypeScript type definitions
│   ├── constants.ts             # App constants & config
│   │
│   ├── components/
│   │   ├── index.ts             # Component exports
│   │   ├── AlertTriagePanel.tsx # Alert queue management
│   │   ├── IncidentInvestigation.tsx # Incident deep-dive
│   │   ├── ThreatHuntingPanel.tsx    # Hunt campaigns
│   │   ├── DashboardOverview.tsx     # SOC metrics dashboard
│   │   ├── ReportsGenerator.tsx      # Report creation
│   │   ├── MitreMapping.tsx          # ATT&CK framework
│   │   ├── PlaybookManager.tsx       # Response playbooks
│   │   └── AIAssistant.tsx           # AI chat interface
│   │
│   └── services/
│       ├── index.ts             # Service exports
│       ├── blueteamAPI.ts       # API client
│       └── blueteam-tools.ts    # AI function definitions
│
├── backend/                     # Backend API (port 4026)
│   ├── server.js                # Express server
│   ├── package.json             # Backend dependencies
│   ├── routes/
│   │   ├── alerts.js            # Alert endpoints
│   │   ├── incidents.js         # Incident endpoints
│   │   ├── hunts.js             # Threat hunt endpoints
│   │   ├── playbooks.js         # Playbook endpoints
│   │   ├── mitre.js             # MITRE ATT&CK endpoints
│   │   ├── reports.js           # Report endpoints
│   │   └── ai.js                # AI analysis endpoints
│   ├── controllers/
│   ├── models/
│   └── services/
│
└── database/                    # MongoDB schemas
    ├── schemas/
    │   ├── alert.schema.js
    │   ├── incident.schema.js
    │   ├── hunt.schema.js
    │   ├── playbook.schema.js
    │   └── report.schema.js
    └── seeds/
        └── mitre-attack.json
```

---

## 🚀 Quick Start

### Frontend (Port 3026)

```bash
cd frontend/tools/26-blueteamai
npm install --legacy-peer-deps
npm run dev
```

Access at: http://localhost:3026

### Backend (Port 4026)

```bash
cd frontend/tools/26-blueteamai/backend
npm install
npm run dev
```

API at: http://localhost:4026/api

### WebSocket (Port 6026)

Real-time alerts and notifications via WebSocket on port 6026.

---

## 🔧 Configuration

### blueteamai-config.json

```json
{
  "name": "BlueTeam AI",
  "version": "1.0.0",
  "port": 3026,
  "apiPort": 4026,
  "wsPort": 6026,
  "theme": {
    "primary": "#3B82F6",
    "secondary": "#06B6D4"
  }
}
```

### Environment Variables

```env
# Frontend (.env)
VITE_API_URL=http://localhost:4026/api
VITE_WS_URL=ws://localhost:6026

# Backend (.env)
PORT=4026
MONGODB_URI=mongodb://localhost:27017/blueteamai
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-xxx
```

---

## 📊 Features

### 1. Dashboard Overview
- Open incidents count
- Alerts today
- Mean Time to Detect (MTTD)
- Mean Time to Respond (MTTR)
- Active threat hunts
- Team members online

### 2. Alert Triage Panel
- Severity-based filtering (Critical, High, Medium, Low, Info)
- Status management (New, Investigating, Escalated, Resolved, False Positive)
- Quick actions (Acknowledge, Escalate, Resolve)
- Alert search and filtering
- AI-powered alert analysis

### 3. Incident Investigation
- Incident timeline visualization
- IOC (Indicators of Compromise) tracking
- MITRE ATT&CK technique mapping
- Investigation notes
- Team collaboration

### 4. Threat Hunting
- Create hunt campaigns
- Query types: IOC Search, Behavior Pattern, Anomaly Detection, Threat Intel
- Hunt status tracking
- Findings management
- Scheduled hunts

### 5. MITRE ATT&CK Mapping
- 14 Tactics coverage
- Technique details
- Detection coverage heatmap
- Related incidents

### 6. Playbook Manager
- Pre-built response playbooks
- Custom playbook creation
- Step-by-step execution
- Execution history
- Automation triggers

### 7. Reports Generator
- Executive summaries
- Incident reports
- Threat intelligence reports
- Compliance reports
- Multiple export formats (PDF, HTML, JSON)

### 8. AI Assistant
- Natural language queries
- Alert analysis
- Investigation recommendations
- Threat intelligence lookups
- Playbook suggestions

---

## 🗄️ Database Schema

### Alerts Collection

```javascript
{
  _id: ObjectId,
  alert_id: String,
  title: String,
  description: String,
  severity: "critical" | "high" | "medium" | "low" | "info",
  status: "new" | "investigating" | "escalated" | "resolved" | "false_positive",
  source: String,
  timestamp: Date,
  assignee: String,
  tags: [String],
  raw_log: Object,
  related_iocs: [ObjectId],
  mitre_techniques: [String],
  created_at: Date,
  updated_at: Date
}
```

### Incidents Collection

```javascript
{
  _id: ObjectId,
  incident_id: String,
  title: String,
  description: String,
  severity: "critical" | "high" | "medium" | "low",
  status: "open" | "in_progress" | "contained" | "eradicated" | "recovered" | "closed",
  priority: Number,
  assigned_to: [String],
  related_alerts: [ObjectId],
  timeline: [{
    id: String,
    timestamp: Date,
    event_type: "detection" | "investigation" | "containment" | "eradication" | "recovery",
    title: String,
    description: String,
    source: String
  }],
  iocs: [{
    type: "ip" | "domain" | "url" | "hash_md5" | "hash_sha1" | "hash_sha256" | "email" | "file_path",
    value: String,
    first_seen: Date,
    last_seen: Date,
    confidence: Number,
    threat_type: String
  }],
  mitre_techniques: [{
    id: String,
    name: String,
    tactic: String
  }],
  notes: [{
    id: String,
    content: String,
    author: String,
    timestamp: Date,
    type: "general" | "finding" | "action" | "recommendation"
  }],
  created_at: Date,
  updated_at: Date
}
```

### Threat Hunts Collection

```javascript
{
  _id: ObjectId,
  hunt_id: String,
  name: String,
  hypothesis: String,
  status: "draft" | "running" | "paused" | "completed" | "cancelled",
  query_type: "ioc_search" | "behavior_pattern" | "anomaly_detection" | "threat_intel",
  query: String,
  indicators: [String],
  created_by: String,
  start_time: Date,
  end_time: Date,
  findings: [{
    id: String,
    title: String,
    description: String,
    severity: String,
    timestamp: Date,
    evidence: Object
  }],
  created_at: Date,
  updated_at: Date
}
```

### Playbooks Collection

```javascript
{
  _id: ObjectId,
  playbook_id: String,
  name: String,
  description: String,
  category: "incident_response" | "malware_analysis" | "phishing" | "ransomware" | "data_breach",
  trigger_type: "manual" | "alert" | "scheduled",
  steps: [{
    id: String,
    order: Number,
    name: String,
    description: String,
    action_type: "manual" | "automated" | "conditional",
    action: Object,
    timeout: Number
  }],
  is_active: Boolean,
  execution_history: [{
    id: String,
    started_at: Date,
    completed_at: Date,
    status: "running" | "completed" | "failed" | "cancelled",
    triggered_by: String,
    steps_completed: Number
  }],
  created_at: Date,
  updated_at: Date
}
```

---

## 🔌 API Endpoints

### Alerts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts` | List all alerts |
| GET | `/api/alerts/:id` | Get alert by ID |
| POST | `/api/alerts` | Create alert |
| PUT | `/api/alerts/:id` | Update alert |
| PUT | `/api/alerts/:id/status` | Update alert status |
| DELETE | `/api/alerts/:id` | Delete alert |
| POST | `/api/alerts/:id/analyze` | AI analyze alert |

### Incidents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/incidents` | List all incidents |
| GET | `/api/incidents/:id` | Get incident by ID |
| POST | `/api/incidents` | Create incident |
| PUT | `/api/incidents/:id` | Update incident |
| POST | `/api/incidents/:id/timeline` | Add timeline event |
| POST | `/api/incidents/:id/iocs` | Add IOC |
| POST | `/api/incidents/:id/notes` | Add note |

### Threat Hunts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hunts` | List all hunts |
| GET | `/api/hunts/:id` | Get hunt by ID |
| POST | `/api/hunts` | Create hunt |
| PUT | `/api/hunts/:id` | Update hunt |
| POST | `/api/hunts/:id/start` | Start hunt |
| POST | `/api/hunts/:id/pause` | Pause hunt |
| POST | `/api/hunts/:id/findings` | Add finding |

### Playbooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/playbooks` | List all playbooks |
| GET | `/api/playbooks/:id` | Get playbook by ID |
| POST | `/api/playbooks` | Create playbook |
| PUT | `/api/playbooks/:id` | Update playbook |
| POST | `/api/playbooks/:id/execute` | Execute playbook |
| GET | `/api/playbooks/:id/history` | Get execution history |

### MITRE ATT&CK

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mitre/tactics` | List all tactics |
| GET | `/api/mitre/techniques` | List all techniques |
| GET | `/api/mitre/techniques/:id` | Get technique details |
| GET | `/api/mitre/coverage` | Get detection coverage |

### AI Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/analyze-alert` | Analyze alert with AI |
| POST | `/api/ai/investigate` | Get investigation recommendations |
| POST | `/api/ai/threat-intel` | Lookup threat intelligence |
| POST | `/api/ai/chat` | Chat with AI assistant |

---

## 🤖 AI Functions

BlueTeam AI uses function calling for intelligent security analysis:

| Function | Description |
|----------|-------------|
| `analyze_alert` | Deep analysis of security alerts |
| `investigate_incident` | Incident investigation recommendations |
| `run_threat_hunt` | Execute threat hunting queries |
| `correlate_events` | Find related security events |
| `lookup_ioc` | Threat intelligence lookup |
| `suggest_playbook` | Recommend response playbooks |
| `generate_report` | Create security reports |
| `map_to_mitre` | Map to MITRE ATT&CK framework |

---

## 🎨 Theme

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Blue | `#3B82F6` | Headers, buttons, accents |
| Cyan | `#06B6D4` | Secondary accents, gradients |
| Slate | `#0F172A` | Background |
| Critical | `#EF4444` | Critical severity |
| High | `#F97316` | High severity |
| Medium | `#EAB308` | Medium severity |
| Low | `#22C55E` | Low severity |

---

## 📦 Dependencies

### Frontend

```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "lucide-react": "^0.400.0",
  "tailwindcss": "^3.4.0",
  "typescript": "^5.6.0",
  "vite": "^5.4.0"
}
```

### Backend

```json
{
  "express": "^4.18.0",
  "mongoose": "^8.0.0",
  "cors": "^2.8.5",
  "dotenv": "^16.0.0",
  "jsonwebtoken": "^9.0.0",
  "socket.io": "^4.7.0",
  "openai": "^4.0.0"
}
```

---

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Audit logging
- Encrypted data at rest
- TLS/SSL encryption
- Rate limiting
- Input validation

---

## 📈 Metrics & Monitoring

- **MTTD** - Mean Time to Detect
- **MTTR** - Mean Time to Respond
- **Alert volume** by severity/source
- **Incident closure rate**
- **Hunt effectiveness**
- **Playbook success rate**

---

## 🚧 Roadmap

- [ ] SIEM integrations (Splunk, ELK, QRadar)
- [ ] SOAR automation
- [ ] Threat feed integrations
- [ ] Custom detection rules
- [ ] Mobile app
- [ ] Dark mode improvements
- [ ] Multi-tenant support

---

## 📝 License

MIT License - See [LICENSE](../../../LICENSE) for details.

---

## 👥 Team

Part of the **VictoryKit** security tools suite by **Maula.ai**

---

*BlueTeam AI - Defend Smarter, Respond Faster* 🛡️
