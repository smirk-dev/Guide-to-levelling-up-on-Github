'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PixelTrophy, PixelGem } from '@/components/icons/PixelIcon';
import { get3DButtonStyle } from '@/lib/pixel-utils';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  xpGained: number;
  questTitle: string;
  badgeAwarded?: boolean;
}

export default function RewardModal({
  isOpen,
  onClose,
  xpGained,
  questTitle,
  badgeAwarded,
}: RewardModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-midnight-void-0/90 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.5, rotateY: -180, opacity: 0 }}
              animate={{ scale: 1, rotateY: 0, opacity: 1 }}
              exit={{ scale: 0.5, rotateY: 180, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.7 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full"
            >
              {/* Chest Container */}
              <div className="relative bg-midnight-void-1 border-4 border-loot-gold-2 rounded-pixel-sm p-8 pixel-perfect shadow-pixel-lg">
                {/* Pixel corner decorations */}
                <div className="absolute top-2 left-2 w-3 h-3 bg-loot-gold-3" />
                <div className="absolute top-2 right-2 w-3 h-3 bg-loot-gold-3" />
                <div className="absolute bottom-2 left-2 w-3 h-3 bg-loot-gold-3" />
                <div className="absolute bottom-2 right-2 w-3 h-3 bg-loot-gold-3" />

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-pixel bg-midnight-void-2 border-2 border-gray-pixel-0 hover:border-critical-red-1 transition-colors"
                >
                  <span className="text-gray-400 font-bold text-lg">✕</span>
                </button>

                {/* Chest Opening Animation */}
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center mb-6"
                >
                  <motion.div
                    animate={{
                      rotate: [0, -10, 10, -10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: 2,
                      delay: 0.5,
                    }}
                    className="inline-block text-8xl mb-4"
                  >
                    📦
                  </motion.div>

                  {/* Opening Effect */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.5, 1] }}
                    transition={{ delay: 1.5, duration: 0.5 }}
                  >
                    <PixelTrophy className="text-loot-gold-2 mx-auto mb-4" size="lg" />
                  </motion.div>
                </motion.div>

                {/* Quest Complete Text */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center mb-6"
                >
                  <h2 className="text-3xl font-pixel text-loot-gold-2 mb-2 no-smooth">
                    QUEST COMPLETE!
                  </h2>
                  <p className="text-gray-300 font-mono text-sm">
                    {questTitle}
                  </p>
                </motion.div>

                {/* Rewards */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="space-y-4"
                >
                  {/* XP Reward */}
                  <div className="bg-midnight-void-2 border-3 border-loot-gold-1 rounded-pixel-sm p-4 pixel-perfect">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-loot-gold-2 stroke-[3px]" />
                        <span className="font-bold text-lg">Experience Points</span>
                      </div>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.3, 1] }}
                        transition={{ delay: 1.4, duration: 0.4 }}
                        className="text-2xl font-pixel text-loot-gold-2 no-smooth"
                      >
                        +{xpGained} XP
                      </motion.span>
                    </div>
                  </div>

                  {/* Badge Reward */}
                  {badgeAwarded && (
                    <div className="bg-midnight-void-2 border-3 border-mana-blue-1 rounded-pixel-sm p-4 pixel-perfect">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <PixelTrophy className="text-mana-blue-2" size="md" />
                          <span className="font-bold text-lg">New Badge Unlocked!</span>
                        </div>
                        <motion.span
                          initial={{ rotate: -180, scale: 0 }}
                          animate={{ rotate: 0, scale: 1 }}
                          transition={{ delay: 1.6, duration: 0.5 }}
                          className="text-2xl"
                        >
                          🏆
                        </motion.span>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Continue Button */}
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.8 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 1 }}
                  onClick={onClose}
                  className="w-full mt-6 px-6 py-3 text-midnight-void-0 font-pixel text-sm border-4 rounded-pixel-sm pixel-perfect no-smooth"
                  style={get3DButtonStyle('gold')}
                >
                  CONTINUE
                </motion.button>
              </div>

              {/* Confetti Effect */}
              {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{
                        x: '50%',
                        y: '50%',
                        scale: 0,
                      }}
                      animate={{
                        x: `${50 + (Math.random() - 0.5) * 200}%`,
                        y: `${50 + (Math.random() - 0.5) * 200}%`,
                        scale: [0, 1, 0],
                        rotate: Math.random() * 360,
                      }}
                      transition={{
                        duration: 1.5,
                        delay: Math.random() * 0.5,
                      }}
                      className="absolute w-3 h-3 pixel-perfect"
                      style={{
                        backgroundColor: [
                          'var(--loot-gold-2)',
                          'var(--mana-blue-2)',
                          'var(--health-green-1)',
                          'var(--critical-red-1)',
                        ][Math.floor(Math.random() * 4)],
                        boxShadow: '1px 1px 0 rgba(0,0,0,0.5)',
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
