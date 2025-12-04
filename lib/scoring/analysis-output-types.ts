/**
 * TypeScript interfaces for the standardized Momentum Transfer JSON output
 * 
 * BARRELS Flow Path Model™:
 * - Ground Flow (Ground → Hips)
 * - Power Flow (Hips → Torso)
 * - Barrel Flow (Torso → Barrel)
 * 
 * This is the data contract between:
 * - Scoring engine (newScoringEngine.ts)
 * - UI components (MomentumTransferCard)
 * - Coach Rick AI (coach-rick API)
 */

export interface AthleteInfo {
  name: string;
  level: 'MLB' | 'College' | 'HS' | 'Youth';
  age: number;
  bats: 'R' | 'L' | 'S';
  throws: 'R' | 'L' | 'S';
}

export type LeakSeverity = 'none' | 'mild' | 'moderate' | 'severe';

export interface MomentumTransferScore {
  score: number;              // 0-100
  goatyBand: number;          // -3 to +3
  goatyLabel: 'Elite' | 'Advanced' | 'Above Average' | 'Average' | 'Below Average' | 'Poor' | 'Needs Work';
  confidence: number;         // 0.0 to 1.0
}

export interface SubScore {
  score: number;              // 0-100
  label: string;              // e.g., "Ground Flow" or "Power Flow"
  leakSeverity: LeakSeverity;
}

export interface TimingData {
  abRatio: number;                     // Load:Swing ratio (ideal ~1.35)
  loadDurationMs: number;              // Load phase duration
  swingDurationMs: number;             // Swing phase duration
  sequenceOrder: string[];             // e.g., ["pelvis", "torso", "hands", "bat"]
  segmentGapsMs: {
    pelvisToTorso: number;             // Gap in ms
    torsoToHands: number;              // Gap in ms
    handsToBat: number;                // Gap in ms
  };
}

export interface FlagsData {
  mainLeak: 'groundFlow' | 'powerFlow' | 'barrelFlow' | 'none';
  secondaryLeak: 'groundFlow' | 'powerFlow' | 'barrelFlow' | null;
  sequenceBroken: boolean;
  // Legacy field names for backward compatibility
  mainLeakLegacy?: 'anchor' | 'engine' | 'whip' | 'none';
  secondaryLeakLegacy?: 'anchor' | 'engine' | 'whip' | null;
}

export interface CoachSummary {
  overall: string;          // 1-2 sentences about MTS
  leak: string;             // 1-2 sentences about leak location
  nextStep: string;         // 1 sentence with actionable focus
}

export interface MomentumTransferAnalysis {
  videoId: string;
  athlete: AthleteInfo;
  scores: {
    momentumTransfer: MomentumTransferScore;
    groundFlow: SubScore;      // NEW: Ground → Hips
    powerFlow: SubScore;       // NEW: Hips → Torso
    barrelFlow: SubScore;      // NEW: Torso → Barrel
    // Legacy field names for backward compatibility
    anchor?: SubScore;
    engine?: SubScore;
    whip?: SubScore;
  };
  timing: TimingData;
  flags: FlagsData;
  coachSummary: CoachSummary;
}

/**
 * Map GOATY band (-3 to +3) to label
 */
export function getGoatyBandLabel(band: number): MomentumTransferScore['goatyLabel'] {
  if (band >= 3) return 'Elite';
  if (band >= 2) return 'Advanced';
  if (band >= 1) return 'Above Average';
  if (band >= 0) return 'Average';
  if (band >= -1) return 'Below Average';
  if (band >= -2) return 'Poor';
  return 'Needs Work';
}

/**
 * Map score (0-100) to GOATY band (-3 to +3)
 */
export function scoreToGoatyBand(score: number): number {
  if (score >= 92) return 3;   // Elite
  if (score >= 85) return 2;   // Advanced
  if (score >= 75) return 1;   // Above Average
  if (score >= 60) return 0;   // Average
  if (score >= 50) return -1;  // Below Average
  if (score >= 40) return -2;  // Poor
  return -3;                   // Needs Work
}
