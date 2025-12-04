"use client";

import { motion } from 'framer-motion';
import { Crown, TrendingUp, Calendar, AlertCircle, Zap, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTierConfig, type MembershipTier } from '@/lib/membership-tiers';

interface MembershipUsageCardProps {
  tier: MembershipTier;
  sessionsUsedThisWeek: number;
  membershipStatus?: string;
  membershipExpiresAt?: Date | null;
  // Assessment-specific props
  isAssessment?: boolean;
  assessmentDaysLeft?: number;
  assessmentSessionsUsed?: number;
  assessmentSessionsAllowed?: number;
  // POD Credits (for Hybrid tier)
  podCreditsAvailable?: number;
  podCreditsUsed?: number;
}

export function MembershipUsageCard({
  tier,
  sessionsUsedThisWeek,
  membershipStatus,
  membershipExpiresAt,
  isAssessment = false,
  assessmentDaysLeft,
  assessmentSessionsUsed,
  assessmentSessionsAllowed,
  podCreditsAvailable = 0,
  podCreditsUsed = 0,
}: MembershipUsageCardProps) {
  const config = getTierConfig(tier);
  const limit = config.sessionsPerWeek;
  const isUnlimited = limit === 'unlimited';
  const isActive = membershipStatus === 'active';
  const isHybridTier = tier === 'hybrid';

  // Calculate usage percentage for progress bar
  const usagePercent = isUnlimited 
    ? 0 
    : Math.min(100, (sessionsUsedThisWeek / (limit as number)) * 100);

  // Determine status color
  const getStatusColor = () => {
    if (isAssessment) return 'text-purple-400';
    if (!isActive) return 'text-gray-400';
    if (isUnlimited) return 'text-barrels-gold';
    if (usagePercent >= 100) return 'text-red-400';
    if (usagePercent >= 75) return 'text-yellow-400';
    return 'text-emerald-400';
  };

  const statusColor = getStatusColor();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="bg-gradient-to-br from-barrels-black-light to-barrels-black border-barrels-gold/20">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{config.icon}</span>
                <h3 className={`text-lg font-semibold ${config.color}`}>
                  {config.displayName}
                </h3>
              </div>
              {config.price && (
                <p className="text-sm text-gray-400">
                  ${config.price}/{config.billingCycle}
                </p>
              )}
            </div>
            
            {/* Status Badge */}
            <Badge 
              variant="outline" 
              className={`border-current ${statusColor}`}
            >
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Assessment Mode */}
          {isAssessment && assessmentDaysLeft !== undefined ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">Assessment Access</span>
                </div>
                <span className="text-sm font-medium text-purple-400">
                  {assessmentDaysLeft} days left
                </span>
              </div>

              {assessmentSessionsUsed !== undefined && assessmentSessionsAllowed !== undefined && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Sessions Used</span>
                    <span className="text-sm font-medium text-white">
                      {assessmentSessionsUsed} / {assessmentSessionsAllowed}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${(assessmentSessionsUsed / assessmentSessionsAllowed) * 100}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    />
                  </div>
                </div>
              )}

              {assessmentDaysLeft <= 7 && (
                <div className="flex items-start gap-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-orange-300">
                    Your assessment window expires soon. Choose a membership to continue using CatchBarrels!
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Regular Membership Mode */
            <div className="space-y-3">
              {/* Weekly Usage */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className={`w-4 h-4 ${statusColor}`} />
                  <span className="text-sm text-gray-300">This Week</span>
                </div>
                {isUnlimited ? (
                  <span className="text-sm font-medium text-barrels-gold">
                    {sessionsUsedThisWeek} sessions • Unlimited
                  </span>
                ) : (
                  <span className={`text-sm font-medium ${statusColor}`}>
                    {sessionsUsedThisWeek} / {limit} sessions
                  </span>
                )}
              </div>

              {/* Progress Bar (only for limited tiers) */}
              {!isUnlimited && limit > 0 && (
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${
                      usagePercent >= 100
                        ? 'bg-gradient-to-r from-red-500 to-red-400'
                        : usagePercent >= 75
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${usagePercent}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </div>
              )}

              {/* Monthly Estimate */}
              <div className="text-xs text-gray-400">
                ~{config.sessionsPerMonth}
              </div>

              {/* Swing Limit Display */}
              {config.swingsPerSession > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-barrels-gold" />
                    <span className="text-sm text-gray-300">Swings per Lesson</span>
                  </div>
                  <span className="text-sm font-medium text-barrels-gold">
                    Up to {config.swingsPerSession}
                  </span>
                </div>
              )}

              {/* POD Credits (Hybrid tier only) */}
              {isHybridTier && (
                <div className="space-y-2 pt-2 border-t border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-gray-300">POD Credits</span>
                    </div>
                    <span className={`text-sm font-medium ${podCreditsAvailable > 0 ? 'text-purple-400' : 'text-gray-500'}`}>
                      {podCreditsAvailable} available
                    </span>
                  </div>
                  
                  {podCreditsAvailable > 0 ? (
                    <Link href="/pods">
                      <motion.button
                        className="w-full py-2 px-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-medium rounded-lg text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Book POD Session
                      </motion.button>
                    </Link>
                  ) : (
                    <div className="text-xs text-gray-500">
                      {podCreditsUsed > 0 ? 'POD credit used this month' : 'No POD credits available'}
                    </div>
                  )}
                </div>
              )}

              {/* Warning for users at/near limit */}
              {!isUnlimited && sessionsUsedThisWeek >= (limit as number) && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-red-300 mb-1">
                      You've used all {limit} sessions for this week.
                    </p>
                    <p className="text-xs text-red-200">
                      Next session unlocks on Monday, or{' '}
                      <Link href="/purchase-required" className="text-barrels-gold hover:text-barrels-gold-light underline">
                        upgrade now
                      </Link>
                      {' '}for more!
                    </p>
                  </div>
                </div>
              )}

              {/* Upgrade CTA for free users */}
              {tier === 'free' && (
                <Link href="/purchase-required">
                  <motion.button
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-barrels-gold to-barrels-gold-light text-barrels-black font-semibold rounded-lg text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Crown className="w-4 h-4" />
                      <span>Upgrade to Start Training</span>
                    </div>
                  </motion.button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
