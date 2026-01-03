/**
 * AuditTrail API Client - Tool 17 - Compliance Audit Logging
 */
const API_BASE_URL = import.meta.env.VITE_AUDITTRAIL_API_URL || 'http://localhost:4017/api/v1/audittrail';

export interface AuditEvent { _id: string; action: string; actor: string; resource: string; resourceType: string; outcome: 'success' | 'failure'; ipAddress: string; userAgent?: string; metadata?: Record<string, any>; timestamp: string; }
export interface AuditQuery { startDate?: string; endDate?: string; actor?: string; action?: string; resourceType?: string; page?: number; limit?: number; }
export interface AuditDashboard { overview: { totalEvents: number; successRate: number; uniqueActors: number; criticalEvents: number; }; eventsByAction: { action: string; count: number; }[]; recentEvents: AuditEvent[]; }
export interface ApiResponse<T> { success: boolean; data?: T; error?: string; simulated?: boolean; }

class AuditTrailApi {
  private baseUrl: string;
  constructor(baseUrl: string = API_BASE_URL) { this.baseUrl = baseUrl; }
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try { const r = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } }); const d = await r.json(); if (!r.ok) return { success: false, error: d.error }; return d; }
    catch (e) { return { success: false, error: e instanceof Error ? e.message : 'Network error' }; }
  }
  async getDashboard(): Promise<ApiResponse<AuditDashboard>> { return this.request('/dashboard'); }
  async getEvents(query?: AuditQuery): Promise<ApiResponse<{ events: AuditEvent[]; total: number }>> { const q = query ? '?' + new URLSearchParams(query as any).toString() : ''; return this.request(`/events${q}`); }
}

export const auditTrailApi = new AuditTrailApi();
export const simulatedData = {
  dashboard: { overview: { totalEvents: 125000, successRate: 98.5, uniqueActors: 342, criticalEvents: 28 }, eventsByAction: [{ action: 'login', count: 45000 }, { action: 'read', count: 35000 }, { action: 'update', count: 25000 }], recentEvents: [{ _id: '1', action: 'login', actor: 'admin@company.com', resource: 'auth-service', resourceType: 'service', outcome: 'success', ipAddress: '192.168.1.100', timestamp: new Date().toISOString() }] } as AuditDashboard,
  events: [{ _id: '1', action: 'create', actor: 'user1@company.com', resource: 'policy-123', resourceType: 'policy', outcome: 'success', ipAddress: '10.0.0.50', timestamp: new Date().toISOString() }] as AuditEvent[],
};
