/**
 * SupplyChainAI MongoDB Models
 * 
 * This module exports all MongoDB models for the SupplyChainAI platform.
 * 
 * Models:
 * - Backup: Backup job management, scheduling, and execution
 * - StorageLocation: Cloud and on-premise backup storage targets
 * - IntegrityCheck: Backup integrity verification and validation
 * - RetentionPolicy: Backup lifecycle and compliance rules
 * - Alert: Real-time backup security alerts
 * - AccessLog: Backup access audit trail
 */

const Backup = require('./Backup');
const StorageLocation = require('./StorageLocation');
const IntegrityCheck = require('./IntegrityCheck');
const RetentionPolicy = require('./RetentionPolicy');
const Alert = require('./Alert');
const AccessLog = require('./AccessLog');

module.exports = {
  Backup,
  StorageLocation,
  IntegrityCheck,
  RetentionPolicy,
  Alert,
  AccessLog
};
