const emailGuardService = require('../services/emailGuardService');
const { Email, EmailAnalysis, Quarantine, EmailPolicy, EmailUser, EmailReport, EmailAlert } = require('../models');

class EmailDefenderController {
  // Process email for security analysis
  async processEmail(req, res) {
    try {
      const emailData = req.body;
      const result = await emailGuardService.processEmail(emailData);

      res.json({
        success: true,
        data: result,
        message: 'Email processed successfully'
      });
    } catch (error) {
      console.error('Process email error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to process email'
      });
    }
  }

  // Get email analysis results
  async getEmailAnalysis(req, res) {
    try {
      const { emailId } = req.params;
      const analysis = await EmailAnalysis.findOne({ emailId })
        .populate('emailId', 'from subject messageId')
        .sort({ createdAt: -1 });

      if (!analysis) {
        return res.status(404).json({
          success: false,
          message: 'Analysis not found'
        });
      }

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Get email analysis error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get quarantine list
  async getQuarantine(req, res) {
    try {
      const { page = 1, limit = 20, severity, reason } = req.query;
      const query = { status: 'quarantined' };

      if (severity) query.severity = severity;
      if (reason) query.reason = reason;

      const quarantinedEmails = await Quarantine.find(query)
        .populate('emailId', 'from subject messageId createdAt')
        .populate('analysisId', 'threatScore threatLevel')
        .sort({ quarantinedAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Quarantine.countDocuments(query);

      res.json({
        success: true,
        data: quarantinedEmails,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get quarantine error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Release email from quarantine
  async releaseFromQuarantine(req, res) {
    try {
      const { quarantineId } = req.params;
      const { action, reason } = req.body;

      const quarantine = await Quarantine.findById(quarantineId);
      if (!quarantine) {
        return res.status(404).json({
          success: false,
          message: 'Quarantine record not found'
        });
      }

      if (action === 'release') {
        quarantine.status = 'released';
        quarantine.releasedAt = new Date();
        quarantine.releasedBy = req.user?.id || 'system';
        quarantine.releaseReason = reason;
      } else if (action === 'delete') {
        quarantine.status = 'deleted';
        quarantine.deletedAt = new Date();
        quarantine.deletedBy = req.user?.id || 'system';
        quarantine.deleteReason = reason;
      }

      await quarantine.save();

      res.json({
        success: true,
        data: quarantine,
        message: `Email ${action}d from quarantine`
      });
    } catch (error) {
      console.error('Release from quarantine error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get security policies
  async getPolicies(req, res) {
    try {
      const { enabled } = req.query;
      const query = {};
      if (enabled !== undefined) {
        query.enabled = enabled === 'true';
      }

      const policies = await EmailPolicy.find(query).sort({ priority: -1 });

      res.json({
        success: true,
        data: policies
      });
    } catch (error) {
      console.error('Get policies error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Create or update security policy
  async createPolicy(req, res) {
    try {
      const policyData = req.body;
      const policy = new EmailPolicy(policyData);
      await policy.save();

      res.status(201).json({
        success: true,
        data: policy,
        message: 'Policy created successfully'
      });
    } catch (error) {
      console.error('Create policy error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update policy
  async updatePolicy(req, res) {
    try {
      const { policyId } = req.params;
      const updates = req.body;

      const policy = await EmailPolicy.findByIdAndUpdate(policyId, updates, { new: true });

      if (!policy) {
        return res.status(404).json({
          success: false,
          message: 'Policy not found'
        });
      }

      res.json({
        success: true,
        data: policy,
        message: 'Policy updated successfully'
      });
    } catch (error) {
      console.error('Update policy error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Delete policy
  async deletePolicy(req, res) {
    try {
      const { policyId } = req.params;
      const policy = await EmailPolicy.findByIdAndDelete(policyId);

      if (!policy) {
        return res.status(404).json({
          success: false,
          message: 'Policy not found'
        });
      }

      res.json({
        success: true,
        message: 'Policy deleted successfully'
      });
    } catch (error) {
      console.error('Delete policy error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get security alerts
  async getAlerts(req, res) {
    try {
      const { page = 1, limit = 20, severity, type, resolved } = req.query;
      const query = {};

      if (severity) query.severity = severity;
      if (type) query.type = type;
      if (resolved !== undefined) query.resolved = resolved === 'true';

      const alerts = await EmailAlert.find(query)
        .populate('emailId', 'from subject')
        .populate('analysisId', 'threatScore threatLevel')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await EmailAlert.countDocuments(query);

      res.json({
        success: true,
        data: alerts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get alerts error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Resolve alert
  async resolveAlert(req, res) {
    try {
      const { alertId } = req.params;
      const { resolution, notes } = req.body;

      const alert = await EmailAlert.findByIdAndUpdate(
        alertId,
        {
          resolved: true,
          resolvedAt: new Date(),
          resolvedBy: req.user?.id || 'system',
          resolution,
          notes
        },
        { new: true }
      );

      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }

      res.json({
        success: true,
        data: alert,
        message: 'Alert resolved successfully'
      });
    } catch (error) {
      console.error('Resolve alert error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get security reports
  async getReports(req, res) {
    try {
      const { type, period = '7d' } = req.query;

      const reports = await EmailReport.find({
        type: type || { $exists: true },
        createdAt: { $gte: new Date(Date.now() - this.getPeriodMs(period)) }
      }).sort({ createdAt: -1 });

      res.json({
        success: true,
        data: reports
      });
    } catch (error) {
      console.error('Get reports error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Generate security report
  async generateReport(req, res) {
    try {
      const { type, period = '7d' } = req.body;
      const report = await emailGuardService.generateReport(type, period);

      const reportDoc = new EmailReport({
        type,
        period,
        data: report,
        generatedBy: req.user?.id || 'system'
      });
      await reportDoc.save();

      res.json({
        success: true,
        data: reportDoc,
        message: 'Report generated successfully'
      });
    } catch (error) {
      console.error('Generate report error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get real-time statistics
  async getStats(req, res) {
    try {
      const { timeRange = '1h' } = req.query;
      const stats = await emailGuardService.getRealTimeStats(timeRange);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get email security dashboard data
  async getDashboard(req, res) {
    try {
      const dashboard = await emailGuardService.getDashboardData();

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      console.error('Get dashboard error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Bulk email processing
  async processBulkEmails(req, res) {
    try {
      const { emails } = req.body;
      const results = [];

      for (const email of emails) {
        try {
          const result = await emailGuardService.processEmail(email);
          results.push({ emailId: email.messageId, success: true, result });
        } catch (error) {
          results.push({ emailId: email.messageId, success: false, error: error.message });
        }
      }

      res.json({
        success: true,
        data: results,
        message: `Processed ${results.length} emails`
      });
    } catch (error) {
      console.error('Bulk email processing error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get email users
  async getUsers(req, res) {
    try {
      const { page = 1, limit = 20, riskLevel } = req.query;
      const query = {};

      if (riskLevel) query.riskLevel = riskLevel;

      const users = await EmailUser.find(query)
        .sort({ lastActivity: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await EmailUser.countDocuments(query);

      res.json({
        success: true,
        data: users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update user risk profile
  async updateUserRisk(req, res) {
    try {
      const { userId } = req.params;
      const { riskLevel, notes } = req.body;

      const user = await EmailUser.findByIdAndUpdate(
        userId,
        {
          riskLevel,
          riskNotes: notes,
          riskUpdatedAt: new Date(),
          riskUpdatedBy: req.user?.id || 'system'
        },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user,
        message: 'User risk profile updated'
      });
    } catch (error) {
      console.error('Update user risk error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Helper method to convert period to milliseconds
  getPeriodMs(period) {
    const periods = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    return periods[period] || periods['7d'];
  }
}

module.exports = new EmailDefenderController();