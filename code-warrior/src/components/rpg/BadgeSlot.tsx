'use client';

import { motion } from 'framer-motion';
import { Shield, X, Sparkles } from 'lucide-react';
import type { Badge } from '@/types/database';
import { soundManager } from '@/lib/sound';

interface BadgeSlotProps {
  slotNumber: number;
  badge?: Badge | null;
  onUnequip?: (badgeId: string) => void;
  disabled?: boolean;
}

export default function BadgeSlot({ slotNumber, badge, onUnequip, disabled }: BadgeSlotProps) {
  const handleUnequip = () => {
    if (badge && onUnequip && !disabled) {
      soundManager.click();
      onUnequip(badge.id);
    }
  };

  // Map icon slugs to emoji/icons
  const getIconForBadge = (iconSlug: string) => {
    const icons: Record<string, string> = {
      sword: '⚔️',
      scroll: '📜',
      shark: '🦈',
      yolo: '🎲',
      shield: '🛡️',
      crown: '👑',
      star: '⭐',
    };
    return icons[iconSlug] || '🏆';
  };

  // Get stat boost display text
  const getStatBoostText = (statBoost: Record<string, number> | null) => {
    if (!statBoost) return null;
    return Object.entries(statBoost)
      .map(([stat, value]) => `${stat.charAt(0).toUpperCase() + stat.slice(1)} +${value}`)
      .join(', ');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: slotNumber * 0.1 }}
      className={`
        relative aspect-square rounded-pixel border-3 pixel-perfect
        ${badge ? 'border-loot-gold-2 bg-midnight-void-2' : 'border-dashed border-gray-pixel-0 bg-midnight-void-1'}
        overflow-hidden group
        ${!disabled && badge ? 'cursor-pointer hover:border-loot-gold-3' : ''}
      `}
      style={badge ? {
        boxShadow: '0 0 0 1px var(--loot-gold-1), 0 0 0 2px var(--loot-gold-0)'
      } : {}}
      onClick={handleUnequip}
      whileHover={badge && !disabled ? { scale: 1.05 } : {}}
      whileTap={badge && !disabled ? { scale: 0.95 } : {}}
      onMouseEnter={() => badge && !disabled && soundManager.hover()}
    >
      {badge ? (
        <>
          {/* Badge Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="text-4xl"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {getIconForBadge(badge.icon_slug)}
            </motion.div>
          </div>

          {/* Pixel Glow Effect - removed smooth blur */}

          {/* Unequip Button (shows on hover) */}
          {!disabled && (
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute top-1 right-1 bg-critical-red-1 rounded-pixel p-1 border border-critical-red-0"
            >
              <X className="w-3 h-3 text-white stroke-[3px]" />
            </motion.div>
          )}

          {/* Stat Boost Tooltip (shows on hover) */}
          {badge.stat_boost && (
            <div className="absolute bottom-0 left-0 right-0 bg-midnight-void-0 border-t-2 border-loot-gold-1 p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="font-pixel text-loot-gold-2 truncate">{badge.name}</div>
              <div className="text-gray-400 text-[10px] truncate">
                {getStatBoostText(badge.stat_boost)}
              </div>
            </div>
          )}

          {/* Sparkle Effect */}
          <motion.div
            className="absolute top-1 left-1"
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: slotNumber * 0.5,
            }}
          >
            <Sparkles className="w-3 h-3 text-loot-gold" />
          </motion.div>
        </>
      ) : (
        <>
          {/* Empty Slot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield className="w-8 h-8 text-gray-700" />
          </div>

          {/* Slot Number */}
          <div className="absolute bottom-2 right-2">
            <span className="font-pixel text-xs text-gray-600">
              {slotNumber}
            </span>
          </div>
        </>
      )}
    </motion.div>
  );
}
