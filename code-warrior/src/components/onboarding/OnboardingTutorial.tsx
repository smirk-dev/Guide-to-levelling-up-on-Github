'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelFrame, PixelButton, PixelBadge } from '../ui/PixelComponents';
import { IconSword, IconXP, IconScroll, IconBadge, IconTrophy, IconArrowRight, IconClose } from '../icons/PixelIcons';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  tip?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: 'Welcome, Warrior!',
    description: 'Code Warrior transforms your GitHub contributions into an epic RPG adventure. Every commit, PR, and issue earns you XP!',
    icon: <IconSword size={48} color="#ffd700" />,
    tip: 'Your coding journey is about to become legendary!',
  },
  {
    title: 'Earn Experience Points',
    description: 'XP is calculated from your GitHub activity: commits, pull requests, issues, reviews, and stars received.',
    icon: <IconXP size={48} color="#ffd700" />,
    tip: 'Commits = 10 XP | PRs = 40 XP | Issues = 15 XP | Reviews = 20 XP | Stars = 50 XP',
  },
  {
    title: 'Complete Quests',
    description: 'Take on challenges to earn bonus XP and unlock rewards. Track your progress and claim rewards when ready!',
    icon: <IconScroll size={48} color="#b8960f" />,
    tip: 'New quests unlock as you level up!',
  },
  {
    title: 'Collect Badges',
    description: 'Earn badges for your achievements. Equip up to 3 badges to boost your warrior stats!',
    icon: <IconBadge size={48} color="#a371f7" />,
    tip: 'Different badges boost different stats like Health, Mana, and Strength.',
  },
  {
    title: 'Climb the Ranks',
    description: 'Progress through 8 ranks from C (Novice) to SSS (Legend). Compete on the leaderboard!',
    icon: <IconTrophy size={48} color="#ffd700" />,
    tip: 'Rank Tiers: C → B → A → AA → AAA → S → SS → SSS',
  },
];

interface OnboardingTutorialProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    // Store completion in localStorage
    localStorage.setItem('onboarding_completed', 'true');
    setTimeout(onComplete, 300);
  };

  const handleSkip = () => {
    setIsVisible(false);
    localStorage.setItem('onboarding_completed', 'true');
    setTimeout(() => onSkip?.() || onComplete(), 300);
  };

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/90" />

          {/* Modal */}
          <motion.div
            key={currentStep}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 20 }}
            className="relative z-10 w-full max-w-lg"
          >
            <PixelFrame variant="gold" padding="lg">
              {/* Skip button */}
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 p-2 hover:opacity-70 transition-opacity"
                aria-label="Skip tutorial"
              >
                <IconClose size={16} color="var(--gray-medium)" />
              </button>

              {/* Progress indicator */}
              <div className="flex justify-center gap-2 mb-6">
                {ONBOARDING_STEPS.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 border-2 transition-colors ${
                      index === currentStep
                        ? 'bg-[var(--gold-light)] border-[var(--gold-light)]'
                        : index < currentStep
                        ? 'bg-[var(--gold-dark)] border-[var(--gold-dark)]'
                        : 'bg-transparent border-[var(--gray-dark)]'
                    }`}
                  />
                ))}
              </div>

              {/* Icon */}
              <motion.div
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15 }}
                className="flex justify-center mb-6"
              >
                <div className="p-4 bg-[var(--void-darker)] border-4 border-[var(--gold-dark)]">
                  {step.icon}
                </div>
              </motion.div>

              {/* Content */}
              <div className="text-center mb-6">
                <h2 className="font-pixel text-[16px] text-[var(--gold-light)] mb-4">
                  {step.title}
                </h2>
                <p className="font-pixel text-[10px] text-[var(--gray-highlight)] leading-relaxed mb-4">
                  {step.description}
                </p>
                {step.tip && (
                  <PixelBadge variant="mana" size="sm">
                    {step.tip}
                  </PixelBadge>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <PixelButton
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className={currentStep === 0 ? 'opacity-30' : ''}
                >
                  BACK
                </PixelButton>

                <span className="font-pixel text-[9px] text-[var(--gray-medium)]">
                  {currentStep + 1} / {ONBOARDING_STEPS.length}
                </span>

                <PixelButton
                  variant="gold"
                  size="sm"
                  onClick={handleNext}
                >
                  <span className="flex items-center gap-2">
                    {isLastStep ? 'START' : 'NEXT'}
                    <IconArrowRight size={12} color="var(--void-darkest)" />
                  </span>
                </PixelButton>
              </div>
            </PixelFrame>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook to check if onboarding should be shown
export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('onboarding_completed');
    setShowOnboarding(!completed);
    setIsLoaded(true);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('onboarding_completed');
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    isLoaded,
    completeOnboarding,
    resetOnboarding,
  };
};
