const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('redis');

// Redis client for distributed rate limiting (optional)
let redisClient = null;
if (process.env.REDIS_URL) {
  redisClient = Redis.createClient({ url: process.env.REDIS_URL });
  redisClient.connect().catch(console.error);
}

// Global rate limiter for all DNS Shield endpoints
const globalLimiter = rateLimit({
  store: redisClient ? new RedisStore({ client: redisClient }) : undefined,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    error: 'Rate limit exceeded',
    message: 'Too many requests from this IP. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for admin users
    return req.user && req.user.role === 'admin';
  },
  onLimitReached: (req, res) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip}, User: ${req.user?.id || 'unknown'}`);
  }
});

// Strict rate limiter for sensitive operations
const strictLimiter = rateLimit({
  store: redisClient ? new RedisStore({ client: redisClient }) : undefined,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // limit each IP to 100 requests per hour for sensitive operations
  message: {
    success: false,
    error: 'Rate limit exceeded',
    message: 'Too many sensitive operations. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for admin users
    return req.user && req.user.role === 'admin';
  }
});

// DNS Analysis specific rate limiter
const dnsAnalysisLimiter = rateLimit({
  store: redisClient ? new RedisStore({ client: redisClient }) : undefined,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 DNS analysis requests per windowMs
  message: {
    success: false,
    error: 'DNS Analysis Rate Limit Exceeded',
    message: 'Too many DNS analysis requests. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for admin and analyst users
    return req.user && ['admin', 'analyst'].includes(req.user.role);
  },
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return req.user?.id || req.ip;
  }
});

// Domain reputation check rate limiter
const domainReputationLimiter = rateLimit({
  store: redisClient ? new RedisStore({ client: redisClient }) : undefined,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 500, // limit each IP to 500 domain reputation checks per hour
  message: {
    success: false,
    error: 'Domain Reputation Rate Limit Exceeded',
    message: 'Too many domain reputation checks. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for admin and analyst users
    return req.user && ['admin', 'analyst'].includes(req.user.role);
  }
});

// Policy management rate limiter
const policyManagementLimiter = rateLimit({
  store: redisClient ? new RedisStore({ client: redisClient }) : undefined,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // limit each IP to 50 policy management operations per hour
  message: {
    success: false,
    error: 'Policy Management Rate Limit Exceeded',
    message: 'Too many policy management operations. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for admin users only
    return req.user && req.user.role === 'admin';
  }
});

// Alert management rate limiter
const alertManagementLimiter = rateLimit({
  store: redisClient ? new RedisStore({ client: redisClient }) : undefined,
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 100, // limit each IP to 100 alert management operations per 30 minutes
  message: {
    success: false,
    error: 'Alert Management Rate Limit Exceeded',
    message: 'Too many alert management operations. Please try again later.',
    retryAfter: '30 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for admin and analyst users
    return req.user && ['admin', 'analyst'].includes(req.user.role);
  }
});

// Report generation rate limiter
const reportGenerationLimiter = rateLimit({
  store: redisClient ? new RedisStore({ client: redisClient }) : undefined,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 20 report generations per hour
  message: {
    success: false,
    error: 'Report Generation Rate Limit Exceeded',
    message: 'Too many report generation requests. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for admin and analyst users
    return req.user && ['admin', 'analyst'].includes(req.user.role);
  }
});

// Statistics endpoint rate limiter
const statisticsLimiter = rateLimit({
  store: redisClient ? new RedisStore({ client: redisClient }) : undefined,
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 60, // limit each IP to 60 statistics requests per 5 minutes
  message: {
    success: false,
    error: 'Statistics Rate Limit Exceeded',
    message: 'Too many statistics requests. Please try again later.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for admin and analyst users
    return req.user && ['admin', 'analyst'].includes(req.user.role);
  }
});

// Query history rate limiter
const queryHistoryLimiter = rateLimit({
  store: redisClient ? new RedisStore({ client: redisClient }) : undefined,
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50, // limit each IP to 50 query history requests per 10 minutes
  message: {
    success: false,
    error: 'Query History Rate Limit Exceeded',
    message: 'Too many query history requests. Please try again later.',
    retryAfter: '10 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for admin and analyst users
    return req.user && ['admin', 'analyst'].includes(req.user.role);
  }
});

// API key authentication rate limiter (for service-to-service calls)
const apiKeyLimiter = rateLimit({
  store: redisClient ? new RedisStore({ client: redisClient }) : undefined,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10000, // higher limit for API key authenticated requests
  message: {
    success: false,
    error: 'API Key Rate Limit Exceeded',
    message: 'Too many API requests. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use API key as the rate limit key
    return req.apiKey || req.ip;
  }
});

// Burst protection limiter (very short window for burst protection)
const burstLimiter = rateLimit({
  store: redisClient ? new RedisStore({ client: redisClient }) : undefined,
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per minute
  message: {
    success: false,
    error: 'Burst Rate Limit Exceeded',
    message: 'Too many requests in a short time. Please slow down.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip burst limiting for admin users
    return req.user && req.user.role === 'admin';
  }
});

// Create custom rate limiter factory
const createCustomLimiter = (options) => {
  const defaultOptions = {
    store: redisClient ? new RedisStore({ client: redisClient }) : undefined,
    windowMs: 15 * 60 * 1000, // 15 minutes default
    max: 100, // 100 requests default
    message: {
      success: false,
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      retryAfter: `${Math.ceil(options.windowMs / 60000)} minutes`
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for admin users by default
      return req.user && req.user.role === 'admin';
    }
  };

  return rateLimit({ ...defaultOptions, ...options });
};

// Rate limit monitoring middleware
const rateLimitMonitor = (req, res, next) => {
  // Store original res.end
  const originalEnd = res.end;

  res.end = function(...args) {
    // Check if this is a rate limited response
    if (res.statusCode === 429) {
      console.warn(`Rate limit triggered: ${req.method} ${req.url} - IP: ${req.ip}`);
    }

    // Call original res.end
    originalEnd.apply(this, args);
  };

  next();
};

// Graceful shutdown for Redis
process.on('SIGTERM', () => {
  if (redisClient) {
    redisClient.quit();
  }
});

process.on('SIGINT', () => {
  if (redisClient) {
    redisClient.quit();
  }
});

module.exports = {
  globalLimiter,
  strictLimiter,
  dnsAnalysisLimiter,
  domainReputationLimiter,
  policyManagementLimiter,
  alertManagementLimiter,
  reportGenerationLimiter,
  statisticsLimiter,
  queryHistoryLimiter,
  apiKeyLimiter,
  burstLimiter,
  createCustomLimiter,
  rateLimitMonitor
};