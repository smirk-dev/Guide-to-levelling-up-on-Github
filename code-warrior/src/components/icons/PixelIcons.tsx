'use client';

import React from 'react';

// All icons are designed as 16x16 pixel art with 2px black outlines
// Using pixelated SVG paths for authentic retro look

interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

// Helper to create consistent icon wrapper
const IconWrapper: React.FC<{ children: React.ReactNode; size: number; className?: string }> = ({
  children,
  size,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ imageRendering: 'pixelated' }}
  >
    {children}
  </svg>
);

// ============================================
// CORE GAME ICONS
// ============================================

export const IconSword: React.FC<IconProps> = ({ size = 24, className = '', color = '#ffd700' }) => (
  <IconWrapper size={size} className={className}>
    <rect x="12" y="2" width="2" height="2" fill={color} />
    <rect x="10" y="4" width="2" height="2" fill={color} />
    <rect x="8" y="6" width="2" height="2" fill={color} />
    <rect x="6" y="8" width="2" height="2" fill={color} />
    <rect x="4" y="10" width="2" height="2" fill={color} />
    <rect x="2" y="12" width="2" height="2" fill="#8b7000" />
    <rect x="4" y="12" width="2" height="2" fill="#8b7000" />
    <rect x="2" y="10" width="2" height="2" fill="#8b7000" />
    {/* Black outline */}
    <rect x="14" y="2" width="2" height="2" fill="#000" />
    <rect x="12" y="0" width="2" height="2" fill="#000" />
    <rect x="0" y="12" width="2" height="2" fill="#000" />
    <rect x="0" y="14" width="2" height="2" fill="#000" />
  </IconWrapper>
);

export const IconHeart: React.FC<IconProps> = ({ size = 24, className = '', color = '#da3633' }) => (
  <IconWrapper size={size} className={className}>
    <rect x="2" y="4" width="4" height="4" fill={color} />
    <rect x="10" y="4" width="4" height="4" fill={color} />
    <rect x="4" y="2" width="4" height="2" fill={color} />
    <rect x="8" y="2" width="4" height="2" fill={color} />
    <rect x="2" y="6" width="12" height="2" fill={color} />
    <rect x="4" y="8" width="8" height="2" fill={color} />
    <rect x="6" y="10" width="4" height="2" fill={color} />
    {/* Highlight */}
    <rect x="4" y="4" width="2" height="2" fill="#f85149" />
    {/* Black outline */}
    <rect x="0" y="4" width="2" height="4" fill="#000" />
    <rect x="14" y="4" width="2" height="4" fill="#000" />
    <rect x="2" y="2" width="2" height="2" fill="#000" />
    <rect x="12" y="2" width="2" height="2" fill="#000" />
    <rect x="8" y="0" width="2" height="2" fill="#000" />
  </IconWrapper>
);

export const IconMana: React.FC<IconProps> = ({ size = 24, className = '', color = '#58a6ff' }) => (
  <IconWrapper size={size} className={className}>
    <rect x="6" y="2" width="4" height="4" fill={color} />
    <rect x="4" y="6" width="8" height="4" fill={color} />
    <rect x="6" y="10" width="4" height="4" fill={color} />
    {/* Highlight */}
    <rect x="6" y="4" width="2" height="2" fill="#79c0ff" />
    {/* Black outline */}
    <rect x="4" y="0" width="2" height="2" fill="#000" />
    <rect x="10" y="0" width="2" height="2" fill="#000" />
    <rect x="2" y="6" width="2" height="4" fill="#000" />
    <rect x="12" y="6" width="2" height="4" fill="#000" />
  </IconWrapper>
);

export const IconStar: React.FC<IconProps> = ({ size = 24, className = '', color = '#ffd700' }) => (
  <IconWrapper size={size} className={className}>
    <rect x="6" y="0" width="4" height="4" fill={color} />
    <rect x="2" y="4" width="12" height="4" fill={color} />
    <rect x="4" y="8" width="8" height="2" fill={color} />
    <rect x="4" y="10" width="2" height="2" fill={color} />
    <rect x="10" y="10" width="2" height="2" fill={color} />
    <rect x="2" y="12" width="2" height="2" fill={color} />
    <rect x="12" y="12" width="2" height="2" fill={color} />
    {/* Highlight */}
    <rect x="8" y="4" width="2" height="2" fill="#ffed4a" />
    {/* Black outline */}
    <rect x="0" y="4" width="2" height="4" fill="#000" />
    <rect x="14" y="4" width="2" height="4" fill="#000" />
  </IconWrapper>
);

export const IconTrophy: React.FC<IconProps> = ({ size = 24, className = '', color = '#ffd700' }) => (
  <IconWrapper size={size} className={className}>
    {/* Cup body */}
    <rect x="4" y="2" width="8" height="6" fill={color} />
    <rect x="2" y="2" width="2" height="4" fill={color} />
    <rect x="12" y="2" width="2" height="4" fill={color} />
    {/* Stem */}
    <rect x="6" y="8" width="4" height="2" fill={color} />
    {/* Base */}
    <rect x="4" y="10" width="8" height="2" fill={color} />
    <rect x="2" y="12" width="12" height="2" fill="#8b7000" />
    {/* Highlight */}
    <rect x="6" y="4" width="2" height="2" fill="#ffed4a" />
    {/* Black outline */}
    <rect x="0" y="2" width="2" height="4" fill="#000" />
    <rect x="14" y="2" width="2" height="4" fill="#000" />
    <rect x="0" y="12" width="2" height="4" fill="#000" />
    <rect x="14" y="12" width="2" height="4" fill="#000" />
  </IconWrapper>
);

export const IconScroll: React.FC<IconProps> = ({ size = 24, className = '', color = '#b8960f' }) => (
  <IconWrapper size={size} className={className}>
    {/* Main parchment */}
    <rect x="4" y="2" width="8" height="12" fill="#f4e4bc" />
    {/* Roll top */}
    <rect x="2" y="0" width="12" height="2" fill={color} />
    <rect x="2" y="2" width="2" height="2" fill={color} />
    <rect x="12" y="2" width="2" height="2" fill={color} />
    {/* Roll bottom */}
    <rect x="2" y="14" width="12" height="2" fill={color} />
    <rect x="2" y="12" width="2" height="2" fill={color} />
    <rect x="12" y="12" width="2" height="2" fill={color} />
    {/* Text lines */}
    <rect x="6" y="5" width="4" height="1" fill="#8b7000" />
    <rect x="6" y="7" width="4" height="1" fill="#8b7000" />
    <rect x="6" y="9" width="4" height="1" fill="#8b7000" />
    {/* Black outline */}
    <rect x="0" y="0" width="2" height="2" fill="#000" />
    <rect x="14" y="0" width="2" height="2" fill="#000" />
    <rect x="0" y="14" width="2" height="2" fill="#000" />
    <rect x="14" y="14" width="2" height="2" fill="#000" />
  </IconWrapper>
);

export const IconShield: React.FC<IconProps> = ({ size = 24, className = '', color = '#58a6ff' }) => (
  <IconWrapper size={size} className={className}>
    {/* Shield body */}
    <rect x="2" y="0" width="12" height="8" fill={color} />
    <rect x="4" y="8" width="8" height="4" fill={color} />
    <rect x="6" y="12" width="4" height="2" fill={color} />
    {/* Highlight */}
    <rect x="4" y="2" width="4" height="4" fill="#79c0ff" />
    {/* Black outline */}
    <rect x="0" y="0" width="2" height="8" fill="#000" />
    <rect x="14" y="0" width="2" height="8" fill="#000" />
    <rect x="2" y="8" width="2" height="4" fill="#000" />
    <rect x="12" y="8" width="2" height="4" fill="#000" />
  </IconWrapper>
);

export const IconCode: React.FC<IconProps> = ({ size = 24, className = '', color = '#58a6ff' }) => (
  <IconWrapper size={size} className={className}>
    {/* Left bracket */}
    <rect x="2" y="4" width="2" height="2" fill={color} />
    <rect x="4" y="2" width="2" height="2" fill={color} />
    <rect x="4" y="12" width="2" height="2" fill={color} />
    <rect x="2" y="10" width="2" height="2" fill={color} />
    <rect x="0" y="6" width="2" height="4" fill={color} />
    {/* Right bracket */}
    <rect x="12" y="4" width="2" height="2" fill={color} />
    <rect x="10" y="2" width="2" height="2" fill={color} />
    <rect x="10" y="12" width="2" height="2" fill={color} />
    <rect x="12" y="10" width="2" height="2" fill={color} />
    <rect x="14" y="6" width="2" height="4" fill={color} />
    {/* Black outline */}
    <rect x="6" y="0" width="4" height="2" fill="#000" />
    <rect x="6" y="14" width="4" height="2" fill="#000" />
  </IconWrapper>
);

export const IconGitBranch: React.FC<IconProps> = ({ size = 24, className = '', color = '#a371f7' }) => (
  <IconWrapper size={size} className={className}>
    {/* Main branch */}
    <rect x="6" y="0" width="4" height="16" fill={color} />
    {/* Side branch */}
    <rect x="10" y="4" width="4" height="2" fill={color} />
    <rect x="12" y="2" width="2" height="4" fill={color} />
    {/* Nodes */}
    <rect x="4" y="0" width="2" height="2" fill="#bc8cff" />
    <rect x="10" y="0" width="2" height="2" fill="#bc8cff" />
    <rect x="4" y="14" width="2" height="2" fill="#bc8cff" />
    <rect x="10" y="14" width="2" height="2" fill="#bc8cff" />
    <rect x="12" y="4" width="2" height="2" fill="#bc8cff" />
  </IconWrapper>
);

export const IconCommit: React.FC<IconProps> = ({ size = 24, className = '', color = '#2ea043' }) => (
  <IconWrapper size={size} className={className}>
    {/* Circle */}
    <rect x="4" y="4" width="8" height="8" fill={color} />
    <rect x="6" y="2" width="4" height="2" fill={color} />
    <rect x="6" y="12" width="4" height="2" fill={color} />
    <rect x="2" y="6" width="2" height="4" fill={color} />
    <rect x="12" y="6" width="2" height="4" fill={color} />
    {/* Line through */}
    <rect x="0" y="7" width="2" height="2" fill={color} />
    <rect x="14" y="7" width="2" height="2" fill={color} />
    {/* Center */}
    <rect x="6" y="6" width="4" height="4" fill="#56d364" />
  </IconWrapper>
);

export const IconPullRequest: React.FC<IconProps> = ({ size = 24, className = '', color = '#a371f7' }) => (
  <IconWrapper size={size} className={className}>
    {/* Left line */}
    <rect x="2" y="2" width="2" height="12" fill={color} />
    {/* Right line */}
    <rect x="12" y="2" width="2" height="12" fill={color} />
    {/* Arrow */}
    <rect x="4" y="4" width="6" height="2" fill={color} />
    <rect x="6" y="6" width="2" height="2" fill={color} />
    <rect x="8" y="2" width="2" height="2" fill={color} />
    {/* Nodes */}
    <rect x="1" y="0" width="4" height="4" fill="#bc8cff" />
    <rect x="1" y="12" width="4" height="4" fill="#bc8cff" />
    <rect x="11" y="12" width="4" height="4" fill="#bc8cff" />
  </IconWrapper>
);

export const IconIssue: React.FC<IconProps> = ({ size = 24, className = '', color = '#2ea043' }) => (
  <IconWrapper size={size} className={className}>
    {/* Circle */}
    <rect x="4" y="2" width="8" height="12" fill={color} />
    <rect x="2" y="4" width="2" height="8" fill={color} />
    <rect x="12" y="4" width="2" height="8" fill={color} />
    {/* Exclamation mark */}
    <rect x="7" y="4" width="2" height="4" fill="#fff" />
    <rect x="7" y="10" width="2" height="2" fill="#fff" />
  </IconWrapper>
);

export const IconReview: React.FC<IconProps> = ({ size = 24, className = '', color = '#58a6ff' }) => (
  <IconWrapper size={size} className={className}>
    {/* Eye shape */}
    <rect x="2" y="6" width="12" height="4" fill={color} />
    <rect x="4" y="4" width="8" height="2" fill={color} />
    <rect x="4" y="10" width="8" height="2" fill={color} />
    {/* Pupil */}
    <rect x="6" y="6" width="4" height="4" fill="#fff" />
    <rect x="7" y="7" width="2" height="2" fill="#000" />
  </IconWrapper>
);

export const IconXP: React.FC<IconProps> = ({ size = 24, className = '', color = '#ffd700' }) => (
  <IconWrapper size={size} className={className}>
    {/* X */}
    <rect x="0" y="2" width="2" height="2" fill={color} />
    <rect x="2" y="4" width="2" height="2" fill={color} />
    <rect x="4" y="6" width="2" height="4" fill={color} />
    <rect x="2" y="10" width="2" height="2" fill={color} />
    <rect x="0" y="12" width="2" height="2" fill={color} />
    <rect x="6" y="2" width="2" height="2" fill={color} />
    <rect x="6" y="12" width="2" height="2" fill={color} />
    {/* P */}
    <rect x="10" y="2" width="2" height="12" fill={color} />
    <rect x="12" y="2" width="4" height="2" fill={color} />
    <rect x="14" y="4" width="2" height="4" fill={color} />
    <rect x="12" y="8" width="2" height="2" fill={color} />
  </IconWrapper>
);

export const IconChest: React.FC<IconProps> = ({ size = 24, className = '', color = '#8b7000' }) => (
  <IconWrapper size={size} className={className}>
    {/* Chest body */}
    <rect x="2" y="6" width="12" height="8" fill={color} />
    {/* Lid */}
    <rect x="2" y="4" width="12" height="4" fill="#b8960f" />
    <rect x="4" y="2" width="8" height="2" fill="#b8960f" />
    {/* Lock */}
    <rect x="6" y="8" width="4" height="4" fill="#ffd700" />
    <rect x="7" y="9" width="2" height="2" fill="#5c4a00" />
    {/* Metal bands */}
    <rect x="0" y="6" width="2" height="8" fill="#484848" />
    <rect x="14" y="6" width="2" height="8" fill="#484848" />
  </IconWrapper>
);

export const IconBadge: React.FC<IconProps> = ({ size = 24, className = '', color = '#a371f7' }) => (
  <IconWrapper size={size} className={className}>
    {/* Badge body (hexagon-ish) */}
    <rect x="4" y="0" width="8" height="2" fill={color} />
    <rect x="2" y="2" width="12" height="8" fill={color} />
    <rect x="4" y="10" width="8" height="2" fill={color} />
    <rect x="6" y="12" width="4" height="2" fill={color} />
    {/* Star in center */}
    <rect x="7" y="4" width="2" height="2" fill="#fff" />
    <rect x="5" y="6" width="6" height="2" fill="#fff" />
    <rect x="7" y="8" width="2" height="2" fill="#fff" />
  </IconWrapper>
);

export const IconRank: React.FC<IconProps> = ({ size = 24, className = '', color = '#ffd700' }) => (
  <IconWrapper size={size} className={className}>
    {/* Crown */}
    <rect x="2" y="6" width="12" height="8" fill={color} />
    <rect x="2" y="4" width="2" height="2" fill={color} />
    <rect x="7" y="2" width="2" height="4" fill={color} />
    <rect x="12" y="4" width="2" height="2" fill={color} />
    {/* Jewels */}
    <rect x="4" y="8" width="2" height="2" fill="#da3633" />
    <rect x="7" y="8" width="2" height="2" fill="#58a6ff" />
    <rect x="10" y="8" width="2" height="2" fill="#2ea043" />
    {/* Black outline */}
    <rect x="0" y="6" width="2" height="8" fill="#5c4a00" />
    <rect x="14" y="6" width="2" height="8" fill="#5c4a00" />
  </IconWrapper>
);

export const IconArrowRight: React.FC<IconProps> = ({ size = 24, className = '', color = '#e6edf3' }) => (
  <IconWrapper size={size} className={className}>
    <rect x="2" y="7" width="8" height="2" fill={color} />
    <rect x="8" y="5" width="2" height="2" fill={color} />
    <rect x="10" y="7" width="2" height="2" fill={color} />
    <rect x="8" y="9" width="2" height="2" fill={color} />
  </IconWrapper>
);

export const IconArrowLeft: React.FC<IconProps> = ({ size = 24, className = '', color = '#e6edf3' }) => (
  <IconWrapper size={size} className={className}>
    <rect x="6" y="7" width="8" height="2" fill={color} />
    <rect x="6" y="5" width="2" height="2" fill={color} />
    <rect x="4" y="7" width="2" height="2" fill={color} />
    <rect x="6" y="9" width="2" height="2" fill={color} />
  </IconWrapper>
);

export const IconCheck: React.FC<IconProps> = ({ size = 24, className = '', color = '#2ea043' }) => (
  <IconWrapper size={size} className={className}>
    <rect x="12" y="2" width="2" height="2" fill={color} />
    <rect x="10" y="4" width="2" height="2" fill={color} />
    <rect x="8" y="6" width="2" height="2" fill={color} />
    <rect x="6" y="8" width="2" height="2" fill={color} />
    <rect x="4" y="6" width="2" height="2" fill={color} />
    <rect x="2" y="4" width="2" height="2" fill={color} />
  </IconWrapper>
);

export const IconX: React.FC<IconProps> = ({ size = 24, className = '', color = '#da3633' }) => (
  <IconWrapper size={size} className={className}>
    <rect x="2" y="2" width="2" height="2" fill={color} />
    <rect x="4" y="4" width="2" height="2" fill={color} />
    <rect x="6" y="6" width="4" height="4" fill={color} />
    <rect x="10" y="4" width="2" height="2" fill={color} />
    <rect x="12" y="2" width="2" height="2" fill={color} />
    <rect x="4" y="10" width="2" height="2" fill={color} />
    <rect x="2" y="12" width="2" height="2" fill={color} />
    <rect x="10" y="10" width="2" height="2" fill={color} />
    <rect x="12" y="12" width="2" height="2" fill={color} />
  </IconWrapper>
);

export const IconSync: React.FC<IconProps> = ({ size = 24, className = '', color = '#58a6ff' }) => (
  <IconWrapper size={size} className={className}>
    {/* Circle arrows */}
    <rect x="6" y="2" width="6" height="2" fill={color} />
    <rect x="10" y="4" width="2" height="4" fill={color} />
    <rect x="4" y="10" width="2" height="4" fill={color} />
    <rect x="4" y="12" width="6" height="2" fill={color} />
    {/* Arrow heads */}
    <rect x="12" y="4" width="2" height="2" fill={color} />
    <rect x="2" y="10" width="2" height="2" fill={color} />
  </IconWrapper>
);

export const IconGitHub: React.FC<IconProps> = ({ size = 24, className = '', color = '#e6edf3' }) => (
  <IconWrapper size={size} className={className}>
    {/* Cat silhouette */}
    <rect x="4" y="2" width="8" height="10" fill={color} />
    <rect x="2" y="4" width="2" height="8" fill={color} />
    <rect x="12" y="4" width="2" height="8" fill={color} />
    {/* Ears */}
    <rect x="2" y="2" width="2" height="2" fill={color} />
    <rect x="12" y="2" width="2" height="2" fill={color} />
    {/* Eyes */}
    <rect x="5" y="6" width="2" height="2" fill="#0a0a0f" />
    <rect x="9" y="6" width="2" height="2" fill="#0a0a0f" />
    {/* Tail thingy at bottom */}
    <rect x="4" y="12" width="2" height="2" fill={color} />
    <rect x="10" y="12" width="2" height="2" fill={color} />
  </IconWrapper>
);

export const IconMenu: React.FC<IconProps> = ({ size = 24, className = '', color = '#e6edf3' }) => (
  <IconWrapper size={size} className={className}>
    <rect x="2" y="3" width="12" height="2" fill={color} />
    <rect x="2" y="7" width="12" height="2" fill={color} />
    <rect x="2" y="11" width="12" height="2" fill={color} />
  </IconWrapper>
);

export const IconLeaderboard: React.FC<IconProps> = ({ size = 24, className = '', color = '#ffd700' }) => (
  <IconWrapper size={size} className={className}>
    {/* Podium */}
    <rect x="0" y="10" width="4" height="6" fill="#484848" />
    <rect x="6" y="6" width="4" height="10" fill={color} />
    <rect x="12" y="8" width="4" height="8" fill="#8b949e" />
    {/* Numbers */}
    <rect x="1" y="12" width="2" height="2" fill="#fff" />
    <rect x="7" y="8" width="2" height="2" fill="#5c4a00" />
    <rect x="13" y="10" width="2" height="2" fill="#2d2d35" />
  </IconWrapper>
);

export const IconDashboard: React.FC<IconProps> = ({ size = 24, className = '', color = '#58a6ff' }) => (
  <IconWrapper size={size} className={className}>
    {/* Grid squares */}
    <rect x="2" y="2" width="5" height="5" fill={color} />
    <rect x="9" y="2" width="5" height="5" fill="#2ea043" />
    <rect x="2" y="9" width="5" height="5" fill="#ffd700" />
    <rect x="9" y="9" width="5" height="5" fill="#a371f7" />
  </IconWrapper>
);

export const IconQuest: React.FC<IconProps> = ({ size = 24, className = '', color = '#b8960f' }) => (
  <IconWrapper size={size} className={className}>
    {/* Exclamation over head */}
    <rect x="7" y="0" width="2" height="4" fill="#ffd700" />
    <rect x="7" y="5" width="2" height="2" fill="#ffd700" />
    {/* Person silhouette */}
    <rect x="6" y="8" width="4" height="4" fill={color} />
    <rect x="4" y="12" width="2" height="4" fill={color} />
    <rect x="10" y="12" width="2" height="4" fill={color} />
  </IconWrapper>
);

export const IconClock: React.FC<IconProps> = ({ size = 24, className = '', color = '#8b949e' }) => (
  <IconWrapper size={size} className={className}>
    {/* Circle */}
    <rect x="4" y="2" width="8" height="2" fill={color} />
    <rect x="2" y="4" width="2" height="8" fill={color} />
    <rect x="12" y="4" width="2" height="8" fill={color} />
    <rect x="4" y="12" width="8" height="2" fill={color} />
    <rect x="4" y="4" width="8" height="8" fill="#21262d" />
    {/* Hands */}
    <rect x="7" y="5" width="2" height="4" fill={color} />
    <rect x="7" y="7" width="4" height="2" fill={color} />
  </IconWrapper>
);

export const IconLogout: React.FC<IconProps> = ({ size = 24, className = '', color = '#da3633' }) => (
  <IconWrapper size={size} className={className}>
    {/* Door frame */}
    <rect x="2" y="2" width="2" height="12" fill="#484848" />
    <rect x="2" y="0" width="8" height="2" fill="#484848" />
    <rect x="2" y="14" width="8" height="2" fill="#484848" />
    {/* Arrow */}
    <rect x="6" y="7" width="8" height="2" fill={color} />
    <rect x="10" y="5" width="2" height="2" fill={color} />
    <rect x="12" y="7" width="2" height="2" fill={color} />
    <rect x="10" y="9" width="2" height="2" fill={color} />
  </IconWrapper>
);

export const IconPlus: React.FC<IconProps> = ({ size = 24, className = '', color = '#2ea043' }) => (
  <IconWrapper size={size} className={className}>
    <rect x="7" y="2" width="2" height="12" fill={color} />
    <rect x="2" y="7" width="12" height="2" fill={color} />
  </IconWrapper>
);

export const IconMinus: React.FC<IconProps> = ({ size = 24, className = '', color = '#da3633' }) => (
  <IconWrapper size={size} className={className}>
    <rect x="2" y="7" width="12" height="2" fill={color} />
  </IconWrapper>
);

export const IconInfo: React.FC<IconProps> = ({ size = 24, className = '', color = '#58a6ff' }) => (
  <IconWrapper size={size} className={className}>
    {/* Circle */}
    <rect x="4" y="2" width="8" height="12" fill={color} />
    <rect x="2" y="4" width="2" height="8" fill={color} />
    <rect x="12" y="4" width="2" height="8" fill={color} />
    {/* i */}
    <rect x="7" y="4" width="2" height="2" fill="#fff" />
    <rect x="7" y="7" width="2" height="5" fill="#fff" />
  </IconWrapper>
);

export const IconWarning: React.FC<IconProps> = ({ size = 24, className = '', color = '#b8960f' }) => (
  <IconWrapper size={size} className={className}>
    {/* Triangle */}
    <rect x="7" y="2" width="2" height="2" fill={color} />
    <rect x="6" y="4" width="4" height="2" fill={color} />
    <rect x="5" y="6" width="6" height="2" fill={color} />
    <rect x="4" y="8" width="8" height="2" fill={color} />
    <rect x="3" y="10" width="10" height="2" fill={color} />
    <rect x="2" y="12" width="12" height="2" fill={color} />
    {/* Exclamation */}
    <rect x="7" y="6" width="2" height="3" fill="#000" />
    <rect x="7" y="10" width="2" height="2" fill="#000" />
  </IconWrapper>
);

export const IconLock: React.FC<IconProps> = ({ size = 24, className = '', color = '#8b949e' }) => (
  <IconWrapper size={size} className={className}>
    {/* Lock body */}
    <rect x="4" y="8" width="8" height="6" fill={color} />
    {/* Shackle */}
    <rect x="5" y="4" width="2" height="4" fill={color} />
    <rect x="9" y="4" width="2" height="4" fill={color} />
    <rect x="5" y="2" width="6" height="2" fill={color} />
    {/* Keyhole */}
    <rect x="7" y="10" width="2" height="2" fill="#000" />
  </IconWrapper>
);

export const IconUnlock: React.FC<IconProps> = ({ size = 24, className = '', color = '#2ea043' }) => (
  <IconWrapper size={size} className={className}>
    {/* Lock body */}
    <rect x="4" y="8" width="8" height="6" fill={color} />
    {/* Open shackle */}
    <rect x="5" y="4" width="2" height="4" fill={color} />
    <rect x="5" y="2" width="6" height="2" fill={color} />
    <rect x="9" y="2" width="2" height="2" fill={color} />
    {/* Keyhole */}
    <rect x="7" y="10" width="2" height="2" fill="#000" />
  </IconWrapper>
);

// Alias for IconX - commonly used for close buttons
export const IconClose: React.FC<IconProps> = ({ size = 24, className = '', color = '#8b949e' }) => (
  <IconWrapper size={size} className={className}>
    <rect x="2" y="2" width="2" height="2" fill={color} />
    <rect x="4" y="4" width="2" height="2" fill={color} />
    <rect x="6" y="6" width="4" height="4" fill={color} />
    <rect x="10" y="4" width="2" height="2" fill={color} />
    <rect x="12" y="2" width="2" height="2" fill={color} />
    <rect x="4" y="10" width="2" height="2" fill={color} />
    <rect x="2" y="12" width="2" height="2" fill={color} />
    <rect x="10" y="10" width="2" height="2" fill={color} />
    <rect x="12" y="12" width="2" height="2" fill={color} />
  </IconWrapper>
);

export const IconShare: React.FC<IconProps> = ({ size = 24, className = '', color = '#58a6ff' }) => (
  <IconWrapper size={size} className={className}>
    {/* Arrow */}
    <rect x="7" y="0" width="2" height="8" fill={color} />
    <rect x="5" y="2" width="2" height="2" fill={color} />
    <rect x="9" y="2" width="2" height="2" fill={color} />
    {/* Box */}
    <rect x="2" y="6" width="2" height="8" fill={color} />
    <rect x="12" y="6" width="2" height="8" fill={color} />
    <rect x="2" y="14" width="12" height="2" fill={color} />
  </IconWrapper>
);

export const IconBell: React.FC<IconProps> = ({ size = 24, className = '', color = '#ffd700' }) => (
  <IconWrapper size={size} className={className}>
    {/* Bell body */}
    <rect x="4" y="2" width="8" height="8" fill={color} />
    <rect x="2" y="6" width="2" height="4" fill={color} />
    <rect x="12" y="6" width="2" height="4" fill={color} />
    <rect x="2" y="10" width="12" height="2" fill={color} />
    {/* Clapper */}
    <rect x="6" y="12" width="4" height="2" fill={color} />
    <rect x="7" y="14" width="2" height="2" fill={color} />
    {/* Top */}
    <rect x="7" y="0" width="2" height="2" fill={color} />
  </IconWrapper>
);

export const IconDownload: React.FC<IconProps> = ({ size = 24, className = '', color = '#2ea043' }) => (
  <IconWrapper size={size} className={className}>
    {/* Arrow */}
    <rect x="7" y="0" width="2" height="8" fill={color} />
    <rect x="5" y="6" width="2" height="2" fill={color} />
    <rect x="9" y="6" width="2" height="2" fill={color} />
    <rect x="3" y="8" width="2" height="2" fill={color} />
    <rect x="11" y="8" width="2" height="2" fill={color} />
    {/* Base */}
    <rect x="2" y="12" width="12" height="2" fill={color} />
    <rect x="2" y="10" width="2" height="2" fill={color} />
    <rect x="12" y="10" width="2" height="2" fill={color} />
  </IconWrapper>
);

// Export all icons as a map for easy access
export const PixelIcons = {
  sword: IconSword,
  heart: IconHeart,
  mana: IconMana,
  star: IconStar,
  trophy: IconTrophy,
  scroll: IconScroll,
  shield: IconShield,
  code: IconCode,
  gitBranch: IconGitBranch,
  commit: IconCommit,
  pullRequest: IconPullRequest,
  issue: IconIssue,
  review: IconReview,
  xp: IconXP,
  chest: IconChest,
  badge: IconBadge,
  rank: IconRank,
  arrowRight: IconArrowRight,
  arrowLeft: IconArrowLeft,
  check: IconCheck,
  x: IconX,
  sync: IconSync,
  github: IconGitHub,
  menu: IconMenu,
  leaderboard: IconLeaderboard,
  dashboard: IconDashboard,
  quest: IconQuest,
  clock: IconClock,
  logout: IconLogout,
  plus: IconPlus,
  minus: IconMinus,
  info: IconInfo,
  warning: IconWarning,
  lock: IconLock,
  unlock: IconUnlock,
  close: IconClose,
  share: IconShare,
  bell: IconBell,
  download: IconDownload,
};
