'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PixelTrophy } from '@/components/icons/PixelIcon';
import LeaderboardCard from '@/components/rpg/LeaderboardCard';
import type { RankTier } from '@/types/database';
import Link from 'next/link';

interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar_url: string;
  xp: number;
  rank_tier: RankTier;
}

export default function LeaderboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      loadLeaderboard();
    }
  }, [status, router]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/leaderboard');
      const data = await response.json();

      if (response.ok) {
        setLeaderboard(data.leaderboard || []);
      } else {
        setError(data.error || 'Failed to load leaderboard');
      }
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-midnight-void-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin inline-block">⚙️</div>
          <p className="text-gray-400 font-mono">Loading Hall of Fame...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-void-0 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Back Button */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-mana-blue-2 hover:text-loot-gold-2 transition-colors mb-6 font-mono"
          >
            <span>←</span>
            <span>Back to Dashboard</span>
          </Link>

          {/* Title with Trophy */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <Trophy className="w-16 h-16 text-loot-gold-2 stroke-[3px]" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-pixel text-loot-gold-2 no-smooth"
                style={{
                  textShadow: '-2px -2px 0 var(--loot-gold-0), 2px -2px 0 var(--loot-gold-0), -2px 2px 0 var(--loot-gold-0), 2px 2px 0 var(--loot-gold-0)'
                }}
              >
                HALL OF FAME
              </h1>
              <p className="text-gray-400 mt-2 font-mono">
                The mightiest Code Warriors ranked by total XP
              </p>
            </div>
          </div>

          {/* Pixel divider */}
          <div className="h-1 w-full bg-midnight-void-2 border-t-2 border-b-2 border-loot-gold-1" />
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-midnight-void-2 border-2 border-critical-red-1 rounded-pixel-sm p-4 mb-6 pixel-perfect"
          >
            <p className="text-critical-red-1 font-mono">{error}</p>
            <button
              onClick={loadLeaderboard}
              className="mt-2 text-sm text-loot-gold-2 hover:text-loot-gold-3 font-mono"
            >
              Try again
            </button>
          </motion.div>
        )}

        {/* Leaderboard List */}
        {!error && (
          <div className="space-y-4">
            {leaderboard.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4 stroke-[3px]" />
                <p className="text-gray-400 font-mono">
                  No warriors have claimed their place yet.
                </p>
                <p className="text-sm text-gray-500 mt-2 font-mono">
                  Be the first to sync your GitHub stats!
                </p>
              </motion.div>
            ) : (
              leaderboard.map((entry) => (
                <LeaderboardCard
                  key={entry.id}
                  entry={entry}
                  isCurrentUser={session?.user?.username === entry.username}
                />
              ))
            )}
          </div>
        )}

        {/* Footer Stats */}
        {leaderboard.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <div className="h-1 w-full bg-midnight-void-2 border-t-2 border-b-2 border-loot-gold-1 mb-4" />
            <p className="text-sm text-gray-500 font-pixel no-smooth">
              {leaderboard.length} WARRIORS RANKED
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
