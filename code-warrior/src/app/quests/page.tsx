'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PageLayout,
  QuestLog,
  QuestMap,
  PixelFrame,
  PixelBadge,
  LoadingScreen,
  Toast,
  QuestCompleteModal,
  FloatingXP,
  IconScroll,
} from '@/components';
import { soundManager } from '@/lib/sound';
import type { Quest, UserQuest } from '@/types/database';
import type { ApiError } from '@/types/api';

// Import quest map styles
import '@/styles/quest-map.css';

// Tab types for quest navigation
type QuestTab = 'map' | 'all' | 'active' | 'completed';

interface QuestsData {
  quests: Quest[];
  userQuests: UserQuest[];
}

// Tab Navigation Component
interface TabButtonProps {
  tab: QuestTab;
  activeTab: QuestTab;
  label: string;
  count?: number;
  icon: React.ReactNode;
  onClick: (tab: QuestTab) => void;
}

const TabButton: React.FC<TabButtonProps> = ({ tab, activeTab, label, count, icon, onClick }) => {
  const isActive = tab === activeTab;
  
  return (
    <button
      onClick={() => {
        soundManager.click();
        onClick(tab);
      }}
      onMouseEnter={() => soundManager.hover()}
      className={`
        flex items-center gap-2 px-4 py-3 rounded-t-lg
        font-pixel text-[10px] md:text-[11px]
        transition-all duration-200
        border-2 border-b-0
        ${isActive 
          ? 'bg-[var(--void-dark)] border-[var(--gold-light)] text-[var(--gold-light)]' 
          : 'bg-[var(--void-darkest)] border-[var(--gray-dark)] text-[var(--gray-medium)] hover:text-[var(--gray-highlight)] hover:border-[var(--gray-medium)]'
        }
      `}
      aria-selected={isActive}
      role="tab"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {count !== undefined && count > 0 && (
        <span className={`
          px-1.5 py-0.5 rounded text-[8px]
          ${isActive ? 'bg-[var(--gold-dark)] text-[var(--gold-light)]' : 'bg-[var(--gray-dark)] text-[var(--gray-medium)]'}
        `}>
          {count}
        </span>
      )}
    </button>
  );
};

// Region Card Component
interface RegionCardProps {
  icon: string;
  name: string;
  description: string;
  color: string;
}

const RegionCard: React.FC<RegionCardProps> = ({ icon, name, description, color }) => (
  <div className={`
    p-3 rounded-lg
    bg-gradient-to-br ${color}
    bg-opacity-20
    border border-[var(--gray-dark)]
  `}>
    <div className="flex items-center gap-2 mb-1">
      <span className="text-lg">{icon}</span>
      <span className="font-pixel text-[9px] text-white">{name}</span>
    </div>
    <p className="font-pixel text-[7px] text-[var(--gray-highlight)]">
      {description}
    </p>
  </div>
);

export default function QuestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<QuestTab>('map');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning'; visible: boolean }>({ message: '', type: 'info', visible: false });
  const [floatingXP, setFloatingXP] = useState<{ amount: number; key: number } | null>(null);
  const [claimedQuest, setClaimedQuest] = useState<{ title: string; xp: number } | null>(null);
  const [loadingQuestId, setLoadingQuestId] = useState<string | null>(null);

  // Helper function to handle API errors including session timeout
  const handleApiError = useCallback((error: ApiError, defaultMessage: string) => {
    if (error.status === 401 || error.message?.includes('Unauthorized')) {
      // Session expired
      signOut({ callbackUrl: '/?session=expired' });
      setToast({
        message: 'Your session has expired. Please sign in again.',
        type: 'warning',
        visible: true,
      });
    } else {
      soundManager.error();
      setToast({
        message: defaultMessage,
        type: 'error',
        visible: true,
      });
    }
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Fetch quests data
  const { data, isLoading, refetch } = useQuery<QuestsData>({
    queryKey: ['quests'],
    queryFn: async () => {
      const res = await fetch('/api/quests');
      if (!res.ok) throw new Error('Failed to fetch quests');
      return res.json();
    },
    enabled: status === 'authenticated',
  });

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/sync', { method: 'POST' });
      if (!res.ok) {
        const error: ApiError = new Error('Sync failed');
        error.status = res.status;
        throw error;
      }
      return res.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      soundManager.xpGain();

      if (result.xpGained > 0) {
        setFloatingXP({ amount: result.xpGained, key: Date.now() });
      }

      setToast({
        message: 'Quest progress updated!',
        type: 'success',
        visible: true,
      });
    },
    onError: (error: Error) => {
      handleApiError(error as ApiError, 'Failed to sync progress');
    },
  });

  // Claim quest mutation
  const claimMutation = useMutation({
    mutationFn: async (questId: string) => {
      setLoadingQuestId(questId);
      const res = await fetch('/api/quests/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId }),
      });
      if (!res.ok) {
        const error: ApiError = new Error('Claim failed');
        error.status = res.status;
        throw error;
      }
      return res.json();
    },
    onSuccess: (result, questId) => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      soundManager.questComplete();

      const quest = data?.quests.find((q) => q.id === questId);
      if (quest) {
        setClaimedQuest({ title: quest.title, xp: quest.xp_reward });
        setFloatingXP({ amount: quest.xp_reward, key: Date.now() });
      }

      setLoadingQuestId(null);
    },
    onError: (error: Error) => {
      setLoadingQuestId(null);
      handleApiError(error as ApiError, 'Failed to claim quest reward');
    },
  });

  if (status === 'loading' || isLoading) {
    return <LoadingScreen message="LOADING QUESTS" />;
  }

  if (!session || !data) {
    return <LoadingScreen message="LOADING QUEST DATA" />;
  }

  // Calculate quest statistics
  const totalQuests = data.quests.length;
  const completedQuests = data.userQuests.filter((uq) => uq.status === 'COMPLETED').length;
  const activeQuests = data.userQuests.filter((uq) => uq.status === 'ACTIVE').length;
  const claimableQuests = data.userQuests.filter(
    (uq) => uq.status === 'COMPLETED' && !uq.claimed_at
  ).length;
  const claimedQuestsCount = data.userQuests.filter((uq) => uq.claimed_at).length;

  // Filter quests based on active tab
  const getFilteredQuests = () => {
    switch (activeTab) {
      case 'active':
        return data.quests.filter((q) => {
          const uq = data.userQuests.find((u) => u.quest_id === q.id);
          return uq?.status === 'ACTIVE';
        });
      case 'completed':
        return data.quests.filter((q) => {
          const uq = data.userQuests.find((u) => u.quest_id === q.id);
          return uq?.status === 'COMPLETED';
        });
      default:
        return data.quests;
    }
  };

  const filteredQuests = getFilteredQuests();

  return (
    <PageLayout
      title="QUESTS"
      subtitle="Complete challenges to earn XP and rewards"
      onSync={() => syncMutation.mutate()}
      syncing={syncMutation.isPending}
    >
      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {/* Floating XP */}
      {floatingXP && (
        <FloatingXP
          key={floatingXP.key}
          amount={floatingXP.amount}
          x={50}
          y={30}
          onComplete={() => setFloatingXP(null)}
        />
      )}

      {/* Quest Complete Modal */}
      <QuestCompleteModal
        isOpen={!!claimedQuest}
        questTitle={claimedQuest?.title || ''}
        xpReward={claimedQuest?.xp || 0}
        onClose={() => setClaimedQuest(null)}
      />

      {/* Quest Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 md:mb-8"
      >
        <PixelFrame variant="mana" padding="lg">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 lg:gap-14">
            <div className="text-center min-w-[70px]">
              <p className="font-pixel-heading text-[18px] md:text-[22px] text-white mb-1">
                {totalQuests}
              </p>
              <p className="font-pixel text-[7px] md:text-[8px] text-[var(--gray-medium)]">
                TOTAL QUESTS
              </p>
            </div>
            <div className="text-center min-w-[70px]">
              <p className="font-pixel-heading text-[18px] md:text-[22px] text-[var(--mana-light)] mb-1">
                {activeQuests}
              </p>
              <p className="font-pixel text-[7px] md:text-[8px] text-[var(--gray-medium)]">
                IN PROGRESS
              </p>
            </div>
            <div className="text-center min-w-[70px]">
              <p className="font-pixel-heading text-[18px] md:text-[22px] text-[var(--health-light)] mb-1">
                {claimedQuestsCount}
              </p>
              <p className="font-pixel text-[7px] md:text-[8px] text-[var(--gray-medium)]">
                CLAIMED
              </p>
            </div>
            <div className="text-center min-w-[70px]">
              <p className="font-pixel-heading text-[18px] md:text-[22px] text-[var(--gold-light)] mb-1">
                {Math.round((claimedQuestsCount / totalQuests) * 100) || 0}%
              </p>
              <p className="font-pixel text-[7px] md:text-[8px] text-[var(--gray-medium)]">
                PROGRESS
              </p>
            </div>
            {claimableQuests > 0 && (
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <PixelBadge variant="gold" size="md">
                    {claimableQuests} READY TO CLAIM!
                  </PixelBadge>
                </motion.div>
              </div>
            )}
          </div>
        </PixelFrame>
      </motion.div>

      {/* Tab Navigation */}
      <div className="mb-6" role="tablist" aria-label="Quest navigation">
        <div className="flex flex-wrap gap-1 border-b-2 border-[var(--gray-dark)]">
          <TabButton
            tab="map"
            activeTab={activeTab}
            label="QUEST MAP"
            icon={<span className="text-sm">🗺️</span>}
            onClick={setActiveTab}
          />
          <TabButton
            tab="all"
            activeTab={activeTab}
            label="ALL QUESTS"
            count={totalQuests}
            icon={<IconScroll size={14} color={activeTab === 'all' ? '#ffd700' : '#8b949e'} />}
            onClick={setActiveTab}
          />
          <TabButton
            tab="active"
            activeTab={activeTab}
            label="ACTIVE"
            count={activeQuests}
            icon={<span className="text-sm">⚔️</span>}
            onClick={setActiveTab}
          />
          <TabButton
            tab="completed"
            activeTab={activeTab}
            label="COMPLETED"
            count={completedQuests}
            icon={<span className="text-sm">✅</span>}
            onClick={setActiveTab}
          />
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          role="tabpanel"
        >
          {activeTab === 'map' ? (
            <div className="mb-8">
              {/* Quest Map */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-4">
                  <h3 className="font-pixel text-[11px] text-[var(--gold-light)] mb-2 flex items-center gap-2">
                    <span>🗺️</span> QUEST MAP - Your Journey to Code Mastery
                  </h3>
                  <p className="font-pixel text-[8px] text-[var(--gray-medium)]">
                    Navigate through different regions by completing quests. Click on checkpoints to view quest details.
                  </p>
                </div>
                
                <QuestMap
                  quests={data.quests}
                  userQuests={data.userQuests}
                  onQuestSelect={() => {}}
                  onClaimQuest={(questId) => claimMutation.mutate(questId)}
                />
              </motion.div>

              {/* Region Guide */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8"
              >
                <PixelFrame variant="stone" padding="md">
                  <h4 className="font-pixel text-[10px] text-[var(--gold-light)] mb-4 flex items-center gap-2">
                    <span>📜</span> REGION GUIDE
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <RegionCard
                      icon="🏠"
                      name="Starting Village"
                      description="Begin your journey with basic quests"
                      color="from-green-600 to-emerald-500"
                    />
                    <RegionCard
                      icon="🌲"
                      name="Forest of Commits"
                      description="Build consistency with commit challenges"
                      color="from-green-700 to-green-500"
                    />
                    <RegionCard
                      icon="⛰️"
                      name="Collaboration Peaks"
                      description="Master PRs and code reviews"
                      color="from-purple-600 to-violet-500"
                    />
                    <RegionCard
                      icon="⭐"
                      name="Star Valley"
                      description="Earn recognition for your work"
                      color="from-amber-600 to-yellow-500"
                    />
                    <RegionCard
                      icon="👑"
                      name="Legendary Summit"
                      description="Elite challenges for true warriors"
                      color="from-pink-600 to-rose-500"
                    />
                  </div>
                </PixelFrame>
              </motion.div>
            </div>
          ) : (
            /* Quest Log for other tabs */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <QuestLog
                quests={filteredQuests}
                userQuests={data.userQuests}
                onClaimQuest={(questId) => claimMutation.mutate(questId)}
                loadingQuestId={loadingQuestId}
              />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Sync hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="font-pixel text-[8px] md:text-[9px] text-[var(--gray-medium)]">
          💡 Sync your GitHub data to update quest progress and unlock new checkpoints
        </p>
      </motion.div>
    </PageLayout>
  );
}
