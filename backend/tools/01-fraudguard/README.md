# FraudGuard

**Tool #01** | Enterprise-Grade Real-Time Fraud Detection & Prevention Platform

[![Production](https://img.shields.io/badge/Production-fraudguard.maula.ai-red.svg)](https://fraudguard.maula.ai)
[![API Port](https://img.shields.io/badge/API-4001-blue.svg)](http://localhost:4001)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-green.svg)]()

---

## 🎯 Mission

Provide the public with enterprise-grade fraud protection tools that work in **real-time**. Users can scan URLs, check emails for breaches, verify phone numbers, and analyze transactions - all with instant results powered by advanced AI and industry-leading security APIs.

---

## 📋 Implementation Plan

### Phase 1: Public Security Scanner (CURRENT)
Real-time security scanning tools accessible to all users.

| Feature | Description | External APIs |
|---------|-------------|---------------|
| 🔗 **URL Scanner** | Scan any URL for malware, phishing, scams | VirusTotal, Google Safe Browsing, URLScan.io, PhishTank |
| 📧 **Email Breach Check** | Check if email appeared in data breaches | Have I Been Pwned, DeHashed, Leak-Lookup |
| 📱 **Phone Validator** | Verify phone numbers, detect spam callers | NumVerify, Twilio Lookup, CallerID |
| 🌐 **IP Reputation** | Check IP address reputation and threats | AbuseIPDB, IPQualityScore, Shodan |
| 🔐 **Password Strength** | Check password strength and breach status | Have I Been Pwned Passwords |

### Phase 2: Transaction Analysis (NEXT)
Advanced fraud detection for financial transactions.

| Feature | Description | Technology |
|---------|-------------|------------|
| 💳 **Transaction Analyzer** | Real-time fraud scoring | ML Models + Rule Engine |
| 🎯 **Risk Scoring** | 0-100 risk score with explanations | Neural Networks |
| 📊 **Pattern Detection** | Detect fraud rings, velocity attacks | Graph Analysis |
| 🔍 **Device Fingerprinting** | Identify device fraud patterns | FingerprintJS |

### Phase 3: Advanced Intelligence (FUTURE)
Enterprise features with threat intelligence.

| Feature | Description |
|---------|-------------|
| 🌑 **Dark Web Monitoring** | Monitor for leaked credentials |
| 🤖 **AI Fraud Prediction** | Predictive fraud prevention |
| 📈 **Real-time Dashboard** | Live monitoring with WebSocket |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        FraudGuard Production System                       │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  FRONTEND (React/TypeScript)          fraudguard.maula.ai       │    │
│  │  ├── PublicScanner/                                              │    │
│  │  │   ├── URLScanner.tsx         → Scan URLs for threats         │    │
│  │  │   ├── EmailChecker.tsx       → Check email breaches          │    │
│  │  │   ├── PhoneValidator.tsx     → Validate phone numbers        │    │
│  │  │   ├── IPChecker.tsx          → Check IP reputation           │    │
│  │  │   └── PasswordChecker.tsx    → Check password security       │    │
│  │  ├── Dashboard/                                                  │    │
│  │  │   ├── RealTimeDashboard.tsx  → Live threat monitoring        │    │
│  │  │   ├── ScanHistory.tsx        → User's scan history           │    │
│  │  │   └── ThreatAlerts.tsx       → Active threat alerts          │    │
│  │  └── TransactionAnalysis/                                        │    │
│  │      ├── TransactionForm.tsx    → Submit transactions           │    │
│  │      └── RiskVisualization.tsx  → View risk analysis            │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  BACKEND API (Node.js/Express)              Port 4001           │    │
│  │  ├── routes/                                                     │    │
│  │  │   ├── publicScanRoutes.ts    → /api/scan/*                   │    │
│  │  │   ├── transactionRoutes.ts   → /api/transactions/*           │    │
│  │  │   ├── alertRoutes.ts         → /api/alerts/*                 │    │
│  │  │   └── healthRoutes.ts        → /api/health                   │    │
│  │  ├── services/                                                   │    │
│  │  │   ├── urlScanner.ts          → VirusTotal, Safe Browsing     │    │
│  │  │   ├── emailChecker.ts        → Have I Been Pwned             │    │
│  │  │   ├── phoneValidator.ts      → NumVerify, Twilio             │    │
│  │  │   ├── ipChecker.ts           → AbuseIPDB, IPQualityScore     │    │
│  │  │   └── fraudAnalyzer.ts       → ML-based fraud detection      │    │
│  │  └── models/                                                     │    │
│  │      ├── ScanResult.ts          → Store all scan results        │    │
│  │      ├── Transaction.ts         → Transaction records           │    │
│  │      └── ThreatIntel.ts         → Threat intelligence data      │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  EXTERNAL APIS (Enterprise-Grade)                                │    │
│  │  ├── VirusTotal API             → URL/File scanning             │    │
│  │  ├── Google Safe Browsing       → Malicious URL detection       │    │
│  │  ├── URLScan.io                 → URL analysis                  │    │
│  │  ├── Have I Been Pwned          → Email breach data             │    │
│  │  ├── AbuseIPDB                  → IP reputation                 │    │
│  │  ├── IPQualityScore             → Fraud scoring                 │    │
│  │  ├── NumVerify                  → Phone validation              │    │
│  │  └── PhishTank                  → Phishing database             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  DATABASE (MongoDB)                fraudguard_db                 │    │
│  │  ├── scan_results               → All scan history              │    │
│  │  ├── transactions               → Transaction records           │    │
│  │  ├── threat_intel               → Cached threat data            │    │
│  │  └── alerts                     → User alerts                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Endpoints

### Public Scanner APIs (No Auth Required)

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/api/scan/url` | Scan URL for threats | 10/min |
| POST | `/api/scan/email` | Check email breaches | 5/min |
| POST | `/api/scan/phone` | Validate phone number | 5/min |
| POST | `/api/scan/ip` | Check IP reputation | 10/min |
| POST | `/api/scan/password` | Check password security | 20/min |
| GET | `/api/scan/history` | Get recent scans (by IP) | 10/min |

### Request/Response Examples

#### URL Scanner
```http
POST /api/scan/url
Content-Type: application/json

{
  "url": "https://suspicious-site.com/login"
}
```

```json
{
  "success": true,
  "scan_id": "scan_abc123",
  "url": "https://suspicious-site.com/login",
  "verdict": "MALICIOUS",
  "risk_score": 87,
  "risk_level": "high",
  "threats": [
    {
      "type": "phishing",
      "confidence": 95,
      "source": "VirusTotal"
    },
    {
      "type": "malware",
      "confidence": 72,
      "source": "Google Safe Browsing"
    }
  ],
  "details": {
    "domain_age": "3 days",
    "ssl_valid": false,
    "suspicious_patterns": ["login-form", "data-harvesting"],
    "blacklisted_by": ["PhishTank", "OpenPhish", "VirusTotal"]
  },
  "recommendation": "DO NOT VISIT - High probability of phishing attack",
  "scanned_at": "2026-01-12T10:30:00Z"
}
```

#### Email Breach Check
```http
POST /api/scan/email
Content-Type: application/json

{
  "email": "user@example.com"
}
```

```json
{
  "success": true,
  "email": "user@example.com",
  "is_breached": true,
  "breach_count": 5,
  "risk_level": "critical",
  "breaches": [
    {
      "name": "LinkedIn",
      "date": "2021-06-22",
      "compromised_data": ["email", "password", "name"]
    },
    {
      "name": "Adobe",
      "date": "2013-10-04",
      "compromised_data": ["email", "password", "hint"]
    }
  ],
  "recommendations": [
    "Change passwords for all affected services",
    "Enable 2FA on all accounts",
    "Monitor accounts for suspicious activity"
  ],
  "scanned_at": "2026-01-12T10:30:00Z"
}
```

#### Phone Validator
```http
POST /api/scan/phone
Content-Type: application/json

{
  "phone": "+1234567890"
}
```

```json
{
  "success": true,
  "phone": "+1234567890",
  "valid": true,
  "risk_level": "low",
  "carrier": "AT&T",
  "type": "mobile",
  "country": "United States",
  "location": "New York",
  "spam_score": 12,
  "spam_reports": 0,
  "voip": false,
  "disposable": false,
  "scanned_at": "2026-01-12T10:30:00Z"
}
```

---

## 🗄️ Database Models

### ScanResult
```typescript
interface ScanResult {
  _id: ObjectId;
  scan_id: string;           // Unique scan identifier
  scan_type: 'url' | 'email' | 'phone' | 'ip' | 'password';
  input: string;             // What was scanned
  result: {
    verdict: 'safe' | 'suspicious' | 'malicious';
    risk_score: number;      // 0-100
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    threats: Threat[];
    details: Record<string, any>;
    recommendations: string[];
  };
  sources: string[];         // APIs used
  client_ip: string;         // For rate limiting
  created_at: Date;
  expires_at: Date;          // Cache expiry
}

interface Threat {
  type: string;
  description: string;
  confidence: number;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
```

### ThreatIntel (Cache)
```typescript
interface ThreatIntel {
  _id: ObjectId;
  indicator: string;         // URL, IP, domain, etc.
  indicator_type: 'url' | 'domain' | 'ip' | 'email' | 'hash';
  threat_data: {
    is_malicious: boolean;
    categories: string[];
    confidence: number;
    sources: SourceReport[];
  };
  first_seen: Date;
  last_updated: Date;
  ttl: number;               // Cache duration in seconds
}
```

---

## 🔑 External API Configuration

### Required API Keys (.env)

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/fraudguard_db

# VirusTotal (URL/File Scanning)
# https://www.virustotal.com/gui/my-apikey
VIRUSTOTAL_API_KEY=your_virustotal_key

# Google Safe Browsing
# https://console.cloud.google.com/apis/credentials
GOOGLE_SAFE_BROWSING_KEY=your_google_key

# URLScan.io
# https://urlscan.io/user/profile/
URLSCAN_API_KEY=your_urlscan_key

# Have I Been Pwned
# https://haveibeenpwned.com/API/Key
HIBP_API_KEY=your_hibp_key

# AbuseIPDB
# https://www.abuseipdb.com/account/api
ABUSEIPDB_API_KEY=your_abuseipdb_key

# IPQualityScore
# https://www.ipqualityscore.com/documentation
IPQS_API_KEY=your_ipqs_key

# NumVerify (Phone Validation)
# https://numverify.com/dashboard
NUMVERIFY_API_KEY=your_numverify_key

# Twilio (Phone Lookup - Carrier Info)
# https://www.twilio.com/console
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

---

## 📁 File Structure

### Backend
```
backend/tools/01-fraudguard/
├── README.md                    ← THIS FILE (Implementation Plan)
├── api/
│   ├── .env                     ← API keys (create from .env.example)
│   ├── .env.example             ← Template for .env
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── server.ts            ← Main server entry
│       ├── routes/
│       │   ├── index.ts         ← Route aggregator
│       │   ├── publicScanRoutes.ts  ← NEW: /api/scan/*
│       │   ├── transactionRoutes.ts
│       │   ├── alertRoutes.ts
│       │   └── healthRoutes.ts
│       ├── services/
│       │   ├── urlScanner.ts    ← NEW: URL scanning service
│       │   ├── emailChecker.ts  ← NEW: Email breach check
│       │   ├── phoneValidator.ts ← NEW: Phone validation
│       │   ├── ipChecker.ts     ← NEW: IP reputation
│       │   ├── passwordChecker.ts ← NEW: Password security
│       │   ├── fraudAnalyzer.ts ← Enhanced fraud analysis
│       │   └── externalAPIs.ts  ← NEW: API wrapper/client
│       ├── models/
│       │   ├── ScanResult.ts    ← NEW: Scan results model
│       │   ├── ThreatIntel.ts   ← NEW: Threat cache model
│       │   ├── Transaction.ts
│       │   ├── Alert.ts
│       │   └── FraudScore.ts
│       ├── middleware/
│       │   ├── rateLimiter.ts   ← NEW: Rate limiting
│       │   └── validator.ts     ← NEW: Input validation
│       └── utils/
│           ├── logger.ts
│           └── helpers.ts
├── ai-assistant/                ← Existing (keep)
└── ml-engine/                   ← Existing (keep)
```

### Frontend
```
frontend/tools/01-fraudguard/
├── package.json
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── components/
    │   ├── FraudGuardTool.tsx   ← UPDATE: New layout
    │   ├── PublicScanner/       ← NEW FOLDER
    │   │   ├── URLScanner.tsx
    │   │   ├── EmailChecker.tsx
    │   │   ├── PhoneValidator.tsx
    │   │   ├── IPChecker.tsx
    │   │   ├── PasswordChecker.tsx
    │   │   ├── ScanResult.tsx   ← Reusable result display
    │   │   └── ScanHistory.tsx
    │   ├── Dashboard/           ← Existing (keep)
    │   └── TransactionAnalysis/ ← Existing (keep)
    ├── services/
    │   ├── scanAPI.ts           ← NEW: Public scan API client
    │   ├── fraudguardAPI.ts     ← Existing
    │   └── config.ts
    └── types/
        └── index.ts             ← UPDATE: Add scan types
```

---

## ✅ Implementation Checklist

### Phase 1: Backend Scanner Services
- [x] Create `externalAPIs.ts` - Unified API client wrapper
- [x] Create `urlScanner.ts` - VirusTotal + Safe Browsing + URLScan
- [x] Create `emailChecker.ts` - Have I Been Pwned integration
- [x] Create `phoneValidator.ts` - NumVerify + Twilio
- [x] Create `ipChecker.ts` - AbuseIPDB + IPQualityScore
- [x] Create `ScanResult.ts` model
- [x] Create `ThreatIntel.ts` model (caching)
- [x] Create `publicScanRoutes.ts` - All /api/scan/* endpoints
- [x] Update `.env.example` with all API keys
- [x] Update `server.ts` to include new routes

### Phase 2: Frontend Scanner Components
- [x] Create `PublicScanner/` folder structure
- [x] Create `URLScanner.tsx` - URL input + results
- [x] Create `EmailChecker.tsx` - Email breach check
- [x] Create `PhoneValidator.tsx` - Phone validation
- [x] Create `IPChecker.tsx` - IP reputation
- [x] Create `PasswordChecker.tsx` - Password strength
- [x] Create `scanAPI.ts` - Frontend API client
- [x] Update `FraudGuardTool.tsx` - New tabbed layout

### Phase 3: Testing & Deployment
- [ ] Test all scanner endpoints locally
- [ ] Add production API keys to server .env
- [ ] Build frontend for production
- [ ] Deploy backend to production server
- [ ] Deploy frontend to fraudguard.maula.ai
- [ ] Verify all features work on production

---

## 🚀 Quick Start

### Development
```bash
# Terminal 1: Backend
cd backend/tools/01-fraudguard/api
cp .env.example .env  # Add your API keys
npm install
npm run dev

# Terminal 2: Frontend
cd frontend/tools/01-fraudguard
npm install
npm run dev
```

### Production Deployment
```bash
# Build frontend
cd frontend/tools/01-fraudguard
npm run build

# Deploy to server
scp -r dist/* ubuntu@server:/var/www/tools/fraudguard/

# Backend runs via PM2
pm2 restart fraudguard-api
```

---

## 🎨 UI Design

### Color Scheme
| Element | Color | Hex |
|---------|-------|-----|
| Safe/Low Risk | Green | `#10B981` |
| Suspicious/Medium | Yellow | `#F59E0B` |
| Warning/High | Orange | `#F97316` |
| Danger/Critical | Red | `#EF4444` |
| Background | Dark | `#0F172A` |
| Card Background | Slate | `#1E293B` |

### Risk Level Display
```
🟢 SAFE (0-25)       - Green glow, checkmark icon
🟡 SUSPICIOUS (26-50) - Yellow glow, warning icon  
🟠 WARNING (51-75)    - Orange glow, alert icon
🔴 DANGEROUS (76-100) - Red glow, skull icon
```

---

## 📊 Success Metrics

| Metric | Target |
|--------|--------|
| URL Scan Response Time | < 3 seconds |
| Email Check Response Time | < 2 seconds |
| Phone Validation Time | < 1 second |
| API Uptime | 99.9% |
| Threat Detection Accuracy | > 95% |

---

## 🔄 Updates Log

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-12 | 2.0.0 | Complete rewrite with public scanner features |

---

**Tool #01 of 50** | VictoryKit Security Suite | maula.ai
