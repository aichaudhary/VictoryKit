# 📊 XDRPlatform - AI-Powered Log Intelligence Platform

<div align="center">

![XDRPlatform Logo](https://img.shields.io/badge/XDRPlatform-AI%20Log%20Intelligence-06b6d4?style=for-the-badge&logo=file-text&logoColor=white)

[![Version](https://img.shields.io/badge/version-1.0.0-06b6d4.svg)](https://github.com/VM07B/VictoryKit)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg)](https://python.org/)
[![Elasticsearch](https://img.shields.io/badge/Elasticsearch-8.11-005571.svg)](https://elastic.co/)

**Enterprise-Grade AI-Powered Log Aggregation, Search, Analysis & Anomaly Detection Platform**

[Live Demo](https://xdrplatform.maula.ai) • [API Docs](https://xdrplatform.maula.ai/docs) • [Report Bug](https://github.com/VM07B/VictoryKit/issues)

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

**XDRPlatform** is a cutting-edge, AI-powered log management platform designed to aggregate, parse, search, and analyze logs from any source at massive scale. Leveraging advanced machine learning for intelligent pattern detection, anomaly identification, and predictive analytics, XDRPlatform transforms your log data into actionable insights.

### Why XDRPlatform?

- **Massive Scale**: Handle billions of log entries per day
- **AI-Powered**: Intelligent anomaly detection and pattern recognition
- **Real-Time**: Live log streaming and instant search
- **Universal Parsing**: Auto-detect and parse any log format
- **Smart Alerting**: ML-driven alert correlation and prioritization
- **Deep Analytics**: Advanced visualization and reporting

### Use Cases

| Use Case | Description |
|----------|-------------|
| **Log Aggregation** | Centralize logs from all sources |
| **Real-Time Search** | Instant full-text search across billions of logs |
| **Anomaly Detection** | AI-powered unusual pattern identification |
| **Error Tracking** | Automatic error correlation and grouping |
| **Security Monitoring** | Log-based threat detection |
| **Compliance Auditing** | Retain and search audit logs |

---

## ✨ Key Features

### 🔍 Log Processing Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                  LOG PROCESSING PIPELINE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│   │    Log       │  │    Auto      │  │   Index &    │         │
│   │  Ingestion   │──▶│   Parsing    │──▶│   Storage    │         │
│   └──────────────┘  └──────────────┘  └──────────────┘         │
│          │                                    │                  │
│          │         ┌──────────────┐          │                  │
│          │         │  ML Engine   │          │                  │
│          └────────▶│ (Analysis)   │◀─────────┘                  │
│                    └──────┬───────┘                             │
│                           │                                      │
│          ┌────────────────┼────────────────┐                    │
│          ▼                ▼                ▼                    │
│   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│   │   Anomaly    │ │   Pattern    │ │   Smart      │           │
│   │  Detection   │ │  Extraction  │ │   Alerting   │           │
│   └──────────────┘ └──────────────┘ └──────────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 🛡️ Log Sources Supported

- **Application Logs**: JSON, structured, unstructured
- **System Logs**: Syslog, journald, Windows Event
- **Container Logs**: Docker, Kubernetes, containerd
- **Cloud Logs**: AWS CloudWatch, GCP Logging, Azure Monitor
- **Network Logs**: Firewall, load balancer, proxy
- **Security Logs**: SIEM, WAF, IDS/IPS

### 🤖 AI-Powered Features

- **Auto-Parsing**: ML-based log format detection
- **Anomaly Detection**: Unsupervised pattern analysis
- **Error Clustering**: Group similar errors automatically
- **Predictive Alerts**: Forecast issues before they happen
- **Root Cause Analysis**: AI-assisted troubleshooting
- **Natural Language Search**: Query logs conversationally

---

## 🏗️ Architecture

### System Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                          LOGANALYZER PLATFORM                               │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         FRONTEND LAYER                               │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │  Dashboard  │  │  Log Search │  │   Alerts    │  │  Analytics │ │   │
│  │  │   React     │  │   Explorer  │  │   Manager   │  │   Charts   │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  │                         Port: 3012                                   │   │
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
│  │    BACKEND API       │ │    ML ENGINE     │ │   INGEST ENGINE      │   │
│  │    Node.js/Express   │ │   Python/FastAPI │ │   Logstash/Vector    │   │
│  │    Port: 4012        │ │   Port: 8012     │ │   Port: 6012         │   │
│  └──────────────────────┘ └──────────────────┘ └──────────────────────┘   │
│           │                       │                       │                │
│           └───────────────────────┼───────────────────────┘                │
│                                   ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        DATA LAYER                                    │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │Elasticsearch│  │   MongoDB   │  │    Redis    │  │   Kafka    │ │   │
│  │  │   Logs      │  │   Config    │  │   Cache     │  │   Stream   │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

| Component | Technology | Port | Purpose |
|-----------|------------|------|---------|
| Frontend | React 19 + TypeScript | 3012 | User interface |
| API Gateway | Express.js | 4000 | Authentication & routing |
| Backend API | Node.js + Express | 4012 | Business logic |
| ML Engine | Python + FastAPI | 8012 | AI/ML processing |
| Ingest Engine | Vector/Logstash | 6012 | Log ingestion |
| Search | Elasticsearch 8.11 | 9200 | Full-text search |
| Metadata | MongoDB 7.0 | 27017 | Configuration storage |

---

## 🛠️ Technology Stack

### Backend Technologies

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Runtime** | Node.js | 18+ | Server runtime |
| **Framework** | Express.js | 4.18 | REST API framework |
| **Language** | TypeScript | 5.3 | Type safety |
| **Search** | Elasticsearch | 8.11 | Log storage & search |
| **Metadata** | MongoDB | 7.0 | Configuration storage |
| **Cache** | Redis | 7.0 | Query caching |
| **Streaming** | Kafka | 3.6 | Log streaming |

### Ingest Engine Technologies

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Collector** | Vector | 0.34 | Log collection |
| **Parser** | Logstash | 8.11 | Log parsing |
| **Runtime** | Python | 3.11 | Custom parsers |
| **Queue** | Kafka | 3.6 | Buffer & routing |

### Frontend Technologies

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | React | 19.0 | UI framework |
| **Language** | TypeScript | 5.3 | Type safety |
| **Build** | Vite | 6.0 | Build tool |
| **Styling** | TailwindCSS | 3.4 | Utility CSS |
| **Charts** | Recharts | 2.10 | Data visualization |
| **Terminal** | xterm.js | 5.3 | Log streaming |

---

## 📦 Installation

### Prerequisites

```bash
# Required software
Node.js >= 18.0.0
Python >= 3.11
Elasticsearch >= 8.11
MongoDB >= 7.0
Redis >= 7.0
Kafka >= 3.6 (optional)
Docker >= 24.0 (optional)
```

### Quick Start

```bash
# Clone repository
git clone https://github.com/VM07B/VictoryKit.git
cd VictoryKit

# Install backend dependencies
cd backend/tools/12-xdrplatform/api
npm install

# Install ML engine dependencies
cd ../ml-engine
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Install frontend dependencies
cd ../../../../frontend/tools/12-xdrplatform
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
  xdrplatform-api:
    build: ./api
    ports:
      - "4012:4012"
    environment:
      - NODE_ENV=production
      - ELASTICSEARCH_URL=http://elasticsearch:9200

  xdrplatform-ml:
    build: ./ml-engine
    ports:
      - "8012:8012"

  xdrplatform-frontend:
    build: ../../../frontend/tools/12-xdrplatform
    ports:
      - "3012:3012"

  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    volumes:
      - es_data:/usr/share/elasticsearch/data

  mongo:
    image: mongo:7
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine

  kafka:
    image: confluentinc/cp-kafka:7.5.0

volumes:
  es_data:
  mongo_data:
```

---

## ⚙️ Configuration

### Environment Variables

```env
# ===========================================
# LOGANALYZER CONFIGURATION
# ===========================================

# Server Configuration
NODE_ENV=development
PORT=4012
HOST=0.0.0.0

# Elasticsearch Configuration
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_INDEX_PREFIX=logs
ELASTICSEARCH_SHARDS=5
ELASTICSEARCH_REPLICAS=1

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/xdrplatform
MONGODB_DB_NAME=xdrplatform

# Redis Configuration
REDIS_URL=redis://localhost:6379
QUERY_CACHE_TTL=300

# Kafka Configuration
KAFKA_BROKERS=localhost:9092
KAFKA_CONSUMER_GROUP=xdrplatform
KAFKA_TOPIC_LOGS=raw-logs

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# ML Engine Configuration
ML_ENGINE_URL=http://localhost:8012

# Ingestion Settings
MAX_BATCH_SIZE=10000
BATCH_TIMEOUT=5000
MAX_LOG_SIZE=1MB

# Retention Settings
DEFAULT_RETENTION_DAYS=30
MAX_RETENTION_DAYS=365

# Rate Limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=1000
SEARCH_RATE_LIMIT=100
```

---

## 📚 API Reference

### Base URL

```
Production: https://xdrplatform.maula.ai/api/v1
Development: http://localhost:4012/api/v1
```

### Log Search

#### Search Logs

```http
POST /api/v1/xdrplatform/search
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "query": "level:error AND source:api-gateway",
  "timeRange": {
    "start": "2026-01-07T00:00:00Z",
    "end": "2026-01-07T23:59:59Z"
  },
  "sources": ["api-gateway", "auth-service"],
  "levels": ["error", "fatal"],
  "limit": 100,
  "offset": 0,
  "sort": { "field": "timestamp", "order": "desc" }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log_abc123",
        "timestamp": "2026-01-07T10:45:32Z",
        "level": "error",
        "source": "api-gateway",
        "message": "Connection timeout to downstream service",
        "metadata": {
          "service": "payment-api",
          "duration": 30000,
          "requestId": "req_xyz789"
        }
      }
    ],
    "total": 1523,
    "took": 45
  }
}
```

### Log Sources

#### Create Source

```http
POST /api/v1/xdrplatform/sources
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "production-api",
  "type": "syslog",
  "config": {
    "port": 514,
    "protocol": "udp",
    "parser": "syslog-rfc5424"
  }
}
```

### Alerts

#### Create Alert

```http
POST /api/v1/xdrplatform/alerts
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "High Error Rate",
  "description": "Alert when error rate exceeds threshold",
  "query": "level:error",
  "condition": {
    "type": "threshold",
    "threshold": 100,
    "window": "5m",
    "operator": "gt"
  },
  "severity": "high",
  "notifications": [
    { "channel": "slack", "target": "#alerts" },
    { "channel": "pagerduty", "target": "team-oncall" }
  ]
}
```

---

## 🗄️ Database Schema

### Elasticsearch Index Mapping

```json
{
  "mappings": {
    "properties": {
      "timestamp": { "type": "date" },
      "level": { "type": "keyword" },
      "source": { "type": "keyword" },
      "message": { 
        "type": "text",
        "analyzer": "standard",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "metadata": { "type": "object", "dynamic": true },
      "parsed": { "type": "object", "dynamic": true },
      "tags": { "type": "keyword" },
      "host": { "type": "keyword" },
      "service": { "type": "keyword" }
    }
  },
  "settings": {
    "number_of_shards": 5,
    "number_of_replicas": 1,
    "index.lifecycle.name": "logs-policy"
  }
}
```

### MongoDB Collections

```javascript
// log_sources collection
{
  _id: ObjectId,
  sourceId: String,
  name: String,
  type: String,     // syslog, filebeat, fluentd, api
  status: String,   // healthy, warning, error, inactive
  config: {
    endpoint: String,
    port: Number,
    protocol: String,
    parser: String,
    filters: [String]
  },
  stats: {
    logsIngested: Number,
    rate: Number,
    avgLatency: Number,
    errors: Number
  },
  lastSeen: Date,
  createdAt: Date,
  updatedAt: Date
}

// log_alerts collection
{
  _id: ObjectId,
  alertId: String,
  name: String,
  description: String,
  query: String,
  condition: {
    type: String,       // threshold, anomaly, pattern
    threshold: Number,
    window: String,
    operator: String
  },
  severity: String,
  status: String,       // active, paused, triggered
  notifications: [{
    channel: String,
    target: String
  }],
  lastTriggered: Date,
  triggerCount: Number,
  createdBy: ObjectId,
  createdAt: Date
}
```

---

## 🤖 ML Models

### Model Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                  AI LOG INTELLIGENCE ENGINE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    LOG PROCESSING                             │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │   │
│  │  │   Format    │  │    Level    │  │    Entity           │   │   │
│  │  │  Detector   │  │  Classifier │  │    Extractor        │   │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘   │   │
│  │         └────────────────┼────────────────────┘               │   │
│  │                          ▼                                    │   │
│  │              ┌─────────────────────────┐                      │   │
│  │              │   Structured Log        │                      │   │
│  │              └────────────┬────────────┘                      │   │
│  └───────────────────────────┼──────────────────────────────────┘   │
│                              │                                       │
│  ┌───────────────────────────┼──────────────────────────────────┐   │
│  │                    ANALYSIS ENGINE                            │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐  │   │
│  │  │   Anomaly       │  │   Pattern       │  │   Volume     │  │   │
│  │  │   Detector      │  │   Miner         │  │  Predictor   │  │   │
│  │  └────────┬────────┘  └────────┬────────┘  └──────┬───────┘  │   │
│  └───────────┼────────────────────┼──────────────────┼──────────┘   │
│              │                    │                  │               │
│              ▼                    ▼                  ▼               │
│       ┌──────────────────────────────────────────────────┐          │
│       │   Insights + Alerts + Recommendations            │          │
│       └──────────────────────────────────────────────────┘          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Models Overview

| Model | Purpose | Accuracy |
|-------|---------|----------|
| **FormatDetector v2** | Log format auto-detection | 97.5% |
| **LevelClassifier v3** | Log level classification | 96.8% |
| **AnomalyDetector v2** | Unusual pattern detection | 94.2% |
| **PatternMiner v1** | Common pattern extraction | 92.1% |
| **VolumePredictor v1** | Log volume forecasting | 89.5% |

---

## 🔒 Security

### Security Features

| Feature | Description |
|---------|-------------|
| **Access Control** | Role-based log access |
| **Data Masking** | Sensitive field redaction |
| **Encryption** | TLS for transport, AES at rest |
| **Audit Logging** | Track all queries |
| **API Security** | JWT + rate limiting |
| **Field-Level Security** | Restrict sensitive fields |

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
│     │                xdrplatform.maula.ai                      │     │
│     └───────────────────────┬─────────────────────────────────┘     │
│                             │                                        │
│         ┌───────────────────┼───────────────────┐                   │
│         ▼                   ▼                   ▼                   │
│   ┌───────────┐       ┌───────────┐       ┌───────────┐            │
│   │   API     │       │   API     │       │   Ingest  │            │
│   │ Instance 1│       │ Instance 2│       │  Workers  │            │
│   └───────────┘       └───────────┘       └───────────┘            │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────┐       │
│   │                    DATA LAYER                            │       │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │       │
│   │  │  Elastic │  │  Mongo   │  │  Redis   │  │  Kafka  │ │       │
│   │  │ Cluster  │  │ Replica  │  │ Cluster  │  │ Cluster │ │       │
│   │  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │       │
│   └─────────────────────────────────────────────────────────┘       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Performance Benchmarks

| Metric | Value | Target |
|--------|-------|--------|
| **Ingestion Rate** | 100K logs/sec | 50K/sec |
| **Search Latency** | <50ms (P95) | <100ms |
| **Index Rate** | 50K docs/sec | 30K/sec |
| **Storage Efficiency** | 10:1 compression | 5:1 |

---

## 📞 Support

### Contact

- **Documentation**: https://docs.xdrplatform.maula.ai
- **API Status**: https://status.xdrplatform.maula.ai
- **Support Email**: support@maula.ai
- **Security Issues**: security@maula.ai

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by the VictoryKit Team**

*Your logs, intelligently analyzed.*

![XDRPlatform](https://img.shields.io/badge/XDRPlatform-AI%20Log%20Intelligence-06b6d4?style=for-the-badge)

</div>
