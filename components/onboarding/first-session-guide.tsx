'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Upload, BarChart3, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface FirstSessionGuideProps {
  onComplete: () => void;
}

export function FirstSessionGuide({ onComplete }: FirstSessionGuideProps) {
  const router = useRouter();

  const handleStartSession = () => {
    // Mark onboarding step as advanced
    onComplete();
    // Navigate to upload page
    router.push('/video/upload?onboarding=true');
  };
  const steps = [
    {
      icon: Camera,
      title: 'Record 10-15 Swings',
      description: 'This helps us calibrate your Momentum Transfer Score and understand your swing mechanics.',
      tip: 'Tip: Use slow-motion video (120-240 FPS) for best results',
    },
    {
      icon: Upload,
      title: 'Upload Your Video',
      description: 'Quick and easy upload - we will analyze your swing mechanics automatically.',
      tip: 'Takes 30-60 seconds to process',
    },
    {
      icon: BarChart3,
      title: 'Get Your Momentum Score',
      description: 'You will receive your Momentum Transfer Score with coaching tips from Coach Rick AI.',
      tip: 'See your Anchor, Engine, and Whip scores',
    },
  ];

  return (
    <div className="space-y-6 px-2">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Your First Session</h2>
        <p className="text-gray-400">
          Let's capture your swing and unlock your Momentum Transfer analysis.
        </p>
      </div>

      {/* 3-Card Stepper */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-barrels-gold/50 transition-all">
              <div className="flex items-start gap-4">
                {/* Step Number Circle */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-barrels-gold to-barrels-gold-light flex items-center justify-center">
                  <span className="text-black font-bold">{index + 1}</span>
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <step.icon className="w-5 h-5 text-barrels-gold" />
                    <h3 className="text-lg font-bold text-white">{step.title}</h3>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{step.description}</p>
                  <p className="text-xs text-barrels-gold/80">{step.tip}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="pt-6 space-y-4">
        <Button
          onClick={handleStartSession}
          className="w-full bg-gradient-to-r from-barrels-gold to-barrels-gold-light hover:from-barrels-gold-light hover:to-barrels-gold text-black font-bold py-3 text-lg group"
        >
          Start My First Session
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>

        <p className="text-center text-sm text-gray-500">
          You can come back to this anytime from your dashboard
        </p>
      </div>

      {/* Coach Rick Tip */}
      <div className="mt-6 p-4 bg-barrels-gold/10 border border-barrels-gold/30 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-barrels-gold flex items-center justify-center flex-shrink-0">
            <span className="text-black font-bold text-lg">🎓</span>
          </div>
          <div>
            <p className="text-sm font-medium text-barrels-gold mb-1">Coach Rick Says:</p>
            <p className="text-sm text-gray-300">
              "Record from the side view (3rd base or 1st base angle) about 10-15 feet away. Make sure I can see your whole body from setup to follow-through!"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}