# PCI DSS Check Tool - Design & Implementation Documentation

## Tool Overview

**Tool #49: PCI DSS Check**  
**Subdomain:** pcidsschk.maula.ai  
**Tagline:** Comprehensive Payment Card Industry Compliance Validation

## Real-World Usage

PCI DSS Check is an enterprise-grade compliance validation platform that helps organizations:

1. **Assess PCI DSS Compliance** across all 12 requirements and 78+ sub-requirements
2. **Scan & Detect** cardholder data environments and security vulnerabilities
3. **Manage Findings** with prioritized remediation workflows
4. **Generate Reports** including SAQ, AOC, and ROC documentation
5. **Track Progress** toward compliance with real-time dashboards
6. **Prepare for Audits** with comprehensive evidence collection

### Target Users
- **Payment Processors** (Merchant Levels 1-4)
- **E-commerce Platforms**
- **Financial Institutions**
- **Service Providers**
- **QSAs (Qualified Security Assessors)**
- **Internal Security Teams**

## Premium Experience Design

### 1. **Executive Dashboard** (Landing Page)
```
┌─────────────────────────────────────────────────────────────┐
│  COMPLIANCE SCORE: 87%  │  STATUS: In Progress  │  Level 2  │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Critical │  │   High   │  │  Medium  │  │    Low   │   │
│  │    3     │  │    12    │  │    28    │  │    45    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
├─────────────────────────────────────────────────────────────┤
│  12 REQUIREMENT CARDS (Grid Layout)                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ Req 1: 95% │  │ Req 2: 88% │  │ Req 3: 72% │  ...      │
│  │ Firewalls  │  │   Config   │  │   Data     │           │
│  │ ✓ Compliant│  │ ⚠ 3 Issues │  │ ✗ Critical │           │
│  └────────────┘  └────────────┘  └────────────┘           │
├─────────────────────────────────────────────────────────────┤
│  QUICK ACTIONS:                                              │
│  [Start New Scan] [View Findings] [Generate Report]         │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Animated compliance score gauge
- Color-coded requirement cards (green/yellow/red)
- Real-time updates via WebSocket
- Trend graphs showing compliance over time
- Quick stats (Last Scan Date, Next Scan Due, Days to Compliance)

### 2. **Intelligent Scanning Interface**
```
┌─────────────────────────────────────────────────────────────┐
│  NEW COMPLIANCE SCAN                                         │
├─────────────────────────────────────────────────────────────┤
│  Scan Type:                                                  │
│  ○ Full Assessment (All 12 Requirements)                    │
│  ○ Quick Scan (High Priority Only)                          │
│  ○ Specific Requirements (Select Below)                     │
│  ○ Pre-Audit Check                                          │
│  ○ Gap Analysis                                             │
├─────────────────────────────────────────────────────────────┤
│  Merchant Level: [Level 2 ▼]                                │
│  Scope:                                                      │
│    Networks: [10.0.0.0/24, DMZ, CDE]                       │
│    Systems: [Web Servers, DB Servers, Payment Gateway]      │
│    Applications: [Checkout, Payment API, Admin Panel]       │
├─────────────────────────────────────────────────────────────┤
│  Advanced Options:                                           │
│  ☑ Network Segmentation Test                                │
│  ☑ Cardholder Data Discovery                                │
│  ☑ Vulnerability Scanning (ASV-compliant)                   │
│  ☑ Penetration Testing Simulation                           │
│  ☑ Log Analysis & Audit Trail Review                        │
├─────────────────────────────────────────────────────────────┤
│  [Start Scan] [Schedule for Later] [Save as Template]       │
└─────────────────────────────────────────────────────────────┘
```

**Premium Features:**
- Scan templates for recurring assessments
- AI-powered scope recommendations
- Real-time progress tracking with ETA
- Live finding counter during scan
- Pause/Resume capability
- Export scan configuration

### 3. **Requirement Detail View** (Drill-down)
```
┌─────────────────────────────────────────────────────────────┐
│  REQUIREMENT 3: Protect Stored Cardholder Data              │
│  Compliance: 72% │ Status: Non-Compliant │ Last Scan: 2h ago│
├─────────────────────────────────────────────────────────────┤
│  SUB-REQUIREMENTS:                                           │
│  ✓ 3.1 - Data retention minimal        [100%] Compliant    │
│  ⚠ 3.2 - Data storage limit             [75%] Partial      │
│  ✗ 3.3 - SAD not stored                 [40%] Critical     │
│  ✓ 3.4 - PAN display restriction        [100%] Compliant    │
│  ⚠ 3.5 - PAN encryption                 [60%] Issues       │
│  ✓ 3.6 - Key security                   [95%] Compliant    │
│  ⚠ 3.7 - Key management                 [70%] Partial      │
├─────────────────────────────────────────────────────────────┤
│  OPEN FINDINGS (12):                                         │
│  🔴 CVV data found in database logs      [Critical]         │
│  🟠 Encryption keys stored in plaintext  [High]             │
│  🟡 PAN masking incomplete on receipts   [Medium]           │
├─────────────────────────────────────────────────────────────┤
│  EVIDENCE (24 items):                                        │
│  📄 Encryption Policy v2.3                                  │
│  📸 Database Encryption Screenshot                          │
│  📊 Key Rotation Audit Log                                  │
├─────────────────────────────────────────────────────────────┤
│  [View All Findings] [Add Evidence] [Generate Sub-Report]   │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Interactive sub-requirement checklist
- One-click finding navigation
- Evidence gallery with preview
- Compensating controls section
- Historical compliance trend chart
- AI recommendations for improvement

### 4. **Findings Management** (Smart Table)
```
┌─────────────────────────────────────────────────────────────┐
│  FINDINGS (88 open)                                          │
│  [Filter] Severity ▼ | Requirement ▼ | Status ▼ | [Search] │
├──────┬─────────────┬───────┬──────────┬─────────┬──────────┤
│ Sev  │ Title       │ Req   │ Assets   │ Status  │ Actions  │
├──────┼─────────────┼───────┼──────────┼─────────┼──────────┤
│ 🔴 C │ CVV in logs │ Req 3 │ DB-01    │ Open    │ [••• ]   │
│ 🔴 C │ No MFA      │ Req 8 │ Admin    │ Open    │ [••• ]   │
│ 🟠 H │ Weak cipher │ Req 4 │ Gateway  │ Progress│ [••• ]   │
│ 🟠 H │ FW rule gap │ Req 1 │ DMZ-01   │ Open    │ [••• ]   │
│ 🟡 M │ Log gaps    │ Req10 │ All      │ Open    │ [••• ]   │
├──────┴─────────────┴───────┴──────────┴─────────┴──────────┤
│  [Bulk Actions] [Export] [Create Remediation Plan]          │
└─────────────────────────────────────────────────────────────┘
```

**Premium Features:**
- Multi-column sorting
- Advanced filtering (AND/OR logic)
- Bulk status updates
- Inline editing
- Risk score calculation
- CVSS score display
- Finding templates
- Automated assignment rules

### 5. **Remediation Planner** (Kanban + Gantt)
```
┌─────────────────────────────────────────────────────────────┐
│  REMEDIATION PIPELINE                                        │
│  [Kanban View] [Gantt Chart] [Priority Matrix]              │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   Pending    │  In Progress │   Blocked    │   Completed    │
│      (24)    │      (8)     │     (3)      │      (15)      │
├──────────────┼──────────────┼──────────────┼────────────────┤
│ □ CVV Data   │ ▶ MFA Setup  │ ⏸ FW Upgrade │ ✓ Log Config   │
│   P1 | 8h    │   P1 | 16h   │   P2 | 40h   │   P3 | 4h      │
│   @john      │   @sarah     │   @vendor    │   @mike        │
├──────────────┼──────────────┼──────────────┼────────────────┤
│ □ Encryption │ ▶ Key Rotate │ ⏸ Pen Test   │ ✓ Policy Doc   │
│   P1 | 24h   │   P2 | 12h   │   P3 | 80h   │   P4 | 2h      │
│   @team-sec  │   @john      │   @external  │   @compliance  │
└──────────────┴──────────────┴──────────────┴────────────────┘
```

**Features:**
- Drag-and-drop task management
- Dependencies visualization
- Resource allocation
- Time tracking
- Cost estimation
- Automated notifications
- Integration with Jira/ServiceNow
- Progress milestones

### 6. **Report Generator** (Professional Documents)
```
┌─────────────────────────────────────────────────────────────┐
│  GENERATE COMPLIANCE REPORT                                  │
├─────────────────────────────────────────────────────────────┤
│  Report Type:                                                │
│  ○ SAQ-A (Card-not-present, outsourced)                     │
│  ○ SAQ-A-EP (E-commerce, outsourced)                        │
│  ○ SAQ-B (Imprint machines only)                            │
│  ○ SAQ-C (Payment app, not  e-commerce)                      │
│  ○ SAQ-D (All other merchants)                              │
│  ● AOC (Attestation of Compliance)                          │
│  ○ ROC (Report on Compliance)                               │
│  ○ Executive Summary                                         │
├─────────────────────────────────────────────────────────────┤
│  Assessment Date: [Jan 6, 2026]                              │
│  Assessment Period: [Q4 2025]                                │
│  Assessed By: [Security Team]                                │
├─────────────────────────────────────────────────────────────┤
│  Include:                                                    │
│  ☑ Executive Summary                                         │
│  ☑ All 12 Requirements Analysis                             │
│  ☑ Findings Summary                                          │
│  ☑ Evidence Package (24 documents, 156 screenshots)         │
│  ☑ Remediation Timeline                                      │
│  ☑ Network Diagrams                                          │
│  ☑ Compliance Trend Charts                                   │
│  ☑ QSA Signature Page                                        │
├─────────────────────────────────────────────────────────────┤
│  Format: [● PDF] [○ DOCX] [○ HTML Bundle]                   │
│  [Generate Report] [Preview] [Schedule Automated]            │
└─────────────────────────────────────────────────────────────┘
```

**Premium Features:**
- Official PCI SSC templates
- Automated data population
- Custom branding
- Digital signatures
- Encrypted delivery
- Audit trail for reports
- Multi-language support
- Scheduled report generation

### 7. **AI Chat Assistant** (Contextual Help)
```
┌─────────────────────────────────────────────────────────────┐
│  💬 PCI DSS Expert AI                                        │
├─────────────────────────────────────────────────────────────┤
│  You: How do I remediate the CVV storage issue?             │
│                                                              │
│  AI: The CVV storage issue is a critical PCI DSS Req 3.3    │
│  violation. Here's a remediation plan:                       │
│                                                              │
│  1. Immediate Actions (Priority 1):                          │
│     • Identify all locations storing CVV/CVC data           │
│     • Delete CVV data from database tables                   │
│     • Purge CVV from backup systems                          │
│     • Review application logs for CVV leakage                │
│                                                              │
│  2. Technical Implementation:                                │
│     [Code snippet shown for database cleanup]                │
│                                                              │
│  3. Preventive Measures:                                     │
│     • Update payment forms to not capture CVV               │
│     • Implement code review checklist                        │
│     • Add database triggers to prevent CVV storage           │
│                                                              │
│  4. Documentation:                                           │
│     • Update data flow diagrams                              │
│     • Record evidence of deletion                            │
│     • Update security policies                               │
│                                                              │
│  Would you like me to:                                       │
│  [Create Remediation Task] [Generate Evidence Template]     │
│  [Show Related Findings] [Open Req 3.3 Details]             │
└─────────────────────────────────────────────────────────────┘
```

**AI Capabilities:**
- PCI DSS requirement interpretation
- Remediation guidance with code examples
- Compliance gap analysis
- Automated task creation
- Evidence suggestions
- Risk assessment
- Compensating control recommendations
- Plain-language explanations

### 8. **Network Topology Visualizer**
```
┌─────────────────────────────────────────────────────────────┐
│  CARDHOLDER DATA ENVIRONMENT MAP                             │
│  [Interactive Mode] [Zoom] [Export] [Data Flow Analysis]    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    Internet ──[Firewall]── DMZ ──[Firewall]── Internal     │
│                              │                    │          │
│                         Web Servers          Database       │
│                         (TLS 1.3)           (Encrypted)     │
│                              │                    │          │
│                         App Servers ──────── Payment        │
│                         (Segmented)          Gateway        │
│                                              (PCI DSS)      │
│                                                              │
│  Legend:                                                     │
│  🟢 Compliant  🟡 Partial  🔴 Non-Compliant  ⚪ Out of Scope│
│                                                              │
│  Click any node for details, compliance status, findings    │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Auto-discovery of network topology
- CDE boundary visualization
- Data flow tracking (PAN/SAD)
- Segmentation validation
- Interactive node inspection
- Compliance overlay
- Export to Visio/Draw.io

## Technical Architecture

### Frontend Stack
- **React 19** with TypeScript
- **TailwindCSS** for styling
- **Recharts** for data visualization
- **React Flow** for network diagrams
- **Lucide Icons** for consistent iconography
- **Socket.IO** for real-time updates
- **Axios** for API communication

### Backend Stack
- **Node.js + Express** (API Server - Port 4049)
- **MongoDB** with Mongoose ORM
- **8 Core Models**: Scan, Finding, Requirement, Evidence, Remediation, Asset, Report, AuditLog
- **RESTful API** with 40+ endpoints
- **WebSocket** support for real-time updates

### ML Engine
- **Python FastAPI** (Port 8049)
- **Vulnerability Detection** algorithms
- **Risk Scoring** models
- **Cardholder Data Classification**
- **Pattern Recognition** for compliance gaps
- **Report Generation** engine

### Database Schema
- **Scans Collection**: Compliance scan history
- **Findings Collection**: Security gaps and violations
- **Requirements Collection**: 12 PCI DSS requirements tracking
- **Evidence Collection**: Proof artifacts and documentation
- **Remediations Collection**: Task management
- **Assets Collection**: Inventory and CDE mapping
- **Reports Collection**: Generated compliance documents
- **AuditLogs Collection**: Full audit trail

## API Endpoints

### Scanning
- `POST /api/v1/pcidsscheck/scans` - Start new scan
- `GET /api/v1/pcidsscheck/scans` - List all scans
- `GET /api/v1/pcidsscheck/scans/:scanId` - Get scan status

### Requirements
- `GET /api/v1/pcidsscheck/requirements` - List all requirements
- `GET /api/v1/pcidsscheck/requirements/:id` - Get requirement details
- `POST /api/v1/pcidsscheck/requirements/analyze` - Deep analysis

### Findings
- `GET /api/v1/pcidsscheck/findings` - List findings with filters
- `GET /api/v1/pcidsscheck/findings/:id` - Get finding details
- `PUT /api/v1/pcidsscheck/findings/:id` - Update finding

### Remediation
- `GET /api/v1/pcidsscheck/remediations` - List remediation tasks
- `POST /api/v1/pcidsscheck/remediations/plan` - Create remediation plan
- `PUT /api/v1/pcidsscheck/remediations/:id` - Update task

### Assets
- `GET /api/v1/pcidsscheck/assets` - List assets
- `POST /api/v1/pcidsscheck/assets/detect-chd` - Detect cardholder data

### Reports
- `GET /api/v1/pcidsscheck/reports` - List reports
- `POST /api/v1/pcidsscheck/reports/generate` - Generate new report
- `GET /api/v1/pcidsscheck/reports/:id` - Download report

### Dashboard
- `GET /api/v1/pcidsscheck/dashboard` - Get dashboard data
- `GET /api/v1/pcidsscheck/status` - System status

## User Journey

### First-Time User Onboarding
1. **Setup Wizard** - Configure merchant level, scope, integrations
2. **Initial Scan** - Automated discovery scan
3. **Dashboard Tour** - Interactive guide highlighting features
4. **Quick Win** - Resolve first low-priority finding
5. **Report Preview** - Generate sample AOC

### Regular Usage Flow
1. **Login** → Dashboard (see compliance score)
2. **Review Alerts** → New findings notification
3. **Triage Findings** → Assign priorities
4. **Create Remediations** → Task assignment
5. **Track Progress** → Kanban board
6. **Generate Reports** → Quarterly compliance
7. **Prepare for Audit** → Evidence package export

### Advanced Features
- **Automated Scanning** - Scheduled quarterly scans
- **Compliance Monitoring** - Real-time alerts
- **Integration Hub** - Connect SIEM, ticketing, firewalls
- **Custom Workflows** - Approval chains for exceptions
- **Multi-Tenant** - Service provider mode
- **API Access** - Programmatic compliance checks

## Competitive Advantages

1. **AI-Powered Guidance** - Not just scanning, but remediation coaching
2. **All-in-One Platform** - Scan, remediate, report in one place
3. **Real-Time Updates** - Live compliance tracking
4. **Premium UX** - Enterprise-grade interface
5. **Automated Evidence** - No manual screenshot hunting
6. **QSA-Ready Reports** - Official format exports
7. **Cost-Effective** - Replaces multiple tools
8. **Continuous Compliance** - Not just annual assessment

## Pricing Tiers (Future)

- **Starter** ($499/month) - Level 4 merchants, basic scanning
- **Professional** ($1,499/month) - Level 2-3, full features
- **Enterprise** ($4,999/month) - Level 1, multi-site, white-label
- **Service Provider** (Custom) - Multi-tenant, API access

## Implementation Roadmap

✅ Phase 1: Backend & Database (Completed)
- Models, API endpoints, configuration

🚧 Phase 2: Frontend Core (In Progress)
- Dashboard, requirement views, scanning interface

⏳ Phase 3: Advanced Features
- Remediation planner, report generator, network visualizer

⏳ Phase 4: ML Engine & AI
- Vulnerability detection, risk scoring, AI assistant

⏳ Phase 5: Integrations & Polish
- SIEM connectors, API documentation, testing

---

**Next Steps:**
- Build frontend dashboard components
- Implement requirement detail pages
- Create scanning interface
- Develop findings management table
- Integrate AI chat assistant
