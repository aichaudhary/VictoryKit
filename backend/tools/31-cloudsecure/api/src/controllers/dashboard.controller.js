const { SecurityScan, SecurityFinding, CloudResource, AttackPath } = require('../models');

/**
 * Get dashboard overview
 */
exports.getDashboard = async (req, res) => {
  try {
    // Security Score
    const latestScan = await SecurityScan.findOne({ status: 'completed' })
      .sort({ completedAt: -1 });

    // Resource counts
    const totalResources = await CloudResource.countDocuments();
    const resourcesByProvider = await CloudResource.aggregate([
      { $group: { _id: '$provider', count: { $sum: 1 } } }
    ]);

    // Finding counts
    const openFindings = await SecurityFinding.countDocuments({ status: 'open' });
    const findingsBySeverity = await SecurityFinding.aggregate([
      { $match: { status: 'open' } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    // Attack paths
    const activeAttackPaths = await AttackPath.countDocuments({ status: 'active' });
    const criticalPaths = await AttackPath.countDocuments({ 
      status: 'active', 
      riskLevel: 'critical' 
    });

    // Recent activity
    const recentScans = await SecurityScan.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('scanId scanType status startedAt completedAt results.totalFindings');

    const recentFindings = await SecurityFinding.find({ status: 'open' })
      .sort({ firstSeenAt: -1 })
      .limit(10)
      .select('findingId title severity provider resourceName');

    // Trend data (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const findingsTrend = await SecurityFinding.aggregate([
      { $match: { firstSeenAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$firstSeenAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        securityScore: {
          current: latestScan?.securityScore?.overall || 0,
          trend: latestScan?.securityScore?.trend || 'stable',
          lastScan: latestScan?.completedAt
        },
        resources: {
          total: totalResources,
          byProvider: resourcesByProvider.reduce((acc, p) => ({ ...acc, [p._id]: p.count }), {})
        },
        findings: {
          total: openFindings,
          bySeverity: findingsBySeverity.reduce((acc, f) => ({ ...acc, [f._id]: f.count }), {})
        },
        attackPaths: {
          active: activeAttackPaths,
          critical: criticalPaths
        },
        recentScans,
        recentFindings,
        findingsTrend
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard data',
      details: error.message
    });
  }
};

/**
 * Get security posture score breakdown
 */
exports.getSecurityPosture = async (req, res) => {
  try {
    // Calculate scores by category
    const categories = [
      'identity-access',
      'data-protection',
      'network-security',
      'logging-monitoring',
      'encryption',
      'compliance'
    ];

    const categoryScores = await Promise.all(
      categories.map(async (category) => {
        const findings = await SecurityFinding.countDocuments({
          category,
          status: 'open'
        });
        // Simple scoring: fewer findings = higher score
        const score = Math.max(0, 100 - (findings * 5));
        return { category, score, findings };
      })
    );

    // Provider scores
    const providers = ['aws', 'azure', 'gcp'];
    const providerScores = await Promise.all(
      providers.map(async (provider) => {
        const resources = await CloudResource.countDocuments({ provider });
        const avgScore = await CloudResource.aggregate([
          { $match: { provider } },
          { $group: { _id: null, avgScore: { $avg: '$securityScore' } } }
        ]);
        return {
          provider,
          resources,
          score: Math.round(avgScore[0]?.avgScore || 100)
        };
      })
    );

    // Overall score
    const overallScore = Math.round(
      categoryScores.reduce((sum, c) => sum + c.score, 0) / categories.length
    );

    res.json({
      success: true,
      data: {
        overallScore,
        categoryScores,
        providerScores,
        recommendations: generateRecommendations(categoryScores)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get security posture',
      details: error.message
    });
  }
};

function generateRecommendations(categoryScores) {
  const recommendations = [];
  
  categoryScores
    .filter(c => c.score < 80)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .forEach(c => {
      recommendations.push({
        category: c.category,
        priority: c.score < 50 ? 'high' : 'medium',
        message: `Improve ${c.category.replace('-', ' ')} - ${c.findings} open findings`,
        expectedImprovement: Math.min(20, c.findings * 2)
      });
    });

  return recommendations;
}

/**
 * Get quick stats
 */
exports.getQuickStats = async (req, res) => {
  try {
    const [
      resources,
      criticalFindings,
      highFindings,
      attackPaths,
      lastScan
    ] = await Promise.all([
      CloudResource.countDocuments(),
      SecurityFinding.countDocuments({ severity: 'critical', status: 'open' }),
      SecurityFinding.countDocuments({ severity: 'high', status: 'open' }),
      AttackPath.countDocuments({ status: 'active' }),
      SecurityScan.findOne({ status: 'completed' }).sort({ completedAt: -1 })
    ]);

    res.json({
      success: true,
      data: {
        resources,
        criticalFindings,
        highFindings,
        attackPaths,
        securityScore: lastScan?.securityScore?.overall || 0,
        lastScanTime: lastScan?.completedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get quick stats',
      details: error.message
    });
  }
};
