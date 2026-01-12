'use client';

import { useState, useCallback } from 'react';
import { soundManager } from '@/lib/sound';

type ShakeIntensity = 'light' | 'medium' | 'heavy';

export function useScreenShake() {
  const [shaking, setShaking] = useState(false);

  const shake = useCallback((intensity: ShakeIntensity = 'medium') => {
    setShaking(true);

    // Play appropriate sound based on intensity
    if (intensity === 'heavy') {
      soundManager.rankUp();
    } else {
      soundManager.questComplete();
    }

    // Duration based on intensity
    const duration = intensity === 'light' ? 200 : intensity === 'medium' ? 400 : 600;

    setTimeout(() => {
      setShaking(false);
    }, duration);
  }, []);

  return {
    shaking,
    shake,
    shakeClass: shaking ? 'animate-screen-shake' : '',
  };
}
