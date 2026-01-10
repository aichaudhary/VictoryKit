import axios from 'axios';
import {
  VPNConnection,
  VPNPolicy,
  VPNSecurityAlert,
  VPNUser,
  VPNSummaryData,
  APIResponse
} from '../types';
import { API_ENDPOINTS } from '../constants';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4039';

class VPNAnalyzerAPI {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('vpnanalyzer_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('vpnanalyzer_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication methods
  async login(credentials: { email: string; password: string }): Promise<APIResponse<{ token: string; user: VPNUser }>> {
    const response = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async logout(): Promise<APIResponse<void>> {
    const response = await this.api.post('/auth/logout');
    return response.data;
  }

  // Dashboard methods
  async getDashboardSummary(): Promise<APIResponse<VPNSummaryData>> {
    const response = await this.api.get(`${API_ENDPOINTS.base}/dashboard/summary`);
    return response.data;
  }

  async getRealTimeMetrics(): Promise<APIResponse<any[]>> {
    const response = await this.api.get(`${API_ENDPOINTS.base}/dashboard/metrics`);
    return response.data;
  }

  // Connection methods
  async getConnections(): Promise<APIResponse<VPNConnection[]>> {
    const response = await this.api.get(API_ENDPOINTS.connections);
    return response.data;
  }

  async getConnection(id: string): Promise<APIResponse<VPNConnection>> {
    const response = await this.api.get(`${API_ENDPOINTS.connections}/${id}`);
    return response.data;
  }

  async createConnection(connection: Partial<VPNConnection>): Promise<APIResponse<VPNConnection>> {
    const response = await this.api.post(API_ENDPOINTS.connections, connection);
    return response.data;
  }

  async updateConnection(id: string, updates: Partial<VPNConnection>): Promise<APIResponse<VPNConnection>> {
    const response = await this.api.put(`${API_ENDPOINTS.connections}/${id}`, updates);
    return response.data;
  }

  async deleteConnection(id: string): Promise<APIResponse<void>> {
    const response = await this.api.delete(`${API_ENDPOINTS.connections}/${id}`);
    return response.data;
  }

  async connectVPN(id: string): Promise<APIResponse<{ status: string; message: string }>> {
    const response = await this.api.post(`${API_ENDPOINTS.connections}/${id}/connect`);
    return response.data;
  }

  async disconnectVPN(id: string): Promise<APIResponse<{ status: string; message: string }>> {
    const response = await this.api.post(`${API_ENDPOINTS.connections}/${id}/disconnect`);
    return response.data;
  }

  // Policy methods
  async getPolicies(): Promise<APIResponse<VPNPolicy[]>> {
    const response = await this.api.get(API_ENDPOINTS.policies);
    return response.data;
  }

  async getPolicy(id: string): Promise<APIResponse<VPNPolicy>> {
    const response = await this.api.get(`${API_ENDPOINTS.policies}/${id}`);
    return response.data;
  }

  async createPolicy(policy: Partial<VPNPolicy>): Promise<APIResponse<VPNPolicy>> {
    const response = await this.api.post(API_ENDPOINTS.policies, policy);
    return response.data;
  }

  async updatePolicy(id: string, updates: Partial<VPNPolicy>): Promise<APIResponse<VPNPolicy>> {
    const response = await this.api.put(`${API_ENDPOINTS.policies}/${id}`, updates);
    return response.data;
  }

  async deletePolicy(id: string): Promise<APIResponse<void>> {
    const response = await this.api.delete(`${API_ENDPOINTS.policies}/${id}`);
    return response.data;
  }

  // Alert methods
  async getAlerts(): Promise<APIResponse<VPNSecurityAlert[]>> {
    const response = await this.api.get(API_ENDPOINTS.alerts);
    return response.data;
  }

  async getAlert(id: string): Promise<APIResponse<VPNSecurityAlert>> {
    const response = await this.api.get(`${API_ENDPOINTS.alerts}/${id}`);
    return response.data;
  }

  async acknowledgeAlert(id: string): Promise<APIResponse<VPNSecurityAlert>> {
    const response = await this.api.put(`${API_ENDPOINTS.alerts}/${id}/acknowledge`);
    return response.data;
  }

  async dismissAlert(id: string): Promise<APIResponse<void>> {
    const response = await this.api.delete(`${API_ENDPOINTS.alerts}/${id}`);
    return response.data;
  }

  // User methods
  async getUsers(): Promise<APIResponse<VPNUser[]>> {
    const response = await this.api.get(API_ENDPOINTS.users);
    return response.data;
  }

  async getUser(id: string): Promise<APIResponse<VPNUser>> {
    const response = await this.api.get(`${API_ENDPOINTS.users}/${id}`);
    return response.data;
  }

  async createUser(user: Partial<VPNUser>): Promise<APIResponse<VPNUser>> {
    const response = await this.api.post(API_ENDPOINTS.users, user);
    return response.data;
  }

  async updateUser(id: string, updates: Partial<VPNUser>): Promise<APIResponse<VPNUser>> {
    const response = await this.api.put(`${API_ENDPOINTS.users}/${id}`, updates);
    return response.data;
  }

  async deleteUser(id: string): Promise<APIResponse<void>> {
    const response = await this.api.delete(`${API_ENDPOINTS.users}/${id}`);
    return response.data;
  }

  // Analytics methods
  async getAnalytics(timeRange: string = '24h'): Promise<APIResponse<any>> {
    const response = await this.api.get(`${API_ENDPOINTS.analytics}?range=${timeRange}`);
    return response.data;
  }

  async getConnectionAnalytics(connectionId: string, timeRange: string = '24h'): Promise<APIResponse<any>> {
    const response = await this.api.get(`${API_ENDPOINTS.analytics}/connections/${connectionId}?range=${timeRange}`);
    return response.data;
  }

  // Provider methods
  async getProviders(): Promise<APIResponse<any[]>> {
    const response = await this.api.get(`${API_ENDPOINTS.base}/providers`);
    return response.data;
  }

  async testProviderConnection(providerId: string, config: any): Promise<APIResponse<{ success: boolean; message: string }>> {
    const response = await this.api.post(`${API_ENDPOINTS.base}/providers/${providerId}/test`, config);
    return response.data;
  }

  // Security methods
  async runSecurityScan(connectionId?: string): Promise<APIResponse<any>> {
    const url = connectionId
      ? `${API_ENDPOINTS.base}/security/scan/${connectionId}`
      : `${API_ENDPOINTS.base}/security/scan`;
    const response = await this.api.post(url);
    return response.data;
  }

  async getSecurityReport(timeRange: string = '24h'): Promise<APIResponse<any>> {
    const response = await this.api.get(`${API_ENDPOINTS.base}/security/report?range=${timeRange}`);
    return response.data;
  }

  // WebSocket connection for real-time updates
  connectWebSocket(onMessage: (data: any) => void): WebSocket | null {
    try {
      const token = localStorage.getItem('vpnanalyzer_token');
      const wsUrl = API_BASE_URL.replace('http', 'ws') + '/ws';
      const ws = new WebSocket(`${wsUrl}?token=${token}`);

      ws.onopen = () => {
        console.log('VPNAnalyzer WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('VPNAnalyzer WebSocket disconnected');
        // Auto-reconnect after 5 seconds
        setTimeout(() => this.connectWebSocket(onMessage), 5000);
      };

      return ws;
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      return null;
    }
  }
}

export const vpnAnalyzerAPI = new VPNAnalyzerAPI();