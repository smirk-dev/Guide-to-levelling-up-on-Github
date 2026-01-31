'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  PageLayout,
  QuestLog,
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

interface QuestsData {
  quests: Quest[];
  userQuests: UserQuest[];
}

export default function QuestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
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
        className="mb-8 md:mb-12"
      >
        <PixelFrame variant="mana" padding="lg">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
            <div className="text-center min-w-[80px]">
              <p className="font-pixel-heading text-[20px] md:text-[24px] text-white mb-2">
                {totalQuests}
              </p>
              <p className="font-pixel text-[7px] md:text-[8px] text-[var(--gray-medium)]">
                TOTAL QUESTS
              </p>
            </div>
            <div className="text-center min-w-[80px]">
              <p className="font-pixel-heading text-[20px] md:text-[24px] text-[var(--mana-light)] mb-2">
                {activeQuests}
              </p>
              <p className="font-pixel text-[7px] md:text-[8px] text-[var(--gray-medium)]">
                IN PROGRESS
              </p>
            </div>
            <div className="text-center min-w-[80px]">
              <p className="font-pixel-heading text-[20px] md:text-[24px] text-[var(--health-light)] mb-2">
                {completedQuests}
              </p>
              <p className="font-pixel text-[7px] md:text-[8px] text-[var(--gray-medium)]">
                COMPLETED
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

      {/* Quest Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <QuestLog
          quests={data.quests}
          userQuests={data.userQuests}
          onClaimQuest={(questId) => claimMutation.mutate(questId)}
          loadingQuestId={loadingQuestId}
        />
      </motion.div>

      {/* Sync hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <p className="font-pixel text-[8px] md:text-[9px] text-[var(--gray-medium)]">
          💡 Sync your GitHub data to update quest progress
        </p>
      </motion.div>
    </PageLayout>
  );
}
