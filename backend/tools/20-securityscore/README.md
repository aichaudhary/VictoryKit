# SecurityScore - Security Posture Scoring & Benchmarking Platform

## Overview

**SecurityScore** is a comprehensive security posture scoring and benchmarking platform designed to measure, track, and improve organizational security posture across multiple dimensions. It provides security teams with actionable insights, industry benchmarks, compliance tracking, and improvement recommendations.

## 🎯 Purpose

- **Security Posture Measurement**: Calculate comprehensive security scores across 7 security categories
- **Industry Benchmarking**: Compare security performance against industry peers and best practices
- **Compliance Tracking**: Monitor compliance across 10+ regulatory frameworks
- **Assessment Management**: Conduct and track security assessments and audits
- **Improvement Recommendations**: Generate actionable security improvement plans
- **Control Management**: Track security control implementation and effectiveness
- **Trend Analysis**: Monitor security score trends and forecast future performance

## 🏗️ Architecture

### Technology Stack

- **Runtime**: Node.js 20.x
- **Framework**: Express 4.x
- **Database**: MongoDB 7.x with Mongoose 8.x ODM
- **API Style**: RESTful with JSON responses
- **Language**: JavaScript (ES6+)

### Domain Information

- **Domain**: `securityscore.maula.ai`
- **Frontend Port**: 3020
- **Backend Port**: 4020
- **ML Service Port**: 8020
- **Database**: `securityscore_db`

### Directory Structure

```
backend/tools/20-securityscore/
├── api/
│   └── src/
│       ├── models/           # 8 MongoDB models (3,828 lines)
│       │   ├── SecurityScore.js      # Main security score entity
│       │   ├── ScoreMetric.js        # Individual security metrics
│       │   ├── Assessment.js         # Security assessments
│       │   ├── Benchmark.js          # Industry benchmarks
│       │   ├── Improvement.js        # Improvement recommendations
│       │   ├── Control.js            # Security controls
│       │   ├── Framework.js          # Compliance frameworks
│       │   ├── ScoreReport.js        # Score reports
│       │   └── index.js              # Model exports
│       ├── controllers/      # 42 API endpoints (652 lines)
│       │   └── index.js
│       └── routes/           # RESTful routing (72 lines)
│           └── securityscore.routes.js
└── README.md                 # This file
```

## 📊 Data Models

### 1. SecurityScore Model (669 lines)

Main entity for tracking security posture scores across organizations and systems.

**Key Features**:
- **Entity Types**: organization, department, business_unit, system, application, asset, vendor, third_party, project
- **Overall Score**: 0-100 score with grade (A+ to F), percentile, trend tracking
- **7 Security Categories**: network, endpoint, identity, data, application, cloud, compliance
- **Risk Assessment**: critical/high/medium/low summary, top risks, risk/exposure scores
- **Vulnerabilities**: severity summary, CVSS average, exploitable count, patch status
- **Historical Data**: 365-day retention with scores, categories, risks, vulnerabilities
- **Calculation Settings**: method (weighted_average/weighted_sum/custom/ai_driven), formula, schedule
- **Alerts**: thresholds, multi-channel notifications (email/slack/webhook/sms/pagerduty)

**Instance Methods**:
- `calculateOverallScore()` - Recalculate security score from categories
- `addHistoryEntry()` - Add current state to historical data
- `calculateTrend(period)` - Calculate trend over specified period

**Static Methods**:
- `findByEntity(entityType, entityId)` - Find scores by entity
- `findTopPerformers(limit)` - Get highest scoring entities
- `findLowPerformers(threshold)` - Get scores below threshold
- `getStatistics()` - Get aggregated statistics

### 2. ScoreMetric Model (658 lines)

Individual security metrics that contribute to category scores.

**Key Features**:
- **Categories**: network, endpoint, identity, data, application, cloud, compliance
- **Metric Types**: percentage, count, ratio, boolean, time, score, currency, custom
- **Data Sources**: manual, automated, api, agent, integration, calculated
- **Thresholds**: excellent/good/fair/poor/critical with direction
- **Compliance Mapping**: 11 frameworks (PCI-DSS, HIPAA, SOC2, ISO27001, NIST-CSF, etc.)
- **Historical Data**: 365 entries with date/value/score/source
- **Collection Schedule**: frequency (real_time/hourly/daily/weekly/monthly), cron support

**Instance Methods**:
- `calculateScore()` - Calculate score based on value and thresholds
- `addHistoryEntry(value, source)` - Add value to historical data
- `calculateTrend(period)` - Calculate trend over period
- `updateValue(newValue, source)` - Update metric value and recalculate

**Static Methods**:
- `findByCategory(category)` - Get metrics by category
- `findCritical()` - Get critical status metrics
- `findByFramework(framework)` - Get metrics mapped to framework
- `getStatistics()` - Get aggregated statistics

### 3. Assessment Model (673 lines)

Security assessments, audits, and penetration tests.

**Key Features**:
- **10 Assessment Types**: self_assessment, internal_audit, external_audit, penetration_test, vulnerability_scan, security_review, compliance_audit, risk_assessment, control_assessment, gap_analysis
- **Status Workflow**: planned → in_progress → on_hold → completed/cancelled/failed
- **Findings**: summary by severity, detailed findings with evidence
- **Compliance Results**: overall score, framework scores, gap analysis
- **Risk Assessment**: overall risk score, inherent vs residual risk
- **Reports**: executive/technical/compliance/full in multiple formats

**Instance Methods**:
- `calculateOverallScore()` - Calculate overall assessment score
- `updateFindingsSummary()` - Update findings summary counts
- `calculateRiskScore()` - Calculate overall risk score
- `complete()` - Complete assessment and update status

**Static Methods**:
- `findByEntity(entityType, entityId)` - Find assessments by entity
- `findRecent(limit)` - Get recent assessments
- `findByFramework(framework)` - Find assessments by framework
- `getStatistics()` - Get aggregated statistics

### 4. Benchmark Model (623 lines)

Industry and peer benchmarks for security score comparison.

**Key Features**:
- **8 Benchmark Types**: industry, peer, regulatory, internal, best_practice, custom, geographic, maturity_level
- **Industry Classification**: 15 industries with SIC/NAICS codes
- **Organization Size**: micro/small/medium/large/enterprise/global ranges
- **Score Benchmarks**: overall + 7 categories with mean, median, std dev
- **Percentile Distribution**: P10, P25, P50, P75, P90, P95, P99
- **Statistical Significance**: confidence level, margin of error, p-value

**Instance Methods**:
- `getPercentile(score, category)` - Get percentile for score
- `compareScore(score, category)` - Compare score to benchmark
- `isCurrent()` - Check if benchmark is still valid

**Static Methods**:
- `findActive(type, industry, size)` - Get active benchmarks
- `findByCriteria(industry, size, type)` - Find benchmarks by criteria
- `getBestPractice(category)` - Get best practice benchmarks
- `getStatistics()` - Get aggregated statistics

### 5. Improvement Model (707 lines) - Largest Model

Security improvement recommendations with tracking and ROI.

**Key Features**:
- **Types**: quick_win, short_term, medium_term, long_term, strategic, continuous
- **Priority**: critical, high, medium, low
- **Status Workflow**: identified → planned → approved → in_progress → completed
- **Impact Assessment**: score increase, category impacts, risk reduction, compliance improvement
- **Effort Estimation**: level, hours, complexity, skills/tools required
- **Cost Breakdown**: labor, tools, licenses, hardware, services, training
- **ROI Calculation**: value, period, break-even months
- **Implementation**: approach, steps, requirements, dependencies, risks
- **Validation**: method, test plan, results, evidence
- **Approval Workflow**: multiple approvers with levels

**Instance Methods**:
- `updateProgress(percentage, description, updatedBy)` - Update progress
- `addMilestone(name, description, dueDate)` - Add milestone
- `approve(approverName, approverEmail, comments)` - Approve improvement
- `reject(approverEmail, reason)` - Reject improvement
- `complete(completedBy)` - Mark as completed

**Static Methods**:
- `findHighPriority()` - Get high priority improvements
- `findOverdue()` - Get overdue improvements
- `findByCategory(category)` - Get improvements by category
- `getStatistics()` - Get aggregated statistics

### 6. Control Model (231 lines)

Security controls implementation and compliance tracking.

**Key Features**:
- **9 Categories**: network, endpoint, identity, data, application, cloud, compliance, physical, administrative
- **5 Types**: preventive, detective, corrective, deterrent, compensating
- **Framework Mapping**: NIST-CSF, ISO27001, CIS, PCI-DSS, HIPAA, SOC2, COBIT
- **Implementation**: status, level (manual/automated), percentage, dates
- **Effectiveness**: rating, score, last tested, evidence
- **Testing**: frequency, last test, next scheduled, results history
- **Compliance**: required, frameworks, status, audits

**Instance Methods**:
- `recordTest(result, tester, findings, evidence)` - Record test result
- `updateImplementation(status, percentage)` - Update implementation

**Static Methods**:
- `findByFramework(framework)` - Get controls by framework
- `findNonCompliant()` - Get non-compliant controls
- `findNotImplemented()` - Get not implemented controls
- `getStatistics()` - Get aggregated statistics

### 7. Framework Model (118 lines)

Compliance framework tracking and management.

**Key Features**:
- **10 Frameworks**: NIST-CSF, ISO27001, CIS, PCI-DSS, HIPAA, SOC2, GDPR, FedRAMP, CMMC, COBIT
- **Types**: compliance, security, privacy, risk, governance
- **Structure**: total controls, domains, categories, control families
- **Implementation**: status, dates, progress percentage
- **Compliance**: overall score, status, summary, gaps, last assessment
- **Certification**: is certified, body, certificate number, dates, audits

**Instance Methods**:
- `calculateComplianceScore()` - Calculate compliance score
- `updateControlStatus(controlIdentifier, status)` - Update control
- `updateComplianceSummary()` - Update compliance summary

**Static Methods**:
- `findActive()` - Get active frameworks
- `findCompliant()` - Get compliant frameworks
- `findNonCompliant()` - Get non-compliant frameworks
- `getStatistics()` - Get aggregated statistics

### 8. ScoreReport Model (130 lines)

Security score reports with trends and benchmarks.

**Key Features**:
- **6 Report Types**: executive_summary, technical_detailed, compliance_report, trend_analysis, benchmark_comparison, improvement_tracking
- **Executive Summary**: overall score, grade, trend, key findings, top risks
- **Statistics**: scores, categories, risks, vulnerabilities, improvements, compliance
- **Trend Analysis**: period, data points, forecast, insights
- **Benchmark Comparison**: industry/peer averages, ranking, percentile
- **Visualizations**: charts, graphs, tables, heatmaps
- **Exports**: PDF, HTML, DOCX, XLSX, CSV, JSON, XML
- **Distribution**: recipients, sharing, auto distribute

**Instance Methods**:
- `generateExecutiveSummary()` - Generate executive summary
- `addExport(format, filename, url, size)` - Add export file
- `distribute(recipients)` - Distribute report
- `archive()` - Archive completed report

**Static Methods**:
- `findRecent(limit)` - Get recent reports
- `findByType(type)` - Get reports by type
- `findScheduledDue()` - Get reports due for generation
- `getStatistics()` - Get aggregated statistics

## 🚀 API Endpoints (42 Total)

### System & Dashboard (2 endpoints)

- **GET** `/api/securityscore/status` - Health check
- **GET** `/api/securityscore/dashboard` - Dashboard overview

### Security Score Management (8 endpoints)

- **POST** `/api/securityscore/scores` - Create security score
- **GET** `/api/securityscore/scores` - List scores with pagination
- **GET** `/api/securityscore/scores/top` - Get top performers
- **GET** `/api/securityscore/scores/:id` - Get score by ID
- **PUT** `/api/securityscore/scores/:id` - Update score
- **DELETE** `/api/securityscore/scores/:id` - Delete score
- **POST** `/api/securityscore/scores/:id/calculate` - Recalculate score
- **GET** `/api/securityscore/scores/:id/history` - Get score history

### Metric Management (6 endpoints)

- **POST** `/api/securityscore/metrics` - Create metric
- **GET** `/api/securityscore/metrics` - List metrics
- **GET** `/api/securityscore/metrics/critical` - Get critical metrics
- **GET** `/api/securityscore/metrics/category/:category` - Get by category
- **GET** `/api/securityscore/metrics/:id` - Get metric by ID
- **PATCH** `/api/securityscore/metrics/:id/value` - Update metric value

### Assessment Management (6 endpoints)

- **POST** `/api/securityscore/assessments` - Create assessment
- **GET** `/api/securityscore/assessments` - List assessments
- **GET** `/api/securityscore/assessments/recent` - Get recent
- **GET** `/api/securityscore/assessments/:id` - Get by ID
- **PUT** `/api/securityscore/assessments/:id` - Update assessment
- **POST** `/api/securityscore/assessments/:id/complete` - Complete assessment

### Benchmark Management (4 endpoints)

- **POST** `/api/securityscore/benchmarks` - Create benchmark
- **GET** `/api/securityscore/benchmarks` - List benchmarks
- **GET** `/api/securityscore/benchmarks/:id` - Get by ID
- **GET** `/api/securityscore/benchmarks/:benchmarkId/compare/:scoreId` - Compare

### Improvement Management (5 endpoints)

- **POST** `/api/securityscore/improvements` - Create improvement
- **GET** `/api/securityscore/improvements` - List improvements
- **GET** `/api/securityscore/improvements/:id` - Get by ID
- **PATCH** `/api/securityscore/improvements/:id/progress` - Update progress
- **POST** `/api/securityscore/improvements/:id/approve` - Approve

### Control Management (5 endpoints)

- **POST** `/api/securityscore/controls` - Create control
- **GET** `/api/securityscore/controls` - List controls
- **GET** `/api/securityscore/controls/:id` - Get by ID
- **PATCH** `/api/securityscore/controls/:id/implementation` - Update implementation
- **POST** `/api/securityscore/controls/:id/test` - Record test

### Framework Management (4 endpoints)

- **POST** `/api/securityscore/frameworks` - Create framework
- **GET** `/api/securityscore/frameworks` - List frameworks
- **GET** `/api/securityscore/frameworks/:id` - Get by ID
- **POST** `/api/securityscore/frameworks/:id/compliance` - Update compliance

### Report Management (4 endpoints)

- **POST** `/api/securityscore/reports` - Generate report
- **GET** `/api/securityscore/reports` - List reports
- **GET** `/api/securityscore/reports/:id` - Get by ID
- **POST** `/api/securityscore/reports/:id/distribute` - Distribute

## 📦 Installation

### Prerequisites

- Node.js 20.x or higher
- MongoDB 7.x or higher
- npm or yarn package manager

### Setup Steps

1. **Navigate to tool directory**:
   ```bash
   cd backend/tools/20-securityscore/api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```env
   PORT=4020
   MONGODB_URI=mongodb://localhost:27017/securityscore_db
   NODE_ENV=development
   ```

4. **Start the API server**:
   ```bash
   npm start
   ```

5. **Verify installation**:
   ```bash
   curl http://localhost:4020/api/securityscore/status
   ```

## 🔧 Configuration

### Environment Variables

```env
PORT=4020
MONGODB_URI=mongodb://mongodb:27017/securityscore_db
NODE_ENV=production
API_PREFIX=/api/securityscore
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
JWT_SECRET=your-secret-key
CORS_ORIGIN=https://securityscore.maula.ai
```

## 🔌 Integration

### With Other Tools

SecurityScore integrates with:
- **VulnScan (Tool #6)**: Import vulnerability data
- **ThreatRadar (Tool #3)**: Incorporate threat intelligence
- **IntelliScout (Tool #2)**: Use intelligence for risk assessment
- **PhishGuard (Tool #5)**: Include phishing metrics
- **FirewallAI (Tool #1)**: Import network security metrics

### External Systems

- **SIEM Systems**: Splunk, QRadar, Sentinel
- **Vulnerability Scanners**: Nessus, Qualys, Rapid7
- **Cloud Providers**: AWS, Azure, GCP security metrics
- **Compliance Platforms**: ServiceNow, Archer
- **Ticketing Systems**: Jira, ServiceNow

## 📊 Performance

### Expected Performance

- **Score Calculation**: < 100ms for simple, < 500ms with history
- **Dashboard Load**: < 1s for full dashboard
- **Report Generation**: 2-5s for executive, 10-30s for detailed
- **Benchmark Comparison**: < 200ms per comparison
- **API Response Time**: < 100ms simple, < 500ms complex

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection**: Verify connection string and MongoDB is running
2. **Score Calculation**: Check category weights sum to 100
3. **Performance**: Review database indexes and pagination
4. **Integration**: Verify webhook endpoints and API tokens

## 📚 Documentation

- **API Documentation**: `/api/securityscore/docs`
- **Model Schemas**: `models/` directory
- **Integration Guides**: `docs/integrations/`

## 📊 Statistics

- **Total Files**: 11 files
- **Total Lines**: 4,552 lines
  - Models: 3,828 lines (84%)
  - Controllers: 652 lines (14%)
  - Routes: 72 lines (2%)
- **API Endpoints**: 42 endpoints
- **Data Models**: 8 models
- **Feature Groups**: 9 groups

## 🔄 Version History

- **v1.0.0** (2024-01-15): Initial release
  - 8 comprehensive MongoDB models
  - 42 RESTful API endpoints
  - 7 security categories
  - 10 compliance frameworks
  - Industry benchmarking
  - Assessment management
  - Improvement tracking
  - Control management
  - Report generation

---

**SecurityScore** - Security Posture Scoring & Benchmarking Platform  
Part of the VictoryKit Security Suite by Maula.ai
