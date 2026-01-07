import Anthropic from '@anthropic-ai/sdk';
import { Logger } from 'winston';
import {
  AIModel,
  AIMessage,
  Threat,
  Component,
  Mitigation,
  ThreatModel,
  AnalysisType
} from '../types.js';

export class AIService {
  private client: Anthropic;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }

    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Analyze threats for a given component using AI
   */
  async analyzeThreatsForComponent(
    component: Component,
    context: {
      model?: Partial<ThreatModel>;
      existingThreats?: Threat[];
      analysisType: AnalysisType;
    }
  ): Promise<{
    threats: Array<Partial<Threat>>;
    confidence: number;
    reasoning: string;
    recommendations: string[];
  }> {
    try {
      const prompt = this.buildThreatAnalysisPrompt(component, context);

      const response = await this.client.messages.create({
        model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: parseInt(process.env.MAX_TOKENS || '4096'),
        temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
        system: this.getThreatAnalysisSystemPrompt(),
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const analysis = this.parseThreatAnalysisResponse(response.content[0].type === 'text' ? response.content[0].text : '');

      this.logger.info('Threat analysis completed', {
        componentId: component.id,
        threatsFound: analysis.threats.length,
        confidence: analysis.confidence
      });

      return analysis;
    } catch (error) {
      this.logger.error('Failed to analyze threats for component', {
        componentId: component.id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Generate mitigation recommendations for identified threats
   */
  async generateMitigationRecommendations(
    threats: Threat[],
    component: Component,
    context?: Partial<ThreatModel>
  ): Promise<Array<Partial<Mitigation>>> {
    try {
      const prompt = this.buildMitigationPrompt(threats, component, context);

      const response = await this.client.messages.create({
        model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: parseInt(process.env.MAX_TOKENS || '4096'),
        temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
        system: this.getMitigationSystemPrompt(),
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const recommendations = this.parseMitigationResponse(response.content[0].type === 'text' ? response.content[0].text : '');

      this.logger.info('Mitigation recommendations generated', {
        componentId: component.id,
        threatCount: threats.length,
        recommendationsCount: recommendations.length
      });

      return recommendations;
    } catch (error) {
      this.logger.error('Failed to generate mitigation recommendations', {
        componentId: component.id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Perform risk assessment and scoring
   */
  async performRiskAssessment(
    threats: Threat[],
    mitigations: Mitigation[],
    component: Component
  ): Promise<{
    overallRiskScore: number;
    riskBreakdown: Record<string, number>;
    recommendations: string[];
  }> {
    try {
      const prompt = this.buildRiskAssessmentPrompt(threats, mitigations, component);

      const response = await this.client.messages.create({
        model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: parseInt(process.env.MAX_TOKENS || '4096'),
        temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
        system: this.getRiskAssessmentSystemPrompt(),
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const assessment = this.parseRiskAssessmentResponse(response.content[0].type === 'text' ? response.content[0].text : '');

      this.logger.info('Risk assessment completed', {
        componentId: component.id,
        overallRiskScore: assessment.overallRiskScore
      });

      return assessment;
    } catch (error) {
      this.logger.error('Failed to perform risk assessment', {
        componentId: component.id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Review architecture for security issues
   */
  async reviewArchitecture(
    model: ThreatModel,
    components: Component[]
  ): Promise<{
    issues: Array<{
      severity: 'Critical' | 'High' | 'Medium' | 'Low';
      description: string;
      recommendations: string[];
      affectedComponents: string[];
    }>;
    overallAssessment: string;
  }> {
    try {
      const prompt = this.buildArchitectureReviewPrompt(model, components);

      const response = await this.client.messages.create({
        model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: parseInt(process.env.MAX_TOKENS || '4096'),
        temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
        system: this.getArchitectureReviewSystemPrompt(),
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const review = this.parseArchitectureReviewResponse(response.content[0].type === 'text' ? response.content[0].text : '');

      this.logger.info('Architecture review completed', {
        modelId: model.id,
        issuesFound: review.issues.length
      });

      return review;
    } catch (error) {
      this.logger.error('Failed to review architecture', {
        modelId: model.id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * General AI chat for threat modeling assistance
   */
  async chat(
    messages: AIMessage[],
    context?: Record<string, any>
  ): Promise<{
    response: string;
    suggestions?: string[];
    followUpQuestions?: string[];
  }> {
    try {
      const conversationContext = this.buildChatContext(messages, context);

      const response = await this.client.messages.create({
        model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: parseInt(process.env.MAX_TOKENS || '4096'),
        temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
        system: this.getChatSystemPrompt(),
        messages: conversationContext
      });

      const chatResponse = this.parseChatResponse(response.content[0].type === 'text' ? response.content[0].text : '');

      this.logger.info('AI chat response generated', {
        messageCount: messages.length
      });

      return chatResponse;
    } catch (error) {
      this.logger.error('Failed to generate chat response', {
        error: error.message
      });
      throw error;
    }
  }

  // Private helper methods for building prompts
  private buildThreatAnalysisPrompt(component: Component, context: any): string {
    return `
Analyze the following component for potential security threats:

Component Details:
- Name: ${component.name}
- Type: ${component.type}
- Description: ${component.description}
- Trust Level: ${component.trustLevel}/10
- Data Sensitivity: ${component.dataSensitivity}

Interfaces:
${component.interfaces.map(intf => `- ${intf.name} (${intf.type}, ${intf.direction})`).join('\n')}

Additional Context:
- Analysis Type: ${context.analysisType}
- Existing Threats: ${context.existingThreats?.length || 0}
- Model Description: ${context.model?.description || 'N/A'}

Please identify potential threats using STRIDE, PASTA, and OCTAVE frameworks. For each threat, provide:
1. Threat title and description
2. Category (STRIDE/PASTA/OCTAVE/Custom)
3. Severity and likelihood
4. Prerequisites and examples
5. Confidence score (0-1)
6. Reasoning for the threat identification

Format your response as a JSON object with the following structure:
{
  "threats": [
    {
      "title": "string",
      "description": "string",
      "category": "STRIDE_Spoofing|STRIDE_Tampering|etc.",
      "severity": "Critical|High|Medium|Low|Info",
      "likelihood": "Very_High|High|Medium|Low|Very_Low",
      "prerequisites": ["string"],
      "examples": ["string"],
      "confidence": 0.85
    }
  ],
  "reasoning": "string",
  "recommendations": ["string"]
}
`;
  }

  private buildMitigationPrompt(threats: Threat[], component: Component, context?: any): string {
    return `
Generate mitigation recommendations for the following threats against this component:

Component: ${component.name} (${component.type})

Threats:
${threats.map((threat, index) => `
${index + 1}. ${threat.title}
   - Category: ${threat.category}
   - Severity: ${threat.severity}
   - Likelihood: ${threat.likelihood}
   - Description: ${threat.description}
`).join('\n')}

Context: ${context?.description || 'Standard enterprise environment'}

For each threat, provide mitigation strategies including:
1. Technical controls
2. Administrative controls
3. Physical controls (if applicable)
4. Cost and complexity assessment
5. Effectiveness rating
6. Implementation notes

Format your response as a JSON array of mitigation objects:
[
  {
    "threatId": "threat-id-here",
    "title": "Mitigation Title",
    "description": "Detailed description",
    "type": "Technical|Administrative|Physical",
    "cost": "Low|Medium|High|Very_High",
    "complexity": "Low|Medium|High|Very_High",
    "effectiveness": 85,
    "implementationNotes": "string",
    "responsibleParty": "string",
    "verificationMethod": "string"
  }
]
`;
  }

  private buildRiskAssessmentPrompt(threats: Threat[], mitigations: Mitigation[], component: Component): string {
    return `
Perform a comprehensive risk assessment for the following component:

Component: ${component.name} (${component.type})
Trust Level: ${component.trustLevel}/10
Data Sensitivity: ${component.dataSensitivity}

Active Threats (${threats.length}):
${threats.map(t => `- ${t.title} (${t.severity}/${t.likelihood})`).join('\n')}

Implemented Mitigations (${mitigations.length}):
${mitigations.map(m => `- ${m.title} (${m.effectiveness}% effective)`).join('\n')}

Calculate:
1. Overall risk score (0-10 scale)
2. Risk breakdown by category
3. Key risk drivers
4. Recommendations for risk reduction

Format your response as JSON:
{
  "overallRiskScore": 7.5,
  "riskBreakdown": {
    "STRIDE_Spoofing": 3.2,
    "STRIDE_Tampering": 8.1,
    "PASTA_Injection": 6.7
  },
  "recommendations": ["string"]
}
`;
  }

  private buildArchitectureReviewPrompt(model: ThreatModel, components: Component[]): string {
    return `
Review the following threat model architecture for security issues:

Model: ${model.name}
Description: ${model.description}
Components: ${components.length}

Component Overview:
${components.map(c => `- ${c.name} (${c.type}) - Trust: ${c.trustLevel}/10`).join('\n')}

Data Flows and Interfaces:
${components.flatMap(c => c.interfaces.map(i => `${c.name} -> ${i.name} (${i.type}, ${i.direction})`)).join('\n')}

Identify architectural security issues including:
1. Trust boundary violations
2. Insecure data flows
3. Missing security controls
4. Design weaknesses
5. Compliance gaps

Format your response as JSON:
{
  "issues": [
    {
      "severity": "Critical|High|Medium|Low",
      "description": "string",
      "recommendations": ["string"],
      "affectedComponents": ["component-id"]
    }
  ],
  "overallAssessment": "string"
}
`;
  }

  private buildChatContext(messages: AIMessage[], context?: any): Array<{role: 'user' | 'assistant', content: string}> {
    const systemContext = context ? `\nContext: ${JSON.stringify(context)}` : '';

    return messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content + systemContext
    }));
  }

  // System prompts
  private getThreatAnalysisSystemPrompt(): string {
    return `You are an expert threat modeling AI assistant specializing in identifying security threats using multiple frameworks (STRIDE, PASTA, OCTAVE). Your analysis should be thorough, practical, and based on real-world security experience. Focus on actionable insights that help security teams prioritize and mitigate risks effectively.`;
  }

  private getMitigationSystemPrompt(): string {
    return `You are a cybersecurity mitigation specialist. Provide practical, implementable mitigation strategies that balance security with business requirements. Include cost-benefit analysis and consider operational impact.`;
  }

  private getRiskAssessmentSystemPrompt(): string {
    return `You are a risk assessment expert. Calculate risk scores using industry-standard methodologies, considering likelihood, impact, and existing controls. Provide clear risk metrics and actionable recommendations.`;
  }

  private getArchitectureReviewSystemPrompt(): string {
    return `You are a security architecture reviewer. Analyze system designs for security weaknesses, trust boundaries, and potential attack vectors. Provide architectural recommendations that improve the overall security posture.`;
  }

  private getChatSystemPrompt(): string {
    return `You are a helpful threat modeling assistant. Provide clear, actionable advice on threat modeling concepts, methodologies, and best practices. Be conversational but professional, and offer specific examples when helpful.`;
  }

  // Response parsing methods
  private parseThreatAnalysisResponse(response: string): any {
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      this.logger.error('Failed to parse threat analysis response', { response, error });
      // Return a default response
      return {
        threats: [],
        confidence: 0,
        reasoning: 'Failed to parse AI response',
        recommendations: ['Please try again']
      };
    }
  }

  private parseMitigationResponse(response: string): any {
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      this.logger.error('Failed to parse mitigation response', { response, error });
      return [];
    }
  }

  private parseRiskAssessmentResponse(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      this.logger.error('Failed to parse risk assessment response', { response, error });
      return {
        overallRiskScore: 5,
        riskBreakdown: {},
        recommendations: ['Unable to calculate risk score']
      };
    }
  }

  private parseArchitectureReviewResponse(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      this.logger.error('Failed to parse architecture review response', { response, error });
      return {
        issues: [],
        overallAssessment: 'Unable to complete architecture review'
      };
    }
  }

  private parseChatResponse(response: string): any {
    // For chat responses, we can be more flexible with parsing
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(response);
      return {
        response: parsed.response || response,
        suggestions: parsed.suggestions || [],
        followUpQuestions: parsed.followUpQuestions || []
      };
    } catch {
      // If not JSON, treat as plain text response
      return {
        response,
        suggestions: [],
        followUpQuestions: []
      };
    }
  }
}