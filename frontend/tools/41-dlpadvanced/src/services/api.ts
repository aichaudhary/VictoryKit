/**
 * DLPAdvanced API Service
 * Handles all API calls to backend (port 4041) and ML engine (port 8041)
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4041/api/v1/dlp';
const ML_BASE_URL = import.meta.env.VITE_ML_URL || 'http://localhost:8041';

// Create axios instances
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const mlClient = axios.create({
  baseURL: ML_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// DASHBOARD
// ============================================================================

export const getDashboardMetrics = async () => {
  const response = await apiClient.get('/dashboard');
  return response.data;
};

// ============================================================================
// POLICIES
// ============================================================================

export const getPolicies = async (params?: any) => {
  const response = await apiClient.get('/policies', { params });
  return response.data;
};

export const getPolicyById = async (id: string) => {
  const response = await apiClient.get(`/policies/${id}`);
  return response.data;
};

export const createPolicy = async (policy: any) => {
  const response = await apiClient.post('/policies', policy);
  return response.data;
};

export const updatePolicy = async (id: string, policy: any) => {
  const response = await apiClient.put(`/policies/${id}`, policy);
  return response.data;
};

export const deletePolicy = async (id: string) => {
  const response = await apiClient.delete(`/policies/${id}`);
  return response.data;
};

export const testPolicy = async (id: string, input: string) => {
  const response = await apiClient.post(`/policies/${id}/test`, { input });
  return response.data;
};

export const getPolicyTemplates = async () => {
  const response = await apiClient.get('/policies/templates');
  return response.data;
};

// ============================================================================
// INCIDENTS
// ============================================================================

export const getIncidents = async (params?: any) => {
  const response = await apiClient.get('/incidents', { params });
  return response.data;
};

export const getIncidentById = async (id: string) => {
  const response = await apiClient.get(`/incidents/${id}`);
  return response.data;
};

export const respondToIncident = async (id: string, action: any) => {
  const response = await apiClient.post(`/incidents/${id}/respond`, action);
  return response.data;
};

export const resolveIncident = async (id: string, resolution: any) => {
  const response = await apiClient.post(`/incidents/${id}/resolve`, resolution);
  return response.data;
};

export const getIncidentStatistics = async (params?: any) => {
  const response = await apiClient.get('/incidents/statistics', { params });
  return response.data;
};

// ============================================================================
// DATA DISCOVERY & CLASSIFICATION
// ============================================================================

export const startScan = async (scanConfig: any) => {
  const response = await apiClient.post('/scan/start', scanConfig);
  return response.data;
};

export const getScanStatus = async (scanId: string) => {
  const response = await apiClient.get(`/scan/status/${scanId}`);
  return response.data;
};

export const getScanResults = async (scanId: string) => {
  const response = await apiClient.get(`/scan/results/${scanId}`);
  return response.data;
};

export const classifyData = async (data: any) => {
  const response = await apiClient.post('/classify', data);
  return response.data;
};

export const getDataInventory = async (params?: any) => {
  const response = await apiClient.get('/inventory', { params });
  return response.data;
};

// ============================================================================
// USER RISK
// ============================================================================

export const getUsers = async (params?: any) => {
  const response = await apiClient.get('/users', { params });
  return response.data;
};

export const getUserRisk = async (userId: string) => {
  const response = await apiClient.get(`/users/${userId}/risk`);
  return response.data;
};

export const getUserActivity = async (userId: string) => {
  const response = await apiClient.get(`/users/${userId}/activity`);
  return response.data;
};

export const overrideUserRisk = async (userId: string, action: any) => {
  const response = await apiClient.post(`/users/${userId}/risk-override`, action);
  return response.data;
};

// ============================================================================
// COMPLIANCE
// ============================================================================

export const getComplianceStatus = async () => {
  const response = await apiClient.get('/compliance/status');
  return response.data;
};

export const generateComplianceReport = async (report: any) => {
  const response = await apiClient.post('/compliance/report', report);
  return response.data;
};

export const getComplianceByFramework = async (framework: string) => {
  const response = await apiClient.get(`/compliance/${framework}`);
  return response.data;
};

export const handleDataSubjectRequest = async (request: any) => {
  const response = await apiClient.post('/compliance/data-subject-request', request);
  return response.data;
};

// ============================================================================
// MONITORING
// ============================================================================

export const getLiveMonitoring = async (params?: any) => {
  const response = await apiClient.get('/monitoring/live', { params });
  return response.data;
};

export const getChannelStatus = async () => {
  const response = await apiClient.get('/monitoring/channels');
  return response.data;
};

export const blockTransfer = async (data: any) => {
  const response = await apiClient.post('/monitoring/block', data);
  return response.data;
};

export const getDataFlows = async () => {
  const response = await apiClient.get('/monitoring/flows');
  return response.data;
};

// ============================================================================
// REPORTS
// ============================================================================

export const generateReport = async (reportConfig: any) => {
  const response = await apiClient.post('/reports/generate', reportConfig);
  return response.data;
};

export const getReport = async (id: string) => {
  const response = await apiClient.get(`/reports/${id}`);
  return response.data;
};

export const getReportTemplates = async () => {
  const response = await apiClient.get('/reports/templates');
  return response.data;
};

// ============================================================================
// ML ENGINE
// ============================================================================

export const classifyContent = async (content: string, metadata?: any) => {
  const response = await mlClient.post('/classify', { content, metadata });
  return response.data;
};

export const detectPII = async (content: string, detectTypes?: string[]) => {
  const response = await mlClient.post('/detect-pii', { content, detect_types: detectTypes });
  return response.data;
};

export const detectAnomaly = async (userId: string, activity: any) => {
  const response = await mlClient.post('/detect-anomaly', { user_id: userId, activity });
  return response.data;
};

export const calculateSimilarity = async (content1: string, content2: string) => {
  const response = await mlClient.post('/similarity', { content1, content2 });
  return response.data;
};

export const matchPolicy = async (content: string, patterns: string[]) => {
  const response = await mlClient.post('/match-policy', { content, policy_patterns: patterns });
  return response.data;
};

export const analyzeFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await mlClient.post('/analyze-file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const mlHealthCheck = async () => {
  const response = await mlClient.get('/health');
  return response.data;
};

export default {
  // Dashboard
  getDashboardMetrics,
  
  // Policies
  getPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  deletePolicy,
  testPolicy,
  getPolicyTemplates,
  
  // Incidents
  getIncidents,
  getIncidentById,
  respondToIncident,
  resolveIncident,
  getIncidentStatistics,
  
  // Data Discovery
  startScan,
  getScanStatus,
  getScanResults,
  classifyData,
  getDataInventory,
  
  // User Risk
  getUsers,
  getUserRisk,
  getUserActivity,
  overrideUserRisk,
  
  // Compliance
  getComplianceStatus,
  generateComplianceReport,
  getComplianceByFramework,
  handleDataSubjectRequest,
  
  // Monitoring
  getLiveMonitoring,
  getChannelStatus,
  blockTransfer,
  getDataFlows,
  
  // Reports
  generateReport,
  getReport,
  getReportTemplates,
  
  // ML Engine
  classifyContent,
  detectPII,
  detectAnomaly,
  calculateSimilarity,
  matchPolicy,
  analyzeFile,
  mlHealthCheck,
};
