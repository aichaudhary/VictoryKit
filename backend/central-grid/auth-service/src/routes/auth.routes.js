const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { validate } = require('../../../../shared/middleware/validation.middleware');
const { authMiddleware } = require('../../../../shared/middleware/auth.middleware');
const { authLimiter, apiLimiter } = require('../../../../shared/middleware/rateLimiter.middleware');

const router = express.Router();

// Public routes with strict rate limiting
router.post(
  '/register',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('organization').optional().trim(),
    validate
  ],
  authController.register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  authController.login
);

router.post(
  '/request-password-reset',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    validate
  ],
  authController.requestPasswordReset
);

router.post(
  '/reset-password',
  authLimiter,
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    validate
  ],
  authController.resetPassword
);

// Protected routes
router.use(authMiddleware);

router.post('/logout', apiLimiter, authController.logout);

router.get('/profile', apiLimiter, authController.getProfile);

router.put(
  '/profile',
  apiLimiter,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('organization').optional().trim(),
    body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
    validate
  ],
  authController.updateProfile
);

router.post(
  '/change-password',
  authLimiter,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    validate
  ],
  authController.changePassword
);

router.post('/verify-session', apiLimiter, authController.verifySession);

router.get('/sessions', apiLimiter, authController.getSessions);

router.delete('/sessions/:sessionId', apiLimiter, authController.revokeSession);

module.exports = router;
