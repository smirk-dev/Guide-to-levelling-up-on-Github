'use client';

import { useEffect } from 'react';
import { PixelFrame, PixelButton } from '@/components';
import { IconTrophy } from '@/components/icons/PixelIcons';

export default function LeaderboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Leaderboard error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--void-darkest)] flex items-center justify-center p-4">
      <PixelFrame variant="critical" padding="lg" className="max-w-lg w-full">
        <div className="text-center">
          <div className="flex justify-center mb-4 opacity-50">
            <IconTrophy size={48} color="var(--gray-medium)" />
          </div>
          <h2 className="font-pixel text-[14px] text-[var(--critical-light)] mb-3">
            RANKINGS UNAVAILABLE
          </h2>
          <p className="font-pixel text-[9px] text-[var(--gray-highlight)] mb-2">
            Failed to load the warrior rankings.
          </p>
          <p className="font-pixel text-[8px] text-[var(--gray-medium)] mb-6">
            The arena scoreboard is temporarily offline. Please try again.
          </p>
          <div className="flex flex-col gap-3">
            <PixelButton variant="mana" onClick={reset}>
              RELOAD RANKINGS
            </PixelButton>
            <a
              href="/dashboard"
              className="font-pixel text-[8px] text-[var(--gray-medium)] hover:text-[var(--mana-light)]"
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      </PixelFrame>
    </div>
  );
}
