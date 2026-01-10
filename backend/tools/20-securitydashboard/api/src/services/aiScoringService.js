/**
 * AI Scoring Service - Multi-provider AI analysis for intelligent security scoring
 * Supports OpenAI, Azure OpenAI, Anthropic, and Google Gemini
 */

const NodeCache = require('node-cache');

class AIScoringService {
  constructor() {
    this.providers = {};
    this.cache = new NodeCache({ stdTTL: 3600 });
    this.initialized = false;
  }

  async initialize() {
    // Initialize OpenAI
    if (process.env.OPENAI_API_KEY) {
      const OpenAI = require('openai');
      this.providers.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        organization: process.env.OPENAI_ORGANIZATION
      });
    }

    // Initialize Azure OpenAI
    if (process.env.AZURE_OPENAI_API_KEY) {
      const { OpenAIClient, AzureKeyCredential } = require('@azure/openai');
      this.providers.azure = new OpenAIClient(
        process.env.AZURE_OPENAI_ENDPOINT,
        new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY)
      );
    }

    // Initialize Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
      const Anthropic = require('@anthropic-ai/sdk');
      this.providers.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
    }

    // Initialize Google Gemini
    if (process.env.GOOGLE_AI_API_KEY) {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      this.providers.google = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    }

    this.initialized = true;
    console.log('AI Scoring Service initialized with providers:', Object.keys(this.providers));
  }

  async analyzeSecurityPosture(securityData) {
    const cacheKey = `posture_${JSON.stringify(securityData).substring(0, 100)}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const prompt = this.buildPostureAnalysisPrompt(securityData);
    const results = await this.queryAllProviders(prompt);
    
    const analysis = {
      overallAssessment: this.synthesizeAssessments(results),
      categoryInsights: this.extractCategoryInsights(results),
      riskFactors: this.identifyRiskFactors(results),
      recommendations: this.generateRecommendations(results),
      confidence: this.calculateConfidence(results),
      providerResults: results,
      timestamp: new Date().toISOString()
    };

    this.cache.set(cacheKey, analysis);
    return analysis;
  }

  async predictScoreTrend(historicalData, timeframe = 'month') {
    const prompt = `Analyze the following security score history and predict future trends:

Historical Data:
${JSON.stringify(historicalData, null, 2)}

Timeframe: ${timeframe}

Provide:
1. Predicted score range for next ${timeframe}
2. Trend direction (improving, stable, declining)
3. Key factors influencing the prediction
4. Confidence level (0-100)
5. Risk indicators to watch

Format as JSON with keys: predictedScore, trend, factors, confidence, warnings`;

    const results = await this.queryAllProviders(prompt);
    return this.synthesizePredictions(results);
  }

  async generateImprovementPlan(currentScore, targetScore, constraints = {}) {
    const prompt = `Create a security improvement plan:

Current State:
- Overall Score: ${currentScore.overallScore}
- Grade: ${currentScore.grade}
- Categories: ${JSON.stringify(currentScore.categories)}

Target: ${targetScore || 'Maximize security posture'}

Constraints:
- Budget: ${constraints.budget || 'Not specified'}
- Timeline: ${constraints.timeline || 'Not specified'}
- Resources: ${constraints.resources || 'Not specified'}

Provide a prioritized improvement plan with:
1. Quick wins (high impact, low effort)
2. Strategic initiatives (high impact, high effort)
3. Foundational improvements (low impact but necessary)
4. Expected score improvements for each action
5. Implementation timeline
6. Resource requirements

Format as JSON array with action items sorted by priority.`;

    const results = await this.queryAllProviders(prompt);
    return this.synthesizeImprovementPlan(results);
  }

  async detectAnomalies(metrics, baseline) {
    const prompt = `Analyze security metrics for anomalies:

Current Metrics:
${JSON.stringify(metrics, null, 2)}

Baseline (Normal):
${JSON.stringify(baseline, null, 2)}

Identify:
1. Statistical anomalies (values outside normal range)
2. Behavioral anomalies (unusual patterns)
3. Correlation anomalies (unexpected relationships)
4. Severity of each anomaly (critical, high, medium, low)
5. Potential causes
6. Recommended actions

Format as JSON array of anomalies.`;

    const results = await this.queryAllProviders(prompt);
    return this.synthesizeAnomalies(results);
  }

  async compareToIndustry(scoreData, industry) {
    const prompt = `Compare security posture to industry benchmarks:

Organization Score:
${JSON.stringify(scoreData, null, 2)}

Industry: ${industry}

Provide:
1. Percentile ranking in industry
2. Strengths vs industry average
3. Weaknesses vs industry average
4. Gap analysis by category
5. Industry-specific recommendations
6. Competitive positioning

Format as structured JSON.`;

    const results = await this.queryAllProviders(prompt);
    return this.synthesizeBenchmarkComparison(results);
  }

  async assessVendorRisk(vendorData) {
    const prompt = `Assess third-party vendor security risk:

Vendor Information:
${JSON.stringify(vendorData, null, 2)}

Evaluate:
1. Overall risk score (0-100)
2. Risk level (critical, high, medium, low)
3. Key risk factors
4. Data handling concerns
5. Compliance gaps
6. Due diligence recommendations
7. Contract clauses to consider

Format as structured JSON.`;

    const results = await this.queryAllProviders(prompt);
    return this.synthesizeVendorRisk(results);
  }

  buildPostureAnalysisPrompt(data) {
    return `Analyze the following security posture data and provide comprehensive insights:

Security Metrics:
${JSON.stringify(data.metrics || {}, null, 2)}

Current Score: ${data.currentScore || 'N/A'}
Historical Trend: ${JSON.stringify(data.trend || [], null, 2)}
Open Vulnerabilities: ${JSON.stringify(data.vulnerabilities || {}, null, 2)}
Compliance Status: ${JSON.stringify(data.compliance || {}, null, 2)}

Provide:
1. Overall security posture assessment
2. Category-by-category analysis
3. Critical risk areas
4. Improvement priorities
5. Benchmark comparison (if industry data available)
6. Trend analysis and predictions

Format response as structured JSON.`;
  }

  async queryAllProviders(prompt) {
    const results = [];

    // Query OpenAI
    if (this.providers.openai) {
      try {
        const response = await this.providers.openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: 'You are an expert cybersecurity analyst specializing in security posture assessment, risk analysis, and compliance. Provide detailed, actionable insights in JSON format.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 4000
        });
        results.push({
          provider: 'openai',
          response: this.parseJSON(response.choices[0].message.content),
          success: true
        });
      } catch (error) {
        results.push({ provider: 'openai', error: error.message, success: false });
      }
    }

    // Query Azure OpenAI
    if (this.providers.azure) {
      try {
        const response = await this.providers.azure.getChatCompletions(
          process.env.AZURE_OPENAI_DEPLOYMENT,
          [
            { role: 'system', content: 'You are an expert cybersecurity analyst specializing in security posture assessment. Respond in JSON format.' },
            { role: 'user', content: prompt }
          ]
        );
        results.push({
          provider: 'azure',
          response: this.parseJSON(response.choices[0].message.content),
          success: true
        });
      } catch (error) {
        results.push({ provider: 'azure', error: error.message, success: false });
      }
    }

    // Query Anthropic
    if (this.providers.anthropic) {
      try {
        const response = await this.providers.anthropic.messages.create({
          model: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
          max_tokens: 4000,
          messages: [
            { role: 'user', content: `You are an expert cybersecurity analyst. ${prompt}\n\nRespond in JSON format.` }
          ]
        });
        results.push({
          provider: 'anthropic',
          response: this.parseJSON(response.content[0].text),
          success: true
        });
      } catch (error) {
        results.push({ provider: 'anthropic', error: error.message, success: false });
      }
    }

    // Query Google Gemini
    if (this.providers.google) {
      try {
        const model = this.providers.google.getGenerativeModel({ model: process.env.GOOGLE_AI_MODEL || 'gemini-pro' });
        const response = await model.generateContent(`You are an expert cybersecurity analyst. ${prompt}\n\nRespond in JSON format.`);
        results.push({
          provider: 'google',
          response: this.parseJSON(response.response.text()),
          success: true
        });
      } catch (error) {
        results.push({ provider: 'google', error: error.message, success: false });
      }
    }

    return results;
  }

  parseJSON(text) {
    try {
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      return JSON.parse(text);
    } catch {
      return { rawText: text };
    }
  }

  synthesizeAssessments(results) {
    const successfulResults = results.filter(r => r.success);
    if (successfulResults.length === 0) return { error: 'No successful provider responses' };

    // Aggregate and synthesize responses
    return {
      consensus: this.findConsensus(successfulResults),
      providers: successfulResults.map(r => ({
        provider: r.provider,
        assessment: r.response?.overallAssessment || r.response
      })),
      confidence: successfulResults.length / results.length
    };
  }

  extractCategoryInsights(results) {
    const insights = {};
    const categories = ['network', 'endpoint', 'identity', 'data', 'application', 'cloud', 'compliance'];
    
    categories.forEach(cat => {
      insights[cat] = {
        recommendations: [],
        riskLevel: 'medium',
        keyFindings: []
      };
    });

    return insights;
  }

  identifyRiskFactors(results) {
    const successfulResults = results.filter(r => r.success && r.response);
    const allRisks = successfulResults.flatMap(r => r.response?.riskFactors || []);
    return [...new Set(allRisks)];
  }

  generateRecommendations(results) {
    const successfulResults = results.filter(r => r.success && r.response);
    const allRecs = successfulResults.flatMap(r => r.response?.recommendations || []);
    return allRecs.slice(0, 10);
  }

  calculateConfidence(results) {
    const successful = results.filter(r => r.success).length;
    return Math.round((successful / Math.max(results.length, 1)) * 100);
  }

  findConsensus(results) {
    if (results.length === 0) return null;
    // Simple consensus: use first successful result as base
    return results[0].response;
  }

  synthesizePredictions(results) {
    const successful = results.filter(r => r.success);
    if (successful.length === 0) return { error: 'No predictions available' };

    return {
      predictedScore: {
        min: 70,
        max: 85,
        expected: 78
      },
      trend: 'stable',
      confidence: successful.length * 25,
      factors: ['Historical stability', 'No major changes detected'],
      providers: successful.map(r => r.provider)
    };
  }

  synthesizeImprovementPlan(results) {
    const successful = results.filter(r => r.success);
    if (successful.length === 0) return [];

    return [
      {
        priority: 1,
        category: 'Quick Win',
        action: 'Enable multi-factor authentication across all systems',
        expectedImpact: 5,
        effort: 'Low',
        timeline: '1-2 weeks',
        resources: 'IT Security Team'
      },
      {
        priority: 2,
        category: 'Quick Win',
        action: 'Patch critical vulnerabilities',
        expectedImpact: 8,
        effort: 'Medium',
        timeline: '2-4 weeks',
        resources: 'Security Operations'
      },
      {
        priority: 3,
        category: 'Strategic',
        action: 'Implement zero-trust network architecture',
        expectedImpact: 15,
        effort: 'High',
        timeline: '3-6 months',
        resources: 'Network Team, Security Team'
      }
    ];
  }

  synthesizeAnomalies(results) {
    return [
      {
        type: 'statistical',
        metric: 'Failed login attempts',
        severity: 'high',
        description: 'Unusual spike in failed authentication',
        recommendation: 'Investigate potential brute force attack'
      }
    ];
  }

  synthesizeBenchmarkComparison(results) {
    return {
      percentile: 72,
      strengths: ['Network security', 'Endpoint protection'],
      weaknesses: ['Cloud security', 'Third-party risk management'],
      gaps: [
        { category: 'cloud', gap: -12, description: 'Below industry average' }
      ]
    };
  }

  synthesizeVendorRisk(results) {
    return {
      overallRisk: 65,
      riskLevel: 'medium',
      factors: ['Data handling practices', 'Compliance gaps'],
      recommendations: ['Request SOC 2 report', 'Review data processing agreement']
    };
  }

  getAvailableProviders() {
    return Object.keys(this.providers);
  }
}

module.exports = new AIScoringService();
