'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PixelFrame } from '../ui/PixelComponents';
import { ActivityHeatmap } from '../rpg/ActivityHeatmap';
import type { ContributionDay, RankTier } from '@/types/database';

interface ActivityViewTabProps {
  contributions: ContributionDay[];
  xp: number;
  rankTier: RankTier;
  lastSyncedAt: string | null;
}

// Rank thresholds for progression display
const RANK_THRESHOLDS: { rank: RankTier; xp: number; label: string }[] = [
  { rank: 'C', xp: 0, label: 'C' },
  { rank: 'B', xp: 1000, label: 'B' },
  { rank: 'A', xp: 3000, label: 'A' },
  { rank: 'AA', xp: 6000, label: 'AA' },
  { rank: 'AAA', xp: 10000, label: 'AAA' },
  { rank: 'S', xp: 15000, label: 'S' },
  { rank: 'SS', xp: 25000, label: 'SS' },
  { rank: 'SSS', xp: 50000, label: 'SSS' },
];

export const ActivityViewTab: React.FC<ActivityViewTabProps> = ({
  contributions,
  xp,
  rankTier,
  lastSyncedAt,
}) => {
  // Calculate monthly breakdown from contributions
  const monthlyBreakdown = React.useMemo(() => {
    const months: { [key: string]: number } = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    contributions.forEach(day => {
      const date = new Date(day.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthLabel = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      
      if (!months[monthKey]) {
        months[monthKey] = 0;
      }
      months[monthKey] += day.count;
    });

    // Get last 6 months
    const result: { month: string; count: number }[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthLabel = `${monthNames[date.getMonth()]}`;
      result.push({
        month: monthLabel,
        count: months[monthKey] || 0,
      });
    }
    
    return result;
  }, [contributions]);

  // Calculate total contributions
  const totalContributions = contributions.reduce((sum, day) => sum + day.count, 0);
  
  // Find max for progress bar scaling
  const maxMonthly = Math.max(...monthlyBreakdown.map(m => m.count), 1);

  // Get current rank index and next rank
  const currentRankIndex = RANK_THRESHOLDS.findIndex(r => r.rank === rankTier);
  const nextRank = RANK_THRESHOLDS[currentRankIndex + 1];
  const prevRank = RANK_THRESHOLDS[currentRankIndex];
  
  const progressToNext = nextRank 
    ? ((xp - prevRank.xp) / (nextRank.xp - prevRank.xp)) * 100
    : 100;

  return (
    <div 
      role="tabpanel" 
      id="tabpanel-activity" 
      aria-labelledby="tab-activity"
      className="tab-panel activity-view-tab"
    >
      {/* Contribution Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="activity-heatmap-section"
      >
        <ActivityHeatmap contributions={contributions} />
      </motion.div>

      {/* Monthly Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <PixelFrame variant="stone" padding="md">
          <h4 className="activity-section-title">📈 Monthly Breakdown</h4>
          
          <div className="monthly-breakdown-grid">
            {monthlyBreakdown.map((item, idx) => (
              <div key={idx} className="monthly-breakdown-item">
                <div className="monthly-breakdown-bar-container">
                  <motion.div
                    className="monthly-breakdown-bar"
                    initial={{ height: 0 }}
                    animate={{ height: `${(item.count / maxMonthly) * 100}%` }}
                    transition={{ delay: 0.3 + idx * 0.05, duration: 0.5 }}
                  />
                </div>
                <span className="monthly-breakdown-count">{item.count}</span>
                <span className="monthly-breakdown-month">{item.month}</span>
              </div>
            ))}
          </div>
          
          <div className="monthly-breakdown-total">
            Total: <span className="monthly-breakdown-total-value">{totalContributions}</span> contributions this year
          </div>
        </PixelFrame>
      </motion.div>

      {/* Rank Progression Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <PixelFrame variant="mana" padding="md">
          <h4 className="activity-section-title">⚔️ Rank Progression</h4>
          
          {/* Progress to next rank */}
          {nextRank && (
            <div className="rank-progress-section">
              <div className="rank-progress-header">
                <span className="rank-progress-label">Progress to {nextRank.label}</span>
                <span className="rank-progress-value">
                  {xp.toLocaleString()} / {nextRank.xp.toLocaleString()} XP
                </span>
              </div>
              <div className="stat-bar stat-bar-xp stat-bar-lg">
                <div
                  className="stat-bar-fill"
                  style={{ width: `${Math.min(progressToNext, 100)}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Rank milestones */}
          <div className="rank-milestones-grid">
            {RANK_THRESHOLDS.map((threshold, idx) => {
              const isCurrent = threshold.rank === rankTier;
              const isPassed = threshold.xp <= xp;
              
              return (
                <div
                  key={threshold.rank}
                  className={`rank-milestone ${
                    isCurrent
                      ? 'rank-milestone-current'
                      : isPassed
                      ? 'rank-milestone-passed'
                      : 'rank-milestone-locked'
                  }`}
                >
                  <span className={`rank-milestone-label ${
                    isCurrent
                      ? 'rank-milestone-label-current'
                      : isPassed
                      ? 'rank-milestone-label-passed'
                      : ''
                  }`}>
                    {threshold.label}
                  </span>
                  <span className="rank-milestone-xp">
                    {threshold.xp.toLocaleString()}
                  </span>
                  {isPassed && <span className="rank-milestone-check">✓</span>}
                </div>
              );
            })}
          </div>
        </PixelFrame>
      </motion.div>

      {/* Last Sync Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <PixelFrame variant="stone" padding="sm">
          <div className="last-sync-info">
            <span className="last-sync-label">📡 Last Synced:</span>
            <span className="last-sync-value">
              {lastSyncedAt 
                ? new Date(lastSyncedAt).toLocaleString()
                : 'Never synced'}
            </span>
          </div>
        </PixelFrame>
      </motion.div>
    </div>
  );
};

export default ActivityViewTab;
