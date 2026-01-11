/**
 * Pixel Art Utility Functions and Constants
 *
 * Helper functions and constants for creating authentic 16-bit pixel art styling
 * across the Code Warrior application.
 */

export const PIXEL_CONSTANTS = {
  BORDER_NOTCH: 8,
  MIN_BORDER_WIDTH: 3,
  SEGMENT_WIDTH: 16,
  ICON_SIZE: 24,
} as const;

/**
 * Color mapping for different stat bar variants
 * Returns CSS custom property references for 16-bit palette
 */
export const STAT_BAR_COLORS = {
  health: {
    dark: 'var(--health-green-0)',
    mid: 'var(--health-green-1)',
    light: 'var(--health-green-2)',
  },
  mana: {
    dark: 'var(--mana-blue-0)',
    mid: 'var(--mana-blue-1)',
    light: 'var(--mana-blue-2)',
  },
  xp: {
    dark: 'var(--loot-gold-0)',
    mid: 'var(--loot-gold-1)',
    light: 'var(--loot-gold-2)',
  },
} as const;

/**
 * Generate CSS for segmented progress bar background
 * Creates vertical stripes with alternating colors for pixel art effect
 */
export function generateSegmentedBarBackground(
  color: 'health' | 'mana' | 'xp'
): string {
  const colors = STAT_BAR_COLORS[color];

  return `repeating-linear-gradient(
    to right,
    ${colors.mid} 0px,
    ${colors.mid} 12px,
    ${colors.light} 12px,
    ${colors.light} ${PIXEL_CONSTANTS.SEGMENT_WIDTH}px
  )`;
}

/**
 * Generate stepped gradient stops for color banding effect
 * Replaces smooth gradients with distinct color bands
 */
export function generateSteppedGradient(
  colors: string[],
  direction: 'to right' | 'to bottom' = 'to right'
): string {
  const stepSize = 100 / colors.length;
  const stops = colors.flatMap((color, i) => {
    const start = i * stepSize;
    const end = (i + 1) * stepSize;
    return [`${color} ${start}%`, `${color} ${end}%`];
  });

  return `linear-gradient(${direction}, ${stops.join(', ')})`;
}

/**
 * Get pixel border classes based on variant
 * Returns Tailwind classes for consistent border styling
 */
export function getPixelBorderClass(
  variant: 'primary' | 'secondary' | 'success' | 'danger'
): string {
  const baseClasses = 'border-3 pixel-perfect';

  const variantClasses = {
    primary: 'border-loot-gold-2 shadow-pixel-glow-gold',
    secondary: 'border-mana-blue-2 shadow-pixel-glow-blue',
    success: 'border-health-green-1',
    danger: 'border-critical-red-1',
  };

  return `${baseClasses} ${variantClasses[variant]}`;
}

/**
 * Get 3D button border colors for raised state
 * Returns object with inline styles for pixel art 3D button effect
 */
export function get3DButtonStyle(
  color: 'gold' | 'blue' | 'green' | 'red' = 'gold',
  pressed: boolean = false
): React.CSSProperties {
  const colorMap = {
    gold: { light: 'var(--loot-gold-4)', dark: 'var(--loot-gold-0)', bg: 'var(--loot-gold-2)' },
    blue: { light: 'var(--mana-blue-3)', dark: 'var(--mana-blue-0)', bg: 'var(--mana-blue-2)' },
    green: { light: 'var(--health-green-2)', dark: 'var(--health-green-0)', bg: 'var(--health-green-1)' },
    red: { light: 'var(--critical-red-1)', dark: 'var(--critical-red-0)', bg: 'var(--critical-red-1)' },
  };

  const { light, dark, bg } = colorMap[color];

  if (pressed) {
    return {
      borderColor: `${dark} ${light} ${light} ${dark}`,
      boxShadow: `inset 2px 2px 0 rgba(0, 0, 0, 0.3)`,
      backgroundColor: bg,
    };
  }

  return {
    borderColor: `${light} ${dark} ${dark} ${light}`,
    boxShadow: `inset -4px -4px 0 rgba(0, 0, 0, 0.2), 4px 4px 0 rgba(0, 0, 0, 0.5)`,
    backgroundColor: bg,
  };
}

/**
 * Generate pixel art corner decorations
 * Returns array of corner positions for decorative pixel elements
 */
export function getCornerDecorations(size: number = 2): Array<{ top?: number; left?: number; right?: number; bottom?: number }> {
  return [
    { top: size, left: size }, // Top-left
    { top: size, right: size }, // Top-right
    { bottom: size, left: size }, // Bottom-left
    { bottom: size, right: size }, // Bottom-right
  ];
}

/**
 * Convert smooth animation easing to stepped for pixel art effect
 * (Optional - currently not used as we keep smooth animations per requirements)
 */
export function pixelateEasing(progress: number, steps: number = 8): number {
  return Math.floor(progress * steps) / steps;
}

/**
 * Calculate segment count for progress bar based on width
 * Helps align pixel segments to actual bar width
 */
export function calculateSegmentCount(widthPx: number): number {
  return Math.floor(widthPx / PIXEL_CONSTANTS.SEGMENT_WIDTH);
}

/**
 * Get Tailwind class for stat bar color variant
 */
export function getStatBarColorClass(color: 'health' | 'mana' | 'xp'): string {
  const colorMap = {
    health: 'bg-health-green-1',
    mana: 'bg-mana-blue-2',
    xp: 'bg-loot-gold-2',
  };

  return colorMap[color];
}

/**
 * Get button pressed state CSS
 * Returns transform/position adjustments for pixel art button press effect
 */
export function getButtonPressedState(isPressed: boolean): React.CSSProperties {
  if (isPressed) {
    return {
      transform: 'translate(2px, 2px)',
      boxShadow: 'inset 2px 2px 0 rgba(0, 0, 0, 0.3), inset -2px -2px 0 rgba(255, 255, 255, 0.1)',
    };
  }
  return {
    transform: 'translate(0, 0)',
  };
}

/**
 * Get input field recessed pixel slot styling
 * Creates appearance of a sunken control panel slot
 */
export function getPixelInputStyle(): React.CSSProperties {
  return {
    borderWidth: '4px',
    borderColor: 'var(--midnight-void-3) var(--midnight-void-0) var(--midnight-void-0) var(--midnight-void-3)',
    boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.5), inset -1px -1px 0 rgba(255, 255, 255, 0.1)',
    backgroundColor: 'var(--midnight-void-1)',
    outline: 'none',
  };
}
