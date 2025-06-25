import { Request, Response, NextFunction } from 'express';

// Validate required environment variables
export function validateEnvironment() {
  const required = [
    'DATABASE_URL',
    'GOOGLE_GEMINI_API_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Rate limiting middleware for sensitive endpoints
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean up old entries
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < windowStart) {
        rateLimitStore.delete(key);
      }
    }
    
    const current = rateLimitStore.get(identifier);
    
    if (!current) {
      rateLimitStore.set(identifier, { count: 1, resetTime: now });
      return next();
    }
    
    if (current.resetTime < windowStart) {
      // Reset window
      rateLimitStore.set(identifier, { count: 1, resetTime: now });
      return next();
    }
    
    if (current.count >= maxRequests) {
      return res.status(429).json({
        error: true,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((current.resetTime + windowMs - now) / 1000)
      });
    }
    
    current.count++;
    next();
  };
}

// Enhanced input sanitization middleware
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Skip sanitization for Stripe webhook (raw body needed)
  if (req.path === '/api/webhook/stripe') {
    return next();
  }
  if (req.body) {
    // Remove potential XSS payloads
    const sanitized = JSON.parse(JSON.stringify(req.body, (key, value) => {
      if (typeof value === 'string') {
        // Basic XSS prevention
        return value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
      return value;
    }));
    req.body = sanitized;
  }
  next();
}