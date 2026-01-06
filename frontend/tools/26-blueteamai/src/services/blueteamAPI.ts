// BlueTeamAI API Service
import { 
  SecurityAlert, Incident, ThreatHunt, 
  Playbook, IOC, MitreTechnique 
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3026/api';

class BlueTeamAPI {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Alerts
  alerts = {
    getAll: () => this.request<SecurityAlert[]>('/alerts'),
    getById: (id: string) => this.request<SecurityAlert>(`/alerts/${id}`),
    updateStatus: (id: string, status: string) => 
      this.request<SecurityAlert>(`/alerts/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      }),
    analyze: (alertId: string) => 
      this.request<any>(`/alerts/${alertId}/analyze`, { method: 'POST' }),
    assignTo: (id: string, assignee: string) =>
      this.request<SecurityAlert>(`/alerts/${id}/assign`, {
        method: 'POST',
        body: JSON.stringify({ assignee })
      })
  };

  // Incidents
  incidents = {
    getAll: () => this.request<Incident[]>('/incidents'),
    getById: (id: string) => this.request<Incident>(`/incidents/${id}`),
    create: (data: Partial<Incident>) => 
      this.request<Incident>('/incidents', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    update: (id: string, data: Partial<Incident>) =>
      this.request<Incident>(`/incidents/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    addNote: (id: string, note: { content: string; type: string }) =>
      this.request<any>(`/incidents/${id}/notes`, {
        method: 'POST',
        body: JSON.stringify(note)
      }),
    addIOC: (id: string, ioc: Partial<IOC>) =>
      this.request<IOC>(`/incidents/${id}/iocs`, {
        method: 'POST',
        body: JSON.stringify(ioc)
      }),
    getTimeline: (id: string) => 
      this.request<any[]>(`/incidents/${id}/timeline`)
  };

  // Threat Hunting
  hunts = {
    getAll: () => this.request<ThreatHunt[]>('/hunts'),
    getById: (id: string) => this.request<ThreatHunt>(`/hunts/${id}`),
    create: (data: Partial<ThreatHunt>) =>
      this.request<ThreatHunt>('/hunts', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    execute: (id: string) =>
      this.request<any>(`/hunts/${id}/execute`, { method: 'POST' }),
    pause: (id: string) =>
      this.request<any>(`/hunts/${id}/pause`, { method: 'POST' }),
    getFindings: (id: string) =>
      this.request<any[]>(`/hunts/${id}/findings`)
  };

  // Playbooks
  playbooks = {
    getAll: () => this.request<Playbook[]>('/playbooks'),
    getById: (id: string) => this.request<Playbook>(`/playbooks/${id}`),
    create: (data: Partial<Playbook>) =>
      this.request<Playbook>('/playbooks', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    execute: (id: string, context?: any) =>
      this.request<any>(`/playbooks/${id}/execute`, {
        method: 'POST',
        body: JSON.stringify({ context })
      }),
    getExecutions: (id: string) =>
      this.request<any[]>(`/playbooks/${id}/executions`)
  };

  // MITRE ATT&CK
  mitre = {
    getTechniques: () => this.request<MitreTechnique[]>('/mitre/techniques'),
    getTechniqueById: (id: string) => 
      this.request<MitreTechnique>(`/mitre/techniques/${id}`),
    mapAlertToTechniques: (alertId: string) =>
      this.request<MitreTechnique[]>(`/mitre/map/alert/${alertId}`),
    getByTactic: (tactic: string) =>
      this.request<MitreTechnique[]>(`/mitre/tactics/${tactic}/techniques`)
  };

  // IOC Management
  iocs = {
    search: (query: string) => 
      this.request<IOC[]>(`/iocs/search?q=${encodeURIComponent(query)}`),
    enrich: (value: string, type: string) =>
      this.request<any>('/iocs/enrich', {
        method: 'POST',
        body: JSON.stringify({ value, type })
      }),
    correlate: (iocs: { type: string; value: string }[]) =>
      this.request<any>('/iocs/correlate', {
        method: 'POST',
        body: JSON.stringify({ iocs })
      })
  };

  // Reports
  reports = {
    generateIncidentReport: (incidentId: string, format: 'pdf' | 'html' | 'markdown') =>
      this.request<any>(`/reports/incident/${incidentId}`, {
        method: 'POST',
        body: JSON.stringify({ format })
      }),
    generateThreatHuntReport: (huntId: string, format: 'pdf' | 'html' | 'markdown') =>
      this.request<any>(`/reports/hunt/${huntId}`, {
        method: 'POST',
        body: JSON.stringify({ format })
      }),
    generateDailySummary: (date: string) =>
      this.request<any>('/reports/daily-summary', {
        method: 'POST',
        body: JSON.stringify({ date })
      })
  };

  // AI Analysis
  ai = {
    analyzeAlert: (alert: SecurityAlert) =>
      this.request<any>('/ai/analyze-alert', {
        method: 'POST',
        body: JSON.stringify({ alert })
      }),
    suggestResponse: (incidentId: string) =>
      this.request<any>(`/ai/suggest-response/${incidentId}`),
    createHuntQuery: (hypothesis: string) =>
      this.request<any>('/ai/hunt-query', {
        method: 'POST',
        body: JSON.stringify({ hypothesis })
      }),
    chat: (message: string, context?: any) =>
      this.request<any>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message, context })
      })
  };
}

export const blueteamAPI = new BlueTeamAPI();
export default blueteamAPI;
