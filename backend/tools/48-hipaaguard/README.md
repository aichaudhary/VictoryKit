# HIPAAGuard - Tool #48

## Overview
**Tool Name:** HIPAAGuard  
**Purpose:** HIPAA Compliance Management & Healthcare Data Protection  
**Domain:** hipaaguard.maula.ai  
**Neural Link:** hipaaguard.maula.ai/maula-ai

## Ports Configuration
- **Frontend:** 3048
- **API:** 4048
- **WebSocket:** 6048
- **ML Engine:** 8048

## Database
- **Name:** hipaaguard_db
- **Type:** MongoDB
- **Connection:** mongodb://localhost:27017/hipaaguard_db

## Implementation Status

### ✅ Backend (Complete)
#### Models (7)
1. **RiskAssessment.js** - HIPAA security risk assessments
   - Fields: assessmentId, assessmentType, status, overallRiskScore, safeguardScores, ruleCompliance, findings
   - Safeguards: administrative, physical, technical
   - Rules: privacyRule, securityRule, breachNotification, enforcement
   - Indexes: assessmentId, status, assessmentDate
   
2. **PHIDiscovery.js** - Protected Health Information discovery and mapping
   - Fields: scanId, scanType, status, scope, phiLocations, statistics
   - PHI Types: name, SSN, MRN, DOB, address, phone, email, insurance, diagnosis, treatment
   - Indexes: scanId, scanDate, status
   
3. **Breach.js** - HIPAA breach incident management
   - Fields: breachId, incidentDate, discoveryDate, breachType, affectedIndividuals, phiCompromised, notifications
   - Breach Types: unauthorized_access, theft, loss, improper_disposal, hacking, ransomware, insider
   - Notification tracking: individuals, HHS, media
   - Indexes: breachId, incidentDate, status, severity
   
4. **BAA.js** - Business Associate Agreements tracking
   - Fields: baaId, businessAssociateName, agreementType, phiAccess, status, complianceScore, violations
   - Agreement Types: business_associate, subcontractor
   - PHI Access Levels: full, limited, none
   - Indexes: baaId, businessAssociateName, status, expirationDate
   
5. **Training.js** - Employee HIPAA training management
   - Fields: trainingId, employeeId, courseType, status, score, expirationDate, nextTrainingDue
   - Course Types: initial_hipaa, annual_refresher, privacy_rule, security_rule, breach_notification, role_specific
   - Indexes: trainingId, employeeId, status, expirationDate, nextTrainingDue
   
6. **AccessLog.js** - Comprehensive PHI access audit logs
   - Fields: logId, timestamp, userId, action, resourceType, patientId, suspicious, minimumNecessary
   - Actions: view, create, update, delete, export, print, share
   - Resource Types: patient_record, phi, report, system
   - Indexes: logId, timestamp, userId, patientId, suspicious
   
7. **ComplianceReport.js** - HIPAA compliance reporting
   - Fields: reportId, reportType, reportDate, status, overallCompliance, findings, recommendations
   - Report Types: risk_assessment, audit, breach_summary, annual_review, ocr_request, custom
   - Indexes: reportId, reportDate, reportType, status

#### API Endpoints (35+)
##### Risk Assessments
- `POST /api/v1/hipaaguard/risk-assessments` - Create assessment
- `GET /api/v1/hipaaguard/risk-assessments` - List with filters
- `GET /api/v1/hipaaguard/risk-assessments/:id` - Get details
- `PUT /api/v1/hipaaguard/risk-assessments/:id` - Update
- `DELETE /api/v1/hipaaguard/risk-assessments/:id` - Delete

##### PHI Discovery
- `POST /api/v1/hipaaguard/phi-scans` - Initiate PHI scan
- `GET /api/v1/hipaaguard/phi-scans` - List scans
- `GET /api/v1/hipaaguard/phi-scans/:id` - Get results
- `PUT /api/v1/hipaaguard/phi-scans/:id` - Update scan

##### Breach Management
- `POST /api/v1/hipaaguard/breaches` - Report breach
- `GET /api/v1/hipaaguard/breaches` - List breaches
- `GET /api/v1/hipaaguard/breaches/statistics` - Get statistics
- `GET /api/v1/hipaaguard/breaches/:id` - Get details
- `PUT /api/v1/hipaaguard/breaches/:id` - Update breach

##### Business Associate Agreements
- `POST /api/v1/hipaaguard/baas` - Create BAA
- `GET /api/v1/hipaaguard/baas` - List BAAs
- `GET /api/v1/hipaaguard/baas/expiring` - Get expiring BAAs
- `GET /api/v1/hipaaguard/baas/:id` - Get details
- `PUT /api/v1/hipaaguard/baas/:id` - Update BAA

##### Training Management
- `POST /api/v1/hipaaguard/trainings` - Create training record
- `GET /api/v1/hipaaguard/trainings` - List trainings
- `GET /api/v1/hipaaguard/trainings/overdue` - Get overdue trainings
- `GET /api/v1/hipaaguard/trainings/statistics` - Get statistics
- `GET /api/v1/hipaaguard/trainings/:id` - Get details
- `PUT /api/v1/hipaaguard/trainings/:id` - Update training

##### Access Audit Logs
- `POST /api/v1/hipaaguard/access-logs` - Create log entry
- `GET /api/v1/hipaaguard/access-logs` - List logs
- `GET /api/v1/hipaaguard/access-logs/suspicious` - Get suspicious activity
- `GET /api/v1/hipaaguard/access-logs/statistics` - Get statistics
- `GET /api/v1/hipaaguard/access-logs/:id` - Get details

##### Compliance Reports
- `POST /api/v1/hipaaguard/compliance-reports` - Create report
- `GET /api/v1/hipaaguard/compliance-reports` - List reports
- `GET /api/v1/hipaaguard/compliance-reports/:id` - Get details
- `PUT /api/v1/hipaaguard/compliance-reports/:id` - Update
- `DELETE /api/v1/hipaaguard/compliance-reports/:id` - Delete

##### Dashboard
- `GET /api/v1/hipaaguard/dashboard` - Get dashboard data
- `GET /api/v1/hipaaguard/compliance-overview` - Get compliance overview

### ✅ Frontend (Complete)
#### Configuration
- **package.json** - Updated to "hipaaguard", port 3048
- **vite.config.ts** - Configured ports 3048/4048/6048
- **index.html** - HIPAAGuard branding
- **hipaaguard-config.json** - Comprehensive configuration
  - 4 HIPAA Rules defined (Privacy, Security, Breach Notification, Enforcement)
  - 3 Safeguard categories (Administrative, Physical, Technical)
  - 10 AI functions configured
  - Subdomain: hipaaguard.maula.ai

#### Components (Pending)
- Dashboard with compliance metrics
- Risk assessment management
- PHI discovery and data mapping
- Breach incident tracking and notification workflow
- Business Associate Agreement management
- Employee training tracking
- Access audit log viewer with suspicious activity alerts
- Compliance report generator

### ✅ Documentation (Complete)
- **DESIGN.md** - Comprehensive UI/UX mockups with 7 detailed views
- **IMPLEMENTATION-STATUS.md** - Progress tracking

### ⏳ Pending Implementation
- React UI components
- ML engine (port 8048) for PHI detection and anomaly detection
- WebSocket server (port 6048) for real-time alerts
- Testing suite
- Docker deployment

## HIPAA Rules Covered

### Privacy Rule (45 CFR Part 160 and Part 164, Subparts A and E)
- Patient rights to access PHI
- Minimum necessary standard
- Uses and disclosures of PHI
- Notice of Privacy Practices (NPP)
- Business Associate Agreements (BAAs)

### Security Rule (45 CFR Part 164, Subpart C)
#### Administrative Safeguards
- Security management process
- Security personnel
- Information access management
- Workforce training
- Evaluation

#### Physical Safeguards
- Facility access controls
- Workstation use and security
- Device and media controls

#### Technical Safeguards
- Access control
- Audit controls
- Integrity controls
- Transmission security

### Breach Notification Rule (45 CFR §§ 164.400-414)
- 60-day notification requirement
- Notification to individuals (500+ = media notification)
- Notification to HHS/OCR
- Breach risk assessment
- Mitigation and documentation

### Enforcement Rule (45 CFR Parts 160 and 164, Subparts C, D and E)
- Compliance and investigations
- Penalties and enforcement
- Hearing and appeals

## AI Assistant Functions
1. HIPAA regulation interpretation and guidance
2. Automated risk assessment and scoring
3. PHI discovery and classification
4. Breach assessment and notification requirements
5. Suspicious access pattern detection
6. Training content generation
7. Policy and procedure generation
8. Remediation recommendations
9. Compliance gap analysis
10. Audit preparation assistance

## Development Commands

### Backend
```bash
cd backend/tools/48-hipaaguard/api
npm install
npm start  # Runs on port 4048
```

### Frontend
```bash
cd frontend/tools/48-hipaaguard
npm install
npm run dev  # Runs on port 3048
```

### ML Engine
```bash
cd backend/tools/48-hipaaguard/ml-engine
pip install -r requirements.txt
python main.py  # Runs on port 8048
```

## Git Branch
- **Branch:** tool48-threatintel-implementation
- **Commits:** 
  - Frontend configuration complete
  - Backend implementation complete (7 models, 35+ endpoints)

## Security Considerations
- PHI encryption at rest and in transit (HIPAA Security Rule)
- Comprehensive audit logging (HIPAA Security Rule § 164.312(b))
- Role-based access control (Minimum necessary standard)
- Breach notification automation (60-day compliance)
- Business Associate Agreement tracking
- Evidence retention for OCR audits (6 years)
- Secure report generation with patient data de-identification

## Related Standards & Regulations
- HIPAA Privacy Rule (45 CFR Part 164, Subpart E)
- HIPAA Security Rule (45 CFR Part 164, Subpart C)
- Breach Notification Rule (45 CFR § 164.400-414)
- HITECH Act (Health Information Technology for Economic and Clinical Health)
- OCR Audit Protocol
- NIST 800-66 (HIPAA Security Rule Implementation)

## Key Compliance Metrics Tracked
- Overall risk score (0-100)
- Safeguard compliance (Administrative, Physical, Technical)
- Rule compliance (Privacy, Security, Breach Notification)
- Training completion rate
- BAA expiration tracking
- Breach notification timeliness
- Suspicious access events
- PHI encryption status

## Support
For questions or issues, contact the healthcare compliance team or refer to:
- [DESIGN.md](DESIGN.md) - Detailed architecture and UI designs
- [IMPLEMENTATION-STATUS.md](IMPLEMENTATION-STATUS.md) - Current progress
- HHS Office for Civil Rights: https://www.hhs.gov/ocr
