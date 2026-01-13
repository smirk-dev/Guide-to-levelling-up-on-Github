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

// Format last synced date in a human-readable way
function formatLastSynced(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  // For older dates, show formatted date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    hour: 'numeric',
    minute: '2-digit',
  });
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

  // Check if github_stats has actual data (not just empty/null)
  const hasGitHubStats = user.github_stats && (
    (user.github_stats.stars ?? 0) > 0 ||
    (user.github_stats.commits ?? 0) > 0 ||
    (user.github_stats.prs ?? 0) > 0 ||
    (user.github_stats.issues ?? 0) > 0 ||
    (user.github_stats.reviews ?? 0) > 0
  );

  // If no github_stats but user has XP, estimate stats from XP for better UX
  // This ensures users with XP don't see all-zero stats
  let rpgStats;
  if (hasGitHubStats) {
    rpgStats = calculateRPGStats({
      totalStars: user.github_stats?.stars ?? 0,
      totalRepos: user.github_stats?.repos ?? 0,
      totalCommits: user.github_stats?.commits ?? 0,
      totalPRs: user.github_stats?.prs ?? 0,
      totalIssues: user.github_stats?.issues ?? 0,
      totalReviews: user.github_stats?.reviews ?? 0,
    });
  } else if (user.xp > 0) {
    // Estimate stats from XP - not perfect but better than zeros
    // Assume roughly: 40% from commits, 25% from PRs, 20% from stars, 15% from issues/reviews
    const estimatedCommits = Math.floor(user.xp * 0.4 / 10); // XP_WEIGHT.COMMIT = 10
    const estimatedPRs = Math.floor(user.xp * 0.25 / 40);    // XP_WEIGHT.PR = 40
    const estimatedStars = Math.floor(user.xp * 0.2 / 50);   // XP_WEIGHT.STAR = 50
    const estimatedIssues = Math.floor(user.xp * 0.1 / 15);  // XP_WEIGHT.ISSUE = 15
    const estimatedReviews = Math.floor(user.xp * 0.05 / 20); // XP_WEIGHT.REVIEW = 20

    rpgStats = calculateRPGStats({
      totalStars: estimatedStars,
      totalRepos: Math.floor(user.xp / 500), // Rough estimate
      totalCommits: estimatedCommits,
      totalPRs: estimatedPRs,
      totalIssues: estimatedIssues,
      totalReviews: estimatedReviews,
    });
  } else {
    rpgStats = calculateRPGStats({
      totalStars: 0,
      totalRepos: 0,
      totalCommits: 0,
      totalPRs: 0,
      totalIssues: 0,
      totalReviews: 0,
    });
  }

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

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(320px,400px)_1fr] gap-6 lg:gap-8 max-w-7xl mx-auto px-4">
        {/* Left Column - Character Sheet */}
        <div className="w-full">
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
        <div className="w-full space-y-6">
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PixelFrame variant="mana" padding="lg">
              <h3 className="font-pixel text-[var(--font-md)] text-[var(--mana-light)] mb-6">
                QUICK STATS
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex flex-col items-center gap-2">
                  <IconXP size={28} color="#ffd700" />
                  <p className="font-pixel-heading text-[20px] text-[var(--gold-light)] leading-tight">
                    {user.xp.toLocaleString()}
                  </p>
                  <p className="font-pixel text-[10px] text-[var(--gray-medium)] text-center leading-tight">
                    TOTAL XP
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <IconScroll size={28} color="#2ea043" />
                  <p className="font-pixel-heading text-[20px] text-[var(--health-light)] leading-tight">
                    {completedQuests}
                  </p>
                  <p className="font-pixel text-[10px] text-[var(--gray-medium)] text-center leading-tight">
                    QUESTS DONE
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-7 h-7 flex items-center justify-center">
                    <p className="font-pixel-heading text-[20px] text-white">
                      {level}
                    </p>
                  </div>
                  <p className="font-pixel text-[10px] text-[var(--gray-medium)] text-center leading-tight">
                    LEVEL
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-7 h-7 flex items-center justify-center">
                    <p className="font-pixel-heading text-[20px] text-[var(--mana-light)]">
                      {user.github_stats?.repos ?? 0}
                    </p>
                  </div>
                  <p className="font-pixel text-[10px] text-[var(--gray-medium)] text-center leading-tight">
                    REPOS
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
              <PixelFrame variant="gold" padding="lg">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <IconScroll size={28} color="#ffd700" className="flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-pixel text-[12px] text-[var(--gold-light)] mb-1">
                        REWARDS AVAILABLE!
                      </p>
                      <p className="font-pixel text-[10px] text-[var(--gray-highlight)] leading-tight">
                        {claimableQuests} quest{claimableQuests > 1 ? 's' : ''} ready to claim
                      </p>
                    </div>
                  </div>
                  <PixelBadge variant="gold" size="md" className="flex-shrink-0">
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
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-pixel text-[14px] text-[var(--gold-light)]">
                ACTIVE QUESTS
              </h3>
              <a
                href="/quests"
                className="font-pixel text-[10px] text-[var(--mana-light)] hover:text-[var(--mana-highlight)] transition-colors"
              >
                VIEW ALL →
              </a>
            </div>

            <div className="grid gap-5">
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
                <PixelFrame variant="stone" padding="lg">
                  <p className="font-pixel text-[11px] text-[var(--gray-highlight)] text-center leading-relaxed">
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
              className="text-center mt-6"
            >
              <p className="font-pixel text-[10px] text-[var(--gray-medium)] leading-tight">
                LAST SYNCED: {formatLastSynced(user.last_synced_at)}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
