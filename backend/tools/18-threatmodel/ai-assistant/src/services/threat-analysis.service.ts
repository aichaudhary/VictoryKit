import { Logger } from 'winston';
import { v4 as uuidv4 } from 'uuid';
import {
  ThreatAnalysisRequest,
  ThreatAnalysisResponse,
  Component,
  Threat,
  Mitigation,
  ThreatModel,
  AnalysisType,
  APIResponse
} from '../types.js';
import { AIService } from './ai.service.js';
import { SessionService } from './session.service.js';

export class ThreatAnalysisService {
  private aiService: AIService;
  private sessionService: SessionService;
  private logger: Logger;

  constructor(
    aiService: AIService,
    sessionService: SessionService,
    logger: Logger
  ) {
    this.aiService = aiService;
    this.sessionService = sessionService;
    this.logger = logger;
  }

  /**
   * Main method to analyze threats based on WebSocket request
   */
  async analyzeThreats(request: ThreatAnalysisRequest): Promise<ThreatAnalysisResponse> {
    const startTime = Date.now();

    try {
      this.logger.info('Starting threat analysis', {
        sessionId: request.sessionId,
        analysisType: request.analysisType
      });

      let results: any[] = [];

      switch (request.analysisType) {
        case 'threat_identification':
          results = await this.identifyThreats(request);
          break;
        case 'risk_assessment':
          results = await this.performRiskQuantifyment(request);
          break;
        case 'mitigation_suggestions':
          results = await this.suggestMitigations(request);
          break;
        case 'architecture_review':
          results = await this.reviewArchitecture(request);
          break;
        case 'compliance_check':
          results = await this.checkCompliance(request);
          break;
        case 'attack_vector_analysis':
          results = await this.analyzeAttackVectors(request);
          break;
        default:
          throw new Error(`Unsupported analysis type: ${request.analysisType}`);
      }

      const processingTime = Date.now() - startTime;

      const response: ThreatAnalysisResponse = {
        type: 'threat_analysis_response',
        sessionId: request.sessionId,
        analysisId: uuidv4(),
        results,
        metadata: {
          model: 'claude-3-5-sonnet-20241022', // This should come from config
          processingTime,
          tokensUsed: 0 // This would be tracked from AI service
        }
      };

      this.logger.info('Threat analysis completed', {
        sessionId: request.sessionId,
        analysisId: response.analysisId,
        resultCount: results.length,
        processingTime
      });

      return response;

    } catch (error) {
      this.logger.error('Threat analysis failed', {
        sessionId: request.sessionId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Identify threats for components
   */
  private async identifyThreats(request: ThreatAnalysisRequest): Promise<any[]> {
    const results: any[] = [];

    // Get session context to understand what components/models we're working with
    const session = await this.sessionService.getSession(request.sessionId);
    const context = session?.context || {};

    // If componentId is provided, analyze that specific component
    if (request.componentId) {
      const component = await this.getComponentFromContext(request.componentId, context);
      if (component) {
        const analysis = await this.aiService.analyzeThreatsForComponent(component, {
          model: context.modelData,
          existingThreats: context.existingThreats || [],
          analysisType: request.analysisType
        });

        results.push({
          componentId: request.componentId,
          ...analysis
        });
      }
    } else {
      // Analyze all components in the model
      const components = context.components || [];
      for (const component of components) {
        try {
          const analysis = await this.aiService.analyzeThreatsForComponent(component, {
            model: context.modelData,
            existingThreats: context.existingThreats || [],
            analysisType: request.analysisType
          });

          results.push({
            componentId: component.id,
            ...analysis
          });
        } catch (error) {
          this.logger.warn('Failed to analyze component', {
            componentId: component.id,
            error: error.message
          });
        }
      }
    }

    return results;
  }

  /**
   * Perform risk assessment
   */
  private async performRiskQuantifyment(request: ThreatAnalysisRequest): Promise<any[]> {
    const session = await this.sessionService.getSession(request.sessionId);
    const context = session?.context || {};

    const threats = context.threats || [];
    const mitigations = context.mitigations || [];
    const components = context.components || [];

    const results: any[] = [];

    for (const component of components) {
      try {
        const componentThreats = threats.filter((t: Threat) =>
          t.affectedComponents.includes(component.id)
        );
        const componentMitigations = mitigations.filter((m: Mitigation) =>
          componentThreats.some((t: Threat) => t.id === m.threatId)
        );

        const assessment = await this.aiService.performRiskQuantifyment(
          componentThreats,
          componentMitigations,
          component
        );

        results.push({
          componentId: component.id,
          ...assessment
        });
      } catch (error) {
        this.logger.warn('Failed to assess risk for component', {
          componentId: component.id,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Generate mitigation suggestions
   */
  private async suggestMitigations(request: ThreatAnalysisRequest): Promise<any[]> {
    const session = await this.sessionService.getSession(request.sessionId);
    const context = session?.context || {};

    const threats = context.threats || [];
    const components = context.components || [];

    const results: any[] = [];

    for (const threat of threats) {
      try {
        const affectedComponent = components.find((c: Component) =>
          threat.affectedComponents.includes(c.id)
        );

        if (affectedComponent) {
          const recommendations = await this.aiService.generateMitigationRecommendations(
            [threat],
            affectedComponent,
            context.modelData
          );

          results.push({
            threatId: threat.id,
            recommendations
          });
        }
      } catch (error) {
        this.logger.warn('Failed to generate mitigations for threat', {
          threatId: threat.id,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Review architecture for security issues
   */
  private async reviewArchitecture(request: ThreatAnalysisRequest): Promise<any[]> {
    const session = await this.sessionService.getSession(request.sessionId);
    const context = session?.context || {};

    const model = context.modelData as ThreatModel;
    const components = context.components || [];

    if (!model) {
      throw new Error('No threat model data available for architecture review');
    }

    const review = await this.aiService.reviewArchitecture(model, components);

    return [{
      modelId: model.id,
      ...review
    }];
  }

  /**
   * Check compliance against standards
   */
  private async checkCompliance(request: ThreatAnalysisRequest): Promise<any[]> {
    // This would integrate with compliance checking logic
    // For now, return a placeholder
    return [{
      compliance: 'partial',
      standards: ['NIST', 'ISO27001'],
      gaps: ['Missing encryption controls', 'Inadequate access controls'],
      recommendations: ['Implement encryption at rest', 'Add multi-factor authentication']
    }];
  }

  /**
   * Analyze attack vectors
   */
  private async analyzeAttackVectors(request: ThreatAnalysisRequest): Promise<any[]> {
    const session = await this.sessionService.getSession(request.sessionId);
    const context = session?.context || {};

    const components = context.components || [];

    const results: any[] = [];

    for (const component of components) {
      // Analyze attack vectors for each component
      const attackVectors = this.identifyAttackVectors(component, context);

      results.push({
        componentId: component.id,
        attackVectors
      });
    }

    return results;
  }

  /**
   * Analyze a specific component
   */
  async analyzeComponent(componentId: string, analysisType: AnalysisType): Promise<any> {
    // Get component data from external API or session context
    const component = await this.getComponentById(componentId);

    if (!component) {
      throw new Error(`Component not found: ${componentId}`);
    }

    const analysis = await this.aiService.analyzeThreatsForComponent(component, {
      analysisType,
      existingThreats: [],
      model: {}
    });

    return analysis;
  }

  /**
   * Generate mitigation recommendations for a threat
   */
  async generateMitigations(threatId: string): Promise<any[]> {
    const threat = await this.getThreatById(threatId);
    const component = await this.getComponentById(threat.affectedComponents[0]);

    if (!threat || !component) {
      throw new Error('Threat or component not found');
    }

    const recommendations = await this.aiService.generateMitigationRecommendations(
      [threat],
      component
    );

    return recommendations;
  }

  /**
   * Calculate risk for given components and threats
   */
  async calculateRisk(componentIds?: string[], threatIds?: string[]): Promise<any> {
    const components = componentIds ?
      await Promise.all(componentIds.map(id => this.getComponentById(id))) :
      await this.getAllComponents();

    const threats = threatIds ?
      await Promise.all(threatIds.map(id => this.getThreatById(id))) :
      await this.getAllThreats();

    const mitigations = await this.getAllMitigations();

    let totalRiskScore = 0;
    const riskBreakdown: Record<string, number> = {};
    const recommendations: string[] = [];

    for (const component of components) {
      const componentThreats = threats.filter(t =>
        t.affectedComponents.includes(component.id)
      );

      const componentMitigations = mitigations.filter(m =>
        componentThreats.some(t => t.id === m.threatId)
      );

      const assessment = await this.aiService.performRiskQuantifyment(
        componentThreats,
        componentMitigations,
        component
      );

      totalRiskScore += assessment.overallRiskScore;
      Object.assign(riskBreakdown, assessment.riskBreakdown);
      recommendations.push(...assessment.recommendations);
    }

    const overallRiskScore = totalRiskScore / components.length;

    return {
      overallRiskScore,
      riskBreakdown,
      recommendations: [...new Set(recommendations)] // Remove duplicates
    };
  }

  /**
   * Process general chat messages
   */
  async processChatMessage(sessionId: string, message: string, context?: any): Promise<any> {
    const session = await this.sessionService.getSession(sessionId);
    const conversationHistory = session?.context?.conversationHistory || [];

    // Add user message to history
    conversationHistory.push({
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    const response = await this.aiService.chat(conversationHistory, context);

    // Add AI response to history
    conversationHistory.push({
      id: uuidv4(),
      role: 'assistant',
      content: response.response,
      timestamp: new Date()
    });

    // Update session with new conversation history
    await this.sessionService.updateSessionContext(sessionId, {
      conversationHistory
    });

    return response;
  }

  // Helper methods
  private async getComponentFromContext(componentId: string, context: any): Promise<Component | null> {
    const components = context.components || [];
    return components.find((c: Component) => c.id === componentId) || null;
  }

  private async getComponentById(componentId: string): Promise<Component> {
    // This would typically call the main threatmodel API
    // For now, return a mock component
    return {
      id: componentId,
      name: 'Mock Component',
      type: 'Web_Application',
      description: 'Mock component for testing',
      properties: {},
      trustLevel: 5,
      dataSensitivity: 'Internal',
      interfaces: []
    };
  }

  private async getThreatById(threatId: string): Promise<Threat> {
    // This would typically call the main threatmodel API
    // For now, return a mock threat
    return {
      id: threatId,
      title: 'Mock Threat',
      description: 'Mock threat for testing',
      category: 'STRIDE_Spoofing',
      severity: 'High',
      likelihood: 'Medium',
      impact: 7,
      affectedComponents: [],
      prerequisites: [],
      examples: [],
      references: [],
      discoveredAt: new Date(),
      status: 'Open'
    };
  }

  private async getAllComponents(): Promise<Component[]> {
    // This would fetch from the main API
    return [];
  }

  private async getAllThreats(): Promise<Threat[]> {
    // This would fetch from the main API
    return [];
  }

  private async getAllMitigations(): Promise<Mitigation[]> {
    // This would fetch from the main API
    return [];
  }

  private identifyAttackVectors(component: Component, context: any): any[] {
    // Basic attack vector identification logic
    const attackVectors: any[] = [];

    // Check interfaces for potential attack vectors
    for (const interface_ of component.interfaces) {
      if (interface_.direction === 'Inbound') {
        attackVectors.push({
          type: 'Network_Attack',
          interface: interface_.name,
          description: `Potential network-based attacks through ${interface_.name}`,
          likelihood: 'High'
        });
      }
    }

    // Component-type specific attack vectors
    switch (component.type) {
      case 'Web_Application':
        attackVectors.push(
          {
            type: 'Injection_Attack',
            description: 'SQL injection, XSS, command injection',
            likelihood: 'High'
          },
          {
            type: 'Authentication_Bypass',
            description: 'Session hijacking, credential stuffing',
            likelihood: 'Medium'
          }
        );
        break;
      case 'Database':
        attackVectors.push(
          {
            type: 'Data_Exfiltration',
            description: 'Unauthorized data access and extraction',
            likelihood: 'High'
          },
          {
            type: 'Data_Tampering',
            description: 'Unauthorized data modification',
            likelihood: 'Medium'
          }
        );
        break;
    }

    return attackVectors;
  }
}