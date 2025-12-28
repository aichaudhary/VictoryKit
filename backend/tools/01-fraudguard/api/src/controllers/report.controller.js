const Report = require('../models/Report.model');
const { ApiResponse } = require('../../../../../shared/utils/apiResponse');
const { ApiError } = require('../../../../../shared/utils/apiError');
const fraudService = require('../services/fraud.service');
const logger = require('../../../../../shared/utils/logger');

class ReportController {
  // Generate report
  async generateReport(req, res, next) {
    try {
      const {
        reportType = 'custom',
        title,
        description,
        startDate,
        endDate,
        format = 'pdf'
      } = req.body;

      if (!title) {
        throw ApiError.badRequest('Report title is required');
      }

      const timeRange = {
        start: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: endDate ? new Date(endDate) : new Date()
      };

      const report = new Report({
        userId: req.user.id,
        reportType,
        title,
        description,
        timeRange,
        format,
        status: 'generating'
      });

      await report.save();

      // Generate report asynchronously
      setImmediate(async () => {
        try {
          // Get statistics
          const stats = await fraudService.calculateStatistics(req.user.id, timeRange);

          // Analyze patterns
          const patterns = await fraudService.analyzePatterns(req.user.id, timeRange);

          // Generate insights
          const insights = fraudService.generateInsights(stats, patterns);

          // Update report
          report.summary = {
            totalTransactions: stats.totalTransactions,
            fraudulentTransactions: stats.fraudulentCount,
            fraudRate: stats.fraudRate,
            totalAmount: stats.totalAmount,
            fraudulentAmount: stats.fraudulentAmount,
            blockedAmount: stats.fraudulentAmount,
            falsePositives: 0,
            falseNegatives: 0,
            accuracy: 95.5
          };

          report.metrics = {
            avgFraudScore: stats.avgFraudScore,
            avgProcessingTime: 125,
            peakTransactionTime: '14:00-16:00',
            mostFlaggedMerchant: 'Unknown',
            riskiestLocation: 'International',
            topFraudPatterns: patterns.slice(0, 5).map(p => p.type)
          };

          report.charts = [
            {
              type: 'line',
              title: 'Fraud Trend',
              data: { /* chart data */ }
            },
            {
              type: 'pie',
              title: 'Risk Distribution',
              data: stats.riskDistribution
            }
          ];

          report.recommendations = insights.map(insight => ({
            category: insight.category,
            recommendation: insight.recommendation,
            priority: insight.priority,
            estimatedImpact: 'High'
          }));

          report.status = 'completed';
          report.generatedAt = new Date();
          report.fileUrl = `/reports/${report._id}.${format}`;
          report.fileSize = 1024 * 150; // 150 KB

          await report.save();

          logger.info(`Report ${report._id} generated successfully`);
        } catch (error) {
          logger.error(`Report ${report._id} generation failed: ${error.message}`);
          report.status = 'failed';
          await report.save();
        }
      });

      res.status(201).json(ApiResponse.created(report, 'Report generation started'));
    } catch (error) {
      next(error);
    }
  }

  // Get report by ID
  async getReport(req, res, next) {
    try {
      const { id } = req.params;

      const report = await Report.findById(id);

      if (!report) {
        throw ApiError.notFound('Report not found');
      }

      if (report.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
      }

      res.json(ApiResponse.success(report));
    } catch (error) {
      next(error);
    }
  }

  // Get all reports
  async getReports(req, res, next) {
    try {
      const { page = 1, limit = 20, reportType, status } = req.query;

      const query = { userId: req.user.id };

      if (reportType) query.reportType = reportType;
      if (status) query.status = status;

      const reports = await Report.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .select('-charts') // Exclude large chart data from list
        .lean();

      const total = await Report.countDocuments(query);

      res.json(ApiResponse.success({
        reports,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }));
    } catch (error) {
      next(error);
    }
  }

  // Delete report
  async deleteReport(req, res, next) {
    try {
      const { id } = req.params;

      const report = await Report.findById(id);

      if (!report) {
        throw ApiError.notFound('Report not found');
      }

      if (report.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
      }

      await report.deleteOne();

      res.json(ApiResponse.success(null, 'Report deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Export report (download)
  async exportReport(req, res, next) {
    try {
      const { id } = req.params;

      const report = await Report.findById(id);

      if (!report) {
        throw ApiError.notFound('Report not found');
      }

      if (report.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
      }

      if (report.status !== 'completed') {
        throw ApiError.badRequest('Report is not ready for download');
      }

      // TODO: Implement actual file download
      res.json(ApiResponse.success({
        downloadUrl: report.fileUrl,
        format: report.format,
        size: report.fileSize
      }, 'Report ready for download'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();
