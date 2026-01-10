'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Trophy, Crown, Medal } from 'lucide-react';
import type { RankTier } from '@/types/database';
import { getRankDisplayName } from '@/lib/game-logic';

interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar_url: string;
  xp: number;
  rank_tier: RankTier;
}

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}

export default function LeaderboardCard({ entry, isCurrentUser }: LeaderboardCardProps) {
  const { rank, username, avatar_url, xp, rank_tier } = entry;

  // Top 3 special styling
  const isTop3 = rank <= 3;
  const isGold = rank === 1;
  const isSilver = rank === 2;
  const isBronze = rank === 3;

  // Color classes for top 3
  const glowColor = isGold
    ? 'shadow-[0_0_30px_rgba(255,215,0,0.6)]'
    : isSilver
    ? 'shadow-[0_0_30px_rgba(192,192,192,0.6)]'
    : isBronze
    ? 'shadow-[0_0_30px_rgba(205,127,50,0.6)]'
    : '';

  const borderColor = isGold
    ? 'border-loot-gold'
    : isSilver
    ? 'border-gray-300'
    : isBronze
    ? 'border-orange-600'
    : 'border-gray-700';

  const bgGradient = isGold
    ? 'bg-gradient-to-r from-loot-gold/20 to-loot-gold/5'
    : isSilver
    ? 'bg-gradient-to-r from-gray-300/20 to-gray-300/5'
    : isBronze
    ? 'bg-gradient-to-r from-orange-600/20 to-orange-600/5'
    : 'bg-gray-900/50';

  // Rank icon
  const RankIcon = isGold ? Crown : isSilver ? Medal : isBronze ? Trophy : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      className={`
        relative p-4 rounded-lg border-2 backdrop-blur-sm
        ${borderColor} ${bgGradient} ${glowColor}
        ${isCurrentUser ? 'ring-2 ring-mana-blue' : ''}
        transition-all duration-300 hover:scale-[1.02]
      `}
    >
      {/* Rank Number with special badge for top 3 */}
      <div className="absolute -left-3 -top-3 flex items-center justify-center">
        {isTop3 ? (
          <div className={`
            relative w-12 h-12 rounded-full flex items-center justify-center
            ${isGold ? 'bg-loot-gold' : isSilver ? 'bg-gray-300' : 'bg-orange-600'}
            shadow-lg
          `}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-full" />
            <span className="font-pixel text-xs text-midnight-void relative z-10">
              {rank}
            </span>
            {RankIcon && (
              <div className="absolute -top-1 -right-1">
                <RankIcon className="w-4 h-4 text-midnight-void" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center">
            <span className="font-pixel text-xs text-gray-400">
              {rank}
            </span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex items-center gap-4 ml-6">
        {/* Avatar */}
        <div className={`
          relative w-16 h-16 rounded-full overflow-hidden
          ${isTop3 ? 'ring-2' : 'ring-1'}
          ${isGold ? 'ring-loot-gold' : isSilver ? 'ring-gray-300' : isBronze ? 'ring-orange-600' : 'ring-gray-700'}
        `}>
          <Image
            src={avatar_url}
            alt={username}
            fill
            className="object-cover"
          />
          {isTop3 && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`
              font-bold truncate
              ${isTop3 ? 'text-lg' : 'text-base'}
              ${isGold ? 'text-loot-gold' : isSilver ? 'text-gray-300' : isBronze ? 'text-orange-600' : 'text-white'}
            `}>
              {username}
            </h3>
            {isCurrentUser && (
              <span className="px-2 py-0.5 text-xs bg-mana-blue/20 text-mana-blue rounded-full border border-mana-blue/50">
                YOU
              </span>
            )}
          </div>

          {/* Rank Tier Badge */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="px-2 py-0.5 bg-gray-800 rounded border border-gray-700 font-pixel text-xs">
              {rank_tier}
            </span>
            <span>{getRankDisplayName(rank_tier)}</span>
          </div>
        </div>

        {/* XP Display */}
        <div className="text-right">
          <div className={`
            font-pixel text-lg
            ${isGold ? 'text-loot-gold' : isSilver ? 'text-gray-300' : isBronze ? 'text-orange-600' : 'text-white'}
          `}>
            {xp.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">XP</div>
        </div>
      </div>

      {/* Animated pulse for top 3 */}
      {isTop3 && (
        <motion.div
          className={`
            absolute inset-0 rounded-lg -z-10
            ${isGold ? 'bg-loot-gold/10' : isSilver ? 'bg-gray-300/10' : 'bg-orange-600/10'}
          `}
          animate={{
            opacity: [0, 0.5, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  );
}
