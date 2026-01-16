/**
 * Rate Limiting Utility for API Routes
 *
 * Uses in-memory storage for rate limiting.
 * In production with multiple instances, consider using Redis.
 */

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Max requests allowed in the interval
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Default configurations for different endpoints
export const RATE_LIMIT_CONFIGS = {
  // Sync endpoint - 10 requests per 5 minutes per user
  sync: { interval: 5 * 60 * 1000, maxRequests: 10 },
  // Quest claim - 20 requests per minute per user
  questClaim: { interval: 60 * 1000, maxRequests: 20 },
  // Leaderboard - 30 requests per minute per user
  leaderboard: { interval: 60 * 1000, maxRequests: 30 },
  // Badge equip - 30 requests per minute per user
  badgeEquip: { interval: 60 * 1000, maxRequests: 30 },
  // Default - 100 requests per minute per user
  default: { interval: 60 * 1000, maxRequests: 100 },
} as const;

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier (e.g., user ID, IP address)
 * @param endpoint - Name of the endpoint for config lookup
 * @returns Object with isLimited flag and retry information
 */
export function checkRateLimit(
  identifier: string,
  endpoint: keyof typeof RATE_LIMIT_CONFIGS = 'default'
): {
  isLimited: boolean;
  remaining: number;
  resetIn: number; // milliseconds until reset
  retryAfter: number; // seconds until retry (for headers)
} {
  const config = RATE_LIMIT_CONFIGS[endpoint];
  const key = `${endpoint}:${identifier}`;
  const now = Date.now();

  // Clean up expired entries periodically
  if (Math.random() < 0.1) {
    cleanupExpiredEntries();
  }

  let entry = rateLimitStore.get(key);

  // If no entry or entry has expired, create a new one
  if (!entry || now >= entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + config.interval,
    };
    rateLimitStore.set(key, entry);

    return {
      isLimited: false,
      remaining: config.maxRequests - 1,
      resetIn: config.interval,
      retryAfter: 0,
    };
  }

  // Increment counter
  entry.count++;
  rateLimitStore.set(key, entry);

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const resetIn = entry.resetTime - now;
  const retryAfter = Math.ceil(resetIn / 1000);

  return {
    isLimited: entry.count > config.maxRequests,
    remaining,
    resetIn,
    retryAfter,
  };
}

/**
 * Clean up expired entries from the store
 * Call this periodically or on each request with low probability
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Reset rate limit for a specific identifier
 * Useful for testing or admin overrides
 */
export function resetRateLimit(identifier: string, endpoint?: keyof typeof RATE_LIMIT_CONFIGS) {
  if (endpoint) {
    rateLimitStore.delete(`${endpoint}:${identifier}`);
  } else {
    // Reset all endpoints for this identifier
    for (const key of rateLimitStore.keys()) {
      if (key.includes(`:${identifier}`)) {
        rateLimitStore.delete(key);
      }
    }
  }
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(
  remaining: number,
  resetIn: number,
  retryAfter?: number
): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetIn / 1000).toString(),
  };

  if (retryAfter && retryAfter > 0) {
    headers['Retry-After'] = retryAfter.toString();
  }

  return headers;
}

/**
 * Helper function to check rate limit and return error response if limited
 * Use this in API route handlers
 */
export function withRateLimit(
  identifier: string | null | undefined,
  endpoint: keyof typeof RATE_LIMIT_CONFIGS = 'default'
) {
  if (!identifier) {
    return {
      isLimited: false,
      headers: {},
      errorResponse: null,
    };
  }

  const result = checkRateLimit(identifier, endpoint);
  const headers = getRateLimitHeaders(result.remaining, result.resetIn, result.retryAfter);

  if (result.isLimited) {
    return {
      isLimited: true,
      headers,
      errorResponse: {
        error: 'Rate limit exceeded',
        message: `Too many requests. Please try again in ${result.retryAfter} seconds.`,
        retryAfter: result.retryAfter,
      },
    };
  }

  return {
    isLimited: false,
    headers,
    errorResponse: null,
  };
}
