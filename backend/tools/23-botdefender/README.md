# BotDefender - AI-Powered Bot Detection & Mitigation

<div align="center">

![BotDefender](https://img.shields.io/badge/Tool-%2323-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-green)
![Status](https://img.shields.io/badge/Status-Production-brightgreen)
![AI](https://img.shields.io/badge/AI-Gemini%201.5-purple)

**Intelligent Bot Detection, Classification & Mitigation Platform**

</div>

## Overview

BotDefender is an AI-powered bot detection and mitigation platform that identifies, classifies, and manages bot traffic. It uses advanced fingerprinting, behavior analysis, and machine learning to distinguish between legitimate users, good bots (search engines), and malicious bots (scrapers, credential stuffers).

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      BotDefender                             │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + TypeScript)              Port: 3023      │
│  ├── Dashboard - Bot traffic overview & metrics             │
│  ├── Bot Analyzer - Fingerprint & behavior analysis         │
│  ├── Challenge Manager - CAPTCHA & challenge config         │
│  └── AI Assistant - Chat-based bot management               │
├─────────────────────────────────────────────────────────────┤
│  Backend API (Express)                      Port: 4023      │
│  ├── /api/bots - Bot detection & classification             │
│  ├── /api/fingerprints - Browser fingerprint analysis       │
│  ├── /api/challenges - Challenge configuration              │
│  └── /api/requests - Request logging & analysis             │
├─────────────────────────────────────────────────────────────┤
│  AI Assistant (WebSocket + Gemini)          Port: 6023      │
│  ├── Bot behavior pattern recognition                       │
│  ├── Fingerprint anomaly detection                          │
│  └── Mitigation recommendations                             │
├─────────────────────────────────────────────────────────────┤
│  Database: MongoDB                     DB: botdefender_db   │
│  └── Collections: bots, requests, fingerprints, challenges  │
└─────────────────────────────────────────────────────────────┘
```

## Features

### Core Capabilities
- 🤖 **Bot Detection** - Real-time bot identification and classification
- 🔍 **Fingerprint Analysis** - Browser and device fingerprint inspection
- 📊 **Behavior Analysis** - User behavior pattern recognition
- 🧩 **Challenge System** - CAPTCHA, proof-of-work, invisible challenges
- ✅ **Good Bot Management** - Allowlist for legitimate bots
- 🛡️ **Attack Protection** - Credential stuffing & scraping defense

### AI Functions
| Function | Description |
|----------|-------------|
| `detect_bots` | Detect and classify bot traffic in real-time |
| `analyze_fingerprint` | Analyze browser/device fingerprint for automation |
| `analyze_behavior` | Analyze user behavior patterns for bot signals |
| `configure_challenge` | Configure challenge types and difficulty |
| `manage_botlist` | Manage allow/block lists for bots |
| `protect_endpoint` | Set endpoint-specific bot protection |
| `detect_credential_stuffing` | Detect credential stuffing attacks |
| `analyze_scraping` | Detect and analyze web scraping activity |
| `manage_good_bots` | Configure allowlist for legitimate bots |
| `generate_report` | Generate bot activity and mitigation reports |

## Database Models

### Bot
```javascript
{
  identifier: String,        // IP, fingerprint hash, etc.
  classification: String,    // good, bad, unknown
  botType: String,          // scraper, crawler, stuffing, etc.
  confidence: Number,        // Detection confidence (0-100)
  lastSeen: Date,
  totalRequests: Number,
  blocked: Boolean,
  notes: String
}
```

### Fingerprint
```javascript
{
  hash: String,              // Fingerprint hash
  userAgent: String,
  screenResolution: String,
  timezone: String,
  plugins: [String],
  canvasHash: String,
  webglHash: String,
  automationSignals: [String],
  riskScore: Number
}
```

### Challenge
```javascript
{
  name: String,
  type: String,              // captcha, pow, invisible, behavioral
  difficulty: String,        // easy, medium, hard, adaptive
  endpoints: [String],
  triggerConditions: Object,
  successRate: Number,
  enabled: Boolean
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
cd backend/tools/23-botdefender

# Install dependencies
npm install

# Set environment variables
export MONGODB_URI=mongodb://localhost:27017/botdefender_db
export GEMINI_API_KEY=your_key_here
export PORT=4023
export AI_WS_PORT=6023

# Start the server
npm run dev
```

### Frontend Setup

```bash
cd frontend/tools/23-botdefender
npm install
npm run dev
```

## API Reference

### Bot Detection

```bash
# Analyze request for bot signals
POST /api/bots/analyze
{
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "fingerprint": { ... }
}

# Get bot statistics
GET /api/bots/stats?timeRange=24h

# Block a bot
POST /api/bots/:id/block
```

### Fingerprint Analysis

```bash
# Submit fingerprint for analysis
POST /api/fingerprints/analyze
{
  "canvasHash": "abc123",
  "webglHash": "def456",
  "screenResolution": "1920x1080",
  "timezone": "America/New_York",
  "plugins": ["Chrome PDF Plugin"]
}

# Get fingerprint risk assessment
GET /api/fingerprints/:hash/risk
```

### Challenge Configuration

```bash
# Create a challenge
POST /api/challenges
{
  "name": "Login Protection",
  "type": "captcha",
  "difficulty": "adaptive",
  "endpoints": ["/api/auth/login"]
}

# Get challenge stats
GET /api/challenges/:id/stats
```

## AI Assistant Usage

Connect to WebSocket at `ws://localhost:6023`:

```javascript
const ws = new WebSocket('ws://localhost:6023');

// Detect credential stuffing
ws.send(JSON.stringify({
  type: 'function_call',
  functionName: 'detect_credential_stuffing',
  parameters: { 
    timeRange: '1h',
    autoBlock: true
  }
}));

// Analyze suspicious fingerprint
ws.send(JSON.stringify({
  type: 'function_call',
  functionName: 'analyze_fingerprint',
  parameters: { 
    fingerprintId: 'fp_abc123'
  }
}));
```

## Configuration

### Bot Types
- `scraper` - Web content scrapers
- `crawler` - Search engine crawlers
- `credential_stuffer` - Credential stuffing bots
- `spam_bot` - Comment/form spam bots
- `scanner` - Vulnerability scanners
- `click_bot` - Click fraud bots

### Challenge Types
- `captcha` - Image/text CAPTCHA
- `pow` - Proof of Work (computational)
- `invisible` - Invisible JavaScript challenge
- `behavioral` - Mouse/keyboard analysis

### Sensitivity Levels
- `high` - Aggressive detection, more challenges
- `medium` - Balanced detection (recommended)
- `low` - Permissive, fewer false positives

## Good Bots Allowlist

Pre-configured allowlist for legitimate bots:
- **Search Engines**: Googlebot, Bingbot, Yandex, Baidu
- **Social Media**: Facebookbot, Twitterbot, LinkedInBot
- **Monitoring**: Pingdom, UptimeRobot, Datadog
- **SEO Tools**: Ahrefs, SEMrush, Moz

## Docker Deployment

```yaml
services:
  botdefender:
    build: ./backend/tools/23-botdefender
    ports:
      - "4023:4023"
      - "6023:6023"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/botdefender_db
      - GEMINI_API_KEY=${GEMINI_API_KEY}
```

## Integration

### JavaScript SDK

```javascript
import { BotDefender } from '@victorykit/botdefender';

const bd = new BotDefender({ apiKey: 'your-key' });

// Verify request
const result = await bd.verify({
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  fingerprint: req.body.fingerprint
});

if (result.isBot) {
  return res.status(403).json({ error: 'Bot detected' });
}
```

## Security Considerations

- Fingerprints are hashed for privacy
- IP addresses are anonymized in reports
- Challenge responses are encrypted
- Good bots are verified via DNS

## License

MIT License - Part of VictoryKit Security Suite
