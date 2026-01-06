import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/siemcommander`,
  timeout: 30000
});

export const siemAPI = {
  // Events
  ingestEvents: async (sourceType: string, events: any[], autoCorrelate = false) => {
    const response = await api.post('/events/ingest', {
      source_type: sourceType,
      events,
      auto_correlate: autoCorrelate,
      normalize: true
    });
    return response.data;
  },

  getEvents: async (filters: any = {}) => {
    const response = await api.get('/events', { params: filters });
    return response.data;
  },

  queryEvents: async (query: string, timeRange: any, limit = 1000) => {
    const response = await api.post('/events/query', { query, time_range: timeRange, limit });
    return response.data;
  },

  correlateEvents: async (eventIds: string[], timeWindow = '5m') => {
    const response = await api.post('/events/correlate', { event_ids: eventIds, time_window: timeWindow });
    return response.data;
  },

  // Threats
  detectThreats: async (timeWindow = '24h', severityThreshold = 'medium', useThreatIntel = true) => {
    const response = await api.post('/threats/detect', {
      time_window: timeWindow,
      severity_threshold: severityThreshold,
      use_threat_intel: useThreatIntel
    });
    return response.data;
  },

  threatHunt: async (hypothesis: string, iocs: string[], scope: string[], timeRange?: string) => {
    const response = await api.post('/threats/hunt', {
      hunt_hypothesis: hypothesis,
      iocs,
      scope,
      time_range: timeRange
    });
    return response.data;
  },

  // Incidents
  createIncident: async (incident: any) => {
    const response = await api.post('/incidents', incident);
    return response.data;
  },

  getIncidents: async (filters: any = {}) => {
    const response = await api.get('/incidents', { params: filters });
    return response.data;
  },

  getIncidentById: async (incidentId: string) => {
    const response = await api.get(`/incidents/${incidentId}`);
    return response.data;
  },

  updateIncident: async (incidentId: string, updates: any) => {
    const response = await api.put(`/incidents/${incidentId}`, updates);
    return response.data;
  },

  // Playbooks
  executePlaybook: async (playbookId: string, incidentId?: string, dryRun = false) => {
    const response = await api.post('/playbooks/execute', {
      playbook_id: playbookId,
      incident_id: incidentId,
      dry_run: dryRun
    });
    return response.data;
  },

  getPlaybooks: async (filters: any = {}) => {
    const response = await api.get('/playbooks', { params: filters });
    return response.data;
  },

  // Threat Intelligence
  addThreatIntel: async (ioc: any) => {
    const response = await api.post('/threat-intel', ioc);
    return response.data;
  },

  getThreatIntel: async (filters: any = {}) => {
    const response = await api.get('/threat-intel', { params: filters });
    return response.data;
  },

  checkIOC: async (iocValue: string) => {
    const response = await api.get(`/threat-intel/ioc/${iocValue}`);
    return response.data;
  },

  updateThreatIntelFeeds: async (feedSources: string[], autoApply = false) => {
    const response = await api.post('/threat-intel/update', {
      feed_sources: feedSources,
      auto_apply: autoApply
    });
    return response.data;
  },

  // Reports
  generateReport: async (reportConfig: any) => {
    const response = await api.post('/reports/generate', reportConfig);
    return response.data;
  },

  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  getThreatTimeline: async (hours = 24) => {
    const response = await api.get('/dashboard/timeline', { params: { hours } });
    return response.data;
  },

  // Health
  getStatus: async () => {
    const response = await api.get('/status');
    return response.data;
  }
};
