const webFilterService = require('../services/webFilterService');
const { FilterPolicy, UserProfile, AccessLog, Alert, Report } = require('../models');

class WebFilterController {
  // URL Analysis Endpoints
  async analyzeUrl(req, res) {
    try {
      const { url, options = {} } = req.body;
      const userId = req.user?.id;
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip || req.connection.remoteAddress;

      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'URL is required'
        });
      }

      const analysis = await webFilterService.analyzeUrl(url, {
        userId,
        userAgent,
        ipAddress,
        ...options
      });

      // Check policies
      const policyCheck = await webFilterService.checkPolicies(url, userId);

      const response = {
        success: true,
        data: {
          ...analysis.toObject(),
          policyCheck,
          shouldBlock: policyCheck.blocked || analysis.threatLevel === 'malicious'
        }
      };

      res.json(response);
    } catch (error) {
      console.error('URL analysis error:', error);
      res.status(500).json({
        success: false,
        error: 'URL analysis failed',
        details: error.message
      });
    }
  }

  async batchAnalyzeUrls(req, res) {
    try {
      const { urls, options = {} } = req.body;
      const userId = req.user?.id;
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip || req.connection.remoteAddress;

      if (!Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'URLs array is required'
        });
      }

      if (urls.length > 100) {
        return res.status(400).json({
          success: false,
          error: 'Maximum 100 URLs allowed per batch'
        });
      }

      const results = await Promise.allSettled(
        urls.map(url => webFilterService.analyzeUrl(url, {
          userId,
          userAgent,
          ipAddress,
          ...options
        }))
      );

      const analysis = results.map((result, index) => ({
        url: urls[index],
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason.message : null
      }));

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Batch URL analysis error:', error);
      res.status(500).json({
        success: false,
        error: 'Batch analysis failed',
        details: error.message
      });
    }
  }

  // Policy Management Endpoints
  async createPolicy(req, res) {
    try {
      const policyData = req.body;
      const userId = req.user?.id;

      // Validate required fields
      if (!policyData.name || !policyData.type) {
        return res.status(400).json({
          success: false,
          error: 'Policy name and type are required'
        });
      }

      // Set default values
      policyData.createdBy = userId;
      policyData.createdAt = new Date();
      policyData.updatedAt = new Date();
      policyData.enabled = policyData.enabled !== false;

      const policy = await FilterPolicy.create(policyData);

      res.status(201).json({
        success: true,
        data: policy
      });
    } catch (error) {
      console.error('Create policy error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create policy',
        details: error.message
      });
    }
  }

  async getPolicies(req, res) {
    try {
      const { page = 1, limit = 20, type, enabled } = req.query;
      const userId = req.user?.id;

      const query = {};
      if (type) query.type = type;
      if (enabled !== undefined) query.enabled = enabled === 'true';

      // Add user scope filtering if not admin
      if (!req.user?.isAdmin) {
        query.$or = [
          { 'scope.type': 'global' },
          { 'scope.type': 'user', 'scope.targetIds': userId },
          { 'scope.targetIds': userId }
        ];
      }

      const policies = await FilterPolicy.find(query)
        .sort({ priority: -1, createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('createdBy', 'username email');

      const total = await FilterPolicy.countDocuments(query);

      res.json({
        success: true,
        data: policies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get policies error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve policies',
        details: error.message
      });
    }
  }

  async updatePolicy(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const userId = req.user?.id;

      updates.updatedAt = new Date();

      const policy = await FilterPolicy.findOneAndUpdate(
        { _id: id, createdBy: userId },
        updates,
        { new: true, runValidators: true }
      );

      if (!policy) {
        return res.status(404).json({
          success: false,
          error: 'Policy not found or access denied'
        });
      }

      res.json({
        success: true,
        data: policy
      });
    } catch (error) {
      console.error('Update policy error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update policy',
        details: error.message
      });
    }
  }

  async deletePolicy(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const policy = await FilterPolicy.findOneAndDelete({
        _id: id,
        createdBy: userId
      });

      if (!policy) {
        return res.status(404).json({
          success: false,
          error: 'Policy not found or access denied'
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
        error: 'Failed to delete policy',
        details: error.message
      });
    }
  }

  // User Profile Endpoints
  async getUserProfile(req, res) {
    try {
      const userId = req.params.userId || req.user?.id;

      let profile = await UserProfile.findOne({ userId });

      if (!profile) {
        // Create default profile
        profile = await UserProfile.create({
          userId,
          preferences: {
            safeSearch: true,
            blockAdultContent: true,
            blockSocialMedia: false,
            timeRestrictions: {
              enabled: false,
              allowedHours: []
            }
          },
          parentalControls: {
            enabled: false,
            ageRestriction: 13,
            blockedCategories: ['adult', 'gambling', 'violence']
          },
          statistics: {
            urlsAnalyzed: 0,
            urlsBlocked: 0,
            lastActivity: new Date()
          }
        });
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Get user profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve user profile',
        details: error.message
      });
    }
  }

  async updateUserProfile(req, res) {
    try {
      const userId = req.params.userId || req.user?.id;
      const updates = req.body;

      updates.updatedAt = new Date();

      const profile = await UserProfile.findOneAndUpdate(
        { userId },
        updates,
        { new: true, upsert: true, runValidators: true }
      );

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Update user profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update user profile',
        details: error.message
      });
    }
  }

  // Access Log Endpoints
  async getAccessLogs(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        userId,
        action,
        startDate,
        endDate,
        domain
      } = req.query;

      const query = {};

      if (userId) query.userId = userId;
      if (action) query.action = action;
      if (domain) query.domain = new RegExp(domain, 'i');

      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      // Add user scope filtering if not admin
      if (!req.user?.isAdmin) {
        query.userId = req.user?.id;
      }

      const logs = await AccessLog.find(query)
        .sort({ timestamp: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('userId', 'username email');

      const total = await AccessLog.countDocuments(query);

      res.json({
        success: true,
        data: logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get access logs error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve access logs',
        details: error.message
      });
    }
  }

  // Alert Management Endpoints
  async getAlerts(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        severity,
        type,
        resolved,
        startDate,
        endDate
      } = req.query;

      const query = {};

      if (severity) query.severity = severity;
      if (type) query.type = type;
      if (resolved !== undefined) query.resolved = resolved === 'true';

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const alerts = await Alert.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Alert.countDocuments(query);

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
        error: 'Failed to retrieve alerts',
        details: error.message
      });
    }
  }

  async resolveAlert(req, res) {
    try {
      const { id } = req.params;
      const { resolution, notes } = req.body;

      const alert = await Alert.findByIdAndUpdate(
        id,
        {
          resolved: true,
          resolvedAt: new Date(),
          resolution,
          notes,
          resolvedBy: req.user?.id
        },
        { new: true }
      );

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
      console.error('Resolve alert error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to resolve alert',
        details: error.message
      });
    }
  }

  // Reporting Endpoints
  async getReports(req, res) {
    try {
      const { type, startDate, endDate } = req.query;

      const query = { type };

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const reports = await Report.find(query)
        .sort({ createdAt: -1 })
        .limit(50);

      res.json({
        success: true,
        data: reports
      });
    } catch (error) {
      console.error('Get reports error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve reports',
        details: error.message
      });
    }
  }

  async generateReport(req, res) {
    try {
      const { type, startDate, endDate, filters = {} } = req.body;

      if (!type || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'Type, startDate, and endDate are required'
        });
      }

      const reportData = await this.generateReportData(type, startDate, endDate, filters);

      const report = await Report.create({
        type,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
        description: `Generated report for ${type} from ${startDate} to ${endDate}`,
        data: reportData,
        filters,
        generatedBy: req.user?.id,
        dateRange: {
          start: new Date(startDate),
          end: new Date(endDate)
        }
      });

      res.status(201).json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Generate report error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate report',
        details: error.message
      });
    }
  }

  async generateReportData(type, startDate, endDate, filters) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    switch (type) {
      case 'access_summary':
        return await this.generateAccessSummaryReport(start, end, filters);

      case 'threat_analysis':
        return await this.generateThreatAnalysisReport(start, end, filters);

      case 'policy_effectiveness':
        return await this.generatePolicyEffectivenessReport(start, end, filters);

      case 'user_activity':
        return await this.generateUserActivityReport(start, end, filters);

      default:
        throw new Error(`Unknown report type: ${type}`);
    }
  }

  async generateAccessSummaryReport(start, end, filters) {
    const stats = await AccessLog.aggregate([
      { $match: { timestamp: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          blockedRequests: {
            $sum: { $cond: [{ $eq: ['$action', 'blocked'] }, 1, 0] }
          },
          allowedRequests: {
            $sum: { $cond: [{ $eq: ['$action', 'allowed'] }, 1, 0] }
          },
          uniqueUsers: { $addToSet: '$userId' },
          uniqueDomains: { $addToSet: '$domain' },
          topCategories: { $push: '$categories' },
          topBlockedReasons: {
            $push: {
              $cond: {
                if: { $eq: ['$action', 'blocked'] },
                then: '$reason',
                else: null
              }
            }
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return {
        totalRequests: 0,
        blockedRequests: 0,
        allowedRequests: 0,
        blockRate: 0,
        uniqueUsers: 0,
        uniqueDomains: 0,
        topCategories: [],
        topBlockedReasons: []
      };
    }

    const data = stats[0];
    const allCategories = data.topCategories.flat().filter(Boolean);
    const allReasons = data.topBlockedReasons.filter(Boolean);

    return {
      totalRequests: data.totalRequests,
      blockedRequests: data.blockedRequests,
      allowedRequests: data.allowedRequests,
      blockRate: (data.blockedRequests / data.totalRequests) * 100,
      uniqueUsers: data.uniqueUsers.length,
      uniqueDomains: data.uniqueDomains.length,
      topCategories: this.getTopItems(allCategories, 10),
      topBlockedReasons: this.getTopItems(allReasons, 10)
    };
  }

  async generateThreatAnalysisReport(start, end, filters) {
    const threats = await UrlAnalysis.aggregate([
      { $match: { analysisTimestamp: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$threatLevel',
          count: { $sum: 1 },
          avgRiskScore: { $avg: '$riskScore' },
          domains: { $addToSet: '$domain' }
        }
      }
    ]);

    const alerts = await Alert.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 },
          types: { $addToSet: '$type' }
        }
      }
    ]);

    return {
      threatLevels: threats,
      alertSeverities: alerts,
      timeRange: { start, end }
    };
  }

  async generatePolicyEffectivenessReport(start, end, filters) {
    const policyStats = await AccessLog.aggregate([
      { $match: { timestamp: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$policy',
          blocks: {
            $sum: { $cond: [{ $eq: ['$action', 'blocked'] }, 1, 0] }
          },
          allows: {
            $sum: { $cond: [{ $eq: ['$action', 'allowed'] }, 1, 0] }
          }
        }
      }
    ]);

    return {
      policyStats,
      timeRange: { start, end }
    };
  }

  async generateUserActivityReport(start, end, filters) {
    const userStats = await AccessLog.aggregate([
      { $match: { timestamp: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$userId',
          totalRequests: { $sum: 1 },
          blockedRequests: {
            $sum: { $cond: [{ $eq: ['$action', 'blocked'] }, 1, 0] }
          },
          uniqueDomains: { $addToSet: '$domain' },
          lastActivity: { $max: '$timestamp' }
        }
      }
    ]);

    return {
      userStats,
      timeRange: { start, end }
    };
  }

  getTopItems(array, limit) {
    const counts = {};
    array.forEach(item => {
      if (item) counts[item] = (counts[item] || 0) + 1;
    });

    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([item, count]) => ({ item, count }));
  }

  // Real-time Statistics Endpoint
  async getRealTimeStats(req, res) {
    try {
      const { timeRange = '24h' } = req.query;

      const stats = await webFilterService.getRealTimeStats(timeRange);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get real-time stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve real-time statistics',
        details: error.message
      });
    }
  }

  // Health Check Endpoint
  async healthCheck(req, res) {
    try {
      // Check database connectivity
      const dbHealth = await this.checkDatabaseHealth();

      // Check external API connectivity
      const apiHealth = await this.checkAPIHealth();

      const overallHealth = dbHealth && apiHealth ? 'healthy' : 'degraded';

      res.json({
        success: true,
        data: {
          status: overallHealth,
          timestamp: new Date().toISOString(),
          services: {
            database: dbHealth ? 'healthy' : 'unhealthy',
            externalAPIs: apiHealth ? 'healthy' : 'degraded'
          },
          uptime: process.uptime()
        }
      });
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({
        success: false,
        error: 'Health check failed',
        details: error.message
      });
    }
  }

  async checkDatabaseHealth() {
    try {
      await AccessLog.findOne().limit(1);
      return true;
    } catch (error) {
      return false;
    }
  }

  async checkAPIHealth() {
    // Check a few key APIs
    const checks = [];

    if (process.env.WEBFILTER_GOOGLE_SAFE_BROWSING_API_KEY) {
      checks.push(this.checkAPIEndpoint('Google Safe Browsing'));
    }

    if (process.env.WEBFILTER_VIRUSTOTAL_DOMAIN_API_KEY) {
      checks.push(this.checkAPIEndpoint('VirusTotal'));
    }

    try {
      await Promise.all(checks);
      return true;
    } catch (error) {
      return false;
    }
  }

  async checkAPIEndpoint(service) {
    // Simplified health check - in real implementation, make actual API calls
    return Promise.resolve(true);
  }

  // Legacy methods for backward compatibility
  async analyze(req, res) {
    return this.analyzeUrl(req, res);
  }

  async scan(req, res) {
    return this.analyzeUrl(req, res);
  }
}

module.exports = new WebFilterController();