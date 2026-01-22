'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PixelFrame } from './PixelComponents';

// Shimmer animation for skeleton loading
const shimmerAnimation = {
  initial: { x: '-100%' },
  animate: { x: '100%' },
  transition: { repeat: Infinity, duration: 1.5, ease: 'linear' as const },
};

interface SkeletonProps {
  className?: string;
}

// Basic skeleton line
export const SkeletonLine: React.FC<SkeletonProps & { width?: string }> = ({
  className = '',
  width = '100%',
}) => (
  <div
    className={`relative overflow-hidden bg-[var(--void-dark)] rounded ${className}`}
    style={{ width }}
  >
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--gray-dark)]/20 to-transparent"
      {...shimmerAnimation}
    />
  </div>
);

// Avatar skeleton
export const SkeletonAvatar: React.FC<SkeletonProps & { size?: 'sm' | 'md' | 'lg' }> = ({
  className = '',
  size = 'md',
}) => {
  const sizes = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-20 h-20' };
  return (
    <div className={`relative overflow-hidden bg-[var(--void-dark)] rounded-full ${sizes[size]} ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--gray-dark)]/20 to-transparent"
        {...shimmerAnimation}
      />
    </div>
  );
};

// Stat bar skeleton
export const SkeletonStatBar: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`relative overflow-hidden h-3 bg-[var(--void-dark)] rounded ${className}`}>
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--gray-dark)]/20 to-transparent"
      {...shimmerAnimation}
    />
  </div>
);

// Card skeleton for quests, badges, etc.
export const SkeletonCard: React.FC<SkeletonProps> = ({ className = '' }) => (
  <PixelFrame variant="stone" padding="md" className={className}>
    <div className="space-y-3">
      <SkeletonLine className="h-4 w-3/4" />
      <SkeletonLine className="h-3 w-full" />
      <SkeletonLine className="h-3 w-2/3" />
    </div>
  </PixelFrame>
);

// Dashboard skeleton layout
export const DashboardSkeleton: React.FC = () => (
  <div className="min-h-screen bg-[var(--void-darkest)]">
    {/* HUD Skeleton */}
    <div className="bg-[var(--void-darker)] border-b-2 border-[var(--gold-dark)] px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SkeletonAvatar size="md" />
          <div className="space-y-2">
            <SkeletonLine className="h-4 w-24" />
            <SkeletonLine className="h-3 w-16" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <SkeletonLine className="h-8 w-20 rounded" />
        </div>
      </div>
    </div>

    {/* Main Content Skeleton */}
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-3">
          <PixelFrame variant="gold" padding="md">
            <div className="flex flex-col items-center space-y-4">
              <SkeletonAvatar size="lg" />
              <SkeletonLine className="h-5 w-32" />
              <SkeletonLine className="h-4 w-24" />
              <div className="w-full space-y-2 mt-4">
                <SkeletonLine className="h-3 w-full" />
                <SkeletonStatBar />
              </div>
            </div>
          </PixelFrame>
        </div>

        {/* Right Column */}
        <div className="col-span-2 space-y-3">
          {/* Stats Row */}
          <PixelFrame variant="mana" padding="sm">
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center space-y-2">
                  <SkeletonLine className="h-6 w-12 mx-auto" />
                  <SkeletonLine className="h-3 w-16 mx-auto" />
                </div>
              ))}
            </div>
          </PixelFrame>

          {/* Quest Cards */}
          <div className="space-y-2">
            <SkeletonLine className="h-4 w-20" />
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>

          {/* Battle Stats */}
          <PixelFrame variant="stone" padding="md">
            <div className="space-y-3">
              <SkeletonLine className="h-4 w-24" />
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-2">
                    <SkeletonLine className="h-3 w-10 mx-auto" />
                    <SkeletonStatBar />
                  </div>
                ))}
              </div>
            </div>
          </PixelFrame>
        </div>
      </div>
    </div>
  </div>
);

// Quests page skeleton
export const QuestsSkeleton: React.FC = () => (
  <div className="min-h-screen bg-[var(--void-darkest)] p-6">
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SkeletonLine className="h-6 w-32" />
        <SkeletonLine className="h-8 w-24 rounded" />
      </div>

      {/* Quest Tabs */}
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <SkeletonLine key={i} className="h-8 w-24 rounded" />
        ))}
      </div>

      {/* Quest Grid */}
      <div className="grid gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <PixelFrame key={i} variant="stone" padding="md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <SkeletonAvatar size="sm" />
                <div className="space-y-2 flex-1">
                  <SkeletonLine className="h-4 w-48" />
                  <SkeletonLine className="h-3 w-full max-w-md" />
                  <SkeletonStatBar className="w-32" />
                </div>
              </div>
              <SkeletonLine className="h-8 w-20 rounded" />
            </div>
          </PixelFrame>
        ))}
      </div>
    </div>
  </div>
);

// Badges page skeleton
export const BadgesSkeleton: React.FC = () => (
  <div className="min-h-screen bg-[var(--void-darkest)] p-6">
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SkeletonLine className="h-6 w-32" />
        <SkeletonLine className="h-4 w-24" />
      </div>

      {/* Equipped Badges */}
      <PixelFrame variant="gold" padding="md">
        <SkeletonLine className="h-4 w-32 mb-4" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center space-y-2">
              <SkeletonAvatar size="lg" />
              <SkeletonLine className="h-3 w-16" />
            </div>
          ))}
        </div>
      </PixelFrame>

      {/* All Badges */}
      <PixelFrame variant="stone" padding="md">
        <SkeletonLine className="h-4 w-32 mb-4" />
        <div className="grid grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div key={i} className="flex flex-col items-center space-y-2">
              <SkeletonAvatar size="md" />
              <SkeletonLine className="h-2 w-12" />
            </div>
          ))}
        </div>
      </PixelFrame>
    </div>
  </div>
);

// Leaderboard page skeleton
export const LeaderboardSkeleton: React.FC = () => (
  <div className="min-h-screen bg-[var(--void-darkest)] p-6">
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SkeletonLine className="h-6 w-40" />
        <div className="flex gap-2">
          <SkeletonLine className="h-8 w-32 rounded" />
          <SkeletonLine className="h-8 w-24 rounded" />
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="flex justify-center items-end gap-4 py-8">
        {[2, 1, 3].map((rank) => (
          <div key={rank} className="flex flex-col items-center space-y-2">
            <SkeletonAvatar size={rank === 1 ? 'lg' : 'md'} />
            <SkeletonLine className="h-3 w-16" />
            <SkeletonLine className="h-4 w-12" />
          </div>
        ))}
      </div>

      {/* Leaderboard Table */}
      <PixelFrame variant="stone" padding="md">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="flex items-center gap-4 p-2">
              <SkeletonLine className="h-4 w-8" />
              <SkeletonAvatar size="sm" />
              <SkeletonLine className="h-4 w-32 flex-1" />
              <SkeletonLine className="h-4 w-16" />
              <SkeletonLine className="h-4 w-12" />
            </div>
          ))}
        </div>
      </PixelFrame>
    </div>
  </div>
);

// Generic page loading skeleton
export const PageSkeleton: React.FC<{ title?: string }> = ({ title }) => (
  <div className="min-h-screen bg-[var(--void-darkest)] p-6">
    <div className="max-w-4xl mx-auto space-y-6">
      {title ? (
        <h1 className="font-pixel text-[14px] text-[var(--gold-light)]">{title}</h1>
      ) : (
        <SkeletonLine className="h-6 w-40" />
      )}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  </div>
);
