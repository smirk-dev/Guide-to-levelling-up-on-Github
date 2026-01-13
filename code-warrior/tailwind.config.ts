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
        // Cyber-Fantasy Theme from docs/ux-design.md
        background: "var(--background)",
        foreground: "var(--foreground)",

        // 16-bit Pixel Art Color Palette
        // Midnight Void spectrum (4 shades)
        'midnight-void': {
          0: '#000000', // Pure black
          1: '#0d1117', // Original dark background
          2: '#161b22', // Light dark
          3: '#21262d', // Border dark
          DEFAULT: '#0d1117',
        },

        // Loot Gold spectrum (5 shades)
        'loot-gold': {
          0: '#8b7500', // Dark gold
          1: '#b8a000', // Mid-dark gold
          2: '#ffd700', // Original gold
          3: '#ffed4e', // Bright gold
          4: '#fffacd', // Pale gold
          DEFAULT: '#ffd700',
        },

        // Mana Blue spectrum (4 shades)
        'mana-blue': {
          0: '#1e3a5f', // Dark blue
          1: '#2e4a6f', // Mid blue
          2: '#58a6ff', // Original blue
          3: '#79c0ff', // Light blue
          DEFAULT: '#58a6ff',
        },

        // Health Green spectrum (3 shades)
        'health-green': {
          0: '#1b5e2f', // Dark green
          1: '#2ea043', // Original green
          2: '#3fb950', // Light green
          DEFAULT: '#2ea043',
        },

        // Critical Red spectrum (2 shades)
        'critical-red': {
          0: '#a32828', // Dark red
          1: '#da3633', // Original red
          DEFAULT: '#da3633',
        },

        // Pixel Grays (2 shades)
        'gray-pixel': {
          0: '#30363d', // Mid gray
          1: '#484f58', // Light gray
        },
      },
      fontFamily: {
        'pixel': ['var(--font-press-start)', 'cursive'], // Headers/titles
        'mono': ['var(--font-fira-code)', 'monospace'], // Body text
        'sans': ['var(--font-inter)', 'sans-serif'], // UI elements
      },
      boxShadow: {
        // Pixel art hard-edged shadows
        'pixel-sm': '2px 2px 0 rgba(0, 0, 0, 0.5)',
        'pixel-md': '4px 4px 0 rgba(0, 0, 0, 0.5)',
        'pixel-lg': '6px 6px 0 rgba(0, 0, 0, 0.5)',

        // Layered border glows (no blur)
        'pixel-glow-gold': '0 0 0 2px #ffd700, 0 0 0 4px #b8a000',
        'pixel-glow-blue': '0 0 0 2px #58a6ff, 0 0 0 4px #2e4a6f',

        // Inset shadow for depth
        'pixel-inset': 'inset 2px 2px 0 rgba(0, 0, 0, 0.3)',

        // 3D button effect
        'pixel-button': 'inset -4px -4px 0 rgba(0, 0, 0, 0.2), 4px 4px 0 rgba(0, 0, 0, 0.5)',
      },
      borderWidth: {
        '3': '3px',
        '6': '6px',
        '8': '8px',
      },
      borderRadius: {
        'pixel': '0px', // No rounding for pixel elements
        'pixel-sm': '2px', // Minimal rounding
      },
    },
  },
  plugins: [
    // Custom plugin for pixel art utilities
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
      })
    }
  ],
};

export default config;
