/**
 * AI Risk Analysis Service
 * Provides AI-powered risk assessment, scoring, and recommendations
 */

const OpenAI = require("openai");
// const { AzureOpenAI } = require("@azure/openai");
const Anthropic = require("@anthropic-ai/sdk");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
const math = require("mathjs");
const _ = require("lodash");

class AIRiskAnalysisService {
  constructor() {
    this.providers = {};
    this.initialized = false;
    this.cache = new Map();
    this.cacheTimeout = 3600000; // 1 hour
  }

  async initialize() {
    try {
      // Initialize OpenAI
      if (process.env.OPENAI_API_KEY) {
        this.providers.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
          organization: process.env.OPENAI_ORGANIZATION,
        });
      }

      // Initialize Azure OpenAI (using standard OpenAI SDK)
      if (process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT) {
        this.providers.azure = new OpenAI({
          apiKey: process.env.AZURE_OPENAI_API_KEY,
          baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
          defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2023-12-01-preview' },
          defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY },
        });
      }

      // Initialize Anthropic Claude
      if (process.env.ANTHROPIC_API_KEY) {
        this.providers.anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });
      }

      // Initialize Google Gemini
      if (process.env.GOOGLE_AI_API_KEY) {
        this.providers.google = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
      }

      this.initialized = true;
      console.log("AI Risk Analysis Service initialized with providers:", Object.keys(this.providers));
    } catch (error) {
      console.error("Failed to initialize AI Risk Analysis Service:", error);
      throw error;
    }
  }

  /**
   * Analyze risk using AI models
   */
  async analyzeRisk(riskData) {
    const cacheKey = `risk_analysis_${JSON.stringify(riskData)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const analysis = await this.performMultiProviderAnalysis(riskData);
      this.setCached(cacheKey, analysis);
      return analysis;
    } catch (error) {
      console.error("AI Risk Analysis failed:", error);
      return this.fallbackAnalysis(riskData);
    }
  }

  /**
   * Perform analysis using multiple AI providers for consensus
   */
  async performMultiProviderAnalysis(riskData) {
    const providers = Object.keys(this.providers);
    const analyses = [];

    for (const provider of providers) {
      try {
        const analysis = await this.analyzeWithProvider(provider, riskData);
        analyses.push({ provider, analysis, success: true });
      } catch (error) {
        console.warn(`Provider ${provider} failed:`, error.message);
        analyses.push({ provider, error: error.message, success: false });
      }
    }

    return this.consolidateAnalyses(analyses, riskData);
  }

  /**
   * Analyze risk with specific AI provider
   */
  async analyzeWithProvider(provider, riskData) {
    const prompt = this.buildAnalysisPrompt(riskData);

    switch (provider) {
      case "openai":
        return await this.analyzeWithOpenAI(prompt);

      case "azure":
        return await this.analyzeWithAzure(prompt);

      case "anthropic":
        return await this.analyzeWithAnthropic(prompt);

      case "google":
        return await this.analyzeWithGoogle(prompt);

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Build comprehensive analysis prompt
   */
  buildAnalysisPrompt(riskData) {
    return `
Analyze the following risk scenario and provide a comprehensive assessment:

Risk Details:
- Title: ${riskData.title || "N/A"}
- Description: ${riskData.description || "N/A"}
- Category: ${riskData.category || "N/A"}
- Likelihood: ${riskData.likelihood || "N/A"} (${this.getLikelihoodDescription(riskData.likelihood)})
- Impact: ${riskData.impact || "N/A"} (${this.getImpactDescription(riskData.impact)})
- Current Controls: ${riskData.controls || "None specified"}
- Affected Assets: ${riskData.assets || "N/A"}
- Business Context: ${riskData.businessContext || "N/A"}

Please provide:
1. Risk Score (1-25 scale)
2. Risk Level (Very Low, Low, Medium, High, Very High)
3. Key Risk Factors
4. Potential Consequences
5. Recommended Mitigation Strategies
6. Compliance Considerations
7. Monitoring Recommendations
8. Confidence Level in Assessment

Format your response as JSON with the following structure:
{
  "riskScore": number,
  "riskLevel": string,
  "keyFactors": [string],
  "consequences": [string],
  "mitigationStrategies": [string],
  "complianceConsiderations": [string],
  "monitoringRecommendations": [string],
  "confidenceLevel": number,
  "rationale": string
}
`;
  }

  /**
   * Analyze with OpenAI
   */
  async analyzeWithOpenAI(prompt) {
    const response = await this.providers.openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert risk management consultant with deep knowledge of enterprise risk assessment frameworks including ISO 31000, NIST, and COSO ERM."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    return JSON.parse(response.choices[0].message.content);
  }

  /**
   * Analyze with Azure OpenAI
   */
  async analyzeWithAzure(prompt) {
    const response = await this.providers.azure.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert risk management consultant specializing in enterprise cybersecurity and operational risk assessment."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    return JSON.parse(response.choices[0].message.content);
  }

  /**
   * Analyze with Anthropic Claude
   */
  async analyzeWithAnthropic(prompt) {
    const response = await this.providers.anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-3-opus-20240229",
      max_tokens: 2000,
      temperature: 0.3,
      system: "You are an expert risk management consultant with extensive experience in enterprise risk frameworks and regulatory compliance.",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
    });

    return JSON.parse(response.content[0].text);
  }

  /**
   * Analyze with Google Gemini
   */
  async analyzeWithGoogle(prompt) {
    const model = this.providers.google.getGenerativeModel({
      model: process.env.GOOGLE_AI_MODEL || "gemini-pro"
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return JSON.parse(text);
  }

  /**
   * Consolidate analyses from multiple providers
   */
  consolidateAnalyses(analyses, originalData) {
    const successfulAnalyses = analyses.filter(a => a.success);

    if (successfulAnalyses.length === 0) {
      return this.fallbackAnalysis(originalData);
    }

    // Calculate weighted average based on confidence levels
    const weights = successfulAnalyses.map(a => a.analysis.confidenceLevel || 0.5);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    const consolidated = {
      riskScore: math.round(
        successfulAnalyses.reduce((sum, a, i) =>
          sum + (a.analysis.riskScore * weights[i]), 0
        ) / totalWeight
      ),
      riskLevel: this.calculateConsensusRiskLevel(successfulAnalyses),
      keyFactors: this.consolidateArrays(successfulAnalyses.map(a => a.analysis.keyFactors)),
      consequences: this.consolidateArrays(successfulAnalyses.map(a => a.analysis.consequences)),
      mitigationStrategies: this.consolidateArrays(successfulAnalyses.map(a => a.analysis.mitigationStrategies)),
      complianceConsiderations: this.consolidateArrays(successfulAnalyses.map(a => a.analysis.complianceConsiderations)),
      monitoringRecommendations: this.consolidateArrays(successfulAnalyses.map(a => a.analysis.monitoringRecommendations)),
      confidenceLevel: math.round(totalWeight / successfulAnalyses.length * 100) / 100,
      providers: successfulAnalyses.map(a => a.provider),
      consensus: successfulAnalyses.length,
      totalProviders: analyses.length,
      rationale: this.generateConsolidatedRationale(successfulAnalyses),
      timestamp: new Date().toISOString(),
    };

    return consolidated;
  }

  /**
   * Calculate consensus risk level
   */
  calculateConsensusRiskLevel(analyses) {
    const levels = analyses.map(a => a.analysis.riskLevel);
    const levelCounts = _.countBy(levels);

    // Return most common level, or higher of tied levels
    const sortedLevels = ["Very Low", "Low", "Medium", "High", "Very High"];
    const maxCount = Math.max(...Object.values(levelCounts));

    const candidates = Object.keys(levelCounts)
      .filter(level => levelCounts[level] === maxCount)
      .sort((a, b) => sortedLevels.indexOf(b) - sortedLevels.indexOf(a));

    return candidates[0];
  }

  /**
   * Consolidate arrays from multiple analyses
   */
  consolidateArrays(arrays) {
    const allItems = arrays.flat();
    const uniqueItems = _.uniq(allItems);
    const itemCounts = _.countBy(allItems);

    // Return top items by frequency, limited to 5
    return Object.entries(itemCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([item]) => item);
  }

  /**
   * Generate consolidated rationale
   */
  generateConsolidatedRationale(analyses) {
    const scores = analyses.map(a => a.analysis.riskScore);
    const avgScore = math.mean(scores);
    const stdDev = math.std(scores);

    return `Consensus analysis from ${analyses.length} AI providers. ` +
           `Average risk score: ${math.round(avgScore)}. ` +
           `Score variation: ${math.round(stdDev * 100) / 100}. ` +
           `Risk level determined by majority consensus.`;
  }

  /**
   * Fallback analysis when AI providers fail
   */
  fallbackAnalysis(riskData) {
    const likelihood = this.normalizeLikelihood(riskData.likelihood);
    const impact = this.normalizeImpact(riskData.impact);
    const riskScore = likelihood * impact;

    return {
      riskScore: math.min(riskScore, 25),
      riskLevel: this.scoreToLevel(riskScore),
      keyFactors: ["Analysis based on traditional risk matrix calculation"],
      consequences: ["Potential business impact requires further assessment"],
      mitigationStrategies: ["Implement standard risk controls", "Regular monitoring"],
      complianceConsiderations: ["Review against relevant regulatory requirements"],
      monitoringRecommendations: ["Establish KPIs", "Regular risk assessments"],
      confidenceLevel: 0.3,
      rationale: "Fallback analysis using traditional risk matrix methodology due to AI service unavailability",
      fallback: true,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Normalize likelihood to 1-5 scale
   */
  normalizeLikelihood(likelihood) {
    if (typeof likelihood === "number") return math.min(math.max(likelihood, 1), 5);

    const mapping = {
      "very low": 1, "low": 2, "medium": 3, "high": 4, "very high": 5,
      "rare": 1, "unlikely": 2, "possible": 3, "likely": 4, "almost certain": 5,
    };

    return mapping[likelihood?.toLowerCase()] || 3;
  }

  /**
   * Normalize impact to 1-5 scale
   */
  normalizeImpact(impact) {
    if (typeof impact === "number") return math.min(math.max(impact, 1), 5);

    const mapping = {
      "very low": 1, "low": 2, "medium": 3, "high": 4, "very high": 5,
      "negligible": 1, "minor": 2, "moderate": 3, "major": 4, "catastrophic": 5,
    };

    return mapping[impact?.toLowerCase()] || 3;
  }

  /**
   * Convert score to risk level
   */
  scoreToLevel(score) {
    if (score <= 4) return "Very Low";
    if (score <= 8) return "Low";
    if (score <= 12) return "Medium";
    if (score <= 16) return "High";
    return "Very High";
  }

  /**
   * Get likelihood description
   */
  getLikelihoodDescription(likelihood) {
    const descriptions = {
      1: "Very Low - Rare occurrence",
      2: "Low - Unlikely to occur",
      3: "Medium - Possible occurrence",
      4: "High - Likely to occur",
      5: "Very High - Almost certain to occur",
    };
    return descriptions[this.normalizeLikelihood(likelihood)] || "Unknown";
  }

  /**
   * Get impact description
   */
  getImpactDescription(impact) {
    const descriptions = {
      1: "Very Low - Negligible impact",
      2: "Low - Minor impact",
      3: "Medium - Moderate impact",
      4: "High - Major impact",
      5: "Very High - Catastrophic impact",
    };
    return descriptions[this.normalizeImpact(impact)] || "Unknown";
  }

  /**
   * Cache management
   */
  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCached(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get service health
   */
  getHealth() {
    return {
      initialized: this.initialized,
      providers: Object.keys(this.providers),
      cacheSize: this.cache.size,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new AIRiskAnalysisService();