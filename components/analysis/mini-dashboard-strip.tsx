'use client';

import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MiniDashboardStripProps {
  biggestFix: string;
  biggestWin?: string;
  focus?: string;
}

export function MiniDashboardStrip({ biggestFix, biggestWin, focus }: MiniDashboardStripProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex flex-wrap gap-2 mb-4"
    >
      {/* Biggest Fix */}
      {biggestFix && (
        <Badge 
          variant="outline" 
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border-red-500/30 text-red-300 text-xs"
        >
          <TrendingDown className="w-3.5 h-3.5" />
          <div className="flex flex-col items-start">
            <span className="text-[10px] text-red-400/70 leading-none">Biggest Fix</span>
            <span className="font-medium leading-tight">{biggestFix}</span>
          </div>
        </Badge>
      )}

      {/* Biggest Win */}
      {biggestWin && (
        <Badge 
          variant="outline" 
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border-green-500/30 text-green-300 text-xs"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <div className="flex flex-col items-start">
            <span className="text-[10px] text-green-400/70 leading-none">Biggest Win</span>
            <span className="font-medium leading-tight">{biggestWin}</span>
          </div>
        </Badge>
      )}

      {/* Focus (optional) */}
      {focus && (
        <Badge 
          variant="outline" 
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border-blue-500/30 text-blue-300 text-xs"
        >
          <Target className="w-3.5 h-3.5" />
          <div className="flex flex-col items-start">
            <span className="text-[10px] text-blue-400/70 leading-none">Focus</span>
            <span className="font-medium leading-tight">{focus}</span>
          </div>
        </Badge>
      )}
    </motion.div>
  );
}
