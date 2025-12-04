// types/assessment.ts
// 52 Pitch Flow Assessment Types
// Version: 1.0
// Date: November 26, 2025

export type SessionType = 'training' | 'assessment';

export type AssessmentKind = '52_pitch_flow';

export interface PlayerInfo {
  playerId: string;
  firstName: string;
  lastName: string;
  age: number;
  level: 'Youth' | 'HS' | 'College' | 'Pro';
  handedness: 'R' | 'L' | 'S';
  bats: 'R' | 'L' | 'S';
  throws: 'R' | 'L';
}

export interface DeviceFlags {
  useKinetrax: boolean;      // motion
  useHitTrax: boolean;       // ball data
  useSensor: boolean;        // DK / Blast / Stack
  useNeuralTest: boolean;    // S2-style / custom
}

export interface MotionMetrics {
  // Movement / sequencing / stability (per swing)
  momentumTransferScore?: number;      // 0–100
  groundFlowScore?: number;            // 0–100
  powerFlowScore?: number;             // 0–100
  barrelFlowScore?: number;            // 0–100

  // Timing + sequencing
  loadDurationMs?: number;
  swingDurationMs?: number;
  abRatio?: number;                    // load : swing
  pelvisTorsoGapMs?: number;
  torsoHandsGapMs?: number;
  handsBatGapMs?: number;

  // Stability / COM
  headDisplacementCm?: number;
  pelvisJerk?: number;
  weightTransferPct?: number;

  // Posture / path
  spineAngleChangeDeg?: number;
  shoulderTiltImpactDeg?: number;
  handPathEfficiency?: number;
}

export interface BallMetrics {
  // From HitTrax / K-Vest / similar
  exitVelo?: number;           // mph
  launchAngle?: number;        // degrees
  distance?: number;           // feet
  result?: 'fair' | 'foul' | 'swing_miss' | 'take';
  hardHit?: boolean;
  sprayAngle?: number;         // pull vs oppo
}

export interface SensorMetrics {
  // Optional: DK / Blast / Stack
  batSpeed?: number;          // mph
  handSpeed?: number;         // mph
  attackAngle?: number;       // degrees
  verticalBatAngle?: number;  // degrees
  onPlaneEff?: number;        // 0–100
}

export interface NeuralMetrics {
  // Optional: lacrosse-stick catch, visual, S2-lite
  earlyDecisionScore?: number; // 0–100
  lateDecisionScore?: number;  // 0–100
  pickupSpeedScore?: number;   // 0–100
  impulseControlScore?: number;// 0–100
}

export interface SwingRecord {
  swingId: string;
  index: number;                 // 1..52
  timestamp: string;             // ISO
  pitchType?: string;
  pitchSpeed?: number;           // mph
  pitchLocationZone?: string;    // e.g. "up_in", "down_away"

  motion?: MotionMetrics;
  ball?: BallMetrics;
  sensor?: SensorMetrics;
  neural?: NeuralMetrics;

  // Optional references
  videoId?: string;
  videoUrl?: string;
}

export interface FlowScoresSummary {
  momentumTransferScore: number; // final 0–100
  groundFlowScore: number;
  powerFlowScore: number;
  barrelFlowScore: number;

  consistencyScore: number;      // across 52
  movementQualityScore: number;  // movement only
  neuralScore?: number;
  ballContactScore?: number;

  // GOATY-style banding but *reworded* for you
  band: -3 | -2 | -1 | 0 | 1 | 2 | 3;
  bandLabel: 'Very Poor' | 'Poor' | 'Below Average' | 'Average' | 'Above Average' | 'Advanced' | 'Elite';
}

export interface AssessmentFlags {
  isAssessment: boolean;
  assessmentKind: AssessmentKind;
  swingsPlanned: number;     // usually 52
  swingsCompleted: number;
  completed: boolean;
}

export interface AssessmentSession {
  sessionId: string;
  sessionType: SessionType;       // "assessment"
  assessment: AssessmentFlags;
  version: string;                // e.g. "52_pitch_flow_1.0"

  player: PlayerInfo;
  coach: {
    coachId: string;
    name: string;
  };

  devices: DeviceFlags;

  startedAt: string;              // ISO
  endedAt?: string;               // ISO

  swings: SwingRecord[];

  summary?: FlowScoresSummary;

  // For AI/report use
  notesFromCoach?: string;
  contextTags?: string[];         // ["first_assessment", "tired", "in_season"]
}

// Helper function to calculate band from score
export function getBandFromScore(score: number): FlowScoresSummary['band'] {
  if (score >= 90) return 3;   // Elite
  if (score >= 80) return 2;   // Advanced
  if (score >= 70) return 1;   // Above Average
  if (score >= 60) return 0;   // Average
  if (score >= 50) return -1;  // Below Average
  if (score >= 40) return -2;  // Poor
  return -3;                    // Very Poor
}

export function getBandLabel(band: FlowScoresSummary['band']): FlowScoresSummary['bandLabel'] {
  const labels: Record<FlowScoresSummary['band'], FlowScoresSummary['bandLabel']> = {
    3: 'Elite',
    2: 'Advanced',
    1: 'Above Average',
    0: 'Average',
    '-1': 'Below Average',
    '-2': 'Poor',
    '-3': 'Very Poor',
  };
  return labels[band];
}
