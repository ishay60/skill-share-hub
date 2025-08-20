import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { Request, Response } from 'express';

// Custom key generator for authenticated users
const keyGenerator = (req: Request): string => {
  const authenticatedReq = req as any;

  // Use user ID if authenticated, otherwise fall back to IP
  if (authenticatedReq.user?.id) {
    return `user:${authenticatedReq.user.id}`;
  }

  // Use IP address as fallback
  return req.ip || req.connection.remoteAddress || 'unknown';
};

// Enhanced error message based on user authentication
const getMessage = (req: Request): string => {
  const authenticatedReq = req as any;

  if (authenticatedReq.user?.id) {
    return 'Rate limit exceeded for your account. Please try again later.';
  }

  return 'Too many requests from this IP address. Please try again later.';
};

// Custom handler for rate limit exceeded
const rateLimitHandler = (req: Request, res: Response) => {
  res.status(429).json({
    error: 'Rate Limit Exceeded',
    message: getMessage(req),
    retryAfter: Math.round(req.rateLimit?.resetTime / 1000) || 60,
    type: 'RATE_LIMIT_ERROR',
  });
};

// 1. Global API Rate Limiting (per IP)
export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes per IP
  message: {
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later.',
    type: 'GLOBAL_RATE_LIMIT',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: req => req.ip || 'unknown',
});

// 2. Authentication Rate Limiting (stricter for login/signup)
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes
  skipSuccessfulRequests: true, // Don't count successful logins
  keyGenerator,
  handler: rateLimitHandler,
});

// 3. Content Creation Rate Limiting (prevent spam)
export const contentCreationRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 posts/spaces/threads per minute
  keyGenerator,
  handler: rateLimitHandler,
});

// 4. API Call Rate Limiting (for general API usage)
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per user/IP
  keyGenerator,
  handler: rateLimitHandler,
});

// 5. Billing/Payment Rate Limiting (very strict)
export const billingRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 billing operations per hour
  keyGenerator,
  handler: rateLimitHandler,
});

// 6. Progressive Slow Down for Heavy Operations
export const heavyOperationSlowDown = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 10, // Allow 10 requests at normal speed
  delayMs: 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 10000, // Maximum delay of 10 seconds
  keyGenerator,
});

// 7. WebSocket Connection Rate Limiting
export const websocketRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 WebSocket connection attempts per 5 minutes
  keyGenerator,
  handler: rateLimitHandler,
});

// 8. File Upload Rate Limiting (for future image uploads)
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  keyGenerator,
  handler: rateLimitHandler,
});

// 9. Search/Analytics Rate Limiting
export const searchRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 search/analytics requests per minute
  keyGenerator,
  handler: rateLimitHandler,
});

// Production vs Development Configuration
export const getProductionRateLimits = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // More generous limits for development
    return {
      global: { windowMs: 1 * 60 * 1000, max: 10000 }, // 10k per minute
      auth: { windowMs: 5 * 60 * 1000, max: 50 }, // 50 per 5 minutes
      content: { windowMs: 60 * 1000, max: 100 }, // 100 per minute
      api: { windowMs: 60 * 1000, max: 1000 }, // 1k per minute
    };
  }

  return {
    global: { windowMs: 15 * 60 * 1000, max: 1000 },
    auth: { windowMs: 15 * 60 * 1000, max: 10 },
    content: { windowMs: 60 * 1000, max: 5 },
    api: { windowMs: 60 * 1000, max: 100 },
  };
};

// Middleware to skip rate limiting for certain conditions
export const skipRateLimit = (req: Request): boolean => {
  // Skip for health checks
  if (req.path === '/health' || req.path === '/api/v1/health') {
    return true;
  }

  // Skip for webhooks (they have their own validation)
  if (req.path.includes('/webhook')) {
    return true;
  }

  // Skip rate limiting entirely in development or demo mode
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.DEMO_MODE === 'true'
  ) {
    return true;
  }

  // Skip for admin users in production
  const authenticatedReq = req as any;
  if (authenticatedReq.user?.role === 'admin') {
    return true;
  }

  return false;
};

// Create smart rate limiter that adapts based on route
export const createSmartRateLimit = (options: {
  windowMs: number;
  max: number;
  skipCondition?: (req: Request) => boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    keyGenerator,
    handler: rateLimitHandler,
    skip: options.skipCondition || skipRateLimit,
    standardHeaders: true,
    legacyHeaders: false,
  });
};
