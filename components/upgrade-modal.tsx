"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, TrendingUp, Zap, MapPin, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MEMBERSHIP_TIERS, type MembershipTier } from '@/lib/membership-tiers';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: MembershipTier;
  reason: 'session_limit' | 'swing_limit' | 'no_access';
}

export default function UpgradeModal({
  isOpen,
  onClose,
  currentTier,
  reason,
}: UpgradeModalProps) {
  const currentConfig = MEMBERSHIP_TIERS[currentTier];

  // Get upgrade options (next tier and above)
  const tierOrder: MembershipTier[] = ['free', 'starter', 'performance', 'hybrid', 'pro'];
  const currentIndex = tierOrder.indexOf(currentTier);
  const upgradeOptions = tierOrder.slice(currentIndex + 1);

  const getMessage = () => {
    switch (reason) {
      case 'session_limit':
        return {
          title: "You've Reached Your Lesson Limit",
          description: `Your ${currentConfig.displayName} plan allows ${currentConfig.sessionsPerWeek} lesson${currentConfig.sessionsPerWeek === 1 ? '' : 's'} per week. Upgrade for more training!`,
          icon: TrendingUp,
        };
      case 'swing_limit':
        return {
          title: 'Swing Limit Reached',
          description: `Your ${currentConfig.displayName} plan allows up to ${currentConfig.swingsPerSession} swings per lesson. Upgrade to Pro for 25 swings per lesson!`,
          icon: Zap,
        };
      case 'no_access':
      default:
        return {
          title: 'Upgrade to Start Training',
          description: 'Get access to advanced swing analysis and personalized coaching.',
          icon: Crown,
        };
    }
  };

  const message = getMessage();
  const Icon = message.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-3xl pointer-events-auto"
            >
              <Card className="bg-barrels-black border-barrels-gold/30 shadow-2xl">
                <CardContent className="p-6 md:p-8">
                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-barrels-gold to-barrels-gold-light flex items-center justify-center">
                        <Icon className="w-8 h-8 text-barrels-black" />
                      </div>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {message.title}
                    </h2>
                    <p className="text-gray-400 text-lg">{message.description}</p>
                  </div>

                  {/* Current Plan */}
                  <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Current Plan</p>
                        <p className="text-white font-semibold">{currentConfig.displayName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">
                          {currentConfig.sessionsPerWeek === 'unlimited'
                            ? 'Unlimited'
                            : `${currentConfig.sessionsPerWeek} lesson${currentConfig.sessionsPerWeek === 1 ? '' : 's'}/week`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {currentConfig.swingsPerSession} swings/lesson
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Upgrade Options */}
                  <div className="space-y-3 mb-6">
                    <h3 className="text-lg font-semibold text-white">Upgrade Options</h3>
                    <div className="grid gap-3">
                      {upgradeOptions.map((tierId) => {
                        const tierConfig = MEMBERSHIP_TIERS[tierId];
                        const isRecommended = tierId === upgradeOptions[0];

                        return (
                          <motion.div
                            key={tierId}
                            whileHover={{ scale: 1.02 }}
                            className="relative"
                          >
                            {isRecommended && (
                              <Badge className="absolute -top-2 -right-2 bg-barrels-gold text-barrels-black">
                                Recommended
                              </Badge>
                            )}
                            <Link href="/purchase-required" onClick={onClose}>
                              <Card
                                className={`cursor-pointer transition-all border-2 ${
                                  isRecommended
                                    ? 'border-barrels-gold bg-gradient-to-br from-barrels-gold/10 to-transparent'
                                    : 'border-gray-700 bg-barrels-black-light hover:border-barrels-gold/50'
                                }`}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-2xl">{tierConfig.icon}</span>
                                        <div>
                                          <h4 className="font-semibold text-white text-lg">
                                            {tierConfig.displayName}
                                          </h4>
                                          <p className="text-sm text-barrels-gold font-semibold">
                                            ${tierConfig.price}/month
                                          </p>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-center gap-2 text-gray-300">
                                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                                          <span>
                                            {tierConfig.sessionsPerWeek === 'unlimited'
                                              ? 'Unlimited'
                                              : `${tierConfig.sessionsPerWeek} lesson${tierConfig.sessionsPerWeek === 1 ? '' : 's'}/week`}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-300">
                                          <Zap className="w-4 h-4 text-barrels-gold" />
                                          <span>{tierConfig.swingsPerSession} swings/lesson</span>
                                        </div>
                                        {tierConfig.podCreditsPerMonth && (
                                          <div className="flex items-center gap-2 text-gray-300">
                                            <MapPin className="w-4 h-4 text-purple-400" />
                                            <span>{tierConfig.podCreditsPerMonth} POD/month</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <Crown className="w-6 h-6 text-barrels-gold" />
                                  </div>
                                </CardContent>
                              </Card>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="flex-1 border-gray-700"
                    >
                      Maybe Later
                    </Button>
                    <Link href="/purchase-required" className="flex-1" onClick={onClose}>
                      <Button className="w-full bg-gradient-to-r from-barrels-gold to-barrels-gold-light text-barrels-black font-semibold">
                        View Plans
                      </Button>
                    </Link>
                  </div>

                  {/* Features Note */}
                  <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-xs text-blue-300 text-center">
                      All plans include BARREL Score analysis, Coach Rick insights, and progress tracking
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
