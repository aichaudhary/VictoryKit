/**
 * AI Analysis Service
 * Real-world integrations for intelligent incident analysis
 *
 * Integrates with: OpenAI GPT-4, Google Gemini, Anthropic Claude
 */

const axios = require('axios');

class AIAnalysisService {
  constructor() {
    // OpenAI
    this.openaiApiKey = process.env.incidentcommand_OPENAI_API_KEY;
    this.openaiBaseUrl = process.env.incidentcommand_OPENAI_BASE_URL || 'https://api.openai.com/v1';
    this.openaiModel = process.env.incidentcommand_OPENAI_MODEL || 'gpt-4-turbo-preview';

    // Google Gemini
    this.geminiApiKey = process.env.incidentcommand_GEMINI_API_KEY;
    this.geminiBaseUrl =
      process.env.incidentcommand_GEMINI_BASE_URL ||
      'https://generativelanguage.googleapis.com/v1beta';

    // Anthropic Claude
    this.anthropicApiKey = process.env.incidentcommand_ANTHROPIC_API_KEY;
    this.anthropicBaseUrl =
      process.env.incidentcommand_ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1';
  }

  /**
   * Analyze incident with AI - tries multiple providers
   */
  async analyzeIncident(incident, analysisType = 'comprehensive') {
    const prompt = this.buildAnalysisPrompt(incident, analysisType);

    // Try providers in order of preference
    const providers = [
      { name: 'OpenAI', fn: () => this.analyzeWithOpenAI(prompt) },
      { name: 'Gemini', fn: () => this.analyzeWithGemini(prompt) },
      { name: 'Claude', fn: () => this.analyzeWithClaude(prompt) },
    ];

    for (const provider of providers) {
      const result = await provider.fn();
      if (result && !result.simulated) {
        return { ...result, provider: provider.name };
      }
    }

    // Fallback to simulated analysis
    return this.simulatedAnalysis(incident, analysisType);
  }

  /**
   * OpenAI GPT-4 Analysis
   */
  async analyzeWithOpenAI(prompt) {
    if (!this.openaiApiKey) return null;

    try {
      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: this.openaiModel,
          messages: [
            {
              role: 'system',
              content: `You are an expert cybersecurity incident response analyst. Analyze security incidents and provide detailed, actionable insights. Always respond with structured JSON containing: summary, severity_assessment, attack_vector, mitre_techniques, immediate_actions, containment_steps, investigation_steps, recovery_steps, iocs_to_investigate, similar_incidents, risk_score (1-100), confidence (1-100).`,
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 2000,
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            Authorization: `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const content = response.data.choices[0].message.content;
      return {
        analysis: JSON.parse(content),
        tokens: response.data.usage,
        model: this.openaiModel,
      };
    } catch (error) {
      console.error('OpenAI analysis error:', error.message);
      return null;
    }
  }

  /**
   * Google Gemini Analysis
   */
  async analyzeWithGemini(prompt) {
    if (!this.geminiApiKey) return null;

    try {
      const response = await axios.post(
        `${this.geminiBaseUrl}/models/gemini-pro:generateContent?key=${this.geminiApiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `You are an expert cybersecurity incident response analyst. Analyze the following security incident and provide detailed, actionable insights. Respond with structured JSON only.\n\n${prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2000,
          },
        }
      );

      const content = response.data.candidates[0].content.parts[0].text;
      // Extract JSON from response (Gemini may include markdown)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return {
          analysis: JSON.parse(jsonMatch[0]),
          model: 'gemini-pro',
        };
      }
      return null;
    } catch (error) {
      console.error('Gemini analysis error:', error.message);
      return null;
    }
  }

  /**
   * Anthropic Claude Analysis
   */
  async analyzeWithClaude(prompt) {
    if (!this.anthropicApiKey) return null;

    try {
      const response = await axios.post(
        `${this.anthropicBaseUrl}/messages`,
        {
          model: 'claude-3-opus-20240229',
          max_tokens: 2000,
          system: `You are an expert cybersecurity incident response analyst. Analyze security incidents and provide detailed, actionable insights. Always respond with structured JSON containing: summary, severity_assessment, attack_vector, mitre_techniques, immediate_actions, containment_steps, investigation_steps, recovery_steps, iocs_to_investigate, similar_incidents, risk_score (1-100), confidence (1-100).`,
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            'x-api-key': this.anthropicApiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
        }
      );

      const content = response.data.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return {
          analysis: JSON.parse(jsonMatch[0]),
          model: 'claude-3-opus',
        };
      }
      return null;
    } catch (error) {
      console.error('Claude analysis error:', error.message);
      return null;
    }
  }

  /**
   * Build analysis prompt from incident data
   */
  buildAnalysisPrompt(incident, analysisType) {
    const baseInfo = `
INCIDENT DETAILS:
- ID: ${incident.incidentId}
- Title: ${incident.title}
- Description: ${incident.description || 'Not provided'}
- Severity: ${incident.severity}
- Status: ${incident.status}
- Category: ${incident.classification?.type || 'Unknown'}

INDICATORS OF COMPROMISE:
${incident.indicators?.map((i) => `- ${i.type}: ${i.value}`).join('\n') || 'None recorded'}

AFFECTED ASSETS:
${incident.affectedAssets?.map((a) => `- ${a.hostname || a.assetId} (${a.type}) - Impact: ${a.impact}`).join('\n') || 'None recorded'}

TIMELINE:
${
  incident.timeline
    ?.slice(-10)
    .map((t) => `- [${t.timestamp}] ${t.event} by ${t.actor}`)
    .join('\n') || 'No timeline events'
}
`;

    const analysisPrompts = {
      comprehensive: `Provide a comprehensive analysis of this security incident including threat assessment, attack vectors, MITRE ATT&CK techniques, immediate containment actions, investigation steps, and recovery recommendations.`,
      threat: `Focus on threat actor analysis: motivation, sophistication level, likely origin, similar campaigns, and predicted next actions.`,
      impact: `Assess the business impact: affected systems, data exposure risk, regulatory implications, and estimated recovery time.`,
      rootcause: `Analyze the root cause: initial access vector, security control failures, and preventive recommendations.`,
      playbook: `Recommend a response playbook with step-by-step actions prioritized by urgency and impact.`,
    };

    return `${baseInfo}\n\nANALYSIS REQUEST:\n${analysisPrompts[analysisType] || analysisPrompts.comprehensive}`;
  }

  /**
   * Generate incident summary for reporting
   */
  async generateExecutiveSummary(incident) {
    const prompt = `Generate a concise executive summary (3-4 paragraphs) of this security incident suitable for senior leadership. Focus on: what happened, business impact, current status, and key actions taken/needed.

${this.buildAnalysisPrompt(incident, 'impact')}`;

    const result = await this.analyzeIncident({ ...incident }, 'comprehensive');

    if (result.analysis?.summary) {
      return result.analysis.summary;
    }

    return `Security incident ${incident.incidentId} (${incident.severity.toUpperCase()}) detected involving ${incident.classification?.type || 'unknown attack type'}. ${incident.affectedAssets?.length || 0} assets affected. Current status: ${incident.status}. Investigation ongoing.`;
  }

  /**
   * Recommend playbook based on incident characteristics
   */
  async recommendPlaybook(incident) {
    const prompt = `Based on this incident, recommend the most appropriate response playbook and customize the steps for this specific situation.

${this.buildAnalysisPrompt(incident, 'playbook')}

Return JSON with: playbook_name, customized_steps (array of {step_number, action, priority, estimated_time, automation_possible}), critical_first_actions.`;

    return this.analyzeIncident(incident, 'playbook');
  }

  /**
   * Identify related incidents and patterns
   */
  async identifyPatterns(incident, historicalIncidents) {
    const historicalSummary = historicalIncidents.slice(0, 10).map((h) => ({
      id: h.incidentId,
      title: h.title,
      type: h.classification?.type,
      severity: h.severity,
      indicators: h.indicators?.slice(0, 3),
    }));

    const prompt = `Analyze this incident for patterns and connections to historical incidents.

CURRENT INCIDENT:
${this.buildAnalysisPrompt(incident, 'threat')}

HISTORICAL INCIDENTS (last 10):
${JSON.stringify(historicalSummary, null, 2)}

Identify: pattern matches, campaign indicators, escalation risks, and recommended correlations.`;

    return this.analyzeIncident({ ...incident, historicalContext: historicalSummary }, 'threat');
  }

  // ============= Simulated Analysis =============

  simulatedAnalysis(incident, analysisType) {
    const mitreMapping = {
      malware: ['T1204', 'T1059', 'T1055'],
      ransomware: ['T1486', 'T1490', 'T1489'],
      phishing: ['T1566', 'T1598', 'T1534'],
      data_breach: ['T1041', 'T1567', 'T1048'],
      ddos: ['T1498', 'T1499'],
      insider_threat: ['T1078', 'T1136', 'T1087'],
      apt: ['T1027', 'T1070', 'T1574'],
    };

    const type = incident.classification?.type || 'other';

    return {
      analysis: {
        summary: `${incident.severity.toUpperCase()} severity ${type} incident affecting ${incident.affectedAssets?.length || 0} assets. Immediate investigation and containment recommended.`,
        severity_assessment: `Confirmed ${incident.severity} based on asset criticality and attack type.`,
        attack_vector: this.getAttackVector(type),
        mitre_techniques: mitreMapping[type] || ['T1190'],
        immediate_actions: [
          'Isolate affected systems from network',
          'Preserve forensic evidence',
          'Notify incident response team',
          'Document all actions taken',
        ],
        containment_steps: [
          'Block malicious IPs at firewall',
          'Disable compromised accounts',
          'Quarantine infected endpoints',
          'Enable enhanced logging',
        ],
        investigation_steps: [
          'Analyze endpoint telemetry',
          'Review authentication logs',
          'Correlate network traffic',
          'Check for lateral movement',
        ],
        recovery_steps: [
          'Verify threat eradication',
          'Restore from clean backups',
          'Patch vulnerable systems',
          'Conduct lessons learned',
        ],
        iocs_to_investigate: incident.indicators?.map((i) => i.value) || [],
        similar_incidents: [],
        risk_score: incident.severity === 'critical' ? 95 : incident.severity === 'high' ? 75 : 50,
        confidence: 70,
      },
      provider: 'Simulated',
      simulated: true,
    };
  }

  getAttackVector(type) {
    const vectors = {
      malware: 'Malicious file execution via email attachment or drive-by download',
      ransomware: 'Ransomware deployment through compromised RDP or phishing',
      phishing: 'Credential harvesting via spoofed login page',
      data_breach: 'Unauthorized data access through compromised credentials',
      ddos: 'Volumetric attack targeting network infrastructure',
      insider_threat: 'Malicious insider activity using legitimate access',
      apt: 'Sophisticated multi-stage attack with persistence mechanisms',
    };
    return vectors[type] || 'Unknown attack vector requiring investigation';
  }
}

module.exports = new AIAnalysisService();
