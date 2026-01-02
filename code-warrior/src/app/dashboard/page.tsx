'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { calculateGitHubStats } from '@/lib/github';
import { calculateRPGStats } from '@/lib/game-logic';
import { User } from '@/types/database';
import { RPGStats } from '@/types/database';
import CharacterSheet from '@/components/rpg/CharacterSheet';
import { RefreshCw, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<RPGStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.username) {
      loadUserData();
    }
  }, [session]);

  async function loadUserData() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', session?.user?.username)
        .single();

      if (error) throw error;

      setUser(data);

      // Calculate current RPG stats for display
      const githubStats = await calculateGitHubStats(session?.user?.username || '');
      const rpgStats = calculateRPGStats(githubStats);
      setStats(rpgStats);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    try {
      setSyncing(true);
      setSyncMessage('');

      const response = await fetch('/api/sync', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.status === 429) {
        setSyncMessage(`⏰ Cooldown: Wait ${result.waitTime}s`);
        return;
      }

      if (!response.ok) {
        setSyncMessage(`❌ ${result.error}`);
        return;
      }

      if (result.rankedUp) {
        setSyncMessage(`🎉 RANK UP! +${result.gainedXP} XP!`);
      } else {
        setSyncMessage(`✅ Synced! +${result.gainedXP} XP`);
      }

      // Reload user data
      await loadUserData();
    } catch (error) {
      setSyncMessage('❌ Sync failed');
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-midnight-void flex items-center justify-center">
        <motion.div
          className="font-pixel text-loot-gold text-xl"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          LOADING...
        </motion.div>
      </div>
    );
  }

  if (!user || !stats) {
    return (
      <div className="min-h-screen bg-midnight-void flex items-center justify-center">
        <div className="text-center">
          <p className="font-pixel text-critical-red text-lg mb-4">
            ERROR: User data not found
          </p>
          <button
            onClick={() => router.push('/')}
            className="font-mono text-mana-blue hover:text-loot-gold transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Top Action Bar */}
      <div className="fixed top-0 left-0 right-0 bg-gray-900/95 border-b-2 border-gray-800 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <h1 className="font-pixel text-sm text-loot-gold">CODE WARRIOR</h1>
          
          <div className="flex items-center gap-4">
            {syncMessage && (
              <motion.span
                className="font-mono text-sm text-mana-blue"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {syncMessage}
              </motion.span>
            )}
            
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-loot-gold text-midnight-void font-pixel text-xs rounded hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'SYNCING...' : 'SYNC STATS'}
            </button>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 font-pixel text-xs rounded hover:bg-critical-red hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              LOGOUT
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20">
        <CharacterSheet user={user} stats={stats} />
      </div>
    </div>
  );
}
