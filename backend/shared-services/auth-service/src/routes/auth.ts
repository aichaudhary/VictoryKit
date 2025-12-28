import { Router } from 'express';
import { register, login, refreshToken, getMe, logout } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', login);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', refreshToken);

/**
 * GET /api/auth/me
 * Get current user (requires authentication)
 */
router.get('/me', authMiddleware, getMe);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', authMiddleware, logout);

export default router;
