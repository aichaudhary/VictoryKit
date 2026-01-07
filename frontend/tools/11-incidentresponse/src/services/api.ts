/**
 * IncidentResponse API Service
 * Comprehensive API wrapper for incident response operations
 * Domain: incidentresponse.maula.ai
 * Ports: Frontend=3011, API=4011, ML=8011, Engine=6011
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4011/api/v1';
const ML_ENGINE_URL = import.meta.env.VITE_ML_URL || 'http://localhost:8011';

// Types
export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'in-progress' | 'mitigating' | 'resolved' | 'closed';
  type: string;
  assignee?: string;
  team?: string;
  affectedSystems: string[];
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  metrics: IncidentMetrics;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'action' | 'comment' | 'alert' | 'escalation' | 'status_change' | 'playbook' | 'forensics';
  description: string;
  user?: string;
  automated?: boolean;
  metadata?: Record<string, unknown>;
}

export interface IncidentMetrics {
  detectionTime: number;
  responseTime: number;
  containmentTime?: number;
  resolutionTime?: number;
  impactScore: number;
}

export interface Responder {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'available' | 'responding' | 'on-call' | 'offline';
  skills: string[];
  currentIncidents: string[];
  responseStats: ResponderStats;
}

export interface ResponderStats {
  incidentsHandled: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  rating: number;
}

export interface Playbook {
  id: string;
  name: string;
  description: string;
  incidentType: string;
  severity: string[];
  steps: PlaybookStep[];
  automationLevel: 'manual' | 'semi-auto' | 'full-auto';
  lastUsed?: string;
  successRate: number;
}

export interface PlaybookStep {
  id: string;
  order: number;
  name: string;
  description: string;
  action: string;
  automated: boolean;
  required: boolean;
  timeout?: number;
}

export interface Alert {
  id: string;
  source: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  status: 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'false-positive';
  incidentId?: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface ForensicArtifact {
  id: string;
  incidentId: string;
  type: 'malware' | 'log' | 'memory' | 'network' | 'file' | 'registry';
  name: string;
  description: string;
  hash?: string;
  size?: number;
  collectedAt: string;
  analysis?: ArtifactAnalysis;
}

export interface ArtifactAnalysis {
  status: 'pending' | 'analyzing' | 'complete';
  findings: string[];
  iocs: string[];
  riskScore: number;
}

// API Helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  baseUrl: string = API_BASE_URL
): Promise<T> {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Dashboard API
export const dashboardAPI = {
  getStats: () => 
    apiRequest<{
      activeIncidents: number;
      meanResponseTime: number;
      resolvedToday: number;
      activeResponders: number;
      severityDistribution: Record<string, number>;
      trendData: { date: string; incidents: number; resolved: number }[];
    }>('/incidentresponse/dashboard/stats'),

  getMetrics: (timeRange: string = '24h') =>
    apiRequest<{
      detectionTime: { avg: number; trend: number };
      responseTime: { avg: number; trend: number };
      resolutionTime: { avg: number; trend: number };
      containmentRate: number;
    }>(`/incidentresponse/dashboard/metrics?range=${timeRange}`),

  getTimeline: (limit: number = 20) =>
    apiRequest<TimelineEvent[]>(`/incidentresponse/dashboard/timeline?limit=${limit}`),
};

// Incidents API
export const incidentsAPI = {
  list: (params?: {
    status?: string;
    severity?: string;
    assignee?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return apiRequest<{ incidents: Incident[]; total: number; page: number }>(
      `/incidentresponse/incidents${query ? `?${query}` : ''}`
    );
  },

  get: (id: string) =>
    apiRequest<Incident>(`/incidentresponse/incidents/${id}`),

  create: (data: {
    title: string;
    description: string;
    severity: string;
    type: string;
    affectedSystems?: string[];
  }) =>
    apiRequest<Incident>('/incidentresponse/incidents', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Incident>) =>
    apiRequest<Incident>(`/incidentresponse/incidents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: string, note?: string) =>
    apiRequest<Incident>(`/incidentresponse/incidents/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, note }),
    }),

  assign: (id: string, assigneeId: string) =>
    apiRequest<Incident>(`/incidentresponse/incidents/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assigneeId }),
    }),

  escalate: (id: string, reason: string, targetTeam?: string) =>
    apiRequest<Incident>(`/incidentresponse/incidents/${id}/escalate`, {
      method: 'POST',
      body: JSON.stringify({ reason, targetTeam }),
    }),

  resolve: (id: string, resolution: { summary: string; rootCause?: string; actions?: string[] }) =>
    apiRequest<Incident>(`/incidentresponse/incidents/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify(resolution),
    }),

  addTimelineEvent: (id: string, event: Omit<TimelineEvent, 'id' | 'timestamp'>) =>
    apiRequest<TimelineEvent>(`/incidentresponse/incidents/${id}/timeline`, {
      method: 'POST',
      body: JSON.stringify(event),
    }),

  getTimeline: (id: string) =>
    apiRequest<TimelineEvent[]>(`/incidentresponse/incidents/${id}/timeline`),
};

// Alerts API
export const alertsAPI = {
  list: (params?: {
    status?: string;
    severity?: string;
    source?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return apiRequest<{ alerts: Alert[]; total: number }>(
      `/incidentresponse/alerts${query ? `?${query}` : ''}`
    );
  },

  get: (id: string) =>
    apiRequest<Alert>(`/incidentresponse/alerts/${id}`),

  acknowledge: (id: string) =>
    apiRequest<Alert>(`/incidentresponse/alerts/${id}/acknowledge`, {
      method: 'POST',
    }),

  createIncident: (alertId: string, incidentData?: Partial<Incident>) =>
    apiRequest<Incident>(`/incidentresponse/alerts/${alertId}/create-incident`, {
      method: 'POST',
      body: JSON.stringify(incidentData || {}),
    }),

  linkToIncident: (alertId: string, incidentId: string) =>
    apiRequest<Alert>(`/incidentresponse/alerts/${alertId}/link`, {
      method: 'POST',
      body: JSON.stringify({ incidentId }),
    }),

  markFalsePositive: (alertId: string, reason: string) =>
    apiRequest<Alert>(`/incidentresponse/alerts/${alertId}/false-positive`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};

// Responders API
export const respondersAPI = {
  list: (params?: { status?: string; skill?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return apiRequest<{ responders: Responder[]; total: number }>(
      `/incidentresponse/responders${query ? `?${query}` : ''}`
    );
  },

  get: (id: string) =>
    apiRequest<Responder>(`/incidentresponse/responders/${id}`),

  updateStatus: (id: string, status: Responder['status']) =>
    apiRequest<Responder>(`/incidentresponse/responders/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),

  getAvailable: (skill?: string) =>
    apiRequest<Responder[]>(`/incidentresponse/responders/available${skill ? `?skill=${skill}` : ''}`),

  getWorkload: () =>
    apiRequest<{ responderId: string; name: string; activeIncidents: number; capacity: number }[]>(
      '/incidentresponse/responders/workload'
    ),
};

// Playbooks API
export const playbooksAPI = {
  list: (params?: { type?: string; severity?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return apiRequest<{ playbooks: Playbook[]; total: number }>(
      `/incidentresponse/playbooks${query ? `?${query}` : ''}`
    );
  },

  get: (id: string) =>
    apiRequest<Playbook>(`/incidentresponse/playbooks/${id}`),

  create: (data: Omit<Playbook, 'id' | 'lastUsed' | 'successRate'>) =>
    apiRequest<Playbook>('/incidentresponse/playbooks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Playbook>) =>
    apiRequest<Playbook>(`/incidentresponse/playbooks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  execute: (playbookId: string, incidentId: string) =>
    apiRequest<{ executionId: string; status: string }>(
      `/incidentresponse/playbooks/${playbookId}/execute`,
      {
        method: 'POST',
        body: JSON.stringify({ incidentId }),
      }
    ),

  getRecommended: (incidentId: string) =>
    apiRequest<Playbook[]>(`/incidentresponse/playbooks/recommended/${incidentId}`),
};

// Forensics API
export const forensicsAPI = {
  getArtifacts: (incidentId: string) =>
    apiRequest<ForensicArtifact[]>(`/incidentresponse/forensics/${incidentId}/artifacts`),

  uploadArtifact: (incidentId: string, formData: FormData) =>
    fetch(`${API_BASE_URL}/incidentresponse/forensics/${incidentId}/artifacts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: formData,
    }).then(res => res.json()) as Promise<ForensicArtifact>,

  analyzeArtifact: (artifactId: string) =>
    apiRequest<ArtifactAnalysis>(`/incidentresponse/forensics/artifacts/${artifactId}/analyze`, {
      method: 'POST',
    }),

  getIOCs: (incidentId: string) =>
    apiRequest<{ iocs: string[]; sources: string[] }>(
      `/incidentresponse/forensics/${incidentId}/iocs`
    ),

  exportReport: (incidentId: string, format: 'pdf' | 'html' | 'json' = 'pdf') =>
    apiRequest<{ url: string }>(`/incidentresponse/forensics/${incidentId}/export?format=${format}`),
};

// Reports API
export const reportsAPI = {
  getIncidentSummary: (timeRange: string = '30d') =>
    apiRequest<{
      totalIncidents: number;
      bySeverity: Record<string, number>;
      byType: Record<string, number>;
      avgMetrics: IncidentMetrics;
      trend: { date: string; count: number }[];
    }>(`/incidentresponse/reports/summary?range=${timeRange}`),

  getResponderPerformance: (timeRange: string = '30d') =>
    apiRequest<ResponderStats[]>(`/incidentresponse/reports/responders?range=${timeRange}`),

  getPlaybookEffectiveness: () =>
    apiRequest<{ playbookId: string; name: string; executions: number; successRate: number }[]>(
      '/incidentresponse/reports/playbooks'
    ),

  generatePostMortem: (incidentId: string) =>
    apiRequest<{
      incident: Incident;
      timeline: TimelineEvent[];
      findings: string[];
      recommendations: string[];
    }>(`/incidentresponse/reports/post-mortem/${incidentId}`),

  export: (reportType: string, params: Record<string, string>) =>
    apiRequest<{ url: string }>('/incidentresponse/reports/export', {
      method: 'POST',
      body: JSON.stringify({ reportType, params }),
    }),
};

// ML Engine API
export const mlAPI = {
  analyzeIncident: (incidentId: string) =>
    apiRequest<{
      riskScore: number;
      predictedImpact: string;
      suggestedActions: string[];
      similarIncidents: string[];
      confidence: number;
    }>(`/incidentresponse/ml/analyze/${incidentId}`, {}, ML_ENGINE_URL),

  predictSeverity: (alertData: Partial<Alert>) =>
    apiRequest<{
      predictedSeverity: string;
      confidence: number;
      factors: string[];
    }>('/incidentresponse/ml/predict-severity', {
      method: 'POST',
      body: JSON.stringify(alertData),
    }, ML_ENGINE_URL),

  correlateAlerts: (alertIds: string[]) =>
    apiRequest<{
      correlationScore: number;
      relatedAlerts: string[];
      suggestedIncident: boolean;
    }>('/incidentresponse/ml/correlate', {
      method: 'POST',
      body: JSON.stringify({ alertIds }),
    }, ML_ENGINE_URL),

  getPlaybookRecommendation: (incidentData: Partial<Incident>) =>
    apiRequest<{
      recommendedPlaybooks: { id: string; name: string; score: number }[];
      reasoning: string;
    }>('/incidentresponse/ml/recommend-playbook', {
      method: 'POST',
      body: JSON.stringify(incidentData),
    }, ML_ENGINE_URL),

  analyzeForensics: (artifactId: string) =>
    apiRequest<ArtifactAnalysis>(
      `/incidentresponse/ml/forensics/${artifactId}`,
      {},
      ML_ENGINE_URL
    ),
};

// Export default API object
export default {
  dashboard: dashboardAPI,
  incidents: incidentsAPI,
  alerts: alertsAPI,
  responders: respondersAPI,
  playbooks: playbooksAPI,
  forensics: forensicsAPI,
  reports: reportsAPI,
  ml: mlAPI,
};
