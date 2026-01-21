'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PixelFrame, PixelButton } from '@/components';
import { IconSword, IconArrowLeft } from '@/components';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--void-darkest)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <PixelFrame variant="critical" padding="lg" className="text-center">
          {/* 404 Display */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-8"
          >
            <div className="font-pixel-heading text-[72px] text-[var(--critical-light)] leading-none mb-2">
              404
            </div>
            <div className="font-pixel text-[14px] text-[var(--critical)] mb-6">
              PAGE NOT FOUND
            </div>
          </motion.div>

          {/* Error Icon */}
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-8"
          >
            <IconSword size={48} color="#f85149" className="mx-auto" />
          </motion.div>

          {/* Error Message */}
          <p className="font-pixel text-[11px] text-[var(--gray-highlight)] mb-4">
            You've wandered into the void!
          </p>
          <p className="font-pixel text-[9px] text-[var(--gray-medium)] mb-8">
            This area is still under development or doesn't exist.
            Return to the dashboard to continue your adventure.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Link href="/dashboard">
              <div className="w-full">
                <PixelButton variant="gold">
                  <span className="flex items-center justify-center gap-2">
                    <IconArrowLeft size={16} />
                    RETURN TO DASHBOARD
                  </span>
                </PixelButton>
              </div>
            </Link>
            <Link href="/">
              <div className="w-full">
                <PixelButton variant="mana">
                  <span className="flex items-center justify-center gap-2">
                    <IconSword size={16} />
                    BACK TO HOME
                  </span>
                </PixelButton>
              </div>
            </Link>
          </div>

          {/* Fun Easter Egg Message */}
          <div className="mt-8 pt-6 border-t-2 border-dashed border-[var(--gray-dark)]">
            <p className="font-pixel text-[10px] text-[var(--gray-highlight)] italic">
              💾 404 CORE MEMORY DUMP 💾
            </p>
            <p className="font-pixel text-[10px] text-[var(--gray-light)] mt-2 font-mono">
              [SYS ERROR] Location Not Found
            </p>
          </div>
        </PixelFrame>
      </motion.div>
    </div>
  );
}
