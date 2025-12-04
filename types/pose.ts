/**
 * Standardized Joint/Pose Data Types
 * 
 * These types define the structure for joint tracking data,
 * whether from MediaPipe (browser) or Abacus AI (server).
 */

export interface Joint {
  name: string;         // e.g., "left_shoulder", "right_hip", "nose"
  x: number;            // x-coordinate (normalized 0-1 or pixels, depending on source)
  y: number;            // y-coordinate (normalized 0-1 or pixels)
  z?: number;           // depth (optional, from MediaPipe)
  confidence: number;   // 0-1, how confident the detection is
}

export interface JointFrame {
  timestamp: number;    // seconds into video
  frameIndex?: number;  // optional frame number
  joints: Joint[];
}

export type JointData = JointFrame[];

/**
 * MediaPipe-specific types (for backward compatibility)
 */
export interface MediaPipeKeypoint {
  x: number;
  y: number;
  z: number;
  visibility: number;  // Same as confidence
  name: string;
}

export interface MediaPipeFrame {
  frame: number;
  timestamp: number;
  keypoints: MediaPipeKeypoint[];
}

export type MediaPipeSkeletonData = MediaPipeFrame[];

/**
 * Analysis result types
 */
export interface JointAnalysisResult {
  videoId: string;
  analyzed: boolean;
  analyzedAt?: Date;
  jointData?: JointData;
  source: 'mediapipe' | 'abacus' | 'unknown';
  error?: string;
}

/**
 * Configuration for joint analysis
 */
export interface JointAnalysisConfig {
  fps?: number;          // Target FPS for extraction (default: 30)
  modelComplexity?: 0 | 1 | 2;  // MediaPipe model complexity
  minConfidence?: number;        // Minimum confidence threshold (0-1)
  source?: 'mediapipe' | 'abacus';  // Which analyzer to use
}

/**
 * Conversion helpers
 */

/**
 * Convert MediaPipe skeleton data to standardized JointData format
 */
export function convertMediaPipeToJointData(mediaPipeData: MediaPipeSkeletonData): JointData {
  return mediaPipeData.map(frame => ({
    timestamp: frame.timestamp,
    frameIndex: frame.frame,
    joints: frame.keypoints.map(kp => ({
      name: kp.name,
      x: kp.x,
      y: kp.y,
      z: kp.z,
      confidence: kp.visibility
    }))
  }));
}

/**
 * Convert standardized JointData back to MediaPipe format (for backward compatibility)
 */
export function convertJointDataToMediaPipe(jointData: JointData): MediaPipeSkeletonData {
  return jointData.map(frame => ({
    frame: frame.frameIndex || 0,
    timestamp: frame.timestamp,
    keypoints: frame.joints.map(joint => ({
      name: joint.name,
      x: joint.x,
      y: joint.y,
      z: joint.z || 0,
      visibility: joint.confidence
    }))
  }));
}
