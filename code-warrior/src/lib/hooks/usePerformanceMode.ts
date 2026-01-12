'use client';

import { useState, useEffect } from 'react';

export function usePerformanceMode() {
  const [performanceMode, setPerformanceMode] = useState(() => {
    if (typeof window === 'undefined') return false;

    // Check localStorage first
    const stored = localStorage.getItem('performance-mode');
    if (stored !== null) {
      return stored === 'true';
    }

    // Auto-enable on mobile devices
    return /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  });

  useEffect(() => {
    // Apply performance mode class to body
    if (performanceMode) {
      document.body.classList.add('performance-mode');
    } else {
      document.body.classList.remove('performance-mode');
    }
  }, [performanceMode]);

  const togglePerformanceMode = () => {
    const newValue = !performanceMode;
    setPerformanceMode(newValue);
    localStorage.setItem('performance-mode', String(newValue));
  };

  return {
    performanceMode,
    togglePerformanceMode,
    isEnabled: performanceMode,
  };
}
