// lib/joints/types.ts

/**
 * Represents a single joint point in a frame
 */
export interface JointPoint {
  name: string;       // e.g. "left_shoulder", "right_hip"
  x: number;          // normalized 0–1 (relative to video width)
  y: number;          // normalized 0–1 (relative to video height)
  confidence: number; // 0–1
}

/**
 * Represents all joints in a single video frame
 */
export interface JointFrame {
  timestamp: number;  // milliseconds since video start
  joints: JointPoint[];
}

/**
 * Complete joint data payload for a video
 */
export interface JointDataPayload {
  frames: JointFrame[];
}
