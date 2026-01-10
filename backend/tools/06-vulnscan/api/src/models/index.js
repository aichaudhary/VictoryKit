/**
 * VulnScan Models Index
 * Export all vulnerability scanning models
 */

const Asset = require('./Asset');
const Vulnerability = require('./Vulnerability');
const Scan = require('./Scan');
const ScanSchedule = require('./ScanSchedule');
const Patch = require('./Patch');
const RuntimeGuard = require('./RuntimeGuard');
const RemediationPlan = require('./RemediationPlan');
const VulnReport = require('./VulnReport');

module.exports = {
  Asset,
  Vulnerability,
  Scan,
  ScanSchedule,
  Patch,
  RuntimeGuard,
  RemediationPlan,
  VulnReport
};
