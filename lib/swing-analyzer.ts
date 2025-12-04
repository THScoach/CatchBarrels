/**
 * Swing Analyzer
 * Processes video/skeleton data and calculates all swing metrics
 * Organized into: Motion / Stability / Sequencing categories
 */

import { analyzeSwingBiomechanics } from './biomechanical-analysis';
import { calculateKinematicSequence } from './kinematic-sequence';
import { calculateAngle } from './biomechanical-analysis';

interface SwingAnalysisResult {
  metrics: {
    // ===== MOTION METRICS =====
    avgBatSpeedMph?: number;
    maxBatSpeedMph?: number;
    avgHandSpeedMph?: number;
    maxHandSpeedMph?: number;
    loadToLaunchMs?: number;
    launchToImpactMs?: number;
    swingDurationMs?: number;
    pelvisMaxAngularVelocity?: number;
    torsoMaxAngularVelocity?: number;
    armMaxAngularVelocity?: number;
    batMaxAngularVelocity?: number;
    
    // ===== STABILITY METRICS =====
    spineTiltAtLaunchDeg?: number;
    pelvisAngleAtLaunchDeg?: number;
    shoulderTiltAtLaunchDeg?: number;
    backKneeFlexionAtLaunchDeg?: number;
    spineTiltAtImpactDeg?: number;
    pelvisAngleAtImpactDeg?: number;
    shoulderTiltAtImpactDeg?: number;
    frontKneeFlexionAtImpactDeg?: number;
    hipShoulderSeparation?: number;
    leadElbowAngle?: number;
    rearElbowAngle?: number;
    headDisplacementFromStanceCm?: number;
    strideLengthFactor?: number;
    
    // ===== SEQUENCING METRICS =====
    pelvisPeakTimingMs?: number;
    torsoPeakTimingMs?: number;
    armPeakTimingMs?: number;
    batPeakTimingMs?: number;
    pelvisToTorsoGapMs?: number;
    torsoToArmGapMs?: number;
    armToBatGapMs?: number;
    sequenceOrder?: string[];
    sequenceOrderScore?: number;
    sequenceTimingScore?: number;
    sequenceScore?: number;
    
    // ===== QUALITY =====
    confidence?: number;
    overallScore?: number;
  };
  joints?: any;
  impactFrame?: number;
}

export async function analyzeSwing(swing: any): Promise<SwingAnalysisResult> {
  // 1. Get skeleton data from video
  let skeletonData = swing.video?.skeletonData;
  let impactFrame = swing.video?.impactFrame;
  let fps = swing.video?.fps || 60;
  const playerHeight = swing.video?.playerHeight || 70; // inches (default 5'10")

  if (!skeletonData || !Array.isArray(skeletonData) || skeletonData.length === 0) {
    throw new Error('No skeleton data available for analysis');
  }

  // 2. Detect key frames
  const loadFrame = detectLoadFrame(skeletonData);
  const launchFrame = detectLaunchFrame(skeletonData, loadFrame);
  const actualImpactFrame = impactFrame || Math.floor(skeletonData.length / 2);

  // 3. Calculate biomechanical metrics
  const biomechanics = analyzeSwingBiomechanics(
    skeletonData,
    actualImpactFrame,
    swing.video?.cameraAngle === 'face-on' ? 'right' : 'right' // Default handedness
  );

  // 4. Calculate kinematic sequence metrics (Dr. Kwon)
  const sequence = calculateKinematicSequence(
    skeletonData,
    actualImpactFrame,
    fps
  );

  // 5. Calculate timing metrics
  const timing = calculateTimingMetrics(skeletonData, actualImpactFrame, fps, loadFrame, launchFrame);

  // 6. Calculate stability metrics
  const stability = calculateStabilityMetrics(skeletonData, loadFrame, launchFrame, actualImpactFrame, playerHeight);

  // 7. Calculate sequencing details
  const sequencingDetails = calculateSequencingDetails(sequence);

  // 8. Calculate overall score
  const overallScore = calculateOverallScore(biomechanics, sequence, timing);

  // 9. Compile metrics organized into Motion / Stability / Sequencing
  const metrics = {
    // ===== MOTION METRICS =====
    avgBatSpeedMph: biomechanics.batSpeed.batSpeed * 0.682, // Convert to mph
    maxBatSpeedMph: biomechanics.batSpeed.batSpeed * 0.682, // Same for single swing
    avgHandSpeedMph: biomechanics.batSpeed.maxSpeed * 0.682,
    maxHandSpeedMph: biomechanics.batSpeed.maxSpeed * 0.682,
    loadToLaunchMs: timing.loadToLaunch,
    launchToImpactMs: timing.launchToImpact,
    swingDurationMs: timing.launchToImpact, // Launch → Impact
    pelvisMaxAngularVelocity: sequence.pelvisMaxVelocity,
    torsoMaxAngularVelocity: sequence.torsoMaxVelocity,
    armMaxAngularVelocity: sequence.armMaxVelocity,
    batMaxAngularVelocity: sequence.batMaxVelocity,
    
    // ===== STABILITY METRICS =====
    spineTiltAtLaunchDeg: stability.spineTiltAtLaunch,
    pelvisAngleAtLaunchDeg: stability.pelvisAngleAtLaunch,
    shoulderTiltAtLaunchDeg: stability.shoulderTiltAtLaunch,
    backKneeFlexionAtLaunchDeg: stability.backKneeAtLaunch,
    spineTiltAtImpactDeg: stability.spineTiltAtImpact,
    pelvisAngleAtImpactDeg: stability.pelvisAngleAtImpact,
    shoulderTiltAtImpactDeg: stability.shoulderTiltAtImpact,
    frontKneeFlexionAtImpactDeg: biomechanics.frontKneeAngle,
    hipShoulderSeparation: biomechanics.hipRotation.rotationAngle,
    leadElbowAngle: biomechanics.elbowAngles.leadElbow,
    rearElbowAngle: biomechanics.elbowAngles.rearElbow,
    headDisplacementFromStanceCm: stability.headDisplacement,
    strideLengthFactor: stability.strideLengthFactor,
    
    // ===== SEQUENCING METRICS =====
    pelvisPeakTimingMs: sequence.pelvisPeakTiming,
    torsoPeakTimingMs: sequence.torsoPeakTiming,
    armPeakTimingMs: sequence.armPeakTiming,
    batPeakTimingMs: sequence.batPeakTiming,
    pelvisToTorsoGapMs: sequencingDetails.pelvisToTorsoGap,
    torsoToArmGapMs: sequencingDetails.torsoToArmGap,
    armToBatGapMs: sequencingDetails.armToBatGap,
    sequenceOrder: sequence.sequenceOrder,
    sequenceOrderScore: sequencingDetails.orderScore,
    sequenceTimingScore: sequencingDetails.timingScore,
    sequenceScore: sequence.sequenceScore,
    
    // ===== QUALITY =====
    confidence: calculateConfidence(skeletonData),
    overallScore,
  };

  return {
    metrics,
    joints: skeletonData,
    impactFrame: actualImpactFrame,
  };
}

function calculateTimingMetrics(
  skeletonData: any[], 
  impactFrame: number, 
  fps: number,
  loadFrame: number,
  launchFrame: number
) {
  const msPerFrame = 1000 / fps;

  return {
    loadToLaunch: (launchFrame - loadFrame) * msPerFrame,
    launchToImpact: (impactFrame - launchFrame) * msPerFrame,
    totalSwingTime: (impactFrame - loadFrame) * msPerFrame,
  };
}

function calculateStabilityMetrics(
  skeletonData: any[],
  loadFrame: number,
  launchFrame: number,
  impactFrame: number,
  playerHeight: number
) {
  // Get frames
  const stanceFrame = skeletonData[0]; // Initial stance
  const launchFrameData = skeletonData[launchFrame];
  const impactFrameData = skeletonData[impactFrame];

  // Calculate angles at launch
  const spineTiltAtLaunch = calculateSpineTilt(launchFrameData);
  const pelvisAngleAtLaunch = calculatePelvisAngle(launchFrameData);
  const shoulderTiltAtLaunch = calculateShoulderTilt(launchFrameData);
  const backKneeAtLaunch = calculateBackKneeAngle(launchFrameData);

  // Calculate angles at impact
  const spineTiltAtImpact = calculateSpineTilt(impactFrameData);
  const pelvisAngleAtImpact = calculatePelvisAngle(impactFrameData);
  const shoulderTiltAtImpact = calculateShoulderTilt(impactFrameData);

  // Calculate head displacement
  const headDisplacement = calculateHeadDisplacement(stanceFrame, impactFrameData);

  // Calculate stride length factor
  const strideLengthFactor = calculateStrideLengthFactor(stanceFrame, launchFrameData, playerHeight);

  return {
    spineTiltAtLaunch,
    pelvisAngleAtLaunch,
    shoulderTiltAtLaunch,
    backKneeAtLaunch,
    spineTiltAtImpact,
    pelvisAngleAtImpact,
    shoulderTiltAtImpact,
    headDisplacement,
    strideLengthFactor,
  };
}

function calculateSequencingDetails(sequence: any) {
  // Calculate timing gaps
  const pelvisToTorsoGap = sequence.torsoPeakTiming - sequence.pelvisPeakTiming;
  const torsoToArmGap = sequence.armPeakTiming - sequence.torsoPeakTiming;
  const armToBatGap = sequence.batPeakTiming - sequence.armPeakTiming;

  // Calculate order score (50% of total sequence score)
  const correctOrder = ['pelvis', 'torso', 'arm', 'bat'];
  const orderScore = sequence.sequenceOrder.join(',') === correctOrder.join(',') ? 100 : 0;

  // Calculate timing score (50% of total sequence score)
  // Ideal gaps: 30-50ms
  const timingScore = (
    scoreTimingGap(Math.abs(pelvisToTorsoGap)) +
    scoreTimingGap(Math.abs(torsoToArmGap)) +
    scoreTimingGap(Math.abs(armToBatGap))
  ) / 3;

  return {
    pelvisToTorsoGap: Math.abs(pelvisToTorsoGap),
    torsoToArmGap: Math.abs(torsoToArmGap),
    armToBatGap: Math.abs(armToBatGap),
    orderScore,
    timingScore,
  };
}

// Helper functions for stability metrics
function calculateSpineTilt(frame: any): number {
  const hip = getMidpoint(frame.keypoints?.[23], frame.keypoints?.[24]); // Hips
  const shoulder = getMidpoint(frame.keypoints?.[11], frame.keypoints?.[12]); // Shoulders
  if (!hip || !shoulder) return 0;
  
  // Angle from vertical (90 = parallel to ground)
  const dx = shoulder.x - hip.x;
  const dy = shoulder.y - hip.y;
  return Math.abs(Math.atan2(dx, dy) * (180 / Math.PI));
}

function calculatePelvisAngle(frame: any): number {
  const leftHip = frame.keypoints?.[23];
  const rightHip = frame.keypoints?.[24];
  if (!leftHip || !rightHip) return 0;
  
  // Angle of hip line from horizontal
  const dx = rightHip.x - leftHip.x;
  const dy = rightHip.y - leftHip.y;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

function calculateShoulderTilt(frame: any): number {
  const leftShoulder = frame.keypoints?.[11];
  const rightShoulder = frame.keypoints?.[12];
  if (!leftShoulder || !rightShoulder) return 0;
  
  // Angle of shoulder line from horizontal
  const dx = rightShoulder.x - leftShoulder.x;
  const dy = rightShoulder.y - leftShoulder.y;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

function calculateBackKneeAngle(frame: any): number {
  // Assuming right-handed batter, back leg is right leg
  const hip = frame.keypoints?.[24]; // Right hip
  const knee = frame.keypoints?.[26]; // Right knee
  const ankle = frame.keypoints?.[28]; // Right ankle
  if (!hip || !knee || !ankle) return 0;
  
  return calculateAngle(
    { x: hip.x, y: hip.y },
    { x: knee.x, y: knee.y },
    { x: ankle.x, y: ankle.y }
  );
}

function calculateHeadDisplacement(stanceFrame: any, impactFrame: any): number {
  const stanceHead = getMidpoint(stanceFrame.keypoints?.[0], stanceFrame.keypoints?.[0]); // Nose
  const impactHead = getMidpoint(impactFrame.keypoints?.[0], impactFrame.keypoints?.[0]);
  if (!stanceHead || !impactHead) return 0;
  
  // Distance in normalized coordinates (0-1), convert to cm (assume ~180cm frame height)
  const dx = impactHead.x - stanceHead.x;
  const dy = impactHead.y - stanceHead.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance * 180; // Approximate cm
}

function calculateStrideLengthFactor(stanceFrame: any, launchFrame: any, playerHeight: number): number {
  const stanceAnkle = getMidpoint(stanceFrame.keypoints?.[27], stanceFrame.keypoints?.[28]); // Front ankle
  const launchAnkle = getMidpoint(launchFrame.keypoints?.[27], launchFrame.keypoints?.[28]);
  if (!stanceAnkle || !launchAnkle) return 0;
  
  // Distance in normalized coordinates
  const dx = launchAnkle.x - stanceAnkle.x;
  const dy = launchAnkle.y - stanceAnkle.y;
  const strideDistance = Math.sqrt(dx * dx + dy * dy);
  
  // Normalize by player height (assume frame height ≈ player height)
  // Return as factor (0-1, where 0.5 = 50% of height)
  return strideDistance; // Already normalized
}

function getMidpoint(p1: any, p2: any): { x: number; y: number } | null {
  if (!p1 || !p2) return null;
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

function scoreTimingGap(gap: number): number {
  // Ideal: 30-50ms, score 100
  // 20-30ms or 50-70ms: score 50-100 (linear)
  // <20ms or >70ms: score 0-50 (linear)
  if (gap >= 30 && gap <= 50) return 100;
  if (gap >= 20 && gap < 30) return 50 + ((gap - 20) / 10) * 50;
  if (gap > 50 && gap <= 70) return 100 - ((gap - 50) / 20) * 50;
  if (gap < 20) return (gap / 20) * 50;
  return Math.max(0, 50 - ((gap - 70) / 30) * 50);
}

function calculateConfidence(skeletonData: any[]): number {
  // Average visibility/confidence across all joints and frames
  let totalConfidence = 0;
  let count = 0;

  for (const frame of skeletonData) {
    for (const kp of frame.keypoints || []) {
      if (kp.visibility !== undefined) {
        totalConfidence += kp.visibility;
        count++;
      }
    }
  }

  return count > 0 ? totalConfidence / count : 0;
}

function detectLoadFrame(skeletonData: any[]): number {
  // Simple heuristic: frame with lowest hip position (COM proxy)
  let minY = Infinity;
  let loadFrame = 0;

  for (let i = 0; i < skeletonData.length; i++) {
    const frame = skeletonData[i];
    const hipLeft = frame.keypoints?.[23];
    const hipRight = frame.keypoints?.[24];

    if (hipLeft && hipRight) {
      const avgY = (hipLeft.y + hipRight.y) / 2;
      if (avgY < minY) {
        minY = avgY;
        loadFrame = i;
      }
    }
  }

  return Math.max(0, loadFrame - 5); // Start a bit before the lowest point
}

function detectLaunchFrame(skeletonData: any[], loadFrame: number): number {
  // Frame after load where forward movement begins
  // For now, simple heuristic: 10 frames after load
  return Math.min(loadFrame + 10, skeletonData.length - 1);
}

function calculateOverallScore(
  biomechanics: any,
  sequence: any,
  timing: any
): number {
  // Simple composite score (0-100)
  let score = 0;
  let weight = 0;

  // Sequence score (40%)
  if (sequence.sequenceScore) {
    score += sequence.sequenceScore * 0.4;
    weight += 0.4;
  }

  // Bat speed (30%) - normalize to 0-100 range
  if (biomechanics.batSpeed?.batSpeed) {
    const batSpeedMph = biomechanics.batSpeed.batSpeed * 0.682;
    const batSpeedScore = Math.min(100, Math.max(0, ((batSpeedMph - 60) / 20) * 100));
    score += batSpeedScore * 0.3;
    weight += 0.3;
  }

  // Timing (15%) - based on total swing time
  if (timing.totalSwingTime) {
    // Ideal swing time: 400-600ms
    const idealTime = 500;
    const timingScore = Math.max(0, 100 - Math.abs(timing.totalSwingTime - idealTime) / 5);
    score += timingScore * 0.15;
    weight += 0.15;
  }

  // Hip-shoulder separation (15%)
  if (biomechanics.hipRotation?.rotationAngle) {
    // Ideal: 40-60 degrees
    const xFactor = biomechanics.hipRotation.rotationAngle;
    const xFactorScore = Math.max(0, 100 - Math.abs(xFactor - 50) * 2);
    score += xFactorScore * 0.15;
    weight += 0.15;
  }

  return weight > 0 ? score / weight : 0;
}
