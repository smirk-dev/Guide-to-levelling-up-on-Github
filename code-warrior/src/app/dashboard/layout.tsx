import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Code Warrior',
  description: 'View your GitHub warrior stats, XP, rank progression, and battle stats. Track your coding journey and level up!',
  keywords: ['GitHub dashboard', 'developer stats', 'XP tracking', 'rank progression', 'coding gamification'],
  openGraph: {
    title: 'Dashboard | Code Warrior',
    description: 'View your GitHub warrior stats, XP, rank progression, and battle stats.',
    type: 'website',
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
