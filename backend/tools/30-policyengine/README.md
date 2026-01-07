# 📜 PolicyEngine - AI-Powered Security Policy Management

**Tool #30 | Domain: policyengine.maula.ai | Ports: 3030 (Frontend), 4030 (API), 6030 (AI)**

## 📋 Overview

PolicyEngine is an enterprise-grade security policy management platform designed to:
- **Create comprehensive security policies** from templates or custom requirements
- **Map policies to compliance frameworks** (NIST 800-53, ISO 27001, CIS, GDPR)
- **Detect and remediate policy violations** in real-time
- **Manage approval workflows** with multi-level sign-off
- **Generate compliance reports** and audit documentation
- **Provide AI-powered policy recommendations** based on industry best practices

---

## 🏗️ Architecture

### **Frontend (Port 3030)**
- **React 19 + TypeScript 5.3**
- **Vite 5.0** for development
- **Tailwind CSS** with violet/purple theme (#7C3AED)
- **5 Core Pages:**
  - `PolicyDashboard` - Overview with compliance scores and violations
  - `PolicyEditor` - Create and manage policies with templates
  - `ComplianceMapping` - Map policies to regulatory frameworks
  - `PolicyViolations` - Monitor and remediate violations
  - `PolicyWorkflows` - Multi-level approval management

### **Backend API (Port 4030)**
- **Node.js + Express** REST API
- **MongoDB** for data persistence (policyengine_db)
- **5 Core Collections:**
  - `policies` - Security policies with version history
  - `violations` - Detected policy violations
  - `frameworks` - Compliance framework definitions
  - `workflows` - Approval workflow configurations
  - `audit_logs` - Complete audit trail

### **AI Assistant (Port 6030)**
- **WebSocket Server** at `/maula-ai`
- **Multi-LLM Support:** Gemini, Claude 3.5, GPT-4
- **10 Policy-Specific Functions**
- **Real-time streaming** with function calling

---

## 🎯 Key Features

### **1. Policy Editor**
- Visual policy builder with templates
- Framework-based policy generation
- Version control and change tracking
- Policy categorization and tagging

### **2. Compliance Mapping**
Supported Frameworks:
- **NIST 800-53** Rev. 5 (142 controls)
- **ISO 27001** 2022 (93 controls)
- **CIS Controls** v8 (18 controls)
- **GDPR** 2018 (28 articles)
- **SOX**, **HIPAA**, **PCI-DSS**

### **3. Violation Detection**
- Real-time policy monitoring
- Severity classification (Critical, High, Medium, Low)
- Automated remediation suggestions
- Exception/exemption management

### **4. Approval Workflows**
- Multi-level approval chains
- Configurable approver roles
- Comment and collaboration system
- SLA tracking for approvals

---

## 🤖 AI Functions

| Function | Description |
|----------|-------------|
| `create_policy` | Generate policies from templates or requirements |
| `analyze_compliance` | Assess policy coverage against frameworks |
| `detect_gaps` | Identify gaps in control coverage |
| `generate_remediation` | Create remediation plans for violations |
| `map_controls` | Map policies to framework controls |
| `assess_risk` | Evaluate policy-related risks |
| `generate_report` | Create compliance and audit reports |
| `suggest_improvements` | AI-powered policy recommendations |
| `compare_frameworks` | Cross-framework analysis |
| `predict_violations` | ML-based violation prediction |

---

## 📊 Database Schema

### Policies Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  category: String, // access_control, data_protection, etc.
  status: String, // draft, pending_approval, active, archived
  complianceStatus: String, // compliant, non_compliant, partial
  framework: String,
  version: Number,
  controls: [String],
  owner: String,
  approvers: [{ userId: String, status: String, date: Date }],
  content: {
    purpose: String,
    scope: String,
    policy_statements: [String],
    enforcement: String,
    exceptions: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Violations Collection
```javascript
{
  _id: ObjectId,
  policyId: ObjectId,
  severity: String, // low, medium, high, critical
  status: String, // open, acknowledged, remediated, exempted
  description: String,
  resource: String,
  evidence: Object,
  remediation: {
    suggested: String,
    applied: String,
    appliedBy: String,
    appliedAt: Date
  },
  detectedAt: Date,
  resolvedAt: Date
}
```

### Frameworks Collection
```javascript
{
  _id: ObjectId,
  name: String, // NIST 800-53, ISO 27001, etc.
  version: String,
  categories: [{
    name: String,
    controls: [{
      id: String,
      name: String,
      description: String,
      implemented: Boolean,
      policies: [ObjectId]
    }]
  }],
  coverage: Number
}
```

---

## 🚀 Quick Start

### Frontend
```bash
cd frontend/tools/30-policyengine
npm install
npm run dev
# Access at http://localhost:3030
```

### Backend API
```bash
cd backend/tools/30-policyengine/api
npm install
npm run dev
# API at http://localhost:4030
```

### AI Assistant
```bash
cd backend/tools/30-policyengine/ai-assistant
npm install
npm run dev
# WebSocket at ws://localhost:6030
```

---

## 📁 Project Structure

```
30-policyengine/
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Main application
│   │   ├── components/
│   │   │   ├── PolicyDashboard.tsx
│   │   │   ├── PolicyEditor.tsx
│   │   │   ├── ComplianceMapping.tsx
│   │   │   ├── PolicyViolations.tsx
│   │   │   └── PolicyWorkflows.tsx
│   │   ├── services/
│   │   │   └── policyEngineAPI.ts
│   │   └── types.ts
│   ├── policyengine-config.json
│   ├── vite.config.ts
│   └── package.json
│
└── backend/
    ├── api/
    │   └── src/
    │       ├── controllers/
    │       ├── models/
    │       ├── routes/
    │       └── services/
    ├── ai-assistant/
    │   └── src/
    │       ├── server.js
    │       └── functionExecutor.js
    └── README.md
```

---

## 🎨 Theme

- **Primary Color:** #7C3AED (Violet)
- **Secondary:** #A78BFA (Light Violet)
- **Success:** #10B981 (Emerald)
- **Warning:** #F59E0B (Amber)
- **Danger:** #EF4444 (Red)

---

## 📞 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/policies` | List all policies |
| POST | `/api/policies` | Create new policy |
| GET | `/api/policies/:id` | Get policy details |
| PUT | `/api/policies/:id` | Update policy |
| DELETE | `/api/policies/:id` | Delete policy |
| GET | `/api/violations` | List violations |
| POST | `/api/violations/:id/remediate` | Remediate violation |
| GET | `/api/frameworks` | List frameworks |
| GET | `/api/frameworks/:id/coverage` | Get framework coverage |
| POST | `/api/workflows/:id/approve` | Approve workflow |
| POST | `/api/workflows/:id/reject` | Reject workflow |

---

## 🔒 Security

- JWT authentication for API access
- Role-based access control (RBAC)
- Audit logging for all policy changes
- Encrypted policy content at rest
- API rate limiting

---

## 📈 Roadmap

- [ ] Policy-as-Code engine integration
- [ ] Automated control testing
- [ ] Integration with SIEM/SOAR platforms
- [ ] Custom framework builder
- [ ] ML-based policy optimization

---

**Built with ❤️ by VictoryKit Team**
