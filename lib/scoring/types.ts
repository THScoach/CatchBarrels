/**
 * Type definitions for the new scoring engine
 */

// ========================================
// INPUT TYPES
// ========================================

export interface ScoringInputs {
  // Joint data from video analysis
  jointData: JointFrame[];
  
  // Optional metadata
  playerHeight?: number;              // inches
  fps?: number;                       // frames per second (default 60)
  playerLevel?: string;               // "youth" | "hs" | "college" | "pro" (for display only)
  
  // Optional user-marked frames (overrides auto-detection)
  manualImpactFrame?: number;
  manualLoadFrame?: number;
  manualLaunchFrame?: number;
}

export interface JointFrame {
  frameIndex?: number;                // Optional frame index
  timestamp?: number;                 // milliseconds
  frame?: number;                     // Alternative name for frameIndex
  keypoints?: Joint[];                // Alternative name for joints
  joints?: Joint[];                   // Array of joint positions
}

export interface Joint {
  name: string;                       // e.g., "left_hip", "right_wrist"
  x: number;                          // normalized 0-1
  y: number;                          // normalized 0-1
  z?: number;                         // depth (often unreliable)
  confidence?: number;                // 0-1
  visibility?: number;                // Alternative name for confidence
}

// ========================================
// PHASE DETECTION
// ========================================

export interface SwingPhases {
  loadFrame: number;                  // Phase A endpoint
  launchFrame: number;                // Phase B start
  impactFrame: number;                // Phase C endpoint
  
  // Durations (ms)
  loadDuration: number;               // A→B time
  swingDuration: number;              // B→C time
  totalDuration: number;              // A→C time
  abRatio: number;                    // A:B duration ratio
}

// ========================================
// FEATURE EXTRACTION
// ========================================

export interface ExtractedFeatures {
  // TEMPO features
  tempo: {
    loadDuration: number;             // ms
    swingDuration: number;            // ms
    abRatio: number;                  // ratio
  };
  
  // SEQUENCE features
  sequence: {
    sequenceOrder: string[];          // ["pelvis", "torso", "hands", "bat"]
    pelvisTorsoGap: number;           // ms
    torsoHandsGap: number;            // ms
    handsBatGap: number;              // ms
    pelvisPeakTiming: number;         // ms before impact
    torsoPeakTiming: number;
    handsPeakTiming: number;
    batPeakTiming: number;
  };
  
  // COM / BALANCE features
  comBalance: {
    pelvisJerk: number;               // pixels/s³ (lower is better)
    headDisplacement: number;         // cm
    weightTransfer: number;           // % (0-100)
  };
  
  // HAND PATH features
  handPath: {
    pathEfficiency: number;           // arc length / straight line
    barrelAngleDeviation: number;     // degrees from level
    rearElbowProximity: number;       // cm from torso
  };
  
  // POSTURE features
  posture: {
    spineAngleChange: number;         // degrees (B→C)
    shoulderTiltAtImpact: number;     // degrees from horizontal
  };
}

// ========================================
// FEATURE SCORING
// ========================================

export interface FeatureScore {
  name: string;                       // e.g., "loadDuration"
  category: string;                   // e.g., "tempo"
  rawValue: number | null;            // Raw measured value
  score: number;                      // 0-100 subscore
  weight: number;                     // Weight within category (0-1)
  ideal?: string;                     // Human-readable ideal range
  interpretation?: string;            // "Excellent", "Good", "Needs Work"
}

// ========================================
// MOMENTUM TRANSFER SCORING
// ========================================

export interface MomentumTransferComponents {
  sequenceOrderScore: number;         // 0-100 (correct pelvis→torso→hands→bat order)
  pelvisTorsoGapScore: number;        // 0-100 (timing gap quality)
  torsoHandsGapScore: number;         // 0-100 (timing gap quality)
  handsBatGapScore: number;           // 0-100 (timing gap quality)
  decelQualityScore: number;          // 0-100 (upstream decel while downstream peaks)
  smoothnessScore: number;            // 0-100 (low jerk = smooth momentum flow)
  abcTempoScore: number;              // 0-100 (A→B→C timing quality)
  
  // Raw timing values (in milliseconds) for UI/Coach Rick
  abRatio?: number;                   // Acceleration-to-Brake ratio
  pelvisTorsoGapMs?: number;          // Raw timing gap in ms
  torsoHandsGapMs?: number;           // Raw timing gap in ms
  handsBarrelGapMs?: number;          // Raw timing gap in ms
}

export interface MomentumTransferScore {
  overall: number;                    // 0-100 weighted composite
  components: MomentumTransferComponents;
}

// ========================================
// OUTPUT TYPES
// ========================================

export interface CategoryScores {
  tempo: number;                      // 0-100
  sequence: number;                   // 0-100
  comBalance: number;                 // 0-100
  handPath: number;                   // 0-100
  posture: number;                    // 0-100
}

export interface SubScores {
  anchor: number;                     // 0-100 (lower body momentum setup)
  engine: number;                     // 0-100 (core momentum amplification)
  whip: number;                       // 0-100 (arms/bat momentum release)
}

export interface LegacyScores {
  anchor: number;                     // 0-100 (maps to comBalance + posture)
  engine: number;                     // 0-100 (maps to sequence + tempo)
  whip: number;                       // 0-100 (maps to handPath)
}

export interface ScoringResult {
  // Final scores
  mechanicsScore: number;             // 0-100 composite
  goatyBand: number;                  // -3 to +3
  goatyBandLabel: string;             // "Elite", "Advanced", etc.
  
  // Momentum Transfer (primary driver - 60% weight)
  momentumTransferScore: MomentumTransferScore;
  
  // Sub-scores (Anchor/Engine/Whip - 40% weight total)
  subScores: SubScores;
  
  // Category breakdowns (legacy structure)
  categoryScores: CategoryScores;
  
  // Legacy scores (for UI continuity)
  legacyScores: LegacyScores;
  
  // Feature-level details (for debug/coaching)
  featureScores: FeatureScore[];
  
  // Debug breakdown
  debugBreakdown: DebugBreakdown;
  
  // Quality indicators
  confidence: number;                 // 0-1 (joint visibility)
  dataQuality: 'high' | 'medium' | 'low';
  
  // Applied adjustments
  adjustments: {
    momentumTransferCapsApplied: boolean;
    momentumCapLevel?: number;        // 70 or 60
    criticalFeaturePenaltyApplied: boolean;
    lowConfidencePenalty: number;     // Points deducted
    originalScore?: number;           // Before adjustments
  };
}

// ========================================
// DEBUG / BREAKDOWN
// ========================================

export interface DebugBreakdown {
  // Input summary
  input: {
    frameCount: number;
    fps: number;
    confidenceAvg: number;
  };
  
  // Detected phases
  phases: SwingPhases;
  
  // Raw feature values
  features: ExtractedFeatures;
  
  // Scored features with details
  featureScores: FeatureScoreDetail[];
  
  // Category aggregation
  categoryBreakdown: CategoryBreakdown[];
  
  // Momentum Transfer breakdown
  momentumTransfer: {
    overall: number;
    components: MomentumTransferComponents;
    componentWeights: Record<string, number>;
  };
  
  // Sub-score breakdown (Anchor/Engine/Whip)
  subScores: {
    anchor: number;
    engine: number;
    whip: number;
  };
  
  // Final composite calculation
  composite: {
    momentumTransferScore: number;
    momentumTransferWeight: number;
    anchorScore: number;
    anchorWeight: number;
    engineScore: number;
    engineWeight: number;
    whipScore: number;
    whipWeight: number;
    weightedSum: number;
    beforePenalties: number;
    afterPenalties: number;
    finalScore: number;
  };
  
  // Penalties applied
  penalties: {
    momentumTransferCap?: {
      applied: boolean;
      mtScore: number;
      capLevel: number;
      reason: string;
    };
    criticalFeature?: {
      applied: boolean;
      reason: string;
      impact: string;
    };
    lowConfidence?: {
      applied: boolean;
      confidenceLevel: number;
      pointsDeducted: number;
    };
  };
}

export interface FeatureScoreDetail extends FeatureScore {
  threshold?: {
    type: 'tolerance_band' | 'less_is_better' | 'more_is_better' | 'sequence_order';
    ideal?: [number, number] | number;
    acceptable?: [number, number] | number;
  };
  calculation?: string;               // Formula used to score
}

export interface CategoryBreakdown {
  category: string;
  features: FeatureScoreDetail[];
  weightedScores: number[];           // Feature score * feature weight
  categoryScore: number;              // Aggregated category score (0-100)
  weight: number;                     // Category weight in composite (0-1)
  contributionToComposite: number;    // Category score * category weight
}
