// Load tool configuration
import configData from '../../siemcommander-config.json';

export const TOOL_CONFIG = configData;

export const PROVIDER_CONFIG = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    models: ['gemini-2.5-flash-preview', 'gemini-2.5-pro-preview', 'gemini-2.0-flash']
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    models: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-opus-20240229']
  },
  {
    id: 'gpt',
    name: 'OpenAI GPT',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4o-mini']
  },
  {
    id: 'grok',
    name: 'xAI Grok',
    models: ['grok-2-1212', 'grok-2-vision']
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    models: ['mistral-large', 'mixtral-8x7b']
  },
  {
    id: 'llama',
    name: 'Meta Llama',
    models: ['llama-3.3-70b', 'llama-3.1-405b']
  }
];

export const DEFAULT_SETTINGS = {
  selectedProvider: 'gemini',
  selectedModel: 'gemini-2.0-flash',
  temperature: 0.7,
  maxTokens: 4096,
  customPrompt: TOOL_CONFIG.systemPrompt,
  systemPrompt: TOOL_CONFIG.systemPrompt,
  functions: TOOL_CONFIG.functions || []
};

export const NAV_ITEMS = TOOL_CONFIG.navigationItems || [];

export const COLOR_THEME = TOOL_CONFIG.colorTheme || {
  primary: '#00ff88',
  secondary: '#00d4ff',
  accent: '#ff0055',
  background: '#0a0e27',
  surface: '#1a1f3a',
  text: '#ffffff'
};

// API endpoints
export const API_BASE_URL = import.meta.env.VITE_API_URL || `http://localhost:${TOOL_CONFIG.apiPort}`;
export const AI_WEBSOCKET_URL = import.meta.env.VITE_AI_WS_URL || `ws://localhost:${TOOL_CONFIG.aiPort}${TOOL_CONFIG.aiPath}`;
