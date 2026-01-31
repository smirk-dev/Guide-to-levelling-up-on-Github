'use client';

import React from 'react';

/* ============================================
   🎮 16-BIT PIXEL ICONS v2.0
   Cyber-Fantasy RPG Icon Set
   
   All icons use:
   - 16x16 pixel grid (scalable via viewBox)
   - Crisp pixelated rendering
   - Neon color support via 'color' prop
   ============================================ */

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

const defaultColor = '#00F0FF'; // Cyber Cyan

/* ============================================
   ⚔️ GAME ICONS
   ============================================ */

// Pixel Sword - Main quest/action icon
export const IconPixelSword: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#FFD700', 
  className = '',
  style 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none"
    className={className}
    style={{ imageRendering: 'pixelated', ...style }}
  >
    {/* Blade */}
    <rect x="12" y="1" width="2" height="2" fill={color} />
    <rect x="10" y="3" width="2" height="2" fill={color} />
    <rect x="8" y="5" width="2" height="2" fill={color} />
    <rect x="6" y="7" width="2" height="2" fill={color} />
    {/* Guard */}
    <rect x="3" y="9" width="2" height="2" fill="#71717A" />
    <rect x="5" y="9" width="2" height="2" fill="#71717A" />
    <rect x="7" y="9" width="2" height="2" fill="#71717A" />
    {/* Handle */}
    <rect x="4" y="10" width="2" height="2" fill="#8B4513" />
    <rect x="2" y="12" width="2" height="2" fill="#8B4513" />
    {/* Highlight */}
    <rect x="11" y="2" width="1" height="1" fill="#FFFFFF" fillOpacity="0.5" />
    <rect x="9" y="4" width="1" height="1" fill="#FFFFFF" fillOpacity="0.5" />
  </svg>
);

// Heart - Health/HP icon
export const IconPixelHeart: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#EF4444', 
  className = '',
  style 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none"
    className={className}
    style={{ imageRendering: 'pixelated', ...style }}
  >
    <rect x="2" y="3" width="2" height="2" fill={color} />
    <rect x="4" y="2" width="2" height="2" fill={color} />
    <rect x="4" y="4" width="2" height="2" fill={color} />
    <rect x="2" y="5" width="2" height="2" fill={color} />
    <rect x="10" y="3" width="2" height="2" fill={color} />
    <rect x="10" y="2" width="2" height="2" fill={color} />
    <rect x="12" y="3" width="2" height="2" fill={color} />
    <rect x="10" y="4" width="2" height="2" fill={color} />
    <rect x="12" y="5" width="2" height="2" fill={color} />
    <rect x="6" y="4" width="4" height="2" fill={color} />
    <rect x="4" y="6" width="8" height="2" fill={color} />
    <rect x="4" y="8" width="8" height="2" fill={color} />
    <rect x="6" y="10" width="4" height="2" fill={color} />
    <rect x="7" y="12" width="2" height="2" fill={color} />
    {/* Highlight */}
    <rect x="4" y="3" width="1" height="1" fill="#FFFFFF" fillOpacity="0.4" />
    <rect x="5" y="4" width="1" height="1" fill="#FFFFFF" fillOpacity="0.4" />
  </svg>
);

// Mana Crystal - Mana/MP icon
export const IconPixelMana: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#00F0FF', 
  className = '',
  style 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none"
    className={className}
    style={{ imageRendering: 'pixelated', ...style }}
  >
    {/* Crystal body */}
    <rect x="7" y="1" width="2" height="2" fill={color} />
    <rect x="5" y="3" width="6" height="2" fill={color} />
    <rect x="4" y="5" width="8" height="2" fill={color} />
    <rect x="4" y="7" width="8" height="2" fill={color} />
    <rect x="5" y="9" width="6" height="2" fill={color} />
    <rect x="6" y="11" width="4" height="2" fill={color} />
    <rect x="7" y="13" width="2" height="2" fill={color} />
    {/* Highlights */}
    <rect x="5" y="4" width="1" height="3" fill="#FFFFFF" fillOpacity="0.5" />
    <rect x="6" y="3" width="1" height="1" fill="#FFFFFF" fillOpacity="0.5" />
  </svg>
);

// Star - XP/Achievement icon
export const IconPixelStar: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#FFD700', 
  className = '',
  style 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none"
    className={className}
    style={{ imageRendering: 'pixelated', ...style }}
  >
    <rect x="7" y="0" width="2" height="2" fill={color} />
    <rect x="7" y="2" width="2" height="2" fill={color} />
    <rect x="5" y="4" width="6" height="2" fill={color} />
    <rect x="1" y="5" width="14" height="2" fill={color} />
    <rect x="3" y="7" width="10" height="2" fill={color} />
    <rect x="4" y="9" width="8" height="2" fill={color} />
    <rect x="3" y="11" width="4" height="2" fill={color} />
    <rect x="9" y="11" width="4" height="2" fill={color} />
    <rect x="2" y="13" width="2" height="2" fill={color} />
    <rect x="12" y="13" width="2" height="2" fill={color} />
    {/* Highlight */}
    <rect x="6" y="5" width="1" height="1" fill="#FFFFFF" fillOpacity="0.4" />
  </svg>
);

// Trophy - Achievement/Win icon
export const IconPixelTrophy: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#FFD700', 
  className = '',
  style 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none"
    className={className}
    style={{ imageRendering: 'pixelated', ...style }}
  >
    {/* Cup body */}
    <rect x="4" y="2" width="8" height="2" fill={color} />
    <rect x="3" y="2" width="2" height="4" fill={color} />
    <rect x="11" y="2" width="2" height="4" fill={color} />
    <rect x="4" y="4" width="8" height="2" fill={color} />
    <rect x="5" y="6" width="6" height="2" fill={color} />
    <rect x="6" y="8" width="4" height="2" fill={color} />
    {/* Stem */}
    <rect x="7" y="10" width="2" height="2" fill={color} />
    {/* Base */}
    <rect x="5" y="12" width="6" height="2" fill={color} />
    {/* Handles */}
    <rect x="1" y="3" width="2" height="2" fill={color} />
    <rect x="2" y="5" width="2" height="2" fill={color} />
    <rect x="13" y="3" width="2" height="2" fill={color} />
    <rect x="12" y="5" width="2" height="2" fill={color} />
    {/* Highlights */}
    <rect x="5" y="3" width="1" height="2" fill="#FFFFFF" fillOpacity="0.4" />
  </svg>
);

// Shield - Defense/Protection icon
export const IconPixelShield: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#8B5CF6', 
  className = '',
  style 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none"
    className={className}
    style={{ imageRendering: 'pixelated', ...style }}
  >
    <rect x="3" y="1" width="10" height="2" fill={color} />
    <rect x="2" y="3" width="12" height="2" fill={color} />
    <rect x="2" y="5" width="12" height="2" fill={color} />
    <rect x="2" y="7" width="12" height="2" fill={color} />
    <rect x="3" y="9" width="10" height="2" fill={color} />
    <rect x="4" y="11" width="8" height="2" fill={color} />
    <rect x="6" y="13" width="4" height="2" fill={color} />
    {/* Emblem - star center */}
    <rect x="7" y="4" width="2" height="2" fill="#FFD700" />
    <rect x="6" y="6" width="4" height="2" fill="#FFD700" />
    <rect x="7" y="8" width="2" height="2" fill="#FFD700" />
    {/* Highlight */}
    <rect x="4" y="2" width="2" height="1" fill="#FFFFFF" fillOpacity="0.3" />
  </svg>
);

// Scroll - Quest/Mission icon
export const IconPixelScroll: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#E4C690', 
  className = '',
  style 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none"
    className={className}
    style={{ imageRendering: 'pixelated', ...style }}
  >
    {/* Top roll */}
    <rect x="2" y="1" width="12" height="2" fill="#8B7355" />
    <rect x="3" y="3" width="10" height="1" fill={color} />
    {/* Body */}
    <rect x="3" y="4" width="10" height="2" fill={color} />
    <rect x="3" y="6" width="10" height="2" fill={color} />
    <rect x="3" y="8" width="10" height="2" fill={color} />
    <rect x="3" y="10" width="10" height="2" fill={color} />
    {/* Bottom roll */}
    <rect x="3" y="12" width="10" height="1" fill={color} />
    <rect x="2" y="13" width="12" height="2" fill="#8B7355" />
    {/* Text lines */}
    <rect x="5" y="5" width="6" height="1" fill="#71717A" />
    <rect x="5" y="7" width="4" height="1" fill="#71717A" />
    <rect x="5" y="9" width="5" height="1" fill="#71717A" />
    {/* Highlight */}
    <rect x="4" y="4" width="1" height="8" fill="#FFFFFF" fillOpacity="0.2" />
  </svg>
);

// Rank/Crown icon
export const IconPixelCrown: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#FFD700', 
  className = '',
  style 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none"
    className={className}
    style={{ imageRendering: 'pixelated', ...style }}
  >
    <rect x="1" y="4" width="2" height="2" fill={color} />
    <rect x="7" y="2" width="2" height="2" fill={color} />
    <rect x="13" y="4" width="2" height="2" fill={color} />
    <rect x="2" y="6" width="2" height="2" fill={color} />
    <rect x="6" y="4" width="4" height="2" fill={color} />
    <rect x="12" y="6" width="2" height="2" fill={color} />
    <rect x="3" y="8" width="10" height="2" fill={color} />
    <rect x="2" y="10" width="12" height="2" fill={color} />
    <rect x="2" y="12" width="12" height="2" fill={color} />
    {/* Gems */}
    <rect x="4" y="10" width="2" height="2" fill="#EF4444" />
    <rect x="7" y="10" width="2" height="2" fill="#00F0FF" />
    <rect x="10" y="10" width="2" height="2" fill="#22C55E" />
    {/* Highlights */}
    <rect x="3" y="8" width="1" height="1" fill="#FFFFFF" fillOpacity="0.4" />
  </svg>
);

// Potion - Power-up icon
export const IconPixelPotion: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#EF4444', 
  className = '',
  style 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none"
    className={className}
    style={{ imageRendering: 'pixelated', ...style }}
  >
    {/* Cork */}
    <rect x="6" y="1" width="4" height="2" fill="#8B7355" />
    {/* Neck */}
    <rect x="6" y="3" width="4" height="2" fill="#D4D4D8" />
    {/* Body */}
    <rect x="4" y="5" width="8" height="2" fill="#D4D4D8" />
    <rect x="3" y="7" width="10" height="2" fill="#D4D4D8" />
    <rect x="3" y="9" width="10" height="2" fill={color} />
    <rect x="3" y="11" width="10" height="2" fill={color} />
    <rect x="4" y="13" width="8" height="2" fill={color} />
    {/* Liquid highlight */}
    <rect x="5" y="9" width="2" height="3" fill="#FFFFFF" fillOpacity="0.3" />
    {/* Bubbles */}
    <rect x="8" y="10" width="1" height="1" fill="#FFFFFF" fillOpacity="0.4" />
    <rect x="10" y="12" width="1" height="1" fill="#FFFFFF" fillOpacity="0.4" />
  </svg>
);

/* ============================================
   🔧 UI ICONS
   ============================================ */

// Dashboard icon
export const IconPixelDashboard: React.FC<IconProps> = ({ 
  size = 24, 
  color = defaultColor, 
  className = '',
  style 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none"
    className={className}
    style={{ imageRendering: 'pixelated', ...style }}
  >
    <rect x="1" y="1" width="6" height="6" fill={color} />
    <rect x="9" y="1" width="6" height="4" fill={color} />
    <rect x="1" y="9" width="6" height="6" fill={color} />
    <rect x="9" y="7" width="6" height="8" fill={color} />
    {/* Inner details */}
    <rect x="2" y="2" width="4" height="4" fill="var(--obsidian-darker)" fillOpacity="0.5" />
    <rect x="10" y="2" width="4" height="2" fill="var(--obsidian-darker)" fillOpacity="0.5" />
    <rect x="2" y="10" width="4" height="4" fill="var(--obsidian-darker)" fillOpacity="0.5" />
    <rect x="10" y="8" width="4" height="6" fill="var(--obsidian-darker)" fillOpacity="0.5" />
  </svg>
);

// Sync/Refresh icon
export const IconPixelSync: React.FC<IconProps> = ({ 
  size = 24, 
  color = defaultColor, 
  className = '',
  style 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none"
    className={className}
    style={{ imageRendering: 'pixelated', ...style }}
  >
    {/* Top arrow */}
    <rect x="10" y="1" width="2" height="2" fill={color} />
    <rect x="12" y="3" width="2" height="2" fill={color} />
    <rect x="6" y="3" width="6" height="2" fill={color} />
    <rect x="4" y="5" width="2" height="2" fill={color} />
    <rect x="2" y="5" width="2" height="4" fill={color} />
    {/* Bottom arrow */}
    <rect x="4" y="13" width="2" height="2" fill={color} />
    <rect x="2" y="11" width="2" height="2" fill={color} />
    <rect x="4" y="11" width="6" height="2" fill={color} />
    <rect x="10" y="9" width="2" height="2" fill={color} />
    <rect x="12" y="7" width="2" height="4" fill={color} />
  </svg>
);

// Menu/Hamburger icon
export const IconPixelMenu: React.FC<IconProps> = ({ 
  size = 24, 
  color = defaultColor, 
  className = '',
  style 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none"
    className={className}
    style={{ imageRendering: 'pixelated', ...style }}
  >
    <rect x="2" y="3" width="12" height="2" fill={color} />
    <rect x="2" y="7" width="12" height="2" fill={color} />
    <rect x="2" y="11" width="12" height="2" fill={color} />
  </svg>
);

// Logout/Exit icon
export const IconPixelLogout: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#EF4444', 
  className = '',
  style 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none"
    className={className}
    style={{ imageRendering: 'pixelated', ...style }}
  >
    {/* Door frame */}
    <rect x="2" y="2" width="2" height="12" fill="#71717A" />
    <rect x="2" y="2" width="6" height="2" fill="#71717A" />
    <rect x="2" y="12" width="6" height="2" fill="#71717A" />
    {/* Arrow */}
    <rect x="8" y="6" width="2" height="4" fill={color} />
    <rect x="10" y="6" width="2" height="4" fill={color} />
    <rect x="12" y="7" width="2" height="2" fill={color} />
    <rect x="11" y="5" width="2" height="2" fill={color} />
    <rect x="11" y="9" width="2" height="2" fill={color} />
  </svg>
);

// GitHub icon
export const IconPixelGitHub: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#FFFFFF', 
  className = '',
  style 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none"
    className={className}
    style={{ imageRendering: 'pixelated', ...style }}
  >
    <rect x="5" y="1" width="6" height="2" fill={color} />
    <rect x="3" y="3" width="2" height="2" fill={color} />
    <rect x="11" y="3" width="2" height="2" fill={color} />
    <rect x="2" y="5" width="2" height="4" fill={color} />
    <rect x="12" y="5" width="2" height="4" fill={color} />
    <rect x="3" y="9" width="2" height="2" fill={color} />
    <rect x="11" y="9" width="2" height="2" fill={color} />
    <rect x="5" y="11" width="2" height="2" fill={color} />
    <rect x="9" y="11" width="2" height="2" fill={color} />
    <rect x="4" y="13" width="2" height="2" fill={color} />
    <rect x="7" y="11" width="2" height="4" fill={color} />
    {/* Eyes */}
    <rect x="5" y="6" width="2" height="2" fill="var(--obsidian-darkest)" />
    <rect x="9" y="6" width="2" height="2" fill="var(--obsidian-darkest)" />
  </svg>
);

// Leaderboard icon
export const IconPixelLeaderboard: React.FC<IconProps> = ({ 
  size = 24, 
  color = defaultColor, 
  className = '',
  style 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none"
    className={className}
    style={{ imageRendering: 'pixelated', ...style }}
  >
    {/* Podiums */}
    <rect x="1" y="10" width="4" height="5" fill="#A1A1AA" /> {/* 3rd */}
    <rect x="6" y="6" width="4" height="9" fill="#FFD700" /> {/* 1st */}
    <rect x="11" y="8" width="4" height="7" fill="#D4D4D8" /> {/* 2nd */}
    {/* Numbers */}
    <rect x="2" y="11" width="2" height="1" fill="var(--obsidian-darkest)" />
    <rect x="7" y="7" width="2" height="2" fill="var(--obsidian-darkest)" />
    <rect x="12" y="9" width="2" height="1" fill="var(--obsidian-darkest)" />
    {/* Crown on 1st */}
    <rect x="7" y="3" width="2" height="2" fill="#FFD700" />
    <rect x="6" y="4" width="1" height="1" fill="#FFD700" />
    <rect x="9" y="4" width="1" height="1" fill="#FFD700" />
  </svg>
);

// Badge icon
export const IconPixelBadge: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#8B5CF6', 
  className = '',
  style 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none"
    className={className}
    style={{ imageRendering: 'pixelated', ...style }}
  >
    <rect x="5" y="1" width="6" height="2" fill={color} />
    <rect x="3" y="3" width="10" height="2" fill={color} />
    <rect x="2" y="5" width="12" height="2" fill={color} />
    <rect x="2" y="7" width="12" height="2" fill={color} />
    <rect x="3" y="9" width="10" height="2" fill={color} />
    <rect x="5" y="11" width="6" height="2" fill={color} />
    <rect x="6" y="13" width="4" height="2" fill={color} />
    {/* Star center */}
    <rect x="7" y="5" width="2" height="2" fill="#FFD700" />
    <rect x="6" y="6" width="1" height="1" fill="#FFD700" />
    <rect x="9" y="6" width="1" height="1" fill="#FFD700" />
  </svg>
);

/* ============================================
   📦 EXPORT ALL ICONS
   ============================================ */

export const PixelIconsV2 = {
  // Game
  Sword: IconPixelSword,
  Heart: IconPixelHeart,
  Mana: IconPixelMana,
  Star: IconPixelStar,
  Trophy: IconPixelTrophy,
  Shield: IconPixelShield,
  Scroll: IconPixelScroll,
  Crown: IconPixelCrown,
  Potion: IconPixelPotion,
  // UI
  Dashboard: IconPixelDashboard,
  Sync: IconPixelSync,
  Menu: IconPixelMenu,
  Logout: IconPixelLogout,
  GitHub: IconPixelGitHub,
  Leaderboard: IconPixelLeaderboard,
  Badge: IconPixelBadge,
};

export default PixelIconsV2;
