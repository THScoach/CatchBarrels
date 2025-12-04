
/**
 * Joint Data Utilities
 * 
 * Helper functions for converting between skeleton data formats
 * and preparing data for the JointOverlayCompare component.
 */

import { SwingJointSeries, Joint2D, FrameJoints } from './types';

/**
 * MediaPipe Pose keypoint names (33 keypoints)
 */
const MEDIAPIPE_KEYPOINT_NAMES = [
  'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer',
  'right_eye_inner', 'right_eye', 'right_eye_outer',
  'left_ear', 'right_ear', 'mouth_left', 'mouth_right',
  'left_shoulder', 'right_shoulder',
  'left_elbow', 'right_elbow',
  'left_wrist', 'right_wrist',
  'left_pinky', 'right_pinky',
  'left_index', 'right_index',
  'left_thumb', 'right_thumb',
  'left_hip', 'right_hip',
  'left_knee', 'right_knee',
  'left_ankle', 'right_ankle',
  'left_heel', 'right_heel',
  'left_foot_index', 'right_foot_index'
];

/**
 * Convert MediaPipe skeleton data to SwingJointSeries format
 * 
 * Handles the existing skeleton data structure from SkeletonExtractor
 * and converts it to the new AI-ready format.
 */
export function convertToSwingJointSeries(
  skeletonData: any[] | null,
  videoId: string,
  options?: {
    cameraAngle?: 'face-on' | 'side' | 'dtl' | 'unknown';
    impactFrame?: number;
    fps?: number;
    normalizedFps?: number;
    playerHeight?: number;
    handedness?: 'right' | 'left';
    videoType?: string;
  }
): SwingJointSeries | null {
  if (!skeletonData || !Array.isArray(skeletonData) || skeletonData.length === 0) {
    return null;
  }

  // Convert each frame
  const frames: FrameJoints[] = skeletonData.map((frameData, index) => {
    const keypoints = frameData.keypoints || [];
    
    // Convert keypoints to Joint2D format
    const joints: Joint2D[] = keypoints.map((kp: any, kpIndex: number) => ({
      name: MEDIAPIPE_KEYPOINT_NAMES[kpIndex] || `keypoint_${kpIndex}`,
      x: kp.x,
      y: kp.y,
      confidence: kp.visibility
    }));

    return {
      t: frameData.timestamp || index / (options?.fps || 60),
      joints
    };
  });

  return {
    swingId: videoId,
    cameraAngle: options?.cameraAngle || 'unknown',
    frames,
    impactFrame: options?.impactFrame,
    fps: options?.fps,
    normalizedFps: options?.normalizedFps,
    extractedAt: new Date(),
    metadata: {
      playerHeight: options?.playerHeight,
      handedness: options?.handedness,
      videoType: options?.videoType,
      qualityScore: calculateAverageConfidence(frames)
    }
  };
}

/**
 * Calculate average confidence across all joints in all frames
 */
function calculateAverageConfidence(frames: FrameJoints[]): number {
  if (frames.length === 0) return 0;
  
  let totalConfidence = 0;
  let totalJoints = 0;
  
  frames.forEach(frame => {
    frame.joints.forEach(joint => {
      if (joint.confidence !== undefined) {
        totalConfidence += joint.confidence;
        totalJoints++;
      }
    });
  });
  
  return totalJoints > 0 ? totalConfidence / totalJoints : 0;
}

/**
 * Calculate scale factor to normalize skeleton height
 * 
 * This allows comparing swings from players of different heights
 * by scaling both skeletons to the same virtual height.
 */
export function calculateHeightNormalizationScale(
  playerHeight: number | undefined,
  referenceHeight: number | undefined
): number {
  if (!playerHeight || !referenceHeight) {
    return 1.0; // No normalization if heights unknown
  }
  
  // Scale factor to make both skeletons the same height
  return referenceHeight / playerHeight;
}

/**
 * Validate if two swings can be compared
 */
export function canCompareSwings(
  referenceSwing: SwingJointSeries | null,
  currentSwing: SwingJointSeries | null
): { valid: boolean; error?: string } {
  if (!referenceSwing) {
    return { valid: false, error: 'Reference swing not selected' };
  }
  
  if (!currentSwing) {
    return { valid: false, error: 'Current swing data missing' };
  }
  
  if (referenceSwing.cameraAngle !== currentSwing.cameraAngle) {
    return { 
      valid: false, 
      error: `Camera angle mismatch: Reference is "${referenceSwing.cameraAngle}", but current is "${currentSwing.cameraAngle}"` 
    };
  }
  
  if (!referenceSwing.frames || referenceSwing.frames.length === 0) {
    return { valid: false, error: 'Reference swing has no joint data' };
  }
  
  if (!currentSwing.frames || currentSwing.frames.length === 0) {
    return { valid: false, error: 'Current swing has no joint data' };
  }
  
  return { valid: true };
}
