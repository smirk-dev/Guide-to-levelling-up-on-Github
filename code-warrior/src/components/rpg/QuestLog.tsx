'use client';

import { PixelScroll } from '@/components/icons/PixelIcon';
import QuestCard from './QuestCard';
import type { Quest, UserQuest } from '@/types/database';

interface QuestLogProps {
  quests: Quest[];
  userQuests: UserQuest[];
  onClaimQuest: (questId: string) => void;
  loadingQuestId?: string | null;
}

export default function QuestLog({ quests, userQuests, onClaimQuest, loadingQuestId }: QuestLogProps) {

  // Group quests by status
  const activeQuests = quests.filter(quest => {
    const userQuest = userQuests.find(uq => uq.quest_id === quest.id);
    return !userQuest || userQuest.status === 'ACTIVE';
  });

  const completedQuests = quests.filter(quest => {
    const userQuest = userQuests.find(uq => uq.quest_id === quest.id);
    return userQuest?.status === 'COMPLETED';
  });

  return (
    <div className="space-y-10 md:space-y-12">
      {/* Active Quests */}
      {activeQuests.length > 0 && (
        <div>
          <h2 className="text-xl md:text-2xl font-pixel text-[var(--mana-light)] mb-6 flex items-center gap-3">
            <span className="inline-block w-2 h-2 bg-[var(--mana-light)] rounded-full animate-pulse" />
            ACTIVE QUESTS ({activeQuests.length})
          </h2>
          <div className="grid gap-4 md:gap-6">
            {activeQuests.map(quest => {
              const userQuest = userQuests.find(uq => uq.quest_id === quest.id);
              
              return (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  userQuest={userQuest}
                  onClaim={() => onClaimQuest(quest.id)}
                  isActive={true}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Quests */}
      {completedQuests.length > 0 && (
        <div>
          <h2 className="text-xl md:text-2xl font-pixel text-[var(--health-light)] mb-6 flex items-center gap-3">
            ✓ COMPLETED QUESTS ({completedQuests.length})
          </h2>
          <div className="grid gap-4 md:gap-6">
            {completedQuests.map(quest => {
              const userQuest = userQuests.find(uq => uq.quest_id === quest.id);

              return (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  userQuest={userQuest}
                  onClaim={() => onClaimQuest(quest.id)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {activeQuests.length === 0 && completedQuests.length === 0 && (
        <div className="text-center py-16 md:py-20">
          <PixelScroll className="text-[var(--gray-dark)] mx-auto mb-6" size="lg" />
          <p className="font-pixel text-[10px] md:text-[12px] text-[var(--gray-medium)]">No quests available yet...</p>
        </div>
      )}
    </div>
  );
}
