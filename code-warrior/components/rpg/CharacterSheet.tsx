'use client';

import { motion } from 'framer-motion';
import { User } from '@/types/database';
import { RPGStats } from '@/types/database';
import Avatar from './Avatar';
import StatBar from './StatBar';
import { Sword, Heart, Sparkles, Star, Brain } from 'lucide-react';
import { getRankDisplayName, getXPForNextRank } from '@/lib/game-logic';

interface CharacterSheetProps {
  user: User;
  stats: RPGStats;
}

export default function CharacterSheet({ user, stats }: CharacterSheetProps) {
  const nextRankXP = getXPForNextRank(user.rank_tier);
  const rankName = getRankDisplayName(user.rank_tier);

  return (
    <div className="min-h-screen bg-midnight-void text-white p-8">
      {/* 3-Column Grid Layout from ux-design.md */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: The Hero */}
        <motion.div
          className="bg-gray-900/50 border-2 border-gray-800 rounded-lg p-6 backdrop-blur-sm"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Avatar user={user} />
          
          {/* Rank Display */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm mb-1">Current Title</p>
            <h3 className="font-pixel text-sm text-mana-blue">
              {rankName}
            </h3>
          </div>

          {/* Equipped Badges Section */}
          <div className="mt-8">
            <h4 className="font-pixel text-xs text-loot-gold mb-4 flex items-center gap-2">
              <Star className="w-4 h-4" />
              EQUIPPED BADGES
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((slot) => (
                <div
                  key={slot}
                  className="aspect-square border-2 border-dashed border-gray-700 rounded flex items-center justify-center text-gray-600 text-xs"
                >
                  SLOT {slot}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CENTER COLUMN: The Stats */}
        <motion.div
          className="bg-gray-900/50 border-2 border-gray-800 rounded-lg p-6 backdrop-blur-sm space-y-6"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div>
            <h3 className="font-pixel text-xl text-loot-gold mb-4">
              CHARACTER STATS
            </h3>

            {/* Health Bar */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-health-green" />
                <span className="font-pixel text-xs text-health-green">HEALTH</span>
              </div>
              <StatBar
                label="Commit Stamina"
                current={stats.health}
                max={100}
                color="health"
              />
            </div>

            {/* Mana Bar */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-mana-blue" />
                <span className="font-pixel text-xs text-mana-blue">MANA</span>
              </div>
              <StatBar
                label="Review Energy"
                current={stats.mana}
                max={100}
                color="mana"
              />
            </div>

            {/* XP Progress */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-loot-gold" />
                <span className="font-pixel text-xs text-loot-gold">EXPERIENCE</span>
              </div>
              <StatBar
                label="Progress to Next Rank"
                current={user.xp}
                max={nextRankXP === Infinity ? user.xp : nextRankXP}
                color="xp"
              />
            </div>

            {/* RPG Attributes */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-gray-800">
              <div className="flex items-center gap-3">
                <Sword className="w-5 h-5 text-critical-red" />
                <div>
                  <p className="text-xs text-gray-400">Strength</p>
                  <p className="font-pixel text-lg text-critical-red">{stats.strength}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-loot-gold" />
                <div>
                  <p className="text-xs text-gray-400">Charisma</p>
                  <p className="font-pixel text-lg text-loot-gold">{stats.charisma}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-mana-blue" />
                <div>
                  <p className="text-xs text-gray-400">Wisdom</p>
                  <p className="font-pixel text-lg text-mana-blue">{stats.wisdom}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-health-green" />
                <div>
                  <p className="text-xs text-gray-400">Total XP</p>
                  <p className="font-pixel text-lg text-health-green">{user.xp}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: The Inventory (Achievements/Loot) */}
        <motion.div
          className="bg-gray-900/50 border-2 border-gray-800 rounded-lg p-6 backdrop-blur-sm"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="font-pixel text-xl text-loot-gold mb-4">
            RECENT LOOT
          </h3>
          
          <div className="space-y-3">
            <div className="bg-gray-800/50 border border-gray-700 rounded p-3">
              <p className="text-xs text-gray-400 mb-1">Achievement Unlocked</p>
              <p className="font-mono text-sm text-loot-gold">Code Warrior Initiated</p>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded p-3">
              <p className="text-xs text-gray-400 mb-1">Last Synced</p>
              <p className="font-mono text-sm text-mana-blue">
                {new Date(user.last_synced_at).toLocaleString()}
              </p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded p-3">
              <p className="text-xs text-gray-400 mb-1">Joined</p>
              <p className="font-mono text-sm text-health-green">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Quest Preview (Placeholder for Epic 3) */}
          <div className="mt-8">
            <h4 className="font-pixel text-xs text-gray-500 mb-3">
              ACTIVE QUESTS
            </h4>
            <div className="border-2 border-dashed border-gray-700 rounded p-4 text-center text-gray-600 text-xs">
              Quest system coming in Epic 3...
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
