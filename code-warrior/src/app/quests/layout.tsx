import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quests | Code Warrior',
  description: 'Complete GitHub quests to earn XP and rewards. Track your progress on coding challenges and achievements.',
  keywords: ['GitHub quests', 'coding challenges', 'developer achievements', 'XP rewards', 'gamification'],
  openGraph: {
    title: 'Quests | Code Warrior',
    description: 'Complete GitHub quests to earn XP and rewards.',
    type: 'website',
  },
};

export default function QuestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
