'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import QuestLog from '@/components/rpg/QuestLog';
import RewardModal from '@/components/rpg/RewardModal';
import type { Quest, UserQuest } from '@/types/database';
import { motion } from 'framer-motion';

export default function QuestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [userQuests, setUserQuests] = useState<UserQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardData, setRewardData] = useState<{
    xpGained: number;
    questTitle: string;
    badgeAwarded: boolean;
  } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      loadQuests();
    }
  }, [status, router]);

  const loadQuests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/quests');
      const data = await response.json();

      if (response.ok) {
        setQuests(data.quests || []);
        setUserQuests(data.userQuests || []);
      }
    } catch (error) {
      console.error('Error loading quests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimQuest = async (questId: string) => {
    try {
      const quest = quests.find(q => q.id === questId);
      if (!quest) return;

      const response = await fetch('/api/quests/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show reward modal
        setRewardData({
          xpGained: data.xpGained,
          questTitle: quest.title,
          badgeAwarded: data.badgeAwarded || false,
        });
        setShowRewardModal(true);

        // Reload quests to update UI
        await loadQuests();
      } else {
        alert(data.error || 'Failed to claim quest');
      }
    } catch (error) {
      console.error('Error claiming quest:', error);
      alert('Failed to claim quest');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight-void-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📜</div>
          <p className="text-loot-gold-2 font-pixel no-smooth">LOADING QUESTS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-void-0">
      {/* Header with navigation */}
      <div className="border-b-3 border-loot-gold-1 bg-midnight-void-1 sticky top-0 z-10 pixel-perfect">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ y: 1 }}
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 rounded-pixel border-3 bg-midnight-void-2 border-mana-blue-1 font-mono text-sm pixel-perfect"
            style={{
              borderColor: 'var(--mana-blue-2) var(--mana-blue-0) var(--mana-blue-0) var(--mana-blue-2)',
              boxShadow: 'inset -2px -2px 0 rgba(0,0,0,0.2), 2px 2px 0 rgba(0,0,0,0.5)'
            }}
          >
            ← BACK TO DASHBOARD
          </motion.button>

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ y: 1 }}
            onClick={async () => {
              await fetch('/api/quests', { method: 'POST' });
              await loadQuests();
            }}
            className="px-4 py-2 rounded-pixel border-3 bg-loot-gold-2 border-loot-gold-2 font-mono text-sm text-midnight-void-0 font-pixel no-smooth pixel-perfect"
            style={{
              borderColor: 'var(--loot-gold-4) var(--loot-gold-0) var(--loot-gold-0) var(--loot-gold-4)',
              boxShadow: 'inset -2px -2px 0 rgba(0,0,0,0.2), 2px 2px 0 rgba(0,0,0,0.5)'
            }}
          >
            ⟳ VERIFY PROGRESS
          </motion.button>
        </div>
      </div>

      {/* Quest Log */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <QuestLog
          quests={quests}
          userQuests={userQuests}
          onClaimQuest={handleClaimQuest}
        />
      </div>

      {/* Reward Modal */}
      {rewardData && (
        <RewardModal
          isOpen={showRewardModal}
          onClose={() => setShowRewardModal(false)}
          xpGained={rewardData.xpGained}
          questTitle={rewardData.questTitle}
          badgeAwarded={rewardData.badgeAwarded}
        />
      )}
    </div>
  );
}
