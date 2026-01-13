'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelFrame, PixelButton, PixelBadge, PixelProgress } from '../ui/PixelComponents';
import { IconScroll, IconXP, IconCheck, IconClock, IconLock, IconCommit, IconPullRequest, IconIssue, IconReview, IconStar, IconPlus, IconMinus } from '../icons/PixelIcons';
import { soundManager } from '@/lib/sound';
import type { Quest, UserQuest, QuestStatus } from '@/types/database';

interface QuestCardProps {
  quest: Quest;
  userQuest?: UserQuest | null;
  onClaim?: () => void;
  onStart?: () => void;
  loading?: boolean;
  className?: string;
}

const getCriteriaIcon = (criteriaType: string) => {
  switch (criteriaType) {
    case 'commits':
      return <IconCommit size={20} color="#2ea043" />;
    case 'pull_requests':
      return <IconPullRequest size={20} color="#a371f7" />;
    case 'issues':
      return <IconIssue size={20} color="#2ea043" />;
    case 'reviews':
      return <IconReview size={20} color="#58a6ff" />;
    case 'stars':
      return <IconStar size={20} color="#ffd700" />;
    default:
      return <IconScroll size={20} color="#b8960f" />;
  }
};

const getStatusBadge = (status: QuestStatus | undefined) => {
  switch (status) {
    case 'COMPLETED':
      return (
        <PixelBadge variant="health" size="sm">
          <span className="flex items-center gap-1">
            <IconCheck size={10} color="#fff" /> Completed
          </span>
        </PixelBadge>
      );
    case 'ACTIVE':
      return (
        <PixelBadge variant="mana" size="sm">
          <span className="flex items-center gap-1">
            <IconClock size={10} color="#fff" /> In Progress
          </span>
        </PixelBadge>
      );
    default:
      return (
        <PixelBadge variant="gray" size="sm">
          <span className="flex items-center gap-1">
            <IconScroll size={10} color="#fff" /> Available
          </span>
        </PixelBadge>
      );
  }
};

export const QuestCard: React.FC<QuestCardProps> = ({
  quest,
  userQuest,
  onClaim,
  onStart,
  loading = false,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const progress = userQuest?.progress ?? 0;
  const isCompleted = userQuest?.status === 'COMPLETED';
  const isActive = userQuest?.status === 'ACTIVE';
  const isClaimed = !!userQuest?.claimed_at;
  const progressPercentage = (progress / quest.criteria_threshold) * 100;

  const canClaim = isCompleted && !isClaimed;
  const canStart = !userQuest || (!isActive && !isCompleted);

  const handleToggleExpand = () => {
    soundManager.click();
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <PixelFrame
        variant={isClaimed ? 'health' : isCompleted ? 'gold' : isActive ? 'mana' : 'stone'}
        padding="lg"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 flex-1">
            {getCriteriaIcon(quest.criteria_type)}
            <h3 className="font-pixel text-[var(--font-sm)] text-white">{quest.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(userQuest?.status)}
            <button
              onClick={handleToggleExpand}
              onMouseEnter={() => soundManager.hover()}
              className="p-2 hover:bg-[var(--void-light)] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-light)] min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={isExpanded ? `Collapse ${quest.title} details` : `Expand ${quest.title} details`}
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <IconMinus size={12} color="#8b949e" />
              ) : (
                <IconPlus size={12} color="#8b949e" />
              )}
            </button>
          </div>
        </div>

        {/* Description - Accordion */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <p className="font-pixel text-[var(--font-xs)] text-[var(--gray-highlight)] mb-4 leading-relaxed">
                {quest.description}
              </p>
              <div className="mb-4 p-3 bg-[var(--void-darkest)] border-2 border-[var(--gray-dark)]">
                <p className="font-pixel text-[7px] text-[var(--mana-light)] mb-1">
                  Objective:
                </p>
                <p className="font-pixel text-[var(--font-xs)] text-white">
                  {quest.criteria_type.replace(/_/g, ' ').charAt(0).toUpperCase() + quest.criteria_type.replace(/_/g, ' ').slice(1)}: {quest.criteria_threshold}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Bar */}
        {isActive && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="font-pixel text-[7px] text-[var(--gray-light)]">
                Progress
              </span>
              <span className="font-pixel text-[7px] text-[var(--mana-light)]">
                {progress}/{quest.criteria_threshold}
              </span>
            </div>

            <div className="relative">
              {/* Milestone markers */}
              <div className="absolute top-0 h-full flex justify-between w-full pointer-events-none z-10">
                {[25, 50, 75].map((milestone) => (
                  <div
                    key={milestone}
                    className="relative h-full"
                    style={{ left: `${milestone}%`, transform: 'translateX(-50%)' }}
                  >
                    <div
                      className={`h-full w-[2px] transition-colors duration-300 ${
                        progressPercentage >= milestone
                          ? 'bg-[var(--mana-highlight)]'
                          : 'bg-[var(--gray-dark)]'
                      }`}
                    />
                  </div>
                ))}
              </div>

              <PixelProgress
                value={progress}
                max={quest.criteria_threshold}
                variant="mana"
                size="sm"
                className={progressPercentage >= 90 ? 'animate-pixel-pulse' : ''}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* XP Reward */}
          <div className="flex items-center gap-2">
            <IconXP size={16} color="#ffd700" />
            <span className="font-pixel text-[var(--font-sm)] text-[var(--gold-light)]">
              +{quest.xp_reward}
            </span>
          </div>

          {/* Actions */}
          <div>
            {canClaim && (
              <PixelButton
                variant="gold"
                size="sm"
                onClick={onClaim}
                loading={loading}
                aria-label={`Claim ${quest.xp_reward} XP reward for ${quest.title}`}
              >
                Claim Reward
              </PixelButton>
            )}
            {isClaimed && (
              <span className="font-pixel text-[var(--font-xs)] text-[var(--health-light)]" role="status">
                ✓ Claimed
              </span>
            )}
          </div>
        </div>
      </PixelFrame>
    </motion.div>
  );
};

interface QuestLogProps {
  quests: Quest[];
  userQuests: UserQuest[];
  onClaimQuest: (questId: string) => void;
  loadingQuestId?: string | null;
  className?: string;
}

export const QuestLog: React.FC<QuestLogProps> = ({
  quests,
  userQuests,
  onClaimQuest,
  loadingQuestId,
  className = '',
}) => {
  const getUserQuest = (questId: string) =>
    userQuests.find((uq) => uq.quest_id === questId) || null;

  // Sort quests: active first, then completed unclaimed, then completed claimed, then available
  const sortedQuests = [...quests].sort((a, b) => {
    const uqA = getUserQuest(a.id);
    const uqB = getUserQuest(b.id);

    const getPriority = (uq: UserQuest | null) => {
      if (!uq) return 4; // Available
      if (uq.status === 'ACTIVE') return 1;
      if (uq.status === 'COMPLETED' && !uq.claimed_at) return 2;
      if (uq.status === 'COMPLETED' && uq.claimed_at) return 3;
      return 5;
    };

    return getPriority(uqA) - getPriority(uqB);
  });

  return (
    <div className={className}>
      <div className="flex items-center gap-3 mb-6">
        <IconScroll size={32} color="#b8960f" />
        <h2 className="font-pixel-heading text-[16px] text-[var(--gold-light)]">
          Quest Log
        </h2>
      </div>

      <div className="grid gap-4">
        {sortedQuests.map((quest, index) => (
          <motion.div
            key={quest.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <QuestCard
              quest={quest}
              userQuest={getUserQuest(quest.id)}
              onClaim={() => onClaimQuest(quest.id)}
              loading={loadingQuestId === quest.id}
            />
          </motion.div>
        ))}

        {quests.length === 0 && (
          <PixelFrame variant="stone" padding="lg">
            <div className="text-center py-8">
              <motion.div
                animate={{
                  y: [0, -8, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="mb-4"
              >
                <IconScroll size={64} color="#484848" className="mx-auto" />
              </motion.div>

              <h3 className="font-pixel text-[var(--font-md)] text-[var(--gray-highlight)] mb-2">
                No Quests Available
              </h3>
              <p className="font-pixel text-[var(--font-xs)] text-[var(--gray-medium)] mb-4 max-w-xs mx-auto leading-relaxed">
                The quest board is empty. Check back later for new adventures, or sync your GitHub activity to unlock quests!
              </p>
            </div>
          </PixelFrame>
        )}
      </div>
    </div>
  );
};
