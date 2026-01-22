'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PixelFrame, PixelButton } from '@/components';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to console for debugging
    console.error('Application error:', error);
  }, [error]);

  // Determine error type based on error message
  const errorType = error.message.toLowerCase().includes('fetch') 
    ? 'connection' 
    : error.message.toLowerCase().includes('not found')
    ? 'notfound'
    : 'application';

  const getErrorMessage = () => {
    switch (errorType) {
      case 'connection':
        return "We couldn't connect to our servers. Please check your internet connection and try again.";
      case 'notfound':
        return 'The page or resource you are looking for could not be found.';
      default:
        return 'An unexpected error occurred. Our team has been notified and we are working to fix it.';
    }
  };

  const getErrorTitle = () => {
    switch (errorType) {
      case 'connection':
        return 'CONNECTION ERROR';
      case 'notfound':
        return 'NOT FOUND';
      default:
        return 'SYSTEM ERROR';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--void-darkest)] flex items-center justify-center p-4">
      <PixelFrame variant="critical" padding="lg" className="max-w-md w-full">
        <div className="text-center">
          <h2 className="font-pixel text-[14px] text-[var(--critical-light)] mb-4">
            {getErrorTitle()}
          </h2>
          <p className="font-pixel text-[10px] text-[var(--gray-highlight)] mb-6 leading-relaxed">
            {getErrorMessage()}
          </p>
          <div className="flex flex-col gap-3">
            <PixelButton variant="mana" onClick={reset}>
              TRY AGAIN
            </PixelButton>
            <PixelButton 
              variant="gold" 
              onClick={() => router.push('/dashboard')}
            >
              RETURN HOME
            </PixelButton>
          </div>
        </div>
      </PixelFrame>
    </div>
  );
}
