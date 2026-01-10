# BrowserIsolation - Advanced Web Content Filtering & URL Security Platform

**Tool #36** | Enterprise-grade web filtering with AI-powered threat detection and comprehensive content control

## 🎯 Overview

BrowserIsolation is a sophisticated web content filtering and URL security platform that provides comprehensive protection against malicious websites, inappropriate content, and data leakage. Powered by Google's Gemini 1.5 Pro AI, it delivers real-time threat analysis, intelligent content classification, bandwidth optimization, and automated policy management.

### Key Features

- **🛡️ URL Security Analysis**: Real-time threat detection, malware scanning, phishing protection
- **🤖 AI-Powered Classification**: 10 specialized Gemini 1.5 Pro functions for content analysis
- **📊 Content Categories**: 30+ categories including adult, gambling, malware, social media, streaming
- **🔒 SSL/TLS Inspection**: Certificate validation, chain verification, security analysis
- **📈 Bandwidth Management**: Usage analysis, throttling, optimization recommendations
- **🚨 Data Loss Prevention**: Pattern detection, leakage monitoring, compliance enforcement
- **👤 User Behavior Analytics**: Anomaly detection, baseline comparison, risk scoring
- **📋 Compliance Reporting**: CIPA, COPPA, GDPR, HIPAA compliance reports
- **🔗 Threat Intelligence**: Real-time feed integration from Abuse.ch, Spamhaus, PhishTank
- **⚙️ Policy Engine**: Automated policy generation, time-based rules, category blocking

---

## 🏗️ Architecture

### System Components

```
BrowserIsolation (Tool #36)
├── Frontend (React + TypeScript + Vite)
│   ├── Port: 3036
│   ├── AI WebSocket: ws://localhost:6036
│   └── API: http://localhost:4036
│
├── Backend API (Node.js + Express)
│   ├── Port: 4036
│   ├── URL Analysis Engine
│   ├── Content Classification
│   ├── Policy Management
│   └── Bandwidth Monitoring
│
├── AI Assistant (WebSocket Server)
│   ├── Port: 6036
│   ├── Gemini 1.5 Pro Integration
│   └── 10 Specialized AI Functions
│
├── Filtering Engine (C++)
│   ├── High-performance packet inspection
│   ├── Real-time content analysis
│   └── Hardware acceleration support
│
└── Database (MongoDB)
    └── browserisolation_db
```

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| Backend API | Node.js, Express, MongoDB |
| AI Engine | Google Gemini 1.5 Pro, WebSocket |
| Filtering Engine | C++, DPI (Deep Packet Inspection) |
| Database | MongoDB 7.0+ |
| Threat Intelligence | Abuse.ch, Spamhaus, PhishTank, URLScan |

---

## 🚀 Quick Start

### Prerequisites

```bash
# Required
Node.js >= 18.0.0
MongoDB >= 7.0.0
Python >= 3.9 (for ML models)
```

### Installation

```bash
# 1. Frontend Setup
cd frontend/tools/36-browserisolation
npm install
npm run dev  # Runs on port 3036

# 2. Backend API Setup
cd backend/tools/36-browserisolation/api
npm install
npm start    # Runs on port 4036

# 3. AI Assistant Setup
cd backend/tools/36-browserisolation/ai-assistant
npm install
npm start    # Runs on port 6036

# 4. Filtering Engine Setup
cd backend/tools/36-browserisolation/engine
make build
./browserisolation-engine
```

### Environment Variables

Create `.env` files in each service directory:

**Frontend (.env)**:
```bash
VITE_API_URL=http://localhost:4036
VITE_WS_URL=ws://localhost:6036
```

**Backend API (.env)**:
```bash
PORT=4036
MONGODB_URI=mongodb://localhost:27017/browserisolation_db
VIRUSTOTAL_API_KEY=your_key
URLSCAN_API_KEY=your_key
ABUSE_CH_API_KEY=your_key
```

**AI Assistant (.env)**:
```bash
PORT=6036
GEMINI_API_KEY=your_gemini_api_key
```

---

## 📡 API Reference

### Core Endpoints

#### URL Analysis
```http
POST /api/urls/analyze
Content-Type: application/json

{
  "url": "https://example.com/page",
  "checkRedirects": true,
  "deepScan": false
}
```

**Response:**
```json
{
  "isSafe": true,
  "reputationScore": 85.5,
  "threatLevel": "low",
  "detectedThreats": [],
  "recommendedAction": "allow"
}
```

#### Content Classification
```http
POST /api/classify
Content-Type: application/json

{
  "url": "https://website.com",
  "analyzeSubdomains": true
}
```

#### Policy Management
```http
GET /api/policies
POST /api/policies
PUT /api/policies/:id
DELETE /api/policies/:id
```

#### Bandwidth Analytics
```http
GET /api/bandwidth?timeRange=week&groupBy=category
```

#### User Activity
```http
GET /api/users/:userId/activity?timeWindow=24h
GET /api/users/:userId/behavior
```

#### Compliance Reports
```http
POST /api/compliance/reports
{
  "reportType": "CIPA",
  "startDate": "2026-01-01",
  "endDate": "2026-01-31"
}
```

### Full API Documentation

See [API.md](./API.md) for complete endpoint documentation with request/response examples.

---

## 🤖 AI Functions

BrowserIsolation includes 10 specialized AI functions powered by Gemini 1.5 Pro:

### 1. Analyze URL Safety
Comprehensive URL safety analysis with reputation scoring and threat detection.

**Usage:**
```javascript
const analysis = await aiService.analyzeURLSafety({
  url: 'https://suspicious-site.com',
  checkRedirects: true,
  deepScan: true
});
```

**Response:**
```javascript
{
  isSafe: false,
  reputationScore: 25.3,
  threatLevel: 'high',
  detectedThreats: ['phishing', 'malware'],
  redirectChain: ['shortener.com/abc', 'final-destination.com'],
  domainInfo: {
    age: 15,
    isNew: true,
    country: 'CN'
  },
  recommendation: 'Block access. Detected: phishing, malware'
}
```

### 2. Classify Website Content
Intelligent content categorization with multi-category support.

**Usage:**
```javascript
const classification = await aiService.classifyWebsiteContent({
  url: 'https://website.com',
  analyzeSubdomains: true
});
```

**Categories:** business, education, entertainment, news, social_media, shopping, adult, gambling, weapons, drugs, hate_speech, malware, phishing, streaming, gaming, technology

### 3. Detect Malicious Content
Advanced malware detection, exploit kit identification, and phishing analysis.

**Usage:**
```javascript
const malwareCheck = await aiService.detectMaliciousContent({
  url: 'https://suspicious-download.com',
  includeScreenshot: true
});
```

### 4. Analyze SSL Certificate
SSL/TLS certificate validation, chain verification, and vulnerability detection.

**Usage:**
```javascript
const sslAnalysis = await aiService.analyzeSSLCertificate({
  domain: 'example.com',
  checkChain: true
});
```

**Checks:**
- Certificate validity and expiration
- Issuer verification
- Certificate chain validation
- TLS version and cipher suite
- HSTS and OCSP stapling
- Known vulnerabilities

### 5. Generate Policy Recommendation
AI-powered policy generation based on organization type and requirements.

**Usage:**
```javascript
const policyRecs = await aiService.generatePolicyRecommendation({
  organizationType: 'school', // or 'enterprise', 'government'
  riskTolerance: 'low',
  userCount: 500
});
```

**Policy Types:**
- Category-based blocking
- Time-based restrictions
- Bandwidth management
- SSL inspection
- Safe search enforcement

### 6. Analyze Bandwidth Usage
Detailed bandwidth analysis with optimization recommendations.

**Usage:**
```javascript
const bandwidthAnalysis = await aiService.analyzeBandwidthUsage({
  timeRange: 'week',
  groupBy: 'category' // or 'user', 'department'
});
```

### 7. Detect Data Leakage
Real-time data loss prevention with pattern matching and risk scoring.

**Usage:**
```javascript
const dlpCheck = await aiService.detectDataLeakage({
  trafficData: {...},
  sensitivity: 'high'
});
```

**Detected Patterns:**
- Credit card numbers
- Social Security numbers
- Email addresses
- API keys and tokens
- Proprietary data markers

### 8. Analyze User Behavior
User activity profiling with anomaly detection and baseline comparison.

**Usage:**
```javascript
const behaviorAnalysis = await aiService.analyzeUserBehavior({
  userId: 'user_123',
  timeWindow: '7d',
  includeBaseline: true
});
```

### 9. Generate Compliance Report
Automated compliance reporting for regulatory frameworks.

**Usage:**
```javascript
const complianceReport = await aiService.generateComplianceReport({
  reportType: 'CIPA', // or 'COPPA', 'GDPR', 'HIPAA'
  startDate: '2026-01-01',
  endDate: '2026-01-31'
});
```

**Supported Frameworks:**
- **CIPA**: Children's Internet Protection Act
- **COPPA**: Children's Online Privacy Protection Act
- **GDPR**: General Data Protection Regulation
- **HIPAA**: Health Insurance Portability and Accountability Act

### 10. Analyze Threat Intelligence
Threat feed integration and automated rule updates.

**Usage:**
```javascript
const threatIntel = await aiService.analyzeThreatIntelligence({
  feedSource: 'abuse_ch', // or 'spamhaus', 'malwaredomains', 'phishtank'
  autoUpdate: true
});
```

---

## 💾 Database Schema

### Collections

#### urls
```javascript
{
  _id: ObjectId,
  url: String,
  domain: String,
  reputationScore: Number,
  category: String,
  isSafe: Boolean,
  threatLevel: String, // 'none', 'low', 'medium', 'high', 'critical'
  detectedThreats: [String],
  lastChecked: Date,
  checkCount: Number,
  metadata: {
    domainAge: Number,
    country: String,
    registrar: String,
    sslValid: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### filter_policies
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  type: String, // 'category', 'time_based', 'bandwidth', 'security'
  enabled: Boolean,
  priority: Number,
  action: String, // 'allow', 'block', 'throttle', 'inspect'
  conditions: {
    categories: [String],
    schedule: { days: String, hours: String },
    userGroups: [String]
  },
  exceptions: [String],
  appliesTo: String, // 'all_users', 'students', 'employees', etc.
  createdBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### user_activity
```javascript
{
  _id: ObjectId,
  userId: String,
  username: String,
  timestamp: Date,
  url: String,
  category: String,
  action: String, // 'allowed', 'blocked', 'throttled'
  bandwidth: Number, // bytes
  duration: Number, // seconds
  deviceInfo: {
    ip: String,
    userAgent: String,
    location: String
  },
  policyMatched: ObjectId
}
```

#### bandwidth_stats
```javascript
{
  _id: ObjectId,
  timeWindow: String, // 'hour', 'day', 'week', 'month'
  period: Date,
  totalBandwidth: Number,
  usageByCategory: [{
    category: String,
    bandwidth: Number,
    percentage: Number,
    users: Number
  }],
  topConsumers: [{
    userId: String,
    username: String,
    bandwidth: Number
  }],
  peakHour: String,
  recordedAt: Date
}
```

#### compliance_logs
```javascript
{
  _id: ObjectId,
  framework: String, // 'CIPA', 'COPPA', 'GDPR', 'HIPAA'
  eventType: String, // 'block', 'allow', 'policy_change', 'incident'
  userId: String,
  url: String,
  category: String,
  action: String,
  policyId: ObjectId,
  timestamp: Date,
  metadata: Object
}
```

---

## 🔐 Security Features

### URL Security
- **Reputation Scoring**: Multi-source reputation database
- **Threat Detection**: Malware, phishing, exploits, scams
- **SSL/TLS Analysis**: Certificate validation, cipher strength
- **Redirect Chain Following**: Track full redirect path
- **Domain Age Checking**: Flag newly registered domains

### Content Filtering
- **30+ Categories**: Comprehensive content classification
- **Custom Categories**: Define organization-specific categories
- **Multi-Language Support**: Content analysis in 50+ languages
- **Image Recognition**: Adult content detection in images
- **Video Analysis**: Streaming content classification

### Data Protection
- **DLP Rules**: Pattern-based data leakage detection
- **Encryption Detection**: Identify encrypted uploads
- **File Type Validation**: Block unauthorized file types
- **Upload Monitoring**: Track large file transfers
- **Cloud Storage Control**: Monitor cloud service usage

### Access Control
- **User Groups**: Role-based filtering policies
- **Time-Based Rules**: Schedule-aware blocking
- **Bandwidth Quotas**: Per-user/group limits
- **Device Policies**: Device-specific rules
- **Location Awareness**: Geographic restrictions

---

## 📊 Monitoring & Analytics

### Real-Time Dashboard
- Live traffic monitoring
- Threat detection alerts
- Bandwidth usage graphs
- User activity timeline
- Policy effectiveness metrics

### Reports
- **Daily Summary**: Blocked sites, top categories, bandwidth
- **Weekly Trends**: Usage patterns, anomalies, recommendations
- **Monthly Compliance**: Regulatory compliance status
- **Custom Reports**: Flexible query builder

### Alerts
- **Critical Threats**: Immediate notification
- **Policy Violations**: Configurable thresholds
- **Bandwidth Exceeded**: Quota warnings
- **Anomalous Behavior**: User activity outliers
- **System Health**: Service monitoring

---

## 🔗 Integrations

### Threat Intelligence Feeds
- **Abuse.ch**: Malware and botnet tracking
- **Spamhaus**: Spam and malware domains
- **PhishTank**: Phishing URL database
- **URLScan.io**: URL scanning and analysis
- **VirusTotal**: Multi-engine malware scanning

### Security Platforms
- **SIEM Integration**: Splunk, QRadar, LogRhythm
- **Firewall Sync**: Palo Alto, Cisco, Fortinet
- **Proxy Servers**: Squid, Blue Coat, Zscaler

### Authentication
- **Active Directory**: LDAP/AD integration
- **SAML 2.0**: SSO support
- **OAuth 2.0**: Third-party authentication
- **RADIUS**: Network authentication

---

## ⚙️ Configuration

### Core Settings

Configuration is managed through `browserisolation-config.json`:

```javascript
{
  "filtering": {
    "enabled": true,
    "mode": "active", // or "monitor"
    "defaultAction": "block",
    "categories": {
      "adult": { "enabled": true, "action": "block" },
      "gambling": { "enabled": true, "action": "block" },
      "social_media": { "enabled": true, "action": "allow", "schedule": "business_hours" }
    }
  },
  "security": {
    "sslInspection": true,
    "malwareScanning": true,
    "phishingProtection": true,
    "threatIntelligence": true
  },
  "bandwidth": {
    "throttling": {
      "enabled": true,
      "categories": ["streaming", "file_sharing"],
      "limit": "2 Mbps"
    }
  },
  "dlp": {
    "enabled": true,
    "patterns": ["credit_card", "ssn", "api_key"],
    "action": "block"
  }
}
```

### Policy Examples

**School Configuration:**
```javascript
{
  "organizationType": "school",
  "blockedCategories": [
    "adult", "gambling", "weapons", "drugs",
    "social_media", "gaming", "streaming"
  ],
  "scheduleRules": {
    "social_media": {
      "block": "Mon-Fri 08:00-15:00",
      "allow": "Mon-Fri 15:00-17:00, Sat-Sun all"
    }
  },
  "safeSearch": "enforced"
}
```

**Enterprise Configuration:**
```javascript
{
  "organizationType": "enterprise",
  "blockedCategories": [
    "adult", "gambling", "malware", "phishing",
    "personal_email", "file_sharing"
  ],
  "bandwidthRules": {
    "streaming": { "limit": "1 Mbps", "quota": "500 MB/day" },
    "file_sharing": { "limit": "2 Mbps", "allowed_services": ["OneDrive", "SharePoint"] }
  },
  "dlp": {
    "block_uploads": ["credit_card", "ssn", "confidential"],
    "alert_on": ["large_file_transfer", "external_email"]
  }
}
```

---

## 📈 Compliance

BrowserIsolation supports compliance with:

### Education Sector
- **CIPA** (Children's Internet Protection Act)
  - Block harmful content
  - Monitor internet safety
  - Audit logging

- **COPPA** (Children's Online Privacy Protection Act)
  - Protect student data
  - Restrict data collection
  - Parental consent tracking

- **FERPA** (Family Educational Rights and Privacy Act)
  - Student record protection
  - Access control
  - Privacy audit trails

### Enterprise & Healthcare
- **GDPR** (General Data Protection Regulation)
  - Data minimization
  - Right to access
  - Breach notification

- **HIPAA** (Health Insurance Portability and Accountability Act)
  - PHI protection
  - Encryption requirements
  - Audit controls

- **SOX** (Sarbanes-Oxley Act)
  - Financial data security
  - Access logging
  - Change management

### Government
- **FISMA** (Federal Information Security Management Act)
  - Risk assessment
  - Security controls
  - Continuous monitoring

- **NIST** Framework
  - Identify, Protect, Detect, Respond, Recover
  - Cybersecurity controls

---

## 🧪 Testing

```bash
# Unit Tests
npm run test

# Integration Tests
npm run test:integration

# E2E Tests
npm run test:e2e

# Performance Tests
npm run test:performance

# Coverage Report
npm run test:coverage
```

---

## 📝 Usage Examples

### Analyze URL
```javascript
const urlAnalysis = await browserisolationAPI.analyzeURL({
  url: 'https://example.com/page',
  checkRedirects: true,
  deepScan: false
});

if (!urlAnalysis.isSafe) {
  console.log(`Threats detected: ${urlAnalysis.detectedThreats.join(', ')}`);
}
```

### Create Filtering Policy
```javascript
const policy = await browserisolationAPI.createPolicy({
  name: 'Block Social Media During Work Hours',
  type: 'time_based',
  enabled: true,
  action: 'block',
  conditions: {
    categories: ['social_media'],
    schedule: { days: 'Mon-Fri', hours: '09:00-17:00' }
  },
  appliesTo: 'all_users'
});
```

### Monitor Bandwidth
```javascript
const bandwidthStats = await browserisolationAPI.getBandwidthStats({
  timeRange: 'week',
  groupBy: 'category'
});

bandwidthStats.topConsumers.forEach(consumer => {
  console.log(`${consumer.category}: ${consumer.bandwidth} GB`);
});
```

### Generate Compliance Report
```javascript
const report = await browserisolationAPI.generateComplianceReport({
  reportType: 'CIPA',
  startDate: '2026-01-01',
  endDate: '2026-01-31'
});

console.log(`Compliance Score: ${report.complianceScore}`);
console.log(`Blocked Requests: ${report.summary.blockedRequests}`);
```

---

## 🛠️ Development

### Project Structure
```
36-browserisolation/
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API & AI clients
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Utility functions
│   ├── browserisolation-config.json
│   └── package.json
│
├── backend/
│   ├── api/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   └── services/
│   │   └── package.json
│   │
│   ├── ai-assistant/
│   │   ├── src/
│   │   │   ├── server.js
│   │   │   └── functionExecutor.js
│   │   └── package.json
│   │
│   └── engine/
│       ├── src/
│       ├── Makefile
│       └── README.md
│
└── README.md
```

### Adding New AI Functions

1. **Define function in config**:
```javascript
// browserisolation-config.json
{
  "aiFunction": {
    "name": "new_function",
    "description": "Function description",
    "parameters": {...}
  }
}
```

2. **Implement executor**:
```javascript
// functionExecutor.js
function newFunction(params) {
  // Implementation
  return result;
}
```

3. **Add to server**:
```javascript
// server.js
{
  name: 'new_function',
  description: 'Function description',
  parameters: {...}
}
```

4. **Create client method**:
```typescript
// aiService.ts
async newFunction(params) {
  return this.sendMessage('new_function', params);
}
```

---

## 🐛 Troubleshooting

### Common Issues

**High False Positive Rate**
```javascript
// Adjust sensitivity in config
{
  "filtering": {
    "sensitivity": "medium", // Change from "high"
    "whitelistDomains": ["trusted-domain.com"]
  }
}
```

**SSL Inspection Not Working**
```bash
# Install root certificate on client devices
sudo cp browserisolation-ca.crt /usr/local/share/ca-certificates/
sudo update-ca-certificates
```

**Bandwidth Monitoring Inaccurate**
```bash
# Check MongoDB indexes
db.user_activity.getIndexes()

# Rebuild aggregation pipeline
npm run rebuild-bandwidth-stats
```

**AI WebSocket Connection Failed**
```bash
# Verify AI assistant is running
curl http://localhost:6036/health

# Check firewall
sudo ufw allow 6036
```

---

## 📚 Additional Resources

- [API Documentation](./API.md)
- [AI Functions Guide](./AI_FUNCTIONS.md)
- [Policy Configuration Guide](./POLICIES.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Performance Tuning](./PERFORMANCE.md)
- [Compliance Guide](./COMPLIANCE.md)

---

## 📜 License

Part of the VictoryKit AI Security Suite

---

## 👥 Support

For issues and questions:
- GitHub Issues: [VictoryKit Issues](https://github.com/victorykit/issues)
- Documentation: [VictoryKit Docs](https://docs.victorykit.com)

---

**BrowserIsolation - Intelligent Web Protection for the Modern Enterprise** 🛡️🌐
