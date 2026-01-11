'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { calculateGitHubStats, fetchGitHubAchievements, type GitHubStats, type GitHubAchievement } from '@/lib/github';
import { calculateRPGStats } from '@/lib/game-logic';
import { User, Quest, UserQuest, Badge } from '@/types/database';
import { RPGStats } from '@/types/database';
import CharacterSheet from '@/components/rpg/CharacterSheet';
import FloatingXP from '@/components/effects/FloatingXP';
import Confetti from '@/components/effects/Confetti';
import { PixelRefresh, PixelLogout, PixelScroll, PixelTrophy } from '@/components/icons/PixelIcon';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundManager } from '@/lib/sound';
import Link from 'next/link';
import { get3DButtonStyle } from '@/lib/pixel-utils';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<RPGStats | null>(null);
  const [githubStats, setGithubStats] = useState<GitHubStats | null>(null);
  const [githubAchievements, setGithubAchievements] = useState<GitHubAchievement[]>([]);
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [activeUserQuest, setActiveUserQuest] = useState<UserQuest | null>(null);
  const [equippedBadges, setEquippedBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [showXP, setShowXP] = useState(false);
  const [xpAmount, setXPAmount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        console.error('Cannot load user data: no identifier found in session');
        console.error('Session data:', session);
        setLoading(false);
        return;
      }

      if (!accessToken) {
        console.warn('No access token found in session - GitHub API calls may fail');
      }

      console.log('Loading user data for:', { githubId, username, hasAccessToken: !!accessToken });

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
          } else {
            const errorText = await githubUserResponse.text();
            console.error('GitHub API error:', githubUserResponse.status, errorText);
          }
        } catch (error) {
          console.error('Error fetching GitHub username:', error instanceof Error ? error.message : error);
        }
      } else {
        console.log('No access token available, will use session username');
      }
      
      // Try to find by GitHub ID first (more reliable)
      console.log('Querying Supabase for user:', { githubId, username: actualUsername || username });
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

      console.log('Supabase query result:', { hasData: !!data, error: error?.message || null });

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

            // Load badges for new user (will be empty initially)
            const badges = await loadEquippedBadges(syncResult.user.id);

            // Also calculate stats from sync result
            if (syncResult.stats) {
              const rpgStats = calculateRPGStats(syncResult.stats, badges);
              setStats(rpgStats);
            }
          } else {
            // Handle sync cooldown gracefully
            if (syncResponse.status === 429) {
              console.log('Sync on cooldown:', syncResult.message || 'Please wait before syncing again');
              console.log('Wait time:', syncResult.waitTime, 'seconds');
              throw new Error(syncResult.message || 'Sync on cooldown');
            }
            
            console.error('Sync failed with status:', syncResponse.status);
            console.error('Sync error details:', JSON.stringify(syncResult, null, 2));
            console.error('Error message:', syncResult.error);
            console.error('Error details:', syncResult.details);
            throw new Error(syncResult.error || 'Failed to create user');
          }
        } catch (syncError) {
          console.error('Error during initial sync:', syncError);
          throw syncError;
        }
      } else if (error) {
        console.error('Supabase error:', error.message || error);
        console.error('Error details:', { code: error.code, details: error.details, hint: error.hint });
        throw error;
      }

      if (!data) {
        throw new Error('No user data returned');
      }

      setUser(data);

      // Load equipped badges first
      const loadedBadges = await loadEquippedBadges(data.id);

      // Calculate current RPG stats for display (if not already set from sync)
      // Use the actual GitHub username we fetched
      if (!stats && (actualUsername || data.username)) {
        const ghStats = await calculateGitHubStats(actualUsername || data.username, accessToken);
        const rpgStats = calculateRPGStats(ghStats, loadedBadges); // Pass badges for stat boosts
        setStats(rpgStats);
        setGithubStats(ghStats); // Store raw GitHub stats

        // Fetch GitHub achievements
        const achievements = await fetchGitHubAchievements(actualUsername || data.username, accessToken);
        setGithubAchievements(achievements);
      }

      // Load active quest
      await loadActiveQuest(data.id);
    } catch (error) {
      console.error('Error loading user:', error instanceof Error ? error.message : String(error));
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }
      console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    } finally {
      setLoading(false);
    }
  }

  async function loadActiveQuest(userId: string) {
    try {
      // Fetch all active quests
      const { data: quests } = await supabase
        .from('quests')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (!quests || quests.length === 0) return;

      // Fetch user's quest progress
      const { data: userQuests } = await supabase
        .from('user_quests')
        .select('*')
        .eq('user_id', userId);

      // Find first incomplete quest
      const incompleteQuest = quests.find(quest => {
        const userQuest = userQuests?.find(uq => uq.quest_id === quest.id);
        return !userQuest || userQuest.status !== 'completed' || !userQuest.claimed_at;
      });

      if (incompleteQuest) {
        setActiveQuest(incompleteQuest);
        const userQuest = userQuests?.find(uq => uq.quest_id === incompleteQuest.id);
        setActiveUserQuest(userQuest || null);
      }
    } catch (error) {
      console.error('Error loading active quest:', error);
    }
  }

  async function loadEquippedBadges(userId: string): Promise<Badge[]> {
    try {
      // Fetch user's equipped badges
      const { data: userBadges, error: userBadgesError } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', userId)
        .eq('equipped', true);

      if (userBadgesError || !userBadges || userBadges.length === 0) {
        setEquippedBadges([]);
        return [];
      }

      // Fetch the actual badge data
      const badgeIds = userBadges.map(ub => ub.badge_id);
      const { data: badges, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .in('id', badgeIds);

      if (badgesError || !badges) {
        setEquippedBadges([]);
        return [];
      }

      setEquippedBadges(badges);
      return badges;
    } catch (error) {
      console.error('Error loading equipped badges:', error);
      setEquippedBadges([]);
      return [];
    }
  }

  async function handleBadgeUnequip(badgeId: string) {
    try {
      soundManager.click();

      const response = await fetch('/api/badges/unequip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeId }),
      });

      if (response.ok && user) {
        // Reload equipped badges
        const updatedBadges = await loadEquippedBadges(user.id);

        // Recalculate stats with updated badges
        if (githubStats) {
          const rpgStats = calculateRPGStats(githubStats, updatedBadges);
          setStats(rpgStats);
        }

        soundManager.click();
      } else {
        soundManager.error();
      }
    } catch (error) {
      console.error('Error unequipping badge:', error);
      soundManager.error();
    }
  }

  async function handleSync() {
    try {
      setSyncing(true);
      setSyncMessage('');
      soundManager.syncStart();

      const response = await fetch('/api/sync', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.status === 429) {
        setSyncMessage(`⏰ Cooldown: Wait ${result.waitTime}s`);
        soundManager.error();
        return;
      }

      if (!response.ok) {
        setSyncMessage(`❌ ${result.error}`);
        soundManager.error();
        return;
      }

      if (result.rankedUp) {
        setSyncMessage(`🎉 RANK UP! +${result.gainedXP} XP!`);
        soundManager.rankUp();
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        setSyncMessage(`✅ Synced! +${result.gainedXP} XP`);
        soundManager.syncComplete();
        if (result.gainedXP > 0) {
          setXPAmount(result.gainedXP);
          setShowXP(true);
          soundManager.xpGain();
        }
      }

      // Update GitHub stats from sync result
      if (result.stats) {
        setGithubStats(result.stats);
      }

      // Reload user data
      await loadUserData();
    } catch (error) {
      setSyncMessage('❌ Sync failed');
      soundManager.error();
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
      {/* Floating XP Animation */}
      {showXP && <FloatingXP amount={xpAmount} onComplete={() => setShowXP(false)} />}
      
      {/* Confetti Effect */}
      <Confetti trigger={showConfetti} />

      {/* Top Action Bar - Desktop */}
      <div className="fixed top-0 left-0 right-0 bg-midnight-void-1 border-b-3 border-gray-pixel-0 z-50 pixel-perfect">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <h1 className="font-pixel text-xs md:text-sm text-loot-gold">CODE WARRIOR</h1>
          
          {/* Mobile Menu Button - Treasure Chest Icon */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            onMouseEnter={() => soundManager.hover()}
            className="lg:hidden p-2 text-loot-gold text-2xl"
          >
            {mobileMenuOpen ? '✕' : '📦'}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4">
            {syncMessage && (
              <motion.span
                className="font-mono text-sm text-mana-blue"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {syncMessage}
              </motion.span>
            )}
            
            <Link href="/quests">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ y: 1 }}
                onMouseEnter={() => soundManager.hover()}
                className="flex items-center gap-2 px-4 py-2 text-midnight-void-0 font-pixel text-xs border-4 rounded-pixel-sm pixel-perfect no-smooth"
                style={get3DButtonStyle('blue')}
              >
                <PixelScroll className="text-midnight-void-0" size="md" />
                QUESTS
              </motion.button>
            </Link>

            <Link href="/leaderboard">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ y: 1 }}
                onMouseEnter={() => soundManager.hover()}
                className="flex items-center gap-2 px-4 py-2 text-midnight-void-0 font-pixel text-xs border-4 rounded-pixel-sm pixel-perfect no-smooth"
                style={get3DButtonStyle('gold')}
              >
                <PixelTrophy className="text-midnight-void-0" size="md" />
                HALL OF FAME
              </motion.button>
            </Link>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ y: syncing ? 0 : 1 }}
              onClick={handleSync}
              onMouseEnter={() => soundManager.hover()}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 text-midnight-void-0 font-pixel text-xs border-4 rounded-pixel-sm pixel-perfect no-smooth disabled:opacity-50 disabled:cursor-not-allowed"
              style={get3DButtonStyle('gold')}
            >
              <PixelRefresh className={`text-midnight-void-0 ${syncing ? 'animate-spin' : ''}`} size="md" />
              {syncing ? 'SYNCING...' : 'SYNC STATS'}
            </motion.button>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ y: 1 }}
              onClick={() => {
                soundManager.click();
                signOut({ callbackUrl: '/' });
              }}
              onMouseEnter={() => soundManager.hover()}
              className="flex items-center gap-2 px-4 py-2 bg-midnight-void-2 border-3 border-gray-pixel-1 text-gray-300 font-pixel text-xs rounded-pixel-sm pixel-perfect no-smooth hover:border-critical-red-1 hover:text-critical-red-1 transition-colors"
            >
              <PixelLogout className="text-gray-300 hover:text-critical-red-1" size="md" />
              LOGOUT
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t-2 border-gray-pixel-0 bg-midnight-void-1 overflow-hidden"
            >
              <div className="p-4 space-y-2">
                {syncMessage && (
                  <div className="font-mono text-sm text-mana-blue mb-2">
                    {syncMessage}
                  </div>
                )}

                <Link href="/quests" onClick={() => setMobileMenuOpen(false)}>
                  <button
                    className="w-full flex items-center gap-2 px-4 py-3 text-midnight-void-0 font-pixel text-xs border-4 rounded-pixel-sm pixel-perfect no-smooth"
                    style={get3DButtonStyle('blue')}
                  >
                    <PixelScroll className="text-midnight-void-0" size="md" />
                    QUESTS
                  </button>
                </Link>

                <Link href="/leaderboard" onClick={() => setMobileMenuOpen(false)}>
                  <button
                    className="w-full flex items-center gap-2 px-4 py-3 text-midnight-void-0 font-pixel text-xs border-4 rounded-pixel-sm pixel-perfect no-smooth"
                    style={get3DButtonStyle('gold')}
                  >
                    <PixelTrophy className="text-midnight-void-0" size="md" />
                    HALL OF FAME
                  </button>
                </Link>

                <button
                  onClick={() => {
                    handleSync();
                    setMobileMenuOpen(false);
                  }}
                  disabled={syncing}
                  className="w-full flex items-center gap-2 px-4 py-3 text-midnight-void-0 font-pixel text-xs border-4 rounded-pixel-sm pixel-perfect no-smooth disabled:opacity-50"
                  style={get3DButtonStyle('gold')}
                >
                  <PixelRefresh className={`text-midnight-void-0 ${syncing ? 'animate-spin' : ''}`} size="md" />
                  {syncing ? 'SYNCING...' : 'SYNC STATS'}
                </button>

                <button
                  onClick={() => {
                    soundManager.click();
                    signOut({ callbackUrl: '/' });
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-midnight-void-2 border-3 border-gray-pixel-1 text-gray-300 font-pixel text-xs rounded-pixel-sm pixel-perfect no-smooth"
                >
                  <PixelLogout className="text-gray-300" size="md" />
                  LOGOUT
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <div className="pt-20">
        <CharacterSheet
          user={user}
          stats={stats}
          githubStats={githubStats || undefined}
          githubAchievements={githubAchievements}
          activeQuest={activeQuest || undefined}
          activeUserQuest={activeUserQuest || undefined}
          equippedBadges={equippedBadges}
          onBadgeUnequip={handleBadgeUnequip}
        />
      </div>
    </div>
  );
}
