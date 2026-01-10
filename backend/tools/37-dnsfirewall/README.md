# DNSShield - DNS Security & Threat Intelligence Platform

**Tool #37** | Enterprise-grade DNS protection with AI-powered threat detection and comprehensive security

## 🎯 Overview

DNSShield is a sophisticated DNS security platform that provides comprehensive protection against malicious domains, DNS tunneling, DGA attacks, and DNS-based threats. Powered by Google's Gemini 1.5 Pro AI, it delivers real-time threat detection, intelligent domain classification, DNSSEC validation, and automated security policy management.

### Key Features

- **🛡️ DNS Threat Protection**: Malware, phishing, botnet, ransomware, cryptomining blocking
- **🤖 AI-Powered Analysis**: 10 specialized Gemini 1.5 Pro functions for DNS security
- **🔒 DNSSEC Validation**: Complete trust chain verification and security analysis
- **🕵️ Tunneling Detection**: DNS tunneling and data exfiltration prevention
- **🎯 DGA Detection**: Domain Generation Algorithm identification
- **📊 Real-Time Analytics**: Query patterns, performance metrics, threat intelligence
- **🔐 Encrypted DNS**: DNS-over-HTTPS (DoH), DNS-over-TLS (DoT), DNSCrypt
- **📈 Cache Optimization**: Performance analysis and optimization recommendations
- **🚨 Threat Intelligence**: Real-time feeds from Abuse.ch, Spamhaus, PhishTank
- **⚙️ Policy Management**: Automated policy generation and enforcement

---

## 🏗️ Architecture

### System Components

```
DNSShield (Tool #37)
├── Frontend (React + TypeScript + Vite)
│   ├── Port: 3037
│   ├── AI WebSocket: ws://localhost:6037
│   └── API: http://localhost:4037
│
├── Backend API (Node.js + Express)
│   ├── Port: 4037
│   ├── DNS Query Processing
│   ├── Threat Intelligence Engine
│   ├── Policy Management
│   └── Analytics Engine
│
├── AI Assistant (WebSocket Server)
│   ├── Port: 6037
│   ├── Gemini 1.5 Pro Integration
│   └── 10 Specialized AI Functions
│
├── DNS Resolver (Custom)
│   ├── Port: 53 (UDP/TCP)
│   ├── DoH: 443
│   ├── DoT: 853
│   ├── DNSSEC Validation
│   └── Cache Management
│
└── Database (MongoDB)
    └── dnsfirewall_db
```

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| Backend API | Node.js, Express, MongoDB |
| AI Engine | Google Gemini 1.5 Pro, WebSocket |
| DNS Resolver | Custom resolver with DNSSEC |
| Database | MongoDB 7.0+ |
| Threat Intelligence | Abuse.ch, Spamhaus, PhishTank, URLhaus |

---

## 🚀 Quick Start

### Prerequisites

```bash
# Required
Node.js >= 18.0.0
MongoDB >= 7.0.0
```

### Installation

```bash
# 1. Frontend Setup
cd frontend/tools/37-dnsfirewall
npm install
npm run dev  # Runs on port 3037

# 2. Backend API Setup
cd backend/tools/37-dnsfirewall/api
npm install
npm start    # Runs on port 4037

# 3. AI Assistant Setup
cd backend/tools/37-dnsfirewall/ai-assistant
npm install
npm start    # Runs on port 6037

# 4. DNS Resolver Setup
cd backend/tools/37-dnsfirewall/resolver
npm install
sudo npm start  # Requires root for port 53
```

### Environment Variables

Create `.env` files in each service directory:

**Frontend (.env)**:
```bash
VITE_API_URL=http://localhost:4037
VITE_WS_URL=ws://localhost:6037
```

**Backend API (.env)**:
```bash
PORT=4037
MONGODB_URI=mongodb://localhost:27017/dnsfirewall_db
ABUSE_CH_API_KEY=your_key
SPAMHAUS_API_KEY=your_key
URLHAUS_API_KEY=your_key
```

**AI Assistant (.env)**:
```bash
PORT=6037
GEMINI_API_KEY=your_gemini_api_key
```

**DNS Resolver (.env)**:
```bash
DNS_PORT=53
DOH_PORT=443
DOT_PORT=853
DNSSEC_ENABLED=true
CACHE_SIZE=100000
```

---

## 📡 API Reference

### Core Endpoints

#### DNS Query
```http
POST /api/dns/query
Content-Type: application/json

{
  "domain": "example.com",
  "queryType": "A",
  "clientIP": "192.168.1.100"
}
```

**Response:**
```json
{
  "domain": "example.com",
  "isThreat": false,
  "reputationScore": 85.5,
  "threatLevel": "low",
  "recommendation": "Allow query. No threats detected."
}
```

#### Blocked Domains
```http
GET /api/blocked?page=1&limit=20&category=malware
POST /api/blocked
{
  "domain": "malicious.com",
  "category": "malware",
  "reason": "Listed in URLhaus"
}
DELETE /api/blocked/:domainId
```

#### Threat Intelligence
```http
GET /api/threats?category=phishing&severity=high
GET /api/reputation/:domain
POST /api/threats/update
```

#### DNS Policies
```http
GET /api/policies
POST /api/policies
PUT /api/policies/:id
DELETE /api/policies/:id
```

#### Analytics
```http
GET /api/analytics?timeRange=week
GET /api/analytics/top-domains?limit=10
GET /api/analytics/stats?timeRange=day
GET /api/analytics/patterns?timeRange=hour
```

#### DNS Tunneling
```http
GET /api/tunneling?limit=20
POST /api/tunneling/analyze
{
  "domain": "suspicious.com",
  "queryPattern": {...}
}
```

#### DNSSEC
```http
GET /api/dnssec/validate/:domain
GET /api/dnssec/status/:domain
```

#### Cache Management
```http
GET /api/cache/stats
POST /api/cache/flush
POST /api/cache/flush/:domain
GET /api/cache/entries?limit=100
```

### Full API Documentation

See [API.md](./API.md) for complete endpoint documentation.

---

## 🤖 AI Functions

DNSShield includes 10 specialized AI functions powered by Gemini 1.5 Pro:

### 1. Analyze DNS Query
Comprehensive DNS query analysis with threat detection and reputation scoring.

**Usage:**
```javascript
const analysis = await aiService.analyzeDNSQuery({
  domain: 'suspicious.com',
  queryType: 'A',
  clientIP: '192.168.1.100',
  includeHistory: true
});
```

**Response:**
```javascript
{
  isThreat: true,
  reputationScore: 25.3,
  threatLevel: 'high',
  detectedThreats: ['malware', 'phishing'],
  queryAnalysis: {
    valid: true,
    queryCount: 45,
    firstSeen: '2026-01-01T10:00:00Z'
  },
  geolocation: {
    country: 'CN',
    asn: 12345
  },
  recommendation: 'Block query. Detected threat: malware, phishing'
}
```

### 2. Detect DNS Tunneling
Detect DNS tunneling attempts for data exfiltration or C2 communication.

**Usage:**
```javascript
const tunnelingCheck = await aiService.detectDNSTunneling({
  domain: 'long-subdomain.example.com',
  queryPattern: {...},
  sensitivity: 'high'
});
```

**Indicators:**
- Subdomain length analysis
- Query frequency patterns
- Entropy calculation
- Automated query patterns

### 3. Classify Domain Threat
Multi-source threat classification with reputation analysis.

**Usage:**
```javascript
const classification = await aiService.classifyDomainThreat({
  domain: 'example.com',
  checkSubdomains: true,
  deepAnalysis: true
});
```

**Categories:** malware, phishing, botnet, ransomware, cryptomining, spam, adult, gambling

### 4. Analyze DNSSEC Status
DNSSEC validation with trust chain verification.

**Usage:**
```javascript
const dnssecAnalysis = await aiService.analyzeDNSSECStatus({
  domain: 'example.com',
  verifyChain: true,
  checkAlgorithms: true
});
```

**Validates:**
- DS and DNSKEY records
- Complete trust chain
- Cryptographic algorithms
- Signature validity

### 5. Generate Blocking Policy
AI-powered DNS blocking policy generation.

**Usage:**
```javascript
const policy = await aiService.generateBlockingPolicy({
  organizationType: 'enterprise',
  threatCategories: ['malware', 'phishing', 'botnet'],
  customRules: [...]
});
```

**Policy Types:**
- Threat-based blocking
- Organization-specific rules
- Time-based restrictions
- Custom domain lists

### 6. Analyze Query Patterns
Pattern analysis for anomaly detection and trend identification.

**Usage:**
```javascript
const patterns = await aiService.analyzeQueryPatterns({
  timeRange: 'week',
  clientFilter: '192.168.1.0/24',
  includeBaseline: true
});
```

### 7. Detect DGA Domains
Domain Generation Algorithm detection for malware C2.

**Usage:**
```javascript
const dgaCheck = await aiService.detectDGADomains({
  domain: 'qxzrtplkjhgfdsa.com',
  algorithmChecks: ['conficker', 'cryptolocker'],
  confidence: 0.75
});
```

**DGA Indicators:**
- Entropy analysis
- Pronounceability scoring
- Consonant ratio
- Length anomalies

### 8. Analyze Cache Performance
DNS cache performance analysis with optimization recommendations.

**Usage:**
```javascript
const cacheAnalysis = await aiService.analyzeCachePerformance({
  timeWindow: 'hour',
  includeRecommendations: true
});
```

### 9. Generate Threat Report
Comprehensive threat intelligence reporting.

**Usage:**
```javascript
const report = await aiService.generateThreatReport({
  reportType: 'weekly',
  startDate: '2026-01-01',
  endDate: '2026-01-07',
  includeGraphs: true
});
```

### 10. Optimize Resolver Config
DNS resolver configuration optimization.

**Usage:**
```javascript
const optimization = await aiService.optimizeResolverConfig({
  currentConfig: {...},
  trafficProfile: {...},
  goals: ['performance', 'security', 'privacy']
});
```

---

## 💾 Database Schema

### Collections

#### dns_queries
```javascript
{
  _id: ObjectId,
  domain: String,
  queryType: String, // 'A', 'AAAA', 'MX', 'TXT', etc.
  clientIP: String,
  responseIP: String,
  isThreat: Boolean,
  threatCategory: String,
  reputationScore: Number,
  blocked: Boolean,
  responseTime: Number,
  cached: Boolean,
  timestamp: Date,
  geolocation: {
    country: String,
    city: String,
    asn: Number
  }
}
```

#### blocked_domains
```javascript
{
  _id: ObjectId,
  domain: String,
  category: String, // 'malware', 'phishing', 'botnet', etc.
  source: String, // 'URLhaus', 'PhishTank', 'custom', etc.
  reason: String,
  severity: String, // 'low', 'medium', 'high', 'critical'
  blockedAt: Date,
  expiresAt: Date,
  autoBlocked: Boolean,
  blockCount: Number,
  lastAttempt: Date
}
```

#### threat_intelligence
```javascript
{
  _id: ObjectId,
  domain: String,
  ipAddresses: [String],
  threatType: String,
  category: String,
  severity: String,
  confidence: Number,
  sources: [{
    name: String,
    listed: Boolean,
    timestamp: Date
  }],
  firstSeen: Date,
  lastSeen: Date,
  indicators: [String],
  relatedDomains: [String]
}
```

#### dns_policies
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  enabled: Boolean,
  priority: Number,
  action: String, // 'allow', 'block', 'monitor', 'redirect'
  conditions: {
    categories: [String],
    domains: [String],
    sources: [String],
    schedule: String
  },
  exceptions: [String],
  log: Boolean,
  alert: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### dns_analytics
```javascript
{
  _id: ObjectId,
  period: String, // 'hour', 'day', 'week', 'month'
  timestamp: Date,
  totalQueries: Number,
  blockedQueries: Number,
  allowedQueries: Number,
  uniqueDomains: Number,
  uniqueClients: Number,
  cacheHitRate: Number,
  avgResponseTime: Number,
  topDomains: [{
    domain: String,
    queries: Number,
    category: String
  }],
  queryTypes: [{
    type: String,
    count: Number,
    percentage: Number
  }]
}
```

---

## 🔐 Security Features

### DNS Protection
- **Malware Blocking**: Real-time malware domain blocking
- **Phishing Protection**: Multi-source phishing detection
- **Botnet Prevention**: C2 domain blocking
- **Ransomware Defense**: Ransomware infrastructure blocking
- **Cryptomining Protection**: Cryptojacking domain blocking
- **Ad/Tracker Blocking**: Privacy-focused blocking

### DNS Security
- **DNSSEC**: Complete DNSSEC validation
- **DNS-over-HTTPS (DoH)**: Encrypted DNS via HTTPS
- **DNS-over-TLS (DoT)**: Encrypted DNS via TLS
- **DNSCrypt**: Alternative encryption protocol
- **Cache Poisoning Protection**: Cache integrity validation
- **Amplification Prevention**: DDoS mitigation

### Threat Detection
- **DNS Tunneling**: Data exfiltration detection
- **DGA Domains**: Malware C2 identification
- **Anomaly Detection**: Query pattern analysis
- **Rate Limiting**: DDoS and abuse prevention

---

## 📊 Monitoring & Analytics

### Real-Time Dashboard
- Queries per second (QPS)
- Block rate and trends
- Cache hit rate
- Response time metrics
- Active threats
- Geographic distribution

### Reports
- **Threat Reports**: Comprehensive threat intelligence
- **Performance Reports**: Cache and resolver performance
- **Compliance Reports**: Audit logging and compliance
- **Custom Reports**: Flexible query builder

### Alerts
- **Critical Threats**: Immediate notification
- **Policy Violations**: Configurable alerts
- **Performance Issues**: Threshold-based alerts
- **System Health**: Service monitoring

---

## 🔗 Integrations

### Threat Intelligence Feeds
- **Abuse.ch URLhaus**: Malware distribution
- **Abuse.ch ThreatFox**: IOC database
- **Spamhaus DBL**: Spam and malware domains
- **PhishTank**: Phishing URLs
- **OpenPhish**: Phishing intelligence
- **MalwareDomains**: Malware hosting

### SIEM Integration
- **Formats**: Syslog, JSON, CEF
- **Platforms**: Splunk, QRadar, Sentinel, ELK

### Monitoring
- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **Elasticsearch**: Log aggregation

---

## ⚙️ Configuration

### Core Settings

Configuration is managed through `dnsfirewall-config.json`:

```javascript
{
  "dnsProtection": {
    "malwareDomainBlocking": true,
    "phishingProtection": true,
    "botnetDetection": true,
    "adBlocking": true
  },
  "dnsSecurity": {
    "dnssec": true,
    "dnsOverHTTPS": true,
    "dnsOverTLS": true,
    "tunnelDetection": true
  },
  "threatIntelligence": {
    "realTimeFeeds": true,
    "feeds": ["abuse_ch", "spamhaus", "phishtank"]
  },
  "performance": {
    "caching": {
      "enabled": true,
      "ttlRespect": true,
      "prefetching": true
    }
  }
}
```

### DNS Resolver Configuration

```javascript
{
  "upstreams": ["1.1.1.1", "8.8.8.8", "9.9.9.9"],
  "cache": {
    "size": 100000,
    "ttlMin": 300,
    "ttlMax": 86400,
    "negativeTTL": 300
  },
  "dnssec": {
    "enabled": true,
    "trustAnchors": [...],
    "strictMode": false
  },
  "rateLimiting": {
    "queriesPerSecond": 1000,
    "burstSize": 5000
  }
}
```

---

## 📈 Compliance

DNSShield supports compliance with:

- **GDPR**: Data minimization and privacy
- **COPPA**: Child privacy protection
- **CCPA**: California consumer privacy
- **HIPAA**: Healthcare data protection

### Privacy Features
- Query minimization
- IP anonymization
- Minimal logging
- Configurable retention

---

## 🧪 Testing

```bash
# Unit Tests
npm run test

# Integration Tests
npm run test:integration

# DNS Query Tests
dig @localhost -p 53 example.com

# DoH Testing
curl -H 'accept: application/dns-json' \
  'https://localhost/dns-query?name=example.com&type=A'

# DoT Testing
kdig -d @localhost +tls example.com

# Coverage Report
npm run test:coverage
```

---

## 📝 Usage Examples

### Query DNS
```javascript
const result = await dnsfirewallAPI.queryDomain({
  domain: 'example.com',
  queryType: 'A',
  clientIP: '192.168.1.100'
});
```

### Block Domain
```javascript
await dnsfirewallAPI.blockDomain({
  domain: 'malicious.com',
  category: 'malware',
  reason: 'Listed in URLhaus',
  duration: 86400 // 24 hours
});
```

### Check Reputation
```javascript
const reputation = await dnsfirewallAPI.checkDomainReputation('example.com');
console.log(`Reputation Score: ${reputation.score}`);
```

### Generate Report
```javascript
const report = await dnsfirewallAPI.generateThreatReport({
  reportType: 'weekly',
  startDate: '2026-01-01',
  endDate: '2026-01-07'
});
```

---

## 🛠️ Development

### Project Structure
```
37-dnsfirewall/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── utils/
│   ├── dnsfirewall-config.json
│   └── package.json
│
├── backend/
│   ├── api/
│   ├── ai-assistant/
│   └── resolver/
│
└── README.md
```

---

## 🐛 Troubleshooting

### Common Issues

**DNS Queries Not Resolving**
```bash
# Check resolver status
systemctl status dnsfirewall-resolver

# Test DNS resolution
dig @localhost example.com

# Check logs
tail -f /var/log/dnsfirewall/resolver.log
```

**High False Positive Rate**
```javascript
// Adjust threat sensitivity
{
  "threatIntelligence": {
    "sensitivity": "medium" // Change from "high"
  }
}
```

**DNSSEC Validation Failures**
```bash
# Update trust anchors
dnsfirewall-resolver --update-trust-anchors

# Disable strict mode temporarily
{
  "dnssec": {
    "strictMode": false
  }
}
```

---

## 📚 Additional Resources

- [API Documentation](./API.md)
- [AI Functions Guide](./AI_FUNCTIONS.md)
- [DNS Security Best Practices](./DNS_SECURITY.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Performance Tuning](./PERFORMANCE.md)

---

## 📜 License

Part of the VictoryKit AI Security Suite

---

## 👥 Support

For issues and questions:
- GitHub Issues: [VictoryKit Issues](https://github.com/victorykit/issues)
- Documentation: [VictoryKit Docs](https://docs.victorykit.com)

---

**DNSShield - Intelligent DNS Protection for the Modern Enterprise** 🛡️🌐
