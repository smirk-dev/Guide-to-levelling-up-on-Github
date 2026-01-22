'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PixelFrame, VerticalStatBar } from '../ui/PixelComponents';
import { PixelTooltip } from '../ui/PixelComponents';
import type { RPGStats } from '@/types/database';

interface BattleStatsPanelProps {
  stats: RPGStats;
  className?: string;
  barHeight?: 'sm' | 'md' | 'lg' | 'xl';
}

const STAT_TOOLTIPS = {
  health: 'Based on your commit activity',
  mana: 'Based on issues and reviews',
  strength: 'Based on your pull requests',
  charisma: 'Based on repository stars',
  wisdom: 'Based on community engagement',
};

export const BattleStatsPanel: React.FC<BattleStatsPanelProps> = ({
  stats,
  className = '',
  barHeight = 'lg',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className={className}
    >
      <PixelFrame variant="stone" padding="lg" className="overflow-hidden">
        <h3 className="font-pixel text-[11px] text-[var(--gray-highlight)] mb-4 text-center">
          Battle Stats
        </h3>

        {/* 5-column grid of vertical stat bars - classic FF style */}
        <div className="flex justify-center items-end gap-4">
          <PixelTooltip content={STAT_TOOLTIPS.health} position="top">
            <VerticalStatBar
              label="HP"
              value={stats.health}
              max={100}
              variant="health"
              height={barHeight}
            />
          </PixelTooltip>

          <PixelTooltip content={STAT_TOOLTIPS.mana} position="top">
            <VerticalStatBar
              label="MP"
              value={stats.mana}
              max={100}
              variant="mana"
              height={barHeight}
            />
          </PixelTooltip>

          <PixelTooltip content={STAT_TOOLTIPS.strength} position="top">
            <VerticalStatBar
              label="STR"
              value={stats.strength}
              max={100}
              variant="strength"
              height={barHeight}
            />
          </PixelTooltip>

          <PixelTooltip content={STAT_TOOLTIPS.charisma} position="top">
            <VerticalStatBar
              label="CHA"
              value={stats.charisma}
              max={100}
              variant="charisma"
              height={barHeight}
            />
          </PixelTooltip>

          <PixelTooltip content={STAT_TOOLTIPS.wisdom} position="top">
            <VerticalStatBar
              label="WIS"
              value={stats.wisdom}
              max={100}
              variant="wisdom"
              height={barHeight}
            />
          </PixelTooltip>
        </div>

        {/* Optional: Show total power level */}
        <div className="mt-4 pt-4 border-t-2 border-dashed border-[var(--gray-dark)]">
          <PixelTooltip
            content="Power Level = Average of all 5 stats (HP + MP + STR + CHA + WIS) / 5"
            position="top"
          >
            <div className="flex justify-between items-center cursor-help">
              <span className="font-pixel text-[9px] text-[var(--gray-medium)] flex items-center gap-1">
                Power Level
                <span className="text-[var(--mana-light)] opacity-60">?</span>
              </span>
              <span className="font-pixel-heading text-[14px] text-[var(--gold-light)]">
                {Math.round((stats.health + stats.mana + stats.strength + stats.charisma + stats.wisdom) / 5)}
              </span>
            </div>
          </PixelTooltip>
          <div className="mt-2">
            <div className="h-2 bg-[var(--void-darker)] border border-[var(--gray-dark)] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold-light)] transition-all duration-500"
                style={{
                  width: `${Math.round((stats.health + stats.mana + stats.strength + stats.charisma + stats.wisdom) / 5)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </PixelFrame>
    </motion.div>
  );
};
