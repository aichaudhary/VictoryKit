# FirewallAI - Intelligent Network Defense

**Tool #38** | Part of the VictoryKit Security Suite

## Overview

FirewallAI is an AI-driven firewall management platform that provides real-time policy generation, intrusion detection, and automated threat containment. It combines advanced network security with machine learning to deliver intelligent, adaptive protection.

## Key Features

- 🧱 **Policy Automation** - AI-generated firewall policies based on business context
- 🔍 **Intrusion Detection** - Multi-stage attack correlation and MITRE ATT&CK mapping
- 🌐 **Microsegmentation** - Zero-trust network design with data flow analysis
- 🛡️ **WAF Optimization** - Intelligent tuning to reduce false positives
- 📊 **Traffic Analytics** - Behavioral baselines and anomaly detection
- 📋 **Compliance Assessment** - Gap analysis against security frameworks
- 🚨 **Incident Response** - Automated runbook generation and containment

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FirewallAI                               │
│                    firewallai.maula.ai                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Policy    │  │  Intrusion  │  │    WAF      │              │
│  │   Engine    │  │  Detection  │  │  Optimizer  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Traffic    │  │   Threat    │  │ Compliance  │              │
│  │  Analytics  │  │   Intel     │  │  Auditor    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│                    AI Assistant (Gemini 1.5 Pro)                 │
│                    WebSocket: ws://localhost:6038/maula/ai       │
└─────────────────────────────────────────────────────────────────┘
```

## Ports

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3038 | React/TypeScript dashboard |
| Backend API | 4038 | Express REST API |
| AI WebSocket | 6038 | Gemini-powered AI assistant |
| WAF | 8080 | Web Application Firewall |
| Dashboard | 9038 | Admin dashboard |

## AI Functions

FirewallAI includes 10 specialized AI functions:

### 1. `analyze_traffic_pattern`
Detect anomalies in network traffic patterns and surface likely threats.

```javascript
{
  timeRange: string,        // Time range for analysis
  segments: string[],       // Network segments to include
  threshold: number,        // Anomaly score threshold
  includeBaselines: boolean // Include historical baselines
}
```

### 2. `generate_firewall_policy`
Generate firewall policies based on business context, assets, and risk appetite.

```javascript
{
  assets: string[],         // Assets and services to protect
  riskLevel: string,        // Risk tolerance: 'low' | 'medium' | 'high'
  controls: string[],       // Required controls or standards
  changeWindow: string      // Maintenance window for changes
}
```

### 3. `simulate_rule_change`
Simulate impact of rule changes on traffic, availability, and risk.

```javascript
{
  rules: object[],          // Proposed rule changes
  trafficProfile: object,   // Observed traffic profile
  blastRadius: string,      // Scope of change impact
  rollbackPlan: string      // Rollback approach
}
```

### 4. `detect_intrusion_campaign`
Correlate multi-stage intrusion patterns and suggest mitigations.

```javascript
{
  events: object[],         // Recent security events
  timeHorizon: string,      // Time horizon for correlation
  includeMITRE: boolean,    // Map to MITRE ATT&CK
  sensitivity: string       // Detection sensitivity
}
```

### 5. `recommend_microsegmentation`
Design microsegmentation policies based on asset relationships and data flows.

```javascript
{
  assets: object[],         // Inventory of assets
  flows: object[],          // Observed data flows
  sensitivityTags: string[], // Sensitivity tags for assets
  guardrails: string[]      // Non-functional guardrails
}
```

### 6. `optimize_waf_rules`
Tune WAF signatures and thresholds to reduce false positives.

```javascript
{
  application: string,      // Application or API name
  attackVectors: string[],  // Attack vectors to prioritize
  falsePositivePatterns: object[], // Known false positives
  performanceBudget: number // Latency budget in ms
}
```

### 7. `generate_incident_runbook`
Create step-by-step containment and recovery runbooks.

```javascript
{
  incidentType: string,     // Type of incident
  severity: string,         // Incident severity
  affectedAssets: string[], // Assets impacted
  dependencies: string[]    // Critical dependencies
}
```

### 8. `enrich_threat_intel`
Enrich alerts with threat intelligence and recommended blocks.

```javascript
{
  indicator: string,        // Indicator value (IP, domain, hash)
  indicatorType: string,    // Type: 'ip' | 'domain' | 'url' | 'hash'
  sources: string[],        // Intel sources to query
  confidenceFloor: number   // Minimum confidence threshold
}
```

### 9. `assess_compliance_gap`
Assess firewall controls against compliance frameworks.

```javascript
{
  framework: string,        // Compliance framework
  controls: object[],       // Implemented controls
  evidence: object[],       // Evidence artifacts
  exceptions: object[]      // Documented exceptions
}
```

### 10. `auto_contain_threat`
Execute automated containment actions for detected threats.

```javascript
{
  threatId: string,         // Threat identifier
  containmentLevel: string, // Level: 'monitor' | 'isolate' | 'block'
  affectedAssets: string[], // Assets to contain
  notifyTeam: boolean       // Send notifications
}
```

## Installation

### Backend AI Assistant

```bash
cd backend/tools/38-firewallai/ai-assistant
npm install
```

### Environment Variables

Create a `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key
PORT=6038
MONGODB_URI=mongodb://localhost:27017/firewallai_db
NODE_ENV=production
```

### Running the AI Assistant

```bash
npm start          # Production
npm run dev        # Development with hot reload
```

## API Endpoints

### Health Check
```
GET /health
```

### List Functions
```
GET /functions
```

### WebSocket Connection
```
ws://firewallai.maula.ai:6038/maula/ai
```

## Database Collections

- `firewall_events` - Firewall event logs
- `policies` - Firewall policy definitions
- `rule_versions` - Policy version history
- `threat_intel_cache` - Cached threat intelligence
- `incidents` - Security incidents
- `audit_logs` - Configuration audit trail
- `network_assets` - Asset inventory
- `traffic_profiles` - Traffic baselines
- `anomaly_signals` - Detected anomalies
- `playbooks` - Response playbooks

## Compliance Frameworks

- **PCI-DSS** - Payment Card Industry
- **NIST 800-53** - Federal security controls
- **CIS Controls** - Center for Internet Security
- **ISO 27001** - Information security management
- **SOC 2** - Service organization controls

## Directory Structure

```
38-firewallai/
├── ai-assistant/
│   ├── package.json
│   └── src/
│       ├── server.js           # WebSocket server with Gemini AI
│       └── functionExecutor.js # AI function implementations
├── api/                        # Express REST API
├── src/
│   ├── components/             # React components
│   └── services/
│       ├── config.ts           # Configuration wrapper
│       ├── aiService.ts        # WebSocket AI client
│       └── firewallAPI.ts      # REST API client
└── README.md
```

## Deployment

Deploy to: **firewallai.maula.ai**

```bash
# Using PM2
pm2 start ecosystem.config.js --only firewallai-ai

# Using Docker
docker-compose -f docker-compose.prod.yml up firewallai-ai
```

## Related Tools

- **Tool #36** - BrowserIsolation (Web content filtering)
- **Tool #37** - DNSShield (DNS security)
- **Tool #39** - VPNGuardian (VPN security)
- **Tool #40** - WirelessHunter (Wireless security)

## License

MIT License - VictoryKit Team
