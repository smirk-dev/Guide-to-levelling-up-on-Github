'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  PageLayout,
  LeaderboardTable,
  PixelFrame,
  PixelBadge,
  LoadingScreen,
  IconTrophy,
  IconRank,
} from '@/components';
import type { User } from '@/types/database';

interface LeaderboardData {
  users: User[];
  currentUserRank?: number;
}

export default function LeaderboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Fetch leaderboard data
  const { data, isLoading } = useQuery<LeaderboardData>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      return res.json();
    },
    enabled: status === 'authenticated',
    refetchInterval: 60000, // Refresh every minute
  });

  if (status === 'loading' || isLoading) {
    return <LoadingScreen message="LOADING LEADERBOARD" />;
  }

  if (!session || !data) {
    return <LoadingScreen message="LOADING RANKINGS" />;
  }

  // Find current user in the leaderboard
  const currentUserIndex = data.users.findIndex(
    (u) => u.username === session.user?.name
  );
  const currentUserRank = currentUserIndex >= 0 ? currentUserIndex + 1 : null;
  const currentUser = currentUserIndex >= 0 ? data.users[currentUserIndex] : null;

  // Get rank distribution stats
  const rankCounts = data.users.reduce((acc, user) => {
    acc[user.rank_tier] = (acc[user.rank_tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <PageLayout
      title="LEADERBOARD"
      subtitle="Top warriors ranked by XP"
    >
      {/* Current User Rank */}
      {currentUser && currentUserRank && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:mb-10"
        >
          <PixelFrame variant="mana" padding="lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 md:gap-5">
                <IconRank size={36} color="#58a6ff" />
                <div>
                  <p className="font-pixel text-[10px] md:text-[11px] text-[var(--mana-light)] mb-1">
                    YOUR RANKING
                  </p>
                  <p className="font-pixel text-[8px] md:text-[9px] text-[var(--gray-highlight)]">
                    Keep pushing to climb higher!
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-pixel-heading text-[24px] md:text-[28px] text-[var(--gold-light)] mb-1">
                  #{currentUserRank}
                </p>
                <p className="font-pixel text-[8px] md:text-[9px] text-[var(--gray-medium)]">
                  of {data.users.length} warriors
                </p>
              </div>
            </div>
          </PixelFrame>
        </motion.div>
      )}

      {/* Rank Distribution */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 md:mb-10"
      >
        <PixelFrame variant="stone" padding="lg">
          <p className="font-pixel text-[9px] md:text-[10px] text-[var(--gray-highlight)] mb-4 text-center">
            RANK DISTRIBUTION
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-5">
            {['SSS', 'SS', 'S', 'AAA', 'AA', 'A', 'B', 'C'].map((rank) => (
              <div key={rank} className="text-center min-w-[50px]">
                <PixelBadge
                  variant={
                    rank === 'SSS'
                      ? 'gold'
                      : rank === 'SS' || rank === 'S'
                      ? 'purple'
                      : rank.startsWith('A')
                      ? 'mana'
                      : 'gray'
                  }
                  size="sm"
                >
                  {rank}
                </PixelBadge>
                <p className="font-pixel text-[10px] md:text-[11px] text-white mt-2">
                  {rankCounts[rank] || 0}
                </p>
              </div>
            ))}
          </div>
        </PixelFrame>
      </motion.div>

      {/* Leaderboard Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <LeaderboardTable
          users={data.users}
          currentUserId={currentUser?.id}
        />
      </motion.div>

      {/* Footer info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 text-center"
      >
        <p className="font-pixel text-[8px] md:text-[9px] text-[var(--gray-medium)]">
          Rankings update in real-time as warriors sync their GitHub stats
        </p>
      </motion.div>
    </PageLayout>
  );
}
