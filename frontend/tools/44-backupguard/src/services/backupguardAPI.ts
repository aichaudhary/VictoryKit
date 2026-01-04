import axios from 'axios';
import { Backup, StorageLocation, IntegrityCheck, RetentionPolicy, Alert, AccessLog, DashboardStats } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'https://bguard.maula.ai/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor for auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const backupguardAPI = {
  // Health & Dashboard
  health: {
    getStatus: () => api.get('/status'),
    getHealth: () => api.get('/health'),
    getDashboard: () => api.get<DashboardStats>('/dashboard'),
  },

  // Backups
  backups: {
    getAll: (params?: { status?: string; type?: string; limit?: number }) =>
      api.get<{ backups: Backup[]; total: number }>('/backups', { params }),
    getById: (id: string) => api.get<Backup>(`/backups/${id}`),
    create: (data: Partial<Backup>) => api.post<Backup>('/backups', data),
    update: (id: string, data: Partial<Backup>) => api.put<Backup>(`/backups/${id}`, data),
    delete: (id: string) => api.delete(`/backups/${id}`),
    start: (id: string) => api.post(`/backups/${id}/start`),
    cancel: (id: string) => api.post(`/backups/${id}/cancel`),
    getProgress: (id: string) => api.get(`/backups/${id}/progress`),
    verify: (id: string) => api.post(`/backups/${id}/verify`),
    restore: (id: string, options?: object) => api.post(`/backups/${id}/restore`, options),
  },

  // Storage Locations
  storage: {
    getAll: (params?: { status?: string; type?: string }) =>
      api.get<{ storageLocations: StorageLocation[] }>('/storage', { params }),
    getById: (id: string) => api.get<StorageLocation>(`/storage/${id}`),
    create: (data: Partial<StorageLocation>) => api.post<StorageLocation>('/storage', data),
    update: (id: string, data: Partial<StorageLocation>) => api.put<StorageLocation>(`/storage/${id}`, data),
    delete: (id: string) => api.delete(`/storage/${id}`),
    testConnection: (id: string) => api.post(`/storage/${id}/test`),
    getCapacity: (id: string) => api.get(`/storage/${id}/capacity`),
  },

  // Integrity Checks
  integrity: {
    getAll: (params?: { status?: string; backup?: string }) =>
      api.get<{ integrityChecks: IntegrityCheck[] }>('/integrity', { params }),
    getById: (id: string) => api.get<IntegrityCheck>(`/integrity/${id}`),
    create: (data: Partial<IntegrityCheck>) => api.post<IntegrityCheck>('/integrity', data),
  },

  // Retention Policies
  policies: {
    getAll: (params?: { status?: string }) =>
      api.get<{ policies: RetentionPolicy[] }>('/policies', { params }),
    getById: (id: string) => api.get<RetentionPolicy>(`/policies/${id}`),
    create: (data: Partial<RetentionPolicy>) => api.post<RetentionPolicy>('/policies', data),
    update: (id: string, data: Partial<RetentionPolicy>) => api.put<RetentionPolicy>(`/policies/${id}`, data),
    delete: (id: string) => api.delete(`/policies/${id}`),
    apply: (id: string) => api.post(`/policies/${id}/apply`),
  },

  // Alerts
  alerts: {
    getAll: (params?: { status?: string; severity?: string; limit?: number }) =>
      api.get<{ alerts: Alert[] }>('/alerts', { params }),
    getCount: () => api.get<{ total: number; unread: number; critical: number }>('/alerts/count'),
    getById: (id: string) => api.get<Alert>(`/alerts/${id}`),
    acknowledge: (id: string) => api.post(`/alerts/${id}/acknowledge`),
    resolve: (id: string, actionTaken?: string) => api.post(`/alerts/${id}/resolve`, { actionTaken }),
    dismiss: (id: string) => api.post(`/alerts/${id}/dismiss`),
  },

  // Access Logs
  logs: {
    getAll: (params?: { action?: string; limit?: number }) =>
      api.get<{ logs: AccessLog[] }>('/logs', { params }),
    getActivitySummary: (days?: number) => api.get('/logs/activity', { params: { days } }),
    getSuspiciousActivity: (days?: number) => api.get('/logs/suspicious', { params: { days } }),
  },

  // Reports
  reports: {
    getAll: () => api.get('/reports'),
    generate: (type: string, params?: object) => api.post('/reports/generate', { type, ...params }),
    getById: (id: string) => api.get(`/reports/${id}`),
  },

  // Configuration
  config: {
    get: () => api.get('/config'),
    update: (config: object) => api.put('/config', config),
  },

  // AI Analysis
  ai: {
    analyze: (data: object) => api.post('/analyze', { data }),
    scan: (target: string) => api.post('/scan', { target }),
  },
};

export default backupguardAPI;
