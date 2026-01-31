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
  showProfile?: boolean;
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
  showProfile = true,
}) => {
  const xpInLevel = xp % 1000;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full glass-panel border-b border-[var(--glass-border)] px-4 py-3 sticky top-0 z-50"
      style={{
        background: 'rgba(10, 10, 11, 0.9)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Screen reader announcements for sync status */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {syncing && "Syncing GitHub statistics..."}
      </div>

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Avatar + User Info */}
        {showProfile ? (
          <div className="flex items-center gap-3">
            <div className="relative">
              <PixelAvatar src={avatarUrl} alt={username} size="md" glow />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-sans text-sm font-medium text-white truncate max-w-[140px]">
                  {username}
                </span>
                <PixelBadge variant="gold" size="sm">
                  {rankTier}
                </PixelBadge>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[var(--cyber-cyan)]">
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
        ) : (
          <div className="flex-1" />
        )}

        {/* Center: XP Display with Neon Glow */}
        <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-lg glass-panel-gold">
          <IconXP size={20} color="#FFD700" />
          <div className="flex items-baseline gap-1">
            <span className="font-pixel text-base text-[var(--neon-gold)] text-glow-gold">
              {xp.toLocaleString()}
            </span>
            <span className="font-mono text-xs text-[var(--gray-lighter)]">
              XP
            </span>
          </div>
        </div>

        {/* Right: Sync Button - Quest Style */}
        <div className="flex items-center gap-3">
          <PixelButton
            variant="mana"
            size="sm"
            onClick={onSync}
            loading={syncing}
            disabled={syncing}
            aria-label={syncing ? 'Syncing GitHub stats...' : 'Sync GitHub stats'}
            aria-busy={syncing}
          >
            <span className="flex items-center gap-2">
              <IconSync size={14} className={syncing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline font-pixel text-[10px]">SYNC</span>
            </span>
          </PixelButton>
        </div>
      </div>
    </motion.div>
  );
};
