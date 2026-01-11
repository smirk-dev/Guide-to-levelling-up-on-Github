'use client';

import { motion } from 'framer-motion';
import { PixelScroll } from '@/components/icons/PixelIcon';
import Link from 'next/link';
import type { Quest, UserQuest } from '@/types/database';
import { get3DButtonStyle } from '@/lib/pixel-utils';

interface ActiveQuestPreviewProps {
  quest?: Quest;
  userQuest?: UserQuest;
}

export default function ActiveQuestPreview({ quest, userQuest }: ActiveQuestPreviewProps) {
  if (!quest) {
    return (
      <div className="mb-6">
        <h4 className="font-pixel text-sm text-loot-gold-2 mb-3 flex items-center gap-2">
          <Scroll className="w-4 h-4 stroke-[3px]" />
          MAIN QUEST
        </h4>
        <div className="bg-midnight-void-1 border-2 border-dashed border-gray-pixel-0 rounded-pixel-sm p-6 text-center pixel-perfect">
          <Scroll className="w-12 h-12 text-gray-pixel-0 mx-auto mb-2 stroke-[3px]" />
          <p className="text-gray-500 text-sm font-mono mb-4">No active quest</p>
          <Link href="/quests">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ y: 1 }}
              className="px-4 py-2 text-midnight-void-0 font-pixel text-xs border-4 rounded-pixel-sm pixel-perfect no-smooth"
              style={get3DButtonStyle('blue')}
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
      <h4 className="font-pixel text-sm text-loot-gold-2 mb-3 flex items-center gap-2">
        <Scroll className="w-4 h-4 stroke-[3px]" />
        MAIN QUEST
      </h4>

      <motion.div
        className={`
          border-3 rounded-pixel-sm p-4 pixel-perfect
          ${canClaim
            ? 'border-loot-gold-2 bg-midnight-void-2 animate-pulse'
            : 'border-mana-blue-1 bg-midnight-void-1'
          }
        `}
        whileHover={{ scale: 1.02 }}
      >
        {/* Quest Title */}
        <h5 className="font-bold text-lg text-loot-gold-2 mb-2">
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
            <div className="h-3 bg-midnight-void-2 rounded-pixel overflow-hidden border-2 border-mana-blue-1 pixel-perfect">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                className="h-full"
                style={{
                  backgroundImage: 'repeating-linear-gradient(to right, var(--mana-blue-2) 0px, var(--mana-blue-2) 8px, var(--loot-gold-2) 8px, var(--loot-gold-2) 16px)',
                  boxShadow: 'inset 0 -2px 0 var(--mana-blue-0)'
                }}
              />
            </div>
          </div>
        )}

        {/* Reward */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-loot-gold-2">
            +{quest.xp_reward} XP
          </span>

          <Link href="/quests">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ y: 1 }}
              className="flex items-center gap-2 px-3 py-1 text-midnight-void-0 font-pixel text-[10px] border-3 rounded-pixel pixel-perfect no-smooth"
              style={get3DButtonStyle(canClaim ? 'gold' : 'blue')}
            >
              {canClaim ? 'CLAIM REWARD' : 'VIEW DETAILS'}
              <ArrowRight className="w-3 h-3 stroke-[3px]" />
            </motion.button>
          </Link>
        </div>

        {isCompleted && userQuest?.claimed_at && (
          <div className="mt-3 pt-3 border-t-2 border-health-green-1 text-xs text-health-green-1 flex items-center gap-2">
            ✓ Claimed on {new Date(userQuest.claimed_at).toLocaleDateString()}
          </div>
        )}
      </motion.div>
    </div>
  );
}
