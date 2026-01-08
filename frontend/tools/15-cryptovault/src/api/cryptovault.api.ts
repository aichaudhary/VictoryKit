/**
 * CryptoVault API Client - Tool 15 - Secure Secrets Management
 */
const API_BASE_URL = import.meta.env.VITE_CRYPTOVAULT_API_URL || 'http://localhost:4015/api/v1';

export interface Secret { _id: string; name: string; path: string; version: number; createdAt: string; updatedAt: string; expiresAt?: string; metadata?: Record<string, any>; }
export interface VaultDashboard { overview: { totalSecrets: number; totalVersions: number; expiringSoon: number; accessCount24h: number; }; recentAccess: { secret: string; action: string; user: string; timestamp: string; }[]; }
export interface ApiResponse<T> { success: boolean; data?: T; error?: string; simulated?: boolean; }

class CryptoVaultApi {
  private baseUrl: string;
  constructor(baseUrl: string = API_BASE_URL) { this.baseUrl = baseUrl; }
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try { const r = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } }); const d = await r.json(); if (!r.ok) return { success: false, error: d.error }; return d; } 
    catch (e) { return { success: false, error: e instanceof Error ? e.message : 'Network error' }; }
  }
  async getDashboard(): Promise<ApiResponse<VaultDashboard>> { return this.request('/dashboard'); }
  async getSecrets(): Promise<ApiResponse<Secret[]>> { return this.request('/secrets'); }
  async getSecret(id: string): Promise<ApiResponse<{ secret: Secret; value: string }>> { return this.request(`/secrets/${id}`); }
  async createSecret(data: { name: string; path: string; value: string }): Promise<ApiResponse<Secret>> { return this.request('/secrets', { method: 'POST', body: JSON.stringify(data) }); }
}

export const cryptoVaultApi = new CryptoVaultApi();
export const simulatedData = {
  dashboard: { overview: { totalSecrets: 342, totalVersions: 1250, expiringSoon: 15, accessCount24h: 8900 }, recentAccess: [{ secret: 'api-keys/production', action: 'read', user: 'ci-pipeline', timestamp: new Date().toISOString() }] } as VaultDashboard,
  secrets: [{ _id: '1', name: 'db-password', path: 'database/production', version: 5, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, { _id: '2', name: 'api-key', path: 'api-keys/main', version: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }] as Secret[],
};
