/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎣 PHISHNETAI - DOMAIN CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════════
 * Handles domain intelligence and reputation operations
 */

const { Domain } = require('../models');

// Get domain info
exports.getDomain = async (req, res) => {
  try {
    const { domain } = req.params;

    const domainInfo = await Domain.findOne({
      domain: domain.toLowerCase(),
    });

    if (!domainInfo) {
      return res.status(404).json({
        success: false,
        error: 'Domain not found in database',
      });
    }

    res.json({
      success: true,
      data: domainInfo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all domains
exports.getAllDomains = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      category,
      minScore,
      maxScore,
      sort = '-history.lastSeen',
    } = req.query;

    const query = {};

    if (category) {
      query['reputation.category'] = category;
    }

    if (minScore || maxScore) {
      query['reputation.score'] = {};
      if (minScore) query['reputation.score'].$gte = parseInt(minScore);
      if (maxScore) query['reputation.score'].$lte = parseInt(maxScore);
    }

    const domains = await Domain.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('domain tld reputation age history.totalScans history.lastSeen flags');

    const total = await Domain.countDocuments(query);

    res.json({
      success: true,
      data: domains,
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

// Get malicious domains
exports.getMaliciousDomains = async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const domains = await Domain.findMalicious(parseInt(limit));

    res.json({
      success: true,
      data: domains,
      count: domains.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get newly registered suspicious domains
exports.getNewSuspicious = async (req, res) => {
  try {
    const { maxAge = 30, limit = 100 } = req.query;

    const domains = await Domain.findNewSuspicious(parseInt(maxAge), parseInt(limit));

    res.json({
      success: true,
      data: domains,
      count: domains.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Report domain as phishing
exports.reportDomain = async (req, res) => {
  try {
    const { domain } = req.params;
    const { reason, evidence, reporter } = req.body;

    const domainRecord = await Domain.findOneAndUpdate(
      { domain: domain.toLowerCase() },
      {
        $set: {
          domain: domain.toLowerCase(),
          'flags.hasPhishing': true,
          'reputation.category': 'malicious',
          'reputation.score': 10,
          'reputation.lastUpdated': new Date(),
        },
        $push: {
          'history.verdictHistory': {
            verdict: 'PHISHING',
            date: new Date(),
            riskScore: 90,
          },
        },
        $setOnInsert: {
          'history.firstSeen': new Date(),
        },
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: `Domain ${domain} reported as phishing`,
      data: {
        domain: domainRecord.domain,
        reputation: domainRecord.reputation,
        flags: domainRecord.flags,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update domain reputation
exports.updateReputation = async (req, res) => {
  try {
    const { domain } = req.params;
    const { score, category } = req.body;

    if (score === undefined && !category) {
      return res.status(400).json({
        success: false,
        error: 'Score or category required',
      });
    }

    const update = {
      'reputation.lastUpdated': new Date(),
    };

    if (score !== undefined) {
      update['reputation.score'] = Math.max(0, Math.min(100, score));
    }

    if (category) {
      update['reputation.category'] = category;
    }

    const domainRecord = await Domain.findOneAndUpdate(
      { domain: domain.toLowerCase() },
      { $set: update },
      { new: true }
    );

    if (!domainRecord) {
      return res.status(404).json({
        success: false,
        error: 'Domain not found',
      });
    }

    res.json({
      success: true,
      data: {
        domain: domainRecord.domain,
        reputation: domainRecord.reputation,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Search domains
exports.searchDomains = async (req, res) => {
  try {
    const { q, page = 1, limit = 50 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters',
      });
    }

    const domains = await Domain.find({
      domain: { $regex: q, $options: 'i' },
    })
      .sort({ 'history.lastSeen': -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('domain reputation age history.totalScans flags');

    res.json({
      success: true,
      data: domains,
      query: q,
      count: domains.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get domain statistics
exports.getStats = async (req, res) => {
  try {
    const stats = await Domain.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          malicious: {
            $sum: { $cond: [{ $eq: ['$reputation.category', 'malicious'] }, 1, 0] },
          },
          suspicious: {
            $sum: { $cond: [{ $eq: ['$reputation.category', 'suspicious'] }, 1, 0] },
          },
          trusted: {
            $sum: { $cond: [{ $eq: ['$reputation.category', 'trusted'] }, 1, 0] },
          },
          withPhishing: {
            $sum: { $cond: ['$flags.hasPhishing', 1, 0] },
          },
          avgRepScore: { $avg: '$reputation.score' },
          avgAge: { $avg: '$age.days' },
        },
      },
    ]);

    const byTld = await Domain.aggregate([
      {
        $group: {
          _id: '$tld',
          count: { $sum: 1 },
          maliciousCount: {
            $sum: { $cond: [{ $eq: ['$reputation.category', 'malicious'] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {},
        topTlds: byTld,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Bulk check domains
exports.bulkCheck = async (req, res) => {
  try {
    const { domains } = req.body;

    if (!domains || !Array.isArray(domains)) {
      return res.status(400).json({
        success: false,
        error: 'Domains array required',
      });
    }

    if (domains.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 100 domains per request',
      });
    }

    const results = await Domain.find({
      domain: { $in: domains.map((d) => d.toLowerCase()) },
    }).select('domain reputation flags history.totalScans');

    // Map results back to input order
    const resultMap = new Map(results.map((r) => [r.domain, r]));

    const response = domains.map((d) => ({
      domain: d,
      found: resultMap.has(d.toLowerCase()),
      data: resultMap.get(d.toLowerCase()) || null,
    }));

    res.json({
      success: true,
      data: response,
      found: results.length,
      notFound: domains.length - results.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
