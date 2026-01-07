# DDOSShield

**Tool #24** | AI-Powered DDoS Protection & Mitigation Platform

[![Port: 4024](https://img.shields.io/badge/API-4024-blue.svg)](http://localhost:4024)
[![AI WebSocket: 6024](https://img.shields.io/badge/AI_WS-6024-purple.svg)](ws://localhost:6024)
[![Frontend: 3024](https://img.shields.io/badge/Frontend-3024-green.svg)](http://localhost:3024)
[![ML: 8024](https://img.shields.io/badge/ML-8024-orange.svg)](http://localhost:8024)

## Overview

DDOSShield is an advanced DDoS detection and mitigation platform that uses AI to analyze traffic patterns, detect attacks in real-time, and automatically apply protection measures to keep your services online.

**Production URL:** `https://ddosshield.maula.ai`

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       DDOSShield System                          │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React/TypeScript)           Port 3024                 │
│  ├── Traffic Dashboard                                           │
│  ├── Attack Monitor                                              │
│  ├── Protection Controls                                         │
│  ├── Blocklist Manager                                           │
│  └── Maula AI Chat Interface                                     │
├─────────────────────────────────────────────────────────────────┤
│  AI Assistant (TypeScript/WebSocket)   Port 6024                 │
│  ├── Traffic Analysis                                            │
│  ├── Attack Detection                                            │
│  ├── Mitigation Automation                                       │
│  ├── Pattern Recognition                                         │
│  ├── Baseline Learning                                           │
│  └── Protection Optimization                                     │
├─────────────────────────────────────────────────────────────────┤
│  Backend API (Node.js/Express)         Port 4024                 │
│  ├── Traffic Processing                                          │
│  ├── Attack Management                                           │
│  ├── Protection Rules                                            │
│  └── Analytics Engine                                            │
├─────────────────────────────────────────────────────────────────┤
│  ML Engine (Python)                    Port 8024                 │
│  ├── Traffic Anomaly Detection                                   │
│  ├── Attack Classification                                       │
│  └── Baseline Modeling                                           │
├─────────────────────────────────────────────────────────────────┤
│  MongoDB Database: ddosshield_db                                 │
│  ├── Traffic                                                     │
│  ├── Attack                                                      │
│  ├── Protection                                                  │
│  └── Blocklist                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Features

| Feature | Description |
|---------|-------------|
| 🌊 **Real-time Traffic Analysis** | Monitor traffic patterns and detect anomalies instantly |
| ⚔️ **Attack Detection** | AI-powered detection of volumetric, protocol, and application attacks |
| 🛡️ **Automated Mitigation** | Instant response with configurable mitigation strategies |
| 🚫 **IP Blocklist Management** | Dynamic blocklists with auto-expiration |
| 📊 **Traffic Baselining** | ML-based normal traffic baseline learning |
| 🌍 **Geographic Filtering** | Block or challenge traffic from specific regions |
| 🔍 **Incident Investigation** | Forensic analysis and source tracing |
| ⚡ **Rate Limiting** | Configurable rate limits per endpoint |
| 🤖 **AI Optimization** | Continuous protection tuning |
| 📈 **Attack Analytics** | Historical patterns and predictions |

## AI Functions (10)

### 1. `analyze_traffic`
Analyze incoming traffic patterns for anomalies.
```typescript
await ddosShieldAI.analyzeTraffic({
  timeRange: '1h',
  includeGeoData: true,
  baselineComparison: true
});
```

### 2. `detect_attack`
Detect ongoing DDoS attacks and classify type.
```typescript
await ddosShieldAI.detectAttack({
  sensitivity: 'high',
  attackTypes: ['volumetric', 'protocol', 'application'],
  autoMitigate: true
});
```

### 3. `mitigate_attack`
Apply mitigation strategies to active attacks.
```typescript
await ddosShieldAI.mitigateAttack({
  attackId: 'ATK-2025-001234',
  strategy: 'scrub',
  duration: '1h'
});
```

### 4. `manage_blocklist`
Manage IP blocklist entries.
```typescript
await ddosShieldAI.manageBlocklist({
  action: 'add',
  ips: ['192.168.1.0/24'],
  reason: 'Attack source',
  expiration: '24h'
});
```

### 5. `configure_protection`
Configure protection rules and thresholds.
```typescript
await ddosShieldAI.configureProtection({
  protectionLevel: 'aggressive',
  rateLimit: { requestsPerSecond: 500 },
  geoBlocking: ['CN', 'RU']
});
```

### 6. `analyze_attack_patterns`
Analyze historical attack patterns.
```typescript
await ddosShieldAI.analyzeAttackPatterns({
  timeRange: '30d',
  groupBy: 'type',
  predictWindow: '7d',
  includeSignatures: true
});
```

### 7. `get_traffic_baseline`
Get or update traffic baseline.
```typescript
await ddosShieldAI.getTrafficBaseline({
  action: 'update',
  learningPeriod: '7d',
  metrics: ['pps', 'bandwidth', 'requests']
});
```

### 8. `investigate_incident`
Deep investigation of DDoS incidents.
```typescript
await ddosShieldAI.investigateIncident({
  incidentId: 'INC-2025-0567',
  includeForensics: true,
  traceSource: true
});
```

### 9. `optimize_protection`
AI-driven protection optimization.
```typescript
await ddosShieldAI.optimizeProtection({
  optimizationGoal: 'balanced',
  analyzeEffectiveness: true,
  autoApply: false
});
```

### 10. `generate_report`
Generate protection and incident reports.
```typescript
await ddosShieldAI.generateReport({
  reportType: 'incident',
  timeRange: '7d',
  format: 'pdf',
  includeRecommendations: true
});
```

## Database Models

| Model | Description |
|-------|-------------|
| **Traffic** | Traffic flow records and metrics |
| **Attack** | Detected attacks and status |
| **Protection** | Protection rules and configurations |
| **Blocklist** | Blocked IP addresses and ranges |

## Attack Types Detected

- **Volumetric:** UDP flood, ICMP flood, amplification attacks
- **Protocol:** SYN flood, fragmented packets, Smurf
- **Application:** HTTP flood, Slowloris, DNS query flood

## Mitigation Strategies

| Strategy | Description | Use Case |
|----------|-------------|----------|
| `block` | Drop all traffic from source | Confirmed attack sources |
| `rate-limit` | Limit request rate | Suspicious traffic |
| `challenge` | JavaScript/CAPTCHA challenge | Distinguish bots from humans |
| `scrub` | Clean traffic before forwarding | Mixed legitimate/attack traffic |
| `null-route` | Route to null destination | Emergency last resort |
| `geo-block` | Block by geographic region | Regional attack sources |

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- Gemini API key

### Environment Variables
```bash
MONGODB_URI=mongodb://localhost:27017/ddosshield_db
GEMINI_API_KEY=your_gemini_key
AI_WS_PORT=6024
```

### Installation

```bash
# Backend API
cd backend/tools/24-ddosshield/api
npm install
npm run dev

# AI Assistant
cd backend/tools/24-ddosshield/ai-assistant
npm install
npm run dev

# Frontend
cd frontend/tools/24-ddosshield
npm install
npm start
```

## Project Structure

```
24-ddosshield/
├── api/
│   └── src/
│       ├── models/
│       │   ├── Traffic.js
│       │   ├── Attack.js
│       │   ├── Protection.js
│       │   └── Blocklist.js
│       ├── controllers/
│       ├── routes/
│       └── services/
├── ai-assistant/
│   └── src/
│       ├── server.ts
│       └── functions/
│           └── ddosshieldFunctions.ts
├── ml-engine/
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
| Primary | `#ff4444` (Alert Red) |
| Secondary | `#0088ff` (Shield Blue) |
| Accent | `#ffaa00` (Warning Amber) |
| Background | `#0a0f1c` (Deep Navy) |

## Related Documentation

- [Traffic Analysis Guide](../../../docs/DDOS-PROTECTION.md)
- [API Gateway Integration](../shared-services/api-gateway/README.md)

## License

MIT License - Part of VictoryKit Security Suite

---

**Tool #24 of 43** | VictoryKit Security Suite | maula.ai
