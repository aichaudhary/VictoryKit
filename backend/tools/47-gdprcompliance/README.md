# Tool #47: GDPR Compliance - EU Data Protection Platform

Complete GDPR compliance management system with 12 MongoDB models, 40+ API endpoints, consent management, DSAR workflow (30-day SLA), breach notification (72-hour timer), DPIA automation, and data protection officer tools.

## 🎯 Overview

**Domain**: `gdprcompliance.maula.ai`  
**Ports**: 3047 (Frontend), 4047 (API), 6047 (WebSocket), 8047 (ML)  
**Database**: `gdprcompliance_db`  
**Focus**: EU General Data Protection Regulation (GDPR) compliance, Articles 5-99

## 📊 MongoDB Models (12)

### 1. **DataSubject** (145 lines)
Primary data subject registry with special category tracking.

**Key Fields**:
- `subjectId` (String, unique, indexed)
- `email`, `fullName`, `category` (customer, employee, prospect, etc.)
- `specialCategoryData` (Article 9): health, biometric, genetic, racial, political, religious, trade union, sex life
- `rightsExercised[]` - history of DSAR requests
- `activeConsents[]` - consent record references
- `dataLocations[]` - data mapping across systems
- `retentionScheduleId`, `status` (active, inactive, erased, restricted)

**Methods**:
- `isSpecialCategory()` - check if processes special category data
- `getActiveConsentsCount()` - count valid consents

**Indexes**: `email + status`, `category + status`, `specialCategoryData.*`

---

### 2. **ConsentRecord** (280 lines)
Article 7 consent management with GDPR validation.

**Key Fields**:
- `consentId` (String, unique)
- `dataSubjectId` (ref: DataSubject)
- `purpose` (marketing_email, analytics, profiling, etc.)
- `consentText` - exact wording shown to user
- `consentCriteria` (Article 7):
  - `freelyGiven`, `specific`, `informed`, `unambiguous`, `clearAffirmativeAction`
- `grantedAt`, `grantMethod` (checkbox, button, signature, etc.)
- `ipAddress`, `userAgent`, `geoLocation` - technical evidence
- `status` (active, withdrawn, expired, renewed)
- `withdrawalMechanismProvided` - Article 7(3) requirement
- `validFrom`, `validUntil`, `isLifelong`
- `complianceScore` (0-100)

**Methods**:
- `validateGDPRCompliance()` - check all 5 criteria + withdrawal mechanism
- `withdraw(reason, withdrawnBy)` - Article 7(3)

**Statics**:
- `findActiveByDataSubject(dataSubjectId)` - active consents only

**Indexes**: `dataSubjectId + status`, `purpose + status`, `grantedAt`, `validUntil`

---

### 3. **ProcessingActivity** (340 lines)
Article 30 - Records of Processing Activities (ROPA).

**Key Fields**:
- `activityId` (String, unique)
- `activityName`, `description`
- `controller` (name, contact, address, email, phone)
- `jointControllers[]`
- `dpoId` (ref: DPO)
- `purposes[]` - each with lawful basis reference
- `dataSubjectCategories[]` - customers, employees, prospects, etc.
- `personalDataCategories[]` - with special category flags
- `recipientCategories[]` - who receives data
- `dataTransfers[]` - international transfers
- `retentionSchedule` - Article 5(1)(f)
- `securityMeasures`:
  - `technical[]`, `organizational[]`
  - `encryption` (in transit, at rest)
  - `accessControls`, `backupProcedures`, `incidentResponsePlan`
- `dpiaRequired` (required, reason, dpiaId)
- `processors[]` - Article 28 references
- `automatedDecisionMaking` - Article 22
- `status`, `complianceStatus`

**Methods**:
- `requiresDPIA()` - check Article 35 criteria
- `isCompleteRecord()` - validate all Article 30 requirements

**Statics**:
- `findDueForReview()` - expired review dates

**Indexes**: `activityId`, `status`, `controller.name`, `nextReviewDate`

---

### 4. **DSAR** (400 lines)
Data Subject Access Requests (Articles 15-22) with 30-day SLA tracking.

**Key Fields**:
- `requestId` (String, unique)
- `dataSubjectId` (ref: DataSubject)
- `requestType`:
  - `access` (Article 15)
  - `rectification` (Article 16)
  - `erasure` (Article 17 - right to be forgotten)
  - `restriction` (Article 18)
  - `portability` (Article 20)
  - `objection` (Article 21)
  - `automated_decision` (Article 22)
  - `withdraw_consent` (Article 7(3))
- `requestChannel` (email, web_form, phone, written, in_person, api)
- `identityVerification` (status, method, verifiedAt)
- `receivedDate`, `dueDate` (30 days), `completedDate`
- `extensionRequested` - can extend 2 months if complex (Article 12(3))
- `status` (submitted, under_review, in_progress, completed, overdue)
- `accessRequest`, `rectificationRequest`, `erasureRequest`, `restrictionRequest`, `portabilityRequest`, `objectionRequest`
- `response` (responseDate, method, content, attachments)
- `rejectionReason` - if request denied
- `complianceMetrics` (processingTimeHours, deadlineMet, daysBeforeDeadline)

**Virtuals**:
- `daysRemaining` - days until 30-day deadline
- `isOverdue` - deadline passed check

**Methods**:
- `calculateDueDate()` - 30 days from receipt
- `requestExtension(reason)` - add 60 days (Article 12(3))
- `complete(details)` - mark as completed
- `addCommunication()` - log interactions

**Statics**:
- `findOverdue()` - past deadline requests
- `findDueSoon(days)` - approaching deadline (default 7 days)

**Indexes**: `requestId`, `dataSubjectEmail + requestType`, `status + dueDate`, `receivedDate`

---

### 5. **DataBreach** (490 lines)
Article 33-34 - 72-hour supervisory authority notification tracking.

**Key Fields**:
- `breachId` (String, unique)
- `discoveryDate` - when breach was discovered
- `discoveredBy`, `discoveryMethod`
- `breachType` (confidentiality, availability, integrity, combined)
- `breachCategory` (cyber_attack, hacking, malware, phishing, insider_threat, human_error, etc.)
- `severity` (critical, high, medium, low)
- `riskLevel` (high_risk, medium_risk, low_risk, unlikely_risk)
- `affectedDataCategories[]` - identification, financial, health, credentials, etc.
- `dataSubjectsAffected` (estimatedNumber, categories, includesMinors, includesVulnerableGroups)
- `supervisoryNotification` (Article 33):
  - `required`, `notificationDeadline` (72 hours)
  - `notified`, `notificationDate`, `authority`
- `dataSubjectNotification` (Article 34):
  - `required`, `exemptionReason`, `notificationMethod`
- `timeline` (discovery, dpoNotified, containment, authorityNotification, resolution)
- `complianceTracking`:
  - `hours72Deadline` - auto-calculated 72 hours from discovery
  - `notificationWithin72Hours` (boolean)
  - `hoursToNotification`
- `containmentMeasures[]`, `mitigationMeasures[]`
- `investigation` (status, findings, forensics)
- `status` (discovered, contained, authorities_notified, data_subjects_notified, resolved)

**Virtuals**:
- `hoursUntil72HourDeadline` - time remaining
- `is72HourDeadlinePassed` - compliance check

**Methods**:
- `calculate72HourDeadline()` - discovery + 72 hours
- `notifySupervisoryAuthority(authority, method)` - Article 33
- `notifyDataSubjects(method, content)` - Article 34

**Statics**:
- `findApproaching72HourDeadline(hours)` - breaches near deadline
- `findOverdue72Hours()` - missed 72-hour window

**Indexes**: `breachId`, `discoveryDate`, `severity + status`, `hours72Deadline`

---

### 6. **DPIAAssessment** (425 lines)
Data Protection Impact Assessment (Article 35).

**Key Fields**:
- `dpiaId` (String, unique)
- `processingActivityId` (ref: ProcessingActivity)
- `triggers` (Article 35(3)):
  - `systematicExtensiveEvaluation` - automated profiling
  - `largeScaleSpecialCategoryData` - sensitive data at scale
  - `systematicMonitoringPublicArea` - CCTV, tracking
- `team` (lead, members, dpoInvolved, dpoId)
- `status` (not_started, in_progress, dpo_review, completed, requires_supervisory_consultation, approved)
- `processingDescription` - Article 35(7)(a)
- `necessityProportionality` - Article 35(7)(b):
  - `lawfulBasis`, `necessity`, `proportionality`, `legitimateInterests`
- `riskAssessment` - Article 35(7)(c):
  - `identifiedRisks[]` (likelihood, severity, riskLevel, riskScore)
  - `overallRiskLevel`
- `mitigationMeasures[]` - Article 35(7)(d):
  - `implementation` (status, date, effectiveness)
  - `residualRisk`
- `securityMeasures` (encryption, accessControl, pseudonymization, privacyByDesign)
- `dataSubjectConsultation` - when required
- `dpoOpinion` - Article 35(2)
- `supervisoryConsultation` - Article 36 (if high residual risk)
- `decision` (proceed, conditions, approval)
- `residualRiskAssessment` (acceptable, justification)

**Virtuals**:
- `isHighRisk` - critical/high overall risk
- `requiresSupervisoryConsultation` - Article 36 trigger

**Methods**:
- `calculateRiskScore(likelihood, severity)` - risk matrix
- `addRisk(risk)` - add risk to assessment
- `updateOverallRiskLevel()` - recalculate from all risks

**Statics**:
- `findDueForReview()` - review dates passed
- `findHighRisk()` - high/critical risk level
- `findRequiringSupervisoryConsultation()` - Article 36 cases

**Indexes**: `dpiaId`, `status`, `processingActivityId`, `nextReviewDate`

---

### 7. **LegalBasis** (370 lines)
Lawful Basis for Processing (Article 6).

**Key Fields**:
- `basisId` (String, unique)
- `processingActivityId` (ref: ProcessingActivity)
- `basisType` (Article 6(1)):
  - `consent` (Article 6(1)(a))
  - `contract` (Article 6(1)(b))
  - `legal_obligation` (Article 6(1)(c))
  - `vital_interests` (Article 6(1)(d))
  - `public_task` (Article 6(1)(e))
  - `legitimate_interests` (Article 6(1)(f))
- `consentDetails` - if basis is consent
- `contractDetails` - if basis is contract
- `legalObligationDetails` - specific law reference
- `vitalInterestsDetails` - life-threatening situations
- `publicTaskDetails` - public authority tasks
- `legitimateInterestsDetails`:
  - `controllerInterests`, `balancingTestCompleted`
  - `lia` (Legitimate Interest Assessment):
    - `purposeTest`, `necessityTest`, `balancingTest`
  - `optOutMechanism`
- `specialCategoryProcessing` - Article 9 derogations
- `criminalConvictionsProcessing` - Article 10
- `status` (active, inactive, under_review, invalid)

**Virtuals**:
- `isValid` - status + expiry check
- `requiresConsent` - consent-based processing

**Methods**:
- `validateBasis()` - check type-specific requirements
- `performBalancingTest(liaData)` - LIA for legitimate interests

**Statics**:
- `findByProcessingActivity(activityId)`
- `findDueForReview()`
- `findByType(basisType)`

**Indexes**: `basisId`, `processingActivityId`, `basisType + status`, `nextReviewDate`

---

### 8. **DataTransfer** (440 lines)
International Data Transfers (Chapter V - Articles 44-50).

**Key Fields**:
- `transferId` (String, unique)
- `transferType` (outbound, inbound, onward)
- `originCountry`, `destinationCountry`
- `recipientType` (processor, controller, joint_controller, sub_processor, third_party)
- `transferMechanism`:
  - `mechanismType`:
    - `adequacy_decision` (Article 45)
    - `standard_contractual_clauses` (Article 46(2)(c) - SCCs)
    - `binding_corporate_rules` (Article 47 - BCRs)
    - `derogation` (Article 49)
  - `adequacyDecision` - countries with EU adequacy
  - `standardContractualClauses`:
    - `sccVersion` (2021_SCCs, 2010_SCCs)
    - `sccModule` (controller-to-controller, etc.)
    - `tiaCompleted` (Transfer Impact Assessment)
    - `supplementaryMeasures[]`
  - `bindingCorporateRules` (bcrsApproved, authority)
  - `derogation` - Article 49 exceptions (consent, contract, etc.)
- `personalDataCategories[]`, `dataSubjectCategories[]`
- `transferFrequency` (one-time, occasional, regular, continuous)
- `thirdCountryAssessment` (legalFramework, recipientProtections, riskLevel)
- `securityMeasures` (encryption in transit/at rest, pseudonymization)
- `onwardTransfers` - sub-transfers allowed
- `dataSubjectRights` - rights at destination
- `supervisoryAuthority` (notification, approval)
- `status` (draft, approved, active, suspended, terminated)

**Virtuals**:
- `requiresTIA` - SCCs without adequacy need TIA
- `isActive` - status + suspension + termination check

**Methods**:
- `hasAdequacyDecision()` - check against adequacy list
- `requiresSCCs()` - no adequacy and not BCRs
- `validateTransferMechanism()` - compliance check
- `suspend(reason)`, `terminate(reason)`

**Statics**:
- `findByDestination(country)`
- `findByMechanism(mechanismType)`
- `findHighRisk()` - high/critical risk transfers

**Indexes**: `transferId`, `destinationCountry + status`, `mechanismType`

---

### 9. **Processor** (435 lines)
Processor Management (Article 28).

**Key Fields**:
- `processorId` (String, unique)
- `processorName`, `legalEntity`
- `contactDetails` (primaryContact, dpo, address, website)
- `processorType` (cloud_provider, saas, it_services, payment, marketing, analytics, etc.)
- `servicesProvided` (description, categories)
- `processingActivities[]` - linked activities
- `processingAgreement` (Article 28):
  - `agreementType` (dpa, contract_with_dpa, msa_with_dpa)
  - `signedDate`, `effectiveDate`, `expirationDate`
  - `requiredClauses` (Article 28(3)):
    - `processingInstructions`
    - `confidentialityObligation`
    - `securityMeasures`
    - `subProcessorAuthorization` (specific/general)
    - `dataSubjectRights` (assistance commitment)
    - `deletionOrReturn`
    - `auditRights`
    - `breachNotification`
- `subProcessors` - Article 28(2), 28(4)
- `dataTransfers[]` - to processor
- `securityMeasures` (certifications: ISO27001, SOC2, etc.)
- `processingInstructions[]` - controller instructions
- `dataSubjectRightsSupport` - how processor assists with DSARs
- `auditRights` (audits, findings, issues)
- `breachNotification` (obligation, deadline, history)
- `dataHandling` (deletion, return, certification)
- `riskAssessment`, `complianceStatus`
- `status` (under_evaluation, approved, active, suspended, terminated, blacklisted)

**Virtuals**:
- `isActive`, `agreementExpiringSoon`

**Methods**:
- `validateArticle28Compliance()` - check all Article 28(3) clauses
- `addSubProcessor(data)` - Article 28(2)
- `issueInstruction(instruction)` - controller instructions
- `recordBreach(data)` - log processor breach

**Statics**:
- `findActive()`
- `findRequiringReview()`
- `findExpiringAgreements(days)`
- `findNonCompliant()`

**Indexes**: `processorId`, `processorName + status`, `country`, `nextReviewDate`

---

### 10. **RetentionSchedule** (340 lines)
Data Retention (Article 5(1)(e) - Storage Limitation).

**Key Fields**:
- `scheduleId` (String, unique)
- `scheduleName`
- `processingActivityId` (ref: ProcessingActivity)
- `dataCategory` (customer_data, employee_data, financial, contracts, etc.)
- `retentionPeriod` (duration, unit, description)
- `retentionRationale` (justification, legalBasis, legalReferences)
- `retentionTriggers`:
  - `startEvent` (data_collection, contract_signature, etc.)
  - `endEvent` (retention_expiry, purpose_fulfilled, etc.)
- `deletionProcedure`:
  - `deletionMethod` (soft_delete, hard_delete, anonymization, secure_wipe)
  - `automatedDeletion` (enabled, frequency, nextExecutionDate)
- `exceptions[]` - legal holds, litigation holds
- `storageLocations[]` - systems, databases, tables
- `monitoring` (reviews, complianceChecks)
- `deletionStatistics` (totalRecordsDeleted, history)
- `status` (draft, approved, active, suspended)

**Virtuals**:
- `retentionPeriodInDays` - converted to days
- `hasActiveException` - legal/litigation holds

**Methods**:
- `calculateRetentionEndDate(startDate)` - apply retention period
- `isRetentionExpired(recordDate)` - check if past retention
- `addException(data)` - legal hold
- `recordDeletion(count, method, by)` - log deletion
- `scheduleNextDeletion()` - automated deletion

**Statics**:
- `findActive()`
- `findByDataCategory(category)`
- `findDueForReview()`
- `findDueForDeletion()` - automated deletion queue

**Indexes**: `scheduleId`, `dataCategory + status`, `processingActivityId`, `nextReviewDate`, `nextExecutionDate`

---

### 11. **DPO** (400 lines)
Data Protection Officer (Articles 37-39).

**Key Fields**:
- `dpoId` (String, unique)
- `personalDetails` (firstName, lastName, title, professionalDesignation)
- `contactDetails` (email, phone, address, publicContactPage) - Article 37(7)
- `employmentType` (internal, external, shared_service)
- `organization` (name, type, startDate, endDate)
- `externalDPO` - if outsourced
- `professionalQualifications` (Article 37(5)):
  - `expertKnowledge` (dataProtectionLaw, practices, businessSector - rated 1-5)
  - `certifications[]` (CIPP/E, CIPM, CIPT, FIP, etc.)
  - `education[]`, `experience[]`, `training[]`
- `responsibilities` (Article 39):
  - `informAndAdvise` - Article 39(1)(a)
  - `monitorCompliance` - Article 39(1)(b)
  - `dpiaAdvice` - Article 39(1)(c)
  - `supervisoryCooperation` - Article 39(1)(d)
  - `contactPoint` - Article 39(1)(e)
- `independence` (Article 38(3)):
  - `reportsDirectlyToManagement`
  - `noConflictOfInterest`
  - `otherTasks[]`
- `resources` (Article 38(2)):
  - `hasAdequateResources`, `team[]`, `budget`
- `designationRequirements` (Article 37):
  - `isRequired`, `requirementReason`, `notifiedToAuthority`
- `activities[]` - activity log
- `adviceProvided[]` - opinions given
- `trainingPrograms[]` - training delivered
- `complianceMonitoring` (audits, findings)
- `dataSubjectInquiries[]` - contact point activities
- `performanceMetrics`
- `status` (active, inactive, suspended, terminated)

**Virtuals**:
- `isActive`, `yearsOfService`, `fullContactInfo`

**Methods**:
- `assessExpertise()` - calculate expertise level (Expert/Proficient/Intermediate)
- `logActivity(type, description, outcome)` - Article 39 activities
- `provideAdvice(subject, requestedBy, advice)` - DPO opinion
- `checkConflictOfInterest()` - Article 38(3) check

**Statics**:
- `findActive()`
- `findByOrganization(name)`
- `findExternal()`
- `findRequiringTraining()` - expiring certifications

**Indexes**: `dpoId`, `email`, `employmentType + status`, `organizationName`

---

### 12. **AuditLog** (445 lines)
Comprehensive Audit Trail (Article 5(2) - Accountability).

**Key Fields**:
- `logId` (String, unique)
- `timestamp` (Date, indexed)
- `eventCategory`:
  - `data_access`, `data_modification`, `data_deletion`, `data_export`
  - `consent_action`, `dsar_action`, `breach_action`
  - `user_authentication`, `system_configuration`, `policy_change`
  - `security_event`, `transfer_action`, `retention_action`
  - `dpia_action`, `dpo_action`, `processor_action`, `compliance_check`
- `eventType`, `eventDescription`, `eventSeverity` (info, low, medium, high, critical)
- `actor` (actorType, actorId, actorName, actorEmail, actorRole)
- `session` (sessionId, ipAddress, userAgent, deviceType, location)
- `target` (targetType, targetId, targetName, targetReference)
- `action` (actionName, actionResult: success/failure/blocked, actionDuration)
- `dataSubject` (dataSubjectId, email, category)
- `changes` (fieldChanges[], recordsBefore, recordsAfter)
- `dataAccessed` (dataCategories, recordCount, accessPurpose)
- `compliance` (legalBasis, processingPurpose)
- `security` (authenticationMethod, encryptionUsed, anomalyDetected)
- `error` - if action failed
- `review` (reviewed, flagged, flagReason)
- `regulatoryReporting` (reportable, reportedTo)
- `retentionPeriod` (deleteAfter) - TTL index for auto-deletion

**Virtuals**:
- `isHighSeverity`, `isFailed`, `requiresReview`

**Statics**:
- `logEvent(data)` - create log entry
- `findByActor(actorId, startDate, endDate)`
- `findByDataSubject(dataSubjectId, category)`
- `findSecurityEvents(start, end, severity)`
- `findFailedActions(hours)` - last 24 hours
- `findAnomalies(hours)` - security anomalies
- `findRequiringReview()` - high severity/anomalies/failures
- `generateComplianceReport(start, end)` - aggregate statistics

**Methods**:
- `flag(reason, by)` - flag for review
- `markReviewed(by, notes)` - complete review
- `calculateIntegrityHash()` - SHA256 hash
- `verifyIntegrity()` - check hash

**Indexes**: `timestamp`, `eventCategory + timestamp`, `actorId + timestamp`, `dataSubjectId + timestamp`, `severity + timestamp`, `ipAddress + timestamp`, `flagged + timestamp`, `deleteAfter` (TTL)

---

## 🚀 API Endpoints (40+)

### System
- `GET /api/v1/gdprcompliance/status` - Service health

### Data Subjects
- `POST /api/v1/gdprcompliance/data-subjects` - Create data subject
- `GET /api/v1/gdprcompliance/data-subjects` - List data subjects
- `GET /api/v1/gdprcompliance/data-subjects/:id` - Get data subject

### Consent Management (Article 7)
- `POST /api/v1/gdprcompliance/consents` - Record consent
- `GET /api/v1/gdprcompliance/consents` - List consents
- `POST /api/v1/gdprcompliance/consents/:id/withdraw` - Withdraw consent (Article 7(3))

### Processing Activities (Article 30)
- `POST /api/v1/gdprcompliance/processing-activities` - Create ROPA entry
- `GET /api/v1/gdprcompliance/processing-activities` - List activities

### DSARs (Article 15-22)
- `POST /api/v1/gdprcompliance/dsars` - Submit DSAR
- `GET /api/v1/gdprcompliance/dsars` - List DSARs (query: `?overdue=true`)
- `POST /api/v1/gdprcompliance/dsars/:id/complete` - Complete DSAR (30-day SLA)

### Data Breaches (Article 33-34)
- `POST /api/v1/gdprcompliance/breaches` - Report breach
- `GET /api/v1/gdprcompliance/breaches` - List breaches (query: `?overdue72=true`)
- `POST /api/v1/gdprcompliance/breaches/:id/notify-authority` - Notify supervisory authority (72-hour compliance)

### DPIAs (Article 35)
- `POST /api/v1/gdprcompliance/dpias` - Create DPIA
- `GET /api/v1/gdprcompliance/dpias` - List DPIAs

### Legal Basis (Article 6)
- `POST /api/v1/gdprcompliance/legal-bases` - Document lawful basis

### Data Transfers (Article 44-50)
- `POST /api/v1/gdprcompliance/transfers` - Register international transfer

### Processors (Article 28)
- `POST /api/v1/gdprcompliance/processors` - Add processor
- `GET /api/v1/gdprcompliance/processors` - List processors

### Retention Schedules
- `POST /api/v1/gdprcompliance/retention-schedules` - Create retention schedule

### DPOs (Article 37-39)
- `POST /api/v1/gdprcompliance/dpos` - Register DPO
- `GET /api/v1/gdprcompliance/dpos` - List DPOs

### Audit Logs
- `POST /api/v1/gdprcompliance/audit-logs` - Create audit log
- `GET /api/v1/gdprcompliance/audit-logs` - Query logs

### ML Engine
- `POST /api/v1/gdprcompliance/analyze` - Compliance analysis
- `POST /api/v1/gdprcompliance/scan` - Data discovery

---

## 🎨 Frontend Structure

```
frontend/tools/47-gdprcompliance/
├── index.html (GDPR Compliance | Data Protection Platform)
├── package.json (name: "gdprcompliance", port: 3047)
├── vite.config.ts (ports: 3047, API: 4047, WS: 6047)
├── gdprcompliance-config.json (250 lines)
│   ├── GDPR principles (7)
│   ├── Data subject rights (7)
│   ├── Lawful basis types (6)
│   ├── Breach timelines (72-hour rule)
│   ├── DPIA requirements
│   ├── Transfer mechanisms (SCCs, adequacy, BCRs)
│   └── AI functions (10)
└── src/
```

**Key UI Features**:
- **Consent Manager**: Track consent status, validate GDPR criteria, withdrawal interface
- **DSAR Portal**: 30-day countdown timer, request workflow, identity verification
- **72-Hour Breach Timer**: Real-time countdown, supervisory authority notification, data subject notification
- **DPIA Wizard**: Risk assessment matrix, mitigation measures, supervisory consultation trigger
- **Article 30 ROPA**: Processing activity registry, lawful basis mapping, data flow diagrams
- **Retention Automation**: Deletion schedules, legal holds, compliance dashboard

---

## 🧠 ML Engine Integration

**Port 8047**

**AI Functions**:
1. **Consent Analysis**: Validate consent against GDPR criteria
2. **DPIA Automation**: Risk assessment scoring, mitigation recommendations
3. **Data Discovery**: Automated personal data mapping across systems
4. **Breach Risk Assessment**: Predict likelihood and severity
5. **DSAR Automation**: Data aggregation across systems
6. **Compliance Scoring**: Overall GDPR compliance percentage
7. **Transfer Impact Assessment**: Third-country risk evaluation
8. **Retention Optimization**: Suggest retention periods based on legal requirements
9. **Processor Risk Rating**: Assess processor compliance level
10. **Legitimate Interest Assessment**: Automated balancing test

---

## 📈 Key GDPR Features

### 72-Hour Breach Notification (Article 33)
- Auto-calculated deadline from discovery time
- Real-time countdown to 72-hour mark
- Notification tracking (supervisory authority + data subjects)
- Compliance metrics (notified within 72 hours: true/false)

### 30-Day DSAR Deadline (Article 12(3))
- Due date auto-calculated on submission
- 2-month extension option for complex requests
- Overdue tracking and alerts
- Request type routing (access, erasure, portability, etc.)

### Consent Management (Article 7)
- 5-criteria validation (freely given, specific, informed, unambiguous, clear affirmative action)
- Withdrawal mechanism requirement (Article 7(3))
- Technical evidence (IP, user agent, timestamp, geo-location)
- Granular consent options

### DPIA Triggers (Article 35(3))
- Systematic extensive evaluation (automated decision-making)
- Large-scale special category data processing
- Systematic monitoring of public areas
- Auto-assessment of DPIA requirement

### Article 30 ROPA
- Complete processing activity records
- Lawful basis per purpose
- Data flow tracking
- Processor and transfer references

### Data Transfer Mechanisms (Chapter V)
- Adequacy decision tracking (14 countries)
- Standard Contractual Clauses (2021 SCCs)
- Binding Corporate Rules (BCRs)
- Transfer Impact Assessment (TIA)
- Article 49 derogations

### Processor Management (Article 28)
- 8 required contract clauses validation
- Sub-processor authorization tracking
- Audit rights and execution
- Breach notification obligations

### Retention & Deletion
- Automated deletion schedules
- Legal hold management
- Deletion certification
- Purpose-based retention rationale

---

## 🔄 Workflow Examples

### DSAR Workflow
1. Data subject submits request (web form/email/phone)
2. System creates DSAR record with 30-day deadline
3. Identity verification (email/document/2FA)
4. Data aggregation from all systems
5. DPO review if needed
6. Response preparation (PDF/JSON/CSV format)
7. Delivery to data subject
8. Completion tracking (deadlineMet: true/false)

### Breach Notification Workflow
1. Breach discovered → record created
2. 72-hour deadline auto-calculated
3. DPO consulted
4. Risk assessment (high/medium/low)
5. Supervisory authority notification (if required)
6. Data subject notification (if high risk)
7. Containment and mitigation
8. Investigation and resolution
9. Compliance tracking (within 72 hours: yes/no)

### DPIA Workflow
1. Processing activity triggers DPIA requirement
2. DPIA team assigned (lead, members, DPO)
3. Processing description (Article 35(7)(a))
4. Necessity and proportionality assessment (Article 35(7)(b))
5. Risk identification and scoring (Article 35(7)(c))
6. Mitigation measures (Article 35(7)(d))
7. Data subject consultation (if applicable)
8. DPO opinion (Article 35(2))
9. Decision (proceed/reject/conditions)
10. If high residual risk → supervisory consultation (Article 36)

---

## 🏗️ Technical Stack

**Backend**:
- Node.js + Express
- MongoDB (gdprcompliance_db)
- Mongoose ODM
- Axios (ML engine communication)

**Frontend**:
- React 19 + TypeScript
- Vite build system
- WebSocket (port 6047)

**Database**:
- 12 collections (one per model)
- Compound indexes for performance
- TTL indexes for audit log retention
- Virtual fields for calculated values

**Ports**:
- 3047: Frontend development server
- 4047: Backend API
- 6047: WebSocket server
- 8047: ML engine

---

## 📊 Compliance Dashboard

**Key Metrics**:
- DSARs: Total, Pending, Overdue, Average Response Time
- Breaches: Total, 72-Hour Compliance Rate, Open Investigations
- Consents: Active, Withdrawn, Expiring Soon
- DPIAs: Required, In Progress, High Risk
- Processing Activities: Total, DPIA Required, Review Due
- Data Transfers: Active, High Risk, SCCs Expiring
- Processors: Active, Non-Compliant, Agreements Expiring
- Audit Logs: Security Events, Failed Actions, Anomalies

**Alerts**:
- DSARs due in < 7 days
- Breaches approaching 72-hour deadline
- Consents expiring
- DPIAs requiring supervisory consultation
- Processor agreements expiring
- Retention schedules due for review
- High-severity audit events

---

## 🎯 Domain Structure

- **Home**: `maula.ai` → Main dashboard
- **Tool**: `gdprcompliance.maula.ai` → GDPR compliance platform
- **AI Assistant**: `gdprcompliance.maula.ai/maula-ai` → GDPR AI chatbot

---

## 🔐 Special Category Data Handling

**Article 9 - Special Categories**:
- Health data
- Biometric data (unique identification)
- Genetic data
- Racial or ethnic origin
- Political opinions
- Religious or philosophical beliefs
- Trade union membership
- Sex life or sexual orientation

**Processing Requires**:
- Explicit consent (Article 9(2)(a))
- OR specific derogation (employment, vital interests, legal claims, public health, etc.)
- Enhanced security measures
- DPIA likely required

---

## 📝 Article References

- **Article 5**: GDPR principles (lawfulness, purpose limitation, data minimization, accuracy, storage limitation, integrity, accountability)
- **Article 6**: Lawful basis for processing
- **Article 7**: Conditions for consent
- **Article 9**: Special category data
- **Article 12(3)**: 30-day DSAR deadline (2-month extension)
- **Article 15-22**: Data subject rights
- **Article 28**: Processor requirements
- **Article 30**: Records of processing activities
- **Article 33**: 72-hour breach notification to supervisory authority
- **Article 34**: Breach notification to data subjects
- **Article 35**: Data Protection Impact Assessment
- **Article 36**: Prior consultation with supervisory authority
- **Article 37-39**: Data Protection Officer
- **Article 44-50**: International data transfers

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Python 3.9+ (ML engine)

### Installation

```bash
# Backend
cd backend/tools/47-gdprcompliance/api
npm install
cp .env.example .env
# Edit .env: MONGODB_URI, ML_ENGINE_URL
npm start # Port 4047

# Frontend
cd frontend/tools/47-gdprcompliance
npm install
npm run dev # Port 3047

# ML Engine
cd backend/tools/47-gdprcompliance/ml-engine
pip install -r requirements.txt
python app.py # Port 8047
```

### Environment Variables

```env
PORT=4047
MONGODB_URI=mongodb://localhost:27017/gdprcompliance_db
ML_ENGINE_URL=http://localhost:8047
NODE_ENV=development
```

---

## 📚 Additional Resources

- **GDPR Full Text**: https://gdpr-info.eu/
- **EDPB Guidelines**: https://edpb.europa.eu/our-work-tools/general-guidance/guidelines-recommendations-best-practices_en
- **Standard Contractual Clauses (2021)**: https://ec.europa.eu/info/law/law-topic/data-protection/international-dimension-data-protection/standard-contractual-clauses-scc_en
- **Adequacy Decisions**: https://ec.europa.eu/info/law/law-topic/data-protection/international-dimension-data-protection/adequacy-decisions_en

---

**Tool #47 Status**: ✅ Complete (Backend + Frontend + Database + ML)  
**Next Tool**: #46 or as directed  
**Branch**: `tool47-gdprcompliance-implementation`  
**Ready to Merge**: Pending final review
