const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organization.controller');
const { body, param } = require('express-validator');
const auth = require('../middleware/auth.middleware');

// Validation rules
const createOrganizationValidation = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Organization name is required and must be less than 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('settings').optional().isObject().withMessage('Settings must be an object')
];

const updateOrganizationValidation = [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Organization name must be less than 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('settings').optional().isObject().withMessage('Settings must be an object')
];

const inviteUserValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('role').isIn(['member', 'admin']).withMessage('Role must be member or admin'),
  body('message').optional().trim().isLength({ max: 500 }).withMessage('Message must be less than 500 characters')
];

const updateMemberValidation = [
  body('role').isIn(['member', 'admin']).withMessage('Role must be member or admin')
];

const organizationIdValidation = [
  param('organizationId').isMongoId().withMessage('Valid organization ID is required')
];

const memberIdValidation = [
  param('memberId').isMongoId().withMessage('Valid member ID is required')
];

const invitationIdValidation = [
  param('invitationId').isMongoId().withMessage('Valid invitation ID is required')
];

const apiKeyValidation = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('API key name is required'),
  body('permissions').isArray().withMessage('Permissions must be an array'),
  body('permissions.*').isIn(['read', 'write', 'admin']).withMessage('Invalid permission'),
  body('expiresAt').optional().isISO8601().withMessage('Invalid expiration date')
];

const keyIdValidation = [
  param('keyId').isMongoId().withMessage('Valid API key ID is required')
];

// All routes require authentication
router.use(auth);

// Organization CRUD operations
router.post('/', createOrganizationValidation, organizationController.createOrganization);
router.get('/', organizationController.getUserOrganizations);
router.get('/:organizationId', organizationIdValidation, organizationController.getOrganization);
router.put('/:organizationId', organizationIdValidation.concat(updateOrganizationValidation), organizationController.updateOrganization);
router.delete('/:organizationId', organizationIdValidation, organizationController.deleteOrganization);

// Organization invitations
router.post('/:organizationId/invite', organizationIdValidation.concat(inviteUserValidation), organizationController.inviteUser);
router.post('/invitations/:invitationId/accept', invitationIdValidation, organizationController.acceptInvitation);
router.post('/invitations/:invitationId/decline', invitationIdValidation, organizationController.declineInvitation);
router.get('/invitations/pending', organizationController.getPendingInvitations);

// Organization members
router.get('/:organizationId/members', organizationIdValidation, organizationController.getOrganizationMembers);
router.put('/:organizationId/members/:memberId', organizationIdValidation.concat(memberIdValidation, updateMemberValidation), organizationController.updateMemberRole);
router.delete('/:organizationId/members/:memberId', organizationIdValidation.concat(memberIdValidation), organizationController.removeMember);

// Organization ownership
router.post('/:organizationId/transfer-ownership', organizationIdValidation.concat([
  body('newOwnerId').isMongoId().withMessage('Valid new owner ID is required')
]), organizationController.transferOwnership);

// Organization settings
router.get('/:organizationId/settings', organizationIdValidation, organizationController.getOrganizationSettings);
router.put('/:organizationId/settings', organizationIdValidation.concat([
  body('settings').isObject().withMessage('Settings must be an object')
]), organizationController.updateOrganizationSettings);

// Organization statistics and activity
router.get('/:organizationId/stats', organizationIdValidation, organizationController.getOrganizationStats);
router.get('/:organizationId/activity', organizationIdValidation, organizationController.getOrganizationActivity);

// API key management
router.post('/:organizationId/api-keys', organizationIdValidation.concat(apiKeyValidation), organizationController.createApiKey);
router.get('/:organizationId/api-keys', organizationIdValidation, organizationController.getApiKeys);
router.put('/:organizationId/api-keys/:keyId', organizationIdValidation.concat(keyIdValidation), organizationController.updateApiKey);
router.delete('/:organizationId/api-keys/:keyId', organizationIdValidation.concat(keyIdValidation), organizationController.deleteApiKey);
router.post('/:organizationId/api-keys/:keyId/regenerate', organizationIdValidation.concat(keyIdValidation), organizationController.regenerateApiKey);

// Billing and subscription (placeholder for future implementation)
router.get('/:organizationId/billing', organizationIdValidation, organizationController.getBillingInfo);
router.put('/:organizationId/billing', organizationIdValidation.concat([
  body('billingData').isObject().withMessage('Billing data must be an object')
]), organizationController.updateBilling);

router.get('/:organizationId/subscription', organizationIdValidation, organizationController.getSubscription);
router.put('/:organizationId/subscription', organizationIdValidation.concat([
  body('planId').isMongoId().withMessage('Valid plan ID is required')
]), organizationController.updateSubscription);

module.exports = router;