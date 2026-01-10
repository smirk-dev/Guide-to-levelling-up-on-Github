// Game logic for converting GitHub stats to RPG attributes
// Based on project-brief.md XP System and Rank progression

import { RankTier, RPGStats, Badge } from '@/types/database';
import { GitHubStats } from './github';

/**
 * XP Weights from project-brief.md:
 * - Stars = Charisma/Fame (High XP reward)
 * - Pull Requests = Strength/Attack (High XP)
 * - Commits = Stamina/Health (Moderate XP)
 * - Issues/Reviews = Wisdom/Mana (Lower XP)
 */
const XP_WEIGHTS = {
  STAR: 50,
  PR: 40,
  COMMIT: 10,
  ISSUE: 15,
  REVIEW: 20,
};

/**
 * Calculate total XP from GitHub stats
 */
export function calculateXP(stats: GitHubStats): number {
  const xp =
    stats.totalStars * XP_WEIGHTS.STAR +
    stats.totalPRs * XP_WEIGHTS.PR +
    stats.totalCommits * XP_WEIGHTS.COMMIT +
    stats.totalIssues * XP_WEIGHTS.ISSUE +
    stats.totalReviews * XP_WEIGHTS.REVIEW;

  return Math.floor(xp);
}

/**
 * Determine rank tier based on total XP
 * Progression: C -> B -> A -> AA -> AAA -> S -> SS -> SSS (Legend)
 */
export function calculateRankTier(xp: number): RankTier {
  if (xp >= 50000) return 'SSS'; // Legend
  if (xp >= 25000) return 'SS'; // Master
  if (xp >= 15000) return 'S'; // Expert
  if (xp >= 10000) return 'AAA'; // Elite
  if (xp >= 6000) return 'AA'; // Advanced
  if (xp >= 3000) return 'A'; // Skilled
  if (xp >= 1000) return 'B'; // Intermediate
  return 'C'; // Novice
}

/**
 * Get XP needed for next rank
 */
export function getXPForNextRank(currentRank: RankTier): number {
  const thresholds: Record<RankTier, number> = {
    C: 1000,
    B: 3000,
    A: 6000,
    AA: 10000,
    AAA: 15000,
    S: 25000,
    SS: 50000,
    SSS: Infinity, // Max rank
  };
  return thresholds[currentRank];
}

/**
 * Calculate RPG stats from GitHub data
 * - Health (HP): Based on Commit Consistency
 * - Mana (MP): Based on Review/Issue activity
 * - Strength: Based on PRs
 * - Charisma: Based on Stars
 * - Wisdom: Based on Issues/Reviews
 *
 * @param stats GitHub stats
 * @param equippedBadges Optional array of equipped badges to apply stat boosts
 */
export function calculateRPGStats(stats: GitHubStats, equippedBadges?: Badge[]): RPGStats {
  // Calculate base stats
  const baseStats = {
    health: Math.min(100, stats.totalCommits * 2),
    mana: Math.min(100, (stats.totalIssues + stats.totalReviews) * 5),
    strength: Math.min(100, stats.totalPRs * 3),
    charisma: Math.min(100, stats.totalStars * 2),
    wisdom: Math.min(100, (stats.totalIssues + stats.totalReviews) * 4),
  };

  // If no badges equipped, return base stats
  if (!equippedBadges || equippedBadges.length === 0) {
    return baseStats;
  }

  // Apply badge stat boosts
  const boostedStats = { ...baseStats };

  for (const badge of equippedBadges) {
    if (badge.stat_boost) {
      // Apply each stat boost from the badge
      Object.entries(badge.stat_boost).forEach(([stat, boost]) => {
        if (stat in boostedStats) {
          const statKey = stat as keyof RPGStats;
          boostedStats[statKey] = Math.min(100, boostedStats[statKey] + boost);
        }
      });
    }
  }

  return boostedStats;
}

/**
 * Get rank display name
 */
export function getRankDisplayName(rank: RankTier): string {
  const names: Record<RankTier, string> = {
    C: 'Novice Coder',
    B: 'Middle Committer',
    A: 'Skilled Developer',
    AA: 'Advanced Architect',
    AAA: 'Elite Engineer',
    S: 'Expert Maestro',
    SS: 'Master Sorcerer',
    SSS: 'Legendary Code Warrior',
  };
  return names[rank];
}
