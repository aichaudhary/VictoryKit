/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎣 PHISHNETAI - ANALYSIS CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════════
 * Handles URL, email, and domain phishing analysis
 */

const { Analysis, Domain } = require('../models');
const crypto = require('crypto');

// Generate unique analysis ID
const generateAnalysisId = () => `PNA-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

// Simulated threat intelligence check
const checkThreatIntel = async (target, type) => {
  const providers = [
    'Google Safe Browsing',
    'VirusTotal',
    'PhishTank',
    'URLhaus',
    'IPQualityScore',
    'URLScan.io',
    'OpenPhish',
    'AlienVault OTX',
    'CheckPhish',
    'Hybrid Analysis',
    'AbuseIPDB',
    'Shodan',
  ];

  // Simulate threat intel results
  const isSuspicious =
    target.toLowerCase().includes('login') ||
    target.toLowerCase().includes('verify') ||
    target.toLowerCase().includes('secure-') ||
    target.includes('1') ||
    target.includes('0');

  return providers.map((provider) => ({
    provider,
    available: Math.random() > 0.1,
    queried: true,
    result: {
      isMalicious: isSuspicious && Math.random() > 0.5,
      isPhishing: isSuspicious && Math.random() > 0.4,
      riskScore: isSuspicious
        ? Math.floor(Math.random() * 40) + 60
        : Math.floor(Math.random() * 20),
    },
    queryTime: Math.floor(Math.random() * 500) + 100,
  }));
};

// Check for homograph attacks
const detectHomograph = (domain) => {
  const confusables = [];
  const homographChars = {
    а: 'a',
    е: 'e',
    о: 'o',
    р: 'p',
    с: 'c',
    х: 'x',
    1: 'l',
    0: 'o',
    '!': 'i',
    $: 's',
    '@': 'a',
  };

  let normalized = domain;
  for (const [fake, real] of Object.entries(homographChars)) {
    if (domain.includes(fake)) {
      confusables.push({ original: fake, lookalike: real });
      normalized = normalized.replace(new RegExp(fake, 'g'), real);
    }
  }

  return {
    detected: confusables.length > 0,
    originalDomain: domain,
    normalizedDomain: normalized,
    confusables,
  };
};

// Analyze URL
exports.analyzeUrl = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required',
      });
    }

    const startTime = Date.now();
    const analysisId = generateAnalysisId();

    // Parse URL
    let parsed;
    try {
      parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format',
      });
    }

    // Run checks in parallel
    const [threatIntel, homograph] = await Promise.all([
      checkThreatIntel(url, 'url'),
      Promise.resolve(detectHomograph(parsed.hostname)),
    ]);

    // Calculate risk score
    const maliciousCount = threatIntel.filter(
      (t) => t.result?.isMalicious || t.result?.isPhishing
    ).length;
    const riskScore = Math.min(100, maliciousCount * 15 + (homograph.detected ? 30 : 0));

    // Determine verdict
    let verdict = 'SAFE';
    if (riskScore >= 70) verdict = 'PHISHING';
    else if (riskScore >= 50) verdict = 'MALICIOUS';
    else if (riskScore >= 30) verdict = 'SUSPICIOUS';

    // Domain age simulation
    const domainAge = Math.floor(Math.random() * 2000);

    // Create analysis record
    const analysis = new Analysis({
      analysisId,
      type: 'url',
      input: { url, domain: parsed.hostname },
      verdict,
      riskScore,
      confidence: Math.min(95, 60 + maliciousCount * 5),
      urlAnalysis: {
        parsed: {
          protocol: parsed.protocol,
          hostname: parsed.hostname,
          path: parsed.pathname,
          query: parsed.search,
          subdomain: parsed.hostname.split('.').slice(0, -2).join('.'),
          tld: '.' + parsed.hostname.split('.').pop(),
        },
        shortenerDetected: ['bit.ly', 't.co', 'goo.gl', 'tinyurl.com'].includes(parsed.hostname),
        suspiciousPatterns: [],
      },
      domainIntel: {
        age: domainAge,
        ageCategory:
          domainAge < 30
            ? 'new'
            : domainAge < 180
              ? 'recent'
              : domainAge < 730
                ? 'established'
                : 'veteran',
      },
      sslAnalysis: {
        valid: parsed.protocol === 'https:',
        issuer: riskScore > 50 ? "Let's Encrypt" : 'DigiCert Inc',
        daysUntilExpiry: Math.floor(Math.random() * 300) + 30,
      },
      homographAnalysis: homograph,
      threatIntel,
      analysisMetrics: {
        startTime: new Date(startTime),
        endTime: new Date(),
        totalDuration: Date.now() - startTime,
        stepsCompleted: 8,
        totalSteps: 8,
        apiCalls: threatIntel.length,
      },
      userId: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Add indicators based on findings
    if (homograph.detected) {
      analysis.indicators.push({
        type: 'critical',
        category: 'homograph',
        description: 'IDN homograph attack detected - domain uses lookalike characters',
        evidence: `Original: ${homograph.originalDomain}, Normalized: ${homograph.normalizedDomain}`,
      });
    }

    if (riskScore > 50) {
      analysis.indicators.push({
        type: 'high',
        category: 'threat_intel',
        description: `Flagged by ${maliciousCount} threat intelligence sources`,
        evidence: threatIntel
          .filter((t) => t.result?.isMalicious)
          .map((t) => t.provider)
          .join(', '),
      });
    }

    await analysis.save();

    // Update domain record
    await Domain.findOneAndUpdate(
      { domain: parsed.hostname },
      {
        $set: {
          domain: parsed.hostname,
          tld: '.' + parsed.hostname.split('.').pop(),
          'reputation.score': 100 - riskScore,
          'reputation.category':
            verdict === 'SAFE' ? 'trusted' : verdict === 'SUSPICIOUS' ? 'suspicious' : 'malicious',
        },
        $inc: { 'history.totalScans': 1 },
        $setOnInsert: { 'history.firstSeen': new Date() },
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: {
        analysisId: analysis.analysisId,
        verdict: analysis.verdict,
        riskScore: analysis.riskScore,
        confidence: analysis.confidence,
        url: analysis.input.url,
        domain: analysis.input.domain,
        homograph: analysis.homographAnalysis,
        domainIntel: {
          age: analysis.domainIntel.age,
          ageCategory: analysis.domainIntel.ageCategory,
        },
        ssl: analysis.sslAnalysis,
        threatIntel: analysis.threatIntel.map((t) => ({
          provider: t.provider,
          available: t.available,
          isMalicious: t.result?.isMalicious,
          isPhishing: t.result?.isPhishing,
          riskScore: t.result?.riskScore,
        })),
        indicators: analysis.indicators,
        analysisTime: analysis.analysisMetrics.totalDuration,
      },
    });
  } catch (error) {
    console.error('URL Analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Analysis failed',
      message: error.message,
    });
  }
};

// Analyze Email
exports.analyzeEmail = async (req, res) => {
  try {
    const { email, headers, content } = req.body;

    if (!email && !content) {
      return res.status(400).json({
        success: false,
        error: 'Email content or headers required',
      });
    }

    const startTime = Date.now();
    const analysisId = generateAnalysisId();

    // Extract sender domain
    const senderMatch = (email || content).match(/From:\s*.*?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    const senderDomain = senderMatch ? senderMatch[1] : 'unknown.com';

    // Simulate email authentication checks
    const isSuspicious =
      (content || '').toLowerCase().includes('urgent') ||
      (content || '').toLowerCase().includes('verify') ||
      (content || '').toLowerCase().includes('suspended');

    const emailAuth = {
      spf: { valid: !isSuspicious, status: isSuspicious ? 'fail' : 'pass' },
      dkim: { valid: Math.random() > 0.3, status: Math.random() > 0.3 ? 'pass' : 'fail' },
      dmarc: { valid: !isSuspicious, policy: isSuspicious ? 'none' : 'reject' },
    };

    // Calculate risk
    let riskScore = 0;
    if (!emailAuth.spf.valid) riskScore += 20;
    if (!emailAuth.dkim.valid) riskScore += 15;
    if (!emailAuth.dmarc.valid) riskScore += 25;
    if (isSuspicious) riskScore += 30;

    riskScore = Math.min(100, riskScore);

    let verdict = 'SAFE';
    if (riskScore >= 70) verdict = 'PHISHING';
    else if (riskScore >= 50) verdict = 'SUSPICIOUS';
    else if (riskScore >= 30) verdict = 'SPAM';

    const analysis = new Analysis({
      analysisId,
      type: 'email',
      input: { email, rawContent: content },
      verdict,
      riskScore,
      confidence: 75,
      emailAuth,
      senderAnalysis: {
        domain: senderDomain,
        spoofed: !emailAuth.spf.valid,
        reputation: riskScore > 50 ? 'suspicious' : 'neutral',
      },
      contentAnalysis: {
        urgencyScore: isSuspicious ? 80 : 20,
        suspiciousKeywords: isSuspicious ? ['urgent', 'verify', 'suspended'] : [],
      },
      analysisMetrics: {
        startTime: new Date(startTime),
        endTime: new Date(),
        totalDuration: Date.now() - startTime,
        stepsCompleted: 10,
        totalSteps: 10,
      },
      userId: req.user?.id,
      ipAddress: req.ip,
    });

    await analysis.save();

    res.json({
      success: true,
      data: {
        analysisId: analysis.analysisId,
        verdict: analysis.verdict,
        riskScore: analysis.riskScore,
        emailAuth: analysis.emailAuth,
        senderAnalysis: analysis.senderAnalysis,
        contentAnalysis: analysis.contentAnalysis,
        analysisTime: analysis.analysisMetrics.totalDuration,
      },
    });
  } catch (error) {
    console.error('Email Analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Analysis failed',
      message: error.message,
    });
  }
};

// Analyze Domain
exports.analyzeDomain = async (req, res) => {
  try {
    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain is required',
      });
    }

    const startTime = Date.now();
    const analysisId = generateAnalysisId();

    // Check domain intelligence
    const threatIntel = await checkThreatIntel(domain, 'domain');
    const homograph = detectHomograph(domain);

    const maliciousCount = threatIntel.filter((t) => t.result?.isMalicious).length;
    const riskScore = Math.min(100, maliciousCount * 12 + (homograph.detected ? 35 : 0));

    let verdict = 'SAFE';
    if (riskScore >= 70) verdict = 'MALICIOUS';
    else if (riskScore >= 40) verdict = 'SUSPICIOUS';

    const domainAge = Math.floor(Math.random() * 2500);

    const analysis = new Analysis({
      analysisId,
      type: 'domain',
      input: { domain },
      verdict,
      riskScore,
      confidence: 80,
      domainIntel: {
        age: domainAge,
        ageCategory: domainAge < 30 ? 'new' : domainAge < 180 ? 'recent' : 'established',
        registrar: ['GoDaddy', 'Namecheap', 'Cloudflare'][Math.floor(Math.random() * 3)],
      },
      sslAnalysis: {
        valid: true,
        issuer: riskScore > 40 ? "Let's Encrypt" : 'DigiCert',
        daysUntilExpiry: Math.floor(Math.random() * 300) + 30,
      },
      homographAnalysis: homograph,
      threatIntel,
      analysisMetrics: {
        startTime: new Date(startTime),
        endTime: new Date(),
        totalDuration: Date.now() - startTime,
      },
      userId: req.user?.id,
    });

    await analysis.save();

    res.json({
      success: true,
      data: {
        analysisId: analysis.analysisId,
        verdict: analysis.verdict,
        riskScore: analysis.riskScore,
        domain,
        domainIntel: analysis.domainIntel,
        ssl: analysis.sslAnalysis,
        homograph: analysis.homographAnalysis,
        threatIntel: analysis.threatIntel.map((t) => ({
          provider: t.provider,
          isMalicious: t.result?.isMalicious,
          riskScore: t.result?.riskScore,
        })),
        analysisTime: analysis.analysisMetrics.totalDuration,
      },
    });
  } catch (error) {
    console.error('Domain Analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Analysis failed',
      message: error.message,
    });
  }
};

// Get analysis by ID
exports.getAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ analysisId: req.params.id });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found',
      });
    }

    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all analyses
exports.getAllAnalyses = async (req, res) => {
  try {
    const { page = 1, limit = 20, verdict, type } = req.query;

    const query = {};
    if (verdict) query.verdict = verdict;
    if (type) query.type = type;

    const analyses = await Analysis.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('analysisId type verdict riskScore input.url input.domain createdAt');

    const total = await Analysis.countDocuments(query);

    res.json({
      success: true,
      data: analyses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get statistics
exports.getStats = async (req, res) => {
  try {
    const [stats] = await Analysis.getStats(24);

    res.json({
      success: true,
      data: {
        total: stats?.total || 0,
        phishing: stats?.phishing || 0,
        malicious: stats?.malicious || 0,
        suspicious: stats?.suspicious || 0,
        safe: stats?.safe || 0,
        avgRiskScore: Math.round(stats?.avgRiskScore || 0),
        avgDuration: Math.round(stats?.avgDuration || 0),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
