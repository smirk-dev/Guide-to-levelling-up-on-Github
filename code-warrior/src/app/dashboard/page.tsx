'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PixelFrame,
  PixelButton,
  LoadingScreen,
  Toast,
  FloatingXP,
  GameHUD,
  TabNavigation,
  HeroSidebar,
  QuickViewTab,
  ActivityViewTab,
  QuestsViewTab,
  type DashboardTab,
} from '@/components';
import { calculateRPGStats } from '@/lib/game-logic';
import { soundManager } from '@/lib/sound';
import { DashboardSkeleton } from '@/components/ui/LoadingSkeletons';
import type { User, Quest, UserQuest, RankTier, ContributionDay, GitHubAchievementBadge } from '@/types/database';

// Import the new tab styles
import '@/styles/dashboard-tabs.css';

interface DashboardData {
  user: User | null;
  quests: Quest[];
  userQuests: UserQuest[];
}

interface ApiError extends Error {
  status?: number;
}

interface LeaderboardUser {
  id: string;
  username: string;
  xp: number;
  rank_tier: RankTier;
  avatar_url: string; // Required by HeroSidebar component
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Tab state with localStorage persistence - using lazy initialization to avoid setState in useEffect
  const [activeTab, setActiveTab] = useState<DashboardTab>(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('dashboard_tab') as DashboardTab | null;
      if (savedTab && ['quick', 'activity', 'quests'].includes(savedTab)) {
        return savedTab;
      }
    }
    return 'quick';
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning'; visible: boolean }>({ message: '', type: 'info', visible: false });
  const [floatingXP, setFloatingXP] = useState<{ amount: number; key: number } | null>(null);

  // Save tab preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboard_tab', activeTab);
    }
  }, [activeTab]);

  // Helper function to handle API errors including session timeout
  const handleApiError = useCallback((error: ApiError, defaultMessage: string) => {
    if (error.status === 401 || error.message?.includes('Unauthorized')) {
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

  // Redirect if not authenticated - prevent race conditions
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Early return prevents queries from running during redirect
  const shouldFetchData = status === 'authenticated';

  // Fetch dashboard data
  const { data, isLoading, refetch, error } = useQuery<DashboardData>({
    queryKey: ['dashboard', session?.user?.id],
    queryFn: async () => {
      const questsRes = await fetch('/api/quests');
      if (!questsRes.ok) {
        const error: ApiError = new Error(`Failed to fetch data: ${questsRes.status}`);
        error.status = questsRes.status;
        throw error;
      }

      const questsData = await questsRes.json();
      return {
        user: questsData.user || null,
        quests: questsData.quests || [],
        userQuests: questsData.userQuests || [],
      };
    },
    enabled: shouldFetchData,
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if ((error as ApiError).status === 401) return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch leaderboard data
  const { data: leaderboardData } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      return res.json();
    },
    enabled: !!data?.user,
    retry: 2,
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
    onError: (error: Error) => {
      handleApiError(error as ApiError, 'Failed to sync stats');
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
      if (!res.ok) {
        const error: ApiError = new Error('Claim failed');
        error.status = res.status;
        throw error;
      }
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
    onError: (error: Error) => {
      handleApiError(error as ApiError, 'Failed to claim quest');
    },
  });

  // Memoize callbacks and computations before any early returns (React hooks rules)
  const navigateToQuests = useCallback(() => {
    setActiveTab('quests');
  }, []);

  // Derived data - compute after data is available but before any conditional returns
  const user = data?.user;
  
  // Memoize expensive computations - using optional chaining for safety
  const contributions: ContributionDay[] = useMemo(
    () => user?.github_stats?.contributions || [],
    [user?.github_stats?.contributions]
  );
  
  const badges: GitHubAchievementBadge[] = useMemo(
    () => user?.github_stats?.badges || [],
    [user?.github_stats?.badges]
  );

  // Calculate RPG stats from github_stats
  const rpgStats = useMemo(
    () => user ? calculateRPGStats({
      totalStars: user.github_stats?.stars ?? 0,
      totalRepos: user.github_stats?.repos ?? 0,
      totalCommits: user.github_stats?.commits ?? 0,
      totalPRs: user.github_stats?.prs ?? 0,
      totalIssues: user.github_stats?.issues ?? 0,
      totalReviews: user.github_stats?.reviews ?? 0,
    }) : { health: 0, mana: 0, strength: 0, charisma: 0, wisdom: 0 },
    [user]
  );

  // Calculate level from XP
  const level = useMemo(() => user ? Math.floor(user.xp / 1000) + 1 : 1, [user]);

  // Get next rank threshold
  const rankThresholds: Record<RankTier, number> = useMemo(
    () => ({
      C: 1000, B: 3000, A: 6000, AA: 10000, AAA: 15000, S: 25000, SS: 50000, SSS: Infinity,
    }),
    []
  );
  const xpToNextRank = user ? rankThresholds[user.rank_tier] : 1000;

  // Quest stats
  const completedQuests = useMemo(
    () => data?.userQuests.filter((uq) => uq.status === 'COMPLETED').length ?? 0,
    [data?.userQuests]
  );
  const claimableQuests = useMemo(
    () => data?.userQuests.filter((uq) => uq.status === 'COMPLETED' && !uq.claimed_at).length ?? 0,
    [data?.userQuests]
  );
  const hasNeverSynced = !user?.last_synced_at;

  // Leaderboard data for sidebar
  const leaderboardUsers = (leaderboardData?.users || []) as LeaderboardUser[];
  const userRankIndex = user ? leaderboardUsers.findIndex((u) => u.id === user.id) : -1;
  const userRank = userRankIndex >= 0 ? userRankIndex + 1 : undefined;
  const totalUsers = leaderboardUsers.length || undefined;

  // Render active tab content - memoized to prevent recreation on every render
  const renderTabContent = useCallback(() => {
    if (!user) return null;

    switch (activeTab) {
      case 'quick':
        return (
          <QuickViewTab
            xp={user.xp}
            level={level}
            completedQuests={completedQuests}
            reposCount={user.github_stats?.repos ?? 0}
            claimableQuests={claimableQuests}
            rpgStats={rpgStats}
            badges={badges}
            hasNeverSynced={hasNeverSynced}
            onNavigateToQuests={navigateToQuests}
          />
        );
      case 'activity':
        return (
          <ActivityViewTab
            contributions={contributions}
            xp={user.xp}
            rankTier={user.rank_tier}
            lastSyncedAt={user.last_synced_at}
          />
        );
      case 'quests':
        return (
          <QuestsViewTab
            quests={data?.quests ?? []}
            userQuests={data?.userQuests ?? []}
            onClaim={(questId) => claimMutation.mutate(questId)}
            claimLoading={claimMutation.isPending}
            onSync={() => syncMutation.mutate()}
            syncing={syncMutation.isPending}
          />
        );
      default:
        return null;
    }
  }, [
    user,
    activeTab,
    level,
    completedQuests,
    claimableQuests,
    rpgStats,
    badges,
    hasNeverSynced,
    navigateToQuests,
    contributions,
    data?.quests,
    data?.userQuests,
    claimMutation,
    syncMutation,
  ]);

  // Loading states - early returns AFTER all hooks
  if (status === 'loading') {
    return <LoadingScreen message="INITIALIZING" />;
  }

  if (status === 'unauthenticated') {
    return <LoadingScreen message="REDIRECTING" />;
  }

  if (isLoading && !data) {
    return (
      <>
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          Loading dashboard content...
        </div>
        <DashboardSkeleton />
      </>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-[var(--void-darkest)] flex items-center justify-center p-4">
        <PixelFrame variant="critical" className="max-w-md">
          <div className="text-center text-[var(--critical)] font-pixel text-sm p-6">
            <div className="mb-4">ERROR LOADING DASHBOARD</div>
            <PixelButton onClick={() => refetch()}>RETRY</PixelButton>
          </div>
        </PixelFrame>
      </div>
    );
  }

  if (!user) {
    return <LoadingScreen message="PREPARING ADVENTURE" />;
  }

  // Component render
  return (
    <div className="min-h-screen bg-[var(--obsidian-darkest)] bg-neon-radial">
      {/* Screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        Dashboard content loaded successfully
      </div>

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {/* Floating XP Animation */}
      {floatingXP && (
        <FloatingXP
          key={floatingXP.key}
          amount={floatingXP.amount}
          x={50}
          y={30}
          onComplete={() => setFloatingXP(null)}
        />
      )}

      {/* Top HUD Bar - Sticky with SYNC button (profile hidden - shown in HeroSidebar) */}
      <GameHUD
        username={user.username}
        avatarUrl={user.avatar_url}
        xp={user.xp}
        rankTier={user.rank_tier}
        level={level}
        xpToNextLevel={1000}
        onSync={() => syncMutation.mutate()}
        syncing={syncMutation.isPending}
        lastSynced={user.last_synced_at}
        showProfile={false}
      />

      {/* Main Dashboard Grid - Hybrid Layout */}
      <div className="dashboard-wrapper">
        {/* Hero Sidebar - Sticky on desktop, hidden on mobile */}
        <HeroSidebar
          username={user.username}
          avatarUrl={user.avatar_url}
          xp={user.xp}
          rankTier={user.rank_tier}
          level={level}
          xpToNextRank={xpToNextRank}
          badges={badges}
          leaderboardUsers={leaderboardUsers}
          currentUserId={user.id}
          userRank={userRank}
          totalUsers={totalUsers}
        />

        {/* Content Area with Tabs */}
        <main className="dashboard-content">
          {/* Tab Navigation */}
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            claimableCount={claimableQuests}
          />

          {/* Tab Content */}
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}

