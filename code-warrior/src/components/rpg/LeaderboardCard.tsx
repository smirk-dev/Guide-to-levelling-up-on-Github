'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PixelFrame, PixelAvatar, PixelBadge } from '../ui/PixelComponents';
import { IconTrophy, IconXP, IconRank } from '../icons/PixelIcons';
import { getRankDisplayName } from '@/lib/game-logic';
import type { User, RankTier } from '@/types/database';

interface LeaderboardUser extends User {
  position: number;
}

interface LeaderboardCardProps {
  user: LeaderboardUser;
  isCurrentUser?: boolean;
  className?: string;
}

const getPositionStyles = (position: number) => {
  switch (position) {
    case 1:
      return {
        frame: 'gold' as const,
        color: 'var(--gold-light)',
        icon: <IconTrophy size={32} color="#ffd700" />,
        glow: true,
      };
    case 2:
      return {
        frame: 'metal' as const,
        color: '#c0c0c0',
        icon: <IconTrophy size={28} color="#c0c0c0" />,
        glow: false,
      };
    case 3:
      return {
        frame: 'stone' as const,
        color: '#cd7f32',
        icon: <IconTrophy size={24} color="#cd7f32" />,
        glow: false,
      };
    default:
      return {
        frame: 'stone' as const,
        color: 'var(--gray-highlight)',
        icon: null,
        glow: false,
      };
  }
};

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  user,
  isCurrentUser = false,
  className = '',
}) => {
  const { frame, color, icon, glow } = getPositionStyles(user.position);
  const rankName = getRankDisplayName(user.rank_tier);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: user.position * 0.05 }}
      className={className}
    >
      <PixelFrame
        variant={isCurrentUser ? 'mana' : frame}
        padding="sm"
      >
        <div className="flex items-center gap-4">
          {/* Position */}
          <div
            className="w-12 h-12 flex items-center justify-center"
            style={{ color }}
          >
            {icon || (
              <span className="font-pixel-heading text-[var(--font-lg)]">
                #{user.position}
              </span>
            )}
          </div>

          {/* Avatar */}
          <PixelAvatar
            src={user.avatar_url}
            alt={user.username}
            size="md"
            glow={glow}
          />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-pixel text-[var(--font-sm)] text-white truncate">
                {user.username}
              </h3>
              {isCurrentUser && (
                <PixelBadge variant="mana" size="sm">YOU</PixelBadge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <IconRank size={12} color={color} />
              <span
                className="font-pixel text-[var(--font-xs)]"
                style={{ color }}
              >
                {rankName}
              </span>
              <span className="font-pixel text-[10px] text-[var(--gray-highlight)]">
                ({user.rank_tier})
              </span>
            </div>
          </div>

          {/* XP */}
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <IconXP size={14} color="#ffd700" />
              <span className="font-pixel text-[var(--font-sm)] text-[var(--gold-light)]">
                {user.xp.toLocaleString()}
              </span>
            </div>
            <span className="font-pixel text-[10px] text-[var(--gray-highlight)]">
              XP
            </span>
          </div>
        </div>
      </PixelFrame>
    </motion.div>
  );
};

interface LeaderboardTableProps {
  users: User[];
  currentUserId?: string;
  className?: string;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  users,
  currentUserId,
  className = '',
}) => {
  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <IconTrophy size={32} color="#ffd700" />
        <h2 className="font-pixel-heading text-[var(--font-lg)] text-[var(--gold-light)]">
          LEADERBOARD
        </h2>
      </div>

      {/* Top 3 Podium */}
      {users.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-8">
          {/* 2nd Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <PixelAvatar
              src={users[1]?.avatar_url}
              alt={users[1]?.username || ''}
              size="lg"
            />
            <div className="mt-2 bg-[#c0c0c0] h-16 w-20 flex items-center justify-center">
              <span className="font-pixel-heading text-[20px] text-[var(--void-darkest)]">
                2
              </span>
            </div>
            <span className="font-pixel text-[var(--font-xs)] text-[#c0c0c0]">
              {users[1]?.username}
            </span>
          </motion.div>

          {/* 1st Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <div className="relative">
              <IconTrophy size={32} color="#ffd700" className="mx-auto mb-2" />
              <PixelAvatar
                src={users[0]?.avatar_url}
                alt={users[0]?.username || ''}
                size="xl"
                glow
              />
            </div>
            <div className="mt-2 bg-[var(--gold-light)] h-24 w-24 flex items-center justify-center">
              <span className="font-pixel-heading text-[24px] text-[var(--void-darkest)]">
                1
              </span>
            </div>
            <span className="font-pixel text-[var(--font-sm)] text-[var(--gold-light)]">
              {users[0]?.username}
            </span>
          </motion.div>

          {/* 3rd Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <PixelAvatar
              src={users[2]?.avatar_url}
              alt={users[2]?.username || ''}
              size="lg"
            />
            <div className="mt-2 bg-[#cd7f32] h-12 w-20 flex items-center justify-center">
              <span className="font-pixel-heading text-[18px] text-[var(--void-darkest)]">
                3
              </span>
            </div>
            <span className="font-pixel text-[var(--font-xs)] text-[#cd7f32]">
              {users[2]?.username}
            </span>
          </motion.div>
        </div>
      )}

      {/* Full List */}
      <div className="space-y-2">
        {users.map((user, index) => (
          <LeaderboardCard
            key={user.id}
            user={{ ...user, position: index + 1 }}
            isCurrentUser={user.id === currentUserId}
          />
        ))}

        {users.length === 0 && (
          <PixelFrame variant="stone" padding="lg">
            <div className="text-center py-8">
              <motion.div
                animate={{
                  y: [0, -12, 0],
                  rotate: [0, 15, -15, 0],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="mb-4"
              >
                <IconTrophy size={64} color="#484848" className="mx-auto" />
              </motion.div>

              <h3 className="font-pixel text-[var(--font-md)] text-[var(--gray-highlight)] mb-2">
                LEADERBOARD EMPTY
              </h3>
              <p className="font-pixel text-[var(--font-xs)] text-[var(--gray-medium)] mb-4 max-w-xs mx-auto">
                No warriors have claimed their position yet. Be the first legendary code warrior to rise to the top!
              </p>
            </div>
          </PixelFrame>
        )}
      </div>
    </div>
  );
};
