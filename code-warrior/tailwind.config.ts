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
      colors: {
        // Cyber-Fantasy Theme from docs/ux-design.md
        background: "var(--background)",
        foreground: "var(--foreground)",
        
        // Custom Code Warrior colors
        'midnight-void': '#0d1117', // Background (matching GitHub dark mode)
        'loot-gold': '#ffd700', // Primary actions/rewards
        'mana-blue': '#58a6ff', // Stats/secondary
        'health-green': '#2ea043', // Health bars
        'critical-red': '#da3633', // Errors/alerts
      },
      fontFamily: {
        'pixel': ['var(--font-press-start)', 'cursive'], // Headers/titles
        'mono': ['var(--font-fira-code)', 'monospace'], // Body text
        'sans': ['var(--font-inter)', 'sans-serif'], // UI elements
      },
    },
  },
  plugins: [],
};

export default config;
