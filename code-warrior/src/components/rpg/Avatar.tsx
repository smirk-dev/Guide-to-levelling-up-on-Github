'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { User } from '@/types/database';
import { Shield } from 'lucide-react';

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
      {/* Avatar container with glow effect */}
      <motion.div
        className="relative"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
      >
        {/* Rank badge background glow */}
        <div className="absolute -inset-2 bg-loot-gold/20 rounded-full blur-xl animate-pulse" />
        
        {/* Avatar image */}
        <div className={`relative ${sizeClasses[size]} rounded-full border-4 border-loot-gold overflow-hidden bg-midnight-void`}>
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.username}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-mana-blue to-midnight-void">
              <Shield className="w-12 h-12 text-loot-gold" />
            </div>
          )}
        </div>

        {/* Rank tier badge */}
        <motion.div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-loot-gold text-midnight-void px-4 py-1 rounded-full font-pixel text-xs shadow-lg"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          RANK {user.rank_tier}
        </motion.div>
      </motion.div>

      {/* Username */}
      <div className="text-center">
        <h2 className="font-pixel text-lg text-loot-gold mb-1">
          {user.username}
        </h2>
        <p className="font-mono text-sm text-gray-400">
          Level {Math.floor(user.xp / 100)} Code Warrior
        </p>
      </div>
    </div>
  );
}
