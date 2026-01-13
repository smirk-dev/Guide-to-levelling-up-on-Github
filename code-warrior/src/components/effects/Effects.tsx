'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconXP, IconStar, IconCheck, IconChest } from '../icons/PixelIcons';
import { soundManager } from '@/lib/sound';

interface FloatingXPProps {
  amount: number;
  x?: number;
  y?: number;
  onComplete?: () => void;
}

export const FloatingXP: React.FC<FloatingXPProps> = ({
  amount,
  x = 50,
  y = 50,
  onComplete,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1, y: 0, scale: 1 }}
          animate={{ opacity: 0, y: -40, scale: 1.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="fixed pointer-events-none z-50 flex items-center gap-2"
          style={{ left: `${x}%`, top: `${y}%` }}
        >
          <IconXP size={20} color="#ffd700" />
          <span className="font-pixel-heading text-[16px] text-[var(--gold-light)] text-outline-dark">
            +{amount} XP
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface ConfettiPieceProps {
  delay: number;
  color: string;
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({ delay, color }) => {
  const randomX = Math.random() * 100;
  const randomRotation = Math.random() * 360;

  return (
    <motion.div
      initial={{ y: -20, x: `${randomX}vw`, opacity: 1, rotate: 0 }}
      animate={{
        y: '100vh',
        opacity: 0,
        rotate: randomRotation,
      }}
      transition={{
        duration: 2 + Math.random() * 2,
        delay,
        ease: 'easeOut',
      }}
      className="fixed top-0 pointer-events-none z-50"
      style={{
        width: '8px',
        height: '8px',
        backgroundColor: color,
        left: 0,
      }}
    />
  );
};

interface ConfettiProps {
  active: boolean;
  count?: number;
}

export const Confetti: React.FC<ConfettiProps> = ({ active, count = 50 }) => {
  const colors = [
    '#ffd700', // Gold
    '#58a6ff', // Mana Blue
    '#2ea043', // Health Green
    '#a371f7', // Purple
    '#da3633', // Red
    '#ffffff', // White
  ];

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {Array.from({ length: count }).map((_, i) => (
        <ConfettiPiece
          key={i}
          delay={Math.random() * 0.5}
          color={colors[Math.floor(Math.random() * colors.length)]}
        />
      ))}
    </div>
  );
};

interface RankUpModalProps {
  isOpen: boolean;
  oldRank: string;
  newRank: string;
  onClose: () => void;
}

export const RankUpModal: React.FC<RankUpModalProps> = ({
  isOpen,
  oldRank,
  newRank,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="frame-gold p-8 text-center relative overflow-hidden">
              {/* Sparkles background */}
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                    className="absolute w-2 h-2 bg-[var(--gold-light)]"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                  />
                ))}
              </div>

              {/* Content */}
              <div className="relative z-10">
                <IconStar size={64} color="#ffd700" className="mx-auto mb-4" />

                <h2 className="font-pixel-heading text-[var(--font-lg)] text-[var(--gold-highlight)] mb-2">
                  RANK UP!
                </h2>

                <div className="flex items-center justify-center gap-4 my-6">
                  <span className="font-pixel-heading text-[20px] text-[var(--gray-highlight)]">
                    {oldRank}
                  </span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="font-pixel text-[20px] text-[var(--gold-light)]"
                  >
                    →
                  </motion.span>
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="font-pixel-heading text-[28px] text-[var(--gold-light)]"
                  >
                    {newRank}
                  </motion.span>
                </div>

                <p className="font-pixel text-[10px] text-[var(--gray-highlight)] mb-6">
                  Congratulations, Warrior!<br />
                  Your power grows stronger!
                </p>

                <button
                  onClick={onClose}
                  className="btn-pixel btn-gold"
                >
                  CONTINUE
                </button>
              </div>
            </div>
          </motion.div>
          <Confetti active={true} count={100} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface QuestCompleteModalProps {
  isOpen: boolean;
  questTitle: string;
  xpReward: number;
  onClose: () => void;
}

export const QuestCompleteModal: React.FC<QuestCompleteModalProps> = ({
  isOpen,
  questTitle,
  xpReward,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="frame-health p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <IconCheck size={64} color="#2ea043" className="mx-auto mb-4" />
              </motion.div>

              <h2 className="font-pixel-heading text-[var(--font-lg)] text-[var(--health-light)] mb-4">
                QUEST COMPLETE!
              </h2>

              <p className="font-pixel text-[10px] text-white mb-4">
                {questTitle}
              </p>

              <div className="flex items-center justify-center gap-2 mb-6">
                <IconXP size={24} color="#ffd700" />
                <span className="font-pixel-heading text-[18px] text-[var(--gold-light)]">
                  +{xpReward} XP
                </span>
              </div>

              <button onClick={onClose} className="btn-pixel btn-health">
                AWESOME!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface ChestOpeningModalProps {
  isOpen: boolean;
  questTitle: string;
  xpReward: number;
  onAnimationComplete: () => void;
}

export const ChestOpeningModal: React.FC<ChestOpeningModalProps> = ({
  isOpen,
  questTitle,
  xpReward,
  onAnimationComplete,
}) => {
  const [stage, setStage] = useState<'shake' | 'open' | 'complete'>('shake');

  useEffect(() => {
    if (!isOpen) {
      setStage('shake');
      return;
    }

    // Stage 1: Shake (1 second)
    soundManager.click();
    const shakeTimer = setTimeout(() => {
      setStage('open');
    }, 1000);

    // Stage 2: Open (0.5 seconds)
    const openTimer = setTimeout(() => {
      soundManager.questComplete();
      setStage('complete');
    }, 1500);

    // Stage 3: Complete and trigger callback
    const completeTimer = setTimeout(() => {
      onAnimationComplete();
    }, 2000);

    return () => {
      clearTimeout(shakeTimer);
      clearTimeout(openTimer);
      clearTimeout(completeTimer);
    };
  }, [isOpen, onAnimationComplete]);

  return (
    <AnimatePresence>
      {isOpen && stage !== 'complete' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 pointer-events-none"
        >
          {/* Shake Stage */}
          {stage === 'shake' && (
            <motion.div
              animate={{
                rotate: [-3, 3, -3, 3, -3, 3, 0],
                scale: [1, 1.05, 1, 1.05, 1, 1.05, 1],
              }}
              transition={{ duration: 1, times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 1] }}
            >
              <IconChest size={128} color="#8b7000" />
            </motion.div>
          )}

          {/* Open Stage */}
          {stage === 'open' && (
            <div className="relative">
              {/* Chest bursting open */}
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.3, 0.8, 0] }}
                transition={{ duration: 0.5, times: [0, 0.3, 0.7, 1] }}
              >
                <IconChest size={128} color="#ffd700" />
              </motion.div>

              {/* Light burst effect */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 2, 3], opacity: [0, 1, 0] }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div
                  className="w-32 h-32 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(255,215,0,0) 70%)',
                  }}
                />
              </motion.div>

              {/* Particle burst */}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i / 12) * 360;
                const x = Math.cos((angle * Math.PI) / 180) * 100;
                const y = Math.sin((angle * Math.PI) / 180) * 100;

                return (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, opacity: 1 }}
                    animate={{ x, y, opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="absolute top-1/2 left-1/2 w-3 h-3 bg-[var(--gold-light)]"
                    style={{ marginLeft: '-6px', marginTop: '-6px' }}
                  />
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface CRTStartupProps {
  onComplete: () => void;
}

export const CRTStartup: React.FC<CRTStartupProps> = ({ onComplete }) => {
  useEffect(() => {
    soundManager.syncStart();
    const timer = setTimeout(() => {
      soundManager.syncComplete();
      onComplete();
    }, 800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ clipPath: 'inset(50% 0)', opacity: 0 }}
      animate={{ clipPath: 'inset(0% 0)', opacity: 1 }}
      exit={{ clipPath: 'inset(50% 0)', opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="fixed inset-0 bg-[var(--void-darkest)] z-50 pointer-events-none"
    >
      {/* Vertical scan lines */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.2) 2px, rgba(0, 0, 0, 0.2) 4px)',
        }}
      />

      {/* Center glow expanding */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 2, 1], opacity: [0, 0.5, 0] }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="w-2 h-2 bg-[var(--mana-light)] blur-xl" />
      </motion.div>
    </motion.div>
  );
};

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'LOADING...',
}) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-[var(--void-darkest)] flex items-center justify-center z-50">
      <div className="text-center">
        {/* Pixel sword animation */}
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="mb-8"
        >
          <IconStar size={64} color="#ffd700" className="mx-auto" />
        </motion.div>

        {/* Loading bar */}
        <div className="w-64 mx-auto mb-4">
          <div className="stat-bar stat-bar-xp">
            <motion.div
              className="stat-bar-fill"
              animate={{ width: ['0%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </div>

        {/* Message */}
        <p className="font-pixel text-[var(--font-md)] text-[var(--gold-light)]">
          {message}{dots}
        </p>
      </div>
    </div>
  );
};

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  isVisible: boolean;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  isVisible,
  onClose,
}) => {
  const variants = {
    success: 'frame-health',
    error: 'frame-critical',
    info: 'frame-mana',
    warning: 'frame-gold',
  };

  useEffect(() => {
    if (isVisible && onClose) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className={`${variants[type]} px-6 py-3`}>
            <p className="font-pixel text-[10px] text-white">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
