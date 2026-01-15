'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DndContext, closestCenter, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { PixelFrame, PixelButton, PixelBadge, PixelTooltip } from '../ui/PixelComponents';
import { IconBadge, IconShield, IconCheck, IconLock, IconHeart, IconMana, IconSword, IconStar, IconReview } from '../icons/PixelIcons';
import { soundManager } from '@/lib/sound';
import type { Badge, UserBadge } from '@/types/database';

interface BadgeSlotProps {
  badge: Badge;
  userBadge?: UserBadge | null;
  onEquip?: () => void;
  onUnequip?: () => void;
  loading?: boolean;
  className?: string;
  draggable?: boolean;
  isDropTarget?: boolean;
}

export const BadgeSlot: React.FC<BadgeSlotProps> = ({
  badge,
  userBadge,
  onEquip,
  onUnequip,
  loading = false,
  className = '',
  draggable = false,
  isDropTarget = false,
}) => {
  const isOwned = !!userBadge;
  const isEquipped = userBadge?.equipped ?? false;
  const statBoost = badge.stat_boost as Record<string, number> | null;

  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: `badge-${badge.id}`,
    data: { badge, userBadge },
    disabled: !draggable || !isOwned || loading,
  });

  const getBoostText = () => {
    if (!statBoost) return null;
    return Object.entries(statBoost)
      .map(([stat, value]) => `+${value} ${stat.toUpperCase()}`)
      .join(', ');
  };

  const getStatIcon = (stat: string) => {
    switch (stat.toLowerCase()) {
      case 'health':
      case 'hp':
        return <IconHeart size={12} color="#2ea043" />;
      case 'mana':
      case 'mp':
        return <IconMana size={12} color="#58a6ff" />;
      case 'strength':
        return <IconSword size={12} color="#f85149" />;
      case 'charisma':
        return <IconStar size={12} color="#ffd700" />;
      case 'wisdom':
        return <IconReview size={12} color="#a371f7" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      ref={draggable ? setDragRef : undefined}
      {...(draggable ? attributes : {})}
      {...(draggable ? listeners : {})}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: isDragging ? 0.5 : 1,
        scale: isDragging ? 1.05 : 1,
      }}
      transition={{ duration: 0.2 }}
      className={className}
      style={{ cursor: draggable && isOwned && !loading ? 'grab' : 'default' }}
    >
      <PixelFrame
        variant={isEquipped ? 'gold' : isOwned ? 'mana' : 'stone'}
        padding="md"
      >
        <div className="relative">
          {/* Badge Icon */}
          <div className="flex items-center justify-center mb-3">
            <div
              className={`w-16 h-16 flex items-center justify-center ${
                isOwned ? '' : 'opacity-40 grayscale'
              }`}
              style={{
                filter: isEquipped
                  ? 'drop-shadow(0 0 8px var(--gold-light))'
                  : undefined,
              }}
            >
              {isOwned ? (
                <IconBadge size={48} color={isEquipped ? '#ffd700' : '#a371f7'} />
              ) : (
                <IconLock size={48} color="#484848" />
              )}
            </div>

            {/* Equipped indicator */}
            {isEquipped && (
              <div className="absolute top-0 right-0">
                <PixelBadge variant="gold" size="sm">
                  <IconShield size={10} color="#0a0a0f" />
                </PixelBadge>
              </div>
            )}
          </div>

          {/* Badge Name */}
          <h3
            className={`font-pixel text-[var(--font-sm)] text-center mb-2 ${
              isOwned ? 'text-white' : 'text-[var(--gray-medium)]'
            }`}
          >
            {badge.name}
          </h3>

          {/* Stat Boost */}
          {statBoost && (
            <div className="flex flex-wrap gap-1 justify-center mb-3">
              {Object.entries(statBoost).map(([stat, value]) => (
                <PixelTooltip
                  key={stat}
                  content={`${stat.charAt(0).toUpperCase() + stat.slice(1)} +${value}`}
                >
                  <PixelBadge variant="health" size="sm">
                    <div className="flex items-center gap-1">
                      {getStatIcon(stat)}
                      <span className="text-[6px]">+{value}</span>
                    </div>
                  </PixelBadge>
                </PixelTooltip>
              ))}
            </div>
          )}

          {/* Status/Actions */}
          <div className="flex justify-center">
            {!isOwned && (
              <span className="font-pixel text-[var(--font-xs)] text-[var(--gray-medium)]">
                LOCKED
              </span>
            )}
            {isOwned && !isEquipped && onEquip && (
              <PixelButton
                variant="mana"
                size="sm"
                onClick={() => {
                  soundManager.xpGain();
                  onEquip();
                }}
                loading={loading}
              >
                EQUIP
              </PixelButton>
            )}
            {isOwned && isEquipped && onUnequip && (
              <PixelButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  soundManager.click();
                  onUnequip();
                }}
                loading={loading}
              >
                UNEQUIP
              </PixelButton>
            )}
          </div>

          {/* Earned date */}
          {userBadge?.earned_at && (
            <div className="text-center mt-2">
              <span className="font-pixel text-[6px] text-[var(--gray-medium)]">
                EARNED {new Date(userBadge.earned_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </PixelFrame>
    </motion.div>
  );
};

interface BadgeGridProps {
  badges: Badge[];
  userBadges: UserBadge[];
  onEquipBadge: (badgeId: string) => void;
  onUnequipBadge: (badgeId: string) => void;
  loadingBadgeId?: string | null;
  className?: string;
}

export const BadgeGrid: React.FC<BadgeGridProps> = ({
  badges = [],
  userBadges = [],
  onEquipBadge,
  onUnequipBadge,
  loadingBadgeId,
  className = '',
}) => {
  // Defensive null checks
  const safeBadges = badges || [];
  const safeUserBadges = userBadges || [];

  const getUserBadge = (badgeId: string) =>
    safeUserBadges.find((ub) => ub.badge_id === badgeId) || null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      soundManager.error();
      return;
    }

    // Extract badge info from dragged item
    const draggedBadge = active.data.current?.badge as Badge;
    const draggedUserBadge = active.data.current?.userBadge as UserBadge | undefined;

    // Check if dropped on an equip slot
    if (over.id.toString().startsWith('equip-slot-')) {
      if (draggedUserBadge && !draggedUserBadge.equipped && equippedCount < maxEquipped) {
        soundManager.xpGain();
        onEquipBadge(draggedBadge.id);
      } else {
        soundManager.error();
      }
    }
    // Check if dropped on unequip area
    else if (over.id === 'unequip-area' && draggedUserBadge?.equipped) {
      soundManager.click();
      onUnequipBadge(draggedBadge.id);
    }
  };

  // Sort: equipped first, then owned, then locked
  const sortedBadges = [...badges].sort((a, b) => {
    const ubA = getUserBadge(a.id);
    const ubB = getUserBadge(b.id);

    if (ubA?.equipped && !ubB?.equipped) return -1;
    if (!ubA?.equipped && ubB?.equipped) return 1;
    if (ubA && !ubB) return -1;
    if (!ubA && ubB) return 1;
    return 0;
  });

  const equippedCount = userBadges.filter((ub) => ub.equipped).length;
  const maxEquipped = 3; // Can equip up to 3 badges

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className={className}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 md:mb-10">
        <div className="flex items-center gap-3 md:gap-4">
          <IconBadge size={32} color="#a371f7" />
          <h2 className="font-pixel-heading text-[16px] md:text-[18px] text-[var(--xp-light)]">
            BADGE ARMORY
          </h2>
        </div>
        <PixelBadge variant="purple" size="md">
          {equippedCount}/{maxEquipped} EQUIPPED
        </PixelBadge>
      </div>

      {/* Equipped Section */}
      <div className="mb-10 md:mb-12">
        <h3 className="font-pixel text-[var(--font-sm)] md:text-[11px] text-[var(--gray-highlight)] mb-5">
          EQUIPPED BADGES ({equippedCount}/{maxEquipped})
        </h3>
        <div className="grid grid-cols-3 gap-4 md:gap-6">
          {[0, 1, 2].map((slot) => {
            const EquipSlotDropzone: React.FC<{ children: React.ReactNode }> = ({ children }) => {
              const { setNodeRef, isOver } = useDroppable({
                id: `equip-slot-${slot}`,
              });

              return (
                <div
                  ref={setNodeRef}
                  className={`relative ${isOver ? 'ring-4 ring-[var(--gold-light)] animate-pixel-pulse' : ''}`}
                >
                  {children}
                </div>
              );
            };
            const equippedBadge = sortedBadges.find(
              (b, i) =>
                getUserBadge(b.id)?.equipped &&
                userBadges.filter((ub) => ub.equipped).indexOf(getUserBadge(b.id)!) === slot
            );
            const badge = equippedBadge
              ? badges.find((b) => getUserBadge(b.id)?.equipped)
              : null;


            if (equippedBadge) {
              return (
                <EquipSlotDropzone key={equippedBadge.id}>
                  <BadgeSlot
                    badge={equippedBadge}
                    userBadge={getUserBadge(equippedBadge.id)}
                    onUnequip={() => onUnequipBadge(equippedBadge.id)}
                    loading={loadingBadgeId === equippedBadge.id}
                    draggable={true}
                  />
                </EquipSlotDropzone>
              );
            }

            return (
              <EquipSlotDropzone key={slot}>
                <PixelFrame variant="stone" padding="lg" className="inventory-slot">
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto flex items-center justify-center opacity-30">
                    <IconShield size={48} color="#484848" />
                  </div>
                  <p className="font-pixel text-[var(--font-xs)] md:text-[9px] text-[var(--gray-medium)] text-center mt-3">
                    DROP HERE
                  </p>
                </PixelFrame>
              </EquipSlotDropzone>
            );
          })}
        </div>
      </div>

      {/* All Badges Grid */}
      <div>
        <h3 className="font-pixel text-[var(--font-sm)] md:text-[11px] text-[var(--gray-highlight)] mb-5">
          ALL BADGES ({userBadges.length}/{badges.length} UNLOCKED)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {sortedBadges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <BadgeSlot
                badge={badge}
                userBadge={getUserBadge(badge.id)}
                onEquip={
                  equippedCount < maxEquipped
                    ? () => onEquipBadge(badge.id)
                    : undefined
                }
                onUnequip={() => onUnequipBadge(badge.id)}
                loading={loadingBadgeId === badge.id}
                draggable={true}
              />
            </motion.div>
          ))}
        </div>

        {badges.length === 0 && (
          <PixelFrame variant="stone" padding="lg">
            <div className="text-center py-8">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="mb-4"
              >
                <IconBadge size={64} color="#484848" className="mx-auto" />
              </motion.div>

              <h3 className="font-pixel text-[var(--font-md)] text-[var(--gray-highlight)] mb-2">
                NO BADGES EARNED
              </h3>
              <p className="font-pixel text-[var(--font-xs)] md:text-[9px] text-[var(--gray-medium)] mb-4 max-w-xs mx-auto">
                Complete quests to earn badges! Each badge grants special stat boosts to power up your warrior.
              </p>
            </div>
          </PixelFrame>
        )}
      </div>
      </div>
    </DndContext>
  );
};
