export type Rank = 'C' | 'B' | 'A' | 'AA' | 'AAA' | 'S' | 'SS' | 'SSS';

export type Category = 'Commits' | 'Stars' | 'Followers' | 'PRs' | 'Issues' | 'Reviews' | 'Repos' | 'Community';

export interface AchievementTier {
    rank: Rank;
    title: string;
    requirement: number; // e.g., 100 commits
    xpReward: number;
    description: string;
}

export interface Achievement {
    id: string;
    category: Category;
    name: string;
    tiers: AchievementTier[];
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    xpReward: number;
    isCompleted: boolean;
    category: Category;
    requirement?: {
        type: 'manual' | 'api_check';
        metric?: string;
        target?: number;
    };
}

export interface UserState {
    username: string;
    level: number;
    currentXP: number;
    xpToNextLevel: number;
    completedQuests: string[]; // Quest IDs
    unlockedAchievements: { achievementId: string; tierRank: Rank }[];
}
