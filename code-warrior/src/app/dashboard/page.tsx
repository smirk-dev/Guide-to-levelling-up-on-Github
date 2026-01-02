'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { calculateGitHubStats } from '@/lib/github';
import { calculateRPGStats } from '@/lib/game-logic';
import { User, Quest, UserQuest } from '@/types/database';
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
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [activeUserQuest, setActiveUserQuest] = useState<UserQuest | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      console.log('Session data:', session.user);
      const username = session.user.username || (session.user as any).email?.split('@')[0];
      if (username) {
        loadUserData();
      } else {
        console.error('No username found in session:', session.user);
        setLoading(false);
      }
    }
  }, [session]);

  async function loadUserData() {
    try {
      setLoading(true);
      const githubId = session?.user?.id;
      const accessToken = (session as any)?.accessToken;
      const username = session?.user?.username || (session?.user as any).email?.split('@')[0];
      
      if (!username && !githubId) {
        console.error('Cannot load user data: no identifier');
        return;
      }

      console.log('Loading user data for:', { githubId, username });

      // First, fetch the ACTUAL GitHub username from the API
      let actualUsername: string | null = null;
      if (accessToken) {
        try {
          const githubUserResponse = await fetch('https://api.github.com/user', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/vnd.github.v3+json',
            },
          });
          
          if (githubUserResponse.ok) {
            const githubUser = await githubUserResponse.json();
            actualUsername = githubUser.login;
            console.log('Fetched actual GitHub username:', actualUsername);
          }
        } catch (error) {
          console.error('Error fetching GitHub username:', error);
        }
      }
      
      // Try to find by GitHub ID first (more reliable)
      let { data, error } = githubId
        ? await supabase
            .from('users')
            .select('*')
            .eq('github_id', githubId)
            .single()
        : await supabase
            .from('users')
            .select('*')
            .eq('username', actualUsername || username)
            .single();

      // If user exists but username is wrong, update it
      if (data && actualUsername && data.username !== actualUsername) {
        console.log('Updating username from', data.username, 'to', actualUsername);
        const { error: updateError } = await supabase
          .from('users')
          .update({ username: actualUsername })
          .eq('github_id', githubId);
        
        if (!updateError) {
          data.username = actualUsername;
        }
      }

      // If user doesn't exist, trigger a sync to create them
      if (error && error.code === 'PGRST116') {
        console.log('User not found in database, triggering initial sync...');
        
        try {
          const syncResponse = await fetch('/api/sync', {
            method: 'POST',
          });
          
          const syncResult = await syncResponse.json();
          
          if (syncResponse.ok && syncResult.user) {
            data = syncResult.user;
            
            // Also calculate stats from sync result
            if (syncResult.stats) {
              const rpgStats = calculateRPGStats(syncResult.stats);
              setStats(rpgStats);
            }
          } else {
            console.error('Sync failed:', syncResult);
            throw new Error(syncResult.error || 'Failed to create user');
          }
        } catch (syncError) {
          console.error('Error during initial sync:', syncError);
          throw syncError;
        }
      } else if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No user data returned');
      }

      setUser(data);

      // Calculate current RPG stats for display (if not already set from sync)
      // Use the actual GitHub username we fetched
      if (!stats && (actualUsername || data.username)) {
        const githubStats = await calculateGitHubStats(actualUsername || data.username);
        const rpgStats = calculateRPGStats(githubStats);
        setStats(rpgStats);
      }
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
        <div className="text-center">
          <motion.div
            className="font-pixel text-loot-gold text-xl mb-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            LOADING...
          </motion.div>
          {session && (
            <p className="font-mono text-xs text-gray-500">
              Session: {session.user?.email || session.user?.name || 'Unknown'}
            </p>
          )}
        </div>
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
