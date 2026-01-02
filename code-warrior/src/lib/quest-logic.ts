import type { GitHubStats } from './github';
import type { Quest, UserQuest } from '@/types/database';

/**
 * Check if a quest's criteria has been met based on GitHub stats
 */
export function checkQuestCompletion(
  quest: Quest,
  stats: GitHubStats,
  userQuest?: UserQuest
): { completed: boolean; progress: number } {
  const criteriaValue = quest.criteria_value;

  switch (quest.criteria_type) {
    case 'repo_created':
      // Check total public repos
      return {
        completed: stats.totalRepos >= criteriaValue,
        progress: Math.min(stats.totalRepos, criteriaValue),
      };

    case 'pr_merged':
      // Check merged pull requests
      return {
        completed: stats.pullRequests >= criteriaValue,
        progress: Math.min(stats.pullRequests, criteriaValue),
      };

    case 'commits':
      // Check total commits
      return {
        completed: stats.commits >= criteriaValue,
        progress: Math.min(stats.commits, criteriaValue),
      };

    case 'stars_received':
      // Check stars received
      return {
        completed: stats.stars >= criteriaValue,
        progress: Math.min(stats.stars, criteriaValue),
      };

    case 'issues_created':
      // Check issues opened
      return {
        completed: stats.issues >= criteriaValue,
        progress: Math.min(stats.issues, criteriaValue),
      };

    default:
      return { completed: false, progress: 0 };
  }
}

/**
 * Check all active quests and update their progress
 */
export function updateQuestProgress(
  quests: Quest[],
  userQuests: UserQuest[],
  stats: GitHubStats
): Array<{ questId: string; progress: number; completed: boolean }> {
  const updates: Array<{ questId: string; progress: number; completed: boolean }> = [];

  for (const quest of quests) {
    const userQuest = userQuests.find(uq => uq.quest_id === quest.id);
    
    // Skip if quest is already completed
    if (userQuest?.status === 'completed') continue;

    const { completed, progress } = checkQuestCompletion(quest, stats, userQuest);

    // Only add to updates if there's a change
    if (!userQuest || userQuest.progress !== progress || userQuest.status !== (completed ? 'completed' : 'in_progress')) {
      updates.push({
        questId: quest.id,
        progress,
        completed,
      });
    }
  }

  return updates;
}

/**
 * Calculate total XP from claimed quest rewards
 */
export function calculateQuestXP(quests: Quest[], userQuests: UserQuest[]): number {
  let totalXP = 0;

  for (const userQuest of userQuests) {
    if (userQuest.status === 'completed' && userQuest.claimed_at) {
      const quest = quests.find(q => q.id === userQuest.quest_id);
      if (quest) {
        totalXP += quest.xp_reward;
      }
    }
  }

  return totalXP;
}
