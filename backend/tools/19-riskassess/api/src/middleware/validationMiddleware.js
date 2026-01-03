const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Risk assessment validation
const validateRiskAssessment = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description must be max 2000 characters'),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity level'),
  body('impact').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid impact level'),
  body('probability').optional().isFloat({ min: 0, max: 1 }).withMessage('Probability must be between 0 and 1'),
  body('category').optional().isIn(['technical', 'operational', 'strategic', 'compliance', 'financial']).withMessage('Invalid category'),
  body('status').optional().isIn(['identified', 'assessed', 'mitigated', 'accepted', 'transferred']).withMessage('Invalid status'),
  handleValidationErrors
];

// AI analysis validation
const validateAIAnalysis = [
  body('riskId').isMongoId().withMessage('Valid risk ID required'),
  body('analysisType').optional().isIn(['comprehensive', 'quick', 'detailed']).withMessage('Invalid analysis type'),
  body('providers').optional().isArray().withMessage('Providers must be an array'),
  body('providers.*').optional().isIn(['openai', 'azure', 'anthropic', 'google']).withMessage('Invalid provider'),
  handleValidationErrors
];

// Threat intelligence validation
const validateThreatIntel = [
  body('query').optional().trim().isLength({ min: 1 }).withMessage('Query cannot be empty'),
  body('source').optional().isIn(['nvd', 'mitre', 'virustotal', 'alienvault', 'shodan', 'recordedfuture', 'crowdstrike']).withMessage('Invalid source'),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity'),
  handleValidationErrors
];

// Compliance validation
const validateCompliance = [
  body('framework').isIn(['nist', 'iso27001', 'owasp', 'gdpr', 'pci', 'hipaa', 'soc2']).withMessage('Invalid framework'),
  body('controlId').optional().trim().isLength({ min: 1 }).withMessage('Control ID cannot be empty'),
  body('status').optional().isIn(['compliant', 'non-compliant', 'not-applicable', 'compensating-control']).withMessage('Invalid status'),
  handleValidationErrors
];

// Report validation
const validateReport = [
  body('type').isIn(['risk-summary', 'compliance', 'trend-analysis', 'executive-summary']).withMessage('Invalid report type'),
  body('format').isIn(['pdf', 'excel', 'json', 'html']).withMessage('Invalid format'),
  body('filters').optional().isObject().withMessage('Filters must be an object'),
  body('dateRange').optional().isObject().withMessage('Date range must be an object'),
  handleValidationErrors
];

// Predictive analytics validation
const validatePredictiveAnalysis = [
  body('riskId').isMongoId().withMessage('Valid risk ID required'),
  body('timeframe').optional().isInt({ min: 1, max: 365 }).withMessage('Timeframe must be 1-365 days'),
  body('algorithm').optional().isIn(['linear', 'polynomial', 'exponential', 'classification']).withMessage('Invalid algorithm'),
  handleValidationErrors
];

// Collaboration validation
const validateCollaboration = [
  body('sessionId').isUUID().withMessage('Valid session ID required'),
  body('action').isIn(['join', 'leave', 'update', 'message']).withMessage('Invalid action'),
  body('data').optional().isObject().withMessage('Data must be an object'),
  handleValidationErrors
];

// Parameter validation for IDs
const validateId = [
  param('id').isMongoId().withMessage('Valid ID required'),
  handleValidationErrors
];

const validateRiskId = [
  param('riskId').isMongoId().withMessage('Valid risk ID required'),
  handleValidationErrors
];

const validateSessionId = [
  param('sessionId').isUUID().withMessage('Valid session ID required'),
  handleValidationErrors
];

// Query parameter validation
const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  query('sort').optional().isIn(['createdAt', 'updatedAt', 'severity', 'impact', 'probability']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRiskAssessment,
  validateAIAnalysis,
  validateThreatIntel,
  validateCompliance,
  validateReport,
  validatePredictiveAnalysis,
  validateCollaboration,
  validateId,
  validateRiskId,
  validateSessionId,
  validatePagination
};