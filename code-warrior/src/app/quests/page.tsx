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
      <div className="min-h-screen bg-midnight-void flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📜</div>
          <p className="text-loot-gold font-pixel">LOADING QUESTS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-void">
      {/* Header with navigation */}
      <div className="border-b-2 border-loot-gold/20 bg-midnight-void/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 rounded-lg border-2 border-mana-blue/30 bg-midnight-void/50 hover:bg-midnight-void/70 transition-colors font-mono text-sm"
          >
            ← BACK TO DASHBOARD
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
              await fetch('/api/quests', { method: 'POST' });
              await loadQuests();
            }}
            className="px-4 py-2 rounded-lg border-2 border-loot-gold/30 bg-loot-gold/10 hover:bg-loot-gold/20 transition-colors font-mono text-sm text-loot-gold"
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
