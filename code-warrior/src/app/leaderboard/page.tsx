'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Loader2, ArrowLeft } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-b from-midnight-void to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-loot-gold animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading Hall of Fame...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight-void to-gray-900 py-8 px-4">
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
            className="inline-flex items-center gap-2 text-mana-blue hover:text-loot-gold transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          {/* Title with Trophy */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <Trophy className="w-16 h-16 text-loot-gold" />
              <motion.div
                className="absolute inset-0 bg-loot-gold/20 rounded-full blur-xl"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-pixel text-loot-gold drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]">
                HALL OF FAME
              </h1>
              <p className="text-gray-400 mt-2">
                The mightiest Code Warriors ranked by total XP
              </p>
            </div>
          </div>

          {/* Arcade-style scanlines effect */}
          <div
            className="h-1 w-full bg-gradient-to-r from-transparent via-loot-gold to-transparent opacity-50"
            style={{
              backgroundSize: '4px 4px',
              backgroundImage:
                'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,215,0,0.3) 2px, rgba(255,215,0,0.3) 4px)',
            }}
          />
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-critical-red/10 border border-critical-red/50 rounded-lg p-4 mb-6"
          >
            <p className="text-critical-red">{error}</p>
            <button
              onClick={loadLeaderboard}
              className="mt-2 text-sm text-loot-gold hover:underline"
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
                <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">
                  No warriors have claimed their place yet.
                </p>
                <p className="text-sm text-gray-500 mt-2">
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
            <div
              className="h-1 w-full bg-gradient-to-r from-transparent via-loot-gold to-transparent opacity-50 mb-4"
              style={{
                backgroundSize: '4px 4px',
                backgroundImage:
                  'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,215,0,0.3) 2px, rgba(255,215,0,0.3) 4px)',
              }}
            />
            <p className="text-sm text-gray-500 font-pixel">
              {leaderboard.length} WARRIORS RANKED
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
