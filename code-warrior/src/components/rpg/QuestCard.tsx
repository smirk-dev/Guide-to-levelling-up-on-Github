'use client';

import { motion } from 'framer-motion';
import { Scroll, CheckCircle2, Circle, Sparkles } from 'lucide-react';
import type { Quest, UserQuest } from '@/types/database';
import { get3DButtonStyle } from '@/lib/pixel-utils';

interface QuestCardProps {
  quest: Quest;
  userQuest?: UserQuest;
  onClaim?: () => void;
  isActive?: boolean;
}

export default function QuestCard({ quest, userQuest, onClaim, isActive }: QuestCardProps) {
  const isCompleted = userQuest?.status === 'completed';
  const isInProgress = userQuest?.status === 'in_progress';
  const canClaim = isCompleted && !userQuest?.claimed_at;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative p-6 rounded-pixel-sm border-3 pixel-perfect
        ${isActive ? 'border-loot-gold-2 bg-midnight-void-2' : 'border-mana-blue-1 bg-midnight-void-1'}
        ${isCompleted ? 'opacity-75' : ''}
      `}
    >
      {/* Pixel corner decorations */}
      <div className="absolute top-1 left-1 w-2 h-2 bg-loot-gold-2" />
      <div className="absolute top-1 right-1 w-2 h-2 bg-loot-gold-2" />
      <div className="absolute bottom-1 left-1 w-2 h-2 bg-loot-gold-2" />
      <div className="absolute bottom-1 right-1 w-2 h-2 bg-loot-gold-2" />

      <div className="flex items-start gap-4">
        {/* Quest Icon */}
        <div className={`
          p-3 rounded-lg 
          ${isCompleted ? 'bg-health-green/20' : 'bg-mana-blue/20'}
        `}>
          {isCompleted ? (
            <CheckCircle2 className="w-6 h-6 text-health-green" />
          ) : (
            <Scroll className="w-6 h-6 text-mana-blue" />
          )}
        </div>

        {/* Quest Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-loot-gold">
              {quest.title}
            </h3>
            {isActive && (
              <span className="px-2 py-1 text-xs font-bold bg-loot-gold text-midnight-void rounded">
                ACTIVE
              </span>
            )}
          </div>

          <p className="text-sm text-gray-300 mb-4">
            {quest.description}
          </p>

          {/* Victory Conditions */}
          <div className="space-y-2 mb-4">
            <p className="text-xs font-bold text-mana-blue uppercase tracking-wider">
              Victory Conditions:
            </p>
            <div className="text-sm text-gray-400 font-mono">
              {quest.criteria_type === 'REPO_COUNT' && `• Create ${quest.criteria_threshold} repository/repositories`}
              {quest.criteria_type === 'PR_MERGED' && `• Merge ${quest.criteria_threshold} pull request(s)`}
              {quest.criteria_type === 'COMMIT_COUNT' && `• Make ${quest.criteria_threshold} commit(s)`}
              {quest.criteria_type === 'STAR_COUNT' && `• Receive ${quest.criteria_threshold} star(s)`}
              {quest.criteria_type === 'ISSUE_COUNT' && `• Create ${quest.criteria_threshold} issue(s)`}
              {quest.criteria_type === 'REVIEW_COUNT' && `• Review ${quest.criteria_threshold} pull request(s)`}
            </div>
          </div>

          {/* Rewards */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-loot-gold" />
              <span className="text-sm font-bold text-loot-gold">
                +{quest.xp_reward} XP
              </span>
            </div>
            {quest.badge_reward && (
              <div className="text-sm text-mana-blue">
                + Badge Reward
              </div>
            )}
          </div>

          {/* Progress */}
          {isInProgress && userQuest && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progress</span>
                <span>{userQuest.progress || 0} / {quest.criteria_threshold}</span>
              </div>
              <div className="h-2 bg-midnight-void rounded-full overflow-hidden border border-mana-blue/30">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((userQuest.progress || 0) / quest.criteria_threshold) * 100}%` }}
                  className="h-full bg-gradient-to-r from-mana-blue to-loot-gold"
                />
              </div>
            </div>
          )}

          {/* Claim Button */}
          {canClaim && onClaim && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClaim}
              className="
                w-full px-6 py-3 rounded-lg font-bold
                bg-gradient-to-r from-loot-gold to-yellow-600
                text-midnight-void
                hover:shadow-[0_0_20px_rgba(255,215,0,0.5)]
                transition-shadow
              "
            >
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                CLAIM REWARD
              </span>
            </motion.button>
          )}

          {/* Completion Status */}
          {isCompleted && userQuest?.claimed_at && (
            <div className="flex items-center gap-2 text-health-green text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Claimed on {new Date(userQuest.claimed_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
