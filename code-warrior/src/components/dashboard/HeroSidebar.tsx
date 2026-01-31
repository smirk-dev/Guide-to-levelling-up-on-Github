'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PixelFrame, PixelAvatar, PixelBadge, PixelProgress } from '../ui/PixelComponents';
import { AchievementBadges } from '../rpg/AchievementBadges';
import { IconRank } from '../icons/PixelIcons';
import { getRankDisplayName } from '@/lib/game-logic';
import type { RankTier, GitHubAchievementBadge } from '@/types/database';

interface LeaderboardUser {
  id: string;
  username: string;
  avatar_url: string;
  xp: number;
  rank_tier: RankTier;
}

interface HeroSidebarProps {
  username: string;
  avatarUrl: string | null;
  xp: number;
  rankTier: RankTier;
  level: number;
  xpToNextRank: number;
  badges: GitHubAchievementBadge[];
  leaderboardUsers?: LeaderboardUser[];
  currentUserId: string;
  userRank?: number;
  totalUsers?: number;
}

export const HeroSidebar: React.FC<HeroSidebarProps> = ({
  username,
  avatarUrl,
  xp,
  rankTier,
  level,
  xpToNextRank,
  badges,
  leaderboardUsers = [],
  currentUserId,
  userRank,
  totalUsers,
}) => {
  // Calculate progress to next rank
  const rankProgress = xpToNextRank === Infinity ? 100 : (xp / xpToNextRank) * 100;

  // Get display users for mini leaderboard (user and surrounding players)
  const getDisplayUsers = () => {
    if (!leaderboardUsers.length) return [];
    
    const userIndex = leaderboardUsers.findIndex(u => u.id === currentUserId);
    const displayUsers: { user: LeaderboardUser; rank: number }[] = [];
    
    if (userIndex === -1) {
      // User not in top list, show top 3
      leaderboardUsers.slice(0, 3).forEach((u, idx) => {
        displayUsers.push({ user: u, rank: idx + 1 });
      });
    } else {
      // Show user and surrounding players
      const userRankNum = userIndex + 1;
      if (userIndex > 0) {
        displayUsers.push({ user: leaderboardUsers[userIndex - 1], rank: userRankNum - 1 });
      }
      displayUsers.push({ user: leaderboardUsers[userIndex], rank: userRankNum });
      if (userIndex < leaderboardUsers.length - 1) {
        displayUsers.push({ user: leaderboardUsers[userIndex + 1], rank: userRankNum + 1 });
      }
    }
    
    return displayUsers;
  };

  const displayUsers = getDisplayUsers();

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="hero-sidebar"
      aria-label="Player profile sidebar"
    >
      <PixelFrame variant="gold" padding="md">
        {/* Avatar Section */}
        <div className="hero-avatar-section">
          <div className="hero-avatar-container">
            <div className="hero-avatar-glow" />
            <PixelAvatar src={avatarUrl} alt={username} size="lg" glow />
          </div>

          {/* Username */}
          <h2 className="hero-username">{username}</h2>

          {/* Rank Display */}
          <div className="hero-rank-display">
            <IconRank size={16} />
            <span className="hero-rank-text">{getRankDisplayName(rankTier)}</span>
          </div>

          {/* Rank Badge */}
          <PixelBadge variant="gold" size="sm" className="mt-2">
            {rankTier} Rank
          </PixelBadge>

          {/* Level */}
          <p className="hero-level">Level {level}</p>
        </div>

        {/* XP Progress */}
        <div className="hero-xp-section">
          <div className="hero-xp-header">
            <span className="hero-xp-label">XP to Next Rank</span>
            <span className="hero-xp-value">
              {xp.toLocaleString()} / {xpToNextRank === Infinity ? 'MAX' : xpToNextRank.toLocaleString()}
            </span>
          </div>
          <div className="stat-bar stat-bar-xp stat-bar-lg">
            <div
              className="stat-bar-fill"
              style={{ width: `${Math.min(rankProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="hero-divider" />

        {/* Equipped Badges */}
        <div className="hero-badges-section">
          <h4 className="hero-section-title">Achievements</h4>
          <AchievementBadges badges={badges} size="md" />
          {badges.length === 0 && (
            <p className="hero-empty-text">Sync to discover badges!</p>
          )}
        </div>

        {/* Divider */}
        <div className="hero-divider" />

        {/* Rank Position */}
        {userRank && totalUsers && (
          <div className="hero-rank-position">
            <span className="hero-rank-position-icon">🏆</span>
            <span className="hero-rank-position-text">
              #{userRank} of {totalUsers}
            </span>
          </div>
        )}

        {/* Mini Leaderboard */}
        {displayUsers.length > 0 && (
          <div className="hero-leaderboard-section">
            <div className="hero-leaderboard-header">
              <h4 className="hero-section-title">Leaderboard</h4>
              <Link 
                href="/leaderboard" 
                className="hero-view-all-link"
              >
                View All →
              </Link>
            </div>
            
            <div className="hero-leaderboard-list">
              {displayUsers.map(({ user, rank }) => {
                const isCurrentUser = user.id === currentUserId;
                return (
                  <div
                    key={user.id}
                    className={`hero-leaderboard-item ${isCurrentUser ? 'hero-leaderboard-item-current' : ''}`}
                  >
                    <span className={`hero-leaderboard-rank ${isCurrentUser ? 'hero-leaderboard-rank-current' : ''}`}>
                      #{rank}
                    </span>
                    <div className="hero-leaderboard-avatar">
                      <img
                        src={user.avatar_url}
                        alt={`${user.username}'s avatar`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className={`hero-leaderboard-name ${isCurrentUser ? 'hero-leaderboard-name-current' : ''}`}>
                      {user.username}
                    </span>
                    <span className={`hero-leaderboard-xp ${isCurrentUser ? 'hero-leaderboard-xp-current' : ''}`}>
                      {user.xp >= 1000 ? `${(user.xp / 1000).toFixed(1)}k` : user.xp}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </PixelFrame>
    </motion.aside>
  );
};

export default HeroSidebar;
