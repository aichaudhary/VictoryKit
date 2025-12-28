import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../services/jwtService';

/**
 * Middleware to verify JWT token
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No authorization header provided'
      });
    }

    // Check if it's a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format. Use: Bearer <token>'
      });
    }

    // Extract token
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = JWTService.verifyAccessToken(token);

    // Attach user info to request
    (req as any).user = {
      userId: decoded.userId,
      email: decoded.email,
      subscription: decoded.subscription
    };

    next();
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid or expired token'
    });
  }
}

/**
 * Optional auth middleware - doesn't fail if no token
 */
export async function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = JWTService.verifyAccessToken(token);

      (req as any).user = {
        userId: decoded.userId,
        email: decoded.email,
        subscription: decoded.subscription
      };
    }

    next();
  } catch {
    // Token is invalid, but we don't fail - just continue without user
    next();
  }
}
