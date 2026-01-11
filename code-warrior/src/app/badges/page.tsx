'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  PageLayout,
  BadgeGrid,
  PixelFrame,
  LoadingScreen,
  Toast,
  IconBadge,
} from '@/components';
import { soundManager } from '@/lib/sound';
import type { Badge, UserBadge } from '@/types/database';

interface BadgesData {
  badges: Badge[];
  userBadges: UserBadge[];
}

export default function BadgesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning'; visible: boolean }>({ message: '', type: 'info', visible: false });
  const [loadingBadgeId, setLoadingBadgeId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Fetch badges data
  const { data, isLoading } = useQuery<BadgesData>({
    queryKey: ['badges'],
    queryFn: async () => {
      const res = await fetch('/api/badges/inventory');
      if (!res.ok) throw new Error('Failed to fetch badges');
      return res.json();
    },
    enabled: status === 'authenticated',
  });

  // Equip badge mutation
  const equipMutation = useMutation({
    mutationFn: async (badgeId: string) => {
      setLoadingBadgeId(badgeId);
      const res = await fetch('/api/badges/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeId }),
      });
      if (!res.ok) throw new Error('Equip failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
      soundManager.click();
      setToast({
        message: 'Badge equipped!',
        type: 'success',
        visible: true,
      });
      setLoadingBadgeId(null);
    },
    onError: () => {
      soundManager.error();
      setToast({
        message: 'Failed to equip badge',
        type: 'error',
        visible: true,
      });
      setLoadingBadgeId(null);
    },
  });

  // Unequip badge mutation
  const unequipMutation = useMutation({
    mutationFn: async (badgeId: string) => {
      setLoadingBadgeId(badgeId);
      const res = await fetch('/api/badges/unequip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeId }),
      });
      if (!res.ok) throw new Error('Unequip failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
      soundManager.click();
      setToast({
        message: 'Badge unequipped',
        type: 'info',
        visible: true,
      });
      setLoadingBadgeId(null);
    },
    onError: () => {
      soundManager.error();
      setToast({
        message: 'Failed to unequip badge',
        type: 'error',
        visible: true,
      });
      setLoadingBadgeId(null);
    },
  });

  if (status === 'loading' || isLoading) {
    return <LoadingScreen message="LOADING BADGES" />;
  }

  if (!session || !data) {
    return <LoadingScreen message="LOADING BADGE DATA" />;
  }

  const unlockedCount = data.userBadges.length;
  const totalCount = data.badges.length;
  const equippedCount = data.userBadges.filter((ub) => ub.equipped).length;

  return (
    <PageLayout
      title="BADGES"
      subtitle="Collect and equip badges for stat boosts"
    >
      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {/* Stats Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 md:mb-12"
      >
        <PixelFrame variant="gold" padding="lg">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
            <div className="text-center min-w-[90px]">
              <p className="font-pixel-heading text-[20px] md:text-[24px] text-[var(--xp-light)] mb-2">
                {unlockedCount}/{totalCount}
              </p>
              <p className="font-pixel text-[7px] md:text-[8px] text-[var(--gray-medium)]">
                UNLOCKED
              </p>
            </div>
            <div className="text-center min-w-[90px]">
              <p className="font-pixel-heading text-[20px] md:text-[24px] text-[var(--gold-light)] mb-2">
                {equippedCount}/3
              </p>
              <p className="font-pixel text-[7px] md:text-[8px] text-[var(--gray-medium)]">
                EQUIPPED
              </p>
            </div>
            <div className="text-center min-w-[90px]">
              <p className="font-pixel-heading text-[20px] md:text-[24px] text-white mb-2">
                {Math.round((unlockedCount / (totalCount || 1)) * 100)}%
              </p>
              <p className="font-pixel text-[7px] md:text-[8px] text-[var(--gray-medium)]">
                COLLECTION
              </p>
            </div>
          </div>
        </PixelFrame>
      </motion.div>

      {/* Badge Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 md:mb-12"
      >
        <BadgeGrid
          badges={data.badges}
          userBadges={data.userBadges}
          onEquipBadge={(badgeId) => equipMutation.mutate(badgeId)}
          onUnequipBadge={(badgeId) => unequipMutation.mutate(badgeId)}
          loadingBadgeId={loadingBadgeId}
        />
      </motion.div>

      {/* Info hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 md:mt-10"
      >
        <PixelFrame variant="stone" padding="lg">
          <div className="flex items-start gap-4">
            <IconBadge size={28} color="#8b949e" />
            <div className="flex-1">
              <p className="font-pixel text-[9px] md:text-[10px] text-[var(--gray-highlight)] mb-3">
                BADGE TIPS
              </p>
              <ul className="font-pixel text-[7px] md:text-[8px] text-[var(--gray-medium)] space-y-2">
                <li>• Complete quests and achievements to unlock new badges</li>
                <li>• Equip up to 3 badges at once for stat boosts</li>
                <li>• Different badges enhance different character stats</li>
                <li>• Rare badges provide stronger bonuses</li>
              </ul>
            </div>
          </div>
        </PixelFrame>
      </motion.div>
    </PageLayout>
  );
}
