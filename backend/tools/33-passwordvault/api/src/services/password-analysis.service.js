const axios = require('axios');

class PasswordAnalysisService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.hibpApiKey = process.env.HIBP_API_KEY;
  }

  /**
   * Analyze password strength using AI
   */
  async analyzePasswordStrength(password, context = {}) {
    try {
      const basicAnalysis = this.basicStrengthAnalysis(password);
      const aiAnalysis = await this.aiStrengthAnalysis(password, context);
      const breachCheck = await this.checkPasswordBreaches(password);

      return {
        ...basicAnalysis,
        aiInsights: aiAnalysis,
        breachInfo: breachCheck,
        recommendations: this.generateRecommendations(basicAnalysis, aiAnalysis, breachCheck),
        score: this.calculateOverallScore(basicAnalysis, aiAnalysis, breachCheck)
      };
    } catch (error) {
      console.error('Password analysis error:', error);
      return this.basicStrengthAnalysis(password);
    }
  }

  /**
   * Basic password strength analysis
   */
  basicStrengthAnalysis(password) {
    let score = 0;
    const issues = [];
    const strengths = [];

    // Length analysis
    if (password.length >= 16) {
      score += 25;
      strengths.push('Excellent length');
    } else if (password.length >= 12) {
      score += 20;
      strengths.push('Good length');
    } else if (password.length >= 8) {
      score += 10;
      strengths.push('Minimum acceptable length');
    } else {
      issues.push('Password too short (minimum 8 characters)');
    }

    // Character variety
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);

    if (hasLower) {
      score += 15;
      strengths.push('Contains lowercase letters');
    } else {
      issues.push('Missing lowercase letters');
    }

    if (hasUpper) {
      score += 15;
      strengths.push('Contains uppercase letters');
    } else {
      issues.push('Missing uppercase letters');
    }

    if (hasNumbers) {
      score += 15;
      strengths.push('Contains numbers');
    } else {
      issues.push('Missing numbers');
    }

    if (hasSymbols) {
      score += 15;
      strengths.push('Contains special characters');
    } else {
      issues.push('Missing special characters');
    }

    // Pattern analysis
    if (/(.)\1{2,}/.test(password)) {
      score -= 10;
      issues.push('Contains repeated characters');
    }

    if (/123|abc|qwe|password|admin|user/i.test(password)) {
      score -= 15;
      issues.push('Contains common patterns');
    }

    // Dictionary words
    const commonWords = ['password', 'admin', 'user', 'login', 'welcome', 'letmein', 'monkey', 'dragon', 'passw0rd'];
    if (commonWords.some(word => password.toLowerCase().includes(word))) {
      score -= 10;
      issues.push('Contains common dictionary words');
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      strength: score >= 80 ? 'very-strong' : score >= 60 ? 'strong' : score >= 40 ? 'moderate' : score >= 20 ? 'weak' : 'very-weak',
      strengths,
      issues,
      entropy: this.calculateEntropy(password)
    };
  }

  /**
   * Calculate password entropy
   */
  calculateEntropy(password) {
    let charset = 0;
    if (/[a-z]/.test(password)) charset += 26;
    if (/[A-Z]/.test(password)) charset += 26;
    if (/\d/.test(password)) charset += 10;
    if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) charset += 32;

    if (charset === 0) return 0;

    return Math.log2(Math.pow(charset, password.length));
  }

  /**
   * AI-powered password analysis using OpenAI
   */
  async aiStrengthAnalysis(password, context = {}) {
    if (!this.openaiApiKey) return null;

    try {
      const prompt = `Analyze this password for security strength. Consider:
      - Length and complexity
      - Common patterns or dictionary words
      - Potential vulnerabilities
      - Context: ${context.purpose || 'general use'}
      - User behavior patterns if any

      Password (masked for security): ${'*'.repeat(password.length)} (length: ${password.length})

      Provide a JSON response with:
      - strength_score (0-100)
      - risk_factors (array)
      - improvement_suggestions (array)
      - estimated_crack_time (string)
      - ai_confidence (0-100)`;

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.3
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const aiResponse = JSON.parse(response.data.choices[0].message.content);
      return {
        aiScore: aiResponse.strength_score || 0,
        riskFactors: aiResponse.risk_factors || [],
        suggestions: aiResponse.improvement_suggestions || [],
        crackTime: aiResponse.estimated_crack_time || 'unknown',
        confidence: aiResponse.ai_confidence || 0
      };
    } catch (error) {
      console.error('AI analysis failed:', error.message);
      return null;
    }
  }

  /**
   * Check password against breach databases
   */
  async checkPasswordBreaches(password) {
    if (!this.hibpApiKey) return null;

    try {
      // Hash the password with SHA-1 for HIBP API
      const sha1Hash = require('crypto').createHash('sha1').update(password).digest('hex').toUpperCase();
      const prefix = sha1Hash.substring(0, 5);
      const suffix = sha1Hash.substring(5);

      const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`, {
        headers: {
          'User-Agent': 'PasswordVault-Security-Check'
        }
      });

      const lines = response.data.split('\n');
      const breach = lines.find(line => line.startsWith(suffix));

      if (breach) {
        const count = parseInt(breach.split(':')[1]);
        return {
          breached: true,
          breachCount: count,
          severity: count > 100000 ? 'critical' : count > 10000 ? 'high' : 'medium',
          message: `Password found in ${count.toLocaleString()} data breaches`
        };
      }

      return {
        breached: false,
        message: 'Password not found in known breaches'
      };
    } catch (error) {
      console.error('Breach check failed:', error.message);
      return {
        breached: false,
        error: 'Unable to check breach status'
      };
    }
  }

  /**
   * Generate personalized recommendations
   */
  generateRecommendations(basic, ai, breach) {
    const recommendations = [];

    // Basic recommendations
    if (basic.score < 60) {
      recommendations.push('Increase password length to at least 12 characters');
    }

    if (!basic.strengths.includes('Contains special characters')) {
      recommendations.push('Add special characters (!@#$%^&*) for better security');
    }

    // AI recommendations
    if (ai && ai.suggestions) {
      recommendations.push(...ai.suggestions.slice(0, 3));
    }

    // Breach recommendations
    if (breach && breach.breached) {
      recommendations.push('Change this password immediately - it has been compromised');
      recommendations.push('Enable two-factor authentication');
      recommendations.push('Use a password manager for unique passwords');
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  /**
   * Calculate overall password score
   */
  calculateOverallScore(basic, ai, breach) {
    let score = basic.score;

    // AI adjustment
    if (ai && ai.aiScore) {
      score = (score + ai.aiScore) / 2;
    }

    // Breach penalty
    if (breach && breach.breached) {
      score -= 30;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate password improvement suggestions
   */
  async suggestPasswordImprovements(password) {
    if (!this.openaiApiKey) {
      return this.basicPasswordSuggestions(password);
    }

    try {
      const prompt = `Given this password analysis, suggest 3-5 specific improvements:

Password length: ${password.length}
Contains lowercase: ${/[a-z]/.test(password)}
Contains uppercase: ${/[A-Z]/.test(password)}
Contains numbers: ${/\d/.test(password)}
Contains symbols: ${/[^a-zA-Z0-9]/.test(password)}

Provide specific, actionable suggestions to make this password stronger.`;

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content.split('\n').filter(line => line.trim());
    } catch (error) {
      return this.basicPasswordSuggestions(password);
    }
  }

  /**
   * Basic password suggestions as fallback
   */
  basicPasswordSuggestions(password) {
    const suggestions = [];

    if (password.length < 12) {
      suggestions.push('Make it at least 12 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      suggestions.push('Add uppercase letters');
    }

    if (!/[a-z]/.test(password)) {
      suggestions.push('Add lowercase letters');
    }

    if (!/\d/.test(password)) {
      suggestions.push('Add numbers');
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      suggestions.push('Add special characters');
    }

    return suggestions;
  }
}

module.exports = new PasswordAnalysisService();