import configService from './config';

// FirewallAI API Service
// Handles all API communications with the backend

const API_BASE_URL = import.meta.env.VITE_API_URL || configService.getAPIURL();

class FirewallAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Firewall Rules API
  async getRules(filters?: any): Promise<any[]> {
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    return this.request(`/api/rules${queryParams ? `?${queryParams}` : ''}`);
  }

  async createRule(rule: any): Promise<any> {
    return this.request('/api/rules', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
  }

  async updateRule(ruleId: string, updates: any): Promise<any> {
    return this.request(`/api/rules/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteRule(ruleId: string): Promise<void> {
    return this.request(`/api/rules/${ruleId}`, {
      method: 'DELETE',
    });
  }

  async enableRule(ruleId: string): Promise<any> {
    return this.request(`/api/rules/${ruleId}/enable`, {
      method: 'POST',
    });
  }

  async disableRule(ruleId: string): Promise<any> {
    return this.request(`/api/rules/${ruleId}/disable`, {
      method: 'POST',
    });
  }

  // Traffic Logs API
  async getTrafficLogs(filters?: any): Promise<any[]> {
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    return this.request(`/api/traffic${queryParams ? `?${queryParams}` : ''}`);
  }

  async getTrafficStats(timeRange?: string): Promise<any> {
    const queryParams = timeRange ? `?timeRange=${timeRange}` : '';
    return this.request(`/api/traffic/stats${queryParams}`);
  }

  // Alerts API
  async getAlerts(filters?: any): Promise<any[]> {
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    return this.request(`/api/alerts${queryParams ? `?${queryParams}` : ''}`);
  }

  async createAlert(alert: any): Promise<any> {
    return this.request('/api/alerts', {
      method: 'POST',
      body: JSON.stringify(alert),
    });
  }

  async updateAlert(alertId: string, updates: any): Promise<any> {
    return this.request(`/api/alerts/${alertId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async resolveAlert(alertId: string, resolution: any): Promise<any> {
    return this.request(`/api/alerts/${alertId}/resolve`, {
      method: 'POST',
      body: JSON.stringify(resolution),
    });
  }

  async getAlertStats(): Promise<any> {
    return this.request('/api/alerts/stats');
  }

  // Vendors API
  async getVendors(): Promise<any[]> {
    return this.request('/api/vendors');
  }

  async addVendor(vendor: any): Promise<any> {
    return this.request('/api/vendors', {
      method: 'POST',
      body: JSON.stringify(vendor),
    });
  }

  async updateVendor(vendorId: string, updates: any): Promise<any> {
    return this.request(`/api/vendors/${vendorId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteVendor(vendorId: string): Promise<void> {
    return this.request(`/api/vendors/${vendorId}`, {
      method: 'DELETE',
    });
  }

  async testVendorConnection(vendorId: string): Promise<any> {
    return this.request(`/api/vendors/${vendorId}/test`, {
      method: 'POST',
    });
  }

  // Policies API
  async getPolicies(): Promise<any[]> {
    return this.request('/api/policies');
  }

  async createPolicy(policy: any): Promise<any> {
    return this.request('/api/policies', {
      method: 'POST',
      body: JSON.stringify(policy),
    });
  }

  async updatePolicy(policyId: string, updates: any): Promise<any> {
    return this.request(`/api/policies/${policyId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deletePolicy(policyId: string): Promise<void> {
    return this.request(`/api/policies/${policyId}`, {
      method: 'DELETE',
    });
  }

  async enablePolicy(policyId: string): Promise<any> {
    return this.request(`/api/policies/${policyId}/enable`, {
      method: 'POST',
    });
  }

  async disablePolicy(policyId: string): Promise<any> {
    return this.request(`/api/policies/${policyId}/disable`, {
      method: 'POST',
    });
  }

  // Threat Analysis API
  async getThreatAnalysis(filters?: any): Promise<any> {
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    return this.request(`/api/threats/analysis${queryParams ? `?${queryParams}` : ''}`);
  }

  async getThreatStats(): Promise<any> {
    return this.request('/api/threats/stats');
  }

  async getMLInsights(): Promise<any> {
    return this.request('/api/threats/ml-insights');
  }

  // Real-time Data API
  async getRealTimeData(): Promise<any> {
    return this.request('/api/realtime');
  }

  async subscribeToUpdates(callback: (data: any) => void): Promise<void> {
    // WebSocket connection for real-time updates
    const ws = new WebSocket(`${this.baseURL.replace('http', 'ws')}/ws`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        callback(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Return a cleanup function
    return () => ws.close();
  }

  // Dashboard Stats API
  async getDashboardStats(): Promise<any> {
    return this.request('/api/dashboard/stats');
  }

  async getSystemHealth(): Promise<any> {
    return this.request('/api/system/health');
  }

  // Configuration API
  async getConfiguration(): Promise<any> {
    return this.request('/api/config');
  }

  async updateConfiguration(config: any): Promise<any> {
    return this.request('/api/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  // Audit Logs API
  async getAuditLogs(filters?: any): Promise<any[]> {
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    return this.request(`/api/audit${queryParams ? `?${queryParams}` : ''}`);
  }

  // Compliance API
  async getComplianceStatus(): Promise<any> {
    return this.request('/api/compliance/status');
  }

  async runComplianceCheck(framework: string): Promise<any> {
    return this.request('/api/compliance/check', {
      method: 'POST',
      body: JSON.stringify({ framework }),
    });
  }

  // Backup and Recovery API
  async createBackup(): Promise<any> {
    return this.request('/api/backup', {
      method: 'POST',
    });
  }

  async getBackups(): Promise<any[]> {
    return this.request('/api/backup');
  }

  async restoreBackup(backupId: string): Promise<any> {
    return this.request(`/api/backup/${backupId}/restore`, {
      method: 'POST',
    });
  }

  // AI Chat API
  async sendChatMessage(message: string, context?: any): Promise<any> {
    return this.request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
  }

  async getChatHistory(): Promise<any[]> {
    return this.request('/api/chat/history');
  }
}

// Export singleton instance
export const firewallAPI = new FirewallAPI();
export default firewallAPI;