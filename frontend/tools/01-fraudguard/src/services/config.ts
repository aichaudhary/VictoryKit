/**
 * FraudGuard Configuration
 * Tool #01 - AI-Powered Fraud Detection & Prevention
 */

import configData from '../../fraudguard-config.json';

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
  const isDev = import.meta.env.DEV;
  return isDev 
    ? `http://localhost:${config.ports.backend}`
    : `https://${config.fullDomain}/api`;
};

export const getWsUrl = (): string => {
  const isDev = import.meta.env.DEV;
  const protocol = isDev ? 'ws' : 'wss';
  const host = isDev ? `localhost:${config.ports.aiWebSocket}` : config.fullDomain;
  return `${protocol}://${host}/maula/ai`;
};

export const getMlUrl = (): string => {
  const isDev = import.meta.env.DEV;
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

// Risk level definitions
export const RISK_LEVELS = {
  LOW: { min: 0, max: 30, color: '#00ff88', label: 'Low Risk' },
  MEDIUM: { min: 31, max: 60, color: '#ffaa00', label: 'Medium Risk' },
  HIGH: { min: 61, max: 80, color: '#ff6600', label: 'High Risk' },
  CRITICAL: { min: 81, max: 100, color: '#ff0055', label: 'Critical Risk' }
} as const;

// Fraud types
export const FRAUD_TYPES = [
  'card-not-present',
  'account-takeover',
  'synthetic-identity',
  'friendly-fraud',
  'chargeback-fraud',
  'payment-fraud',
  'identity-theft',
  'phishing',
  'velocity-abuse',
  'promotion-abuse'
] as const;

// Alert severities
export const ALERT_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;

export default config;
