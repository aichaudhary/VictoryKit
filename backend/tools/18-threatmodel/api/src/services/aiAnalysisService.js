/**
 * AI Analysis Service - Tool 18 ThreatModel
 * AI-powered threat detection, analysis, and recommendations
 */

const axios = require('axios');

class AIAnalysisService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    this.azureOpenaiKey = process.env.AZURE_OPENAI_API_KEY;
    this.azureOpenaiEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    this.preferredProvider = this.detectProvider();
  }

  // Detect available AI provider
  detectProvider() {
    if (this.azureOpenaiKey && this.azureOpenaiEndpoint) return 'azure';
    if (this.openaiApiKey) return 'openai';
    if (this.anthropicApiKey) return 'anthropic';
    return 'local';
  }

  // ============ Main Analysis Methods ============

  // Analyze threat model with AI
  async analyzeThreatModel(threatModel) {
    const systemPrompt = this.getThreatModelAnalysisPrompt();
    const userPrompt = this.formatThreatModelForAnalysis(threatModel);

    try {
      const response = await this.callAI(systemPrompt, userPrompt);
      return this.parseAnalysisResponse(response);
    } catch (error) {
      console.error('AI analysis error:', error.message);
      return this.fallbackAnalysis(threatModel);
    }
  }

  // Generate STRIDE analysis with AI
  async generateSTRIDEAnalysis(components, dataFlows) {
    const systemPrompt = `You are a cybersecurity expert specializing in threat modeling.
    Perform a comprehensive STRIDE analysis on the provided system components and data flows.
    For each STRIDE category, identify specific threats with:
    - Threat name
    - Description
    - Affected components
    - Risk level (critical/high/medium/low)
    - Recommended mitigations
    
    Output JSON format:
    {
      "spoofing": [...],
      "tampering": [...],
      "repudiation": [...],
      "informationDisclosure": [...],
      "denialOfService": [...],
      "elevationOfPrivilege": [...]
    }`;

    const userPrompt = JSON.stringify({ components, dataFlows }, null, 2);

    try {
      const response = await this.callAI(systemPrompt, userPrompt);
      return JSON.parse(response);
    } catch (error) {
      return this.fallbackSTRIDEAnalysis(components, dataFlows);
    }
  }

  // Generate PASTA analysis with AI
  async generatePASTAAnalysis(threatModel) {
    const systemPrompt = `You are a cybersecurity expert performing PASTA (Process for Attack Simulation and Threat Analysis).
    Complete all 7 stages of PASTA methodology for the provided system.
    
    Output JSON with these stages:
    {
      "stage1_businessObjectives": { objectives: [], securityRequirements: [] },
      "stage2_technicalScope": { assets: [], dependencies: [] },
      "stage3_decomposition": { components: [], dataFlows: [], trustBoundaries: [] },
      "stage4_threatAnalysis": { threats: [], attackVectors: [] },
      "stage5_vulnerabilityAnalysis": { vulnerabilities: [], weaknesses: [] },
      "stage6_attackModeling": { attackTrees: [], scenarios: [] },
      "stage7_riskAnalysis": { risks: [], mitigations: [], residualRisks: [] }
    }`;

    const userPrompt = JSON.stringify(threatModel, null, 2);

    try {
      const response = await this.callAI(systemPrompt, userPrompt);
      return JSON.parse(response);
    } catch (error) {
      return this.fallbackPASTAAnalysis(threatModel);
    }
  }

  // Auto-detect threats from architecture description
  async autoDetectThreats(architectureDescription) {
    const systemPrompt = `You are a threat modeling expert. Analyze the system architecture description and identify all potential security threats.
    For each threat provide:
    - name: Short threat name
    - category: STRIDE category (spoofing/tampering/repudiation/information_disclosure/denial_of_service/elevation_of_privilege)
    - description: Detailed description
    - likelihood: very_low/low/medium/high/very_high
    - impact: low/medium/high/critical
    - affectedComponents: Array of component names
    - attackVector: network/adjacent/local/physical
    - mitigations: Array of recommended mitigations
    
    Output as JSON array of threats.`;

    try {
      const response = await this.callAI(systemPrompt, architectureDescription);
      return JSON.parse(response);
    } catch (error) {
      return this.fallbackAutoDetect(architectureDescription);
    }
  }

  // Generate attack trees
  async generateAttackTrees(threat, targetAsset) {
    const systemPrompt = `You are a security researcher. Generate a detailed attack tree for the given threat against the target asset.
    Include:
    - Root goal (main objective of attacker)
    - Sub-goals (intermediate steps)
    - Leaf nodes (specific actions)
    - AND/OR relationships
    - Probability estimates
    - Cost estimates
    
    Output as JSON:
    {
      "root": { "name": "...", "type": "goal" },
      "nodes": [...],
      "edges": [...],
      "metadata": { "totalPaths": N, "easiestPath": "...", "costEstimate": "..." }
    }`;

    const userPrompt = `Threat: ${threat.name}\nDescription: ${threat.description}\nTarget Asset: ${targetAsset}`;

    try {
      const response = await this.callAI(systemPrompt, userPrompt);
      return JSON.parse(response);
    } catch (error) {
      return this.generateBasicAttackTree(threat, targetAsset);
    }
  }

  // Suggest mitigations for a threat
  async suggestMitigations(threat, context = {}) {
    const systemPrompt = `You are a cybersecurity expert. Suggest comprehensive mitigations for the given threat.
    For each mitigation provide:
    - name: Short name
    - description: Detailed implementation guidance
    - type: preventive/detective/corrective
    - effectiveness: high/medium/low
    - cost: high/medium/low
    - implementationComplexity: high/medium/low
    - controls: Array of related security controls (NIST, CIS, etc.)
    
    Output as JSON array of mitigations.`;

    const userPrompt = JSON.stringify({ threat, context }, null, 2);

    try {
      const response = await this.callAI(systemPrompt, userPrompt);
      return JSON.parse(response);
    } catch (error) {
      return this.fallbackMitigationSuggestions(threat);
    }
  }

  // Calculate DREAD score with AI insights
  async calculateDREADScore(threat) {
    const systemPrompt = `Calculate DREAD score for the threat with detailed reasoning.
    DREAD categories:
    - Damage (0-10): How bad would an attack be?
    - Reproducibility (0-10): How easy to reproduce?
    - Exploitability (0-10): How easy to launch attack?
    - Affected Users (0-10): How many users impacted?
    - Discoverability (0-10): How easy to discover the vulnerability?
    
    Output JSON:
    {
      "damage": { "score": N, "reasoning": "..." },
      "reproducibility": { "score": N, "reasoning": "..." },
      "exploitability": { "score": N, "reasoning": "..." },
      "affectedUsers": { "score": N, "reasoning": "..." },
      "discoverability": { "score": N, "reasoning": "..." },
      "totalScore": N,
      "riskLevel": "critical/high/medium/low",
      "summary": "..."
    }`;

    const userPrompt = JSON.stringify(threat, null, 2);

    try {
      const response = await this.callAI(systemPrompt, userPrompt);
      return JSON.parse(response);
    } catch (error) {
      return this.fallbackDREADScore(threat);
    }
  }

  // Map threats to compliance frameworks
  async mapToCompliance(threats, framework = 'all') {
    const systemPrompt = `Map the given threats to relevant security controls from compliance frameworks.
    Include mappings to:
    - NIST CSF 2.0
    - CIS Controls v8
    - ISO 27001:2022
    - OWASP Top 10
    - MITRE ATT&CK
    
    For each threat, provide:
    {
      "threatId": "...",
      "threatName": "...",
      "mappings": {
        "nist_csf": ["PR.AC-1", "DE.CM-1", ...],
        "cis_controls": ["CIS.4.1", "CIS.5.2", ...],
        "iso27001": ["A.5.1", "A.9.1", ...],
        "owasp": ["A01:2021", ...],
        "mitre_attack": ["T1190", "T1566", ...]
      },
      "recommendations": ["..."]
    }
    
    Output as JSON array.`;

    const userPrompt = JSON.stringify(threats, null, 2);

    try {
      const response = await this.callAI(systemPrompt, userPrompt);
      return JSON.parse(response);
    } catch (error) {
      return this.fallbackComplianceMapping(threats);
    }
  }

  // Generate executive summary
  async generateExecutiveSummary(threatModel, analysis) {
    const systemPrompt = `Generate an executive summary of the threat model analysis for non-technical stakeholders.
    Include:
    - Overview of the system and scope
    - Key findings (critical and high-risk threats)
    - Risk score and what it means
    - Top recommendations prioritized by impact
    - Resource requirements
    - Timeline recommendations
    
    Keep it concise (max 500 words) and business-focused.`;

    const userPrompt = JSON.stringify({ threatModel, analysis }, null, 2);

    try {
      return await this.callAI(systemPrompt, userPrompt);
    } catch (error) {
      return this.fallbackExecutiveSummary(threatModel, analysis);
    }
  }

  // ============ AI Provider Calls ============

  // Main AI call router
  async callAI(systemPrompt, userPrompt) {
    switch (this.preferredProvider) {
      case 'azure':
        return this.callAzureOpenAI(systemPrompt, userPrompt);
      case 'openai':
        return this.callOpenAI(systemPrompt, userPrompt);
      case 'anthropic':
        return this.callAnthropic(systemPrompt, userPrompt);
      default:
        throw new Error('No AI provider available');
    }
  }

  // Call OpenAI
  async callOpenAI(systemPrompt, userPrompt) {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000,
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  }

  // Call Azure OpenAI
  async callAzureOpenAI(systemPrompt, userPrompt) {
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4';
    const response = await axios.post(
      `${this.azureOpenaiEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`,
      {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000,
        temperature: 0.3
      },
      {
        headers: {
          'api-key': this.azureOpenaiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  }

  // Call Anthropic Claude
  async callAnthropic(systemPrompt, userPrompt) {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ]
      },
      {
        headers: {
          'x-api-key': this.anthropicApiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.content[0].text;
  }

  // ============ Fallback Methods ============

  // Fallback analysis when AI is unavailable
  fallbackAnalysis(threatModel) {
    const threats = threatModel.threats || [];
    const components = threatModel.components || [];

    const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
    threats.forEach(t => {
      const level = t.riskLevel || t.severity || 'medium';
      if (severityCounts[level] !== undefined) severityCounts[level]++;
    });

    return {
      summary: {
        totalThreats: threats.length,
        totalComponents: components.length,
        severityDistribution: severityCounts,
        mitigatedCount: threats.filter(t => t.status === 'mitigated').length
      },
      riskScore: this.calculateRiskScore(threats),
      recommendations: this.generateBasicRecommendations(threats),
      gaps: this.identifyGaps(threatModel)
    };
  }

  // Fallback STRIDE analysis
  fallbackSTRIDEAnalysis(components, dataFlows) {
    const strideCategories = {
      spoofing: [],
      tampering: [],
      repudiation: [],
      informationDisclosure: [],
      denialOfService: [],
      elevationOfPrivilege: []
    };

    // Generate basic STRIDE threats for each component
    (components || []).forEach(comp => {
      const name = comp.name || 'Unknown Component';
      const type = comp.type || 'other';

      strideCategories.spoofing.push({
        threat: `Identity spoofing for ${name}`,
        description: 'Attacker could impersonate legitimate entity',
        affectedComponents: [name],
        riskLevel: 'medium',
        mitigations: ['Implement strong authentication', 'Use MFA']
      });

      if (['database', 'api', 'data_store'].includes(type)) {
        strideCategories.tampering.push({
          threat: `Data tampering in ${name}`,
          description: 'Unauthorized modification of data',
          affectedComponents: [name],
          riskLevel: 'high',
          mitigations: ['Input validation', 'Data integrity checks', 'Audit logging']
        });
      }

      strideCategories.repudiation.push({
        threat: `Non-repudiation for ${name}`,
        description: 'Actions may not be properly logged',
        affectedComponents: [name],
        riskLevel: 'medium',
        mitigations: ['Comprehensive audit logging', 'Secure log storage']
      });
    });

    return strideCategories;
  }

  // Fallback PASTA analysis
  fallbackPASTAAnalysis(threatModel) {
    return {
      stage1_businessObjectives: {
        objectives: ['Ensure system security', 'Protect user data'],
        securityRequirements: ['Confidentiality', 'Integrity', 'Availability']
      },
      stage2_technicalScope: {
        assets: (threatModel.components || []).map(c => c.name),
        dependencies: []
      },
      stage3_decomposition: {
        components: (threatModel.components || []).map(c => c.name),
        dataFlows: (threatModel.system?.dataFlows || []),
        trustBoundaries: (threatModel.system?.trustBoundaries || [])
      },
      stage4_threatAnalysis: {
        threats: (threatModel.threats || []).map(t => t.name),
        attackVectors: ['network', 'application', 'social_engineering']
      },
      stage5_vulnerabilityAnalysis: {
        vulnerabilities: [],
        weaknesses: []
      },
      stage6_attackModeling: {
        attackTrees: [],
        scenarios: []
      },
      stage7_riskAnalysis: {
        risks: [],
        mitigations: (threatModel.mitigations || []).map(m => m.name),
        residualRisks: []
      }
    };
  }

  // Fallback auto-detect
  fallbackAutoDetect(description) {
    // Extract keywords and generate basic threats
    const keywords = description.toLowerCase();
    const threats = [];

    if (keywords.includes('web') || keywords.includes('api')) {
      threats.push({
        name: 'SQL Injection',
        category: 'tampering',
        description: 'Web applications may be vulnerable to SQL injection attacks',
        likelihood: 'high',
        impact: 'critical',
        mitigations: ['Use parameterized queries', 'Input validation']
      });

      threats.push({
        name: 'Cross-Site Scripting (XSS)',
        category: 'information_disclosure',
        description: 'User input not properly sanitized could lead to XSS',
        likelihood: 'high',
        impact: 'high',
        mitigations: ['Output encoding', 'Content Security Policy']
      });
    }

    if (keywords.includes('database') || keywords.includes('data')) {
      threats.push({
        name: 'Data Breach',
        category: 'information_disclosure',
        description: 'Sensitive data may be exposed through various attack vectors',
        likelihood: 'medium',
        impact: 'critical',
        mitigations: ['Encryption at rest', 'Access controls', 'DLP']
      });
    }

    if (keywords.includes('auth') || keywords.includes('login')) {
      threats.push({
        name: 'Credential Stuffing',
        category: 'spoofing',
        description: 'Attackers may use stolen credentials to gain access',
        likelihood: 'high',
        impact: 'high',
        mitigations: ['MFA', 'Rate limiting', 'Account lockout']
      });
    }

    return threats;
  }

  // Fallback mitigation suggestions
  fallbackMitigationSuggestions(threat) {
    const category = threat.category || 'other';
    const mitigations = {
      spoofing: [
        { name: 'Multi-Factor Authentication', type: 'preventive', effectiveness: 'high' },
        { name: 'Strong Password Policy', type: 'preventive', effectiveness: 'medium' },
        { name: 'Session Management', type: 'preventive', effectiveness: 'medium' }
      ],
      tampering: [
        { name: 'Input Validation', type: 'preventive', effectiveness: 'high' },
        { name: 'Integrity Monitoring', type: 'detective', effectiveness: 'high' },
        { name: 'Digital Signatures', type: 'preventive', effectiveness: 'high' }
      ],
      repudiation: [
        { name: 'Audit Logging', type: 'detective', effectiveness: 'high' },
        { name: 'Secure Timestamp', type: 'preventive', effectiveness: 'medium' },
        { name: 'Digital Signatures', type: 'preventive', effectiveness: 'high' }
      ],
      information_disclosure: [
        { name: 'Encryption', type: 'preventive', effectiveness: 'high' },
        { name: 'Access Controls', type: 'preventive', effectiveness: 'high' },
        { name: 'Data Masking', type: 'preventive', effectiveness: 'medium' }
      ],
      denial_of_service: [
        { name: 'Rate Limiting', type: 'preventive', effectiveness: 'high' },
        { name: 'CDN/WAF', type: 'preventive', effectiveness: 'high' },
        { name: 'Auto-scaling', type: 'corrective', effectiveness: 'medium' }
      ],
      elevation_of_privilege: [
        { name: 'Least Privilege', type: 'preventive', effectiveness: 'high' },
        { name: 'RBAC', type: 'preventive', effectiveness: 'high' },
        { name: 'Privilege Monitoring', type: 'detective', effectiveness: 'medium' }
      ]
    };

    return mitigations[category] || mitigations.tampering;
  }

  // Fallback DREAD score
  fallbackDREADScore(threat) {
    const scores = {
      damage: 5,
      reproducibility: 5,
      exploitability: 5,
      affectedUsers: 5,
      discoverability: 5
    };

    // Adjust based on threat properties
    if (threat.riskLevel === 'critical') {
      scores.damage = 9;
      scores.affectedUsers = 8;
    } else if (threat.riskLevel === 'high') {
      scores.damage = 7;
      scores.affectedUsers = 6;
    }

    const total = Object.values(scores).reduce((a, b) => a + b, 0) / 5;

    return {
      ...Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, { score: v, reasoning: 'Default assessment' }])),
      totalScore: Math.round(total * 10) / 10,
      riskLevel: total >= 8 ? 'critical' : total >= 6 ? 'high' : total >= 4 ? 'medium' : 'low',
      summary: `Calculated DREAD score: ${total.toFixed(1)}/10`
    };
  }

  // Fallback compliance mapping
  fallbackComplianceMapping(threats) {
    return threats.map(threat => ({
      threatId: threat._id || threat.id,
      threatName: threat.name,
      mappings: {
        nist_csf: ['ID.RA-1', 'PR.IP-1'],
        cis_controls: ['CIS.4.1'],
        iso27001: ['A.5.1.1'],
        owasp: ['A01:2021'],
        mitre_attack: ['T1190']
      },
      recommendations: ['Implement recommended controls']
    }));
  }

  // Fallback executive summary
  fallbackExecutiveSummary(threatModel, analysis) {
    const threats = threatModel.threats || [];
    const critical = threats.filter(t => t.riskLevel === 'critical').length;
    const high = threats.filter(t => t.riskLevel === 'high').length;

    return `
## Executive Summary - ${threatModel.name || 'Threat Model'}

### Overview
This threat model analysis covers ${threatModel.components?.length || 0} system components and has identified ${threats.length} potential threats.

### Key Findings
- **Critical Threats:** ${critical}
- **High-Risk Threats:** ${high}
- **Overall Risk Score:** ${analysis?.riskScore || 'N/A'}

### Top Recommendations
1. Address all critical threats immediately
2. Implement recommended mitigations for high-risk threats
3. Conduct regular threat model reviews
4. Ensure compliance with security frameworks

### Next Steps
- Prioritize mitigation of critical and high-risk threats
- Allocate resources for security improvements
- Schedule follow-up assessment in 30 days
    `.trim();
  }

  // ============ Helper Methods ============

  getThreatModelAnalysisPrompt() {
    return `You are a senior cybersecurity analyst performing threat model analysis.
    Analyze the threat model and provide:
    1. Summary of findings
    2. Risk assessment
    3. Gap analysis
    4. Prioritized recommendations
    5. Compliance considerations
    
    Be thorough but concise. Output in JSON format.`;
  }

  formatThreatModelForAnalysis(threatModel) {
    return JSON.stringify({
      name: threatModel.name,
      description: threatModel.description,
      methodology: threatModel.methodology,
      system: threatModel.system,
      components: threatModel.components?.map(c => ({
        name: c.name,
        type: c.type,
        trustLevel: c.trustLevel
      })),
      threats: threatModel.threats?.map(t => ({
        name: t.name,
        category: t.category,
        riskLevel: t.riskLevel,
        status: t.status
      })),
      mitigations: threatModel.mitigations?.map(m => ({
        name: m.name,
        status: m.status
      }))
    }, null, 2);
  }

  parseAnalysisResponse(response) {
    try {
      return JSON.parse(response);
    } catch {
      return { rawAnalysis: response };
    }
  }

  calculateRiskScore(threats) {
    if (!threats.length) return 0;
    
    const weights = { critical: 10, high: 7, medium: 4, low: 1 };
    const total = threats.reduce((sum, t) => {
      const level = t.riskLevel || 'medium';
      return sum + (weights[level] || 4);
    }, 0);
    
    return Math.round((total / (threats.length * 10)) * 100);
  }

  generateBasicRecommendations(threats) {
    const recommendations = new Set();
    
    threats.forEach(t => {
      if (t.riskLevel === 'critical') {
        recommendations.add('Address critical threats within 24 hours');
      }
      if (t.category === 'information_disclosure') {
        recommendations.add('Review data encryption and access controls');
      }
      if (t.category === 'denial_of_service') {
        recommendations.add('Implement rate limiting and DDoS protection');
      }
    });

    return Array.from(recommendations);
  }

  identifyGaps(threatModel) {
    const gaps = [];
    
    if (!threatModel.mitigations?.length) {
      gaps.push('No mitigations defined');
    }
    if (!threatModel.system?.trustBoundaries?.length) {
      gaps.push('Trust boundaries not defined');
    }
    if (!threatModel.system?.dataFlows?.length) {
      gaps.push('Data flows not documented');
    }

    return gaps;
  }

  generateBasicAttackTree(threat, targetAsset) {
    return {
      root: { name: `Compromise ${targetAsset}`, type: 'goal' },
      nodes: [
        { id: '1', name: threat.name, type: 'attack' },
        { id: '2', name: 'Exploit vulnerability', type: 'step' },
        { id: '3', name: 'Gain access', type: 'step' }
      ],
      edges: [
        { from: 'root', to: '1' },
        { from: '1', to: '2' },
        { from: '2', to: '3' }
      ],
      metadata: { totalPaths: 1, easiestPath: 'Direct exploit', costEstimate: 'Low-Medium' }
    };
  }
}

module.exports = new AIAnalysisService();
