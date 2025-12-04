/**
 * POD Metrics Calculation (WO15)
 * 
 * Analyzes Diamond Kinetics swing data and computes summary metrics
 * for POD sessions, including a composite BARRELS score and sequence grade.
 */

import { DkSwing } from './dk-api';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Summary of POD session metrics computed from DK swings
 */
export interface PodMetricsSummary {
  swingsCaptured: number;
  avgBarrelSpeed: number | null;
  avgImpactMomentum: number | null;
  avgAttackAngle: number | null;
  avgHandSpeed: number | null;
  avgTimeToContact: number | null;
  barrelsScore: number | null;
  sequenceGrade: 'green' | 'yellow' | 'red' | null;
}

// ============================================================================
// NORMALIZATION CONSTANTS
// ============================================================================

// Baseline values for normalization (adjust based on athlete level)
const BARREL_SPEED_MIN = 40;  // mph
const BARREL_SPEED_MAX = 90;  // mph

const IMPACT_MOMENTUM_MIN = 0;   // arbitrary DK units
const IMPACT_MOMENTUM_MAX = 100; // arbitrary DK units

// Ideal attack angle range (15-20 degrees is optimal)
const ATTACK_ANGLE_IDEAL_MIN = 15;
const ATTACK_ANGLE_IDEAL_MAX = 20;

// ============================================================================
// METRIC CALCULATION
// ============================================================================

/**
 * Computes POD metrics summary from an array of DK swings
 * 
 * TODO: Refine normalization formulas once real DK data is available
 */
export function computePodMetrics(swings: DkSwing[]): PodMetricsSummary {
  console.log('[POD Metrics] Computing metrics', { swingCount: swings.length });
  
  if (swings.length === 0) {
    return {
      swingsCaptured: 0,
      avgBarrelSpeed: null,
      avgImpactMomentum: null,
      avgAttackAngle: null,
      avgHandSpeed: null,
      avgTimeToContact: null,
      barrelsScore: null,
      sequenceGrade: null,
    };
  }
  
  // Calculate averages for each metric
  const avgBarrelSpeed = calculateAverage(swings, 'barrelSpeed');
  const avgImpactMomentum = calculateAverage(swings, 'impactMomentum');
  const avgAttackAngle = calculateAverage(swings, 'attackAngle');
  const avgHandSpeed = calculateAverage(swings, 'handSpeed');
  const avgTimeToContact = calculateAverage(swings, 'timeToContact');
  
  // Compute composite BARRELS score
  const barrelsScore = computeBarrelsScore(
    avgBarrelSpeed,
    avgImpactMomentum,
    avgAttackAngle
  );
  
  // Compute sequence grade based on BARRELS score
  const sequenceGrade = computeSequenceGrade(barrelsScore);
  
  console.log('[POD Metrics] Computed summary', {
    avgBarrelSpeed,
    avgImpactMomentum,
    avgAttackAngle,
    barrelsScore,
    sequenceGrade,
  });
  
  return {
    swingsCaptured: swings.length,
    avgBarrelSpeed,
    avgImpactMomentum,
    avgAttackAngle,
    avgHandSpeed,
    avgTimeToContact,
    barrelsScore,
    sequenceGrade,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculates the average value for a specific metric across all swings
 */
function calculateAverage(
  swings: DkSwing[],
  metricKey: keyof DkSwing['metrics']
): number | null {
  const values = swings
    .map(swing => swing.metrics[metricKey])
    .filter((val): val is number => val !== undefined && val !== null);
  
  if (values.length === 0) {
    return null;
  }
  
  const sum = values.reduce((acc, val) => acc + val, 0);
  return parseFloat((sum / values.length).toFixed(2));
}

/**
 * Computes a composite BARRELS score (0-100) from key metrics
 * 
 * Formula: weighted average of normalized metrics
 * - Barrel Speed: 50%
 * - Impact Momentum: 30%
 * - Attack Angle Component: 20%
 * 
 * TODO: Refine weights and normalization once real DK data is available
 */
function computeBarrelsScore(
  avgBarrelSpeed: number | null,
  avgImpactMomentum: number | null,
  avgAttackAngle: number | null
): number | null {
  // Need at least barrel speed to compute score
  if (avgBarrelSpeed === null) {
    return null;
  }
  
  // Normalize barrel speed (0-100 scale)
  const normalizedBarrelSpeed = normalizeValue(
    avgBarrelSpeed,
    BARREL_SPEED_MIN,
    BARREL_SPEED_MAX
  );
  
  // Normalize impact momentum (0-100 scale)
  const normalizedImpactMomentum = avgImpactMomentum !== null
    ? normalizeValue(avgImpactMomentum, IMPACT_MOMENTUM_MIN, IMPACT_MOMENTUM_MAX)
    : 50; // Default to 50 if not available
  
  // Normalize attack angle (100 if in ideal range, decreases as it deviates)
  const normalizedAttackAngle = avgAttackAngle !== null
    ? normalizeAttackAngle(avgAttackAngle)
    : 50; // Default to 50 if not available
  
  // Weighted composite score
  const barrelsScore =
    normalizedBarrelSpeed * 0.5 +
    normalizedImpactMomentum * 0.3 +
    normalizedAttackAngle * 0.2;
  
  return parseFloat(barrelsScore.toFixed(1));
}

/**
 * Normalizes a value to a 0-100 scale
 */
function normalizeValue(value: number, min: number, max: number): number {
  const normalized = ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, normalized)); // Clamp to 0-100
}

/**
 * Normalizes attack angle based on ideal range
 * - 100 if in ideal range (15-20 degrees)
 * - Decreases as it deviates from ideal range
 */
function normalizeAttackAngle(attackAngle: number): number {
  if (attackAngle >= ATTACK_ANGLE_IDEAL_MIN && attackAngle <= ATTACK_ANGLE_IDEAL_MAX) {
    return 100; // Perfect angle
  }
  
  // Calculate deviation from ideal range
  let deviation: number;
  if (attackAngle < ATTACK_ANGLE_IDEAL_MIN) {
    deviation = ATTACK_ANGLE_IDEAL_MIN - attackAngle;
  } else {
    deviation = attackAngle - ATTACK_ANGLE_IDEAL_MAX;
  }
  
  // Decrease score based on deviation (10 points per 5 degrees deviation)
  const score = 100 - (deviation / 5) * 10;
  return Math.max(0, Math.min(100, score)); // Clamp to 0-100
}

/**
 * Computes sequence grade based on BARRELS score
 * - green: score >= 80
 * - yellow: 60 <= score < 80
 * - red: score < 60
 */
function computeSequenceGrade(barrelsScore: number | null): 'green' | 'yellow' | 'red' | null {
  if (barrelsScore === null) {
    return null;
  }
  
  if (barrelsScore >= 80) {
    return 'green';
  } else if (barrelsScore >= 60) {
    return 'yellow';
  } else {
    return 'red';
  }
}
