import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Bot APIs
export const botApi = {
  getAll: (params?: Record<string, string | number>) => 
    api.get('/bots', { params }),
  getById: (id: string) => 
    api.get(`/bots/${id}`),
  detect: (data: Record<string, unknown>) => 
    api.post('/bots/detect', data),
  update: (id: string, data: Record<string, unknown>) => 
    api.put(`/bots/${id}`, data),
  block: (id: string, reason?: string) => 
    api.post(`/bots/${id}/block`, { reason }),
  allow: (id: string, reason?: string) => 
    api.post(`/bots/${id}/allow`, { reason }),
  getStatistics: () => 
    api.get('/bots/statistics/summary'),
  getLiveTraffic: (window?: number) => 
    api.get('/bots/traffic/live', { params: { window } }),
  bulkAction: (botIds: string[], action: string, reason?: string) =>
    api.post('/bots/bulk-action', { botIds, action, reason }),
};

// Challenge APIs
export const challengeApi = {
  getAll: () => 
    api.get('/challenges'),
  getById: (id: string) => 
    api.get(`/challenges/${id}`),
  create: (data: Record<string, unknown>) => 
    api.post('/challenges', data),
  update: (id: string, data: Record<string, unknown>) => 
    api.put(`/challenges/${id}`, data),
  delete: (id: string) => 
    api.delete(`/challenges/${id}`),
  verify: (id: string, token: string) => 
    api.post(`/challenges/${id}/verify`, { token }),
  getConfig: () => 
    api.get('/challenges/config'),
  updateConfig: (data: Record<string, unknown>) => 
    api.put('/challenges/config', data),
};

// CAPTCHA APIs
export const captchaApi = {
  verify: (token: string, provider?: string, action?: string) =>
    api.post('/captcha/verify', { token, provider, action }),
  getConfig: () => 
    api.get('/captcha/config'),
  updateConfig: (data: Record<string, unknown>) =>
    api.put('/captcha/config', data),
};

// Fingerprint APIs
export const fingerprintApi = {
  getAll: (params?: Record<string, string | number>) => 
    api.get('/fingerprints', { params }),
  getById: (id: string) => 
    api.get(`/fingerprints/${id}`),
  analyze: (data: Record<string, unknown>) => 
    api.post('/fingerprints/analyze', data),
  flag: (id: string, reason?: string) => 
    api.post(`/fingerprints/${id}/flag`, { reason }),
  compare: (id1: string, id2: string) =>
    api.get(`/fingerprints/compare/${id1}/${id2}`),
  getClusters: () =>
    api.get('/fingerprints/clusters'),
};

// IP Reputation APIs
export const reputationApi = {
  checkIP: (ip: string) => 
    api.get(`/reputation/ip/${ip}`),
  getComprehensive: (ip: string) => 
    api.get(`/reputation/comprehensive/${ip}`),
  getBlacklist: () => 
    api.get('/reputation/blacklist'),
  addToBlacklist: (ip: string, reason?: string) =>
    api.post('/reputation/blacklist', { ip, reason }),
  removeFromBlacklist: (ip: string) =>
    api.delete(`/reputation/blacklist/${ip}`),
  getWhitelist: () => 
    api.get('/reputation/whitelist'),
  addToWhitelist: (ip: string, reason?: string, description?: string) =>
    api.post('/reputation/whitelist', { ip, reason, description }),
  removeFromWhitelist: (ip: string) =>
    api.delete(`/reputation/whitelist/${ip}`),
};

// Rules APIs
export const rulesApi = {
  getAll: () => 
    api.get('/rules'),
  getById: (id: string) => 
    api.get(`/rules/${id}`),
  create: (data: Record<string, unknown>) => 
    api.post('/rules', data),
  update: (id: string, data: Record<string, unknown>) => 
    api.put(`/rules/${id}`, data),
  delete: (id: string) => 
    api.delete(`/rules/${id}`),
  toggle: (id: string) => 
    api.put(`/rules/${id}/toggle`),
  test: (id: string, request: Record<string, unknown>) =>
    api.post(`/rules/${id}/test`, request),
  reorder: (order: Array<{ id: string; priority: number }>) =>
    api.put('/rules/reorder', { order }),
};

// Incident APIs
export const incidentApi = {
  getAll: (params?: Record<string, string | number | undefined>) => 
    api.get('/incidents', { params }),
  getById: (id: string) => 
    api.get(`/incidents/${id}`),
  create: (data: Record<string, unknown>) => 
    api.post('/incidents', data),
  update: (id: string, data: Record<string, unknown>) => 
    api.put(`/incidents/${id}`, data),
  updateStatus: (id: string, status: string) =>
    api.put(`/incidents/${id}/status`, { status }),
  addNote: (id: string, note: string) =>
    api.post(`/incidents/${id}/notes`, { note }),
  resolve: (id: string, summary?: string, preventiveMeasures?: string[]) =>
    api.put(`/incidents/${id}/resolve`, { summary, preventiveMeasures }),
  getActive: () => 
    api.get('/incidents/active'),
  getTimeline: (id: string) =>
    api.get(`/incidents/timeline/${id}`),
};

// Analytics APIs
export const analyticsApi = {
  getTraffic: (hours?: number) => 
    api.get('/analytics/traffic', { params: { hours } }),
  getBotBreakdown: () => 
    api.get('/analytics/bots'),
  getChallengeStats: () => 
    api.get('/analytics/challenges'),
  getDashboard: () => 
    api.get('/analytics/dashboard'),
  getTrends: (days?: number) =>
    api.get('/analytics/trends', { params: { days } }),
  getGeographic: () =>
    api.get('/analytics/geographic'),
  getRealtime: () =>
    api.get('/analytics/realtime'),
  getThreats: () =>
    api.get('/analytics/threats'),
};

// Settings APIs
export const settingsApi = {
  getSettings: () => 
    api.get('/settings'),
  updateSettings: (data: Record<string, unknown>) =>
    api.put('/settings', data),
  getIntegrations: () =>
    api.get('/settings/integrations'),
  updateIntegrations: (data: Record<string, unknown>) =>
    api.put('/settings/integrations', data),
};

export default api;
