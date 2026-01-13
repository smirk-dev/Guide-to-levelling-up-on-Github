import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getServiceSupabase } from '@/lib/supabase';
import { calculateGitHubStats } from '@/lib/github';
import { calculateXP, calculateRankTier } from '@/lib/game-logic';

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
export async function POST(request: NextRequest) {
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
    const githubId = (session as any).user?.id;
    const username = (session as any).user?.username || session.user?.name;
    
    if (!username && !githubId) {
      return NextResponse.json(
        { error: 'No user identifier found in session' },
        { status: 400 }
      );
    }

    // Try to find user by GitHub ID first (more reliable)
    let { data: user, error: userError } = githubId 
      ? await supabase
          .from('users')
          .select('*')
          .eq('github_id', githubId)
          .single()
      : await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .single();

    // If user doesn't exist, create them
    if (userError && userError.code === 'PGRST116') {
      console.log('User not found, creating new user:', username, 'github_id:', githubId);
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          github_id: githubId || 'github-' + Date.now(),
          username: username,
          avatar_url: session.user?.image || null,
          xp: 0,
          rank_tier: 'C',
          last_synced_at: null, // Allow immediate first sync
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        console.error('Create error details:', JSON.stringify(createError, null, 2));
        return NextResponse.json(
          { 
            error: 'Failed to create user', 
            details: createError.message || createError,
            code: createError.code 
          },
          { status: 500 }
        );
      }

      user = newUser;
      console.log('Successfully created new user:', user.id);
    } else if (userError || !user) {
      console.error('User lookup error:', userError);
      return NextResponse.json(
        { error: 'User not found in database', details: userError?.message || userError },
        { status: 404 }
      );
    }

    // 2. Check last sync time (prevent rate limit abuse)
    // Skip cooldown check for first-time sync (when last_synced_at is null)
    const now = new Date();
    if (user.last_synced_at) {
      const lastSynced = new Date(user.last_synced_at);
      const timeSinceSync = now.getTime() - lastSynced.getTime();
      const SYNC_COOLDOWN = 5 * 60 * 1000; // 5 minutes

      if (timeSinceSync < SYNC_COOLDOWN) {
        const waitTime = Math.ceil((SYNC_COOLDOWN - timeSinceSync) / 1000);
        console.log(`Sync cooldown active. Wait ${waitTime} seconds.`);
        return NextResponse.json(
          { 
            error: 'Sync on cooldown',
            message: `Please wait ${waitTime} seconds before syncing again`,
            waitTime 
          },
          { status: 429 }
        );
      }
    } else {
      console.log('First time sync - no cooldown applied');
    }

    // 3. Fetch GitHub stats
    console.log('Fetching GitHub stats for:', user.username);
    const githubStats = await calculateGitHubStats(
      user.username,
      (session as any).accessToken
    );
    console.log('GitHub stats calculated:', { 
      totalCommits: githubStats.totalCommits, 
      totalPRs: githubStats.totalPRs,
      totalRepos: githubStats.totalRepos 
    });

    // 4. Calculate RPG stats
    const newXP = calculateXP(githubStats);
    const newRank = calculateRankTier(newXP);
    console.log('RPG stats calculated:', { newXP, newRank, oldXP: user.xp, oldRank: user.rank_tier });

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
        },
        last_synced_at: now.toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user:', updateError);
      console.error('Update error details:', JSON.stringify(updateError, null, 2));
      return NextResponse.json(
        { 
          error: 'Failed to update user stats', 
          details: updateError.message || updateError 
        },
        { status: 500 }
      );
    }

    console.log('User successfully updated:', updatedUser.id);

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

        for (const quest of allQuests) {
          const { completed, progress } = checkQuestCompletion(quest as any, githubStats);
          const existingUserQuest = (userQuests || []).find(uq => uq.quest_id === quest.id);

          if (existingUserQuest) {
            // Update existing quest if not already completed
            if (existingUserQuest.status !== 'COMPLETED') {
              if (progress !== existingUserQuest.progress || (completed && existingUserQuest.status !== 'COMPLETED')) {
                questUpdates.push({
                  id: existingUserQuest.id,
                  progress,
                  status: completed ? 'COMPLETED' : 'ACTIVE',
                  completed_at: completed && !existingUserQuest.completed_at ? now.toISOString() : existingUserQuest.completed_at,
                });
              }
            }
          } else if (progress > 0) {
            // Auto-enroll in quest if user has any progress
            newQuestEntries.push({
              user_id: user.id,
              quest_id: quest.id,
              status: completed ? 'COMPLETED' : 'ACTIVE',
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
          console.log(`Auto-enrolled in ${newQuestEntries.length} quest(s)`);
        }

        if (questUpdates.length > 0) {
          console.log(`Updated ${questUpdates.length} quest(s)`);
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
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sync
 * 
 * Check sync status and cooldown timer
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getServiceSupabase();

    const username = (session as any).user?.username || session.user?.name;
    
    if (!username) {
      return NextResponse.json(
        { canSync: true, waitTime: 0 },
        { status: 200 }
      );
    }

    const { data: user } = await supabase
      .from('users')
      .select('last_synced_at')
      .eq('username', username)
      .single();

    if (!user) {
      return NextResponse.json(
        { canSync: true, waitTime: 0 },
        { status: 200 }
      );
    }

    const lastSynced = new Date(user.last_synced_at);
    const now = new Date();
    const timeSinceSync = now.getTime() - lastSynced.getTime();
    const SYNC_COOLDOWN = 5 * 60 * 1000; // 5 minutes

    const canSync = timeSinceSync >= SYNC_COOLDOWN;
    const waitTime = canSync ? 0 : Math.ceil((SYNC_COOLDOWN - timeSinceSync) / 1000);

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
