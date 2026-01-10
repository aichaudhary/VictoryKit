const express = require('express');
const router = express.Router();
const vaultController = require('../controllers/vault.controller');
const { body, param } = require('express-validator');
const auth = require('../middleware/auth.middleware');

// Validation rules
const createVaultValidation = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Vault name is required and must be less than 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('type').optional().isIn(['personal', 'team', 'shared']).withMessage('Invalid vault type'),
  body('settings').optional().isObject().withMessage('Settings must be an object')
];

const updateVaultValidation = [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Vault name must be less than 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('settings').optional().isObject().withMessage('Settings must be an object')
];

const shareVaultValidation = [
  body('userId').isMongoId().withMessage('Valid user ID is required'),
  body('permissions').isArray().withMessage('Permissions must be an array'),
  body('permissions.*').isIn(['read', 'write', 'admin']).withMessage('Invalid permission'),
  body('message').optional().trim().isLength({ max: 500 }).withMessage('Message must be less than 500 characters')
];

const updateShareValidation = [
  body('permissions').isArray().withMessage('Permissions must be an array'),
  body('permissions.*').isIn(['read', 'write', 'admin']).withMessage('Invalid permission')
];

const vaultIdValidation = [
  param('vaultId').isMongoId().withMessage('Valid vault ID is required')
];

const shareIdValidation = [
  param('shareId').isMongoId().withMessage('Valid share ID is required')
];

// All routes require authentication
router.use(auth);

// Vault CRUD operations
router.post('/', createVaultValidation, vaultController.createVault);
router.get('/', vaultController.getVaults);
router.get('/:vaultId', vaultIdValidation, vaultController.getVault);
router.put('/:vaultId', vaultIdValidation.concat(updateVaultValidation), vaultController.updateVault);
router.delete('/:vaultId', vaultIdValidation, vaultController.deleteVault);

// Vault sharing
router.post('/:vaultId/share', vaultIdValidation.concat(shareVaultValidation), vaultController.shareVault);
router.get('/:vaultId/shares', vaultIdValidation, vaultController.getVaultShares);
router.put('/:vaultId/shares/:shareId', vaultIdValidation.concat(shareIdValidation, updateShareValidation), vaultController.updateVaultShare);
router.delete('/:vaultId/shares/:shareId', vaultIdValidation.concat(shareIdValidation), vaultController.removeVaultShare);

// Vault share invitations
router.post('/shares/:shareId/accept', [param('shareId').isMongoId()], vaultController.acceptVaultShare);
router.post('/shares/:shareId/decline', [param('shareId').isMongoId()], vaultController.declineVaultShare);
router.get('/shares/pending', vaultController.getPendingShares);

// Vault management
router.post('/:vaultId/rotate-key', vaultIdValidation, vaultController.rotateVaultKey);
router.get('/:vaultId/stats', vaultIdValidation, vaultController.getVaultStats);
router.get('/:vaultId/export', vaultIdValidation, vaultController.exportVault);
router.post('/:vaultId/import', vaultIdValidation, [
  body('data').notEmpty().withMessage('Import data is required'),
  body('format').optional().isIn(['json', 'csv']).withMessage('Invalid format')
], vaultController.importVault);

// Vault archiving
router.post('/:vaultId/archive', vaultIdValidation, vaultController.archiveVault);
router.post('/:vaultId/restore', vaultIdValidation, vaultController.restoreVault);
router.get('/archived', vaultController.getArchivedVaults);

// Vault ownership
router.post('/:vaultId/transfer-ownership', vaultIdValidation.concat([
  body('newOwnerId').isMongoId().withMessage('Valid new owner ID is required')
]), vaultController.transferOwnership);

// Vault activity
router.get('/:vaultId/activity', vaultIdValidation, vaultController.getVaultActivity);

module.exports = router;