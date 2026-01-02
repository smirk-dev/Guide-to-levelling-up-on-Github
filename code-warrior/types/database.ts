// Database types matching the Supabase schema from architecture.md

export type RankTier = 'C' | 'B' | 'A' | 'AA' | 'AAA' | 'S' | 'SS' | 'SSS';
export type QuestStatus = 'ACTIVE' | 'COMPLETED';
export type CriteriaType = 'REPO_COUNT' | 'PR_MERGED' | 'STAR_COUNT';

export interface User {
  id: string;
  github_id: string;
  username: string;
  avatar_url: string | null;
  xp: number;
  rank_tier: RankTier;
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
  created_at: string;
}

export interface UserQuest {
  id: string;
  user_id: string;
  quest_id: string;
  status: QuestStatus;
  completed_at: string | null;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  icon_slug: string;
  stat_boost: Record<string, number> | null;
  created_at: string;
}

// RPG Stats computed from GitHub data
export interface RPGStats {
  health: number; // Based on commits
  mana: number; // Based on reviews/issues
  strength: number; // Based on PRs
  charisma: number; // Based on stars
  wisdom: number; // Based on issues/reviews
}
