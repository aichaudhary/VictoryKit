# WAFManager - Tool #21

## Overview

WAFManager is a comprehensive Web Application Firewall (WAF) management platform that provides centralized control, monitoring, and threat intelligence for web application security. It offers real-time traffic analysis, rule management, policy enforcement, and advanced threat detection capabilities.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        WAFManager Platform                          │
├─────────────────────────────────────────────────────────────────────┤
│  Frontend (React + TypeScript + Vite)                              │
│  ┌─────────────┬─────────────┬──────────────┬─────────────────────┐ │
│  │ Dashboard   │ WAF Inst.  │ Rules Mgmt   │ Policies Mgmt        │ │
│  │ (Metrics)   │ (Deploy)   │ (OWASP)      │ (Custom)             │ │
│  └─────────────┴─────────────┴──────────────┴─────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│  Backend API (Node.js + Express)                                    │
│  ┌────────────┬─────────────┬──────────────┬──────────────────────┐ │
│  │ Rule Engine│ Traffic     │ Threat Intel │ Policy Engine        │ │
│  │ (ModSec)   │ Analysis    │ (ML)         │ (Enforcement)        │ │
│  └────────────┴─────────────┴──────────────┴──────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│  ML Engine (Python + TensorFlow)                                    │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Anomaly Detection | Threat Classification | Auto Rule Generation│ │
│  └────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│  Database Layer                                                      │
│  ┌──────────────────┬──────────────────┬──────────────────────────┐ │
│  │ MongoDB          │ Redis            │ Elasticsearch            │ │
│  │ (Config/Rules)   │ (Cache)          │ (Logs/Search)            │ │
│  └──────────────────┴──────────────────┴──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## Database Schema

### MongoDB Collections

#### waf_instances
```javascript
{
  _id: ObjectId,
  instanceId: String,           // Unique instance identifier
  name: String,                 // Instance name
  type: String,                 // nginx | apache | iis | cloudflare
  endpoint: String,             // API endpoint URL
  status: String,               // active | inactive | maintenance
  version: String,              // WAF version
  lastSync: Date,               // Last synchronization
  configuration: {
    mode: String,               // detection | prevention | learning
    sensitivity: String,        // low | medium | high | paranoid
    rulesets: [String],         // Enabled rule sets
    customRules: [ObjectId],    // Custom rules
    exclusions: [{
      url: String,
      method: String,
      reason: String
    }]
  },
  metrics: {
    requestsProcessed: Number,
    attacksBlocked: Number,
    falsePositives: Number,
    responseTime: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### waf_rules
```javascript
{
  _id: ObjectId,
  ruleId: String,
  name: String,
  description: String,
  category: String,             // owasp | custom | anomaly
  severity: String,             // critical | high | medium | low | info
  tags: [String],               // sql-injection | xss | csrf | etc.
  conditions: [{
    variable: String,           // REQUEST_URI | REQUEST_HEADERS | REQUEST_BODY
    operator: String,           // contains | matches | equals | gt | lt
    value: String,
    negate: Boolean
  }],
  actions: [{
    type: String,               // block | allow | log | redirect | transform
    parameters: Object
  }],
  enabled: Boolean,
  instances: [ObjectId],        // Associated instances
  metadata: {
    source: String,             // owasp | custom | ml-generated
    confidence: Number,         // 0-100
    lastTriggered: Date,
    triggerCount: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### attack_logs
```javascript
{
  _id: ObjectId,
  attackId: String,
  timestamp: Date,
  instanceId: ObjectId,
  clientIP: String,
  userAgent: String,
  request: {
    method: String,
    url: String,
    headers: Object,
    body: String,
    queryParams: Object
  },
  attack: {
    type: String,               // sql-injection | xss | csrf | rfi | etc.
    severity: String,
    confidence: Number,
    matchedRules: [ObjectId],
    payload: String,
    impact: String              // high | medium | low
  },
  response: {
    statusCode: Number,
    action: String,             // blocked | allowed | logged
    responseTime: Number
  },
  geoLocation: {
    country: String,
    city: String,
    coordinates: [Number, Number]
  },
  createdAt: Date
}
```

#### traffic_analytics
```javascript
{
  _id: ObjectId,
  timestamp: Date,
  instanceId: ObjectId,
  period: String,               // 1m | 5m | 15m | 1h | 1d
  metrics: {
    totalRequests: Number,
    blockedRequests: Number,
    responseTime: {
      avg: Number,
      p95: Number,
      p99: Number
    },
    topPaths: [{
      path: String,
      requests: Number,
      blocked: Number
    }],
    topIPs: [{
      ip: String,
      requests: Number,
      blocked: Number,
      country: String
    }],
    attackTypes: Object,         // { 'sql-injection': 15, 'xss': 8, ... }
    statusCodes: Object          // { '200': 1250, '403': 45, '500': 2, ... }
  }
}
```

### Redis Cache

- **waf:config:{instanceId}** - Instance configurations
- **waf:rules:{instanceId}** - Active rules cache
- **waf:metrics:{instanceId}** - Real-time metrics
- **waf:blacklist:ip** - IP blacklist
- **waf:blacklist:url** - URL blacklist

### Elasticsearch Index

#### waf-logs-*
```json
{
  "mappings": {
    "properties": {
      "attackId": { "type": "keyword" },
      "timestamp": { "type": "date" },
      "instanceId": { "type": "keyword" },
      "clientIP": { "type": "ip" },
      "attack.type": { "type": "keyword" },
      "attack.severity": { "type": "keyword" },
      "request.url": { "type": "text", "analyzer": "url_analyzer" },
      "request.method": { "type": "keyword" },
      "response.action": { "type": "keyword" },
      "geoLocation.country": { "type": "keyword" }
    }
  }
}
```

## API Endpoints

### WAF Instances Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/waf/instances` | List all WAF instances |
| POST | `/api/waf/instances` | Create new instance |
| GET | `/api/waf/instances/:id` | Get instance details |
| PUT | `/api/waf/instances/:id` | Update instance |
| DELETE | `/api/waf/instances/:id` | Delete instance |
| POST | `/api/waf/instances/:id/sync` | Sync instance configuration |
| GET | `/api/waf/instances/:id/metrics` | Get instance metrics |

### Rules Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/waf/rules` | List all rules |
| POST | `/api/waf/rules` | Create new rule |
| GET | `/api/waf/rules/:id` | Get rule details |
| PUT | `/api/waf/rules/:id` | Update rule |
| DELETE | `/api/waf/rules/:id` | Delete rule |
| POST | `/api/waf/rules/:id/enable` | Enable/disable rule |
| GET | `/api/waf/rules/categories` | Get rule categories |
| POST | `/api/waf/rules/import` | Import rules from file |

### Attack Logs & Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/waf/logs` | Query attack logs |
| GET | `/api/waf/logs/:id` | Get specific attack log |
| POST | `/api/waf/logs/search` | Advanced log search |
| GET | `/api/waf/analytics/traffic` | Traffic analytics |
| GET | `/api/waf/analytics/attacks` | Attack analytics |
| GET | `/api/waf/analytics/threats` | Threat intelligence |
| POST | `/api/waf/logs/export` | Export logs |

### Policies & Configuration

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/waf/policies` | List policies |
| POST | `/api/waf/policies` | Create policy |
| GET | `/api/waf/policies/:id` | Get policy |
| PUT | `/api/waf/policies/:id` | Update policy |
| DELETE | `/api/waf/policies/:id` | Delete policy |
| POST | `/api/waf/policies/:id/deploy` | Deploy policy |

### Real-time Monitoring

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/waf/live/events` | Live event stream (SSE) |
| GET | `/api/waf/live/metrics` | Real-time metrics |
| POST | `/api/waf/live/alert` | Send alert |
| GET | `/api/waf/live/dashboard` | Live dashboard data |

## ML Engine Functions

| Function | Description |
|----------|-------------|
| `detectAnomalies()` | ML-based anomaly detection in traffic patterns |
| `classifyAttacks()` | Attack type classification using ML models |
| `generateRules()` | Auto-generate WAF rules from attack patterns |
| `predictThreats()` | Threat prediction and proactive blocking |
| `analyzeBehavior()` | User behavior analysis for bot detection |
| `optimizeRules()` | Rule optimization using performance metrics |
| `clusterAttacks()` | Attack clustering for pattern recognition |

## Rule Categories

### OWASP Core Rule Set (CRS)
- **SQL Injection**: Detection of SQL injection attacks
- **XSS**: Cross-site scripting prevention
- **CSRF**: Cross-site request forgery protection
- **RFI/LFI**: Remote/local file inclusion
- **Command Injection**: OS command injection prevention
- **Path Traversal**: Directory traversal attacks
- **Session Fixation**: Session hijacking prevention

### Custom Rules
- **API Protection**: REST API specific rules
- **Rate Limiting**: DDoS and brute force protection
- **Geo-blocking**: Geographic access control
- **Bot Detection**: Automated bot traffic filtering
- **Data Leakage**: Sensitive data exfiltration prevention

## Quick Start

### Development
```bash
cd frontend/tools/21-wafmanager
npm install
npm run dev
# Opens at http://localhost:3021
```

### Backend
```bash
cd backend/tools/21-wafmanager/api
npm install
npm run dev
# API at http://localhost:4021
```

### ML Engine
```bash
cd backend/tools/21-wafmanager/ml-engine
pip install -r requirements.txt
python app.py
# ML API at http://localhost:5021
```

## Features

### Dashboard
- Real-time metrics and KPIs
- Attack trends and visualizations
- Instance health monitoring
- Top threats and blocked requests

### WAF Instances
- Multi-instance management
- Configuration synchronization
- Health monitoring and alerts
- Performance metrics tracking

### Rules Manager
- OWASP CRS integration
- Custom rule creation
- Rule testing and validation
- Bulk rule operations

### Policies Manager
- Policy templates and customization
- Instance-specific policies
- Policy versioning and rollback
- Compliance mapping

### Attack Logs
- Comprehensive attack logging
- Advanced search and filtering
- Log export and archiving
- Forensic analysis tools

### Traffic Analytics
- Real-time traffic monitoring
- Performance metrics
- Geographic analysis
- Trend analysis and reporting

### Threat Intelligence
- Global threat feeds integration
- IP reputation scoring
- Attack pattern analysis
- Automated threat response

### Live Monitor
- Real-time event streaming
- Interactive dashboards
- Alert management
- Incident response tools

## Integrations

- **WAF Engines**: ModSecurity, Cloudflare WAF, AWS WAF, Azure WAF
- **SIEM**: Splunk, ELK Stack, IBM QRadar, Azure Sentinel
- **Threat Intelligence**: VirusTotal, AbuseIPDB, Emerging Threats
- **Cloud Platforms**: AWS, Azure, GCP security services
- **Monitoring**: Prometheus, Grafana, DataDog

## Compliance Support

| Framework | Coverage |
|-----------|----------|
| OWASP Top 10 | 100% coverage with CRS 3.3 |
| PCI DSS | Requirements 6.6, 11.4, 11.5 |
| HIPAA | Security Rule §164.312(e) |
| GDPR | Article 32 (Security of processing) |
| NIST CSF | PR.IP-1, PR.IP-2, DE.CM-1 |
| ISO 27001 | A.12.6.1, A.12.6.2 |

## Domain Structure

- **Home Page**: maula.ai
- **Tool Access**: wafmanager.maula.ai
- **AI Assistant**: wafmanager.maula.ai/maula-ai

## License

MIT License - VictoryKit Security Platform
