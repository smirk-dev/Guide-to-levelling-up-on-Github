'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PixelFrame, PixelButton, PixelBadge, PixelProgress } from '../ui/PixelComponents';
import { IconScroll, IconXP, IconCheck, IconClock, IconLock, IconCommit, IconPullRequest, IconIssue, IconReview, IconStar } from '../icons/PixelIcons';
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
            <IconCheck size={10} color="#fff" /> COMPLETED
          </span>
        </PixelBadge>
      );
    case 'ACTIVE':
      return (
        <PixelBadge variant="mana" size="sm">
          <span className="flex items-center gap-1">
            <IconClock size={10} color="#fff" /> ACTIVE
          </span>
        </PixelBadge>
      );
    default:
      return (
        <PixelBadge variant="gray" size="sm">
          <span className="flex items-center gap-1">
            <IconLock size={10} color="#fff" /> AVAILABLE
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
  const progress = userQuest?.progress ?? 0;
  const isCompleted = userQuest?.status === 'COMPLETED';
  const isActive = userQuest?.status === 'ACTIVE';
  const isClaimed = !!userQuest?.claimed_at;
  const progressPercentage = (progress / quest.criteria_threshold) * 100;

  const canClaim = isCompleted && !isClaimed;
  const canStart = !userQuest || (!isActive && !isCompleted);

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
          <div className="flex items-center gap-2">
            {getCriteriaIcon(quest.criteria_type)}
            <h3 className="font-pixel text-[10px] text-white">{quest.title}</h3>
          </div>
          {getStatusBadge(userQuest?.status)}
        </div>

        {/* Description */}
        <p className="font-pixel text-[8px] text-[var(--gray-highlight)] mb-4 leading-relaxed">
          {quest.description}
        </p>

        {/* Progress Bar */}
        {isActive && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="font-pixel text-[6px] text-[var(--gray-light)]">
                PROGRESS
              </span>
              <span className="font-pixel text-[6px] text-[var(--mana-light)]">
                {progress}/{quest.criteria_threshold}
              </span>
            </div>
            <PixelProgress
              value={progress}
              max={quest.criteria_threshold}
              variant="mana"
              size="sm"
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* XP Reward */}
          <div className="flex items-center gap-2">
            <IconXP size={16} color="#ffd700" />
            <span className="font-pixel text-[10px] text-[var(--gold-light)]">
              +{quest.xp_reward} XP
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
              >
                CLAIM
              </PixelButton>
            )}
            {isClaimed && (
              <span className="font-pixel text-[8px] text-[var(--health-light)]">
                ✓ CLAIMED
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
          QUEST LOG
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
            <div className="text-center">
              <IconScroll size={48} color="#484848" className="mx-auto mb-4" />
              <p className="font-pixel text-[10px] text-[var(--gray-highlight)]">
                No quests available at this time.
              </p>
              <p className="font-pixel text-[8px] text-[var(--gray-medium)] mt-2">
                Check back later for new adventures!
              </p>
            </div>
          </PixelFrame>
        )}
      </div>
    </div>
  );
};
