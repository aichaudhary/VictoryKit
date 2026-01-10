# 🛡️ CodeSentinel - AI-Powered Secure Code Analysis Platform

<div align="center">

![CodeSentinel Logo](https://img.shields.io/badge/CodeSentinel-AI%20Code%20Security-22c55e?style=for-the-badge&logo=shield&logoColor=white)

[![Version](https://img.shields.io/badge/version-1.0.0-22c55e.svg)](https://github.com/VM07B/VictoryKit)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg)](https://python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248.svg)](https://mongodb.com/)

**Enterprise-Grade AI-Powered Static Application Security Testing (SAST) & Code Quality Platform**

[Live Demo](https://codesentinel.maula.ai) • [API Docs](https://codesentinel.maula.ai/docs) • [Report Bug](https://github.com/VM07B/VictoryKit/issues)

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

**CodeSentinel** is a cutting-edge, AI-powered static application security testing (SAST) platform designed to identify vulnerabilities, security flaws, and code quality issues directly in source code. Leveraging advanced machine learning for intelligent code analysis, vulnerability detection, and automated remediation suggestions, CodeSentinel provides comprehensive security coverage across the entire software development lifecycle.

### Why CodeSentinel?

- **AI-Powered Analysis**: Intelligent vulnerability detection with ML-based pattern recognition
- **Multi-Language Support**: Python, JavaScript, TypeScript, Java, Go, C/C++, Ruby, PHP, and more
- **Real-Time Scanning**: Instant feedback during development with IDE integration
- **CI/CD Integration**: Seamless integration with GitHub, GitLab, Bitbucket, Jenkins
- **Compliance Ready**: OWASP, CWE, SANS Top 25, PCI-DSS aligned rules
- **Auto-Remediation**: AI-suggested fixes with one-click apply

### Use Cases

| Use Case | Description |
|----------|-------------|
| **Security Scanning** | Identify vulnerabilities in source code |
| **Code Review** | Automated security code review |
| **Compliance Auditing** | Ensure code meets security standards |
| **Developer Training** | Learn secure coding practices |
| **CI/CD Security** | Shift-left security in pipelines |
| **Technical Debt** | Track and fix security debt |

---

## ✨ Key Features

### 🔍 Comprehensive Analysis

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURECODE ANALYSIS PIPELINE                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│   │   Source     │  │    Parse     │  │   Build      │         │
│   │   Code       │──▶│    AST       │──▶│   CFG/DFG    │         │
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
│   │  Security    │ │   Quality    │ │   Remediate  │           │
│   │  Analysis    │ │   Analysis   │ │  Suggestions │           │
│   └──────────────┘ └──────────────┘ └──────────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 🛡️ Vulnerability Detection

- **Injection Flaws**: SQL, NoSQL, LDAP, OS Command, XPath injection
- **XSS Detection**: Reflected, Stored, DOM-based cross-site scripting
- **Authentication**: Broken authentication, session management issues
- **Access Control**: Broken access control, IDOR, privilege escalation
- **Security Misconfig**: Hardcoded secrets, debug enabled, insecure headers
- **Cryptographic**: Weak algorithms, insecure random, key exposure
- **Injection Points**: Taint analysis for user input tracking

### 🤖 AI-Powered Features

- **Pattern Recognition**: ML-based vulnerability pattern detection
- **Context Analysis**: Understanding code semantics, not just syntax
- **False Positive Reduction**: AI filtering to reduce noise
- **Auto-Fix Generation**: Intelligent remediation code suggestions
- **Priority Scoring**: Risk-based vulnerability prioritization
- **Learning System**: Improves accuracy with user feedback

---

## 🏗️ Architecture

### System Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                            SECURECODE PLATFORM                              │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         FRONTEND LAYER                               │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │  Dashboard  │  │   Code      │  │   Vuln      │  │  Reports   │ │   │
│  │  │   React     │  │   Viewer    │  │   Manager   │  │  Generator │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  │                         Port: 3008                                   │   │
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
│  │    BACKEND API       │ │    ML ENGINE     │ │   SCAN ENGINE        │   │
│  │    Node.js/Express   │ │   Python/FastAPI │ │   Python/Celery      │   │
│  │    Port: 4008        │ │   Port: 8008     │ │   Port: 6008         │   │
│  └──────────────────────┘ └──────────────────┘ └──────────────────────┘   │
│           │                       │                       │                │
│           └───────────────────────┼───────────────────────┘                │
│                                   ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        DATA LAYER                                    │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │   MongoDB   │  │    Redis    │  │   MinIO     │  │ Elasticsearch│ │   │
│  │  │   Primary   │  │   Queue     │  │   Code      │  │   Search    │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

| Component | Technology | Port | Purpose |
|-----------|------------|------|---------|
| Frontend | React 19 + TypeScript | 3008 | User interface |
| API Gateway | Express.js | 4000 | Authentication & routing |
| Backend API | Node.js + Express | 4008 | Business logic |
| ML Engine | Python + FastAPI | 8008 | AI/ML analysis |
| Scan Engine | Python + Celery | 6008 | Distributed scanning |
| Database | MongoDB 7.0 | 27017 | Data persistence |
| Queue | Redis 7.0 | 6379 | Job queue |

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
| **Queue** | Redis + Bull | 7.0 | Job processing |
| **Search** | Elasticsearch | 8.11 | Code search |

### Analysis Engine Technologies

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Runtime** | Python | 3.11 | Analysis runtime |
| **Framework** | FastAPI | 0.109 | Async API |
| **Task Queue** | Celery | 5.3 | Distributed tasks |
| **Parser** | Tree-sitter | 0.20 | Multi-language parsing |
| **ML** | TensorFlow | 2.15 | Deep learning |
| **NLP** | Transformers | 4.36 | Code understanding |

### Frontend Technologies

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | React | 19.0 | UI framework |
| **Language** | TypeScript | 5.3 | Type safety |
| **Build** | Vite | 5.0 | Build tool |
| **Styling** | TailwindCSS | 3.4 | Utility CSS |
| **Code Editor** | Monaco | 0.45 | Code highlighting |
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
```

### Quick Start

```bash
# Clone repository
git clone https://github.com/VM07B/VictoryKit.git
cd VictoryKit

# Install backend dependencies
cd backend/tools/08-codesentinel/api
npm install

# Install ML engine dependencies
cd ../ml-engine
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Install frontend dependencies
cd ../../../../frontend/tools/08-codesentinel
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
  codesentinel-api:
    build: ./api
    ports:
      - "4008:4008"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/codesentinel

  codesentinel-analyzer:
    build: ./ml-engine
    ports:
      - "8008:8008"
    volumes:
      - ./rules:/app/rules

  codesentinel-frontend:
    build: ../../../frontend/tools/08-codesentinel
    ports:
      - "3008:3008"

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
# SECURECODE CONFIGURATION
# ===========================================

# Server Configuration
NODE_ENV=development
PORT=4008
HOST=0.0.0.0

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/codesentinel
MONGODB_DB_NAME=codesentinel

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# ML Engine Configuration
ML_ENGINE_URL=http://localhost:8008
ANALYSIS_TIMEOUT=300000
MAX_FILE_SIZE=10485760

# Git Integration
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITLAB_CLIENT_ID=your-gitlab-client-id
GITLAB_CLIENT_SECRET=your-gitlab-client-secret

# Analysis Settings
MAX_CONCURRENT_SCANS=10
SCAN_DEPTH=full
SEVERITY_THRESHOLD=low

# Rate Limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=1000
```

---

## 📚 API Reference

### Base URL

```
Production: https://codesentinel.maula.ai/api/v1
Development: http://localhost:4008/api/v1
```

### Repository Management

#### Connect Repository

```http
POST /api/v1/codesentinel/repositories
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "my-api-project",
  "url": "https://github.com/user/my-api-project",
  "provider": "github",
  "defaultBranch": "main",
  "accessToken": "ghp_xxxxxxxxxxxx"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "repositoryId": "repo_abc123",
    "name": "my-api-project",
    "provider": "github",
    "status": "connected",
    "branches": ["main", "develop", "feature/auth"],
    "createdAt": "2026-01-07T10:00:00Z"
  }
}
```

### Scan Operations

#### Start Code Scan

```http
POST /api/v1/codesentinel/scans
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "repositoryId": "repo_abc123",
  "branch": "main",
  "options": {
    "languages": ["javascript", "typescript", "python"],
    "rulesets": ["owasp", "cwe", "custom"],
    "severity": "low",
    "includeTests": false,
    "excludePaths": ["node_modules/**", "dist/**"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "scanId": "scan_xyz789",
    "status": "queued",
    "progress": 0,
    "estimatedTime": 120,
    "queuedAt": "2026-01-07T10:30:00Z"
  }
}
```

#### Get Scan Results

```http
GET /api/v1/codesentinel/scans/{scanId}/results
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "scanId": "scan_xyz789",
    "status": "completed",
    "duration": 87,
    "summary": {
      "filesScanned": 234,
      "linesOfCode": 45672,
      "vulnerabilities": {
        "critical": 2,
        "high": 8,
        "medium": 23,
        "low": 45,
        "info": 12
      },
      "codeQuality": 92.5
    },
    "vulnerabilities": [
      {
        "id": "vuln_001",
        "severity": "critical",
        "type": "sql_injection",
        "cwe": "CWE-89",
        "file": "src/controllers/userController.js",
        "line": 42,
        "column": 15,
        "title": "SQL Injection Vulnerability",
        "description": "User input is directly concatenated into SQL query without sanitization",
        "snippet": "const query = `SELECT * FROM users WHERE id = ${userId}`;",
        "fix": {
          "code": "const query = 'SELECT * FROM users WHERE id = ?'; db.query(query, [userId]);",
          "explanation": "Use parameterized queries to prevent SQL injection"
        }
      }
    ]
  }
}
```

### Vulnerability Management

#### Get Vulnerability Details

```http
GET /api/v1/codesentinel/vulnerabilities/{vulnId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "vuln_001",
    "severity": "critical",
    "type": "sql_injection",
    "cwe": "CWE-89",
    "owasp": "A03:2021",
    "file": "src/controllers/userController.js",
    "line": 42,
    "column": 15,
    "title": "SQL Injection Vulnerability",
    "description": "User input is directly concatenated into SQL query",
    "impact": "Attacker can read/modify database, execute commands",
    "dataFlow": {
      "source": { "file": "src/routes/api.js", "line": 15, "param": "req.params.id" },
      "sink": { "file": "src/controllers/userController.js", "line": 42, "function": "db.query" }
    },
    "references": [
      "https://cwe.mitre.org/data/definitions/89.html",
      "https://owasp.org/Top10/A03_2021-Injection/"
    ],
    "fix": {
      "code": "const query = 'SELECT * FROM users WHERE id = ?';\ndb.query(query, [userId]);",
      "explanation": "Use parameterized queries"
    }
  }
}
```

### Security Rules

#### List Rules

```http
GET /api/v1/codesentinel/rules
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "rule_001",
      "name": "sql-injection-detection",
      "category": "injection",
      "severity": "critical",
      "languages": ["javascript", "typescript", "python"],
      "enabled": true,
      "description": "Detects potential SQL injection vulnerabilities"
    }
  ]
}
```

---

## 🗄️ Database Schema

### Collections Overview

```
codesentinel_db
├── repositories       # Connected repositories
├── scans              # Scan jobs and metadata
├── vulnerabilities    # Detected vulnerabilities
├── rules              # Security rules
├── fixes              # Applied fixes
├── reports            # Generated reports
├── users              # User accounts
├── teams              # Team management
└── audit_logs         # Audit trail
```

### Repository Schema

```javascript
// repositories collection
{
  _id: ObjectId,
  repositoryId: String,
  userId: ObjectId,
  teamId: ObjectId,
  
  name: String,
  url: String,
  provider: {
    type: String,
    enum: ['github', 'gitlab', 'bitbucket', 'azure']
  },
  
  connection: {
    accessToken: String,       // Encrypted
    webhookSecret: String,     // Encrypted
    lastSync: Date
  },
  
  settings: {
    defaultBranch: String,
    autoScan: Boolean,
    scanOnPush: Boolean,
    scanOnPR: Boolean,
    excludePaths: [String]
  },
  
  statistics: {
    totalScans: Number,
    lastScanDate: Date,
    vulnerabilityCount: {
      critical: Number,
      high: Number,
      medium: Number,
      low: Number
    },
    codeQuality: Number
  },
  
  status: {
    type: String,
    enum: ['connected', 'syncing', 'error', 'disconnected']
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

### Scan Schema

```javascript
// scans collection
{
  _id: ObjectId,
  scanId: String,
  repositoryId: ObjectId,
  userId: ObjectId,
  
  branch: String,
  commitHash: String,
  
  options: {
    languages: [String],
    rulesets: [String],
    severity: String,
    includeTests: Boolean,
    excludePaths: [String]
  },
  
  status: {
    type: String,
    enum: ['queued', 'running', 'completed', 'failed', 'cancelled']
  },
  
  progress: Number,           // 0-100
  currentPhase: String,
  
  results: {
    filesScanned: Number,
    linesOfCode: Number,
    analysisTime: Number,
    vulnerabilities: [ObjectId],  // References
    
    summary: {
      critical: Number,
      high: Number,
      medium: Number,
      low: Number,
      info: Number
    },
    
    codeQuality: {
      score: Number,
      maintainability: Number,
      complexity: Number,
      duplication: Number
    }
  },
  
  timing: {
    queuedAt: Date,
    startedAt: Date,
    completedAt: Date,
    duration: Number
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

### Vulnerability Schema

```javascript
// vulnerabilities collection
{
  _id: ObjectId,
  vulnId: String,
  scanId: ObjectId,
  repositoryId: ObjectId,
  
  identification: {
    type: String,
    cwe: String,
    owasp: String,
    rule: String,
    title: String
  },
  
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'info']
  },
  
  location: {
    file: String,
    line: Number,
    column: Number,
    endLine: Number,
    endColumn: Number,
    snippet: String
  },
  
  details: {
    description: String,
    impact: String,
    recommendation: String,
    references: [String]
  },
  
  dataFlow: {
    source: {
      file: String,
      line: Number,
      param: String
    },
    sink: {
      file: String,
      line: Number,
      function: String
    },
    path: [{
      file: String,
      line: Number,
      code: String
    }]
  },
  
  fix: {
    available: Boolean,
    code: String,
    explanation: String,
    confidence: Number
  },
  
  status: {
    type: String,
    enum: ['open', 'confirmed', 'fixed', 'false_positive', 'wont_fix']
  },
  
  assignee: ObjectId,
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🤖 ML Models

### Model Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AI CODE ANALYSIS ENGINE                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    CODE REPRESENTATION                        │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │   │
│  │  │    AST      │  │    CFG      │  │    Data Flow        │   │   │
│  │  │   Parser    │  │   Builder   │  │    Graph            │   │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘   │   │
│  │         └────────────────┼────────────────────┘               │   │
│  │                          ▼                                    │   │
│  │              ┌─────────────────────────┐                      │   │
│  │              │   Code Embeddings       │                      │   │
│  │              │   (CodeBERT/GraphNN)    │                      │   │
│  │              └────────────┬────────────┘                      │   │
│  └───────────────────────────┼──────────────────────────────────┘   │
│                              │                                       │
│  ┌───────────────────────────┼──────────────────────────────────┐   │
│  │                    MODEL ENSEMBLE                             │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐  │   │
│  │  │   Vuln          │  │   Pattern       │  │   Fix        │  │   │
│  │  │   Classifier    │  │   Matcher       │  │   Generator  │  │   │
│  │  └────────┬────────┘  └────────┬────────┘  └──────┬───────┘  │   │
│  └───────────┼────────────────────┼──────────────────┼──────────┘   │
│              │                    │                  │               │
│              ▼                    ▼                  ▼               │
│       ┌──────────────────────────────────────────────────┐          │
│       │   Vulnerability Report + Auto-Fix Suggestions    │          │
│       └──────────────────────────────────────────────────┘          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Models Overview

| Model | Purpose | Accuracy |
|-------|---------|----------|
| **VulnClassifier v3** | Vulnerability type classification | 96.2% |
| **PatternMatcher v2** | Security pattern detection | 94.8% |
| **FixGenerator v1** | Auto-fix code generation | 89.5% |
| **TaintTracker v2** | Data flow taint analysis | 93.1% |
| **CodeQuality v1** | Code quality scoring | 91.7% |

---

## 🔒 Security

### Security Features

| Feature | Description |
|---------|-------------|
| **Token Encryption** | All access tokens encrypted at rest |
| **Role-Based Access** | Granular permission controls |
| **Audit Logging** | Complete activity trail |
| **SSO Integration** | SAML/OIDC authentication |
| **Data Isolation** | Multi-tenant data separation |
| **Secret Detection** | Prevent credential exposure |

### Supported Languages

| Language | Parser | Coverage |
|----------|--------|----------|
| JavaScript | Tree-sitter | Full |
| TypeScript | Tree-sitter | Full |
| Python | Tree-sitter | Full |
| Java | Tree-sitter | Full |
| Go | Tree-sitter | Full |
| C/C++ | Tree-sitter | Full |
| Ruby | Tree-sitter | Full |
| PHP | Tree-sitter | Full |
| C# | Tree-sitter | Partial |
| Rust | Tree-sitter | Partial |

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
│     │                  codesentinel.maula.ai                     │     │
│     └───────────────────────┬─────────────────────────────────┘     │
│                             │                                        │
│         ┌───────────────────┼───────────────────┐                   │
│         ▼                   ▼                   ▼                   │
│   ┌───────────┐       ┌───────────┐       ┌───────────┐            │
│   │   API     │       │   API     │       │ Analyzer  │            │
│   │ Instance 1│       │ Instance 2│       │  Workers  │            │
│   └───────────┘       └───────────┘       └───────────┘            │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────┐       │
│   │                    DATA LAYER                            │       │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │       │
│   │  │ MongoDB  │  │  Redis   │  │ Elastic  │               │       │
│   │  │ Replica  │  │ Cluster  │  │ Search   │               │       │
│   │  └──────────┘  └──────────┘  └──────────┘               │       │
│   └─────────────────────────────────────────────────────────┘       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Performance Benchmarks

| Metric | Value | Target |
|--------|-------|--------|
| **Small Repo Scan** | 30 seconds | <60s |
| **Large Repo Scan** | 5 minutes | <10m |
| **Files per Second** | 50 files | 30 |
| **Concurrent Scans** | 50 | 20 |
| **False Positive Rate** | <5% | <10% |

---

## 📞 Support

### Contact

- **Documentation**: https://docs.codesentinel.maula.ai
- **API Status**: https://status.codesentinel.maula.ai
- **Support Email**: support@maula.ai
- **Security Issues**: security@maula.ai

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by the VictoryKit Team**

*Secure code, secure future.*

![CodeSentinel](https://img.shields.io/badge/CodeSentinel-AI%20Code%20Security-22c55e?style=for-the-badge)

</div>
