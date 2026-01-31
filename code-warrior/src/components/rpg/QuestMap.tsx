'use client';

import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelBadge, PixelButton } from '../ui/PixelComponents';
import { IconCheck, IconLock, IconStar, IconXP } from '../icons/PixelIcons';
import { soundManager } from '@/lib/sound';
import type { Quest, UserQuest } from '@/types/database';

// ============================================
// MAP REGIONS - Different landscapes for quest progression
// ============================================
export type MapRegion = 
  | 'starting_village'    // Beginner quests
  | 'forest_of_commits'   // Commit-based quests
  | 'collaboration_peaks' // PR/Review quests
  | 'star_valley'         // Star-based quests
  | 'legendary_summit';   // Expert/Legendary quests

interface MapRegionConfig {
  id: MapRegion;
  name: string;
  description: string;
  color: string;
  gradient: string;
  icon: string;
  x: number; // Position percentage
  y: number;
  width: number;
  height: number;
}

const MAP_REGIONS: MapRegionConfig[] = [
  {
    id: 'starting_village',
    name: 'Starting Village',
    description: 'Begin your coding journey',
    color: '#4ade80',
    gradient: 'linear-gradient(135deg, #166534 0%, #22c55e 50%, #86efac 100%)',
    icon: '🏠',
    x: 5,
    y: 70,
    width: 18,
    height: 25,
  },
  {
    id: 'forest_of_commits',
    name: 'Forest of Commits',
    description: 'Master the art of consistency',
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #22c55e 100%)',
    icon: '🌲',
    x: 25,
    y: 50,
    width: 20,
    height: 35,
  },
  {
    id: 'collaboration_peaks',
    name: 'Collaboration Peaks',
    description: 'Conquer teamwork challenges',
    color: '#a78bfa',
    gradient: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #a78bfa 100%)',
    icon: '⛰️',
    x: 47,
    y: 30,
    width: 22,
    height: 40,
  },
  {
    id: 'star_valley',
    name: 'Star Valley',
    description: 'Earn recognition for your work',
    color: '#fbbf24',
    gradient: 'linear-gradient(135deg, #78350f 0%, #b45309 50%, #fbbf24 100%)',
    icon: '⭐',
    x: 70,
    y: 45,
    width: 18,
    height: 30,
  },
  {
    id: 'legendary_summit',
    name: 'Legendary Summit',
    description: 'Achieve elite status',
    color: '#f472b6',
    gradient: 'linear-gradient(135deg, #831843 0%, #be185d 50%, #f472b6 100%)',
    icon: '👑',
    x: 85,
    y: 15,
    width: 12,
    height: 25,
  },
];

// ============================================
// QUEST CHECKPOINT COMPONENT
// ============================================
interface QuestCheckpointProps {
  quest: Quest;
  userQuest?: UserQuest;
  position: { x: number; y: number };
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  isClaimed: boolean;
  isLocked: boolean;
  onSelect: (quest: Quest) => void;
}

const QuestCheckpoint: React.FC<QuestCheckpointProps> = ({
  quest,
  userQuest,
  position,
  index,
  isActive,
  isCompleted,
  isClaimed,
  isLocked,
  onSelect,
}) => {
  const checkpointVariant = isClaimed
    ? 'claimed'
    : isCompleted
    ? 'completed'
    : isActive
    ? 'active'
    : isLocked
    ? 'locked'
    : 'available';

  const getCheckpointStyles = () => {
    switch (checkpointVariant) {
      case 'claimed':
        return {
          bg: 'bg-gradient-to-br from-yellow-400 to-amber-500',
          border: 'border-yellow-300',
          glow: 'shadow-[0_0_20px_rgba(251,191,36,0.6)]',
          icon: <IconStar size={16} color="#fff" />,
        };
      case 'completed':
        return {
          bg: 'bg-gradient-to-br from-emerald-400 to-green-500',
          border: 'border-emerald-300',
          glow: 'shadow-[0_0_15px_rgba(52,211,153,0.5)]',
          icon: <IconCheck size={16} color="#fff" />,
        };
      case 'active':
        return {
          bg: 'bg-gradient-to-br from-cyan-400 to-blue-500',
          border: 'border-cyan-300',
          glow: 'shadow-[0_0_20px_rgba(34,211,238,0.6)] animate-pulse',
          icon: <span className="text-white text-xs font-bold">{index + 1}</span>,
        };
      case 'locked':
        return {
          bg: 'bg-gradient-to-br from-gray-600 to-gray-700',
          border: 'border-gray-500',
          glow: '',
          icon: <IconLock size={14} color="#9ca3af" />,
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-slate-500 to-slate-600',
          border: 'border-slate-400',
          glow: 'hover:shadow-[0_0_10px_rgba(148,163,184,0.4)]',
          icon: <span className="text-white text-xs font-bold">{index + 1}</span>,
        };
    }
  };

  const styles = getCheckpointStyles();
  const progress = userQuest?.progress ?? 0;
  const progressPercent = Math.min((progress / quest.criteria_threshold) * 100, 100);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
    >
      {/* Quest info tooltip on hover */}
      <div className="group relative">
        {/* Checkpoint marker */}
        <motion.button
          whileHover={{ scale: isLocked ? 1 : 1.15 }}
          whileTap={{ scale: isLocked ? 1 : 0.95 }}
          onClick={() => !isLocked && onSelect(quest)}
          onMouseEnter={() => !isLocked && soundManager.hover()}
          disabled={isLocked}
          className={`
            relative w-10 h-10 md:w-12 md:h-12 rounded-full
            ${styles.bg} ${styles.glow}
            border-3 ${styles.border}
            flex items-center justify-center
            transition-all duration-300
            ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
            focus:outline-none focus:ring-2 focus:ring-white/50
          `}
          aria-label={`Quest: ${quest.title}${isLocked ? ' (locked)' : ''}`}
        >
          {styles.icon}
          
          {/* Progress ring for active quests */}
          {isActive && !isCompleted && (
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 36 36"
            >
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeDasharray={`${progressPercent} 100`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
          )}
        </motion.button>

        {/* Tooltip */}
        <div className="
          absolute bottom-full left-1/2 -translate-x-1/2 mb-2
          opacity-0 group-hover:opacity-100
          pointer-events-none group-hover:pointer-events-auto
          transition-all duration-200 z-50
          w-48 md:w-56
        ">
          <div className="bg-[#0d1117]/95 backdrop-blur-sm border border-[var(--gray-dark)] rounded-lg p-3 shadow-xl">
            <p className="font-pixel text-[10px] text-white mb-1 truncate">{quest.title}</p>
            <p className="font-pixel text-[8px] text-[var(--gray-medium)] mb-2 line-clamp-2">
              {quest.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <IconXP size={12} color="#ffd700" />
                <span className="font-pixel text-[9px] text-[var(--gold-light)]">
                  +{quest.xp_reward}
                </span>
              </div>
              {isActive && (
                <span className="font-pixel text-[8px] text-[var(--cyber-cyan)]">
                  {progress}/{quest.criteria_threshold}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// COMPASS COMPONENT
// ============================================
interface CompassProps {
  progress: number; // 0-100
}

const Compass: React.FC<CompassProps> = ({ progress }) => {
  const needleRotation = (progress / 100) * 180 - 90; // -90 to 90 degrees

  return (
    <div className="absolute top-4 right-4 z-30">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 150 }}
        className="relative w-20 h-20 md:w-24 md:h-24"
      >
        {/* Compass body */}
        <div className="
          absolute inset-0 rounded-full
          bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950
          border-4 border-amber-600
          shadow-[0_0_20px_rgba(217,119,6,0.3),inset_0_2px_10px_rgba(0,0,0,0.5)]
        ">
          {/* Compass markings */}
          <div className="absolute inset-2 rounded-full bg-[#1a1a2e] border-2 border-amber-700/50">
            {/* Cardinal directions */}
            <span className="absolute top-1 left-1/2 -translate-x-1/2 font-pixel text-[8px] text-red-400">N</span>
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 font-pixel text-[8px] text-amber-400">S</span>
            <span className="absolute left-1 top-1/2 -translate-y-1/2 font-pixel text-[8px] text-amber-400">W</span>
            <span className="absolute right-1 top-1/2 -translate-y-1/2 font-pixel text-[8px] text-amber-400">E</span>
            
            {/* Compass needle */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: needleRotation }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            >
              <div className="relative w-full h-1">
                {/* North (red) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[20px] md:border-b-[24px] border-b-red-500" />
                {/* South (white) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-0 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[20px] md:border-t-[24px] border-t-gray-200" />
                {/* Center pin */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400 border border-amber-600" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Progress label */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="font-pixel text-[9px] text-amber-400">
            {Math.round(progress)}% Complete
          </span>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================
// MAP PATH COMPONENT
// ============================================
interface MapPathProps {
  checkpoints: Array<{ x: number; y: number }>;
  progress: number;
}

const MapPath: React.FC<MapPathProps> = ({ checkpoints, progress }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [checkpoints]);

  // Generate smooth path through checkpoints
  const generatePath = () => {
    if (checkpoints.length < 2) return '';
    
    let path = `M ${checkpoints[0].x} ${checkpoints[0].y}`;
    
    for (let i = 1; i < checkpoints.length; i++) {
      const prev = checkpoints[i - 1];
      const curr = checkpoints[i];
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;
      
      // Use quadratic bezier for smooth curves
      path += ` Q ${prev.x + (curr.x - prev.x) * 0.5} ${prev.y}, ${midX} ${midY}`;
    }
    
    const last = checkpoints[checkpoints.length - 1];
    path += ` L ${last.x} ${last.y}`;
    
    return path;
  };

  const pathD = generatePath();
  const progressOffset = pathLength - (pathLength * progress) / 100;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {/* Background path (trail) */}
      <path
        d={pathD}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeDasharray="2 2"
      />
      
      {/* Progress path */}
      <path
        ref={pathRef}
        d={pathD}
        fill="none"
        stroke="url(#progressGradient)"
        strokeWidth="0.6"
        strokeLinecap="round"
        strokeDasharray={pathLength}
        strokeDashoffset={progressOffset}
        className="transition-all duration-1000 ease-out"
      />
      
      {/* Gradient definition */}
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="50%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// ============================================
// LANDSCAPE DECORATIONS
// ============================================
const LandscapeDecorations: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Trees in forest region */}
      <div className="absolute left-[28%] top-[45%] text-2xl md:text-3xl opacity-60">🌲</div>
      <div className="absolute left-[32%] top-[55%] text-xl md:text-2xl opacity-50">🌳</div>
      <div className="absolute left-[38%] top-[48%] text-2xl md:text-3xl opacity-55">🌲</div>
      <div className="absolute left-[35%] top-[62%] text-lg md:text-xl opacity-45">🌴</div>
      
      {/* Mountains in peaks region */}
      <div className="absolute left-[52%] top-[25%] text-3xl md:text-4xl opacity-60">🏔️</div>
      <div className="absolute left-[58%] top-[35%] text-2xl md:text-3xl opacity-50">⛰️</div>
      <div className="absolute left-[62%] top-[28%] text-xl md:text-2xl opacity-55">🗻</div>
      
      {/* Stars in valley */}
      <div className="absolute left-[73%] top-[42%] text-xl md:text-2xl opacity-70 animate-pulse">✨</div>
      <div className="absolute left-[78%] top-[55%] text-lg md:text-xl opacity-60 animate-pulse delay-300">⭐</div>
      <div className="absolute left-[82%] top-[48%] text-sm md:text-lg opacity-50 animate-pulse delay-500">💫</div>
      
      {/* Castle at summit */}
      <div className="absolute left-[88%] top-[12%] text-2xl md:text-3xl opacity-70">🏰</div>
      
      {/* Village elements */}
      <div className="absolute left-[8%] top-[75%] text-xl md:text-2xl opacity-60">🏡</div>
      <div className="absolute left-[15%] top-[80%] text-lg md:text-xl opacity-50">🏠</div>
      
      {/* Rivers/water */}
      <div className="absolute left-[45%] top-[70%] text-lg md:text-xl opacity-40">💧</div>
      <div className="absolute left-[55%] top-[75%] text-sm md:text-lg opacity-35">🌊</div>
      
      {/* Clouds */}
      <motion.div 
        className="absolute left-[20%] top-[10%] text-2xl md:text-3xl opacity-30"
        animate={{ x: [0, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        ☁️
      </motion.div>
      <motion.div 
        className="absolute left-[60%] top-[8%] text-xl md:text-2xl opacity-25"
        animate={{ x: [0, -15, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      >
        ☁️
      </motion.div>
      
      {/* Sun/moon */}
      <div className="absolute right-[5%] top-[5%] text-2xl md:text-3xl opacity-60">🌅</div>
    </div>
  );
};

// ============================================
// REGION LABELS
// ============================================
const RegionLabels: React.FC<{ regions: MapRegionConfig[]; completedRegions: Set<MapRegion> }> = ({
  regions,
  completedRegions,
}) => {
  return (
    <>
      {regions.map((region) => (
        <motion.div
          key={region.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute z-5"
          style={{
            left: `${region.x + region.width / 2}%`,
            top: `${region.y - 8}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className={`
            px-2 py-1 rounded-md text-center
            ${completedRegions.has(region.id) 
              ? 'bg-emerald-900/60 border border-emerald-500/50' 
              : 'bg-[#0d1117]/60 border border-[var(--gray-dark)]/50'
            }
            backdrop-blur-sm
          `}>
            <span className="text-base md:text-lg">{region.icon}</span>
            <p className={`
              font-pixel text-[7px] md:text-[8px] mt-0.5
              ${completedRegions.has(region.id) ? 'text-emerald-400' : 'text-[var(--gray-medium)]'}
            `}>
              {region.name}
            </p>
          </div>
        </motion.div>
      ))}
    </>
  );
};

// ============================================
// MAIN QUEST MAP COMPONENT
// ============================================
interface QuestMapProps {
  quests: Quest[];
  userQuests: UserQuest[];
  onQuestSelect: (quest: Quest) => void;
  onClaimQuest?: (questId: string) => void;
  className?: string;
}

export const QuestMap: React.FC<QuestMapProps> = ({
  quests,
  userQuests,
  onQuestSelect,
  onClaimQuest,
  className = '',
}) => {
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

  // Map quests to regions based on criteria type and threshold
  const getQuestRegion = useCallback((quest: Quest): MapRegion => {
    const threshold = quest.criteria_threshold;
    
    // Beginner quests (low thresholds)
    if (threshold <= 10) return 'starting_village';
    
    // Commit-focused quests
    if (quest.criteria_type === 'COMMIT_COUNT') {
      if (threshold <= 100) return 'forest_of_commits';
      return 'legendary_summit';
    }
    
    // Collaboration quests (PR, Reviews)
    if (quest.criteria_type === 'PR_MERGED' || quest.criteria_type === 'REVIEW_COUNT') {
      if (threshold <= 20) return 'collaboration_peaks';
      return 'legendary_summit';
    }
    
    // Star-based quests
    if (quest.criteria_type === 'STAR_COUNT') {
      if (threshold <= 50) return 'star_valley';
      return 'legendary_summit';
    }
    
    // Issue quests
    if (quest.criteria_type === 'ISSUE_COUNT') {
      return threshold <= 10 ? 'starting_village' : 'collaboration_peaks';
    }
    
    // Repo quests
    if (quest.criteria_type === 'REPO_COUNT') {
      if (threshold <= 3) return 'starting_village';
      if (threshold <= 10) return 'forest_of_commits';
      return 'star_valley';
    }
    
    return 'starting_village';
  }, []);

  // Calculate quest positions
  const questPositions = useMemo(() => {
    if (!quests || quests.length === 0) return [];
    
    const regionQuests: Record<MapRegion, Quest[]> = {
      starting_village: [],
      forest_of_commits: [],
      collaboration_peaks: [],
      star_valley: [],
      legendary_summit: [],
    };

    // Group quests by region
    quests.forEach((quest) => {
      const region: MapRegion = getQuestRegion(quest);
      regionQuests[region].push(quest);
    });

    // Sort quests within each region by threshold
    Object.keys(regionQuests).forEach((region) => {
      regionQuests[region as MapRegion].sort((a, b) => a.criteria_threshold - b.criteria_threshold);
    });

    // Calculate positions for each quest
    const positions: Array<{ quest: Quest; x: number; y: number; region: MapRegion }> = [];
    
    MAP_REGIONS.forEach((region) => {
      const questsInRegion = regionQuests[region.id];
      const count = questsInRegion.length;
      
      questsInRegion.forEach((quest, index) => {
        // Distribute quests within region bounds
        const progress = count > 1 ? index / (count - 1) : 0.5;
        const x = region.x + region.width * (0.2 + progress * 0.6);
        const y = region.y + region.height * (0.3 + (index % 2) * 0.4);
        
        positions.push({ quest, x, y, region: region.id });
      });
    });

    return positions;
  }, [quests, getQuestRegion]);

  // Calculate overall progress
  const { totalProgress, completedRegions } = useMemo(() => {
    if (!quests || quests.length === 0) {
      return { totalProgress: 0, completedRegions: new Set<MapRegion>() };
    }
    
    const completed = userQuests.filter((uq) => uq.claimed_at).length;
    const total = quests.length;
    const progress = total > 0 ? (completed / total) * 100 : 0;

    // Determine which regions are complete
    const regionsComplete = new Set<MapRegion>();
    MAP_REGIONS.forEach((region) => {
      const regionQuestsFiltered = questPositions.filter((qp) => qp.region === region.id);
      const regionCompleted = regionQuestsFiltered.every((qp) => {
        const uq = userQuests.find((u) => u.quest_id === qp.quest.id);
        return uq?.claimed_at;
      });
      if (regionCompleted && regionQuestsFiltered.length > 0) {
        regionsComplete.add(region.id);
      }
    });

    return { totalProgress: progress, completedRegions: regionsComplete };
  }, [quests, userQuests, questPositions]);

  // Get checkpoint data for path
  const checkpointPositions = useMemo(() => {
    return questPositions.map((qp) => ({ x: qp.x, y: qp.y }));
  }, [questPositions]);

  const handleQuestSelect = useCallback((quest: Quest) => {
    soundManager.click();
    setSelectedQuest(quest);
    onQuestSelect(quest);
  }, [onQuestSelect]);

  const getUserQuestForQuest = useCallback((questId: string) => {
    return userQuests.find((uq) => uq.quest_id === questId);
  }, [userQuests]);

  // Determine if a quest is locked (previous quest not completed)
  const isQuestLocked = useCallback((questIndex: number) => {
    if (questIndex === 0) return false;
    const prevQuest = questPositions[questIndex - 1]?.quest;
    if (!prevQuest) return false;
    const prevUserQuest = getUserQuestForQuest(prevQuest.id);
    return !prevUserQuest?.claimed_at;
  }, [questPositions, getUserQuestForQuest]);

  // Early return if no quests - AFTER all hooks
  if (!quests || quests.length === 0) {
    return (
      <div className={`relative ${className}`}>
        <div className="
          relative w-full min-h-[300px]
          bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117]
          border-4 border-[var(--gray-dark)]
          rounded-lg overflow-hidden
          flex items-center justify-center
        ">
          <div className="text-center p-8">
            <span className="text-4xl mb-4 block">🗺️</span>
            <p className="font-pixel text-[12px] text-[var(--gray-highlight)] mb-2">
              No Quests Available
            </p>
            <p className="font-pixel text-[9px] text-[var(--gray-medium)]">
              Sync your GitHub data to discover quests!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Map container with aspect ratio */}
      <div className="
        relative w-full
        min-h-[300px] md:min-h-[400px] lg:min-h-[500px]
        bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117]
        border-4 border-[var(--gray-dark)]
        rounded-lg overflow-hidden
        shadow-[0_0_40px_rgba(0,0,0,0.5),inset_0_0_60px_rgba(0,0,0,0.3)]
      "
      style={{ aspectRatio: '16/10' }}
      >
        {/* Background grid pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Region backgrounds */}
        {MAP_REGIONS.map((region) => (
          <div
            key={region.id}
            className={`
              absolute rounded-lg opacity-20 transition-opacity duration-500
              ${completedRegions.has(region.id) ? 'opacity-40' : ''}
            `}
            style={{
              left: `${region.x}%`,
              top: `${region.y}%`,
              width: `${region.width}%`,
              height: `${region.height}%`,
              background: region.gradient,
            }}
          />
        ))}

        {/* Landscape decorations */}
        <LandscapeDecorations />

        {/* Path connecting checkpoints */}
        <MapPath checkpoints={checkpointPositions} progress={totalProgress} />

        {/* Region labels */}
        <RegionLabels regions={MAP_REGIONS} completedRegions={completedRegions} />

        {/* Quest checkpoints */}
        {questPositions.map((qp, index) => {
          const userQuest = getUserQuestForQuest(qp.quest.id);
          const isCompleted = userQuest?.status === 'COMPLETED';
          const isClaimed = !!userQuest?.claimed_at;
          const isActive = userQuest?.status === 'ACTIVE' && !isClaimed;
          const isLocked = isQuestLocked(index);

          return (
            <QuestCheckpoint
              key={qp.quest.id}
              quest={qp.quest}
              userQuest={userQuest}
              position={{ x: qp.x, y: qp.y }}
              index={index}
              isActive={isActive}
              isCompleted={isCompleted}
              isClaimed={isClaimed}
              isLocked={isLocked}
              onSelect={handleQuestSelect}
            />
          );
        })}

        {/* Compass */}
        <Compass progress={totalProgress} />

        {/* Start marker */}
        <div className="absolute left-[3%] top-[78%] z-20">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 bg-emerald-900/80 px-2 py-1 rounded border border-emerald-500/50"
          >
            <span className="text-sm">🚀</span>
            <span className="font-pixel text-[8px] text-emerald-400">START</span>
          </motion.div>
        </div>

        {/* End marker */}
        <div className="absolute right-[3%] top-[8%] z-20">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-1 bg-amber-900/80 px-2 py-1 rounded border border-amber-500/50"
          >
            <span className="text-sm">🏆</span>
            <span className="font-pixel text-[8px] text-amber-400">FINISH</span>
          </motion.div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-30">
          <div className="bg-[#0d1117]/90 backdrop-blur-sm border border-[var(--gray-dark)] rounded-lg p-2">
            <p className="font-pixel text-[7px] text-[var(--gray-medium)] mb-1.5">LEGEND</p>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 animate-pulse" />
                <span className="font-pixel text-[6px] text-[var(--gray-highlight)]">Active</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-400 to-green-500" />
                <span className="font-pixel text-[6px] text-[var(--gray-highlight)]">Complete</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500" />
                <span className="font-pixel text-[6px] text-[var(--gray-highlight)]">Claimed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 opacity-60" />
                <span className="font-pixel text-[6px] text-[var(--gray-highlight)]">Locked</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected quest panel */}
      <AnimatePresence>
        {selectedQuest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-4"
          >
            <QuestDetailPanel
              quest={selectedQuest}
              userQuest={getUserQuestForQuest(selectedQuest.id)}
              onClose={() => setSelectedQuest(null)}
              onClaim={onClaimQuest}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// QUEST DETAIL PANEL
// ============================================
interface QuestDetailPanelProps {
  quest: Quest;
  userQuest?: UserQuest;
  onClose: () => void;
  onClaim?: (questId: string) => void;
}

const QuestDetailPanel: React.FC<QuestDetailPanelProps> = ({
  quest,
  userQuest,
  onClose,
  onClaim,
}) => {
  const isCompleted = userQuest?.status === 'COMPLETED';
  const isClaimed = !!userQuest?.claimed_at;
  const canClaim = isCompleted && !isClaimed;
  const progress = userQuest?.progress ?? 0;
  const progressPercent = Math.min((progress / quest.criteria_threshold) * 100, 100);

  return (
    <div className="
      bg-[#0d1117]/95 backdrop-blur-sm
      border-2 border-[var(--gray-dark)]
      rounded-lg p-4
      shadow-xl
    ">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-pixel text-sm text-white mb-1">{quest.title}</h3>
          <p className="font-pixel text-[9px] text-[var(--gray-medium)] leading-relaxed">
            {quest.description}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-[var(--void-light)] rounded transition-colors"
          aria-label="Close quest details"
        >
          <span className="text-[var(--gray-medium)]">✕</span>
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="font-pixel text-[8px] text-[var(--gray-highlight)]">
            {quest.criteria_type.replace(/_/g, ' ')}
          </span>
          <span className="font-pixel text-[9px] text-[var(--cyber-cyan)]">
            {progress} / {quest.criteria_threshold}
          </span>
        </div>
        <div className="h-2 bg-[var(--void-dark)] rounded-full overflow-hidden border border-[var(--gray-dark)]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full ${
              isClaimed
                ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
                : isCompleted
                ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                : 'bg-gradient-to-r from-cyan-500 to-blue-400'
            }`}
          />
        </div>
      </div>

      {/* Reward and action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconXP size={16} color="#ffd700" />
          <span className="font-pixel text-sm text-[var(--gold-light)]">+{quest.xp_reward} XP</span>
        </div>

        {canClaim && onClaim && (
          <PixelButton
            variant="gold"
            size="sm"
            onClick={() => {
              soundManager.questComplete();
              onClaim(quest.id);
            }}
          >
            CLAIM REWARD
          </PixelButton>
        )}

        {isClaimed && (
          <PixelBadge variant="gold" size="sm">
            <span className="flex items-center gap-1">
              <IconCheck size={10} color="#fff" /> CLAIMED
            </span>
          </PixelBadge>
        )}
      </div>
    </div>
  );
};

export default QuestMap;
