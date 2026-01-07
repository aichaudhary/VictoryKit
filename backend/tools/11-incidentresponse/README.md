# 🚨 IncidentResponse - AI-Powered Security Incident Response Platform

<div align="center">

![IncidentResponse Logo](https://img.shields.io/badge/IncidentResponse-AI%20Incident%20Response-f43f5e?style=for-the-badge&logo=alert-triangle&logoColor=white)

[![Version](https://img.shields.io/badge/version-1.0.0-f43f5e.svg)](https://github.com/VM07B/VictoryKit)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg)](https://python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248.svg)](https://mongodb.com/)

**Enterprise-Grade AI-Powered Security Incident Detection, Response & Remediation Platform**

[Live Demo](https://incidentresponse.maula.ai) • [API Docs](https://incidentresponse.maula.ai/docs) • [Report Bug](https://github.com/VM07B/VictoryKit/issues)

</div>

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [Architecture](#-architecture)
4. [Technology Stack](#-technology-stack)
5. [Installation](#-installation)
6. [Configuration](#-configuration)
7. [API Reference](#-api-reference)
8. [Database Schema](#-database-schema)
9. [ML Models](#-ml-models)
10. [Security](#-security)
11. [Deployment](#-deployment)

---

## 🎯 Overview

**IncidentResponse** is a cutting-edge, AI-powered security incident response platform designed to detect, triage, respond to, and remediate security incidents with unprecedented speed and accuracy. Leveraging advanced machine learning for intelligent alert correlation, automated playbook execution, and real-time response coordination, IncidentResponse transforms your security operations into a proactive defense system.

### Why IncidentResponse?

- **AI-Powered Triage**: Intelligent incident classification and prioritization
- **Automated Playbooks**: Pre-configured response workflows with automation
- **Real-Time Coordination**: Live incident timeline and team collaboration
- **Forensic Analysis**: Integrated artifact collection and analysis
- **Smart Escalation**: ML-driven escalation recommendations
- **Rapid Response**: Reduce MTTR by 70% with AI assistance

### Use Cases

| Use Case | Description |
|----------|-------------|
| **Incident Detection** | Real-time threat detection and alerting |
| **Incident Triage** | AI-assisted severity classification |
| **Response Coordination** | Team collaboration and task assignment |
| **Playbook Execution** | Automated response workflows |
| **Forensic Investigation** | Artifact collection and analysis |
| **Post-Incident Review** | Automated report generation |

---

## ✨ Key Features

### 🔍 Incident Response Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                  INCIDENT RESPONSE PIPELINE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│   │    Alert     │  │     AI       │  │   Incident   │         │
│   │   Ingestion  │──▶│   Triage     │──▶│  Creation    │         │
│   └──────────────┘  └──────────────┘  └──────────────┘         │
│          │                                    │                  │
│          │         ┌──────────────┐          │                  │
│          │         │   ML Engine  │          │                  │
│          └────────▶│ (Correlation)│◀─────────┘                  │
│                    └──────┬───────┘                             │
│                           │                                      │
│          ┌────────────────┼────────────────┐                    │
│          ▼                ▼                ▼                    │
│   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│   │  Playbook    │ │   Response   │ │  Forensics   │           │
│   │  Execution   │ │ Coordination │ │  Collection  │           │
│   └──────────────┘ └──────────────┘ └──────────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 🛡️ Incident Types Supported

- **Malware**: Ransomware, trojans, viruses, worms
- **Intrusion**: Unauthorized access, lateral movement
- **Data Breach**: Data exfiltration, exposure
- **Phishing**: Credential theft, BEC attacks
- **DDoS**: Service disruption attacks
- **Insider Threat**: Malicious or negligent insiders

### 🤖 AI-Powered Features

- **Alert Correlation**: Auto-correlate related alerts into incidents
- **Severity Prediction**: ML-based severity classification
- **Playbook Recommendation**: Suggest optimal response playbooks
- **Impact Analysis**: Predict incident impact and scope
- **Response Automation**: Automated containment actions
- **Post-Mortem Generation**: AI-assisted incident reports

---

## 🏗️ Architecture

### System Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                       INCIDENTRESPONSE PLATFORM                             │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         FRONTEND LAYER                               │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │  Dashboard  │  │  Incidents  │  │  Playbooks  │  │  Forensics │ │   │
│  │  │   React     │  │   Manager   │  │   Editor    │  │  Analysis  │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  │                         Port: 3011                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                          API GATEWAY                                 │   │
│  │              Authentication │ Rate Limiting │ Routing                │   │
│  │                         Port: 4000                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                    ┌───────────────┼───────────────┐                       │
│                    ▼               ▼               ▼                       │
│  ┌──────────────────────┐ ┌──────────────────┐ ┌──────────────────────┐   │
│  │    BACKEND API       │ │    ML ENGINE     │ │   RESPONSE ENGINE    │   │
│  │    Node.js/Express   │ │   Python/FastAPI │ │   Python/Celery      │   │
│  │    Port: 4011        │ │   Port: 8011     │ │   Port: 6011         │   │
│  └──────────────────────┘ └──────────────────┘ └──────────────────────┘   │
│           │                       │                       │                │
│           └───────────────────────┼───────────────────────┘                │
│                                   ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        DATA LAYER                                    │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │   MongoDB   │  │    Redis    │  │ Elasticsearch│  │   Kafka    │ │   │
│  │  │   Primary   │  │   Pub/Sub   │  │   Timeline  │  │   Events   │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

| Component | Technology | Port | Purpose |
|-----------|------------|------|---------|
| Frontend | React 19 + TypeScript | 3011 | User interface |
| API Gateway | Express.js | 4000 | Authentication & routing |
| Backend API | Node.js + Express | 4011 | Business logic |
| ML Engine | Python + FastAPI | 8011 | AI/ML processing |
| Response Engine | Python + Celery | 6011 | Automated response |
| Database | MongoDB 7.0 | 27017 | Data persistence |
| Cache/Pub-Sub | Redis 7.0 | 6379 | Real-time events |

---

## 🛠️ Technology Stack

### Backend Technologies

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Runtime** | Node.js | 18+ | Server runtime |
| **Framework** | Express.js | 4.18 | REST API framework |
| **Language** | TypeScript | 5.3 | Type safety |
| **Database** | MongoDB | 7.0 | Document storage |
| **ODM** | Mongoose | 8.0 | MongoDB modeling |
| **Real-time** | Socket.io | 4.7 | WebSocket support |
| **Queue** | Bull | 4.12 | Job processing |

### Response Engine Technologies

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Runtime** | Python | 3.11 | Engine runtime |
| **Framework** | FastAPI | 0.109 | Async API |
| **Task Queue** | Celery | 5.3 | Distributed tasks |
| **ML** | scikit-learn | 1.3 | Classification |
| **NLP** | transformers | 4.36 | Text analysis |
| **Automation** | ansible-runner | 2.3 | Playbook execution |

### Frontend Technologies

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | React | 19.0 | UI framework |
| **Language** | TypeScript | 5.3 | Type safety |
| **Build** | Vite | 6.0 | Build tool |
| **Styling** | TailwindCSS | 3.4 | Utility CSS |
| **Real-time** | Socket.io-client | 4.7 | Live updates |
| **Charts** | Recharts | 2.10 | Data visualization |

---

## 📦 Installation

### Prerequisites

```bash
# Required software
Node.js >= 18.0.0
Python >= 3.11
MongoDB >= 7.0
Redis >= 7.0
Docker >= 24.0 (optional)
Kafka >= 3.6 (optional)
```

### Quick Start

```bash
# Clone repository
git clone https://github.com/VM07B/VictoryKit.git
cd VictoryKit

# Install backend dependencies
cd backend/tools/11-incidentresponse/api
npm install

# Install ML engine dependencies
cd ../ml-engine
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Install frontend dependencies
cd ../../../../frontend/tools/11-incidentresponse
npm install

# Setup environment variables
cp .env.example .env

# Start development servers
npm run dev
```

### Docker Installation

```yaml
# docker-compose.yml
version: '3.8'

services:
  incidentresponse-api:
    build: ./api
    ports:
      - "4011:4011"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/incidentresponse

  incidentresponse-engine:
    build: ./ml-engine
    ports:
      - "8011:8011"

  incidentresponse-frontend:
    build: ../../../frontend/tools/11-incidentresponse
    ports:
      - "3011:3011"

  mongo:
    image: mongo:7
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine

  kafka:
    image: confluentinc/cp-kafka:7.5.0

volumes:
  mongo_data:
```

---

## ⚙️ Configuration

### Environment Variables

```env
# ===========================================
# INCIDENTRESPONSE CONFIGURATION
# ===========================================

# Server Configuration
NODE_ENV=development
PORT=4011
HOST=0.0.0.0

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/incidentresponse
MONGODB_DB_NAME=incidentresponse

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# ML Engine Configuration
ML_ENGINE_URL=http://localhost:8011
RESPONSE_ENGINE_URL=http://localhost:6011

# Alert Sources
SIEM_WEBHOOK_SECRET=your-siem-webhook-secret
ALERT_SOURCES=splunk,sentinel,crowdstrike,paloalto

# Notification Settings
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
PAGERDUTY_API_KEY=your-pagerduty-key
EMAIL_SMTP_HOST=smtp.company.com
SMS_PROVIDER=twilio

# Response Automation
AUTO_CONTAINMENT=true
PLAYBOOK_TIMEOUT=3600
MAX_CONCURRENT_PLAYBOOKS=10

# SLA Configuration
CRITICAL_SLA_MINUTES=15
HIGH_SLA_MINUTES=60
MEDIUM_SLA_MINUTES=240
LOW_SLA_MINUTES=480

# Rate Limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=1000
```

---

## 📚 API Reference

### Base URL

```
Production: https://incidentresponse.maula.ai/api/v1
Development: http://localhost:4011/api/v1
```

### Incidents

#### Create Incident

```http
POST /api/v1/incidentresponse/incidents
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "title": "Ransomware Attack - Production Database",
  "description": "Encryption activity detected on production database server",
  "severity": "critical",
  "type": "malware",
  "affectedSystems": ["db-prod-01", "db-prod-02"],
  "initialFindings": "Multiple .encrypted file extensions observed"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "INC-2024-001",
    "title": "Ransomware Attack - Production Database",
    "severity": "critical",
    "status": "open",
    "createdAt": "2026-01-07T10:00:00Z",
    "slaDeadline": "2026-01-07T10:15:00Z",
    "timeline": [
      {
        "id": "evt_001",
        "timestamp": "2026-01-07T10:00:00Z",
        "type": "status_change",
        "description": "Incident created",
        "automated": true
      }
    ]
  }
}
```

#### Update Incident Status

```http
POST /api/v1/incidentresponse/incidents/{id}/status
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "status": "in-progress",
  "note": "Initial containment measures being applied"
}
```

#### Execute Playbook

```http
POST /api/v1/incidentresponse/playbooks/{playbookId}/execute
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "incidentId": "INC-2024-001",
  "parameters": {
    "isolateNetwork": true,
    "collectMemory": true,
    "notifyStakeholders": ["security-team", "management"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "executionId": "exec_abc123",
    "playbookId": "pb_ransomware_response",
    "status": "running",
    "steps": [
      { "name": "Network Isolation", "status": "completed" },
      { "name": "Memory Collection", "status": "in-progress" },
      { "name": "Malware Identification", "status": "pending" }
    ]
  }
}
```

### Alerts

#### Get Alerts

```http
GET /api/v1/incidentresponse/alerts?severity=critical&status=new
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "alert_001",
        "source": "crowdstrike",
        "type": "malware_execution",
        "severity": "critical",
        "title": "Ransomware Execution Detected",
        "timestamp": "2026-01-07T09:58:00Z",
        "status": "new",
        "metadata": {
          "hostname": "db-prod-01",
          "process": "encrypt.exe",
          "hash": "abc123..."
        }
      }
    ],
    "total": 15
  }
}
```

### Forensics

#### Upload Artifact

```http
POST /api/v1/incidentresponse/forensics/{incidentId}/artifacts
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "artifact_001",
    "name": "memory_dump.raw",
    "type": "memory",
    "size": 4294967296,
    "hash": "sha256:abc123...",
    "collectedAt": "2026-01-07T10:15:00Z",
    "analysis": {
      "status": "pending"
    }
  }
}
```

---

## 🗄️ Database Schema

### Collections Overview

```
incidentresponse_db
├── incidents          # Security incidents
├── alerts             # Alert ingestion
├── timeline_events    # Incident timeline
├── playbooks          # Response playbooks
├── playbook_executions# Playbook runs
├── responders         # Response team
├── artifacts          # Forensic artifacts
├── iocs               # Indicators of compromise
├── users              # User accounts
└── audit_logs         # System audit trail
```

### Incident Schema

```javascript
// incidents collection
{
  _id: ObjectId,
  incidentId: String,       // INC-YYYY-NNN
  
  title: String,
  description: String,
  
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low']
  },
  
  status: {
    type: String,
    enum: ['open', 'investigating', 'in-progress', 'mitigating', 'resolved', 'closed']
  },
  
  type: {
    type: String,
    enum: ['malware', 'intrusion', 'data_breach', 'phishing', 'ddos', 'insider']
  },
  
  assignee: ObjectId,
  team: String,
  
  affectedSystems: [String],
  affectedUsers: [String],
  
  sla: {
    deadline: Date,
    breached: Boolean,
    responseTime: Number,
    containmentTime: Number,
    resolutionTime: Number
  },
  
  metrics: {
    detectionTime: Number,    // seconds
    responseTime: Number,
    containmentTime: Number,
    resolutionTime: Number,
    impactScore: Number       // 0-100
  },
  
  relatedAlerts: [ObjectId],
  relatedIncidents: [ObjectId],
  
  timeline: [{
    timestamp: Date,
    type: String,
    description: String,
    user: ObjectId,
    automated: Boolean,
    metadata: Object
  }],
  
  resolution: {
    summary: String,
    rootCause: String,
    actions: [String],
    lessonsLearned: String,
    resolvedAt: Date,
    resolvedBy: ObjectId
  },
  
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Playbook Schema

```javascript
// playbooks collection
{
  _id: ObjectId,
  playbookId: String,
  
  name: String,
  description: String,
  version: String,
  
  incidentTypes: [String],
  severity: [String],
  
  automationLevel: {
    type: String,
    enum: ['manual', 'semi-auto', 'full-auto']
  },
  
  steps: [{
    id: String,
    order: Number,
    name: String,
    description: String,
    
    action: {
      type: String,     // script, api, manual, notification
      target: String,
      command: String,
      parameters: Object
    },
    
    automated: Boolean,
    required: Boolean,
    timeout: Number,
    
    conditions: [{
      field: String,
      operator: String,
      value: Mixed
    }],
    
    onSuccess: String,  // next step id
    onFailure: String
  }],
  
  notifications: [{
    trigger: String,    // on_start, on_complete, on_failure
    channels: [String],
    template: String
  }],
  
  statistics: {
    executions: Number,
    successRate: Number,
    avgDuration: Number,
    lastUsed: Date
  },
  
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🤖 ML Models

### Model Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                  AI INCIDENT RESPONSE ENGINE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    ALERT PROCESSING                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │   │
│  │  │   Alert     │  │  Severity   │  │   Correlation       │   │   │
│  │  │   Parser    │  │  Classifier │  │   Engine            │   │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘   │   │
│  │         └────────────────┼────────────────────┘               │   │
│  │                          ▼                                    │   │
│  │              ┌─────────────────────────┐                      │   │
│  │              │   Incident Predictor    │                      │   │
│  │              └────────────┬────────────┘                      │   │
│  └───────────────────────────┼──────────────────────────────────┘   │
│                              │                                       │
│  ┌───────────────────────────┼──────────────────────────────────┐   │
│  │                    RESPONSE ENGINE                            │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐  │   │
│  │  │   Playbook      │  │   Impact        │  │  Resolution  │  │   │
│  │  │   Recommender   │  │   Predictor     │  │  Advisor     │  │   │
│  │  └────────┬────────┘  └────────┬────────┘  └──────┬───────┘  │   │
│  └───────────┼────────────────────┼──────────────────┼──────────┘   │
│              │                    │                  │               │
│              ▼                    ▼                  ▼               │
│       ┌──────────────────────────────────────────────────┐          │
│       │   Automated Response + Human-in-the-Loop         │          │
│       └──────────────────────────────────────────────────┘          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Models Overview

| Model | Purpose | Accuracy |
|-------|---------|----------|
| **SeverityClassifier v2** | Alert severity prediction | 94.2% |
| **AlertCorrelator v3** | Related alert grouping | 91.8% |
| **PlaybookRecommender v1** | Optimal playbook selection | 89.5% |
| **ImpactPredictor v2** | Incident impact assessment | 87.3% |
| **ResolutionAdvisor v1** | Resolution suggestions | 85.1% |

---

## 🔒 Security

### Security Features

| Feature | Description |
|---------|-------------|
| **Role-Based Access** | Granular permissions for responders |
| **Audit Logging** | Complete action audit trail |
| **Encrypted Storage** | Sensitive data at rest encryption |
| **Secure Communication** | TLS 1.3 for all connections |
| **MFA Support** | Multi-factor authentication |
| **Session Management** | Secure session handling |

### Compliance Support

| Standard | Coverage |
|----------|----------|
| **SOC 2** | Full incident response controls |
| **NIST CSF** | Response framework alignment |
| **ISO 27001** | Incident management procedures |
| **PCI-DSS** | Requirement 12.10 compliance |

---

## 🚀 Deployment

### Production Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PRODUCTION DEPLOYMENT                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│     ┌─────────────────────────────────────────────────────────┐     │
│     │                    LOAD BALANCER                         │     │
│     │              incidentresponse.maula.ai                   │     │
│     └───────────────────────┬─────────────────────────────────┘     │
│                             │                                        │
│         ┌───────────────────┼───────────────────┐                   │
│         ▼                   ▼                   ▼                   │
│   ┌───────────┐       ┌───────────┐       ┌───────────┐            │
│   │   API     │       │   API     │       │  Response │            │
│   │ Instance 1│       │ Instance 2│       │  Workers  │            │
│   └───────────┘       └───────────┘       └───────────┘            │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────┐       │
│   │                    DATA LAYER                            │       │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │       │
│   │  │ MongoDB  │  │  Redis   │  │  Kafka   │  │ Elastic │ │       │
│   │  │ Replica  │  │ Cluster  │  │ Cluster  │  │ Search  │ │       │
│   │  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │       │
│   └─────────────────────────────────────────────────────────┘       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Performance Benchmarks

| Metric | Value | Target |
|--------|-------|--------|
| **Alert Ingestion** | 10,000/sec | 5,000/sec |
| **Incident Creation** | <100ms | <200ms |
| **Playbook Start** | <500ms | <1s |
| **Timeline Query** | <50ms | <100ms |

---

## 📞 Support

### Contact

- **Documentation**: https://docs.incidentresponse.maula.ai
- **API Status**: https://status.incidentresponse.maula.ai
- **Support Email**: support@maula.ai
- **Security Issues**: security@maula.ai

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by the VictoryKit Team**

*Respond faster. Resolve smarter.*

![IncidentResponse](https://img.shields.io/badge/IncidentResponse-AI%20Incident%20Response-f43f5e?style=for-the-badge)

</div>
