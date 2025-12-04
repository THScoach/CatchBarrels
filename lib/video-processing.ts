
/**
 * Video Processing Utilities
 * - Auto-trim based on ball impact detection
 * - Frame rate normalization
 * - Skeleton data extraction
 */

import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { createS3Client, getBucketConfig } from './aws-config';

export interface ImpactDetectionResult {
  impactFrame: number;
  confidence: number;
  method: 'auto' | 'manual';
}

export interface VideoMetadata {
  fps: number;
  duration: number;
  totalFrames: number;
  width: number;
  height: number;
}

/**
 * Detect ball impact frame using hand speed analysis
 * Looks for sudden deceleration in wrist movement
 */
export async function detectImpactFrame(
  skeletonData: any[],
  videoFps: number
): Promise<ImpactDetectionResult> {
  if (!skeletonData || skeletonData.length === 0) {
    throw new Error('No skeleton data provided');
  }

  // Track right wrist (keypoint 16) and left wrist (keypoint 15) speeds
  let maxSpeedDrop = 0;
  let impactFrame = Math.floor(skeletonData.length / 2); // Default to middle

  for (let i = 5; i < skeletonData.length - 5; i++) {
    const currentFrame = skeletonData[i];
    const prevFrame = skeletonData[i - 1];
    const nextFrame = skeletonData[i + 1];

    if (!currentFrame?.keypoints || !prevFrame?.keypoints || !nextFrame?.keypoints) {
      continue;
    }

    // Get wrist keypoints (right wrist = 16, left wrist = 15)
    const rightWrist = currentFrame.keypoints[16];
    const leftWrist = currentFrame.keypoints[15];
    const prevRightWrist = prevFrame.keypoints[16];
    const prevLeftWrist = prevFrame.keypoints[15];

    if (!rightWrist || !leftWrist || !prevRightWrist || !prevLeftWrist) {
      continue;
    }

    // Calculate wrist speed (pixels per frame)
    const rightSpeed = Math.sqrt(
      Math.pow(rightWrist.x - prevRightWrist.x, 2) +
      Math.pow(rightWrist.y - prevRightWrist.y, 2)
    );
    const leftSpeed = Math.sqrt(
      Math.pow(leftWrist.x - prevLeftWrist.x, 2) +
      Math.pow(leftWrist.y - prevLeftWrist.y, 2)
    );

    const avgSpeed = (rightSpeed + leftSpeed) / 2;

    // Look for next frame deceleration
    const nextRightWrist = nextFrame.keypoints[16];
    const nextLeftWrist = nextFrame.keypoints[15];
    const nextRightSpeed = Math.sqrt(
      Math.pow(nextRightWrist.x - rightWrist.x, 2) +
      Math.pow(nextRightWrist.y - rightWrist.y, 2)
    );
    const nextLeftSpeed = Math.sqrt(
      Math.pow(nextLeftWrist.x - leftWrist.x, 2) +
      Math.pow(nextLeftWrist.y - leftWrist.y, 2)
    );
    const nextAvgSpeed = (nextRightSpeed + nextLeftSpeed) / 2;

    // Calculate deceleration
    const speedDrop = avgSpeed - nextAvgSpeed;

    // Track maximum deceleration (impact moment)
    if (speedDrop > maxSpeedDrop && avgSpeed > 10) { // Minimum speed threshold
      maxSpeedDrop = speedDrop;
      impactFrame = i;
    }
  }

  // Calculate confidence based on speed drop magnitude
  const confidence = Math.min(maxSpeedDrop / 50, 1.0); // Normalize to 0-1

  return {
    impactFrame,
    confidence,
    method: 'auto'
  };
}

/**
 * Calculate trim range (2 seconds before/after impact)
 */
export function calculateTrimRange(
  impactFrame: number,
  fps: number,
  totalFrames: number
): { startFrame: number; endFrame: number } {
  const framesBeforeImpact = Math.floor(fps * 2); // 2 seconds before
  const framesAfterImpact = Math.floor(fps * 2);  // 2 seconds after

  const startFrame = Math.max(0, impactFrame - framesBeforeImpact);
  const endFrame = Math.min(totalFrames - 1, impactFrame + framesAfterImpact);

  return { startFrame, endFrame };
}

/**
 * Normalize skeleton data to target FPS (120 baseline)
 * Interpolates or downsamples frames as needed
 */
export function normalizeSkeletonData(
  skeletonData: any[],
  originalFps: number,
  targetFps: number = 120
): any[] {
  if (originalFps === targetFps) {
    return skeletonData;
  }

  const normalized: any[] = [];
  const frameRatio = originalFps / targetFps;
  const targetFrameCount = Math.floor(skeletonData.length / frameRatio);

  for (let i = 0; i < targetFrameCount; i++) {
    const sourceIndex = i * frameRatio;
    const lowerIndex = Math.floor(sourceIndex);
    const upperIndex = Math.min(Math.ceil(sourceIndex), skeletonData.length - 1);
    const t = sourceIndex - lowerIndex;

    if (lowerIndex === upperIndex || t === 0) {
      // No interpolation needed
      normalized.push({
        ...skeletonData[lowerIndex],
        frame: i
      });
    } else {
      // Linear interpolation between frames
      const lowerFrame = skeletonData[lowerIndex];
      const upperFrame = skeletonData[upperIndex];

      if (!lowerFrame?.keypoints || !upperFrame?.keypoints) {
        normalized.push({
          ...lowerFrame,
          frame: i
        });
        continue;
      }

      const interpolatedKeypoints = lowerFrame.keypoints.map((kp: any, idx: number) => {
        const upperKp = upperFrame.keypoints[idx];
        if (!kp || !upperKp) return kp;

        return {
          x: kp.x + (upperKp.x - kp.x) * t,
          y: kp.y + (upperKp.y - kp.y) * t,
          z: kp.z + (upperKp.z - kp.z) * t,
          visibility: Math.max(kp.visibility, upperKp.visibility),
          name: kp.name
        };
      });

      normalized.push({
        frame: i,
        keypoints: interpolatedKeypoints,
        timestamp: lowerFrame.timestamp + (upperFrame.timestamp - lowerFrame.timestamp) * t
      });
    }
  }

  return normalized;
}

/**
 * Trim skeleton data to specified frame range
 */
export function trimSkeletonData(
  skeletonData: any[],
  startFrame: number,
  endFrame: number
): any[] {
  return skeletonData
    .filter(frameData => 
      frameData.frame >= startFrame && 
      frameData.frame <= endFrame
    )
    .map((frameData, newIndex) => ({
      ...frameData,
      frame: newIndex // Re-index frames starting from 0
    }));
}

/**
 * Validate skeleton data structure
 */
export function validateSkeletonData(skeletonData: any): boolean {
  if (!Array.isArray(skeletonData)) return false;
  if (skeletonData.length === 0) return false;

  // Check first frame has required structure
  const firstFrame = skeletonData[0];
  if (!firstFrame.keypoints || !Array.isArray(firstFrame.keypoints)) return false;
  if (firstFrame.keypoints.length !== 33) return false; // MediaPipe Pose has 33 keypoints

  return true;
}
