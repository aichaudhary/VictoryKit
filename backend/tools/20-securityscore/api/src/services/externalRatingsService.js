/**
 * External Ratings Service - Integration with security rating platforms
 * Supports SecurityScorecard, BitSight, RiskRecon, UpGuard, and more
 */

const axios = require('axios');
const NodeCache = require('node-cache');

class ExternalRatingsService {
  constructor() {
    this.cache = new NodeCache({ stdTTL: 3600 });
    this.providers = {};
    this.initialized = false;
  }

  async initialize() {
    // Initialize SecurityScorecard
    if (process.env.SECURITYSCORECARD_API_KEY) {
      this.providers.securityScorecard = {
        baseUrl: process.env.SECURITYSCORECARD_BASE_URL || 'https://api.securityscorecard.io',
        apiKey: process.env.SECURITYSCORECARD_API_KEY,
        companyId: process.env.SECURITYSCORECARD_COMPANY_ID
      };
    }

    // Initialize BitSight
    if (process.env.BITSIGHT_API_KEY) {
      this.providers.bitSight = {
        baseUrl: process.env.BITSIGHT_BASE_URL || 'https://api.bitsighttech.com/ratings/v1',
        apiKey: process.env.BITSIGHT_API_KEY,
        companyGuid: process.env.BITSIGHT_COMPANY_GUID
      };
    }

    // Initialize RiskRecon
    if (process.env.RISKRECON_API_KEY) {
      this.providers.riskRecon = {
        baseUrl: process.env.RISKRECON_BASE_URL || 'https://api.riskrecon.com/v1',
        apiKey: process.env.RISKRECON_API_KEY
      };
    }

    // Initialize UpGuard
    if (process.env.UPGUARD_API_KEY) {
      this.providers.upGuard = {
        baseUrl: process.env.UPGUARD_BASE_URL || 'https://cyber-risk.upguard.com/api/public',
        apiKey: process.env.UPGUARD_API_KEY
      };
    }

    // Initialize Black Kite
    if (process.env.BLACKKITE_API_KEY) {
      this.providers.blackKite = {
        baseUrl: process.env.BLACKKITE_BASE_URL || 'https://api.blackkite.com/v1',
        apiKey: process.env.BLACKKITE_API_KEY
      };
    }

    this.initialized = true;
    console.log('External Ratings Service initialized with providers:', Object.keys(this.providers));
  }

  async getSecurityScorecardRating(domain = null) {
    if (!this.providers.securityScorecard) {
      return this.getMockRating('securityScorecard');
    }

    const cacheKey = `ssc_${domain || 'self'}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const { baseUrl, apiKey, companyId } = this.providers.securityScorecard;
      const endpoint = domain 
        ? `/companies/${domain}` 
        : `/companies/${companyId}`;

      const response = await axios.get(`${baseUrl}${endpoint}`, {
        headers: { 'Authorization': `Token ${apiKey}` }
      });

      const rating = {
        provider: 'SecurityScorecard',
        score: response.data.overall_rating?.score || 0,
        grade: response.data.overall_rating?.grade || 'N/A',
        factors: this.parseSecurityScorecardFactors(response.data),
        lastUpdated: response.data.last_updated,
        domain: domain || 'self'
      };

      this.cache.set(cacheKey, rating);
      return rating;
    } catch (error) {
      console.error('SecurityScorecard API error:', error.message);
      return this.getMockRating('securityScorecard');
    }
  }

  async getBitSightRating(domain = null) {
    if (!this.providers.bitSight) {
      return this.getMockRating('bitSight');
    }

    const cacheKey = `bitsight_${domain || 'self'}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const { baseUrl, apiKey, companyGuid } = this.providers.bitSight;
      const endpoint = domain 
        ? `/companies?domain=${domain}` 
        : `/companies/${companyGuid}`;

      const response = await axios.get(`${baseUrl}${endpoint}`, {
        headers: { 'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}` }
      });

      const rating = {
        provider: 'BitSight',
        score: response.data.rating || 0,
        grade: this.bitSightScoreToGrade(response.data.rating),
        factors: this.parseBitSightFactors(response.data),
        lastUpdated: response.data.rating_date,
        domain: domain || 'self'
      };

      this.cache.set(cacheKey, rating);
      return rating;
    } catch (error) {
      console.error('BitSight API error:', error.message);
      return this.getMockRating('bitSight');
    }
  }

  async getRiskReconRating(vendorId) {
    if (!this.providers.riskRecon) {
      return this.getMockRating('riskRecon');
    }

    try {
      const { baseUrl, apiKey } = this.providers.riskRecon;
      const response = await axios.get(`${baseUrl}/vendors/${vendorId}/rating`, {
        headers: { 'x-api-key': apiKey }
      });

      return {
        provider: 'RiskRecon',
        score: response.data.overall_rating || 0,
        grade: response.data.letter_grade || 'N/A',
        factors: response.data.risk_categories || [],
        lastUpdated: response.data.updated_at
      };
    } catch (error) {
      console.error('RiskRecon API error:', error.message);
      return this.getMockRating('riskRecon');
    }
  }

  async getUpGuardRating(domain) {
    if (!this.providers.upGuard) {
      return this.getMockRating('upGuard');
    }

    try {
      const { baseUrl, apiKey } = this.providers.upGuard;
      const response = await axios.get(`${baseUrl}/vendor`, {
        params: { hostname: domain },
        headers: { 'Authorization': apiKey }
      });

      return {
        provider: 'UpGuard',
        score: response.data.score || 0,
        grade: this.upGuardScoreToGrade(response.data.score),
        factors: response.data.risks || [],
        lastUpdated: response.data.scanned_at
      };
    } catch (error) {
      console.error('UpGuard API error:', error.message);
      return this.getMockRating('upGuard');
    }
  }

  async getAggregatedRating(domain = null) {
    const ratings = await Promise.all([
      this.getSecurityScorecardRating(domain),
      this.getBitSightRating(domain),
      this.getRiskReconRating(domain),
      this.getUpGuardRating(domain)
    ]);

    const validRatings = ratings.filter(r => r && r.score > 0);
    
    if (validRatings.length === 0) {
      return {
        aggregatedScore: 0,
        aggregatedGrade: 'N/A',
        confidence: 0,
        providers: [],
        lastUpdated: new Date().toISOString()
      };
    }

    const avgScore = validRatings.reduce((sum, r) => sum + r.score, 0) / validRatings.length;

    return {
      aggregatedScore: Math.round(avgScore),
      aggregatedGrade: this.scoreToGrade(avgScore),
      confidence: Math.round((validRatings.length / 4) * 100),
      providers: validRatings,
      comparison: this.compareProviders(validRatings),
      lastUpdated: new Date().toISOString()
    };
  }

  async getIndustryBenchmarks(industry) {
    const cacheKey = `benchmark_${industry}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    // Simulated industry benchmarks (would come from actual APIs)
    const benchmarks = {
      'technology': { average: 78, median: 76, top25: 88, bottom25: 65 },
      'healthcare': { average: 72, median: 70, top25: 84, bottom25: 58 },
      'financial': { average: 82, median: 80, top25: 92, bottom25: 70 },
      'retail': { average: 68, median: 66, top25: 80, bottom25: 55 },
      'manufacturing': { average: 65, median: 63, top25: 78, bottom25: 52 },
      'government': { average: 70, median: 68, top25: 82, bottom25: 56 },
      'education': { average: 62, median: 60, top25: 75, bottom25: 48 },
      'default': { average: 70, median: 68, top25: 82, bottom25: 56 }
    };

    const result = benchmarks[industry?.toLowerCase()] || benchmarks.default;
    result.industry = industry || 'default';
    result.updatedAt = new Date().toISOString();

    this.cache.set(cacheKey, result, 86400); // Cache for 24 hours
    return result;
  }

  async getPeerComparison(currentScore, industry, size = 'medium') {
    const benchmarks = await this.getIndustryBenchmarks(industry);
    
    return {
      yourScore: currentScore,
      industry: industry,
      companySize: size,
      percentile: this.calculatePercentile(currentScore, benchmarks),
      comparison: {
        vsAverage: currentScore - benchmarks.average,
        vsMedian: currentScore - benchmarks.median,
        vsTop25: currentScore - benchmarks.top25,
        vsBottom25: currentScore - benchmarks.bottom25
      },
      ranking: this.getRanking(currentScore, benchmarks),
      recommendations: this.generateBenchmarkRecommendations(currentScore, benchmarks)
    };
  }

  // Helper methods
  parseSecurityScorecardFactors(data) {
    const factors = [];
    if (data.factor_grades) {
      Object.entries(data.factor_grades).forEach(([name, details]) => {
        factors.push({
          name: name.replace(/_/g, ' '),
          score: details.score || 0,
          grade: details.grade || 'N/A',
          issues: details.issue_count || 0
        });
      });
    }
    return factors;
  }

  parseBitSightFactors(data) {
    const factors = [];
    if (data.rating_details) {
      data.rating_details.forEach(detail => {
        factors.push({
          name: detail.name,
          score: detail.rating,
          grade: this.bitSightScoreToGrade(detail.rating),
          findings: detail.findings || 0
        });
      });
    }
    return factors;
  }

  scoreToGrade(score) {
    if (score >= 97) return 'A+';
    if (score >= 93) return 'A';
    if (score >= 90) return 'A-';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 60) return 'D';
    return 'F';
  }

  bitSightScoreToGrade(score) {
    // BitSight uses 250-900 scale
    if (score >= 740) return 'A';
    if (score >= 640) return 'B';
    if (score >= 540) return 'C';
    if (score >= 440) return 'D';
    return 'F';
  }

  upGuardScoreToGrade(score) {
    // UpGuard uses 0-950 scale
    if (score >= 850) return 'A';
    if (score >= 700) return 'B';
    if (score >= 550) return 'C';
    if (score >= 400) return 'D';
    return 'F';
  }

  calculatePercentile(score, benchmarks) {
    const { average, top25, bottom25 } = benchmarks;
    if (score >= top25) return 75 + ((score - top25) / (100 - top25)) * 25;
    if (score >= average) return 50 + ((score - average) / (top25 - average)) * 25;
    if (score >= bottom25) return 25 + ((score - bottom25) / (average - bottom25)) * 25;
    return (score / bottom25) * 25;
  }

  getRanking(score, benchmarks) {
    if (score >= benchmarks.top25) return 'Top Performer';
    if (score >= benchmarks.average) return 'Above Average';
    if (score >= benchmarks.median) return 'Average';
    if (score >= benchmarks.bottom25) return 'Below Average';
    return 'Needs Improvement';
  }

  compareProviders(ratings) {
    if (ratings.length < 2) return null;
    
    const scores = ratings.map(r => r.score);
    return {
      min: Math.min(...scores),
      max: Math.max(...scores),
      spread: Math.max(...scores) - Math.min(...scores),
      agreement: Math.max(...scores) - Math.min(...scores) < 10 ? 'High' : 
                 Math.max(...scores) - Math.min(...scores) < 20 ? 'Medium' : 'Low'
    };
  }

  generateBenchmarkRecommendations(score, benchmarks) {
    const recs = [];
    
    if (score < benchmarks.average) {
      recs.push({
        priority: 'high',
        action: 'Focus on reaching industry average',
        target: benchmarks.average,
        gap: benchmarks.average - score
      });
    }
    
    if (score < benchmarks.top25) {
      recs.push({
        priority: score < benchmarks.average ? 'medium' : 'high',
        action: 'Aim for top quartile performance',
        target: benchmarks.top25,
        gap: benchmarks.top25 - score
      });
    }

    return recs;
  }

  getMockRating(provider) {
    const mockRatings = {
      securityScorecard: {
        provider: 'SecurityScorecard',
        score: 78,
        grade: 'B',
        factors: [
          { name: 'Network Security', score: 82, grade: 'B', issues: 3 },
          { name: 'Patching Cadence', score: 75, grade: 'C', issues: 8 },
          { name: 'Endpoint Security', score: 80, grade: 'B', issues: 4 },
          { name: 'DNS Health', score: 85, grade: 'B', issues: 2 }
        ],
        lastUpdated: new Date().toISOString(),
        simulated: true
      },
      bitSight: {
        provider: 'BitSight',
        score: 720,
        grade: 'B',
        factors: [
          { name: 'Compromised Systems', score: 750, grade: 'A' },
          { name: 'Diligence', score: 680, grade: 'B' },
          { name: 'User Behavior', score: 710, grade: 'B' }
        ],
        lastUpdated: new Date().toISOString(),
        simulated: true
      },
      riskRecon: {
        provider: 'RiskRecon',
        score: 76,
        grade: 'B',
        factors: [],
        lastUpdated: new Date().toISOString(),
        simulated: true
      },
      upGuard: {
        provider: 'UpGuard',
        score: 780,
        grade: 'B',
        factors: [],
        lastUpdated: new Date().toISOString(),
        simulated: true
      }
    };

    return mockRatings[provider] || { provider, score: 75, grade: 'C', simulated: true };
  }

  getAvailableProviders() {
    return Object.keys(this.providers);
  }
}

module.exports = new ExternalRatingsService();
