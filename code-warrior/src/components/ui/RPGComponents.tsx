'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { soundManager } from '@/lib/sound';

/* ============================================
   ⚔️ QUEST BUTTON COMPONENT
   RPG-styled action buttons with neon effects
   ============================================ */

interface QuestButtonProps {
  children: React.ReactNode;
  variant?: 'gold' | 'mana' | 'claim' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  'aria-label'?: string;
}

export const QuestButton: React.FC<QuestButtonProps> = ({
  children,
  variant = 'gold',
  size = 'md',
  icon,
  disabled = false,
  loading = false,
  onClick,
  className = '',
  type = 'button',
  fullWidth = false,
  'aria-label': ariaLabel,
}) => {
  const sizeStyles = {
    sm: 'px-4 py-2 text-[9px] min-h-[40px]',
    md: 'px-6 py-3 text-[10px] min-h-[48px]',
    lg: 'px-8 py-4 text-[11px] min-h-[56px]',
  };

  const variantStyles = {
    gold: 'btn-quest-gold',
    mana: 'btn-quest-mana',
    claim: 'btn-quest-claim',
    danger: 'btn-quest-danger',
    ghost: 'btn-quest-ghost',
  };

  const defaultIcons = {
    gold: '⚔️',
    mana: '✨',
    claim: '🏆',
    danger: '💀',
    ghost: '',
  };

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      soundManager.click();
      onClick();
    }
  };

  const handleMouseEnter = () => {
    if (!disabled) {
      soundManager.hover();
    }
  };

  return (
    <motion.button
      type={type}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      className={`
        btn-quest ${variantStyles[variant]} ${sizeStyles[size]}
        font-pixel uppercase tracking-wider
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale-[0.5]' : ''}
        ${className}
      `}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin">⟳</span>
          <span>Loading...</span>
        </span>
      ) : (
        <span className="flex items-center gap-2">
          {icon !== undefined ? (
            icon && <span>{icon}</span>
          ) : (
            defaultIcons[variant] && <span>{defaultIcons[variant]}</span>
          )}
          <span>{children}</span>
        </span>
      )}
    </motion.button>
  );
};

/* ============================================
   ❤️💙 RPG STAT BAR COMPONENT
   16-bit inspired health/mana/xp bars
   ============================================ */

interface RPGStatBarProps {
  current: number;
  max: number;
  variant?: 'health' | 'mana' | 'xp' | 'strength' | 'wisdom';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  showValue?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

export const RPGStatBar: React.FC<RPGStatBarProps> = ({
  current,
  max,
  variant = 'health',
  size = 'md',
  showLabel = false,
  showValue = true,
  label,
  animated = true,
  className = '',
}) => {
  const percentage = Math.min(Math.max((current / max) * 100, 0), 100);

  const sizeClass = {
    sm: 'rpg-bar-sm',
    md: 'rpg-bar-md',
    lg: 'rpg-bar-lg',
    xl: 'rpg-bar-xl',
  };

  const variantClass = `rpg-bar-${variant}`;

  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return Math.round(value).toString();
  };

  return (
    <div className={`${className}`}>
      {showLabel && label && (
        <div className="flex justify-between items-center mb-2">
          <span className="font-pixel text-[10px] text-[var(--gray-lighter)] uppercase tracking-wider">
            {label}
          </span>
          {showValue && (
            <span className="font-mono text-xs font-semibold text-[var(--neon-gold)]">
              {formatValue(current)}/{formatValue(max)}
            </span>
          )}
        </div>
      )}
      <div className={`rpg-bar ${sizeClass[size]} ${variantClass}`}>
        <motion.div
          className="rpg-bar-fill"
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={animated ? { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } : {}}
        />
        {showValue && !showLabel && (
          <span className="rpg-bar-label">
            {formatValue(current)}/{formatValue(max)}
          </span>
        )}
      </div>
    </div>
  );
};

/* ============================================
   📊 VERTICAL RPG STAT BAR
   For character stat panels
   ============================================ */

interface RPGVerticalBarProps {
  value: number;
  max: number;
  variant?: 'health' | 'mana' | 'strength' | 'charisma' | 'wisdom';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label: string;
  showValue?: boolean;
  className?: string;
}

export const RPGVerticalBar: React.FC<RPGVerticalBarProps> = ({
  value,
  max,
  variant = 'health',
  size = 'md',
  label,
  showValue = true,
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClass = {
    sm: 'rpg-vbar-sm',
    md: 'rpg-vbar-md',
    lg: 'rpg-vbar-lg',
    xl: 'rpg-vbar-xl',
  };

  const variantColors = {
    health: {
      text: 'var(--health-bright)',
      glow: 'var(--health-glow-soft)',
    },
    mana: {
      text: 'var(--cyber-cyan)',
      glow: 'var(--cyber-cyan-glow-soft)',
    },
    strength: {
      text: 'var(--critical-bright)',
      glow: 'var(--critical-glow-soft)',
    },
    charisma: {
      text: 'var(--neon-gold)',
      glow: 'var(--neon-gold-glow-soft)',
    },
    wisdom: {
      text: 'var(--pulse-violet-light)',
      glow: 'var(--pulse-violet-glow-soft)',
    },
  };

  const colors = variantColors[variant];

  return (
    <div className={`stat-column ${className}`}>
      {/* Label */}
      <span
        className="stat-column-label"
        style={{ 
          color: colors.text,
          textShadow: `0 0 8px ${colors.glow}`,
        }}
      >
        {label.slice(0, 3).toUpperCase()}
      </span>

      {/* Vertical bar */}
      <div className={`rpg-vbar ${sizeClass[size]} rpg-vbar-${variant}`}>
        <motion.div
          className="rpg-vbar-fill"
          initial={{ height: 0 }}
          animate={{ height: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>

      {/* Value */}
      {showValue && (
        <span
          className="stat-column-value"
          style={{ color: colors.text }}
        >
          {Math.round(value)}
        </span>
      )}
    </div>
  );
};

/* ============================================
   🎴 GLASS PANEL COMPONENT
   Glassmorphism container with variants
   ============================================ */

interface GlassPanelProps {
  children: React.ReactNode;
  variant?: 'default' | 'cyan' | 'violet' | 'gold' | 'dark';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  hoverable = false,
  onClick,
}) => {
  const variantClass = {
    default: 'glass-panel',
    cyan: 'glass-panel-cyan',
    violet: 'glass-panel-violet',
    gold: 'glass-panel-gold',
    dark: 'glass-panel bg-[var(--glass-bg-dark)]',
  };

  const paddingClass = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
    xl: 'p-6',
  };

  const handleClick = () => {
    if (onClick) {
      soundManager.click();
      onClick();
    }
  };

  return (
    <motion.div
      className={`
        ${variantClass[variant]} 
        ${paddingClass[padding]} 
        ${hoverable ? 'cursor-pointer' : ''} 
        ${className}
      `}
      onClick={onClick ? handleClick : undefined}
      onMouseEnter={hoverable ? () => soundManager.hover() : undefined}
      whileHover={hoverable ? { scale: 1.01 } : {}}
      whileTap={onClick ? { scale: 0.99 } : {}}
    >
      {children}
    </motion.div>
  );
};

/* ============================================
   🔲 NEON FRAME COMPONENT
   Animated border glow containers
   ============================================ */

interface NeonFrameProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'violet' | 'gold' | 'animated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const NeonFrame: React.FC<NeonFrameProps> = ({
  children,
  variant = 'cyan',
  padding = 'md',
  className = '',
}) => {
  const variantClass = {
    cyan: 'frame-neon-cyan',
    violet: 'frame-neon-violet',
    gold: 'frame-neon-gold',
    animated: 'frame-cyber',
  };

  const paddingClass = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div className={`${variantClass[variant]} ${paddingClass[padding]} ${className}`}>
      {children}
    </div>
  );
};

/* ============================================
   ✨ NEON TEXT COMPONENT
   Glowing text with various effects
   ============================================ */

interface NeonTextProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'violet' | 'gold' | 'pink';
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  flicker?: boolean;
  className?: string;
}

export const NeonText: React.FC<NeonTextProps> = ({
  children,
  variant = 'cyan',
  as: Component = 'span',
  flicker = false,
  className = '',
}) => {
  const variantClass = `text-neon-${variant}`;
  const flickerClass = flicker ? 'animate-neon-flicker' : '';

  return (
    <Component className={`${variantClass} ${flickerClass} ${className}`}>
      {children}
    </Component>
  );
};

/* ============================================
   🏷️ PIXEL BADGE COMPONENT
   RPG-styled tag/label component
   ============================================ */

interface PixelTagProps {
  children: React.ReactNode;
  variant?: 'gold' | 'cyan' | 'violet' | 'health' | 'critical' | 'gray';
  size?: 'sm' | 'md';
  glow?: boolean;
  className?: string;
}

export const PixelTag: React.FC<PixelTagProps> = ({
  children,
  variant = 'gold',
  size = 'sm',
  glow = false,
  className = '',
}) => {
  const variantStyles = {
    gold: {
      bg: 'var(--neon-gold)',
      text: 'var(--obsidian-darkest)',
      shadow: glow ? '0 0 12px var(--neon-gold-glow)' : '2px 2px 0 rgba(0,0,0,0.4)',
    },
    cyan: {
      bg: 'var(--cyber-cyan)',
      text: 'var(--obsidian-darkest)',
      shadow: glow ? '0 0 12px var(--cyber-cyan-glow)' : '2px 2px 0 rgba(0,0,0,0.4)',
    },
    violet: {
      bg: 'var(--pulse-violet)',
      text: 'white',
      shadow: glow ? '0 0 12px var(--pulse-violet-glow)' : '2px 2px 0 rgba(0,0,0,0.4)',
    },
    health: {
      bg: 'var(--health-light)',
      text: 'white',
      shadow: glow ? '0 0 12px var(--health-glow)' : '2px 2px 0 rgba(0,0,0,0.4)',
    },
    critical: {
      bg: 'var(--critical-light)',
      text: 'white',
      shadow: glow ? '0 0 12px var(--critical-glow)' : '2px 2px 0 rgba(0,0,0,0.4)',
    },
    gray: {
      bg: 'var(--gray-medium)',
      text: 'white',
      shadow: '2px 2px 0 rgba(0,0,0,0.4)',
    },
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-[9px]',
    md: 'px-3 py-1.5 text-[10px]',
  };

  const styles = variantStyles[variant];

  return (
    <span
      className={`inline-block font-pixel ${sizeStyles[size]} ${className}`}
      style={{
        background: styles.bg,
        color: styles.text,
        boxShadow: styles.shadow,
      }}
    >
      {children}
    </span>
  );
};

/* ============================================
   🖼️ CYBER AVATAR COMPONENT
   Profile image with neon ring effect
   ============================================ */

interface CyberAvatarProps {
  src: string | null | undefined;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  variant?: 'cyan' | 'gold' | 'violet';
  className?: string;
}

export const CyberAvatar: React.FC<CyberAvatarProps> = ({
  src,
  alt,
  size = 'md',
  glow = true,
  variant = 'cyan',
  className = '',
}) => {
  const [imageError, setImageError] = React.useState(false);

  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  const variantColors = {
    cyan: {
      border: 'var(--cyber-cyan)',
      glow: 'var(--cyber-cyan-glow-soft)',
    },
    gold: {
      border: 'var(--neon-gold)',
      glow: 'var(--neon-gold-glow-soft)',
    },
    violet: {
      border: 'var(--pulse-violet)',
      glow: 'var(--pulse-violet-glow-soft)',
    },
  };

  const colors = variantColors[variant];

  const initials = alt
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`
        ${sizeStyles[size]} 
        rounded-full overflow-hidden
        ${glow ? 'animate-pulse-glow' : ''}
        ${className}
      `}
      style={{
        border: `3px solid ${colors.border}`,
        boxShadow: glow 
          ? `0 0 0 2px ${colors.glow}, 0 0 20px ${colors.glow}` 
          : `0 0 0 1px ${colors.glow}`,
      }}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <div 
          className="w-full h-full flex items-center justify-center bg-[var(--obsidian-light)]"
        >
          <span className="font-pixel text-white text-sm">{initials || '?'}</span>
        </div>
      )}
    </div>
  );
};

/* Export all components */
export default {
  QuestButton,
  RPGStatBar,
  RPGVerticalBar,
  GlassPanel,
  NeonFrame,
  NeonText,
  PixelTag,
  CyberAvatar,
};
