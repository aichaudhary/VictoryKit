const auditService = require('../services/audit.service');

class AuditController {
  /**
   * Get audit logs
   */
  async getAuditLogs(req, res) {
    try {
      const userId = req.user.userId;
      const organizationId = req.user.organizationId;
      const userRole = req.user.role;
      const {
        page = 1,
        limit = 50,
        action,
        resourceType,
        resourceId,
        userId: targetUserId,
        startDate,
        endDate,
        severity,
        ipAddress,
        userAgent
      } = req.query;

      const result = await auditService.getAuditLogs(userId, organizationId, userRole, {
        page: parseInt(page),
        limit: parseInt(limit),
        action,
        resourceType,
        resourceId,
        targetUserId,
        startDate,
        endDate,
        severity,
        ipAddress,
        userAgent
      });

      res.json({
        success: true,
        logs: result.logs,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get audit logs error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get audit log by ID
   */
  async getAuditLog(req, res) {
    try {
      const { logId } = req.params;
      const userId = req.user.userId;
      const organizationId = req.user.organizationId;
      const userRole = req.user.role;

      const log = await auditService.getAuditLog(logId, userId, organizationId, userRole);

      res.json({
        success: true,
        log
      });
    } catch (error) {
      console.error('Get audit log error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(req, res) {
    try {
      const userId = req.user.userId;
      const organizationId = req.user.organizationId;
      const userRole = req.user.role;
      const { startDate, endDate } = req.query;

      const stats = await auditService.getAuditStats(userId, organizationId, userRole, {
        startDate,
        endDate
      });

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Get audit stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get compliance report
   */
  async getComplianceReport(req, res) {
    try {
      const userId = req.user.userId;
      const organizationId = req.user.organizationId;
      const userRole = req.user.role;
      const { standard = 'SOC2', startDate, endDate } = req.query;

      const report = await auditService.getComplianceReport(userId, organizationId, userRole, {
        standard,
        startDate,
        endDate
      });

      res.json({
        success: true,
        report
      });
    } catch (error) {
      console.error('Get compliance report error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Export audit logs
   */
  async exportAuditLogs(req, res) {
    try {
      const userId = req.user.userId;
      const organizationId = req.user.organizationId;
      const userRole = req.user.role;
      const { format = 'json', startDate, endDate, action, resourceType } = req.query;

      const exportData = await auditService.exportAuditLogs(userId, organizationId, userRole, {
        format,
        startDate,
        endDate,
        action,
        resourceType
      });

      // Set appropriate headers based on format
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.csv"`);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.json"`);
      }

      res.send(exportData);
    } catch (error) {
      console.error('Export audit logs error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get security alerts
   */
  async getSecurityAlerts(req, res) {
    try {
      const userId = req.user.userId;
      const organizationId = req.user.organizationId;
      const userRole = req.user.role;
      const { page = 1, limit = 20, severity, resolved, startDate, endDate } = req.query;

      const result = await auditService.getSecurityAlerts(userId, organizationId, userRole, {
        page: parseInt(page),
        limit: parseInt(limit),
        severity,
        resolved: resolved === 'true',
        startDate,
        endDate
      });

      res.json({
        success: true,
        alerts: result.alerts,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get security alerts error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Resolve security alert
   */
  async resolveSecurityAlert(req, res) {
    try {
      const { alertId } = req.params;
      const { resolution, notes } = req.body;
      const userId = req.user.userId;
      const organizationId = req.user.organizationId;
      const userRole = req.user.role;

      const alert = await auditService.resolveSecurityAlert(alertId, userId, organizationId, userRole, {
        resolution,
        notes
      });

      res.json({
        success: true,
        message: 'Security alert resolved successfully',
        alert
      });
    } catch (error) {
      console.error('Resolve security alert error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get user activity summary
   */
  async getUserActivitySummary(req, res) {
    try {
      const { targetUserId } = req.params;
      const userId = req.user.userId;
      const organizationId = req.user.organizationId;
      const userRole = req.user.role;
      const { startDate, endDate } = req.query;

      const summary = await auditService.getUserActivitySummary(targetUserId, userId, organizationId, userRole, {
        startDate,
        endDate
      });

      res.json({
        success: true,
        summary
      });
    } catch (error) {
      console.error('Get user activity summary error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get resource activity summary
   */
  async getResourceActivitySummary(req, res) {
    try {
      const { resourceType, resourceId } = req.params;
      const userId = req.user.userId;
      const organizationId = req.user.organizationId;
      const userRole = req.user.role;
      const { startDate, endDate } = req.query;

      const summary = await auditService.getResourceActivitySummary(resourceType, resourceId, userId, organizationId, userRole, {
        startDate,
        endDate
      });

      res.json({
        success: true,
        summary
      });
    } catch (error) {
      console.error('Get resource activity summary error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get failed login attempts
   */
  async getFailedLoginAttempts(req, res) {
    try {
      const userId = req.user.userId;
      const organizationId = req.user.organizationId;
      const userRole = req.user.role;
      const { page = 1, limit = 20, startDate, endDate, ipAddress } = req.query;

      const result = await auditService.getFailedLoginAttempts(userId, organizationId, userRole, {
        page: parseInt(page),
        limit: parseInt(limit),
        startDate,
        endDate,
        ipAddress
      });

      res.json({
        success: true,
        attempts: result.attempts,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get failed login attempts error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get suspicious activities
   */
  async getSuspiciousActivities(req, res) {
    try {
      const userId = req.user.userId;
      const organizationId = req.user.organizationId;
      const userRole = req.user.role;
      const { page = 1, limit = 20, startDate, endDate, activityType } = req.query;

      const result = await auditService.getSuspiciousActivities(userId, organizationId, userRole, {
        page: parseInt(page),
        limit: parseInt(limit),
        startDate,
        endDate,
        activityType
      });

      res.json({
        success: true,
        activities: result.activities,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get suspicious activities error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get data access patterns
   */
  async getDataAccessPatterns(req, res) {
    try {
      const userId = req.user.userId;
      const organizationId = req.user.organizationId;
      const userRole = req.user.role;
      const { startDate, endDate, groupBy = 'user' } = req.query;

      const patterns = await auditService.getDataAccessPatterns(userId, organizationId, userRole, {
        startDate,
        endDate,
        groupBy
      });

      res.json({
        success: true,
        patterns
      });
    } catch (error) {
      console.error('Get data access patterns error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get compliance violations
   */
  async getComplianceViolations(req, res) {
    try {
      const userId = req.user.userId;
      const organizationId = req.user.organizationId;
      const userRole = req.user.role;
      const { standard = 'SOC2', page = 1, limit = 20, startDate, endDate, severity } = req.query;

      const result = await auditService.getComplianceViolations(userId, organizationId, userRole, {
        standard,
        page: parseInt(page),
        limit: parseInt(limit),
        startDate,
        endDate,
        severity
      });

      res.json({
        success: true,
        violations: result.violations,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get compliance violations error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Generate audit report
   */
  async generateAuditReport(req, res) {
    try {
      const userId = req.user.userId;
      const organizationId = req.user.organizationId;
      const userRole = req.user.role;
      const { reportType, startDate, endDate, format = 'pdf', filters } = req.body;

      const report = await auditService.generateAuditReport(userId, organizationId, userRole, {
        reportType,
        startDate,
        endDate,
        format,
        filters
      });

      // Set appropriate headers based on format
      if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="audit-report-${Date.now()}.pdf"`);
      } else if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="audit-report-${Date.now()}.csv"`);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="audit-report-${Date.now()}.json"`);
      }

      res.send(report);
    } catch (error) {
      console.error('Generate audit report error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get audit retention settings
   */
  async getAuditRetentionSettings(req, res) {
    try {
      const userId = req.user.userId;
      const organizationId = req.user.organizationId;
      const userRole = req.user.role;

      const settings = await auditService.getAuditRetentionSettings(userId, organizationId, userRole);

      res.json({
        success: true,
        settings
      });
    } catch (error) {
      console.error('Get audit retention settings error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update audit retention settings
   */
  async updateAuditRetentionSettings(req, res) {
    try {
      const { retentionPeriod, archiveAfter, deleteAfter } = req.body;
      const userId = req.user.userId;
      const organizationId = req.user.organizationId;
      const userRole = req.user.role;

      const settings = await auditService.updateAuditRetentionSettings(userId, organizationId, userRole, {
        retentionPeriod,
        archiveAfter,
        deleteAfter
      });

      res.json({
        success: true,
        message: 'Audit retention settings updated successfully',
        settings
      });
    } catch (error) {
      console.error('Update audit retention settings error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Archive old audit logs
   */
  async archiveAuditLogs(req, res) {
    try {
      const { olderThan } = req.body;
      const userId = req.user.userId;
      const organizationId = req.user.organizationId;
      const userRole = req.user.role;

      const result = await auditService.archiveAuditLogs(userId, organizationId, userRole, olderThan);

      res.json({
        success: true,
        message: result.message,
        archived: result.archived
      });
    } catch (error) {
      console.error('Archive audit logs error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete old audit logs
   */
  async deleteAuditLogs(req, res) {
    try {
      const { olderThan } = req.body;
      const userId = req.user.userId;
      const organizationId = req.user.organizationId;
      const userRole = req.user.role;

      const result = await auditService.deleteAuditLogs(userId, organizationId, userRole, olderThan);

      res.json({
        success: true,
        message: result.message,
        deleted: result.deleted
      });
    } catch (error) {
      console.error('Delete audit logs error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get audit dashboard data
   */
  async getAuditDashboard(req, res) {
    try {
      const userId = req.user.userId;
      const organizationId = req.user.organizationId;
      const userRole = req.user.role;
      const { period = '30d' } = req.query;

      const dashboard = await auditService.getAuditDashboard(userId, organizationId, userRole, period);

      res.json({
        success: true,
        dashboard
      });
    } catch (error) {
      console.error('Get audit dashboard error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AuditController();