// SupplyChainAI Types

export interface Backup {
  _id: string;
  backupId: string;
  name: string;
  type: 'full' | 'incremental' | 'differential' | 'synthetic' | 'mirror' | 'snapshot';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused' | 'verifying';
  source: {
    type: 'database' | 'file_system' | 'application' | 'vm' | 'container' | 'cloud' | 'saas';
    path: string;
    hostname: string;
  };
  target?: StorageLocation;
  schedule?: {
    enabled: boolean;
    type: 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly';
    cronExpression?: string;
    nextRun?: Date;
  };
  execution?: {
    startTime?: Date;
    endTime?: Date;
    duration?: number;
    bytesProcessed?: number;
    bytesTransferred?: number;
    filesProcessed?: number;
    errors?: number;
    progress?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface StorageLocation {
  _id: string;
  name: string;
  type: 's3' | 'azure_blob' | 'gcs' | 'nfs' | 'smb' | 'sftp' | 'local' | 'tape';
  status: 'active' | 'inactive' | 'maintenance' | 'error' | 'full';
  endpoint?: string;
  region?: string;
  capacity?: {
    totalBytes: number;
    usedBytes: number;
    availableBytes: number;
  };
  connectivity?: {
    isConnected: boolean;
    lastCheck: Date;
    latencyMs?: number;
  };
  createdAt: Date;
}

export interface IntegrityCheck {
  _id: string;
  backup: string | Backup;
  backupId: string;
  type: 'checksum' | 'restore_test' | 'metadata' | 'encryption' | 'corruption_scan';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'partial' | 'skipped';
  result?: {
    isValid: boolean;
    errorCount: number;
    warningCount: number;
    details?: string[];
  };
  createdAt: Date;
  completedAt?: Date;
}

export interface RetentionPolicy {
  _id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'testing';
  priority: number;
  retention: {
    daily: { count: number; enabled: boolean };
    weekly: { count: number; enabled: boolean; dayOfWeek?: number };
    monthly: { count: number; enabled: boolean; dayOfMonth?: number };
    yearly: { count: number; enabled: boolean; monthOfYear?: number };
  };
  compliance?: {
    framework?: string;
    minimumRetention?: number;
    legalHold?: boolean;
  };
  createdAt: Date;
}

export interface Alert {
  _id: string;
  alertId: string;
  type: 'backup_failure' | 'storage_full' | 'integrity_failed' | 'ransomware_detected' | 'policy_violation' | 'unauthorized_access' | 'connection_lost' | 'schedule_missed';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  status: 'new' | 'acknowledged' | 'resolved' | 'dismissed';
  title: string;
  message: string;
  backup?: string | Backup;
  storageLocation?: string | StorageLocation;
  read: boolean;
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}

export interface AccessLog {
  _id: string;
  action: string;
  result: 'success' | 'failure' | 'partial' | 'blocked';
  user?: {
    userId: string;
    email?: string;
    name?: string;
  };
  resource?: {
    type: string;
    id: string;
    name?: string;
  };
  timestamp: Date;
  riskScore?: number;
  suspicious?: boolean;
}

export interface DashboardStats {
  overview: {
    totalBackups: number;
    completedBackups: number;
    failedBackups: number;
    runningBackups: number;
    successRate: number;
    totalStorageUsed: number;
    pendingAlerts: number;
    criticalAlerts: number;
  };
  storageLocations: StorageLocation[];
  recentBackups: Backup[];
  timestamp: Date;
}

export type Tab = 'dashboard' | 'backups' | 'storage' | 'policies' | 'alerts' | 'logs' | 'settings';

export type WorkspaceMode = 'monitoring' | 'configuration' | 'analysis';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  provider?: string;
}

export interface SettingsState {
  autoBackup: boolean;
  integrityCheckInterval: number;
  alertThreshold: number;
  retentionDefault: number;
  encryptionEnabled: boolean;
  compressionEnabled: boolean;
  selectedProvider: string;
}
