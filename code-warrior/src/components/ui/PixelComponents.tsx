'use client';

import React from 'react';
import { motion, type Transition } from 'framer-motion';
import { soundManager } from '@/lib/sound';

interface PixelFrameProps {
  children: React.ReactNode;
  variant?: 'stone' | 'metal' | 'gold' | 'mana' | 'health' | 'critical';
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export const PixelFrame: React.FC<PixelFrameProps> = ({
  children,
  variant = 'stone',
  className = '',
  padding = 'md',
  animate = false,
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  const Component = animate ? motion.div : 'div';
  const transition: Transition = { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] };
  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition,
      }
    : {};

  return (
    <Component
      className={`frame-${variant} ${paddingClasses[padding]} ${className}`}
      {...animationProps}
    >
      {children}
    </Component>
  );
};

interface PixelCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'gold';
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const PixelCard: React.FC<PixelCardProps> = ({
  children,
  variant = 'default',
  className = '',
  onClick,
  hoverable = false,
}) => {
  const baseClass = variant === 'gold' ? 'pixel-card-gold' : 'pixel-card';
  const hoverClass = hoverable
    ? 'cursor-pointer transition-transform hover:translate-x-[-2px] hover:translate-y-[-2px]'
    : '';
  const focusClass = onClick
    ? 'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--gold-light)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--void-darkest)]'
    : '';

  const handleClick = () => {
    if (onClick) {
      soundManager.click();
      onClick();
    }
  };

  const handleMouseEnter = () => {
    if (hoverable) {
      soundManager.hover();
    }
  };

  return (
    <div
      className={`${baseClass} ${hoverClass} ${focusClass} ${className}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {children}
    </div>
  );
};

interface PixelButtonProps {
  children: React.ReactNode;
  variant?: 'gold' | 'mana' | 'health' | 'critical' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const PixelButton: React.FC<PixelButtonProps> = ({
  children,
  variant = 'gold',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  type = 'button',
}) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-[var(--font-xs)]',
    md: 'px-6 py-3 text-[var(--font-sm)]',
    lg: 'px-8 py-4 text-[var(--font-md)]',
  };

  const handleClick = () => {
    if (onClick && !disabled && !loading) {
      soundManager.click();
      onClick();
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      onMouseEnter={() => !disabled && soundManager.hover()}
      disabled={disabled || loading}
      className={`btn-pixel btn-${variant} ${sizeClasses[size]} focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--void-darkest)] focus-visible:ring-[var(--mana-light)] ${className}`}
    >
      {loading ? (
        <span className="inline-block animate-pixel-spin">⟳</span>
      ) : (
        children
      )}
    </button>
  );
};

interface PixelInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  className?: string;
  disabled?: boolean;
}

export const PixelInput: React.FC<PixelInputProps> = ({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  className = '',
  disabled = false,
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`input-pixel w-full ${className}`}
    />
  );
};

interface StatBarProps {
  label: string;
  current: number;
  max: number;
  variant?: 'health' | 'mana' | 'xp' | 'strength' | 'purple';
  showLabel?: boolean;
  showValues?: boolean;
  className?: string;
}

export const StatBar: React.FC<StatBarProps> = ({
  label,
  current,
  max,
  variant = 'health',
  showLabel = true,
  showValues = true,
  className = '',
}) => {
  const percentage = Math.min((current / max) * 100, 100);
  const displayCurrent = Math.round(current);
  const displayMax = Math.round(max);

  return (
    <div className={`${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2 gap-2">
          <span className="font-pixel text-[10px] text-[var(--gray-highlight)] leading-tight">
            {label}
          </span>
          {showValues && (
            <span className="font-pixel text-[10px] text-[#ffd700] tabular-nums whitespace-nowrap">
              {displayCurrent}/{displayMax}
            </span>
          )}
        </div>
      )}
      <div className={`stat-bar stat-bar-${variant}`}>
        <div
          className="stat-bar-fill"
          style={{ width: `${percentage}%` }}
        />
        {!showLabel && showValues && (
          <span className="stat-bar-label">
            {displayCurrent}/{displayMax}
          </span>
        )}
      </div>
    </div>
  );
};

interface PixelProgressProps {
  value: number;
  max: number;
  variant?: 'gold' | 'mana' | 'health' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const PixelProgress: React.FC<PixelProgressProps> = ({
  value,
  max,
  variant = 'gold',
  size = 'md',
  showText = false,
  className = '',
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const sizeClasses = {
    sm: 'h-3',
    md: 'h-5',
    lg: 'h-8',
  };

  const variantColors = {
    gold: 'bg-[var(--gold-light)]',
    mana: 'bg-[var(--mana-light)]',
    health: 'bg-[var(--health-light)]',
    purple: 'bg-[var(--xp-light)]',
  };

  return (
    <div
      className={`relative ${sizeClasses[size]} bg-[var(--void-darkest)] border-4 border-[var(--gray-dark)] ${className}`}
      style={{
        boxShadow: 'inset 4px 4px 0 rgba(0, 0, 0, 0.5)',
      }}
    >
      <div
        className={`h-full ${variantColors[variant]} transition-[width] duration-300`}
        style={{
          width: `${percentage}%`,
          boxShadow: 'inset 0 -4px 0 rgba(0, 0, 0, 0.2)',
        }}
      />
      {showText && (
        <span className="absolute inset-0 flex items-center justify-center text-[var(--font-xs)] font-pixel text-white text-outline-dark">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};

interface PixelDividerProps {
  variant?: 'gold' | 'mana' | 'gray';
  className?: string;
}

export const PixelDivider: React.FC<PixelDividerProps> = ({
  variant = 'gold',
  className = '',
}) => {
  const colors = {
    gold: 'border-[var(--gold-medium)]',
    mana: 'border-[var(--mana-medium)]',
    gray: 'border-[var(--gray-medium)]',
  };

  return (
    <div
      className={`w-full h-0 border-t-4 border-dashed ${colors[variant]} opacity-50 ${className}`}
    />
  );
};

interface PixelBadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'mana' | 'health' | 'critical' | 'purple' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

export const PixelBadge: React.FC<PixelBadgeProps> = ({
  children,
  variant = 'gold',
  size = 'sm',
  className = '',
}) => {
  const variantColors = {
    gold: 'bg-[var(--gold-medium)] text-[var(--void-darkest)]',
    mana: 'bg-[var(--mana-medium)] text-white',
    health: 'bg-[var(--health-medium)] text-white',
    critical: 'bg-[var(--critical-medium)] text-white',
    purple: 'bg-[var(--xp-medium)] text-white',
    gray: 'bg-[var(--gray-medium)] text-white',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-[var(--font-xs)]',
    md: 'px-3 py-2 text-[var(--font-xs)]',
  };

  return (
    <span
      className={`inline-block font-pixel ${variantColors[variant]} ${sizeClasses[size]} ${className}`}
      style={{
        boxShadow: '2px 2px 0 rgba(0, 0, 0, 0.4)',
      }}
    >
      {children}
    </span>
  );
};

interface PixelAvatarProps {
  src: string | null | undefined;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  glow?: boolean;
}

export const PixelAvatar: React.FC<PixelAvatarProps> = ({
  src,
  alt,
  size = 'md',
  className = '',
  glow = false,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const glowClass = glow ? 'pixel-avatar-glow' : '';

  return (
    <div className={`${sizeClasses[size]} ${glowClass} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full pixel-avatar object-cover"
        />
      ) : (
        <div className="w-full h-full pixel-avatar bg-[var(--gray-dark)] flex items-center justify-center">
          <span className="text-[var(--gray-light)] font-pixel text-xs">?</span>
        </div>
      )}
    </div>
  );
};

interface PixelTooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const PixelTooltip: React.FC<PixelTooltipProps> = ({
  children,
  content,
  position = 'top',
}) => {
  const [show, setShow] = React.useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          className={`absolute ${positionClasses[position]} z-50 px-3 py-2 bg-[var(--void-darkest)] border-4 border-[var(--gray-dark)] font-pixel text-[var(--font-xs)] text-white whitespace-nowrap`}
          style={{
            boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.5)',
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};

interface VerticalStatBarProps {
  label: string;
  value: number;
  max: number;
  variant?: 'health' | 'mana' | 'strength' | 'charisma' | 'wisdom';
  showValue?: boolean;
  height?: 'sm' | 'md' | 'lg' | 'xl';
}

export const VerticalStatBar: React.FC<VerticalStatBarProps> = ({
  label,
  value,
  max,
  variant = 'health',
  showValue = true,
  height = 'md',
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const heightClasses = {
    sm: 'h-24',
    md: 'h-32',
    lg: 'h-40',
    xl: 'h-64',
  };

  const variantColors = {
    health: {
      bg: 'bg-[var(--health-dark)]',
      fill: 'bg-[var(--health-light)]',
      glow: 'shadow-[0_0_8px_var(--health-light)]',
      text: 'text-[var(--health-light)]',
    },
    mana: {
      bg: 'bg-[var(--mana-dark)]',
      fill: 'bg-[var(--mana-light)]',
      glow: 'shadow-[0_0_8px_var(--mana-light)]',
      text: 'text-[var(--mana-light)]',
    },
    strength: {
      bg: 'bg-[var(--critical-dark)]',
      fill: 'bg-[var(--critical-light)]',
      glow: 'shadow-[0_0_8px_var(--critical-light)]',
      text: 'text-[var(--critical-light)]',
    },
    charisma: {
      bg: 'bg-[var(--gold-dark)]',
      fill: 'bg-[var(--gold-light)]',
      glow: 'shadow-[0_0_8px_var(--gold-light)]',
      text: 'text-[var(--gold-light)]',
    },
    wisdom: {
      bg: 'bg-[var(--xp-dark)]',
      fill: 'bg-[var(--xp-light)]',
      glow: 'shadow-[0_0_8px_var(--xp-light)]',
      text: 'text-[var(--xp-light)]',
    },
  };

  const colors = variantColors[variant];

  // Calculate actual pixel heights
  const heightPixels = {
    sm: 96,
    md: 128,
    lg: 160,
    xl: 256,
  }[height];

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Stat abbreviation label */}
      <span className={`font-pixel text-[11px] ${colors.text} uppercase tracking-wider`}>
        {label.slice(0, 3)}
      </span>

      {/* Vertical bar container */}
      <div
        className={`relative ${colors.bg} border-2 border-[var(--gray-dark)] overflow-hidden`}
        style={{
          width: '32px',
          height: `${heightPixels}px`,
          boxShadow: 'inset 2px 2px 0 rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Fill from bottom */}
        <div
          className={`absolute bottom-0 left-0 right-0 ${colors.fill} transition-all duration-500 ease-out`}
          style={{
            height: `${percentage}%`,
            boxShadow: percentage > 80 
              ? `inset 0 2px 0 rgba(255, 255, 255, 0.3), 0 0 8px ${
                  variant === 'health' ? 'var(--health-light)' :
                  variant === 'mana' ? 'var(--mana-light)' :
                  variant === 'strength' ? 'var(--critical-light)' :
                  variant === 'charisma' ? 'var(--gold-light)' :
                  'var(--xp-light)'
                }`
              : 'inset 0 2px 0 rgba(255, 255, 255, 0.3)',
          }}
        />

        {/* Pixel grid overlay for retro feel */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'linear-gradient(transparent 50%, rgba(0,0,0,0.3) 50%)',
            backgroundSize: '100% 4px',
          }}
        />
      </div>

      {/* Value display */}
      {showValue && (
        <span className={`font-pixel text-[10px] ${colors.text} tabular-nums`}>
          {Math.round(value)}
        </span>
      )}
    </div>
  );
};

interface SkeletonCardProps {
  variant?: 'quest' | 'badge' | 'leaderboard' | 'character';
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  variant = 'quest',
  className = '',
}) => {
  return (
    <PixelFrame variant="stone" padding="lg" className={className}>
      <div className="animate-pixel-pulse">
        {variant === 'quest' && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-[var(--gray-dark)]" />
              <div className="h-4 bg-[var(--gray-dark)] w-3/4" />
            </div>
            <div className="h-3 bg-[var(--gray-dark)] w-full mb-2" />
            <div className="h-3 bg-[var(--gray-dark)] w-5/6 mb-4" />
            <div className="h-2 bg-[var(--gray-darkest)] w-full mb-4" />
            <div className="flex justify-between items-center">
              <div className="h-4 bg-[var(--gray-dark)] w-20" />
              <div className="h-8 bg-[var(--gray-dark)] w-16" />
            </div>
          </>
        )}
        {variant === 'badge' && (
          <>
            <div className="w-16 h-16 bg-[var(--gray-dark)] mx-auto mb-3" />
            <div className="h-3 bg-[var(--gray-dark)] w-3/4 mx-auto mb-2" />
            <div className="h-2 bg-[var(--gray-dark)] w-1/2 mx-auto mb-3" />
            <div className="h-8 bg-[var(--gray-dark)] w-full" />
          </>
        )}
        {variant === 'leaderboard' && (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--gray-dark)]" />
            <div className="w-12 h-12 bg-[var(--gray-dark)] rounded-full" />
            <div className="flex-1">
              <div className="h-3 bg-[var(--gray-dark)] w-32 mb-2" />
              <div className="h-2 bg-[var(--gray-dark)] w-24" />
            </div>
            <div className="h-4 bg-[var(--gray-dark)] w-20" />
          </div>
        )}
        {variant === 'character' && (
          <>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-[var(--gray-dark)] rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-[var(--gray-dark)] w-32 mb-2" />
                <div className="h-3 bg-[var(--gray-dark)] w-24" />
              </div>
            </div>
            <div className="h-6 bg-[var(--gray-dark)] w-full mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-[var(--gray-dark)] w-full" />
              ))}
            </div>
          </>
        )}
      </div>
    </PixelFrame>
  );
};
