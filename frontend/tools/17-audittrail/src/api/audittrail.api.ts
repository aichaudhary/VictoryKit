/**
 * AuditTrail API Client - Tool 17 - Compliance Audit Logging
 * Enhanced with real-time, search, reports, and integrity features
 */
const API_BASE_URL = import.meta.env.VITE_AUDITTRAIL_API_URL || 'http://localhost:4017/api/v1/audittrail';

export interface AuditEvent { _id?: string; id?: string; action: string; actor: string; resource: string; resourceType?: string; eventType?: string; outcome?: 'success' | 'failure'; status?: string; riskLevel?: string; ipAddress?: string; userAgent?: string; metadata?: Record<string, any>; timestamp: string; }
export interface AuditQuery { startDate?: string; endDate?: string; actor?: string; action?: string; resourceType?: string; eventType?: string; riskLevel?: string; status?: string; page?: number; limit?: number; }
export interface AuditDashboard { overview: { totalEvents: number; successRate: number; uniqueActors: number; criticalEvents: number; failedEvents?: number; avgEventsPerHour?: number; }; eventsByAction?: { action: string; count: number; }[]; eventsByType?: Record<string, number>; eventsByRisk?: Record<string, number>; recentEvents: AuditEvent[]; topActors?: any[]; }
export interface DashboardData { summary?: any; eventsByType?: Record<string, number>; eventsByRisk?: Record<string, number>; recentEvents?: any[]; topActors?: any[]; alerts?: { open: number; acknowledged: number }; }
export interface SearchFilters { query?: string; eventTypes?: string[]; riskLevels?: string[]; status?: string; startDate?: string; endDate?: string; }
export interface ReportTemplate { id: string; name: string; description?: string; framework?: string; }
export interface ApiResponse<T> { success: boolean; data?: T; dashboard?: T; events?: any[]; results?: any[]; alerts?: any[]; status?: any; report?: any; templates?: ReportTemplate[]; filters?: Record<string, string[]>; pagination?: { page: number; limit: number; total: number; pages: number }; error?: string; simulated?: boolean; }

class AuditTrailApi {
  private baseUrl: string;
  constructor(baseUrl: string = API_BASE_URL) { this.baseUrl = baseUrl; }
  
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const r = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
      const d = await r.json();
      if (!r.ok) return { success: false, error: d.error };
      return d;
    } catch (e) { return { success: false, error: e instanceof Error ? e.message : 'Network error' }; }
  }

  // Dashboard & Stats
  async getDashboard(): Promise<ApiResponse<AuditDashboard>> { return this.request('/dashboard'); }
  async getStats(): Promise<ApiResponse<any>> { return this.request('/stats'); }
  
  // Events
  async getEvents(query?: AuditQuery): Promise<ApiResponse<{ events: AuditEvent[]; total: number; pagination: any }>> {
    const q = query ? '?' + new URLSearchParams(query as any).toString() : '';
    return this.request(`/events${q}`);
  }
  
  // Search
  async search(filters: SearchFilters): Promise<ApiResponse<AuditEvent[]>> {
    const params = new URLSearchParams();
    if (filters.query) params.set('q', filters.query);
    if (filters.eventTypes?.length) params.set('eventTypes', filters.eventTypes.join(','));
    if (filters.riskLevels?.length) params.set('riskLevels', filters.riskLevels.join(','));
    if (filters.status) params.set('status', filters.status);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    return this.request(`/search?${params.toString()}`);
  }
  
  async getFilterOptions(): Promise<ApiResponse<any>> { return this.request('/search/filters'); }
  
  // Alerts
  async getAlerts(): Promise<ApiResponse<any>> { return this.request('/alerts'); }
  async acknowledgeAlert(alertId: string, data: { userId: string; userName: string }): Promise<ApiResponse<any>> {
    return this.request(`/alerts/${alertId}/acknowledge`, { method: 'POST', body: JSON.stringify(data) });
  }
  async resolveAlert(alertId: string, data: { userId: string; userName: string; resolution: string }): Promise<ApiResponse<any>> {
    return this.request(`/alerts/${alertId}/resolve`, { method: 'POST', body: JSON.stringify(data) });
  }
  
  // Reports
  async generateReport(params: { framework: string; startDate: string; endDate: string; includeDetails?: boolean }): Promise<ApiResponse<any>> {
    return this.request(`/reports/generate?framework=${params.framework}&startDate=${params.startDate}&endDate=${params.endDate}&includeDetails=${params.includeDetails || false}`);
  }
  async getReportTemplates(): Promise<ApiResponse<any>> { return this.request('/reports/templates'); }
  async getExecutiveSummary(): Promise<ApiResponse<any>> { return this.request('/reports/executive-summary'); }
  
  // Integrity
  async getIntegrityStatus(): Promise<ApiResponse<any>> { return this.request('/integrity/status'); }
  async verifyIntegrity(): Promise<ApiResponse<any>> { return this.request('/integrity/verify', { method: 'POST' }); }
  
  // Log Sources
  async getLogSources(): Promise<ApiResponse<any>> { return this.request('/sources'); }
  async testLogSource(sourceId: string): Promise<ApiResponse<any>> { return this.request(`/sources/${sourceId}/test`, { method: 'POST' }); }
  
  // Alert Rules
  async getAlertRules(): Promise<ApiResponse<any>> { return this.request('/rules'); }
  async toggleAlertRule(ruleId: string): Promise<ApiResponse<any>> { return this.request(`/rules/${ruleId}/toggle`, { method: 'POST' }); }
}

export const auditTrailApi = new AuditTrailApi();

export const simulatedData = {
  dashboard: {
    overview: { totalEvents: 125000, successRate: 98.5, uniqueActors: 342, criticalEvents: 28, failedEvents: 1875, avgEventsPerHour: 520 },
    eventsByAction: [{ action: 'login', count: 45000 }, { action: 'read', count: 35000 }, { action: 'update', count: 25000 }],
    eventsByType: { authentication: 45000, data_access: 35000, data_modification: 25000, system_event: 12000, security_event: 8000 },
    eventsByRisk: { critical: 28, high: 156, medium: 2340, low: 122476 },
    recentEvents: [
      { _id: '1', action: 'login', actor: 'admin@company.com', resource: 'auth-service', resourceType: 'service', eventType: 'authentication', outcome: 'success', riskLevel: 'low', ipAddress: '192.168.1.100', timestamp: new Date().toISOString() },
      { _id: '2', action: 'update', actor: 'user1@company.com', resource: 'user-profile', resourceType: 'user', eventType: 'data_modification', outcome: 'success', riskLevel: 'medium', ipAddress: '10.0.0.50', timestamp: new Date(Date.now() - 60000).toISOString() },
      { _id: '3', action: 'delete', actor: 'admin@company.com', resource: 'api-key-123', resourceType: 'credential', eventType: 'security_event', outcome: 'success', riskLevel: 'high', ipAddress: '192.168.1.100', timestamp: new Date(Date.now() - 120000).toISOString() },
      { _id: '4', action: 'login', actor: 'unknown', resource: 'auth-service', resourceType: 'service', eventType: 'authentication', outcome: 'failure', riskLevel: 'critical', ipAddress: '203.0.113.50', timestamp: new Date(Date.now() - 180000).toISOString() },
    ],
    topActors: [
      { name: 'admin@company.com', type: 'user', count: 1250 },
      { name: 'api-gateway', type: 'service', count: 890 },
      { name: 'user1@company.com', type: 'user', count: 456 }
    ]
  } as AuditDashboard,
  events: [
    { _id: '1', action: 'create', actor: 'user1@company.com', resource: 'policy-123', resourceType: 'policy', eventType: 'data_modification', outcome: 'success', riskLevel: 'medium', ipAddress: '10.0.0.50', timestamp: new Date().toISOString() },
    { _id: '2', action: 'login', actor: 'admin@company.com', resource: 'auth-service', resourceType: 'service', eventType: 'authentication', outcome: 'success', riskLevel: 'low', ipAddress: '192.168.1.100', timestamp: new Date(Date.now() - 60000).toISOString() },
    { _id: '3', action: 'read', actor: 'user2@company.com', resource: 'config-file', resourceType: 'file', eventType: 'data_access', outcome: 'success', riskLevel: 'low', ipAddress: '10.0.0.51', timestamp: new Date(Date.now() - 120000).toISOString() },
    { _id: '4', action: 'update', actor: 'admin@company.com', resource: 'firewall-rules', resourceType: 'security', eventType: 'security_event', outcome: 'success', riskLevel: 'high', ipAddress: '192.168.1.100', timestamp: new Date(Date.now() - 180000).toISOString() },
    { _id: '5', action: 'login', actor: 'attacker', resource: 'auth-service', resourceType: 'service', eventType: 'authentication', outcome: 'failure', riskLevel: 'critical', ipAddress: '203.0.113.100', timestamp: new Date(Date.now() - 240000).toISOString() },
  ] as AuditEvent[],
};
