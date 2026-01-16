/**
 * incidentcommand API Client
 * Tool 11 - AI-Powered Security Incident Management
 *
 * TypeScript client for communicating with incidentcommand backend
 */

const API_BASE_URL =
  import.meta.env.VITE_incidentcommand_API_URL || 'http://localhost:4011/api/v1/incidentcommand';

// ============= Types =============

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low' | 'informational';
export type IncidentStatus =
  | 'open'
  | 'investigating'
  | 'contained'
  | 'eradicated'
  | 'recovered'
  | 'closed';
export type IncidentCategory =
  | 'malware'
  | 'phishing'
  | 'data-breach'
  | 'ddos'
  | 'unauthorized-access'
  | 'insider-threat'
  | 'ransomware'
  | 'other';

export interface Incident {
  _id: string;
  incidentId: string;
  title: string;
  description?: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  category: IncidentCategory;
  source: {
    type: 'siem' | 'edr' | 'user-report' | 'automated' | 'threat-intel' | 'manual';
    reference?: string;
    detectedAt: string;
  };
  affectedAssets: Asset[];
  timeline: TimelineEntry[];
  assignee?: string;
  team?: string[];
  indicators: Indicator[];
  containmentActions?: ContainmentAction[];
  rootCause?: string;
  lessonsLearned?: string;
  metrics: {
    timeToDetect?: number;
    timeToContain?: number;
    timeToResolve?: number;
    impactScore?: number;
  };
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export interface Asset {
  assetId: string;
  name: string;
  type: 'server' | 'workstation' | 'network' | 'application' | 'database' | 'user' | 'other';
  criticality: 'critical' | 'high' | 'medium' | 'low';
  status: 'compromised' | 'at-risk' | 'isolated' | 'clean' | 'unknown';
}

export interface TimelineEntry {
  timestamp: string;
  action: string;
  performedBy: string;
  details?: string;
  evidence?: string[];
}

export interface Indicator {
  type: 'ip' | 'domain' | 'hash' | 'email' | 'url' | 'file' | 'registry' | 'other';
  value: string;
  confidence: 'high' | 'medium' | 'low';
  source?: string;
  tags?: string[];
}

export interface ContainmentAction {
  action: string;
  target: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  executedAt?: string;
  executedBy?: string;
  result?: string;
}

export interface Playbook {
  _id: string;
  playbookId: string;
  name: string;
  description?: string;
  category: IncidentCategory;
  severity: IncidentSeverity[];
  steps: PlaybookStep[];
  automatable: boolean;
  estimatedTime: number;
  isActive: boolean;
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlaybookStep {
  order: number;
  name: string;
  description: string;
  type: 'manual' | 'automated' | 'approval';
  actions: string[];
  checklistItems?: string[];
  automationScript?: string;
  expectedDuration: number;
}

export interface IncidentDashboard {
  overview: {
    total: number;
    open: number;
    investigating: number;
    contained: number;
    closed: number;
  };
  bySeverity: Record<IncidentSeverity, number>;
  byCategory: Record<string, number>;
  metrics: {
    avgTimeToDetect: number;
    avgTimeToContain: number;
    avgTimeToResolve: number;
    mttr: number;
  };
  recentIncidents: IncidentSummary[];
  trending: {
    category: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }[];
}

export interface IncidentSummary {
  incidentId: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  createdAt: string;
  assignee?: string;
}

export interface AIAnalysis {
  incidentId: string;
  analysisType: 'threat' | 'impact' | 'root-cause' | 'recommendation';
  confidence: number;
  findings: string[];
  recommendations: string[];
  relatedIncidents?: string[];
  threatActorProfile?: {
    likelihood: string;
    motivation: string;
    capabilities: string[];
  };
  aiPowered: boolean;
  simulated?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  simulated?: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ============= API Client =============

class IncidentResponseApi {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Request failed' };
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // ============= Incident Endpoints =============

  async createIncident(data: {
    title: string;
    description?: string;
    severity: IncidentSeverity;
    category: IncidentCategory;
    source?: {
      type: string;
      reference?: string;
    };
    affectedAssets?: Partial<Asset>[];
    indicators?: Partial<Indicator>[];
    assignee?: string;
  }): Promise<ApiResponse<{ incident: Incident }>> {
    return this.request('/incidents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getIncidents(filters?: {
    status?: IncidentStatus;
    severity?: IncidentSeverity;
    category?: IncidentCategory;
    assignee?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ incidents: Incident[]; pagination: Pagination }>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.assignee) params.append('assignee', filters.assignee);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    return this.request(`/incidents?${params.toString()}`);
  }

  async getIncident(incidentId: string): Promise<ApiResponse<{ incident: Incident }>> {
    return this.request(`/incidents/${incidentId}`);
  }

  async updateIncident(
    incidentId: string,
    data: Partial<Incident>
  ): Promise<ApiResponse<{ incident: Incident }>> {
    return this.request(`/incidents/${incidentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateStatus(
    incidentId: string,
    status: IncidentStatus,
    notes?: string
  ): Promise<ApiResponse<{ incident: Incident }>> {
    return this.request(`/incidents/${incidentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  async assignIncident(
    incidentId: string,
    assignee: string
  ): Promise<ApiResponse<{ incident: Incident }>> {
    return this.request(`/incidents/${incidentId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assignee }),
    });
  }

  async addTimelineEntry(
    incidentId: string,
    entry: {
      action: string;
      performedBy: string;
      details?: string;
    }
  ): Promise<ApiResponse<{ incident: Incident }>> {
    return this.request(`/incidents/${incidentId}/timeline`, {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  async addIndicator(
    incidentId: string,
    indicator: Partial<Indicator>
  ): Promise<ApiResponse<{ incident: Incident }>> {
    return this.request(`/incidents/${incidentId}/indicators`, {
      method: 'POST',
      body: JSON.stringify(indicator),
    });
  }

  async executeContainment(
    incidentId: string,
    action: {
      action: string;
      target: string;
      executedBy: string;
    }
  ): Promise<ApiResponse<{ result: ContainmentAction }>> {
    return this.request(`/incidents/${incidentId}/containment`, {
      method: 'POST',
      body: JSON.stringify(action),
    });
  }

  async closeIncident(
    incidentId: string,
    data: {
      rootCause?: string;
      lessonsLearned?: string;
      closedBy: string;
    }
  ): Promise<ApiResponse<{ incident: Incident }>> {
    return this.request(`/incidents/${incidentId}/close`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============= Dashboard & Analytics =============

  async getDashboard(): Promise<ApiResponse<IncidentDashboard>> {
    return this.request('/dashboard');
  }

  async getMetrics(timeRange?: string): Promise<
    ApiResponse<{
      mttr: number;
      mttd: number;
      mttc: number;
      incidentsByDay: { date: string; count: number }[];
      resolutionRate: number;
    }>
  > {
    const params = timeRange ? `?timeRange=${timeRange}` : '';
    return this.request(`/metrics${params}`);
  }

  // ============= AI Analysis =============

  async analyzeIncident(
    incidentId: string,
    analysisType?: string
  ): Promise<ApiResponse<AIAnalysis>> {
    return this.request(`/incidents/${incidentId}/analyze`, {
      method: 'POST',
      body: JSON.stringify({ analysisType }),
    });
  }

  async getRecommendations(incidentId: string): Promise<
    ApiResponse<{
      recommendations: string[];
      playbooks: Playbook[];
      aiPowered: boolean;
    }>
  > {
    return this.request(`/incidents/${incidentId}/recommendations`);
  }

  async correlateIndicators(indicators: Partial<Indicator>[]): Promise<
    ApiResponse<{
      relatedIncidents: IncidentSummary[];
      threatIntel: any[];
      riskScore: number;
    }>
  > {
    return this.request('/correlate', {
      method: 'POST',
      body: JSON.stringify({ indicators }),
    });
  }

  // ============= Playbook Endpoints =============

  async getPlaybooks(filters?: {
    category?: IncidentCategory;
    severity?: IncidentSeverity;
    active?: boolean;
  }): Promise<ApiResponse<{ playbooks: Playbook[] }>> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.active !== undefined) params.append('active', String(filters.active));

    return this.request(`/playbooks?${params.toString()}`);
  }

  async getPlaybook(playbookId: string): Promise<ApiResponse<{ playbook: Playbook }>> {
    return this.request(`/playbooks/${playbookId}`);
  }

  async executePlaybook(
    incidentId: string,
    playbookId: string
  ): Promise<
    ApiResponse<{
      execution: {
        executionId: string;
        status: string;
        currentStep: number;
        results: any[];
      };
    }>
  > {
    return this.request(`/incidents/${incidentId}/execute-playbook`, {
      method: 'POST',
      body: JSON.stringify({ playbookId }),
    });
  }

  // ============= Team & Communication =============

  async notifyTeam(
    incidentId: string,
    data: {
      channel: 'email' | 'slack' | 'pagerduty' | 'teams';
      recipients?: string[];
      message?: string;
    }
  ): Promise<ApiResponse<{ sent: boolean }>> {
    return this.request(`/incidents/${incidentId}/notify`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async escalateIncident(
    incidentId: string,
    data: {
      escalateTo: string;
      reason: string;
      newSeverity?: IncidentSeverity;
    }
  ): Promise<ApiResponse<{ incident: Incident }>> {
    return this.request(`/incidents/${incidentId}/escalate`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Export singleton instance
export const incidentresponseApi = new IncidentResponseApi();

// Alias for backward compatibility
export const incidentApi = incidentresponseApi;

// ============= Simulation Helper =============

/**
 * Generate simulated data when API is unavailable
 */
export const simulatedData = {
  generateIncident(severity: IncidentSeverity = 'high', status: IncidentStatus = 'open'): Incident {
    const id = `INC-${Date.now()}`;
    const now = new Date();

    return {
      _id: id,
      incidentId: id,
      title: 'Suspicious Login Activity Detected',
      description:
        'Multiple failed login attempts followed by successful login from unusual location',
      severity,
      status,
      category: 'unauthorized-access',
      source: {
        type: 'siem',
        reference: 'SIEM-ALERT-12345',
        detectedAt: now.toISOString(),
      },
      affectedAssets: [
        {
          assetId: 'AST-001',
          name: 'prod-web-server-01',
          type: 'server',
          criticality: 'critical',
          status: 'at-risk',
        },
      ],
      timeline: [
        {
          timestamp: now.toISOString(),
          action: 'Incident Created',
          performedBy: 'System',
          details: 'Auto-created from SIEM alert',
        },
      ],
      indicators: [
        {
          type: 'ip',
          value: '203.0.113.42',
          confidence: 'high',
          source: 'SIEM',
          tags: ['suspicious', 'tor-exit-node'],
        },
      ],
      metrics: {
        impactScore: 75,
      },
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  },

  dashboard: {
    overview: {
      total: 156,
      open: 23,
      investigating: 18,
      contained: 8,
      closed: 107,
    },
    bySeverity: {
      critical: 5,
      high: 28,
      medium: 67,
      low: 45,
      informational: 11,
    },
    byCategory: {
      'unauthorized-access': 45,
      malware: 32,
      phishing: 28,
      'data-breach': 12,
      ddos: 8,
      other: 31,
    },
    metrics: {
      avgTimeToDetect: 15,
      avgTimeToContain: 45,
      avgTimeToResolve: 180,
      mttr: 240,
    },
    recentIncidents: [
      {
        incidentId: 'INC-2024-001',
        title: 'Ransomware Attack Attempt',
        severity: 'critical' as IncidentSeverity,
        status: 'investigating' as IncidentStatus,
        createdAt: new Date().toISOString(),
        assignee: 'security-team',
      },
      {
        incidentId: 'INC-2024-002',
        title: 'Phishing Email Campaign',
        severity: 'high' as IncidentSeverity,
        status: 'contained' as IncidentStatus,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        assignee: 'soc-analyst-1',
      },
    ],
    trending: [
      { category: 'phishing', count: 15, trend: 'up' as const },
      { category: 'malware', count: 8, trend: 'down' as const },
      { category: 'unauthorized-access', count: 12, trend: 'stable' as const },
    ],
  } as IncidentDashboard,

  playbooks: [
    {
      _id: 'PB-001',
      playbookId: 'PB-001',
      name: 'Ransomware Response',
      description: 'Standard operating procedure for ransomware incidents',
      category: 'ransomware' as IncidentCategory,
      severity: ['critical', 'high'] as IncidentSeverity[],
      steps: [
        {
          order: 1,
          name: 'Isolate Affected Systems',
          description: 'Immediately disconnect affected systems from network',
          type: 'manual' as const,
          actions: ['Disconnect network cable', 'Disable WiFi', 'Block at firewall'],
          expectedDuration: 5,
        },
        {
          order: 2,
          name: 'Preserve Evidence',
          description: 'Capture memory dump and disk image',
          type: 'manual' as const,
          actions: ['Take memory dump', 'Create disk image', 'Screenshot ransom note'],
          expectedDuration: 30,
        },
      ],
      automatable: false,
      estimatedTime: 240,
      isActive: true,
      version: '1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ] as Playbook[],

  aiAnalysis: {
    incidentId: 'INC-001',
    analysisType: 'threat',
    confidence: 0.85,
    findings: [
      'Attack pattern matches known APT group techniques',
      'Indicators correlate with previous campaign from Q3 2024',
      'Lateral movement detected across 3 systems',
    ],
    recommendations: [
      'Immediately isolate affected systems',
      'Reset credentials for all compromised accounts',
      'Enable enhanced monitoring on similar assets',
      'Review access logs for past 72 hours',
    ],
    relatedIncidents: ['INC-2024-089', 'INC-2024-076'],
    threatActorProfile: {
      likelihood: 'high',
      motivation: 'Financial gain',
      capabilities: ['Social engineering', 'Malware deployment', 'Data exfiltration'],
    },
    aiPowered: false,
    simulated: true,
  } as AIAnalysis,
};
