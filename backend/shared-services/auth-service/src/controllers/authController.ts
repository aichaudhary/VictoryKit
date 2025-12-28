import { Request, Response } from 'express';
import { User } from '../models/User';
import { JWTService } from '../services/jwtService';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import Joi from 'joi';

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function register(req: Request, res: Response) {
  try {
    // Validate input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(d => d.message)
      });
    }

    const { email, password, firstName, lastName } = value;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      emailVerified: false,
      subscription: {
        plan: 'free',
        status: 'active'
      }
    });

    // Generate tokens
    const tokens = JWTService.generateTokens(user);

    // Return response (exclude password)
    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
      subscription: user.subscription,
      createdAt: user.createdAt
    };

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        ...tokens
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response) {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(d => d.message)
      });
    }

    const { email, password } = value;

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user used OAuth (no password)
    if (!user.password && user.oauth) {
      return res.status(400).json({
        success: false,
        message: `This account uses ${user.oauth.provider} login. Please use ${user.oauth.provider} to sign in.`
      });
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const tokens = JWTService.generateTokens(user);

    // Return response (exclude password)
    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
      avatar: user.avatar,
      subscription: user.subscription,
      lastLogin: user.lastLogin
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        ...tokens
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export async function refreshToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = JWTService.verifyRefreshToken(refreshToken);

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new tokens
    const tokens = JWTService.generateTokens(user);

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: tokens
    });
  } catch (error: any) {
    console.error('Refresh token error:', error);
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid refresh token'
    });
  }
}

/**
 * Get current user profile
 * GET /api/auth/me
 */
export async function getMe(req: Request, res: Response) {
  try {
    // User is attached to req by authMiddleware
    const userId = (req as any).user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
      avatar: user.avatar,
      subscription: user.subscription,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    };

    return res.status(200).json({
      success: true,
      data: { user: userResponse }
    });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

/**
 * Logout user
 * POST /api/auth/logout
 */
export async function logout(req: Request, res: Response) {
  try {
    // In a production app, you would invalidate the token here
    // For now, we'll just return success
    // You could add token to a blacklist in Redis

    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
