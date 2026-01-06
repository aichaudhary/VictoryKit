# RiskScoreAI

**AI-Powered Cyber Risk Quantification and Security Scoring Platform**

RiskScoreAI is an enterprise-grade cybersecurity risk quantification platform that provides comprehensive security scoring for organizations and their vendors. Similar to industry solutions like SecurityScorecard, it delivers real-time visibility into security posture through non-intrusive external data collection and AI-powered analysis.

![RiskScoreAI Dashboard](https://via.placeholder.com/800x400/0F172A/F59E0B?text=RiskScoreAI+Dashboard)

## 🎯 Overview

| Property | Value |
|----------|-------|
| **Tool ID** | 29 |
| **Domain** | riskscoreai.maula.ai |
| **Frontend Port** | 3029 |
| **API Port** | 4029 |
| **WebSocket Port** | 6029 |
| **ML Service Port** | 8029 |
| **Theme Color** | #F59E0B (Amber) |
| **Status** | In Development |

## ✨ Features

### Core Capabilities

- **🎯 Security Scoring** - Comprehensive 0-100 risk scores with A-F grading (like credit scores for cybersecurity)
- **🏢 Organization Management** - Monitor and manage security posture for multiple organizations
- **🤝 Vendor Risk Management** - Continuous third-party risk monitoring with tier classification
- **📊 10 Risk Factors** - Holistic assessment across network security, DNS health, patching, endpoint, web app security, leaked credentials, social engineering, email security, brand reputation, and IP reputation
- **💰 Risk Quantification** - FAIR-based financial risk calculation (Annual Loss Expectancy, VaR)
- **🔧 Remediation Center** - AI-generated remediation recommendations with step-by-step workflows
- **📈 Trend Analysis** - Historical tracking and AI-powered predictive analytics
- **📋 Compliance Mapping** - Map findings to NIST CSF, ISO 27001, SOC 2, PCI-DSS, GDPR, HIPAA
- **🤖 AI Assistant** - Conversational interface for risk analysis and recommendations

### Key Features by Panel

| Panel | Description |
|-------|-------------|
| **Dashboard** | Overall security score with gauge visualization, trend charts, high-risk vendors, top findings |
| **Organizations** | Manage monitored organizations with search, filtering, and detailed views |
| **Vendor Risk** | Third-party vendor management with tier classification (Critical/High/Medium/Low) |
| **Risk Factors** | Accordion-style exploration of 10 risk factors with finding details |
| **Remediations** | Workflow management with progress tracking and AI recommendations |
| **Reports** | Generate executive, technical, compliance, and trend reports |
| **Benchmarks** | Industry peer comparison with percentile rankings |
| **AI Assistant** | Chat interface for natural language risk analysis |
| **Settings** | Configuration for notifications, integrations, and AI preferences |

---

## 🏗️ Architecture

### Tech Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (3029)                          │
├─────────────────────────────────────────────────────────────────┤
│  React 19 + TypeScript + Vite + Tailwind CSS + Lucide React    │
│  Recharts for data visualization                                │
│  Socket.io-client for real-time updates                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (4029)                         │
├─────────────────────────────────────────────────────────────────┤
│  Express.js REST API                                            │
│  JWT Authentication                                             │
│  Rate Limiting & Request Validation                             │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  WEBSOCKET SVC  │ │   ML SERVICE    │ │   WORKER SVC    │
│     (6029)      │ │     (8029)      │ │   Background    │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ Real-time score │ │ Score calc AI   │ │ Scheduled scans │
│ updates & alerts│ │ Risk prediction │ │ Data collection │
└─────────────────┘ └─────────────────┘ └─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     MONGODB DATABASE                            │
├─────────────────────────────────────────────────────────────────┤
│  Organizations, Vendors, Findings, Scores, Reports, etc.       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Frontend Structure

```
frontend/tools/29-riskscoreai/
├── index.html                    # HTML entry point
├── package.json                  # Dependencies and scripts
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── riskscoreai-config.json      # Tool configuration
├── public/
│   └── favicon.svg              # Favicon
└── src/
    ├── main.tsx                 # Application entry point
    ├── App.tsx                  # Main application component
    ├── index.css                # Global styles (amber theme)
    ├── types.ts                 # TypeScript type definitions
    ├── constants.ts             # Constants, theme, navigation
    ├── components/
    │   ├── index.ts             # Barrel export
    │   ├── RiskDashboard.tsx    # Main dashboard with score gauge
    │   ├── OrganizationsPanel.tsx  # Organization management
    │   ├── VendorRiskPanel.tsx  # Vendor risk management
    │   ├── RiskFactorsPanel.tsx # Risk factors accordion
    │   ├── RemediationsPanel.tsx # Remediation workflows
    │   ├── ReportsPanel.tsx     # Report generation
    │   ├── BenchmarksPanel.tsx  # Industry benchmarking
    │   ├── AIAssistantPanel.tsx # AI chat interface
    │   └── SettingsPanel.tsx    # Settings configuration
    └── services/
        ├── index.ts             # Services barrel export
        ├── riskscoreAPI.ts      # REST API client
        └── riskscore-tools.ts   # AI function definitions
```

### Component Breakdown

| Component | Lines | Description |
|-----------|-------|-------------|
| `App.tsx` | ~200 | Main app with sidebar navigation and content routing |
| `RiskDashboard.tsx` | ~250 | Score gauge, stats cards, trend chart, top findings |
| `OrganizationsPanel.tsx` | ~200 | Organization list with CRUD operations |
| `VendorRiskPanel.tsx` | ~300 | Vendor table with drawer details |
| `RiskFactorsPanel.tsx` | ~200 | Accordion with 10 risk factors |
| `RemediationsPanel.tsx` | ~200 | Remediation cards with progress |
| `ReportsPanel.tsx` | ~200 | Report type cards and list |
| `BenchmarksPanel.tsx` | ~250 | Peer comparison visualizations |
| `AIAssistantPanel.tsx` | ~200 | Chat interface with mock responses |
| `SettingsPanel.tsx` | ~300 | Tabbed settings (4 sections) |

---

## 🔧 Backend Structure

```
backend/tools/29-riskscoreai/
├── package.json                  # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── src/
│   ├── index.ts                 # Application entry point
│   ├── app.ts                   # Express app configuration
│   ├── config/
│   │   ├── index.ts             # Configuration exports
│   │   ├── database.ts          # MongoDB connection
│   │   └── constants.ts         # Backend constants
│   ├── routes/
│   │   ├── index.ts             # Route aggregation
│   │   ├── dashboard.ts         # Dashboard statistics
│   │   ├── organizations.ts     # Organization CRUD
│   │   ├── vendors.ts           # Vendor risk management
│   │   ├── findings.ts          # Security findings
│   │   ├── remediations.ts      # Remediation workflows
│   │   ├── reports.ts           # Report generation
│   │   ├── benchmarks.ts        # Industry benchmarking
│   │   ├── scores.ts            # Score calculations
│   │   ├── compliance.ts        # Compliance mapping
│   │   └── ai.ts                # AI function execution
│   ├── controllers/
│   │   ├── DashboardController.ts
│   │   ├── OrganizationController.ts
│   │   ├── VendorController.ts
│   │   ├── FindingController.ts
│   │   ├── RemediationController.ts
│   │   ├── ReportController.ts
│   │   ├── BenchmarkController.ts
│   │   ├── ScoreController.ts
│   │   └── AIController.ts
│   ├── services/
│   │   ├── ScoringEngine.ts     # Risk score calculations
│   │   ├── DataCollector.ts     # External data collection
│   │   ├── VendorScanner.ts     # Vendor domain scanning
│   │   ├── QuantificationEngine.ts # FAIR risk quantification
│   │   ├── RemediationGenerator.ts # AI remediation suggestions
│   │   ├── BenchmarkService.ts  # Peer comparison logic
│   │   ├── ReportGenerator.ts   # Report creation
│   │   └── AIService.ts         # LLM integration
│   ├── models/
│   │   ├── Organization.ts      # Organization schema
│   │   ├── Vendor.ts            # Vendor schema
│   │   ├── Finding.ts           # Finding schema
│   │   ├── RiskScore.ts         # Score schema
│   │   ├── Remediation.ts       # Remediation schema
│   │   ├── Report.ts            # Report schema
│   │   └── Benchmark.ts         # Benchmark schema
│   ├── middleware/
│   │   ├── auth.ts              # JWT authentication
│   │   ├── validation.ts        # Request validation
│   │   └── rateLimit.ts         # Rate limiting
│   └── utils/
│       ├── scoring.ts           # Score calculation utilities
│       ├── grading.ts           # Grade assignment
│       └── risk-factors.ts      # Risk factor definitions
└── tests/
    ├── scoring.test.ts          # Scoring engine tests
    └── api.test.ts              # API integration tests
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/riskscore/dashboard` | GET | Dashboard statistics |
| `/api/v1/riskscore/organizations` | GET/POST | Organization management |
| `/api/v1/riskscore/organizations/:id` | GET/PUT/DELETE | Single organization |
| `/api/v1/riskscore/vendors` | GET/POST | Vendor management |
| `/api/v1/riskscore/vendors/:id` | GET/PUT/DELETE | Single vendor |
| `/api/v1/riskscore/vendors/:id/scan` | POST | Trigger vendor scan |
| `/api/v1/riskscore/findings` | GET/POST | Finding management |
| `/api/v1/riskscore/remediations` | GET/POST | Remediation workflows |
| `/api/v1/riskscore/reports` | GET/POST | Report management |
| `/api/v1/riskscore/reports/generate` | POST | Generate new report |
| `/api/v1/riskscore/benchmark` | GET | Industry benchmarks |
| `/api/v1/riskscore/trends` | GET | Historical trends |
| `/api/v1/riskscore/quantify` | POST | Financial risk quantification |
| `/api/v1/riskscore/compliance/:framework` | GET | Compliance mapping |
| `/api/v1/riskscore/ai/execute` | POST | Execute AI function |
| `/api/v1/riskscore/ai/chat` | POST | AI chat interface |
| `/api/v1/riskscore/settings` | GET/PUT | User settings |

---

## 🗄️ Database Schema

### MongoDB Collections

```javascript
// organizations collection
{
  _id: ObjectId,
  name: String,                    // "Acme Corporation"
  domain: String,                  // "acme.com"
  industry: String,                // "Technology"
  size: String,                    // "enterprise" | "large" | "medium" | "small"
  overallScore: Number,            // 0-100
  grade: String,                   // "A" | "B" | "C" | "D" | "F"
  riskFactorScores: [{             // 10 risk factors
    factor: String,
    score: Number,
    weight: Number,
    findingsCount: Number
  }],
  complianceFrameworks: [String],  // ["soc2", "gdpr", "pci_dss"]
  lastScanned: Date,
  createdAt: Date,
  updatedAt: Date
}

// vendors collection
{
  _id: ObjectId,
  organizationId: ObjectId,        // Parent organization
  name: String,                    // "CloudProvider Inc"
  domain: String,                  // "cloudprovider.com"
  tier: Number,                    // 1 (critical) - 4 (low)
  criticality: String,             // "critical" | "high" | "medium" | "low"
  score: Number,                   // 0-100
  grade: String,                   // A-F
  status: String,                  // "active" | "inactive" | "onboarding" | "offboarding"
  category: String,                // "Cloud Infrastructure" | "SaaS" | etc.
  contractValue: Number,           // Annual contract value
  dataAccess: [String],           // ["customer_pii", "financial_data"]
  lastAssessment: Date,
  riskFactorScores: [...],
  createdAt: Date,
  updatedAt: Date
}

// findings collection
{
  _id: ObjectId,
  organizationId: ObjectId,
  vendorId: ObjectId,              // Optional - if vendor-related
  riskFactor: String,              // "network_security"
  severity: String,                // "critical" | "high" | "medium" | "low" | "info"
  title: String,                   // "Open port detected on production server"
  description: String,             // Detailed description
  evidence: [{                     // Supporting evidence
    type: String,
    data: Mixed
  }],
  firstDetected: Date,
  lastSeen: Date,
  status: String,                  // "new" | "open" | "in_progress" | "resolved" | "accepted"
  remediationId: ObjectId,         // Link to remediation if exists
  cvss: Number,                    // CVSS score if applicable
  cwe: String,                     // CWE ID if applicable
  affectedAssets: [String],
  createdAt: Date,
  updatedAt: Date
}

// risk_scores collection (historical)
{
  _id: ObjectId,
  organizationId: ObjectId,
  vendorId: ObjectId,              // Optional
  score: Number,                   // 0-100
  grade: String,                   // A-F
  riskFactorScores: [{...}],
  calculatedAt: Date,
  source: String,                  // "scheduled" | "manual" | "event"
  changes: [{
    factor: String,
    previousScore: Number,
    newScore: Number,
    reason: String
  }]
}

// remediations collection
{
  _id: ObjectId,
  organizationId: ObjectId,
  findingIds: [ObjectId],          // Related findings
  title: String,
  description: String,
  priority: String,                // "critical" | "high" | "medium" | "low"
  status: String,                  // "pending" | "in_progress" | "completed" | "blocked"
  progress: Number,                // 0-100
  estimatedImpact: Number,         // Score improvement expected
  steps: [{
    order: Number,
    title: String,
    description: String,
    completed: Boolean,
    completedAt: Date
  }],
  assignee: String,
  dueDate: Date,
  completedAt: Date,
  aiGenerated: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// reports collection
{
  _id: ObjectId,
  organizationId: ObjectId,
  type: String,                    // "executive" | "technical" | "compliance" | "vendor" | "trend"
  title: String,
  format: String,                  // "pdf" | "json" | "csv"
  parameters: {
    dateRange: { start: Date, end: Date },
    includeVendors: Boolean,
    framework: String,             // For compliance reports
    // etc.
  },
  generatedAt: Date,
  fileUrl: String,                 // S3/storage URL
  size: Number,                    // File size in bytes
  createdBy: ObjectId,             // User ID
  status: String                   // "generating" | "completed" | "failed"
}

// benchmarks collection
{
  _id: ObjectId,
  industry: String,
  organizationSize: String,
  period: String,                  // "2024-Q1"
  sampleSize: Number,
  statistics: {
    mean: Number,
    median: Number,
    percentile25: Number,
    percentile75: Number,
    min: Number,
    max: Number
  },
  riskFactorStats: [{
    factor: String,
    mean: Number,
    median: Number
  }],
  distribution: [{                 // Score distribution
    range: String,                 // "90-100", "80-89", etc.
    count: Number,
    percentage: Number
  }],
  updatedAt: Date
}

// settings collection
{
  _id: ObjectId,
  userId: ObjectId,
  organizationId: ObjectId,
  notifications: {
    email: Boolean,
    scoreChanges: Boolean,
    newFindings: Boolean,
    weeklyDigest: Boolean,
    vendorAlerts: Boolean
  },
  thresholds: {
    criticalScore: Number,
    vendorMinScore: Number
  },
  integrations: {
    slack: { enabled: Boolean, webhookUrl: String },
    jira: { enabled: Boolean, projectKey: String },
    servicenow: { enabled: Boolean, instanceUrl: String }
  },
  aiPreferences: {
    autoRemediation: Boolean,
    riskPrediction: Boolean,
    model: String
  },
  updatedAt: Date
}
```

### Indexes

```javascript
// Performance indexes
db.organizations.createIndex({ domain: 1 }, { unique: true });
db.organizations.createIndex({ overallScore: 1 });
db.organizations.createIndex({ industry: 1, size: 1 });

db.vendors.createIndex({ organizationId: 1, domain: 1 }, { unique: true });
db.vendors.createIndex({ tier: 1, score: 1 });
db.vendors.createIndex({ status: 1 });

db.findings.createIndex({ organizationId: 1, status: 1 });
db.findings.createIndex({ vendorId: 1 });
db.findings.createIndex({ riskFactor: 1, severity: 1 });
db.findings.createIndex({ lastSeen: -1 });

db.risk_scores.createIndex({ organizationId: 1, calculatedAt: -1 });
db.risk_scores.createIndex({ vendorId: 1, calculatedAt: -1 });

db.remediations.createIndex({ organizationId: 1, status: 1 });
db.remediations.createIndex({ priority: 1, status: 1 });

db.reports.createIndex({ organizationId: 1, generatedAt: -1 });
db.reports.createIndex({ type: 1 });

db.benchmarks.createIndex({ industry: 1, organizationSize: 1, period: 1 });
```

---

## 🤖 AI Functions (MCP Tools)

RiskScoreAI exposes 8 AI functions for integration with the Model Context Protocol:

| Function | Description |
|----------|-------------|
| `calculate_risk_score` | Calculate comprehensive security risk score for an organization |
| `assess_vendor_risk` | Perform deep risk assessment on third-party vendor domains |
| `quantify_risk` | Calculate financial risk using FAIR methodology (ALE, VaR) |
| `generate_remediation` | Generate AI-powered remediation recommendations |
| `trend_analysis` | Analyze historical trends and predict future risk trajectory |
| `benchmark_analysis` | Compare security posture against industry peers |
| `compliance_mapping` | Map findings to compliance framework controls |
| `predict_breach_probability` | Calculate probability of security breach |

### Example AI Function Call

```typescript
// Calculate organization risk score
const result = await executeAIFunction('calculate_risk_score', {
  organization_id: 'org-123',
  recalculate: true
});

// Assess a new vendor
const vendorRisk = await assessVendor('vendor-domain.com', 'Vendor Name', true);

// Quantify financial risk
const quantified = await quantifyFinancialRisk('org-123', 10000000);
```

---

## 📊 Risk Factor Weights

The overall score is calculated as a weighted average of 10 risk factors:

| Factor | Weight | Description |
|--------|--------|-------------|
| Network Security | 15% | Open ports, firewall config, network segmentation |
| DNS Health | 8% | DNSSEC, SPF, DMARC, DNS misconfigurations |
| Patching Cadence | 12% | Software update frequency, vulnerability patches |
| Endpoint Security | 10% | Device protection, EDR deployment |
| Web Application Security | 14% | OWASP vulnerabilities, SSL/TLS, headers |
| Leaked Credentials | 11% | Exposed credentials, password breaches |
| Social Engineering | 8% | Phishing susceptibility, security awareness |
| Email Security | 10% | Email authentication, anti-phishing |
| Brand/Reputation | 5% | Typosquatting, brand impersonation |
| IP Reputation | 7% | Blocklists, malicious activity association |

### Score Grading

| Grade | Score Range | Color |
|-------|-------------|-------|
| A | 90-100 | #22C55E (Green) |
| B | 80-89 | #84CC16 (Lime) |
| C | 70-79 | #EAB308 (Yellow) |
| D | 60-69 | #F97316 (Orange) |
| F | 0-59 | #EF4444 (Red) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB 6+

### Installation

```bash
# Navigate to frontend tool
cd frontend/tools/29-riskscoreai

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

```env
# Frontend (.env)
VITE_API_URL=http://localhost:4029
VITE_WS_URL=ws://localhost:6029
VITE_ML_URL=http://localhost:8029

# Backend (.env)
PORT=4029
MONGODB_URI=mongodb://localhost:27017/riskscoreai
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
REDIS_URL=redis://localhost:6379
```

### Running Development Server

```bash
# Frontend (port 3029)
cd frontend/tools/29-riskscoreai
npm run dev

# Backend (port 4029)
cd backend/tools/29-riskscoreai
npm run dev
```

### Building for Production

```bash
# Build frontend
npm run build

# Preview production build
npm run preview
```

---

## 📈 Data Sources

RiskScoreAI collects data from multiple non-intrusive sources:

- **DNS Records** - WHOIS, DNS configurations, SPF/DKIM/DMARC
- **SSL/TLS Certificates** - Certificate transparency logs
- **Open Ports** - Non-intrusive port scanning
- **Web Technologies** - HTTP headers, technologies in use
- **Leaked Credentials** - Breach databases, dark web monitoring
- **Threat Intelligence** - IP reputation, blocklists
- **Social Media** - Brand mentions, impersonation attempts
- **Public CVEs** - Known vulnerabilities in detected software

---

## 🔐 Security Considerations

- All external data collection is non-intrusive (passive reconnaissance only)
- No active vulnerability scanning without explicit authorization
- Data encrypted at rest and in transit
- RBAC for multi-tenant access control
- Audit logging for all score changes and report access
- SOC 2 Type II compliant data handling

---

## 📝 License

Copyright © 2024 VictoryKit. All rights reserved.

---

## 🤝 Related Tools

| Tool | Description |
|------|-------------|
| [01-FraudGuard](../01-fraudguard) | AI Fraud Detection |
| [02-IntelliScout](../02-intelliscout) | Threat Intelligence |
| [06-VulnScan](../06-vulnscan) | Vulnerability Scanner |
| [27-VendorTrust](../27-vendortrust) | Vendor Management |
| [28-ThreatCatcher](../28-threatcatcher) | SOAR Engine |

---

*RiskScoreAI - Know your risk. Protect your business.*
