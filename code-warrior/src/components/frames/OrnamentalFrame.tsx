'use client';

/**
 * Pixel Art Frame Ornaments
 * Ornamental decorations for different frame themes
 */

interface FrameOrnamentProps {
  position: 'tl' | 'tr' | 'bl' | 'br'; // top-left, top-right, bottom-left, bottom-right
  theme: 'stone' | 'metal' | 'wood' | 'gold';
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-2 h-2',
  md: 'w-4 h-4',
  lg: 'w-6 h-6',
};

const themeColors = {
  stone: {
    primary: '#21262d',
    accent: '#484f58',
    light: '#30363d',
  },
  metal: {
    primary: '#161b22',
    accent: '#30363d',
    light: '#484f58',
  },
  wood: {
    primary: '#8b6f47',
    accent: '#6d5c3f',
    light: '#a0845c',
  },
  gold: {
    primary: '#ffd700',
    accent: '#ffed4e',
    light: '#fffacd',
  },
};

/**
 * Stone Corner Ornament - Chiseled stone texture
 */
export function StoneCorner({ position, size = 'md' }: Omit<FrameOrnamentProps, 'theme'>) {
  const colors = themeColors.stone;
  const isRight = position.includes('r');
  const isBottom = position.includes('b');
  
  return (
    <div
      className={`${sizeMap[size]} absolute ${
        position === 'tl' ? 'top-0 left-0' :
        position === 'tr' ? 'top-0 right-0' :
        position === 'bl' ? 'bottom-0 left-0' :
        'bottom-0 right-0'
      }`}
      style={{
        background: `linear-gradient(${
          position === 'tl' ? '135deg' :
          position === 'tr' ? '225deg' :
          position === 'bl' ? '45deg' :
          '315deg'
        }, ${colors.primary} 0%, ${colors.accent} 50%, ${colors.light} 100%)`,
        clipPath: position === 'tl' ? 'polygon(0 0, 100% 0, 0 100%)' :
                  position === 'tr' ? 'polygon(0 0, 100% 0, 100% 100%)' :
                  position === 'bl' ? 'polygon(0 0, 0 100%, 100% 100%)' :
                  'polygon(0 100%, 100% 0, 100% 100%)',
      }}
    />
  );
}

/**
 * Metal Bolt Corner - Industrial metal bolts/rivets
 */
export function MetalBoltCorner({ position, size = 'md' }: Omit<FrameOrnamentProps, 'theme'>) {
  const sizeValue = size === 'sm' ? 8 : size === 'md' ? 16 : 24;
  
  return (
    <svg
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 16 16"
      fill="none"
      className={`absolute ${
        position === 'tl' ? 'top-0 left-0' :
        position === 'tr' ? 'top-0 right-0' :
        position === 'bl' ? 'bottom-0 left-0' :
        'bottom-0 right-0'
      }`}
      style={{ transform: position === 'tr' ? 'scaleX(-1)' : position === 'bl' ? 'scaleY(-1)' : position === 'br' ? 'scale(-1)' : 'none' }}
    >
      {/* Bolt head */}
      <circle cx="4" cy="4" r="3" fill="#484f58" stroke="#161b22" strokeWidth="1" />
      <circle cx="4" cy="4" r="2" fill="#30363d" />
      
      {/* Bolt slot */}
      <rect x="3" y="2" width="2" height="4" fill="#161b22" />
      
      {/* Decorative cross line */}
      <line x1="2" y1="4" x2="6" y2="4" stroke="#484f58" strokeWidth="1" />
    </svg>
  );
}

/**
 * Wood Corner - Ornate wood carving
 */
export function WoodCorner({ position, size = 'md' }: Omit<FrameOrnamentProps, 'theme'>) {
  const colors = themeColors.wood;
  
  return (
    <div
      className={`${sizeMap[size]} absolute ${
        position === 'tl' ? 'top-0 left-0' :
        position === 'tr' ? 'top-0 right-0' :
        position === 'bl' ? 'bottom-0 left-0' :
        'bottom-0 right-0'
      }`}
      style={{
        background: colors.primary,
        borderWidth: '1px',
        borderColor: colors.accent,
        clipPath: position === 'tl' ? 'polygon(0 0, 100% 0, 0 100%)' :
                  position === 'tr' ? 'polygon(0 0, 100% 0, 100% 100%)' :
                  position === 'bl' ? 'polygon(0 0, 0 100%, 100% 100%)' :
                  'polygon(0 100%, 100% 0, 100% 100%)',
      }}
    />
  );
}

/**
 * Gold Corner - Gilded ornament
 */
export function GoldCorner({ position, size = 'md' }: Omit<FrameOrnamentProps, 'theme'>) {
  const colors = themeColors.gold;
  
  return (
    <div
      className={`${sizeMap[size]} absolute ${
        position === 'tl' ? 'top-0 left-0' :
        position === 'tr' ? 'top-0 right-0' :
        position === 'bl' ? 'bottom-0 left-0' :
        'bottom-0 right-0'
      }`}
      style={{
        background: `linear-gradient(${
          position === 'tl' ? '135deg' :
          position === 'tr' ? '225deg' :
          position === 'bl' ? '45deg' :
          '315deg'
        }, ${colors.light} 0%, ${colors.primary} 50%, ${colors.accent} 100%)`,
        boxShadow: `inset 0 0 2px ${colors.accent}, 0 0 2px ${colors.accent}`,
        clipPath: position === 'tl' ? 'polygon(0 0, 100% 0, 0 100%)' :
                  position === 'tr' ? 'polygon(0 0, 100% 0, 100% 100%)' :
                  position === 'bl' ? 'polygon(0 0, 0 100%, 100% 100%)' :
                  'polygon(0 100%, 100% 0, 100% 100%)',
      }}
    />
  );
}

/**
 * Ornamental Frame Wrapper Component
 */
interface OrnamentalFrameProps {
  children: React.ReactNode;
  theme: 'stone' | 'metal' | 'wood' | 'gold';
  className?: string;
}

export function OrnamentalFrame({ children, theme, className = '' }: OrnamentalFrameProps) {
  const CornerComponent = theme === 'stone' ? StoneCorner :
                          theme === 'metal' ? MetalBoltCorner :
                          theme === 'wood' ? WoodCorner :
                          GoldCorner;
  
  return (
    <div className={`relative ${className}`}>
      <CornerComponent position="tl" size="md" />
      <CornerComponent position="tr" size="md" />
      <CornerComponent position="bl" size="md" />
      <CornerComponent position="br" size="md" />
      {children}
    </div>
  );
}
