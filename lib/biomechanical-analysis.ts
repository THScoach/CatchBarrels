
/**
 * Biomechanical Analysis Utilities
 * Calculates advanced swing metrics from skeleton data
 */

interface Keypoint {
  x: number;
  y: number;
  z: number;
  visibility: number;
  name: string;
}

interface SkeletonFrame {
  frame: number;
  timestamp: number;
  keypoints: Keypoint[];
}

/**
 * Calculate angle between three points (in degrees)
 * Used for joint angles (elbow, knee, hip, etc.)
 */
export function calculateAngle(
  pointA: { x: number; y: number },
  pointB: { x: number; y: number },
  pointC: { x: number; y: number }
): number {
  const vectorBA = { x: pointA.x - pointB.x, y: pointA.y - pointB.y };
  const vectorBC = { x: pointC.x - pointB.x, y: pointC.y - pointB.y };

  const dotProduct = vectorBA.x * vectorBC.x + vectorBA.y * vectorBC.y;
  const magnitudeBA = Math.sqrt(vectorBA.x ** 2 + vectorBA.y ** 2);
  const magnitudeBC = Math.sqrt(vectorBC.x ** 2 + vectorBC.y ** 2);

  const cosine = dotProduct / (magnitudeBA * magnitudeBC);
  const angleRadians = Math.acos(Math.max(-1, Math.min(1, cosine)));
  
  return angleRadians * (180 / Math.PI);
}

/**
 * Calculate velocity of a keypoint between frames (pixels per second)
 */
export function calculateVelocity(
  point1: { x: number; y: number; timestamp: number },
  point2: { x: number; y: number; timestamp: number }
): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  const dt = point2.timestamp - point1.timestamp;
  
  if (dt === 0) return 0;
  
  const distance = Math.sqrt(dx ** 2 + dy ** 2);
  return distance / dt;
}

/**
 * Calculate bat speed at impact
 * Uses wrist velocity as proxy for bat speed
 */
export function calculateBatSpeed(
  skeletonData: SkeletonFrame[],
  impactFrame: number,
  handedness: 'left' | 'right' = 'right'
): { batSpeed: number; maxSpeed: number; avgSpeed: number } {
  const leadHandIdx = handedness === 'right' ? 16 : 15; // right_wrist or left_wrist
  const speeds: number[] = [];

  // Calculate speed in 5-frame window around impact
  const windowSize = 5;
  const startFrame = Math.max(0, impactFrame - windowSize);
  const endFrame = Math.min(skeletonData.length - 1, impactFrame + windowSize);

  for (let i = startFrame; i < endFrame; i++) {
    const frame1 = skeletonData[i];
    const frame2 = skeletonData[i + 1];

    if (!frame1?.keypoints[leadHandIdx] || !frame2?.keypoints[leadHandIdx]) {
      continue;
    }

    const point1 = {
      x: frame1.keypoints[leadHandIdx].x,
      y: frame1.keypoints[leadHandIdx].y,
      timestamp: frame1.timestamp
    };

    const point2 = {
      x: frame2.keypoints[leadHandIdx].x,
      y: frame2.keypoints[leadHandIdx].y,
      timestamp: frame2.timestamp
    };

    speeds.push(calculateVelocity(point1, point2));
  }

  const maxSpeed = Math.max(...speeds, 0);
  const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length || 0;
  
  // Impact speed is average of 3 frames before impact
  const impactSpeedFrames = speeds.slice(-3);
  const batSpeed = impactSpeedFrames.reduce((a, b) => a + b, 0) / impactSpeedFrames.length || 0;

  return { batSpeed, maxSpeed, avgSpeed };
}

/**
 * Calculate hip rotation angle
 * Measures rotation of hip line relative to starting position
 */
export function calculateHipRotation(
  skeletonData: SkeletonFrame[],
  impactFrame: number
): { rotationAngle: number; peakRotation: number } {
  if (!skeletonData[0] || !skeletonData[impactFrame]) {
    return { rotationAngle: 0, peakRotation: 0 };
  }

  const leftHipIdx = 23;
  const rightHipIdx = 24;

  // Initial hip angle (frame 0)
  const initialFrame = skeletonData[0];
  const leftHipInit = initialFrame.keypoints[leftHipIdx];
  const rightHipInit = initialFrame.keypoints[rightHipIdx];
  
  if (!leftHipInit || !rightHipInit) {
    return { rotationAngle: 0, peakRotation: 0 };
  }

  const initialAngle = Math.atan2(
    rightHipInit.y - leftHipInit.y,
    rightHipInit.x - leftHipInit.x
  );

  // Impact hip angle
  const impactFrameData = skeletonData[impactFrame];
  const leftHipImpact = impactFrameData.keypoints[leftHipIdx];
  const rightHipImpact = impactFrameData.keypoints[rightHipIdx];

  if (!leftHipImpact || !rightHipImpact) {
    return { rotationAngle: 0, peakRotation: 0 };
  }

  const impactAngle = Math.atan2(
    rightHipImpact.y - leftHipImpact.y,
    rightHipImpact.x - leftHipImpact.x
  );

  const rotationAngle = Math.abs(impactAngle - initialAngle) * (180 / Math.PI);

  // Find peak rotation across all frames
  let peakRotation = 0;
  for (const frame of skeletonData) {
    const leftHip = frame.keypoints[leftHipIdx];
    const rightHip = frame.keypoints[rightHipIdx];

    if (!leftHip || !rightHip) continue;

    const angle = Math.atan2(
      rightHip.y - leftHip.y,
      rightHip.x - leftHip.x
    );

    const rotation = Math.abs(angle - initialAngle) * (180 / Math.PI);
    peakRotation = Math.max(peakRotation, rotation);
  }

  return { rotationAngle, peakRotation };
}

/**
 * Calculate front knee angle at impact
 * Measures knee flexion (smaller angle = more bend)
 */
export function calculateFrontKneeAngle(
  skeletonData: SkeletonFrame[],
  impactFrame: number,
  handedness: 'left' | 'right' = 'right'
): number {
  const impactFrameData = skeletonData[impactFrame];
  if (!impactFrameData) return 0;

  // Front leg is opposite of handedness
  const frontLeg = handedness === 'right' ? 'left' : 'right';
  
  const hipIdx = frontLeg === 'left' ? 23 : 24;
  const kneeIdx = frontLeg === 'left' ? 25 : 26;
  const ankleIdx = frontLeg === 'left' ? 27 : 28;

  const hip = impactFrameData.keypoints[hipIdx];
  const knee = impactFrameData.keypoints[kneeIdx];
  const ankle = impactFrameData.keypoints[ankleIdx];

  if (!hip || !knee || !ankle) return 0;

  return calculateAngle(
    { x: hip.x, y: hip.y },
    { x: knee.x, y: knee.y },
    { x: ankle.x, y: ankle.y }
  );
}

/**
 * Calculate elbow angles at impact (lead and rear)
 */
export function calculateElbowAngles(
  skeletonData: SkeletonFrame[],
  impactFrame: number,
  handedness: 'left' | 'right' = 'right'
): { leadElbow: number; rearElbow: number } {
  const impactFrameData = skeletonData[impactFrame];
  if (!impactFrameData) return { leadElbow: 0, rearElbow: 0 };

  // Lead arm is same as handedness, rear arm is opposite
  const leadArm = handedness === 'right' ? 'right' : 'left';
  const rearArm = handedness === 'right' ? 'left' : 'right';

  // Lead arm angle
  const leadShoulderIdx = leadArm === 'right' ? 12 : 11;
  const leadElbowIdx = leadArm === 'right' ? 14 : 13;
  const leadWristIdx = leadArm === 'right' ? 16 : 15;

  const leadShoulder = impactFrameData.keypoints[leadShoulderIdx];
  const leadElbowKp = impactFrameData.keypoints[leadElbowIdx];
  const leadWrist = impactFrameData.keypoints[leadWristIdx];

  const leadElbow = (leadShoulder && leadElbowKp && leadWrist)
    ? calculateAngle(
        { x: leadShoulder.x, y: leadShoulder.y },
        { x: leadElbowKp.x, y: leadElbowKp.y },
        { x: leadWrist.x, y: leadWrist.y }
      )
    : 0;

  // Rear arm angle
  const rearShoulderIdx = rearArm === 'right' ? 12 : 11;
  const rearElbowIdx = rearArm === 'right' ? 14 : 13;
  const rearWristIdx = rearArm === 'right' ? 16 : 15;

  const rearShoulder = impactFrameData.keypoints[rearShoulderIdx];
  const rearElbowKp = impactFrameData.keypoints[rearElbowIdx];
  const rearWrist = impactFrameData.keypoints[rearWristIdx];

  const rearElbow = (rearShoulder && rearElbowKp && rearWrist)
    ? calculateAngle(
        { x: rearShoulder.x, y: rearShoulder.y },
        { x: rearElbowKp.x, y: rearElbowKp.y },
        { x: rearWrist.x, y: rearWrist.y }
      )
    : 0;

  return { leadElbow, rearElbow };
}

/**
 * Comprehensive swing analysis
 * Returns all key biomechanical metrics
 */
export function analyzeSwingBiomechanics(
  skeletonData: SkeletonFrame[],
  impactFrame: number,
  handedness: 'left' | 'right' = 'right'
): {
  batSpeed: { batSpeed: number; maxSpeed: number; avgSpeed: number };
  hipRotation: { rotationAngle: number; peakRotation: number };
  frontKneeAngle: number;
  elbowAngles: { leadElbow: number; rearElbow: number };
} {
  return {
    batSpeed: calculateBatSpeed(skeletonData, impactFrame, handedness),
    hipRotation: calculateHipRotation(skeletonData, impactFrame),
    frontKneeAngle: calculateFrontKneeAngle(skeletonData, impactFrame, handedness),
    elbowAngles: calculateElbowAngles(skeletonData, impactFrame, handedness)
  };
}

/**
 * Compare two swings and return differences
 */
export function compareSwings(
  playerAnalysis: ReturnType<typeof analyzeSwingBiomechanics>,
  modelAnalysis: ReturnType<typeof analyzeSwingBiomechanics>
): {
  batSpeedDiff: number;
  hipRotationDiff: number;
  frontKneeDiff: number;
  leadElbowDiff: number;
  rearElbowDiff: number;
} {
  return {
    batSpeedDiff: playerAnalysis.batSpeed.batSpeed - modelAnalysis.batSpeed.batSpeed,
    hipRotationDiff: playerAnalysis.hipRotation.rotationAngle - modelAnalysis.hipRotation.rotationAngle,
    frontKneeDiff: playerAnalysis.frontKneeAngle - modelAnalysis.frontKneeAngle,
    leadElbowDiff: playerAnalysis.elbowAngles.leadElbow - modelAnalysis.elbowAngles.leadElbow,
    rearElbowDiff: playerAnalysis.elbowAngles.rearElbow - modelAnalysis.elbowAngles.rearElbow
  };
}
