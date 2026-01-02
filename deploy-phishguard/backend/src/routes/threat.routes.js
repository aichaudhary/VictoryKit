/**
 * PhishGuard Threat Analysis Routes
 * Advanced phishing detection endpoints using 35+ APIs
 */

const express = require('express');
const router = express.Router();
const { authMiddleware, rateLimiter } = require('../../../../../shared');

// Import services
const ThreatIntelService = require('../services/threatIntel.service');
const EmailSecurityService = require('../services/emailSecurity.service');
const DomainIntelService = require('../services/domainIntel.service');
const HomographService = require('../services/homograph.service');
const VisualSimilarityService = require('../services/visualSimilarity.service');

/**
 * @route   POST /api/phishguard/scan/url
 * @desc    Comprehensive URL phishing analysis (35+ APIs)
 * @access  Protected
 */
router.post('/scan/url', authMiddleware, rateLimiter('phishing'), async (req, res, next) => {
  try {
    const { url, options = {} } = req.body;
    
    if (!url) {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }

    const startTime = Date.now();
    
    // Parse domain
    let domain;
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      domain = urlObj.hostname;
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Invalid URL format' });
    }

    // Run all analyses in parallel
    const [threatIntel, domainIntel, homograph] = await Promise.allSettled([
      ThreatIntelService.analyzeUrl(url),
      DomainIntelService.analyzeDomain(domain),
      HomographService.analyze(domain)
    ]);

    // Compile results
    const results = {
      url,
      domain,
      analysisId: `PHISH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      threatIntel: threatIntel.status === 'fulfilled' ? threatIntel.value : null,
      domainIntel: domainIntel.status === 'fulfilled' ? domainIntel.value : null,
      homograph: homograph.status === 'fulfilled' ? homograph.value : null,
      analysisTime: Date.now() - startTime
    };

    // Calculate verdict
    let riskScore = 0;
    let verdict = 'CLEAN';

    if (results.threatIntel?.riskScore) {
      riskScore = Math.max(riskScore, results.threatIntel.riskScore);
    }
    if (results.domainIntel?.riskScore) {
      riskScore = Math.max(riskScore, results.domainIntel.riskScore);
    }
    if (results.homograph?.isHomograph) {
      riskScore += 40;
    }

    riskScore = Math.min(100, riskScore);

    if (riskScore >= 70) verdict = 'PHISHING';
    else if (riskScore >= 40) verdict = 'SUSPICIOUS';

    results.verdict = verdict;
    results.riskScore = riskScore;

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('URL scan error:', error);
    next(error);
  }
});

/**
 * @route   POST /api/phishguard/scan/email
 * @desc    Email security analysis (SPF/DKIM/DMARC, header forensics)
 * @access  Protected
 */
router.post('/scan/email', authMiddleware, rateLimiter('phishing'), async (req, res, next) => {
  try {
    const { rawEmail, from, subject, body, headers } = req.body;
    
    if (!rawEmail && !from) {
      return res.status(400).json({ success: false, error: 'Raw email or sender address is required' });
    }

    const startTime = Date.now();
    
    const result = await EmailSecurityService.analyzeEmail({
      rawEmail,
      from,
      subject,
      body,
      headers
    });

    result.analysisTime = Date.now() - startTime;

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Email scan error:', error);
    next(error);
  }
});

/**
 * @route   POST /api/phishguard/scan/domain
 * @desc    Domain intelligence (WHOIS, DNS, SSL, age risk)
 * @access  Protected
 */
router.post('/scan/domain', authMiddleware, rateLimiter('phishing'), async (req, res, next) => {
  try {
    const { domain } = req.body;
    
    if (!domain) {
      return res.status(400).json({ success: false, error: 'Domain is required' });
    }

    const startTime = Date.now();
    const result = await DomainIntelService.analyzeDomain(domain);
    result.analysisTime = Date.now() - startTime;

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Domain scan error:', error);
    next(error);
  }
});

/**
 * @route   POST /api/phishguard/scan/homograph
 * @desc    Homograph/IDN attack detection
 * @access  Protected
 */
router.post('/scan/homograph', authMiddleware, rateLimiter('phishing'), async (req, res, next) => {
  try {
    const { domain } = req.body;
    
    if (!domain) {
      return res.status(400).json({ success: false, error: 'Domain is required' });
    }

    const startTime = Date.now();
    const result = await HomographService.analyze(domain);
    result.analysisTime = Date.now() - startTime;

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Homograph check error:', error);
    next(error);
  }
});

/**
 * @route   POST /api/phishguard/scan/visual
 * @desc    Visual similarity detection (screenshot comparison, brand detection)
 * @access  Protected
 */
router.post('/scan/visual', authMiddleware, rateLimiter('phishing'), async (req, res, next) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }

    const startTime = Date.now();
    const result = await VisualSimilarityService.analyze(url);
    result.analysisTime = Date.now() - startTime;

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Visual check error:', error);
    next(error);
  }
});

/**
 * @route   POST /api/phishguard/scan/bulk
 * @desc    Bulk URL analysis (up to 100 URLs)
 * @access  Protected
 */
router.post('/scan/bulk', authMiddleware, rateLimiter('bulk'), async (req, res, next) => {
  try {
    const { urls } = req.body;
    
    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ success: false, error: 'URLs array is required' });
    }

    if (urls.length > 100) {
      return res.status(400).json({ success: false, error: 'Maximum 100 URLs per request' });
    }

    const startTime = Date.now();
    
    const results = await Promise.all(
      urls.map(async (url) => {
        try {
          const threatCheck = await ThreatIntelService.analyzeUrl(url);
          return {
            url,
            verdict: threatCheck.verdict || 'CLEAN',
            riskScore: threatCheck.riskScore || 0,
            detections: threatCheck.summary?.detections || 0,
            status: 'success'
          };
        } catch (error) {
          return {
            url,
            verdict: 'ERROR',
            riskScore: 0,
            error: error.message,
            status: 'failed'
          };
        }
      })
    );

    const summary = {
      total: urls.length,
      clean: results.filter(r => r.verdict === 'CLEAN').length,
      suspicious: results.filter(r => r.verdict === 'SUSPICIOUS').length,
      phishing: results.filter(r => r.verdict === 'PHISHING').length,
      malicious: results.filter(r => r.verdict === 'MALICIOUS').length,
      failed: results.filter(r => r.status === 'failed').length
    };

    res.json({ 
      success: true, 
      data: { results, summary, analysisTime: Date.now() - startTime } 
    });
  } catch (error) {
    console.error('Bulk scan error:', error);
    next(error);
  }
});

/**
 * @route   GET /api/phishguard/apis/status
 * @desc    Get status of all configured threat intelligence APIs
 * @access  Protected
 */
router.get('/apis/status', authMiddleware, async (req, res, next) => {
  try {
    const status = ThreatIntelService.getApiStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    console.error('API status error:', error);
    next(error);
  }
});

/**
 * @route   GET /api/phishguard/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'PhishGuard',
    version: '5.0.0',
    status: 'operational',
    features: [
      '35+ Threat Intelligence APIs',
      'Email Security (SPF/DKIM/DMARC)',
      'Domain Intelligence',
      'Homograph Attack Detection',
      'Visual Similarity Detection'
    ],
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
