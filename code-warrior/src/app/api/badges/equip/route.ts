import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getServiceSupabase } from '@/lib/supabase';
import { MAX_EQUIPPED_BADGES } from '@/lib/constants';
import { RequestValidationError, getRequiredUuidField } from '@/lib/request-validation';

function getEquipErrorStatus(message: string): number {
  if (message.includes('not found')) {
    return 404;
  }

  if (
    message.includes('do not own') ||
    message.includes('already equipped') ||
    message.includes('Maximum')
  ) {
    return 400;
  }

  return 500;
}

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

    const badgeId = await getRequiredUuidField(request, 'badgeId', 'Badge ID');

    const githubId = session.user.id;
    const supabase = getServiceSupabase();
    const { data, error } = await supabase.rpc('equip_badge_atomic', {
      p_github_id: githubId,
      p_badge_id: badgeId,
      p_max_equipped: MAX_EQUIPPED_BADGES,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: getEquipErrorStatus(error.message) }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${data?.badgeName || 'Badge'} equipped successfully`,
      badgeId,
      equippedCount: data?.equippedCount ?? MAX_EQUIPPED_BADGES,
    });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Error equipping badge:', error);
    return NextResponse.json(
      { error: 'Failed to equip badge' },
      { status: 500 }
    );
  }
}
