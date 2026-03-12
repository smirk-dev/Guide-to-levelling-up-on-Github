import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getServiceSupabase } from '@/lib/supabase';
import { RequestValidationError, getRequiredUuidField } from '@/lib/request-validation';

function getClaimErrorStatus(message: string): number {
  if (message.includes('not found')) {
    return 404;
  }

  if (
    message.includes('not completed') ||
    message.includes('already claimed') ||
    message.includes('invalid quest')
  ) {
    return 400;
  }

  return 500;
}

/**
 * POST /api/quests/claim
 * Claim a completed quest reward
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.error('Quest claim: No session or user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const questId = await getRequiredUuidField(request, 'questId', 'Quest ID');

    const githubId = session.user.id;
    const supabase = getServiceSupabase();
    const { data, error } = await supabase.rpc('claim_quest_reward_atomic', {
      p_github_id: githubId,
      p_quest_id: questId,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: getClaimErrorStatus(error.message) }
      );
    }

    return NextResponse.json({
      success: true,
      xpGained: data?.xpGained ?? 0,
      newTotalXP: data?.newTotalXP ?? 0,
      userQuestId: data?.userQuestId ?? null,
      badgeAwarded: data?.badgeAwarded ?? false,
    });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Error claiming quest reward:', error);
    return NextResponse.json(
      { error: 'Failed to claim quest reward' },
      { status: 500 }
    );
  }
}
