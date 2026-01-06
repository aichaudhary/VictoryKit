// PasswordVault Configuration Loader
// Loads and manages tool configuration

import configData from '../../passwordvault-config.json';

export interface PasswordVaultConfig {
  toolName: string;
  tagline: string;
  subdomain: string;
  port: number;
  apiPort: number;
  mlPort: number;
  aiPort: number;
  databaseName: string;
  theme: ThemeConfig;
  navigation: NavItem[];
  secretTypes: SecretTypeConfig[];
  encryptionAlgorithms: EncryptionAlgorithm[];
  passwordStrength: PasswordStrengthConfig;
  vaultTypes: VaultTypeConfig[];
  accessRoles: AccessRole[];
  securityPolicies: SecurityPoliciesConfig;
  systemPrompt: string;
  functions: AIFunction[];
  integrations: Integration[];
  complianceFrameworks: ComplianceFramework[];
  features: Record<string, boolean>;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  borderColor: string;
  textPrimary: string;
  textSecondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  gradient: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

export interface SecretTypeConfig {
  id: string;
  name: string;
  icon: string;
  fields: string[];
}

export interface EncryptionAlgorithm {
  id: string;
  name: string;
  keySize: number;
  recommended: boolean;
}

export interface PasswordStrengthConfig {
  levels: {
    score: number;
    label: string;
    color: string;
    minLength: number;
  }[];
  requirements: {
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    noRepeatingChars: number;
    noSequentialChars: number;
    noCommonWords: boolean;
  };
}

export interface VaultTypeConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface AccessRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface SecurityPoliciesConfig {
  mfa: {
    methods: string[];
    enforcementLevels: string[];
  };
  sessionManagement: {
    maxSessionDuration: number;
    idleTimeout: number;
    maxConcurrentSessions: number;
  };
  passwordPolicy: {
    maxAge: number;
    minAge: number;
    historyCount: number;
    lockoutThreshold: number;
    lockoutDuration: number;
  };
}

export interface AIFunction {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
      minimum?: number;
      maximum?: number;
      items?: { type: string };
    }>;
    required?: string[];
  };
}

export interface Integration {
  id: string;
  name: string;
  icon: string;
  platforms?: string[];
  type?: string;
}

export interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
}

class ConfigService {
  private config: PasswordVaultConfig;
  
  constructor() {
    this.config = configData as PasswordVaultConfig;
  }
  
  getConfig(): PasswordVaultConfig {
    return this.config;
  }
  
  getTheme(): ThemeConfig {
    return this.config.theme;
  }
  
  getNavigation(): NavItem[] {
    return this.config.navigation;
  }
  
  getSecretTypes(): SecretTypeConfig[] {
    return this.config.secretTypes;
  }
  
  getEncryptionAlgorithms(): EncryptionAlgorithm[] {
    return this.config.encryptionAlgorithms;
  }
  
  getPasswordStrengthConfig(): PasswordStrengthConfig {
    return this.config.passwordStrength;
  }
  
  getVaultTypes(): VaultTypeConfig[] {
    return this.config.vaultTypes;
  }
  
  getAccessRoles(): AccessRole[] {
    return this.config.accessRoles;
  }
  
  getSecurityPolicies(): SecurityPoliciesConfig {
    return this.config.securityPolicies;
  }
  
  getSystemPrompt(): string {
    return this.config.systemPrompt;
  }
  
  getAIFunctions(): AIFunction[] {
    return this.config.functions;
  }
  
  getIntegrations(): Integration[] {
    return this.config.integrations;
  }
  
  getComplianceFrameworks(): ComplianceFramework[] {
    return this.config.complianceFrameworks;
  }
  
  getFeatures(): Record<string, boolean> {
    return this.config.features;
  }
  
  isFeatureEnabled(featureName: string): boolean {
    return this.config.features[featureName] ?? false;
  }
  
  getApiUrl(): string {
    return `http://localhost:${this.config.apiPort}/api`;
  }
  
  getAIWebSocketUrl(): string {
    return `ws://localhost:${this.config.aiPort}/maula-ai`;
  }
}

// Singleton instance
const configService = new ConfigService();

export const getConfig = () => configService.getConfig();
export const getTheme = () => configService.getTheme();
export const getNavigation = () => configService.getNavigation();
export const getSecretTypes = () => configService.getSecretTypes();
export const getEncryptionAlgorithms = () => configService.getEncryptionAlgorithms();
export const getPasswordStrengthConfig = () => configService.getPasswordStrengthConfig();
export const getVaultTypes = () => configService.getVaultTypes();
export const getAccessRoles = () => configService.getAccessRoles();
export const getSecurityPolicies = () => configService.getSecurityPolicies();
export const getSystemPrompt = () => configService.getSystemPrompt();
export const getAIFunctions = () => configService.getAIFunctions();
export const getIntegrations = () => configService.getIntegrations();
export const getComplianceFrameworks = () => configService.getComplianceFrameworks();
export const getFeatures = () => configService.getFeatures();
export const isFeatureEnabled = (name: string) => configService.isFeatureEnabled(name);
export const getApiUrl = () => configService.getApiUrl();
export const getAIWebSocketUrl = () => configService.getAIWebSocketUrl();

export default configService;
