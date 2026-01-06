import axios from 'axios';
import { 
  Case, Playbook, Integration, Automation, 
  EnrichmentResult, MetricsData, DashboardStats 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4028/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('soar_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('soar_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ Cases API ============
export const casesAPI = {
  getAll: async (filters?: { status?: string; priority?: string; assignee?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.assignee) params.append('assignee', filters.assignee);
    const response = await api.get<Case[]>(`/cases?${params}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Case>(`/cases/${id}`);
    return response.data;
  },

  create: async (caseData: Partial<Case>) => {
    const response = await api.post<Case>('/cases', caseData);
    return response.data;
  },

  update: async (id: string, updates: Partial<Case>) => {
    const response = await api.patch<Case>(`/cases/${id}`, updates);
    return response.data;
  },

  addNote: async (caseId: string, content: string) => {
    const response = await api.post(`/cases/${caseId}/notes`, { content });
    return response.data;
  },

  assignPlaybook: async (caseId: string, playbookId: string) => {
    const response = await api.post(`/cases/${caseId}/playbooks/${playbookId}`);
    return response.data;
  },

  escalate: async (caseId: string, reason: string) => {
    const response = await api.post(`/cases/${caseId}/escalate`, { reason });
    return response.data;
  },

  close: async (caseId: string, resolution: string) => {
    const response = await api.post(`/cases/${caseId}/close`, { resolution });
    return response.data;
  },
};

// ============ Playbooks API ============
export const playbooksAPI = {
  getAll: async (category?: string) => {
    const params = category ? `?category=${category}` : '';
    const response = await api.get<Playbook[]>(`/playbooks${params}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Playbook>(`/playbooks/${id}`);
    return response.data;
  },

  create: async (playbook: Partial<Playbook>) => {
    const response = await api.post<Playbook>('/playbooks', playbook);
    return response.data;
  },

  update: async (id: string, updates: Partial<Playbook>) => {
    const response = await api.patch<Playbook>(`/playbooks/${id}`, updates);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/playbooks/${id}`);
  },

  run: async (id: string, context?: { case_id?: string; alert_id?: string; params?: Record<string, any> }) => {
    const response = await api.post(`/playbooks/${id}/run`, context);
    return response.data;
  },

  getExecutionHistory: async (id: string) => {
    const response = await api.get(`/playbooks/${id}/executions`);
    return response.data;
  },

  toggle: async (id: string, enabled: boolean) => {
    const response = await api.patch<Playbook>(`/playbooks/${id}`, { enabled });
    return response.data;
  },
};

// ============ Integrations API ============
export const integrationsAPI = {
  getAll: async () => {
    const response = await api.get<Integration[]>('/integrations');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Integration>(`/integrations/${id}`);
    return response.data;
  },

  configure: async (id: string, config: Record<string, any>) => {
    const response = await api.put<Integration>(`/integrations/${id}/config`, config);
    return response.data;
  },

  sync: async (id: string) => {
    const response = await api.post(`/integrations/${id}/sync`);
    return response.data;
  },

  test: async (id: string) => {
    const response = await api.post(`/integrations/${id}/test`);
    return response.data;
  },

  enable: async (id: string) => {
    const response = await api.post(`/integrations/${id}/enable`);
    return response.data;
  },

  disable: async (id: string) => {
    const response = await api.post(`/integrations/${id}/disable`);
    return response.data;
  },
};

// ============ Automations API ============
export const automationsAPI = {
  getAll: async () => {
    const response = await api.get<Automation[]>('/automations');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Automation>(`/automations/${id}`);
    return response.data;
  },

  create: async (automation: Partial<Automation>) => {
    const response = await api.post<Automation>('/automations', automation);
    return response.data;
  },

  update: async (id: string, updates: Partial<Automation>) => {
    const response = await api.patch<Automation>(`/automations/${id}`, updates);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/automations/${id}`);
  },

  toggle: async (id: string, enabled: boolean) => {
    const response = await api.patch<Automation>(`/automations/${id}`, { enabled });
    return response.data;
  },

  getHistory: async (id: string) => {
    const response = await api.get(`/automations/${id}/history`);
    return response.data;
  },
};

// ============ Enrichment API ============
export const enrichmentAPI = {
  enrichIOC: async (ioc: string, type: string, sources?: string[]) => {
    const response = await api.post<EnrichmentResult>('/enrichment/ioc', {
      ioc,
      type,
      sources,
    });
    return response.data;
  },

  bulkEnrich: async (iocs: Array<{ value: string; type: string }>) => {
    const response = await api.post<EnrichmentResult[]>('/enrichment/bulk', { iocs });
    return response.data;
  },

  getSources: async () => {
    const response = await api.get('/enrichment/sources');
    return response.data;
  },

  getHistory: async (limit?: number) => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await api.get<EnrichmentResult[]>(`/enrichment/history${params}`);
    return response.data;
  },
};

// ============ Metrics API ============
export const metricsAPI = {
  getDashboardStats: async () => {
    const response = await api.get<DashboardStats>('/metrics/dashboard');
    return response.data;
  },

  getHistory: async (range: '7d' | '30d' | '90d') => {
    const response = await api.get<MetricsData[]>(`/metrics/history?range=${range}`);
    return response.data;
  },

  getCaseMetrics: async (range: '7d' | '30d' | '90d') => {
    const response = await api.get(`/metrics/cases?range=${range}`);
    return response.data;
  },

  getPlaybookMetrics: async (range: '7d' | '30d' | '90d') => {
    const response = await api.get(`/metrics/playbooks?range=${range}`);
    return response.data;
  },

  getAutomationMetrics: async (range: '7d' | '30d' | '90d') => {
    const response = await api.get(`/metrics/automations?range=${range}`);
    return response.data;
  },
};

// ============ Reports API ============
export const reportsAPI = {
  generate: async (type: string, format: 'pdf' | 'html' | 'json', dateRange?: { start: string; end: string }) => {
    const response = await api.post('/reports/generate', {
      type,
      format,
      dateRange,
    }, {
      responseType: format === 'json' ? 'json' : 'blob',
    });
    return response.data;
  },

  getScheduled: async () => {
    const response = await api.get('/reports/scheduled');
    return response.data;
  },

  schedule: async (config: { type: string; format: string; schedule: string; recipients: string[] }) => {
    const response = await api.post('/reports/schedule', config);
    return response.data;
  },

  getHistory: async (limit?: number) => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await api.get(`/reports/history${params}`);
    return response.data;
  },
};

// ============ AI Assistant API ============
export const aiAPI = {
  chat: async (message: string, context?: { case_id?: string; playbook_id?: string }) => {
    const response = await api.post('/ai/chat', { message, context });
    return response.data;
  },

  analyze: async (data: { type: 'case' | 'alert' | 'ioc'; id: string }) => {
    const response = await api.post('/ai/analyze', data);
    return response.data;
  },

  suggest: async (context: { type: 'playbook' | 'action' | 'response'; case_id?: string }) => {
    const response = await api.post('/ai/suggest', context);
    return response.data;
  },

  generateReport: async (caseId: string, type: 'summary' | 'detailed' | 'executive') => {
    const response = await api.post('/ai/report', { case_id: caseId, type });
    return response.data;
  },
};

// ============ Settings API ============
export const settingsAPI = {
  get: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  update: async (settings: Record<string, any>) => {
    const response = await api.patch('/settings', settings);
    return response.data;
  },

  getNotificationPreferences: async () => {
    const response = await api.get('/settings/notifications');
    return response.data;
  },

  updateNotificationPreferences: async (preferences: Record<string, any>) => {
    const response = await api.patch('/settings/notifications', preferences);
    return response.data;
  },
};

export default {
  cases: casesAPI,
  playbooks: playbooksAPI,
  integrations: integrationsAPI,
  automations: automationsAPI,
  enrichment: enrichmentAPI,
  metrics: metricsAPI,
  reports: reportsAPI,
  ai: aiAPI,
  settings: settingsAPI,
};
