import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

/**
 * GET /api/leaderboard
 * Fetch top users ranked by XP for the Hall of Fame
 */
export async function GET() {
  try {
    const supabase = getServiceSupabase();

    // Fetch top 100 users ordered by XP
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, avatar_url, xp, rank_tier')
      .order('xp', { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    // Add rank numbers to each user
    const rankedUsers = (users || []).map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    return NextResponse.json({
      users: rankedUsers,
      totalUsers: rankedUsers.length,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
