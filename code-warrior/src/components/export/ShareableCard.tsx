'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelFrame, PixelButton, PixelBadge, PixelAvatar } from '../ui/PixelComponents';
import { IconShare, IconDownload, IconClose, IconXP, IconRank, IconTrophy, IconSword } from '../icons/PixelIcons';
import { getRankDisplayName } from '@/lib/game-logic';
import type { User, RankTier, RPGStats } from '@/types/database';

interface ShareableCardProps {
  user: User;
  stats: RPGStats;
  rank: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareableCard: React.FC<ShareableCardProps> = ({
  user,
  stats,
  rank,
  isOpen,
  onClose,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const level = Math.floor(user.xp / 1000) + 1;
  const powerLevel = Math.round((stats.health + stats.mana + stats.strength + stats.charisma + stats.wisdom) / 5);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);

    try {
      // Use html2canvas if available, otherwise show fallback
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0a0a0f',
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement('a');
      link.download = `${user.username}-code-warrior-card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to generate image:', error);
      // Fallback: copy stats to clipboard
      handleCopyStats();
    }

    setIsGenerating(false);
  };

  const handleCopyStats = () => {
    const statsText = `🗡️ Code Warrior Stats - ${user.username}
━━━━━━━━━━━━━━━━━━━━━━
⭐ XP: ${user.xp.toLocaleString()}
🏆 Rank: ${user.rank_tier} - ${getRankDisplayName(user.rank_tier)}
📊 Level: ${level}
💪 Power Level: ${powerLevel}

Battle Stats:
❤️ HP: ${stats.health}
💧 MP: ${stats.mana}
⚔️ STR: ${stats.strength}
✨ CHA: ${stats.charisma}
📚 WIS: ${stats.wisdom}

🎮 Level up your GitHub game at code-warrior.dev`;

    navigator.clipboard.writeText(statsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: `${user.username}'s Code Warrior Stats`,
      text: `Check out my Code Warrior stats! ${user.xp.toLocaleString()} XP | ${user.rank_tier} Rank | Level ${level}`,
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        handleCopyStats();
      }
    } else {
      handleCopyStats();
    }
  };

  if (!isOpen) return null;

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
        <div className="absolute inset-0 bg-black/90" />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative z-10 w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <PixelFrame variant="gold" padding="lg">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:opacity-70 transition-opacity"
              aria-label="Close share dialog"
            >
              <IconClose size={16} color="var(--gray-medium)" />
            </button>

            <h2 className="font-pixel text-[14px] text-[var(--gold-light)] text-center mb-6">
              SHARE YOUR STATS
            </h2>

            {/* Preview Card */}
            <div
              ref={cardRef}
              className="bg-[var(--void-darkest)] p-6 border-4 border-[var(--gold-dark)] mb-6"
            >
              {/* Header */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b-4 border-dashed border-[var(--gray-dark)]">
                <div className="w-16 h-16">
                  <PixelAvatar src={user.avatar_url} alt={user.username} size="lg" glow />
                </div>
                <div className="flex-1">
                  <h3 className="font-pixel text-[14px] text-white mb-1">
                    {user.username}
                  </h3>
                  <p className="font-pixel text-[10px] text-[var(--xp-light)]">
                    {getRankDisplayName(user.rank_tier)}
                  </p>
                  <PixelBadge variant="gold" size="sm" className="mt-2">
                    {user.rank_tier} RANK
                  </PixelBadge>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <IconXP size={14} color="#ffd700" />
                  </div>
                  <p className="font-pixel-heading text-[16px] text-[var(--gold-light)]">
                    {user.xp.toLocaleString()}
                  </p>
                  <p className="font-pixel text-[7px] text-[var(--gray-medium)]">XP</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <IconRank size={14} color="#ffd700" />
                  </div>
                  <p className="font-pixel-heading text-[16px] text-[var(--mana-light)]">
                    {level}
                  </p>
                  <p className="font-pixel text-[7px] text-[var(--gray-medium)]">LEVEL</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <IconSword size={14} color="#ffd700" />
                  </div>
                  <p className="font-pixel-heading text-[16px] text-[var(--health-light)]">
                    {powerLevel}
                  </p>
                  <p className="font-pixel text-[7px] text-[var(--gray-medium)]">POWER</p>
                </div>
              </div>

              {/* Battle Stats */}
              <div className="bg-[var(--void-darker)] p-3 border-2 border-[var(--gray-dark)]">
                <p className="font-pixel text-[8px] text-[var(--gray-highlight)] text-center mb-3">
                  BATTLE STATS
                </p>
                <div className="flex justify-between">
                  {[
                    { label: 'HP', value: stats.health, color: 'var(--health-light)' },
                    { label: 'MP', value: stats.mana, color: 'var(--mana-light)' },
                    { label: 'STR', value: stats.strength, color: 'var(--critical-light)' },
                    { label: 'CHA', value: stats.charisma, color: 'var(--gold-light)' },
                    { label: 'WIS', value: stats.wisdom, color: 'var(--xp-light)' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="font-pixel text-[10px]" style={{ color: stat.color }}>
                        {stat.value}
                      </p>
                      <p className="font-pixel text-[6px] text-[var(--gray-medium)]">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t-2 border-dashed border-[var(--gray-dark)] text-center">
                <p className="font-pixel text-[7px] text-[var(--gray-medium)]">
                  code-warrior.dev
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <PixelButton
                variant="mana"
                size="sm"
                onClick={handleDownload}
                loading={isGenerating}
              >
                <span className="flex items-center gap-2">
                  <IconDownload size={14} color="white" />
                  DOWNLOAD
                </span>
              </PixelButton>

              <PixelButton
                variant="gold"
                size="sm"
                onClick={handleShare}
              >
                <span className="flex items-center gap-2">
                  <IconShare size={14} color="var(--void-darkest)" />
                  {copied ? 'COPIED!' : 'SHARE'}
                </span>
              </PixelButton>
            </div>

            <p className="font-pixel text-[7px] text-[var(--gray-medium)] text-center mt-4">
              Share your warrior stats on social media!
            </p>
          </PixelFrame>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Button to trigger the share modal
export const ShareStatsButton: React.FC<{
  onClick: () => void;
  className?: string;
}> = ({ onClick, className = '' }) => {
  return (
    <PixelButton
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={className}
    >
      <span className="flex items-center gap-2">
        <IconShare size={14} color="var(--mana-light)" />
        SHARE
      </span>
    </PixelButton>
  );
};
