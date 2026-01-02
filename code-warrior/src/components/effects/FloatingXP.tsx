'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface FloatingXPProps {
  amount: number;
  onComplete?: () => void;
}

export default function FloatingXP({ amount, onComplete }: FloatingXPProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ y: 0, opacity: 1, scale: 1 }}
      animate={{ 
        y: -100, 
        opacity: 0, 
        scale: 1.5,
      }}
      transition={{ 
        duration: 2,
        ease: 'easeOut'
      }}
      className="absolute pointer-events-none z-50"
      style={{
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="text-4xl font-pixel text-loot-gold drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]">
        +{amount} XP
      </div>
    </motion.div>
  );
}
