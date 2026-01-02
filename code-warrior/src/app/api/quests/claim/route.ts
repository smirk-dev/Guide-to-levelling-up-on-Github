import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getServiceSupabase } from '@/lib/supabase';

/**
 * POST /api/quests/claim
 * Claim a completed quest reward
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { questId } = await request.json();

    if (!questId) {
      return NextResponse.json({ error: 'Quest ID required' }, { status: 400 });
    }

    const githubId = session.user.id;
    const supabase = getServiceSupabase();

    // Fetch user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('github_id', githubId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch the quest
    const { data: quest, error: questError } = await supabase
      .from('quests')
      .select('*')
      .eq('id', questId)
      .single();

    if (questError || !quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 });
    }

    // Fetch user's quest progress
    const { data: userQuest, error: userQuestError } = await supabase
      .from('user_quests')
      .select('*')
      .eq('user_id', user.id)
      .eq('quest_id', questId)
      .single();

    if (userQuestError || !userQuest) {
      return NextResponse.json(
        { error: 'Quest progress not found' },
        { status: 404 }
      );
    }

    // Check if quest is completed and not already claimed
    if (userQuest.status !== 'completed') {
      return NextResponse.json(
        { error: 'Quest not completed yet' },
        { status: 400 }
      );
    }

    if (userQuest.claimed_at) {
      return NextResponse.json(
        { error: 'Quest reward already claimed' },
        { status: 400 }
      );
    }

    // Update user's XP
    const newXP = user.total_xp + quest.xp_reward;

    const { error: updateUserError } = await supabase
      .from('users')
      .update({ total_xp: newXP })
      .eq('id', user.id);

    if (updateUserError) {
      throw updateUserError;
    }

    // Mark quest as claimed
    const { data: updatedUserQuest, error: claimError } = await supabase
      .from('user_quests')
      .update({ claimed_at: new Date().toISOString() })
      .eq('id', userQuest.id)
      .select()
      .single();

    if (claimError) {
      throw claimError;
    }

    // If quest has a badge reward, award it
    if (quest.badge_reward) {
      const { data: badge } = await supabase
        .from('badges')
        .select('*')
        .eq('id', quest.badge_reward)
        .single();

      if (badge) {
        // Check if user already has this badge
        const { data: existingBadge } = await supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', user.id)
          .eq('badge_id', badge.id)
          .single();

        if (!existingBadge) {
          await supabase.from('user_badges').insert({
            user_id: user.id,
            badge_id: badge.id,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      xpGained: quest.xp_reward,
      newTotalXP: newXP,
      userQuest: updatedUserQuest,
      badgeAwarded: quest.badge_reward ? true : false,
    });
  } catch (error) {
    console.error('Error claiming quest reward:', error);
    return NextResponse.json(
      { error: 'Failed to claim quest reward' },
      { status: 500 }
    );
  }
}
