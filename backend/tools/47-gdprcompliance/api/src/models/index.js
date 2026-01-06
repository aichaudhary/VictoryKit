// GDPR Compliance - MongoDB Models
// 12 comprehensive models for EU GDPR compliance management

const DataSubject = require('./DataSubject');
const ConsentRecord = require('./ConsentRecord');
const ProcessingActivity = require('./ProcessingActivity');
const DSAR = require('./DSAR');
const DataBreach = require('./DataBreach');
const DPIAAssessment = require('./DPIAAssessment');
const LegalBasis = require('./LegalBasis');
const DataTransfer = require('./DataTransfer');
const Processor = require('./Processor');
const RetentionSchedule = require('./RetentionSchedule');
const DPO = require('./DPO');
const AuditLog = require('./AuditLog');

module.exports = {
  DataSubject,
  ConsentRecord,
  ProcessingActivity,
  DSAR,
  DataBreach,
  DPIAAssessment,
  LegalBasis,
  DataTransfer,
  Processor,
  RetentionSchedule,
  DPO,
  AuditLog
};
