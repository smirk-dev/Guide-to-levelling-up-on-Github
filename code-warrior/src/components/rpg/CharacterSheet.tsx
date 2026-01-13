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
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-pixel-heading text-[16px] text-[var(--gold-light)]">
            CHARACTER
          </h2>
          <PixelBadge variant="gold" size="md">
            RANK {rankTier}
          </PixelBadge>
        </div>

        {/* Avatar and basic info */}
        <div className="flex items-start gap-4 mb-8">
          <div className="flex-shrink-0">
            <PixelAvatar src={avatarUrl} alt={username} size="xl" glow />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="font-pixel text-[12px] text-white mb-2 text-outline-dark break-words leading-relaxed">
              {username}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <IconRank size={16} />
              <span className="font-pixel text-[10px] text-[var(--gold-light)] leading-tight">
                {rankName}
              </span>
            </div>
            <div className="font-pixel text-[10px] text-[var(--gray-highlight)]">
              LVL {level}
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2 gap-2">
            <span className="font-pixel text-[10px] text-[var(--gold-light)] leading-tight">
              EXPERIENCE
            </span>
            <span className="font-pixel text-[10px] text-[var(--gold-medium)] tabular-nums">
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
                ? `${(xpToNextRank - xp).toLocaleString()} TO NEXT`
                : 'MAX RANK'}
            </span>
          </div>
        </div>

        {/* RPG Stats */}
        <div className="space-y-5">
          <h4 className="font-pixel text-[var(--font-xs)] text-[var(--gray-highlight)] mb-4 uppercase tracking-wider">
            ATTRIBUTES
          </h4>

          {/* Grid layout for stats */}
          <div className="grid gap-5">
            {/* Health */}
            <div className="grid grid-cols-[24px_1fr] gap-3 items-center">
              <IconHeart size={24} color="#da3633" />
              <div className="flex-1 min-w-0">
                <StatBar
                  label="HEALTH"
                  current={stats.health}
                  max={100}
                  variant="health"
                  className="w-full"
                />
              </div>
            </div>

            {/* Mana */}
            <div className="grid grid-cols-[24px_1fr] gap-3 items-center">
              <IconMana size={24} color="#58a6ff" />
              <div className="flex-1 min-w-0">
                <StatBar
                  label="MANA"
                  current={stats.mana}
                  max={100}
                  variant="mana"
                  className="w-full"
                />
              </div>
            </div>

            {/* Strength */}
            <div className="grid grid-cols-[24px_1fr] gap-3 items-center">
              <IconSword size={24} color="#da3633" />
              <div className="flex-1 min-w-0">
                <StatBar
                  label="STRENGTH"
                  current={stats.strength}
                  max={100}
                  variant="strength"
                  className="w-full"
                />
              </div>
            </div>

            {/* Charisma */}
            <div className="grid grid-cols-[24px_1fr] gap-3 items-center">
              <IconStar size={24} color="#ffd700" />
              <div className="flex-1 min-w-0">
                <StatBar
                  label="CHARISMA"
                  current={stats.charisma}
                  max={100}
                  variant="xp"
                  className="w-full"
                />
              </div>
            </div>

            {/* Wisdom */}
            <div className="grid grid-cols-[24px_1fr] gap-3 items-center">
              <IconReview size={24} color="#a371f7" />
              <div className="flex-1 min-w-0">
                <StatBar
                  label="WISDOM"
                  current={stats.wisdom}
                  max={100}
                  variant="purple"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </PixelFrame>
    </motion.div>
  );
};
