'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Loader2, ArrowLeft, Lock, CheckCircle2 } from 'lucide-react';
import type { Badge } from '@/types/database';
import Link from 'next/link';
import { soundManager } from '@/lib/sound';

interface BadgeInventoryItem extends Badge {
  owned: boolean;
  equipped: boolean;
  earned_at: string | null;
}

export default function BadgesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [inventory, setInventory] = useState<BadgeInventoryItem[]>([]);
  const [equippedCount, setEquippedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      loadInventory();
    }
  }, [status, router]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/badges/inventory');
      const data = await response.json();

      if (response.ok) {
        setInventory(data.inventory || []);
        setEquippedCount(data.equippedCount || 0);
      } else {
        setError(data.error || 'Failed to load inventory');
      }
    } catch (err) {
      console.error('Error loading inventory:', err);
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleEquip = async (badgeId: string) => {
    try {
      setActionInProgress(badgeId);
      soundManager.click();

      const response = await fetch('/api/badges/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeId }),
      });

      const data = await response.json();

      if (response.ok) {
        soundManager.questComplete();
        await loadInventory(); // Reload to get updated state
      } else {
        soundManager.error();
        alert(data.error || 'Failed to equip badge');
      }
    } catch (err) {
      console.error('Error equipping badge:', err);
      soundManager.error();
      alert('Failed to equip badge');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleUnequip = async (badgeId: string) => {
    try {
      setActionInProgress(badgeId);
      soundManager.click();

      const response = await fetch('/api/badges/unequip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeId }),
      });

      const data = await response.json();

      if (response.ok) {
        soundManager.click();
        await loadInventory(); // Reload to get updated state
      } else {
        soundManager.error();
        alert(data.error || 'Failed to unequip badge');
      }
    } catch (err) {
      console.error('Error unequipping badge:', err);
      soundManager.error();
      alert('Failed to unequip badge');
    } finally {
      setActionInProgress(null);
    }
  };

  // Map icon slugs to emoji
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
    if (!statBoost) return 'No stat boost';
    return Object.entries(statBoost)
      .map(([stat, value]) => `+${value} ${stat.charAt(0).toUpperCase() + stat.slice(1)}`)
      .join(', ');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-midnight-void-0 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-loot-gold-2 animate-spin mx-auto mb-4 stroke-[3px]" />
          <p className="text-gray-400 font-mono">Loading Badge Collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-void-0 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Back Button */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-mana-blue-2 hover:text-loot-gold-2 transition-colors mb-6 font-mono"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3px]" />
            <span>Back to Dashboard</span>
          </Link>

          {/* Title */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <Shield className="w-16 h-16 text-loot-gold-2 stroke-[3px]" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-pixel text-loot-gold-2 no-smooth"
                style={{
                  textShadow: '-2px -2px 0 var(--loot-gold-0), 2px -2px 0 var(--loot-gold-0), -2px 2px 0 var(--loot-gold-0), 2px 2px 0 var(--loot-gold-0)'
                }}
              >
                BADGE COLLECTION
              </h1>
              <p className="text-gray-400 mt-2 font-mono">
                Equip up to 3 badges to boost your stats ({equippedCount}/3 equipped)
              </p>
            </div>
          </div>

          <div className="h-1 w-full bg-midnight-void-2 border-t-2 border-b-2 border-loot-gold-1" />
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-midnight-void-2 border-2 border-critical-red-1 rounded-pixel-sm p-4 mb-6 pixel-perfect"
          >
            <p className="text-critical-red-1 font-mono">{error}</p>
            <button
              onClick={loadInventory}
              className="mt-2 text-sm text-loot-gold-2 hover:text-loot-gold-3 font-mono"
            >
              Try again
            </button>
          </motion.div>
        )}

        {/* Badge Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventory.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`
                relative p-6 rounded-pixel-sm border-3 pixel-perfect
                ${badge.owned
                  ? badge.equipped
                    ? 'border-loot-gold-2 bg-midnight-void-2'
                    : 'border-mana-blue-1 bg-midnight-void-1'
                  : 'border-gray-pixel-0 bg-midnight-void-1 opacity-60'
                }
              `}
              style={badge.equipped ? {
                boxShadow: '0 0 0 2px var(--loot-gold-1), 0 0 0 4px var(--loot-gold-0)'
              } : {}}
            >
              {/* Badge Icon */}
              <div className="text-center mb-4">
                <motion.div
                  className={`text-6xl mb-3 inline-block ${!badge.owned ? 'grayscale' : ''}`}
                  animate={badge.equipped ? { rotate: [0, 5, -5, 0] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {badge.owned ? getIconForBadge(badge.icon_slug) : <Lock className="w-16 h-16 text-gray-600" />}
                </motion.div>

                {/* Equipped Indicator */}
                {badge.equipped && (
                  <motion.div
                    className="absolute top-4 right-4 bg-loot-gold rounded-full p-1"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-midnight-void" />
                  </motion.div>
                )}

                {/* Locked Indicator */}
                {!badge.owned && (
                  <div className="absolute top-4 left-4 bg-gray-800 rounded-full p-2">
                    <Lock className="w-4 h-4 text-gray-500" />
                  </div>
                )}
              </div>

              {/* Badge Info */}
              <div className="text-center mb-4">
                <h3 className={`font-pixel text-lg mb-2 ${badge.owned ? 'text-white' : 'text-gray-600'}`}>
                  {badge.name}
                </h3>
                <p className={`text-sm mb-2 ${badge.owned ? 'text-loot-gold' : 'text-gray-600'}`}>
                  {getStatBoostText(badge.stat_boost)}
                </p>
                {badge.earned_at && (
                  <p className="text-xs text-gray-500">
                    Earned {new Date(badge.earned_at).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Action Button */}
              {badge.owned && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => badge.equipped ? handleUnequip(badge.id) : handleEquip(badge.id)}
                  onMouseEnter={() => soundManager.hover()}
                  disabled={actionInProgress === badge.id || (!badge.equipped && equippedCount >= 3)}
                  className={`
                    w-full px-4 py-2 font-pixel text-xs rounded transition-colors
                    ${badge.equipped
                      ? 'bg-critical-red/20 border border-critical-red/50 text-critical-red hover:bg-critical-red/30'
                      : equippedCount >= 3
                      ? 'bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-loot-gold/20 border border-loot-gold/50 text-loot-gold hover:bg-loot-gold/30'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {actionInProgress === badge.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      PROCESSING...
                    </span>
                  ) : badge.equipped ? (
                    'UNEQUIP'
                  ) : equippedCount >= 3 ? (
                    'SLOTS FULL'
                  ) : (
                    'EQUIP'
                  )}
                </motion.button>
              )}

              {!badge.owned && (
                <div className="text-center text-xs text-gray-600 font-pixel">
                  LOCKED
                </div>
              )}

              {/* Glow effect for equipped badges */}
              {badge.equipped && (
                <motion.div
                  className="absolute inset-0 bg-loot-gold/20 rounded-lg -z-10"
                  animate={{
                    opacity: [0.2, 0.5, 0.2],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {inventory.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No badges available yet.</p>
            <p className="text-sm text-gray-500 mt-2">
              Complete quests to earn badges!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
