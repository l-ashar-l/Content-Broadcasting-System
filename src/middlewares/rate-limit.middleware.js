import rateLimit from 'express-rate-limit';

/**
 * Public API Rate Limiter: Protects public endpoints
 * 10 requests per 15 minutes per IP
 */
export const publicApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for authenticated requests (optional)
    return !!req.user;
  },
});

/**
 * Auth API Rate Limiter: Protects auth endpoints
 * 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Content Upload Rate Limiter: Protects upload endpoints
 * 20 requests per hour per user
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: 'Upload limit exceeded, please try again later.',
  keyGenerator: (req) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    return req.user ? req.user.id : req.ip;
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Analytics API Rate Limiter: Protects analytics endpoints
 * 30 requests per hour
 */
export const analyticsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: 'Analytics rate limit exceeded.',
  standardHeaders: true,
  legacyHeaders: false,
});
