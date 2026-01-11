'use client';

import { motion } from 'framer-motion';
import { generateSegmentedBarBackground, STAT_BAR_COLORS } from '@/lib/pixel-utils';

interface StatBarProps {
  label: string;
  current: number;
  max: number;
  color: 'health' | 'mana' | 'xp';
  showNumbers?: boolean;
}

export default function StatBar({
  label,
  current,
  max,
  color,
  showNumbers = true,
}: StatBarProps) {
  const percentage = Math.min((current / max) * 100, 100);
  const colors = STAT_BAR_COLORS[color];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-mono text-gray-300 uppercase tracking-wide">
          {label}
        </span>
        {showNumbers && (
          <span className="text-xs font-mono text-gray-400">
            {current} / {max}
          </span>
        )}
      </div>

      {/* Pixel art progress bar with segments */}
      <div className="relative w-full h-6 bg-midnight-void-2 border-3 border-gray-pixel-0 rounded-pixel overflow-hidden pixel-perfect">
        <motion.div
          className="h-full relative"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'linear' }}
          style={{
            backgroundImage: generateSegmentedBarBackground(color),
            boxShadow: `inset 0 -6px 0 ${colors.dark}`,
          }}
        >
          {/* Segment dividers - creates vertical lines every 16px */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(to right, transparent 0px, transparent 14px, rgba(0,0,0,0.3) 14px, rgba(0,0,0,0.3) 16px)',
            }}
          />
        </motion.div>

        {/* Percentage text overlay with pixel styling */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white" style={{
            textShadow: '-1px -1px 0 rgba(0,0,0,0.8), 1px -1px 0 rgba(0,0,0,0.8), -1px 1px 0 rgba(0,0,0,0.8), 1px 1px 0 rgba(0,0,0,0.8)'
          }}>
            {Math.floor(percentage)}%
          </span>
        </div>
      </div>
    </div>
  );
}
