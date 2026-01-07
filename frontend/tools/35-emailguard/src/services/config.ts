// EmailGuard Configuration Service
// Loads and manages configuration from emailguard-config.json

// Configuration Types
export interface EmailGuardConfig {
  tool: ToolInfo;
  emailSecurity: EmailSecurityConfig;
  quarantine: QuarantineConfig;
  policies: PoliciesConfig;
  reporting: ReportingConfig;
  integrations: IntegrationsConfig;
  userAwareness: UserAwarenessConfig;
  ai: AIConfig;
  compliance: ComplianceConfig;
  ui: UIConfig;
}

export interface ToolInfo {
  id: number;
  name: string;
  codeName: string;
  version: string;
  description: string;
  category: string;
  status: string;
  ports: {
    frontend: number;
    api: number;
    aiWebSocket: number;
    mlEngine: number;
  };
  domain: string;
  database: string;
}

export interface EmailSecurityConfig {
  threatDetection: {
    phishing: PhishingConfig;
    malware: MalwareConfig;
    spam: SpamConfig;
    bec: BECConfig;
    spoofing: SpoofingConfig;
  };
  emailAuthentication: EmailAuthConfig;
  contentAnalysis: ContentAnalysisConfig;
  attachmentSecurity: AttachmentSecurityConfig;
}

export interface PhishingConfig {
  enabled: boolean;
  methods: string[];
  mlModel: string;
  confidenceThreshold: number;
}

export interface MalwareConfig {
  enabled: boolean;
  scanners: string[];
  maxFileSize: number;
  allowedTypes: string[];
  blockedTypes: string[];
}

export interface SpamConfig {
  enabled: boolean;
  methods: string[];
  spamThreshold: number;
  bulkThreshold: number;
}

export interface BECConfig {
  enabled: boolean;
  description: string;
  checks: string[];
}

export interface SpoofingConfig {
  enabled: boolean;
  checks: string[];
  strictMode: boolean;
}

export interface EmailAuthConfig {
  spf: { enabled: boolean; failAction: string; softfailAction: string };
  dkim: { enabled: boolean; keyLength: number; selector: string; failAction: string };
  dmarc: { enabled: boolean; policy: string; rua: string; ruf: string; percentage: number };
  arc: { enabled: boolean; description: string };
  bimi: { enabled: boolean; description: string };
}

export interface ContentAnalysisConfig {
  dlp: {
    enabled: boolean;
    description: string;
    patterns: DLPPattern[];
  };
  languageDetection: { enabled: boolean; supportedLanguages: string[] };
  sentimentAnalysis: { enabled: boolean; urgencyDetection: boolean; threatLevelAssessment: boolean };
  linkAnalysis: { enabled: boolean; urlRewriting: boolean; timeOfClickProtection: boolean; sandboxedPreview: boolean };
}

export interface DLPPattern {
  name: string;
  regex: string;
  action: string;
}

export interface AttachmentSecurityConfig {
  scanning: {
    enabled: boolean;
    antivirusEngines: string[];
    sandboxAnalysis: boolean;
    sandboxTimeout: number;
  };
  fileTypeVerification: { enabled: boolean; magicNumberCheck: boolean; extensionValidation: boolean };
  passwordProtected: { action: string; promptForPassword: boolean };
  macroDetection: { enabled: boolean; action: string; allowList: string[] };
  archiveScanning: { enabled: boolean; maxNestingLevel: number; maxFilesInArchive: number };
}

export interface QuarantineConfig {
  enabled: boolean;
  retentionDays: number;
  autoRelease: boolean;
  notifyUser: boolean;
  notifyAdmin: boolean;
  digestFrequency: string;
  selfService: {
    enabled: boolean;
    allowRelease: boolean;
    allowRequestRelease: boolean;
    allowReport: boolean;
  };
  categories: QuarantineCategory[];
}

export interface QuarantineCategory {
  name: string;
  retention: number;
  userVisible: boolean;
}

export interface PoliciesConfig {
  types: { name: string; description: string }[];
  actions: string[];
  conditions: string[];
  templates: PolicyTemplate[];
}

export interface PolicyTemplate {
  name: string;
  description: string;
  condition: string;
  action: string;
}

export interface ReportingConfig {
  dashboards: Dashboard[];
  scheduledReports: ScheduledReport[];
  exportFormats: string[];
}

export interface Dashboard {
  name: string;
  widgets: string[];
}

export interface ScheduledReport {
  name: string;
  frequency: string;
  recipients: string[];
}

export interface IntegrationsConfig {
  threatIntelligence: Record<string, { enabled: boolean; features: string[] }>;
  emailPlatforms: Record<string, { enabled: boolean; features: string[] }>;
  siem: Record<string, { enabled: boolean; eventTypes?: string[]; indices?: string[]; workspaceId?: string }>;
  ticketing: Record<string, { enabled: boolean; autoCreateIncident?: boolean; projectKey?: string }>;
}

export interface UserAwarenessConfig {
  phishingSimulation: {
    enabled: boolean;
    templates: string[];
    frequency: string;
    trackingEnabled: boolean;
  };
  trainingModules: TrainingModule[];
  reportingButton: {
    enabled: boolean;
    platforms: string[];
    feedbackEnabled: boolean;
  };
}

export interface TrainingModule {
  name: string;
  duration: number;
  mandatory: boolean;
}

export interface AIConfig {
  provider: string;
  model: string;
  features: string[];
  functions: AIFunctionConfig[];
  endpoints: {
    chat: string;
    stream: string;
    functions: string;
  };
  settings: {
    maxTokens: number;
    temperature: number;
    streamResponses: boolean;
    contextWindow: number;
  };
}

export interface AIFunctionConfig {
  name: string;
  description: string;
  category: string;
  inputs: AIFunctionInput[];
  outputs: string[];
}

export interface AIFunctionInput {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface ComplianceConfig {
  frameworks: string[];
  dataRetention: {
    emails: number;
    logs: number;
    quarantine: number;
  };
  encryption: {
    atRest: string;
    inTransit: string;
    emailEncryption: string[];
  };
  audit: {
    enabled: boolean;
    retentionDays: number;
    logLevel: string;
  };
}

export interface UIConfig {
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    danger: string;
    warning: string;
    success: string;
    background: string;
    surface: string;
  };
  components: Record<string, boolean>;
  accessibility: {
    wcag: string;
    screenReader: boolean;
    keyboardNavigation: boolean;
  };
}

// Configuration state
let config: EmailGuardConfig | null = null;
let configPromise: Promise<EmailGuardConfig> | null = null;

// Load configuration
export async function loadConfig(): Promise<EmailGuardConfig> {
  if (config) {
    return config;
  }

  if (configPromise) {
    return configPromise;
  }

  configPromise = (async () => {
    try {
      const response = await fetch('/emailguard-config.json');
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.status}`);
      }
      config = await response.json();
      return config!;
    } catch (error) {
      console.error('[EmailGuard] Failed to load configuration:', error);
      throw error;
    }
  })();

  return configPromise;
}

// Get configuration (sync, returns cached or throws)
export function getConfig(): EmailGuardConfig {
  if (!config) {
    throw new Error('Configuration not loaded. Call loadConfig() first.');
  }
  return config;
}

// Configuration helpers
export function getToolInfo(): ToolInfo {
  return getConfig().tool;
}

export function getPortConfig(): ToolInfo['ports'] {
  return getConfig().tool.ports;
}

export function getEmailSecurityConfig(): EmailSecurityConfig {
  return getConfig().emailSecurity;
}

export function getThreatDetectionConfig(): EmailSecurityConfig['threatDetection'] {
  return getConfig().emailSecurity.threatDetection;
}

export function getQuarantineConfig(): QuarantineConfig {
  return getConfig().quarantine;
}

export function getPoliciesConfig(): PoliciesConfig {
  return getConfig().policies;
}

export function getReportingConfig(): ReportingConfig {
  return getConfig().reporting;
}

export function getIntegrationsConfig(): IntegrationsConfig {
  return getConfig().integrations;
}

export function getUserAwarenessConfig(): UserAwarenessConfig {
  return getConfig().userAwareness;
}

export function getAIConfig(): AIConfig {
  return getConfig().ai;
}

export function getAIFunctions(): AIFunctionConfig[] {
  return getConfig().ai.functions;
}

export function getComplianceConfig(): ComplianceConfig {
  return getConfig().compliance;
}

export function getUIConfig(): UIConfig {
  return getConfig().ui;
}

export function getThemeConfig(): UIConfig['theme'] {
  return getConfig().ui.theme;
}

export function isFeatureEnabled(feature: keyof EmailSecurityConfig['threatDetection']): boolean {
  return getConfig().emailSecurity.threatDetection[feature].enabled;
}

export function getBlockedFileTypes(): string[] {
  return getConfig().emailSecurity.threatDetection.malware.blockedTypes;
}

export function getAllowedFileTypes(): string[] {
  return getConfig().emailSecurity.threatDetection.malware.allowedTypes;
}

export function getDLPPatterns(): DLPPattern[] {
  return getConfig().emailSecurity.contentAnalysis.dlp.patterns;
}

// API URL helpers
export function getApiUrl(): string {
  const ports = getPortConfig();
  return import.meta.env.VITE_API_URL || `http://localhost:${ports.api}/api`;
}

export function getWsUrl(): string {
  const ports = getPortConfig();
  return import.meta.env.VITE_WS_URL || `ws://localhost:${ports.aiWebSocket}/maula-ai`;
}

export function getMlEngineUrl(): string {
  const ports = getPortConfig();
  return import.meta.env.VITE_ML_URL || `http://localhost:${ports.mlEngine}`;
}

export default {
  loadConfig,
  getConfig,
  getToolInfo,
  getPortConfig,
  getEmailSecurityConfig,
  getThreatDetectionConfig,
  getQuarantineConfig,
  getPoliciesConfig,
  getReportingConfig,
  getIntegrationsConfig,
  getUserAwarenessConfig,
  getAIConfig,
  getAIFunctions,
  getComplianceConfig,
  getUIConfig,
  getThemeConfig,
  isFeatureEnabled,
  getBlockedFileTypes,
  getAllowedFileTypes,
  getDLPPatterns,
  getApiUrl,
  getWsUrl,
  getMlEngineUrl,
};
