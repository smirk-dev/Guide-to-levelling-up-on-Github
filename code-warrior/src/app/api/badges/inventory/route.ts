import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getServiceSupabase } from '@/lib/supabase';

/**
 * GET /api/badges/inventory
 * Fetch all badges the user has earned and their equipment status
 */
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const githubId = session.user.id;
    const supabase = getServiceSupabase();

    // Fetch user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('github_id', githubId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch all badges
    const { data: allBadges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .order('created_at', { ascending: true });

    if (badgesError) {
      throw badgesError;
    }

    // Fetch user's earned badges
    const { data: userBadges, error: userBadgesError } = await supabase
      .from('user_badges')
      .select('badge_id, equipped, earned_at')
      .eq('user_id', user.id);

    if (userBadgesError) {
      throw userBadgesError;
    }

    // Combine badge info with user's ownership status
    const inventory = (allBadges || []).map((badge) => {
      const userBadge = (userBadges || []).find((ub) => ub.badge_id === badge.id);
      return {
        ...badge,
        owned: !!userBadge,
        equipped: userBadge?.equipped || false,
        earned_at: userBadge?.earned_at || null,
      };
    });

    // Separate equipped badges
    const equippedBadges = inventory.filter((b) => b.equipped);

    return NextResponse.json({
      inventory,
      equippedBadges,
      equippedCount: equippedBadges.length,
    });
  } catch (error) {
    console.error('Error fetching badge inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badge inventory' },
      { status: 500 }
    );
  }
}
