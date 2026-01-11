'use client';

/**
 * Pixel Art Icon Components
 * Custom 16-bit pixel art icons with black outlines for contrast
 */

interface PixelIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

/**
 * Sword Icon - Combat/Attack symbol
 */
export function PixelSword({ className = '', size = 'md' }: PixelIconProps) {
  return (
    <svg
      className={`${sizeMap[size]} ${className}`}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Black outline */}
      <rect x="7" y="0" width="2" height="2" fill="black" />
      <rect x="6" y="2" width="4" height="2" fill="black" />
      <rect x="5" y="4" width="6" height="2" fill="black" />
      <rect x="6" y="6" width="4" height="7" fill="black" />
      <rect x="7" y="13" width="2" height="3" fill="black" />
      
      {/* Blade color (gold/yellow) */}
      <rect x="7" y="1" width="2" height="1" fill="currentColor" />
      <rect x="7" y="3" width="2" height="1" fill="currentColor" />
      <rect x="6" y="5" width="4" height="1" fill="currentColor" />
      <rect x="7" y="7" width="2" height="5" fill="currentColor" />
      <rect x="7" y="14" width="2" height="1" fill="currentColor" />
    </svg>
  );
}

/**
 * Heart Icon - Health/Life symbol
 */
export function PixelHeart({ className = '', size = 'md' }: PixelIconProps) {
  return (
    <svg
      className={`${sizeMap[size]} ${className}`}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Black outline */}
      <rect x="3" y="5" width="2" height="2" fill="black" />
      <rect x="11" y="5" width="2" height="2" fill="black" />
      <rect x="2" y="7" width="12" height="8" fill="black" />
      
      {/* Red heart fill */}
      <rect x="3" y="6" width="2" height="1" fill="currentColor" />
      <rect x="11" y="6" width="2" height="1" fill="currentColor" />
      <rect x="3" y="8" width="10" height="6" fill="currentColor" />
    </svg>
  );
}

/**
 * Star Icon - Experience/Rating symbol
 */
export function PixelStar({ className = '', size = 'md' }: PixelIconProps) {
  return (
    <svg
      className={`${sizeMap[size]} ${className}`}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Black outline */}
      <rect x="7" y="0" width="2" height="2" fill="black" />
      <rect x="9" y="4" width="2" height="2" fill="black" />
      <rect x="12" y="6" width="2" height="2" fill="black" />
      <rect x="10" y="10" width="2" height="2" fill="black" />
      <rect x="5" y="10" width="2" height="2" fill="black" />
      <rect x="2" y="6" width="2" height="2" fill="black" />
      <rect x="5" y="4" width="2" height="2" fill="black" />
      
      {/* Gold star fill */}
      <rect x="7" y="1" width="2" height="1" fill="currentColor" />
      <rect x="9" y="5" width="2" height="1" fill="currentColor" />
      <rect x="12" y="7" width="2" height="1" fill="currentColor" />
      <rect x="10" y="11" width="2" height="1" fill="currentColor" />
      <rect x="5" y="11" width="2" height="1" fill="currentColor" />
      <rect x="2" y="7" width="2" height="1" fill="currentColor" />
      <rect x="5" y="5" width="2" height="1" fill="currentColor" />
      <rect x="7" y="7" width="2" height="2" fill="currentColor" />
    </svg>
  );
}

/**
 * Zap Icon - Power/Energy symbol
 */
export function PixelZap({ className = '', size = 'md' }: PixelIconProps) {
  return (
    <svg
      className={`${sizeMap[size]} ${className}`}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Black outline for zigzag lightning bolt */}
      <rect x="6" y="0" width="2" height="3" fill="black" />
      <rect x="7" y="3" width="2" height="2" fill="black" />
      <rect x="5" y="5" width="6" height="2" fill="black" />
      <rect x="7" y="7" width="2" height="2" fill="black" />
      <rect x="6" y="9" width="2" height="2" fill="black" />
      <rect x="7" y="11" width="2" height="5" fill="black" />
      
      {/* Blue/Yellow lightning fill */}
      <rect x="7" y="1" width="2" height="2" fill="currentColor" />
      <rect x="8" y="4" width="1" height="1" fill="currentColor" />
      <rect x="6" y="6" width="4" height="1" fill="currentColor" />
      <rect x="8" y="8" width="1" height="1" fill="currentColor" />
      <rect x="7" y="10" width="2" height="1" fill="currentColor" />
      <rect x="8" y="12" width="1" height="3" fill="currentColor" />
    </svg>
  );
}

/**
 * Trophy Icon - Achievement/Rank symbol
 */
export function PixelTrophy({ className = '', size = 'md' }: PixelIconProps) {
  return (
    <svg
      className={`${sizeMap[size]} ${className}`}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Black outline */}
      <rect x="1" y="2" width="14" height="2" fill="black" />
      <rect x="2" y="4" width="2" height="2" fill="black" />
      <rect x="12" y="4" width="2" height="2" fill="black" />
      <rect x="4" y="6" width="8" height="1" fill="black" />
      <rect x="5" y="7" width="6" height="5" fill="black" />
      <rect x="6" y="12" width="4" height="4" fill="black" />
      
      {/* Gold trophy fill */}
      <rect x="2" y="3" width="12" height="1" fill="currentColor" />
      <rect x="3" y="5" width="2" height="1" fill="currentColor" />
      <rect x="11" y="5" width="2" height="1" fill="currentColor" />
      <rect x="5" y="7" width="6" height="4" fill="currentColor" />
      <rect x="7" y="13" width="2" height="3" fill="currentColor" />
    </svg>
  );
}

/**
 * Code Icon - Programming symbol
 */
export function PixelCode({ className = '', size = 'md' }: PixelIconProps) {
  return (
    <svg
      className={`${sizeMap[size]} ${className}`}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Black outline */}
      <rect x="1" y="3" width="2" height="10" fill="black" />
      <rect x="3" y="5" width="2" height="2" fill="black" />
      <rect x="6" y="4" width="2" height="8" fill="black" />
      <rect x="9" y="5" width="2" height="2" fill="black" />
      <rect x="13" y="3" width="2" height="10" fill="black" />
      
      {/* Code fill (cyan/blue) */}
      <rect x="2" y="4" width="1" height="8" fill="currentColor" />
      <rect x="4" y="6" width="1" height="1" fill="currentColor" />
      <rect x="7" y="5" width="1" height="6" fill="currentColor" />
      <rect x="10" y="6" width="1" height="1" fill="currentColor" />
      <rect x="14" y="4" width="1" height="8" fill="currentColor" />
    </svg>
  );
}

/**
 * Shield Icon - Defense/Protection symbol
 */
export function PixelShield({ className = '', size = 'md' }: PixelIconProps) {
  return (
    <svg
      className={`${sizeMap[size]} ${className}`}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Black outline */}
      <rect x="4" y="1" width="8" height="3" fill="black" />
      <rect x="3" y="4" width="10" height="10" fill="black" />
      
      {/* Shield fill (green/blue) */}
      <rect x="5" y="2" width="6" height="2" fill="currentColor" />
      <rect x="4" y="5" width="8" height="8" fill="currentColor" />
    </svg>
  );
}

/**
 * Scroll Icon - Quest/Quest Log symbol
 */
export function PixelScroll({ className = '', size = 'md' }: PixelIconProps) {
  return (
    <svg
      className={`${sizeMap[size]} ${className}`}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Black outline */}
      <rect x="2" y="2" width="2" height="2" fill="black" />
      <rect x="1" y="4" width="14" height="8" fill="black" />
      <rect x="12" y="2" width="2" height="2" fill="black" />
      
      {/* Scroll fill (tan/brown) */}
      <rect x="3" y="3" width="1" height="1" fill="currentColor" />
      <rect x="12" y="3" width="1" height="1" fill="currentColor" />
      <rect x="2" y="5" width="12" height="6" fill="currentColor" />
      
      {/* Text lines on scroll */}
      <rect x="3" y="7" width="10" height="1" fill="black" opacity="0.5" />
      <rect x="3" y="9" width="8" height="1" fill="black" opacity="0.5" />
    </svg>
  );
}

/**
 * Gem Icon - Badge/Reward symbol
 */
export function PixelGem({ className = '', size = 'md' }: PixelIconProps) {
  return (
    <svg
      className={`${sizeMap[size]} ${className}`}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Black outline diamond */}
      <rect x="6" y="1" width="4" height="2" fill="black" />
      <rect x="4" y="3" width="8" height="2" fill="black" />
      <rect x="2" y="5" width="12" height="5" fill="black" />
      <rect x="4" y="10" width="8" height="2" fill="black" />
      <rect x="6" y="12" width="4" height="2" fill="black" />
      
      {/* Gem fill (purple/magenta) */}
      <rect x="7" y="2" width="2" height="1" fill="currentColor" />
      <rect x="5" y="4" width="6" height="1" fill="currentColor" />
      <rect x="3" y="6" width="10" height="3" fill="currentColor" />
      <rect x="5" y="11" width="6" height="1" fill="currentColor" />
      <rect x="7" y="13" width="2" height="1" fill="currentColor" />
    </svg>
  );
}

/**
 * Refresh Icon - Sync/Update symbol
 */
export function PixelRefresh({ className = '', size = 'md' }: PixelIconProps) {
  return (
    <svg
      className={`${sizeMap[size]} ${className}`}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Black outline circular arrow */}
      <rect x="2" y="6" width="2" height="4" fill="black" />
      <rect x="4" y="3" width="3" height="2" fill="black" />
      <rect x="7" y="2" width="2" height="2" fill="black" />
      <rect x="10" y="2" width="2" height="3" fill="black" />
      <rect x="12" y="6" width="2" height="4" fill="black" />
      <rect x="10" y="11" width="3" height="2" fill="black" />
      <rect x="7" y="12" width="2" height="2" fill="black" />
      <rect x="4" y="11" width="2" height="3" fill="black" />
      
      {/* Arrow fill (mana blue) */}
      <rect x="3" y="7" width="1" height="2" fill="currentColor" />
      <rect x="5" y="4" width="2" height="1" fill="currentColor" />
      <rect x="8" y="3" width="1" height="1" fill="currentColor" />
      <rect x="11" y="4" width="1" height="2" fill="currentColor" />
      <rect x="13" y="7" width="1" height="2" fill="currentColor" />
      <rect x="11" y="12" width="2" height="1" fill="currentColor" />
      <rect x="8" y="13" width="1" height="1" fill="currentColor" />
      <rect x="5" y="12" width="1" height="2" fill="currentColor" />
    </svg>
  );
}

/**
 * Logout Icon - Door/Exit symbol
 */
export function PixelLogout({ className = '', size = 'md' }: PixelIconProps) {
  return (
    <svg
      className={`${sizeMap[size]} ${className}`}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Black outline door */}
      <rect x="1" y="1" width="10" height="14" fill="black" />
      <rect x="12" y="6" width="2" height="4" fill="black" />
      <rect x="10" y="5" width="4" height="6" fill="black" />
      
      {/* Door fill */}
      <rect x="2" y="2" width="8" height="12" fill="currentColor" />
      
      {/* Door knob */}
      <rect x="8" y="7" width="2" height="2" fill="black" />
    </svg>
  );
}

/**
 * Checkmark Icon - Completion/Success symbol
 */
export function PixelCheckmark({ className = '', size = 'md' }: PixelIconProps) {
  return (
    <svg
      className={`${sizeMap[size]} ${className}`}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Black outline checkmark */}
      <rect x="3" y="9" width="2" height="2" fill="black" />
      <rect x="5" y="7" width="2" height="2" fill="black" />
      <rect x="7" y="5" width="2" height="2" fill="black" />
      <rect x="9" y="3" width="2" height="2" fill="black" />
      <rect x="11" y="1" width="2" height="2" fill="black" />
      
      {/* Check fill (green) */}
      <rect x="4" y="10" width="1" height="1" fill="currentColor" />
      <rect x="6" y="8" width="1" height="1" fill="currentColor" />
      <rect x="8" y="6" width="1" height="1" fill="currentColor" />
      <rect x="10" y="4" width="1" height="1" fill="currentColor" />
      <rect x="12" y="2" width="1" height="1" fill="currentColor" />
    </svg>
  );
}

/**
 * GitHub Icon - Source Control symbol
 */
export function PixelGithub({ className = '', size = 'md' }: PixelIconProps) {
  return (
    <svg
      className={`${sizeMap[size]} ${className}`}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Black outline octopus/GitHub symbol */}
      <rect x="6" y="1" width="4" height="2" fill="black" />
      <rect x="4" y="3" width="8" height="2" fill="black" />
      <rect x="3" y="5" width="10" height="6" fill="black" />
      <rect x="2" y="11" width="2" height="4" fill="black" />
      <rect x="6" y="11" width="4" height="4" fill="black" />
      <rect x="12" y="11" width="2" height="4" fill="black" />
      
      {/* Github fill (gray/white) */}
      <rect x="7" y="2" width="2" height="1" fill="currentColor" />
      <rect x="5" y="4" width="6" height="1" fill="currentColor" />
      <rect x="4" y="6" width="8" height="4" fill="currentColor" />
      <rect x="3" y="12" width="2" height="3" fill="currentColor" />
      <rect x="7" y="12" width="2" height="3" fill="currentColor" />
      <rect x="13" y="12" width="1" height="3" fill="currentColor" />
    </svg>
  );
}
