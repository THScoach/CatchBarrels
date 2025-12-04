'use client';

import { Card } from '@/components/ui/card';
import { Target } from 'lucide-react';

/**
 * Recommendation Engine Placeholder Tile
 * 
 * Placeholder for the drill recommendation engine.
 * Will eventually provide personalized drill recommendations with videos and instructions.
 */
export function RecommendationEnginePlaceholder() {
  return (
    <Card className="bg-gradient-to-br from-barrels-gold/10 to-yellow-500/10 border-barrels-gold/30 p-4 md:p-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-barrels-gold/20 border border-barrels-gold/40 flex items-center justify-center flex-shrink-0">
          <Target className="w-5 h-5 text-barrels-gold" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-1 text-sm md:text-base">Recommendation Engine</h3>
          <p className="text-gray-300 text-sm mb-2">
            Personalized drill recommendations based on your swing analysis.
          </p>
          <p className="text-gray-400 text-xs">
            The recommendation engine will analyze your metrics and suggest specific drills with video tutorials
            and step-by-step instructions to improve your weakest areas.
          </p>
        </div>
      </div>
    </Card>
  );
}
