'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelFrame, PixelButton, PixelBadge, PixelAvatar } from '../ui/PixelComponents';
import { IconClose, IconCheck, IconStar, IconRank } from '../icons/PixelIcons';
import type { RankTier } from '@/types/database';

// Avatar border styles
export const AVATAR_BORDERS = {
  none: { name: 'None', color: 'transparent', unlockRank: 'C' as RankTier },
  gold: { name: 'Gold', color: '#ffd700', unlockRank: 'B' as RankTier },
  mana: { name: 'Mana', color: '#58a6ff', unlockRank: 'A' as RankTier },
  fire: { name: 'Fire', color: '#f85149', unlockRank: 'AA' as RankTier },
  purple: { name: 'Royal', color: '#a371f7', unlockRank: 'AAA' as RankTier },
  rainbow: { name: 'Rainbow', color: 'linear-gradient(45deg, #ff0000, #ffa500, #ffff00, #00ff00, #0000ff, #9400d3)', unlockRank: 'S' as RankTier },
  legendary: { name: 'Legendary', color: '#ffd700', animated: true, unlockRank: 'SSS' as RankTier },
} as const;

// Custom titles that can be unlocked
export const CUSTOM_TITLES = {
  default: { name: 'Use Rank Title', unlockRank: 'C' as RankTier },
  codeNinja: { name: 'Code Ninja', unlockRank: 'B' as RankTier },
  bugHunter: { name: 'Bug Hunter', unlockRank: 'A' as RankTier },
  prMachine: { name: 'PR Machine', unlockRank: 'AA' as RankTier },
  opensourceHero: { name: 'Open Source Hero', unlockRank: 'AAA' as RankTier },
  techWizard: { name: 'Tech Wizard', unlockRank: 'S' as RankTier },
  codeGod: { name: 'Code God', unlockRank: 'SS' as RankTier },
  legendaryWarrior: { name: 'Legendary Warrior', unlockRank: 'SSS' as RankTier },
} as const;

const RANK_ORDER: RankTier[] = ['C', 'B', 'A', 'AA', 'AAA', 'S', 'SS', 'SSS'];

const isUnlocked = (requiredRank: RankTier, currentRank: RankTier): boolean => {
  const requiredIndex = RANK_ORDER.indexOf(requiredRank);
  const currentIndex = RANK_ORDER.indexOf(currentRank);
  return currentIndex >= requiredIndex;
};

interface ProfileCustomizationProps {
  isOpen: boolean;
  onClose: () => void;
  currentRank: RankTier;
  username: string;
  avatarUrl: string;
  currentBorder: keyof typeof AVATAR_BORDERS;
  currentTitle: keyof typeof CUSTOM_TITLES;
  onSave: (border: keyof typeof AVATAR_BORDERS, title: keyof typeof CUSTOM_TITLES) => void;
}

export const ProfileCustomization: React.FC<ProfileCustomizationProps> = ({
  isOpen,
  onClose,
  currentRank,
  username,
  avatarUrl,
  currentBorder,
  currentTitle,
  onSave,
}) => {
  const [selectedBorder, setSelectedBorder] = useState<keyof typeof AVATAR_BORDERS>(currentBorder);
  const [selectedTitle, setSelectedTitle] = useState<keyof typeof CUSTOM_TITLES>(currentTitle);

  const handleSave = () => {
    onSave(selectedBorder, selectedTitle);
    onClose();
  };

  if (!isOpen) return null;

  const borderConfig = AVATAR_BORDERS[selectedBorder];
  const isAnimated = 'animated' in borderConfig && borderConfig.animated;

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
          className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <PixelFrame variant="gold" padding="lg">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:opacity-70"
            >
              <IconClose size={16} color="var(--gray-medium)" />
            </button>

            <h2 className="font-pixel text-[16px] text-[var(--gold-light)] text-center mb-6">
              CUSTOMIZE PROFILE
            </h2>

            {/* Preview Section */}
            <div className="mb-8 text-center">
              <h3 className="font-pixel text-[10px] text-[var(--gray-highlight)] mb-4">
                PREVIEW
              </h3>
              <div className="flex flex-col items-center">
                {/* Avatar with selected border */}
                <div
                  className={`p-1 ${isAnimated ? 'animate-pulse' : ''}`}
                  style={{
                    background: borderConfig.color,
                    borderRadius: '50%',
                  }}
                >
                  <div className="w-20 h-20">
                    <PixelAvatar src={avatarUrl} alt={username} size="xl" />
                  </div>
                </div>
                <p className="font-pixel text-[12px] text-white mt-3">{username}</p>
                <p className="font-pixel text-[9px] text-[var(--xp-light)] mt-1">
                  {selectedTitle === 'default'
                    ? CUSTOM_TITLES.default.name
                    : CUSTOM_TITLES[selectedTitle].name}
                </p>
              </div>
            </div>

            {/* Avatar Borders Section */}
            <div className="mb-8">
              <h3 className="font-pixel text-[10px] text-[var(--gray-highlight)] mb-4">
                AVATAR BORDER
              </h3>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                {(Object.entries(AVATAR_BORDERS) as [keyof typeof AVATAR_BORDERS, typeof AVATAR_BORDERS[keyof typeof AVATAR_BORDERS]][]).map(
                  ([key, border]) => {
                    const unlocked = isUnlocked(border.unlockRank, currentRank);
                    const isSelected = selectedBorder === key;

                    return (
                      <button
                        key={key}
                        onClick={() => unlocked && setSelectedBorder(key)}
                        disabled={!unlocked}
                        className={`p-2 border-2 transition-all ${
                          isSelected
                            ? 'border-[var(--gold-light)] bg-[var(--gold-dark)]/20'
                            : unlocked
                            ? 'border-[var(--gray-dark)] hover:border-[var(--gray-medium)]'
                            : 'border-[var(--gray-dark)] opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div
                          className="w-8 h-8 mx-auto mb-2 rounded-full"
                          style={{
                            background: key === 'none' ? 'var(--gray-dark)' : border.color,
                          }}
                        />
                        <p className="font-pixel text-[7px] text-[var(--gray-highlight)]">
                          {border.name}
                        </p>
                        {!unlocked && (
                          <p className="font-pixel text-[6px] text-[var(--gray-medium)]">
                            {border.unlockRank}+
                          </p>
                        )}
                        {isSelected && (
                          <IconCheck size={12} color="var(--health-light)" className="mx-auto mt-1" />
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Custom Titles Section */}
            <div className="mb-8">
              <h3 className="font-pixel text-[10px] text-[var(--gray-highlight)] mb-4">
                CUSTOM TITLE
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(Object.entries(CUSTOM_TITLES) as [keyof typeof CUSTOM_TITLES, typeof CUSTOM_TITLES[keyof typeof CUSTOM_TITLES]][]).map(
                  ([key, title]) => {
                    const unlocked = isUnlocked(title.unlockRank, currentRank);
                    const isSelected = selectedTitle === key;

                    return (
                      <button
                        key={key}
                        onClick={() => unlocked && setSelectedTitle(key)}
                        disabled={!unlocked}
                        className={`p-3 border-2 transition-all ${
                          isSelected
                            ? 'border-[var(--gold-light)] bg-[var(--gold-dark)]/20'
                            : unlocked
                            ? 'border-[var(--gray-dark)] hover:border-[var(--gray-medium)]'
                            : 'border-[var(--gray-dark)] opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <p className="font-pixel text-[8px] text-white mb-1">{title.name}</p>
                        {!unlocked && (
                          <p className="font-pixel text-[6px] text-[var(--gray-medium)]">
                            Unlock at {title.unlockRank}
                          </p>
                        )}
                        {isSelected && (
                          <IconCheck size={10} color="var(--health-light)" className="mx-auto mt-1" />
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Info */}
            <div className="mb-6 text-center">
              <p className="font-pixel text-[8px] text-[var(--gray-medium)]">
                Higher ranks unlock more customization options!
              </p>
              <p className="font-pixel text-[7px] text-[var(--mana-light)] mt-1">
                Your current rank: {currentRank}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <PixelButton variant="ghost" size="sm" onClick={onClose}>
                CANCEL
              </PixelButton>
              <PixelButton variant="gold" size="sm" onClick={handleSave}>
                SAVE CHANGES
              </PixelButton>
            </div>
          </PixelFrame>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Hook for managing profile customization state
export const useProfileCustomization = () => {
  const [isOpen, setIsOpen] = useState(false);

  const loadCustomization = () => {
    const saved = localStorage.getItem('profile_customization');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { border: 'none', title: 'default' };
      }
    }
    return { border: 'none', title: 'default' };
  };

  const saveCustomization = (
    border: keyof typeof AVATAR_BORDERS,
    title: keyof typeof CUSTOM_TITLES
  ) => {
    localStorage.setItem('profile_customization', JSON.stringify({ border, title }));
  };

  return {
    isOpen,
    openCustomization: () => setIsOpen(true),
    closeCustomization: () => setIsOpen(false),
    loadCustomization,
    saveCustomization,
  };
};
