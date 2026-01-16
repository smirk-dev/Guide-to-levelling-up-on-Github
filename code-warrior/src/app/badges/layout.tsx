import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Badges | Code Warrior',
  description: 'Collect and equip badges to boost your warrior stats. Unlock achievements and showcase your GitHub accomplishments.',
  keywords: ['GitHub badges', 'developer achievements', 'stat boosts', 'badge collection', 'gamification'],
  openGraph: {
    title: 'Badges | Code Warrior',
    description: 'Collect and equip badges to boost your warrior stats.',
    type: 'website',
  },
};

export default function BadgesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
