/**
 * Analysis Output Format
 * 
 * Standardized structure for swing analysis results that can be consumed by
 * UI components and Coach Rick AI.
 */

import { generateMomentumCoaching } from '@/lib/momentum-coaching';

export type PlayerLevel = 'MLB' | 'College' | 'HS' | 'Youth';
export type HandednessValue = 'R' | 'L' | 'S';
export type GoatyLabel = 'Elite' | 'Advanced' | 'Above Average' | 'Average' | 'Below Average' | 'Needs Work';
export type LeakSeverity = 'none' | 'mild' | 'moderate' | 'severe';
export type LeakZone = 'anchor' | 'engine' | 'whip' | 'none';
export type FlowPathZone = 'groundFlow' | 'powerFlow' | 'barrelFlow' | 'none';

/**
 * Convert legacy leak zone names to BARRELS Flow Path Model™ terminology
 */
export function convertToFlowPath(zone: LeakZone): FlowPathZone {
  if (zone === 'anchor') return 'groundFlow';
  if (zone === 'engine') return 'powerFlow';
  if (zone === 'whip') return 'barrelFlow';
  return 'none';
}

export interface AthleteInfo {
  name: string;
  level: PlayerLevel;
  age: number;
  bats: HandednessValue;
  throws: HandednessValue;
}

export interface MomentumTransferScore {
  score: number;                // 0-100
  goatyBand: number;            // -3 to +3
  goatyLabel: GoatyLabel;
  confidence: number;           // 0.0-1.0
}

export interface SubScore {
  score: number;                // 0-100
  label: string;                // e.g., "Ground → Hips"
  leakSeverity: LeakSeverity;
}

export interface Scores {
  momentumTransfer: MomentumTransferScore;
  // NEW: BARRELS Flow Path Model™
  groundFlow: SubScore;
  powerFlow: SubScore;
  barrelFlow: SubScore;
  // LEGACY: For backward compatibility
  anchor?: SubScore;
  engine?: SubScore;
  whip?: SubScore;
}

export interface TimingData {
  abRatio: number;              // Acceleration-to-Brake ratio
  loadDurationMs: number;       // Load phase duration
  swingDurationMs: number;      // Total swing duration
  sequenceOrder: string[];      // e.g., ["pelvis", "torso", "hands", "bat"]
  segmentGapsMs: {
    pelvisToTorso: number;
    torsoToHands: number;
    handsToBat: number;
  };
}

export interface Flags {
  mainLeak: FlowPathZone;
  secondaryLeak: FlowPathZone | null;
  sequenceBroken: boolean;
  // LEGACY: For backward compatibility
  mainLeakLegacy?: LeakZone;
  secondaryLeakLegacy?: LeakZone | null;
}

export interface CoachSummary {
  overall: string;              // High-level meaning of momentum transfer score
  leak: string;                 // Where the main leak is
  nextStep: string;             // One simple next focus (no drill names)
}

export interface AnalysisOutput {
  videoId: string;
  athlete: AthleteInfo;
  scores: Scores;
  timing: TimingData;
  flags: Flags;
  coachSummary: CoachSummary;
}

/**
 * Calculate leak severity based on score gap
 */
export function calculateLeakSeverity(subScore: number, momentumTransferScore: number): LeakSeverity {
  const gap = momentumTransferScore - subScore;
  
  if (gap < 5) return 'none';
  if (gap < 10) return 'mild';
  if (gap < 15) return 'moderate';
  return 'severe';
}

/**
 * Map GOATY band number to label
 */
export function getGoatyLabel(band: number): GoatyLabel {
  if (band >= 2) return 'Elite';
  if (band >= 1) return 'Advanced';
  if (band >= 0) return 'Above Average';
  if (band >= -1) return 'Average';
  if (band >= -2) return 'Below Average';
  return 'Needs Work';
}

/**
 * Identify main and secondary leaks
 */
export function identifyLeaks(
  anchorScore: number,
  engineScore: number,
  whipScore: number,
  momentumTransferScore: number
): { mainLeak: LeakZone; secondaryLeak: LeakZone | null } {
  const leaks: Array<{ zone: LeakZone; gap: number }> = [
    { zone: 'anchor', gap: momentumTransferScore - anchorScore },
    { zone: 'engine', gap: momentumTransferScore - engineScore },
    { zone: 'whip', gap: momentumTransferScore - whipScore },
  ];
  
  // Sort by largest gap
  leaks.sort((a, b) => b.gap - a.gap);
  
  const mainLeak = leaks[0].gap >= 10 ? leaks[0].zone : 'none';
  const secondaryLeak = leaks[1].gap >= 10 ? leaks[1].zone : null;
  
  return { mainLeak, secondaryLeak };
}

/**
 * Format analysis output from scoring engine results
 */
export function formatAnalysisOutput(
  videoId: string,
  athleteInfo: AthleteInfo,
  scoringResult: any,  // From newScoringEngine.scoreSwing()
  timingData: TimingData,
  sequenceBroken: boolean = false
): AnalysisOutput {
  const { mechanicsScore, goatyBand, subScores } = scoringResult;
  
  const goatyLabel = getGoatyLabel(goatyBand);
  
  // Calculate leak severities
  const anchorLeakSeverity = calculateLeakSeverity(subScores.anchor, mechanicsScore);
  const engineLeakSeverity = calculateLeakSeverity(subScores.engine, mechanicsScore);
  const whipLeakSeverity = calculateLeakSeverity(subScores.whip, mechanicsScore);
  
  // Identify main/secondary leaks
  const { mainLeak, secondaryLeak } = identifyLeaks(
    subScores.anchor,
    subScores.engine,
    subScores.whip,
    mechanicsScore
  );
  
  // Generate coach summary
  const coaching = generateMomentumCoaching({
    momentumTransferScore: mechanicsScore,
    groundFlowScore: subScores.anchor,  // New field name
    powerFlowScore: subScores.engine,    // New field name
    barrelFlowScore: subScores.whip,     // New field name
    anchorScore: subScores.anchor,       // Legacy field name
    engineScore: subScores.engine,       // Legacy field name
    whipScore: subScores.whip,           // Legacy field name
    goatyBandLabel: goatyLabel,
  });
  
  return {
    videoId,
    athlete: athleteInfo,
    scores: {
      momentumTransfer: {
        score: mechanicsScore,
        goatyBand,
        goatyLabel,
        confidence: scoringResult.confidence || 0.85,  // Default if not provided
      },
      // NEW: BARRELS Flow Path Model™
      groundFlow: {
        score: subScores.anchor,
        label: 'Ground Flow',
        leakSeverity: anchorLeakSeverity,
      },
      powerFlow: {
        score: subScores.engine,
        label: 'Power Flow',
        leakSeverity: engineLeakSeverity,
      },
      barrelFlow: {
        score: subScores.whip,
        label: 'Barrel Flow',
        leakSeverity: whipLeakSeverity,
      },
      // LEGACY: For backward compatibility
      anchor: {
        score: subScores.anchor,
        label: 'Ground → Hips',
        leakSeverity: anchorLeakSeverity,
      },
      engine: {
        score: subScores.engine,
        label: 'Hips → Torso',
        leakSeverity: engineLeakSeverity,
      },
      whip: {
        score: subScores.whip,
        label: 'Torso → Barrel',
        leakSeverity: whipLeakSeverity,
      },
    },
    timing: timingData,
    flags: {
      mainLeak: convertToFlowPath(mainLeak),
      secondaryLeak: secondaryLeak ? convertToFlowPath(secondaryLeak) : null,
      sequenceBroken,
      mainLeakLegacy: mainLeak,
      secondaryLeakLegacy: secondaryLeak,
    },
    coachSummary: {
      overall: coaching.overallLine,
      leak: coaching.leakLine,
      nextStep: coaching.nextStep,
    },
  };
}
