/**
 * MediaPipe Pose Service
 * 
 * Handles skeleton/joint extraction from videos using MediaPipe Pose.
 * This is the existing implementation extracted into a service module.
 */

import { JointData, MediaPipeSkeletonData, convertMediaPipeToJointData } from '@/types/pose';

// MediaPipe Pose keypoint names (33 landmarks)
export const POSE_LANDMARKS = [
  'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer',
  'right_eye_inner', 'right_eye', 'right_eye_outer',
  'left_ear', 'right_ear', 'mouth_left', 'mouth_right',
  'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
  'left_wrist', 'right_wrist', 'left_pinky', 'right_pinky',
  'left_index', 'right_index', 'left_thumb', 'right_thumb',
  'left_hip', 'right_hip', 'left_knee', 'right_knee',
  'left_ankle', 'right_ankle', 'left_heel', 'right_heel',
  'left_foot_index', 'right_foot_index'
];

export interface MediaPipeConfig {
  modelComplexity?: 0 | 1 | 2;  // 0 = lite, 1 = full, 2 = heavy (default: 1)
  smoothLandmarks?: boolean;      // Smooth between frames (default: true)
  minDetectionConfidence?: number; // 0-1 (default: 0.5)
  minTrackingConfidence?: number;  // 0-1 (default: 0.5)
  targetFps?: number;             // Target FPS for extraction (default: 30)
}

const DEFAULT_CONFIG: MediaPipeConfig = {
  modelComplexity: 1,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
  targetFps: 30
};

/**
 * Extract joints from a video using MediaPipe Pose (browser-based)
 * 
 * This function must run in a browser environment (client-side).
 * It uses the existing MediaPipe extraction logic.
 * 
 * @param videoElement - HTML video element containing the video to analyze
 * @param config - Configuration options for MediaPipe
 * @param onProgress - Optional callback for progress updates (0-100)
 * @returns Promise<JointData> - Standardized joint data
 */
export async function extractJointsWithMediaPipe(
  videoElement: HTMLVideoElement,
  config: MediaPipeConfig = {},
  onProgress?: (progress: number, status: string) => void
): Promise<JointData> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Dynamically import MediaPipe (only works in browser)
  if (typeof window === 'undefined') {
    throw new Error('MediaPipe extraction must run in browser environment');
  }
  
  onProgress?.(5, 'Loading MediaPipe Pose model...');
  
  const { Pose } = await import('@mediapipe/pose');
  
  onProgress?.(10, 'Initializing pose detector...');
  
  // Validate video
  if (!videoElement.duration || videoElement.duration <= 0) {
    throw new Error('Invalid video duration. The video may be corrupted.');
  }
  
  if (videoElement.duration > 60) {
    throw new Error('Video is too long. Please use videos under 60 seconds.');
  }
  
  // Initialize MediaPipe Pose
  const pose = new Pose({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
    }
  });
  
  pose.setOptions({
    modelComplexity: finalConfig.modelComplexity,
    smoothLandmarks: finalConfig.smoothLandmarks,
    enableSegmentation: false,
    minDetectionConfidence: finalConfig.minDetectionConfidence,
    minTrackingConfidence: finalConfig.minTrackingConfidence
  });
  
  const extractedFrames: MediaPipeSkeletonData = [];
  const fps = finalConfig.targetFps!;
  const totalFrames = Math.floor(videoElement.duration * fps);
  let frameCount = 0;
  
  onProgress?.(20, `Processing ${totalFrames} frames...`);
  
  // Setup result handler
  let currentFrameResults: any = null;
  let processingComplete = false;
  
  pose.onResults((results: any) => {
    currentFrameResults = results;
    processingComplete = true;
  });
  
  // Create canvas for frame extraction
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    pose.close();
    throw new Error('Failed to create canvas context');
  }
  
  // Process each frame
  for (let t = 0; t < videoElement.duration; t += 1 / fps) {
    const currentTime = t;
    
    // Seek to frame
    await new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Frame ${frameCount} timeout`));
      }, 10000);
      
      videoElement.currentTime = currentTime;
      
      videoElement.onseeked = async () => {
        try {
          clearTimeout(timeoutId);
          
          // Draw frame to canvas
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          
          // Reset processing flags
          currentFrameResults = null;
          processingComplete = false;
          
          // Send to MediaPipe
          await pose.send({ image: canvas });
          
          // Wait for results (with timeout)
          const startWait = Date.now();
          while (!processingComplete && Date.now() - startWait < 5000) {
            await new Promise(r => setTimeout(r, 10));
          }
          
          if (currentFrameResults && currentFrameResults.poseLandmarks) {
            const keypoints = currentFrameResults.poseLandmarks.map(
              (landmark: any, idx: number) => ({
                x: landmark.x * canvas.width,
                y: landmark.y * canvas.height,
                z: landmark.z,
                visibility: landmark.visibility || 1.0,
                name: POSE_LANDMARKS[idx]
              })
            );
            
            extractedFrames.push({
              frame: frameCount,
              timestamp: currentTime,
              keypoints
            });
          }
          
          frameCount++;
          
          // Update progress
          if (frameCount % 10 === 0) {
            const progress = 20 + Math.floor((frameCount / totalFrames) * 70);
            onProgress?.(progress, `Processing frame ${frameCount}/${totalFrames}`);
          }
          
          resolve();
        } catch (error) {
          clearTimeout(timeoutId);
          reject(error);
        }
      };
      
      videoElement.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error(`Video seek error at frame ${frameCount}`));
      };
    });
  }
  
  // Cleanup
  pose.close();
  
  onProgress?.(95, 'Finalizing joint data...');
  
  // Validate extraction
  if (extractedFrames.length === 0) {
    throw new Error('No joint data extracted. The pose detector may not have found a person in the video.');
  }
  
  if (extractedFrames.length < totalFrames * 0.3) {
    console.warn(`Low detection rate: ${extractedFrames.length}/${totalFrames} frames`);
  }
  
  onProgress?.(100, 'Complete!');
  
  // Convert to standardized format
  return convertMediaPipeToJointData(extractedFrames);
}

/**
 * Check if MediaPipe is available in the current environment
 */
export function isMediaPipeAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Check for WebAssembly support (required by MediaPipe)
  if (typeof WebAssembly === 'undefined') {
    return false;
  }
  
  return true;
}

/**
 * Get MediaPipe pose connections (for drawing skeleton lines)
 */
export function getMediaPipePoseConnections(): number[][] {
  return [
    [11, 12], // shoulders
    [11, 13], [13, 15], // left arm
    [12, 14], [14, 16], // right arm
    [11, 23], [12, 24], // torso
    [23, 24], // hips
    [23, 25], [25, 27], [27, 29], [29, 31], // left leg
    [24, 26], [26, 28], [28, 30], [30, 32], // right leg
  ];
}
