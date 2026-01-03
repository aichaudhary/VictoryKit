/**
 * ThreatModel API Client - Tool 18 - Threat Modeling & Analysis
 */
const API_BASE_URL = import.meta.env.VITE_THREATMODEL_API_URL || 'http://localhost:4018/api/v1/threatmodel';

export interface Threat { _id: string; name: string; category: 'STRIDE' | 'DREAD' | 'PASTA'; type: string; description: string; severity: 'low' | 'medium' | 'high' | 'critical'; likelihood: number; impact: number; mitigations: string[]; assets: string[]; status: 'identified' | 'mitigated' | 'accepted' | 'transferred'; createdAt: string; }
export interface ThreatModel { _id: string; name: string; description: string; scope: string; threats: Threat[]; assets: { name: string; type: string; value: string }[]; attackSurface: string[]; createdAt: string; updatedAt: string; }
export interface ThreatDashboard { overview: { totalModels: number; totalThreats: number; mitigatedThreats: number; criticalThreats: number; }; threatsByCategory: { category: string; count: number }[]; recentThreats: Threat[]; }
export interface ApiResponse<T> { success: boolean; data?: T; error?: string; simulated?: boolean; }

class ThreatModelApi {
  private baseUrl: string;
  constructor(baseUrl: string = API_BASE_URL) { this.baseUrl = baseUrl; }
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try { const r = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } }); const d = await r.json(); if (!r.ok) return { success: false, error: d.error }; return d; }
    catch (e) { return { success: false, error: e instanceof Error ? e.message : 'Network error' }; }
  }
  async getDashboard(): Promise<ApiResponse<ThreatDashboard>> { return this.request('/dashboard'); }
  async getModels(): Promise<ApiResponse<ThreatModel[]>> { return this.request('/models'); }
  async getThreats(): Promise<ApiResponse<Threat[]>> { return this.request('/threats'); }
}

export const threatModelApi = new ThreatModelApi();
export const simulatedData = {
  dashboard: { overview: { totalModels: 24, totalThreats: 186, mitigatedThreats: 142, criticalThreats: 12 }, threatsByCategory: [{ category: 'STRIDE', count: 85 }, { category: 'DREAD', count: 56 }, { category: 'PASTA', count: 45 }], recentThreats: [{ _id: '1', name: 'SQL Injection', category: 'STRIDE', type: 'Tampering', description: 'User input not sanitized', severity: 'critical', likelihood: 0.8, impact: 0.9, mitigations: ['Parameterized queries'], assets: ['Database'], status: 'identified', createdAt: new Date().toISOString() }] } as ThreatDashboard,
  models: [{ _id: '1', name: 'Web App Model', description: 'Main web app threat model', scope: 'Production', threats: [], assets: [], attackSurface: ['API Endpoints'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }] as ThreatModel[],
};
