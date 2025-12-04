'use client';

import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface OnboardingCompleteProps {
  onComplete: () => void;
  isLoading: boolean;
}

export function OnboardingComplete({ onComplete, isLoading }: OnboardingCompleteProps) {
  return (
    <div className="space-y-6 px-2 py-6">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="flex justify-center"
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-barrels-gold to-barrels-gold-light flex items-center justify-center">
          <Check className="w-12 h-12 text-black" strokeWidth={3} />
        </div>
      </motion.div>

      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-barrels-gold to-barrels-gold-light">
          You're All Set!
        </h2>
        <p className="text-gray-300 text-lg">
          Your CatchBarrels account is ready. Upload your first swing to unlock your Momentum Transfer Score.
        </p>
      </motion.div>

      {/* What's Next */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 border border-barrels-gold/30 rounded-lg p-6 space-y-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-barrels-gold" />
          <h3 className="text-lg font-bold text-white">What's Next?</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-barrels-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-barrels-gold text-sm font-bold">1</span>
            </div>
            <div>
              <p className="text-white font-medium">Upload Your First Swing</p>
              <p className="text-gray-400 text-sm">Get instant analysis with Momentum Transfer scoring</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-barrels-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-barrels-gold text-sm font-bold">2</span>
            </div>
            <div>
              <p className="text-white font-medium">Review Your Momentum Card</p>
              <p className="text-gray-400 text-sm">See your Anchor, Engine, and Whip scores</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-barrels-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-barrels-gold text-sm font-bold">3</span>
            </div>
            <div>
              <p className="text-white font-medium">Start Training with Coach Rick</p>
              <p className="text-gray-400 text-sm">Get personalized coaching and drill recommendations</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="pt-4"
      >
        <Button
          onClick={onComplete}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-barrels-gold to-barrels-gold-light hover:from-barrels-gold-light hover:to-barrels-gold text-black font-bold py-3 text-lg"
        >
          {isLoading ? 'Setting Up...' : 'Go to Dashboard'}
        </Button>
      </motion.div>

      {/* Motivational Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center pt-4"
      >
        <p className="text-sm text-gray-400 italic">
          "Every great hitter started with one swing. Let's make yours count."
        </p>
        <p className="text-xs text-barrels-gold mt-1">— Coach Rick</p>
      </motion.div>
    </div>
  );
}
