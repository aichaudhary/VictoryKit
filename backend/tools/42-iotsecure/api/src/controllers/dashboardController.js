/**
 * Dashboard Controller
 * Handles dashboard analytics and real-time metrics
 */

const { Device, Alert, Vulnerability, Scan, Baseline, Segment, Firmware } = require('../models');

/**
 * Get dashboard overview
 */
exports.getOverview = async (req, res) => {
  try {
    const [
      deviceStats,
      alertStats,
      vulnerabilityStats,
      scanStats,
      baselineStats,
      segmentStats,
      firmwareStats
    ] = await Promise.all([
      Device.getStats(),
      Alert.getStats(),
      Vulnerability.getStats(),
      Scan.getStats(),
      Baseline.getStats(),
      Segment.getStats(),
      Firmware.getStats()
    ]);
    
    const overview = {
      devices: deviceStats,
      alerts: alertStats,
      vulnerabilities: vulnerabilityStats,
      scans: scanStats,
      baselines: baselineStats,
      segments: segmentStats,
      firmware: firmwareStats,
      timestamp: new Date()
    };
    
    res.json({ success: true, data: overview });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get device dashboard
 */
exports.getDeviceDashboard = async (req, res) => {
  try {
    const [
      totalDevices,
      devicesByType,
      devicesByStatus,
      highRiskDevices,
      offlineDevices,
      recentDevices
    ] = await Promise.all([
      Device.countDocuments(),
      Device.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
      Device.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Device.getHighRisk(),
      Device.getOffline(),
      Device.find().sort({ createdAt: -1 }).limit(10)
    ]);
    
    res.json({
      success: true,
      data: {
        total: totalDevices,
        byType: devicesByType.reduce((acc, t) => ({ ...acc, [t._id]: t.count }), {}),
        byStatus: devicesByStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
        highRisk: highRiskDevices,
        offline: offlineDevices,
        recent: recentDevices
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get security dashboard
 */
exports.getSecurityDashboard = async (req, res) => {
  try {
    const [
      activeAlerts,
      criticalAlerts,
      openVulnerabilities,
      exploitableVulns,
      recentScans,
      baselineAnomalies
    ] = await Promise.all([
      Alert.getActive(),
      Alert.getCritical(),
      Vulnerability.getOpen(),
      Vulnerability.getExploitable(),
      Scan.getRecent(5),
      Baseline.getAnomalies()
    ]);
    
    res.json({
      success: true,
      data: {
        alerts: {
          active: activeAlerts.length,
          critical: criticalAlerts.length,
          recent: activeAlerts.slice(0, 10)
        },
        vulnerabilities: {
          open: openVulnerabilities.length,
          exploitable: exploitableVulns.length,
          critical: openVulnerabilities.filter(v => v.severity === 'critical').length
        },
        scans: recentScans,
        anomalies: baselineAnomalies.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get network dashboard
 */
exports.getNetworkDashboard = async (req, res) => {
  try {
    const [
      segments,
      segmentTraffic,
      firewallRules,
      accessPolicies
    ] = await Promise.all([
      Segment.find().select('name type securityLevel status devices'),
      Segment.getTrafficStats(),
      Segment.aggregate([
        { $unwind: '$firewallRules' },
        { $group: { _id: '$firewallRules.action', count: { $sum: 1 } } }
      ]),
      Segment.aggregate([
        { $unwind: '$accessPolicies' },
        { $group: { _id: '$accessPolicies.effect', count: { $sum: 1 } } }
      ])
    ]);
    
    res.json({
      success: true,
      data: {
        segments: segments.length,
        segmentDetails: segments,
        traffic: segmentTraffic,
        firewallRules: firewallRules.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}),
        accessPolicies: accessPolicies.reduce((acc, p) => ({ ...acc, [p._id]: p.count }), {})
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get firmware dashboard
 */
exports.getFirmwareDashboard = async (req, res) => {
  try {
    const [
      totalFirmware,
      vulnerableFirmware,
      pendingApprovals,
      recentUploads,
      deploymentStats
    ] = await Promise.all([
      Firmware.countDocuments(),
      Firmware.getVulnerable(),
      Firmware.find({ status: 'pending_approval' }),
      Firmware.find().sort({ createdAt: -1 }).limit(5),
      Firmware.getDeploymentStats()
    ]);
    
    res.json({
      success: true,
      data: {
        total: totalFirmware,
        vulnerable: vulnerableFirmware.length,
        pendingApprovals: pendingApprovals.length,
        recentUploads,
        deployments: deploymentStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get compliance dashboard
 */
exports.getComplianceDashboard = async (req, res) => {
  try {
    const [
      complianceScore,
      complianceByCategory,
      nonCompliantDevices,
      complianceTrends
    ] = await Promise.all([
      Device.getComplianceScore(),
      Device.getComplianceByCategory(),
      Device.getNonCompliant(),
      Device.getComplianceTrends()
    ]);
    
    res.json({
      success: true,
      data: {
        overallScore: complianceScore,
        byCategory: complianceByCategory,
        nonCompliantDevices: nonCompliantDevices.length,
        trends: complianceTrends
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get real-time metrics
 */
exports.getRealTimeMetrics = async (req, res) => {
  try {
    const [
      activeScans,
      activeAlerts,
      recentActivity,
      systemHealth
    ] = await Promise.all([
      Scan.countDocuments({ status: 'running' }),
      Alert.countDocuments({ status: 'active' }),
      Device.getRecentActivity(),
      Device.getSystemHealth()
    ]);
    
    res.json({
      success: true,
      data: {
        activeScans,
        activeAlerts,
        recentActivity,
        systemHealth,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get alerts timeline
 */
exports.getAlertsTimeline = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const timeline = await Alert.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          bySeverity: {
            $push: '$severity'
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    res.json({ success: true, data: timeline });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get vulnerability trends
 */
exports.getVulnerabilityTrends = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const trends = await Vulnerability.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          new: { $sum: 1 },
          bySeverity: {
            $push: '$severity'
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    res.json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get device activity heatmap
 */
exports.getDeviceActivityHeatmap = async (req, res) => {
  try {
    const heatmap = await Device.aggregate([
      {
        $group: {
          _id: {
            hour: { $hour: '$lastSeen' },
            day: { $dayOfWeek: '$lastSeen' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.day': 1, '_id.hour': 1 } }
    ]);
    
    res.json({ success: true, data: heatmap });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get risk score distribution
 */
exports.getRiskScoreDistribution = async (req, res) => {
  try {
    const distribution = await Device.aggregate([
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lte: ['$riskScore', 25] }, then: 'low' },
                { case: { $lte: ['$riskScore', 50] }, then: 'medium' },
                { case: { $lte: ['$riskScore', 75] }, then: 'high' }
              ],
              default: 'critical'
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({ success: true, data: distribution });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get top vulnerable devices
 */
exports.getTopVulnerableDevices = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const devices = await Device.aggregate([
      {
        $lookup: {
          from: 'vulnerabilities',
          localField: '_id',
          foreignField: 'affectedDevices.deviceId',
          as: 'vulnerabilities'
        }
      },
      {
        $addFields: {
          vulnCount: { $size: '$vulnerabilities' },
          criticalVulns: {
            $size: {
              $filter: {
                input: '$vulnerabilities',
                cond: { $eq: ['$$this.severity', 'critical'] }
              }
            }
          }
        }
      },
      { $sort: { vulnCount: -1, criticalVulns: -1 } },
      { $limit: limit },
      { $project: { vulnerabilities: 0 } }
    ]);
    
    res.json({ success: true, data: devices });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get scan coverage
 */
exports.getScanCoverage = async (req, res) => {
  try {
    const [
      totalDevices,
      scannedDevices,
      lastScanDates
    ] = await Promise.all([
      Device.countDocuments(),
      Device.countDocuments({ lastScanned: { $exists: true } }),
      Device.aggregate([
        {
          $match: { lastScanned: { $exists: true } }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$lastScanned' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': -1 } },
        { $limit: 30 }
      ])
    ]);
    
    const coverage = {
      totalDevices,
      scannedDevices,
      coveragePercentage: totalDevices > 0 ? (scannedDevices / totalDevices) * 100 : 0,
      lastScanDates
    };
    
    res.json({ success: true, data: coverage });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get system performance metrics
 */
exports.getSystemPerformance = async (req, res) => {
  try {
    const performance = await Device.aggregate([
      {
        $group: {
          _id: null,
          avgCpuUsage: { $avg: '$performance.cpuUsage' },
          avgMemoryUsage: { $avg: '$performance.memoryUsage' },
          avgNetworkUsage: { $avg: '$performance.networkUsage' },
          totalDevices: { $sum: 1 }
        }
      }
    ]);
    
    res.json({ success: true, data: performance[0] || {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Export dashboard data
 */
exports.exportDashboardData = async (req, res) => {
  try {
    const overview = await this.getOverview({ query: {} }, { json: (data) => data });
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=dashboard-export.json');
    res.json(overview);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
