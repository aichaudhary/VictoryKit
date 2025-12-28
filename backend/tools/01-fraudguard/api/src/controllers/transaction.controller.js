const Transaction = require('../models/Transaction.model');
const { ApiResponse } = require('../../../../../shared/utils/apiResponse');
const { ApiError } = require('../../../../../shared/utils/apiError');
const mlService = require('../services/ml.service');
const fraudService = require('../services/fraud.service');
const logger = require('../../../../../shared/utils/logger');

class TransactionController {
  // Analyze transaction for fraud
  async analyzeTransaction(req, res, next) {
    try {
      const {
        amount,
        currency,
        merchantInfo,
        paymentMethod,
        cardInfo,
        ipAddress,
        deviceFingerprint,
        geolocation
      } = req.body;

      // Generate unique transaction ID
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create transaction record
      const transaction = new Transaction({
        userId: req.user.id,
        transactionId,
        amount,
        currency: currency || 'USD',
        merchantInfo,
        paymentMethod,
        cardInfo,
        ipAddress: ipAddress || req.ip,
        deviceFingerprint,
        geolocation,
        timestamp: new Date()
      });

      // Call ML service for prediction
      const mlPrediction = await mlService.predictFraud({
        amount,
        merchantInfo,
        paymentMethod,
        ipAddress: ipAddress || req.ip,
        deviceFingerprint,
        geolocation
      });

      // Update transaction with ML results
      transaction.fraudScore = mlPrediction.score;
      transaction.mlPrediction = {
        score: mlPrediction.score,
        confidence: mlPrediction.confidence,
        model: mlPrediction.model,
        version: mlPrediction.version,
        timestamp: new Date(),
        features: mlPrediction.features
      };

      // Determine risk level
      transaction.riskLevel = fraudService.calculateRiskLevel(mlPrediction.score);
      transaction.isFraudulent = mlPrediction.score >= 70;
      
      // Set status based on risk
      if (mlPrediction.score >= 80) {
        transaction.status = 'rejected';
      } else if (mlPrediction.score >= 50) {
        transaction.status = 'reviewing';
      } else {
        transaction.status = 'approved';
      }

      // Add rule flags
      if (mlPrediction.flags && mlPrediction.flags.length > 0) {
        transaction.ruleFlags = mlPrediction.flags.map(flag => ({
          ...flag,
          timestamp: new Date()
        }));
      }

      await transaction.save();

      logger.info(`Transaction analyzed: ${transactionId}, Score: ${mlPrediction.score}, Risk: ${transaction.riskLevel}`);

      res.json(ApiResponse.success(transaction, 'Transaction analyzed successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Get transaction by ID
  async getTransaction(req, res, next) {
    try {
      const { id } = req.params;

      const transaction = await Transaction.findById(id);

      if (!transaction) {
        throw ApiError.notFound('Transaction not found');
      }

      // Ensure user can only access their own transactions (unless admin)
      if (transaction.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
      }

      res.json(ApiResponse.success(transaction));
    } catch (error) {
      next(error);
    }
  }

  // Get user transactions with filtering and pagination
  async getTransactions(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        riskLevel,
        status,
        isFraudulent,
        startDate,
        endDate,
        minAmount,
        maxAmount,
        sortBy = 'timestamp',
        sortOrder = 'desc'
      } = req.query;

      const query = { userId: req.user.id };

      // Apply filters
      if (riskLevel) query.riskLevel = riskLevel;
      if (status) query.status = status;
      if (isFraudulent !== undefined) query.isFraudulent = isFraudulent === 'true';
      
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      if (minAmount || maxAmount) {
        query.amount = {};
        if (minAmount) query.amount.$gte = parseFloat(minAmount);
        if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
      }

      const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      const transactions = await Transaction.find(query)
        .sort(sort)
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .lean();

      const total = await Transaction.countDocuments(query);

      res.json(ApiResponse.success({
        transactions,
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

  // Get fraud statistics
  async getStatistics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      const timeRange = {
        start: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: endDate ? new Date(endDate) : new Date()
      };

      const stats = await fraudService.calculateStatistics(req.user.id, timeRange);

      res.json(ApiResponse.success(stats));
    } catch (error) {
      next(error);
    }
  }

  // Update transaction status (review/approve/reject)
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const transaction = await Transaction.findById(id);

      if (!transaction) {
        throw ApiError.notFound('Transaction not found');
      }

      if (transaction.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
      }

      transaction.status = status;
      transaction.reviewedBy = req.user.id;
      transaction.reviewedAt = new Date();
      if (notes) transaction.reviewNotes = notes;

      await transaction.save();

      logger.info(`Transaction ${transaction.transactionId} status updated to ${status} by ${req.user.email}`);

      res.json(ApiResponse.success(transaction, 'Transaction status updated'));
    } catch (error) {
      next(error);
    }
  }

  // Delete transaction
  async deleteTransaction(req, res, next) {
    try {
      const { id } = req.params;

      const transaction = await Transaction.findById(id);

      if (!transaction) {
        throw ApiError.notFound('Transaction not found');
      }

      if (transaction.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
      }

      await transaction.deleteOne();

      logger.info(`Transaction ${transaction.transactionId} deleted by ${req.user.email}`);

      res.json(ApiResponse.success(null, 'Transaction deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Batch analyze transactions
  async batchAnalyze(req, res, next) {
    try {
      const { transactions } = req.body;

      if (!Array.isArray(transactions) || transactions.length === 0) {
        throw ApiError.badRequest('Transactions array is required');
      }

      if (transactions.length > 100) {
        throw ApiError.badRequest('Maximum 100 transactions per batch');
      }

      const results = [];

      for (const txData of transactions) {
        try {
          const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
          
          const mlPrediction = await mlService.predictFraud(txData);

          const transaction = new Transaction({
            userId: req.user.id,
            transactionId,
            ...txData,
            fraudScore: mlPrediction.score,
            riskLevel: fraudService.calculateRiskLevel(mlPrediction.score),
            isFraudulent: mlPrediction.score >= 70,
            mlPrediction: {
              score: mlPrediction.score,
              confidence: mlPrediction.confidence,
              model: mlPrediction.model,
              version: mlPrediction.version,
              timestamp: new Date()
            },
            status: mlPrediction.score >= 70 ? 'rejected' : 'approved'
          });

          await transaction.save();
          results.push({ success: true, transaction });
        } catch (error) {
          results.push({ success: false, error: error.message });
        }
      }

      res.json(ApiResponse.success({
        total: transactions.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      }, 'Batch analysis completed'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TransactionController();
