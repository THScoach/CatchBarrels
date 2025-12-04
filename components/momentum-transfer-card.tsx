/**
 * Momentum Transfer Card Component
 * 
 * Displays the Momentum Transfer Score (master metric) with
 * Ground Flow / Power Flow / Barrel Flow sub-scores and leak indicators.
 * 
 * BARRELS Flow Path Model™
 * Layout matches BARRELS branding and user spec.
 */

'use client';

import { motion } from 'framer-motion';
import { Zap, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { MomentumTransferAnalysis, LeakSeverity } from '@/lib/scoring/analysis-output-types';

interface MomentumTransferCardProps {
  analysis: MomentumTransferAnalysis;
  showCoaching?: boolean;
  showTimingDetails?: boolean;
}

export function MomentumTransferCard({
  analysis,
  showCoaching = true,
  showTimingDetails = false,
}: MomentumTransferCardProps) {
  const [timingExpanded, setTimingExpanded] = useState(false);
  
  const { scores, timing, flags, coachSummary } = analysis;
  const { momentumTransfer, groundFlow, powerFlow, barrelFlow, anchor, engine, whip } = scores;
  
  // Use new Flow Path names, with fallback to legacy names
  const ground = groundFlow || anchor;
  const power = powerFlow || engine;
  const barrel = barrelFlow || whip;
  
  // Get color based on GOATY band (-3 to +3)
  const getBandColor = (band: number): string => {
    if (band >= 3) return 'from-green-500 to-emerald-600';           // Elite: Green
    if (band >= 2) return 'from-barrels-gold to-barrels-gold-light'; // Advanced: Gold
    if (band >= 1) return 'from-blue-500 to-blue-600';               // Above Average: Blue
    if (band >= 0) return 'from-gray-400 to-gray-500';               // Average: Gray
    if (band >= -1) return 'from-orange-500 to-orange-600';          // Below Average: Orange
    return 'from-red-500 to-red-600';                                // Poor/Needs Work: Red
  };
  
  // Get bar color based on sub-score and leak severity
  const getBarColor = (subscore: 'groundFlow' | 'powerFlow' | 'barrelFlow', leakSeverity: LeakSeverity): string => {
    // If it's the main leak, use warning colors
    if (flags.mainLeak === subscore || flags.mainLeakLegacy === convertToLegacy(subscore)) {
      if (leakSeverity === 'severe') return 'from-red-500 to-red-600';
      if (leakSeverity === 'moderate') return 'from-orange-500 to-orange-600';
      if (leakSeverity === 'mild') return 'from-yellow-500 to-yellow-600';
    }
    
    // Default colors by component
    if (subscore === 'groundFlow') return 'from-barrels-gold to-barrels-gold-light';
    if (subscore === 'powerFlow') return 'from-barrels-blue to-blue-500';
    return 'from-green-500 to-green-600';
  };
  
  // Helper to convert new field names to legacy for backward compatibility
  const convertToLegacy = (field: string): string => {
    if (field === 'groundFlow') return 'anchor';
    if (field === 'powerFlow') return 'engine';
    if (field === 'barrelFlow') return 'whip';
    return field;
  };
  
  // Get leak indicator (flame emoji)
  const getLeakIndicator = (severity: LeakSeverity): JSX.Element | null => {
    if (severity === 'none') return null;
    
    const flameCount = severity === 'severe' ? 3 : severity === 'moderate' ? 2 : 1;
    const color = severity === 'severe' ? 'text-red-500' : severity === 'moderate' ? 'text-orange-500' : 'text-yellow-500';
    
    return (
      <span className={`flex gap-0.5 ${color}`}>
        {Array.from({ length: flameCount }).map((_, i) => (
          <Flame key={i} className="h-3 w-3 fill-current" />
        ))}
      </span>
    );
  };
  
  const bandColor = getBandColor(momentumTransfer.goatyBand);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-barrels-black to-barrels-black-light border border-barrels-gold/20 rounded-xl p-6 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-barrels-gold" />
          <h3 className="text-lg font-bold text-white uppercase tracking-wide">Momentum Transfer</h3>
        </div>
        <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${bandColor} text-white text-sm font-bold shadow-lg`}>
          {momentumTransfer.goatyLabel}
        </div>
      </div>
      
      {/* Main Score Display */}
      <div className="mb-6">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-7xl font-black text-white mb-2"
        >
          {momentumTransfer.score}
        </motion.div>
        <p className="text-sm text-gray-400">
          How cleanly your swing passes energy Ground → Hips → Torso → Barrel
        </p>
      </div>
      
      {/* Sub-Scores with Mini-Bars */}
      <div className="space-y-4 mb-6">
        {/* Ground Flow */}
        <div className={`p-3 rounded-lg ${(flags.mainLeak === 'groundFlow' || flags.mainLeakLegacy === 'anchor') ? 'bg-red-950/20 border border-red-500/30' : 'bg-barrels-black-light/30'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-300">Ground Flow</span>
              <span className="text-xs text-gray-500">(Ground → Hips)</span>
              {getLeakIndicator(ground?.leakSeverity || 'none')}
            </div>
            <span className="text-lg font-bold text-white">{ground?.score || 0}</span>
          </div>
          <div className="w-full bg-barrels-black-light rounded-full h-2.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${ground?.score || 0}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className={`bg-gradient-to-r ${getBarColor('groundFlow', ground?.leakSeverity || 'none')} h-2.5 rounded-full`}
            />
          </div>
        </div>
        
        {/* Engine Flow */}
        <div className={`p-3 rounded-lg ${(flags.mainLeak === 'powerFlow' || flags.mainLeakLegacy === 'engine') ? 'bg-red-950/20 border border-red-500/30' : 'bg-barrels-black-light/30'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-300">Engine Flow</span>
              <span className="text-xs text-gray-500">(Hips → Torso)</span>
              {getLeakIndicator(power?.leakSeverity || 'none')}
            </div>
            <span className="text-lg font-bold text-white">{power?.score || 0}</span>
          </div>
          <div className="w-full bg-barrels-black-light rounded-full h-2.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${power?.score || 0}%` }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className={`bg-gradient-to-r ${getBarColor('powerFlow', power?.leakSeverity || 'none')} h-2.5 rounded-full`}
            />
          </div>
        </div>
        
        {/* Barrel Flow */}
        <div className={`p-3 rounded-lg ${(flags.mainLeak === 'barrelFlow' || flags.mainLeakLegacy === 'whip') ? 'bg-red-950/20 border border-red-500/30' : 'bg-barrels-black-light/30'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-300">Barrel Flow</span>
              <span className="text-xs text-gray-500">(Torso → Barrel)</span>
              {getLeakIndicator(barrel?.leakSeverity || 'none')}
            </div>
            <span className="text-lg font-bold text-white">{barrel?.score || 0}</span>
          </div>
          <div className="w-full bg-barrels-black-light rounded-full h-2.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${barrel?.score || 0}%` }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className={`bg-gradient-to-r ${getBarColor('barrelFlow', barrel?.leakSeverity || 'none')} h-2.5 rounded-full`}
            />
          </div>
        </div>
      </div>
      
      {/* Coaching Summary */}
      {showCoaching && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-barrels-black-light/50 rounded-lg p-4 border border-barrels-gold/10 space-y-2"
        >
          <p className="text-sm text-gray-300">{coachSummary.overall}</p>
          <p className="text-sm text-gray-300">{coachSummary.leak}</p>
          <p className="text-sm text-barrels-gold font-semibold">{coachSummary.nextStep}</p>
        </motion.div>
      )}
      
      {/* Timing Details (Expandable) */}
      {showTimingDetails && (
        <div className="mt-4">
          <button
            onClick={() => setTimingExpanded(!timingExpanded)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-barrels-gold transition-colors"
          >
            {timingExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span>Timing Details</span>
          </button>
          
          {timingExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mt-3 grid grid-cols-2 gap-3 text-sm"
            >
              <div className="bg-barrels-black-light/30 p-3 rounded">
                <span className="text-gray-500">A:B Ratio</span>
                <p className="text-white font-semibold">{timing.abRatio.toFixed(2)}</p>
              </div>
              <div className="bg-barrels-black-light/30 p-3 rounded">
                <span className="text-gray-500">Load Duration</span>
                <p className="text-white font-semibold">{timing.loadDurationMs}ms</p>
              </div>
              <div className="bg-barrels-black-light/30 p-3 rounded">
                <span className="text-gray-500">Swing Duration</span>
                <p className="text-white font-semibold">{timing.swingDurationMs}ms</p>
              </div>
              <div className="bg-barrels-black-light/30 p-3 rounded">
                <span className="text-gray-500">Sequence Order</span>
                <p className="text-white font-semibold text-xs">{timing.sequenceOrder.join(' → ')}</p>
              </div>
              <div className="bg-barrels-black-light/30 p-3 rounded col-span-2">
                <span className="text-gray-500">Segment Gaps (ms)</span>
                <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                  <div>
                    <p className="text-gray-400">Pelvis→Torso</p>
                    <p className="text-white font-semibold">{timing.segmentGapsMs.pelvisToTorso}ms</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Torso→Hands</p>
                    <p className="text-white font-semibold">{timing.segmentGapsMs.torsoToHands}ms</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Hands→Bat</p>
                    <p className="text-white font-semibold">{timing.segmentGapsMs.handsToBat}ms</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}
