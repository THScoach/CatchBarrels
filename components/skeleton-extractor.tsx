
'use client';

/**
 * Skeleton Extractor Component
 * Uses MediaPipe Pose to extract joint coordinates from video
 * Runs in browser to avoid server costs
 */

import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { segmentPlayer, applyMaskToCanvas } from '@/lib/player-segmentation';

interface SkeletonExtractorProps {
  videoId: string;
  videoUrl: string;
  onComplete: (data: { skeletonData: any[]; fps: number; isolatedFrames?: any[] }) => void;
  onError?: (error: Error) => void;
}

interface MediaPipeKeypoint {
  x: number;
  y: number;
  z: number;
  visibility: number;
  name: string;
}

// MediaPipe Pose keypoint names (33 landmarks)
const POSE_LANDMARKS = [
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

export function SkeletonExtractor({ videoId, videoUrl, onComplete, onError }: SkeletonExtractorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('Ready to extract skeleton');
  const [skeletonData, setSkeletonData] = useState<any[]>([]);
  const [enablePlayerIsolation, setEnablePlayerIsolation] = useState(false); // Default OFF for stability
  const [isolatedFrames, setIsolatedFrames] = useState<any[]>([]);
  const [showServerFallback, setShowServerFallback] = useState(false);

  const extractSkeleton = async () => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error('Video or canvas not initialized');
      return;
    }

    const video = videoRef.current;
    
    // Log video info for debugging
    console.log('Video info:', {
      duration: video.duration,
      width: video.videoWidth,
      height: video.videoHeight
    });
    
    // Check video duration - reject if absurdly long
    if (video.duration > 60) {
      toast.error('Video must be under 60 seconds. Please trim your video.');
      return;
    }
    
    // Warn but don't block for moderately long videos
    if (video.duration > 20) {
      toast.warning(`Long video detected (${Math.round(video.duration)}s). Processing may take 1-2 minutes.`);
    }
    
    // Auto-disable player isolation for videos over 10 seconds
    if (video.duration > 10 && enablePlayerIsolation) {
      toast.info('Auto-disabling player isolation for video length');
      setEnablePlayerIsolation(false);
    }

    setIsProcessing(true);
    setProgress(0);
    setStatus('Loading MediaPipe Pose...');

    try {
      // Dynamically import MediaPipe Pose
      const { Pose, POSE_CONNECTIONS } = await import('@mediapipe/pose');
      const { Camera } = await import('@mediapipe/camera_utils');

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const extractedFrames: any[] = [];
      const isolatedPlayerFrames: any[] = [];
      
      // Adaptive FPS calculation for stability
      // Target: 400-600 frames max for any video length
      const maxFrames = 600;
      const targetFPS = Math.min(60, Math.floor(maxFrames / video.duration));
      const fps = Math.max(30, targetFPS); // Minimum 30 FPS for quality
      
      let frameCount = 0;
      const totalFrames = Math.floor(video.duration * fps);
      const startTime = Date.now();
      let lastUpdateTime = startTime;
      let framesProcessedSinceLastUpdate = 0;
      
      console.log(`Processing video: ${video.duration}s at ${fps} FPS = ${totalFrames} frames`);
      
      // Inform user about adaptive FPS if downsampling
      if (fps < 60) {
        toast.info(`Processing at ${fps} FPS for stability (video is ${Math.round(video.duration)}s)`);
      }

      setStatus(enablePlayerIsolation 
        ? 'Extracting skeleton + isolating player...' 
        : 'Extracting skeleton from video...');

      // Initialize MediaPipe Pose
      const pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });

      pose.setOptions({
        modelComplexity: 1, // Reduced from 2 for better performance
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      // Setup result handler once before processing
      let currentFrameResults: any = null;
      let processingComplete = false;
      
      pose.onResults((results: any) => {
        currentFrameResults = results;
        processingComplete = true;
      });

      // Process each frame with error handling
      const processFrame = async (currentTime: number): Promise<void> => {
        return new Promise((resolve, reject) => {
          currentFrameResults = null;
          processingComplete = false;
          
          video.currentTime = currentTime;
          
          const timeoutId = setTimeout(() => {
            console.warn(`Frame ${frameCount} timeout`);
            resolve(); // Don't reject, just skip this frame
          }, 10000); // 10 second timeout per frame (increased for 300 FPS)
          
          video.onseeked = async () => {
            try {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

              // Send frame to pose detection
              await pose.send({ image: canvas });
              
              // Wait for results with polling
              const startWait = Date.now();
              while (!processingComplete && Date.now() - startWait < 5000) {
                await new Promise(r => setTimeout(r, 10));
              }
              
              const results = currentFrameResults;
              
              if (results) {
                try {
                  clearTimeout(timeoutId);
                  
                  if (results.poseLandmarks) {
                    const keypoints: MediaPipeKeypoint[] = results.poseLandmarks.map(
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

                    // Player isolation (if enabled) - only every 10th frame to reduce memory usage
                    if (enablePlayerIsolation && frameCount % 10 === 0) {
                      try {
                        const segmentation = await segmentPlayer(canvas, keypoints);
                        // Store compressed mask data
                        isolatedPlayerFrames.push({
                          frame: frameCount,
                          mask: {
                            width: segmentation.mask.width,
                            height: segmentation.mask.height,
                            data: Array.from(segmentation.mask.data) // Convert to regular array to save memory
                          },
                          bbox: segmentation.bbox
                        });
                      } catch (error) {
                        console.warn('Player isolation failed for frame', frameCount, error);
                      }
                    }
                  }

                  frameCount++;
                  framesProcessedSinceLastUpdate++;
                  
                  // Update progress with detailed stats every 10 frames or every second
                  const now = Date.now();
                  if (frameCount % 10 === 0 || now - lastUpdateTime > 1000) {
                    const elapsedSeconds = (now - startTime) / 1000;
                    const framesPerSecond = frameCount / elapsedSeconds;
                    const remainingFrames = totalFrames - frameCount;
                    const etaSeconds = remainingFrames / framesPerSecond;
                    
                    setProgress((frameCount / totalFrames) * 100);
                    setStatus(
                      `Processing frame ${frameCount}/${totalFrames} ` +
                      `(${framesPerSecond.toFixed(1)} fps, ETA ${Math.ceil(etaSeconds)}s)`
                    );
                    
                    lastUpdateTime = now;
                    framesProcessedSinceLastUpdate = 0;
                  }
                  
                } catch (error) {
                  clearTimeout(timeoutId);
                  console.error('Error processing pose results:', error);
                }
              } else {
                console.warn(`Frame ${frameCount}: No pose detected`);
              }
              
              clearTimeout(timeoutId);
              resolve();
              
            } catch (error) {
              clearTimeout(timeoutId);
              console.error('Error in frame processing:', error);
              resolve(); // Don't reject, continue with next frame
            }
          };
          
          video.onerror = () => {
            clearTimeout(timeoutId);
            console.error('Video seek error at frame', frameCount);
            resolve(); // Don't reject, skip this frame
          };
        });
      };

      // Extract frames at regular intervals
      console.log(`Starting frame extraction: ${totalFrames} frames at ${fps} FPS`);
      for (let t = 0; t < video.duration; t += 1 / fps) {
        await processFrame(t);
      }

      console.log(`Extraction complete: ${extractedFrames.length} frames extracted`);
      
      // Cleanup: Close pose estimator
      pose.close();
      
      // Validate that we got at least some frames
      if (extractedFrames.length === 0) {
        throw new Error('No skeleton data extracted. The pose detector may not have found a person in the video.');
      }
      
      if (extractedFrames.length < totalFrames * 0.3) {
        toast.warning(`⚠️ Partial Detection`, {
          description: `Only ${extractedFrames.length} of ${totalFrames} frames had poses. Try better lighting or camera angle.`,
          duration: 5000
        });
      }

      setStatus('✅ Processing complete!');
      setSkeletonData(extractedFrames);
      setIsolatedFrames(isolatedPlayerFrames);
      
      // Call completion callback
      onComplete({
        skeletonData: extractedFrames,
        fps,
        isolatedFrames: enablePlayerIsolation ? isolatedPlayerFrames : undefined
      });

      const processingTime = Math.round((Date.now() - startTime) / 1000);
      toast.success(`✅ Skeleton Extracted`, {
        description: `${extractedFrames.length} frames in ${processingTime}s`,
        duration: 4000
      });

    } catch (error) {
      console.error('Skeleton extraction error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error details:', {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        videoDuration: video.duration,
        canvasSize: `${canvasRef.current?.width}x${canvasRef.current?.height}`
      });
      
      setStatus('❌ Extraction failed');
      
      // Provide more specific error messages with actionable solutions
      if (errorMessage.includes('memory')) {
        toast.error('❌ Browser Memory Full', {
          description: 'Try: 1) Shorten video to 5-10s, 2) Close other tabs, 3) Turn off Player Isolation',
          duration: 6000
        });
      } else if (errorMessage.includes('MediaPipe')) {
        toast.error('❌ Failed to Load Pose Detection', {
          description: 'Check your internet connection and try again',
          duration: 5000
        });
      } else if (errorMessage.includes('timeout')) {
        toast.error('❌ Processing Timeout', {
          description: 'Video too complex. Try: 1) Shorter video, 2) Lower FPS export from OnForm',
          duration: 6000
        });
      } else if (errorMessage.includes('No skeleton data extracted')) {
        toast.error('❌ No Person Detected', {
          description: 'Ensure player is clearly visible and well-lit throughout the video',
          duration: 5000
        });
      } else {
        toast.error('❌ Extraction Failed', {
          description: errorMessage.substring(0, 80) + (errorMessage.length > 80 ? '...' : ''),
          duration: 5000
        });
      }
      
      if (onError) {
        onError(error as Error);
      }
      
      // Show server fallback option for complex videos
      if (errorMessage.includes('memory') || errorMessage.includes('timeout')) {
        setShowServerFallback(true);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const requestServerProcessing = async () => {
    toast.info('🔄 Server Processing Not Yet Available', {
      description: 'For now, try: 1) Shorter video (5-10s), 2) Lower FPS export, 3) Disable Player Isolation',
      duration: 7000
    });
    
    // TODO: Implement server-side processing request
    // await fetch(`/api/videos/${videoId}/extract-skeleton-server`, {
    //   method: 'POST'
    // });
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          crossOrigin="anonymous"
          className="w-full h-auto"
          preload="metadata"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full opacity-0"
        />
      </div>

      {isProcessing && (
        <div className="space-y-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-[#F5A623]" />
              <span className="text-sm font-semibold text-[#F5A623]">Processing Swing</span>
            </div>
            <span className="text-lg font-mono font-bold text-white">
              {progress.toFixed(0)}%
            </span>
          </div>
          
          <Progress value={progress} className="h-3" />
          
          <div className="space-y-1.5">
            <div className="text-xs text-gray-300 font-medium">
              {status}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{enablePlayerIsolation ? '🎨 With Player Isolation' : '🦴 Skeleton Only'}</span>
              <span>Please wait...</span>
            </div>
          </div>
        </div>
      )}

      {!isProcessing && skeletonData.length === 0 && (
        <>
          {/* Tips Card */}
          <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
            <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Swing Analysis Tips
            </h4>
            <ul className="text-xs text-gray-300 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold">✓</span>
                <span>Best results with 60-120 FPS videos, 3-10 seconds long</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 font-bold">⚡</span>
                <span>High FPS videos (240-300 FPS) auto-downsampled for stability</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">⏱️</span>
                <span>Processing time: 30-90 seconds depending on video length</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F5A623] font-bold">💡</span>
                <span>Keep Player Isolation OFF for first attempt (faster)</span>
              </li>
            </ul>
          </div>

          {/* Server Fallback Option (shown after browser failure) */}
          {showServerFallback && (
            <div className="p-4 bg-orange-900/20 rounded-lg border border-orange-700/40">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <h4 className="text-sm font-semibold text-orange-400">
                    Browser Processing Failed
                  </h4>
                  <p className="text-xs text-gray-300">
                    This video is too complex for browser processing. Server-side processing is coming soon!
                  </p>
                  <p className="text-xs text-gray-400">
                    <strong>For now, try:</strong><br/>
                    1. Export shorter clip (5-10 seconds) from OnForm<br/>
                    2. Use lower FPS (60-120 FPS instead of 240-300 FPS)<br/>
                    3. Ensure player is centered and well-lit
                  </p>
                  <Button
                    onClick={() => setShowServerFallback(false)}
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs"
                  >
                    Got It - Try Again
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Player Isolation Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#F5A623]" />
              <div>
                <Label htmlFor="player-isolation" className="text-sm font-medium cursor-pointer">
                  Player Isolation (Experimental)
                </Label>
                <p className="text-xs text-gray-400 mt-0.5">
                  May slow down processing - recommended OFF
                </p>
              </div>
            </div>
            <Switch
              id="player-isolation"
              checked={enablePlayerIsolation}
              onCheckedChange={setEnablePlayerIsolation}
            />
          </div>

          <Button
            onClick={extractSkeleton}
            className="w-full bg-[#F5A623] hover:bg-[#E89815] text-white font-semibold"
          >
            Extract Skeleton Data {enablePlayerIsolation && '+ Isolate Player'}
          </Button>
        </>
      )}

      {skeletonData.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle2 className="w-5 h-5" />
            <span>Skeleton extracted: {skeletonData.length} frames</span>
          </div>
          {isolatedFrames.length > 0 && (
            <div className="flex items-center gap-2 text-[#F5A623] text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Player isolated: {isolatedFrames.length} frames</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
