const Analysis = require('../models/Analysis.model');
const { ApiResponse } = require('../../../../../shared/utils/apiResponse');
const { ApiError } = require('../../../../../shared/utils/apiError');
const fraudService = require('../services/fraud.service');
const logger = require('../../../../../shared/utils/logger');

class AnalysisController {
  // Create new analysis
  async createAnalysis(req, res, next) {
    try {
      const {
        analysisType = 'real-time',
        startDate,
        endDate
      } = req.body;

      const timeRange = {
        start: startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end: endDate ? new Date(endDate) : new Date()
      };

      const analysis = new Analysis({
        userId: req.user.id,
        analysisType,
        timeRange,
        status: 'processing'
      });

      await analysis.save();

      // Perform analysis asynchronously
      setImmediate(async () => {
        try {
          const startTime = Date.now();

          // Get statistics
          const stats = await fraudService.calculateStatistics(req.user.id, timeRange);

          // Analyze patterns
          const patterns = await fraudService.analyzePatterns(req.user.id, timeRange);

          // Generate insights
          const insights = fraudService.generateInsights(stats, patterns);

          // Update analysis
          analysis.totalTransactions = stats.totalTransactions;
          analysis.fraudulentCount = stats.fraudulentCount;
          analysis.fraudRate = stats.fraudRate;
          analysis.totalAmount = stats.totalAmount;
          analysis.fraudulentAmount = stats.fraudulentAmount;
          analysis.patterns = patterns;
          analysis.riskDistribution = stats.riskDistribution;
          analysis.insights = insights;
          analysis.status = 'completed';
          analysis.completedAt = new Date();
          analysis.processingTime = Date.now() - startTime;

          await analysis.save();

          logger.info(`Analysis ${analysis._id} completed in ${analysis.processingTime}ms`);
        } catch (error) {
          logger.error(`Analysis ${analysis._id} failed: ${error.message}`);
          analysis.status = 'failed';
          await analysis.save();
        }
      });

      res.status(201).json(ApiResponse.created(analysis, 'Analysis started'));
    } catch (error) {
      next(error);
    }
  }

  // Get analysis by ID
  async getAnalysis(req, res, next) {
    try {
      const { id } = req.params;

      const analysis = await Analysis.findById(id);

      if (!analysis) {
        throw ApiError.notFound('Analysis not found');
      }

      if (analysis.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
      }

      res.json(ApiResponse.success(analysis));
    } catch (error) {
      next(error);
    }
  }

  // Get all analyses
  async getAnalyses(req, res, next) {
    try {
      const { page = 1, limit = 20, analysisType, status } = req.query;

      const query = { userId: req.user.id };

      if (analysisType) query.analysisType = analysisType;
      if (status) query.status = status;

      const analyses = await Analysis.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .lean();

      const total = await Analysis.countDocuments(query);

      res.json(ApiResponse.success({
        analyses,
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

  // Delete analysis
  async deleteAnalysis(req, res, next) {
    try {
      const { id } = req.params;

      const analysis = await Analysis.findById(id);

      if (!analysis) {
        throw ApiError.notFound('Analysis not found');
      }

      if (analysis.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
      }

      await analysis.deleteOne();

      res.json(ApiResponse.success(null, 'Analysis deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalysisController();
