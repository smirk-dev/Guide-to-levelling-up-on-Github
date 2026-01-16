/**
 * Unit Tests for Game Logic
 *
 * Tests for XP calculation, rank progression, and RPG stats
 */

import {
  calculateXP,
  calculateRankTier,
  getXPForNextRank,
  getNextRank,
  calculateRPGStats,
  getRankDisplayName,
} from '../game-logic';
import type { GitHubStats } from '../github';
import type { Badge, RankTier } from '@/types/database';

// Mock GitHub stats factory
const createMockStats = (overrides: Partial<GitHubStats> = {}): GitHubStats => ({
  totalStars: 0,
  totalRepos: 0,
  totalCommits: 0,
  totalPRs: 0,
  totalIssues: 0,
  totalReviews: 0,
  ...overrides,
});

describe('calculateXP', () => {
  it('should return 0 for empty stats', () => {
    const stats = createMockStats();
    expect(calculateXP(stats)).toBe(0);
  });

  it('should calculate XP correctly with all stat types', () => {
    const stats = createMockStats({
      totalStars: 10,    // 10 * 50 = 500
      totalPRs: 5,       // 5 * 40 = 200
      totalCommits: 100, // 100 * 10 = 1000
      totalIssues: 10,   // 10 * 15 = 150
      totalReviews: 5,   // 5 * 20 = 100
    });
    expect(calculateXP(stats)).toBe(1950);
  });

  it('should apply correct weight to stars (50 XP each)', () => {
    const stats = createMockStats({ totalStars: 10 });
    expect(calculateXP(stats)).toBe(500);
  });

  it('should apply correct weight to PRs (40 XP each)', () => {
    const stats = createMockStats({ totalPRs: 10 });
    expect(calculateXP(stats)).toBe(400);
  });

  it('should apply correct weight to commits (10 XP each)', () => {
    const stats = createMockStats({ totalCommits: 100 });
    expect(calculateXP(stats)).toBe(1000);
  });

  it('should apply correct weight to issues (15 XP each)', () => {
    const stats = createMockStats({ totalIssues: 10 });
    expect(calculateXP(stats)).toBe(150);
  });

  it('should apply correct weight to reviews (20 XP each)', () => {
    const stats = createMockStats({ totalReviews: 10 });
    expect(calculateXP(stats)).toBe(200);
  });

  it('should floor the result', () => {
    // Test that decimal XP values are floored
    const stats = createMockStats({
      totalStars: 1,
      totalPRs: 1,
      totalCommits: 1,
    });
    // 50 + 40 + 10 = 100 (no decimals in this case)
    expect(calculateXP(stats)).toBe(100);
  });
});

describe('calculateRankTier', () => {
  it('should return C for XP below 1000', () => {
    expect(calculateRankTier(0)).toBe('C');
    expect(calculateRankTier(500)).toBe('C');
    expect(calculateRankTier(999)).toBe('C');
  });

  it('should return B for XP 1000-2999', () => {
    expect(calculateRankTier(1000)).toBe('B');
    expect(calculateRankTier(2000)).toBe('B');
    expect(calculateRankTier(2999)).toBe('B');
  });

  it('should return A for XP 3000-5999', () => {
    expect(calculateRankTier(3000)).toBe('A');
    expect(calculateRankTier(4500)).toBe('A');
    expect(calculateRankTier(5999)).toBe('A');
  });

  it('should return AA for XP 6000-9999', () => {
    expect(calculateRankTier(6000)).toBe('AA');
    expect(calculateRankTier(8000)).toBe('AA');
    expect(calculateRankTier(9999)).toBe('AA');
  });

  it('should return AAA for XP 10000-14999', () => {
    expect(calculateRankTier(10000)).toBe('AAA');
    expect(calculateRankTier(12500)).toBe('AAA');
    expect(calculateRankTier(14999)).toBe('AAA');
  });

  it('should return S for XP 15000-24999', () => {
    expect(calculateRankTier(15000)).toBe('S');
    expect(calculateRankTier(20000)).toBe('S');
    expect(calculateRankTier(24999)).toBe('S');
  });

  it('should return SS for XP 25000-49999', () => {
    expect(calculateRankTier(25000)).toBe('SS');
    expect(calculateRankTier(40000)).toBe('SS');
    expect(calculateRankTier(49999)).toBe('SS');
  });

  it('should return SSS for XP 50000+', () => {
    expect(calculateRankTier(50000)).toBe('SSS');
    expect(calculateRankTier(100000)).toBe('SSS');
    expect(calculateRankTier(1000000)).toBe('SSS');
  });
});

describe('getXPForNextRank', () => {
  it('should return correct thresholds for each rank', () => {
    expect(getXPForNextRank('C')).toBe(1000);
    expect(getXPForNextRank('B')).toBe(3000);
    expect(getXPForNextRank('A')).toBe(6000);
    expect(getXPForNextRank('AA')).toBe(10000);
    expect(getXPForNextRank('AAA')).toBe(15000);
    expect(getXPForNextRank('S')).toBe(25000);
    expect(getXPForNextRank('SS')).toBe(50000);
    expect(getXPForNextRank('SSS')).toBe(Infinity);
  });
});

describe('getNextRank', () => {
  it('should return correct next rank for each tier', () => {
    expect(getNextRank('C')).toBe('B');
    expect(getNextRank('B')).toBe('A');
    expect(getNextRank('A')).toBe('AA');
    expect(getNextRank('AA')).toBe('AAA');
    expect(getNextRank('AAA')).toBe('S');
    expect(getNextRank('S')).toBe('SS');
    expect(getNextRank('SS')).toBe('SSS');
    expect(getNextRank('SSS')).toBe('SSS'); // Max rank stays the same
  });
});

describe('calculateRPGStats', () => {
  it('should return all zeros for empty stats', () => {
    const stats = createMockStats();
    const rpgStats = calculateRPGStats(stats);
    expect(rpgStats).toEqual({
      health: 0,
      mana: 0,
      strength: 0,
      charisma: 0,
      wisdom: 0,
    });
  });

  it('should calculate health from commits', () => {
    const stats = createMockStats({ totalCommits: 25 }); // 25 * 2 = 50
    expect(calculateRPGStats(stats).health).toBe(50);
  });

  it('should cap health at 100', () => {
    const stats = createMockStats({ totalCommits: 100 }); // 100 * 2 = 200, capped at 100
    expect(calculateRPGStats(stats).health).toBe(100);
  });

  it('should calculate mana from issues and reviews', () => {
    const stats = createMockStats({ totalIssues: 5, totalReviews: 5 }); // (5+5) * 5 = 50
    expect(calculateRPGStats(stats).mana).toBe(50);
  });

  it('should calculate strength from PRs', () => {
    const stats = createMockStats({ totalPRs: 20 }); // 20 * 3 = 60
    expect(calculateRPGStats(stats).strength).toBe(60);
  });

  it('should calculate charisma from stars', () => {
    const stats = createMockStats({ totalStars: 30 }); // 30 * 2 = 60
    expect(calculateRPGStats(stats).charisma).toBe(60);
  });

  it('should calculate wisdom from issues and reviews', () => {
    const stats = createMockStats({ totalIssues: 10, totalReviews: 5 }); // (10+5) * 4 = 60
    expect(calculateRPGStats(stats).wisdom).toBe(60);
  });

  it('should cap all stats at 100', () => {
    const stats = createMockStats({
      totalCommits: 200,
      totalIssues: 100,
      totalReviews: 100,
      totalPRs: 100,
      totalStars: 200,
    });
    const rpgStats = calculateRPGStats(stats);
    expect(rpgStats.health).toBe(100);
    expect(rpgStats.mana).toBe(100);
    expect(rpgStats.strength).toBe(100);
    expect(rpgStats.charisma).toBe(100);
    expect(rpgStats.wisdom).toBe(100);
  });

  it('should apply badge stat boosts', () => {
    const stats = createMockStats({ totalCommits: 25 }); // health = 50
    const badges: Badge[] = [
      {
        id: '1',
        name: 'Test Badge',
        icon_slug: 'test',
        stat_boost: { health: 20, strength: 10 },
        created_at: new Date().toISOString(),
      },
    ];
    const rpgStats = calculateRPGStats(stats, badges);
    expect(rpgStats.health).toBe(70); // 50 + 20
    expect(rpgStats.strength).toBe(10); // 0 + 10
  });

  it('should cap stats at 100 even with badge boosts', () => {
    const stats = createMockStats({ totalCommits: 60 }); // health = 100 (capped)
    const badges: Badge[] = [
      {
        id: '1',
        name: 'Test Badge',
        icon_slug: 'test',
        stat_boost: { health: 50 },
        created_at: new Date().toISOString(),
      },
    ];
    const rpgStats = calculateRPGStats(stats, badges);
    expect(rpgStats.health).toBe(100); // Already 100, stays 100
  });

  it('should handle multiple badge boosts', () => {
    const stats = createMockStats();
    const badges: Badge[] = [
      {
        id: '1',
        name: 'Badge 1',
        icon_slug: 'test1',
        stat_boost: { health: 10, mana: 5 },
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Badge 2',
        icon_slug: 'test2',
        stat_boost: { health: 15, strength: 20 },
        created_at: new Date().toISOString(),
      },
    ];
    const rpgStats = calculateRPGStats(stats, badges);
    expect(rpgStats.health).toBe(25); // 0 + 10 + 15
    expect(rpgStats.mana).toBe(5);
    expect(rpgStats.strength).toBe(20);
  });
});

describe('getRankDisplayName', () => {
  it('should return correct display names for all ranks', () => {
    expect(getRankDisplayName('C')).toBe('Novice Coder');
    expect(getRankDisplayName('B')).toBe('Middle Committer');
    expect(getRankDisplayName('A')).toBe('Skilled Developer');
    expect(getRankDisplayName('AA')).toBe('Advanced Architect');
    expect(getRankDisplayName('AAA')).toBe('Elite Engineer');
    expect(getRankDisplayName('S')).toBe('Expert Maestro');
    expect(getRankDisplayName('SS')).toBe('Master Sorcerer');
    expect(getRankDisplayName('SSS')).toBe('Legendary Code Warrior');
  });
});

// Integration test: Full XP to rank progression
describe('XP to Rank Integration', () => {
  it('should correctly map stats to rank progression', () => {
    // Novice with minimal activity
    const noviceStats = createMockStats({ totalCommits: 50 }); // 500 XP
    expect(calculateRankTier(calculateXP(noviceStats))).toBe('C');

    // Intermediate with more activity
    const intermediateStats = createMockStats({
      totalCommits: 100, // 1000 XP
      totalPRs: 10,      // 400 XP
    });
    expect(calculateRankTier(calculateXP(intermediateStats))).toBe('B');

    // Skilled with good activity
    const skilledStats = createMockStats({
      totalCommits: 200,  // 2000 XP
      totalPRs: 25,       // 1000 XP
      totalStars: 10,     // 500 XP
    });
    expect(calculateRankTier(calculateXP(skilledStats))).toBe('A');

    // Legend with massive activity
    const legendStats = createMockStats({
      totalCommits: 1000,  // 10000 XP
      totalPRs: 500,       // 20000 XP
      totalStars: 500,     // 25000 XP
      totalIssues: 100,    // 1500 XP
      totalReviews: 100,   // 2000 XP
    });
    expect(calculateRankTier(calculateXP(legendStats))).toBe('SSS');
  });
});
