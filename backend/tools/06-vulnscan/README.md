# 🛡️ VulnScan - Enterprise Vulnerability Scanner & Asset Management

<div align="center">

![VulnScan Logo](https://img.shields.io/badge/VulnScan-Security%20Scanner-FF5722?style=for-the-badge&logo=shield&logoColor=white)

[![Version](https://img.shields.io/badge/version-1.0.0-FF5722.svg)](https://github.com/VM07B/VictoryKit)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248.svg)](https://mongodb.com/)

**Enterprise-Grade Vulnerability Scanning, Asset Management, Patch Management & Compliance Platform**

[Live Demo](https://vulnscan.maula.ai) • [API Docs](https://vulnscan.maula.ai/docs) • [Report Bug](https://github.com/VM07B/VictoryKit/issues)

</div>

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [MongoDB Models](#-mongodb-models)
4. [API Endpoints](#-api-endpoints)
5. [Technology Stack](#-technology-stack)
6. [Installation](#-installation)
7. [Configuration](#-configuration)

---

## 🎯 Overview

**VulnScan** is a comprehensive vulnerability scanning and asset management platform that helps organizations identify, prioritize, and remediate security vulnerabilities across their infrastructure. With advanced CVE correlation, patch management, compliance checking, and remediation tracking, VulnScan provides complete security posture management.

### Why VulnScan?

- **Comprehensive Scanning**: Network, web application, database, API, cloud, and container scanning
- **Asset Discovery**: Automatic discovery and inventory with real-time tracking
- **CVE Correlation**: Automatic CVE matching with CVSS v2/v3/v4 scoring
- **Patch Management**: Complete patch lifecycle from testing to deployment
- **Compliance Checking**: Built-in compliance for PCI-DSS, HIPAA, SOC2, ISO27001, NIST, CIS, GDPR
- **Remediation Tracking**: Full remediation workflow with approval and verification
- **Executive Reporting**: Comprehensive reports with trends and recommendations

---

## ✨ Key Features

### Vulnerability Scanning
- Network scanning, web application testing, database auditing, API security testing
- CVE correlation with CVSS scoring, threat intelligence integration
- Exploit detection and active exploitation monitoring

### Asset Management
- Auto-discovery and fingerprinting, comprehensive inventory management
- Risk scoring and criticality assessment, lifecycle tracking

### Patch Management
- CVE to patch mapping, testing workflows, automated deployment
- Rollback capabilities, SLA tracking

### Compliance Management
- PCI-DSS, HIPAA, SOC2, ISO27001, NIST, CIS, GDPR support
- Control mapping, evidence collection, gap analysis

### Remediation Management
- Full workflow with approval, task assignment and tracking
- Progress monitoring, post-remediation verification

### Reporting & Analytics
- Executive summaries, technical reports, compliance reports
- Trend analysis, custom configurable reports

---

## 🗄️ MongoDB Models

### 1. Asset Model (~570 lines)
Manages IT asset inventory with comprehensive vulnerability tracking.

**Key Fields:** `assetId`, `name`, `hostname`, `type`, `networkInterfaces`, `operatingSystem`, `services`, `vulnerabilitySummary`, `riskScore`, `complianceFrameworks`, `patchStatus`

**Methods:** `updateVulnerabilityCount()`, `calculateRiskScore()`, `addService()`

**Statics:** `findHighRisk()`, `findWithCriticalVulns()`, `getStatistics()`

### 2. Vulnerability Model (~670 lines)
Tracks vulnerabilities with CVE correlation and CVSS scoring.

**Key Fields:** `vulnId`, `cveId`, `severity`, `cvssV3`, `affectedAssets`, `exploit`, `patch`, `remediation`, `threatScore`

**Methods:** `calculateThreatScore()`, `assignToAssets()`, `markPatched()`

**Statics:** `findCritical()`, `findExploitable()`, `findOverdue()`

### 3. Scan Model (~600 lines)
Manages scan execution, scheduling, and results.

**Key Fields:** `scanId`, `scanType`, `profile`, `targets`, `status`, `progress`, `results`, `vulnerabilities`

**Methods:** `start()`, `pause()`, `resume()`, `complete()`, `cancel()`

**Statics:** `findActive()`, `findRecent()`, `getStatistics()`

### 4. ScanSchedule Model (~540 lines)
Automated scan scheduling and execution.

**Key Fields:** `scheduleId`, `recurrence`, `timing`, `scanConfig`, `notifications`, `executionHistory`

**Methods:** `calculateNextRun()`, `execute()`, `recordExecution()`

**Statics:** `findDue()`, `findActive()`

### 5. Patch Model (~670 lines)
Security patch management and deployment.

**Key Fields:** `patchId`, `severity`, `cveIds`, `applicability`, `testing`, `deployment`, `targetAssets`, `rollback`

**Methods:** `deployToAssets()`, `updateDeploymentStats()`, `rollbackDeployment()`

**Statics:** `findCritical()`, `findOverdue()`, `findByCVE()`

### 6. ComplianceCheck Model (~690 lines)
Security compliance assessment and tracking.

**Key Fields:** `checkId`, `framework`, `controls`, `results`, `gaps`, `remediation`, `assetCompliance`

**Methods:** `assessControl()`, `updateResults()`, `identifyGaps()`, `complete()`

**Statics:** `findByFramework()`, `findExpiringSoon()`

### 7. RemediationPlan Model (~720 lines)
Vulnerability remediation planning and tracking.

**Key Fields:** `planId`, `priority`, `vulnerabilities`, `affectedAssets`, `actions`, `approval`, `verification`

**Methods:** `addAction()`, `updateProgress()`, `approve()`, `complete()`, `verify()`

**Statics:** `findHighPriority()`, `findOverdue()`

### 8. VulnReport Model (~680 lines)
Vulnerability assessment reporting and analytics.

**Key Fields:** `reportId`, `type`, `scope`, `executiveSummary`, `statistics`, `trends`, `compliance`

**Methods:** `generateExecutiveSummary()`, `distribute()`, `archive()`

**Statics:** `findRecent()`, `findByType()`

---

## 🔌 API Endpoints (43 Total)

### System & Dashboard (2)
- `GET /api/vulnscan/status`, `GET /api/vulnscan/dashboard`

### Asset Management (7)
- `POST /api/vulnscan/assets`, `GET /api/vulnscan/assets`
- `GET /api/vulnscan/assets/high-risk`, `GET /api/vulnscan/assets/:id`
- `PUT /api/vulnscan/assets/:id`, `DELETE /api/vulnscan/assets/:id`
- `GET /api/vulnscan/assets/:id/vulnerabilities`

### Vulnerability Management (7)
- `POST /api/vulnscan/vulnerabilities`, `GET /api/vulnscan/vulnerabilities`
- `GET /api/vulnscan/vulnerabilities/critical`, `GET /api/vulnscan/vulnerabilities/exploitable`
- `GET /api/vulnscan/vulnerabilities/:id`
- `POST /api/vulnscan/vulnerabilities/:id/assign-remediation`
- `POST /api/vulnscan/vulnerabilities/:id/patch`

### Scan Management (8)
- `POST /api/vulnscan/scans`, `GET /api/vulnscan/scans`, `GET /api/vulnscan/scans/active`
- `GET /api/vulnscan/scans/:id`, `POST /api/vulnscan/scans/:id/start`
- `POST /api/vulnscan/scans/:id/pause`, `POST /api/vulnscan/scans/:id/resume`
- `POST /api/vulnscan/scans/:id/cancel`

### Scan Schedules (3)
- `POST /api/vulnscan/schedules`, `GET /api/vulnscan/schedules`
- `POST /api/vulnscan/schedules/:id/execute`

### Patch Management (5)
- `POST /api/vulnscan/patches`, `GET /api/vulnscan/patches`
- `GET /api/vulnscan/patches/critical`, `POST /api/vulnscan/patches/:id/deploy`
- `POST /api/vulnscan/patches/:id/test`

### Compliance Management (4)
- `POST /api/vulnscan/compliance`, `GET /api/vulnscan/compliance`
- `GET /api/vulnscan/compliance/:id`, `POST /api/vulnscan/compliance/:id/complete`

### Remediation Management (4)
- `POST /api/vulnscan/remediation`, `GET /api/vulnscan/remediation`
- `POST /api/vulnscan/remediation/:id/approve`
- `POST /api/vulnscan/remediation/:id/complete`

### Reporting (3)
- `POST /api/vulnscan/reports`, `GET /api/vulnscan/reports`
- `GET /api/vulnscan/reports/:id`

---

## 🛠️ Technology Stack

**Backend:** Node.js 20+, Express.js 4.18+, MongoDB 7.0+, Mongoose 8.0+
**Frontend:** React 19, TypeScript 5.3, Vite 5.0
**Scanning:** Nmap, OpenVAS, Nessus, OWASP ZAP

---

## 📦 Installation

```bash
# Install dependencies
cd backend/tools/06-vulnscan/api && npm install
cd ../../frontend/tools/06-vulnscan && npm install

# Start services (Docker Compose recommended)
docker-compose up -d

# Or start manually
mongod --dbpath /data/vulnscan_db
cd api && npm run dev
cd ../../frontend/tools/06-vulnscan && npm run dev
```

**Access:**
- Frontend: http://localhost:3006
- Backend: http://localhost:4006
- ML Engine: http://localhost:8006

---

## ⚙️ Configuration

See `api/.env` for backend config and `vulnscan-config.json` for frontend config.

---

<div align="center">

Made with ❤️ by the VictoryKit Team

</div>
