# SOAR Engine

## 🛡️ Security Orchestration, Automation, and Response Platform

SOAR Engine is a comprehensive security operations platform designed to streamline incident response, automate repetitive tasks, and orchestrate security tools across your infrastructure.

**Domain:** soarengine.maula.ai  
**Tool #:** 28  
**Category:** Security Operations  

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Frontend](#frontend)
- [Backend](#backend)
- [Database](#database)
- [AI Integration](#ai-integration)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Configuration](#configuration)

---

## 🔍 Overview

SOAR Engine provides security teams with a unified platform to:

- **Orchestrate** - Connect and coordinate multiple security tools
- **Automate** - Create automated workflows for incident response
- **Respond** - Streamline case management and threat remediation

### Key Capabilities

| Feature | Description |
|---------|-------------|
| Case Management | Track and manage security incidents end-to-end |
| Playbook Builder | Create automated response workflows |
| Integration Hub | Connect SIEM, EDR, Firewall, and more |
| IOC Enrichment | Enrich indicators with threat intelligence |
| Automation Rules | Event-driven automated actions |
| Reports & Analytics | SOC metrics and compliance reporting |
| AI Assistant | Natural language security operations |

---

## ✨ Features

### 1. Dashboard Overview
- Real-time SOC metrics (MTTR, automation rate, SLA status)
- Open/critical case counts
- Active playbook status
- Integration health monitoring

### 2. Case Management
- Full incident lifecycle management
- Priority-based queue (Critical → Low)
- SLA tracking and breach alerts
- Timeline and audit trail
- Notes and artifact management
- Playbook assignment

### 3. Playbook Builder
- Visual workflow editor
- Conditional branching
- Multiple trigger types (Alert, Schedule, Manual, Webhook)
- Step-by-step execution
- Success/failure handling

### 4. Integration Hub
- Pre-built connectors:
  - **SIEM:** Splunk, Microsoft Sentinel, QRadar
  - **EDR:** CrowdStrike, Carbon Black, SentinelOne
  - **Firewall:** Palo Alto, Fortinet, Cisco
  - **Threat Intel:** VirusTotal, AbuseIPDB, AlienVault OTX
  - **Ticketing:** ServiceNow, Jira, PagerDuty
- Health monitoring
- Event synchronization

### 5. IOC Enrichment
- Multi-source threat intelligence
- IOC types: IP, Domain, Hash, Email, URL
- Consolidated threat scores
- Case artifact integration

### 6. Automation Manager
- Event-based triggers
- Conditional execution
- Multi-action workflows
- Execution history

### 7. Reports & Analytics
- Executive summaries
- Incident reports
- Compliance reports (SOC 2, ISO 27001)
- Performance metrics
- Export: PDF, HTML, JSON

### 8. AI Assistant
- Natural language queries
- Automated investigation
- Playbook recommendations
- Report generation

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       SOAR Engine                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Frontend   │  │   Backend    │  │   Database   │          │
│  │  React 19    │  │   Node.js    │  │   MongoDB    │          │
│  │  Port: 3028  │  │  Port: 4028  │  │  Port: 27017 │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         └────────┬────────┴────────┬────────┘                   │
│                  │                 │                            │
│         ┌────────▼────────┐ ┌──────▼──────┐                     │
│         │   WebSocket     │ │   Redis     │                     │
│         │   Port: 6028    │ │   Cache     │                     │
│         └─────────────────┘ └─────────────┘                     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                      Integrations                               │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│  │ SIEM │ │ EDR  │ │ FW   │ │ TI   │ │ ITSM │ │ IAM  │        │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💻 Frontend

### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.0.0 | UI Framework |
| TypeScript | 5.3+ | Type Safety |
| Vite | 5.0+ | Build Tool |
| Tailwind CSS | 3.4+ | Styling |
| Lucide React | 0.263+ | Icons |
| Recharts | 2.12+ | Charts |
| Axios | 1.6+ | HTTP Client |
| Socket.io-client | 4.5+ | Real-time |

### Directory Structure

```
frontend/tools/28-soarengine/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── DashboardOverview.tsx    # Main dashboard stats
│   │   ├── CaseManagement.tsx       # Case list and details
│   │   ├── PlaybookBuilder.tsx      # Playbook editor
│   │   ├── IntegrationHub.tsx       # Integration management
│   │   ├── EnrichmentPanel.tsx      # IOC enrichment
│   │   ├── AutomationManager.tsx    # Automation rules
│   │   ├── ReportsDashboard.tsx     # Reports and analytics
│   │   ├── AIAssistant.tsx          # AI chat interface
│   │   └── index.ts                 # Barrel exports
│   ├── services/
│   │   ├── soarAPI.ts               # API client
│   │   ├── soar-tools.ts            # AI function definitions
│   │   └── index.ts                 # Barrel exports
│   ├── types.ts                     # TypeScript interfaces
│   ├── constants.ts                 # App constants
│   ├── App.tsx                      # Main application
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Global styles
├── soarengine-config.json           # Tool configuration
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

### Key Components

#### DashboardOverview
Real-time SOC metrics including:
- Open/critical case counts
- Active playbook status
- MTTR and automation rate
- Recent cases and activities

#### CaseManagement
Full incident management:
- Case list with filters (status, priority, assignee)
- Case detail panel with timeline
- Note and artifact management
- Playbook assignment

#### PlaybookBuilder
Visual workflow builder:
- Playbook list with statistics
- Step-by-step workflow editor
- Trigger configuration
- Execution monitoring

#### IntegrationHub
Security tool integrations:
- Integration grid by category
- Health status indicators
- Configuration management
- Sync controls

### Running Frontend

```bash
cd frontend/tools/28-soarengine

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Access:** http://localhost:3028

---

## ⚙️ Backend

### Technology Stack

| Technology | Purpose |
|------------|---------|
| Node.js 20+ | Runtime |
| Express.js | API Framework |
| Socket.io | Real-time Events |
| Mongoose | MongoDB ODM |
| Bull | Job Queue |
| JWT | Authentication |

### API Endpoints

#### Cases
```
GET    /api/cases              # List all cases
GET    /api/cases/:id          # Get case details
POST   /api/cases              # Create case
PATCH  /api/cases/:id          # Update case
POST   /api/cases/:id/notes    # Add note
POST   /api/cases/:id/escalate # Escalate case
POST   /api/cases/:id/close    # Close case
```

#### Playbooks
```
GET    /api/playbooks           # List playbooks
GET    /api/playbooks/:id       # Get playbook
POST   /api/playbooks           # Create playbook
PATCH  /api/playbooks/:id       # Update playbook
DELETE /api/playbooks/:id       # Delete playbook
POST   /api/playbooks/:id/run   # Execute playbook
```

#### Integrations
```
GET    /api/integrations             # List integrations
GET    /api/integrations/:id         # Get integration
PUT    /api/integrations/:id/config  # Configure
POST   /api/integrations/:id/sync    # Sync data
POST   /api/integrations/:id/test    # Test connection
```

#### Enrichment
```
POST   /api/enrichment/ioc     # Enrich single IOC
POST   /api/enrichment/bulk    # Bulk enrichment
GET    /api/enrichment/sources # List sources
GET    /api/enrichment/history # Query history
```

#### Automations
```
GET    /api/automations         # List automations
POST   /api/automations         # Create automation
PATCH  /api/automations/:id     # Update automation
DELETE /api/automations/:id     # Delete automation
```

#### Metrics & Reports
```
GET    /api/metrics/dashboard   # Dashboard stats
GET    /api/metrics/history     # Historical metrics
POST   /api/reports/generate    # Generate report
GET    /api/reports/scheduled   # Scheduled reports
```

### Backend Directory Structure

```
backend/tools/28-soarengine/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── redis.js
│   │   └── integrations.js
│   ├── controllers/
│   │   ├── caseController.js
│   │   ├── playbookController.js
│   │   ├── integrationController.js
│   │   ├── enrichmentController.js
│   │   └── automationController.js
│   ├── models/
│   │   ├── Case.js
│   │   ├── Playbook.js
│   │   ├── Integration.js
│   │   ├── Automation.js
│   │   └── Enrichment.js
│   ├── services/
│   │   ├── playbookEngine.js
│   │   ├── enrichmentService.js
│   │   ├── automationService.js
│   │   └── integrationService.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── rateLimit.js
│   ├── routes/
│   │   └── index.js
│   ├── websocket/
│   │   └── handler.js
│   └── app.js
├── package.json
└── README.md
```

### Environment Variables

```env
# Server
PORT=4028
WS_PORT=6028
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/soarengine

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-jwt-secret
JWT_EXPIRY=24h

# Integrations
VIRUSTOTAL_API_KEY=
ABUSEIPDB_API_KEY=
SPLUNK_URL=
SPLUNK_TOKEN=
CROWDSTRIKE_CLIENT_ID=
CROWDSTRIKE_CLIENT_SECRET=

# AI
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

---

## 🗄️ Database

### MongoDB Collections

#### cases
```javascript
{
  _id: ObjectId,
  id: String,              // CASE-XXX
  title: String,
  description: String,
  status: String,          // open, in_progress, pending, resolved, closed
  priority: String,        // low, medium, high, critical
  assignee: String,
  created_at: Date,
  updated_at: Date,
  tags: [String],
  related_alerts: [String],
  playbook_id: String,
  artifacts: [{
    type: String,
    value: String,
    source: String
  }],
  timeline: [{
    timestamp: Date,
    action: String,
    user: String
  }],
  notes: [{
    id: String,
    content: String,
    author: String,
    created_at: Date
  }],
  sla_due: Date,
  closed_at: Date,
  resolution: String
}
```

#### playbooks
```javascript
{
  _id: ObjectId,
  id: String,              // PB-XXX
  name: String,
  description: String,
  category: String,        // incident_response, threat_hunting, enrichment, etc.
  steps: [{
    id: String,
    name: String,
    action: String,
    target: String,
    condition: String,
    next_step: String
  }],
  triggers: [{
    type: String,
    condition: String
  }],
  enabled: Boolean,
  created_at: Date,
  updated_at: Date,
  last_run: Date,
  run_count: Number,
  success_rate: Number
}
```

#### integrations
```javascript
{
  _id: ObjectId,
  id: String,
  name: String,
  category: String,        // siem, edr, firewall, threat_intel, ticketing
  status: String,          // healthy, warning, error, disabled
  config: Object,
  last_sync: Date,
  events_processed: Number,
  created_at: Date,
  updated_at: Date
}
```

#### automations
```javascript
{
  _id: ObjectId,
  id: String,
  name: String,
  description: String,
  trigger: {
    type: String,
    event: String,
    schedule: String
  },
  conditions: [{
    field: String,
    operator: String,
    value: Mixed
  }],
  actions: [{
    type: String,
    target: String,
    params: Object
  }],
  enabled: Boolean,
  created_at: Date,
  last_triggered: Date,
  trigger_count: Number
}
```

#### enrichments
```javascript
{
  _id: ObjectId,
  ioc: String,
  type: String,            // ip, domain, hash, email, url
  sources: [{
    name: String,
    score: Number,
    verdict: String,
    details: Object
  }],
  overall_score: Number,
  timestamp: Date
}
```

### Indexes

```javascript
// Cases
db.cases.createIndex({ status: 1, priority: 1 })
db.cases.createIndex({ assignee: 1 })
db.cases.createIndex({ created_at: -1 })
db.cases.createIndex({ tags: 1 })

// Playbooks
db.playbooks.createIndex({ category: 1 })
db.playbooks.createIndex({ enabled: 1 })

// Enrichments
db.enrichments.createIndex({ ioc: 1 })
db.enrichments.createIndex({ timestamp: -1 })

// Automations
db.automations.createIndex({ enabled: 1 })
```

---

## 🤖 AI Integration

### Supported Providers

| Provider | Models | Use Cases |
|----------|--------|-----------|
| OpenAI | GPT-4, GPT-4o | Analysis, recommendations |
| Anthropic | Claude 3.5 | Investigation, reporting |
| Google | Gemini Pro | Multi-modal analysis |

### AI Functions

SOAR Engine exposes these functions for AI integration:

#### Case Management
- `create_case` - Create security case
- `update_case` - Update case status/priority
- `escalate_case` - Escalate to higher tier
- `search_cases` - Query cases

#### Playbooks
- `run_playbook` - Execute automated workflow
- `get_playbook_status` - Check execution status
- `list_playbooks` - Available playbooks

#### Enrichment
- `enrich_ioc` - Enrich indicator
- `bulk_enrich` - Multiple IOCs
- `query_threat_intel` - Threat intelligence

#### Integration
- `query_integration` - Query connected tool
- `execute_action` - Run action (block, isolate, etc.)

#### Reporting
- `generate_report` - Create report
- `get_metrics` - SOC metrics

### AI Assistant Capabilities

1. **Investigation Support**
   - "Analyze this IP address: 192.168.1.100"
   - "What do we know about this hash?"
   - "Check for related indicators"

2. **Case Management**
   - "Show all critical cases"
   - "Create a case for this phishing attempt"
   - "Escalate CASE-001 to Tier 2"

3. **Playbook Execution**
   - "Run the malware containment playbook"
   - "What playbooks are available for ransomware?"

4. **Reporting**
   - "Generate an executive summary for this week"
   - "What's our MTTR trend?"

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- MongoDB 6+
- Redis 7+
- npm or yarn

### Quick Start

```bash
# 1. Clone repository
git clone https://github.com/VM07B/VictoryKit.git
cd VictoryKit

# 2. Start frontend
cd frontend/tools/28-soarengine
npm install --legacy-peer-deps
npm run dev

# 3. Start backend (separate terminal)
cd backend/tools/28-soarengine
npm install
npm run dev

# 4. Access application
open http://localhost:3028
```

### Docker Deployment

```yaml
# docker-compose.yml
version: '3.8'
services:
  soar-frontend:
    build: ./frontend/tools/28-soarengine
    ports:
      - "3028:3028"
    environment:
      - VITE_API_URL=http://localhost:4028

  soar-backend:
    build: ./backend/tools/28-soarengine
    ports:
      - "4028:4028"
      - "6028:6028"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/soarengine
      - REDIS_URL=redis://redis:6379

  mongo:
    image: mongo:6
    ports:
      - "27028:27017"
    volumes:
      - soar-mongo:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6328:6379"

volumes:
  soar-mongo:
```

---

## 📊 Configuration

### soarengine-config.json

```json
{
  "tool": {
    "id": 28,
    "name": "SOAR Engine",
    "domain": "soarengine.maula.ai"
  },
  "ports": {
    "frontend": 3028,
    "api": 4028,
    "websocket": 6028
  },
  "features": {
    "case_management": true,
    "playbook_builder": true,
    "integration_hub": true,
    "enrichment": true,
    "automations": true,
    "ai_assistant": true
  }
}
```

---

## 📄 License

MIT License - See [LICENSE](../../../LICENSE) for details.

---

## 🤝 Support

- **Documentation:** [docs/](../../../docs/)
- **Issues:** GitHub Issues
- **Email:** support@maula.ai

---

**SOAR Engine** - Orchestrate. Automate. Respond. 🛡️
