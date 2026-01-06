import axios from 'axios';
import type {
  Certificate,
  Domain,
  Alert,
  ScanResult,
  AnalyticsData,
  ComplianceReport,
  SystemStatus,
  ScanConfig,
  APIResponse,
  PaginatedResponse,
  CertificateFormData,
  DomainFormData,
  AlertSettingsFormData
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4025/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sslmonitor_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sslmonitor_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Certificate API
export const certificateAPI = {
  getAll: (params?: { page?: number; limit?: number; status?: string; domain?: string }) =>
    api.get<PaginatedResponse<Certificate>>('/certificates', { params }),

  getById: (id: string) =>
    api.get<APIResponse<Certificate>>(`/certificates/${id}`),

  getExpiring: (days: number = 30) =>
    api.get<APIResponse<Certificate[]>>(`/certificates/expiring?days=${days}`),

  scan: (domain: string, options?: { port?: number; includeChain?: boolean }) =>
    api.post<APIResponse<ScanResult>>('/certificates/scan', { domain, ...options }),

  check: (certificateId: string) =>
    api.post<APIResponse<Certificate>>(`/certificates/check`, { certificateId }),

  create: (data: CertificateFormData) =>
    api.post<APIResponse<Certificate>>('/certificates', data),

  update: (id: string, data: Partial<Certificate>) =>
    api.put<APIResponse<Certificate>>(`/certificates/${id}`, data),

  delete: (id: string) =>
    api.delete<APIResponse<void>>(`/certificates/${id}`),

  getAnalytics: (period: string = '30d') =>
    api.get<APIResponse<AnalyticsData>>(`/certificates/analytics?period=${period}`),
};

// Domain API
export const domainAPI = {
  getAll: (params?: { page?: number; limit?: number; type?: string; status?: string }) =>
    api.get<PaginatedResponse<Domain>>('/domains', { params }),

  getById: (id: string) =>
    api.get<APIResponse<Domain>>(`/domains/${id}`),

  create: (data: DomainFormData) =>
    api.post<APIResponse<Domain>>('/domains', data),

  update: (id: string, data: Partial<Domain>) =>
    api.put<APIResponse<Domain>>(`/domains/${id}`, data),

  delete: (id: string) =>
    api.delete<APIResponse<void>>(`/domains/${id}`),

  scan: (id: string) =>
    api.post<APIResponse<ScanResult>>(`/domains/${id}/scan`),

  bulkScan: (domainIds: string[]) =>
    api.post<APIResponse<ScanResult[]>>('/domains/bulk-scan', { domainIds }),

  getCertificates: (id: string) =>
    api.get<APIResponse<Certificate[]>>(`/domains/${id}/certificates`),
};

// Alert API
export const alertAPI = {
  getAll: (params?: { page?: number; limit?: number; status?: string; severity?: string; acknowledged?: boolean }) =>
    api.get<APIResponse<Alert[] & { pagination: any }>>('/alerts', { params }),

  getById: (id: string) =>
    api.get<APIResponse<Alert>>(`/alerts/${id}`),

  acknowledge: (id: string) =>
    api.put<APIResponse<Alert>>(`/alerts/${id}/acknowledge`, {}),

  bulkAcknowledge: (alertIds: string[]) =>
    api.put<APIResponse<Alert[]>>('/alerts/bulk-acknowledge', { alertIds }),

  resolve: (id: string) =>
    api.put<APIResponse<Alert>>(`/alerts/${id}/resolve`, {}),

  getSettings: () =>
    api.get<APIResponse<AlertSettingsFormData>>('/alerts/settings'),

  updateSettings: (settings: AlertSettingsFormData) =>
    api.post<APIResponse<void>>('/alerts/settings', settings),

  getStats: () =>
    api.get<APIResponse<{ total: number; acknowledged: number; resolved: number; bySeverity: Record<string, number> }>>('/alerts/stats'),
};

// Analytics API
export const analyticsAPI = {
  getOverview: (period: string = '30d') =>
    api.get<APIResponse<AnalyticsData>>(`/analytics/overview?period=${period}`),

  getExpirationStats: (period: string = '90d') =>
    api.get<APIResponse<any>>(`/analytics/expiration?period=${period}`),

  getIssueStats: (period: string = '30d') =>
    api.get<APIResponse<any>>(`/analytics/issues?period=${period}`),

  getDashboard: () =>
    api.get<APIResponse<any>>('/analytics/dashboard'),

  getComplianceReport: (standard: string, period: string = '30d') =>
    api.get<APIResponse<ComplianceReport>>(`/analytics/compliance/${standard}?period=${period}`),

  getGradeDistribution: () =>
    api.get<APIResponse<Record<string, number>>>('/analytics/grades'),

  getIssuerStats: () =>
    api.get<APIResponse<Array<{ issuer: string; count: number }>>>('/analytics/issuers'),
};

// Scan API
export const scanAPI = {
  startScan: (domain: string, options?: { deep?: boolean; includeSubdomains?: boolean }) =>
    api.post<APIResponse<ScanResult>>('/scans', { domain, ...options }),

  getScanResults: (scanId: string) =>
    api.get<APIResponse<ScanResult>>(`/scans/${scanId}`),

  getScanHistory: (params?: { page?: number; limit?: number; domain?: string; status?: string }) =>
    api.get<PaginatedResponse<ScanResult>>('/scans', { params }),

  cancelScan: (scanId: string) =>
    api.put<APIResponse<void>>(`/scans/${scanId}/cancel`, {}),

  getScanConfig: () =>
    api.get<APIResponse<ScanConfig>>('/scans/config'),

  updateScanConfig: (config: ScanConfig) =>
    api.put<APIResponse<void>>('/scans/config', config),
};

// System API
export const systemAPI = {
  getStatus: () =>
    api.get<APIResponse<SystemStatus>>('/system/status'),

  getHealth: () =>
    api.get<APIResponse<any>>('/system/health'),

  getLogs: (params?: { level?: string; limit?: number; startDate?: string; endDate?: string }) =>
    api.get<APIResponse<any[]>>('/system/logs', { params }),

  clearCache: () =>
    api.post<APIResponse<void>>('/system/cache/clear', {}),

  restartService: () =>
    api.post<APIResponse<void>>('/system/restart', {}),

  getMetrics: () =>
    api.get<APIResponse<any>>('/system/metrics'),
};

// Compliance API
export const complianceAPI = {
  getReport: (standard: string, period: string = '30d') =>
    api.get<APIResponse<ComplianceReport>>(`/compliance/${standard}?period=${period}`),

  generateReport: (standard: string, period: { start: Date; end: Date }) =>
    api.post<APIResponse<ComplianceReport>>(`/compliance/${standard}/generate`, { period }),

  getStandards: () =>
    api.get<APIResponse<string[]>>('/compliance/standards'),

  getRequirements: (standard: string) =>
    api.get<APIResponse<any[]>>(`/compliance/${standard}/requirements`),

  checkCompliance: (certificateId: string, standard: string) =>
    api.post<APIResponse<any>>(`/compliance/check`, { certificateId, standard }),
};

// Export all APIs
export default {
  certificateAPI,
  domainAPI,
  alertAPI,
  analyticsAPI,
  scanAPI,
  systemAPI,
  complianceAPI,
};