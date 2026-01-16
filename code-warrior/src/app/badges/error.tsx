'use client';

import { useEffect } from 'react';
import { PixelFrame, PixelButton } from '@/components';
import { IconBadge } from '@/components/icons/PixelIcons';

export default function BadgesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Badges error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--void-darkest)] flex items-center justify-center p-4">
      <PixelFrame variant="critical" padding="lg" className="max-w-lg w-full">
        <div className="text-center">
          <div className="flex justify-center mb-4 opacity-50">
            <IconBadge size={48} color="var(--gray-medium)" />
          </div>
          <h2 className="font-pixel text-[14px] text-[var(--critical-light)] mb-3">
            BADGE ARMORY LOCKED
          </h2>
          <p className="font-pixel text-[9px] text-[var(--gray-highlight)] mb-2">
            Failed to load your badge collection.
          </p>
          <p className="font-pixel text-[8px] text-[var(--gray-medium)] mb-6">
            The armory is temporarily inaccessible. Please try again.
          </p>
          <div className="flex flex-col gap-3">
            <PixelButton variant="mana" onClick={reset}>
              UNLOCK ARMORY
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
