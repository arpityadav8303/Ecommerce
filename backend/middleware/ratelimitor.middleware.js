import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// 🌐 General limiter for all routes
const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes"
  },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in development and test environments
  skip: (req) => {
    return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
  },
  keyGenerator: ipKeyGenerator
});

// 🔐 Auth limiter for login/register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 8, // 5 attempts per window
  message: {
    success: false,
    message: "Too many login/register attempts. Please try again after 15 minutes"
  },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  // Skip rate limiting in test environment
  skip: (req) => {
    return process.env.NODE_ENV === 'test';
  },
  keyGenerator: (req) => req.body?.email || ipKeyGenerator(req)
});

// 🔎 Search limiter for product queries
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: {
    success: false,
    message: "Too many search requests. Please wait before searching again"
  },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in development and test environments
  skip: (req) => {
    return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
  },
  keyGenerator: ipKeyGenerator
});

// 📦 Product upload limiter
const productLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: {
    success: false,
    message: "Too many product uploads. Please try again later"
  },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in development and test environments
  skip: (req) => {
    return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
  },
  keyGenerator: ipKeyGenerator
});

export { generateLimiter, authLimiter, searchLimiter, productLimiter };