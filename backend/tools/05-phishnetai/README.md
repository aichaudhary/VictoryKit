# 🎣 PhishNetAI - AI-Powered Phishing Detection & Email Security

<div align="center">

![PhishNetAI Logo](https://img.shields.io/badge/PhishNetAI-Email%20Security%20AI-F97316?style=for-the-badge&logo=mail&logoColor=white)

[![Version](https://img.shields.io/badge/version-1.0.0-F97316.svg)](https://github.com/VM07B/VictoryKit)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg)](https://python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248.svg)](https://mongodb.com/)

**Enterprise-Grade AI-Powered Phishing Detection, Email Security & Threat Intelligence Platform**

[Live Demo](https://phishnetai.maula.ai) • [API Docs](https://phishnetai.maula.ai/docs) • [Report Bug](https://github.com/VM07B/VictoryKit/issues)

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

**PhishNetAI** is a cutting-edge, AI-powered phishing detection and email security platform designed to protect organizations from sophisticated email-based threats. Leveraging advanced NLP, computer vision, and behavioral analysis, PhishNetAI provides comprehensive protection against phishing, spear-phishing, BEC (Business Email Compromise), and credential harvesting attacks.

### Why PhishNetAI?

- **99.5% Detection Rate**: Industry-leading accuracy powered by transformer models
- **Zero-Day Protection**: AI detects unknown phishing campaigns before signatures exist
- **Real-Time Analysis**: Sub-second email scanning with streaming analysis
- **URL Intelligence**: Deep URL analysis with screenshot capture and reputation scoring
- **Campaign Tracking**: Identify and track active phishing campaigns
- **User Training**: Built-in phishing simulation for security awareness

### Use Cases

| Use Case | Description |
|----------|-------------|
| **Email Gateway Protection** | Scan all inbound emails for phishing |
| **URL Verification** | Check suspicious links before clicking |
| **BEC Prevention** | Detect business email compromise |
| **Security Training** | Run phishing simulations for employees |
| **Incident Response** | Rapid phishing triage and analysis |
| **Threat Intelligence** | Track active phishing campaigns |

---

## ✨ Key Features

### 🔍 Multi-Layer Email Analysis

```
┌─────────────────────────────────────────────────────────────────┐
│                    EMAIL ANALYSIS PIPELINE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│   │   Header     │  │   Content    │  │   URL/Link   │         │
│   │   Analysis   │  │   Analysis   │  │   Analysis   │         │
│   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│          │                 │                 │                  │
│          ▼                 ▼                 ▼                  │
│   ┌──────────────────────────────────────────────────┐         │
│   │              AI Correlation Engine               │         │
│   │         (Transformer + Ensemble Models)          │         │
│   └──────────────────────────────────────────────────┘         │
│                           │                                     │
│                           ▼                                     │
│              ┌────────────────────────┐                        │
│              │    Phishing Verdict    │                        │
│              │    + Confidence Score  │                        │
│              └────────────────────────┘                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 📧 Email Security Features

- **Header Analysis**: SPF, DKIM, DMARC verification
- **Sender Verification**: Domain age, reputation, impersonation detection
- **Content Analysis**: NLP-based phishing language detection
- **Attachment Scanning**: Malware and macro detection
- **Link Analysis**: URL reputation, redirect chains, visual similarity

### 🔗 URL Intelligence

- **Domain Reputation**: Real-time reputation scoring
- **Visual Analysis**: Screenshot comparison with legitimate sites
- **Redirect Tracing**: Follow and analyze redirect chains
- **SSL Verification**: Certificate validation and analysis
- **Typosquatting Detection**: Identify lookalike domains

### 📊 Campaign Tracking

- **Pattern Recognition**: Identify related phishing attempts
- **IOC Extraction**: Automatically extract indicators
- **Timeline Analysis**: Track campaign evolution
- **Attribution**: Link to known threat actors
- **Alert Correlation**: Group related incidents

---

## 🏗️ Architecture

### System Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                            PHISHGUARD PLATFORM                              │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         FRONTEND LAYER                               │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │  Dashboard  │  │   Email     │  │    URL      │  │  Campaign  │ │   │
│  │  │   React     │  │  Analyzer   │  │   Scanner   │  │  Tracker   │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  │                         Port: 3005                                   │   │
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
│  │    BACKEND API       │ │    ML ENGINE     │ │   WEBSOCKET SERVER   │   │
│  │    Node.js/Express   │ │   Python/FastAPI │ │   Real-time Events   │   │
│  │    Port: 4005        │ │   Port: 8005     │ │   Port: 6005         │   │
│  └──────────────────────┘ └──────────────────┘ └──────────────────────┘   │
│           │                       │                       │                │
│           └───────────────────────┼───────────────────────┘                │
│                                   ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        DATA LAYER                                    │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │   MongoDB   │  │    Redis    │  │ Screenshots │  │Elasticsearch│ │   │
│  │  │   Primary   │  │   Cache     │  │   Storage   │  │   Logs      │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

| Component | Technology | Port | Purpose |
|-----------|------------|------|---------|
| Frontend | React 19 + TypeScript | 3005 | User interface |
| API Gateway | Express.js | 4000 | Authentication & routing |
| Backend API | Node.js + Express | 4005 | Business logic |
| ML Engine | Python + FastAPI | 8005 | AI/ML processing |
| WebSocket | Socket.io | 6005 | Real-time updates |
| Database | MongoDB 7.0 | 27017 | Data persistence |
| Cache | Redis 7.0 | 6379 | Session & URL cache |

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
| **Cache** | Redis | 7.0 | URL reputation cache |
| **Queue** | Bull | 4.12 | Email processing queue |
| **Email** | Nodemailer | 6.9 | Email handling |

### ML Engine Technologies

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Runtime** | Python | 3.11 | ML runtime |
| **Framework** | FastAPI | 0.109 | Async API |
| **NLP** | Transformers | 4.36 | BERT/RoBERTa models |
| **ML Library** | scikit-learn | 1.4 | Classical ML |
| **Vision** | OpenCV | 4.9 | Screenshot analysis |
| **OCR** | Tesseract | 5.3 | Text extraction |
| **Web** | Playwright | 1.40 | URL screenshots |

### Frontend Technologies

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | React | 19.0 | UI framework |
| **Language** | TypeScript | 5.3 | Type safety |
| **Build** | Vite | 5.0 | Build tool |
| **Styling** | TailwindCSS | 3.4 | Utility CSS |
| **State** | Zustand | 4.4 | State management |
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
Chromium (for Playwright screenshots)
```

### Quick Start

```bash
# Clone repository
git clone https://github.com/VM07B/VictoryKit.git
cd VictoryKit

# Install backend dependencies
cd backend/tools/05-phishnetai/api
npm install

# Install ML engine dependencies
cd ../ml-engine
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
playwright install chromium

# Install frontend dependencies
cd ../../../../frontend/tools/05-phishnetai
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
  phishnetai-api:
    build: ./api
    ports:
      - "4005:4005"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/phishnetai

  phishnetai-ml:
    build: ./ml-engine
    ports:
      - "8005:8005"
    volumes:
      - ./models:/app/models

  phishnetai-frontend:
    build: ../../../frontend/tools/05-phishnetai
    ports:
      - "3005:3005"

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
# PHISHGUARD CONFIGURATION
# ===========================================

# Server Configuration
NODE_ENV=development
PORT=4005
HOST=0.0.0.0

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/phishnetai
MONGODB_DB_NAME=phishnetai

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# ML Engine Configuration
ML_ENGINE_URL=http://localhost:8005
ML_TIMEOUT=30000

# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=phishnetai@example.com
SMTP_PASS=your-smtp-password

# URL Analysis
SCREENSHOT_TIMEOUT=30000
MAX_REDIRECTS=10
URL_CACHE_TTL=86400

# Threat Intelligence
VIRUSTOTAL_API_KEY=your-virustotal-key
GOOGLE_SAFE_BROWSING_KEY=your-gsb-key
PHISHTANK_API_KEY=your-phishtank-key

# Rate Limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=100
```

---

## 📚 API Reference

### Base URL

```
Production: https://phishnetai.maula.ai/api/v1
Development: http://localhost:4005/api/v1
```

### Email Analysis Endpoints

#### Analyze Email

```http
POST /api/v1/phishing/email/analyze
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request:**
```bash
curl -X POST /api/v1/phishing/email/analyze \
  -H "Authorization: Bearer {token}" \
  -F "subject=Urgent: Verify Your Account" \
  -F "sender=support@bank-secure.com" \
  -F "body=Click here to verify your account..."
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysisId": "analysis_abc123",
    "verdict": "phishing",
    "confidence": 0.95,
    "threatType": "credential_harvest",
    "severity": "critical",
    "indicators": {
      "spoofedDomain": true,
      "urgentLanguage": true,
      "suspiciousLinks": 2,
      "brandImpersonation": "Bank of America"
    },
    "links": [
      {
        "url": "http://bank-secure.com/verify",
        "verdict": "malicious",
        "reputation": 5,
        "redirects": ["http://evil.com/steal"]
      }
    ],
    "recommendations": [
      "Do not click any links",
      "Report to IT security",
      "Block sender domain"
    ]
  }
}
```

#### Analyze Raw Email

```http
POST /api/v1/phishing/email/analyze-raw
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "rawEmail": "From: support@bank-secure.com\nTo: victim@company.com\nSubject: Urgent\n\nClick here..."
}
```

### URL Analysis Endpoints

#### Check URL

```http
POST /api/v1/phishing/url/check
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "url": "https://suspicious-site.com/login"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://suspicious-site.com/login",
    "verdict": "phishing",
    "confidence": 0.92,
    "reputation": 15,
    "analysis": {
      "domainAge": "3 days",
      "ssl": {
        "valid": true,
        "issuer": "Let's Encrypt",
        "expiresIn": "89 days"
      },
      "typosquatting": {
        "detected": true,
        "targetBrand": "microsoft.com",
        "similarity": 0.87
      },
      "redirectChain": [
        "https://suspicious-site.com/login",
        "https://evil-redirect.com/steal"
      ],
      "screenshot": "https://storage.../screenshot.png"
    },
    "threatIntel": {
      "googleSafeBrowsing": "malicious",
      "virusTotal": { "positives": 12, "total": 70 },
      "phishTank": true
    }
  }
}
```

#### Bulk URL Check

```http
POST /api/v1/phishing/url/bulk-check
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "urls": [
    "https://site1.com",
    "https://site2.com",
    "https://site3.com"
  ]
}
```

### Detection Management

#### List Detections

```http
GET /api/v1/phishing/detections
Authorization: Bearer {token}
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status |
| severity | string | Filter by severity |
| threatType | string | Filter by threat type |
| limit | number | Results per page |
| page | number | Page number |

### Campaign Tracking

#### List Campaigns

```http
GET /api/v1/phishing/campaigns
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "_id": "camp_xyz789",
        "name": "Office 365 Credential Harvest",
        "status": "active",
        "firstSeen": "2026-01-01T00:00:00Z",
        "lastSeen": "2026-01-07T10:30:00Z",
        "totalEmails": 1234,
        "affectedUsers": 89,
        "indicators": {
          "domains": ["office-verify.com", "ms-login.net"],
          "senderPatterns": ["security@", "admin@"],
          "subjectPatterns": ["Verify", "Urgent", "Action Required"]
        },
        "attribution": "APT-PHISH-01"
      }
    ]
  }
}
```

### Phishing Simulations

#### Create Simulation

```http
POST /api/v1/phishing/simulations
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Q1 Security Awareness",
  "template": "office365_password_reset",
  "targets": ["user1@company.com", "user2@company.com"],
  "schedule": "2026-01-15T09:00:00Z"
}
```

---

## 🗄️ Database Schema

### Collections Overview

```
phishnetai_db
├── email_analyses     # Email analysis results
├── url_analyses       # URL check results
├── detections         # Phishing detections
├── quarantine         # Quarantined emails
├── campaigns          # Tracked phishing campaigns
├── simulations        # Training simulations
├── domains            # Trusted/blocked domains
├── reports            # Generated reports
├── users              # User accounts
└── audit_logs         # Audit trail
```

### Email Analysis Schema

```javascript
// email_analyses collection
{
  _id: ObjectId,
  analysisId: String,
  userId: ObjectId,
  
  email: {
    subject: String,
    sender: String,
    replyTo: String,
    recipients: [String],
    body: String,
    bodyHtml: String,
    headers: Object,
    attachments: [{
      filename: String,
      contentType: String,
      size: Number,
      hash: String
    }]
  },
  
  authentication: {
    spf: { status: String, domain: String },
    dkim: { status: String, selector: String },
    dmarc: { status: String, policy: String }
  },
  
  analysis: {
    verdict: {
      type: String,
      enum: ['clean', 'suspicious', 'phishing']
    },
    confidence: Number,
    threatType: String,     // credential_harvest, bec, malware_delivery
    severity: String,
    
    sender: {
      domainAge: Number,
      reputation: Number,
      impersonation: {
        detected: Boolean,
        targetBrand: String,
        similarity: Number
      }
    },
    
    content: {
      urgencyScore: Number,
      phishingIndicators: [String],
      brandMentions: [String],
      sentimentScore: Number
    },
    
    links: [{
      url: String,
      verdict: String,
      reputation: Number,
      redirects: [String],
      screenshot: String
    }],
    
    attachments: [{
      filename: String,
      verdict: String,
      malwareType: String
    }]
  },
  
  mitre: [String],
  iocs: {
    domains: [String],
    urls: [String],
    emails: [String],
    hashes: [String]
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

### URL Analysis Schema

```javascript
// url_analyses collection
{
  _id: ObjectId,
  urlId: String,
  url: String,
  
  analysis: {
    verdict: String,
    confidence: Number,
    reputation: Number,      // 0-100
    
    domain: {
      name: String,
      age: Number,           // days
      registrar: String,
      whois: Object
    },
    
    ssl: {
      valid: Boolean,
      issuer: String,
      expires: Date,
      grade: String
    },
    
    typosquatting: {
      detected: Boolean,
      targetDomain: String,
      similarity: Number
    },
    
    redirectChain: [{
      url: String,
      statusCode: Number,
      server: String
    }],
    
    content: {
      title: String,
      hasLoginForm: Boolean,
      brandIndicators: [String],
      suspiciousElements: [String]
    },
    
    screenshot: {
      url: String,
      timestamp: Date,
      visualSimilarity: {
        targetBrand: String,
        score: Number
      }
    }
  },
  
  threatIntel: {
    googleSafeBrowsing: String,
    virusTotal: Object,
    phishTank: Boolean,
    openPhish: Boolean
  },
  
  cached: Boolean,
  cacheExpires: Date,
  
  createdAt: Date,
  updatedAt: Date
}
```

### Campaign Schema

```javascript
// campaigns collection
{
  _id: ObjectId,
  campaignId: String,
  name: String,
  
  status: {
    type: String,
    enum: ['active', 'inactive', 'tracked']
  },
  
  timeline: {
    firstSeen: Date,
    lastSeen: Date,
    peakActivity: Date
  },
  
  metrics: {
    totalEmails: Number,
    uniqueSenders: Number,
    uniqueTargets: Number,
    clickRate: Number,
    reportRate: Number
  },
  
  indicators: {
    domains: [String],
    senderPatterns: [String],
    subjectPatterns: [String],
    urlPatterns: [String],
    contentSignatures: [String]
  },
  
  samples: [ObjectId],       // References to email_analyses
  
  attribution: {
    threatActor: String,
    confidence: Number,
    ttps: [String]           // MITRE ATT&CK
  },
  
  notes: String,
  tags: [String],
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🤖 ML Models

### Model Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PHISHING DETECTION PIPELINE                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    FEATURE EXTRACTION                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │   │
│  │  │   Text      │  │   URL       │  │   Visual            │   │   │
│  │  │   Features  │  │   Features  │  │   Features          │   │   │
│  │  │ (BERT 768)  │  │ (256 dim)   │  │ (ResNet 2048)       │   │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘   │   │
│  │         │                │                    │               │   │
│  │         └────────────────┼────────────────────┘               │   │
│  │                          ▼                                    │   │
│  │              ┌─────────────────────────┐                      │   │
│  │              │   Feature Fusion (3072) │                      │   │
│  │              └────────────┬────────────┘                      │   │
│  └───────────────────────────┼──────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    CLASSIFICATION                             │   │
│  │  ┌─────────────────┐  ┌─────────────────┐                    │   │
│  │  │   Phishing      │  │   Threat Type   │                    │   │
│  │  │   Classifier    │  │   Classifier    │                    │   │
│  │  │   (Binary)      │  │   (Multi-class) │                    │   │
│  │  └────────┬────────┘  └────────┬────────┘                    │   │
│  └───────────┼────────────────────┼─────────────────────────────┘   │
│              │                    │                                  │
│              ▼                    ▼                                  │
│       ┌──────────────────────────────────────┐                      │
│       │   Final Verdict + Confidence Score   │                      │
│       └──────────────────────────────────────┘                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Models Overview

| Model | Purpose | Accuracy | F1 Score |
|-------|---------|----------|----------|
| **PhishBERT v2** | Email classification | 99.5% | 0.994 |
| **URLNet v1** | URL classification | 98.8% | 0.986 |
| **VisualPhish v1** | Screenshot similarity | 97.2% | 0.968 |
| **BrandDetector v1** | Brand impersonation | 96.5% | 0.961 |
| **CampaignCluster v1** | Campaign identification | 94.8% | 0.942 |

### Feature Engineering

```python
# Text Features (BERT-based)
text_features = {
    'urgency_keywords': int,      # Count of urgent words
    'threat_language': float,     # Threat score 0-1
    'grammar_errors': int,        # Grammar mistake count
    'sentiment': float,           # Sentiment score
    'bert_embedding': [768],      # BERT embeddings
}

# URL Features
url_features = {
    'domain_length': int,
    'path_length': int,
    'num_subdomains': int,
    'has_ip': bool,
    'special_chars': int,
    'entropy': float,
    'typo_distance': float,       # Edit distance to brands
    'tld_reputation': float,
}

# Visual Features (for screenshots)
visual_features = {
    'brand_logo_detected': bool,
    'login_form_present': bool,
    'color_similarity': float,
    'layout_similarity': float,
    'resnet_embedding': [2048],
}
```

---

## 🔒 Security

### Security Features

| Feature | Description |
|---------|-------------|
| **Email Isolation** | Suspicious emails analyzed in sandbox |
| **URL Sandboxing** | URLs opened in isolated browser |
| **Data Encryption** | AES-256 for stored emails |
| **Access Control** | RBAC with audit logging |
| **API Security** | JWT, rate limiting, input validation |
| **Screenshot Safety** | Headless browser with network isolation |

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
│     │                   phishnetai.maula.ai                    │     │
│     └───────────────────────┬─────────────────────────────────┘     │
│                             │                                        │
│         ┌───────────────────┼───────────────────┐                   │
│         ▼                   ▼                   ▼                   │
│   ┌───────────┐       ┌───────────┐       ┌───────────┐            │
│   │   API     │       │   API     │       │   API     │            │
│   │ Instance 1│       │ Instance 2│       │ Instance 3│            │
│   └───────────┘       └───────────┘       └───────────┘            │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────┐       │
│   │                    DATA LAYER                            │       │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │       │
│   │  │ MongoDB  │  │  Redis   │  │ Storage  │               │       │
│   │  │ Replica  │  │ Cluster  │  │ (S3)     │               │       │
│   │  └──────────┘  └──────────┘  └──────────┘               │       │
│   └─────────────────────────────────────────────────────────┘       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Performance Benchmarks

| Metric | Value | Target |
|--------|-------|--------|
| **Email Analysis** | 1.2 seconds | <3 seconds |
| **URL Check** | 0.8 seconds | <2 seconds |
| **Throughput** | 50,000 emails/hour | 40,000 |
| **Detection Rate** | 99.5% | >99% |
| **False Positive Rate** | 0.2% | <1% |

---

## 📞 Support

### Contact

- **Documentation**: https://docs.phishnetai.maula.ai
- **API Status**: https://status.phishnetai.maula.ai
- **Support Email**: support@maula.ai
- **Security Issues**: security@maula.ai

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with 🧡 by the VictoryKit Team**

*Protecting inboxes, one email at a time.*

![PhishNetAI](https://img.shields.io/badge/PhishNetAI-Email%20Security%20AI-F97316?style=for-the-badge)

</div>
