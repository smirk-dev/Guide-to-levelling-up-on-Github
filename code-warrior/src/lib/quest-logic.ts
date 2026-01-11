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
  const criteriaValue = quest.criteria_threshold;

  switch (quest.criteria_type) {
    case 'REPO_COUNT':
      // Check total public repos
      return {
        completed: stats.totalRepos >= criteriaValue,
        progress: Math.min(stats.totalRepos, criteriaValue),
      };

    case 'PR_MERGED':
      // Check merged pull requests
      return {
        completed: stats.totalPRs >= criteriaValue,
        progress: Math.min(stats.totalPRs, criteriaValue),
      };

    case 'COMMIT_COUNT':
      // Check total commits
      return {
        completed: stats.totalCommits >= criteriaValue,
        progress: Math.min(stats.totalCommits, criteriaValue),
      };

    case 'STAR_COUNT':
      // Check stars received
      return {
        completed: stats.totalStars >= criteriaValue,
        progress: Math.min(stats.totalStars, criteriaValue),
      };

    case 'ISSUE_COUNT':
      // Check issues opened
      return {
        completed: stats.totalIssues >= criteriaValue,
        progress: Math.min(stats.totalIssues, criteriaValue),
      };

    case 'REVIEW_COUNT':
      // Check reviews submitted
      return {
        completed: stats.totalReviews >= criteriaValue,
        progress: Math.min(stats.totalReviews, criteriaValue),
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
    if (userQuest?.status === 'COMPLETED') continue;

    const { completed, progress } = checkQuestCompletion(quest, stats, userQuest);

    // Only add to updates if there's a change
    if (!userQuest || userQuest.progress !== progress || userQuest.status !== (completed ? 'COMPLETED' : 'ACTIVE')) {
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
