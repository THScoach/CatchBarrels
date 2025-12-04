'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { ProfileSetup } from './profile-setup';
import { FirstSessionGuide } from './first-session-guide';
import { OnboardingComplete } from './onboarding-complete';

interface FTUEModalProps {
  open: boolean;
  onComplete: () => void;
  userEmail?: string;
}

type OnboardingStep = 'profile' | 'session' | 'complete';

export function FTUEModal({ open, onComplete, userEmail }: FTUEModalProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('profile');
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    { id: 'profile', label: 'Set Up Profile', completed: currentStep !== 'profile' },
    { id: 'session', label: 'Your First Swings', completed: currentStep === 'complete' },
    { id: 'complete', label: 'Get Your Score', completed: false },
  ];

  const handleProfileComplete = async (profileData: any) => {
    setIsLoading(true);
    try {
      // Save profile data to API
      const response = await fetch('/api/onboarding/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) throw new Error('Failed to save profile');

      // Move to next step
      setCurrentStep('session');
    } catch (error) {
      console.error('Profile save error:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionGuideComplete = () => {
    setCurrentStep('complete');
  };

  const handleFinalComplete = async () => {
    setIsLoading(true);
    try {
      // Mark onboarding as complete
      await fetch('/api/onboarding/complete', {
        method: 'POST',
      });

      onComplete();
    } catch (error) {
      console.error('Onboarding completion error:', error);
      onComplete(); // Still close modal even if API fails
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-black border border-barrels-gold/20">
        {/* Header */}
        <div className="text-center mb-8 pt-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-barrels-gold to-barrels-gold-light mb-2">
              Welcome to CatchBarrels!
            </h1>
            <p className="text-gray-300 text-lg">Your swing journey starts today.</p>
          </motion.div>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center justify-center mb-8 px-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              {/* Step Circle */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  step.completed
                    ? 'bg-barrels-gold border-barrels-gold'
                    : currentStep === step.id
                    ? 'border-barrels-gold bg-barrels-gold/20'
                    : 'border-gray-600 bg-gray-800'
                }`}
              >
                {step.completed ? (
                  <Check className="w-5 h-5 text-black" />
                ) : (
                  <span
                    className={`text-sm font-bold ${
                      currentStep === step.id ? 'text-barrels-gold' : 'text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </span>
                )}
              </motion.div>

              {/* Step Label */}
              <div className="ml-2 mr-6 hidden sm:block">
                <p
                  className={`text-sm font-medium ${
                    currentStep === step.id ? 'text-barrels-gold' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`w-12 sm:w-16 h-0.5 transition-all ${
                    step.completed ? 'bg-barrels-gold' : 'bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ProfileSetup
                onComplete={handleProfileComplete}
                isLoading={isLoading}
              />
            </motion.div>
          )}

          {currentStep === 'session' && (
            <motion.div
              key="session"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <FirstSessionGuide
                onComplete={handleSessionGuideComplete}
              />
            </motion.div>
          )}

          {currentStep === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <OnboardingComplete
                onComplete={handleFinalComplete}
                isLoading={isLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
            <Loader2 className="w-8 h-8 text-barrels-gold animate-spin" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
