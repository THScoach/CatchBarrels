/**
 * BARRELS Standardized Tabs Component
 * 
 * Unified tab styling across all pages:
 * - Solid black background
 * - Thin gold underline under active tab
 * - Uppercase labels
 * - Smooth 200ms hover animation
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface BarrelsTabsProps {
  tabs: Array<{ id: string; label: string }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function BarrelsTabs({ tabs, activeTab, onTabChange, className }: BarrelsTabsProps) {
  return (
    <div className={cn('border-b border-gray-800', className)}>
      <nav className="flex space-x-8 overflow-x-auto scrollbar-hide" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'relative px-1 py-4 text-sm font-medium uppercase tracking-wide whitespace-nowrap',
                'transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-[#E8B14E]/50 rounded-sm',
                isActive
                  ? 'text-[#E8B14E]'
                  : 'text-gray-400 hover:text-gray-300'
              )}
            >
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#E8B14E] to-[#F5C76E]"
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
