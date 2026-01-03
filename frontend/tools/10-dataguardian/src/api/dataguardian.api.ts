/**
 * DataGuardian API Client
 * Tool 10 - Data Privacy & Protection Management
 * 
 * TypeScript client for communicating with DataGuardian backend
 * Supports DSR Management, Consent Management, and Data Retention
 */

const API_BASE_URL = import.meta.env.VITE_DATAGUARDIAN_API_URL || 'http://localhost:4010/api';

// ============= Core Types =============

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

// ============= DSR (Data Subject Request) Types =============

export type DSRType = 'access' | 'erasure' | 'portability' | 'rectification' | 'restriction' | 'objection';
export type DSRStatus = 'pending' | 'verified' | 'in-progress' | 'data-collected' | 'review' | 'completed' | 'rejected' | 'expired';
export type Regulation = 'GDPR' | 'CCPA' | 'LGPD' | 'POPIA' | 'PDPA' | 'PIPEDA' | 'other';

export interface DataSubject {
  email: string;
  name?: string;
  phone?: string;
  userId?: string;
  customerId?: string;
  identifiers?: Record<string, string>;
}

export interface DataSubjectRequest {
  _id: string;
  requestId: string;
  type: DSRType;
  dataSubject: DataSubject;
  regulation: Regulation;
  status: DSRStatus;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  timeline: {
    receivedAt: string;
    verifiedAt?: string;
    dueDate: string;
    completedAt?: string;
  };
  discovery?: {
    systemsSearched: number;
    recordsFound: number;
    dataCategories: string[];
    sensitiveDataFound: boolean;
  };
  actions: Array<{
    action: string;
    performedBy: string;
    performedAt: string;
    notes?: string;
  }>;
  response?: {
    status: 'fulfilled' | 'partially-fulfilled' | 'denied';
    message?: string;
    deliveryMethod?: 'email' | 'portal' | 'mail';
  };
  daysRemaining?: number;
  isOverdue?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DSRDashboard {
  overview: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
  byType: Record<DSRType, number>;
  byRegulation: Record<string, number>;
  avgProcessingTime: number;
  complianceRate: number;
  upcomingDue: DSRSummary[];
}

export interface DSRSummary {
  requestId: string;
  type: DSRType;
  dueDate: string;
  daysRemaining: number;
}

export interface DataDiscoveryResult {
  discoveryId: string;
  query: string;
  systemsSearched: number;
  recordsFound: number;
  categories: Array<{
    category: string;
    recordCount: number;
    systems: string[];
  }>;
  sensitiveData: Array<{
    type: string;
    locations: string[];
    riskLevel: string;
  }>;
  recommendations: string[];
  aiPowered: boolean;
  simulated?: boolean;
}

export interface PIAResult {
  assessmentId: string;
  projectName: string;
  dataCategories: string[];
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  dpiaRequired: boolean;
  findings: Array<{
    area: string;
    finding: string;
    risk: string;
    recommendation: string;
  }>;
  mitigations: string[];
  aiPowered: boolean;
  simulated?: boolean;
}

// ============= Consent Types =============

export type ConsentStatus = 'granted' | 'denied' | 'withdrawn' | 'expired' | 'pending';
export type ConsentMethod = 'explicit' | 'implicit' | 'opt-in' | 'opt-out' | 'double-opt-in';

export interface ConsentPurpose {
  code: string;
  name: string;
  description?: string;
  legalBasis: string;
  retention?: string;
}

export interface ConsentRecord {
  _id: string;
  consentId: string;
  dataSubject: DataSubject;
  purpose: ConsentPurpose;
  consent: {
    status: ConsentStatus;
    method: ConsentMethod;
    givenAt: string;
    expiresAt?: string;
  };
  regulations: Regulation[];
  processing: {
    allowed: boolean;
    restrictions?: string[];
  };
  source: {
    channel: string;
    ipAddress?: string;
    userAgent?: string;
  };
  proof?: {
    type: string;
    reference: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ConsentPreferences {
  identifier: string;
  preferences: Array<{
    purposeCode: string;
    purposeName: string;
    status: ConsentStatus;
    lastUpdated: string;
  }>;
  lastUpdated: string;
}

export interface ConsentDashboard {
  overview: {
    total: number;
    granted: number;
    denied: number;
    withdrawn: number;
    expired: number;
    pending: number;
  };
  byPurpose: Record<string, number>;
  byRegulation: Record<string, number>;
  byMethod: Record<string, number>;
  consentRate: number;
  expiringThisMonth: number;
}

// ============= Retention Types =============

export type DispositionAction = 'delete' | 'archive' | 'anonymize' | 'review' | 'extend';
export type RetentionPolicyStatus = 'draft' | 'active' | 'paused' | 'archived';

export interface RetentionScope {
  dataCategories: string[];
  systems?: string[];
  departments?: string[];
  regulations?: string[];
}

export interface RetentionSchedule {
  type: 'one-time' | 'recurring';
  frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  nextRun?: string;
  lastRun?: string;
}

export interface DataRetentionPolicy {
  _id: string;
  policyId: string;
  name: string;
  description?: string;
  scope: RetentionScope;
  retention: {
    duration: number;
    unit: 'days' | 'months' | 'years';
    basis: 'creation' | 'last-access' | 'last-update' | 'custom';
  };
  disposition: {
    action: DispositionAction;
    requiresApproval: boolean;
    approvers?: string[];
    notification?: {
      enabled: boolean;
      daysBefore: number;
      recipients: string[];
    };
  };
  legalHold?: {
    active: boolean;
    reason?: string;
    appliedBy?: string;
    appliedAt?: string;
    expiresAt?: string;
  };
  schedule: RetentionSchedule;
  status: RetentionPolicyStatus;
  statistics: {
    recordsManaged: number;
    recordsDisposed: number;
    lastExecution?: string;
    nextDisposition?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RetentionExecution {
  executionId: string;
  policyId: string;
  startedAt: string;
  completedAt?: string;
  status: 'running' | 'completed' | 'failed' | 'pending-approval';
  recordsProcessed: number;
  recordsDisposed: number;
  recordsRetained: number;
  errors?: string[];
}

export interface PendingDisposition {
  executionId: string;
  policyName: string;
  recordCount: number;
  action: DispositionAction;
  requestedAt: string;
  requestedBy: string;
}

export interface RetentionDashboard {
  overview: {
    totalPolicies: number;
    activePolicies: number;
    recordsManaged: number;
    recordsDisposed: number;
    legalHoldActive: number;
  };
  byCategory: Record<string, number>;
  upcomingDispositions: Array<{
    policyId: string;
    policyName: string;
    scheduledDate: string;
    recordCount: number;
  }>;
  pendingApprovals: number;
  complianceRate: number;
}

// ============= Unified Dashboard Types =============

export interface UnifiedDashboard {
  dsr: DSRDashboard;
  consent: ConsentDashboard;
  retention: RetentionDashboard;
  complianceScore: number;
  summary: {
    privacyHealth: 'excellent' | 'good' | 'needs-attention' | 'critical';
    alerts: Array<{
      type: string;
      message: string;
      severity: 'info' | 'warning' | 'critical';
    }>;
    recentActivity: Array<{
      action: string;
      timestamp: string;
      details: string;
    }>;
  };
}

// ============= Asset Types (Legacy) =============

export interface DataAsset {
  _id: string;
  name: string;
  type: string;
  classification: string;
  owner?: string;
  sensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
  piiDetected?: boolean;
  riskScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Policy {
  _id: string;
  name: string;
  description?: string;
  type: string;
  status: 'draft' | 'active' | 'inactive';
  rules?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface Incident {
  _id: string;
  title: string;
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';
  affectedAssets?: string[];
  actions?: any[];
  createdAt: string;
  updatedAt: string;
}

// ============= API Client Class =============

class DataGuardianApi {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
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
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }

  // ============= DSR (Data Subject Request) Endpoints =============

  async createDSR(data: {
    type: DSRType;
    dataSubject: DataSubject;
    regulation?: Regulation;
    description?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }): Promise<ApiResponse<{ dsr: DataSubjectRequest }>> {
    return this.request('/dsr', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDSRs(filters?: {
    status?: DSRStatus;
    type?: DSRType;
    regulation?: Regulation;
    overdue?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ dsrs: DataSubjectRequest[]; pagination: Pagination }>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.regulation) params.append('regulation', filters.regulation);
    if (filters?.overdue !== undefined) params.append('overdue', String(filters.overdue));
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    
    return this.request(`/dsr?${params.toString()}`);
  }

  async getDSR(dsrId: string): Promise<ApiResponse<{ dsr: DataSubjectRequest }>> {
    return this.request(`/dsr/${dsrId}`);
  }

  async processDSR(dsrId: string, action: {
    action: string;
    performedBy: string;
    notes?: string;
    newStatus?: DSRStatus;
  }): Promise<ApiResponse<{ dsr: DataSubjectRequest }>> {
    return this.request(`/dsr/${dsrId}/process`, {
      method: 'POST',
      body: JSON.stringify(action),
    });
  }

  async getDSRDashboard(): Promise<ApiResponse<DSRDashboard>> {
    return this.request('/dsr/dashboard');
  }

  async discoverData(query: {
    email?: string;
    userId?: string;
    identifiers?: Record<string, string>;
    systems?: string[];
  }): Promise<ApiResponse<DataDiscoveryResult>> {
    return this.request('/discovery', {
      method: 'POST',
      body: JSON.stringify(query),
    });
  }

  async performPIA(data: {
    projectName: string;
    description?: string;
    dataCategories: string[];
    processingPurposes: string[];
    dataSubjectTypes?: string[];
  }): Promise<ApiResponse<PIAResult>> {
    return this.request('/pia', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============= Consent Endpoints =============

  async recordConsent(data: {
    dataSubject: DataSubject;
    purpose: ConsentPurpose;
    consent: {
      status: ConsentStatus;
      method: ConsentMethod;
      expiresAt?: string;
    };
    regulations?: Regulation[];
    source?: {
      channel: string;
      ipAddress?: string;
      userAgent?: string;
    };
  }): Promise<ApiResponse<{ consent: ConsentRecord }>> {
    return this.request('/consent', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyConsent(data: {
    consentId: string;
    verificationToken: string;
  }): Promise<ApiResponse<{ consent: ConsentRecord }>> {
    return this.request('/consent/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async withdrawConsent(consentId: string, reason?: string): Promise<ApiResponse<{ consent: ConsentRecord }>> {
    return this.request(`/consent/${consentId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    });
  }

  async checkConsent(identifier: string, purposeCode: string): Promise<ApiResponse<{
    allowed: boolean;
    consent?: ConsentRecord;
    reason?: string;
  }>> {
    const params = new URLSearchParams();
    params.append('identifier', identifier);
    params.append('purposeCode', purposeCode);
    return this.request(`/consent/check?${params.toString()}`);
  }

  async getDataSubjectConsents(identifier: string): Promise<ApiResponse<{
    consents: ConsentRecord[];
  }>> {
    return this.request(`/consent/subject/${encodeURIComponent(identifier)}`);
  }

  async getConsentPreferences(identifier: string): Promise<ApiResponse<ConsentPreferences>> {
    return this.request(`/consent/preferences/${encodeURIComponent(identifier)}`);
  }

  async updateConsentPreferences(identifier: string, preferences: Array<{
    purposeCode: string;
    status: ConsentStatus;
  }>): Promise<ApiResponse<{ updated: number }>> {
    return this.request(`/consent/preferences/${encodeURIComponent(identifier)}`, {
      method: 'PUT',
      body: JSON.stringify({ preferences }),
    });
  }

  async getConsentDashboard(): Promise<ApiResponse<ConsentDashboard>> {
    return this.request('/consent/dashboard');
  }

  // ============= Retention Endpoints =============

  async createRetentionPolicy(data: {
    name: string;
    description?: string;
    scope: RetentionScope;
    retention: {
      duration: number;
      unit: 'days' | 'months' | 'years';
      basis?: 'creation' | 'last-access' | 'last-update' | 'custom';
    };
    disposition: {
      action: DispositionAction;
      requiresApproval?: boolean;
      approvers?: string[];
    };
    schedule?: RetentionSchedule;
  }): Promise<ApiResponse<{ policy: DataRetentionPolicy }>> {
    return this.request('/retention', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRetentionPolicies(filters?: {
    status?: RetentionPolicyStatus;
    category?: string;
    hasLegalHold?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ policies: DataRetentionPolicy[]; pagination: Pagination }>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.hasLegalHold !== undefined) params.append('hasLegalHold', String(filters.hasLegalHold));
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    
    return this.request(`/retention?${params.toString()}`);
  }

  async getRetentionPolicy(policyId: string): Promise<ApiResponse<{ policy: DataRetentionPolicy }>> {
    return this.request(`/retention/${policyId}`);
  }

  async updateRetentionPolicy(policyId: string, updates: Partial<DataRetentionPolicy>): Promise<ApiResponse<{ policy: DataRetentionPolicy }>> {
    return this.request(`/retention/${policyId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteRetentionPolicy(policyId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request(`/retention/${policyId}`, {
      method: 'DELETE',
    });
  }

  async executeRetentionPolicy(policyId: string): Promise<ApiResponse<RetentionExecution>> {
    return this.request(`/retention/${policyId}/execute`, {
      method: 'POST',
    });
  }

  async applyLegalHold(policyId: string, data: {
    reason: string;
    appliedBy: string;
    expiresAt?: string;
  }): Promise<ApiResponse<{ policy: DataRetentionPolicy }>> {
    return this.request(`/retention/${policyId}/hold`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async releaseLegalHold(policyId: string, data: {
    releasedBy: string;
    reason?: string;
  }): Promise<ApiResponse<{ policy: DataRetentionPolicy }>> {
    return this.request(`/retention/${policyId}/hold`, {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  }

  async getPendingDispositions(): Promise<ApiResponse<{ pending: PendingDisposition[] }>> {
    return this.request('/retention/pending');
  }

  async approveDisposition(executionId: string, data: {
    approvedBy: string;
    comments?: string;
  }): Promise<ApiResponse<RetentionExecution>> {
    return this.request(`/retention/${executionId}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRetentionDashboard(): Promise<ApiResponse<RetentionDashboard>> {
    return this.request('/retention/dashboard');
  }

  // ============= Unified Dashboard =============

  async getUnifiedDashboard(): Promise<ApiResponse<UnifiedDashboard>> {
    return this.request('/dashboard/unified');
  }

  // ============= Asset Endpoints (Legacy) =============

  async createAsset(data: Partial<DataAsset>): Promise<ApiResponse<{ asset: DataAsset }>> {
    return this.request('/assets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAssets(filters?: {
    type?: string;
    classification?: string;
    sensitivity?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ assets: DataAsset[]; pagination?: Pagination }>> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.classification) params.append('classification', filters.classification);
    if (filters?.sensitivity) params.append('sensitivity', filters.sensitivity);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    
    return this.request(`/assets?${params.toString()}`);
  }

  async getAsset(assetId: string): Promise<ApiResponse<{ asset: DataAsset }>> {
    return this.request(`/assets/${assetId}`);
  }

  async classifyAsset(assetId: string): Promise<ApiResponse<{ asset: DataAsset }>> {
    return this.request(`/assets/${assetId}/classify`, {
      method: 'POST',
    });
  }

  async assessAssetRisk(assetId: string): Promise<ApiResponse<{ riskScore: number; factors: any[] }>> {
    return this.request(`/assets/${assetId}/risk`);
  }

  async scanPII(data: { content: string; contentType?: string }): Promise<ApiResponse<{
    piiFound: boolean;
    matches: Array<{ type: string; count: number; samples?: string[] }>;
  }>> {
    return this.request('/scan/pii', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============= Policy Endpoints (Legacy) =============

  async createPolicy(data: Partial<Policy>): Promise<ApiResponse<{ policy: Policy }>> {
    return this.request('/policies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPolicies(): Promise<ApiResponse<{ policies: Policy[] }>> {
    return this.request('/policies');
  }

  async activatePolicy(policyId: string): Promise<ApiResponse<{ policy: Policy }>> {
    return this.request(`/policies/${policyId}/activate`, {
      method: 'POST',
    });
  }

  async evaluatePolicy(policyId: string, data: any): Promise<ApiResponse<{ result: any }>> {
    return this.request(`/policies/${policyId}/evaluate`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============= Incident Endpoints (Legacy) =============

  async createIncident(data: Partial<Incident>): Promise<ApiResponse<{ incident: Incident }>> {
    return this.request('/incidents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getIncidents(): Promise<ApiResponse<{ incidents: Incident[] }>> {
    return this.request('/incidents');
  }

  async getIncidentDashboard(): Promise<ApiResponse<any>> {
    return this.request('/incidents/dashboard');
  }

  async analyzeIncident(incidentId: string): Promise<ApiResponse<any>> {
    return this.request(`/incidents/${incidentId}/analyze`, {
      method: 'POST',
    });
  }
}

// Export singleton instance
export const dataGuardianApi = new DataGuardianApi();

// Export class for testing/custom instances
export { DataGuardianApi };

// ============= Simulation Helper =============

/**
 * Generate simulated data when API is unavailable
 */
export const simulatedData = {
  // DSR simulated data
  generateDSR(type: DSRType = 'access', status: DSRStatus = 'pending'): DataSubjectRequest {
    const id = `DSR-${Date.now()}`;
    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    
    return {
      _id: id,
      requestId: id,
      type,
      status,
      regulation: 'GDPR',
      dataSubject: {
        email: 'data.subject@example.com',
        name: 'John Doe',
      },
      timeline: {
        receivedAt: now.toISOString(),
        dueDate: dueDate.toISOString(),
      },
      discovery: {
        systemsSearched: 5,
        recordsFound: 127,
        dataCategories: ['contact', 'financial', 'behavioral'],
        sensitiveDataFound: true,
      },
      actions: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  },

  dsrDashboard: {
    overview: {
      total: 156,
      pending: 23,
      inProgress: 18,
      completed: 112,
      overdue: 3,
    },
    byType: {
      access: 89,
      erasure: 45,
      portability: 12,
      rectification: 7,
      restriction: 2,
      objection: 1,
    },
    byRegulation: {
      GDPR: 98,
      CCPA: 45,
      LGPD: 8,
      other: 5,
    },
    avgProcessingTime: 18.5,
    complianceRate: 97.4,
    upcomingDue: [
      { requestId: 'DSR-001', type: 'access' as DSRType, dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), daysRemaining: 2 },
      { requestId: 'DSR-002', type: 'erasure' as DSRType, dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), daysRemaining: 5 },
    ],
  } as DSRDashboard,

  // Consent simulated data
  generateConsent(status: ConsentStatus = 'granted'): ConsentRecord {
    const id = `CON-${Date.now()}`;
    const now = new Date();
    
    return {
      _id: id,
      consentId: id,
      dataSubject: {
        email: 'user@example.com',
        name: 'Jane Smith',
      },
      purpose: {
        code: 'MARKETING',
        name: 'Marketing Communications',
        description: 'Receive promotional emails and offers',
        legalBasis: 'consent',
      },
      consent: {
        status,
        method: 'explicit',
        givenAt: now.toISOString(),
      },
      regulations: ['GDPR'],
      processing: {
        allowed: status === 'granted',
      },
      source: {
        channel: 'web',
      },
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  },

  consentDashboard: {
    overview: {
      total: 12450,
      granted: 9876,
      denied: 1234,
      withdrawn: 890,
      expired: 350,
      pending: 100,
    },
    byPurpose: {
      'MARKETING': 5432,
      'ANALYTICS': 4321,
      'PERSONALIZATION': 2345,
      'THIRD_PARTY': 352,
    },
    byRegulation: {
      GDPR: 8900,
      CCPA: 2500,
      LGPD: 750,
      other: 300,
    },
    byMethod: {
      explicit: 7500,
      'double-opt-in': 3200,
      'opt-in': 1500,
      implicit: 250,
    },
    consentRate: 79.3,
    expiringThisMonth: 156,
  } as ConsentDashboard,

  // Retention simulated data
  generateRetentionPolicy(status: RetentionPolicyStatus = 'active'): DataRetentionPolicy {
    const id = `RET-${Date.now()}`;
    const now = new Date();
    
    return {
      _id: id,
      policyId: id,
      name: 'Customer Data Retention',
      description: 'Retain customer data for 7 years per regulatory requirements',
      scope: {
        dataCategories: ['customer', 'financial', 'transactional'],
        regulations: ['GDPR', 'SOX'],
      },
      retention: {
        duration: 7,
        unit: 'years',
        basis: 'creation',
      },
      disposition: {
        action: 'delete',
        requiresApproval: true,
        approvers: ['dpo@company.com'],
      },
      schedule: {
        type: 'recurring',
        frequency: 'monthly',
      },
      status,
      statistics: {
        recordsManaged: 1250000,
        recordsDisposed: 45000,
      },
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  },

  retentionDashboard: {
    overview: {
      totalPolicies: 24,
      activePolicies: 18,
      recordsManaged: 15600000,
      recordsDisposed: 2340000,
      legalHoldActive: 3,
    },
    byCategory: {
      customer: 8,
      financial: 6,
      hr: 4,
      marketing: 3,
      logs: 3,
    },
    upcomingDispositions: [
      { policyId: 'RET-001', policyName: 'Marketing Data', scheduledDate: new Date(Date.now() + 86400000 * 7).toISOString(), recordCount: 45000 },
      { policyId: 'RET-002', policyName: 'Log Files', scheduledDate: new Date(Date.now() + 86400000 * 14).toISOString(), recordCount: 890000 },
    ],
    pendingApprovals: 2,
    complianceRate: 98.5,
  } as RetentionDashboard,

  // Unified dashboard
  unifiedDashboard: {
    complianceScore: 94.2,
    summary: {
      privacyHealth: 'good' as const,
      alerts: [
        { type: 'dsr', message: '3 DSRs are overdue', severity: 'warning' as const },
        { type: 'consent', message: '156 consents expiring this month', severity: 'info' as const },
        { type: 'retention', message: '2 dispositions pending approval', severity: 'info' as const },
      ],
      recentActivity: [
        { action: 'DSR Completed', timestamp: new Date().toISOString(), details: 'Access request DSR-123 fulfilled' },
        { action: 'Consent Updated', timestamp: new Date(Date.now() - 3600000).toISOString(), details: 'User withdrew marketing consent' },
        { action: 'Policy Executed', timestamp: new Date(Date.now() - 7200000).toISOString(), details: 'Deleted 12,000 expired records' },
      ],
    },
  },

  discoveryResult: {
    discoveryId: `DISC-${Date.now()}`,
    query: 'user@example.com',
    systemsSearched: 8,
    recordsFound: 245,
    categories: [
      { category: 'contact', recordCount: 12, systems: ['CRM', 'Email'] },
      { category: 'financial', recordCount: 89, systems: ['Billing', 'Payments'] },
      { category: 'behavioral', recordCount: 144, systems: ['Analytics', 'Marketing'] },
    ],
    sensitiveData: [
      { type: 'email', locations: ['CRM.contacts', 'Email.subscribers'], riskLevel: 'medium' },
      { type: 'payment_card', locations: ['Payments.transactions'], riskLevel: 'high' },
    ],
    recommendations: [
      'Consider data minimization for behavioral tracking',
      'Implement encryption for payment data at rest',
      'Review access controls for sensitive data stores',
    ],
    aiPowered: false,
    simulated: true,
  } as DataDiscoveryResult,

  piaResult: {
    assessmentId: `PIA-${Date.now()}`,
    projectName: 'Customer Analytics Platform',
    dataCategories: ['behavioral', 'demographic', 'transactional'],
    riskScore: 72,
    riskLevel: 'medium' as const,
    dpiaRequired: true,
    findings: [
      {
        area: 'Data Collection',
        finding: 'Collecting behavioral data without explicit consent',
        risk: 'GDPR violation risk',
        recommendation: 'Implement consent management for tracking',
      },
      {
        area: 'Data Storage',
        finding: 'Sensitive data stored in unencrypted database',
        risk: 'Data breach risk',
        recommendation: 'Enable encryption at rest for all databases',
      },
    ],
    mitigations: [
      'Implement consent management platform',
      'Enable database encryption',
      'Conduct annual privacy reviews',
    ],
    aiPowered: false,
    simulated: true,
  } as PIAResult,
};
