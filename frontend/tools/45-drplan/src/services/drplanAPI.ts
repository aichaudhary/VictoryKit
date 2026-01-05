import axios from 'axios';
import { API_BASE_URL } from '../constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const drplanAPI = {
  // Health & Status
  getHealth: () => api.get('/health'),
  getStatus: () => api.get('/status'),
  getDashboard: () => api.get('/dashboard'),

  // Recovery Plans
  plans: {
    getAll: () => api.get('/plans'),
    getById: (id: string) => api.get(`/plans/${id}`),
    create: (data: any) => api.post('/plans', data),
    update: (id: string, data: any) => api.put(`/plans/${id}`, data),
    delete: (id: string) => api.delete(`/plans/${id}`),
    activate: (id: string) => api.post(`/plans/${id}/activate`),
    archive: (id: string) => api.post(`/plans/${id}/archive`),
    clone: (id: string) => api.post(`/plans/${id}/clone`),
    export: (id: string) => api.get(`/plans/${id}/export`),
  },

  // Critical Systems
  systems: {
    getAll: () => api.get('/systems'),
    getById: (id: string) => api.get(`/systems/${id}`),
    create: (data: any) => api.post('/systems', data),
    update: (id: string, data: any) => api.put(`/systems/${id}`, data),
    delete: (id: string) => api.delete(`/systems/${id}`),
    getHealth: (id: string) => api.get(`/systems/${id}/health`),
    getDependencies: (id: string) => api.get(`/systems/${id}/dependencies`),
    triggerFailover: (id: string) => api.post(`/systems/${id}/failover`),
    triggerFailback: (id: string) => api.post(`/systems/${id}/failback`),
  },

  // Recovery Sites
  sites: {
    getAll: () => api.get('/sites'),
    getById: (id: string) => api.get(`/sites/${id}`),
    create: (data: any) => api.post('/sites', data),
    update: (id: string, data: any) => api.put(`/sites/${id}`, data),
    delete: (id: string) => api.delete(`/sites/${id}`),
    getStatus: (id: string) => api.get(`/sites/${id}/status`),
    testConnectivity: (id: string) => api.post(`/sites/${id}/test`),
  },

  // Runbooks
  runbooks: {
    getAll: () => api.get('/runbooks'),
    getById: (id: string) => api.get(`/runbooks/${id}`),
    create: (data: any) => api.post('/runbooks', data),
    update: (id: string, data: any) => api.put(`/runbooks/${id}`, data),
    delete: (id: string) => api.delete(`/runbooks/${id}`),
    execute: (id: string) => api.post(`/runbooks/${id}/execute`),
    validate: (id: string) => api.post(`/runbooks/${id}/validate`),
  },

  // DR Tests
  tests: {
    getAll: () => api.get('/tests'),
    getById: (id: string) => api.get(`/tests/${id}`),
    create: (data: any) => api.post('/tests', data),
    update: (id: string, data: any) => api.put(`/tests/${id}`, data),
    delete: (id: string) => api.delete(`/tests/${id}`),
    start: (id: string) => api.post(`/tests/${id}/start`),
    complete: (id: string, results: any) => api.post(`/tests/${id}/complete`, results),
    cancel: (id: string) => api.post(`/tests/${id}/cancel`),
    getScheduled: () => api.get('/tests/scheduled'),
  },

  // Contacts
  contacts: {
    getAll: () => api.get('/contacts'),
    getById: (id: string) => api.get(`/contacts/${id}`),
    create: (data: any) => api.post('/contacts', data),
    update: (id: string, data: any) => api.put(`/contacts/${id}`, data),
    delete: (id: string) => api.delete(`/contacts/${id}`),
    getOnCall: () => api.get('/contacts/oncall'),
    getEscalation: () => api.get('/contacts/escalation'),
  },

  // Incidents
  incidents: {
    getAll: () => api.get('/incidents'),
    getById: (id: string) => api.get(`/incidents/${id}`),
    create: (data: any) => api.post('/incidents', data),
    update: (id: string, data: any) => api.put(`/incidents/${id}`, data),
    addUpdate: (id: string, update: any) => api.post(`/incidents/${id}/updates`, update),
    resolve: (id: string) => api.post(`/incidents/${id}/resolve`),
    getActive: () => api.get('/incidents/active'),
    getTimeline: (id: string) => api.get(`/incidents/${id}/timeline`),
  },

  // Reports
  reports: {
    getReadiness: () => api.get('/reports/readiness'),
    getCompliance: () => api.get('/reports/compliance'),
    getRTORPO: () => api.get('/reports/rto-rpo'),
    getTestHistory: () => api.get('/reports/test-history'),
    generate: (type: string, options: any) => api.post(`/reports/generate/${type}`, options),
  },

  // AI Analysis
  ai: {
    analyzeRisk: () => api.get('/ai/risk-analysis'),
    suggestImprovements: () => api.get('/ai/suggestions'),
    predictFailure: (systemId: string) => api.get(`/ai/predict/${systemId}`),
  },
};

export default drplanAPI;
