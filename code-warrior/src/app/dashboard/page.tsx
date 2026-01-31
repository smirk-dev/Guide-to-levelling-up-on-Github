'use client';

import React, { useState, useEffect } from 'react';
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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Tab state with localStorage persistence
  const [activeTab, setActiveTab] = useState<DashboardTab>('quick');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning'; visible: boolean }>({ message: '', type: 'info', visible: false });
  const [floatingXP, setFloatingXP] = useState<{ amount: number; key: number } | null>(null);

  // Restore tab preference from localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem('dashboard_tab') as DashboardTab | null;
    if (savedTab && ['quick', 'activity', 'quests'].includes(savedTab)) {
      setActiveTab(savedTab);
    }
  }, []);

  // Save tab preference to localStorage
  useEffect(() => {
    localStorage.setItem('dashboard_tab', activeTab);
  }, [activeTab]);

  // Helper function to handle API errors including session timeout
  const handleApiError = (error: any, defaultMessage: string) => {
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
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Fetch dashboard data
  const { data, isLoading, refetch, error } = useQuery<DashboardData>({
    queryKey: ['dashboard', session?.user?.id],
    queryFn: async () => {
      if (status === 'unauthenticated') {
        throw new Error('Not authenticated');
      }

      const questsRes = await fetch('/api/quests');
      if (!questsRes.ok) {
        throw new Error(`Failed to fetch data: ${questsRes.status}`);
      }

      const questsData = await questsRes.json();
      return {
        user: questsData.user || null,
        quests: questsData.quests || [],
        userQuests: questsData.userQuests || [],
      };
    },
    enabled: status !== 'loading' && status !== 'unauthenticated',
    retry: 3,
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
        const error: any = new Error('Sync failed');
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
    onError: (error: any) => {
      handleApiError(error, 'Failed to sync stats');
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
        const error: any = new Error('Claim failed');
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
    onError: (error: any) => {
      handleApiError(error, 'Failed to claim quest');
    },
  });

  // Loading states
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

  if (!data?.user) {
    return <LoadingScreen message="PREPARING ADVENTURE" />;
  }

  const user = data.user;

  // Get contributions and badges from github_stats
  const contributions: ContributionDay[] = user.github_stats?.contributions || [];
  const badges: GitHubAchievementBadge[] = user.github_stats?.badges || [];

  // Calculate RPG stats from github_stats
  const rpgStats = calculateRPGStats({
    totalStars: user.github_stats?.stars ?? 0,
    totalRepos: user.github_stats?.repos ?? 0,
    totalCommits: user.github_stats?.commits ?? 0,
    totalPRs: user.github_stats?.prs ?? 0,
    totalIssues: user.github_stats?.issues ?? 0,
    totalReviews: user.github_stats?.reviews ?? 0,
  });

  // Calculate level from XP
  const level = Math.floor(user.xp / 1000) + 1;

  // Get next rank threshold
  const rankThresholds: Record<RankTier, number> = {
    C: 1000, B: 3000, A: 6000, AA: 10000, AAA: 15000, S: 25000, SS: 50000, SSS: Infinity,
  };
  const xpToNextRank = rankThresholds[user.rank_tier];

  // Quest stats
  const completedQuests = data.userQuests.filter((uq) => uq.status === 'COMPLETED').length;
  const claimableQuests = data.userQuests.filter(
    (uq) => uq.status === 'COMPLETED' && !uq.claimed_at
  ).length;
  const hasNeverSynced = !user.last_synced_at;

  // Leaderboard data for sidebar
  const leaderboardUsers = leaderboardData?.users || [];
  const userRankIndex = leaderboardUsers.findIndex((u: any) => u.id === user.id);
  const userRank = userRankIndex >= 0 ? userRankIndex + 1 : undefined;
  const totalUsers = leaderboardUsers.length || undefined;

  // Navigate to quests tab
  const navigateToQuests = () => {
    setActiveTab('quests');
  };

  // Render active tab content
  const renderTabContent = () => {
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
            quests={data.quests}
            userQuests={data.userQuests}
            onClaim={(questId) => claimMutation.mutate(questId)}
            claimLoading={claimMutation.isPending}
            onSync={() => syncMutation.mutate()}
            syncing={syncMutation.isPending}
          />
        );
      default:
        return null;
    }
  };

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

      {/* Top HUD Bar - Sticky with SYNC button */}
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
        showProfile={true}
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

