'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { PixelFrame, PixelButton, PixelAvatar, PixelBadge } from '../ui/PixelComponents';
import { soundManager } from '@/lib/sound';
import {
  IconDashboard,
  IconQuest,
  IconBadge,
  IconLeaderboard,
  IconSync,
  IconLogout,
  IconGitHub,
  IconMenu,
  IconSword,
} from '../icons/PixelIcons';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onNavigate?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label, isActive, onNavigate }) => {
  const handleClick = () => {
    soundManager.click();
    onNavigate?.();
  };

  return (
    <Link href={href} onClick={handleClick}>
      <div
        className={`flex items-center gap-3 px-6 py-4 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--gold-light)] ${
          isActive
            ? 'bg-[var(--gold-dark)] border-l-4 border-[var(--gold-light)]'
            : 'hover:bg-[var(--void-light)] border-l-4 border-transparent'
        }`}
        onMouseEnter={() => soundManager.hover()}
      >
        {icon}
        <span
          className={`font-pixel text-[var(--font-sm)] ${
            isActive ? 'text-[var(--gold-light)]' : 'text-[var(--gray-highlight)]'
          }`}
        >
          {label}
        </span>
      </div>
    </Link>
  );
};

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '', onNavigate }) => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    {
      href: '/dashboard',
      icon: <IconDashboard size={20} color={pathname === '/dashboard' ? '#ffd700' : '#8b949e'} />,
      label: 'Dashboard',
    },
    {
      href: '/quests',
      icon: <IconQuest size={20} color={pathname === '/quests' ? '#ffd700' : '#8b949e'} />,
      label: 'Quests',
    },
    {
      href: '/badges',
      icon: <IconBadge size={20} color={pathname === '/badges' ? '#ffd700' : '#8b949e'} />,
      label: 'Badges',
    },
    {
      href: '/leaderboard',
      icon: <IconLeaderboard size={20} color={pathname === '/leaderboard' ? '#ffd700' : '#8b949e'} />,
      label: 'Leaderboard',
    },
  ];

  return (
    <div className={`w-64 h-full flex flex-col bg-[var(--void-dark)] border-r-4 border-[var(--gray-dark)] ${className}`}>
      {/* Logo */}
      <div className="flex-shrink-0 p-6 border-b-4 border-[var(--gray-dark)]">
        <Link href="/dashboard" className="flex items-center gap-3" onClick={onNavigate}>
          <IconSword size={32} color="#ffd700" />
          <h1 className="font-pixel-heading text-[14px] text-[var(--gold-light)] leading-relaxed">
            Code Warrior
          </h1>
        </Link>
      </div>

      {/* User Info */}
      {session?.user && (
        <div className="flex-shrink-0 p-4 border-b-4 border-[var(--gray-dark)]">
          <div className="flex items-center gap-3">
            <PixelAvatar
              src={session.user.image}
              alt={(session.user as any).username || session.user.name || 'User'}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="font-pixel text-[11px] text-white truncate">
                {(session.user as any).username || session.user.name}
              </p>
              <p className="font-pixel text-[9px] text-[var(--gray-medium)] truncate">
                @{(session.user as any).username || session.user.name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation - scrollable */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            isActive={pathname === item.href}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {/* Actions - always at bottom, no overlap */}
      <div className="flex-shrink-0 p-4 border-t-4 border-[var(--gray-dark)]">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 w-full px-4 py-3 hover:bg-[var(--critical-dark)] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--critical-light)] min-h-[44px]"
          aria-label="Sign out of Code Warrior"
        >
          <IconLogout size={20} color="#da3633" />
          <span className="font-pixel text-[var(--font-sm)] text-[var(--critical-light)]">
            Logout
          </span>
        </button>
      </div>
    </div>
  );
};

// Mobile sidebar wrapper that closes menu on navigation
const MobileSidebar: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => {
  return <Sidebar className="h-full overflow-y-auto" onNavigate={onNavigate} />;
};

interface HeaderProps {
  title: string;
  subtitle?: string;
  onSync?: () => void;
  syncing?: boolean;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onSync,
  syncing = false,
  className = '',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Close mobile menu when clicking nav items
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={`bg-[var(--void-dark)] border-b-4 border-[var(--gray-dark)] p-4 ${className}`}
      >
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-[var(--void-light)] transition-colors rounded min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-light)]"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            <IconMenu size={24} color="#ffd700" />
          </button>

          {/* Title */}
          <div>
            <h1 className="font-pixel-heading text-[16px] md:text-[20px] text-[var(--gold-light)]">
              {title}
            </h1>
            {subtitle && (
              <p className="font-pixel text-[var(--font-xs)] text-[var(--gray-highlight)] mt-1">
                {subtitle}
              </p>
            )}
          </div>

          {/* Sync Button */}
          {onSync && (
            <PixelButton
              variant="mana"
              size="sm"
              onClick={onSync}
              loading={syncing}
              className="flex items-center gap-2 min-h-[44px]"
              aria-label={syncing ? 'Syncing GitHub stats...' : 'Sync GitHub stats'}
            >
              <IconSync
                size={14}
                color="#fff"
                className={syncing ? 'animate-pixel-spin' : ''}
              />
              {syncing ? 'Syncing...' : 'Sync'}
            </PixelButton>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <motion.div
        initial={false}
        animate={mobileMenuOpen ? { opacity: 1, pointerEvents: 'auto' as const } : { opacity: 0, pointerEvents: 'none' as const }}
        transition={{ duration: 0.2 }}
        onClick={() => setMobileMenuOpen(false)}
        className="fixed inset-0 bg-black/80 z-50 md:hidden"
      />

      {/* Mobile Drawer */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: mobileMenuOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-full z-50 md:hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <MobileSidebar onNavigate={() => setMobileMenuOpen(false)} />
      </motion.aside>
    </>
  );
};

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onSync?: () => void;
  syncing?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  onSync,
  syncing,
}) => {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:block fixed left-0 top-0 h-full z-40">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        <Header
          title={title}
          subtitle={subtitle}
          onSync={onSync}
          syncing={syncing}
        />
        <motion.div
          key={pathname}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="p-4 md:p-6 lg:p-8 max-w-[1200px] mx-auto"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};
