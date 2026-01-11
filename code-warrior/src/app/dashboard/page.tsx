'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  PageLayout,
  CharacterSheet,
  QuestCard,
  PixelFrame,
  PixelButton,
  PixelBadge,
  LoadingScreen,
  Toast,
  FloatingXP,
  IconSync,
  IconScroll,
  IconCommit,
  IconPullRequest,
  IconIssue,
  IconReview,
  IconStar,
  IconXP,
  StatBar,
} from '@/components';
import { calculateRPGStats } from '@/lib/game-logic';
import { soundManager } from '@/lib/sound';
import type { User, Quest, UserQuest, RankTier } from '@/types/database';

interface DashboardData {
  user: User | null;
  quests: Quest[];
  userQuests: UserQuest[];
}

interface GitHubStats {
  commits: number;
  pullRequests: number;
  issues: number;
  reviews: number;
  stars: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning'; visible: boolean }>({ message: '', type: 'info', visible: false });
  const [floatingXP, setFloatingXP] = useState<{ amount: number; key: number } | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('[Dashboard] Session status:', status, 'Session:', session);
  }, [status, session]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      console.log('[Dashboard] Not authenticated, redirecting to home');
      router.push('/');
    }
  }, [status, router]);

  // Fetch dashboard data - fetch whenever we have a status (unauthenticated will handle redirect)
  const { data, isLoading, refetch, error, isFetching } = useQuery<DashboardData>({
    queryKey: ['dashboard', session?.user?.id],
    queryFn: async () => {
      console.log('[Dashboard] Query function called, status:', status);
      
      // If not authenticated by the time the query runs, throw
      if (status === 'unauthenticated') {
        throw new Error('Not authenticated');
      }
      
      console.log('[Dashboard] Fetching dashboard data');
      const questsRes = await fetch('/api/quests');

      console.log('[Dashboard] Quests response:', questsRes.status, questsRes.statusText);

      if (!questsRes.ok) {
        console.error('Quests fetch error:', questsRes.status, questsRes.statusText);
        const errorBody = await questsRes.text();
        console.error('Error body:', errorBody);
        throw new Error(`Failed to fetch data: ${questsRes.status}`);
      }

      const questsData = await questsRes.json();
      console.log('[Dashboard] Fetched data:', questsData);

      return {
        user: questsData.user || null,
        quests: questsData.quests || [],
        userQuests: questsData.userQuests || [],
      };
    },
    // Only enable after we know the auth status is NOT loading
    enabled: status !== 'loading' && status !== 'unauthenticated',
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/sync', { method: 'POST' });
      if (!res.ok) throw new Error('Sync failed');
      return res.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      soundManager.xpGain();

      if (result.xpGained > 0) {
        setFloatingXP({ amount: result.xpGained, key: Date.now() });
      }

      setToast({
        message: 'Stats synced successfully!',
        type: 'success',
        visible: true,
      });
    },
    onError: () => {
      soundManager.error();
      setToast({
        message: 'Failed to sync stats',
        type: 'error',
        visible: true,
      });
    },
  });

  // Claim quest mutation
  const claimMutation = useMutation({
    mutationFn: async (questId: string) => {
      const res = await fetch('/api/quests/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId }),
      });
      if (!res.ok) throw new Error('Claim failed');
      return res.json();
    },
    onSuccess: (result, questId) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      soundManager.questComplete();

      const quest = data?.quests.find((q) => q.id === questId);
      if (quest) {
        setFloatingXP({ amount: quest.xp_reward, key: Date.now() });
      }

      setToast({
        message: 'Quest reward claimed!',
        type: 'success',
        visible: true,
      });
    },
    onError: () => {
      soundManager.error();
      setToast({
        message: 'Failed to claim quest',
        type: 'error',
        visible: true,
      });
    },
  });

  // Show loading while session is being checked
  if (status === 'loading') {
    return <LoadingScreen message="INITIALIZING" />;
  }

  // Redirect if not authenticated (this will push to home)
  if (status === 'unauthenticated') {
    return <LoadingScreen message="REDIRECTING" />;
  }

  // At this point, status === 'authenticated'
  // Show loading while fetching dashboard data
  if (isLoading && !data) {
    return <LoadingScreen message="LOADING DASHBOARD" />;
  }

  // Show error if data fetch failed after all retries and no cached data
  if (error && !data) {
    console.error('[Dashboard] Query error:', error);
    return (
      <PageLayout title="DASHBOARD">
        <PixelFrame variant="critical" className="max-w-2xl mx-auto mt-20">
          <div className="text-center text-[var(--critical)] font-pixel text-sm">
            <div className="mb-4">ERROR LOADING DASHBOARD</div>
            <div className="text-xs mb-4">
              {error instanceof Error ? error.message : 'Unknown error'}
            </div>
            <PixelButton onClick={() => refetch()}>RETRY</PixelButton>
          </div>
        </PixelFrame>
      </PageLayout>
    );
  }

  // Ensure we have user data before rendering
  if (!data?.user) {
    console.warn('[Dashboard] No user data available', { 
      data 
    });
    return <LoadingScreen message="PREPARING ADVENTURE" />;
  }

  const user = data.user;
  const rpgStats = calculateRPGStats({
    totalStars: 0, // We'd need GitHub stats here
    totalRepos: 0,
    totalCommits: 0,
    totalPRs: 0,
    totalIssues: 0,
    totalReviews: 0,
  });

  // Calculate level from XP
  const level = Math.floor(user.xp / 1000) + 1;

  // Get next rank threshold
  const rankThresholds: Record<RankTier, number> = {
    C: 1000,
    B: 3000,
    A: 6000,
    AA: 10000,
    AAA: 15000,
    S: 25000,
    SS: 50000,
    SSS: Infinity,
  };
  const xpToNextRank = rankThresholds[user.rank_tier];

  // Get active quests (limit to 3 for preview)
  const activeQuests = data.quests
    .map((quest) => ({
      quest,
      userQuest: data.userQuests.find((uq) => uq.quest_id === quest.id) || null,
    }))
    .filter(({ userQuest }) => userQuest?.status === 'ACTIVE' || !userQuest)
    .slice(0, 3);

  // Quick stats
  const completedQuests = data.userQuests.filter((uq) => uq.status === 'COMPLETED').length;
  const claimableQuests = data.userQuests.filter(
    (uq) => uq.status === 'COMPLETED' && !uq.claimed_at
  ).length;

  return (
    <PageLayout
      title="DASHBOARD"
      subtitle={`Welcome back, ${user.username}!`}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 max-w-7xl mx-auto">
        {/* Left Column - Character Sheet */}
        <div className="lg:col-span-1 space-y-4">
          <CharacterSheet
            username={user.username}
            avatarUrl={user.avatar_url}
            xp={user.xp}
            rankTier={user.rank_tier}
            stats={rpgStats}
            level={level}
            xpToNextRank={xpToNextRank}
          />
        </div>

        {/* Right Column - Quick Stats & Active Quests */}
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PixelFrame variant="mana" padding="lg">
              <h3 className="font-pixel text-[12px] text-[var(--mana-light)] mb-4">
                QUICK STATS
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <IconXP size={24} color="#ffd700" className="mx-auto mb-2" />
                  <p className="font-pixel-heading text-[16px] text-[var(--gold-light)]">
                    {user.xp.toLocaleString()}
                  </p>
                  <p className="font-pixel text-[7px] text-[var(--gray-medium)]">
                    TOTAL XP
                  </p>
                </div>
                <div className="text-center">
                  <IconScroll size={24} color="#2ea043" className="mx-auto mb-2" />
                  <p className="font-pixel-heading text-[16px] text-[var(--health-light)]">
                    {completedQuests}
                  </p>
                  <p className="font-pixel text-[7px] text-[var(--gray-medium)]">
                    QUESTS DONE
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-pixel-heading text-[24px] text-white mb-2">
                    {level}
                  </p>
                  <p className="font-pixel text-[7px] text-[var(--gray-medium)]">
                    LEVEL
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-pixel-heading text-[24px] text-[var(--gold-light)] mb-2">
                    {user.rank_tier}
                  </p>
                  <p className="font-pixel text-[7px] text-[var(--gray-medium)]">
                    RANK
                  </p>
                </div>
              </div>
            </PixelFrame>
          </motion.div>

          {/* Claimable Quests Alert */}
          {claimableQuests > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <PixelFrame variant="gold" padding="md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconScroll size={24} color="#ffd700" />
                    <div>
                      <p className="font-pixel text-[10px] text-[var(--gold-light)]">
                        REWARDS AVAILABLE!
                      </p>
                      <p className="font-pixel text-[8px] text-[var(--gray-highlight)]">
                        {claimableQuests} quest{claimableQuests > 1 ? 's' : ''} ready to claim
                      </p>
                    </div>
                  </div>
                  <PixelBadge variant="gold" size="md">
                    {claimableQuests}
                  </PixelBadge>
                </div>
              </PixelFrame>
            </motion.div>
          )}

          {/* Active Quests Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-pixel text-[12px] text-[var(--gold-light)]">
                ACTIVE QUESTS
              </h3>
              <a
                href="/quests"
                className="font-pixel text-[8px] text-[var(--mana-light)] hover:underline"
              >
                VIEW ALL →
              </a>
            </div>

            <div className="grid gap-4">
              {activeQuests.map(({ quest, userQuest }, index) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <QuestCard
                    quest={quest}
                    userQuest={userQuest}
                    onClaim={() => claimMutation.mutate(quest.id)}
                    loading={claimMutation.isPending}
                  />
                </motion.div>
              ))}

              {activeQuests.length === 0 && (
                <PixelFrame variant="stone" padding="md">
                  <p className="font-pixel text-[10px] text-[var(--gray-highlight)] text-center">
                    No active quests. Sync your GitHub to start new adventures!
                  </p>
                </PixelFrame>
              )}
            </div>
          </motion.div>

          {/* Last Sync Info */}
          {user.last_synced_at && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <p className="font-pixel text-[7px] text-[var(--gray-medium)]">
                LAST SYNCED: {new Date(user.last_synced_at).toLocaleString()}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
