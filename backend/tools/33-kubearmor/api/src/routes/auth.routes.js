const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { body } = require('express-validator');
const auth = require('../middleware/auth.middleware');

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
];

const deactivateAccountValidation = [
  body('password').notEmpty().withMessage('Password is required to deactivate account')
];

// Public routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/social/:provider', authController.socialLogin);
router.post('/refresh-token', authController.refreshToken);
router.post('/request-password-reset', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], authController.requestPasswordReset);
router.post('/reset-password', resetPasswordValidation, authController.resetPassword);
router.post('/verify-email', [
  body('token').notEmpty().withMessage('Verification token is required')
], authController.verifyEmail);

// Protected routes
router.use(auth); // All routes below require authentication

router.post('/logout', authController.logout);
router.get('/profile', authController.getProfile);
router.put('/profile', [
  body('firstName').optional().trim().isLength({ min: 1 }).withMessage('First name cannot be empty'),
  body('lastName').optional().trim().isLength({ min: 1 }).withMessage('Last name cannot be empty')
], authController.updateProfile);
router.put('/change-password', changePasswordValidation, authController.changePassword);
router.post('/resend-verification', authController.resendVerification);
router.post('/setup-mfa', [
  body('method').isIn(['totp', 'sms', 'email']).withMessage('Invalid MFA method')
], authController.setupMfa);
router.post('/verify-mfa', [
  body('token').notEmpty().withMessage('MFA token is required'),
  body('method').isIn(['totp', 'sms', 'email']).withMessage('Invalid MFA method')
], authController.verifyMfa);
router.post('/send-mfa-code', [
  body('method').isIn(['sms', 'email']).withMessage('Invalid MFA method')
], authController.sendMfaCode);
router.post('/deactivate', deactivateAccountValidation, authController.deactivateAccount);

module.exports = router;