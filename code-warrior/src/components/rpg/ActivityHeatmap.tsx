'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PixelFrame, PixelTooltip } from '../ui/PixelComponents';
import type { ContributionDay } from '@/types/database';

interface ActivityHeatmapProps {
  contributions: ContributionDay[];
  className?: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

// Color palette matching the cyber-fantasy theme
const LEVEL_COLORS = {
  0: 'bg-[var(--void-darkest)]',
  1: 'bg-[var(--health-dark)]',
  2: 'bg-[var(--health-medium)]',
  3: 'bg-[var(--health-light)]',
  4: 'bg-[var(--gold-light)]',
} as const;

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  contributions,
  className = '',
}) => {
  // Process contributions into weeks for rendering
  const { weeks, monthLabels, totalContributions } = useMemo(() => {
    if (!contributions || contributions.length === 0) {
      // Generate empty placeholder for the past year
      const emptyWeeks: ContributionDay[][] = [];
      const now = new Date();
      const startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 1);
      startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday

      let currentWeek: ContributionDay[] = [];
      const date = new Date(startDate);

      while (date <= now) {
        currentWeek.push({
          date: date.toISOString().split('T')[0],
          count: 0,
          level: 0,
        });

        if (currentWeek.length === 7) {
          emptyWeeks.push(currentWeek);
          currentWeek = [];
        }
        date.setDate(date.getDate() + 1);
      }

      if (currentWeek.length > 0) {
        emptyWeeks.push(currentWeek);
      }

      return { weeks: emptyWeeks, monthLabels: [], totalContributions: 0 };
    }

    // Group contributions by week
    const weeks: ContributionDay[][] = [];
    let currentWeek: ContributionDay[] = [];
    let total = 0;
    const monthPositions: { month: string; index: number }[] = [];
    let lastMonth = '';

    contributions.forEach((day, index) => {
      currentWeek.push(day);
      total += day.count;

      // Track month changes for labels
      const month = MONTHS[new Date(day.date).getMonth()];
      if (month !== lastMonth && currentWeek.length === 1) {
        monthPositions.push({ month, index: weeks.length });
        lastMonth = month;
      }

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return { weeks, monthLabels: monthPositions, totalContributions: total };
  }, [contributions]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={className}
    >
      <PixelFrame variant="stone" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-pixel text-[11px] text-[var(--gray-highlight)]">
            Activity Log
          </h3>
          <span className="font-pixel text-[9px] text-[var(--health-light)]">
            {totalContributions.toLocaleString()} contributions
          </span>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="inline-flex flex-col gap-1 min-w-max">
            {/* Month labels */}
            <div className="flex gap-[2px] ml-7 mb-1">
              {monthLabels.map(({ month, index }, i) => (
                <span
                  key={`${month}-${i}`}
                  className="font-pixel text-[8px] text-[var(--gray-medium)]"
                  style={{ marginLeft: i === 0 ? 0 : `${(index - (monthLabels[i - 1]?.index || 0)) * 11 - 20}px` }}
                >
                  {month}
                </span>
              ))}
            </div>

            {/* Grid with day labels */}
            <div className="flex gap-1">
              {/* Day labels */}
              <div className="flex flex-col gap-[2px] mr-1">
                {DAYS.map((day, i) => (
                  <span
                    key={i}
                    className="font-pixel text-[7px] text-[var(--gray-medium)] h-[9px] leading-[9px]"
                  >
                    {day}
                  </span>
                ))}
              </div>

              {/* Contribution cells */}
              <div className="flex gap-[2px]">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[2px]">
                    {week.map((day, dayIndex) => (
                      <PixelTooltip
                        key={`${weekIndex}-${dayIndex}`}
                        content={`${day.count} contributions on ${new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                        position="top"
                      >
                        <div
                          className={`w-[9px] h-[9px] ${LEVEL_COLORS[day.level]} border border-[var(--void-darker)] cursor-pointer hover:border-[var(--gold-light)] transition-colors`}
                          style={{
                            boxShadow: day.level > 0 ? 'inset 1px 1px 0 rgba(255,255,255,0.2)' : undefined,
                          }}
                        />
                      </PixelTooltip>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-3">
              <span className="font-pixel text-[8px] text-[var(--gray-medium)]">Less</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`w-[9px] h-[9px] ${LEVEL_COLORS[level as keyof typeof LEVEL_COLORS]} border border-[var(--void-darker)]`}
                />
              ))}
              <span className="font-pixel text-[8px] text-[var(--gray-medium)]">More</span>
            </div>
          </div>
        </div>
      </PixelFrame>
    </motion.div>
  );
};
