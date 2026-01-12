/**
 * Models Index
 * Export all FraudGuard models
 */

// Core models
export { Transaction, ITransaction } from './Transaction.js';
export { FraudScore, IFraudScore } from './FraudScore.js';
export { Alert, IAlert } from './Alert.js';

// Scanner models
export { ScanResult, IScanResult, IThreat } from './ScanResult.js';
export { ThreatIntel, IThreatIntel } from './ThreatIntel.js';

// Auth models
export { User, IUser } from './User.js';
export { APIKey, IAPIKey } from './APIKey.js';

// System models
export { AuditLog, IAuditLog, AuditAction, ResourceType } from './AuditLog.js';
export { RateLimit, IRateLimit } from './RateLimit.js';

// Export model names for reference
export const ModelNames = {
  Transaction: 'Transaction',
  FraudScore: 'FraudScore',
  Alert: 'Alert',
  ScanResult: 'ScanResult',
  ThreatIntel: 'ThreatIntel',
  User: 'User',
  APIKey: 'APIKey',
  AuditLog: 'AuditLog',
  RateLimit: 'RateLimit',
} as const;

// Collection names
export const CollectionNames = {
  transactions: 'transactions',
  fraud_scores: 'fraud_scores',
  alerts: 'alerts',
  scan_results: 'scan_results',
  threat_intel: 'threat_intel',
  users: 'users',
  api_keys: 'api_keys',
  audit_logs: 'audit_logs',
  rate_limits: 'rate_limits',
} as const;
