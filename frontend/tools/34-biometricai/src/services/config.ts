// BiometricAI Configuration Service
// Loads and manages configuration from biometricai-config.json

import type { BiometricModality } from './biometricAPI';

// Configuration Types
export interface BiometricConfig {
  tool: ToolInfo;
  biometrics: BiometricsConfig;
  security: SecurityConfig;
  ai: AIConfig;
  compliance: ComplianceConfig;
  integrations: IntegrationsConfig;
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
    mlService: number;
  };
  domain: string;
  database: string;
}

export interface BiometricsConfig {
  modalities: {
    face: FaceConfig;
    fingerprint: FingerprintConfig;
    voice: VoiceConfig;
    iris: IrisConfig;
    behavioral: BehavioralConfig;
    palm: PalmConfig;
  };
  authentication: AuthenticationConfig;
  enrollment: EnrollmentConfig;
  matching: MatchingConfig;
}

export interface FaceConfig {
  enabled: boolean;
  detection: {
    model: string;
    minFaceSize: number;
    maxFaces: number;
    landmarkPoints: number;
    confidenceThreshold: number;
  };
  recognition: {
    model: string;
    embeddingSize: number;
    distanceMetric: string;
    threshold: number;
  };
  liveness: {
    enabled: boolean;
    methods: string[];
    threshold: number;
    challengeTypes: string[];
  };
  antiSpoofing: {
    enabled: boolean;
    detectionMethods: string[];
    threshold: number;
  };
  quality: {
    minResolution: number;
    maxAngle: number;
    illumination: { min: number; max: number };
    blur: { maxThreshold: number };
  };
}

export interface FingerprintConfig {
  enabled: boolean;
  sensors: string[];
  extraction: {
    minutiaeTypes: string[];
    minMinutiae: number;
    maxMinutiae: number;
    ridgeFlow: boolean;
  };
  matching: {
    algorithm: string;
    threshold: number;
    maxRotation: number;
  };
  quality: {
    nfiqThreshold: number;
    ridgeClarity: number;
  };
  supported: string[];
}

export interface VoiceConfig {
  enabled: boolean;
  enrollment: {
    minPhrases: number;
    minDuration: number;
    sampleRate: number;
    phraseTypes: string[];
  };
  verification: {
    textDependent: boolean;
    textIndependent: boolean;
    threshold: number;
  };
  features: {
    mfcc: boolean;
    pitch: boolean;
    formants: boolean;
    spectralAnalysis: boolean;
  };
  antispoofing: {
    replayDetection: boolean;
    synthesisDetection: boolean;
    threshold: number;
  };
}

export interface IrisConfig {
  enabled: boolean;
  capture: {
    resolution: string;
    wavelength: string;
    eyeSelection: string;
  };
  encoding: {
    algorithm: string;
    templateSize: number;
    hammingThreshold: number;
  };
  quality: {
    minPupilDilation: number;
    maxOcclusion: number;
    focusThreshold: number;
  };
}

export interface BehavioralConfig {
  enabled: boolean;
  typing: {
    enabled: boolean;
    minKeystrokes: number;
    features: string[];
    threshold: number;
  };
  mouse: {
    enabled: boolean;
    features: string[];
    threshold: number;
  };
  touch: {
    enabled: boolean;
    features: string[];
  };
  continuous: {
    enabled: boolean;
    sampleInterval: number;
    alertThreshold: number;
  };
}

export interface PalmConfig {
  enabled: boolean;
  regions: string[];
  venPattern: boolean;
  palmPrint: boolean;
  quality: {
    minResolution: number;
    illuminationType: string;
  };
}

export interface AuthenticationConfig {
  modes: string[];
  defaultMode: string;
  mfa: {
    enabled: boolean;
    minModalities: number;
    combinationRules: string[];
  };
  adaptive: {
    enabled: boolean;
    riskFactors: string[];
    stepUpThreshold: number;
  };
  continuous: {
    enabled: boolean;
    reauthInterval: number;
    behavioralMonitoring: boolean;
  };
}

export interface EnrollmentConfig {
  samples: {
    face: number;
    fingerprint: number;
    voice: number;
    iris: number;
  };
  qualityThresholds: {
    face: number;
    fingerprint: number;
    voice: number;
    iris: number;
    palm: number;
  };
  progressiveEnrollment: boolean;
  reenrollmentPeriod: number;
}

export interface MatchingConfig {
  algorithms: {
    face: string;
    fingerprint: string;
    voice: string;
    iris: string;
  };
  thresholds: {
    low: ModalityThresholds;
    medium: ModalityThresholds;
    high: ModalityThresholds;
  };
  fusion: {
    method: string;
    weights: Record<string, number>;
  };
}

export interface ModalityThresholds {
  face: number;
  fingerprint: number;
  voice: number;
  iris: number;
  behavioral: number;
}

export interface SecurityConfig {
  encryption: {
    templateEncryption: string;
    transportEncryption: string;
    keyManagement: string;
  };
  storage: {
    templateFormat: string;
    cancelableTemplates: boolean;
    templateProtection: string;
  };
  privacy: {
    dataMinimization: boolean;
    purposeLimitation: boolean;
    retentionPeriod: number;
    anonymization: boolean;
  };
  access: {
    rbac: boolean;
    mfaRequired: boolean;
    sessionTimeout: number;
    maxFailedAttempts: number;
    lockoutDuration: number;
  };
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
  gdpr: {
    enabled: boolean;
    consentRequired: boolean;
    rightToErasure: boolean;
    dataPortability: boolean;
    dpia: boolean;
  };
  ccpa: {
    enabled: boolean;
    optOut: boolean;
    disclosure: boolean;
  };
  bipa: {
    enabled: boolean;
    writtenConsent: boolean;
    retentionPolicy: boolean;
    destructionSchedule: boolean;
  };
  iso: {
    iso24745: boolean;
    iso30107: boolean;
  };
  nist: {
    sp80063b: boolean;
    ial: number;
    aal: number;
  };
}

export interface IntegrationsConfig {
  identity: {
    saml: boolean;
    oauth2: boolean;
    oidc: boolean;
    ldap: boolean;
  };
  platforms: string[];
  apis: {
    rest: boolean;
    graphql: boolean;
    grpc: boolean;
    websocket: boolean;
  };
  sdks: string[];
}

export interface UIConfig {
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
  };
  components: {
    faceCapture: boolean;
    fingerprintCapture: boolean;
    voiceCapture: boolean;
    irisCapture: boolean;
    behavioralMonitor: boolean;
    enrollmentWizard: boolean;
    authenticationWidget: boolean;
    adminDashboard: boolean;
    analyticsPanel: boolean;
  };
  accessibility: {
    wcag: string;
    screenReader: boolean;
    highContrast: boolean;
    keyboardNavigation: boolean;
  };
}

// Configuration state
let config: BiometricConfig | null = null;
let configPromise: Promise<BiometricConfig> | null = null;

// Load configuration
export async function loadConfig(): Promise<BiometricConfig> {
  if (config) {
    return config;
  }

  if (configPromise) {
    return configPromise;
  }

  configPromise = (async () => {
    try {
      const response = await fetch('/biometricai-config.json');
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.status}`);
      }
      config = await response.json();
      return config!;
    } catch (error) {
      console.error('[BiometricAI] Failed to load configuration:', error);
      throw error;
    }
  })();

  return configPromise;
}

// Get configuration (sync, returns cached or throws)
export function getConfig(): BiometricConfig {
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

export function getBiometricsConfig(): BiometricsConfig {
  return getConfig().biometrics;
}

export function getModalityConfig(modality: keyof BiometricsConfig['modalities']): 
  FaceConfig | FingerprintConfig | VoiceConfig | IrisConfig | BehavioralConfig | PalmConfig {
  return getConfig().biometrics.modalities[modality];
}

export function isModalityEnabled(modality: keyof BiometricsConfig['modalities']): boolean {
  return getConfig().biometrics.modalities[modality].enabled;
}

export function getEnabledModalities(): string[] {
  const modalities = getConfig().biometrics.modalities;
  return Object.entries(modalities)
    .filter(([, config]) => config.enabled)
    .map(([name]) => name);
}

export function getSecurityConfig(): SecurityConfig {
  return getConfig().security;
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

export function getMatchingThresholds(level: 'low' | 'medium' | 'high'): ModalityThresholds {
  return getConfig().biometrics.matching.thresholds[level];
}

export function getEnrollmentSampleCount(modality: keyof EnrollmentConfig['samples']): number {
  return getConfig().biometrics.enrollment.samples[modality];
}

export function getQualityThreshold(modality: keyof EnrollmentConfig['qualityThresholds']): number {
  return getConfig().biometrics.enrollment.qualityThresholds[modality];
}

// API URL helpers
export function getApiUrl(): string {
  const ports = getPortConfig();
  return import.meta.env.VITE_API_URL || `http://localhost:${ports.api}/api`;
}

export function getWsUrl(): string {
  const ports = getPortConfig();
  return import.meta.env.VITE_WS_URL || `ws://localhost:${ports.aiWebSocket}/maula/ai`;
}

export function getMlServiceUrl(): string {
  const ports = getPortConfig();
  return import.meta.env.VITE_ML_URL || `http://localhost:${ports.mlService}`;
}

export default {
  loadConfig,
  getConfig,
  getToolInfo,
  getPortConfig,
  getBiometricsConfig,
  getModalityConfig,
  isModalityEnabled,
  getEnabledModalities,
  getSecurityConfig,
  getAIConfig,
  getAIFunctions,
  getComplianceConfig,
  getUIConfig,
  getThemeConfig,
  getMatchingThresholds,
  getEnrollmentSampleCount,
  getQualityThreshold,
  getApiUrl,
  getWsUrl,
  getMlServiceUrl,
};
