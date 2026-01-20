'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  PixelFrame,
  PixelButton,
  PixelBadge,
  PixelAvatar,
  LoadingScreen,
  Toast,
  FloatingXP,
  QuestCard,
  GameHUD,
  BattleStatsPanel,
  ActivityHeatmap,
  AchievementBadges,
  IconScroll,
  IconRank,
} from '@/components';
import { calculateRPGStats, getRankDisplayName, getNextRank } from '@/lib/game-logic';
import { soundManager } from '@/lib/sound';
import { DashboardSkeleton } from '@/components/ui/LoadingSkeletons';
import type { User, Quest, UserQuest, RankTier, ContributionDay, GitHubAchievementBadge } from '@/types/database';

interface DashboardData {
  user: User | null;
  quests: Quest[];
  userQuests: UserQuest[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning'; visible: boolean }>({ message: '', type: 'info', visible: false });
  const [floatingXP, setFloatingXP] = useState<{ amount: number; key: number } | null>(null);

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

  // Loading states
  if (status === 'loading') {
    return <LoadingScreen message="INITIALIZING" />;
  }

  if (status === 'unauthenticated') {
    return <LoadingScreen message="REDIRECTING" />;
  }

  if (isLoading && !data) {
    return <DashboardSkeleton />;
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

  // Get quests with their status
  const questsWithStatus = data.quests.map((quest) => ({
    quest,
    userQuest: data.userQuests.find((uq) => uq.quest_id === quest.id) || null,
  }));

  // Prioritize: 1) In-progress, 2) Claimable (completed but not claimed), 3) Not started
  const inProgressQuests = questsWithStatus.filter(
    ({ userQuest }) => userQuest?.status === 'ACTIVE'
  );
  const claimableQuestItems = questsWithStatus.filter(
    ({ userQuest }) => userQuest?.status === 'COMPLETED' && !userQuest?.claimed_at
  );
  const notStartedQuests = questsWithStatus.filter(
    ({ userQuest }) => !userQuest
  );

  // Combine for display (prioritize in-progress, then claimable, then not started)
  const activeQuests = [
    ...inProgressQuests,
    ...claimableQuestItems,
    ...notStartedQuests,
  ].slice(0, 3);

  // Quick stats
  const completedQuests = data.userQuests.filter((uq) => uq.status === 'COMPLETED').length;
  const claimableQuests = data.userQuests.filter(
    (uq) => uq.status === 'COMPLETED' && !uq.claimed_at
  ).length;
  const hasNeverSynced = !user.last_synced_at;

  return (
    <div className="min-h-screen bg-[var(--void-darkest)]">
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

      {/* Top HUD Bar */}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* First Sync Banner */}
        {hasNeverSynced && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <PixelFrame variant="mana" padding="md">
              <div className="flex items-center justify-center gap-4">
                <span className="font-pixel text-[11px] text-[var(--mana-light)]">
                  Welcome, Warrior! Click SYNC above to load your GitHub stats and start your adventure!
                </span>
              </div>
            </PixelFrame>
          </motion.div>
        )}

        {/* Three-Column Layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column (1/3): Character Portrait + Achievements + Battle Stats */}
          <div className="space-y-3">
            {/* Character Portrait Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <PixelFrame variant="gold" padding="md">
                <div className="flex flex-col items-center">
                  {/* Avatar */}
                  <div style={{ width: '72px', height: '72px' }}>
                    <PixelAvatar src={user.avatar_url} alt={user.username} size="lg" glow />
                  </div>

                  {/* Username */}
                  <h2 className="font-pixel text-[14px] text-white mt-3 text-center">
                    {user.username}
                  </h2>

                  {/* Rank */}
                  <div className="flex items-center gap-2 mt-2">
                    <IconRank size={16} />
                    <span className="font-pixel text-[11px] text-[var(--gold-light)]">
                      {getRankDisplayName(user.rank_tier)}
                    </span>
                  </div>

                  {/* Rank Badge */}
                  <PixelBadge variant="gold" size="sm" className="mt-3">
                    {user.rank_tier} Rank
                  </PixelBadge>

                  {/* XP Progress to next rank */}
                  <div className="w-full mt-3">
                    <div className="flex justify-between text-[9px] font-pixel mb-1">
                      <span className="text-[var(--gray-highlight)]">Rank Progress</span>
                      <span className="text-[var(--gold-light)]">
                        {user.xp.toLocaleString()} / {xpToNextRank === Infinity ? 'MAX' : xpToNextRank.toLocaleString()}
                      </span>
                    </div>
                    <div className="stat-bar stat-bar-xp">
                      <div
                        className="stat-bar-fill"
                        style={{
                          width: `${xpToNextRank === Infinity ? 100 : (user.xp / xpToNextRank) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Achievement Badges */}
                <div className="mt-4 pt-3 border-t-2 border-dashed border-[var(--gold-dark)]">
                  <h4 className="font-pixel text-[9px] text-[var(--gray-highlight)] text-center mb-3">
                    Achievements
                  </h4>
                  <AchievementBadges badges={badges} size="lg" />
                </div>

                {/* Leaderboard Showcase - Compact */}
                {leaderboardData?.users && leaderboardData.users.length > 0 && (
                  <div className="mt-3 pt-3 border-t-2 border-dashed border-[var(--gold-dark)]">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-pixel text-[8px] text-[var(--gray-highlight)]">
                        Leaderboard
                      </h4>
                      <a
                        href="/leaderboard"
                        className="font-pixel text-[7px] text-[var(--mana-light)] hover:text-[var(--mana-highlight)]"
                      >
                        ALL
                      </a>
                    </div>
                    <div className="space-y-1">
                      {(() => {
                        const users = leaderboardData.users;
                        const userIndex = users.findIndex((u: any) => u.id === user.id);
                        const userRank = userIndex + 1;

                        // Build display list: preceding, current, succeeding
                        const displayUsers: { user: any; rank: number }[] = [];

                        if (userIndex === -1) {
                          // User not found, show top 3
                          users.slice(0, 3).forEach((u: any, idx: number) => {
                            displayUsers.push({ user: u, rank: idx + 1 });
                          });
                        } else {
                          // Add preceding user if exists
                          if (userIndex > 0) {
                            displayUsers.push({ user: users[userIndex - 1], rank: userRank - 1 });
                          }
                          // Add current user
                          displayUsers.push({ user: users[userIndex], rank: userRank });
                          // Add succeeding user if exists
                          if (userIndex < users.length - 1) {
                            displayUsers.push({ user: users[userIndex + 1], rank: userRank + 1 });
                          }
                        }

                        return displayUsers.map(({ user: rankedUser, rank }) => {
                          const isCurrentUser = rankedUser.id === user.id;
                          return (
                            <div
                              key={rankedUser.id}
                              className={`flex items-center gap-1.5 px-1.5 py-1 rounded ${
                                isCurrentUser
                                  ? 'bg-[var(--gold-dark)]/30 border border-[var(--gold-medium)]'
                                  : 'bg-transparent'
                              }`}
                            >
                              <span
                                className={`font-pixel text-[8px] w-5 text-right flex-shrink-0 ${
                                  isCurrentUser ? 'text-[var(--gold-light)]' : 'text-[var(--gray-medium)]'
                                }`}
                              >
                                #{rank}
                              </span>
                              <div className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
                                <img
                                  src={rankedUser.avatar_url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span
                                className={`font-pixel text-[7px] truncate flex-1 ${
                                  isCurrentUser ? 'text-white' : 'text-[var(--gray-light)]'
                                }`}
                              >
                                {rankedUser.username}
                              </span>
                              <span
                                className={`font-pixel text-[7px] flex-shrink-0 ${
                                  isCurrentUser ? 'text-[var(--gold-light)]' : 'text-[var(--gray-medium)]'
                                }`}
                              >
                                {rankedUser.xp >= 1000 ? `${(rankedUser.xp / 1000).toFixed(1)}k` : rankedUser.xp}
                              </span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </PixelFrame>
            </motion.div>
          </div>

          {/* Right Column (2/3): Quick Stats + Quests */}
          <div className="col-span-2 space-y-3">
            {/* Quick Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <PixelFrame variant="mana" padding="sm">
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center">
                    <p className="font-pixel-heading text-[16px] text-[var(--gold-light)]">
                      {user.xp.toLocaleString()}
                    </p>
                    <p className="font-pixel text-[8px] text-[var(--gray-highlight)]">
                      Total XP
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-pixel-heading text-[16px] text-[var(--health-light)]">
                      {completedQuests}
                    </p>
                    <p className="font-pixel text-[8px] text-[var(--gray-highlight)]">
                      Quests Done
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-pixel-heading text-[16px] text-white">
                      {level}
                    </p>
                    <p className="font-pixel text-[8px] text-[var(--gray-highlight)]">
                      Level
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-pixel-heading text-[16px] text-[var(--mana-light)]">
                      {user.github_stats?.repos ?? 0}
                    </p>
                    <p className="font-pixel text-[8px] text-[var(--gray-highlight)]">
                      Repos
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
                transition={{ delay: 0.2 }}
              >
                <div 
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => router.push('/quests')}
                >
                  <PixelFrame variant="gold" padding="sm">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <IconScroll size={18} color="#ffd700" />
                        <div>
                          <p className="font-pixel text-[10px] text-[var(--gold-light)]">
                            Rewards Available!
                          </p>
                          <p className="font-pixel text-[8px] text-[var(--gray-highlight)]">
                            {claimableQuests} quest{claimableQuests > 1 ? 's' : ''} ready
                          </p>
                        </div>
                      </div>
                      <PixelBadge variant="gold">{claimableQuests}</PixelBadge>
                    </div>
                  </PixelFrame>
                </div>
              </motion.div>
            )}

            {/* Active Quests Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-pixel text-[11px] text-[var(--gold-light)]">
                  Quests
                </h3>
                <a
                  href="/quests"
                  className="font-pixel text-[8px] text-[var(--mana-light)] hover:text-[var(--mana-highlight)]"
                >
                  VIEW ALL
                </a>
              </div>

              <div className="space-y-2">
                {activeQuests.map(({ quest, userQuest }, index) => (
                  <motion.div
                    key={quest.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
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
                    <div className="text-center py-4">
                      <p className="font-pixel text-[10px] text-[var(--gray-highlight)]">
                        {completedQuests > 0 ? 'All quests completed!' : 'No quests available'}
                      </p>
                      <p className="font-pixel text-[8px] text-[var(--gray-medium)] mt-2">
                        {completedQuests > 0
                          ? 'Check back later for new quests'
                          : 'Sync your stats to discover quests'}
                      </p>
                    </div>
                  </PixelFrame>
                )}
              </div>
            </motion.div>

            {/* Battle Stats Panel - Vertical Bars */}
            <BattleStatsPanel stats={rpgStats} barHeight="lg" />

            {/* Activity Heatmap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <ActivityHeatmap contributions={contributions} />
            </motion.div>
          </div>
        </div>

        {/* Last Sync Info */}
        {user.last_synced_at && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-6"
          >
            <p className="font-pixel text-[9px] text-[var(--gray-medium)]">
              Last synced: {new Date(user.last_synced_at).toLocaleString()}
             </p>
           </motion.div>
         )}

         {/* Rank Progression Info */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.7 }}
           className="mt-8"
         >
           <PixelFrame variant="stone" padding="md">
             <h3 className="font-pixel text-[11px] text-[var(--gray-highlight)] mb-3 text-center">
               RANK PROGRESSION
             </h3>
             <div className="grid grid-cols-4 md:grid-cols-8 gap-2 text-center">
               {['C', 'B', 'A', 'AA', 'AAA', 'S', 'SS', 'SSS'].map((rank, idx) => {
                 const thresholds = [0, 1000, 3000, 6000, 10000, 15000, 25000, 50000];
                 const isCurrent = rank === user.rank_tier;
                 return (
                   <div key={rank} className={`${isCurrent ? 'ring-2 ring-[var(--gold-light)] p-1' : ''}`}>
                     <p className={`font-pixel text-[9px] ${isCurrent ? 'text-[var(--gold-highlight)] font-bold' : 'text-[var(--gray-highlight)]'}`}>
                       {rank}
                     </p>
                     <p className="font-pixel text-[7px] text-[var(--gray-medium)]">
                       {thresholds[idx].toLocaleString()}
                     </p>
                   </div>
                 );
               })}
             </div>
           </PixelFrame>
         </motion.div>
       </div>
     </div>
   );
 }

