const { ComplianceReport, SecurityFinding } = require('../models');
const { v4: uuidv4 } = require('uuid');

/**
 * Get compliance status overview
 */
exports.getComplianceOverview = async (req, res) => {
  try {
    const { provider } = req.query;

    // Get latest reports for each framework
    const frameworks = ['CIS', 'SOC2', 'PCI-DSS', 'HIPAA', 'GDPR', 'NIST', 'ISO27001'];
    
    const latestReports = await Promise.all(
      frameworks.map(async (framework) => {
        const report = await ComplianceReport.findOne({ framework })
          .sort({ generatedAt: -1 });
        
        if (!report) {
          return {
            framework,
            score: null,
            status: 'not-assessed',
            lastAssessed: null
          };
        }
        
        return {
          framework,
          score: report.overallScore,
          status: report.overallScore >= 80 ? 'compliant' : 
                  report.overallScore >= 60 ? 'partial' : 'non-compliant',
          lastAssessed: report.generatedAt,
          controlSummary: report.controlSummary
        };
      })
    );

    // Get compliance trend
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trend = await ComplianceReport.aggregate([
      { $match: { generatedAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            framework: '$framework',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$generatedAt' } }
          },
          score: { $avg: '$overallScore' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        frameworks: latestReports,
        trend
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get compliance overview',
      details: error.message
    });
  }
};

/**
 * Get compliance report for a specific framework
 */
exports.getComplianceReport = async (req, res) => {
  try {
    const { framework } = req.params;
    
    const report = await ComplianceReport.findOne({ framework })
      .sort({ generatedAt: -1 });

    if (!report) {
      return res.status(404).json({
        success: false,
        error: `No compliance report found for ${framework}`
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get compliance report',
      details: error.message
    });
  }
};

/**
 * Generate a new compliance report
 */
exports.generateReport = async (req, res) => {
  try {
    const { framework, provider = 'multi-cloud' } = req.body;

    const validFrameworks = ['CIS', 'SOC2', 'PCI-DSS', 'HIPAA', 'GDPR', 'NIST', 'ISO27001', 'FedRAMP', 'CCPA'];
    if (!validFrameworks.includes(framework)) {
      return res.status(400).json({
        success: false,
        error: `Invalid framework. Must be one of: ${validFrameworks.join(', ')}`
      });
    }

    // Get open findings mapped to this framework
    const findings = await SecurityFinding.find({
      'compliance.framework': framework,
      status: 'open'
    });

    // Get previous score for trend
    const previousReport = await ComplianceReport.findOne({ framework })
      .sort({ generatedAt: -1 });

    // Generate control assessments (simplified - in production would be framework-specific)
    const controlCount = getControlCount(framework);
    const failedControls = findings.length;
    const passedControls = Math.max(0, controlCount - failedControls);
    const overallScore = Math.round((passedControls / controlCount) * 100);

    const report = new ComplianceReport({
      reportId: `report_${uuidv4()}`,
      framework,
      provider,
      generatedAt: new Date(),
      periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      periodEnd: new Date(),
      overallScore,
      previousScore: previousReport?.overallScore,
      scoreTrend: previousReport ? 
        (overallScore > previousReport.overallScore ? 'improving' : 
         overallScore < previousReport.overallScore ? 'declining' : 'stable') : 'stable',
      controlSummary: {
        total: controlCount,
        passed: passedControls,
        failed: failedControls,
        notApplicable: 0,
        manual: 0
      },
      riskSummary: {
        criticalRisks: findings.filter(f => f.severity === 'critical').length,
        highRisks: findings.filter(f => f.severity === 'high').length,
        mediumRisks: findings.filter(f => f.severity === 'medium').length,
        lowRisks: findings.filter(f => f.severity === 'low').length
      }
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: 'Compliance report generated',
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate compliance report',
      details: error.message
    });
  }
};

function getControlCount(framework) {
  const counts = {
    'CIS': 200,
    'SOC2': 64,
    'PCI-DSS': 250,
    'HIPAA': 75,
    'GDPR': 50,
    'NIST': 110,
    'ISO27001': 114,
    'FedRAMP': 325,
    'CCPA': 30
  };
  return counts[framework] || 100;
}

/**
 * Get compliance history
 */
exports.getComplianceHistory = async (req, res) => {
  try {
    const { framework } = req.params;
    const { days = 90 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const reports = await ComplianceReport.find({
      framework,
      generatedAt: { $gte: startDate }
    })
    .select('reportId overallScore generatedAt controlSummary')
    .sort({ generatedAt: 1 });

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get compliance history',
      details: error.message
    });
  }
};

/**
 * Export compliance report
 */
exports.exportReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { format = 'json' } = req.query;

    const report = await ComplianceReport.findOne({ reportId });
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${report.framework}-report-${report.reportId}.json"`);
      return res.json(report);
    }

    // For CSV, PDF, etc. - would need additional libraries
    res.json({
      success: true,
      message: 'Export generated',
      data: {
        reportId,
        format,
        downloadUrl: `/api/v1/cloudsecure/compliance/download/${reportId}?format=${format}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to export report',
      details: error.message
    });
  }
};
