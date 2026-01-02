const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),
  body('organizationName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Organization name must be less than 100 characters'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validatePasswordReset = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  handleValidationErrors
];

const validatePasswordUpdate = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  handleValidationErrors
];

const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be less than 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors
];

// Organization validation rules
const validateOrganizationCreation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Organization name is required and must be less than 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('settings')
    .optional()
    .isObject()
    .withMessage('Settings must be a valid object'),
  handleValidationErrors
];

const validateOrganizationUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Organization name must be less than 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('settings')
    .optional()
    .isObject()
    .withMessage('Settings must be a valid object'),
  handleValidationErrors
];

const validateInviteUser = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('role')
    .isIn(['admin', 'member', 'viewer'])
    .withMessage('Role must be admin, member, or viewer'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),
  handleValidationErrors
];

// Vault validation rules
const validateVaultCreation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Vault name is required and must be less than 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('organizationId')
    .optional()
    .isMongoId()
    .withMessage('Organization ID must be a valid MongoDB ObjectId'),
  body('settings')
    .optional()
    .isObject()
    .withMessage('Settings must be a valid object'),
  handleValidationErrors
];

const validateVaultUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Vault name must be less than 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('settings')
    .optional()
    .isObject()
    .withMessage('Settings must be a valid object'),
  handleValidationErrors
];

const validateVaultSharing = [
  body('userId')
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),
  body('permissions')
    .isArray({ min: 1 })
    .withMessage('At least one permission is required'),
  body('permissions.*')
    .isIn(['read', 'write', 'admin'])
    .withMessage('Permissions must be read, write, or admin'),
  handleValidationErrors
];

// Secret validation rules
const validateSecretCreation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Secret name is required and must be less than 100 characters'),
  body('type')
    .isIn(['password', 'api_key', 'certificate', 'text', 'file'])
    .withMessage('Type must be password, api_key, certificate, text, or file'),
  body('vaultId')
    .isMongoId()
    .withMessage('Vault ID must be a valid MongoDB ObjectId'),
  body('data')
    .isObject()
    .withMessage('Secret data must be a valid object'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO 8601 date'),
  handleValidationErrors
];

const validateSecretUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Secret name must be less than 100 characters'),
  body('data')
    .optional()
    .isObject()
    .withMessage('Secret data must be a valid object'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO 8601 date'),
  handleValidationErrors
];

const validateBulkSecretOperation = [
  body('secretIds')
    .isArray({ min: 1, max: 100 })
    .withMessage('At least 1 and at most 100 secret IDs are required'),
  body('secretIds.*')
    .isMongoId()
    .withMessage('All secret IDs must be valid MongoDB ObjectIds'),
  handleValidationErrors
];

// Audit validation rules
const validateAuditQuery = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  query('action')
    .optional()
    .isIn(['login', 'logout', 'create', 'read', 'update', 'delete', 'share', 'export'])
    .withMessage('Action must be a valid audit action'),
  query('userId')
    .optional()
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),
  query('resourceType')
    .optional()
    .isIn(['user', 'vault', 'secret', 'organization'])
    .withMessage('Resource type must be user, vault, secret, or organization'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// MFA validation rules
const validateMFASetup = [
  body('method')
    .isIn(['totp', 'sms', 'email'])
    .withMessage('MFA method must be totp, sms, or email'),
  body('phone')
    .if(body('method').equals('sms'))
    .isMobilePhone()
    .withMessage('Valid phone number is required for SMS MFA'),
  handleValidationErrors
];

const validateMFAVerify = [
  body('code')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('MFA code must be 6 digits'),
  handleValidationErrors
];

// General validation rules
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('ID must be a valid MongoDB ObjectId'),
  handleValidationErrors
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordReset,
  validatePasswordUpdate,
  validateProfileUpdate,
  validateOrganizationCreation,
  validateOrganizationUpdate,
  validateInviteUser,
  validateVaultCreation,
  validateVaultUpdate,
  validateVaultSharing,
  validateSecretCreation,
  validateSecretUpdate,
  validateBulkSecretOperation,
  validateAuditQuery,
  validateMFASetup,
  validateMFAVerify,
  validateObjectId,
  validatePagination,
  handleValidationErrors
};