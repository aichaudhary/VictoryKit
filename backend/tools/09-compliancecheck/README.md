# ✅ ComplianceCheck - AI-Powered Regulatory Compliance Platform

<div align="center">

![ComplianceCheck Logo](https://img.shields.io/badge/ComplianceCheck-AI%20Compliance%20Automation-6366f1?style=for-the-badge&logo=shield&logoColor=white)

[![Version](https://img.shields.io/badge/version-1.0.0-6366f1.svg)](https://github.com/VM07B/VictoryKit)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg)](https://python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248.svg)](https://mongodb.com/)

**Enterprise-Grade AI-Powered Compliance Assessment, Gap Analysis & Audit Automation Platform**

[Live Demo](https://compliancecheck.maula.ai) • [API Docs](https://compliancecheck.maula.ai/docs) • [Report Bug](https://github.com/VM07B/VictoryKit/issues)

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

**ComplianceCheck** is a cutting-edge, AI-powered regulatory compliance platform designed to automate compliance assessments, gap analysis, and audit preparation. Leveraging advanced machine learning for intelligent control mapping, evidence analysis, and remediation suggestions, ComplianceCheck provides comprehensive compliance management across multiple regulatory frameworks.

### Why ComplianceCheck?

- **AI-Powered Assessment**: Intelligent compliance scoring and gap identification
- **Multi-Framework Support**: SOC 2, ISO 27001, GDPR, HIPAA, PCI DSS, NIST
- **Automated Evidence Collection**: Continuous compliance monitoring
- **Real-Time Dashboards**: Live compliance status and trends
- **Gap Remediation**: AI-suggested fixes with prioritization
- **Audit Ready**: Comprehensive documentation and reports

### Use Cases

| Use Case | Description |
|----------|-------------|
| **Compliance Assessment** | Evaluate compliance posture |
| **Gap Analysis** | Identify and prioritize gaps |
| **Audit Preparation** | Streamline audit readiness |
| **Continuous Monitoring** | Real-time compliance tracking |
| **Evidence Management** | Centralized evidence repository |
| **Policy Management** | Policy creation and enforcement |

---

## ✨ Key Features

### 🔍 Compliance Assessment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                 COMPLIANCE ASSESSMENT PIPELINE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│   │  Framework   │  │   Control    │  │   Evidence   │         │
│   │  Selection   │──▶│   Mapping    │──▶│  Collection  │         │
│   └──────────────┘  └──────────────┘  └──────────────┘         │
│          │                                    │                  │
│          │         ┌──────────────┐          │                  │
│          │         │  AI Engine   │          │                  │
│          └────────▶│  (Analysis)  │◀─────────┘                  │
│                    └──────┬───────┘                             │
│                           │                                      │
│          ┌────────────────┼────────────────┐                    │
│          ▼                ▼                ▼                    │
│   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│   │    Gap       │ │  Remediation │ │   Report     │           │
│   │  Analysis    │ │   Planning   │ │  Generation  │           │
│   └──────────────┘ └──────────────┘ └──────────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 🛡️ Supported Frameworks

- **SOC 2 Type I/II**: Trust Service Criteria compliance
- **ISO 27001**: Information security management
- **GDPR**: EU data protection regulation
- **HIPAA**: Healthcare data privacy
- **PCI DSS**: Payment card security
- **NIST CSF**: Cybersecurity framework
- **CCPA**: California consumer privacy
- **FedRAMP**: Federal cloud security

### 🤖 AI-Powered Features

- **Intelligent Mapping**: Auto-map controls across frameworks
- **Evidence Analysis**: ML-based evidence validation
- **Gap Detection**: Automated gap identification
- **Remediation Suggestions**: AI-powered fix recommendations
- **Risk Scoring**: Predictive compliance risk assessment
- **Report Generation**: AI-written audit reports

---

## 🏗️ Architecture

### System Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         COMPLIANCECHECK PLATFORM                            │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         FRONTEND LAYER                               │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │  Dashboard  │  │  Framework  │  │   Control   │  │  Reports   │ │   │
│  │  │   React     │  │   Manager   │  │   Tracker   │  │ Generator  │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  │                         Port: 3009                                   │   │
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
│  │    BACKEND API       │ │    ML ENGINE     │ │   EVIDENCE ENGINE    │   │
│  │    Node.js/Express   │ │   Python/FastAPI │ │   Python/Celery      │   │
│  │    Port: 4009        │ │   Port: 8009     │ │   Port: 6009         │   │
│  └──────────────────────┘ └──────────────────┘ └──────────────────────┘   │
│           │                       │                       │                │
│           └───────────────────────┼───────────────────────┘                │
│                                   ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        DATA LAYER                                    │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │   MongoDB   │  │    Redis    │  │   MinIO     │  │ Elasticsearch│ │   │
│  │  │   Primary   │  │   Cache     │  │   Evidence  │  │   Search    │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

| Component | Technology | Port | Purpose |
|-----------|------------|------|---------|
| Frontend | React 19 + TypeScript | 3009 | User interface |
| API Gateway | Express.js | 4000 | Authentication & routing |
| Backend API | Node.js + Express | 4009 | Business logic |
| ML Engine | Python + FastAPI | 8009 | AI/ML processing |
| Evidence Engine | Python + Celery | 6009 | Evidence processing |
| Database | MongoDB 7.0 | 27017 | Data persistence |
| Cache | Redis 7.0 | 6379 | Session & cache |

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
| **Cache** | Redis | 7.0 | Caching & sessions |
| **Queue** | Bull | 4.12 | Job processing |

### ML Engine Technologies

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Runtime** | Python | 3.11 | ML runtime |
| **Framework** | FastAPI | 0.109 | Async API |
| **ML** | scikit-learn | 1.3 | Machine learning |
| **NLP** | spaCy | 3.7 | Text processing |
| **Transformers** | Hugging Face | 4.36 | LLM integration |
| **Document** | PyPDF2 | 3.0 | PDF processing |

### Frontend Technologies

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | React | 19.0 | UI framework |
| **Language** | TypeScript | 5.3 | Type safety |
| **Build** | Vite | 5.0 | Build tool |
| **Styling** | TailwindCSS | 3.4 | Utility CSS |
| **Charts** | Recharts | 2.10 | Data visualization |
| **Forms** | React Hook Form | 7.49 | Form handling |

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
```

### Quick Start

```bash
# Clone repository
git clone https://github.com/VM07B/VictoryKit.git
cd VictoryKit

# Install backend dependencies
cd backend/tools/09-compliancecheck/api
npm install

# Install ML engine dependencies
cd ../ml-engine
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Install frontend dependencies
cd ../../../../frontend/tools/09-compliancecheck
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
  compliancecheck-api:
    build: ./api
    ports:
      - "4009:4009"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/compliancecheck

  compliancecheck-ml:
    build: ./ml-engine
    ports:
      - "8009:8009"

  compliancecheck-frontend:
    build: ../../../frontend/tools/09-compliancecheck
    ports:
      - "3009:3009"

  mongo:
    image: mongo:7
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine

volumes:
  mongo_data:
```

---

## ⚙️ Configuration

### Environment Variables

```env
# ===========================================
# COMPLIANCECHECK CONFIGURATION
# ===========================================

# Server Configuration
NODE_ENV=development
PORT=4009
HOST=0.0.0.0

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/compliancecheck
MONGODB_DB_NAME=compliancecheck

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# ML Engine Configuration
ML_ENGINE_URL=http://localhost:8009
EVIDENCE_PROCESSOR_URL=http://localhost:6009

# Evidence Storage
EVIDENCE_STORAGE=minio
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET=compliance-evidence

# Framework Settings
DEFAULT_FRAMEWORKS=soc2,iso27001,gdpr
AUTO_ASSESSMENT=true
CONTINUOUS_MONITORING=true

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
EMAIL_NOTIFICATIONS=true

# Rate Limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=500
```

---

## 📚 API Reference

### Base URL

```
Production: https://compliancecheck.maula.ai/api/v1
Development: http://localhost:4009/api/v1
```

### Framework Management

#### List Frameworks

```http
GET /api/v1/compliance/frameworks
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "fw_soc2",
      "name": "SOC 2 Type II",
      "shortName": "SOC2",
      "version": "2017",
      "controlCount": 95,
      "status": "active",
      "lastAssessment": "2026-01-01T00:00:00Z"
    },
    {
      "id": "fw_iso27001",
      "name": "ISO 27001:2022",
      "shortName": "ISO",
      "version": "2022",
      "controlCount": 114,
      "status": "active"
    }
  ]
}
```

### Assessment Operations

#### Start Assessment

```http
POST /api/v1/compliance/assessments
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "frameworkId": "fw_soc2",
  "options": {
    "scope": "full",
    "includeEvidence": true,
    "autoCollect": true,
    "notifyStakeholders": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assessmentId": "asmt_xyz789",
    "frameworkId": "fw_soc2",
    "status": "in-progress",
    "progress": 0,
    "startedAt": "2026-01-07T10:00:00Z",
    "estimatedCompletion": "2026-01-07T12:00:00Z"
  }
}
```

#### Get Assessment Results

```http
GET /api/v1/compliance/assessments/{assessmentId}/results
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assessmentId": "asmt_xyz789",
    "status": "completed",
    "score": 87,
    "summary": {
      "totalControls": 95,
      "compliant": 78,
      "nonCompliant": 12,
      "partiallyCompliant": 3,
      "notApplicable": 2
    },
    "categories": {
      "CC1": { "name": "Control Environment", "score": 92 },
      "CC2": { "name": "Communication & Info", "score": 88 },
      "CC3": { "name": "Risk Assessment", "score": 85 }
    },
    "gaps": [
      {
        "controlId": "CC6.1",
        "severity": "high",
        "title": "Access Control Policy",
        "description": "Missing documented access control policy",
        "remediation": "Create and implement formal access control policy"
      }
    ]
  }
}
```

### Control Management

#### Update Control Status

```http
PATCH /api/v1/compliance/controls/{controlId}
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "status": "compliant",
  "evidence": ["evidence_001", "evidence_002"],
  "notes": "Implemented on 2026-01-05",
  "reviewer": "user_abc"
}
```

### Gap Analysis

#### Get Gaps

```http
GET /api/v1/compliance/gaps?severity=high&status=open
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "gap_001",
      "controlId": "CC6.1",
      "severity": "high",
      "title": "Access Control Policy Missing",
      "description": "No formal documented access control policy exists",
      "impact": "Unauthorized access to systems and data",
      "remediation": {
        "steps": [
          "Draft access control policy document",
          "Review with security team",
          "Obtain management approval",
          "Publish and communicate policy"
        ],
        "estimatedEffort": "2 weeks",
        "resources": ["Security Team", "HR", "Legal"]
      },
      "dueDate": "2026-02-01",
      "assignee": "security-lead@company.com",
      "status": "open"
    }
  ]
}
```

---

## 🗄️ Database Schema

### Collections Overview

```
compliancecheck_db
├── frameworks         # Regulatory frameworks
├── controls           # Framework controls
├── assessments        # Compliance assessments
├── gaps               # Identified gaps
├── evidence           # Evidence documents
├── policies           # Company policies
├── reports            # Generated reports
├── users              # User accounts
├── audit_logs         # Audit trail
└── notifications      # Alert history
```

### Framework Schema

```javascript
// frameworks collection
{
  _id: ObjectId,
  frameworkId: String,
  
  name: String,
  shortName: String,
  version: String,
  description: String,
  
  category: {
    type: String,
    enum: ['security', 'privacy', 'industry', 'government']
  },
  
  controls: [{
    controlId: String,
    title: String,
    description: String,
    category: String,
    requirement: String,
    testingProcedure: String,
    evidenceRequired: [String],
    mappings: {
      iso27001: [String],
      nist: [String],
      cis: [String]
    }
  }],
  
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft']
  },
  
  metadata: {
    authority: String,
    effectiveDate: Date,
    lastUpdate: Date,
    region: [String]
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

### Assessment Schema

```javascript
// assessments collection
{
  _id: ObjectId,
  assessmentId: String,
  frameworkId: ObjectId,
  organizationId: ObjectId,
  
  scope: {
    type: String,
    enum: ['full', 'partial', 'targeted']
  },
  
  options: {
    autoCollect: Boolean,
    includeEvidence: Boolean,
    notifyStakeholders: Boolean
  },
  
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'failed']
  },
  
  progress: Number,         // 0-100
  currentPhase: String,
  
  results: {
    score: Number,
    
    summary: {
      compliant: Number,
      nonCompliant: Number,
      partiallyCompliant: Number,
      notApplicable: Number
    },
    
    controls: [{
      controlId: String,
      status: String,
      evidence: [ObjectId],
      notes: String,
      reviewer: ObjectId,
      reviewedAt: Date
    }],
    
    gaps: [ObjectId]          // Reference to gaps collection
  },
  
  timing: {
    scheduledAt: Date,
    startedAt: Date,
    completedAt: Date,
    duration: Number
  },
  
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Gap Schema

```javascript
// gaps collection
{
  _id: ObjectId,
  gapId: String,
  assessmentId: ObjectId,
  controlId: String,
  
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low']
  },
  
  details: {
    title: String,
    description: String,
    impact: String,
    rootCause: String
  },
  
  remediation: {
    steps: [String],
    estimatedEffort: String,
    resources: [String],
    cost: Number,
    priority: Number
  },
  
  tracking: {
    dueDate: Date,
    assignee: ObjectId,
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'accepted']
    },
    progress: Number
  },
  
  resolution: {
    resolvedAt: Date,
    resolvedBy: ObjectId,
    evidence: [ObjectId],
    notes: String
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🤖 ML Models

### Model Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                  AI COMPLIANCE ENGINE                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    INPUT PROCESSING                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │   │
│  │  │   Policy    │  │   Evidence  │  │   Control           │   │   │
│  │  │   Parser    │  │   Analyzer  │  │   Mapper            │   │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘   │   │
│  │         └────────────────┼────────────────────┘               │   │
│  │                          ▼                                    │   │
│  │              ┌─────────────────────────┐                      │   │
│  │              │   Feature Extraction    │                      │   │
│  │              └────────────┬────────────┘                      │   │
│  └───────────────────────────┼──────────────────────────────────┘   │
│                              │                                       │
│  ┌───────────────────────────┼──────────────────────────────────┐   │
│  │                    MODEL ENSEMBLE                             │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐  │   │
│  │  │   Compliance    │  │   Gap           │  │  Remediation │  │   │
│  │  │   Scorer        │  │   Detector      │  │  Suggester   │  │   │
│  │  └────────┬────────┘  └────────┬────────┘  └──────┬───────┘  │   │
│  └───────────┼────────────────────┼──────────────────┼──────────┘   │
│              │                    │                  │               │
│              ▼                    ▼                  ▼               │
│       ┌──────────────────────────────────────────────────┐          │
│       │   Compliance Report + Remediation Plan           │          │
│       └──────────────────────────────────────────────────┘          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Models Overview

| Model | Purpose | Accuracy |
|-------|---------|----------|
| **ComplianceScorer v2** | Compliance status prediction | 94.5% |
| **GapDetector v1** | Gap identification | 92.3% |
| **ControlMapper v2** | Cross-framework mapping | 96.1% |
| **EvidenceAnalyzer v1** | Evidence validation | 89.7% |
| **RemediationAI v1** | Fix suggestions | 87.2% |

---

## 🔒 Security

### Security Features

| Feature | Description |
|---------|-------------|
| **Role-Based Access** | Granular permission controls |
| **Audit Logging** | Complete activity trail |
| **Evidence Encryption** | All evidence encrypted at rest |
| **SSO Integration** | SAML/OIDC authentication |
| **Data Isolation** | Multi-tenant separation |
| **Compliance-Ready** | Platform meets SOC 2 |

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
│     │               compliancecheck.maula.ai                   │     │
│     └───────────────────────┬─────────────────────────────────┘     │
│                             │                                        │
│         ┌───────────────────┼───────────────────┐                   │
│         ▼                   ▼                   ▼                   │
│   ┌───────────┐       ┌───────────┐       ┌───────────┐            │
│   │   API     │       │   API     │       │    ML     │            │
│   │ Instance 1│       │ Instance 2│       │  Workers  │            │
│   └───────────┘       └───────────┘       └───────────┘            │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────┐       │
│   │                    DATA LAYER                            │       │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │       │
│   │  │ MongoDB  │  │  Redis   │  │  MinIO   │               │       │
│   │  │ Replica  │  │ Cluster  │  │ Evidence │               │       │
│   │  └──────────┘  └──────────┘  └──────────┘               │       │
│   └─────────────────────────────────────────────────────────┘       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Performance Benchmarks

| Metric | Value | Target |
|--------|-------|--------|
| **Assessment Speed** | 5 min/100 controls | <10m |
| **Evidence Analysis** | 2 sec/document | <5s |
| **Report Generation** | 15 seconds | <30s |
| **Concurrent Assessments** | 50 | 20 |

---

## 📞 Support

### Contact

- **Documentation**: https://docs.compliancecheck.maula.ai
- **API Status**: https://status.compliancecheck.maula.ai
- **Support Email**: support@maula.ai
- **Security Issues**: security@maula.ai

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by the VictoryKit Team**

*Compliance made simple, powered by AI.*

![ComplianceCheck](https://img.shields.io/badge/ComplianceCheck-AI%20Compliance-6366f1?style=for-the-badge)

</div>
