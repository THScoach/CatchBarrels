/**
 * Coach Rick Tip Component
 * 
 * Displays contextual coaching tips on every screen
 * to help athletes understand what they're looking at.
 */

import * as React from 'react';
import { Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface RickTipProps {
  title?: string;
  text: string;
  className?: string;
  variant?: 'default' | 'compact';
}

export function RickTip({ title, text, className, variant = 'default' }: RickTipProps) {
  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className={cn(
          'flex items-start gap-3 p-3 rounded-lg',
          'bg-gradient-to-br from-[#E8B14E]/10 to-[#E8B14E]/5',
          'border border-[#E8B14E]/20',
          className
        )}
      >
        <Lightbulb className="w-4 h-4 text-[#E8B14E] mt-0.5 flex-shrink-0" />
        <p className="text-sm text-gray-300">{text}</p>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className={cn(
        'p-4 rounded-xl',
        'bg-gradient-to-br from-[#E8B14E]/10 via-[#E8B14E]/5 to-transparent',
        'border border-[#E8B14E]/20',
        'backdrop-blur-sm',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#E8B14E]/20 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-[#E8B14E]" />
        </div>
        <div className="flex-1 space-y-1">
          {title && (
            <h4 className="text-sm font-semibold text-[#E8B14E] uppercase tracking-wide">
              Coach Rick's Tip
            </h4>
          )}
          <p className="text-base text-gray-300 leading-relaxed">
            {text}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
