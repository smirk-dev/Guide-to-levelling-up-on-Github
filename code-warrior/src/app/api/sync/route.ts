import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getServiceSupabase } from '@/lib/supabase';
import { calculateGitHubStats, fetchContributionCalendar, calculateGitHubAchievements } from '@/lib/github';
import { calculateXP, calculateRankTier } from '@/lib/game-logic';
import { QUEST_STATUS, SYNC_COOLDOWN_MS } from '@/lib/constants';
import type { Quest } from '@/types/database';

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
export async function POST() {
  try {
    // 1. Verify authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getServiceSupabase();

    // Get GitHub ID and username from session
    const githubId = session.user.id;
    const username = session.user.username || session.user.name;
    
    if (!githubId || !username) {
      return NextResponse.json(
        { error: 'Missing GitHub identity in session' },
        { status: 400 }
      );
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
        console.error('Error creating user during sync:', createError);
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }

      user = newUser;
    } else if (userError || !user) {
      console.error('User lookup error:', userError);
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // 2. Check last sync time (prevent rate limit abuse)
    // Skip cooldown check for first-time sync (when last_synced_at is null)
    const now = new Date();
    if (user.last_synced_at) {
      const lastSynced = new Date(user.last_synced_at);
      const timeSinceSync = now.getTime() - lastSynced.getTime();

      if (timeSinceSync < SYNC_COOLDOWN_MS) {
        const waitTime = Math.ceil((SYNC_COOLDOWN_MS - timeSinceSync) / 1000);
        return NextResponse.json(
          { 
            error: 'Sync on cooldown',
            message: `Please wait ${waitTime} seconds before syncing again`,
            waitTime 
          },
          { status: 429 }
        );
      }
    }

    // 3. Fetch GitHub stats
    const accessToken = session.accessToken;

    // Fetch stats, contributions, and calculate achievements in parallel
    const [githubStats, contributions] = await Promise.all([
      calculateGitHubStats(user.username, accessToken),
      fetchContributionCalendar(user.username, accessToken),
    ]);

    // Calculate achievements from stats
    const badges = calculateGitHubAchievements(githubStats);

    // 4. Calculate RPG stats
    const newXP = calculateXP(githubStats);
    const newRank = calculateRankTier(newXP);

    // 5. Update database
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        xp: newXP,
        rank_tier: newRank,
        github_stats: {
          stars: githubStats.totalStars,
          repos: githubStats.totalRepos,
          commits: githubStats.totalCommits,
          prs: githubStats.totalPRs,
          issues: githubStats.totalIssues,
          reviews: githubStats.totalReviews,
          contributions, // Year-long contribution calendar
          badges, // Calculated GitHub achievement badges
        },
        last_synced_at: now.toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating synced user:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user stats' },
        { status: 500 }
      );
    }

    // 6. Update quest progress and auto-enroll in new quests
    try {
      const { checkQuestCompletion } = await import('@/lib/quest-logic');

      // Fetch ALL active quests
      const { data: allQuests, error: allQuestsError } = await supabase
        .from('quests')
        .select('*')
        .eq('is_active', true);

      // Fetch user's existing quest progress
      const { data: userQuests, error: questsError } = await supabase
        .from('user_quests')
        .select('*')
        .eq('user_id', user.id);

      if (!allQuestsError && allQuests && !questsError) {
        const questUpdates = [];
        const newQuestEntries = [];
        const typedQuests = allQuests as Quest[];

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
      console.error('Quest update error (non-fatal):', questError);
      // Don't fail the entire sync if quest update fails
    }

    // 7. Return success with updated data
    return NextResponse.json({
      success: true,
      user: updatedUser,
      stats: githubStats,
      xpGained: newXP - user.xp,
      rankedUp: newRank !== user.rank_tier,
    });

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sync
 * 
 * Check sync status and cooldown timer
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getServiceSupabase();

    const githubId = session.user.id;

    if (!githubId) {
      return NextResponse.json(
        { canSync: true, waitTime: 0 },
        { status: 200 }
      );
    }

    const { data: user } = await supabase
      .from('users')
      .select('last_synced_at')
      .eq('github_id', githubId)
      .single();

    if (!user || !user.last_synced_at) {
      return NextResponse.json(
        { canSync: true, waitTime: 0 },
        { status: 200 }
      );
    }

    const lastSynced = new Date(user.last_synced_at);
    const now = new Date();
    const timeSinceSync = now.getTime() - lastSynced.getTime();

    const canSync = timeSinceSync >= SYNC_COOLDOWN_MS;
    const waitTime = canSync ? 0 : Math.ceil((SYNC_COOLDOWN_MS - timeSinceSync) / 1000);

    return NextResponse.json({
      canSync,
      waitTime,
      lastSynced: user.last_synced_at,
    });

  } catch (error) {
    console.error('Sync status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
