import { SettingsState, NavItem } from './types';

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4041/api/v1/dlp';

export const PROVIDER_CONFIG = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    models: ['gemini-2.5-flash-preview', 'gemini-2.5-pro-preview', 'gemini-2.0-flash']
  },
  {
    id: 'openai',
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4o-mini']
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    models: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307']
  }
];

export const DEFAULT_SETTINGS: SettingsState = {
  customPrompt: `You are DataShield AI, an expert Data Loss Prevention assistant. You help protect sensitive data across the organization.

CAPABILITIES:
- Scan content, files, and emails for sensitive data (PII, PHI, PCI, credentials)
- Monitor cloud applications (M365, Google Workspace, Slack, AWS, Azure)
- Create and manage DLP policies
- Investigate and respond to data exposure incidents
- Monitor endpoint activities (USB, clipboard, print, uploads)

AVAILABLE FUNCTIONS:
- scan_content: Scan text for sensitive data patterns
- scan_file: Analyze uploaded files for data exposure risks
- scan_cloud: Scan cloud storage and collaboration tools
- manage_policy: Create/edit/delete DLP policies
- get_incidents: Retrieve DLP incidents
- respond_incident: Take action on an incident

Always prioritize data protection and explain findings clearly.`,
  agentName: "DataShield AI",
  temperature: 0.7,
  maxTokens: 4096,
  provider: 'gemini',
  model: "gemini-2.5-flash-preview",
  activeTool: 'content_scan',
  workspaceMode: 'CHAT',
  portalUrl: '',
  canvas: {
    content: "// DataShield Workspace\n\nReady for DLP analysis.",
    type: 'text',
    title: 'DataShield_Canvas'
  },
  autoRemediation: false,
  scanOnUpload: true
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Content Scanner', icon: '🔍', tool: 'content_scan', description: 'Scan text for sensitive data' },
  { label: 'File Scanner', icon: '📁', tool: 'file_scan', description: 'Analyze files for data exposure' },
  { label: 'Cloud Scanner', icon: '☁️', tool: 'cloud_scan', description: 'Scan cloud apps and storage' },
  { label: 'Policies', icon: '📋', tool: 'policy_manager', description: 'Manage DLP policies' },
  { label: 'Incidents', icon: '🚨', tool: 'incident_response', description: 'View and respond to incidents' },
  { label: 'Endpoints', icon: '💻', tool: 'endpoint_monitor', description: 'Monitor endpoint activities' },
  { label: 'Integrations', icon: '🔗', tool: 'integrations', description: 'Manage cloud integrations' },
  { label: 'Reports', icon: '📊', tool: 'reports', description: 'Generate DLP reports' }
];

// Sensitive Data Types (structured)
export const DATA_TYPE_CATEGORIES = {
  PII: [
    { id: 'ssn', name: 'Social Security Number', icon: '🔢', severity: 'critical' },
    { id: 'driver_license', name: 'Driver License', icon: '🪪', severity: 'high' },
    { id: 'passport', name: 'Passport Number', icon: '📕', severity: 'high' },
    { id: 'email', name: 'Email Address', icon: '📧', severity: 'medium' },
    { id: 'phone', name: 'Phone Number', icon: '📱', severity: 'medium' },
    { id: 'address', name: 'Physical Address', icon: '🏠', severity: 'medium' },
  ],
  FINANCIAL: [
    { id: 'credit_card', name: 'Credit Card Number', icon: '💳', severity: 'critical' },
    { id: 'bank_account', name: 'Bank Account', icon: '🏦', severity: 'critical' },
    { id: 'routing_number', name: 'Routing Number', icon: '🔢', severity: 'high' },
    { id: 'tax_id', name: 'Tax ID / EIN', icon: '📋', severity: 'high' },
  ],
  HEALTHCARE: [
    { id: 'medical_record', name: 'Medical Record Number', icon: '🏥', severity: 'critical' },
    { id: 'insurance_id', name: 'Insurance ID', icon: '🩺', severity: 'high' },
    { id: 'diagnosis', name: 'Medical Diagnosis', icon: '📋', severity: 'critical' },
  ],
  CREDENTIALS: [
    { id: 'password', name: 'Password', icon: '🔑', severity: 'critical' },
    { id: 'api_key', name: 'API Key', icon: '🗝️', severity: 'critical' },
    { id: 'access_token', name: 'Access Token', icon: '🎫', severity: 'critical' },
    { id: 'private_key', name: 'Private Key', icon: '🔐', severity: 'critical' },
    { id: 'aws_key', name: 'AWS Access Key', icon: '☁️', severity: 'critical' },
  ],
};

// Flat array of all data types for iteration
export const DATA_TYPES = Object.values(DATA_TYPE_CATEGORIES).flat();

// Cloud Integration Types
export const CLOUD_INTEGRATIONS = [
  { id: 'microsoft365', name: 'Microsoft 365', icon: '🟦', description: 'OneDrive, SharePoint, Teams, Outlook' },
  { id: 'google', name: 'Google Workspace', icon: '🟨', description: 'Drive, Gmail, Docs' },
  { id: 'slack', name: 'Slack', icon: '💬', description: 'Messages, files, channels' },
  { id: 'aws', name: 'AWS S3', icon: '🟠', description: 'S3 buckets and objects' },
  { id: 'azure', name: 'Azure Blob', icon: '🔵', description: 'Blob storage containers' },
  { id: 'dropbox', name: 'Dropbox', icon: '📦', description: 'Files and folders' },
  { id: 'box', name: 'Box', icon: '📁', description: 'Enterprise content' },
];

// Risk Level Colors
export const RISK_COLORS = {
  critical: { bg: '#dc2626', text: '#fef2f2', border: '#991b1b' },
  high: { bg: '#ea580c', text: '#fff7ed', border: '#c2410c' },
  medium: { bg: '#ca8a04', text: '#fefce8', border: '#a16207' },
  low: { bg: '#16a34a', text: '#f0fdf4', border: '#15803d' },
};

// Severity Badge Styles
export const SEVERITY_STYLES = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

// DLP Presets
export const DLP_PRESETS: Record<string, { prompt: string; temp: number }> = {
  thorough: { 
    prompt: "Perform extremely detailed DLP analysis. Check all data types, cross-reference patterns, and provide comprehensive risk assessment.", 
    temp: 0.3 
  },
  quick: { 
    prompt: "Perform quick DLP screening. Focus on critical data types and provide a rapid risk assessment.", 
    temp: 0.5 
  },
  educational: { 
    prompt: "Explain DLP analysis in educational terms. Help the user understand data protection patterns and detection methods.", 
    temp: 0.7 
  },
  investigative: { 
    prompt: "Take an investigative approach. Look for hidden data patterns, connections, and potential data exposure risks.", 
    temp: 0.4 
  }
};

// Simple Risk Colors for charts
export const SIMPLE_RISK_COLORS = {
  low: '#00ff88',
  medium: '#ffaa00',
  high: '#ff0055'
};

export const API_ENDPOINTS = {
  dlp: {
    scan: '/api/dlp/scan',
    policies: '/api/dlp/policies',
    incidents: '/api/dlp/incidents',
    integrations: '/api/dlp/integrations',
    endpoints: '/api/dlp/endpoints',
    reports: '/api/dlp/reports'
  },
  ml: {
    predict: '/api/ml/predict',
    score: '/api/ml/score',
    train: '/api/ml/train'
  },
  ai: {
    chat: '/api/ai/chat',
    ws: '/ws/ai'
  }
};
