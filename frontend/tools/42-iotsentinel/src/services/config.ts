/**
 * IoTSentinel Configuration
 * Tool #42 - Enterprise IoT Security Platform
 */

import configData from '../../iotsentinel-config.json';

export interface AIFunction {
  name: string;
  description: string;
  parameters: Record<string, string>;
}

export interface ToolConfig {
  toolName: string;
  toolId: string;
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

// Device categories for IoT security
export const DEVICE_CATEGORIES = [
  'cameras',
  'sensors',
  'actuators',
  'hvac',
  'lighting',
  'access-control',
  'medical',
  'industrial',
  'consumer',
  'networking'
] as const;

// IoT protocols
export const IOT_PROTOCOLS = [
  'mqtt',
  'coap',
  'zigbee',
  'zwave',
  'ble',
  'wifi',
  'lorawan',
  'modbus',
  'bacnet',
  'http'
] as const;

// Threat types
export const IOT_THREAT_TYPES = [
  'botnet',
  'ddos',
  'firmware-exploit',
  'credential-stuffing',
  'man-in-the-middle',
  'replay-attack',
  'unauthorized-access',
  'data-exfiltration',
  'ransomware',
  'physical-tampering'
] as const;

export default config;
