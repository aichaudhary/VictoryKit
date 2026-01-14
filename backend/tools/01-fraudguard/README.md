# FraudGuard

**Tool #01** | Enterprise-Grade Real-Time Fraud Detection & Prevention Platform

[![Production](https://img.shields.io/badge/Production-fraudguard.maula.ai-red.svg)](https://fraudguard.maula.ai)
[![API Port](https://img.shields.io/badge/API-4001-blue.svg)](http://localhost:4001)
[![Status](https://img.shields.io/badge/Status-✅%20LIVE-brightgreen.svg)]()
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-green.svg)]()

---

## 🎯 Mission

Provide the public with enterprise-grade fraud protection tools that work in **real-time**. Users can scan URLs, check emails for breaches, verify phone numbers, and analyze transactions - all with instant results powered by advanced AI and industry-leading security APIs.

---

## 🌐 Live URLs

| Environment | URL |
|-------------|-----|
| **Frontend** | https://fraudguard.maula.ai |
| **API** | https://fraudguard.maula.ai/api |
| **Health Check** | https://fraudguard.maula.ai/api/health |

---

## 📋 Implementation Status

### ✅ Phase 1: Public Security Scanner (COMPLETE)
Real-time security scanning tools accessible to all users.

| Feature | Status | External APIs |
|---------|--------|---------------|
| 🔗 **URL Scanner** | ✅ Live | VirusTotal, Google Safe Browsing, URLScan.io |
| 📧 **Email Breach Check** | ✅ Live | Have I Been Pwned, IPQualityScore |
| 📱 **Phone Validator** | ✅ Live | NumVerify, IPQualityScore |
| 🌐 **IP Reputation** | ✅ Live | AbuseIPDB, IPQualityScore |
| 🔐 **Password Checker** | ✅ Live | Have I Been Pwned Passwords (k-Anonymity) |

### 🔄 Phase 2: Transaction Analysis (IN PROGRESS)
Advanced fraud detection for financial transactions.

| Feature | Status | Technology |
|---------|--------|------------|
| 💳 **Transaction Analyzer** | ✅ API Ready | ML Models + Rule Engine |
| 🎯 **Risk Scoring** | ✅ API Ready | Neural Networks |
| 📊 **Alerts System** | ✅ API Ready | Real-time Monitoring |
| 🔍 **Investigations** | ✅ API Ready | Case Management |
| 📈 **Analytics Dashboard** | ✅ API Ready | Aggregated Statistics |

### 📅 Phase 3: Advanced Intelligence (PLANNED)
Enterprise features with threat intelligence.

| Feature | Status |
|---------|--------|
| 🌑 **Dark Web Monitoring** | Planned |
| 🤖 **AI Fraud Prediction** | Planned |
| 📈 **Real-time WebSocket** | Planned |

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
| GET | `/api/scan/stats/summary` | Get scan statistics | 10/min |

### Dashboard & Management APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check & service status |
| GET | `/api/alerts` | Get all alerts |
| POST | `/api/alerts` | Create new alert |
| GET | `/api/transactions` | Get transactions |
| GET | `/api/analytics/dashboard` | Dashboard statistics |
| GET | `/api/threat-intel/blacklist` | Get blacklisted threats |
| GET | `/api/investigations` | Get investigations |
| POST | `/api/investigations` | Create investigation |

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

### Required API Keys

Create a `.env` file in `backend/tools/01-fraudguard/api/` with:

```bash
# ============================================
# FRAUDGUARD ENVIRONMENT CONFIGURATION
# ============================================

# Server Configuration
PORT=4001
NODE_ENV=production
CORS_ORIGIN=https://fraudguard.maula.ai

# MongoDB Atlas Database
# Database: fraudguard_db
MONGODB_URI=mongodb+srv://victory_db_user:YOUR_PASSWORD@victorykit.gbnvij2.mongodb.net/fraudguard_db

# ============================================
# EXTERNAL SECURITY API KEYS
# ============================================

# VirusTotal - URL/File Scanning (FREE: 500 req/day, 4 req/min)
# Signup: https://www.virustotal.com/gui/join-us
# Get Key: https://www.virustotal.com/gui/my-apikey
VIRUSTOTAL_API_KEY=your_virustotal_api_key_here

# Google Safe Browsing - Malicious URL Detection (FREE: 10,000 req/day)
# Signup: https://console.cloud.google.com/
# Enable API: APIs & Services > Library > Safe Browsing API
# Get Key: APIs & Services > Credentials > Create API Key
GOOGLE_SAFE_BROWSING_KEY=your_google_safe_browsing_key_here

# URLScan.io - URL Analysis & Screenshots (FREE: 50 scans/day)
# Signup: https://urlscan.io/user/signup
# Get Key: https://urlscan.io/user/profile/
URLSCAN_API_KEY=your_urlscan_api_key_here

# Have I Been Pwned - Email Breach Data (PAID: $3.50/month)
# Signup: https://haveibeenpwned.com/API/Key
# Note: Password checking (k-Anonymity) is FREE and doesn't need a key
HIBP_API_KEY=your_hibp_api_key_here

# AbuseIPDB - IP Reputation Database (FREE: 1,000 checks/day)
# Signup: https://www.abuseipdb.com/register
# Get Key: https://www.abuseipdb.com/account/api
ABUSEIPDB_API_KEY=your_abuseipdb_api_key_here

# IPQualityScore - Fraud Scoring & Proxy Detection (FREE: 5,000 req/month)
# Signup: https://www.ipqualityscore.com/create-account
# Get Key: https://www.ipqualityscore.com/documentation/overview
IPQS_API_KEY=your_ipqualityscore_api_key_here

# NumVerify - Phone Number Validation (FREE: 100 req/month)
# Signup: https://numverify.com/product
# Get Key: https://numverify.com/dashboard
NUMVERIFY_API_KEY=your_numverify_api_key_here

# ============================================
# OPTIONAL API KEYS (Future Features)
# ============================================

# Twilio - Phone Lookup with Carrier Info (PAID: ~$0.005/lookup)
# Signup: https://www.twilio.com/try-twilio
# Get Credentials: https://www.twilio.com/console
# TWILIO_ACCOUNT_SID=your_twilio_sid_here
# TWILIO_AUTH_TOKEN=your_twilio_token_here

# Shodan - Internet Device Search (PAID: starts at $59/month)
# Signup: https://account.shodan.io/register
# SHODAN_API_KEY=your_shodan_key_here

# PhishTank - Phishing URL Database (FREE, requires registration)
# Signup: https://phishtank.org/register.php
# PHISHTANK_API_KEY=your_phishtank_key_here
```

### API Key Pricing Summary

| API | Free Tier | Paid Tier | Used For |
|-----|-----------|-----------|----------|
| **VirusTotal** | 500 req/day | $100+/mo | URL/file scanning |
| **Google Safe Browsing** | 10K req/day | Free | Malicious URL detection |
| **URLScan.io** | 50 scans/day | $25/mo | URL analysis |
| **Have I Been Pwned** | Passwords free | $3.50/mo | Email breach data |
| **AbuseIPDB** | 1K checks/day | $19/mo | IP reputation |
| **IPQualityScore** | 5K req/mo | $20/mo | Fraud scoring |
| **NumVerify** | 100 req/mo | $10/mo | Phone validation |

### Quick Setup Links

1. **VirusTotal**: https://www.virustotal.com/gui/join-us
2. **Google Cloud Console**: https://console.cloud.google.com/
3. **URLScan.io**: https://urlscan.io/user/signup
4. **Have I Been Pwned**: https://haveibeenpwned.com/API/Key
5. **AbuseIPDB**: https://www.abuseipdb.com/register
6. **IPQualityScore**: https://www.ipqualityscore.com/create-account
7. **NumVerify**: https://numverify.com/product

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
- [x] Create `phoneValidator.ts` - NumVerify + IPQualityScore
- [x] Create `ipChecker.ts` - AbuseIPDB + IPQualityScore
- [x] Create `passwordChecker.ts` - HIBP k-Anonymity API
- [x] Create `ScanResult.ts` model
- [x] Create `ThreatIntel.ts` model (caching)
- [x] Create `User.ts` model (authentication)
- [x] Create `APIKey.ts` model (API key management)
- [x] Create `AuditLog.ts` model (audit trail)
- [x] Create `RateLimit.ts` model (rate limiting)
- [x] Create `publicScanRoutes.ts` - All /api/scan/* endpoints
- [x] Create `threatIntelRoutes.ts` - Threat intelligence endpoints
- [x] Create `investigationRoutes.ts` - Investigation management
- [x] Create `database.ts` service - Connection pooling
- [x] Update `server.ts` with all routes under /api prefix
- [x] Add trust proxy for Nginx compatibility
- [x] Deploy to production server

### Phase 2: Frontend Scanner Components
- [x] Create `PublicScanner/` folder structure
- [x] Create `URLScanner.tsx` - URL input + results
- [x] Create `EmailChecker.tsx` - Email breach check
- [x] Create `PhoneValidator.tsx` - Phone validation
- [x] Create `IPChecker.tsx` - IP reputation
- [x] Create `PasswordChecker.tsx` - Password strength
- [x] Create `scanAPI.ts` - Frontend API client
- [x] Update `FraudGuardTool.tsx` - Tabbed layout
- [x] Build and deploy to fraudguard.maula.ai

### Phase 3: Production Deployment
- [x] Configure PM2 process (fraudguard-api, id: 2)
- [x] Configure Nginx reverse proxy
- [x] SSL certificate via Cloudflare
- [x] Test all endpoints on production
- [ ] Add production API keys to server .env
- [ ] Monitor and optimize performance

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

# Deploy frontend to server
scp -i victorykit.pem -r dist/* ubuntu@ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com:/var/www/tools/fraudguard/

# Deploy backend source
rsync -avz -e "ssh -i victorykit.pem" backend/tools/01-fraudguard/api/src/ ubuntu@ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com:/var/www/maula.ai/repo/backend/tools/01-fraudguard/api/src/

# Build and restart on server
ssh -i victorykit.pem ubuntu@ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com "cd /var/www/maula.ai/repo/backend/tools/01-fraudguard/api && npm run build && pm2 restart fraudguard-api"
```

### Test API
```bash
# Health check
curl https://fraudguard.maula.ai/api/health

# URL scan
curl -X POST https://fraudguard.maula.ai/api/scan/url \
  -H "Content-Type: application/json" \
  -d '{"url":"https://google.com"}'

# Password check
curl -X POST https://fraudguard.maula.ai/api/scan/password \
  -H "Content-Type: application/json" \
  -d '{"password":"test123"}'
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
| 2026-01-12 | 2.1.0 | Added /api prefix to all routes, created threatIntelRoutes, investigationRoutes |
| 2026-01-11 | 2.0.5 | Added User, APIKey, AuditLog, RateLimit models |
| 2026-01-11 | 2.0.4 | Fixed trust proxy, health endpoint, duplicate index warnings |
| 2026-01-11 | 2.0.3 | Created database service with connection pooling |
| 2026-01-11 | 2.0.2 | Fixed frontend routing (Vite base, BrowserRouter) |
| 2026-01-11 | 2.0.1 | Deployed to production, PM2 configuration |
| 2026-01-10 | 2.0.0 | Complete rewrite with public scanner features |

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Node.js, Express, TypeScript |
| **Database** | MongoDB Atlas |
| **Frontend** | React, TypeScript, Vite, TailwindCSS |
| **Process Manager** | PM2 |
| **Web Server** | Nginx |
| **SSL** | Cloudflare |
| **Hosting** | AWS EC2 (ap-southeast-1) |

---

## 📁 Project Structure

```
backend/tools/01-fraudguard/
├── README.md                    ← THIS FILE
├── api/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── server.ts            ← Main entry point
│       ├── routes/
│       │   ├── publicScanRoutes.ts    ← /api/scan/*
│       │   ├── alertRoutes.ts         ← /api/alerts/*
│       │   ├── analyticsRoutes.ts     ← /api/analytics/*
│       │   ├── transactionRoutes.ts   ← /api/transactions/*
│       │   ├── threatIntelRoutes.ts   ← /api/threat-intel/*
│       │   ├── investigationRoutes.ts ← /api/investigations/*
│       │   ├── healthRoutes.ts        ← /api/health
│       │   └── ...
│       ├── services/
│       │   ├── urlScanner.ts          ← URL threat detection
│       │   ├── emailChecker.ts        ← Email breach check
│       │   ├── phoneValidator.ts      ← Phone validation
│       │   ├── ipChecker.ts           ← IP reputation
│       │   ├── passwordChecker.ts     ← Password security
│       │   ├── externalAPIs.ts        ← API client wrapper
│       │   └── database.ts            ← MongoDB connection
│       ├── models/
│       │   ├── ScanResult.ts          ← Scan history
│       │   ├── ThreatIntel.ts         ← Threat cache
│       │   ├── User.ts                ← User authentication
│       │   ├── APIKey.ts              ← API key management
│       │   ├── AuditLog.ts            ← Audit trail
│       │   └── RateLimit.ts           ← Rate limiting
│       └── utils/
│           └── logger.ts
├── ai-assistant/                ← AI chat assistant (planned)
└── ml-engine/                   ← ML fraud models (planned)

frontend/tools/01-fraudguard/
├── package.json
├── vite.config.ts               ← base: '/'
└── src/
    ├── main.tsx                 ← BrowserRouter (no basename)
    ├── App.tsx
    └── components/
        └── FraudGuardTool.tsx   ← Main component with tabs
```

---

**Tool #01 of 50** | VictoryKit Security Suite | maula.ai
