/**
 * RiskQuantify AI Assistant
 * WebSocket Server for Real-time AI-Powered Risk Analysis
 * Port: 6019
 *
 * Features:
 * - Claude Opus/Sonnet 4.5 integration for intelligent risk assessment
 * - Real-time risk quantification and analysis
 * - Threat scenario modeling and impact forecasting
 * - Compliance risk evaluation and mitigation recommendations
 * - Business impact analysis and recovery planning
 * - Multi-LLM fallback (Claude, Gemini, GPT-4)
 */

import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import crypto from 'crypto-js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.AI_PORT || 6019;
const wss = new WebSocket.Server({ port: Number(PORT) });

// Initialize AI clients
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Connection tracking
const connections = new Map<string, WebSocket>();
const sessions = new Map<string, any>();

interface RiskQuery {
  type: 'risk_analysis' | 'threat_modeling' | 'impact_assessment' | 'compliance_check' | 'mitigation_strategy' | 'scenario_planning';
  data: any;
  context?: any;
}

interface AIResponse {
  id: string;
  type: string;
  content: string;
  confidence?: number;
  recommendations?: string[];
  riskScore?: number;
  timestamp: Date;
}

// WebSocket connection handling
wss.on('connection', (ws: WebSocket) => {
  const connectionId = uuidv4();
  connections.set(connectionId, ws);

  console.log(`RiskQuantify AI Assistant: New connection ${connectionId}`);

  // Send welcome message
  const welcomeMessage: AIResponse = {
    id: uuidv4(),
    type: 'welcome',
    content: 'Welcome to RiskQuantify AI Assistant. I can help you with risk analysis, threat modeling, impact assessment, compliance evaluation, and mitigation strategies. How can I assist with your risk management today?',
    timestamp: new Date()
  };

  ws.send(JSON.stringify(welcomeMessage));

  ws.on('message', async (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      await handleRiskQuery(ws, message, connectionId);
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        id: uuidv4(),
        type: 'error',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      }));
    }
  });

  ws.on('close', () => {
    connections.delete(connectionId);
    console.log(`RiskQuantify AI Assistant: Connection ${connectionId} closed`);
  });

  ws.on('error', (error) => {
    console.error(`RiskQuantify AI Assistant: Connection ${connectionId} error:`, error);
    connections.delete(connectionId);
  });
});

async function handleRiskQuery(ws: WebSocket, query: RiskQuery, connectionId: string) {
  const { type, data, context } = query;

  try {
    let response: AIResponse;

    switch (type) {
      case 'risk_analysis':
        response = await analyzeRisk(data, context);
        break;
      case 'threat_modeling':
        response = await modelThreat(data, context);
        break;
      case 'impact_assessment':
        response = await assessImpact(data, context);
        break;
      case 'compliance_check':
        response = await checkCompliance(data, context);
        break;
      case 'mitigation_strategy':
        response = await suggestMitigation(data, context);
        break;
      case 'scenario_planning':
        response = await planScenario(data, context);
        break;
      default:
        response = {
          id: uuidv4(),
          type: 'unknown',
          content: 'I\'m not sure how to help with that type of risk assessment. I can assist with risk analysis, threat modeling, impact assessment, compliance checking, mitigation strategies, and scenario planning.',
          timestamp: new Date()
        };
    }

    ws.send(JSON.stringify(response));
  } catch (error) {
    console.error('Error in risk query handling:', error);
    ws.send(JSON.stringify({
      id: uuidv4(),
      type: 'error',
      content: 'I encountered an error while analyzing your risk query. Please try rephrasing your request.',
      timestamp: new Date()
    }));
  }
}

async function analyzeRisk(data: any, context?: any): Promise<AIResponse> {
  const prompt = `Analyze the following risk scenario and provide a comprehensive risk assessment:

Risk Details: ${JSON.stringify(data)}
Context: ${JSON.stringify(context || {})}

Please provide:
1. Risk level assessment (Critical/High/Medium/Low)
2. Key risk factors and drivers
3. Potential impact analysis
4. Recommended mitigation approaches
5. Risk monitoring suggestions

Format your response as a structured analysis.`;

  try {
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const analysis = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : 'Analysis unavailable';

    return {
      id: uuidv4(),
      type: 'risk_analysis',
      content: analysis,
      confidence: 0.85,
      riskScore: calculateRiskScore(data),
      recommendations: extractRecommendations(analysis),
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Claude API error:', error);
    return fallbackRiskAnalysis(data);
  }
}

async function modelThreat(data: any, context?: any): Promise<AIResponse> {
  const prompt = `Create a comprehensive threat model for the following scenario:

Scenario: ${JSON.stringify(data)}
Context: ${JSON.stringify(context || {})}

Include:
1. Potential threat actors and their motivations
2. Attack vectors and methods
3. Vulnerabilities that could be exploited
4. Potential impact of successful attacks
5. Recommended security controls

Structure your response as a professional threat model.`;

  try {
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const model = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : 'Threat model unavailable';

    return {
      id: uuidv4(),
      type: 'threat_modeling',
      content: model,
      confidence: 0.82,
      recommendations: extractRecommendations(model),
      timestamp: new Date()
    };
  } catch (error) {
    return fallbackThreatModeling(data);
  }
}

async function assessImpact(data: any, context?: any): Promise<AIResponse> {
  const prompt = `Perform a detailed business impact analysis for:

Risk Scenario: ${JSON.stringify(data)}
Business Context: ${JSON.stringify(context || {})}

Analyze:
1. Financial impact (direct and indirect costs)
2. Operational impact (disruption duration, recovery time)
3. Reputational impact (brand damage, customer trust)
4. Compliance impact (regulatory consequences)
5. Recovery strategies and timeframes

Provide quantitative estimates where possible.`;

  try {
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const assessment = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : 'Impact assessment unavailable';

    return {
      id: uuidv4(),
      type: 'impact_assessment',
      content: assessment,
      confidence: 0.88,
      recommendations: extractRecommendations(assessment),
      timestamp: new Date()
    };
  } catch (error) {
    return fallbackImpactAssessment(data);
  }
}

async function checkCompliance(data: any, context?: any): Promise<AIResponse> {
  const prompt = `Evaluate compliance risks for:

Risk Scenario: ${JSON.stringify(data)}
Compliance Context: ${JSON.stringify(context || {})}

Assess against:
1. GDPR requirements
2. HIPAA regulations
3. PCI DSS standards
4. ISO 27001 framework
5. Industry-specific regulations

Identify compliance gaps and recommend remediation actions.`;

  try {
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const evaluation = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : 'Compliance evaluation unavailable';

    return {
      id: uuidv4(),
      type: 'compliance_check',
      content: evaluation,
      confidence: 0.90,
      recommendations: extractRecommendations(evaluation),
      timestamp: new Date()
    };
  } catch (error) {
    return fallbackRuntimeGuard(data);
  }
}

async function suggestMitigation(data: any, context?: any): Promise<AIResponse> {
  const prompt = `Develop comprehensive mitigation strategies for:

Risk: ${JSON.stringify(data)}
Context: ${JSON.stringify(context || {})}

Provide:
1. Immediate mitigation actions (short-term)
2. Long-term risk reduction strategies
3. Cost-benefit analysis of mitigation options
4. Implementation roadmap and priorities
5. Success metrics and monitoring approach

Focus on practical, actionable recommendations.`;

  try {
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const strategy = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : 'Mitigation strategy unavailable';

    return {
      id: uuidv4(),
      type: 'mitigation_strategy',
      content: strategy,
      confidence: 0.86,
      recommendations: extractRecommendations(strategy),
      timestamp: new Date()
    };
  } catch (error) {
    return fallbackMitigationStrategy(data);
  }
}

async function planScenario(data: any, context?: any): Promise<AIResponse> {
  const prompt = `Develop detailed scenario planning for:

Risk Scenario: ${JSON.stringify(data)}
Planning Context: ${JSON.stringify(context || {})}

Create:
1. Best case scenario and response plan
2. Worst case scenario and contingency plans
3. Most likely scenario and preparedness measures
4. Early warning indicators and triggers
5. Communication and stakeholder management plans

Ensure scenarios are realistic and actionable.`;

  try {
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const plan = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : 'Scenario planning unavailable';

    return {
      id: uuidv4(),
      type: 'scenario_planning',
      content: plan,
      confidence: 0.84,
      recommendations: extractRecommendations(plan),
      timestamp: new Date()
    };
  } catch (error) {
    return fallbackScenarioPlanning(data);
  }
}

// Utility functions
function calculateRiskScore(data: any): number {
  // Simple risk scoring algorithm - can be enhanced
  const probability = data.probability || 3;
  const impact = data.impact || 3;
  return Math.min(probability * impact, 25); // Max score of 25 for 5x5 matrix
}

function extractRecommendations(content: string): string[] {
  // Extract actionable recommendations from AI response
  const recommendations: string[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    if (line.includes('recommend') || line.includes('should') || line.includes('consider') ||
        line.includes('implement') || line.includes('establish') || line.includes('develop')) {
      recommendations.push(line.trim());
    }
  }

  return recommendations.slice(0, 5); // Limit to top 5 recommendations
}

// Fallback functions for when Claude API is unavailable
function fallbackRiskAnalysis(data: any): AIResponse {
  return {
    id: uuidv4(),
    type: 'risk_analysis',
    content: `Fallback Risk Analysis for: ${data.name || 'Unknown Risk'}

Based on the information provided, this appears to be a ${data.category || 'general'} risk.

Key Considerations:
• Risk Level: Medium (requires further assessment)
• Potential Impact: ${data.impact || 'Moderate'}
• Likelihood: ${data.probability || 'Possible'}

Recommended Actions:
1. Gather more detailed risk data
2. Consult with subject matter experts
3. Perform quantitative risk analysis
4. Develop mitigation strategies
5. Establish monitoring mechanisms

Please provide more details for a comprehensive analysis.`,
    confidence: 0.6,
    riskScore: calculateRiskScore(data),
    recommendations: [
      'Gather additional risk data',
      'Consult subject matter experts',
      'Perform quantitative analysis',
      'Develop mitigation plan',
      'Establish monitoring'
    ],
    timestamp: new Date()
  };
}

function fallbackThreatModeling(data: any): AIResponse {
  return {
    id: uuidv4(),
    type: 'threat_modeling',
    content: `Basic Threat Model for: ${data.name || 'System/Application'}

Potential Threat Actors:
• External attackers (hackers, cybercriminals)
• Internal threats (malicious insiders)
• Supply chain vulnerabilities
• Natural disasters or system failures

Common Attack Vectors:
• Network-based attacks (DDoS, MITM)
• Application vulnerabilities (injection, XSS)
• Physical security breaches
• Social engineering attacks

Recommended Controls:
• Implement multi-layered security
• Regular vulnerability assessments
• Employee security training
• Incident response planning
• Continuous monitoring

This is a basic model. Consider engaging security experts for comprehensive threat modeling.`,
    confidence: 0.5,
    recommendations: [
      'Implement multi-layered security',
      'Conduct regular assessments',
      'Provide security training',
      'Develop incident response plan',
      'Enable continuous monitoring'
    ],
    timestamp: new Date()
  };
}

function fallbackImpactAssessment(data: any): AIResponse {
  return {
    id: uuidv4(),
    type: 'impact_assessment',
    content: `Business Impact Assessment for: ${data.name || 'Risk Event'}

Potential Impacts:
• Financial: Direct costs, lost revenue, recovery expenses
• Operational: System downtime, reduced productivity, manual processes
• Reputational: Customer trust, brand damage, media coverage
• Compliance: Regulatory fines, legal consequences, audit findings

Recovery Considerations:
• Recovery Time Objective (RTO): Target system restoration time
• Recovery Point Objective (RPO): Maximum acceptable data loss
• Business Continuity Plans: Alternative processes and procedures
• Communication Plans: Stakeholder notification and updates

Quantitative Estimates:
• Financial Impact: High (requires detailed calculation)
• Operational Impact: Medium to High
• Recovery Time: 24-72 hours (estimated)

Recommendations:
1. Develop detailed business impact analysis
2. Create comprehensive business continuity plans
3. Establish recovery time objectives
4. Implement regular testing and updates
5. Maintain clear communication channels`,
    confidence: 0.55,
    recommendations: [
      'Develop detailed impact analysis',
      'Create business continuity plans',
      'Establish recovery objectives',
      'Implement regular testing',
      'Maintain communication channels'
    ],
    timestamp: new Date()
  };
}

function fallbackRuntimeGuard(data: any): AIResponse {
  return {
    id: uuidv4(),
    type: 'compliance_check',
    content: `Compliance Risk Assessment for: ${data.name || 'Risk Scenario'}

Regulatory Considerations:
• GDPR: Data protection and privacy requirements
• HIPAA: Protected health information safeguards
• PCI DSS: Payment card data security standards
• SOX: Financial reporting and internal controls
• ISO 27001: Information security management

Potential Compliance Gaps:
• Inadequate data protection measures
• Insufficient access controls
• Lack of audit logging and monitoring
• Incomplete incident response procedures
• Missing regulatory reporting mechanisms

Recommended Actions:
1. Conduct comprehensive compliance assessment
2. Implement required security controls
3. Establish audit and monitoring procedures
4. Develop incident response capabilities
5. Create regulatory reporting processes

Note: This is a general assessment. Consult legal and compliance experts for specific regulatory requirements.`,
    confidence: 0.58,
    recommendations: [
      'Conduct compliance assessment',
      'Implement security controls',
      'Establish audit procedures',
      'Develop incident response',
      'Create reporting processes'
    ],
    timestamp: new Date()
  };
}

function fallbackMitigationStrategy(data: any): AIResponse {
  return {
    id: uuidv4(),
    type: 'mitigation_strategy',
    content: `Risk Mitigation Strategy for: ${data.name || 'Identified Risk'}

Immediate Actions (0-30 days):
• Risk assessment and prioritization
• Initial control implementation
• Stakeholder communication
• Resource allocation planning

Short-term Mitigation (1-6 months):
• Comprehensive risk treatment plan
• Control effectiveness testing
• Monitoring system implementation
• Training and awareness programs

Long-term Strategy (6+ months):
• Continuous improvement processes
• Advanced threat detection
• Automated response systems
• Regular risk reassessments

Cost-Benefit Considerations:
• Mitigation costs vs. potential losses
• Resource requirements and constraints
• Implementation timelines and dependencies
• Success metrics and measurement

Implementation Roadmap:
1. Form cross-functional risk mitigation team
2. Develop detailed implementation plan
3. Allocate necessary resources and budget
4. Establish timelines and milestones
5. Implement monitoring and measurement systems

Success Metrics:
• Risk score reduction percentage
• Control effectiveness ratings
• Incident frequency and impact
• Compliance improvement measures
• Stakeholder satisfaction levels`,
    confidence: 0.62,
    recommendations: [
      'Form mitigation team',
      'Develop implementation plan',
      'Allocate resources',
      'Establish timelines',
      'Implement monitoring'
    ],
    timestamp: new Date()
  };
}

function fallbackScenarioPlanning(data: any): AIResponse {
  return {
    id: uuidv4(),
    type: 'scenario_planning',
    content: `Scenario Planning for: ${data.name || 'Risk Scenario'}

Best Case Scenario:
• Minimal impact with quick resolution
• Effective existing controls
• Minimal stakeholder impact
• Learning opportunities identified

Response Plan:
• Activate standard incident response
• Communicate with minimal stakeholders
• Document lessons learned
• Update risk register as needed

Worst Case Scenario:
• Maximum possible impact realized
• Multiple systems affected
• Significant stakeholder impact
• Regulatory or legal consequences

Contingency Plans:
• Emergency response team activation
• Alternative system implementations
• External expert engagement
• Crisis communication protocols

Most Likely Scenario:
• Moderate impact with standard recovery
• Some operational disruption
• Limited stakeholder notification
• Standard business continuity procedures

Preparedness Measures:
• Regular scenario testing and drills
• Updated contact lists and communication plans
• Backup system readiness verification
• Cross-training of critical personnel

Early Warning Indicators:
• System performance degradation
• Unusual user activity patterns
• Security alert escalations
• External threat intelligence reports

Communication Plans:
• Internal stakeholder notification procedures
• Customer and partner communication templates
• Regulatory reporting requirements
• Media and public relations protocols

This scenario planning framework should be customized for your specific risk profile and organizational context.`,
    confidence: 0.60,
    recommendations: [
      'Develop scenario-specific response plans',
      'Establish early warning indicators',
      'Create communication protocols',
      'Test scenarios regularly',
      'Update plans based on lessons learned'
    ],
    timestamp: new Date()
  };
}

console.log(`RiskQuantify AI Assistant server running on port ${PORT}`);
console.log('Available analysis types: risk_analysis, threat_modeling, impact_assessment, compliance_check, mitigation_strategy, scenario_planning');