/**
 * Kinematic Sequence Calculator
 * Implements Dr. Kwon's kinematic sequencing analysis
 * Measures pelvis → torso → arm → bat velocity sequencing
 */

import { calculateAngle, calculateVelocity } from './biomechanical-analysis';

interface KinematicSequenceResult {
  pelvisMaxVelocity: number;
  torsoMaxVelocity: number;
  armMaxVelocity: number;
  batMaxVelocity: number;

  pelvisPeakTiming: number; // ms before impact
  torsoPeakTiming: number;
  armPeakTiming: number;
  batPeakTiming: number;

  sequenceScore: number; // 0-100
  sequenceOrder: string[]; // ["pelvis", "torso", "arm", "bat"]

  // Raw velocity curves (for visualization)
  pelvisVelocities: number[];
  torsoVelocities: number[];
  armVelocities: number[];
  batVelocities: number[];
}

export function calculateKinematicSequence(
  skeletonData: any[],
  impactFrame: number,
  fps: number
): KinematicSequenceResult {
  // 1. Calculate angular velocities for each segment
  const pelvisVelocities = calculateSegmentAngularVelocity(
    skeletonData,
    'pelvis',
    fps
  );
  const torsoVelocities = calculateSegmentAngularVelocity(
    skeletonData,
    'torso',
    fps
  );
  const armVelocities = calculateSegmentAngularVelocity(skeletonData, 'arm', fps);
  const batVelocities = calculateSegmentAngularVelocity(skeletonData, 'bat', fps);

  // 2. Find peak velocities and their timing
  const pelvisPeak = findPeakVelocity(pelvisVelocities);
  const torsoPeak = findPeakVelocity(torsoVelocities);
  const armPeak = findPeakVelocity(armVelocities);
  const batPeak = findPeakVelocity(batVelocities);

  // 3. Calculate timing relative to impact (ms before impact)
  const msPerFrame = 1000 / fps;
  const pelvisPeakTiming = (impactFrame - pelvisPeak.frameIndex) * msPerFrame;
  const torsoPeakTiming = (impactFrame - torsoPeak.frameIndex) * msPerFrame;
  const armPeakTiming = (impactFrame - armPeak.frameIndex) * msPerFrame;
  const batPeakTiming = (impactFrame - batPeak.frameIndex) * msPerFrame;

  // 4. Determine sequence order (by peak timing)
  const peaks = [
    { name: 'pelvis', timing: pelvisPeakTiming, velocity: pelvisPeak.velocity },
    { name: 'torso', timing: torsoPeakTiming, velocity: torsoPeak.velocity },
    { name: 'arm', timing: armPeakTiming, velocity: armPeak.velocity },
    { name: 'bat', timing: batPeakTiming, velocity: batPeak.velocity },
  ];

  // Sort by timing (earliest first = peaks earliest)
  peaks.sort((a, b) => b.timing - a.timing);

  const sequenceOrder = peaks.map((p) => p.name);

  // 5. Calculate sequence score (0-100)
  const sequenceScore = calculateSequenceScore(
    sequenceOrder,
    pelvisPeakTiming,
    torsoPeakTiming,
    armPeakTiming,
    batPeakTiming
  );

  return {
    pelvisMaxVelocity: pelvisPeak.velocity,
    torsoMaxVelocity: torsoPeak.velocity,
    armMaxVelocity: armPeak.velocity,
    batMaxVelocity: batPeak.velocity,

    pelvisPeakTiming,
    torsoPeakTiming,
    armPeakTiming,
    batPeakTiming,

    sequenceScore,
    sequenceOrder,

    pelvisVelocities,
    torsoVelocities,
    armVelocities,
    batVelocities,
  };
}

function calculateSegmentAngularVelocity(
  skeletonData: any[],
  segment: 'pelvis' | 'torso' | 'arm' | 'bat',
  fps: number
): number[] {
  const angles: number[] = [];

  for (const frame of skeletonData) {
    const angle = calculateSegmentAngle(frame.keypoints, segment);
    angles.push(angle);
  }

  // Calculate angular velocity (deg/s)
  const velocities: number[] = [];
  const dt = 1 / fps; // Time between frames

  for (let i = 1; i < angles.length - 1; i++) {
    // Central difference
    const dAngle = angles[i + 1] - angles[i - 1];
    const velocity = Math.abs(dAngle / (2 * dt));
    velocities.push(velocity);
  }

  // Pad edges
  velocities.unshift(velocities[0] || 0);
  velocities.push(velocities[velocities.length - 1] || 0);

  return velocities;
}

function calculateSegmentAngle(
  keypoints: any[],
  segment: 'pelvis' | 'torso' | 'arm' | 'bat'
): number {
  // Calculate angle for each segment type
  switch (segment) {
    case 'pelvis': {
      // Angle of line connecting hips (relative to horizontal)
      const leftHip = keypoints[23];
      const rightHip = keypoints[24];
      if (!leftHip || !rightHip) return 0;

      const dx = rightHip.x - leftHip.x;
      const dz = rightHip.z || 0 - (leftHip.z || 0);
      return Math.atan2(dz, dx) * (180 / Math.PI);
    }

    case 'torso': {
      // Angle of line connecting shoulders
      const leftShoulder = keypoints[11];
      const rightShoulder = keypoints[12];
      if (!leftShoulder || !rightShoulder) return 0;

      const dx = rightShoulder.x - leftShoulder.x;
      const dz = (rightShoulder.z || 0) - (leftShoulder.z || 0);
      return Math.atan2(dz, dx) * (180 / Math.PI);
    }

    case 'arm': {
      // Angle of lead arm (elbow to wrist)
      const elbow = keypoints[14]; // right elbow
      const wrist = keypoints[16]; // right wrist
      if (!elbow || !wrist) return 0;

      const dx = wrist.x - elbow.x;
      const dz = (wrist.z || 0) - (elbow.z || 0);
      return Math.atan2(dz, dx) * (180 / Math.PI);
    }

    case 'bat': {
      // Approximate bat angle from forearm angle
      // (In production, track bat directly if possible)
      return calculateSegmentAngle(keypoints, 'arm');
    }

    default:
      return 0;
  }
}

function findPeakVelocity(
  velocities: number[]
): { velocity: number; frameIndex: number } {
  let maxVelocity = 0;
  let maxIndex = 0;

  for (let i = 0; i < velocities.length; i++) {
    if (velocities[i] > maxVelocity) {
      maxVelocity = velocities[i];
      maxIndex = i;
    }
  }

  return { velocity: maxVelocity, frameIndex: maxIndex };
}

function calculateSequenceScore(
  order: string[],
  pelvisTiming: number,
  torsoTiming: number,
  armTiming: number,
  batTiming: number
): number {
  let score = 0;

  // Correct order: pelvis → torso → arm → bat (50 points)
  const correctOrder =
    order[0] === 'pelvis' &&
    order[1] === 'torso' &&
    order[2] === 'arm' &&
    order[3] === 'bat';

  if (correctOrder) {
    score += 50;
  } else {
    // Partial credit for 2 or 3 correct
    let correctCount = 0;
    if (order[0] === 'pelvis') correctCount++;
    if (order[1] === 'torso') correctCount++;
    if (order[2] === 'arm') correctCount++;
    if (order[3] === 'bat') correctCount++;
    score += (correctCount / 4) * 50;
  }

  // Timing gaps (50 points total)
  // Ideal gaps: 30-50ms between each segment
  const gap1 = Math.abs(pelvisTiming - torsoTiming); // pelvis to torso
  const gap2 = Math.abs(torsoTiming - armTiming); // torso to arm
  const gap3 = Math.abs(armTiming - batTiming); // arm to bat

  // Score each gap (ideal = 40ms, range = 30-50ms)
  score += scoreTimingGap(gap1) * 0.17; // ~17 points
  score += scoreTimingGap(gap2) * 0.17; // ~17 points
  score += scoreTimingGap(gap3) * 0.17; // ~17 points

  return Math.min(100, Math.max(0, score));
}

function scoreTimingGap(gapMs: number): number {
  // Ideal: 30-50ms
  // Good: 20-60ms
  // Poor: <20ms or >60ms

  const ideal = 40;
  const tolerance = 10;

  const deviation = Math.abs(gapMs - ideal);

  if (deviation <= tolerance) {
    // Perfect score
    return 100;
  } else {
    // Linear decay
    const score = 100 - (deviation - tolerance) * 2;
    return Math.max(0, score);
  }
}
