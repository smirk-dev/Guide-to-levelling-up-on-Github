'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
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
              <div className="relative bg-gradient-to-b from-loot-gold/20 to-midnight-void border-4 border-loot-gold rounded-lg p-8 shadow-[0_0_50px_rgba(255,215,0,0.3)]">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-midnight-void/50 hover:bg-midnight-void/70 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
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
                    <Trophy className="w-16 h-16 text-loot-gold mx-auto mb-4" />
                  </motion.div>
                </motion.div>

                {/* Quest Complete Text */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center mb-6"
                >
                  <h2 className="text-3xl font-pixel text-loot-gold mb-2">
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
                  <div className="bg-midnight-void/50 border-2 border-loot-gold/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-loot-gold" />
                        <span className="font-bold text-lg">Experience Points</span>
                      </div>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.3, 1] }}
                        transition={{ delay: 1.4, duration: 0.4 }}
                        className="text-2xl font-pixel text-loot-gold"
                      >
                        +{xpGained} XP
                      </motion.span>
                    </div>
                  </div>

                  {/* Badge Reward */}
                  {badgeAwarded && (
                    <div className="bg-midnight-void/50 border-2 border-mana-blue/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Trophy className="w-6 h-6 text-mana-blue" />
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
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="
                    w-full mt-6 px-6 py-3 rounded-lg font-bold
                    bg-gradient-to-r from-loot-gold to-yellow-600
                    text-midnight-void
                    hover:shadow-[0_0_20px_rgba(255,215,0,0.5)]
                    transition-shadow
                  "
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
                      className="absolute w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: [
                          '#ffd700',
                          '#58a6ff',
                          '#2ea043',
                          '#da3633',
                        ][Math.floor(Math.random() * 4)],
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
