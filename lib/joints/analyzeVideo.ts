// lib/joints/analyzeVideo.ts
import type { JointDataPayload } from "./types";

/**
 * Analyze a swing video and produce joint coordinates per frame.
 *
 * NOTE: Implement this using MediaPipe Pose, TensorFlow.js,
 * or any reliable in-browser/server-side pose model.
 *
 * For now, return a small mocked structure so UI can be wired.
 */
export async function analyzeVideoWithPose(
  videoUrl: string
): Promise<JointDataPayload> {
  // TODO: Implement real pose extraction here.
  // This may use:
  // - A Node worker
  // - A browser worker that posts back data
  // - A third-party JS pose library
  console.log("analyzeVideoWithPose called with", videoUrl);

  // MOCK: single frame, center dot, low confidence
  return {
    frames: [
      {
        timestamp: 0,
        joints: [
          { name: "nose", x: 0.5, y: 0.3, confidence: 0.5 },
        ],
      },
    ],
  };
}
