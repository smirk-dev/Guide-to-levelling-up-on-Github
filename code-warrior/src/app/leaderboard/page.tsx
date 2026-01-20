'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PageLayout,
  LeaderboardTable,
  PixelFrame,
  PixelBadge,
  PixelButton,
  PixelAvatar,
  LoadingScreen,
  IconTrophy,
  IconRank,
  IconXP,
  IconClose,
} from '@/components';
import { getRankDisplayName } from '@/lib/game-logic';
import type { User, RankTier } from '@/types/database';

interface LeaderboardData {
  users: User[];
  currentUserRank?: number;
}

// User Profile Modal Component
const UserProfileModal: React.FC<{
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  rank: number;
}> = ({ user, isOpen, onClose, rank }) => {
  if (!isOpen || !user) return null;

  const level = Math.floor(user.xp / 1000) + 1;
  const rankName = getRankDisplayName(user.rank_tier);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80" />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative z-10 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <PixelFrame variant="gold" padding="lg">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:opacity-70 transition-opacity"
              aria-label="Close user profile"
            >
              <IconClose size={16} color="var(--gray-medium)" />
            </button>

            <div className="text-center">
              {/* Avatar */}
              <div className="flex justify-center mb-4">
                <PixelAvatar src={user.avatar_url} alt={user.username} size="xl" glow />
              </div>

              {/* Username */}
              <h2 className="font-pixel text-[16px] text-white mb-2">
                {user.username}
              </h2>

              {/* Rank Badge */}
              <div className="flex justify-center mb-4">
                <PixelBadge variant="gold" size="md">
                  #{rank} - {user.rank_tier} RANK
                </PixelBadge>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <p className="font-pixel-heading text-[18px] text-[var(--gold-light)]">
                    {user.xp.toLocaleString()}
                  </p>
                  <p className="font-pixel text-[8px] text-[var(--gray-medium)]">XP</p>
                </div>
                <div className="text-center">
                  <p className="font-pixel-heading text-[18px] text-[var(--mana-light)]">
                    {level}
                  </p>
                  <p className="font-pixel text-[8px] text-[var(--gray-medium)]">LEVEL</p>
                </div>
                <div className="text-center">
                  <p className="font-pixel-heading text-[18px] text-[var(--health-light)]">
                    {user.github_stats?.repos || 0}
                  </p>
                  <p className="font-pixel text-[8px] text-[var(--gray-medium)]">REPOS</p>
                </div>
              </div>

              {/* Title */}
              <p className="font-pixel text-[10px] text-[var(--xp-light)] mb-4">
                {rankName}
              </p>

              {/* GitHub Link */}
              <a
                href={`https://github.com/${user.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <PixelButton variant="mana" size="sm">
                  VIEW GITHUB PROFILE
                </PixelButton>
              </a>
            </div>
          </PixelFrame>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const RANK_TIERS: RankTier[] = ['SSS', 'SS', 'S', 'AAA', 'AA', 'A', 'B', 'C'];

export default function LeaderboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedRankFilter, setSelectedRankFilter] = useState<RankTier | 'ALL'>('ALL');
  const [selectedUser, setSelectedUser] = useState<{ user: User; rank: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter users based on rank and search query
  const filteredUsers = useMemo(() => {
    if (!data?.users) return [];

    let users = data.users;

    // Filter by rank
    if (selectedRankFilter !== 'ALL') {
      users = users.filter((u) => u.rank_tier === selectedRankFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      users = users.filter((u) => u.username.toLowerCase().includes(query));
    }

    return users;
  }, [data?.users, selectedRankFilter, searchQuery]);

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

  // Handle user click to show profile
  const handleUserClick = (user: User, index: number) => {
    setSelectedUser({ user, rank: index + 1 });
  };

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
                  <p className="font-pixel text-[var(--font-sm)] md:text-[11px] text-[var(--mana-light)] mb-1">
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

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <PixelFrame variant="stone" padding="md">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="flex-1 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search warriors..."
                aria-label="Search leaderboard by warrior username"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--void-darker)] border-2 border-[var(--gray-dark)] text-white font-pixel text-[10px] placeholder:text-[var(--gray-medium)] focus:border-[var(--mana-medium)] focus:outline-none"
              />
            </div>

            {/* Rank Filter */}
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setSelectedRankFilter('ALL')}
                aria-label="Show all warriors regardless of rank"
                aria-pressed={selectedRankFilter === 'ALL'}
                className={`px-3 py-1 font-pixel text-[8px] border-2 transition-colors ${
                  selectedRankFilter === 'ALL'
                    ? 'bg-[var(--mana-medium)] border-[var(--mana-light)] text-white'
                    : 'bg-transparent border-[var(--gray-dark)] text-[var(--gray-medium)] hover:border-[var(--gray-medium)]'
                }`}
              >
                ALL
              </button>
              {RANK_TIERS.map((rank) => (
                <button
                  key={rank}
                  onClick={() => setSelectedRankFilter(rank)}
                  aria-label={`Filter leaderboard to show only ${rank} rank warriors`}
                  aria-pressed={selectedRankFilter === rank}
                  className={`px-2 py-1 font-pixel text-[8px] border-2 transition-colors ${
                    selectedRankFilter === rank
                      ? 'bg-[var(--gold-medium)] border-[var(--gold-light)] text-[var(--void-darkest)]'
                      : 'bg-transparent border-[var(--gray-dark)] text-[var(--gray-medium)] hover:border-[var(--gray-medium)]'
                  }`}
                >
                  {rank}
                </button>
              ))}
            </div>
          </div>
        </PixelFrame>
      </motion.div>

      {/* Rank Distribution */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-8 md:mb-10"
      >
        <PixelFrame variant="stone" padding="lg">
          <p className="font-pixel text-[9px] md:text-[var(--font-sm)] text-[var(--gray-highlight)] mb-4 text-center">
            RANK DISTRIBUTION
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-5">
            {RANK_TIERS.map((rank) => (
              <button
                key={rank}
                onClick={() => setSelectedRankFilter(rank)}
                className={`text-center min-w-[50px] transition-transform ${
                  selectedRankFilter === rank ? 'scale-110' : 'hover:scale-105'
                }`}
              >
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
                  className={selectedRankFilter === rank ? 'ring-2 ring-[var(--gold-light)]' : ''}
                >
                  {rank}
                </PixelBadge>
                <p className="font-pixel text-[var(--font-sm)] md:text-[11px] text-white mt-2">
                  {rankCounts[rank] || 0}
                </p>
              </button>
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
        {/* Filter Results Info */}
        {(selectedRankFilter !== 'ALL' || searchQuery) && (
          <div className="mb-4 flex items-center justify-between">
            <p className="font-pixel text-[9px] text-[var(--gray-medium)]">
              Showing {filteredUsers.length} of {data.users.length} warriors
              {selectedRankFilter !== 'ALL' && ` (${selectedRankFilter} rank)`}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
            <button
              onClick={() => {
                setSelectedRankFilter('ALL');
                setSearchQuery('');
              }}
              className="font-pixel text-[8px] text-[var(--mana-light)] hover:underline"
            >
              CLEAR FILTERS
            </button>
          </div>
        )}

        {/* Clickable Leaderboard - Custom implementation for click handling */}
        <div className="space-y-2">
          {filteredUsers.map((user, index) => {
            const originalIndex = data.users.findIndex((u) => u.id === user.id);
            const isCurrentUser = user.id === currentUser?.id;

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleUserClick(user, originalIndex)}
                className="cursor-pointer"
              >
                <PixelFrame
                  variant={isCurrentUser ? 'mana' : originalIndex < 3 ? 'gold' : 'stone'}
                  padding="sm"
                >
                  <div className="flex items-center gap-4">
                    {/* Position */}
                    <div className="w-12 h-12 flex items-center justify-center">
                      {originalIndex === 0 ? (
                        <IconTrophy size={32} color="#ffd700" />
                      ) : originalIndex === 1 ? (
                        <IconTrophy size={28} color="#c0c0c0" />
                      ) : originalIndex === 2 ? (
                        <IconTrophy size={24} color="#cd7f32" />
                      ) : (
                        <span className="font-pixel-heading text-[16px] text-[var(--gray-highlight)]">
                          #{originalIndex + 1}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <PixelAvatar
                      src={user.avatar_url}
                      alt={user.username}
                      size="md"
                      glow={originalIndex < 3}
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-pixel text-[11px] text-white truncate">
                          {user.username}
                        </h3>
                        {isCurrentUser && (
                          <PixelBadge variant="mana" size="sm">YOU</PixelBadge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <IconRank size={12} color={originalIndex < 3 ? '#ffd700' : 'var(--gray-highlight)'} />
                        <span className="font-pixel text-[8px] text-[var(--gray-highlight)]">
                          {getRankDisplayName(user.rank_tier)} ({user.rank_tier})
                        </span>
                      </div>
                    </div>

                    {/* XP */}
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <IconXP size={14} color="#ffd700" />
                        <span className="font-pixel text-[11px] text-[var(--gold-light)]">
                          {user.xp.toLocaleString()}
                        </span>
                      </div>
                      <span className="font-pixel text-[7px] text-[var(--gray-medium)]">
                        XP
                      </span>
                    </div>
                  </div>
                </PixelFrame>
              </motion.div>
            );
          })}

          {/* Empty state for filtered results */}
          {filteredUsers.length === 0 && (
            <PixelFrame variant="stone" padding="lg">
              <div className="text-center py-8">
                <IconTrophy size={48} color="#484848" className="mx-auto mb-4" />
                <h3 className="font-pixel text-[12px] text-[var(--gray-highlight)] mb-2">
                  NO WARRIORS FOUND
                </h3>
                <p className="font-pixel text-[9px] text-[var(--gray-medium)]">
                  {searchQuery
                    ? `No warriors match "${searchQuery}"`
                    : `No warriors have reached ${selectedRankFilter} rank yet`}
                </p>
              </div>
            </PixelFrame>
          )}
        </div>
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
        <p className="font-pixel text-[7px] text-[var(--gray-dark)] mt-1">
          Click on any warrior to view their profile
        </p>
      </motion.div>

      {/* User Profile Modal */}
      <UserProfileModal
        user={selectedUser?.user || null}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        rank={selectedUser?.rank || 0}
      />
    </PageLayout>
  );
}
