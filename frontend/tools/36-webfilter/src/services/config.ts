/**
 * WebFilter Configuration Service
 * Manages tool configuration and settings
 */

import configData from '../../webfilter-config.json';

export interface WebFilterConfig {
  toolId: number;
  toolName: string;
  displayName: string;
  description: string;
  version: string;
  category: string;
  subdomain: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    darkColor: string;
    lightColor: string;
  };
  ports: {
    frontend: number;
    api: number;
    aiAssistant: number;
    mlEngine: number;
  };
  database: {
    name: string;
    collections: string[];
  };
  aiAssistant: {
    enabled: boolean;
    wsEndpoint: string;
    model: string;
    context: string;
  };
  features: any;
  integrations: any;
  aiFunctions: any[];
  api: any;
  realWorldUsage: any;
  premiumFeatures: any;
}

class ConfigService {
  private config: WebFilterConfig;

  constructor() {
    this.config = configData as WebFilterConfig;
  }

  // Get full configuration
  getConfig(): WebFilterConfig {
    return this.config;
  }

  // Get theme colors
  getTheme() {
    return this.config.theme;
  }

  // Get API endpoints
  getAPIEndpoints() {
    return this.config.api.endpoints;
  }

  // Get AI functions
  getAIFunctions() {
    return this.config.aiFunctions;
  }

  // Get features
  getFeatures() {
    return this.config.features;
  }

  // Get integrations
  getIntegrations() {
    return this.config.integrations;
  }

  // Get database info
  getDatabaseInfo() {
    return this.config.database;
  }

  // Get ports
  getPorts() {
    return this.config.ports;
  }

  // Get subdomain
  getSubdomain(): string {
    return this.config.subdomain;
  }

  // Get AI Assistant endpoint
  getAIEndpoint(): string {
    return this.config.aiAssistant.wsEndpoint;
  }

  // Check if feature is enabled
  isFeatureEnabled(featurePath: string): boolean {
    const parts = featurePath.split('.');
    let current: any = this.config.features;

    for (const part of parts) {
      if (current[part] === undefined) return false;
      current = current[part];
    }

    return current === true || (typeof current === 'object' && current.enabled === true);
  }

  // Get content categories
  getContentCategories(): string[] {
    return this.config.features.contentFiltering?.categories || [];
  }

  // Get compliance standards
  getComplianceStandards(): string[] {
    return this.config.features.compliance?.standards || [];
  }

  // Get threat intelligence sources
  getThreatIntelSources(): string[] {
    return this.config.integrations.threatIntelligence || [];
  }

  // Get real-world use cases for organization type
  getUseCases(orgType: 'enterprise' | 'education' | 'government' | 'healthcare') {
    return this.config.realWorldUsage[orgType] || {};
  }

  // Get premium features
  getPremiumFeatures() {
    return this.config.premiumFeatures.vvip;
  }

  // Build API URL
  buildAPIUrl(endpoint: string): string {
    const baseUrl = this.config.api.baseUrl;
    return `${baseUrl}${endpoint}`;
  }

  // Build WebSocket URL
  buildWSUrl(): string {
    return this.config.aiAssistant.wsEndpoint;
  }

  // Get tool metadata
  getMetadata() {
    return {
      id: this.config.toolId,
      name: this.config.toolName,
      displayName: this.config.displayName,
      description: this.config.description,
      version: this.config.version,
      category: this.config.category,
      subdomain: this.config.subdomain
    };
  }

  // Validate configuration
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.toolId || this.config.toolId !== 36) {
      errors.push('Invalid tool ID');
    }

    if (!this.config.ports.frontend || !this.config.ports.api) {
      errors.push('Missing required ports');
    }

    if (!this.config.database.name) {
      errors.push('Missing database name');
    }

    if (!this.config.aiFunctions || this.config.aiFunctions.length === 0) {
      errors.push('No AI functions defined');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Export configuration as JSON
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  // Get AI function by name
  getAIFunction(name: string) {
    return this.config.aiFunctions.find(fn => fn.name === name);
  }

  // Get all AI function names
  getAIFunctionNames(): string[] {
    return this.config.aiFunctions.map(fn => fn.name);
  }

  // Get feature description
  getFeatureDescription(featurePath: string): string {
    const parts = featurePath.split('.');
    let current: any = this.config.features;

    for (const part of parts) {
      if (current[part] === undefined) return '';
      current = current[part];
    }

    return current.description || '';
  }

  // Get integration status
  getIntegrationStatus(category: string, name: string): boolean {
    const integrations = this.config.integrations[category];
    return integrations ? integrations.includes(name) : false;
  }
}

// Export singleton instance
export const configService = new ConfigService();
export default configService;
