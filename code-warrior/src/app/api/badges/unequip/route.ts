import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getServiceSupabase } from '@/lib/supabase';

/**
 * POST /api/badges/unequip
 * Unequip a badge from equipment slots
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.error('Badge unequip: No session or user ID found');
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

    // Check if user owns this badge and it's equipped
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

    // Check if badge is equipped
    if (!userBadge.equipped) {
      return NextResponse.json(
        { error: 'Badge is not equipped' },
        { status: 400 }
      );
    }

    // Unequip the badge
    const { error: unequipError } = await supabase
      .from('user_badges')
      .update({ equipped: false })
      .eq('user_id', user.id)
      .eq('badge_id', badgeId);

    if (unequipError) {
      throw unequipError;
    }

    // Fetch the badge details
    const { data: badge } = await supabase
      .from('badges')
      .select('*')
      .eq('id', badgeId)
      .single();

    return NextResponse.json({
      success: true,
      message: `${badge?.name || 'Badge'} unequipped successfully`,
      badge,
    });
  } catch (error) {
    console.error('Error unequipping badge:', error);
    return NextResponse.json(
      { error: 'Failed to unequip badge' },
      { status: 500 }
    );
  }
}
