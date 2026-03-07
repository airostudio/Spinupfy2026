/**
 * Simple in-memory rate limiter for API endpoints
 * For production, consider upgrading to Redis-based rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Maximum requests per window
}

// In-memory store for rate limiting (replace with Redis for production scaling)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the client (IP address, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || entry.resetTime < now) {
    // First request or window expired - start new window
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }

  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  // Increment count
  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}

/**
 * Extract client IP from request headers
 * Handles various proxy scenarios
 */
export function getClientIP(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    // Take the first IP in the chain (original client)
    return xff.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback for development
  return 'unknown';
}

// Pre-configured rate limiters for common scenarios
export const RATE_LIMITS = {
  // Strict limit for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,           // 5 attempts per 15 minutes
  },

  // Standard API endpoint
  api: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 60,          // 60 requests per minute
  },

  // AI generation (expensive operations)
  aiGeneration: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 10,          // 10 generations per minute
  },

  // Public endpoints (e.g., discount code validation)
  public: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 30,          // 30 requests per minute
  },
} as const;

/**
 * Create a rate limit response for HTTP 429
 */
export function createRateLimitResponse(resetIn: number) {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil(resetIn / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': Math.ceil(resetIn / 1000).toString(),
        'X-RateLimit-Remaining': '0',
      },
    }
  );
}
