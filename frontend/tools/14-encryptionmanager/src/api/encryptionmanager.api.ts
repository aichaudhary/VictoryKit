/**
 * EncryptionManager API Client
 * Tool 14 - Key Management & Data Encryption
 */

const API_BASE_URL = import.meta.env.VITE_ENCRYPTIONMANAGER_API_URL || 'http://localhost:4014/api/v1/encryption';

export type KeyType = 'symmetric' | 'asymmetric' | 'hmac';
export type KeyAlgorithm = 'AES-256-GCM' | 'RSA-4096' | 'ECDSA-P384' | 'ChaCha20-Poly1305';
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
  metadata?: Record<string, any>;
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
  async createKey(key: Partial<EncryptionKey>): Promise<ApiResponse<EncryptionKey>> { return this.request('/keys', { method: 'POST', body: JSON.stringify(key) }); }
  async rotateKey(keyId: string): Promise<ApiResponse<EncryptionKey>> { return this.request(`/keys/${keyId}/rotate`, { method: 'POST' }); }
  async encrypt(keyId: string, data: string): Promise<ApiResponse<{ ciphertext: string }>> { return this.request('/encrypt', { method: 'POST', body: JSON.stringify({ keyId, data }) }); }
  async decrypt(keyId: string, ciphertext: string): Promise<ApiResponse<{ plaintext: string }>> { return this.request('/decrypt', { method: 'POST', body: JSON.stringify({ keyId, ciphertext }) }); }
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
    ],
  } as EncryptionDashboard,
  keys: [
    { _id: '1', name: 'prod-data-key-1', type: 'symmetric' as KeyType, algorithm: 'AES-256-GCM' as KeyAlgorithm, status: 'active' as KeyStatus, createdAt: new Date().toISOString(), usageCount: 15420 },
    { _id: '2', name: 'api-auth-key', type: 'asymmetric' as KeyType, algorithm: 'RSA-4096' as KeyAlgorithm, status: 'active' as KeyStatus, createdAt: new Date().toISOString(), usageCount: 8930 },
    { _id: '3', name: 'session-key', type: 'symmetric' as KeyType, algorithm: 'ChaCha20-Poly1305' as KeyAlgorithm, status: 'active' as KeyStatus, createdAt: new Date().toISOString(), usageCount: 25000 },
  ] as EncryptionKey[],
};
