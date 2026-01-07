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

  // Structured API methods to match App.tsx calls
  rules = {
    getAll: async (): Promise<any[]> => {
      return this.request('/api/rules');
    },
    create: async (rule: any): Promise<any> => {
      return this.request('/api/rules', {
        method: 'POST',
        body: JSON.stringify(rule),
      });
    },
    update: async (ruleId: string, updates: any): Promise<any> => {
      return this.request(`/api/rules/${ruleId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    delete: async (ruleId: string): Promise<void> => {
      return this.request(`/api/rules/${ruleId}`, {
        method: 'DELETE',
      });
    }
  };

  logs = {
    getRecent: async (limit: number = 100): Promise<any[]> => {
      return this.request(`/api/traffic?limit=${limit}&sort=desc`);
    }
  };

  alerts = {
    getActive: async (): Promise<any[]> => {
      return this.request('/api/alerts?status=active');
    },
    create: async (alert: any): Promise<any> => {
      return this.request('/api/alerts', {
        method: 'POST',
        body: JSON.stringify(alert),
      });
    }
  };

  vendors = {
    getAll: async (): Promise<any[]> => {
      return this.request('/api/vendors');
    }
  };

  policies = {
    getAll: async (): Promise<any[]> => {
      return this.request('/api/policies');
    },
    create: async (policy: any): Promise<any> => {
      return this.request('/api/policies', {
        method: 'POST',
        body: JSON.stringify(policy),
      });
    },
    update: async (policyId: string, updates: any): Promise<any> => {
      return this.request(`/api/policies/${policyId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    delete: async (policyId: string): Promise<void> => {
      return this.request(`/api/policies/${policyId}`, {
        method: 'DELETE',
      });
    }
  };

  analytics = {
    getRealTimeStats: async (): Promise<any> => {
      return this.request('/api/analytics/realtime');
    }
  };

  threats = {
    analyze: async (logs: any[]): Promise<any> => {
      return this.request('/api/threats/analyze', {
        method: 'POST',
        body: JSON.stringify({ logs }),
      });
    }
  };

  // Additional methods for tools
  getTrafficLogs = async (filters?: any): Promise<any[]> => {
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    return this.request(`/api/traffic${queryParams ? `?${queryParams}` : ''}`);
  };

  analyzeTraffic = async (logs: any[]): Promise<any> => {
    return this.request('/api/traffic/analyze', {
      method: 'POST',
      body: JSON.stringify({ logs }),
    });
  };

  optimizeRule = async (rule: any): Promise<any> => {
    return this.request('/api/rules/optimize', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
  };

  runIntrusionDetection = async (params: any): Promise<any> => {
    return this.request('/api/intrusion/detect', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  };

  generateReport = async (params: any): Promise<any> => {
    return this.request('/api/reports/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  };

  optimizeRules = async (params: any): Promise<any> => {
    return this.request('/api/rules/optimize', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  };

  getThreatIntelligence = async (params: any): Promise<any> => {
    const queryParams = new URLSearchParams(params).toString();
    return this.request(`/api/threats/intelligence?${queryParams}`);
  };

  checkCompliance = async (params: any): Promise<any> => {
    return this.request('/api/compliance/check', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  };
}

// Export singleton instance
export const firewallAPI = new FirewallAPI();
export default firewallAPI;