'use client';

import { motion } from 'framer-motion';

interface StatBarProps {
  label: string;
  current: number;
  max: number;
  color: 'health' | 'mana' | 'xp';
  showNumbers?: boolean;
}

const colorClasses = {
  health: 'bg-health-green',
  mana: 'bg-mana-blue',
  xp: 'bg-loot-gold',
};

export default function StatBar({
  label,
  current,
  max,
  color,
  showNumbers = true,
}: StatBarProps) {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-mono text-gray-300 uppercase tracking-wide">
          {label}
        </span>
        {showNumbers && (
          <span className="text-xs font-mono text-gray-400">
            {current} / {max}
          </span>
        )}
      </div>
      
      <div className="relative w-full h-6 bg-gray-900 border-2 border-gray-700 rounded overflow-hidden">
        <motion.div
          className={`h-full ${colorClasses[color]} relative`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </motion.div>
        
        {/* Percentage text overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white drop-shadow-lg">
            {Math.floor(percentage)}%
          </span>
        </div>
      </div>
    </div>
  );
}
