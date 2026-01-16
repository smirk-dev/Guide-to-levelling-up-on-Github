'use client';

import { useEffect } from 'react';
import { PixelFrame, PixelButton } from '@/components';
import { IconWarning } from '@/components/icons/PixelIcons';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--void-darkest)] flex items-center justify-center p-4">
      <PixelFrame variant="critical" padding="lg" className="max-w-lg w-full">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <IconWarning size={48} color="var(--critical-light)" />
          </div>
          <h2 className="font-pixel text-[14px] text-[var(--critical-light)] mb-3">
            DASHBOARD ERROR
          </h2>
          <p className="font-pixel text-[9px] text-[var(--gray-highlight)] mb-2">
            Failed to load your warrior stats.
          </p>
          <p className="font-pixel text-[8px] text-[var(--gray-medium)] mb-6">
            This could be due to a network issue or GitHub API rate limiting.
          </p>
          <div className="flex flex-col gap-3">
            <PixelButton variant="mana" onClick={reset}>
              RETRY LOADING
            </PixelButton>
            <PixelButton variant="ghost" onClick={() => window.location.reload()}>
              REFRESH PAGE
            </PixelButton>
          </div>
        </div>
      </PixelFrame>
    </div>
  );
}
