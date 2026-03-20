import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getServiceSupabase } from '@/lib/supabase';
import { calculateGitHubStats } from '@/lib/github';
import { updateQuestProgress } from '@/lib/quest-logic';
import { QUEST_STATUS } from '@/lib/constants';
import { errorResponse, internalServerError } from '@/lib/api-response';
import { filterActiveSeasonQuests, getActiveSeasonMeta } from '@/lib/seasonal-quests';

/**
 * GET /api/quests
 * Fetch all quests and user's quest progress
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return errorResponse({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Unauthorized - no session',
      });
    }

    if (!session.user) {
      return errorResponse({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Unauthorized - no user in session',
      });
    }

    if (!session.user.id) {
      return errorResponse({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Unauthorized - no user ID in session',
      });
    }

    const githubId = session.user.id;
    const supabase = getServiceSupabase();

    // Fetch user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('github_id', githubId)
      .single();

    if (userError) {
      if (userError.code === 'PGRST116') {
        return errorResponse({
          status: 404,
          code: 'NOT_FOUND',
          message: 'User not found in database. Please sync your GitHub stats first.',
        });
      }
      throw userError;
    }

    if (!user) {
      return errorResponse({
        status: 404,
        code: 'NOT_FOUND',
        message: 'User not found in database',
      });
    }

    // Fetch all quests
    const { data: quests, error: questsError } = await supabase
      .from('quests')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (questsError) {
      throw questsError;
    }

    // Fetch user's quest progress
    const { data: userQuests, error: userQuestsError } = await supabase
      .from('user_quests')
      .select('*')
      .eq('user_id', user.id);

    if (userQuestsError) {
      throw userQuestsError;
    }

    const activeQuests = filterActiveSeasonQuests(quests || []);
    const activeSeason = getActiveSeasonMeta(activeQuests);

    return NextResponse.json({
      user,
      quests: activeQuests,
      userQuests: userQuests || [],
      activeSeason,
    });
  } catch (error) {
    console.error('[Quests GET] Failed to fetch quests:', error);
    return internalServerError('Failed to fetch quests');
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
      return errorResponse({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
      });
    }

    const githubId = session.user.id;
    const accessToken = session.accessToken;
    const supabase = getServiceSupabase();

    // Fetch user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('github_id', githubId)
      .single();

    if (userError || !user) {
      return errorResponse({
        status: 404,
        code: 'NOT_FOUND',
        message: 'User not found',
      });
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
    const activeQuests = filterActiveSeasonQuests(quests || []);
    const updates = updateQuestProgress(activeQuests, userQuests || [], stats);

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
            status: update.completed ? QUEST_STATUS.COMPLETED : QUEST_STATUS.ACTIVE,
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
            status: update.completed ? QUEST_STATUS.COMPLETED : QUEST_STATUS.ACTIVE,
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
    return internalServerError('Failed to verify quests');
  }
}
