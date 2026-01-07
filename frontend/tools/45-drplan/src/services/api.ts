import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4045/api';
const ML_BASE_URL = import.meta.env.VITE_ML_URL || 'http://localhost:8045';

class DRPlanAPI {
  private api: AxiosInstance;
  private mlApi: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.mlApi = axios.create({
      baseURL: ML_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for authentication
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.mlApi.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Dashboard APIs
  dashboard = {
    getStats: () => this.api.get('/dashboard/stats'),
    getAlerts: () => this.api.get('/dashboard/alerts'),
    getActivity: () => this.api.get('/dashboard/activity'),
  };

  // DR Plans APIs
  drPlans = {
    list: (params?: any) => this.api.get('/dr-plans', { params }),
    get: (id: string) => this.api.get(`/dr-plans/${id}`),
    create: (data: any) => this.api.post('/dr-plans', data),
    update: (id: string, data: any) => this.api.put(`/dr-plans/${id}`, data),
    delete: (id: string) => this.api.delete(`/dr-plans/${id}`),
    activate: (id: string) => this.api.post(`/dr-plans/${id}/activate`),
    deactivate: (id: string) => this.api.post(`/dr-plans/${id}/deactivate`),
  };

  // Recovery Strategies APIs
  strategies = {
    list: (params?: any) => this.api.get('/strategies', { params }),
    get: (id: string) => this.api.get(`/strategies/${id}`),
    create: (data: any) => this.api.post('/strategies', data),
    update: (id: string, data: any) => this.api.put(`/strategies/${id}`, data),
    delete: (id: string) => this.api.delete(`/strategies/${id}`),
    validate: (id: string) => this.api.post(`/strategies/${id}/validate`),
  };

  // Failover Operations APIs
  failover = {
    initiate: (data: any) => this.api.post('/failover/initiate', data),
    status: (id: string) => this.api.get(`/failover/${id}/status`),
    cancel: (id: string) => this.api.post(`/failover/${id}/cancel`),
    failback: (id: string) => this.api.post(`/failover/${id}/failback`),
    history: (params?: any) => this.api.get('/failover/history', { params }),
  };

  // RTO/RPO Monitoring APIs
  rtoRpo = {
    current: () => this.api.get('/rto-rpo/current'),
    history: (params?: any) => this.api.get('/rto-rpo/history', { params }),
    alerts: () => this.api.get('/rto-rpo/alerts'),
    violations: (params?: any) => this.api.get('/rto-rpo/violations', { params }),
    updateTarget: (id: string, data: any) => this.api.put(`/rto-rpo/${id}/target`, data),
  };

  // DR Testing APIs
  drTesting = {
    run: (data: any) => this.api.post('/dr-testing/run', data),
    schedule: (data: any) => this.api.post('/dr-testing/schedule', data),
    getResults: (id: string) => this.api.get(`/dr-testing/${id}/results`),
    getRecent: (params?: any) => this.api.get('/dr-testing/recent', { params }),
    compliance: () => this.api.get('/dr-testing/compliance'),
    cancel: (id: string) => this.api.post(`/dr-testing/${id}/cancel`),
  };

  // Runbooks APIs
  runbooks = {
    list: (params?: any) => this.api.get('/runbooks', { params }),
    get: (id: string) => this.api.get(`/runbooks/${id}`),
    create: (data: any) => this.api.post('/runbooks', data),
    update: (id: string, data: any) => this.api.put(`/runbooks/${id}`, data),
    delete: (id: string) => this.api.delete(`/runbooks/${id}`),
    execute: (id: string, data?: any) => this.api.post(`/runbooks/${id}/execute`, data),
    executionHistory: (id: string) => this.api.get(`/runbooks/${id}/history`),
  };

  // Impact Analysis APIs
  impact = {
    analyze: (data: any) => this.api.post('/impact/analyze', data),
    scenarios: (params?: any) => this.api.get('/impact/scenarios', { params }),
    financial: (id: string) => this.api.get(`/impact/${id}/financial`),
    operational: (id: string) => this.api.get(`/impact/${id}/operational`),
    reputation: (id: string) => this.api.get(`/impact/${id}/reputation`),
  };

  // Compliance APIs
  compliance = {
    reports: (params?: any) => this.api.get('/compliance/reports', { params }),
    generate: (data: any) => this.api.post('/compliance/generate', data),
    frameworks: () => this.api.get('/compliance/frameworks'),
    requirements: (framework: string) => this.api.get(`/compliance/frameworks/${framework}/requirements`),
  };

  // Systems APIs
  systems = {
    list: (params?: any) => this.api.get('/systems', { params }),
    get: (id: string) => this.api.get(`/systems/${id}`),
    create: (data: any) => this.api.post('/systems', data),
    update: (id: string, data: any) => this.api.put(`/systems/${id}`, data),
    delete: (id: string) => this.api.delete(`/systems/${id}`),
    health: (id: string) => this.api.get(`/systems/${id}/health`),
  };

  // Sites APIs
  sites = {
    list: (params?: any) => this.api.get('/sites', { params }),
    get: (id: string) => this.api.get(`/sites/${id}`),
    create: (data: any) => this.api.post('/sites', data),
    update: (id: string, data: any) => this.api.put(`/sites/${id}`, data),
    delete: (id: string) => this.api.delete(`/sites/${id}`),
    capacity: (id: string) => this.api.get(`/sites/${id}/capacity`),
  };

  // ML Prediction APIs
  ml = {
    predictRTO: (data: any) => this.mlApi.post('/predict/rto', data),
    analyzeFailureRisk: (data: any) => this.mlApi.post('/predict/failure-risk', data),
    estimateRecoveryTime: (data: any) => this.mlApi.post('/predict/recovery-time', data),
    scoreImpact: (data: any) => this.mlApi.post('/predict/impact-score', data),
  };

  // Alerts APIs
  alerts = {
    list: (params?: any) => this.api.get('/alerts', { params }),
    get: (id: string) => this.api.get(`/alerts/${id}`),
    acknowledge: (id: string) => this.api.post(`/alerts/${id}/acknowledge`),
    resolve: (id: string) => this.api.post(`/alerts/${id}/resolve`),
  };

  // Contacts APIs
  contacts = {
    list: (params?: any) => this.api.get('/contacts', { params }),
    get: (id: string) => this.api.get(`/contacts/${id}`),
    create: (data: any) => this.api.post('/contacts', data),
    update: (id: string, data: any) => this.api.put(`/contacts/${id}`, data),
    delete: (id: string) => this.api.delete(`/contacts/${id}`),
  };

  // Incidents APIs
  incidents = {
    list: (params?: any) => this.api.get('/incidents', { params }),
    get: (id: string) => this.api.get(`/incidents/${id}`),
    create: (data: any) => this.api.post('/incidents', data),
    update: (id: string, data: any) => this.api.put(`/incidents/${id}`, data),
    resolve: (id: string, data: any) => this.api.post(`/incidents/${id}/resolve`, data),
    timeline: (id: string) => this.api.get(`/incidents/${id}/timeline`),
  };
}

export const drPlanAPI = new DRPlanAPI();
export default drPlanAPI;
