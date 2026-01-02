'use client';

import { motion } from 'framer-motion';
import { Scroll, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Quest, UserQuest } from '@/types/database';

interface ActiveQuestPreviewProps {
  quest?: Quest;
  userQuest?: UserQuest;
}

export default function ActiveQuestPreview({ quest, userQuest }: ActiveQuestPreviewProps) {
  if (!quest) {
    return (
      <div className="mb-6">
        <h4 className="font-pixel text-sm text-loot-gold mb-3 flex items-center gap-2">
          <Scroll className="w-4 h-4" />
          MAIN QUEST
        </h4>
        <div className="bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
          <Scroll className="w-12 h-12 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-500 text-sm font-mono mb-4">No active quest</p>
          <Link href="/quests">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-lg border-2 border-mana-blue/30 bg-mana-blue/10 hover:bg-mana-blue/20 transition-colors font-mono text-sm text-mana-blue"
            >
              VIEW ALL QUESTS
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  const progress = userQuest?.progress || 0;
  const isCompleted = userQuest?.status === 'completed';
  const canClaim = isCompleted && !userQuest?.claimed_at;
  const progressPercentage = (progress / quest.criteria_value) * 100;

  return (
    <div className="mb-6">
      <h4 className="font-pixel text-sm text-loot-gold mb-3 flex items-center gap-2">
        <Scroll className="w-4 h-4" />
        MAIN QUEST
      </h4>
      
      <motion.div
        className={`
          border-2 rounded-lg p-4 backdrop-blur-sm
          ${canClaim 
            ? 'border-loot-gold bg-loot-gold/20 animate-pulse' 
            : 'border-mana-blue/30 bg-gray-800/30'
          }
        `}
        whileHover={{ scale: 1.02 }}
      >
        {/* Quest Title */}
        <h5 className="font-bold text-lg text-loot-gold mb-2">
          {quest.title}
        </h5>

        {/* Quest Description */}
        <p className="text-sm text-gray-300 mb-3 line-clamp-2">
          {quest.description}
        </p>

        {/* Progress Bar */}
        {!isCompleted && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>{progress} / {quest.criteria_value}</span>
            </div>
            <div className="h-2 bg-midnight-void rounded-full overflow-hidden border border-mana-blue/30">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                className="h-full bg-gradient-to-r from-mana-blue to-loot-gold"
              />
            </div>
          </div>
        )}

        {/* Reward */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-loot-gold">
            +{quest.xp_reward} XP
          </span>

          <Link href="/quests">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-3 py-1 rounded-lg border border-mana-blue/30 bg-mana-blue/10 hover:bg-mana-blue/20 transition-colors text-xs font-mono"
            >
              {canClaim ? 'CLAIM REWARD' : 'VIEW DETAILS'}
              <ArrowRight className="w-3 h-3" />
            </motion.button>
          </Link>
        </div>

        {isCompleted && userQuest?.claimed_at && (
          <div className="mt-3 pt-3 border-t border-health-green/30 text-xs text-health-green flex items-center gap-2">
            ✓ Claimed on {new Date(userQuest.claimed_at).toLocaleDateString()}
          </div>
        )}
      </motion.div>
    </div>
  );
}
