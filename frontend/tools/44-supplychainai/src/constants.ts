// SupplyChainAI Constants

import { SettingsState, Tab } from './types';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://bguard.maula.ai/api';

export const NAV_ITEMS: { label: string; icon: string; tab: Tab; description: string }[] = [
  { label: 'Dashboard', icon: 'LayoutDashboard', tab: 'dashboard', description: 'Overview & stats' },
  { label: 'Backups', icon: 'HardDrive', tab: 'backups', description: 'Manage backups' },
  { label: 'Storage', icon: 'Database', tab: 'storage', description: 'Storage locations' },
  { label: 'Policies', icon: 'FileCheck', tab: 'policies', description: 'Retention policies' },
  { label: 'Alerts', icon: 'Bell', tab: 'alerts', description: 'Security alerts' },
  { label: 'Logs', icon: 'ScrollText', tab: 'logs', description: 'Access logs' },
  { label: 'Settings', icon: 'Settings', tab: 'settings', description: 'Configuration' },
];

export const DEFAULT_SETTINGS: SettingsState = {
  autoBackup: true,
  integrityCheckInterval: 24,
  alertThreshold: 0.8,
  retentionDefault: 30,
  encryptionEnabled: true,
  compressionEnabled: true,
  selectedProvider: 'openai',
};

export const BACKUP_TYPES = [
  { value: 'full', label: 'Full Backup', description: 'Complete copy of all data' },
  { value: 'incremental', label: 'Incremental', description: 'Only changes since last backup' },
  { value: 'differential', label: 'Differential', description: 'Changes since last full backup' },
  { value: 'snapshot', label: 'Snapshot', description: 'Point-in-time copy' },
  { value: 'mirror', label: 'Mirror', description: 'Exact replica with no compression' },
];

export const STORAGE_TYPES = [
  { value: 's3', label: 'Amazon S3', icon: 'aws' },
  { value: 'azure_blob', label: 'Azure Blob Storage', icon: 'azure' },
  { value: 'gcs', label: 'Google Cloud Storage', icon: 'gcp' },
  { value: 'nfs', label: 'NFS Mount', icon: 'server' },
  { value: 'smb', label: 'SMB/CIFS Share', icon: 'server' },
  { value: 'sftp', label: 'SFTP Server', icon: 'server' },
  { value: 'local', label: 'Local Disk', icon: 'harddrive' },
];

export const SEVERITY_COLORS = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
  info: 'bg-gray-500',
};

export const STATUS_COLORS = {
  completed: 'bg-green-500',
  running: 'bg-blue-500',
  pending: 'bg-yellow-500',
  failed: 'bg-red-500',
  cancelled: 'bg-gray-500',
  paused: 'bg-orange-500',
  verifying: 'bg-purple-500',
};

export const PROVIDER_CONFIG = {
  openai: { name: 'OpenAI', model: 'gpt-4o', endpoint: '/ai/openai' },
  anthropic: { name: 'Anthropic', model: 'claude-3-5-sonnet', endpoint: '/ai/anthropic' },
  gemini: { name: 'Google Gemini', model: 'gemini-2.0-flash', endpoint: '/ai/gemini' },
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};
