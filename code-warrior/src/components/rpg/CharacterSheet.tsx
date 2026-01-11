'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PixelFrame, StatBar, PixelAvatar, PixelBadge } from '../ui/PixelComponents';
import { IconHeart, IconMana, IconSword, IconStar, IconReview, IconRank } from '../icons/PixelIcons';
import { getRankDisplayName } from '@/lib/game-logic';
import type { RankTier, RPGStats } from '@/types/database';

interface CharacterSheetProps {
  username: string;
  avatarUrl: string | null;
  xp: number;
  rankTier: RankTier;
  stats: RPGStats;
  level: number;
  xpToNextRank: number;
  className?: string;
}

export const CharacterSheet: React.FC<CharacterSheetProps> = ({
  username,
  avatarUrl,
  xp,
  rankTier,
  stats,
  level,
  xpToNextRank,
  className = '',
}) => {
  const rankName = getRankDisplayName(rankTier);

  // Calculate XP progress within current rank
  const rankThresholds: Record<RankTier, number> = {
    C: 0,
    B: 1000,
    A: 3000,
    AA: 6000,
    AAA: 10000,
    S: 15000,
    SS: 25000,
    SSS: 50000,
  };

  const currentRankXP = rankThresholds[rankTier];
  const xpInCurrentRank = xp - currentRankXP;
  const xpNeededForNextRank = xpToNextRank - currentRankXP;
  const xpProgress = xpNeededForNextRank > 0 ? (xpInCurrentRank / xpNeededForNextRank) * 100 : 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={className}
    >
      <PixelFrame variant="gold" padding="lg">
        {/* Header with rank badge */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-pixel-heading text-[12px] text-[var(--gold-light)]">
            CHARACTER
          </h2>
          <PixelBadge variant="gold" size="md">
            RANK {rankTier}
          </PixelBadge>
        </div>

        {/* Avatar and basic info */}
        <div className="flex items-center gap-4 mb-6">
          <PixelAvatar src={avatarUrl} alt={username} size="xl" glow />
          <div className="flex-1">
            <h3 className="font-pixel text-[14px] text-white mb-1 text-outline-dark">
              {username}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <IconRank size={16} />
              <span className="font-pixel text-[10px] text-[var(--gold-light)]">
                {rankName}
              </span>
            </div>
            <div className="font-pixel text-[8px] text-[var(--gray-highlight)]">
              LVL {level}
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1">
            <span className="font-pixel text-[8px] text-[var(--gold-light)]">
              EXPERIENCE
            </span>
            <span className="font-pixel text-[8px] text-[var(--gold-medium)]">
              {xp.toLocaleString()} XP
            </span>
          </div>
          <div className="stat-bar stat-bar-xp">
            <div
              className="stat-bar-fill"
              style={{ width: `${Math.min(xpProgress, 100)}%` }}
            />
            <span className="stat-bar-label">
              {rankTier !== 'SSS'
                ? `${xpToNextRank - xp} TO NEXT RANK`
                : 'MAX RANK'}
            </span>
          </div>
        </div>

        {/* RPG Stats */}
        <div className="space-y-4">
          <h4 className="font-pixel text-[8px] text-[var(--gray-highlight)] mb-3 uppercase tracking-wider">
            ATTRIBUTES
          </h4>

          <div className="flex items-center gap-2">
            <IconHeart size={16} color="#da3633" />
            <StatBar
              label="HEALTH"
              current={stats.health}
              max={100}
              variant="health"
              className="flex-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <IconMana size={16} color="#58a6ff" />
            <StatBar
              label="MANA"
              current={stats.mana}
              max={100}
              variant="mana"
              className="flex-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <IconSword size={16} color="#da3633" />
            <StatBar
              label="STRENGTH"
              current={stats.strength}
              max={100}
              variant="strength"
              className="flex-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <IconStar size={16} color="#ffd700" />
            <StatBar
              label="CHARISMA"
              current={stats.charisma}
              max={100}
              variant="xp"
              className="flex-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <IconReview size={16} color="#a371f7" />
            <StatBar
              label="WISDOM"
              current={stats.wisdom}
              max={100}
              variant="purple"
              className="flex-1"
            />
          </div>
        </div>
      </PixelFrame>
    </motion.div>
  );
};
