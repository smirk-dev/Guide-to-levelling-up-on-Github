'use client';

import React from 'react';
import { motion } from 'framer-motion';

export type DashboardTab = 'quick' | 'activity' | 'quests';

interface Tab {
  id: DashboardTab;
  label: string;
  icon: string;
}

const tabs: Tab[] = [
  { id: 'quick', label: 'Quick View', icon: '⚡' },
  { id: 'activity', label: 'Activity', icon: '📊' },
  { id: 'quests', label: 'Quests', icon: '🎯' },
];

interface TabNavigationProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  claimableCount?: number;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  claimableCount = 0,
}) => {
  return (
    <div className="tab-navigation-container">
      <nav 
        className="tab-navigation" 
        role="tablist" 
        aria-label="Dashboard sections"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const showBadge = tab.id === 'quests' && claimableCount > 0;
          
          return (
            <motion.button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`tab-button ${isActive ? 'tab-button-active' : ''}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              
              {/* Notification badge for quests */}
              {showBadge && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="tab-badge"
                >
                  {claimableCount}
                </motion.span>
              )}
              
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="tab-active-indicator"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
};

export default TabNavigation;
