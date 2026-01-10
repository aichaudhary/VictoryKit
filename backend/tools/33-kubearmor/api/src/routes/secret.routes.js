const express = require('express');
const router = express.Router();
const secretController = require('../controllers/secret.controller');
const { body, param, query } = require('express-validator');
const auth = require('../middleware/auth.middleware');

// Validation rules
const createSecretValidation = [
  body('vaultId').isMongoId().withMessage('Valid vault ID is required'),
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Secret name is required and must be less than 100 characters'),
  body('type').isIn(['password', 'text', 'file', 'certificate', 'api_key', 'token', 'other']).withMessage('Invalid secret type'),
  body('data').notEmpty().withMessage('Secret data is required'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').optional().trim().isLength({ max: 50 }).withMessage('Each tag must be less than 50 characters'),
  body('expiresAt').optional().isISO8601().withMessage('Invalid expiration date'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters')
];

const updateSecretValidation = [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Secret name must be less than 100 characters'),
  body('data').optional().notEmpty().withMessage('Secret data cannot be empty'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').optional().trim().isLength({ max: 50 }).withMessage('Each tag must be less than 50 characters'),
  body('expiresAt').optional().isISO8601().withMessage('Invalid expiration date'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters')
];

const bulkOperationValidation = [
  body('secretIds').isArray().withMessage('Secret IDs must be an array'),
  body('secretIds.*').isMongoId().withMessage('Valid secret ID is required')
];

const moveCopyValidation = [
  body('secretIds').isArray().withMessage('Secret IDs must be an array'),
  body('secretIds.*').isMongoId().withMessage('Valid secret ID is required'),
  body('targetVaultId').isMongoId().withMessage('Valid target vault ID is required')
];

const generatePasswordValidation = [
  body('length').optional().isInt({ min: 8, max: 128 }).withMessage('Password length must be between 8 and 128'),
  body('includeUppercase').optional().isBoolean().withMessage('includeUppercase must be a boolean'),
  body('includeLowercase').optional().isBoolean().withMessage('includeLowercase must be a boolean'),
  body('includeNumbers').optional().isBoolean().withMessage('includeNumbers must be a boolean'),
  body('includeSymbols').optional().isBoolean().withMessage('includeSymbols must be a boolean')
];

const vaultIdValidation = [
  param('vaultId').isMongoId().withMessage('Valid vault ID is required')
];

const secretIdValidation = [
  param('secretId').isMongoId().withMessage('Valid secret ID is required')
];

const versionIdValidation = [
  param('versionId').isMongoId().withMessage('Valid version ID is required')
];

// All routes require authentication
router.use(auth);

// Secret CRUD operations
router.post('/', createSecretValidation, secretController.createSecret);
router.get('/vault/:vaultId', vaultIdValidation, secretController.getSecrets);
router.get('/:secretId', secretIdValidation, secretController.getSecret);
router.put('/:secretId', secretIdValidation.concat(updateSecretValidation), secretController.updateSecret);
router.delete('/:secretId', secretIdValidation, secretController.deleteSecret);

// Secret versioning
router.get('/:secretId/versions', secretIdValidation, secretController.getSecretVersions);
router.post('/:secretId/versions/:versionId/restore', secretIdValidation.concat(versionIdValidation), secretController.restoreSecretVersion);

// Bulk operations
router.post('/bulk-create', [
  body('vaultId').isMongoId().withMessage('Valid vault ID is required'),
  body('secrets').isArray().withMessage('Secrets must be an array'),
  body('secrets.*.name').trim().isLength({ min: 1, max: 100 }).withMessage('Secret name is required'),
  body('secrets.*.type').isIn(['password', 'text', 'file', 'certificate', 'api_key', 'token', 'other']).withMessage('Invalid secret type'),
  body('secrets.*.data').notEmpty().withMessage('Secret data is required')
], secretController.bulkCreateSecrets);

router.put('/bulk-update', [
  body('vaultId').isMongoId().withMessage('Valid vault ID is required'),
  body('updates').isArray().withMessage('Updates must be an array'),
  body('updates.*.secretId').isMongoId().withMessage('Valid secret ID is required')
], secretController.bulkUpdateSecrets);

router.delete('/bulk-delete', bulkOperationValidation, secretController.bulkDeleteSecrets);

// Move and copy operations
router.post('/move', moveCopyValidation, secretController.moveSecrets);
router.post('/copy', moveCopyValidation, secretController.copySecrets);

// Search and filtering
router.get('/search', secretController.searchSecrets);

// Statistics and analytics
router.get('/vault/:vaultId/stats', vaultIdValidation, secretController.getSecretStats);
router.get('/expired', secretController.getExpiredSecrets);
router.get('/expiring', [
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
], secretController.getExpiringSecrets);

// Import/Export
router.get('/vault/:vaultId/export', vaultIdValidation, secretController.exportSecrets);
router.post('/vault/:vaultId/import', vaultIdValidation.concat([
  body('data').notEmpty().withMessage('Import data is required'),
  body('format').optional().isIn(['json', 'csv']).withMessage('Invalid format')
]), secretController.importSecrets);

// Tags management
router.get('/tags', secretController.getSecretTags);

// Activity logging
router.get('/:secretId/activity', secretIdValidation, secretController.getSecretActivity);

// Password generation and analysis
router.post('/generate-password', generatePasswordValidation, secretController.generatePassword);
router.post('/analyze-password', [
  body('password').notEmpty().withMessage('Password is required')
], secretController.analyzePassword);

module.exports = router;