import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getServiceSupabase } from '@/lib/supabase';
import {
  calculateGitHubStats,
  fetchContributionCalendar,
  calculateGitHubAchievements,
  type GitHubStats,
} from '@/lib/github';
import { calculateXP, calculateRankTier } from '@/lib/game-logic';
import { QUEST_STATUS, SYNC_COOLDOWN_MS } from '@/lib/constants';
import { errorResponse, internalServerError } from '@/lib/api-response';
import { checkRateLimit, getClientIp, getRateLimitHeaders } from '@/lib/rate-limit';
import { logAuditEvent } from '@/lib/audit';
import { filterActiveSeasonQuests } from '@/lib/seasonal-quests';
import { getRequestId, logWithRequestContext } from '@/lib/request-context';
import type { Quest } from '@/types/database';

type SyncMode = 'quick' | 'full';

const FULL_SYNC_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const BASE_STREAK_BONUS_XP = 25;

function getRequestedSyncMode(request: Request): SyncMode {
  const mode = new URL(request.url).searchParams.get('mode');
  return mode === 'full' ? 'full' : 'quick';
}

function getCachedGitHubStats(githubStats: unknown): GitHubStats | null {
  if (!githubStats || typeof githubStats !== 'object') {
    return null;
  }

  const stats = githubStats as Record<string, unknown>;
  const requiredKeys = ['stars', 'repos', 'commits', 'prs', 'issues', 'reviews'];
  const hasAllKeys = requiredKeys.every((key) => typeof stats[key] === 'number');

  if (!hasAllKeys) {
    return null;
  }

  return {
    totalStars: stats.stars as number,
    totalRepos: stats.repos as number,
    totalCommits: stats.commits as number,
    totalPRs: stats.prs as number,
    totalIssues: stats.issues as number,
    totalReviews: stats.reviews as number,
  };
}

function getLastFullSyncAt(githubStats: unknown): Date | null {
  if (!githubStats || typeof githubStats !== 'object') {
    return null;
  }

  const syncMeta = (githubStats as Record<string, unknown>).sync_meta;
  if (!syncMeta || typeof syncMeta !== 'object') {
    return null;
  }

  const lastFull = (syncMeta as Record<string, unknown>).last_full_sync_at;
  if (typeof lastFull !== 'string') {
    return null;
  }

  const parsed = new Date(lastFull);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toUtcDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getDateDiffInDays(from: string, to: string): number {
  const start = new Date(`${from}T00:00:00.000Z`).getTime();
  const end = new Date(`${to}T00:00:00.000Z`).getTime();
  return Math.floor((end - start) / (24 * 60 * 60 * 1000));
}

/**
 * POST /api/sync
 * 
 * Sync Engine: Fetches latest GitHub data and updates user stats in Supabase
 * Based on architecture.md Integration Strategy
 * 
 * Steps:
 * 1. Verify user is authenticated
 * 2. Check last sync time (prevent spam)
 * 3. Fetch GitHub data (profile, repos, events)
 * 4. Calculate RPG stats (XP, Rank, etc.)
 * 5. Update Supabase database
 * 6. Return updated user data
 */
export async function POST(request: Request) {
  try {
    const requestId = getRequestId(request);
    const requestedMode = getRequestedSyncMode(request);
    const clientIp = getClientIp(request);
    const ipLimit = checkRateLimit(`ip:${clientIp}`, 'sync');
    if (ipLimit.isLimited) {
      return errorResponse({
        status: 429,
        code: 'RATE_LIMITED',
        message: `Too many requests from this IP. Please try again in ${ipLimit.retryAfter} seconds.`,
        retryable: true,
        retryAfter: ipLimit.retryAfter,
        headers: {
          ...getRateLimitHeaders(ipLimit.remaining, ipLimit.resetIn, ipLimit.retryAfter),
          'X-Request-Id': requestId,
        },
      });
    }

    // 1. Verify authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return errorResponse({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
        headers: { 'X-Request-Id': requestId },
      });
    }

    const supabase = getServiceSupabase();

    // Get GitHub ID and username from session
    const githubId = session.user.id;
    const username = session.user.username || session.user.name;
    
    if (!githubId || !username) {
      return errorResponse({
        status: 400,
        code: 'BAD_REQUEST',
        message: 'Missing GitHub identity in session',
        headers: { 'X-Request-Id': requestId },
      });
    }

    const userLimit = checkRateLimit(`user:${githubId}`, 'sync');
    if (userLimit.isLimited) {
      return errorResponse({
        status: 429,
        code: 'RATE_LIMITED',
        message: `Too many sync attempts. Please try again in ${userLimit.retryAfter} seconds.`,
        retryable: true,
        retryAfter: userLimit.retryAfter,
        headers: {
          ...getRateLimitHeaders(userLimit.remaining, userLimit.resetIn, userLimit.retryAfter),
          'X-Request-Id': requestId,
        },
      });
    }

    const userLookup = await supabase
      .from('users')
      .select('*')
      .eq('github_id', githubId)
      .single();

    let user = userLookup.data;
    const userError = userLookup.error;

    // If user doesn't exist, create them
    if (userError && userError.code === 'PGRST116') {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          github_id: githubId,
          username: username,
          avatar_url: session.user?.image || null,
          xp: 0,
          rank_tier: 'C',
          last_synced_at: null, // Allow immediate first sync
        })
        .select()
        .single();

      if (createError) {
        logWithRequestContext('error', 'Error creating user during sync', {
          requestId,
          githubId,
          error: createError,
        });
        return internalServerError('Failed to create user');
      }

      user = newUser;
    } else if (userError || !user) {
      logWithRequestContext('error', 'User lookup error', {
        requestId,
        githubId,
        error: userError,
      });
      return errorResponse({
        status: 404,
        code: 'NOT_FOUND',
        message: 'User not found in database',
        headers: { 'X-Request-Id': requestId },
      });
    }

    // 2. Check last sync time (prevent rate limit abuse)
    // Skip cooldown check for first-time sync (when last_synced_at is null)
    const now = new Date();
    if (user.last_synced_at) {
      const lastSynced = new Date(user.last_synced_at);
      const timeSinceSync = now.getTime() - lastSynced.getTime();

      if (timeSinceSync < SYNC_COOLDOWN_MS) {
        const waitTime = Math.ceil((SYNC_COOLDOWN_MS - timeSinceSync) / 1000);
        return errorResponse({
          status: 429,
          code: 'RATE_LIMITED',
          message: `Please wait ${waitTime} seconds before syncing again`,
          details: 'Sync on cooldown',
          retryable: true,
          retryAfter: waitTime,
          headers: { 'X-Request-Id': requestId },
        });
      }
    }

    // 3. Fetch GitHub stats
    const accessToken = session.accessToken;
    const cachedStats = getCachedGitHubStats(user.github_stats);
    const lastFullSyncAt = getLastFullSyncAt(user.github_stats);
    const shouldForceFullSync =
      !cachedStats ||
      !lastFullSyncAt ||
      now.getTime() - lastFullSyncAt.getTime() > FULL_SYNC_MAX_AGE_MS;
    const effectiveMode: SyncMode = requestedMode === 'full' || shouldForceFullSync ? 'full' : 'quick';

    let githubStats: GitHubStats;
    let contributions = (user.github_stats?.contributions || []) as unknown[];

    if (effectiveMode === 'full') {
      [githubStats, contributions] = await Promise.all([
        calculateGitHubStats(user.username, accessToken),
        fetchContributionCalendar(user.username, accessToken),
      ]);
    } else {
      githubStats = cachedStats as GitHubStats;
    }

    // Calculate achievements from stats
    const badges = calculateGitHubAchievements(githubStats);

    // 4. Calculate RPG stats
    const today = toUtcDateString(now);
    const previousStreak = user.streak_count ?? 0;
    const previousBestStreak = user.streak_best_count ?? 0;
    const previousActiveDate = user.streak_last_active_date;

    let streakCount = previousStreak;
    let streakBestCount = previousBestStreak;
    let streakLastActiveDate = previousActiveDate;
    let streakBonusXp = 0;

    if (!previousActiveDate) {
      streakCount = 1;
      streakBestCount = Math.max(previousBestStreak, streakCount);
      streakLastActiveDate = today;
      streakBonusXp = BASE_STREAK_BONUS_XP;
    } else {
      const dayDiff = getDateDiffInDays(previousActiveDate, today);
      if (dayDiff === 1) {
        streakCount = previousStreak + 1;
        streakBestCount = Math.max(previousBestStreak, streakCount);
        streakLastActiveDate = today;
        streakBonusXp = Math.min(100, BASE_STREAK_BONUS_XP + streakCount * 5);
      } else if (dayDiff > 1) {
        streakCount = 1;
        streakBestCount = Math.max(previousBestStreak, streakCount);
        streakLastActiveDate = today;
        streakBonusXp = BASE_STREAK_BONUS_XP;
      }
    }

    const newXP = calculateXP(githubStats) + streakBonusXp;
    const newRank = calculateRankTier(newXP);

    // 5. Update database
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        xp: newXP,
        rank_tier: newRank,
        streak_count: streakCount,
        streak_best_count: streakBestCount,
        streak_last_active_date: streakLastActiveDate,
        github_stats: {
          stars: githubStats.totalStars,
          repos: githubStats.totalRepos,
          commits: githubStats.totalCommits,
          prs: githubStats.totalPRs,
          issues: githubStats.totalIssues,
          reviews: githubStats.totalReviews,
          contributions, // Year-long contribution calendar
          badges, // Calculated GitHub achievement badges
          sync_meta: {
            ...(user.github_stats?.sync_meta || {}),
            last_requested_mode: requestedMode,
            last_effective_mode: effectiveMode,
            last_sync_at: now.toISOString(),
            last_full_sync_at:
              effectiveMode === 'full'
                ? now.toISOString()
                : user.github_stats?.sync_meta?.last_full_sync_at || null,
            last_quick_sync_at:
              effectiveMode === 'quick'
                ? now.toISOString()
                : user.github_stats?.sync_meta?.last_quick_sync_at || null,
            streak_count: streakCount,
            streak_best_count: streakBestCount,
            streak_bonus_xp: streakBonusXp,
          },
        },
        last_synced_at: now.toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      logWithRequestContext('error', 'Error updating synced user', {
        requestId,
        githubId,
        error: updateError,
      });
      return internalServerError('Failed to update user stats');
    }

    // 6. Update quest progress and auto-enroll in new quests
    try {
      const { checkQuestCompletion } = await import('@/lib/quest-logic');

      // Fetch ALL active quests
      const { data: allQuests, error: allQuestsError } = await supabase
        .from('quests')
        .select('*')
        .eq('is_active', true);

      const activeQuests = filterActiveSeasonQuests((allQuests || []) as Quest[], now);

      // Fetch user's existing quest progress
      const { data: userQuests, error: questsError } = await supabase
        .from('user_quests')
        .select('*')
        .eq('user_id', user.id);

      if (!allQuestsError && allQuests && !questsError) {
        const questUpdates = [];
        const newQuestEntries = [];
        const typedQuests = activeQuests;

        for (const quest of typedQuests) {
          const { completed, progress } = checkQuestCompletion(quest, githubStats);
          const existingUserQuest = (userQuests || []).find(uq => uq.quest_id === quest.id);

          if (existingUserQuest) {
            // Update existing quest if not already completed
            if (existingUserQuest.status !== 'COMPLETED') {
              if (progress !== existingUserQuest.progress || (completed && existingUserQuest.status !== 'COMPLETED')) {
                questUpdates.push({
                  id: existingUserQuest.id,
                  progress,
                  status: completed ? QUEST_STATUS.COMPLETED : QUEST_STATUS.ACTIVE,
                  completed_at: completed && !existingUserQuest.completed_at ? now.toISOString() : existingUserQuest.completed_at,
                });
              }
            }
          } else if (progress > 0) {
            // Auto-enroll in quest if user has any progress
            newQuestEntries.push({
              user_id: user.id,
              quest_id: quest.id,
              status: completed ? QUEST_STATUS.COMPLETED : QUEST_STATUS.ACTIVE,
              progress,
              completed_at: completed ? now.toISOString() : null,
            });
          }
        }

        // Batch update existing quests
        for (const update of questUpdates) {
          await supabase
            .from('user_quests')
            .update({
              progress: update.progress,
              status: update.status,
              completed_at: update.completed_at,
            })
            .eq('id', update.id);
        }

        // Insert new quest entries
        if (newQuestEntries.length > 0) {
          await supabase.from('user_quests').insert(newQuestEntries);
        }
      }
    } catch (questError) {
      logWithRequestContext('warn', 'Quest update error (non-fatal)', {
        requestId,
        githubId,
        error: questError,
      });
      // Don't fail the entire sync if quest update fails
    }

    // 7. Return success with updated data
    await logAuditEvent(supabase, {
      userId: updatedUser.id,
      githubId,
      action: 'SYNC_STATS_UPDATED',
      entityType: 'user',
      entityId: updatedUser.id,
      xpDelta: newXP - user.xp,
      metadata: {
        oldRank: user.rank_tier,
        newRank,
        streakCount,
        streakBestCount,
        streakBonusXp,
        requestedMode,
        effectiveMode,
        usedCachedStats: effectiveMode === 'quick',
        stats: {
          stars: githubStats.totalStars,
          repos: githubStats.totalRepos,
          commits: githubStats.totalCommits,
          prs: githubStats.totalPRs,
          issues: githubStats.totalIssues,
          reviews: githubStats.totalReviews,
        },
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      stats: githubStats,
      xpGained: newXP - user.xp,
      streakCount,
      streakBestCount,
      streakBonusXp,
      syncMode: effectiveMode,
      requestedMode,
      usedCachedStats: effectiveMode === 'quick',
      rankedUp: newRank !== user.rank_tier,
      rankChanged: newRank !== user.rank_tier,
    }, {
      headers: {
        'X-Request-Id': requestId,
      },
    });

  } catch (error) {
    const requestId = getRequestId(request);
    logWithRequestContext('error', 'Sync error', { requestId, error });
    return internalServerError();
  }
}

/**
 * GET /api/sync
 * 
 * Check sync status and cooldown timer
 */
export async function GET(request: Request) {
  try {
    const requestId = getRequestId(request);
    const clientIp = getClientIp(request);
    const ipLimit = checkRateLimit(`ip:${clientIp}`, 'sync');
    if (ipLimit.isLimited) {
      return errorResponse({
        status: 429,
        code: 'RATE_LIMITED',
        message: `Too many requests from this IP. Please try again in ${ipLimit.retryAfter} seconds.`,
        retryable: true,
        retryAfter: ipLimit.retryAfter,
        headers: {
          ...getRateLimitHeaders(ipLimit.remaining, ipLimit.resetIn, ipLimit.retryAfter),
          'X-Request-Id': requestId,
        },
      });
    }

    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return errorResponse({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
        headers: { 'X-Request-Id': requestId },
      });
    }

    const supabase = getServiceSupabase();

    const githubId = session.user.id;

    const userLimit = checkRateLimit(`user:${githubId || 'unknown'}`, 'sync');
    if (userLimit.isLimited) {
      return errorResponse({
        status: 429,
        code: 'RATE_LIMITED',
        message: `Too many sync status checks. Please try again in ${userLimit.retryAfter} seconds.`,
        retryable: true,
        retryAfter: userLimit.retryAfter,
        headers: {
          ...getRateLimitHeaders(userLimit.remaining, userLimit.resetIn, userLimit.retryAfter),
          'X-Request-Id': requestId,
        },
      });
    }

    if (!githubId) {
      return NextResponse.json(
        { canSync: true, waitTime: 0 },
        { status: 200, headers: { 'X-Request-Id': requestId } }
      );
    }

    const { data: user } = await supabase
      .from('users')
      .select('last_synced_at, github_stats')
      .eq('github_id', githubId)
      .single();

    if (!user || !user.last_synced_at) {
      return NextResponse.json(
        { canSync: true, waitTime: 0 },
        { status: 200, headers: { 'X-Request-Id': requestId } }
      );
    }

    const lastSynced = new Date(user.last_synced_at);
    const now = new Date();
    const timeSinceSync = now.getTime() - lastSynced.getTime();

    const canSync = timeSinceSync >= SYNC_COOLDOWN_MS;
    const waitTime = canSync ? 0 : Math.ceil((SYNC_COOLDOWN_MS - timeSinceSync) / 1000);
    const lastFullSyncAt = getLastFullSyncAt(user.github_stats);
    const fullSyncRecommended =
      !lastFullSyncAt || now.getTime() - lastFullSyncAt.getTime() > FULL_SYNC_MAX_AGE_MS;

    return NextResponse.json({
      canSync,
      waitTime,
      lastSynced: user.last_synced_at,
      fullSyncRecommended,
      lastFullSyncAt: lastFullSyncAt?.toISOString() || null,
    }, {
      headers: {
        'X-Request-Id': requestId,
      },
    });

  } catch (error) {
    const requestId = getRequestId(request);
    logWithRequestContext('error', 'Sync status error', { requestId, error });
    return internalServerError();
  }
}
