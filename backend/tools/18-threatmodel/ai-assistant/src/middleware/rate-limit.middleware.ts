import { Request, Response, NextFunction } from 'express';

// Simple in-memory rate limiting
// In production, you'd want to use Redis or another persistent store
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes default
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'); // 100 requests default

  // Use IP address as identifier (in production, might want to use user ID for authenticated requests)
  const identifier = req.user?.id || req.ip || req.connection.remoteAddress || 'unknown';

  const now = Date.now();
  const windowStart = now - windowMs;

  // Get current rate limit entry
  let entry = rateLimitStore.get(identifier);

  if (!entry || entry.resetTime < windowStart) {
    // Create new entry or reset expired entry
    entry = {
      count: 0,
      resetTime: now + windowMs
    };
  }

  // Increment request count
  entry.count++;

  // Check if limit exceeded
  if (entry.count > maxRequests) {
    const resetTime = new Date(entry.resetTime);
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': resetTime.toISOString(),
      'Retry-After': retryAfter.toString()
    });

    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Too many requests. Try again after ${retryAfter} seconds.`,
        details: {
          limit: maxRequests,
          remaining: 0,
          resetTime: resetTime.toISOString(),
          retryAfter
        }
      }
    });
    return;
  }

  // Update store
  rateLimitStore.set(identifier, entry);

  // Set rate limit headers
  const remaining = Math.max(0, maxRequests - entry.count);
  const resetTime = new Date(entry.resetTime);

  res.set({
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': resetTime.toISOString()
  });

  next();
};

/**
 * Stricter rate limiting for AI analysis endpoints
 */
export const strictRateLimitMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const windowMs = 5 * 60 * 1000; // 5 minutes
  const maxRequests = 20; // 20 requests per 5 minutes for AI analysis

  const identifier = req.user?.id || req.ip || 'unknown';
  const key = `strict_${identifier}`;

  const now = Date.now();
  const windowStart = now - windowMs;

  let entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < windowStart) {
    entry = {
      count: 0,
      resetTime: now + windowMs
    };
  }

  entry.count++;

  if (entry.count > maxRequests) {
    const resetTime = new Date(entry.resetTime);
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': resetTime.toISOString(),
      'Retry-After': retryAfter.toString()
    });

    res.status(429).json({
      success: false,
      error: {
        code: 'STRICT_RATE_LIMIT_EXCEEDED',
        message: `AI analysis rate limit exceeded. Try again after ${retryAfter} seconds.`,
        details: {
          limit: maxRequests,
          remaining: 0,
          resetTime: resetTime.toISOString(),
          retryAfter
        }
      }
    });
    return;
  }

  rateLimitStore.set(key, entry);

  const remaining = Math.max(0, maxRequests - entry.count);
  const resetTime = new Date(entry.resetTime);

  res.set({
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': resetTime.toISOString()
  });

  next();
};

/**
 * Cleanup expired rate limit entries periodically
 */
export const cleanupRateLimitStore = (): void => {
  const now = Date.now();

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
};

// Clean up expired entries every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);