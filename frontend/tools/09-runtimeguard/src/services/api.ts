import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4009/api/v1';
const ML_ENGINE_URL = import.meta.env.VITE_ML_URL || 'http://localhost:8009';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface Framework {
  id: string;
  name: string;
  shortName: string;
  version: string;
  controlCount: number;
  status: 'active' | 'inactive' | 'draft';
}

export interface Assessment {
  id: string;
  frameworkId: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'failed';
  score: number;
  progress: number;
  startedAt: string;
  completedAt?: string;
  gaps: number;
}

export interface Control {
  id: string;
  frameworkId: string;
  controlId: string;
  title: string;
  description: string;
  category: string;
  status: 'compliant' | 'non-compliant' | 'partially-compliant' | 'not-applicable';
  evidence?: string[];
}

export interface Gap {
  id: string;
  controlId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  remediation: string;
  dueDate: string;
  assignee?: string;
  status: 'open' | 'in-progress' | 'resolved';
}

export interface DashboardStats {
  overallScore: number;
  totalControls: number;
  compliantControls: number;
  activeFrameworks: number;
}

// API Functions

// Dashboard
export const dashboard = {
  getStats: (): Promise<AxiosResponse<DashboardStats>> =>
    apiClient.get('/compliance/dashboard/stats'),
  
  getRecentAssessments: (limit: number = 10): Promise<AxiosResponse<Assessment[]>> =>
    apiClient.get(`/compliance/dashboard/recent?limit=${limit}`),
  
  getComplianceTrends: (days: number = 30): Promise<AxiosResponse<any>> =>
    apiClient.get(`/compliance/dashboard/trends?days=${days}`),
};

// Frameworks
export const frameworks = {
  list: (): Promise<AxiosResponse<Framework[]>> =>
    apiClient.get('/compliance/frameworks'),
  
  get: (id: string): Promise<AxiosResponse<Framework>> =>
    apiClient.get(`/compliance/frameworks/${id}`),
  
  getControls: (id: string): Promise<AxiosResponse<Control[]>> =>
    apiClient.get(`/compliance/frameworks/${id}/controls`),
  
  activate: (id: string): Promise<AxiosResponse<Framework>> =>
    apiClient.post(`/compliance/frameworks/${id}/activate`),
};

// Assessments
export const assessments = {
  list: (params?: { frameworkId?: string; status?: string }): Promise<AxiosResponse<Assessment[]>> =>
    apiClient.get('/compliance/assessments', { params }),
  
  get: (id: string): Promise<AxiosResponse<Assessment>> =>
    apiClient.get(`/compliance/assessments/${id}`),
  
  start: (data: { frameworkId: string; options?: object }): Promise<AxiosResponse<Assessment>> =>
    apiClient.post('/compliance/assessments', data),
  
  schedule: (data: { frameworkId: string; scheduledDate: string }): Promise<AxiosResponse<Assessment>> =>
    apiClient.post('/compliance/assessments/schedule', data),
  
  getResults: (id: string): Promise<AxiosResponse<any>> =>
    apiClient.get(`/compliance/assessments/${id}/results`),
};

// Controls
export const controls = {
  list: (params?: { frameworkId?: string; status?: string }): Promise<AxiosResponse<Control[]>> =>
    apiClient.get('/compliance/controls', { params }),
  
  get: (id: string): Promise<AxiosResponse<Control>> =>
    apiClient.get(`/compliance/controls/${id}`),
  
  updateStatus: (id: string, status: string, evidence?: string[]): Promise<AxiosResponse<Control>> =>
    apiClient.patch(`/compliance/controls/${id}`, { status, evidence }),
  
  addEvidence: (id: string, evidence: File): Promise<AxiosResponse<Control>> => {
    const formData = new FormData();
    formData.append('evidence', evidence);
    return apiClient.post(`/compliance/controls/${id}/evidence`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Gaps
export const gaps = {
  list: (params?: { severity?: string; status?: string }): Promise<AxiosResponse<Gap[]>> =>
    apiClient.get('/compliance/gaps', { params }),
  
  get: (id: string): Promise<AxiosResponse<Gap>> =>
    apiClient.get(`/compliance/gaps/${id}`),
  
  update: (id: string, data: Partial<Gap>): Promise<AxiosResponse<Gap>> =>
    apiClient.patch(`/compliance/gaps/${id}`, data),
  
  resolve: (id: string, resolution: string): Promise<AxiosResponse<Gap>> =>
    apiClient.post(`/compliance/gaps/${id}/resolve`, { resolution }),
};

// Reports
export const reports = {
  generate: (assessmentId: string, format: 'pdf' | 'xlsx' | 'json' = 'pdf'): Promise<AxiosResponse<Blob>> =>
    apiClient.get(`/compliance/reports/${assessmentId}?format=${format}`, { responseType: 'blob' }),
  
  getExecutiveSummary: (frameworkId: string): Promise<AxiosResponse<any>> =>
    apiClient.get(`/compliance/reports/executive/${frameworkId}`),
  
  getHistory: (): Promise<AxiosResponse<any[]>> =>
    apiClient.get('/compliance/reports'),
};

// Policies
export const policies = {
  list: (): Promise<AxiosResponse<any[]>> =>
    apiClient.get('/compliance/policies'),
  
  get: (id: string): Promise<AxiosResponse<any>> =>
    apiClient.get(`/compliance/policies/${id}`),
  
  create: (data: object): Promise<AxiosResponse<any>> =>
    apiClient.post('/compliance/policies', data),
  
  update: (id: string, data: object): Promise<AxiosResponse<any>> =>
    apiClient.patch(`/compliance/policies/${id}`, data),
};

// ML Engine
export const ml = {
  analyzeGap: (controlId: string): Promise<AxiosResponse<any>> =>
    axios.post(`${ML_ENGINE_URL}/analyze-gap`, { controlId }),
  
  suggestRemediation: (gapId: string): Promise<AxiosResponse<any>> =>
    axios.post(`${ML_ENGINE_URL}/suggest-remediation`, { gapId }),
  
  predictCompliance: (frameworkId: string): Promise<AxiosResponse<any>> =>
    axios.post(`${ML_ENGINE_URL}/predict`, { frameworkId }),
};

// Analytics
export const analytics = {
  getOverview: (): Promise<AxiosResponse<any>> =>
    apiClient.get('/compliance/analytics/overview'),
  
  getFrameworkComparison: (): Promise<AxiosResponse<any>> =>
    apiClient.get('/compliance/analytics/frameworks'),
  
  getControlCoverage: (): Promise<AxiosResponse<any>> =>
    apiClient.get('/compliance/analytics/coverage'),
};

// Export default API object
export default {
  dashboard,
  frameworks,
  assessments,
  controls,
  gaps,
  reports,
  policies,
  ml,
  analytics,
};
