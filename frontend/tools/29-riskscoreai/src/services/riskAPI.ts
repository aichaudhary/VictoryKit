import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4029';

export interface RiskScore {
  current: number;
  previous?: number;
  trend?: 'increasing' | 'decreasing' | 'stable';
  lastUpdated: string;
}

export interface AssetRisk {
  assetId: string;
  assetName: string;
  assetType: string;
  riskScore: RiskScore;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  criticality: {
    businessCriticality: string;
    dataClassification: string;
  };
  vulnerabilities: {
    total: number;
    cves: string[];
    lastPatched?: string;
  };
  exposure: {
    networkExposure: string;
    publiclyAccessible: boolean;
  };
  securityControls: {
    implemented: string[];
  };
  riskFactors: Array<{
    factor: string;
    value: any;
    weight: number;
    severity?: string;
  }>;
}

export interface UserRisk {
  userId: string;
  userName: string;
  email: string;
  riskScore: RiskScore;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  profile: {
    role: string;
    department: string;
    employeeType: string;
  };
  accessProfile: {
    accessLevel: string;
    privilegedAccess: boolean;
    sensitiveDataAccess: string[];
  };
  behaviorMetrics: {
    failedLogins: number;
    suspiciousActivities: number;
    policyViolations: number;
  };
  riskFactors: Array<{
    factor: string;
    value: any;
    weight: number;
  }>;
}

export interface ThreatRisk {
  threatId: string;
  threatName: string;
  threatType: string;
  riskScore: RiskScore;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  severity: {
    rating: string;
    business_impact: string;
  };
  exploitability: {
    ease: string;
    skillRequired: string;
    activelyExploited: boolean;
  };
  attackVector: {
    vector: string;
    complexity: string;
  };
  scope: {
    affectedAssets: string[];
    affectedUsers: string[];
  };
  mitreAttack: {
    tactics: string[];
    techniques: string[];
  };
}

export interface VendorRisk {
  vendorId: string;
  vendorName: string;
  riskScore: RiskScore;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  relationship: {
    accessLevel: string;
    dataShared: string[];
    contractValue?: number;
    dependencyLevel: string;
  };
  securityPosture: {
    certifications: string[];
    securityQuestionnaire: {
      completed: boolean;
      score?: number;
    };
  };
  incidentHistory: {
    totalBreaches: number;
  };
  compliance: {
    required: string[];
    status: Record<string, string>;
  };
}

export interface RiskHeatmap {
  scope: string;
  scope_id?: string;
  timestamp: string;
  overallScore: number;
  riskDistribution: {
    critical: { count: number; percentage: number };
    high: { count: number; percentage: number };
    medium: { count: number; percentage: number };
    low: { count: number; percentage: number };
  };
  categories: {
    assets?: any;
    users?: any;
    threats?: any;
    vendors?: any;
  };
}

export interface RiskPrediction {
  entityType: string;
  entityId: string;
  entityName?: string;
  currentRiskScore: number;
  prediction: {
    predictions: Array<{
      timeframe: string;
      predictedScore: number;
      confidenceLevel: number;
      factors: Array<{
        factor: string;
        impact: string;
        magnitude: number;
      }>;
    }>;
    trajectory: {
      direction: 'improving' | 'deteriorating' | 'stable';
      velocity: number;
    };
    scenarios?: Array<{
      scenarioName: string;
      description: string;
      predictedScore: number;
      probability: number;
      recommendedActions: string[];
    }>;
  };
}

export interface DashboardStats {
  assets: {
    total: number;
    critical: number;
    averageRisk: number;
  };
  users: {
    total: number;
    highRisk: number;
    averageRisk: number;
  };
  threats: {
    active: number;
  };
  vendors: {
    total: number;
    highRisk: number;
  };
}

class RiskAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // ==================== ASSET RISK ====================

  async calculateAssetRisk(data: {
    asset_id: string;
    asset_type?: string;
    asset_data: any;
    include_predictions?: boolean;
    risk_model?: string;
  }): Promise<{ success: boolean; data: any }> {
    const response = await this.client.post('/api/v1/risk/assets/calculate', data);
    return response.data;
  }

  async getAssetRisks(params: {
    asset_type?: string;
    risk_level?: string;
    department?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ success: boolean; data: AssetRisk[]; pagination: any }> {
    const response = await this.client.get('/api/v1/risk/assets', { params });
    return response.data;
  }

  async getAssetRiskById(assetId: string): Promise<{ success: boolean; data: AssetRisk }> {
    const response = await this.client.get(`/api/v1/risk/assets/${assetId}`);
    return response.data;
  }

  // ==================== USER RISK ====================

  async calculateUserRisk(data: {
    user_id: string;
    user_data: any;
    time_period?: string;
  }): Promise<{ success: boolean; data: any }> {
    const response = await this.client.post('/api/v1/risk/users/calculate', data);
    return response.data;
  }

  async getUserRisks(params: {
    department?: string;
    risk_level?: string;
    access_level?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ success: boolean; data: UserRisk[]; pagination: any }> {
    const response = await this.client.get('/api/v1/risk/users', { params });
    return response.data;
  }

  async getUserRiskById(userId: string): Promise<{ success: boolean; data: UserRisk }> {
    const response = await this.client.get(`/api/v1/risk/users/${userId}`);
    return response.data;
  }

  // ==================== THREAT RISK ====================

  async assessThreatRisk(data: {
    threat_id: string;
    threat_data: any;
    context?: any;
  }): Promise<{ success: boolean; data: any }> {
    const response = await this.client.post('/api/v1/risk/threats/assess', data);
    return response.data;
  }

  async getThreatRisks(params: {
    threat_type?: string;
    risk_level?: string;
    active_only?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<{ success: boolean; data: ThreatRisk[]; pagination: any }> {
    const response = await this.client.get('/api/v1/risk/threats', { params });
    return response.data;
  }

  // ==================== VENDOR RISK ====================

  async calculateVendorRisk(data: {
    vendor_name: string;
    vendor_data: any;
    assessment_type?: string;
  }): Promise<{ success: boolean; data: any }> {
    const response = await this.client.post('/api/v1/risk/vendors/calculate', data);
    return response.data;
  }

  async getVendorRisks(params: {
    risk_level?: string;
    dependency_level?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ success: boolean; data: VendorRisk[]; pagination: any }> {
    const response = await this.client.get('/api/v1/risk/vendors', { params });
    return response.data;
  }

  // ==================== HEATMAP & PREDICTIONS ====================

  async generateRiskHeatmap(data: {
    scope?: string;
    scope_id?: string;
    risk_categories?: string[];
    time_period?: string;
    grouping?: string;
  }): Promise<{ success: boolean; data: RiskHeatmap }> {
    const response = await this.client.post('/api/v1/risk/heatmap', data);
    return response.data;
  }

  async predictRiskTrajectory(data: {
    entity_type: string;
    entity_id: string;
    prediction_horizon?: string;
    include_scenarios?: boolean;
    confidence_threshold?: number;
  }): Promise<{ success: boolean; data: RiskPrediction }> {
    const response = await this.client.post('/api/v1/risk/predictions/trajectory', data);
    return response.data;
  }

  // ==================== AGGREGATION ====================

  async aggregateRiskScore(data: {
    aggregation_level?: string;
    aggregation_id?: string;
    risk_components?: string[];
    weighting?: Record<string, number>;
    include_breakdown?: boolean;
  }): Promise<{ success: boolean; data: any }> {
    const response = await this.client.post('/api/v1/risk/aggregate', data);
    return response.data;
  }

  // ==================== DASHBOARD ====================

  async getDashboardStats(): Promise<{ success: boolean; data: DashboardStats }> {
    const response = await this.client.get('/api/v1/risk/dashboard/stats');
    return response.data;
  }

  // ==================== HEALTH CHECK ====================

  async healthCheck(): Promise<any> {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export default new RiskAPI();
