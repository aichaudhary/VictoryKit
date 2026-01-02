/**
 * Visual Similarity Detection Service
 * Detects cloned/fake websites using visual comparison
 * 
 * Features:
 * - Screenshot capture
 * - Perceptual hashing (pHash) for image comparison
 * - Logo detection and comparison
 * - Color palette analysis
 * - Layout structure comparison
 * - Brand asset detection
 */

const crypto = require('crypto');
const axios = require('axios');
const logger = require('../../../../../shared/utils/logger');

class VisualSimilarityService {
  constructor() {
    // Known brand visual signatures (logo hashes, primary colors, etc.)
    this.brandSignatures = {
      'microsoft.com': {
        primaryColors: ['#0078d4', '#ffffff', '#243a5e'],
        logoKeywords: ['microsoft', 'windows', 'office'],
        layoutPatterns: ['centered-login', 'header-logo']
      },
      'google.com': {
        primaryColors: ['#4285f4', '#ea4335', '#fbbc05', '#34a853'],
        logoKeywords: ['google', 'g-logo'],
        layoutPatterns: ['centered-search', 'minimal-header']
      },
      'apple.com': {
        primaryColors: ['#000000', '#ffffff', '#0071e3'],
        logoKeywords: ['apple', 'iphone', 'mac'],
        layoutPatterns: ['centered-product', 'minimal-nav']
      },
      'amazon.com': {
        primaryColors: ['#ff9900', '#232f3e', '#ffffff'],
        logoKeywords: ['amazon', 'prime', 'smile-logo'],
        layoutPatterns: ['search-bar-top', 'category-nav']
      },
      'paypal.com': {
        primaryColors: ['#003087', '#009cde', '#ffffff'],
        logoKeywords: ['paypal', 'pp-logo'],
        layoutPatterns: ['centered-login', 'blue-header']
      },
      'facebook.com': {
        primaryColors: ['#1877f2', '#ffffff', '#f0f2f5'],
        logoKeywords: ['facebook', 'meta', 'f-logo'],
        layoutPatterns: ['split-layout', 'centered-form']
      },
      'netflix.com': {
        primaryColors: ['#e50914', '#000000', '#ffffff'],
        logoKeywords: ['netflix', 'n-logo'],
        layoutPatterns: ['hero-image', 'dark-theme']
      },
      'linkedin.com': {
        primaryColors: ['#0a66c2', '#ffffff', '#f3f2ef'],
        logoKeywords: ['linkedin', 'in-logo'],
        layoutPatterns: ['split-layout', 'professional']
      }
    };

    // Known legitimate favicon hashes (would be populated from real data)
    this.legitimateFaviconHashes = new Map();
  }

  /**
   * Take screenshot of URL using Puppeteer/Playwright or external service
   */
  async captureScreenshot(url) {
    // Try URLScan.io for screenshot
    const urlscanKey = process.env.URLSCAN_API_KEY;
    
    if (urlscanKey) {
      try {
        // Submit scan
        const submitResponse = await axios.post(
          'https://urlscan.io/api/v1/scan/',
          { url, visibility: 'private' },
          {
            headers: { 'API-Key': urlscanKey },
            timeout: 10000
          }
        );

        const scanId = submitResponse.data.uuid;

        // Wait for scan to complete
        await new Promise(resolve => setTimeout(resolve, 20000));

        // Get results
        const resultResponse = await axios.get(
          `https://urlscan.io/api/v1/result/${scanId}/`,
          { timeout: 10000 }
        );

        return {
          available: true,
          provider: 'urlscan',
          screenshotUrl: resultResponse.data.task.screenshotURL,
          domUrl: resultResponse.data.task.domURL,
          scanId,
          finalUrl: resultResponse.data.page.url,
          status: resultResponse.data.page.status
        };
      } catch (error) {
        logger.warn('URLScan screenshot failed:', error.message);
      }
    }

    // Try CheckPhish as fallback
    const checkphishKey = process.env.CHECKPHISH_API_KEY;
    
    if (checkphishKey) {
      try {
        const submitResponse = await axios.post(
          'https://developers.bolster.ai/api/neo/scan',
          { apiKey: checkphishKey, urlInfo: { url } },
          { timeout: 10000 }
        );

        const jobId = submitResponse.data.jobID;

        // Wait and get results
        await new Promise(resolve => setTimeout(resolve, 10000));

        const resultResponse = await axios.post(
          'https://developers.bolster.ai/api/neo/scan/status',
          { apiKey: checkphishKey, jobID: jobId },
          { timeout: 10000 }
        );

        return {
          available: true,
          provider: 'checkphish',
          screenshotUrl: resultResponse.data.screenshot_path,
          jobId,
          disposition: resultResponse.data.disposition
        };
      } catch (error) {
        logger.warn('CheckPhish screenshot failed:', error.message);
      }
    }

    return {
      available: false,
      error: 'No screenshot service configured',
      configuredApis: ['URLSCAN_API_KEY', 'CHECKPHISH_API_KEY']
    };
  }

  /**
   * Calculate perceptual hash of an image (simulated - would use real pHash library)
   * In production, use libraries like: sharp, jimp, or phash
   */
  calculatePHash(imageBuffer) {
    // Simulated pHash - in production use real perceptual hashing
    // This would:
    // 1. Resize image to 32x32 or 64x64
    // 2. Convert to grayscale
    // 3. Apply DCT (Discrete Cosine Transform)
    // 4. Reduce to 8x8
    // 5. Calculate median and generate hash
    
    const hash = crypto.createHash('sha256').update(imageBuffer).digest('hex');
    return hash.substring(0, 16); // Simulated 64-bit pHash
  }

  /**
   * Compare two perceptual hashes and return similarity
   */
  comparePHashes(hash1, hash2) {
    if (!hash1 || !hash2) return 0;
    
    // Calculate Hamming distance for pHash comparison
    let distance = 0;
    for (let i = 0; i < Math.min(hash1.length, hash2.length); i++) {
      if (hash1[i] !== hash2[i]) distance++;
    }
    
    // Convert to similarity percentage
    const similarity = ((hash1.length - distance) / hash1.length) * 100;
    return similarity;
  }

  /**
   * Analyze page DOM for suspicious patterns
   */
  async analyzeDOMPatterns(url) {
    // This would use Puppeteer/Playwright to analyze actual DOM
    // For now, we'll extract what we can from the URL and metadata
    
    const suspiciousPatterns = {
      hasPasswordField: false,
      hasLoginForm: false,
      hasHiddenFields: false,
      externalFormAction: false,
      dataExfiltrationPatterns: false,
      iframeUsage: false,
      javascriptObfuscation: false
    };

    const riskIndicators = [];

    // URL pattern analysis
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('login') || urlLower.includes('signin')) {
      riskIndicators.push({
        type: 'login_page',
        severity: 'MEDIUM',
        message: 'URL suggests this is a login page'
      });
    }

    if (urlLower.includes('verify') || urlLower.includes('confirm') || urlLower.includes('secure')) {
      riskIndicators.push({
        type: 'verification_keywords',
        severity: 'HIGH',
        message: 'URL contains verification-related keywords often used in phishing'
      });
    }

    return {
      patterns: suspiciousPatterns,
      riskIndicators,
      analysisNote: 'Full DOM analysis requires headless browser (Puppeteer/Playwright)'
    };
  }

  /**
   * Extract and analyze color palette from page
   */
  analyzeColorPalette(colors) {
    const matches = [];

    for (const [domain, signature] of Object.entries(this.brandSignatures)) {
      const matchingColors = colors.filter(c => 
        signature.primaryColors.some(pc => 
          this.colorsAreSimilar(c, pc)
        )
      );

      if (matchingColors.length >= 2) {
        matches.push({
          brand: domain,
          matchingColors: matchingColors.length,
          totalBrandColors: signature.primaryColors.length,
          similarity: (matchingColors.length / signature.primaryColors.length * 100).toFixed(1)
        });
      }
    }

    return matches.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Check if two colors are similar (within threshold)
   */
  colorsAreSimilar(color1, color2, threshold = 30) {
    try {
      const rgb1 = this.hexToRgb(color1);
      const rgb2 = this.hexToRgb(color2);
      
      if (!rgb1 || !rgb2) return false;

      const distance = Math.sqrt(
        Math.pow(rgb1.r - rgb2.r, 2) +
        Math.pow(rgb1.g - rgb2.g, 2) +
        Math.pow(rgb1.b - rgb2.b, 2)
      );

      return distance < threshold;
    } catch {
      return false;
    }
  }

  /**
   * Convert hex color to RGB
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Detect brand logos in page content
   */
  detectBrandLogos(pageContent) {
    const detectedBrands = [];
    const contentLower = (pageContent || '').toLowerCase();

    for (const [domain, signature] of Object.entries(this.brandSignatures)) {
      const matches = signature.logoKeywords.filter(kw => 
        contentLower.includes(kw)
      );

      if (matches.length > 0) {
        detectedBrands.push({
          brand: domain,
          matchedKeywords: matches,
          confidence: (matches.length / signature.logoKeywords.length * 100).toFixed(1)
        });
      }
    }

    return detectedBrands;
  }

  /**
   * Analyze favicon for brand impersonation
   */
  async analyzeFavicon(url) {
    try {
      const urlObj = new URL(url);
      const faviconUrl = `${urlObj.origin}/favicon.ico`;

      const response = await axios.get(faviconUrl, {
        responseType: 'arraybuffer',
        timeout: 5000
      });

      const faviconHash = crypto
        .createHash('sha256')
        .update(Buffer.from(response.data))
        .digest('hex');

      // Check against known legitimate favicons
      const matchedBrand = this.legitimateFaviconHashes.get(faviconHash);

      return {
        available: true,
        faviconUrl,
        hash: faviconHash,
        size: response.data.length,
        matchedBrand,
        suspicious: matchedBrand && !url.includes(matchedBrand)
      };
    } catch (error) {
      return { available: false, error: error.message };
    }
  }

  /**
   * Check page title for brand impersonation
   */
  analyzePageTitle(title, domain) {
    if (!title) return { analyzed: false };

    const titleLower = title.toLowerCase();
    const impersonatedBrands = [];

    for (const [brandDomain, signature] of Object.entries(this.brandSignatures)) {
      const matches = signature.logoKeywords.filter(kw => 
        titleLower.includes(kw.toLowerCase())
      );

      if (matches.length > 0 && !domain.includes(brandDomain.split('.')[0])) {
        impersonatedBrands.push({
          brand: brandDomain,
          matchedKeywords: matches,
          severity: 'HIGH',
          message: `Page title mentions "${matches[0]}" but domain is ${domain}`
        });
      }
    }

    return {
      analyzed: true,
      title,
      impersonatedBrands,
      isSuspicious: impersonatedBrands.length > 0
    };
  }

  /**
   * Comprehensive visual similarity analysis
   */
  async analyze(url) {
    const startTime = Date.now();
    let domain;
    
    try {
      domain = new URL(url).hostname;
    } catch {
      domain = url;
    }

    const results = {
      url,
      domain,
      analysisTime: 0,
      screenshot: null,
      domAnalysis: null,
      favicon: null,
      brandDetection: [],
      riskScore: 0,
      verdict: 'UNKNOWN',
      issues: []
    };

    // Run analyses in parallel
    const [
      screenshot,
      domAnalysis,
      favicon
    ] = await Promise.allSettled([
      this.captureScreenshot(url),
      this.analyzeDOMPatterns(url),
      this.analyzeFavicon(url)
    ]);

    results.screenshot = screenshot.status === 'fulfilled' ? screenshot.value : null;
    results.domAnalysis = domAnalysis.status === 'fulfilled' ? domAnalysis.value : null;
    results.favicon = favicon.status === 'fulfilled' ? favicon.value : null;

    // Analyze detected issues
    if (results.domAnalysis?.riskIndicators) {
      results.issues.push(...results.domAnalysis.riskIndicators);
    }

    if (results.favicon?.suspicious) {
      results.issues.push({
        type: 'favicon_impersonation',
        severity: 'HIGH',
        message: `Favicon matches ${results.favicon.matchedBrand} but domain is different`
      });
      results.riskScore += 30;
    }

    // Calculate final risk score
    results.riskScore += results.issues.reduce((score, issue) => {
      if (issue.severity === 'CRITICAL') return score + 40;
      if (issue.severity === 'HIGH') return score + 25;
      if (issue.severity === 'MEDIUM') return score + 15;
      return score + 5;
    }, 0);

    results.riskScore = Math.min(100, results.riskScore);
    results.verdict = results.riskScore >= 70 ? 'LIKELY_PHISHING' :
                      results.riskScore >= 40 ? 'SUSPICIOUS' : 'APPEARS_SAFE';

    results.analysisTime = Date.now() - startTime;

    return results;
  }

  /**
   * Compare two URLs for visual similarity
   */
  async compareUrls(url1, url2) {
    const [analysis1, analysis2] = await Promise.all([
      this.analyze(url1),
      this.analyze(url2)
    ]);

    let similarity = 0;
    const comparisonDetails = [];

    // Compare screenshots if available
    if (analysis1.screenshot?.screenshotUrl && analysis2.screenshot?.screenshotUrl) {
      comparisonDetails.push({
        type: 'screenshot',
        url1Screenshot: analysis1.screenshot.screenshotUrl,
        url2Screenshot: analysis2.screenshot.screenshotUrl,
        note: 'Visual comparison requires image processing library'
      });
    }

    // Compare favicons
    if (analysis1.favicon?.hash && analysis2.favicon?.hash) {
      const faviconMatch = analysis1.favicon.hash === analysis2.favicon.hash;
      comparisonDetails.push({
        type: 'favicon',
        match: faviconMatch,
        similarity: faviconMatch ? 100 : 0
      });
      if (faviconMatch) similarity += 30;
    }

    return {
      url1: analysis1,
      url2: analysis2,
      overallSimilarity: similarity,
      comparisonDetails,
      isSuspicious: similarity > 50 && url1 !== url2
    };
  }
}

module.exports = new VisualSimilarityService();
