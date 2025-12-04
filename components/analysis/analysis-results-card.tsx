'use client';

import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface AnalysisResultsCardProps {
  scores: {
    goat: number;
    anchor: number;
    engine: number;
    whip: number;
  };
}

export function AnalysisResultsCard({ scores }: AnalysisResultsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700 p-6">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4 text-center">
          Analysis Results
        </h2>

        {/* Center: Big BARREL Circle */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            {/* Circular progress ring */}
            <svg className="w-32 h-32 -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#374151"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(scores.goat / 100) * 2 * Math.PI * 56} ${2 * Math.PI * 56}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Trophy className="w-6 h-6 text-orange-500 mb-1" />
              <span className="text-3xl font-bold text-white">{scores.goat}</span>
              <span className="text-xs text-gray-400">BARREL</span>
            </div>
          </div>
        </div>

        {/* Three smaller metrics below */}
        <div className="grid grid-cols-3 gap-3">
          {/* ENGINE */}
          <div className="flex flex-col items-center p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{scores.engine}</div>
            <div className="text-[10px] text-green-300/70 uppercase tracking-wide">Engine</div>
            <Progress value={scores.engine} className="h-1 mt-2 w-full" />
          </div>

          {/* ANCHOR */}
          <div className="flex flex-col items-center p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-400">{scores.anchor}</div>
            <div className="text-[10px] text-orange-300/70 uppercase tracking-wide">Anchor</div>
            <Progress value={scores.anchor} className="h-1 mt-2 w-full" />
          </div>

          {/* WHIP */}
          <div className="flex flex-col items-center p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">{scores.whip}</div>
            <div className="text-[10px] text-purple-300/70 uppercase tracking-wide">Whip</div>
            <Progress value={scores.whip} className="h-1 mt-2 w-full" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
