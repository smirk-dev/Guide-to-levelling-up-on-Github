import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: '375px', // iPhone SE and up
      },
      colors: {
        // Cyber-Fantasy Theme - Neon RPG Aesthetic
        background: "var(--background)",
        foreground: "var(--foreground)",

        // ==========================================
        // CYBER-NEON COLOR PALETTE
        // ==========================================

        // Deep Obsidian (Primary Backgrounds)
        'obsidian': {
          darkest: '#050507',
          darker: '#0A0A0B',
          dark: '#0F0F12',
          DEFAULT: '#0A0A0B',
          medium: '#151518',
          light: '#1A1A1F',
          lighter: '#222228',
        },

        // Electric Cyan (Primary Accent - Mana/Tech)
        'cyber-cyan': {
          darkest: '#003844',
          dark: '#006677',
          DEFAULT: '#00F0FF',
          medium: '#00D4E6',
          light: '#4DFFFF',
          glow: '#00F0FF',
        },

        // Pulse Violet (Secondary Accent - XP/Magic)
        'pulse-violet': {
          darkest: '#2D1B4E',
          dark: '#4C2885',
          DEFAULT: '#8B5CF6',
          medium: '#7C3AED',
          light: '#A78BFA',
          glow: '#8B5CF6',
        },

        // Neon Gold (Rewards/Achievements)
        'neon-gold': {
          darkest: '#664D00',
          dark: '#997300',
          DEFAULT: '#FFD700',
          medium: '#E6C200',
          light: '#FFED4E',
          highlight: '#FFF8DC',
        },

        // Health Green (HP/Success)
        'health-green': {
          darkest: '#0D3320',
          dark: '#166534',
          DEFAULT: '#22C55E',
          medium: '#16A34A',
          light: '#4ADE80',
          highlight: '#86EFAC',
        },

        // Critical Red (Danger/Alerts)
        'critical-red': {
          darkest: '#450A0A',
          dark: '#7F1D1D',
          DEFAULT: '#EF4444',
          medium: '#DC2626',
          light: '#F87171',
          highlight: '#FCA5A5',
        },

        // Neon Pink (Special/Rare)
        'neon-pink': {
          darkest: '#500724',
          dark: '#9D174D',
          DEFAULT: '#FF0080',
          medium: '#DB2777',
          light: '#F472B6',
          glow: '#FF0080',
        },

        // Neutral Grays (UI Elements)
        'cyber-gray': {
          darkest: '#18181B',
          dark: '#27272A',
          DEFAULT: '#3F3F46',
          medium: '#52525B',
          light: '#71717A',
          lighter: '#A1A1AA',
          highlight: '#D4D4D8',
        },

        // Legacy compatibility aliases
        'midnight-void': {
          0: '#050507',
          1: '#0A0A0B',
          2: '#0F0F12',
          3: '#151518',
          DEFAULT: '#0A0A0B',
        },
        'loot-gold': {
          0: '#664D00',
          1: '#997300',
          2: '#FFD700',
          3: '#FFED4E',
          4: '#FFF8DC',
          DEFAULT: '#FFD700',
        },
        'mana-blue': {
          0: '#003844',
          1: '#006677',
          2: '#00F0FF',
          3: '#4DFFFF',
          DEFAULT: '#00F0FF',
        },
        'gray-pixel': {
          0: '#3F3F46',
          1: '#52525B',
        },
      },
      fontFamily: {
        'pixel': ['var(--font-press-start)', 'Press Start 2P', 'cursive'],
        'mono': ['var(--font-fira-code)', 'Fira Code', 'Consolas', 'monospace'],
        'sans': ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        'display': ['var(--font-press-start)', 'Press Start 2P', 'cursive'],
      },
      boxShadow: {
        // Pixel art hard-edged shadows
        'pixel-sm': '2px 2px 0 rgba(0, 0, 0, 0.5)',
        'pixel-md': '4px 4px 0 rgba(0, 0, 0, 0.5)',
        'pixel-lg': '6px 6px 0 rgba(0, 0, 0, 0.5)',

        // Cyber neon glow effects
        'neon-cyan': '0 0 5px #00F0FF, 0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.2)',
        'neon-violet': '0 0 5px #8B5CF6, 0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.2)',
        'neon-gold': '0 0 5px #FFD700, 0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.2)',
        'neon-pink': '0 0 5px #FF0080, 0 0 20px rgba(255, 0, 128, 0.5), 0 0 40px rgba(255, 0, 128, 0.2)',
        'neon-green': '0 0 5px #22C55E, 0 0 20px rgba(34, 197, 94, 0.5), 0 0 40px rgba(34, 197, 94, 0.2)',
        'neon-red': '0 0 5px #EF4444, 0 0 20px rgba(239, 68, 68, 0.5), 0 0 40px rgba(239, 68, 68, 0.2)',

        // Glass panel shadows
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'glass-hover': '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',

        // Layered border glows (no blur)
        'pixel-glow-gold': '0 0 0 2px #FFD700, 0 0 0 4px #997300',
        'pixel-glow-cyan': '0 0 0 2px #00F0FF, 0 0 0 4px #006677',
        'pixel-glow-violet': '0 0 0 2px #8B5CF6, 0 0 0 4px #4C2885',

        // Inset shadow for depth
        'pixel-inset': 'inset 2px 2px 0 rgba(0, 0, 0, 0.3)',

        // 3D button effect
        'pixel-button': 'inset -4px -4px 0 rgba(0, 0, 0, 0.2), 4px 4px 0 rgba(0, 0, 0, 0.5)',

        // Quest button glow
        'quest-glow': '0 0 0 2px rgba(255, 215, 0, 0.3), 0 4px 15px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
      },
      borderWidth: {
        '3': '3px',
        '6': '6px',
        '8': '8px',
      },
      borderRadius: {
        'pixel': '0px',
        'pixel-sm': '2px',
        'glass': '12px',
        'glass-lg': '16px',
        'glass-xl': '24px',
      },
      backdropBlur: {
        'glass': '16px',
        'glass-lg': '24px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'cyber-pulse': 'cyber-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.8', filter: 'brightness(1.2)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.95' },
        },
        'cyber-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px currentColor, 0 0 10px currentColor' },
          '50%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' },
        },
      },
    },
  },
  plugins: [
    // Custom plugin for pixel art and glassmorphism utilities
    function({ addUtilities }: any) {
      addUtilities({
        '.pixel-perfect': {
          'image-rendering': 'pixelated',
        },
        '.no-smooth': {
          '-webkit-font-smoothing': 'none',
          '-moz-osx-font-smoothing': 'grayscale',
          'font-smooth': 'never',
        },
        '.pixel-border-notch-tl': {
          'clip-path': 'polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px)',
        },
        '.pixel-border-notch-all': {
          'clip-path': 'polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)',
        },
        // Glassmorphism utilities
        '.glass-panel': {
          'background': 'rgba(10, 10, 11, 0.8)',
          'backdrop-filter': 'blur(16px)',
          '-webkit-backdrop-filter': 'blur(16px)',
          'border': '1px solid rgba(255, 255, 255, 0.05)',
          'border-radius': '12px',
        },
        '.glass-panel-light': {
          'background': 'rgba(255, 255, 255, 0.05)',
          'backdrop-filter': 'blur(16px)',
          '-webkit-backdrop-filter': 'blur(16px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
          'border-radius': '12px',
        },
        '.glass-border': {
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-border-cyan': {
          'border': '1px solid rgba(0, 240, 255, 0.3)',
        },
        '.glass-border-violet': {
          'border': '1px solid rgba(139, 92, 246, 0.3)',
        },
        '.glass-border-gold': {
          'border': '1px solid rgba(255, 215, 0, 0.3)',
        },
        // Text glow utilities
        '.text-glow-cyan': {
          'text-shadow': '0 0 10px rgba(0, 240, 255, 0.7), 0 0 20px rgba(0, 240, 255, 0.5)',
        },
        '.text-glow-violet': {
          'text-shadow': '0 0 10px rgba(139, 92, 246, 0.7), 0 0 20px rgba(139, 92, 246, 0.5)',
        },
        '.text-glow-gold': {
          'text-shadow': '0 0 10px rgba(255, 215, 0, 0.7), 0 0 20px rgba(255, 215, 0, 0.5)',
        },
        '.text-glow-pink': {
          'text-shadow': '0 0 10px rgba(255, 0, 128, 0.7), 0 0 20px rgba(255, 0, 128, 0.5)',
        },
      })
    }
  ],
};

export default config;
