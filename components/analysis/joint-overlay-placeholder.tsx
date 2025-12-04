'use client';

import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

/**
 * AI Joint Overlay Placeholder Tile
 * 
 * Placeholder for the AI joint/bat overlay from Abacus.
 * Will eventually show real-time joint tracking and biomechanics visualization.
 */
export function JointOverlayPlaceholder() {
  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30 p-4 md:p-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-1 text-sm md:text-base">AI Joint Overlay</h3>
          <p className="text-gray-300 text-sm mb-2">
            Advanced AI-powered joint tracking and biomechanics visualization.
          </p>
          <p className="text-gray-400 text-xs">
            This feature will display real-time joint positions, bat path, and kinematic sequence analysis.
            Coming soon with Abacus AI integration.
          </p>
        </div>
      </div>
    </Card>
  );
}
