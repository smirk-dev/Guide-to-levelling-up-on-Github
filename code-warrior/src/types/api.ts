/**
 * Common API type definitions
 * Used across client components for type-safe error handling
 */

/**
 * Extended Error interface for API errors with HTTP status codes
 */
export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: string;
}

/**
 * Creates a typed API error with status code
 */
export function createApiError(message: string, status?: number): ApiError {
  const error: ApiError = new Error(message);
  error.status = status;
  return error;
}

/**
 * Type guard to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && 'status' in error;
}

/**
 * Badge inventory item from API
 */
export interface BadgeInventoryItem {
  id: string;
  name: string;
  icon_slug: string;
  stat_boost: Record<string, number> | null;
  created_at: string;
  owned: boolean;
  equipped: boolean;
  earned_at?: string;
}

/**
 * API response for badge operations
 */
export interface BadgeApiResponse {
  inventory: BadgeInventoryItem[];
  equippedBadges: string[];
  equippedCount: number;
}

/**
 * Leaderboard user from API
 */
export interface LeaderboardUser {
  id: string;
  username: string;
  avatar_url: string;
  xp: number;
  rank_tier: string;
  github_stats?: {
    stars?: number;
    repos?: number;
    commits?: number;
    prs?: number;
    issues?: number;
    reviews?: number;
  };
}

/**
 * Sync result from API
 */
export interface SyncResult {
  user: {
    id: string;
    xp: number;
    rank_tier: string;
  };
  xpGained: number;
  rankChanged: boolean;
  oldRank?: string;
  newRank?: string;
}
