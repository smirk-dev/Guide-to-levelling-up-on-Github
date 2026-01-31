'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PixelFrame, PixelBadge } from '../ui/PixelComponents';
import { BattleStatsPanel } from '../rpg/BattleStatsPanel';
import { AchievementBadges } from '../rpg/AchievementBadges';
import { IconScroll } from '../icons/PixelIcons';
import type { RPGStats, GitHubAchievementBadge } from '@/types/database';

interface QuickViewTabProps {
  xp: number;
  level: number;
  completedQuests: number;
  reposCount: number;
  claimableQuests: number;
  rpgStats: RPGStats;
  badges: GitHubAchievementBadge[];
  hasNeverSynced: boolean;
  onNavigateToQuests: () => void;
}

export const QuickViewTab: React.FC<QuickViewTabProps> = ({
  xp,
  level,
  completedQuests,
  reposCount,
  claimableQuests,
  rpgStats,
  badges,
  hasNeverSynced,
  onNavigateToQuests,
}) => {
  return (
    <div 
      role="tabpanel" 
      id="tabpanel-quick" 
      aria-labelledby="tab-quick"
      className="tab-panel quick-view-tab"
    >
      {/* Welcome Banner for First-time Users */}
      {hasNeverSynced && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <PixelFrame variant="mana" padding="md">
            <div className="flex items-center justify-center gap-4">
              <span className="font-sans text-sm text-[var(--cyber-cyan)] font-medium text-center">
                ⚡ Welcome, Warrior! Click <span className="font-pixel text-[10px]">SYNC</span> above to load your GitHub stats and start your adventure!
              </span>
            </div>
          </PixelFrame>
        </motion.div>
      )}

      {/* Quick Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <PixelFrame variant="mana" padding="md">
          <div className="quick-stats-grid">
            {/* Total XP */}
            <div className="quick-stat-card">
              <p className="quick-stat-value quick-stat-gold">
                {xp.toLocaleString()}
              </p>
              <p className="quick-stat-label">Total XP</p>
            </div>
            
            {/* Quests Done */}
            <div className="quick-stat-card">
              <p className="quick-stat-value quick-stat-health">
                {completedQuests}
              </p>
              <p className="quick-stat-label">Quests Done</p>
            </div>
            
            {/* Level */}
            <div className="quick-stat-card">
              <p className="quick-stat-value quick-stat-violet">
                {level}
              </p>
              <p className="quick-stat-label">Level</p>
            </div>
            
            {/* Repos */}
            <div className="quick-stat-card">
              <p className="quick-stat-value quick-stat-cyan">
                {reposCount}
              </p>
              <p className="quick-stat-label">Repos</p>
            </div>
          </div>
        </PixelFrame>
      </motion.div>

      {/* Claimable Quests Alert */}
      {claimableQuests > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div
            className="cursor-pointer group"
            onClick={onNavigateToQuests}
          >
            <PixelFrame variant="gold" padding="md">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--neon-gold)]/20 flex items-center justify-center">
                    <IconScroll size={20} color="#FFD700" />
                  </div>
                  <div>
                    <p className="font-pixel text-[11px] text-[var(--neon-gold)] group-hover:text-glow-gold transition-all">
                      ⚔ Rewards Available!
                    </p>
                    <p className="font-sans text-xs text-[var(--gray-lighter)] mt-0.5">
                      {claimableQuests} quest{claimableQuests > 1 ? 's' : ''} ready to claim
                    </p>
                  </div>
                </div>
                <PixelBadge variant="gold" size="md">{claimableQuests}</PixelBadge>
              </div>
            </PixelFrame>
          </div>
        </motion.div>
      )}

      {/* Battle Stats Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <BattleStatsPanel stats={rpgStats} barHeight="lg" />
      </motion.div>

      {/* Equipped Badges Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <PixelFrame variant="stone" padding="md">
          <div className="badges-widget">
            <div className="badges-widget-header">
              <h4 className="badges-widget-title">🏅 Equipped Badges</h4>
              <Link href="/badges" className="badges-widget-link">
                Manage Badges →
              </Link>
            </div>
            
            <div className="badges-widget-content">
              {badges.length > 0 ? (
                <>
                  <AchievementBadges badges={badges.slice(0, 5)} size="md" />
                  {badges.length > 5 && (
                    <p className="badges-widget-more">
                      +{badges.length - 5} more badges
                    </p>
                  )}
                </>
              ) : (
                <p className="badges-widget-empty">
                  Sync your GitHub stats to unlock badges!
                </p>
              )}
            </div>
          </div>
        </PixelFrame>
      </motion.div>
    </div>
  );
};

export default QuickViewTab;
