'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PixelAvatar, PixelBadge, PixelButton, PixelProgress } from '../ui/PixelComponents';
import { IconSync, IconXP } from '../icons/PixelIcons';
import { getRankDisplayName } from '@/lib/game-logic';
import type { RankTier } from '@/types/database';

interface GameHUDProps {
  username: string;
  avatarUrl: string | null;
  xp: number;
  rankTier: RankTier;
  level: number;
  xpToNextLevel: number;
  onSync: () => void;
  syncing?: boolean;
  lastSynced?: string | null;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  username,
  avatarUrl,
  xp,
  rankTier,
  level,
  xpToNextLevel,
  onSync,
  syncing = false,
  lastSynced,
}) => {
  const xpInLevel = xp % 1000;
  const xpProgress = (xpInLevel / 1000) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-[var(--void-darker)] border-b-4 border-[var(--gray-dark)] px-4 py-3"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Avatar + User Info */}
        <div className="flex items-center gap-3">
          <PixelAvatar src={avatarUrl} alt={username} size="md" glow />

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-pixel text-[11px] text-white truncate max-w-[120px]">
                {username}
              </span>
              <PixelBadge variant="gold" size="sm">
                {rankTier}
              </PixelBadge>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-pixel text-[9px] text-[var(--gray-highlight)]">
                Lv.{level}
              </span>
              <div className="w-24">
                <PixelProgress
                  value={xpInLevel}
                  max={1000}
                  variant="gold"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center: XP Display */}
        <div className="hidden md:flex items-center gap-2">
          <IconXP size={20} color="#ffd700" />
          <span className="font-pixel-heading text-[16px] text-[var(--gold-light)]">
            {xp.toLocaleString()}
          </span>
          <span className="font-pixel text-[9px] text-[var(--gray-medium)]">
            XP
          </span>
        </div>

        {/* Right: Sync Button */}
        <div className="flex items-center gap-3">
          <PixelButton
            variant="mana"
            size="sm"
            onClick={onSync}
            loading={syncing}
            disabled={syncing}
          >
            <span className="flex items-center gap-2">
              <IconSync size={14} className={syncing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">SYNC</span>
            </span>
          </PixelButton>
        </div>
      </div>
    </motion.div>
  );
};
