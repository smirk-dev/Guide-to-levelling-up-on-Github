import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getServiceSupabase } from '@/lib/supabase';

const MAX_EQUIPPED_BADGES = 3;

/**
 * POST /api/badges/equip
 * Equip a badge to one of the 3 equipment slots
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.error('Badge equip: No session or user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { badgeId } = await request.json();

    if (!badgeId) {
      return NextResponse.json({ error: 'Badge ID required' }, { status: 400 });
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

    // Check if user owns this badge
    const { data: userBadge, error: userBadgeError } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', user.id)
      .eq('badge_id', badgeId)
      .single();

    if (userBadgeError || !userBadge) {
      return NextResponse.json(
        { error: 'You do not own this badge' },
        { status: 403 }
      );
    }

    // Check if badge is already equipped
    if (userBadge.equipped) {
      return NextResponse.json(
        { error: 'Badge is already equipped' },
        { status: 400 }
      );
    }

    // Check how many badges are currently equipped
    const { data: equippedBadges, error: equippedError } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', user.id)
      .eq('equipped', true);

    if (equippedError) {
      throw equippedError;
    }

    if ((equippedBadges || []).length >= MAX_EQUIPPED_BADGES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_EQUIPPED_BADGES} badges can be equipped` },
        { status: 400 }
      );
    }

    // Equip the badge
    const { error: equipError } = await supabase
      .from('user_badges')
      .update({ equipped: true })
      .eq('user_id', user.id)
      .eq('badge_id', badgeId);

    if (equipError) {
      throw equipError;
    }

    // Fetch the badge details
    const { data: badge } = await supabase
      .from('badges')
      .select('*')
      .eq('id', badgeId)
      .single();

    return NextResponse.json({
      success: true,
      message: `${badge?.name || 'Badge'} equipped successfully`,
      badge,
    });
  } catch (error) {
    console.error('Error equipping badge:', error);
    return NextResponse.json(
      { error: 'Failed to equip badge' },
      { status: 500 }
    );
  }
}
