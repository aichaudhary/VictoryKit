# PCI DSS Check - Tool #49

## Overview
**Tool Name:** PCI DSS Check  
**Purpose:** PCI DSS Compliance Scanning & Payment Security Assessment  
**Domain:** pcidsschk.maula.ai  
**Neural Link:** pcidsschk.maula.ai/maula/ai

## Ports Configuration
- **Frontend:** 3049
- **API:** 4049
- **WebSocket:** 6049
- **ML Engine:** 8049

## Database
- **Name:** pcidsscheck_db
- **Type:** MongoDB
- **Connection:** mongodb://localhost:27017/pcidsscheck_db

## Implementation Status

### ✅ Backend (Complete)
#### Models (8)
1. **Scan.js** - PCI DSS compliance scans with cardholder data detection
   - Fields: scanId, scanType, status, scope, findings, statistics
   - Indexes: scanId, scanDate, status
   
2. **Finding.js** - Security findings with PCI DSS requirement mapping
   - Fields: findingId, scanId, severity, requirement, description, remediation
   - Indexes: findingId, scanId, severity, requirement
   
3. **Requirement.js** - 12 PCI DSS requirements tracking
   - Fields: requirementId, number, title, description, controls, compliant
   - Indexes: requirementId, number
   
4. **Evidence.js** - Compliance evidence documentation
   - Fields: evidenceId, requirementId, type, description, fileUrl, verified
   - Indexes: evidenceId, requirementId, verified
   
5. **Remediation.js** - Remediation action tracking
   - Fields: remediationId, findingId, actions, assignedTo, status, dueDate
   - Indexes: remediationId, findingId, status, assignedTo
   
6. **Asset.js** - Payment system asset inventory
   - Fields: assetId, name, type, scope, location, pciLevel, compliant
   - Indexes: assetId, type, scope, pciLevel
   
7. **Report.js** - PCI DSS compliance reports
   - Fields: reportId, reportType, period, status, overallCompliance, findings
   - Indexes: reportId, reportType, reportDate
   
8. **AuditLog.js** - Comprehensive audit trail
   - Fields: logId, timestamp, userId, action, resourceType, details
   - Indexes: logId, timestamp, userId, action

#### API Endpoints (40+)
##### Scans
- `POST /api/v1/pcidsscheck/scans` - Initiate new scan
- `GET /api/v1/pcidsscheck/scans` - List scans with filters
- `GET /api/v1/pcidsscheck/scans/:id` - Get scan details
- `PUT /api/v1/pcidsscheck/scans/:id` - Update scan
- `DELETE /api/v1/pcidsscheck/scans/:id` - Delete scan

##### Findings
- `POST /api/v1/pcidsscheck/findings` - Create finding
- `GET /api/v1/pcidsscheck/findings` - List findings
- `GET /api/v1/pcidsscheck/findings/statistics` - Get statistics
- `GET /api/v1/pcidsscheck/findings/:id` - Get finding details
- `PUT /api/v1/pcidsscheck/findings/:id` - Update finding
- `DELETE /api/v1/pcidsscheck/findings/:id` - Delete finding

##### Requirements
- `POST /api/v1/pcidsscheck/requirements` - Create requirement
- `GET /api/v1/pcidsscheck/requirements` - List all 12 requirements
- `GET /api/v1/pcidsscheck/requirements/:id` - Get requirement details
- `PUT /api/v1/pcidsscheck/requirements/:id` - Update requirement

##### Evidence
- `POST /api/v1/pcidsscheck/evidence` - Submit evidence
- `GET /api/v1/pcidsscheck/evidence` - List evidence
- `GET /api/v1/pcidsscheck/evidence/:id` - Get evidence details
- `PUT /api/v1/pcidsscheck/evidence/:id` - Update evidence
- `DELETE /api/v1/pcidsscheck/evidence/:id` - Delete evidence

##### Remediation
- `POST /api/v1/pcidsscheck/remediations` - Create remediation
- `GET /api/v1/pcidsscheck/remediations` - List remediations
- `GET /api/v1/pcidsscheck/remediations/overdue` - Get overdue items
- `GET /api/v1/pcidsscheck/remediations/:id` - Get details
- `PUT /api/v1/pcidsscheck/remediations/:id` - Update remediation

##### Assets
- `POST /api/v1/pcidsscheck/assets` - Register asset
- `GET /api/v1/pcidsscheck/assets` - List assets
- `GET /api/v1/pcidsscheck/assets/scope` - Get in-scope assets
- `GET /api/v1/pcidsscheck/assets/:id` - Get asset details
- `PUT /api/v1/pcidsscheck/assets/:id` - Update asset
- `DELETE /api/v1/pcidsscheck/assets/:id` - Delete asset

##### Reports
- `POST /api/v1/pcidsscheck/reports` - Generate report
- `GET /api/v1/pcidsscheck/reports` - List reports
- `GET /api/v1/pcidsscheck/reports/:id` - Get report
- `PUT /api/v1/pcidsscheck/reports/:id` - Update report
- `DELETE /api/v1/pcidsscheck/reports/:id` - Delete report

##### Audit Logs
- `POST /api/v1/pcidsscheck/audit-logs` - Create log entry
- `GET /api/v1/pcidsscheck/audit-logs` - List audit logs
- `GET /api/v1/pcidsscheck/audit-logs/:id` - Get log details

##### Dashboard
- `GET /api/v1/pcidsscheck/dashboard` - Get dashboard data
- `GET /api/v1/pcidsscheck/compliance-overview` - Get compliance overview

### ✅ Frontend (Complete)
#### Configuration
- **package.json** - Updated to "pcidsscheck", port 3049
- **vite.config.ts** - Configured ports 3049/4049/6049
- **index.html** - PCI DSS Check branding
- **pcidsscheck-config.json** - Comprehensive configuration
  - 12 PCI DSS Requirements defined
  - 14 AI functions configured
  - Scan types and severity levels
  - Subdomain: pcidsschk.maula.ai

#### Components (Pending)
- Dashboard with compliance overview
- Scan management interface
- Findings list and details
- Requirements tracker (12 requirements)
- Evidence management
- Remediation workflow
- Asset inventory
- Report generation
- Audit log viewer

### ✅ Documentation (Complete)
- **DESIGN.md** - Comprehensive UI/UX mockups and architecture
- **IMPLEMENTATION-STATUS.md** - Progress tracking

### ⏳ Pending Implementation
- React UI components
- ML engine (port 8049) for cardholder data detection
- WebSocket server (port 6049) for real-time scan updates
- Testing suite
- Docker deployment

## PCI DSS Requirements Covered

### Build and Maintain a Secure Network
1. **Requirement 1:** Install and maintain firewall configuration
2. **Requirement 2:** Do not use vendor-supplied defaults

### Protect Cardholder Data
3. **Requirement 3:** Protect stored cardholder data
4. **Requirement 4:** Encrypt transmission of cardholder data

### Maintain a Vulnerability Management Program
5. **Requirement 5:** Protect all systems against malware
6. **Requirement 6:** Develop and maintain secure systems

### Implement Strong Access Control Measures
7. **Requirement 7:** Restrict access to cardholder data
8. **Requirement 8:** Identify and authenticate access
9. **Requirement 9:** Restrict physical access

### Regularly Monitor and Test Networks
10. **Requirement 10:** Track and monitor all access
11. **Requirement 11:** Regularly test security systems

### Maintain an Information Security Policy
12. **Requirement 12:** Maintain a policy that addresses security

## AI Assistant Functions
1. Requirement interpretation and guidance
2. Automated compliance gap analysis
3. Cardholder data discovery
4. Vulnerability assessment
5. Remediation recommendations
6. Evidence collection automation
7. Report generation
8. Risk scoring
9. Control testing guidance
10. Audit preparation assistance
11. Policy generation
12. Training content creation
13. Incident response guidance
14. Continuous compliance monitoring

## Development Commands

### Backend
```bash
cd backend/tools/49-pcidsscheck/api
npm install
npm start  # Runs on port 4049
```

### Frontend
```bash
cd frontend/tools/49-pcidsscheck
npm install
npm run dev  # Runs on port 3049
```

### ML Engine
```bash
cd backend/tools/49-pcidsscheck/ml-engine
pip install -r requirements.txt
python main.py  # Runs on port 8049
```

## Git Branch
- **Branch:** pcidsscheck-tool-implementation
- **Commits:** 
  - Backend implementation (models, controllers, routes)
  - Frontend configuration

## Security Considerations
- PCI DSS Level 1-4 compliance support
- Cardholder data encryption at rest and in transit
- Comprehensive audit logging (Requirement 10)
- Role-based access control (Requirement 7-8)
- Evidence retention for compliance audits
- Secure report generation and storage

## Related Standards
- PCI DSS v4.0 (latest)
- PA-DSS (Payment Application Data Security Standard)
- PTS (PIN Transaction Security)
- P2PE (Point-to-Point Encryption)

## Support
For questions or issues, contact the security compliance team or refer to:
- [DESIGN.md](DESIGN.md) - Detailed architecture and UI designs
- [IMPLEMENTATION-STATUS.md](IMPLEMENTATION-STATUS.md) - Current progress
