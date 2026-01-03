const express = require('express');
const dnsShieldService = require('../services/dnsShieldService');
const { DNSQuery, DomainAnalysis, DNSPolicy, DNSMonitoring, DNSAlert, DNSReport, DNSStats } = require('../models');
const { authenticateToken, requireRole } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for DNS analysis endpoints
const dnsAnalysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many DNS analysis requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply authentication to all routes
router.use(authenticateToken);

// DNS Query Analysis Endpoint
router.post('/analyze', dnsAnalysisLimiter, async (req, res) => {
  try {
    const { domain, queryType = 'A', sourceIP, userAgent } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain is required'
      });
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!domainRegex.test(domain)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid domain format'
      });
    }

    const analysisResult = await dnsShieldService.analyzeDNSQuery({
      domain,
      queryType,
      sourceIP: sourceIP || req.ip,
      userAgent: userAgent || req.get('User-Agent')
    });

    res.json({
      success: true,
      data: analysisResult
    });

  } catch (error) {
    console.error('DNS analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'DNS analysis failed',
      details: error.message
    });
  }
});

// Domain Reputation Check
router.get('/domain/:domain/reputation', dnsAnalysisLimiter, async (req, res) => {
  try {
    const { domain } = req.params;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain is required'
      });
    }

    const threatAnalysis = await dnsShieldService.performThreatAnalysis(domain);

    res.json({
      success: true,
      data: {
        domain,
        reputation: threatAnalysis.reputation,
        threatLevel: threatAnalysis.threatLevel,
        riskScore: threatAnalysis.riskScore,
        categories: threatAnalysis.categories,
        analysisSources: threatAnalysis.analysisSources,
        maliciousIndicators: threatAnalysis.maliciousIndicators
      }
    });

  } catch (error) {
    console.error('Domain reputation check error:', error);
    res.status(500).json({
      success: false,
      error: 'Domain reputation check failed',
      details: error.message
    });
  }
});

// DNS Statistics
router.get('/stats', requireRole(['admin', 'analyst']), async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;

    const stats = await dnsShieldService.getDNSStats(timeRange);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('DNS stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve DNS statistics',
      details: error.message
    });
  }
});

// Top Threats
router.get('/threats/top', requireRole(['admin', 'analyst']), async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topThreats = await dnsShieldService.getTopThreats(parseInt(limit));

    res.json({
      success: true,
      data: topThreats
    });

  } catch (error) {
    console.error('Top threats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve top threats',
      details: error.message
    });
  }
});

// DNS Query History
router.get('/queries', requireRole(['admin', 'analyst']), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      domain,
      threatLevel,
      blocked,
      sourceIP,
      startDate,
      endDate
    } = req.query;

    const query = {};

    if (domain) query.domain = new RegExp(domain, 'i');
    if (threatLevel) query.threatLevel = threatLevel;
    if (blocked !== undefined) query.blocked = blocked === 'true';
    if (sourceIP) query.sourceIP = sourceIP;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { timestamp: -1 }
    };

    const result = await DNSQuery.paginate(query, options);

    res.json({
      success: true,
      data: result.docs,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        totalDocs: result.totalDocs,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage
      }
    });

  } catch (error) {
    console.error('DNS queries error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve DNS queries',
      details: error.message
    });
  }
});

// DNS Policies Management
router.get('/policies', requireRole(['admin']), async (req, res) => {
  try {
    const policies = await DNSPolicy.find().sort({ priority: -1 });

    res.json({
      success: true,
      data: policies
    });

  } catch (error) {
    console.error('Policies retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve DNS policies',
      details: error.message
    });
  }
});

router.post('/policies', requireRole(['admin']), async (req, res) => {
  try {
    const policyData = req.body;

    // Validate required fields
    if (!policyData.policyId || !policyData.name || !policyData.type) {
      return res.status(400).json({
        success: false,
        error: 'Policy ID, name, and type are required'
      });
    }

    const policy = new DNSPolicy({
      ...policyData,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    await policy.save();

    res.status(201).json({
      success: true,
      data: policy
    });

  } catch (error) {
    console.error('Policy creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create DNS policy',
      details: error.message
    });
  }
});

router.put('/policies/:policyId', requireRole(['admin']), async (req, res) => {
  try {
    const { policyId } = req.params;
    const updateData = req.body;

    const policy = await DNSPolicy.findOneAndUpdate(
      { policyId },
      {
        ...updateData,
        updatedBy: req.user.id,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!policy) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found'
      });
    }

    res.json({
      success: true,
      data: policy
    });

  } catch (error) {
    console.error('Policy update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update DNS policy',
      details: error.message
    });
  }
});

router.delete('/policies/:policyId', requireRole(['admin']), async (req, res) => {
  try {
    const { policyId } = req.params;

    const policy = await DNSPolicy.findOneAndDelete({ policyId });

    if (!policy) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found'
      });
    }

    res.json({
      success: true,
      message: 'Policy deleted successfully'
    });

  } catch (error) {
    console.error('Policy deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete DNS policy',
      details: error.message
    });
  }
});

// DNS Alerts Management
router.get('/alerts', requireRole(['admin', 'analyst']), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      severity,
      status = 'active',
      startDate,
      endDate
    } = req.query;

    const query = { status };

    if (severity) query.severity = severity;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };

    const result = await DNSAlert.paginate(query, options);

    res.json({
      success: true,
      data: result.docs,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        totalDocs: result.totalDocs,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage
      }
    });

  } catch (error) {
    console.error('Alerts retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve DNS alerts',
      details: error.message
    });
  }
});

router.post('/alerts', requireRole(['admin', 'analyst']), async (req, res) => {
  try {
    const alertData = req.body;

    // Validate required fields
    if (!alertData.title || !alertData.severity) {
      return res.status(400).json({
        success: false,
        error: 'Alert title and severity are required'
      });
    }

    const alert = await dnsShieldService.createAlert({
      ...alertData,
      createdBy: req.user.id,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      data: alert
    });

  } catch (error) {
    console.error('Alert creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create DNS alert',
      details: error.message
    });
  }
});

router.put('/alerts/:alertId/status', requireRole(['admin', 'analyst']), async (req, res) => {
  try {
    const { alertId } = req.params;
    const { status, resolution } = req.body;

    const updateData = {
      status,
      updatedBy: req.user.id,
      updatedAt: new Date()
    };

    if (status === 'resolved' && resolution) {
      updateData.resolution = resolution;
      updateData.resolvedAt = new Date();
    }

    const alert = await DNSAlert.findByIdAndUpdate(alertId, updateData, { new: true });

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    res.json({
      success: true,
      data: alert
    });

  } catch (error) {
    console.error('Alert status update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update alert status',
      details: error.message
    });
  }
});

// DNS Reports
router.get('/reports', requireRole(['admin', 'analyst']), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      startDate,
      endDate
    } = req.query;

    const query = {};

    if (type) query.reportType = type;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };

    const result = await DNSReport.paginate(query, options);

    res.json({
      success: true,
      data: result.docs,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        totalDocs: result.totalDocs,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage
      }
    });

  } catch (error) {
    console.error('Reports retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve DNS reports',
      details: error.message
    });
  }
});

router.post('/reports/generate', requireRole(['admin', 'analyst']), async (req, res) => {
  try {
    const { reportType, parameters } = req.body;

    if (!reportType) {
      return res.status(400).json({
        success: false,
        error: 'Report type is required'
      });
    }

    // Generate report based on type
    let reportData;

    switch (reportType) {
      case 'threat_summary':
        reportData = await generateThreatSummaryReport(parameters);
        break;
      case 'traffic_analysis':
        reportData = await generateTrafficAnalysisReport(parameters);
        break;
      case 'policy_effectiveness':
        reportData = await generatePolicyEffectivenessReport(parameters);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid report type'
        });
    }

    const report = new DNSReport({
      reportType,
      title: reportData.title,
      summary: reportData.summary,
      data: reportData.data,
      parameters,
      generatedBy: req.user.id,
      status: 'completed'
    });

    await report.save();

    res.status(201).json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate DNS report',
      details: error.message
    });
  }
});

// ML Analysis Integration
router.post('/ml/analyze', requireRole(['admin', 'analyst']), async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Analysis data is required'
      });
    }

    const analysisResult = await dnsShieldService.analyze(data);

    res.json({
      success: true,
      data: analysisResult
    });

  } catch (error) {
    console.error('ML analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'ML analysis failed',
      details: error.message
    });
  }
});

// Security Stack Integration
router.post('/integrate/security-stack', requireRole(['admin']), async (req, res) => {
  try {
    const { entityId, data } = req.body;

    if (!entityId || !data) {
      return res.status(400).json({
        success: false,
        error: 'Entity ID and data are required'
      });
    }

    const integrationResult = await dnsShieldService.integrateWithSecurityStack(entityId, data);

    res.json({
      success: true,
      data: integrationResult
    });

  } catch (error) {
    console.error('Security stack integration error:', error);
    res.status(500).json({
      success: false,
      error: 'Security stack integration failed',
      details: error.message
    });
  }
});

// Advanced DNS Tunneling Detection
router.post('/detect-tunneling', requireRole(['admin', 'analyst']), async (req, res) => {
  try {
    const { domain, queryType, responseData } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain is required'
      });
    }

    const tunnelingResult = await dnsShieldService.detectDNSTunneling(domain, queryType, responseData);

    res.json({
      success: true,
      data: tunnelingResult
    });

  } catch (error) {
    console.error('DNS tunneling detection error:', error);
    res.status(500).json({
      success: false,
      error: 'DNS tunneling detection failed',
      details: error.message
    });
  }
});

// Advanced Threat Analysis
router.post('/analyze/advanced', requireRole(['admin', 'analyst']), async (req, res) => {
  try {
    const { domain, queryData } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain is required'
      });
    }

    const analysisResult = await dnsShieldService.performAdvancedThreatAnalysis(domain, queryData);

    res.json({
      success: true,
      data: analysisResult
    });

  } catch (error) {
    console.error('Advanced threat analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Advanced threat analysis failed',
      details: error.message
    });
  }
});

// Real-time DNS Monitoring Control
router.post('/monitoring/start', requireRole(['admin']), async (req, res) => {
  try {
    await dnsShieldService.startRealTimeMonitoring();

    res.json({
      success: true,
      message: 'Real-time DNS monitoring started successfully'
    });

  } catch (error) {
    console.error('Start monitoring error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start real-time monitoring',
      details: error.message
    });
  }
});

// Domain Entropy Analysis
router.get('/domain/:domain/entropy', dnsAnalysisLimiter, async (req, res) => {
  try {
    const { domain } = req.params;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain is required'
      });
    }

    // Calculate domain entropy using service method
    const entropy = dnsShieldService.calculateDomainEntropy(domain);
    const subdomains = domain.split('.');
    const subdomainDepth = subdomains.length - 2;

    res.json({
      success: true,
      data: {
        domain,
        entropy,
        subdomainDepth,
        entropyLevel: entropy > 4.5 ? 'high' : entropy > 4.0 ? 'medium' : 'low',
        analysis: {
          isRandomLike: entropy > 4.0,
          potentialDGA: entropy > 4.2
        }
      }
    });

  } catch (error) {
    console.error('Domain entropy analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Domain entropy analysis failed',
      details: error.message
    });
  }
});

// Threat Intelligence Feeds Status
router.get('/threat-feeds/status', requireRole(['admin', 'analyst']), async (req, res) => {
  try {
    const feedStatus = {
      virusTotal: { status: 'active', lastUpdate: new Date() },
      abuseIPDB: { status: 'active', lastUpdate: new Date() },
      alienVaultOTX: { status: 'active', lastUpdate: new Date() },
      ibmXForce: { status: 'active', lastUpdate: new Date() },
      googleSafeBrowsing: { status: 'active', lastUpdate: new Date() }
    };

    res.json({
      success: true,
      data: feedStatus
    });

  } catch (error) {
    console.error('Threat feeds status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve threat feeds status',
      details: error.message
    });
  }
});

// DNS Query Pattern Analysis
router.get('/patterns/:domain', requireRole(['admin', 'analyst']), async (req, res) => {
  try {
    const { domain } = req.params;
    const { hours = 24 } = req.query;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain is required'
      });
    }

    const startTime = new Date(Date.now() - (hours * 60 * 60 * 1000));

    const patterns = await DNSQuery.aggregate([
      {
        $match: {
          domain: domain,
          timestamp: { $gte: startTime }
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: '$timestamp' },
            queryType: '$queryType'
          },
          count: { $sum: 1 },
          uniqueIPs: { $addToSet: '$sourceIP' },
          avgResponseTime: { $avg: '$responseTime' }
        }
      },
      {
        $group: {
          _id: '$_id.hour',
          queryTypes: {
            $push: {
              type: '$_id.queryType',
              count: '$count',
              uniqueIPs: { $size: '$uniqueIPs' },
              avgResponseTime: { $round: ['$avgResponseTime', 2] }
            }
          },
          totalQueries: { $sum: '$count' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        domain,
        timeRange: `${hours} hours`,
        patterns: patterns
      }
    });

  } catch (error) {
    console.error('Query pattern analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Query pattern analysis failed',
      details: error.message
    });
  }
});

// Bulk Domain Analysis
router.post('/analyze/bulk', requireRole(['admin', 'analyst']), dnsAnalysisLimiter, async (req, res) => {
  try {
    const { domains, analysisType = 'basic' } = req.body;

    if (!Array.isArray(domains) || domains.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Domains array is required and cannot be empty'
      });
    }

    if (domains.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 100 domains allowed per request'
      });
    }

    const analysisPromises = domains.map(async (domain) => {
      try {
        let result;

        switch (analysisType) {
          case 'advanced':
            result = await dnsShieldService.performAdvancedThreatAnalysis(domain, {});
            break;
          case 'tunneling':
            result = await dnsShieldService.detectDNSTunneling(domain, 'A', {});
            break;
          default:
            result = await dnsShieldService.performThreatAnalysis(domain);
        }

        return {
          domain,
          success: true,
          data: result
        };
      } catch (error) {
        return {
          domain,
          success: false,
          error: error.message
        };
      }
    });

    const results = await Promise.allSettled(analysisPromises);
    const analysisResults = results.map(result =>
      result.status === 'fulfilled' ? result.value : {
        domain: 'unknown',
        success: false,
        error: 'Analysis promise failed'
      }
    );

    res.json({
      success: true,
      data: {
        analysisType,
        totalDomains: domains.length,
        results: analysisResults,
        summary: {
          successful: analysisResults.filter(r => r.success).length,
          failed: analysisResults.filter(r => !r.success).length
        }
      }
    });

  } catch (error) {
    console.error('Bulk domain analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Bulk domain analysis failed',
      details: error.message
    });
  }
});

// Performance Metrics
router.get('/performance/metrics', requireRole(['admin']), async (req, res) => {
  try {
    const { timeRange = '1h' } = req.query;

    // Get performance metrics from service
    const metrics = await dnsShieldService.getPerformanceMetrics(timeRange);

    res.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve performance metrics',
      details: error.message
    });
  }
});

// Helper functions for report generation
async function generateThreatSummaryReport(parameters = {}) {
  const { timeRange = '7d' } = parameters;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(timeRange));

  const threatStats = await DNSQuery.aggregate([
    { $match: { timestamp: { $gte: startDate }, threatLevel: { $in: ['suspicious', 'malicious'] } } },
    {
      $group: {
        _id: '$threatLevel',
        count: { $sum: 1 },
        domains: { $addToSet: '$domain' }
      }
    }
  ]);

  return {
    title: `DNS Threat Summary Report - Last ${timeRange}`,
    summary: `Analysis of DNS threats detected in the last ${timeRange}`,
    data: {
      threatBreakdown: threatStats,
      totalThreats: threatStats.reduce((sum, stat) => sum + stat.count, 0),
      uniqueDomains: [...new Set(threatStats.flatMap(stat => stat.domains))].length
    }
  };
}

async function generateTrafficAnalysisReport(parameters = {}) {
  const { timeRange = '24h' } = parameters;
  const startDate = new Date();
  startDate.setHours(startDate.getHours() - parseInt(timeRange));

  const trafficStats = await DNSQuery.aggregate([
    { $match: { timestamp: { $gte: startDate } } },
    {
      $group: {
        _id: {
          hour: { $hour: '$timestamp' },
          blocked: '$blocked'
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.hour': 1 } }
  ]);

  return {
    title: `DNS Traffic Analysis Report - Last ${timeRange}`,
    summary: `Analysis of DNS traffic patterns in the last ${timeRange}`,
    data: {
      hourlyTraffic: trafficStats,
      totalQueries: trafficStats.reduce((sum, stat) => sum + stat.count, 0)
    }
  };
}

async function generatePolicyEffectivenessReport(parameters = {}) {
  const policies = await DNSPolicy.find({ enabled: true });

  const policyStats = await Promise.all(
    policies.map(async (policy) => {
      const matches = await DNSQuery.countDocuments({
        'policyMatches.policyId': policy.policyId,
        timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      });

      return {
        policyId: policy.policyId,
        name: policy.name,
        matches,
        effectiveness: matches > 0 ? 'effective' : 'no_matches'
      };
    })
  );

  return {
    title: 'DNS Policy Effectiveness Report',
    summary: 'Analysis of DNS policy effectiveness over the last 7 days',
    data: {
      policies: policyStats,
      totalPolicies: policies.length,
      effectivePolicies: policyStats.filter(p => p.effectiveness === 'effective').length
    }
  };
}

module.exports = router;