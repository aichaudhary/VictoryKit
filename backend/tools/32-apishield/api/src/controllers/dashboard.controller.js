const { APIScan, APIVulnerability, APIEndpoint, APISpec } = require('../models');

// Get dashboard overview
exports.getDashboard = async (req, res) => {
  try {
    // Recent scans
    const recentScans = await APIScan.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name status targetUrl results createdAt');

    // Vulnerability counts
    const vulnCounts = await APIVulnerability.aggregate([
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);

    const vulnerabilities = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
    vulnCounts.forEach(v => { vulnerabilities[v._id] = v.count; });

    // Endpoint counts
    const totalEndpoints = await APIEndpoint.countDocuments();
    const vulnerableEndpoints = await APIEndpoint.countDocuments({ vulnerabilityCount: { $gt: 0 } });

    // API specs count
    const totalSpecs = await APISpec.countDocuments();

    // Top vulnerability types
    const topVulnTypes = await APIVulnerability.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // OWASP coverage from latest scan
    const latestCompletedScan = await APIScan.findOne({ status: 'completed' })
      .sort({ completedAt: -1 });

    // Overall security score (average of recent scans)
    const avgScoreResult = await APIScan.aggregate([
      { $match: { status: 'completed', 'results.securityScore': { $exists: true } } },
      { $sort: { completedAt: -1 } },
      { $limit: 10 },
      { $group: { _id: null, avgScore: { $avg: '$results.securityScore' } } }
    ]);

    const overallSecurityScore = avgScoreResult[0]?.avgScore || null;

    // Open vulnerabilities count
    const openVulns = await APIVulnerability.countDocuments({ status: 'open' });
    const fixedVulns = await APIVulnerability.countDocuments({ status: 'fixed' });

    res.json({
      success: true,
      data: {
        overview: {
          totalEndpoints,
          vulnerableEndpoints,
          totalSpecs,
          openVulnerabilities: openVulns,
          fixedVulnerabilities: fixedVulns,
          overallSecurityScore: overallSecurityScore ? Math.round(overallSecurityScore) : null
        },
        vulnerabilities,
        topVulnTypes: topVulnTypes.map(t => ({
          type: t._id,
          count: t.count
        })),
        recentScans,
        owaspCoverage: latestCompletedScan?.results?.owaspCoverage || []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get security trends
exports.getTrends = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Vulnerability trend by day
    const vulnTrend = await APIVulnerability.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            severity: '$severity'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Scan trend
    const scanTrend = await APIScan.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          avgScore: { $avg: '$results.securityScore' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fixed vs new vulnerabilities trend
    const fixTrend = await APIVulnerability.aggregate([
      {
        $match: {
          $or: [
            { createdAt: { $gte: startDate } },
            { fixedAt: { $gte: startDate } }
          ]
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          newVulns: { $sum: 1 },
          fixed: {
            $sum: { $cond: [{ $ne: ['$fixedAt', null] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        vulnerabilityTrend: vulnTrend,
        scanTrend,
        fixTrend,
        period: `${days} days`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Export report
exports.exportReport = async (req, res) => {
  try {
    const { scanId, format = 'json' } = req.query;

    let data = {};

    if (scanId) {
      const scan = await APIScan.findById(scanId);
      const vulnerabilities = await APIVulnerability.find({ scanId });
      data = { scan, vulnerabilities };
    } else {
      // Export all recent data
      const recentScans = await APIScan.find().sort({ createdAt: -1 }).limit(10);
      const vulnerabilities = await APIVulnerability.find().sort({ createdAt: -1 }).limit(100);
      const endpoints = await APIEndpoint.find().limit(100);
      data = { scans: recentScans, vulnerabilities, endpoints };
    }

    if (format === 'json') {
      res.json({
        success: true,
        data,
        exportedAt: new Date().toISOString()
      });
    } else {
      // For CSV/PDF, would generate appropriate format
      res.json({
        success: true,
        message: `Export in ${format} format - implementation pending`,
        data
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
