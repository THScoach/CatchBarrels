/**
 * New Scoring Engine Configuration: Momentum-Transfer First Model
 * All weights, thresholds, and penalties are exposed here for easy tuning
 * Based on Kwon/THSS principles + single-camera pose data
 * 
 * Core Philosophy: Momentum Transfer (60%) drives the score,
 * with Anchor/Engine/Whip sub-scores (40%) as supporting factors.
 */

// ========================================
// FEATURE FLAG
// ========================================
export const NEW_SCORING_ENGINE_ENABLED = true; // Set to true to enable new scoring

// ========================================
// NEW COMPOSITE WEIGHTS (Momentum-Transfer First)
// ========================================
export const COMPOSITE_WEIGHTS = {
  momentumTransfer: 0.60,  // 60% - How well does Anchor→Engine→Whip transfer energy/speed over time?
  anchor: 0.15,            // 15% - Lower body momentum setup (pelvis, weight transfer, stability)
  engine: 0.15,            // 15% - Core/torso momentum amplification (sequence, rotation, posture)
  whip: 0.10,              // 10% - Arms/bat momentum release (hand path, lag, barrel delivery)
} as const;

// ========================================
// MOMENTUM TRANSFER COMPONENT WEIGHTS (must sum to 1.0)
// ========================================
export const MOMENTUM_TRANSFER_WEIGHTS = {
  sequenceOrderScore: 0.30,      // 30% - Correct pelvis→torso→hands→bat order (CRITICAL)
  pelvisTorsoGapScore: 0.15,     // 15% - Timing gap quality
  torsoHandsGapScore: 0.15,      // 15% - Timing gap quality
  handsBatGapScore: 0.10,        // 10% - Timing gap quality
  decelQualityScore: 0.15,       // 15% - Upstream decel while downstream peaks
  smoothnessScore: 0.10,         // 10% - Low jerk = smooth flow
  abcTempoScore: 0.05,           // 5% - A→B→C timing constraints
} as const;

// ========================================
// LEGACY CATEGORY WEIGHTS (for backward compatibility)
// ========================================
export const CATEGORY_WEIGHTS = {
  tempo: 0.25,        // 25% - Rhythm and timing (A→B→C durations)
  sequence: 0.35,     // 35% - Kinematic chain (MOST IMPORTANT per Kwon)
  comBalance: 0.15,   // 15% - Center-of-mass stability
  handPath: 0.15,     // 15% - Barrel delivery efficiency
  posture: 0.10,      // 10% - Dynamic posture maintenance
} as const;

// ========================================
// FEATURE WEIGHTS (within each category)
// ========================================
export const FEATURE_WEIGHTS = {
  tempo: {
    loadDuration: 0.35,      // A→B time
    swingDuration: 0.35,     // B→C time
    abRatio: 0.30,           // A:B duration ratio
  },
  
  sequence: {
    sequenceOrder: 0.40,     // Correct pelvis→torso→hands→bat order (CRITICAL)
    pelvisTorsoGap: 0.20,    // Timing gap pelvis→torso
    torsoHandsGap: 0.20,     // Timing gap torso→hands
    handsBatGap: 0.20,       // Timing gap hands→bat
  },
  
  comBalance: {
    pelvisTrajectory: 0.40,  // Smoothness of COM path (jerk metric)
    headStability: 0.30,     // Head displacement control
    weightTransfer: 0.30,    // Weight shift completion
  },
  
  handPath: {
    pathEfficiency: 0.40,    // Hand path arc vs straight line
    barrelDirection: 0.35,   // Barrel angle at impact
    connectionScore: 0.25,   // Rear elbow proximity to torso
  },
  
  posture: {
    spineAngleChange: 0.55,  // Stability of spine tilt B→C
    shoulderTiltImpact: 0.45, // Shoulder angle at impact
  },
} as const;

// ========================================
// THRESHOLDS (MLB-calibrated ideals)
// ========================================

/**
 * Threshold structure:
 * - ideal: [min, max] range for perfect score (100)
 * - soft: [min, max] range for good score (75-100, linear)
 * - Outside soft: steep penalty (0-50)
 */
export interface ThresholdRange {
  ideal: [number, number];
  soft: [number, number];
}

export interface DirectionalThreshold {
  optimal: number;      // Best value (score 100)
  acceptable: number;   // Good value (score 75)
  poor: number;         // Threshold for score 50
}

export const THRESHOLDS = {
  // ===== TEMPO =====
  loadDuration: {
    ideal: [180, 280],      // ms (MLB ideal)
    soft: [150, 320],       // ms (acceptable range)
  } as ThresholdRange,
  
  swingDuration: {
    ideal: [140, 180],      // ms
    soft: [120, 200],       // ms
  } as ThresholdRange,
  
  abRatio: {
    ideal: [1.2, 1.8],      // Load ~1.5x longer than swing
    soft: [1.0, 2.2],
  } as ThresholdRange,
  
  // ===== SEQUENCE =====
  pelvisTorsoGap: {
    ideal: [30, 50],        // ms
    soft: [20, 60],
  } as ThresholdRange,
  
  torsoHandsGap: {
    ideal: [35, 55],        // ms
    soft: [25, 65],
  } as ThresholdRange,
  
  handsBatGap: {
    ideal: [20, 40],        // ms
    soft: [15, 50],
  } as ThresholdRange,
  
  // ===== COM / BALANCE =====
  pelvisJerk: {
    optimal: 5000,          // Lower is better (pixels/s³)
    acceptable: 10000,
    poor: 20000,
  } as DirectionalThreshold,
  
  headDisplacement: {
    optimal: 5,             // cm (lower is better)
    acceptable: 10,
    poor: 15,
  } as DirectionalThreshold,
  
  weightTransfer: {
    optimal: 80,            // % (higher is better)
    acceptable: 60,
    poor: 40,
  } as DirectionalThreshold,
  
  // ===== HAND PATH =====
  handPathRatio: {
    ideal: [1.1, 1.3],      // Arc length / straight line
    soft: [1.0, 1.5],
  } as ThresholdRange,
  
  barrelAngleDeviation: {
    optimal: 5,             // degrees from level (lower is better)
    acceptable: 15,
    poor: 25,
  } as DirectionalThreshold,
  
  rearElbowProximity: {
    optimal: 15,            // cm from torso (lower is better)
    acceptable: 25,
    poor: 35,
  } as DirectionalThreshold,
  
  // ===== POSTURE =====
  spineAngleChange: {
    optimal: 10,            // degrees (lower is better)
    acceptable: 18,
    poor: 30,
  } as DirectionalThreshold,
  
  shoulderTiltAtImpact: {
    ideal: [8, 20],         // degrees from horizontal
    soft: [5, 25],
  } as ThresholdRange,
} as const;

// ========================================
// GOATY BAND MAPPING
// ========================================
export const GOATY_BAND_THRESHOLDS = [
  { min: 92, band: 3, label: 'Elite' },
  { min: 85, band: 2, label: 'Advanced' },
  { min: 75, band: 1, label: 'Above Average' },
  { min: 60, band: 0, label: 'Average' },
  { min: 50, band: -1, label: 'Below Average' },
  { min: 40, band: -2, label: 'Poor' },
  { min: 0, band: -3, label: 'Very Poor' },
] as const;

export function mapToGoatyBand(score: number): number {
  for (const threshold of GOATY_BAND_THRESHOLDS) {
    if (score >= threshold.min) {
      return threshold.band;
    }
  }
  return -3; // Fallback
}

export function getGoatyBandLabel(band: number): string {
  const entry = GOATY_BAND_THRESHOLDS.find(t => t.band === band);
  return entry?.label || 'Unknown';
}

// ========================================
// PENALTIES & MODIFIERS
// ========================================
export const PENALTIES = {
  // Momentum Transfer Caps: Prevent high scores with poor timing/sequencing
  momentumTransferCaps: {
    enabled: true,
    cap70Threshold: 50,          // If MTS < 50, cap final score at 70
    cap60Threshold: 40,          // If MTS < 40, cap final score at 60
    reason: 'Poor momentum transfer cannot be compensated by position alone',
  },
  
  // Critical feature penalty: cap score if sequence order is broken (legacy)
  criticalFeature: {
    enabled: false,               // Disabled - superseded by momentum transfer caps
    sequenceOrderThreshold: 40,  // If sequence order score < 40
    capScore: 70,                 // Cap final score at 70
    reason: 'Broken kinematic sequence is a critical flaw',
  },
  
  // Low confidence penalty: reduce score if joint visibility is poor
  lowConfidence: {
    enabled: true,
    thresholds: {
      high: 0.8,      // No penalty
      medium: 0.6,    // -5 points
      low: 0.4,       // -10 points
    },
  },
} as const;

// ========================================
// PHASE DETECTION PARAMETERS
// ========================================
export const PHASE_DETECTION = {
  // Load frame: find lowest pelvis Y position
  loadDetection: {
    minFrameFromStart: 5,        // Don't check first 5 frames
    maxFrameFromEnd: 10,         // Don't check last 10 frames
    yWeightFactor: 100,          // Weight for Y position
    xRearwardBonus: 10,          // Bonus for rearward position
  },
  
  // Launch frame: find pelvis rotation initiation
  launchDetection: {
    velocityThreshold: 200,      // deg/s (pelvis angular velocity)
    minFramesAfterLoad: 1,
    maxFramesAfterLoad: 30,
    fallbackOffset: 10,          // Frames after load if no threshold hit
  },
  
  // Impact frame: find max hand velocity
  impactDetection: {
    minFramesAfterLaunch: 5,
    preferManual: true,          // Prefer user-specified impact frame
  },
} as const;

// ========================================
// LEGACY MAPPING (for UI continuity)
// ========================================
/**
 * Maps new category scores to legacy Anchor/Engine/Whip scores
 * for backward compatibility with existing UI components
 */
export const LEGACY_MAPPING = {
  anchor: {
    comBalance: 0.6,
    posture: 0.4,
  },
  engine: {
    sequence: 0.7,
    tempo: 0.3,
  },
  whip: {
    handPath: 1.0,
  },
} as const;

// ========================================
// TYPE DEFINITIONS
// ========================================

export interface CategoryScores {
  tempo: number;
  sequence: number;
  comBalance: number;
  handPath: number;
  posture: number;
}

export interface LegacyScores {
  anchor: number;
  engine: number;
  whip: number;
}

export function mapToLegacyScores(categoryScores: CategoryScores): LegacyScores {
  return {
    anchor: Math.round(
      categoryScores.comBalance * LEGACY_MAPPING.anchor.comBalance +
      categoryScores.posture * LEGACY_MAPPING.anchor.posture
    ),
    engine: Math.round(
      categoryScores.sequence * LEGACY_MAPPING.engine.sequence +
      categoryScores.tempo * LEGACY_MAPPING.engine.tempo
    ),
    whip: Math.round(
      categoryScores.handPath * LEGACY_MAPPING.whip.handPath
    ),
  };
}

// ========================================
// UTILITY: Score Tolerance Band
// ========================================
export function scoreToleranceBand(
  value: number,
  threshold: ThresholdRange
): number {
  const [idealMin, idealMax] = threshold.ideal;
  const [softMin, softMax] = threshold.soft;
  
  // Inside ideal band → 100
  if (value >= idealMin && value <= idealMax) {
    return 100;
  }
  
  // Inside soft band (below ideal) → 75-100 linear
  if (value >= softMin && value < idealMin) {
    return 75 + ((value - softMin) / (idealMin - softMin)) * 25;
  }
  
  // Inside soft band (above ideal) → 75-100 linear
  if (value > idealMax && value <= softMax) {
    return 75 + ((softMax - value) / (softMax - idealMax)) * 25;
  }
  
  // Outside soft band → steep penalty
  if (value < softMin) {
    return Math.max(0, 50 - (softMin - value) * 2);
  }
  
  return Math.max(0, 50 - (value - softMax) * 2);
}

// ========================================
// UTILITY: Score Directional (Less is Better)
// ========================================
export function scoreLessIsBetter(
  value: number,
  threshold: DirectionalThreshold
): number {
  if (value <= threshold.optimal) return 100;
  
  if (value <= threshold.acceptable) {
    return 75 + ((threshold.acceptable - value) / (threshold.acceptable - threshold.optimal)) * 25;
  }
  
  if (value <= threshold.poor) {
    return 50 + ((threshold.poor - value) / (threshold.poor - threshold.acceptable)) * 25;
  }
  
  return Math.max(0, 50 - (value - threshold.poor));
}

// ========================================
// UTILITY: Score Directional (More is Better)
// ========================================
export function scoreMoreIsBetter(
  value: number,
  threshold: DirectionalThreshold
): number {
  if (value >= threshold.optimal) return 100;
  
  if (value >= threshold.acceptable) {
    return 75 + ((value - threshold.acceptable) / (threshold.optimal - threshold.acceptable)) * 25;
  }
  
  if (value >= threshold.poor) {
    return 50 + ((value - threshold.poor) / (threshold.acceptable - threshold.poor)) * 25;
  }
  
  return Math.max(0, 50 - (threshold.poor - value));
}

// ========================================
// UTILITY: Score Sequence Order
// ========================================
export function scoreSequenceOrder(order: string[]): number {
  const correctOrder = ['pelvis', 'torso', 'hands', 'bat'];
  
  // Perfect order → 100
  if (order.length === 4 && order.every((seg, i) => seg === correctOrder[i])) {
    return 100;
  }
  
  // Count correct positions
  let correctPositions = 0;
  for (let i = 0; i < Math.min(4, order.length); i++) {
    if (order[i] === correctOrder[i]) {
      correctPositions++;
    }
  }
  
  // Partial credit: 25 points per correct position
  return correctPositions * 25;
}
