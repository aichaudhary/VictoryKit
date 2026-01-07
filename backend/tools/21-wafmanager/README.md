# WAFManager - AI-Powered Web Application Firewall Management

<div align="center">

![WAFManager](https://img.shields.io/badge/Tool-%2321-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-green)
![Status](https://img.shields.io/badge/Status-Production-brightgreen)
![AI](https://img.shields.io/badge/AI-Gemini%201.5-purple)

**Intelligent Web Application Firewall Rule Management & Attack Protection**

</div>

## Overview

WAFManager is an AI-powered Web Application Firewall management platform that provides intelligent rule creation, traffic analysis, and attack protection. It leverages machine learning to detect attack patterns, optimize firewall rules, and provide real-time protection against web application threats.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      WAFManager                              │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + TypeScript)              Port: 3021      │
│  ├── Dashboard - Rule overview & attack metrics             │
│  ├── Rule Manager - Create/edit WAF rules                   │
│  ├── Traffic Analyzer - Real-time traffic inspection        │
│  └── AI Assistant - Chat-based security operations          │
├─────────────────────────────────────────────────────────────┤
│  Backend API (Express)                      Port: 4021      │
│  ├── /api/rules - WAF rule management                       │
│  ├── /api/policies - Security policy CRUD                   │
│  ├── /api/attacks - Attack log queries                      │
│  └── /api/traffic - Traffic statistics                      │
├─────────────────────────────────────────────────────────────┤
│  AI Assistant (WebSocket + Gemini)          Port: 6021      │
│  ├── Natural language rule creation                         │
│  ├── Attack pattern analysis                                │
│  └── Intelligent recommendations                            │
├─────────────────────────────────────────────────────────────┤
│  Database: MongoDB                     DB: wafmanager_db    │
│  └── Collections: rules, policies, attacks, traffic, events │
└─────────────────────────────────────────────────────────────┘
```

## Features

### Core Capabilities
- 🛡️ **Intelligent Rule Creation** - AI-assisted WAF rule generation
- 📊 **Traffic Analysis** - Deep packet inspection and pattern detection
- 🎯 **Attack Detection** - Real-time threat identification (SQLi, XSS, RCE)
- ⚡ **Rule Optimization** - ML-powered rule performance tuning
- 🚫 **Blocklist Management** - IP/user agent/pattern blocking
- 🔬 **Incident Investigation** - Forensic analysis of attacks

### AI Functions
| Function | Description |
|----------|-------------|
| `analyze_traffic` | Deep analysis of web traffic patterns |
| `create_rule` | Generate WAF rules from natural language |
| `detect_attacks` | Real-time attack detection and classification |
| `optimize_rules` | ML-powered rule optimization |
| `manage_blocklist` | Add/remove IPs and patterns from blocklists |
| `analyze_attack_patterns` | Pattern correlation across attacks |
| `test_rule` | Sandbox testing of WAF rules |
| `configure_protection` | Set protection levels and modes |
| `investigate_incident` | Forensic investigation of security events |
| `generate_report` | Generate security and compliance reports |

## Database Models

### WAFRule
```javascript
{
  name: String,              // Rule name
  pattern: String,           // Detection pattern (regex/string)
  action: String,            // block, allow, log, challenge
  ruleType: String,          // sqli, xss, rce, custom, etc.
  severity: String,          // critical, high, medium, low
  enabled: Boolean,
  hitCount: Number,
  falsePositives: Number,
  createdAt: Date
}
```

### AttackLog
```javascript
{
  ruleId: ObjectId,
  sourceIP: String,
  requestPath: String,
  payload: String,
  attackType: String,
  severity: String,
  action: String,
  timestamp: Date
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
cd backend/tools/21-wafmanager

# Install dependencies
npm install

# Set environment variables
export MONGODB_URI=mongodb://localhost:27017/wafmanager_db
export GEMINI_API_KEY=your_key_here
export PORT=4021
export AI_WS_PORT=6021

# Start the server
npm run dev
```

### Frontend Setup

```bash
cd frontend/tools/21-wafmanager
npm install
npm run dev
```

## API Reference

### Rules Management

```bash
# Create a WAF rule
POST /api/rules
{
  "name": "SQL Injection Block",
  "pattern": "(?i)(union|select|insert|delete|update|drop)",
  "action": "block",
  "ruleType": "sqli",
  "severity": "critical"
}

# Get all rules
GET /api/rules

# Test a rule
POST /api/rules/test
{
  "ruleId": "abc123",
  "testPayload": "1' OR '1'='1"
}
```

### Traffic Analysis

```bash
# Get traffic statistics
GET /api/traffic/stats?timeRange=24h

# Get attack logs
GET /api/attacks?severity=critical&limit=100
```

## AI Assistant Usage

Connect to WebSocket at `ws://localhost:6021`:

```javascript
const ws = new WebSocket('ws://localhost:6021');

// Send chat message
ws.send(JSON.stringify({
  type: 'chat',
  content: 'Create a rule to block SQL injection attempts'
}));

// Call function directly
ws.send(JSON.stringify({
  type: 'function_call',
  functionName: 'detect_attacks',
  parameters: { timeRange: '24h', attackTypes: ['sqli', 'xss'] }
}));
```

## Configuration

### Protection Levels
- **Paranoid** - Maximum protection, may cause false positives
- **High** - Strong protection for production environments
- **Medium** - Balanced protection (recommended)
- **Low** - Minimal protection, mostly logging

### Rule Types
- `sqli` - SQL Injection
- `xss` - Cross-Site Scripting
- `rce` - Remote Code Execution
- `lfi` - Local File Inclusion
- `rfi` - Remote File Inclusion
- `custom` - User-defined patterns

## Docker Deployment

```yaml
services:
  wafmanager:
    build: ./backend/tools/21-wafmanager
    ports:
      - "4021:4021"
      - "6021:6021"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/wafmanager_db
      - GEMINI_API_KEY=${GEMINI_API_KEY}
```

## Security Considerations

- All rules are sandboxed before activation
- Attack payloads are sanitized in logs
- Rate limiting on all API endpoints
- Authentication required for rule modifications

## License

MIT License - Part of VictoryKit Security Suite
