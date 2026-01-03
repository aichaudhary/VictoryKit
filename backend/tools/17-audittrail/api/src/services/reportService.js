/**
 * AuditTrail - Report Generator Service
 * Compliance report generation for SOC2, HIPAA, GDPR, PCI-DSS, ISO27001
 */

const AuditLog = require('../models/AuditLog');
const Report = require('../models/Report');
const { v4: uuidv4 } = require('uuid');

class ReportService {
  constructor() {
    this.complianceFrameworks = {
      'SOC2': {
        name: 'SOC 2 Type II',
        categories: ['CC6 - Logical & Physical Access', 'CC7 - System Operations', 'CC8 - Change Management'],
        controls: this.getSOC2Controls()
      },
      'HIPAA': {
        name: 'HIPAA Security Rule',
        categories: ['Administrative Safeguards', 'Physical Safeguards', 'Technical Safeguards'],
        controls: this.getHIPAAControls()
      },
      'GDPR': {
        name: 'GDPR Compliance',
        categories: ['Data Subject Rights', 'Data Processing', 'Security Measures', 'Breach Notification'],
        controls: this.getGDPRControls()
      },
      'PCI-DSS': {
        name: 'PCI DSS v4.0',
        categories: ['Build & Maintain Secure Network', 'Protect Cardholder Data', 'Maintain Vulnerability Program'],
        controls: this.getPCIDSSControls()
      },
      'ISO27001': {
        name: 'ISO 27001:2022',
        categories: ['Organizational Controls', 'People Controls', 'Physical Controls', 'Technological Controls'],
        controls: this.getISO27001Controls()
      }
    };
  }

  getSOC2Controls() {
    return [
      { id: 'CC6.1', name: 'Logical access security', eventTypes: ['authentication', 'authorization'] },
      { id: 'CC6.2', name: 'Authentication mechanisms', eventTypes: ['authentication'] },
      { id: 'CC6.3', name: 'Access removal', eventTypes: ['authorization', 'user_management'] },
      { id: 'CC7.1', name: 'Security monitoring', eventTypes: ['security', 'compliance'] },
      { id: 'CC7.2', name: 'Incident response', eventTypes: ['security'] },
      { id: 'CC8.1', name: 'Change management', eventTypes: ['configuration', 'deployment'] }
    ];
  }

  getHIPAAControls() {
    return [
      { id: '164.308(a)(1)', name: 'Security Management Process', eventTypes: ['security', 'compliance'] },
      { id: '164.308(a)(3)', name: 'Workforce Security', eventTypes: ['user_management', 'authorization'] },
      { id: '164.308(a)(4)', name: 'Information Access Management', eventTypes: ['authorization', 'data_access'] },
      { id: '164.312(a)(1)', name: 'Access Control', eventTypes: ['authentication', 'authorization'] },
      { id: '164.312(b)', name: 'Audit Controls', eventTypes: ['data_access', 'audit'] },
      { id: '164.312(d)', name: 'Person Authentication', eventTypes: ['authentication'] }
    ];
  }

  getGDPRControls() {
    return [
      { id: 'Art.5', name: 'Principles of Processing', eventTypes: ['data_access', 'data_modification'] },
      { id: 'Art.15', name: 'Right of Access', eventTypes: ['data_access'] },
      { id: 'Art.17', name: 'Right to Erasure', eventTypes: ['data_deletion'] },
      { id: 'Art.32', name: 'Security of Processing', eventTypes: ['security', 'encryption'] },
      { id: 'Art.33', name: 'Breach Notification', eventTypes: ['security'] },
      { id: 'Art.35', name: 'Impact Assessment', eventTypes: ['compliance', 'data_access'] }
    ];
  }

  getPCIDSSControls() {
    return [
      { id: 'Req.1', name: 'Firewall Configuration', eventTypes: ['network', 'configuration'] },
      { id: 'Req.7', name: 'Restrict Access', eventTypes: ['authorization', 'data_access'] },
      { id: 'Req.8', name: 'Identify & Authenticate', eventTypes: ['authentication'] },
      { id: 'Req.10', name: 'Track & Monitor Access', eventTypes: ['data_access', 'audit'] },
      { id: 'Req.11', name: 'Test Security', eventTypes: ['security', 'vulnerability'] },
      { id: 'Req.12', name: 'Security Policies', eventTypes: ['compliance', 'policy'] }
    ];
  }

  getISO27001Controls() {
    return [
      { id: 'A.5', name: 'Information Security Policies', eventTypes: ['compliance', 'policy'] },
      { id: 'A.9', name: 'Access Control', eventTypes: ['authentication', 'authorization'] },
      { id: 'A.12', name: 'Operations Security', eventTypes: ['security', 'configuration'] },
      { id: 'A.16', name: 'Incident Management', eventTypes: ['security', 'incident'] },
      { id: 'A.18', name: 'Compliance', eventTypes: ['compliance', 'audit'] }
    ];
  }

  // Generate compliance report
  async generateReport(params) {
    const {
      framework,
      startDate,
      endDate,
      format = 'json',
      includeDetails = true
    } = params;

    const reportId = `RPT-${uuidv4().split('-')[0].toUpperCase()}`;
    const frameworkConfig = this.complianceFrameworks[framework];

    if (!frameworkConfig) {
      throw new Error(`Unknown compliance framework: ${framework}`);
    }

    const dateFilter = {
      timestamp: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    // Get overall statistics
    const stats = await this.getReportStats(dateFilter);

    // Analyze each control
    const controlResults = await Promise.all(
      frameworkConfig.controls.map(control => 
        this.analyzeControl(control, dateFilter, includeDetails)
      )
    );

    // Calculate compliance score
    const complianceScore = this.calculateComplianceScore(controlResults);

    // Generate findings
    const findings = this.generateFindings(controlResults);

    // Create report document
    const report = new Report({
      reportId,
      name: `${frameworkConfig.name} Compliance Report`,
      type: 'compliance',
      framework,
      status: 'completed',
      generatedBy: 'system',
      generatedAt: new Date(),
      dateRange: { start: new Date(startDate), end: new Date(endDate) },
      summary: {
        totalEvents: stats.totalEvents,
        complianceScore,
        criticalFindings: findings.filter(f => f.severity === 'critical').length,
        highFindings: findings.filter(f => f.severity === 'high').length,
        mediumFindings: findings.filter(f => f.severity === 'medium').length,
        lowFindings: findings.filter(f => f.severity === 'low').length
      },
      controls: controlResults,
      findings,
      statistics: stats,
      format
    });

    await report.save();

    return {
      reportId,
      framework: frameworkConfig.name,
      dateRange: { startDate, endDate },
      generatedAt: new Date().toISOString(),
      summary: report.summary,
      complianceScore,
      controls: controlResults,
      findings,
      statistics: stats
    };
  }

  async getReportStats(dateFilter) {
    const [
      totalEvents,
      eventsByType,
      eventsByRisk,
      eventsByStatus,
      topActors,
      topResources
    ] = await Promise.all([
      AuditLog.countDocuments(dateFilter),
      AuditLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$eventType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      AuditLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
      ]),
      AuditLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      AuditLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$actor.id', name: { $first: '$actor.name' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      AuditLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$resource.type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    return {
      totalEvents,
      eventsByType: Object.fromEntries(eventsByType.map(e => [e._id, e.count])),
      eventsByRisk: Object.fromEntries(eventsByRisk.map(e => [e._id, e.count])),
      eventsByStatus: Object.fromEntries(eventsByStatus.map(e => [e._id, e.count])),
      topActors: topActors.map(a => ({ id: a._id, name: a.name, count: a.count })),
      topResources: topResources.map(r => ({ type: r._id, count: r.count }))
    };
  }

  async analyzeControl(control, dateFilter, includeDetails) {
    const eventFilter = {
      ...dateFilter,
      eventType: { $in: control.eventTypes }
    };

    const [totalEvents, failedEvents, highRiskEvents, samples] = await Promise.all([
      AuditLog.countDocuments(eventFilter),
      AuditLog.countDocuments({ ...eventFilter, status: 'failure' }),
      AuditLog.countDocuments({ ...eventFilter, riskLevel: { $in: ['high', 'critical'] } }),
      includeDetails ? AuditLog.find(eventFilter).sort({ timestamp: -1 }).limit(5) : Promise.resolve([])
    ]);

    const failureRate = totalEvents > 0 ? (failedEvents / totalEvents * 100).toFixed(2) : 0;
    const riskRate = totalEvents > 0 ? (highRiskEvents / totalEvents * 100).toFixed(2) : 0;

    // Determine control status
    let status = 'compliant';
    if (failureRate > 10 || riskRate > 20) status = 'non-compliant';
    else if (failureRate > 5 || riskRate > 10) status = 'needs-attention';
    else if (totalEvents === 0) status = 'insufficient-data';

    return {
      controlId: control.id,
      controlName: control.name,
      eventTypes: control.eventTypes,
      status,
      metrics: {
        totalEvents,
        failedEvents,
        highRiskEvents,
        failureRate: parseFloat(failureRate),
        riskRate: parseFloat(riskRate)
      },
      sampleEvents: includeDetails ? samples.map(s => ({
        id: s.logId,
        timestamp: s.timestamp,
        action: s.action,
        actor: s.actor?.name,
        status: s.status
      })) : []
    };
  }

  calculateComplianceScore(controlResults) {
    if (!controlResults.length) return 0;

    const weights = {
      'compliant': 100,
      'needs-attention': 70,
      'non-compliant': 30,
      'insufficient-data': 50
    };

    const totalScore = controlResults.reduce((sum, control) => {
      return sum + (weights[control.status] || 0);
    }, 0);

    return Math.round(totalScore / controlResults.length);
  }

  generateFindings(controlResults) {
    const findings = [];

    controlResults.forEach(control => {
      if (control.status === 'non-compliant') {
        findings.push({
          severity: 'high',
          controlId: control.controlId,
          title: `Non-compliance detected in ${control.controlName}`,
          description: `Control ${control.controlId} has a failure rate of ${control.metrics.failureRate}% and risk rate of ${control.metrics.riskRate}%`,
          recommendation: 'Review failed events and implement corrective actions',
          affectedEvents: control.metrics.failedEvents + control.metrics.highRiskEvents
        });
      } else if (control.status === 'needs-attention') {
        findings.push({
          severity: 'medium',
          controlId: control.controlId,
          title: `Attention needed for ${control.controlName}`,
          description: `Control ${control.controlId} shows elevated failure or risk rates`,
          recommendation: 'Monitor this control closely and investigate anomalies',
          affectedEvents: control.metrics.failedEvents + control.metrics.highRiskEvents
        });
      } else if (control.status === 'insufficient-data') {
        findings.push({
          severity: 'low',
          controlId: control.controlId,
          title: `Insufficient data for ${control.controlName}`,
          description: `No events found for control ${control.controlId} during the reporting period`,
          recommendation: 'Ensure audit logging is enabled for relevant activities',
          affectedEvents: 0
        });
      }
    });

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return findings;
  }

  // Get available report templates
  getTemplates() {
    return Object.entries(this.complianceFrameworks).map(([key, value]) => ({
      id: key,
      name: value.name,
      categories: value.categories,
      controlCount: value.controls.length
    }));
  }

  // Get report by ID
  async getReport(reportId) {
    return Report.findOne({ reportId });
  }

  // List reports with filters
  async listReports(params = {}) {
    const { framework, status, page = 1, limit = 20 } = params;
    const filter = {};

    if (framework) filter.framework = framework;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .sort({ generatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('reportId name framework status generatedAt summary'),
      Report.countDocuments(filter)
    ]);

    return {
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Generate executive summary
  async generateExecutiveSummary(startDate, endDate) {
    const dateFilter = {
      timestamp: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    const [stats, riskTrend, topIssues] = await Promise.all([
      this.getReportStats(dateFilter),
      AuditLog.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            total: { $sum: 1 },
            high: { $sum: { $cond: [{ $in: ['$riskLevel', ['high', 'critical']] }, 1, 0] } },
            failed: { $sum: { $cond: [{ $eq: ['$status', 'failure'] }, 1, 0] } }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      AuditLog.aggregate([
        { $match: { ...dateFilter, riskLevel: { $in: ['high', 'critical'] } } },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    return {
      period: { startDate, endDate },
      overview: stats,
      riskTrend,
      topIssues: topIssues.map(i => ({ action: i._id, count: i.count })),
      generatedAt: new Date().toISOString()
    };
  }
}

module.exports = new ReportService();
