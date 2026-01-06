# 🔍 AuditTracker - Enterprise Audit Management & Forensic Analysis

## Overview

**AuditTracker** is a comprehensive enterprise audit management system providing tamper-proof logging, compliance evidence collection, forensic investigation, ML-powered anomaly detection, and real-time security monitoring. Built for organizations requiring SOX, HIPAA, PCI-DSS, ISO-27001, GDPR, NIST, FISMA, and other compliance frameworks.

### Key Features

- **Tamper-Proof Audit Logging**: Hash chains, Merkle trees, blockchain verification
- **Multi-Source Collection**: Windows Events, Linux Syslog, Database Logs, Application Logs, Cloud Logs (AWS/Azure/GCP), Network Devices, Security Tools, Containers
- **Compliance Evidence**: Auto-collect and organize evidence for 11+ compliance frameworks
- **Forensic Investigation**: Complete case management with chain of custody
- **ML Anomaly Detection**: 6 ML models (Isolation Forest, LSTM Autoencoder, Random Forest, Statistical, Rule-based, Ensemble)
- **Real-Time Monitoring**: Event streaming, alerting, correlation rules
- **Risk Scoring**: Automated risk calculation for users, systems, and activities
- **AI-Powered Analysis**: 10 specialized AI functions for audit management

---

## 🏗️ Architecture

### Tool Configuration
- **Tool ID**: 31
- **Tool Name**: AuditTracker
- **Domain**: audittracker.maula.ai
- **Frontend Port**: 3031
- **API Port**: 4031
- **ML Port**: 8031
- **AI Assistant Port**: 6031
- **Database**: audittracker_db (MongoDB)

### Technology Stack
- **Backend**: Node.js 18+ | Express 4.18 | MongoDB 8.0 | Mongoose ODM
- **Frontend**: React 18.2 | TypeScript 5.3 | Vite 5.0 | Tailwind CSS 3.3
- **AI**: Multi-LLM (Gemini 1.5 Pro, Claude 3.5 Sonnet, GPT-4 Turbo, xAI Grok)
- **ML**: Isolation Forest, LSTM Autoencoder, Random Forest
- **WebSocket**: Real-time AI streaming on port 6031 at `/maula-ai`

---

## 📊 Database Schema

### 1. AuditLog Collection (~380 lines)

Core audit logging with tamper-proof integrity verification.

**Key Fields**:
- `auditId`: Unique audit log identifier
- `source`: Audit source (Windows, Linux, Database, Application, Cloud, Network, Container, Web Server, Auth System)
- `event`: Event details (category, action, severity, outcome)
- `actor`: User/system that performed the action
- `target`: Resource affected by the action
- `risk`: Risk score (0-100), level, anomaly detection
- `compliance`: Framework mappings (SOX, HIPAA, PCI-DSS, ISO-27001, GDPR, NIST, FISMA, CMMC, SOC2, GLBA, FERPA)
- `integrity`: SHA-256 hash, hash chain, Merkle root, blockchain

**Event Categories**:
- Authentication
- Access Control
- Data Access
- Data Modification
- Configuration Change
- Administrative Action
- Privilege Escalation
- Security Event
- Compliance Violation
- System Failure

**Methods**:
- `calculateRiskScore()`: Auto-calculate risk based on severity, category, anomaly factors
- `generateHash()`: Create SHA-256 hash with previous hash for chain integrity
- `verifyIntegrity()`: Verify hash chain and detect tampering

---

### 2. ComplianceEvidence Collection (~320 lines)

Evidence collection and quality scoring for compliance frameworks.

**Key Fields**:
- `evidenceId`: Unique evidence identifier
- `framework`: Compliance framework (name, version, domain)
- `control`: Control ID, name, description
- `auditPeriod`: Start/end dates, period name
- `evidence`: Type, title, description, collection method, source systems, audit log IDs
- `quality`: Completeness, reliability, timeliness scores (Excellent/Good/Fair/Poor)
- `attestation`: Status, attestor, digital signature
- `chainOfCustody`: Transfer history with integrity verification

**Evidence Types**:
- Access Logs
- Change Logs
- Approval Records
- Configuration Snapshots
- Screenshots
- Documentation
- Attestations
- Scan Results
- Test Results

**Methods**:
- `calculateQualityScore()`: Calculate evidence quality (completeness, reliability, timeliness)
- `addToChainOfCustody()`: Track evidence transfers with hash verification

---

### 3. Investigation Collection (~390 lines)

Forensic investigation management with complete case lifecycle.

**Key Fields**:
- `investigationId`: Unique investigation identifier
- `case_number`: Human-readable case number
- `investigation`: Title, type, severity, priority, status
- `timeline`: Incident detected, investigation started/completed, time-to-detect, time-to-investigate
- `scope`: Affected systems, users, data, time range
- `team`: Lead investigator, investigators, external support
- `evidence`: Digital evidence, physical evidence, witness statements, documentation
- `analysis`: Root cause, attack vector, threat attribution, impact assessment (CIA)
- `remediation`: Immediate, corrective, preventive actions

**Investigation Types**:
- Security Incident
- Compliance Violation
- Fraud
- Data Breach
- Unauthorized Access
- Policy Violation
- Insider Threat
- Malware
- Data Exfiltration

**Status Workflow**:
1. New
2. Assigned
3. In Progress
4. Under Review
5. Closed

**Methods**:
- `calculateTimeMetrics()`: Calculate time-to-detect and time-to-investigate
- `addEvidence()`: Add digital/physical evidence with hash verification
- `addFinding()`: Document investigation findings
- `updateStatus()`: Update investigation status with automatic timestamps

---

### 4. AnomalyDetection Collection (~340 lines)

ML-powered anomaly detection with baseline analysis.

**Key Fields**:
- `anomalyId`: Unique anomaly identifier
- `detection`: Detected timestamp, ML model used, confidence score, algorithm parameters
- `anomaly`: Type, category, severity, risk score, description
- `auditLogs`: Primary audit ID, related audit IDs, total logs analyzed
- `baseline`: Baseline period, normal patterns, expected ranges
- `deviation`: Z-score, outlier detection (mild/moderate/extreme), statistical significance
- `context`: User, system, temporal, location context
- `investigation`: Status, assigned investigator, false positive tracking

**ML Models**:
- Isolation Forest (ensemble tree-based)
- LSTM Autoencoder (deep learning sequence)
- Random Forest (ensemble decision tree)
- Statistical (z-score, IQR, standard deviation)
- Rule-Based (predefined security rules)
- Ensemble (combined model voting)

**Anomaly Types**:
- Unusual Access Pattern
- Privilege Escalation
- Data Exfiltration
- Configuration Tampering
- Failed Authentication Attempts
- Unusual Time/Location
- Volume Spike
- Behavioral Deviation
- Suspicious Sequence

**Methods**:
- `calculateRiskScore()`: Calculate composite risk from severity, confidence, deviation
- `assignInvestigator()`: Assign anomaly to investigator
- `markAsFalsePositive()`: Flag false positive with reason for ML tuning
- `escalate()`: Escalate critical anomaly to investigation

---

### 5. AuditPolicy Collection (~375 lines)

Audit collection policy management with retention and alerting.

**Key Fields**:
- `policyId`: Unique policy identifier
- `policy_name`: Human-readable policy name
- `policy`: Description, purpose, status (draft/active/inactive/archived), priority, category
- `sources`: Enabled sources, source-specific configurations
- `collection`: Real-time/batch processing, filtering rules, sampling
- `processing`: Enrichment (geo-location, threat intel, user/asset context), normalization, correlation rules
- `retention`: Duration, long-term archive, deletion policy
- `alerts`: Alert rules, severity mapping, notification channels (email, Slack, webhook, SMS, PagerDuty, Teams), escalation
- `compliance`: Framework mappings, auto-evidence collection, control mappings
- `performance`: Rate limiting, batch size, max events per second

**Audit Sources**:
- Windows Events
- Linux Syslog
- Database Logs
- Application Logs
- Cloud Logs (AWS/Azure/GCP)
- Network Logs
- Security Tools
- Container Logs
- Web Server Logs
- Authentication Systems

**Methods**:
- `activate()`: Activate policy for collection
- `deactivate()`: Deactivate policy
- `updateStatistics()`: Update collection statistics
- `logError()`: Log policy execution errors
- `incrementVersion()`: Create new policy version

---

## 🔌 REST API

### Base URL
```
http://audittracker.maula.ai:4031/api/v1/audittracker
```

### Audit Log Endpoints

#### Create Audit Log
```http
POST /audit-logs
Content-Type: application/json

{
  "source": {
    "type": "windows_events",
    "name": "DC01",
    "hostname": "dc01.corp.local"
  },
  "event": {
    "event_id": "4624",
    "category": "authentication",
    "action": "logon_success",
    "severity": "low",
    "outcome": "success"
  },
  "actor": {
    "user_id": "user123",
    "username": "jdoe",
    "ip_address": "192.168.1.100"
  },
  "target": {
    "resource_type": "server",
    "resource_id": "srv001",
    "resource_name": "File Server"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "auditId": "audit_1234567890_abc123",
    "riskScore": 25,
    "auditLog": { ... }
  }
}
```

#### Get Audit Logs (with filtering)
```http
GET /audit-logs?source_type=windows_events&event_category=authentication&start_time=2026-01-01T00:00:00Z&end_time=2026-01-06T23:59:59Z&page=1&limit=50
```

#### Verify Audit Log Integrity
```http
POST /audit-logs/:id/verify
```

**Response**:
```json
{
  "success": true,
  "data": {
    "auditId": "audit_1234567890_abc123",
    "integrityValid": true,
    "hash": "a3f5d9c2...",
    "algorithm": "sha256",
    "verifiedAt": "2026-01-06T15:30:00Z"
  }
}
```

#### Flag Audit Log for Investigation
```http
POST /audit-logs/:id/flag
Content-Type: application/json

{
  "flagged_by": "analyst_01",
  "reason": "Suspicious privilege escalation attempt"
}
```

---

### Compliance Evidence Endpoints

#### Collect Compliance Evidence
```http
POST /compliance/evidence
Content-Type: application/json

{
  "framework": {
    "name": "SOX",
    "version": "2002",
    "domain": "financial_reporting"
  },
  "control_id": "SOX-404",
  "control_name": "Internal Control Over Financial Reporting",
  "control_description": "Assessment of internal controls effectiveness",
  "audit_period": {
    "start_date": "2025-10-01",
    "end_date": "2025-12-31",
    "period_name": "Q4 2025"
  },
  "evidence_type": "access_logs",
  "evidence_title": "Database Access Logs for Financial Systems",
  "evidence_description": "Complete access logs for SQL Server financial databases",
  "collection_method": "automated",
  "source_systems": ["SQL-FIN-01", "SQL-FIN-02"],
  "audit_log_ids": ["audit_123", "audit_456", "audit_789"]
}
```

#### Get Compliance Evidence
```http
GET /compliance/evidence?framework=SOX&audit_period_start=2025-10-01&audit_period_end=2025-12-31
```

#### Attest Evidence
```http
POST /compliance/evidence/:id/attest
Content-Type: application/json

{
  "attestor": {
    "user_id": "auditor_01",
    "name": "Jane Smith",
    "title": "Senior Auditor"
  },
  "attestation_statement": "I have reviewed the evidence and confirm it is complete and accurate.",
  "digital_signature": "-----BEGIN SIGNATURE-----..."
}
```

---

### Investigation Endpoints

#### Create Investigation
```http
POST /investigations
Content-Type: application/json

{
  "title": "Unauthorized Database Access Investigation",
  "type": "security_incident",
  "description": "Multiple failed login attempts followed by successful access to sensitive database",
  "severity": "high",
  "affected_systems": ["SQL-FIN-01", "SQL-FIN-02"],
  "affected_users": ["user789"],
  "lead_investigator": {
    "user_id": "inv_001",
    "name": "Security Team Lead",
    "email": "security@corp.com",
    "role": "lead"
  },
  "incident_detected": "2026-01-06T14:30:00Z",
  "audit_log_ids": ["audit_999", "audit_1000"]
}
```

#### Update Investigation Status
```http
PUT /investigations/:id/status
Content-Type: application/json

{
  "status": "in_progress"
}
```

#### Add Investigation Evidence
```http
POST /investigations/:id/evidence
Content-Type: application/json

{
  "evidence_type": "digital",
  "category": "log_file",
  "description": "Database access logs showing suspicious activity",
  "file_path": "/evidence/db_logs_2026-01-06.log",
  "hash": "sha256:abc123...",
  "collected_by": "inv_001",
  "chain_of_custody": []
}
```

#### Add Investigation Finding
```http
POST /investigations/:id/findings
Content-Type: application/json

{
  "finding_type": "unauthorized_access",
  "severity": "high",
  "description": "User gained unauthorized access to financial database using compromised credentials",
  "evidence_ids": ["ev_001", "ev_002"],
  "recommendations": ["Reset all database passwords", "Enable MFA for database access"]
}
```

---

### Anomaly Detection Endpoints

#### Detect Anomalies
```http
POST /anomalies/detect
Content-Type: application/json

{
  "detection_scope": ["unusual_access_pattern", "privilege_escalation", "data_exfiltration"],
  "sensitivity": "high",
  "baseline_period": "30d",
  "ml_model": "isolation_forest",
  "time_range": {
    "start": "2026-01-05T00:00:00Z",
    "end": "2026-01-06T23:59:59Z"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "total_anomalies": 5,
    "anomalies": [
      {
        "anomalyId": "anom_123",
        "anomaly": {
          "type": "unusual_access_pattern",
          "severity": "high",
          "risk_score": 85
        },
        "detection": {
          "detected_at": "2026-01-06T15:45:00Z",
          "detection_model": "isolation_forest",
          "confidence_score": 92.5
        }
      }
    ]
  }
}
```

#### Mark Anomaly as False Positive
```http
POST /anomalies/:id/false-positive
Content-Type: application/json

{
  "reason": "Scheduled maintenance activity",
  "user_id": "analyst_01"
}
```

---

### Audit Policy Endpoints

#### Create Audit Policy
```http
POST /policies
Content-Type: application/json

{
  "policy_name": "Windows Security Event Collection",
  "description": "Collect Windows security events from all domain controllers",
  "purpose": "Compliance and threat detection",
  "priority": "high",
  "category": "security",
  "enabled_sources": ["windows_events"],
  "source_configs": [
    {
      "source_type": "windows_events",
      "event_ids": ["4624", "4625", "4672", "4768", "4769"]
    }
  ],
  "collection_rules": {
    "real_time": true,
    "batch_interval_minutes": 5,
    "filters": {
      "include": [
        {
          "field": "event.severity",
          "operator": "in",
          "value": ["high", "critical"]
        }
      ]
    }
  },
  "retention": {
    "duration_days": 365,
    "long_term_archive": {
      "enabled": true,
      "duration_years": 7
    },
    "deletion_policy": {
      "secure_deletion": true
    }
  },
  "owner": {
    "user_id": "admin_01",
    "name": "Security Admin",
    "email": "admin@corp.com"
  }
}
```

#### Activate Audit Policy
```http
POST /policies/:id/activate
```

#### Deactivate Audit Policy
```http
POST /policies/:id/deactivate
```

---

### Dashboard & Analytics Endpoints

#### Get Dashboard Stats
```http
GET /dashboard/stats
```

**Response**:
```json
{
  "success": true,
  "data": {
    "auditLogs": {
      "total": 1500000,
      "criticalEvents": 350,
      "averageRiskScore": 42
    },
    "investigations": {
      "active": 8
    },
    "anomalies": {
      "unresolved": 15
    },
    "compliance": {
      "violations": 3,
      "evidenceItems": 450
    },
    "policies": {
      "active": 12
    }
  }
}
```

#### Get Audit Timeline
```http
GET /dashboard/timeline?start_date=2026-01-01&end_date=2026-01-06&granularity=day
```

#### Search Audit Logs (Advanced)
```http
POST /search
Content-Type: application/json

{
  "query": "privilege escalation",
  "scope": ["user_actions", "security_events"],
  "filters": {
    "severity": "high",
    "user_id": "user123"
  },
  "page": 1,
  "limit": 50
}
```

---

## 🤖 AI Assistant

### WebSocket Connection
```
ws://audittracker.maula.ai:6031/maula-ai
```

### AI Functions

The AI Assistant provides 10 specialized functions for audit management:

#### 1. analyze_audit_trail
Analyze audit trails for patterns, anomalies, and risks.

**Parameters**:
- `user_id` (optional): Specific user to analyze
- `time_range`: Start and end timestamps
- `analysis_type`: "behavioral" | "risk" | "compliance"

**Example**:
```json
{
  "type": "function_call",
  "requestId": "req_123",
  "functions": [
    {
      "name": "analyze_audit_trail",
      "parameters": {
        "user_id": "user123",
        "time_range": {
          "start": "2026-01-01T00:00:00Z",
          "end": "2026-01-06T23:59:59Z"
        },
        "analysis_type": "risk"
      }
    }
  ]
}
```

---

#### 2. search_audit_logs
Search audit logs with natural language or structured queries.

**Parameters**:
- `query`: Search query string
- `scope`: ["user_actions", "security_events", "data_access"]
- `filters`: Additional filters (severity, user_id, etc.)
- `limit`: Max results (default 50)

---

#### 3. collect_compliance_evidence
Auto-collect compliance evidence for frameworks.

**Parameters**:
- `framework`: Framework details (name, version, domain)
- `control_id`: Control identifier
- `period`: Audit period (start, end, name)
- `auto_collect`: true to automatically collect audit logs

---

#### 4. detect_anomalies
Run ML-based anomaly detection on audit logs.

**Parameters**:
- `detection_scope`: Array of anomaly types to detect
- `sensitivity`: "low" | "medium" | "high" | "critical"
- `time_range`: Time period to analyze
- `ml_model`: "isolation_forest" | "lstm_autoencoder" | "random_forest" | "statistical" | "rule_based" | "ensemble"

---

#### 5. generate_audit_report
Generate comprehensive audit reports.

**Parameters**:
- `report_type`: "executive" | "compliance" | "security" | "forensic"
- `time_range`: Report period
- `framework`: Compliance framework (optional)
- `format`: "json" | "pdf" | "html"

---

#### 6. investigate_security_incident
Create and manage security incident investigations.

**Parameters**:
- `incident_type`: Type of incident
- `affected_systems`: List of affected systems
- `severity`: "low" | "medium" | "high" | "critical"
- `description`: Incident description
- `investigator`: Lead investigator details

---

#### 7. monitor_realtime_events
Monitor real-time audit events with filtering.

**Parameters**:
- `event_types`: Array of event categories to monitor
- `severity_threshold`: Minimum severity level
- `duration_seconds`: Monitoring duration (default 60)

---

#### 8. verify_audit_integrity
Verify tamper-proof integrity of audit logs.

**Parameters**:
- `audit_ids`: Array of audit IDs to verify
- `verification_method`: "hash_verification" | "merkle_tree" | "blockchain"

---

#### 9. calculate_risk_score
Calculate composite risk scores for entities.

**Parameters**:
- `entity_type`: "user" | "system" | "application"
- `entity_id`: Entity identifier
- `time_range`: Analysis period

---

#### 10. create_audit_policy
Create audit collection policies.

**Parameters**:
- `policy_name`: Policy name
- `description`: Policy description
- `enabled_sources`: Array of audit sources
- `retention_days`: Retention period
- `compliance_frameworks`: Array of frameworks
- `owner`: Policy owner details

---

## 🚀 Deployment

### Backend API
```bash
cd backend/tools/31-audittracker/api
npm install
npm start
# Runs on port 4031
```

### AI Assistant
```bash
cd backend/tools/31-audittracker/ai-assistant
npm install
npm start
# Runs on port 6031
```

### Frontend
```bash
cd frontend/tools/31-audittracker
npm install
npm run dev
# Runs on port 3031
```

---

## 📋 Compliance Frameworks Supported

- **SOX** (Sarbanes-Oxley Act 2002)
- **HIPAA** (Health Insurance Portability and Accountability Act)
- **PCI-DSS** (Payment Card Industry Data Security Standard)
- **ISO-27001** (Information Security Management)
- **GDPR** (General Data Protection Regulation)
- **NIST-800-53** (Security and Privacy Controls)
- **FISMA** (Federal Information Security Management Act)
- **CMMC** (Cybersecurity Maturity Model Certification)
- **SOC2** (Service Organization Control 2)
- **GLBA** (Gramm-Leach-Bliley Act)
- **FERPA** (Family Educational Rights and Privacy Act)

---

## 🔒 Security Features

### Tamper-Proof Logging
- **Hash Chains**: Each log includes previous log's hash
- **Merkle Trees**: Efficient integrity verification for log batches
- **Blockchain**: Distributed ledger for critical audit trails
- **Digital Signatures**: Cryptographic signing of evidence

### Anomaly Detection
- **Isolation Forest**: Detects unusual patterns in high-dimensional data
- **LSTM Autoencoder**: Identifies temporal sequence anomalies
- **Random Forest**: Ensemble learning for classification
- **Statistical Models**: Z-score, IQR, standard deviation analysis
- **Rule-Based**: Security-specific detection rules
- **Ensemble**: Combined model voting for accuracy

### Real-Time Monitoring
- Event streaming with WebSocket
- Configurable alert rules
- Multi-channel notifications (Email, Slack, SMS, PagerDuty, Teams)
- Automatic escalation for critical events

---

## 📊 Use Cases

### 1. SOX Compliance Audit
```javascript
// Auto-collect evidence for SOX 404 control
const evidence = await auditAIService.executeFunctions([{
  name: 'collect_compliance_evidence',
  parameters: {
    framework: { name: 'SOX', version: '2002', domain: 'financial_reporting' },
    control_id: 'SOX-404',
    period: { start: '2025-10-01', end: '2025-12-31', name: 'Q4 2025' },
    auto_collect: true
  }
}]);
```

### 2. Security Incident Investigation
```javascript
// Create investigation for data breach
const investigation = await auditAIService.executeFunctions([{
  name: 'investigate_security_incident',
  parameters: {
    incident_type: 'data_breach',
    affected_systems: ['SQL-FIN-01', 'SQL-FIN-02'],
    severity: 'critical',
    description: 'Unauthorized access to customer PII database',
    investigator: {
      user_id: 'inv_001',
      name: 'Security Lead',
      email: 'security@corp.com'
    }
  }
}]);
```

### 3. Real-Time Anomaly Detection
```javascript
// Detect privilege escalation attempts
const anomalies = await auditAIService.executeFunctions([{
  name: 'detect_anomalies',
  parameters: {
    detection_scope: ['privilege_escalation', 'unusual_access_pattern'],
    sensitivity: 'high',
    ml_model: 'isolation_forest',
    time_range: {
      start: '2026-01-06T00:00:00Z',
      end: '2026-01-06T23:59:59Z'
    }
  }
}]);
```

### 4. User Risk Assessment
```javascript
// Calculate risk score for user
const riskScore = await auditAIService.executeFunctions([{
  name: 'calculate_risk_score',
  parameters: {
    entity_type: 'user',
    entity_id: 'user123',
    time_range: {
      start: '2026-01-01T00:00:00Z',
      end: '2026-01-06T23:59:59Z'
    }
  }
}]);
```

---

## 🎯 Best Practices

### Audit Collection
- Enable real-time collection for critical systems
- Configure appropriate retention periods (90-365 days typical, 7+ years for compliance)
- Use filters to reduce noise and focus on security-relevant events
- Enable enrichment (geo-location, threat intel, user context)

### Compliance Evidence
- Auto-collect evidence during audit periods
- Maintain chain of custody for all evidence
- Digital signatures for attestation
- Regular quality scoring reviews

### Anomaly Detection
- Start with medium sensitivity, tune based on false positives
- Use ensemble models for best accuracy
- Review and mark false positives to improve ML models
- Integrate with SIEM for automated response

### Investigations
- Create investigations immediately for critical events
- Document all evidence with hashes for integrity
- Track time-to-detect and time-to-investigate metrics
- Maintain complete chain of custody

---

## 📞 Support

For issues or questions:
- **Documentation**: [docs/TOOLS-MASTER-INVENTORY.md](../../docs/TOOLS-MASTER-INVENTORY.md)
- **API Reference**: See REST API section above
- **AI Functions**: See AI Assistant section above

---

## 📄 License

See LICENSE file in root directory.

---

**Built with ❤️ for MAULA.AI Platform - Tool 31 of 50**
