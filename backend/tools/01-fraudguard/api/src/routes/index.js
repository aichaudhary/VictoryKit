const express = require('express');
const { body, query } = require('express-validator');
const transactionController = require('../controllers/transaction.controller');
const analysisController = require('../controllers/analysis.controller');
const reportController = require('../controllers/report.controller');
const { validate } = require('../../../../../shared/middleware/validation.middleware');
const { mlLimiter, apiLimiter } = require('../../../../../shared/middleware/rateLimiter.middleware');

const router = express.Router();

// ===========================
// TRANSACTION ROUTES
// ===========================

// Analyze single transaction
router.post(
  '/transactions/analyze',
  mlLimiter,
  [
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('currency').optional().isString().isLength({ min: 3, max: 3 }),
    body('merchantInfo.name').optional().isString(),
    body('paymentMethod').isIn(['credit_card', 'debit_card', 'bank_transfer', 'crypto', 'digital_wallet', 'other']),
    validate
  ],
  transactionController.analyzeTransaction
);

// Batch analyze transactions
router.post(
  '/transactions/batch-analyze',
  mlLimiter,
  [
    body('transactions').isArray({ min: 1, max: 100 }),
    validate
  ],
  transactionController.batchAnalyze
);

// Get all transactions
router.get(
  '/transactions',
  apiLimiter,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('riskLevel').optional().isIn(['low', 'medium', 'high', 'critical']),
    query('status').optional().isIn(['pending', 'approved', 'rejected', 'reviewing', 'disputed']),
    validate
  ],
  transactionController.getTransactions
);

// Get transaction by ID
router.get(
  '/transactions/:id',
  apiLimiter,
  transactionController.getTransaction
);

// Update transaction status
router.patch(
  '/transactions/:id/status',
  apiLimiter,
  [
    body('status').isIn(['pending', 'approved', 'rejected', 'reviewing', 'disputed']),
    body('notes').optional().isString(),
    validate
  ],
  transactionController.updateStatus
);

// Delete transaction
router.delete(
  '/transactions/:id',
  apiLimiter,
  transactionController.deleteTransaction
);

// Get statistics
router.get(
  '/statistics',
  apiLimiter,
  transactionController.getStatistics
);

// ===========================
// ANALYSIS ROUTES
// ===========================

// Create analysis
router.post(
  '/analyses',
  apiLimiter,
  [
    body('analysisType').optional().isIn(['real-time', 'batch', 'historical', 'pattern']),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    validate
  ],
  analysisController.createAnalysis
);

// Get all analyses
router.get(
  '/analyses',
  apiLimiter,
  analysisController.getAnalyses
);

// Get analysis by ID
router.get(
  '/analyses/:id',
  apiLimiter,
  analysisController.getAnalysis
);

// Delete analysis
router.delete(
  '/analyses/:id',
  apiLimiter,
  analysisController.deleteAnalysis
);

// ===========================
// REPORT ROUTES
// ===========================

// Generate report
router.post(
  '/reports',
  apiLimiter,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('reportType').optional().isIn(['daily', 'weekly', 'monthly', 'custom', 'incident']),
    body('description').optional().isString(),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    body('format').optional().isIn(['pdf', 'html', 'json', 'csv']),
    validate
  ],
  reportController.generateReport
);

// Get all reports
router.get(
  '/reports',
  apiLimiter,
  reportController.getReports
);

// Get report by ID
router.get(
  '/reports/:id',
  apiLimiter,
  reportController.getReport
);

// Export report
router.get(
  '/reports/:id/export',
  apiLimiter,
  reportController.exportReport
);

// Delete report
router.delete(
  '/reports/:id',
  apiLimiter,
  reportController.deleteReport
);

module.exports = router;
