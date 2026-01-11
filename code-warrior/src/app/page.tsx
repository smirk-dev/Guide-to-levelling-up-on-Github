'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PixelSword, PixelStar, PixelZap, PixelGithub } from '@/components/icons/PixelIcon';
import { soundManager } from '@/lib/sound';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [poweringUp, setPoweringUp] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const handleSignIn = () => {
    setPoweringUp(true);
    soundManager.syncStart();
    setTimeout(() => {
      signIn('github', { callbackUrl: '/dashboard' });
    }, 1000);
  };

  if (status === 'loading' || poweringUp) {
    return (
      <div className="min-h-screen bg-midnight-void flex items-center justify-center relative overflow-hidden">
        {/* CRT Power-Up Effect */}
        <motion.div
          className="absolute inset-0 bg-loot-gold/10"
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ 
            scaleY: [0, 1, 1],
            opacity: [0, 0.5, 0],
          }}
          transition={{ 
            duration: 1.5,
            times: [0, 0.5, 1],
          }}
          style={{ transformOrigin: 'center' }}
        />
        
        {/* Scanlines */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.7] }}
          transition={{ duration: 1 }}
        />

        <motion.div
          className="font-pixel text-loot-gold text-xl z-10"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          {poweringUp ? 'POWERING UP...' : 'LOADING...'}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-void text-white flex items-center justify-center p-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-loot-gold/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-mana-blue/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Title with pixel art style */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-pixel text-4xl md:text-6xl text-loot-gold mb-4 drop-shadow-lg">
            CODE WARRIOR
          </h1>
          <p className="font-pixel text-sm md:text-base text-mana-blue mb-8">
            TRANSFORM YOUR GITHUB INTO AN RPG
          </p>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <motion.div 
            className="relative bg-midnight-void-2 border-4 border-critical-red-1 p-8 pixel-perfect"
            style={{
              borderColor: 'var(--critical-red-1) var(--critical-red-0) var(--critical-red-0) var(--critical-red-1)',
              boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.3), 3px 3px 0 rgba(0,0,0,0.5)'
            }}
          >
            <div className="absolute top-2 left-2 w-2 h-2 bg-critical-red-1" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-critical-red-1" />
            <div className="absolute bottom-2 left-2 w-2 h-2 bg-critical-red-1" />
            <div className="absolute bottom-2 right-2 w-2 h-2 bg-critical-red-1" />
            
            <PixelSword className="w-12 h-12 text-critical-red-1 mx-auto mb-4" />
            <h3 className="font-pixel text-xs text-loot-gold mb-2">LEVEL UP</h3>
            <p className="font-mono text-sm text-gray-400">
              Turn commits into XP and PRs into powerful attacks
            </p>
          </motion.div>

          <motion.div 
            className="relative bg-midnight-void-2 border-4 border-loot-gold-2 p-8 pixel-perfect"
            style={{
              borderColor: 'var(--loot-gold-4) var(--loot-gold-0) var(--loot-gold-0) var(--loot-gold-4)',
              boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.3), 3px 3px 0 rgba(0,0,0,0.5)'
            }}
          >
            <div className="absolute top-2 left-2 w-2 h-2 bg-loot-gold-2" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-loot-gold-2" />
            <div className="absolute bottom-2 left-2 w-2 h-2 bg-loot-gold-2" />
            <div className="absolute bottom-2 right-2 w-2 h-2 bg-loot-gold-2" />
            
            <PixelStar className="w-12 h-12 text-loot-gold-2 mx-auto mb-4" />
            <h3 className="font-pixel text-xs text-loot-gold mb-2">EARN RANKS</h3>
            <p className="font-mono text-sm text-gray-400">
              Progress from Novice to Legendary Code Warrior
            </p>
          </motion.div>

          <motion.div 
            className="relative bg-midnight-void-2 border-4 border-mana-blue-2 p-8 pixel-perfect"
            style={{
              borderColor: 'var(--mana-blue-3) var(--mana-blue-0) var(--mana-blue-0) var(--mana-blue-3)',
              boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.3), 3px 3px 0 rgba(0,0,0,0.5)'
            }}
          >
            <div className="absolute top-2 left-2 w-2 h-2 bg-mana-blue-2" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-mana-blue-2" />
            <div className="absolute bottom-2 left-2 w-2 h-2 bg-mana-blue-2" />
            <div className="absolute bottom-2 right-2 w-2 h-2 bg-mana-blue-2" />
            
            <PixelZap className="w-12 h-12 text-mana-blue-2 mx-auto mb-4" />
            <h3 className="font-pixel text-xs text-loot-gold mb-2">COMPETE</h3>
            <p className="font-mono text-sm text-gray-400">
              Track your stats and compete on the leaderboard
            </p>
          </motion.div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
        >
          <motion.button
            onClick={handleSignIn}
            onMouseEnter={() => soundManager.hover()}
            whileHover={{ y: -2 }}
            whileTap={{ y: 2 }}
            className="flex items-center gap-3 px-8 py-4 text-midnight-void-0 font-pixel text-sm border-4 rounded-pixel-sm pixel-perfect no-smooth"
            style={{
              borderColor: 'var(--loot-gold-4) var(--loot-gold-0) var(--loot-gold-0) var(--loot-gold-4)',
              backgroundColor: 'var(--loot-gold-2)',
              boxShadow: 'inset -4px -4px 0 rgba(0, 0, 0, 0.2), 4px 4px 0 rgba(0, 0, 0, 0.5)',
            }}
          >
            <PixelGithub className="w-6 h-6 text-midnight-void-0" />
            START YOUR QUEST
          </motion.button>
          
          <p className="font-mono text-xs text-gray-500 mt-4">
            Sign in with GitHub to begin your journey
          </p>
        </motion.div>

        {/* Footer info */}
        <motion.div
          className="mt-16 pt-8 border-t-4 border-gray-pixel-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="font-mono text-xs text-gray-600">
            Built with Next.js • Powered by GitHub API • Stored in Supabase
          </p>
        </motion.div>
      </div>
    </div>
  );
}

