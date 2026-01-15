'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PixelTooltip, PixelBadge } from '../ui/PixelComponents';
import type { GitHubAchievementBadge } from '@/types/database';

interface AchievementBadgesProps {
  badges: GitHubAchievementBadge[];
  className?: string;
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Pixel art emoji icons for each badge type
const BADGE_ICONS: Record<string, string> = {
  'Pull Shark': '\u{1F988}', // shark
  'Starstruck': '\u{2B50}', // star
  'Galaxy Brain': '\u{1F9E0}', // brain
  'Pair Extraordinaire': '\u{1F91D}', // handshake
  'YOLO': '\u{1F525}', // fire
  'Quickdraw': '\u{26A1}', // lightning
  'Arctic Code Vault': '\u{2744}', // snowflake
  'Public Sponsor': '\u{1F496}', // heart
};

// Tier colors
const TIER_COLORS = {
  x1: 'var(--gray-highlight)',
  x2: 'var(--mana-light)',
  x3: 'var(--gold-light)',
  x4: 'var(--critical-light)',
} as const;

export const AchievementBadges: React.FC<AchievementBadgesProps> = ({
  badges,
  className = '',
  maxDisplay = 6,
  size = 'md',
}) => {
  const sizeMap = {
    sm: { container: 40, icon: 'text-lg', tier: 16, tierText: 'text-[7px]', gap: 'gap-2' },
    md: { container: 48, icon: 'text-2xl', tier: 20, tierText: 'text-[8px]', gap: 'gap-3' },
    lg: { container: 64, icon: 'text-4xl', tier: 24, tierText: 'text-[10px]', gap: 'gap-4' },
    xl: { container: 96, icon: 'text-6xl', tier: 32, tierText: 'text-[12px]', gap: 'gap-4' },
  };
  const sizing = sizeMap[size];
  if (!badges || badges.length === 0) {
    return (
      <div className={`text-center py-2 ${className}`}>
        <span className="font-pixel text-[9px] text-[var(--gray-medium)]">
          No achievements yet - keep coding!
        </span>
      </div>
    );
  }

  const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges;
  const remainingCount = maxDisplay ? Math.max(0, badges.length - maxDisplay) : 0;

  return (
    <div className={`${className}`}>
      <div className={`flex flex-wrap items-center justify-center ${sizing.gap}`}>
        {displayBadges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <PixelTooltip
              content={`${badge.name}${badge.tier ? ` (${badge.tier.toUpperCase()})` : ''} - ${badge.description}`}
              position="top"
            >
              <div
                className="relative flex items-center justify-center bg-[var(--void-darker)] border-2 border-[var(--gray-dark)] cursor-pointer hover:border-[var(--gold-medium)] transition-colors"
                style={{
                  width: `${sizing.container}px`,
                  height: `${sizing.container}px`,
                  boxShadow: '2px 2px 0 rgba(0, 0, 0, 0.4)',
                }}
              >
                {/* Badge Icon */}
                <span className={sizing.icon}>
                  {BADGE_ICONS[badge.name] || '\u{1F3C6}'}
                </span>

                {/* Tier indicator */}
                {badge.tier && (
                  <div
                    className="absolute -bottom-1 -right-1 flex items-center justify-center bg-[var(--void-darkest)] border border-[var(--gray-dark)]"
                    style={{
                      width: `${sizing.tier}px`,
                      height: `${sizing.tier}px`,
                      boxShadow: '1px 1px 0 rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    <span
                      className={`font-pixel ${sizing.tierText}`}
                      style={{ color: TIER_COLORS[badge.tier] }}
                    >
                      {badge.tier.replace('x', '')}
                    </span>
                  </div>
                )}
              </div>
            </PixelTooltip>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Compact variant for inline display
export const AchievementBadgesCompact: React.FC<AchievementBadgesProps> = ({
  badges,
  className = '',
  maxDisplay = 4,
}) => {
  if (!badges || badges.length === 0) {
    return null;
  }

  const displayBadges = badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {displayBadges.map((badge) => (
        <PixelTooltip
          key={badge.id}
          content={`${badge.name}${badge.tier ? ` ${badge.tier.toUpperCase()}` : ''}`}
          position="top"
        >
          <div className="flex items-center">
            <span className="text-sm">
              {BADGE_ICONS[badge.name] || '\u{1F3C6}'}
            </span>
            {badge.tier && (
              <span
                className="font-pixel text-[7px] ml-[-2px]"
                style={{ color: TIER_COLORS[badge.tier] }}
              >
                {badge.tier.replace('x', '')}
              </span>
            )}
          </div>
        </PixelTooltip>
      ))}
      {remainingCount > 0 && (
        <span className="font-pixel text-[8px] text-[var(--gray-medium)]">
          +{remainingCount}
        </span>
      )}
    </div>
  );
};
