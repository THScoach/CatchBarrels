'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, AlertCircle, Compass, Award, Star, Lock, Zap } from 'lucide-react';
import { PlayerAssessment, CONFIDENCE_LABELS } from '@/types/player-assessment';

interface YourSystemTodayProps {
  assessment: PlayerAssessment;
}

export function YourSystemToday({ assessment }: YourSystemTodayProps) {
  if (!assessment) return null;

  const {
    swingIdentity,
    constraints,
    primaryTrainingLane,
    coachSystemStatement,
    confidenceLevel,
    status,
    identityLocked,
    rebootDerivedIdentityConfidence,
  } = assessment;

  const isGoldStandard = status === 'reboot_verified' || confidenceLevel === 'reboot_verified';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Gold Standard Header Banner */}
      {isGoldStandard && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 p-1 rounded-t-xl"
        >
          <div className="bg-gradient-to-br from-amber-900/90 to-yellow-900/90 backdrop-blur-sm p-4 rounded-t-lg">
            <div className="flex items-center justify-center gap-3">
              <Star className="w-6 h-6 text-amber-300" fill="currentColor" />
              <span className="text-xl font-bold text-amber-100 tracking-wide">
                GOLD STANDARD ASSESSMENT
              </span>
              <Star className="w-6 h-6 text-amber-300" fill="currentColor" />
            </div>
            <p className="text-center text-amber-200 text-sm mt-1">
              Verified by Reboot Motion biomechanical analysis
              {rebootDerivedIdentityConfidence && (
                <span className="ml-2 font-semibold">
                  ({rebootDerivedIdentityConfidence.toFixed(1)}% confidence)
                </span>
              )}
            </p>
          </div>
        </motion.div>
      )}

      <Card className={`bg-gradient-to-br from-[#1E293B] to-[#0f1720] border-[#F5A623]/30 ${isGoldStandard ? 'rounded-t-none border-t-0' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Target className="w-6 h-6 text-[#F5A623]" />
              Your System Today
            </CardTitle>
            <div className="flex items-center gap-2">
              {identityLocked && (
                <Badge className="bg-red-500/20 text-red-300 border border-red-500/50">
                  <Lock className="w-3 h-3 mr-1" />
                  Locked
                </Badge>
              )}
              {!isGoldStandard && confidenceLevel === 'coach_verified' && (
                <Badge className="bg-green-500 text-white">
                  <Award className="w-3 h-3 mr-1" />
                  Coach Verified
                </Badge>
              )}
              {!isGoldStandard && confidenceLevel === 'automated' && (
                <Badge className="bg-blue-500/70 text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  Automated
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Swing Identity - Prominent Display */}
          {swingIdentity && (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-gradient-to-br from-[#F5A623]/20 to-[#F5A623]/5 border-2 border-[#F5A623]/50 rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-[#F5A623] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                  <Compass className="w-7 h-7 text-black" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm uppercase tracking-wide text-[#F5A623] font-semibold mb-2">
                    Your Swing Identity
                  </h3>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl font-black text-white tracking-tight">
                      {swingIdentity}
                    </span>
                    {identityLocked && (
                      <Lock className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    This is your swing DNA. Every drill, every coaching cue, every training session 
                    is personalized to YOUR unique movement pattern.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Training Lane */}
          {primaryTrainingLane && (
            <div className="flex items-center gap-3 p-4 bg-[#0f1720] rounded-lg border border-gray-700">
              <div className="text-[#F5A623] font-semibold text-sm">Primary Training Lane:</div>
              <Badge variant="outline" className="border-[#F5A623] text-[#F5A623] text-base px-3 py-1">
                {primaryTrainingLane}
              </Badge>
            </div>
          )}

          {/* Coach System Statement */}
          {coachSystemStatement && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-blue-500/40 rounded-lg p-5"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500/30 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-blue-500/30">
                  <Award className="w-6 h-6 text-blue-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-200 mb-3">
                    Coach Rick's System for You
                  </h3>
                  <div className="bg-[#0f1720]/60 rounded-lg p-4 border-l-4 border-blue-400">
                    <p className="text-gray-200 leading-relaxed whitespace-pre-wrap text-base">
                      {coachSystemStatement}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Constraints - What NOT to Chase */}
          {constraints && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-gradient-to-br from-red-900/30 to-red-800/10 border border-red-500/40 rounded-lg p-5"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-500/30 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-red-500/30">
                  <AlertCircle className="w-6 h-6 text-red-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-200 mb-3">
                    What NOT to Chase
                  </h3>
                  <div className="bg-[#0f1720]/60 rounded-lg p-4 border-l-4 border-red-400">
                    <p className="text-gray-200 leading-relaxed whitespace-pre-wrap text-base">
                      {constraints}
                    </p>
                  </div>
                  <p className="text-red-300/70 text-sm mt-3 italic">
                    These are your guardrails. Respect them.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Bottom Info Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center pt-2 border-t border-gray-700/50"
          >
            <p className="text-gray-400 text-sm leading-relaxed">
              {isGoldStandard && (
                <span className="text-amber-300 font-semibold">
                  ⭐ Gold Standard Assessment • 
                </span>
              )}{' '}
              Your system is locked in. All training and feedback are personalized to YOUR swing identity.
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
