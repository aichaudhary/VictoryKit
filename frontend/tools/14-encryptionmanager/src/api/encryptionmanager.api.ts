/**
 * EncryptionManager API Client
 * Tool 14 - Key Management & Data Encryption
 */

const API_BASE_URL = import.meta.env.VITE_ENCRYPTIONMANAGER_API_URL || 'http://localhost:4014/api/v1/encryption';

export type KeyType = 'symmetric' | 'asymmetric' | 'hmac';
export type KeyAlgorithm = 'AES-256-GCM' | 'AES-128-GCM' | 'RSA-4096' | 'RSA-2048' | 'ECDSA-P384' | 'ECDSA-P256' | 'ChaCha20-Poly1305' | 'HMAC-SHA256' | 'HMAC-SHA512';
export type KeyStatus = 'active' | 'inactive' | 'expired' | 'compromised' | 'pending-deletion';

export interface EncryptionKey {
  _id: string;
  name: string;
  type: KeyType;
  algorithm: KeyAlgorithm;
  status: KeyStatus;
  createdAt: string;
  expiresAt?: string;
  rotationSchedule?: string;
  lastUsed?: string;
  usageCount: number;
  provider?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLog {
  _id: string;
  action: string;
  keyId?: string;
  keyName?: string;
  userId: string;
  timestamp: string;
  status: 'success' | 'failed';
  details?: Record<string, unknown>;
}

export interface Certificate {
  _id: string;
  domains: string[];
  provider: string;
  status: 'valid' | 'pending' | 'expired' | 'revoked' | 'renewing';
  issuedAt?: string;
  expiresAt?: string;
}

export interface EncryptionDashboard {
  overview: { totalKeys: number; activeKeys: number; expiringSoon: number; keyOperations24h: number; };
  keysByType: Record<KeyType, number>;
  keysByStatus: Record<KeyStatus, number>;
  recentOperations: { operation: string; keyName: string; timestamp: string; status: 'success' | 'failed'; }[];
}

export interface ApiResponse<T> { success: boolean; data?: T; error?: string; simulated?: boolean; }

class EncryptionManagerApi {
  private baseUrl: string;
  constructor(baseUrl: string = API_BASE_URL) { this.baseUrl = baseUrl; }
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.error || 'Request failed' };
      return data;
    } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Network error' }; }
  }
  async getDashboard(): Promise<ApiResponse<EncryptionDashboard>> { return this.request('/dashboard'); }
  async getKeys(): Promise<ApiResponse<EncryptionKey[]>> { return this.request('/keys'); }
  async getKey(keyId: string): Promise<ApiResponse<EncryptionKey>> { return this.request(`/keys/${keyId}`); }
  async createKey(key: { name: string; type: KeyType; algorithm: KeyAlgorithm; description?: string }): Promise<ApiResponse<EncryptionKey>> { return this.request('/keys', { method: 'POST', body: JSON.stringify(key) }); }
  async rotateKey(keyId: string): Promise<ApiResponse<EncryptionKey>> { return this.request(`/keys/${keyId}/rotate`, { method: 'POST' }); }
  async updateKeyStatus(keyId: string, status: KeyStatus): Promise<ApiResponse<EncryptionKey>> { return this.request(`/keys/${keyId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); }
  async deleteKey(keyId: string, force?: boolean): Promise<ApiResponse<void>> { return this.request(`/keys/${keyId}${force ? '?force=true' : ''}`, { method: 'DELETE' }); }
  async encrypt(keyId: string, data: string): Promise<ApiResponse<{ ciphertext: string; algorithm: string }>> { return this.request('/encrypt', { method: 'POST', body: JSON.stringify({ keyId, data }) }); }
  async decrypt(keyId: string, ciphertext: string): Promise<ApiResponse<{ plaintext: string }>> { return this.request('/decrypt', { method: 'POST', body: JSON.stringify({ keyId, ciphertext }) }); }
  async getAuditLogs(options?: { keyId?: string; action?: string; limit?: number }): Promise<ApiResponse<AuditLog[]>> { 
    const params = new URLSearchParams();
    if (options?.keyId) params.append('keyId', options.keyId);
    if (options?.action) params.append('action', options.action);
    if (options?.limit) params.append('limit', options.limit.toString());
    return this.request(`/audit?${params.toString()}`); 
  }
  async getCertificates(): Promise<ApiResponse<Certificate[]>> { return this.request('/certificates'); }
  async getHealthReport(): Promise<ApiResponse<{ healthScore: number; issues: Array<{ severity: string; type: string; keyName: string; message: string }> }>> { return this.request('/health-report'); }
}

export const encryptionManagerApi = new EncryptionManagerApi();

export const simulatedData = {
  dashboard: {
    overview: { totalKeys: 156, activeKeys: 142, expiringSoon: 8, keyOperations24h: 45200 },
    keysByType: { symmetric: 95, asymmetric: 48, hmac: 13 } as Record<KeyType, number>,
    keysByStatus: { active: 142, inactive: 6, expired: 3, compromised: 0, 'pending-deletion': 5 } as Record<KeyStatus, number>,
    recentOperations: [
      { operation: 'encrypt', keyName: 'prod-data-key-1', timestamp: new Date().toISOString(), status: 'success' as const },
      { operation: 'decrypt', keyName: 'api-auth-key', timestamp: new Date(Date.now() - 60000).toISOString(), status: 'success' as const },
      { operation: 'rotate', keyName: 'session-key', timestamp: new Date(Date.now() - 120000).toISOString(), status: 'success' as const },
      { operation: 'create', keyName: 'backup-encryption-key', timestamp: new Date(Date.now() - 180000).toISOString(), status: 'success' as const },
      { operation: 'sign', keyName: 'signing-key-rsa', timestamp: new Date(Date.now() - 240000).toISOString(), status: 'success' as const },
    ],
  } as EncryptionDashboard,
  keys: [
    { _id: '1', name: 'prod-data-key-1', type: 'symmetric' as KeyType, algorithm: 'AES-256-GCM' as KeyAlgorithm, status: 'active' as KeyStatus, createdAt: new Date().toISOString(), usageCount: 15420, provider: 'local' },
    { _id: '2', name: 'api-auth-key', type: 'asymmetric' as KeyType, algorithm: 'RSA-4096' as KeyAlgorithm, status: 'active' as KeyStatus, createdAt: new Date().toISOString(), usageCount: 8930, provider: 'aws-kms' },
    { _id: '3', name: 'session-key', type: 'symmetric' as KeyType, algorithm: 'ChaCha20-Poly1305' as KeyAlgorithm, status: 'active' as KeyStatus, createdAt: new Date().toISOString(), usageCount: 25000, provider: 'local' },
    { _id: '4', name: 'signing-key-ecdsa', type: 'asymmetric' as KeyType, algorithm: 'ECDSA-P384' as KeyAlgorithm, status: 'active' as KeyStatus, createdAt: new Date().toISOString(), usageCount: 3200, provider: 'azure-keyvault' },
    { _id: '5', name: 'backup-hmac-key', type: 'hmac' as KeyType, algorithm: 'HMAC-SHA256' as KeyAlgorithm, status: 'active' as KeyStatus, createdAt: new Date().toISOString(), usageCount: 1850, provider: 'local' },
    { _id: '6', name: 'legacy-encryption-key', type: 'symmetric' as KeyType, algorithm: 'AES-128-GCM' as KeyAlgorithm, status: 'inactive' as KeyStatus, createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), usageCount: 45000, provider: 'local' },
  ] as EncryptionKey[],
  auditLogs: [
    { _id: '1', action: 'encrypt', keyId: '1', keyName: 'prod-data-key-1', userId: 'user-001', timestamp: new Date().toISOString(), status: 'success' as const },
    { _id: '2', action: 'decrypt', keyId: '1', keyName: 'prod-data-key-1', userId: 'user-002', timestamp: new Date(Date.now() - 30000).toISOString(), status: 'success' as const },
    { _id: '3', action: 'key-rotate', keyId: '3', keyName: 'session-key', userId: 'admin', timestamp: new Date(Date.now() - 60000).toISOString(), status: 'success' as const },
    { _id: '4', action: 'key-create', keyId: '5', keyName: 'backup-hmac-key', userId: 'admin', timestamp: new Date(Date.now() - 120000).toISOString(), status: 'success' as const },
    { _id: '5', action: 'sign', keyId: '2', keyName: 'api-auth-key', userId: 'service-account', timestamp: new Date(Date.now() - 180000).toISOString(), status: 'success' as const },
    { _id: '6', action: 'verify', keyId: '2', keyName: 'api-auth-key', userId: 'service-account', timestamp: new Date(Date.now() - 240000).toISOString(), status: 'success' as const },
    { _id: '7', action: 'encrypt', keyId: '1', keyName: 'prod-data-key-1', userId: 'user-003', timestamp: new Date(Date.now() - 300000).toISOString(), status: 'failed' as const },
  ] as AuditLog[],
  certificates: [
    { _id: '1', domains: ['api.example.com', 'www.api.example.com'], provider: 'letsencrypt', status: 'valid' as const, issuedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() },
    { _id: '2', domains: ['secure.example.com'], provider: 'digicert', status: 'valid' as const, issuedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() },
  ] as Certificate[],
};
