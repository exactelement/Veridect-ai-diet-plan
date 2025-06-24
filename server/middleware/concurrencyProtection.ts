import { Request, Response, NextFunction } from 'express';

// Track active requests per user to prevent concurrent analysis requests
const activeRequests = new Map<string, Set<string>>();

export function concurrencyProtection(endpoint: string) {
  return (req: any, res: Response, next: NextFunction) => {
    const userId = req.user?.claims?.sub || req.user?.id;
    
    if (!userId) {
      return next();
    }
    
    // Create request ID
    const requestId = `${userId}-${endpoint}-${Date.now()}`;
    
    // Check if user already has an active request for this endpoint
    if (!activeRequests.has(userId)) {
      activeRequests.set(userId, new Set());
    }
    
    const userRequests = activeRequests.get(userId)!;
    const activeEndpointRequests = Array.from(userRequests).filter(id => id.includes(endpoint));
    
    if (activeEndpointRequests.length > 0) {
      return res.status(429).json({
        error: true,
        message: "Please wait for your current analysis to complete before starting a new one.",
        retryAfter: 5
      });
    }
    
    // Add this request to active requests
    userRequests.add(requestId);
    
    // Clean up when request completes
    const originalSend = res.send;
    res.send = function(data) {
      userRequests.delete(requestId);
      if (userRequests.size === 0) {
        activeRequests.delete(userId);
      }
      return originalSend.call(this, data);
    };
    
    // Clean up on error
    res.on('error', () => {
      userRequests.delete(requestId);
      if (userRequests.size === 0) {
        activeRequests.delete(userId);
      }
    });
    
    next();
  };
}

// Cleanup function for old requests (in case of unexpected termination)
export function cleanupOldRequests() {
  const now = Date.now();
  const maxAge = 5 * 60 * 1000; // 5 minutes
  
  for (const [userId, requests] of activeRequests.entries()) {
    const validRequests = Array.from(requests).filter(requestId => {
      const timestamp = parseInt(requestId.split('-').pop() || '0');
      return (now - timestamp) < maxAge;
    });
    
    if (validRequests.length === 0) {
      activeRequests.delete(userId);
    } else {
      activeRequests.set(userId, new Set(validRequests));
    }
  }
}

// Run cleanup every minute
setInterval(cleanupOldRequests, 60000);