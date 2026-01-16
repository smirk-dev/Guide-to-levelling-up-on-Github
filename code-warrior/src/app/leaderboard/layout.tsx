import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leaderboard | Code Warrior',
  description: 'Compete with other GitHub warriors! See top ranked developers and climb the leaderboard with your contributions.',
  keywords: ['GitHub leaderboard', 'developer rankings', 'top coders', 'XP leaderboard', 'competitive coding'],
  openGraph: {
    title: 'Leaderboard | Code Warrior',
    description: 'Compete with other GitHub warriors and climb the rankings!',
    type: 'website',
  },
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
