'use client';

import { useEffect } from 'react';
import { PixelFrame, PixelButton } from '@/components';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--void-darkest)] flex items-center justify-center p-4">
      <PixelFrame variant="critical" padding="lg" className="max-w-md w-full">
        <div className="text-center">
          <h2 className="font-pixel text-[14px] text-[var(--critical-light)] mb-4">
            SYSTEM ERROR
          </h2>
          <p className="font-pixel text-[9px] text-[var(--gray-highlight)] mb-6">
            Something went wrong. The error has been logged.
          </p>
          <div className="flex flex-col gap-3">
            <PixelButton variant="mana" onClick={reset}>
              TRY AGAIN
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
