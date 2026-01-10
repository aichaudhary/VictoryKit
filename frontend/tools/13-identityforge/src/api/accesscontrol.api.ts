/**
 * IdentityForge API Client
 * Tool 13 - RBAC & Permission Management
 */

const API_BASE_URL = import.meta.env.VITE_IDENTITYFORGE_API_URL || 'http://localhost:4013/api/v1/identityforge';

export interface User {
  _id: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  createdAt: string;
  mfaEnabled: boolean;
}

export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
  createdAt: string;
}

export interface Permission {
  _id: string;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'execute' | 'admin';
  description: string;
}

export interface AccessPolicy {
  _id: string;
  name: string;
  description: string;
  rules: PolicyRule[];
  priority: number;
  enabled: boolean;
}

export interface PolicyRule {
  resource: string;
  actions: string[];
  effect: 'allow' | 'deny';
  conditions?: Record<string, any>;
}

export interface AccessDashboard {
  overview: { totalUsers: number; activeUsers: number; totalRoles: number; totalPolicies: number; };
  recentActivity: { user: string; action: string; resource: string; timestamp: string; result: 'allowed' | 'denied'; }[];
  roleDistribution: { role: string; count: number; }[];
}

export interface ApiResponse<T> { success: boolean; data?: T; error?: string; simulated?: boolean; }

class IdentityForgeApi {
  private baseUrl: string;
  constructor(baseUrl: string = API_BASE_URL) { this.baseUrl = baseUrl; }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.error || 'Request failed' };
      return data;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  async getDashboard(): Promise<ApiResponse<AccessDashboard>> { return this.request('/dashboard'); }
  async getUsers(): Promise<ApiResponse<User[]>> { return this.request('/users'); }
  async getRoles(): Promise<ApiResponse<Role[]>> { return this.request('/roles'); }
  async getPermissions(): Promise<ApiResponse<Permission[]>> { return this.request('/permissions'); }
  async getPolicies(): Promise<ApiResponse<AccessPolicy[]>> { return this.request('/policies'); }
  async createRole(role: Partial<Role>): Promise<ApiResponse<Role>> { return this.request('/roles', { method: 'POST', body: JSON.stringify(role) }); }
  async assignRole(userId: string, roleId: string): Promise<ApiResponse<User>> { return this.request(`/users/${userId}/roles`, { method: 'POST', body: JSON.stringify({ roleId }) }); }
}

export const accessControlApi = new IdentityForgeApi();

export const simulatedData = {
  dashboard: {
    overview: { totalUsers: 850, activeUsers: 720, totalRoles: 12, totalPolicies: 45 },
    recentActivity: [
      { user: 'john.doe', action: 'login', resource: 'dashboard', timestamp: new Date().toISOString(), result: 'allowed' as const },
      { user: 'jane.smith', action: 'access', resource: 'admin-panel', timestamp: new Date(Date.now() - 60000).toISOString(), result: 'denied' as const },
      { user: 'admin', action: 'create', resource: 'user', timestamp: new Date(Date.now() - 120000).toISOString(), result: 'allowed' as const },
    ],
    roleDistribution: [{ role: 'Admin', count: 5 }, { role: 'Manager', count: 25 }, { role: 'User', count: 500 }, { role: 'Guest', count: 320 }],
  } as AccessDashboard,
  users: [
    { _id: '1', username: 'admin', email: 'admin@example.com', roles: ['Administrator'], permissions: ['*'], status: 'active' as const, createdAt: new Date().toISOString(), mfaEnabled: true },
    { _id: '2', username: 'john.doe', email: 'john@example.com', roles: ['User'], permissions: ['read:*'], status: 'active' as const, createdAt: new Date().toISOString(), mfaEnabled: false },
  ] as User[],
  roles: [
    { _id: '1', name: 'Administrator', description: 'Full system access', permissions: ['*'], userCount: 5, isSystem: true, createdAt: new Date().toISOString() },
    { _id: '2', name: 'Manager', description: 'Team management access', permissions: ['read:*', 'update:team'], userCount: 25, isSystem: false, createdAt: new Date().toISOString() },
    { _id: '3', name: 'User', description: 'Standard user access', permissions: ['read:own'], userCount: 500, isSystem: true, createdAt: new Date().toISOString() },
  ] as Role[],
};
