# FraudGuard

**Tool #01** | AI-Powered Fraud Detection & Prevention Platform

[![Port: 4001](https://img.shields.io/badge/API-4001-blue.svg)](http://localhost:4001)
[![AI WebSocket: 6001](https://img.shields.io/badge/AI_WS-6001-purple.svg)](ws://localhost:6001)
[![Frontend: 3001](https://img.shields.io/badge/Frontend-3001-green.svg)](http://localhost:3001)
[![ML: 8001](https://img.shields.io/badge/ML-8001-orange.svg)](http://localhost:8001)

## Overview

FraudGuard is the flagship fraud detection and prevention tool in the VictoryKit security suite. It leverages advanced AI and machine learning to analyze transactions, detect fraud patterns, calculate risk scores, and provide real-time protection against financial fraud.

**Production URL:** `https://fraudguard.maula.ai`

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       FraudGuard System                          │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React/TypeScript)           Port 3001                 │
│  ├── Transaction Dashboard                                       │
│  ├── Risk Analysis Interface                                     │
│  ├── Alert Management                                            │
│  ├── Real-time Monitoring                                        │
│  └── Maula AI Chat Interface                                     │
├─────────────────────────────────────────────────────────────────┤
│  AI Assistant (TypeScript/WebSocket)   Port 6001                 │
│  ├── Multi-LLM Support (Gemini, Claude, GPT, Mistral)           │
│  ├── Transaction Analysis Engine                                 │
│  ├── Risk Score Calculator                                       │
│  ├── Pattern Detection System                                    │
│  ├── Account Investigation                                       │
│  ├── Identity Verification                                       │
│  ├── Real-time Monitoring Stream                                 │
│  └── Compliance Auditing                                         │
├─────────────────────────────────────────────────────────────────┤
│  Backend API (Node.js/Express)         Port 4001                 │
│  ├── Transaction Processing                                      │
│  ├── Alert Management                                            │
│  ├── Report Generation                                           │
│  └── Rule Engine                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ML Service (Python)                   Port 8001                 │
│  ├── Risk Scoring Models                                         │
│  ├── Anomaly Detection                                           │
│  └── Fraud Pattern Recognition                                   │
├─────────────────────────────────────────────────────────────────┤
│  MongoDB Database: fraudguard_db                                 │
│  ├── Transactions                                                │
│  ├── Alerts                                                      │
│  ├── FraudScores                                                │
│  ├── Analyses                                                    │
│  └── Reports                                                     │
└─────────────────────────────────────────────────────────────────┘
```

## Features

| Feature | Description |
|---------|-------------|
| 🔍 **Real-time Transaction Analysis** | Instant fraud risk assessment for incoming transactions |
| 📊 **ML Risk Scoring** | Advanced machine learning models for accurate risk prediction |
| 🎯 **Pattern Detection** | Identify fraud rings, velocity abuse, and behavioral anomalies |
| 🔐 **Account Investigation** | Deep analysis of accounts for synthetic identity fraud |
| 💳 **Chargeback Prevention** | Predictive chargeback analysis and prevention |
| 👤 **Identity Verification** | Multi-level identity verification and KYC compliance |
| 📈 **Real-time Monitoring** | Live transaction stream monitoring with auto-blocking |
| 📋 **Compliance Auditing** | PCI-DSS, SOX, GDPR, and AML compliance checks |
| 🚨 **Custom Alert Rules** | Configurable alert rules with automated responses |
| 📑 **Comprehensive Reporting** | Executive, detailed, and compliance reports |

## AI Functions (10)

The AI assistant provides the following fraud detection capabilities:

### 1. `analyze_transaction`
Comprehensive transaction fraud analysis with velocity checks.
```typescript
await fraudGuardAI.analyzeTransaction({
  transactionId: 'txn_123456',
  amount: 1500.00,
  userIp: '192.168.1.1',
  deviceFingerprint: 'fp_abc123',
  includeVelocity: true
});
```

### 2. `calculate_risk_score`
ML-based risk score calculation with contributing factors.
```typescript
await fraudGuardAI.calculateRiskScore({
  transactionId: 'txn_123456',
  includeFactors: true,
  compareBaseline: true,
  modelVersion: 'latest'
});
```

### 3. `detect_patterns`
Identify fraud patterns across transactions.
```typescript
await fraudGuardAI.detectPatterns({
  timeRange: '7d',
  patternTypes: ['velocity', 'geo', 'behavioral', 'device'],
  minConfidence: 0.7,
  groupBy: 'user'
});
```

### 4. `investigate_account`
Deep account investigation for fraud indicators.
```typescript
await fraudGuardAI.investigateAccount({
  accountId: 'acct_789',
  includeHistory: true,
  checkSynthetic: true,
  networkAnalysis: true
});
```

### 5. `create_alert_rule`
Create custom fraud detection alert rules.
```typescript
await fraudGuardAI.createAlertRule({
  ruleName: 'High Value After Hours',
  conditions: { amount: '>5000', hour: '22-06' },
  severity: 'high',
  responseAction: 'review'
});
```

### 6. `analyze_chargeback`
Merchant chargeback analysis and prediction.
```typescript
await fraudGuardAI.analyzeChargeback({
  merchantId: 'merch_456',
  timeRange: '30d',
  includeReasons: true,
  predictRisk: true
});
```

### 7. `verify_identity`
Multi-level identity verification.
```typescript
await fraudGuardAI.verifyIdentity({
  userId: 'user_321',
  verificationLevel: 'enhanced',
  checkDocuments: true,
  biometricMatch: false
});
```

### 8. `monitor_realtime`
Real-time transaction stream monitoring.
```typescript
await fraudGuardAI.monitorRealtime({
  monitorScope: 'high-risk',
  alertThreshold: 70,
  autoBlock: true,
  streamDuration: '1h'
});
```

### 9. `audit_compliance`
Compliance framework auditing.
```typescript
await fraudGuardAI.auditCompliance({
  framework: 'PCI-DSS',
  scope: ['payment-processing', 'data-storage'],
  includeRemediation: true,
  generateEvidence: true
});
```

### 10. `generate_report`
Generate comprehensive fraud reports.
```typescript
await fraudGuardAI.generateReport({
  reportType: 'executive',
  startDate: '2025-01-01',
  endDate: '2025-01-31',
  format: 'pdf'
});
```

## Database Models

| Model | Description |
|-------|-------------|
| **Transaction** | Transaction records with fraud indicators |
| **Alert** | Fraud alerts and notifications |
| **FraudScore** | Risk scores and contributing factors |
| **Analysis** | Transaction analysis results |
| **Report** | Generated fraud reports |

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- API keys for LLM providers (at least one)

### Environment Variables
```bash
# Required
MONGODB_URI=mongodb://localhost:27017/fraudguard_db

# LLM Providers (at least one required)
GEMINI_API_KEY=your_gemini_key
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
MISTRAL_API_KEY=your_mistral_key
```

### Installation

```bash
# Backend API
cd backend/tools/01-fraudguard/api
npm install
npm run dev

# AI Assistant
cd backend/tools/01-fraudguard/ai-assistant
npm install
npm run dev

# Frontend
cd frontend/tools/01-fraudguard
npm install
npm run dev
```

### Docker
```bash
docker-compose -f docker-compose.yml up fraudguard
```

## API Endpoints

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | List transactions |
| GET | `/api/transactions/:id` | Get transaction details |
| POST | `/api/transactions/analyze` | Analyze transaction for fraud |
| GET | `/api/transactions/:id/score` | Get risk score |

### Alerts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts` | List alerts |
| POST | `/api/alerts/rules` | Create alert rule |
| PUT | `/api/alerts/:id/status` | Update alert status |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reports/generate` | Generate report |
| GET | `/api/reports/:id` | Download report |

## Risk Scoring

FraudGuard uses a 0-100 risk score system:

| Score Range | Level | Color | Action |
|-------------|-------|-------|--------|
| 0-30 | Low | 🟢 Green | Allow |
| 31-60 | Medium | 🟡 Yellow | Review |
| 61-80 | High | 🟠 Orange | Challenge |
| 81-100 | Critical | 🔴 Red | Block |

## Fraud Types Detected

- Card-not-present fraud
- Account takeover (ATO)
- Synthetic identity fraud
- Friendly fraud
- Chargeback fraud
- Payment fraud
- Identity theft
- Phishing attacks
- Velocity abuse
- Promotion abuse

## Integration

### With Other VictoryKit Tools
FraudGuard integrates with:
- **ThreatRadar** (#03) - Threat intelligence correlation
- **PhishGuard** (#05) - Phishing attack detection
- **IdentityShield** (#12) - Identity verification

### External Integrations
- Payment gateways (Stripe, PayPal, Adyen)
- Identity verification providers
- Credit bureaus
- Device fingerprinting services

## Project Structure

```
01-fraudguard/
├── api/
│   └── src/
│       ├── models/
│       │   ├── Alert.ts
│       │   ├── FraudScore.ts
│       │   ├── Transaction.ts
│       │   ├── Analysis.model.js
│       │   └── Report.model.js
│       ├── routes/
│       └── services/
├── ai-assistant/
│   └── src/
│       ├── server.ts
│       ├── functions/
│       │   └── fraudguardFunctions.ts
│       └── services/
│           └── llmRouter.js
└── frontend/
    └── src/
        ├── services/
        │   ├── config.ts
        │   └── aiService.ts
        ├── components/
        └── pages/
```

## Theme

| Property | Value |
|----------|-------|
| Primary | `#00ff88` (Fraud-safe Green) |
| Secondary | `#0088ff` (Trust Blue) |
| Accent | `#ffaa00` (Warning Amber) |
| Background | `#0a0f1c` (Deep Navy) |

## Related Documentation

- [Frontend Architecture](../../frontend/tools/01-fraudguard/README.md)
- [Fraud Detection Strategies](../../../docs/FRAUDGUARD.md)
- [API Gateway Integration](../shared-services/api-gateway/README.md)
- [Database Architecture](../../../docs/04-DATABASE-ARCHITECTURE.md)

## License

MIT License - Part of VictoryKit Security Suite

---

**Tool #01 of 43** | VictoryKit Security Suite | maula.ai
