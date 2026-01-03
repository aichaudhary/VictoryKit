/**
 * Dashboard Routes - Analytics, Statistics, and Real-time Data
 */

const express = require('express');
const router = express.Router();
const { Device, Vulnerability, Scan, Alert, Baseline, Firmware, Segment } = require('../models');

// GET /dashboard/overview - Main dashboard overview
router.get('/overview', async (req, res) => {
  try {
    const [
      deviceStats,
      vulnerabilityStats,
      alertStats,
      scanStats,
      segmentStats,
      firmwareStats
    ] = await Promise.all([
      Device.getStats(),
      Vulnerability.getStats(),
      Alert.getStats(),
      Scan.getStats(),
      Segment.getStats(),
      Firmware.getStats()
    ]);
    
    // Calculate overall risk score
    const riskScore = calculateOverallRisk(deviceStats, vulnerabilityStats, alertStats);
    
    res.json({
      success: true,
      data: {
        riskScore,
        devices: deviceStats,
        vulnerabilities: vulnerabilityStats,
        alerts: alertStats,
        scans: scanStats,
        segments: segmentStats,
        firmware: firmwareStats,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /dashboard/risk-score - Get detailed risk breakdown
router.get('/risk-score', async (req, res) => {
  try {
    const [deviceStats, vulnStats, alertStats] = await Promise.all([
      Device.getStats(),
      Vulnerability.getStats(),
      Alert.getStats()
    ]);
    
    const breakdown = {
      deviceRisk: {
        score: calculateDeviceRisk(deviceStats),
        factors: {
          criticalDevices: deviceStats.byCriticality?.critical || 0,
          highRiskDevices: deviceStats.byRiskLevel?.critical || 0,
          offlineDevices: deviceStats.byStatus?.offline || 0
        }
      },
      vulnerabilityRisk: {
        score: calculateVulnRisk(vulnStats),
        factors: {
          criticalVulns: vulnStats.bySeverity?.critical || 0,
          exploitableVulns: vulnStats.exploitable || 0,
          openVulns: vulnStats.byStatus?.open || 0
        }
      },
      alertRisk: {
        score: calculateAlertRisk(alertStats),
        factors: {
          criticalAlerts: alertStats.bySeverity?.critical || 0,
          activeAlerts: alertStats.byStatus?.new + alertStats.byStatus?.acknowledged || 0
        }
      }
    };
    
    const overallScore = Math.round(
      (breakdown.deviceRisk.score * 0.3) +
      (breakdown.vulnerabilityRisk.score * 0.4) +
      (breakdown.alertRisk.score * 0.3)
    );
    
    res.json({
      success: true,
      data: {
        overallScore,
        grade: getGrade(overallScore),
        breakdown,
        recommendations: generateRecommendations(breakdown)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /dashboard/trends - Get trend data for charts
router.get('/trends', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    const periodDays = period === '30d' ? 30 : period === '24h' ? 1 : 7;
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
    
    // Aggregate alerts by day
    const alertTrends = await Alert.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: 1 },
          critical: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Aggregate scans by day
    const scanTrends = await Scan.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          devicesScanned: { $sum: '$results.devicesScanned' },
          vulnerabilitiesFound: { $sum: '$results.vulnerabilitiesFound' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Device status changes (approximation)
    const deviceTrends = await Device.aggregate([
      { $match: { lastSeen: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastSeen' } },
          activeDevices: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        period,
        alerts: alertTrends,
        scans: scanTrends,
        devices: deviceTrends
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /dashboard/activity - Get recent activity feed
router.get('/activity', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const [alerts, scans, devices] = await Promise.all([
      Alert.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .select('alertId type severity title createdAt status')
        .populate('device', 'name'),
      Scan.find()
        .sort({ createdAt: -1 })
        .limit(15)
        .select('scanId type status progress createdAt completedAt'),
      Device.find()
        .sort({ updatedAt: -1 })
        .limit(15)
        .select('deviceId name type status riskLevel updatedAt')
    ]);
    
    // Combine and sort by timestamp
    const activity = [
      ...alerts.map(a => ({
        type: 'alert',
        id: a.alertId,
        title: a.title,
        severity: a.severity,
        status: a.status,
        timestamp: a.createdAt,
        meta: { device: a.device?.name }
      })),
      ...scans.map(s => ({
        type: 'scan',
        id: s.scanId,
        title: `${s.type} Scan`,
        status: s.status,
        progress: s.progress,
        timestamp: s.createdAt
      })),
      ...devices.map(d => ({
        type: 'device',
        id: d.deviceId,
        title: d.name,
        status: d.status,
        riskLevel: d.riskLevel,
        timestamp: d.updatedAt
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
     .slice(0, parseInt(limit));
    
    res.json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /dashboard/network-map - Get network topology data
router.get('/network-map', async (req, res) => {
  try {
    const [segments, devices] = await Promise.all([
      Segment.find({ status: 'active' })
        .select('segmentId name type securityLevel network color devices')
        .populate('devices', 'deviceId name ipAddress type status riskLevel'),
      Device.find({ status: { $ne: 'decommissioned' } })
        .select('deviceId name ipAddress macAddress type status riskLevel networkSegment')
        .populate('networkSegment', 'segmentId name color')
    ]);
    
    // Build nodes and edges for visualization
    const nodes = [];
    const edges = [];
    
    // Add segment nodes
    segments.forEach(seg => {
      nodes.push({
        id: `seg_${seg._id}`,
        type: 'segment',
        label: seg.name,
        segmentType: seg.type,
        securityLevel: seg.securityLevel,
        color: seg.color,
        deviceCount: seg.devices?.length || 0
      });
    });
    
    // Add device nodes and edges
    devices.forEach(dev => {
      nodes.push({
        id: `dev_${dev._id}`,
        type: 'device',
        deviceType: dev.type,
        label: dev.name,
        ip: dev.ipAddress,
        status: dev.status,
        riskLevel: dev.riskLevel
      });
      
      if (dev.networkSegment) {
        edges.push({
          source: `seg_${dev.networkSegment._id}`,
          target: `dev_${dev._id}`,
          type: 'contains'
        });
      }
    });
    
    res.json({
      success: true,
      data: {
        nodes,
        edges,
        summary: {
          segments: segments.length,
          devices: devices.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /dashboard/top-risks - Get top risks summary
router.get('/top-risks', async (req, res) => {
  try {
    const [
      criticalDevices,
      criticalVulns,
      criticalAlerts,
      vulnerableFirmware
    ] = await Promise.all([
      Device.find({ riskLevel: 'critical' })
        .limit(10)
        .select('deviceId name type ipAddress riskScore')
        .sort({ riskScore: -1 }),
      Vulnerability.find({ status: 'open', severity: 'critical' })
        .limit(10)
        .select('cveId title severity cvssScore')
        .sort({ cvssScore: -1 }),
      Alert.find({ status: { $ne: 'resolved' }, severity: 'critical' })
        .limit(10)
        .select('alertId type title createdAt')
        .sort({ createdAt: -1 }),
      Firmware.find({ 'virusTotalAnalysis.malicious': true })
        .limit(5)
        .select('name vendor version')
    ]);
    
    res.json({
      success: true,
      data: {
        criticalDevices,
        criticalVulnerabilities: criticalVulns,
        criticalAlerts,
        maliciousFirmware: vulnerableFirmware
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /dashboard/compliance - Get compliance summary
router.get('/compliance', async (req, res) => {
  try {
    const [segmentCompliance, deviceCompliance] = await Promise.all([
      Segment.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pciCompliant: { $sum: { $cond: ['$compliance.pciDss', 1, 0] } },
            hipaaCompliant: { $sum: { $cond: ['$compliance.hipaa', 1, 0] } },
            gdprCompliant: { $sum: { $cond: ['$compliance.gdpr', 1, 0] } },
            iso27001Compliant: { $sum: { $cond: ['$compliance.iso27001', 1, 0] } }
          }
        }
      ]),
      Device.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            compliant: { $sum: { $cond: [{ $eq: ['$complianceStatus', 'compliant'] }, 1, 0] } },
            nonCompliant: { $sum: { $cond: [{ $eq: ['$complianceStatus', 'non-compliant'] }, 1, 0] } }
          }
        }
      ])
    ]);
    
    const segStats = segmentCompliance[0] || { total: 0 };
    const devStats = deviceCompliance[0] || { total: 0, compliant: 0, nonCompliant: 0 };
    
    res.json({
      success: true,
      data: {
        segments: {
          total: segStats.total,
          frameworks: {
            'PCI-DSS': { compliant: segStats.pciCompliant || 0, percentage: segStats.total ? Math.round((segStats.pciCompliant || 0) / segStats.total * 100) : 0 },
            'HIPAA': { compliant: segStats.hipaaCompliant || 0, percentage: segStats.total ? Math.round((segStats.hipaaCompliant || 0) / segStats.total * 100) : 0 },
            'GDPR': { compliant: segStats.gdprCompliant || 0, percentage: segStats.total ? Math.round((segStats.gdprCompliant || 0) / segStats.total * 100) : 0 },
            'ISO-27001': { compliant: segStats.iso27001Compliant || 0, percentage: segStats.total ? Math.round((segStats.iso27001Compliant || 0) / segStats.total * 100) : 0 }
          }
        },
        devices: {
          total: devStats.total,
          compliant: devStats.compliant,
          nonCompliant: devStats.nonCompliant,
          complianceRate: devStats.total ? Math.round(devStats.compliant / devStats.total * 100) : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper functions
function calculateOverallRisk(devices, vulns, alerts) {
  const deviceScore = calculateDeviceRisk(devices);
  const vulnScore = calculateVulnRisk(vulns);
  const alertScore = calculateAlertRisk(alerts);
  
  return Math.round((deviceScore * 0.3) + (vulnScore * 0.4) + (alertScore * 0.3));
}

function calculateDeviceRisk(stats) {
  if (!stats.total) return 0;
  const criticalWeight = (stats.byRiskLevel?.critical || 0) * 10;
  const highWeight = (stats.byRiskLevel?.high || 0) * 5;
  const mediumWeight = (stats.byRiskLevel?.medium || 0) * 2;
  const offlineWeight = (stats.byStatus?.offline || 0) * 3;
  
  return Math.min(100, Math.round((criticalWeight + highWeight + mediumWeight + offlineWeight) / stats.total * 10));
}

function calculateVulnRisk(stats) {
  if (!stats.total) return 0;
  const criticalWeight = (stats.bySeverity?.critical || 0) * 10;
  const highWeight = (stats.bySeverity?.high || 0) * 5;
  const exploitableWeight = (stats.exploitable || 0) * 8;
  
  return Math.min(100, Math.round((criticalWeight + highWeight + exploitableWeight) / stats.total * 10));
}

function calculateAlertRisk(stats) {
  if (!stats.total) return 0;
  const criticalWeight = (stats.bySeverity?.critical || 0) * 10;
  const highWeight = (stats.bySeverity?.high || 0) * 5;
  const activeWeight = ((stats.byStatus?.new || 0) + (stats.byStatus?.acknowledged || 0)) * 2;
  
  return Math.min(100, Math.round((criticalWeight + highWeight + activeWeight) / stats.total * 10));
}

function getGrade(score) {
  if (score <= 20) return 'A';
  if (score <= 40) return 'B';
  if (score <= 60) return 'C';
  if (score <= 80) return 'D';
  return 'F';
}

function generateRecommendations(breakdown) {
  const recommendations = [];
  
  if (breakdown.deviceRisk.factors.criticalDevices > 0) {
    recommendations.push({
      priority: 'high',
      category: 'devices',
      action: `Review and secure ${breakdown.deviceRisk.factors.criticalDevices} critical devices`
    });
  }
  
  if (breakdown.vulnerabilityRisk.factors.exploitableVulns > 0) {
    recommendations.push({
      priority: 'critical',
      category: 'vulnerabilities',
      action: `Patch ${breakdown.vulnerabilityRisk.factors.exploitableVulns} exploitable vulnerabilities immediately`
    });
  }
  
  if (breakdown.alertRisk.factors.criticalAlerts > 0) {
    recommendations.push({
      priority: 'critical',
      category: 'alerts',
      action: `Investigate and resolve ${breakdown.alertRisk.factors.criticalAlerts} critical alerts`
    });
  }
  
  return recommendations;
}

module.exports = router;
