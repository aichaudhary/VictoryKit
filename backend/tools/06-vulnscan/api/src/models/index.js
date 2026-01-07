/**
 * VulnScan Models Index
 * Export all vulnerability scanning models
 */

const Asset = require('./Asset');
const Vulnerability = require('./Vulnerability');
const Scan = require('./Scan');
const ScanSchedule = require('./ScanSchedule');
const Patch = require('./Patch');
const ComplianceCheck = require('./ComplianceCheck');
const RemediationPlan = require('./RemediationPlan');
const VulnReport = require('./VulnReport');

module.exports = {
  Asset,
  Vulnerability,
  Scan,
  ScanSchedule,
  Patch,
  ComplianceCheck,
  RemediationPlan,
  VulnReport
};
