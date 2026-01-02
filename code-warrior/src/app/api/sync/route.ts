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

    // Get user from database using GitHub username from session
    const username = (session as any).user?.username || session.user?.name;
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username not found in session' },
        { status: 400 }
      );
    }

    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    // If user doesn't exist, create them
    if (userError && userError.code === 'PGRST116') {
      console.log('User not found, creating new user:', username);
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          github_id: session.user?.id || 'github-' + Date.now(),
          username: username,
          avatar_url: session.user?.image || null,
          xp: 0,
          rank_tier: 'C',
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json(
          { error: 'Failed to create user', details: createError },
          { status: 500 }
        );
      }

      user = newUser;
    } else if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found in database', details: userError },
        { status: 404 }
      );
    }

    // 2. Check last sync time (prevent rate limit abuse)
    const lastSynced = new Date(user.last_synced_at);
    const now = new Date();
    const timeSinceSync = now.getTime() - lastSynced.getTime();
    const SYNC_COOLDOWN = 5 * 60 * 1000; // 5 minutes

    if (timeSinceSync < SYNC_COOLDOWN) {
      const waitTime = Math.ceil((SYNC_COOLDOWN - timeSinceSync) / 1000);
      return NextResponse.json(
        { 
          error: 'Sync on cooldown',
          message: `Please wait ${waitTime} seconds before syncing again`,
          waitTime 
        },
        { status: 429 }
      );
    }

    // 3. Fetch GitHub stats
    const githubStats = await calculateGitHubStats(
      user.username,
      (session as any).accessToken
    );

    // 4. Calculate RPG stats
    const newXP = calculateXP(githubStats);
    const newRank = calculateRankTier(newXP);

    // 5. Update database
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        xp: newXP,
        rank_tier: newRank,
        last_synced_at: now.toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user stats' },
        { status: 500 }
      );
    }

    // 6. Return success with updated data
    return NextResponse.json({
      success: true,
      user: updatedUser,
      stats: githubStats,
      gainedXP: newXP - user.xp,
      rankedUp: newRank !== user.rank_tier,
    });

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
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
