# APIGuard - AI-Powered API Security & Protection

<div align="center">

![APIGuard](https://img.shields.io/badge/Tool-%2322-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-green)
![Status](https://img.shields.io/badge/Status-Production-brightgreen)
![AI](https://img.shields.io/badge/AI-Gemini%201.5-purple)

**Intelligent API Security Monitoring & Threat Protection**

</div>

## Overview

APIGuard is an AI-powered API security platform that discovers, monitors, and protects your APIs from threats. It provides comprehensive visibility into API traffic, detects anomalous behavior, ensures compliance with security standards, and protects sensitive data exposure.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        APIGuard                              │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + TypeScript)              Port: 3022      │
│  ├── Dashboard - API inventory & security posture           │
│  ├── Endpoint Explorer - API discovery & mapping            │
│  ├── Traffic Monitor - Real-time API traffic analysis       │
│  └── AI Assistant - Chat-based security operations          │
├─────────────────────────────────────────────────────────────┤
│  Backend API (Express)                      Port: 4022      │
│  ├── /api/endpoints - API endpoint management               │
│  ├── /api/traffic - Traffic analysis & metrics              │
│  ├── /api/anomalies - Anomaly detection & alerts            │
│  └── /api/policies - Security policy configuration          │
├─────────────────────────────────────────────────────────────┤
│  AI Assistant (WebSocket + Gemini)          Port: 6022      │
│  ├── API discovery & cataloging                             │
│  ├── Anomaly detection & investigation                      │
│  └── Compliance recommendations                             │
├─────────────────────────────────────────────────────────────┤
│  Database: MongoDB                       DB: apishield_db    │
│  └── Collections: apis, endpoints, anomalies, policies      │
└─────────────────────────────────────────────────────────────┘
```

## Features

### Core Capabilities
- 🔍 **API Discovery** - Automatic endpoint detection and cataloging
- 📊 **Traffic Analysis** - Deep inspection of API request/response
- 🚨 **Anomaly Detection** - ML-powered behavior anomaly detection
- 🔐 **Authentication Monitoring** - OAuth/JWT/API key tracking
- 📋 **Schema Validation** - OpenAPI/Swagger compliance checking
- 🛡️ **Data Protection** - PII/sensitive data masking

### AI Functions
| Function | Description |
|----------|-------------|
| `discover_endpoints` | Automatically discover and catalog API endpoints |
| `analyze_traffic` | Deep analysis of API traffic patterns |
| `detect_anomalies` | Detect unusual API behavior and attacks |
| `validate_schema` | Validate against OpenAPI/Swagger specs |
| `configure_protection` | Set rate limits and security policies |
| `monitor_auth` | Track authentication patterns and failures |
| `check_compliance` | OWASP API Top 10 compliance checking |
| `protect_sensitive` | Detect and mask sensitive data exposure |
| `investigate_incident` | Forensic investigation of API incidents |
| `generate_report` | Generate security and compliance reports |

## Database Models

### API
```javascript
{
  name: String,              // API name
  baseUrl: String,           // Base URL
  version: String,           // API version
  authType: String,          // oauth2, api_key, jwt, basic
  endpoints: [ObjectId],     // Related endpoints
  status: String,            // active, deprecated, inactive
  discoveredAt: Date
}
```

### Endpoint
```javascript
{
  apiId: ObjectId,
  path: String,              // /users/:id
  method: String,            // GET, POST, PUT, DELETE
  authenticated: Boolean,
  sensitiveData: Boolean,
  requestCount: Number,
  errorRate: Number,
  lastAccessed: Date
}
```

### Anomaly
```javascript
{
  endpointId: ObjectId,
  anomalyType: String,       // rate, payload, auth, injection
  severity: String,
  sourceIP: String,
  details: Object,
  detectedAt: Date,
  resolved: Boolean
}
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Gemini API Key (for AI features)

### Installation

```bash
# Navigate to tool directory
cd backend/tools/22-apishield

# Install dependencies
npm install

# Set environment variables
export MONGODB_URI=mongodb://localhost:27017/apishield_db
export GEMINI_API_KEY=your_key_here
export PORT=4022
export AI_WS_PORT=6022

# Start the server
npm run dev
```

### Frontend Setup

```bash
cd frontend/tools/22-apishield
npm install
npm run dev
```

## API Reference

### Endpoint Discovery

```bash
# Discover endpoints from target
POST /api/endpoints/discover
{
  "target": "https://api.example.com",
  "includeInternalApis": true
}

# Get all endpoints
GET /api/endpoints?authenticated=true

# Get endpoint details
GET /api/endpoints/:id/details
```

### Traffic Analysis

```bash
# Get traffic statistics
GET /api/traffic/stats?timeRange=24h&endpoint=/api/users

# Get anomalies
GET /api/anomalies?severity=high&resolved=false
```

### Schema Validation

```bash
# Validate endpoint against schema
POST /api/schema/validate
{
  "endpointId": "abc123",
  "schemaType": "openapi",
  "schemaUrl": "https://api.example.com/openapi.json"
}
```

## AI Assistant Usage

Connect to WebSocket at `ws://localhost:6022`:

```javascript
const ws = new WebSocket('ws://localhost:6022');

// Discover APIs
ws.send(JSON.stringify({
  type: 'function_call',
  functionName: 'discover_endpoints',
  parameters: { 
    target: 'https://api.example.com',
    includeInternalApis: true
  }
}));

// Check compliance
ws.send(JSON.stringify({
  type: 'function_call',
  functionName: 'check_compliance',
  parameters: { 
    standards: ['owasp-api', 'pci-dss']
  }
}));
```

## Configuration

### Authentication Types
- `oauth2` - OAuth 2.0 (Bearer tokens)
- `jwt` - JSON Web Tokens
- `api_key` - API Key authentication
- `basic` - Basic authentication

### Anomaly Types
- `rate` - Unusual request rate
- `payload` - Suspicious payload patterns
- `auth` - Authentication anomalies
- `injection` - Injection attempts
- `enumeration` - Resource enumeration

### Compliance Standards
- OWASP API Security Top 10
- PCI-DSS for payment APIs
- HIPAA for healthcare APIs
- GDPR for personal data APIs

## Docker Deployment

```yaml
services:
  apishield:
    build: ./backend/tools/22-apishield
    ports:
      - "4022:4022"
      - "6022:6022"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/apishield_db
      - GEMINI_API_KEY=${GEMINI_API_KEY}
```

## Security Best Practices

- Enable authentication on all API endpoints
- Implement rate limiting per client
- Validate all input against schemas
- Mask sensitive data in logs
- Monitor for unusual traffic patterns

## License

MIT License - Part of VictoryKit Security Suite
