/**
 * RansomShield - Report Controller
 * Handles report generation and management
 */

const Report = require('../models/Report.model');
const Sample = require('../models/Sample.model');
const Analysis = require('../models/Analysis.model');
const { logger } = require('../../../../../shared');

// Generate executive summary using AI
const generateExecutiveSummary = (stats) => {
  const { totalSamples, maliciousSamples, criticalThreats } = stats;
  const threatPercentage =
    totalSamples > 0 ? ((maliciousSamples / totalSamples) * 100).toFixed(1) : 0;

  if (criticalThreats > 0) {
    return (
      `CRITICAL ALERT: ${criticalThreats} critical threats detected during the reporting period. ` +
      `Out of ${totalSamples} samples analyzed, ${maliciousSamples} (${threatPercentage}%) were identified as malicious. ` +
      `Immediate remediation actions are required. Security team should prioritize incident response and ` +
      `conduct thorough forensic analysis of affected systems.`
    );
  } else if (maliciousSamples > 0) {
    return (
      `During the reporting period, ${totalSamples} samples were analyzed with ${maliciousSamples} ` +
      `(${threatPercentage}%) classified as malicious. While no critical threats were detected, ` +
      `standard remediation procedures should be followed. Continue monitoring for emerging threats ` +
      `and ensure all security definitions are up to date.`
    );
  } else {
    return (
      `Excellent security posture maintained during the reporting period. All ${totalSamples} ` +
      `analyzed samples were classified as clean or benign. No significant threats detected. ` +
      `Continue regular scanning schedules and maintain current security protocols.`
    );
  }
};

// Generate report
exports.generateReport = async (req, res, next) => {
  try {
    const { reportType, title, timeRange, format = 'json' } = req.body;
    const userId = req.user.id;

    // Calculate time range
    const now = new Date();
    let startDate,
      endDate = now;

    if (timeRange && timeRange.start && timeRange.end) {
      startDate = new Date(timeRange.start);
      endDate = new Date(timeRange.end);
    } else {
      switch (reportType) {
        case 'daily':
          startDate = new Date(now.setDate(now.getDate() - 1));
          break;
        case 'weekly':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'monthly':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = new Date(now.setDate(now.getDate() - 7));
      }
      endDate = new Date();
    }

    // Query samples in time range
    const sampleQuery = {
      uploadedBy: userId,
      createdAt: { $gte: startDate, $lte: endDate },
    };

    // Gather statistics
    const [samples, verdictStats, threatLevelStats, typeStats] = await Promise.all([
      Sample.find(sampleQuery).lean(),
      Sample.aggregate([
        { $match: sampleQuery },
        { $group: { _id: '$verdict', count: { $sum: 1 } } },
      ]),
      Sample.aggregate([
        { $match: sampleQuery },
        { $group: { _id: '$threatLevel', count: { $sum: 1 } } },
      ]),
      Sample.aggregate([
        { $match: { ...sampleQuery, verdict: 'MALICIOUS' } },
        { $group: { _id: '$malwareType', count: { $sum: 1 } } },
      ]),
    ]);

    // Calculate summary stats
    const totalSamples = samples.length;
    const maliciousSamples = verdictStats.find((v) => v._id === 'MALICIOUS')?.count || 0;
    const suspiciousSamples = verdictStats.find((v) => v._id === 'SUSPICIOUS')?.count || 0;
    const cleanSamples = verdictStats.find((v) => v._id === 'CLEAN')?.count || 0;
    const criticalThreats = threatLevelStats.find((t) => t._id === 'CRITICAL')?.count || 0;
    const highThreats = threatLevelStats.find((t) => t._id === 'HIGH')?.count || 0;
    const mediumThreats = threatLevelStats.find((t) => t._id === 'MEDIUM')?.count || 0;
    const lowThreats = threatLevelStats.find((t) => t._id === 'LOW')?.count || 0;
    const avgRiskScore =
      samples.length > 0
        ? Math.round(samples.reduce((sum, s) => sum + (s.riskScore || 0), 0) / samples.length)
        : 0;

    // Get top threats
    const topThreats = samples
      .filter((s) => s.verdict === 'MALICIOUS')
      .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))
      .slice(0, 10)
      .map((s) => ({
        sampleId: s._id,
        fileName: s.fileName,
        malwareType: s.malwareType,
        malwareFamily: s.malwareFamily,
        riskScore: s.riskScore,
        detectedAt: s.createdAt,
      }));

    // Format threat breakdown
    const threatBreakdown = {
      byType: typeStats.map((t) => ({
        type: t._id,
        count: t.count,
        percentage: totalSamples > 0 ? ((t.count / totalSamples) * 100).toFixed(1) : 0,
      })),
      bySeverity: threatLevelStats.map((t) => ({
        severity: t._id,
        count: t.count,
        percentage: totalSamples > 0 ? ((t.count / totalSamples) * 100).toFixed(1) : 0,
      })),
    };

    // Generate recommendations
    const recommendations = [];
    if (criticalThreats > 0) {
      recommendations.push('URGENT: Isolate systems with critical threats immediately');
      recommendations.push('Conduct forensic analysis on affected endpoints');
      recommendations.push('Review and update incident response procedures');
    }
    if (maliciousSamples > totalSamples * 0.1) {
      recommendations.push('High malware detection rate - review email gateway rules');
      recommendations.push('Consider additional endpoint protection measures');
    }
    if (suspiciousSamples > 0) {
      recommendations.push('Investigate suspicious files with extended sandbox analysis');
    }
    recommendations.push('Keep all security definitions and signatures up to date');
    recommendations.push('Continue regular security awareness training');

    // Create report
    const report = new Report({
      title: title || `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Security Report`,
      reportType,
      format,
      status: 'completed',
      timeRange: {
        start: startDate,
        end: endDate,
      },
      content: {
        summary: {
          totalSamples,
          maliciousSamples,
          suspiciousSamples,
          cleanSamples,
          totalThreats: maliciousSamples,
          criticalThreats,
          highThreats,
          mediumThreats,
          lowThreats,
          avgRiskScore,
        },
        threatBreakdown,
        topThreats,
        recommendations,
        executiveSummary: generateExecutiveSummary({
          totalSamples,
          maliciousSamples,
          criticalThreats,
        }),
      },
      generatedBy: userId,
      organizationId: req.user.organizationId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    await report.save();

    logger.info(`Report generated: ${report.reportId} by user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Report generated successfully',
      data: { report },
    });
  } catch (error) {
    logger.error('Error generating report:', error);
    next(error);
  }
};

// Get report by ID
exports.getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const report = await Report.findOne({
      $or: [
        { _id: id, generatedBy: userId },
        { reportId: id, generatedBy: userId },
      ],
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found',
      });
    }

    res.json({
      success: true,
      data: { report },
    });
  } catch (error) {
    logger.error('Error fetching report:', error);
    next(error);
  }
};

// Get all reports
exports.getAllReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, reportType, status } = req.query;
    const userId = req.user.id;

    const query = { generatedBy: userId };
    if (reportType) query.reportType = reportType;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reports, total] = await Promise.all([
      Report.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-content.detailedFindings')
        .lean(),
      Report.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching reports:', error);
    next(error);
  }
};

// Delete report
exports.deleteReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const report = await Report.findOneAndDelete({
      $or: [
        { _id: id, generatedBy: userId },
        { reportId: id, generatedBy: userId },
      ],
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found',
      });
    }

    logger.info(`Report deleted: ${id} by user ${userId}`);

    res.json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting report:', error);
    next(error);
  }
};

// Download report
exports.downloadReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { format = 'json' } = req.query;
    const userId = req.user.id;

    const report = await Report.findOne({
      $or: [
        { _id: id, generatedBy: userId },
        { reportId: id, generatedBy: userId },
      ],
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found',
      });
    }

    // For JSON format, just return the report
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${report.reportId}.json"`);
      return res.json(report.toJSON());
    }

    // For other formats, return report data (in production, generate PDF/HTML)
    res.json({
      success: true,
      message: `${format.toUpperCase()} export not yet implemented`,
      data: { report },
    });
  } catch (error) {
    logger.error('Error downloading report:', error);
    next(error);
  }
};

module.exports = exports;
