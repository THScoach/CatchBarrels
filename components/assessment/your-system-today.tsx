'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, AlertCircle, Compass, Award } from 'lucide-react';
import { PlayerAssessment } from '@/types/player-assessment';

interface YourSystemTodayProps {
  assessment: PlayerAssessment;
}

export function YourSystemToday({ assessment }: YourSystemTodayProps) {
  if (!assessment) return null;

  const { swingIdentity, constraints, primaryTrainingLane, coachSystemStatement, confidenceLevel } = assessment;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-[#1E293B] to-[#0f1720] border-[#F5A623]/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Target className="w-6 h-6 text-[#F5A623]" />
              Your System Today
            </CardTitle>
            {confidenceLevel === 'reboot_verified' && (
              <Badge className="bg-amber-500 text-white">
                <Award className="w-3 h-3 mr-1" />
                Reboot Verified
              </Badge>
            )}
            {confidenceLevel === 'coach_verified' && (
              <Badge className="bg-green-500 text-white">
                Coach Verified
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Swing Identity */}
          {swingIdentity && (
            <div className="bg-[#0f1720] border border-[#F5A623]/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#F5A623]/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Compass className="w-5 h-5 text-[#F5A623]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">Your Identity</h3>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#F5A623] text-black text-lg font-bold px-4 py-1">
                      {swingIdentity}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    This is your swing DNA. All training is built around this foundation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Training Lane */}
          {primaryTrainingLane && (
            <div className="flex items-center gap-3 p-3 bg-[#0f1720] rounded-lg border border-gray-700">
              <div className="text-[#F5A623] font-semibold">Training Lane:</div>
              <Badge variant="outline" className="border-[#F5A623] text-[#F5A623]">
                {primaryTrainingLane}
              </Badge>
            </div>
          )}

          {/* Coach System Statement */}
          {coachSystemStatement && (
            <div className="bg-[#0f1720] border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Coach Rick's System for You</h3>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {coachSystemStatement}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Constraints */}
          {constraints && (
            <div className="bg-[#0f1720] border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">What NOT to Chase</h3>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {constraints}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info Message */}
          <div className="text-center text-sm text-gray-400 pt-2">
            Your system is locked in. Training and feedback are personalized to YOUR swing identity.
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
