# 🎯 RiskScoreAI - AI-Powered Enterprise Risk Assessment Engine

**Tool #29 | MAULA.AI Platform | VictoryKit Cybersecurity Suite**

---

## 📊 Overview

**RiskScoreAI** is an advanced AI-powered risk quantification and assessment platform that provides comprehensive enterprise risk scoring across assets, users, threats, and vendors. Built on industry-standard frameworks (NIST, ISO 27001, FAIR), it delivers real-time risk calculations, predictive analytics, and actionable insights for security and risk management teams.

### 🎯 Core Capabilities

- **Multi-Domain Risk Assessment**: Assets, users, threats, vulnerabilities, and vendors
- **AI-Powered Analysis**: 10 specialized risk scoring functions with multi-LLM support
- **Predictive Risk Analytics**: ML-based trajectory forecasting and scenario modeling
- **Enterprise Risk Aggregation**: Organization-wide risk scoring with customizable weighting
- **Real-Time Risk Heatmaps**: Visual risk distribution across all domains
- **Compliance Framework Support**: NIST CSF, ISO 27001/27005, FAIR quantitative analysis
- **CVSS Integration**: Automated vulnerability risk scoring with CVSS v3.1

### 🔴🟡🟢 Risk Level Classification

```
 0-39  | LOW      (🟢 Green)  | Acceptable risk, routine monitoring
40-59  | MEDIUM   (🟡 Amber)  | Requires attention, implement standard controls
60-79  | HIGH     (🟠 Orange) | Immediate action needed, escalate to management
80-100 | CRITICAL (🔴 Red)    | Business-critical, executive escalation required
```

---

## 🏗️ Architecture

### Technology Stack

- **Backend API**: Node.js 18+ + Express 4.18
- **Database**: MongoDB 8.0 + Mongoose ODM (5 specialized collections)
- **AI Assistant**: WebSocket + Multi-LLM (Gemini, Claude, GPT-4, Grok)
- **Frontend**: React 18.2 + TypeScript 5.3 + Vite 5.0
- **Risk Frameworks**: NIST RMF, ISO 27001/27005, FAIR

### Port Configuration

- **Frontend**: `3029` - React application UI
- **Backend API**: `4029` - REST API for risk calculations
- **ML Engine**: `8029` - Machine learning risk predictions
- **AI Assistant**: `6029` - WebSocket streaming AI assistant

### Database Architecture

**MongoDB Database**: `riskscoreai_db`

**Collections**:
1. **AssetRisk** - Asset risk assessment with vulnerabilities, exposure, controls
2. **UserRisk** - User behavior analysis with access profiles, incidents, compliance
3. **ThreatRisk** - Threat risk evaluation with MITRE ATT&CK, exploitability, IOCs
4. **VendorRisk** - Third-party risk with certifications, breach history, compliance
5. **RiskPrediction** - ML predictions with trajectories, scenarios, recommendations

---

## 🚀 Quick Start

### Prerequisites

```bash
# Required
Node.js >= 18.0.0
MongoDB >= 8.0
npm >= 9.0.0

# Optional (AI Features)
GEMINI_API_KEY=your_gemini_key
ANTHROPIC_API_KEY=your_claude_key
OPENAI_API_KEY=your_gpt4_key
XAI_API_KEY=your_grok_key
```

### Installation

```bash
# 1. Install Backend API Dependencies
cd backend/tools/29-riskscoreai/api
npm install

# 2. Install AI Assistant Dependencies
cd ../ai-assistant
npm install

# 3. Install Frontend Dependencies
cd ../../../frontend/tools/29-riskscoreai
npm install
```

### Environment Configuration

Create `.env` files in each service directory:

**Backend API** (`backend/tools/29-riskscoreai/api/.env`):
```env
PORT=4029
MONGODB_URI=mongodb://mongodb:27017/riskscoreai_db
NODE_ENV=production
```

**AI Assistant** (`backend/tools/29-riskscoreai/ai-assistant/.env`):
```env
AI_PORT=6029
API_BASE_URL=http://localhost:4029
GEMINI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
XAI_API_KEY=your_key_here
```

**Frontend** (`frontend/tools/29-riskscoreai/.env`):
```env
VITE_API_URL=http://localhost:4029
VITE_AI_WS_URL=ws://localhost:6029/maula-ai
```

### Starting Services

```bash
# Start Backend API
cd backend/tools/29-riskscoreai/api
npm start

# Start AI Assistant (separate terminal)
cd backend/tools/29-riskscoreai/ai-assistant
npm start

# Start Frontend (separate terminal)
cd frontend/tools/29-riskscoreai
npm run dev
```

Access the application:
- **Frontend**: http://localhost:3029
- **API Health**: http://localhost:4029/health
- **AI Assistant**: ws://localhost:6029/maula-ai

---

## 📡 API Documentation

### Base URL
```
http://localhost:4029/api/v1/risk
```

### Authentication
All endpoints currently accept unauthenticated requests. Production deployments should implement JWT/OAuth2.

---

### 🏢 Asset Risk Endpoints

#### Calculate Asset Risk
```http
POST /api/v1/risk/assets/calculate
Content-Type: application/json

{
  "asset_id": "server-prod-web-01",
  "asset_type": "server",
  "asset_data": {
    "name": "Production Web Server",
    "criticality": "high",
    "data_classification": "confidential",
    "vulnerabilities": [
      {
        "cve": "CVE-2024-1234",
        "cvss": 7.5,
        "severity": "high"
      }
    ],
    "last_patched": "2024-01-01",
    "exposure": "internet_facing",
    "controls": ["firewall", "ids", "antivirus"]
  },
  "include_predictions": true,
  "risk_model": "nist"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "assetId": "server-prod-web-01",
    "riskScore": 72,
    "riskLevel": "high",
    "details": {
      "assetName": "Production Web Server",
      "riskScore": {
        "current": 72,
        "previous": 65,
        "trend": "increasing"
      },
      "riskFactors": [
        {
          "factor": "Network Exposure",
          "value": "internet_facing",
          "weight": 0.25,
          "severity": "high"
        },
        {
          "factor": "Vulnerabilities",
          "value": 1,
          "weight": 0.30,
          "severity": "high"
        }
      ]
    }
  }
}
```

#### Get Asset Risks
```http
GET /api/v1/risk/assets?asset_type=server&risk_level=high&page=1&limit=20
```

#### Get Specific Asset Risk
```http
GET /api/v1/risk/assets/{assetId}
```

---

### 👤 User Risk Endpoints

#### Calculate User Risk
```http
POST /api/v1/risk/users/calculate
Content-Type: application/json

{
  "user_id": "john.doe",
  "user_data": {
    "name": "John Doe",
    "email": "john.doe@company.com",
    "role": "Developer",
    "department": "Engineering",
    "access_level": "elevated",
    "privileged_access": true,
    "failed_logins": 3,
    "policy_violations": [
      {
        "type": "data_exfiltration_attempt",
        "date": "2024-01-15"
      }
    ]
  },
  "time_period": "last_30_days"
}
```

#### Get User Risks
```http
GET /api/v1/risk/users?department=Engineering&risk_level=high
```

---

### ⚠️ Threat Risk Endpoints

#### Assess Threat Risk
```http
POST /api/v1/risk/threats/assess
Content-Type: application/json

{
  "threat_id": "threat-2024-001",
  "threat_data": {
    "name": "Ransomware Campaign",
    "threat_type": "malware",
    "severity": "critical",
    "business_impact": "high",
    "exploitability": "high",
    "actively_exploited": true,
    "attack_vector": "email",
    "complexity": "low",
    "affected_assets": ["server-01", "server-02"],
    "mitre_tactics": ["initial-access", "execution"],
    "mitre_techniques": ["T1566.001", "T1204.002"],
    "active": true
  }
}
```

#### Get Threat Risks
```http
GET /api/v1/risk/threats?active_only=true&risk_level=critical
```

---

### 🏭 Vendor Risk Endpoints

#### Calculate Vendor Risk
```http
POST /api/v1/risk/vendors/calculate
Content-Type: application/json

{
  "vendor_name": "Acme Cloud Services",
  "vendor_data": {
    "access_level": "extensive",
    "data_shared": ["customer_data", "financial_records"],
    "contract_value": 500000,
    "dependency_level": "critical",
    "security_certifications": ["ISO27001", "SOC2"],
    "recent_breaches": 0,
    "compliance_required": ["GDPR", "HIPAA"],
    "compliance_status": {
      "GDPR": "compliant",
      "HIPAA": "compliant"
    }
  },
  "assessment_type": "annual_review"
}
```

---

### 🗺️ Risk Heatmap Endpoint

#### Generate Risk Heatmap
```http
POST /api/v1/risk/heatmap
Content-Type: application/json

{
  "scope": "organization",
  "scope_id": "engineering",
  "risk_categories": ["assets", "users", "threats", "vendors"],
  "time_period": "current",
  "grouping": "department"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "overallScore": 58,
    "riskDistribution": {
      "critical": { "count": 5, "percentage": 8 },
      "high": { "count": 15, "percentage": 25 },
      "medium": { "count": 30, "percentage": 50 },
      "low": { "count": 10, "percentage": 17 }
    },
    "categories": {
      "assets": {
        "total": 150,
        "critical": 2,
        "high": 8,
        "averageScore": 52
      },
      "users": {
        "total": 250,
        "critical": 1,
        "high": 10,
        "averageScore": 45
      }
    }
  }
}
```

---

### 🔮 Risk Prediction Endpoints

#### Predict Risk Trajectory
```http
POST /api/v1/risk/predictions/trajectory
Content-Type: application/json

{
  "entity_type": "asset",
  "entity_id": "server-prod-web-01",
  "prediction_horizon": "90_days",
  "include_scenarios": true,
  "confidence_threshold": 75
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "entityType": "asset",
    "entityId": "server-prod-web-01",
    "currentRiskScore": 72,
    "prediction": {
      "predictions": [
        {
          "timeframe": "90_days",
          "predictedScore": 65,
          "confidenceLevel": 82,
          "factors": [
            {
              "factor": "Historical Trend",
              "impact": "positive",
              "magnitude": 5
            }
          ]
        }
      ],
      "trajectory": {
        "direction": "improving",
        "velocity": -0.08
      },
      "scenarios": [
        {
          "scenarioName": "Best Case",
          "description": "All recommended actions implemented",
          "predictedScore": 45,
          "probability": 30,
          "recommendedActions": [
            "Patch vulnerabilities",
            "Implement controls"
          ]
        }
      ]
    }
  }
}
```

---

### 📊 Risk Aggregation Endpoint

#### Aggregate Risk Score
```http
POST /api/v1/risk/aggregate
Content-Type: application/json

{
  "aggregation_level": "department",
  "aggregation_id": "engineering",
  "risk_components": ["asset_risk", "user_risk", "threat_risk", "vendor_risk"],
  "weighting": {
    "asset_risk": 0.3,
    "user_risk": 0.2,
    "threat_risk": 0.3,
    "vendor_risk": 0.2
  },
  "include_breakdown": true
}
```

---

### 📈 Dashboard Endpoint

#### Get Dashboard Statistics
```http
GET /api/v1/risk/dashboard/stats
```

**Response**:
```json
{
  "success": true,
  "data": {
    "assets": {
      "total": 150,
      "critical": 2,
      "averageRisk": 52
    },
    "users": {
      "total": 250,
      "highRisk": 11,
      "averageRisk": 45
    },
    "threats": {
      "active": 12
    },
    "vendors": {
      "total": 35,
      "highRisk": 3
    }
  }
}
```

---

## 🤖 AI Assistant Functions

The AI Assistant provides 10 specialized risk scoring functions accessible via WebSocket on port `6029`.

### Connection

```javascript
const ws = new WebSocket('ws://localhost:6029/maula-ai');

ws.onopen = () => {
  console.log('Connected to RiskScoreAI Assistant');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

### AI Functions

#### 1. calculate_asset_risk
Calculates comprehensive risk score for infrastructure assets.

**Parameters**:
- `asset_id` (required): Asset identifier
- `asset_name`: Human-readable asset name
- `asset_type`: server | endpoint | application | database
- `business_criticality`: low | medium | high | critical
- `network_exposure`: internal | dmz | internet_facing
- `vulnerabilities`: Array of CVE objects
- `security_controls`: Array of implemented controls

#### 2. calculate_user_risk
Analyzes user behavior and access patterns for risk scoring.

**Parameters**:
- `user_id` (required): User identifier
- `user_name`: Full name
- `access_level`: basic | elevated | administrative
- `failed_logins`: Number of failed login attempts
- `policy_violations`: Array of policy violation incidents

#### 3. assess_threat_risk
Evaluates threat severity and potential impact.

**Parameters**:
- `threat_id` (required): Threat identifier
- `threat_type`: malware | phishing | exploit | insider
- `severity`: low | medium | high | critical
- `exploitability`: low | medium | high
- `actively_exploited`: boolean
- `mitre_tactics`: Array of MITRE ATT&CK tactics
- `affected_assets`: Array of impacted asset IDs

#### 4. score_vulnerability
CVSS-based vulnerability risk scoring.

**Parameters**:
- `cve_id`: CVE identifier
- `cvss_score`: CVSS base score (0-10)
- `attack_vector`: network | adjacent | local | physical
- `exploitability`: active | poc | unproven
- `patch_available`: boolean

#### 5. calculate_vendor_risk
Third-party and supply chain risk assessment.

**Parameters**:
- `vendor_name` (required): Vendor company name
- `access_level`: none | limited | moderate | extensive
- `dependency_level`: low | medium | high | critical
- `security_certifications`: Array of certifications (ISO27001, SOC2, etc.)
- `recent_breaches`: Number of breaches in last 12 months

#### 6. generate_risk_heatmap
Creates visual risk distribution across organization.

**Parameters**:
- `scope`: organization | department | region
- `risk_categories`: Array of categories to include
- `grouping`: department | location | asset_type

#### 7. predict_risk_trajectory
ML-based risk forecasting and trend analysis.

**Parameters**:
- `entity_type` (required): asset | user | vendor
- `entity_id` (required): Entity identifier
- `prediction_horizon`: 7_days | 30_days | 90_days | 180_days
- `include_scenarios`: boolean

#### 8. aggregate_risk_score
Organization-wide risk score aggregation.

**Parameters**:
- `aggregation_level`: organization | department | team
- `risk_components`: Array of risk components to aggregate
- `weighting`: Custom weight distribution object

#### 9. analyze_risk_trends
Historical risk trend analysis.

**Parameters**:
- `time_period`: last_7_days | last_30_days | last_90_days
- `categories`: Array of categories to analyze

#### 10. create_custom_risk_model
Build custom risk models with user-defined factors.

**Parameters**:
- `model_name` (required): Model name
- `factors` (required): Array of risk factors
- `weights` (required): Factor weight distribution (must sum to 1.0)
- `thresholds`: Custom risk level thresholds

---

## 🧮 Risk Calculation Formulas

### Base Risk Score Formula

```
Risk Score = (Threat × Vulnerability × Impact) / Controls Effectiveness

Where:
- Threat (0-100): Likelihood of threat materialization
- Vulnerability (0-100): Weakness exposure level
- Impact (0-100): Business impact severity
- Controls (0-100): Security control effectiveness
```

### Asset Risk Calculation

```
Asset Risk = (0.25 × Criticality) + (0.30 × Vulnerabilities) + 
             (0.25 × Exposure) - (0.20 × Controls)

Criticality Score:
- Low: 5 points
- Medium: 12 points
- High: 18 points
- Critical: 25 points

Vulnerability Score:
- 3 points per vulnerability (max 30 points)

Exposure Score:
- Internal: 5 points
- DMZ: 15 points
- Internet-facing: 25 points

Controls (Reduction):
- 2 points per control (max -20 points)
```

### User Risk Calculation

```
User Risk = (0.20 × Access Level) + (0.25 × Failed Logins) + 
            (0.30 × Policy Violations) + (0.25 × Suspicious Activities)

Access Level Score:
- Basic: 5 points
- Elevated: 10 points
- Administrative: 15 points
- Super Admin: 20 points

Failed Logins: 2 points each (max 25)
Policy Violations: 5 points each (max 30)
Suspicious Activities: 5 points each (max 25)
```

### Threat Risk Calculation

```
Threat Risk = (0.35 × Severity) + (0.30 × Exploitability) + 
              (0.20 × Scope) + (0.15 × Active Exploitation Bonus)

Severity Score:
- Low: 10 points
- Medium: 20 points
- High: 30 points
- Critical: 35 points

Active Exploitation: +15 points if actively exploited
```

### Vendor Risk Calculation

```
Vendor Risk = (0.25 × Access Level) + (0.25 × Dependency Level) + 
              (0.30 × Breach History) - (0.20 × Certifications)

Access Level:
- None: 0 | Limited: 8 | Moderate: 15 | Extensive: 25

Dependency Level:
- Low: 5 | Medium: 12 | High: 18 | Critical: 25

Breach History: 10 points per breach (max 30)
Certifications: -5 points per cert (max -20)
```

---

## 🎨 Risk Visualization

### Color-Coded Risk Levels

```css
/* CSS Color Definitions */
--risk-critical: #dc2626;  /* Red */
--risk-high:     #f59e0b;  /* Amber/Orange */
--risk-medium:   #f59e0b;  /* Amber */
--risk-low:      #10b981;  /* Green */
```

### Risk Matrix

```
        IMPACT
        ↑
   100  🔴🔴🔴🔴🔴
    80  🔴🔴🔴🔴🟠
    60  🔴🟠🟠🟠🟡
    40  🟠🟡🟡🟡🟢
    20  🟡🟢🟢🟢🟢
     0  ________________→
        0 20 40 60 100
        LIKELIHOOD
```

---

## 🔐 Security Best Practices

### API Security
- Implement JWT authentication for production
- Enable rate limiting (100 requests/minute)
- Use HTTPS/TLS for all API communications
- Validate all input parameters
- Sanitize database queries

### WebSocket Security
- Implement authentication handshake
- Use WSS (WebSocket Secure) in production
- Validate all incoming messages
- Rate limit function executions

### Database Security
- Enable MongoDB authentication
- Use encrypted connections
- Implement role-based access control (RBAC)
- Regular backup and disaster recovery

---

## 📊 Use Cases

### 1. Security Operations Center (SOC)
- Real-time asset risk monitoring
- Threat-based risk escalation
- Automated risk scoring for incidents
- Risk heatmap for situational awareness

### 2. Risk Management Teams
- Enterprise risk aggregation
- Compliance gap analysis
- Vendor risk assessments
- Risk trend reporting for executives

### 3. IT Operations
- Vulnerability prioritization based on risk
- Patching prioritization workflows
- Asset criticality management
- User access risk reviews

### 4. Compliance & Audit
- ISO 27001/27005 risk assessments
- NIST CSF implementation
- Third-party risk management (TPRM)
- Continuous compliance monitoring

---

## 🛠️ Development

### Running Tests

```bash
# Backend API tests
cd backend/tools/29-riskscoreai/api
npm test

# AI Assistant tests
cd ../ai-assistant
npm test

# Frontend tests
cd ../../../frontend/tools/29-riskscoreai
npm test
```

### Building for Production

```bash
# Backend API
cd backend/tools/29-riskscoreai/api
npm run build

# Frontend
cd ../../../frontend/tools/29-riskscoreai
npm run build
```

---

## 📝 License

Copyright © 2024 VictoryKit/MAULA.AI
All Rights Reserved.

---

## 🆘 Support

- **Documentation**: See this README
- **Issues**: GitHub Issues
- **Email**: support@maula.ai

---

## 🚦 Status

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: January 2024

---

**RiskScoreAI** - *Quantify Risk. Prioritize Action. Reduce Impact.*
