# EmailDefender - Enterprise Email Security & Protection Platform

**Tool #35** | Enterprise-grade email security with AI-powered threat detection and comprehensive protection

## 🎯 Overview

EmailDefender is a sophisticated email security platform that provides comprehensive protection against modern email threats including phishing, malware, Business Email Compromise (BEC), spoofing, and spam. Powered by Google's Gemini 1.5 Pro AI, it delivers real-time threat analysis, intelligent content classification, and automated security policy management.

### Key Features

- **🛡️ Multi-Layer Threat Detection**: Phishing, malware, BEC, spoofing, spam
- **🤖 AI-Powered Analysis**: 10 specialized Gemini 1.5 Pro functions
- **📧 Email Authentication**: SPF, DKIM, DMARC, ARC, BIMI validation
- **🔒 Content Security**: DLP, attachment scanning, URL analysis
- **📊 Real-Time Monitoring**: Threat landscape visualization and alerts
- **⚙️ Policy Management**: Automated policy recommendations and enforcement
- **📈 Compliance**: GDPR, HIPAA, SOX, PCI-DSS, CCPA support
- **🔗 Integrations**: Microsoft 365, Google Workspace, VirusTotal, AbuseIPDB

---

## 🏗️ Architecture

### System Components

```
EmailDefender (Tool #35)
├── Frontend (React + TypeScript + Vite)
│   ├── Port: 3035
│   ├── AI WebSocket: ws://localhost:6035
│   └── API: http://localhost:4035
│
├── Backend API (Node.js + Express)
│   ├── Port: 4035
│   ├── Email Processing Engine
│   ├── Threat Intelligence APIs
│   ├── Quarantine Management
│   └── Policy Engine
│
├── AI Assistant (WebSocket Server)
│   ├── Port: 6035
│   ├── Gemini 1.5 Pro Integration
│   └── 10 Specialized AI Functions
│
├── ML Engine (Python)
│   ├── Port: 8035
│   ├── Custom ML Models
│   └── Pattern Recognition
│
└── Database (MongoDB)
    └── emaildefender_db
```

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| Backend API | Node.js, Express, MongoDB |
| AI Engine | Google Gemini 1.5 Pro, WebSocket |
| ML Engine | Python, scikit-learn, TensorFlow |
| Database | MongoDB 7.0+ |
| Authentication | SPF, DKIM, DMARC, ARC, BIMI |

---

## 🚀 Quick Start

### Prerequisites

```bash
# Required
Node.js >= 18.0.0
MongoDB >= 7.0.0
Python >= 3.9
```

### Installation

```bash
# 1. Frontend Setup
cd frontend/tools/35-emaildefender
npm install
npm run dev  # Runs on port 3035

# 2. Backend API Setup
cd backend/tools/35-emaildefender/api
npm install
npm start    # Runs on port 4035

# 3. AI Assistant Setup
cd backend/tools/35-emaildefender/ai-assistant
npm install
npm start    # Runs on port 6035

# 4. ML Engine Setup
cd backend/tools/35-emaildefender/ml-engine
pip install -r requirements.txt
python app.py  # Runs on port 8035
```

### Environment Variables

Create `.env` files in each service directory:

**Frontend (.env)**:
```bash
VITE_API_URL=http://localhost:4035
VITE_WS_URL=ws://localhost:6035
```

**Backend API (.env)**:
```bash
PORT=4035
MONGODB_URI=mongodb://localhost:27017/emaildefender_db
VIRUSTOTAL_API_KEY=your_key
ABUSEIPDB_API_KEY=your_key
SENDGRID_API_KEY=your_key
```

**AI Assistant (.env)**:
```bash
PORT=6035
GEMINI_API_KEY=your_gemini_api_key
```

---

## 📡 API Reference

### Core Endpoints

#### Email Processing
```http
POST /api/emails/process
Content-Type: application/json

{
  "from": "sender@example.com",
  "to": ["recipient@company.com"],
  "subject": "Invoice #12345",
  "body": "Please review the attached invoice...",
  "attachments": [...]
}
```

#### Threat Analysis
```http
GET /api/analysis/:emailId
```

#### Quarantine Management
```http
GET /api/quarantine
POST /api/quarantine/:itemId/release
POST /api/quarantine/:itemId/delete
```

#### Policy Management
```http
GET /api/policies
POST /api/policies
PUT /api/policies/:id
DELETE /api/policies/:id
```

#### Real-Time Stats
```http
GET /api/stats/realtime
GET /api/stats/threats
GET /api/dashboard
```

### Full API Documentation

See [API.md](./API.md) for complete endpoint documentation with request/response examples.

---

## 🤖 AI Functions

EmailDefender includes 10 specialized AI functions powered by Gemini 1.5 Pro:

### 1. Analyze Email Threat
Comprehensive threat analysis with multi-vector detection.

**Usage:**
```javascript
const analysis = await aiService.analyzeEmailThreat({
  emailId: 'msg_12345',
  includeAttachments: true,
  deepScan: true
});
```

**Response:**
```javascript
{
  threatLevel: 'high',
  overallScore: 0.78,
  threatTypes: ['phishing', 'spoofing'],
  indicators: [
    {
      type: 'url',
      value: 'suspicious-link.com',
      severity: 'high',
      confidence: 0.88
    }
  ],
  recommendations: ['Quarantine email immediately', 'Block sender domain']
}
```

### 2. Classify Email Content
Intelligent categorization and sensitivity classification.

**Usage:**
```javascript
const classification = await aiService.classifyEmailContent({
  emailId: 'msg_12345',
  classificationScheme: 'default'
});
```

### 3. Detect Phishing Attempt
Specialized phishing detection with brand impersonation analysis.

**Usage:**
```javascript
const phishingCheck = await aiService.detectPhishing({
  emailContent: 'email_text',
  senderHistory: true
});
```

### 4. Analyze Attachment Risk
Malware scanning and sandboxing for email attachments.

**Usage:**
```javascript
const attachmentAnalysis = await aiService.analyzeAttachmentRisk({
  attachmentId: 'att_67890',
  sandboxAnalysis: true
});
```

### 5. Assess Sender Reputation
Comprehensive sender reputation and authentication validation.

**Usage:**
```javascript
const senderRep = await aiService.assessSenderReputation({
  senderEmail: 'sender@domain.com',
  senderDomain: 'domain.com'
});
```

### 6. Generate Policy Recommendation
AI-powered security policy suggestions based on threat patterns.

**Usage:**
```javascript
const policyRecs = await aiService.generatePolicyRecommendation({
  threatData: {...},
  currentPolicies: [...]
});
```

### 7. Investigate Email Chain
Thread analysis for detecting anomalous patterns.

**Usage:**
```javascript
const chainAnalysis = await aiService.investigateEmailChain({
  threadId: 'thread_abc',
  lookbackDays: 30
});
```

### 8. Detect BEC Attempt
Business Email Compromise detection with executive impersonation analysis.

**Usage:**
```javascript
const becCheck = await aiService.detectBEC({
  emailContent: 'email_text',
  executiveList: ['ceo@company.com']
});
```

### 9. Summarize Threat Landscape
Aggregate threat intelligence and trend analysis.

**Usage:**
```javascript
const threatSummary = await aiService.summarizeThreatLandscape({
  timePeriod: 'week',
  includeRecommendations: true
});
```

### 10. Analyze URL Safety
URL reputation and redirection chain analysis.

**Usage:**
```javascript
const urlAnalysis = await aiService.analyzeURLSafety({
  url: 'https://suspicious-link.com',
  followRedirects: true
});
```

---

## 💾 Database Schema

### Collections

#### emails
```javascript
{
  _id: ObjectId,
  messageId: String,
  from: { email: String, name: String },
  to: [{ email: String, name: String }],
  subject: String,
  body: String,
  htmlBody: String,
  headers: Object,
  attachments: [{
    filename: String,
    contentType: String,
    size: Number,
    checksum: String
  }],
  receivedDate: Date,
  processedDate: Date,
  status: String, // 'clean', 'flagged', 'quarantined', 'blocked'
  threatScore: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### email_analyses
```javascript
{
  _id: ObjectId,
  emailId: ObjectId,
  threatLevel: String, // 'none', 'low', 'medium', 'high', 'critical'
  overallScore: Number,
  threatTypes: [String], // ['phishing', 'malware', 'bec', 'spam']
  indicators: [{
    type: String,
    value: String,
    severity: String,
    confidence: Number
  }],
  authentication: {
    spf: String, // 'pass', 'fail', 'neutral'
    dkim: String,
    dmarc: String,
    arc: String
  },
  recommendations: [String],
  analyzedBy: String, // 'ai', 'engine', 'manual'
  analyzedAt: Date
}
```

#### quarantine_items
```javascript
{
  _id: ObjectId,
  emailId: ObjectId,
  reason: String,
  quarantinedBy: String,
  quarantinedAt: Date,
  expiresAt: Date,
  status: String, // 'quarantined', 'released', 'deleted'
  reviewedBy: String,
  reviewedAt: Date,
  notes: String
}
```

#### email_policies
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  type: String, // 'inbound', 'outbound', 'internal'
  enabled: Boolean,
  priority: Number,
  conditions: [{
    field: String,
    operator: String,
    value: String
  }],
  actions: [String], // ['quarantine', 'block', 'encrypt', 'alert']
  createdBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Security Features

### Email Authentication
- **SPF** (Sender Policy Framework): Validates sender IP authorization
- **DKIM** (DomainKeys Identified Mail): Cryptographic email signing
- **DMARC** (Domain-based Message Authentication): Policy enforcement
- **ARC** (Authenticated Received Chain): Forward chain validation
- **BIMI** (Brand Indicators for Message Identification): Logo verification

### Threat Detection
- **Phishing Detection**: URL analysis, brand impersonation, urgency scoring
- **Malware Scanning**: Attachment analysis, sandboxing, signature matching
- **BEC Prevention**: Executive impersonation, financial request detection
- **Spoofing Protection**: Header validation, domain similarity analysis
- **Spam Filtering**: Content analysis, sender reputation, pattern matching

### Content Security
- **DLP** (Data Loss Prevention): Sensitive data detection and protection
- **Attachment Filtering**: File type validation, size limits, malware scanning
- **URL Analysis**: Reputation checking, redirect chain following
- **Content Analysis**: Sentiment analysis, keyword detection
- **Encryption**: S/MIME and PGP support

---

## 📊 Monitoring & Alerts

### Real-Time Dashboard
- Threat level visualization
- Email processing metrics
- Quarantine queue status
- Policy effectiveness
- Authentication success rates

### Alert Types
- **Critical Threats**: Immediate notification
- **Policy Violations**: Configurable alerts
- **Unusual Activity**: Anomaly detection
- **System Health**: Service monitoring

---

## 🔗 Integrations

### Email Platforms
- Microsoft 365 / Exchange
- Google Workspace
- SMTP Gateway

### Threat Intelligence
- VirusTotal
- AbuseIPDB
- PhishTank
- URLScan.io

### Email Security
- Proofpoint
- Mimecast
- Barracuda

### Delivery Services
- SendGrid
- Mailgun
- Amazon SES

---

## ⚙️ Configuration

### Core Settings

Configuration is managed through `emaildefender-config.json`:

```javascript
{
  "threatDetection": {
    "phishing": {
      "enabled": true,
      "sensitivity": "high",
      "checkBrandImpersonation": true
    },
    "malware": {
      "enabled": true,
      "sandboxing": true,
      "realTimeScan": true
    }
  },
  "emailAuthentication": {
    "spf": { "enforce": true, "strictMode": false },
    "dkim": { "enforce": true, "requiredHeaders": ["from", "subject"] },
    "dmarc": { "enforce": true, "policy": "quarantine" }
  },
  "contentAnalysis": {
    "dlp": {
      "enabled": true,
      "patterns": ["ssn", "credit_card", "api_key"]
    }
  }
}
```

### Environment-Specific Config

- **Development**: Relaxed policies, verbose logging
- **Staging**: Production-like settings with test accounts
- **Production**: Strict enforcement, minimal logging

---

## 📈 Compliance

EmailDefender supports compliance with:

- **GDPR**: Email data retention and user privacy
- **HIPAA**: Protected health information handling
- **SOX**: Financial data protection
- **PCI-DSS**: Payment card information security
- **CCPA**: California consumer privacy

### Audit Logging
All email processing, policy changes, and security events are logged for compliance auditing.

---

## 🧪 Testing

```bash
# Unit Tests
npm run test

# Integration Tests
npm run test:integration

# E2E Tests
npm run test:e2e

# Coverage Report
npm run test:coverage
```

---

## 📝 Usage Examples

### Process Incoming Email
```javascript
const response = await emaildefenderAPI.processEmail({
  from: 'sender@domain.com',
  to: ['recipient@company.com'],
  subject: 'Project Update',
  body: 'Email content...',
  attachments: []
});
```

### Check Quarantine
```javascript
const quarantine = await emaildefenderAPI.getQuarantine({
  page: 1,
  limit: 20,
  status: 'quarantined'
});
```

### Create Security Policy
```javascript
const policy = await emaildefenderAPI.createPolicy({
  name: 'Block Suspicious Domains',
  type: 'inbound',
  enabled: true,
  conditions: [
    { field: 'sender_domain_age', operator: '<', value: '30' },
    { field: 'contains_links', operator: '=', value: 'true' }
  ],
  actions: ['quarantine', 'notify_admin']
});
```

### Real-Time Threat Monitoring
```javascript
const stats = await emaildefenderAPI.getRealtimeStats();
console.log(`Threats Blocked: ${stats.threatsBlocked}`);
console.log(`Emails Quarantined: ${stats.quarantined}`);
```

---

## 🛠️ Development

### Project Structure
```
35-emaildefender/
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API & AI clients
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Utility functions
│   ├── emaildefender-config.json
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
│   └── ml-engine/
│       ├── models/
│       ├── app.py
│       └── requirements.txt
│
└── README.md
```

### Adding New AI Functions

1. **Define function in config**:
```javascript
// emaildefender-config.json
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
case 'new_function':
  return newFunction(parameters);
```

4. **Create client method**:
```javascript
// aiService.ts
async newFunction(params) {
  return this.sendMessage('new_function', params);
}
```

---

## 🐛 Troubleshooting

### Common Issues

**WebSocket Connection Failed**
```bash
# Check AI assistant is running
curl http://localhost:6035/health

# Verify firewall allows port 6035
sudo ufw allow 6035
```

**Email Processing Slow**
```bash
# Check MongoDB performance
db.emails.getIndexes()

# Increase worker threads
WORKER_THREADS=8 npm start
```

**High False Positive Rate**
```javascript
// Adjust sensitivity in config
{
  "threatDetection": {
    "phishing": {
      "sensitivity": "medium" // Change from "high"
    }
  }
}
```

---

## 📚 Additional Resources

- [API Documentation](./API.md)
- [AI Functions Guide](./AI_FUNCTIONS.md)
- [Security Best Practices](./SECURITY.md)
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

**EmailDefender - Protecting Your Email Infrastructure with AI-Powered Intelligence** 🛡️✉️
