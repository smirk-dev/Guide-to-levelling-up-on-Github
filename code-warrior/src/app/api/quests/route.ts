import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getServiceSupabase } from '@/lib/supabase';
import { calculateGitHubStats } from '@/lib/github';
import { checkQuestCompletion, updateQuestProgress } from '@/lib/quest-logic';

/**
 * GET /api/quests
 * Fetch all quests and user's quest progress
 */
export async function GET(request: Request) {
  try {
    console.log('[Quests GET] Starting request');
    const session = await getServerSession(authOptions);
    console.log('[Quests GET] Session object:', JSON.stringify(session, null, 2));

    if (!session) {
      console.error('[Quests GET] No session at all');
      return NextResponse.json({ error: 'Unauthorized - no session' }, { status: 401 });
    }

    if (!session.user) {
      console.error('[Quests GET] Session exists but no user');
      return NextResponse.json({ error: 'Unauthorized - no user in session' }, { status: 401 });
    }

    if (!session.user.id) {
      console.error('[Quests GET] User exists but no ID. User object:', JSON.stringify(session.user));
      return NextResponse.json({ error: 'Unauthorized - no user ID in session' }, { status: 401 });
    }

    const githubId = session.user.id;
    const supabase = getServiceSupabase();
    console.log('[Quests GET] Fetching user with github_id:', githubId);

    // Fetch user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('github_id', githubId)
      .single();

    console.log('[Quests GET] User fetch result:', { hasError: !!userError, hasUser: !!user, errorMessage: userError?.message });

    if (userError) {
      console.error('[Quests GET] Supabase error fetching user:', userError.message);
      if (userError.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found in database. Please sync your GitHub stats first.' }, { status: 404 });
      }
      throw userError;
    }

    if (!user) {
      console.error('[Quests GET] No user returned even though no error');
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    // Fetch all quests
    const { data: quests, error: questsError } = await supabase
      .from('quests')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (questsError) {
      console.error('[Quests GET] Error fetching quests:', questsError.message);
      throw questsError;
    }

    // Fetch user's quest progress
    const { data: userQuests, error: userQuestsError } = await supabase
      .from('user_quests')
      .select('*')
      .eq('user_id', user.id);

    if (userQuestsError) {
      console.error('[Quests GET] Error fetching user quests:', userQuestsError.message);
      throw userQuestsError;
    }

    console.log('[Quests GET] Success. Returning quests:', { questCount: quests?.length, userQuestCount: userQuests?.length });
    return NextResponse.json({
      user,
      quests: quests || [],
      userQuests: userQuests || [],
    });
  } catch (error) {
    console.error('[Quests GET] Caught error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to fetch quests', details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/quests
 * Verify and update quest progress based on current GitHub stats
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.error('Quests POST: No session or user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const githubId = session.user.id;
    const accessToken = (session as any)?.accessToken;
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

    // Fetch current GitHub stats
    const stats = await calculateGitHubStats(user.username, accessToken);

    // Fetch all active quests
    const { data: quests, error: questsError } = await supabase
      .from('quests')
      .select('*')
      .eq('is_active', true);

    if (questsError) {
      throw questsError;
    }

    // Fetch user's current quest progress
    const { data: userQuests, error: userQuestsError } = await supabase
      .from('user_quests')
      .select('*')
      .eq('user_id', user.id);

    if (userQuestsError) {
      throw userQuestsError;
    }

    // Calculate quest updates
    const updates = updateQuestProgress(quests || [], userQuests || [], stats);

    // Apply updates to database
    const updatedQuests = [];
    for (const update of updates) {
      const existingUserQuest = (userQuests || []).find(
        uq => uq.quest_id === update.questId
      );

      if (existingUserQuest) {
        // Update existing quest progress
        const { data, error } = await supabase
          .from('user_quests')
          .update({
            progress: update.progress,
            status: update.completed ? 'completed' : 'in_progress',
            completed_at: update.completed ? new Date().toISOString() : null,
          })
          .eq('id', existingUserQuest.id)
          .select()
          .single();

        if (!error && data) {
          updatedQuests.push(data);
        }
      } else {
        // Create new quest progress entry
        const { data, error } = await supabase
          .from('user_quests')
          .insert({
            user_id: user.id,
            quest_id: update.questId,
            status: update.completed ? 'completed' : 'in_progress',
            progress: update.progress,
            completed_at: update.completed ? new Date().toISOString() : null,
          })
          .select()
          .single();

        if (!error && data) {
          updatedQuests.push(data);
        }
      }
    }

    // Fetch updated user quests
    const { data: finalUserQuests } = await supabase
      .from('user_quests')
      .select('*')
      .eq('user_id', user.id);

    return NextResponse.json({
      success: true,
      updatedCount: updatedQuests.length,
      userQuests: finalUserQuests || [],
    });
  } catch (error) {
    console.error('Error verifying quests:', error);
    return NextResponse.json(
      { error: 'Failed to verify quests' },
      { status: 500 }
    );
  }
}
