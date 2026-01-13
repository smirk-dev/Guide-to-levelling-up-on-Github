// Database types matching the Supabase schema from architecture.md

export type RankTier = 'C' | 'B' | 'A' | 'AA' | 'AAA' | 'S' | 'SS' | 'SSS';
export type QuestStatus = 'ACTIVE' | 'COMPLETED';
export type CriteriaType = 'REPO_COUNT' | 'PR_MERGED' | 'STAR_COUNT' | 'COMMIT_COUNT' | 'ISSUE_COUNT' | 'REVIEW_COUNT';

// Contribution day for heatmap
export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

// GitHub achievement badge structure
export interface GitHubAchievementBadge {
  id: string;
  name: string;
  tier: 'x1' | 'x2' | 'x3' | 'x4' | null; // null for non-tiered badges
  description: string;
  unlockedAt?: string;
}

export interface GitHubStats {
  stars: number;
  repos: number;
  commits: number;
  prs: number;
  issues: number;
  reviews: number;
  // Extended stats for dashboard redesign
  contributions?: ContributionDay[];
  badges?: GitHubAchievementBadge[];
}

export interface User {
  id: string;
  github_id: string;
  username: string;
  avatar_url: string | null;
  xp: number;
  rank_tier: RankTier;
  github_stats?: GitHubStats; // Optional for backward compatibility
  last_synced_at: string;
  created_at: string;
  updated_at: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  criteria_type: CriteriaType;
  criteria_threshold: number;
  is_active: boolean;
  badge_reward: string | null;
  created_at: string;
}

export interface UserQuest {
  id: string;
  user_id: string;
  quest_id: string;
  status: QuestStatus;
  progress: number;
  completed_at: string | null;
  claimed_at: string | null;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  icon_slug: string;
  stat_boost: Record<string, number> | null;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  equipped: boolean;
  earned_at: string;
}

// RPG Stats computed from GitHub data
export interface RPGStats {
  health: number; // Based on commits
  mana: number; // Based on reviews/issues
  strength: number; // Based on PRs
  charisma: number; // Based on stars
  wisdom: number; // Based on issues/reviews
}
