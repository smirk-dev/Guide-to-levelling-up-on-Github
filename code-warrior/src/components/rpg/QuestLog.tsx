'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelScroll } from '@/components/icons/PixelIcon';
import QuestCard from './QuestCard';
import type { Quest, UserQuest } from '@/types/database';

interface QuestLogProps {
  quests: Quest[];
  userQuests: UserQuest[];
  onClaimQuest: (questId: string) => void;
}

export default function QuestLog({ quests, userQuests, onClaimQuest }: QuestLogProps) {
  const [expandedQuests, setExpandedQuests] = useState<Set<string>>(new Set());

  const toggleQuest = (questId: string) => {
    const newExpanded = new Set(expandedQuests);
    if (newExpanded.has(questId)) {
      newExpanded.delete(questId);
    } else {
      newExpanded.add(questId);
    }
    setExpandedQuests(newExpanded);
  };

  // Group quests by status
  const activeQuests = quests.filter(quest => {
    const userQuest = userQuests.find(uq => uq.quest_id === quest.id);
    return !userQuest || userQuest.status === 'in_progress';
  });

  const completedQuests = quests.filter(quest => {
    const userQuest = userQuests.find(uq => uq.quest_id === quest.id);
    return userQuest?.status === 'completed';
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 mb-4"
        >
          <PixelScroll className="text-loot-gold" size="md" />
          <h1 className="text-4xl font-pixel text-loot-gold">
            QUEST LOG
          </h1>
          <PixelScroll className="text-loot-gold" size="md" />
        </motion.div>
        <p className="text-gray-400 font-mono">
          Complete quests to gain XP and unlock badges
        </p>
      </div>

      {/* Active Quests */}
      {activeQuests.length > 0 && (
        <div>
          <h2 className="text-2xl font-pixel text-mana-blue mb-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-mana-blue rounded-full animate-pulse" />
            ACTIVE QUESTS
          </h2>
          <div className="space-y-4">
            {activeQuests.map(quest => {
              const userQuest = userQuests.find(uq => uq.quest_id === quest.id);
              const isExpanded = expandedQuests.has(quest.id);

              return (
                <div key={quest.id}>
                  <motion.button
                    onClick={() => toggleQuest(quest.id)}
                    className="w-full text-left p-4 rounded-lg border-2 border-mana-blue/30 bg-midnight-void/50 hover:bg-midnight-void/70 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Scroll className="w-5 h-5 text-mana-blue" />
                        <span className="font-bold text-lg">{quest.title}</span>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </motion.div>
                    </div>
                  </motion.button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4">
                          <QuestCard
                            quest={quest}
                            userQuest={userQuest}
                            onClaim={() => onClaimQuest(quest.id)}
                            isActive={true}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Quests */}
      {completedQuests.length > 0 && (
        <div>
          <h2 className="text-2xl font-pixel text-health-green mb-4 flex items-center gap-2">
            ✓ COMPLETED QUESTS
          </h2>
          <div className="space-y-4">
            {completedQuests.map(quest => {
              const userQuest = userQuests.find(uq => uq.quest_id === quest.id);
              const isExpanded = expandedQuests.has(quest.id);

              return (
                <div key={quest.id}>
                  <motion.button
                    onClick={() => toggleQuest(quest.id)}
                    className="w-full text-left p-4 rounded-lg border-2 border-health-green/30 bg-midnight-void/50 hover:bg-midnight-void/70 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Scroll className="w-5 h-5 text-health-green" />
                        <span className="font-bold text-lg line-through opacity-75">{quest.title}</span>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </motion.div>
                    </div>
                  </motion.button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4">
                          <QuestCard
                            quest={quest}
                            userQuest={userQuest}
                            onClaim={() => onClaimQuest(quest.id)}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {activeQuests.length === 0 && completedQuests.length === 0 && (
        <div className="text-center py-12">
          <Scroll className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 font-mono">No quests available yet...</p>
        </div>
      )}
    </div>
  );
}
