/**
 * SSLMonitor Configuration
 * Tool #25 - AI-Powered SSL/TLS Certificate Management
 */

import configData from '../../sslmonitor-config.json';

export interface AIFunction {
  name: string;
  description: string;
  parameters: Record<string, string>;
}

export interface ToolConfig {
  toolName: string;
  toolId: string;
  tagline: string;
  subdomain: string;
  fullDomain: string;
  aiAssistant: string;
  description: string;
  ports: {
    frontend: number;
    backend: number;
    aiWebSocket: number;
    ml: number;
  };
  databaseName: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  features: string[];
  systemPrompt: string;
  aiFunctions: AIFunction[];
  navigationItems: Array<{ label: string; path: string; icon: string }>;
}

export const config: ToolConfig = configData as ToolConfig;

// Utility functions
export const getApiUrl = (): string => {
  const isDev = import.meta.env?.DEV ?? process.env.NODE_ENV === 'development';
  return isDev 
    ? `http://localhost:${config.ports.backend}`
    : `https://${config.fullDomain}/api`;
};

export const getWsUrl = (): string => {
  const isDev = import.meta.env?.DEV ?? process.env.NODE_ENV === 'development';
  const protocol = isDev ? 'ws' : 'wss';
  const host = isDev ? `localhost:${config.ports.aiWebSocket}` : config.fullDomain;
  return `${protocol}://${host}/maula-ai`;
};

export const getMlUrl = (): string => {
  const isDev = import.meta.env?.DEV ?? process.env.NODE_ENV === 'development';
  return isDev 
    ? `http://localhost:${config.ports.ml}`
    : `https://${config.fullDomain}/ml`;
};

export const getThemeColors = () => config.theme;

export const getAIFunctions = (): AIFunction[] => config.aiFunctions;

export const getAIFunctionByName = (name: string): AIFunction | undefined => 
  config.aiFunctions.find(fn => fn.name === name);

export const getSystemPrompt = (): string => config.systemPrompt;

export const getFeatures = (): string[] => config.features;

export const getNavigationItems = () => config.navigationItems;

// Certificate status levels
export const CERT_STATUS = {
  VALID: { color: '#00ff88', label: 'Valid', icon: 'check_circle' },
  EXPIRING_SOON: { color: '#ffaa00', label: 'Expiring Soon', icon: 'warning' },
  EXPIRED: { color: '#ff4444', label: 'Expired', icon: 'error' },
  REVOKED: { color: '#ff0000', label: 'Revoked', icon: 'cancel' },
  UNKNOWN: { color: '#888888', label: 'Unknown', icon: 'help' }
} as const;

// TLS protocol versions
export const TLS_VERSIONS = [
  { version: 'TLS 1.3', secure: true, recommended: true },
  { version: 'TLS 1.2', secure: true, recommended: true },
  { version: 'TLS 1.1', secure: false, recommended: false },
  { version: 'TLS 1.0', secure: false, recommended: false },
  { version: 'SSL 3.0', secure: false, recommended: false }
] as const;

// Security grades
export const SECURITY_GRADES = ['A+', 'A', 'A-', 'B', 'C', 'D', 'E', 'F', 'T'] as const;

// Compliance standards
export const COMPLIANCE_STANDARDS = ['PCI-DSS', 'HIPAA', 'NIST', 'SOC2', 'GDPR'] as const;

export default config;
