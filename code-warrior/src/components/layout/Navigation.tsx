'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { PixelFrame, PixelButton, PixelAvatar, PixelBadge } from '../ui/PixelComponents';
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
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label, isActive }) => {
  return (
    <Link href={href}>
      <div
        className={`flex items-center gap-3 px-6 py-4 transition-all ${
          isActive
            ? 'bg-[var(--gold-dark)] border-l-4 border-[var(--gold-light)]'
            : 'hover:bg-[var(--void-light)] border-l-4 border-transparent'
        }`}
      >
        {icon}
        <span
          className={`font-pixel text-[10px] ${
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
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    {
      href: '/dashboard',
      icon: <IconDashboard size={20} color={pathname === '/dashboard' ? '#ffd700' : '#8b949e'} />,
      label: 'DASHBOARD',
    },
    {
      href: '/quests',
      icon: <IconQuest size={20} color={pathname === '/quests' ? '#ffd700' : '#8b949e'} />,
      label: 'QUESTS',
    },
    {
      href: '/badges',
      icon: <IconBadge size={20} color={pathname === '/badges' ? '#ffd700' : '#8b949e'} />,
      label: 'BADGES',
    },
    {
      href: '/leaderboard',
      icon: <IconLeaderboard size={20} color={pathname === '/leaderboard' ? '#ffd700' : '#8b949e'} />,
      label: 'LEADERBOARD',
    },
  ];

  return (
    <div className={`w-64 bg-[var(--void-dark)] border-r-4 border-[var(--gray-dark)] ${className}`}>
      {/* Logo */}
      <div className="p-6 border-b-4 border-[var(--gray-dark)]">
        <Link href="/dashboard" className="flex items-center gap-3">
          <IconSword size={32} color="#ffd700" />
          <div>
            <h1 className="font-pixel-heading text-[14px] text-[var(--gold-light)]">
              CODE
            </h1>
            <h1 className="font-pixel-heading text-[14px] text-[var(--gold-light)]">
              WARRIOR
            </h1>
          </div>
        </Link>
      </div>

      {/* User Info */}
      {session?.user && (
        <div className="p-4 border-b-4 border-[var(--gray-dark)]">
          <div className="flex items-center gap-3">
            <PixelAvatar
              src={session.user.image}
              alt={session.user.name || 'User'}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="font-pixel text-[10px] text-white truncate">
                {session.user.name}
              </p>
              <p className="font-pixel text-[7px] text-[var(--gray-medium)] truncate">
                @{session.user.name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="py-4">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            isActive={pathname === item.href}
          />
        ))}
      </nav>

      {/* Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t-4 border-[var(--gray-dark)]">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 w-full px-4 py-3 hover:bg-[var(--critical-dark)] transition-colors"
        >
          <IconLogout size={20} color="#da3633" />
          <span className="font-pixel text-[10px] text-[var(--critical-light)]">
            LOGOUT
          </span>
        </button>
      </div>
    </div>
  );
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

  return (
    <header
      className={`bg-[var(--void-dark)] border-b-4 border-[var(--gray-dark)] p-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2"
        >
          <IconMenu size={24} />
        </button>

        {/* Title */}
        <div>
          <h1 className="font-pixel-heading text-[16px] md:text-[20px] text-[var(--gold-light)]">
            {title}
          </h1>
          {subtitle && (
            <p className="font-pixel text-[8px] text-[var(--gray-highlight)] mt-1">
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
            className="flex items-center gap-2"
          >
            <IconSync
              size={14}
              color="#fff"
              className={syncing ? 'animate-pixel-spin' : ''}
            />
            SYNC
          </PixelButton>
        )}
      </div>
    </header>
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
        <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">{children}</div>
      </main>
    </div>
  );
};
