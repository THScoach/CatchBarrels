/**
 * New Scoring Engine: Momentum-Transfer First Model
 * 
 * This module implements a momentum-transfer based scoring system for baseball hitting mechanics.
 * Core philosophy:
 * - Momentum Transfer (60%): How well does Anchor→Engine→Whip transfer energy/speed over time?
 * - Sub-scores (40%): Anchor (15%), Engine (15%), Whip (10%) as local momentum factors
 * - Timing & Sequencing FIRST: Elite movers with good sequencing score 85-95+
 * - MLB-calibrated: Poor momentum transfer caps scores at 70 or 60, regardless of positions
 */

import {
  CATEGORY_WEIGHTS,
  FEATURE_WEIGHTS,
  COMPOSITE_WEIGHTS,
  MOMENTUM_TRANSFER_WEIGHTS,
  THRESHOLDS,
  PENALTIES,
  PHASE_DETECTION,
  scoreToleranceBand,
  scoreLessIsBetter,
  scoreMoreIsBetter,
  scoreSequenceOrder,
  mapToGoatyBand,
  getGoatyBandLabel,
  mapToLegacyScores,
  NEW_SCORING_ENGINE_ENABLED,
} from './config';

// Re-export flag for convenience
export { NEW_SCORING_ENGINE_ENABLED };

import type {
  ScoringInputs,
  ScoringResult,
  SwingPhases,
  ExtractedFeatures,
  FeatureScore,
  CategoryScores,
  SubScores,
  DebugBreakdown,
  JointFrame,
  Joint,
  FeatureScoreDetail,
  CategoryBreakdown,
  MomentumTransferComponents,
  MomentumTransferScore,
} from './types';

// ========================================
// MAIN SCORING FUNCTION
// ========================================

export async function scoreSwing(inputs: ScoringInputs): Promise<ScoringResult> {
  const startTime = Date.now();
  
  try {
    // 1. Normalize joint data format
    const normalizedData = normalizeJointData(inputs.jointData);
    const fps = inputs.fps || 60;
    
    // 2. Calculate confidence
    const confidence = calculateConfidence(normalizedData);
    const dataQuality = confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'low';
    
    // 3. Detect swing phases (A-B-C)
    const phases = detectPhases(normalizedData, fps, inputs);
    
    // 4. Extract all features
    const features = extractFeatures(normalizedData, phases, fps, inputs.playerHeight);
    
    // 5. Score each feature
    const featureScores = scoreFeatures(features);
    
    // 6. Aggregate into category scores (legacy structure)
    const categoryScores = aggregateCategoryScores(featureScores);
    
    // 7. Calculate Momentum Transfer Score (60% weight)
    const momentumTransferScore = calculateMomentumTransferScore(features, normalizedData, phases, fps);
    
    // 8. Calculate Sub-Scores: Anchor/Engine/Whip (40% weight total)
    const anchorScore = calculateAnchorScore(features, categoryScores);
    const engineScore = calculateEngineScore(features, categoryScores);
    const whipScore = calculateWhipScore(features, categoryScores);
    
    const subScores: SubScores = {
      anchor: anchorScore,
      engine: engineScore,
      whip: whipScore,
    };
    
    // 9. Calculate composite score (NEW MODEL)
    let mechanicsScore = calculateComposite(momentumTransferScore, anchorScore, engineScore, whipScore);
    const originalScore = mechanicsScore;
    
    // 10. Apply penalties
    const adjustments = {
      momentumTransferCapsApplied: false,
      momentumCapLevel: undefined as number | undefined,
      criticalFeaturePenaltyApplied: false,
      lowConfidencePenalty: 0,
      originalScore,
    };
    
    // 10a. Momentum Transfer Caps (NEW)
    if (PENALTIES.momentumTransferCaps.enabled) {
      const mtScore = momentumTransferScore.overall;
      
      if (mtScore < PENALTIES.momentumTransferCaps.cap60Threshold) {
        mechanicsScore = Math.min(mechanicsScore, 60);
        adjustments.momentumTransferCapsApplied = true;
        adjustments.momentumCapLevel = 60;
      } else if (mtScore < PENALTIES.momentumTransferCaps.cap70Threshold) {
        mechanicsScore = Math.min(mechanicsScore, 70);
        adjustments.momentumTransferCapsApplied = true;
        adjustments.momentumCapLevel = 70;
      }
    }
    
    // 10b. Legacy Critical feature penalty (if still enabled)
    const sequenceOrderScore = featureScores.find(f => f.name === 'sequenceOrder')?.score || 0;
    if (PENALTIES.criticalFeature.enabled && sequenceOrderScore < PENALTIES.criticalFeature.sequenceOrderThreshold) {
      mechanicsScore = Math.min(mechanicsScore, PENALTIES.criticalFeature.capScore);
      adjustments.criticalFeaturePenaltyApplied = true;
    }
    
    // 10c. Low confidence penalty
    if (PENALTIES.lowConfidence.enabled) {
      if (confidence < PENALTIES.lowConfidence.thresholds.medium) {
        const penalty = confidence < PENALTIES.lowConfidence.thresholds.low ? 10 : 5;
        mechanicsScore = Math.max(0, mechanicsScore - penalty);
        adjustments.lowConfidencePenalty = penalty;
      }
    }
    
    // 11. Map to GOATY band
    const goatyBand = mapToGoatyBand(mechanicsScore);
    const goatyBandLabel = getGoatyBandLabel(goatyBand);
    
    // 12. Map to legacy scores (for UI continuity)
    const legacyScores = mapToLegacyScores(categoryScores);
    
    // 13. Build debug breakdown
    const debugBreakdown = buildDebugBreakdown(
      normalizedData,
      fps,
      confidence,
      phases,
      features,
      featureScores,
      categoryScores,
      momentumTransferScore,
      subScores,
      mechanicsScore,
      adjustments
    );
    
    const duration = Date.now() - startTime;
    console.log(`[Momentum-Transfer Engine] Scored swing in ${duration}ms. MTS: ${momentumTransferScore.overall}, Final: ${mechanicsScore}, Band: ${goatyBand}`);
    
    return {
      mechanicsScore: Math.round(mechanicsScore),
      goatyBand,
      goatyBandLabel,
      momentumTransferScore,
      subScores,
      categoryScores,
      legacyScores,
      featureScores,
      debugBreakdown,
      confidence,
      dataQuality,
      adjustments,
    };
    
  } catch (error) {
    console.error('[Momentum-Transfer Engine] Error:', error);
    throw error;
  }
}

// ========================================
// JOINT DATA NORMALIZATION
// ========================================

function normalizeJointData(data: JointFrame[]): JointFrame[] {
  return data.map((frame, index) => {
    // Handle different field names (keypoints vs joints, frame vs frameIndex)
    const joints = frame.joints || frame.keypoints || [];
    const normalizedJoints = joints.map(joint => ({
      name: joint.name,
      x: joint.x,
      y: joint.y,
      z: joint.z || 0,
      confidence: joint.confidence || joint.visibility || 0.5,
    }));
    
    return {
      frameIndex: frame.frameIndex || frame.frame || index,
      timestamp: frame.timestamp || index * (1000 / 60), // Assume 60fps if no timestamp
      joints: normalizedJoints,
    };
  });
}

// ========================================
// CONFIDENCE CALCULATION
// ========================================

function calculateConfidence(data: JointFrame[]): number {
  let totalConfidence = 0;
  let count = 0;
  
  for (const frame of data) {
    for (const joint of frame.joints || []) {
      if (joint.confidence !== undefined) {
        totalConfidence += joint.confidence;
        count++;
      }
    }
  }
  
  return count > 0 ? totalConfidence / count : 0.5;
}

// ========================================
// PHASE DETECTION
// ========================================

function detectPhases(
  data: JointFrame[],
  fps: number,
  inputs: ScoringInputs
): SwingPhases {
  // Use manual frames if provided
  if (inputs.manualLoadFrame !== undefined && inputs.manualLaunchFrame !== undefined && inputs.manualImpactFrame !== undefined) {
    const loadFrame = inputs.manualLoadFrame;
    const launchFrame = inputs.manualLaunchFrame;
    const impactFrame = inputs.manualImpactFrame;
    
    return {
      loadFrame,
      launchFrame,
      impactFrame,
      loadDuration: ((launchFrame - loadFrame) / fps) * 1000,
      swingDuration: ((impactFrame - launchFrame) / fps) * 1000,
      totalDuration: ((impactFrame - loadFrame) / fps) * 1000,
      abRatio: (launchFrame - loadFrame) / (impactFrame - launchFrame),
    };
  }
  
  // Auto-detect phases
  const loadFrame = detectLoadFrame(data);
  const launchFrame = detectLaunchFrame(data, loadFrame, fps);
  const impactFrame = detectImpactFrame(data, launchFrame, fps, inputs.manualImpactFrame);
  
  const loadDuration = ((launchFrame - loadFrame) / fps) * 1000;
  const swingDuration = ((impactFrame - launchFrame) / fps) * 1000;
  const totalDuration = ((impactFrame - loadFrame) / fps) * 1000;
  const abRatio = loadDuration / swingDuration;
  
  return {
    loadFrame,
    launchFrame,
    impactFrame,
    loadDuration,
    swingDuration,
    totalDuration,
    abRatio,
  };
}

function detectLoadFrame(data: JointFrame[]): number {
  const config = PHASE_DETECTION.loadDetection;
  let minScore = Infinity;
  let loadFrame = 0;
  
  const start = Math.max(0, config.minFrameFromStart);
  const end = Math.max(0, data.length - config.maxFrameFromEnd);
  
  for (let i = start; i < end; i++) {
    const frame = data[i];
    const pelvisMid = getMidpoint(frame, 'left_hip', 'right_hip');
    
    if (!pelvisMid) continue;
    
    // Score = Y position (lower is better) - bonus for rearward X
    const score = pelvisMid.y * config.yWeightFactor - (pelvisMid.x - 0.5) * config.xRearwardBonus;
    
    if (score < minScore) {
      minScore = score;
      loadFrame = i;
    }
  }
  
  return loadFrame;
}

function detectLaunchFrame(data: JointFrame[], loadFrame: number, fps: number): number {
  const config = PHASE_DETECTION.launchDetection;
  const velocities = calculatePelvisAngularVelocity(data, fps);
  
  const start = loadFrame + config.minFramesAfterLoad;
  const end = Math.min(loadFrame + config.maxFramesAfterLoad, data.length - 5);
  
  for (let i = start; i < end; i++) {
    if (velocities[i] > config.velocityThreshold) {
      return i;
    }
  }
  
  // Fallback
  return Math.min(loadFrame + config.fallbackOffset, data.length - 5);
}

function detectImpactFrame(data: JointFrame[], launchFrame: number, fps: number, manual?: number): number {
  if (manual !== undefined) return manual;
  
  const config = PHASE_DETECTION.impactDetection;
  const handVelocities = calculateHandVelocity(data, fps, 'right_wrist'); // Assume right-handed
  
  let maxVel = 0;
  let impactFrame = launchFrame + 10;
  
  for (let i = launchFrame + config.minFramesAfterLaunch; i < data.length; i++) {
    if (handVelocities[i] > maxVel) {
      maxVel = handVelocities[i];
      impactFrame = i;
    }
  }
  
  return impactFrame;
}

// ========================================
// FEATURE EXTRACTION
// ========================================

function extractFeatures(
  data: JointFrame[],
  phases: SwingPhases,
  fps: number,
  playerHeight?: number
): ExtractedFeatures {
  // TEMPO features (from phases)
  const tempo = {
    loadDuration: phases.loadDuration,
    swingDuration: phases.swingDuration,
    abRatio: phases.abRatio,
  };
  
  // SEQUENCE features (kinematic chain)
  const sequence = extractSequenceFeatures(data, phases, fps);
  
  // COM / BALANCE features
  const comBalance = extractCOMFeatures(data, phases, fps, playerHeight);
  
  // HAND PATH features
  const handPath = extractHandPathFeatures(data, phases);
  
  // POSTURE features
  const posture = extractPostureFeatures(data, phases);
  
  return {
    tempo,
    sequence,
    comBalance,
    handPath,
    posture,
  };
}

function extractSequenceFeatures(data: JointFrame[], phases: SwingPhases, fps: number) {
  // Calculate angular velocities for each segment
  const pelvisVel = calculatePelvisAngularVelocity(data, fps);
  const torsoVel = calculateTorsoAngularVelocity(data, fps);
  const armVel = calculateArmAngularVelocity(data, fps);
  const batVel = armVel; // Approximate bat from arm (single-camera limitation)
  
  // Find peak timing for each segment
  const pelvisPeak = findPeakIndex(pelvisVel);
  const torsoPeak = findPeakIndex(torsoVel);
  const armPeak = findPeakIndex(armVel);
  const batPeak = findPeakIndex(batVel);
  
  // Convert to ms before impact
  const impactFrame = phases.impactFrame;
  const msPerFrame = 1000 / fps;
  
  const pelvisPeakTiming = (impactFrame - pelvisPeak) * msPerFrame;
  const torsoPeakTiming = (impactFrame - torsoPeak) * msPerFrame;
  const handsPeakTiming = (impactFrame - armPeak) * msPerFrame;
  const batPeakTiming = (impactFrame - batPeak) * msPerFrame;
  
  // Determine sequence order
  const peaks = [
    { name: 'pelvis', timing: pelvisPeakTiming, index: pelvisPeak },
    { name: 'torso', timing: torsoPeakTiming, index: torsoPeak },
    { name: 'hands', timing: handsPeakTiming, index: armPeak },
    { name: 'bat', timing: batPeakTiming, index: batPeak },
  ];
  
  // Sort by timing (earliest first = peaks earliest)
  peaks.sort((a, b) => b.timing - a.timing);
  const sequenceOrder = peaks.map(p => p.name);
  
  // Calculate timing gaps (absolute values)
  const pelvisTorsoGap = Math.abs(pelvisPeakTiming - torsoPeakTiming);
  const torsoHandsGap = Math.abs(torsoPeakTiming - handsPeakTiming);
  const handsBatGap = Math.abs(handsPeakTiming - batPeakTiming);
  
  return {
    sequenceOrder,
    pelvisTorsoGap,
    torsoHandsGap,
    handsBatGap,
    pelvisPeakTiming,
    torsoPeakTiming,
    handsPeakTiming,
    batPeakTiming,
  };
}

function extractCOMFeatures(data: JointFrame[], phases: SwingPhases, fps: number, playerHeight?: number) {
  // Pelvis trajectory jerk (smoothness of COM path)
  const pelvisPositions = data.map(frame => getMidpoint(frame, 'left_hip', 'right_hip'));
  const pelvisJerk = calculateJerk(pelvisPositions, fps);
  
  // Head displacement (stance to impact)
  const stanceFrame = Math.max(0, phases.loadFrame - 10);
  const impactFrame = phases.impactFrame;
  const headStart = getJoint(data[stanceFrame], 'nose') || getMidpoint(data[stanceFrame], 'left_eye', 'right_eye');
  const headEnd = getJoint(data[impactFrame], 'nose') || getMidpoint(data[impactFrame], 'left_eye', 'right_eye');
  const headDisplacement = headStart && headEnd ? distance(headStart, headEnd) * 180 : 0; // Scale to ~cm
  
  // Weight transfer (pelvis X position change)
  const stanceX = pelvisPositions[stanceFrame]?.x || 0.5;
  const launchX = pelvisPositions[phases.launchFrame]?.x || 0.5;
  const impactX = pelvisPositions[impactFrame]?.x || 0.5;
  
  const totalShift = launchX - stanceX;
  const completedShift = impactX - stanceX;
  const weightTransfer = totalShift > 0 ? (completedShift / totalShift) * 100 : 0;
  
  return {
    pelvisJerk,
    headDisplacement,
    weightTransfer: Math.max(0, Math.min(100, weightTransfer)),
  };
}

function extractHandPathFeatures(data: JointFrame[], phases: SwingPhases) {
  // Track lead hand path (assume right-handed for now)
  const leadHand = 'right_wrist';
  const launchFrame = phases.launchFrame;
  const impactFrame = phases.impactFrame;
  
  // Calculate path efficiency (arc length / straight line distance)
  let arcLength = 0;
  for (let i = launchFrame; i < impactFrame; i++) {
    const p1 = getJoint(data[i], leadHand);
    const p2 = getJoint(data[i + 1], leadHand);
    if (p1 && p2) {
      arcLength += distance(p1, p2);
    }
  }
  
  const start = getJoint(data[launchFrame], leadHand);
  const end = getJoint(data[impactFrame], leadHand);
  const straightLine = start && end ? distance(start, end) : 1;
  const pathEfficiency = straightLine > 0 ? arcLength / straightLine : 1;
  
  // Barrel direction at impact (angle from horizontal)
  // Approximate from wrist positions
  const wristLeft = getJoint(data[impactFrame], 'left_wrist');
  const wristRight = getJoint(data[impactFrame], 'right_wrist');
  const barrelAngleDeviation = wristLeft && wristRight 
    ? Math.abs(Math.atan2(wristRight.y - wristLeft.y, wristRight.x - wristLeft.x) * (180 / Math.PI))
    : 0;
  
  // Rear elbow proximity to torso
  const rearElbow = getJoint(data[impactFrame], 'left_elbow');
  const torsoMid = getMidpoint(data[impactFrame], 'left_shoulder', 'right_shoulder');
  const rearElbowProximity = rearElbow && torsoMid ? distance(rearElbow, torsoMid) * 100 : 0; // Scale to ~cm
  
  return {
    pathEfficiency,
    barrelAngleDeviation,
    rearElbowProximity,
  };
}

function extractPostureFeatures(data: JointFrame[], phases: SwingPhases) {
  // Spine angle at launch and impact
  const launchFrame = phases.launchFrame;
  const impactFrame = phases.impactFrame;
  
  const spineLaunch = calculateSpineAngle(data[launchFrame]);
  const spineImpact = calculateSpineAngle(data[impactFrame]);
  const spineAngleChange = Math.abs(spineImpact - spineLaunch);
  
  // Shoulder tilt at impact
  const shoulderTiltAtImpact = calculateShoulderTilt(data[impactFrame]);
  
  return {
    spineAngleChange,
    shoulderTiltAtImpact,
  };
}

// ========================================
// FEATURE SCORING
// ========================================

function scoreFeatures(features: ExtractedFeatures): FeatureScore[] {
  const scores: FeatureScore[] = [];
  
  // TEMPO features
  scores.push({
    name: 'loadDuration',
    category: 'tempo',
    rawValue: features.tempo.loadDuration,
    score: scoreToleranceBand(features.tempo.loadDuration, THRESHOLDS.loadDuration),
    weight: FEATURE_WEIGHTS.tempo.loadDuration,
  });
  
  scores.push({
    name: 'swingDuration',
    category: 'tempo',
    rawValue: features.tempo.swingDuration,
    score: scoreToleranceBand(features.tempo.swingDuration, THRESHOLDS.swingDuration),
    weight: FEATURE_WEIGHTS.tempo.swingDuration,
  });
  
  scores.push({
    name: 'abRatio',
    category: 'tempo',
    rawValue: features.tempo.abRatio,
    score: scoreToleranceBand(features.tempo.abRatio, THRESHOLDS.abRatio),
    weight: FEATURE_WEIGHTS.tempo.abRatio,
  });
  
  // SEQUENCE features
  scores.push({
    name: 'sequenceOrder',
    category: 'sequence',
    rawValue: null, // Array, not a single number
    score: scoreSequenceOrder(features.sequence.sequenceOrder),
    weight: FEATURE_WEIGHTS.sequence.sequenceOrder,
  });
  
  scores.push({
    name: 'pelvisTorsoGap',
    category: 'sequence',
    rawValue: features.sequence.pelvisTorsoGap,
    score: scoreToleranceBand(features.sequence.pelvisTorsoGap, THRESHOLDS.pelvisTorsoGap),
    weight: FEATURE_WEIGHTS.sequence.pelvisTorsoGap,
  });
  
  scores.push({
    name: 'torsoHandsGap',
    category: 'sequence',
    rawValue: features.sequence.torsoHandsGap,
    score: scoreToleranceBand(features.sequence.torsoHandsGap, THRESHOLDS.torsoHandsGap),
    weight: FEATURE_WEIGHTS.sequence.torsoHandsGap,
  });
  
  scores.push({
    name: 'handsBatGap',
    category: 'sequence',
    rawValue: features.sequence.handsBatGap,
    score: scoreToleranceBand(features.sequence.handsBatGap, THRESHOLDS.handsBatGap),
    weight: FEATURE_WEIGHTS.sequence.handsBatGap,
  });
  
  // COM / BALANCE features
  scores.push({
    name: 'pelvisJerk',
    category: 'comBalance',
    rawValue: features.comBalance.pelvisJerk,
    score: scoreLessIsBetter(features.comBalance.pelvisJerk, THRESHOLDS.pelvisJerk),
    weight: FEATURE_WEIGHTS.comBalance.pelvisTrajectory,
  });
  
  scores.push({
    name: 'headDisplacement',
    category: 'comBalance',
    rawValue: features.comBalance.headDisplacement,
    score: scoreLessIsBetter(features.comBalance.headDisplacement, THRESHOLDS.headDisplacement),
    weight: FEATURE_WEIGHTS.comBalance.headStability,
  });
  
  scores.push({
    name: 'weightTransfer',
    category: 'comBalance',
    rawValue: features.comBalance.weightTransfer,
    score: scoreMoreIsBetter(features.comBalance.weightTransfer, THRESHOLDS.weightTransfer),
    weight: FEATURE_WEIGHTS.comBalance.weightTransfer,
  });
  
  // HAND PATH features
  scores.push({
    name: 'pathEfficiency',
    category: 'handPath',
    rawValue: features.handPath.pathEfficiency,
    score: scoreToleranceBand(features.handPath.pathEfficiency, THRESHOLDS.handPathRatio),
    weight: FEATURE_WEIGHTS.handPath.pathEfficiency,
  });
  
  scores.push({
    name: 'barrelAngleDeviation',
    category: 'handPath',
    rawValue: features.handPath.barrelAngleDeviation,
    score: scoreLessIsBetter(features.handPath.barrelAngleDeviation, THRESHOLDS.barrelAngleDeviation),
    weight: FEATURE_WEIGHTS.handPath.barrelDirection,
  });
  
  scores.push({
    name: 'rearElbowProximity',
    category: 'handPath',
    rawValue: features.handPath.rearElbowProximity,
    score: scoreLessIsBetter(features.handPath.rearElbowProximity, THRESHOLDS.rearElbowProximity),
    weight: FEATURE_WEIGHTS.handPath.connectionScore,
  });
  
  // POSTURE features
  scores.push({
    name: 'spineAngleChange',
    category: 'posture',
    rawValue: features.posture.spineAngleChange,
    score: scoreLessIsBetter(features.posture.spineAngleChange, THRESHOLDS.spineAngleChange),
    weight: FEATURE_WEIGHTS.posture.spineAngleChange,
  });
  
  scores.push({
    name: 'shoulderTiltAtImpact',
    category: 'posture',
    rawValue: features.posture.shoulderTiltAtImpact,
    score: scoreToleranceBand(features.posture.shoulderTiltAtImpact, THRESHOLDS.shoulderTiltAtImpact),
    weight: FEATURE_WEIGHTS.posture.shoulderTiltImpact,
  });
  
  return scores;
}

// ========================================
// CATEGORY AGGREGATION
// ========================================

function aggregateCategoryScores(featureScores: FeatureScore[]): CategoryScores {
  const categories = ['tempo', 'sequence', 'comBalance', 'handPath', 'posture'];
  const categoryScores: any = {};
  
  for (const category of categories) {
    const features = featureScores.filter(f => f.category === category);
    
    // Weighted average within category
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (const feature of features) {
      weightedSum += feature.score * feature.weight;
      totalWeight += feature.weight;
    }
    
    categoryScores[category] = totalWeight > 0 ? weightedSum / totalWeight : 0;
  }
  
  return categoryScores;
}

// ========================================
// MOMENTUM TRANSFER SCORING
// ========================================

/**
 * Calculate Momentum Transfer Score: How well does energy/speed transfer
 * from Anchor→Engine→Whip over time?
 * 
 * Uses ONLY single-camera joint data:
 * - Segment peak order
 * - Timing gaps between peaks
 * - Deceleration patterns
 * - Smoothness (jerk)
 * - A-B-C tempo
 */
function calculateMomentumTransferScore(
  features: ExtractedFeatures,
  data: JointFrame[],
  phases: SwingPhases,
  fps: number
): MomentumTransferScore {
  const components: MomentumTransferComponents = {
    sequenceOrderScore: 0,
    pelvisTorsoGapScore: 0,
    torsoHandsGapScore: 0,
    handsBatGapScore: 0,
    decelQualityScore: 0,
    smoothnessScore: 0,
    abcTempoScore: 0,
    
    // Raw timing values in milliseconds for UI/Coach Rick
    abRatio: features.tempo.abRatio,
    pelvisTorsoGapMs: Math.round(features.sequence.pelvisTorsoGap * 1000 / fps),
    torsoHandsGapMs: Math.round(features.sequence.torsoHandsGap * 1000 / fps),
    handsBarrelGapMs: Math.round(features.sequence.handsBatGap * 1000 / fps),
  };
  
  // 1. Sequence Order Score (30% weight)
  const { sequenceOrder } = features.sequence;
  const idealOrder = ['pelvis', 'torso', 'hands', 'bat'];
  
  let orderScore = 100;
  let swaps = 0;
  for (let i = 0; i < idealOrder.length; i++) {
    if (sequenceOrder[i] !== idealOrder[i]) {
      swaps++;
    }
  }
  
  if (swaps === 0) {
    orderScore = 100; // Perfect order
  } else if (swaps === 1) {
    orderScore = 75;  // One adjacent swap
  } else if (swaps === 2) {
    orderScore = 50;  // Two segments out of order
  } else {
    orderScore = 25;  // Clearly broken
  }
  
  components.sequenceOrderScore = orderScore;
  
  // 2. Timing Gap Scores (15% + 15% + 10% = 40% total weight)
  components.pelvisTorsoGapScore = scoreToleranceBand(
    features.sequence.pelvisTorsoGap,
    THRESHOLDS.pelvisTorsoGap
  );
  
  components.torsoHandsGapScore = scoreToleranceBand(
    features.sequence.torsoHandsGap,
    THRESHOLDS.torsoHandsGap
  );
  
  components.handsBatGapScore = scoreToleranceBand(
    features.sequence.handsBatGap,
    THRESHOLDS.handsBatGap
  );
  
  // 3. Deceleration Quality Score (15% weight)
  // Check if upstream segments decelerate while downstream peaks
  components.decelQualityScore = calculateDecelQualityScore(data, phases, fps);
  
  // 4. Smoothness Score (10% weight)
  // Use pelvis jerk as proxy for overall momentum flow smoothness
  const pelvisJerk = features.comBalance.pelvisJerk;
  components.smoothnessScore = scoreLessIsBetter(pelvisJerk, THRESHOLDS.pelvisJerk);
  
  // 5. A-B-C Tempo Score (5% weight)
  // Reward consistent A→B and B→C timing
  const loadDur = features.tempo.loadDuration;
  const swingDur = features.tempo.swingDuration;
  const abRatio = features.tempo.abRatio;
  
  const loadScore = scoreToleranceBand(loadDur, THRESHOLDS.loadDuration);
  const swingScore = scoreToleranceBand(swingDur, THRESHOLDS.swingDuration);
  const ratioScore = scoreToleranceBand(abRatio, THRESHOLDS.abRatio);
  
  components.abcTempoScore = (loadScore + swingScore + ratioScore) / 3;
  
  // Weighted average of all components
  const overall =
    components.sequenceOrderScore * MOMENTUM_TRANSFER_WEIGHTS.sequenceOrderScore +
    components.pelvisTorsoGapScore * MOMENTUM_TRANSFER_WEIGHTS.pelvisTorsoGapScore +
    components.torsoHandsGapScore * MOMENTUM_TRANSFER_WEIGHTS.torsoHandsGapScore +
    components.handsBatGapScore * MOMENTUM_TRANSFER_WEIGHTS.handsBatGapScore +
    components.decelQualityScore * MOMENTUM_TRANSFER_WEIGHTS.decelQualityScore +
    components.smoothnessScore * MOMENTUM_TRANSFER_WEIGHTS.smoothnessScore +
    components.abcTempoScore * MOMENTUM_TRANSFER_WEIGHTS.abcTempoScore;
  
  return {
    overall: Math.round(overall),
    components,
  };
}

/**
 * Calculate Deceleration Quality Score:
 * Upstream segments should decelerate while downstream segments peak.
 */
function calculateDecelQualityScore(
  data: JointFrame[],
  phases: SwingPhases,
  fps: number
): number {
  const pelvisVel = calculatePelvisAngularVelocity(data, fps);
  const torsoVel = calculateTorsoAngularVelocity(data, fps);
  const armVel = calculateArmAngularVelocity(data, fps);
  
  const pelvisPeak = findPeakIndex(pelvisVel);
  const torsoPeak = findPeakIndex(torsoVel);
  const armPeak = findPeakIndex(armVel);
  
  let decelQuality = 100;
  
  // Check pelvis decel after peak before torso peak
  if (torsoPeak > pelvisPeak) {
    const pelvisDecel = pelvisVel[torsoPeak] < pelvisVel[pelvisPeak] * 0.7; // 30% decel
    if (!pelvisDecel) decelQuality -= 15;
  } else {
    decelQuality -= 20; // Wrong order
  }
  
  // Check torso decel after peak before arm peak
  if (armPeak > torsoPeak) {
    const torsoDecel = torsoVel[armPeak] < torsoVel[torsoPeak] * 0.7;
    if (!torsoDecel) decelQuality -= 15;
  } else {
    decelQuality -= 20;
  }
  
  return Math.max(0, decelQuality);
}

// ========================================
// SUB-SCORES (ANCHOR / ENGINE / WHIP)
// ========================================

/**
 * Calculate Anchor Score (Lower Body): 0-100
 * How well does the lower body set up and launch momentum transfer?
 */
function calculateAnchorScore(features: ExtractedFeatures, categoryScores: CategoryScores): number {
  // Anchor uses COM/Balance features (pelvis trajectory, weight transfer)
  // and lower-body related posture/stability
  
  const anchorComponents = [
    { score: categoryScores.comBalance, weight: 0.70 },  // Primary: stability, weight transfer
    { score: categoryScores.posture, weight: 0.30 },     // Secondary: base/posture
  ];
  
  let anchorScore = 0;
  for (const comp of anchorComponents) {
    anchorScore += comp.score * comp.weight;
  }
  
  return Math.round(anchorScore);
}

/**
 * Calculate Engine Score (Core/Torso): 0-100
 * Does the torso accept and amplify what the Anchor gives it?
 */
function calculateEngineScore(features: ExtractedFeatures, categoryScores: CategoryScores): number {
  // Engine uses sequence timing (torso rotation) and tempo (efficient transfer)
  
  const engineComponents = [
    { score: categoryScores.sequence, weight: 0.60 },    // Primary: kinematic chain
    { score: categoryScores.tempo, weight: 0.40 },       // Secondary: A-B-C timing
  ];
  
  let engineScore = 0;
  for (const comp of engineComponents) {
    engineScore += comp.score * comp.weight;
  }
  
  return Math.round(engineScore);
}

/**
 * Calculate Whip Score (Arms/Bat): 0-100
 * Did the arms and bat accept upstream energy and release it at the right moment?
 */
function calculateWhipScore(features: ExtractedFeatures, categoryScores: CategoryScores): number {
  // Whip uses hand path efficiency and barrel delivery
  
  return Math.round(categoryScores.handPath); // Hand path IS the whip
}

// ========================================
// COMPOSITE CALCULATION (NEW MODEL)
// ========================================

function calculateComposite(
  momentumTransferScore: MomentumTransferScore,
  anchorScore: number,
  engineScore: number,
  whipScore: number
): number {
  const composite =
    momentumTransferScore.overall * COMPOSITE_WEIGHTS.momentumTransfer +
    anchorScore * COMPOSITE_WEIGHTS.anchor +
    engineScore * COMPOSITE_WEIGHTS.engine +
    whipScore * COMPOSITE_WEIGHTS.whip;
  
  return composite;
}

// ========================================
// LEGACY COMPOSITE CALCULATION (for backward compatibility)
// ========================================

function calculateLegacyComposite(categoryScores: CategoryScores): number {
  const composite =
    categoryScores.tempo * CATEGORY_WEIGHTS.tempo +
    categoryScores.sequence * CATEGORY_WEIGHTS.sequence +
    categoryScores.comBalance * CATEGORY_WEIGHTS.comBalance +
    categoryScores.handPath * CATEGORY_WEIGHTS.handPath +
    categoryScores.posture * CATEGORY_WEIGHTS.posture;
  
  return composite;
}

// ========================================
// DEBUG BREAKDOWN
// ========================================

function buildDebugBreakdown(
  data: JointFrame[],
  fps: number,
  confidence: number,
  phases: SwingPhases,
  features: ExtractedFeatures,
  featureScores: FeatureScore[],
  categoryScores: CategoryScores,
  momentumTransferScore: MomentumTransferScore,
  subScores: SubScores,
  finalScore: number,
  adjustments: any
): DebugBreakdown {
  // Build feature score details
  const featureScoreDetails: FeatureScoreDetail[] = featureScores.map(f => ({
    ...f,
    interpretation: getScoreInterpretation(f.score),
  }));
  
  // Build category breakdowns
  const categoryBreakdowns: CategoryBreakdown[] = Object.keys(CATEGORY_WEIGHTS).map(cat => {
    const catFeatures = featureScoreDetails.filter(f => f.category === cat);
    const weightedScores = catFeatures.map(f => f.score * f.weight);
    const categoryWeight = (CATEGORY_WEIGHTS as any)[cat];
    const catScore = (categoryScores as any)[cat];
    
    return {
      category: cat,
      features: catFeatures,
      weightedScores,
      categoryScore: catScore,
      weight: categoryWeight,
      contributionToComposite: catScore * categoryWeight,
    };
  });
  
  return {
    input: {
      frameCount: data.length,
      fps,
      confidenceAvg: confidence,
    },
    phases,
    features,
    featureScores: featureScoreDetails,
    categoryBreakdown: categoryBreakdowns,
    momentumTransfer: {
      overall: momentumTransferScore.overall,
      components: momentumTransferScore.components,
      componentWeights: MOMENTUM_TRANSFER_WEIGHTS,
    },
    subScores: {
      anchor: subScores.anchor,
      engine: subScores.engine,
      whip: subScores.whip,
    },
    composite: {
      momentumTransferScore: momentumTransferScore.overall,
      momentumTransferWeight: COMPOSITE_WEIGHTS.momentumTransfer,
      anchorScore: subScores.anchor,
      anchorWeight: COMPOSITE_WEIGHTS.anchor,
      engineScore: subScores.engine,
      engineWeight: COMPOSITE_WEIGHTS.engine,
      whipScore: subScores.whip,
      whipWeight: COMPOSITE_WEIGHTS.whip,
      weightedSum: 
        momentumTransferScore.overall * COMPOSITE_WEIGHTS.momentumTransfer +
        subScores.anchor * COMPOSITE_WEIGHTS.anchor +
        subScores.engine * COMPOSITE_WEIGHTS.engine +
        subScores.whip * COMPOSITE_WEIGHTS.whip,
      beforePenalties: adjustments.originalScore || finalScore,
      afterPenalties: finalScore,
      finalScore,
    },
    penalties: {
      momentumTransferCap: adjustments.momentumTransferCapsApplied
        ? {
            applied: true,
            mtScore: momentumTransferScore.overall,
            capLevel: adjustments.momentumCapLevel,
            reason: PENALTIES.momentumTransferCaps.reason,
          }
        : undefined,
      criticalFeature: adjustments.criticalFeaturePenaltyApplied
        ? {
            applied: true,
            reason: PENALTIES.criticalFeature.reason,
            impact: `Score capped at ${PENALTIES.criticalFeature.capScore}`,
          }
        : { applied: false, reason: '', impact: '' },
      lowConfidence: adjustments.lowConfidencePenalty > 0
        ? {
            applied: true,
            confidenceLevel: confidence,
            pointsDeducted: adjustments.lowConfidencePenalty,
          }
        : { applied: false, confidenceLevel: confidence, pointsDeducted: 0 },
    },
  };
}

function getScoreInterpretation(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Needs Work';
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function getMidpoint(frame: JointFrame, joint1: string, joint2: string): { x: number; y: number } | null {
  const j1 = getJoint(frame, joint1);
  const j2 = getJoint(frame, joint2);
  
  if (!j1 || !j2) return null;
  
  return {
    x: (j1.x + j2.x) / 2,
    y: (j1.y + j2.y) / 2,
  };
}

function getJoint(frame: JointFrame, name: string): Joint | null {
  return frame.joints?.find(j => j.name === name) || null;
}

function distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

function calculatePelvisAngularVelocity(data: JointFrame[], fps: number): number[] {
  const angles: number[] = [];
  
  for (const frame of data) {
    const left = getJoint(frame, 'left_hip');
    const right = getJoint(frame, 'right_hip');
    
    if (left && right) {
      const angle = Math.atan2(right.y - left.y, right.x - left.x) * (180 / Math.PI);
      angles.push(angle);
    } else {
      angles.push(0);
    }
  }
  
  return calculateAngularVelocity(angles, fps);
}

function calculateTorsoAngularVelocity(data: JointFrame[], fps: number): number[] {
  const angles: number[] = [];
  
  for (const frame of data) {
    const left = getJoint(frame, 'left_shoulder');
    const right = getJoint(frame, 'right_shoulder');
    
    if (left && right) {
      const angle = Math.atan2(right.y - left.y, right.x - left.x) * (180 / Math.PI);
      angles.push(angle);
    } else {
      angles.push(0);
    }
  }
  
  return calculateAngularVelocity(angles, fps);
}

function calculateArmAngularVelocity(data: JointFrame[], fps: number): number[] {
  const angles: number[] = [];
  
  for (const frame of data) {
    const elbow = getJoint(frame, 'right_elbow');
    const wrist = getJoint(frame, 'right_wrist');
    
    if (elbow && wrist) {
      const angle = Math.atan2(wrist.y - elbow.y, wrist.x - elbow.x) * (180 / Math.PI);
      angles.push(angle);
    } else {
      angles.push(0);
    }
  }
  
  return calculateAngularVelocity(angles, fps);
}

function calculateAngularVelocity(angles: number[], fps: number): number[] {
  const velocities: number[] = [];
  const dt = 1 / fps;
  
  for (let i = 1; i < angles.length - 1; i++) {
    const dAngle = angles[i + 1] - angles[i - 1];
    const velocity = Math.abs(dAngle / (2 * dt));
    velocities.push(velocity);
  }
  
  // Pad edges
  velocities.unshift(velocities[0] || 0);
  velocities.push(velocities[velocities.length - 1] || 0);
  
  return velocities;
}

function calculateHandVelocity(data: JointFrame[], fps: number, handJoint: string): number[] {
  const velocities: number[] = [];
  const dt = 1 / fps;
  
  for (let i = 1; i < data.length; i++) {
    const p1 = getJoint(data[i - 1], handJoint);
    const p2 = getJoint(data[i], handJoint);
    
    if (p1 && p2) {
      const dist = distance(p1, p2);
      const velocity = dist / dt;
      velocities.push(velocity);
    } else {
      velocities.push(0);
    }
  }
  
  velocities.unshift(0); // Pad start
  return velocities;
}

function findPeakIndex(values: number[]): number {
  let maxVal = 0;
  let maxIdx = 0;
  
  for (let i = 0; i < values.length; i++) {
    if (values[i] > maxVal) {
      maxVal = values[i];
      maxIdx = i;
    }
  }
  
  return maxIdx;
}

function calculateJerk(positions: (({ x: number; y: number } | null))[], fps: number): number {
  // Jerk = 3rd derivative of position (rate of change of acceleration)
  // For simplicity, use variance of acceleration as proxy
  
  const validPositions = positions.filter(p => p !== null) as { x: number; y: number }[];
  if (validPositions.length < 3) return 0;
  
  const dt = 1 / fps;
  const accelerations: number[] = [];
  
  for (let i = 1; i < validPositions.length - 1; i++) {
    const vel1 = distance(validPositions[i - 1], validPositions[i]) / dt;
    const vel2 = distance(validPositions[i], validPositions[i + 1]) / dt;
    const acc = (vel2 - vel1) / dt;
    accelerations.push(Math.abs(acc));
  }
  
  // Return average acceleration change (proxy for jerk)
  const avgAcc = accelerations.reduce((a, b) => a + b, 0) / accelerations.length;
  return avgAcc;
}

function calculateSpineAngle(frame: JointFrame): number {
  const hipMid = getMidpoint(frame, 'left_hip', 'right_hip');
  const shoulderMid = getMidpoint(frame, 'left_shoulder', 'right_shoulder');
  
  if (!hipMid || !shoulderMid) return 0;
  
  // Angle from vertical
  const dx = shoulderMid.x - hipMid.x;
  const dy = shoulderMid.y - hipMid.y;
  return Math.abs(Math.atan2(dx, dy) * (180 / Math.PI));
}

function calculateShoulderTilt(frame: JointFrame): number {
  const left = getJoint(frame, 'left_shoulder');
  const right = getJoint(frame, 'right_shoulder');
  
  if (!left || !right) return 0;
  
  // Angle from horizontal
  return Math.abs(Math.atan2(right.y - left.y, right.x - left.x) * (180 / Math.PI));
}
