'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { User } from '@/types/database';
import { PixelShield } from '@/components/icons/PixelIcon';

interface AvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-32 h-32',
  lg: 'w-48 h-48',
};

export default function Avatar({ user, size = 'lg' }: AvatarProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar container with pixel glow */}
      <motion.div
        className="relative"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        style={{
          boxShadow: '0 0 0 4px var(--loot-gold-2), 0 0 0 6px var(--loot-gold-1), 0 0 0 8px var(--loot-gold-0)'
        }}
      >
        {/* Avatar image */}
        <div className={`relative ${sizeClasses[size]} border-4 border-loot-gold-2 overflow-hidden bg-midnight-void-1 pixel-perfect`}
          style={{
            clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
          }}
        >
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.username}
              fill
              className="object-cover pixel-perfect"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-midnight-void-2">
              <PixelShield className="text-loot-gold-2" size="lg" />
            </div>
          )}
        </div>

        {/* Rank tier badge */}
        <motion.div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-loot-gold-2 text-midnight-void-0 px-4 py-1 rounded-pixel border-2 border-loot-gold-1 font-pixel text-xs shadow-pixel-md"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          RANK {user.rank_tier}
        </motion.div>
      </motion.div>

      {/* Username */}
      <div className="text-center">
        <h2 className="font-pixel text-lg text-loot-gold-2 mb-1 no-smooth">
          {user.username}
        </h2>
        <p className="font-mono text-sm text-gray-400">
          Level {Math.floor(user.xp / 100)} Code Warrior
        </p>
      </div>
    </div>
  );
}
