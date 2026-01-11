'use client';

import { motion } from 'framer-motion';
import { User, Quest, UserQuest, Badge } from '@/types/database';
import { RPGStats } from '@/types/database';
import type { GitHubStats, GitHubAchievement } from '@/lib/github';
import Avatar from './Avatar';
import StatBar from './StatBar';
import ActiveQuestPreview from './ActiveQuestPreview';
import BadgeSlot from './BadgeSlot';
import { PixelSword, PixelHeart, PixelStar, PixelCode, PixelCheckmark, PixelGem, PixelShield } from '@/components/icons/PixelIcon';
import { getRankDisplayName, getXPForNextRank } from '@/lib/game-logic';
import Link from 'next/link';

interface CharacterSheetProps {
  user: User;
  stats: RPGStats;
  githubStats?: GitHubStats;
  activeQuest?: Quest;
  activeUserQuest?: UserQuest;
  equippedBadges?: Badge[];
  githubAchievements?: GitHubAchievement[];
  onBadgeUnequip?: (badgeId: string) => Promise<void>;
}

export default function CharacterSheet({ user, stats, githubStats, activeQuest, activeUserQuest, equippedBadges, githubAchievements, onBadgeUnequip }: CharacterSheetProps) {
  const nextRankXP = getXPForNextRank(user.rank_tier);
  const rankName = getRankDisplayName(user.rank_tier);

  return (
    <div className="min-h-screen bg-midnight-void text-white p-4 md:p-8">
      {/* 3-Column Grid Layout from ux-design.md - Responsive */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        
        {/* LEFT COLUMN: The Hero */}
        <motion.div
          className="bg-midnight-void-1 border-3 border-gray-pixel-0 rounded-pixel-sm p-6 pixel-perfect"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Avatar user={user} />
          
          {/* Rank Display */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm mb-1">Current Title</p>
            <h3 className="font-pixel text-sm text-mana-blue">
              {rankName}
            </h3>
          </div>

          {/* Equipped Badges Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-pixel text-xs text-loot-gold flex items-center gap-2">
                <PixelStar className="text-loot-gold" size="sm" />
                EQUIPPED BADGES
              </h4>
              <Link href="/badges">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1 text-xs text-mana-blue hover:text-loot-gold transition-colors"
                >
                  View All
                </motion.button>
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((slotNumber) => {
                const badge = equippedBadges && equippedBadges[slotNumber - 1] ? equippedBadges[slotNumber - 1] : null;
                return (
                  <BadgeSlot
                    key={slotNumber}
                    slotNumber={slotNumber}
                    badge={badge}
                    onUnequip={onBadgeUnequip}
                  />
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* CENTER COLUMN: The Stats */}
        <motion.div
          className="bg-midnight-void-1 border-3 border-gray-pixel-0 rounded-pixel-sm p-6 pixel-perfect space-y-6"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Main Quest Card */}
          <ActiveQuestPreview quest={activeQuest} userQuest={activeUserQuest} />

          <div>
            <h3 className="font-pixel text-xl text-loot-gold mb-4">
              CHARACTER STATS
            </h3>

            {/* Health Bar */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <PixelHeart className="text-health-green" size="sm" />
                <span className="font-pixel text-xs text-health-green">HEALTH (Commits)</span>
              </div>
              <StatBar
                label="Commit Activity"
                current={stats.health}
                max={100}
                color="health"
              />
            </div>

            {/* Mana Bar */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <PixelGem className="text-mana-blue" size="sm" />
                <span className="font-pixel text-xs text-mana-blue">MANA (Reviews)</span>
              </div>
              <StatBar
                label="Code Review Energy"
                current={stats.mana}
                max={100}
                color="mana"
              />
            </div>

            {/* XP Progress */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <PixelStar className="text-loot-gold" size="sm" />
                <span className="font-pixel text-xs text-loot-gold">EXPERIENCE</span>
              </div>
              <StatBar
                label="Progress to Next Rank"
                current={user.xp}
                max={nextRankXP === Infinity ? user.xp : nextRankXP}
                color="xp"
              />
            </div>

            {/* RPG Attributes */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t-3 border-gray-pixel-0">
              <div className="flex items-center gap-3">
                <PixelSword className="text-critical-red" size="md" />
                <div>
                  <p className="text-xs text-gray-400">Strength (PRs)</p>
                  <p className="font-pixel text-lg text-critical-red">{stats.strength}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <PixelStar className="text-loot-gold" size="md" />
                <div>
                  <p className="text-xs text-gray-400">Charisma (Stars)</p>
                  <p className="font-pixel text-lg text-loot-gold">{stats.charisma}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <PixelShield className="text-mana-blue" size="md" />
                <div>
                  <p className="text-xs text-gray-400">Wisdom (Issues)</p>
                  <p className="font-pixel text-lg text-mana-blue">{stats.wisdom}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <PixelGem className="text-health-green" size="md" />
                <div>
                  <p className="text-xs text-gray-400">Total XP</p>
                  <p className="font-pixel text-lg text-health-green">{user.xp}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: The Inventory (Achievements/Loot) + GitHub Stats */}
        <motion.div
          className="bg-midnight-void-1 border-3 border-gray-pixel-0 rounded-pixel-sm p-6 pixel-perfect space-y-6"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* GitHub Stats Section */}
          {githubStats && (
            <div>
              <h3 className="font-pixel text-xl text-mana-blue mb-4 flex items-center gap-2">
                <PixelCode className="text-mana-blue" size="md" />
                GITHUB STATS
              </h3>
              
              <div className="space-y-3">
                <div className="bg-midnight-void-2 border-2 border-gray-pixel-0 rounded-pixel p-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <PixelStar className="text-loot-gold" size="sm" />
                    <span className="text-sm text-gray-300">Stars Received</span>
                  </div>
                  <span className="font-pixel text-lg text-loot-gold">{githubStats.totalStars}</span>
                </div>

                <div className="bg-midnight-void-2 border-2 border-gray-pixel-0 rounded-pixel p-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <PixelSword className="text-critical-red" size="sm" />
                    <span className="text-sm text-gray-300">Pull Requests</span>
                  </div>
                  <span className="font-pixel text-lg text-critical-red">{githubStats.totalPRs}</span>
                </div>

                <div className="bg-midnight-void-2 border-2 border-gray-pixel-0 rounded-pixel p-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <PixelCheckmark className="text-health-green" size="sm" />
                    <span className="text-sm text-gray-300">Commits</span>
                  </div>
                  <span className="font-pixel text-lg text-health-green">{githubStats.totalCommits}</span>
                </div>

                <div className="bg-midnight-void-2 border-2 border-gray-pixel-0 rounded-pixel p-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <PixelGem className="text-mana-blue" size="sm" />
                    <span className="text-sm text-gray-300">Issues Opened</span>
                  </div>
                  <span className="font-pixel text-lg text-mana-blue">{githubStats.totalIssues}</span>
                </div>

                <div className="bg-midnight-void-2 border-2 border-gray-pixel-0 rounded-pixel p-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <PixelGem className="text-mana-blue" size="sm" />
                    <span className="text-sm text-gray-300">Code Reviews</span>
                  </div>
                  <span className="font-pixel text-lg text-mana-blue">{githubStats.totalReviews}</span>
                </div>

                <div className="bg-midnight-void-2 border-2 border-gray-pixel-0 rounded-pixel p-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <PixelShield className="text-loot-gold" size="sm" />
                    <span className="text-sm text-gray-300">Public Repos</span>
                  </div>
                  <span className="font-pixel text-lg text-loot-gold">{githubStats.totalRepos}</span>
                </div>
              </div>
            </div>
          )}

          {/* GitHub Achievements Section */}
          {githubAchievements && githubAchievements.length > 0 && (
            <div>
              <h3 className="font-pixel text-xl text-loot-gold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                GITHUB ACHIEVEMENTS
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {githubAchievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-midnight-void-2 border-2 border-loot-gold-1 rounded-pixel p-3 text-center"
                  >
                    <div className="text-2xl mb-1">🏆</div>
                    <p className="font-pixel text-xs text-loot-gold">{achievement.name}</p>
                    {achievement.tier && (
                      <p className="text-xs text-gray-400 mt-1">{achievement.tier}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <h3 className="font-pixel text-xl text-loot-gold">
            RECENT LOOT
          </h3>
          
          <div className="space-y-3">
            <div className="bg-midnight-void-2 border-2 border-gray-pixel-0 rounded-pixel p-3">
              <p className="text-xs text-gray-400 mb-1">Achievement Unlocked</p>
              <p className="font-mono text-sm text-loot-gold">Code Warrior Initiated</p>
            </div>
            
            <div className="bg-midnight-void-2 border-2 border-gray-pixel-0 rounded-pixel p-3">
              <p className="text-xs text-gray-400 mb-1">Last Synced</p>
              <p className="font-mono text-sm text-mana-blue">
                {new Date(user.last_synced_at).toLocaleString()}
              </p>
            </div>

            <div className="bg-midnight-void-2 border-2 border-gray-pixel-0 rounded-pixel p-3">
              <p className="text-xs text-gray-400 mb-1">Joined</p>
              <p className="font-mono text-sm text-health-green">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
