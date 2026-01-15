'use client';

import { useEffect } from 'react';
import { PageLayout, PixelFrame, PixelButton } from '@/components';

export default function BadgesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Badges page error:', error);
  }, [error]);

  return (
    <PageLayout title="BADGES" subtitle="Error loading badges">
      <PixelFrame variant="critical" padding="lg" className="max-w-md mx-auto">
        <div className="text-center">
          <h2 className="font-pixel text-[12px] text-[var(--critical-light)] mb-4">
            BADGE SYSTEM ERROR
          </h2>
          <p className="font-pixel text-[9px] text-[var(--gray-highlight)] mb-6">
            Failed to load your badge collection.
          </p>
          <div className="flex flex-col gap-3">
            <PixelButton variant="mana" onClick={reset}>
              RETRY
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
    </PageLayout>
  );
}
