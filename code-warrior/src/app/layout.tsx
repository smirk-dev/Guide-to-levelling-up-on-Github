import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Code Warrior | Level Up Your GitHub Game',
  description: 'Transform your GitHub contributions into an epic RPG adventure. Earn XP, complete quests, collect badges, and climb the leaderboard!',
  keywords: ['GitHub', 'gamification', 'RPG', 'developer', 'coding', 'pixel art', 'retro gaming'],
  authors: [{ name: 'Code Warrior' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-[#0a0a0f]">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-pixel min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
