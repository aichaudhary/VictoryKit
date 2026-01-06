import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4032/api/v1/zerotrustai';

export interface AccessRequest {
  requestId: string;
  request: {
    resource_id: string;
    resource_name: string;
    resource_type: string;
    action: string;
    sensitivity: string;
    timestamp: string;
  };
  user: {
    user_id: string;
    username: string;
    role: string;
    clearance_level: string;
    groups: string[];
  };
  device: {
    device_id: string;
    device_type: string;
    os_type: string;
    is_managed: boolean;
    is_compliant: boolean;
  };
  context: {
    ip_address: string;
    location: any;
    network_type: string;
    time_context: string;
  };
  trust: {
    trust_score: number;
    trust_level: string;
    factors: any;
  };
  risk: {
    risk_score: number;
    risk_level: string;
  };
  decision: {
    verdict: string;
    reason: string;
    confidence: number;
  };
}

export interface ZeroTrustPolicy {
  policyId: string;
  policy: {
    name: string;
    description: string;
    status: string;
    priority: number;
    category: string;
    framework: string;
  };
  scope: any;
  trust_requirements: any;
  conditions: any;
  enforcement: any;
  statistics?: {
    total_requests_evaluated: number;
    requests_allowed: number;
    requests_denied: number;
  };
}

export interface DeviceTrust {
  deviceId: string;
  device: {
    device_type: string;
    device_name: string;
    ownership: string;
    is_managed: boolean;
  };
  os: {
    os_type: string;
    os_version: string;
    is_supported: boolean;
  };
  security: any;
  trust: {
    trust_score: number;
    trust_level: string;
  };
  compliance: {
    is_compliant: boolean;
    violations: any[];
  };
}

export interface UserIdentity {
  userId: string;
  identity: {
    username: string;
    email: string;
    department: string;
    status: string;
  };
  authorization: {
    role: string;
    clearance_level: string;
    is_privileged: boolean;
  };
  trust: {
    trust_score: number;
    trust_level: string;
  };
  risk: {
    risk_score: number;
    risk_level: string;
    is_high_risk: boolean;
  };
}

export interface NetworkSegment {
  segmentId: string;
  segment: {
    segment_name: string;
    segment_type: string;
    security_zone: string;
    trust_level: string;
    status: string;
  };
  isolation: {
    isolation_level: string;
  };
  micro_segmentation: {
    enabled: boolean;
    strategy: string;
  };
}

class ZeroTrustAPI {
  
  // ==================== ACCESS REQUESTS ====================
  
  async createAccessRequest(data: any): Promise<AccessRequest> {
    const response = await axios.post(`${API_BASE}/access-requests`, data);
    return response.data.data;
  }
  
  async getAccessRequests(filters?: any): Promise<{ data: AccessRequest[], pagination: any }> {
    const params = new URLSearchParams(filters);
    const response = await axios.get(`${API_BASE}/access-requests?${params}`);
    return response.data;
  }
  
  async getAccessRequestById(requestId: string): Promise<AccessRequest> {
    const response = await axios.get(`${API_BASE}/access-requests/${requestId}`);
    return response.data.data;
  }
  
  async approveAccessRequest(requestId: string, approvedBy: string, reason: string): Promise<AccessRequest> {
    const response = await axios.post(`${API_BASE}/access-requests/${requestId}/approve`, {
      approved_by: approvedBy,
      reason
    });
    return response.data.data;
  }
  
  async denyAccessRequest(requestId: string, deniedBy: string, reason: string): Promise<AccessRequest> {
    const response = await axios.post(`${API_BASE}/access-requests/${requestId}/deny`, {
      denied_by: deniedBy,
      reason
    });
    return response.data.data;
  }
  
  // ==================== TRUST SCORING ====================
  
  async calculateTrustScore(userId: string, deviceId: string, context?: any): Promise<any> {
    const response = await axios.post(`${API_BASE}/trust-score/calculate`, {
      user_id: userId,
      device_id: deviceId,
      context
    });
    return response.data.data;
  }
  
  async getTrustScoreHistory(userId: string, days: number = 30): Promise<any[]> {
    const response = await axios.get(`${API_BASE}/trust-score/history?user_id=${userId}&days=${days}`);
    return response.data.data;
  }
  
  // ==================== POLICIES ====================
  
  async createPolicy(data: any): Promise<ZeroTrustPolicy> {
    const response = await axios.post(`${API_BASE}/policies`, data);
    return response.data.data;
  }
  
  async getPolicies(filters?: any): Promise<{ data: ZeroTrustPolicy[], pagination: any }> {
    const params = new URLSearchParams(filters);
    const response = await axios.get(`${API_BASE}/policies?${params}`);
    return response.data;
  }
  
  async getPolicyById(policyId: string): Promise<ZeroTrustPolicy> {
    const response = await axios.get(`${API_BASE}/policies/${policyId}`);
    return response.data.data;
  }
  
  async updatePolicy(policyId: string, updates: any): Promise<ZeroTrustPolicy> {
    const response = await axios.put(`${API_BASE}/policies/${policyId}`, updates);
    return response.data.data;
  }
  
  async activatePolicy(policyId: string): Promise<ZeroTrustPolicy> {
    const response = await axios.post(`${API_BASE}/policies/${policyId}/activate`);
    return response.data.data;
  }
  
  async deactivatePolicy(policyId: string): Promise<ZeroTrustPolicy> {
    const response = await axios.post(`${API_BASE}/policies/${policyId}/deactivate`);
    return response.data.data;
  }
  
  async evaluatePolicy(policyId: string, request: any): Promise<any> {
    const response = await axios.post(`${API_BASE}/policies/${policyId}/evaluate`, { request });
    return response.data.data;
  }
  
  // ==================== BEHAVIOR ====================
  
  async analyzeBehavior(userId: string, activity: any): Promise<any> {
    const response = await axios.post(`${API_BASE}/behavior/analyze`, {
      user_id: userId,
      activity
    });
    return response.data.data;
  }
  
  async getBehaviorAnomalies(userId?: string, unresolvedOnly: boolean = true): Promise<any[]> {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    params.append('unresolved_only', String(unresolvedOnly));
    const response = await axios.get(`${API_BASE}/behavior/anomalies?${params}`);
    return response.data.data;
  }
  
  // ==================== DEVICES ====================
  
  async assessDevice(device: any): Promise<DeviceTrust> {
    const response = await axios.post(`${API_BASE}/devices/assess`, device);
    return response.data.data;
  }
  
  async getDevices(filters?: any): Promise<{ data: DeviceTrust[], pagination: any }> {
    const params = new URLSearchParams(filters);
    const response = await axios.get(`${API_BASE}/devices?${params}`);
    return response.data;
  }
  
  async getDeviceById(deviceId: string): Promise<DeviceTrust> {
    const response = await axios.get(`${API_BASE}/devices/${deviceId}`);
    return response.data.data;
  }
  
  async quarantineDevice(deviceId: string, reason: string): Promise<DeviceTrust> {
    const response = await axios.post(`${API_BASE}/devices/${deviceId}/quarantine`, { reason });
    return response.data.data;
  }
  
  // ==================== USERS ====================
  
  async createUser(data: any): Promise<UserIdentity> {
    const response = await axios.post(`${API_BASE}/users`, data);
    return response.data.data;
  }
  
  async getUsers(filters?: any): Promise<{ data: UserIdentity[], pagination: any }> {
    const params = new URLSearchParams(filters);
    const response = await axios.get(`${API_BASE}/users?${params}`);
    return response.data;
  }
  
  async getUserById(userId: string): Promise<UserIdentity> {
    const response = await axios.get(`${API_BASE}/users/${userId}`);
    return response.data.data;
  }
  
  async addToWatchlist(userId: string, reason: string): Promise<UserIdentity> {
    const response = await axios.post(`${API_BASE}/users/${userId}/watchlist`, { reason });
    return response.data.data;
  }
  
  // ==================== NETWORK SEGMENTS ====================
  
  async createSegment(data: any): Promise<NetworkSegment> {
    const response = await axios.post(`${API_BASE}/segments`, data);
    return response.data.data;
  }
  
  async getSegments(filters?: any): Promise<{ data: NetworkSegment[], pagination: any }> {
    const params = new URLSearchParams(filters);
    const response = await axios.get(`${API_BASE}/segments?${params}`);
    return response.data;
  }
  
  async getSegmentById(segmentId: string): Promise<NetworkSegment> {
    const response = await axios.get(`${API_BASE}/segments/${segmentId}`);
    return response.data.data;
  }
  
  async allowInbound(segmentId: string, sourceSegmentId: string, sourceSegmentName: string, ports?: number[], protocols?: string[]): Promise<NetworkSegment> {
    const response = await axios.post(`${API_BASE}/segments/${segmentId}/allow-inbound`, {
      source_segment_id: sourceSegmentId,
      source_segment_name: sourceSegmentName,
      ports,
      protocols
    });
    return response.data.data;
  }
  
  async blockSegment(segmentId: string, targetSegmentId: string, reason: string): Promise<NetworkSegment> {
    const response = await axios.post(`${API_BASE}/segments/${segmentId}/block`, {
      target_segment_id: targetSegmentId,
      reason
    });
    return response.data.data;
  }
  
  async addFirewallRule(segmentId: string, rule: any): Promise<NetworkSegment> {
    const response = await axios.post(`${API_BASE}/segments/${segmentId}/firewall-rules`, rule);
    return response.data.data;
  }
  
  async detectLateralMovement(segmentId: string, connection: any): Promise<any> {
    const response = await axios.post(`${API_BASE}/segments/${segmentId}/detect-lateral-movement`, { connection });
    return response.data.data;
  }
  
  async quarantineSegment(segmentId: string, reason: string): Promise<NetworkSegment> {
    const response = await axios.post(`${API_BASE}/segments/${segmentId}/quarantine`, { reason });
    return response.data.data;
  }
  
  async enableMicroSegmentation(segmentId: string, strategy: string): Promise<NetworkSegment> {
    const response = await axios.post(`${API_BASE}/segments/${segmentId}/enable-microsegmentation`, { strategy });
    return response.data.data;
  }
  
  // ==================== CONTINUOUS AUTH ====================
  
  async validateSession(userId: string, sessionId: string): Promise<any> {
    const response = await axios.post(`${API_BASE}/auth/validate-session`, {
      user_id: userId,
      session_id: sessionId
    });
    return response.data;
  }
  
  // ==================== REPORTS ====================
  
  async generateAccessReport(startDate?: string, endDate?: string, format: string = 'json'): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    params.append('format', format);
    const response = await axios.get(`${API_BASE}/reports/access?${params}`);
    return response.data.data;
  }
  
  async getDashboardStats(): Promise<any> {
    const response = await axios.get(`${API_BASE}/dashboard/stats`);
    return response.data.data;
  }
}

export default new ZeroTrustAPI();
