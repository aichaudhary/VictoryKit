/**
 * DLP Shield Configuration
 * Centralized configuration for data loss prevention
 */

import dlpConfig from '../../dlp-config.json';

export interface DLPConfig {
  toolInfo: {
    id: number;
    name: string;
    displayName: string;
    description: string;
    category: string;
    version: string;
    icon: string;
    color: string;
    theme: string;
  };
  deployment: {
    subdomain: string;
    domain: string;
    fullUrl: string;
    aiAssistantUrl: string;
  };
  ports: {
    frontend: number;
    backend: number;
    aiWebSocket: number;
    contentInspection: number;
    emailGateway: number;
  };
  database: {
    name: string;
    collections: string[];
  };
  features: {
    contentInspection: {
      enabled: boolean;
      ocr: boolean;
      nlpAnalysis: boolean;
      fingerprinting: boolean;
      exactMatch: boolean;
      regexPatterns: boolean;
    };
    channels: {
      email: boolean;
      web: boolean;
      cloud: boolean;
      endpoint: boolean;
      network: boolean;
      removableMedia: boolean;
    };
    classification: {
      enabled: boolean;
      autoClassification: boolean;
      userLabeling: boolean;
      sensitivityLabels: string[];
      mlClassification: boolean;
    };
    userBehaviorAnalytics: {
      enabled: boolean;
      anomalyDetection: boolean;
      riskScoring: boolean;
      insiderThreat: boolean;
      baseline: boolean;
    };
    incidentResponse: {
      enabled: boolean;
      autoBlock: boolean;
      quarantine: boolean;
      encrypt: boolean;
      notify: boolean;
      workflow: boolean;
    };
  };
  aiAssistant: {
    enabled: boolean;
    model: string;
    wsPort: number;
    functions: AIFunction[];
  };
  integrations: {
    cloudStorage: string[];
    email: string[];
    casb: string[];
    siem: string[];
    idp: string[];
  };
  security: {
    encryption: {
      atRest: boolean;
      inTransit: boolean;
      algorithm: string;
    };
    dataHandling: {
      redaction: boolean;
      tokenization: boolean;
      masking: boolean;
    };
    authentication: {
      mfa: boolean;
      sso: boolean;
      rbac: boolean;
    };
  };
  performance: {
    maxFileSizeMB: number;
    maxDailyScans: number;
    realtimeInspection: boolean;
    averageLatency: string;
  };
  compliance: {
    regulations: string[];
    dataTypes: string[];
    auditRetention: number;
  };
}

export interface AIFunction {
  name: string;
  description: string;
  parameters: Record<string, string>;
  category: string;
}

// Export typed configuration
export const config: DLPConfig = dlpConfig as DLPConfig;

// Helper functions
export const getToolInfo = () => config.toolInfo;
export const getDeployment = () => config.deployment;
export const getPorts = () => config.ports;
export const getDatabase = () => config.database;
export const getFeatures = () => config.features;
export const getAIAssistant = () => config.aiAssistant;
export const getIntegrations = () => config.integrations;
export const getSecurity = () => config.security;
export const getCompliance = () => config.compliance;

// Get AI functions by category
export const getAIFunctionsByCategory = (category: string): AIFunction[] => {
  return config.aiAssistant.functions.filter(fn => fn.category === category);
};

// Get all AI function categories
export const getAIFunctionCategories = (): string[] => {
  return [...new Set(config.aiAssistant.functions.map(fn => fn.category))];
};

// Get WebSocket URL for AI assistant
export const getAIWebSocketUrl = (): string => {
  const { deployment, ports } = config;
  const protocol = deployment.fullUrl.startsWith('https') ? 'wss' : 'ws';
  const host = `${deployment.subdomain}.${deployment.domain}`;
  return `${protocol}://${host}:${ports.aiWebSocket}`;
};

// Get API base URL
export const getApiBaseUrl = (): string => {
  const { deployment, ports } = config;
  return `${deployment.fullUrl.replace(':3041', '')}:${ports.backend}/api`;
};

// Check if a feature is enabled
export const isFeatureEnabled = (featureGroup: keyof DLPConfig['features'], feature?: string): boolean => {
  const group = config.features[featureGroup];
  if (!group) return false;
  if (!feature) return group.enabled || Object.values(group).some(v => v === true);
  return group[feature as keyof typeof group] as boolean || false;
};

// Get supported regulations
export const getSupportedRegulations = (): string[] => {
  return config.compliance.regulations;
};

// Get sensitivity labels
export const getSensitivityLabels = (): string[] => {
  return config.features.classification.sensitivityLabels;
};

// Get supported data types
export const getSupportedDataTypes = (): string[] => {
  return config.compliance.dataTypes;
};

export default config;
