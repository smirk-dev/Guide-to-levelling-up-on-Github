'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ConfettiProps {
  trigger: boolean;
}

export default function Confetti({ trigger }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; rotation: number }>>([]);

  useEffect(() => {
    if (trigger) {
      // Pixel palette colors
      const colors = ['var(--loot-gold-2)', 'var(--mana-blue-2)', 'var(--health-green-1)', 'var(--critical-red-1)'];
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 400,
        y: (Math.random() - 0.5) * 400,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
      }));

      setParticles(newParticles);

      setTimeout(() => {
        setParticles([]);
      }, 3000);
    }
  }, [trigger]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: 0,
            y: 0,
            scale: 0,
            rotate: 0,
          }}
          animate={{
            x: particle.x,
            y: particle.y,
            scale: [0, 1.5, 0],
            rotate: particle.rotation,
          }}
          transition={{
            duration: 2,
            ease: 'easeOut',
          }}
          className="absolute w-4 h-4 pixel-perfect"
          style={{
            backgroundColor: particle.color,
            boxShadow: '1px 1px 0 rgba(0,0,0,0.5)'
          }}
        />
      ))}
    </div>
  );
}
