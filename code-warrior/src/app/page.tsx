'use client';

import React from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  PixelFrame,
  PixelButton,
  PixelBadge,
  IconSword,
  IconGitHub,
  IconXP,
  IconScroll,
  IconBadge,
  IconLeaderboard,
  IconHeart,
  IconMana,
  IconStar,
  IconCommit,
  IconPullRequest,
  IconRank,
} from '@/components';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  React.useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  const features = [
    {
      icon: <IconXP size={32} color="#ffd700" />,
      title: 'EARN XP',
      description: 'Every commit, PR, and review earns you experience points',
    },
    {
      icon: <IconScroll size={32} color="#b8960f" />,
      title: 'COMPLETE QUESTS',
      description: 'Take on challenges to boost your stats and rewards',
    },
    {
      icon: <IconBadge size={32} color="#a371f7" />,
      title: 'COLLECT BADGES',
      description: 'Unlock and equip badges for powerful stat boosts',
    },
    {
      icon: <IconLeaderboard size={32} color="#ffd700" />,
      title: 'CLIMB RANKS',
      description: 'Compete on the leaderboard from C to legendary SSS rank',
    },
  ];

  const stats = [
    { icon: <IconHeart size={24} color="#da3633" />, label: 'HEALTH', source: 'Commits' },
    { icon: <IconMana size={24} color="#58a6ff" />, label: 'MANA', source: 'Reviews' },
    { icon: <IconSword size={24} color="#da3633" />, label: 'STRENGTH', source: 'PRs' },
    { icon: <IconStar size={24} color="#ffd700" />, label: 'CHARISMA', source: 'Stars' },
  ];

  const handleSignIn = () => {
    signIn('github', { callbackUrl: '/dashboard' });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[var(--void-darkest)] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <IconStar size={48} color="#ffd700" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-starfield overflow-hidden">
      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)] z-50" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        {/* Floating pixel decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-[var(--gold-light)] opacity-30"
              initial={{
                x: Math.random() * 100 + '%',
                y: Math.random() * 100 + '%',
              }}
              animate={{
                y: ['-10%', '110%'],
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 10, delay: 0.2 }}
            className="mb-8"
          >
            <IconSword size={96} color="#ffd700" className="mx-auto mb-4" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="font-pixel-heading text-[24px] md:text-[40px] text-[var(--gold-light)] mb-4"
          >
            CODE WARRIOR
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="font-pixel text-[12px] md:text-[14px] text-[var(--gray-highlight)] mb-8 leading-relaxed"
          >
            TRANSFORM YOUR GITHUB CONTRIBUTIONS<br />
            INTO AN EPIC RPG ADVENTURE
          </motion.p>

          {/* Rank badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            {['C', 'B', 'A', 'AA', 'AAA', 'S', 'SS', 'SSS'].map((rank, i) => (
              <motion.div
                key={rank}
                whileHover={{ scale: 1.1, y: -4 }}
                transition={{ type: 'spring', damping: 10 }}
              >
                <PixelBadge
                  variant={
                    rank === 'SSS'
                      ? 'gold'
                      : rank === 'SS' || rank === 'S'
                      ? 'purple'
                      : 'gray'
                  }
                  size="md"
                >
                  {rank}
                </PixelBadge>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10, delay: 1 }}
          >
            <button
              onClick={handleSignIn}
              className="btn-pixel btn-gold text-[12px] md:text-[14px] px-8 py-4 inline-flex items-center gap-4"
            >
              <IconGitHub size={24} color="#0a0a0f" />
              SIGN IN WITH GITHUB
            </button>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ opacity: { delay: 1.5 }, y: { duration: 1, repeat: Infinity } }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <span className="font-pixel text-[8px] text-[var(--gray-medium)]">
              SCROLL DOWN
            </span>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-[var(--void-darker)]">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-pixel-heading text-[16px] md:text-[20px] text-[var(--gold-light)] text-center mb-12"
          >
            YOUR CODING JOURNEY AWAITS
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <PixelFrame variant="stone" padding="lg" className="h-full">
                  <div className="text-center">
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="font-pixel text-[12px] text-[var(--gold-light)] mb-2">
                      {feature.title}
                    </h3>
                    <p className="font-pixel text-[8px] text-[var(--gray-highlight)] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </PixelFrame>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-tech-grid">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-pixel-heading text-[16px] md:text-[20px] text-[var(--mana-light)] text-center mb-4"
          >
            RPG STATS SYSTEM
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-pixel text-[10px] text-[var(--gray-highlight)] text-center mb-12"
          >
            YOUR GITHUB ACTIVITY SHAPES YOUR CHARACTER
          </motion.p>

          <PixelFrame variant="mana" padding="lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="mb-2">{stat.icon}</div>
                  <h3 className="font-pixel text-[10px] text-white mb-1">
                    {stat.label}
                  </h3>
                  <p className="font-pixel text-[7px] text-[var(--gray-medium)]">
                    from {stat.source}
                  </p>
                </motion.div>
              ))}
            </div>
          </PixelFrame>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 px-4 bg-[var(--void-dark)]">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-pixel-heading text-[16px] md:text-[20px] text-[var(--gold-light)] text-center mb-12"
          >
            HOW IT WORKS
          </motion.h2>

          <div className="space-y-6">
            {[
              { num: '01', title: 'CONNECT GITHUB', desc: 'Sign in with your GitHub account to link your activity' },
              { num: '02', title: 'SYNC STATS', desc: 'We analyze your commits, PRs, reviews, and stars' },
              { num: '03', title: 'EARN XP', desc: 'Every contribution earns experience points and stats' },
              { num: '04', title: 'LEVEL UP', desc: 'Complete quests and climb from C rank to legendary SSS' },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <PixelFrame variant="stone" padding="md">
                  <div className="flex items-center gap-6">
                    <div className="font-pixel-heading text-[24px] text-[var(--gold-dark)]">
                      {step.num}
                    </div>
                    <div>
                      <h3 className="font-pixel text-[12px] text-[var(--gold-light)] mb-1">
                        {step.title}
                      </h3>
                      <p className="font-pixel text-[8px] text-[var(--gray-highlight)]">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </PixelFrame>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-[var(--void-darkest)]">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
          >
            <PixelFrame variant="gold" padding="lg">
              <IconRank size={48} color="#ffd700" className="mx-auto mb-6" />
              <h2 className="font-pixel-heading text-[14px] md:text-[18px] text-[var(--gold-light)] mb-4">
                BEGIN YOUR QUEST
              </h2>
              <p className="font-pixel text-[10px] text-[var(--gray-highlight)] mb-8">
                Join thousands of developers leveling up their coding journey
              </p>
              <button
                onClick={handleSignIn}
                className="btn-pixel btn-gold text-[12px] px-8 py-4 inline-flex items-center gap-4"
              >
                <IconGitHub size={20} color="#0a0a0f" />
                START YOUR ADVENTURE
              </button>
            </PixelFrame>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-[var(--void-darkest)] border-t-4 border-[var(--gray-dark)]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-pixel text-[8px] text-[var(--gray-medium)]">
            BUILT WITH ♥ FOR GITHUB WARRIORS
          </p>
          <p className="font-pixel text-[6px] text-[var(--gray-dark)] mt-2">
            © 2024 CODE WARRIOR. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </div>
  );
}

