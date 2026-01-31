'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelFrame, PixelBadge, PixelButton } from '../ui/PixelComponents';
import { QuestCard } from '../rpg/QuestCard';
import type { Quest, UserQuest } from '@/types/database';

interface QuestWithStatus {
  quest: Quest;
  userQuest: UserQuest | null;
}

interface QuestsViewTabProps {
  quests: Quest[];
  userQuests: UserQuest[];
  onClaim: (questId: string) => void;
  claimLoading: boolean;
  onSync: () => void;
  syncing: boolean;
}

type QuestFilter = 'all' | 'active' | 'completed' | 'claimable';

export const QuestsViewTab: React.FC<QuestsViewTabProps> = ({
  quests,
  userQuests,
  onClaim,
  claimLoading,
  onSync,
  syncing,
}) => {
  const [filter, setFilter] = useState<QuestFilter>('all');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    active: true,
    claimable: true,
    completed: false,
    notStarted: false,
  });

  // Map quests with their status
  const questsWithStatus: QuestWithStatus[] = quests.map((quest) => ({
    quest,
    userQuest: userQuests.find((uq) => uq.quest_id === quest.id) || null,
  }));

  // Categorize quests
  const activeQuests = questsWithStatus.filter(
    ({ userQuest }) => userQuest?.status === 'ACTIVE'
  );
  const claimableQuests = questsWithStatus.filter(
    ({ userQuest }) => userQuest?.status === 'COMPLETED' && !userQuest?.claimed_at
  );
  const completedQuests = questsWithStatus.filter(
    ({ userQuest }) => userQuest?.status === 'COMPLETED' && userQuest?.claimed_at
  );
  const notStartedQuests = questsWithStatus.filter(
    ({ userQuest }) => !userQuest
  );

  // Calculate stats
  const totalQuests = quests.length;
  const activeCount = activeQuests.length;
  const completedCount = completedQuests.length;
  const claimableCount = claimableQuests.length;

  // Filter quests based on selected filter
  const getFilteredQuests = () => {
    switch (filter) {
      case 'active':
        return { active: activeQuests, claimable: [], completed: [], notStarted: [] };
      case 'completed':
        return { active: [], claimable: [], completed: completedQuests, notStarted: [] };
      case 'claimable':
        return { active: [], claimable: claimableQuests, completed: [], notStarted: [] };
      default:
        return { active: activeQuests, claimable: claimableQuests, completed: completedQuests, notStarted: notStartedQuests };
    }
  };

  const filteredQuests = getFilteredQuests();

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderQuestSection = (
    title: string,
    sectionKey: string,
    questList: QuestWithStatus[],
    icon: string,
    variant: 'active' | 'claimable' | 'completed' | 'locked'
  ) => {
    if (questList.length === 0) return null;

    const isExpanded = expandedSections[sectionKey];
    
    return (
      <div className="quest-section">
        <button
          className="quest-section-header"
          onClick={() => toggleSection(sectionKey)}
          aria-expanded={isExpanded}
        >
          <div className="quest-section-title-row">
            <span className="quest-section-icon">{icon}</span>
            <span className={`quest-section-title quest-section-title-${variant}`}>
              {title}
            </span>
            <PixelBadge 
              variant={variant === 'claimable' ? 'gold' : variant === 'active' ? 'mana' : 'gray'} 
              size="sm"
            >
              {questList.length}
            </PixelBadge>
          </div>
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="quest-section-chevron"
          >
            ▼
          </motion.span>
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="quest-section-content"
            >
              {questList.map(({ quest, userQuest }, index) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <QuestCard
                    quest={quest}
                    userQuest={userQuest}
                    onClaim={() => onClaim(quest.id)}
                    loading={claimLoading}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div 
      role="tabpanel" 
      id="tabpanel-quests" 
      aria-labelledby="tab-quests"
      className="tab-panel quests-view-tab"
    >
      {/* Quest Map Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Link href="/quests" className="block">
          <div className="
            relative overflow-hidden
            bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460]
            border-2 border-[var(--gold-dark)] hover:border-[var(--gold-light)]
            rounded-lg p-4 mb-4
            cursor-pointer transition-all duration-300
            hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]
            group
          ">
            {/* Decorative map pattern background */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-2 left-4 text-2xl">🏠</div>
              <div className="absolute top-4 right-8 text-2xl">🌲</div>
              <div className="absolute bottom-2 left-1/4 text-2xl">⛰️</div>
              <div className="absolute bottom-4 right-4 text-2xl">⭐</div>
              <div className="absolute top-1/2 left-1/2 text-2xl">🏔️</div>
            </div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl group-hover:animate-bounce">🗺️</span>
                <div>
                  <h3 className="font-pixel text-[12px] text-[var(--gold-light)] group-hover:text-white transition-colors">
                    EXPLORE QUEST MAP
                  </h3>
                  <p className="font-pixel text-[8px] text-[var(--gray-medium)]">
                    Journey through 5 unique regions • {totalQuests} quests await
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[9px] text-[var(--gray-highlight)] group-hover:text-[var(--gold-light)] transition-colors">
                  VIEW MAP
                </span>
                <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Quest Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <PixelFrame variant="mana" padding="md">
          <div className="quest-stats-bar">
            <button
              className={`quest-stat-button ${filter === 'all' ? 'quest-stat-button-active' : ''}`}
              onClick={() => setFilter('all')}
            >
              <span className="quest-stat-value">{totalQuests}</span>
              <span className="quest-stat-label">Total</span>
            </button>
            
            <button
              className={`quest-stat-button ${filter === 'active' ? 'quest-stat-button-active' : ''}`}
              onClick={() => setFilter('active')}
            >
              <span className="quest-stat-value quest-stat-active">{activeCount}</span>
              <span className="quest-stat-label">Active</span>
            </button>
            
            <button
              className={`quest-stat-button ${filter === 'completed' ? 'quest-stat-button-active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              <span className="quest-stat-value quest-stat-completed">{completedCount}</span>
              <span className="quest-stat-label">Done</span>
            </button>
            
            <button
              className={`quest-stat-button ${filter === 'claimable' ? 'quest-stat-button-active' : ''}`}
              onClick={() => setFilter('claimable')}
            >
              <span className="quest-stat-value quest-stat-claimable">{claimableCount}</span>
              <span className="quest-stat-label">Claimable</span>
              {claimableCount > 0 && (
                <span className="quest-stat-pulse" />
              )}
            </button>
          </div>
        </PixelFrame>
      </motion.div>

      {/* Quest Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <PixelFrame variant="stone" padding="md">
          <div className="quest-log">
            {/* Claimable Quests - Highest Priority */}
            {renderQuestSection(
              'COMPLETED (Claimable)',
              'claimable',
              filteredQuests.claimable,
              '🟢',
              'claimable'
            )}
            
            {/* Active Quests */}
            {renderQuestSection(
              'ACTIVE QUESTS',
              'active',
              filteredQuests.active,
              '🟡',
              'active'
            )}
            
            {/* Completed & Claimed Quests */}
            {renderQuestSection(
              'COMPLETED',
              'completed',
              filteredQuests.completed,
              '✅',
              'completed'
            )}
            
            {/* Not Started Quests */}
            {renderQuestSection(
              'NOT STARTED',
              'notStarted',
              filteredQuests.notStarted,
              '⚪',
              'locked'
            )}
            
            {/* Empty State */}
            {quests.length === 0 && (
              <div className="quest-empty-state">
                <div className="quest-empty-icon">📜</div>
                <p className="quest-empty-title">No quests available</p>
                <p className="quest-empty-description">
                  Sync your GitHub stats to discover quests!
                </p>
              </div>
            )}
          </div>
        </PixelFrame>
      </motion.div>

      {/* Sync Button at Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="quest-sync-section"
      >
        <PixelButton
          variant="mana"
          size="sm"
          onClick={onSync}
          disabled={syncing}
        >
          {syncing ? '⏳ Syncing...' : '🔄 Sync Progress'}
        </PixelButton>
        <p className="quest-sync-hint">
          Sync to update quest progress from GitHub
        </p>
      </motion.div>
    </div>
  );
};

export default QuestsViewTab;
