"use client";

import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AutoSkeletonExtractorProps {
  videoId: string;
  videoUrl: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export function AutoSkeletonExtractor({
  videoId,
  videoUrl,
  onComplete,
  onError,
}: AutoSkeletonExtractorProps) {
  const [status, setStatus] = useState<'checking' | 'extracting' | 'processing' | 'complete' | 'error'>('checking');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Checking skeleton data...');
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    checkAndExtract();
  }, [videoId]);

  async function checkAndExtract() {
    try {
      // Check if skeleton data already exists
      const checkResponse = await fetch(`/api/videos/${videoId}/process-skeleton`);
      
      if (!checkResponse.ok) {
        throw new Error('Failed to check skeleton status');
      }

      const videoData = await checkResponse.json();
      
      // If skeleton already extracted, we're done
      if (videoData.skeletonExtracted && videoData.skeletonData) {
        console.log('[AutoSkeleton] Skeleton data already exists, skipping extraction');
        setStatus('complete');
        setMessage('Skeleton data ready');
        setProgress(100);
        onComplete?.();
        return;
      }

      // Start extraction
      console.log('[AutoSkeleton] Starting skeleton extraction...');
      setStatus('extracting');
      setMessage('Extracting skeleton data from video...');
      
      await runSkeletonExtraction();
      
    } catch (error) {
      console.error('[AutoSkeleton] Error:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Extraction failed');
      onError?.(error instanceof Error ? error.message : 'Unknown error');
      toast.error('Skeleton extraction failed', {
        description: 'The system couldn\'t analyze this swing automatically.',
      });
    }
  }

  async function runSkeletonExtraction() {
    // This is where we'd integrate with MediaPipe
    // For now, we'll use a simplified approach that calls the extraction API
    
    try {
      console.log('[AutoSkeleton] Starting extraction for video:', videoId);
      
      // Import MediaPipe dynamically
      setProgress(5);
      setMessage('Loading AI models...');
      
      let Pose;
      try {
        const mediapipe = await import('@mediapipe/pose');
        Pose = mediapipe.Pose;
        console.log('[AutoSkeleton] MediaPipe loaded successfully');
      } catch (error) {
        console.error('[AutoSkeleton] Failed to load MediaPipe:', error);
        throw new Error('Failed to load AI models. Please refresh the page and try again.');
      }
      
      setProgress(10);
      
      // Initialize MediaPipe Pose
      console.log('[AutoSkeleton] Initializing pose detection...');
      const pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        },
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      setProgress(20);
      setMessage('Loading video...');

      // Create video element
      console.log('[AutoSkeleton] Creating video element from URL:', videoUrl);
      const video = document.createElement('video');
      video.src = videoUrl;
      video.crossOrigin = 'anonymous';
      video.muted = true;

      await new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          console.log('[AutoSkeleton] Video metadata loaded:', {
            duration: video.duration,
            width: video.videoWidth,
            height: video.videoHeight
          });
          resolve(null);
        };
        video.onerror = (e) => {
          console.error('[AutoSkeleton] Video load error:', e);
          reject(new Error('Failed to load video. Please check the video format and try again.'));
        };
        
        // Add timeout
        setTimeout(() => reject(new Error('Video loading timed out after 30 seconds')), 30000);
      });

      // Validate video duration
      if (!video.duration || video.duration <= 0) {
        throw new Error('Invalid video duration. The video may be corrupted.');
      }

      if (video.duration > 60) {
        throw new Error('Video is too long. Please use videos under 60 seconds for optimal performance.');
      }

      const fps = 30; // Use 30 FPS for all extractions
      const totalFrames = Math.floor(video.duration * fps);
      const frameInterval = 1 / fps;
      
      console.log('[AutoSkeleton] Starting frame extraction:', {
        fps,
        totalFrames,
        duration: video.duration
      });
      
      setProgress(30);
      setMessage(`Analyzing ${totalFrames} frames...`);

      const skeletonFrames: any[] = [];
      let currentFrame = 0;
      let framesWithPose = 0;

      // Process frames
      for (let time = 0; time < video.duration; time += frameInterval) {
        try {
          video.currentTime = time;
          
          await new Promise((resolve, reject) => {
            video.onseeked = resolve;
            setTimeout(() => reject(new Error('Frame seek timeout')), 5000);
          });

          // Create canvas for frame
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Failed to create canvas context');
          }
          ctx.drawImage(video, 0, 0);

          // Get landmarks from MediaPipe
          const results = await new Promise<any>((resolve, reject) => {
            let resolved = false;
            pose.onResults((results) => {
              if (!resolved) {
                resolved = true;
                resolve(results);
              }
            });
            pose.send({ image: canvas }).catch(reject);
            
            // Timeout for pose detection
            setTimeout(() => {
              if (!resolved) {
                resolved = true;
                reject(new Error('Pose detection timeout'));
              }
            }, 5000);
          });

          if (results.poseLandmarks) {
            skeletonFrames.push({
              frameIndex: currentFrame,
              timestamp: time,
              keypoints: results.poseLandmarks.map((landmark: any, index: number) => ({
                x: landmark.x,
                y: landmark.y,
                z: landmark.z,
                visibility: landmark.visibility,
                name: index, // MediaPipe index
              })),
            });
            framesWithPose++;
          }

          currentFrame++;
          const progress = 30 + Math.floor((currentFrame / totalFrames) * 50);
          setProgress(progress);
          setMessage(`Processing frame ${currentFrame}/${totalFrames}... (${framesWithPose} poses detected)`);
        } catch (frameError) {
          console.warn('[AutoSkeleton] Frame processing error:', frameError);
          // Continue processing even if some frames fail
        }
      }

      console.log('[AutoSkeleton] Frame extraction complete:', {
        totalFrames: currentFrame,
        framesWithPose,
        coverage: `${Math.round((framesWithPose / currentFrame) * 100)}%`
      });

      pose.close();

      if (skeletonFrames.length === 0) {
        throw new Error('No skeleton data could be extracted. Please ensure the video shows a clear view of the player.');
      }

      if (framesWithPose < totalFrames * 0.5) {
        console.warn('[AutoSkeleton] Low pose detection rate:', framesWithPose / totalFrames);
      }

      setProgress(85);
      setMessage('Saving skeleton data...');

      console.log('[AutoSkeleton] Sending skeleton data to server...');
      
      // Send to server for processing
      const processResponse = await fetch(`/api/videos/${videoId}/process-skeleton`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skeletonData: skeletonFrames,
          fps,
        }),
      });

      if (!processResponse.ok) {
        const errorData = await processResponse.json();
        console.error('[AutoSkeleton] Server processing error:', errorData);
        throw new Error(errorData.details || errorData.message || 'Failed to process skeleton data on server');
      }

      const processResult = await processResponse.json();
      console.log('[AutoSkeleton] Server processing successful:', processResult);

      setProgress(95);
      setMessage('Running swing analysis...');

      console.log('[AutoSkeleton] Triggering swing analysis...');
      
      // Trigger scoring
      const analyzeResponse = await fetch(`/api/videos/${videoId}/analyze`, {
        method: 'POST',
      });

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json();
        console.error('[AutoSkeleton] Analysis error:', errorData);
        // Don't fail here - skeleton is already saved
        console.warn('[AutoSkeleton] Analysis failed but skeleton data is saved');
      } else {
        console.log('[AutoSkeleton] Analysis complete');
      }

      setProgress(100);
      setStatus('complete');
      setMessage('Analysis complete!');
      onComplete?.();
      
      toast.success('Swing analysis complete', {
        description: 'Your 4Bs metrics are now available.',
        duration: 5000,
      });

    } catch (error) {
      console.error('[AutoSkeleton] Extraction error:', error);
      throw error;
    }
  }

  // Don't show anything when complete
  if (status === 'complete') {
    return null;
  }

  // Show extraction progress or error
  const isError = status === 'error';
  const isRunning = status !== 'error';

  return (
    <Card className="p-6 mb-4 bg-gray-800/50 border-gray-700">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {isError ? (
            <AlertCircle className="w-8 h-8 text-red-500" />
          ) : (
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          )}
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {isError ? 'Extraction Failed' : 'Analyzing Swing...'}
            </h3>
            <p className="text-sm text-gray-400 mt-1">{message}</p>
          </div>
          
          {isRunning && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-gray-500">{progress}% complete</p>
            </div>
          )}
          
          {isError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400 mb-2">
                {message}
              </p>
              <div className="text-xs text-gray-400 space-y-1">
                <p><strong>Common solutions:</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Refresh the page and try again</li>
                  <li>Ensure the video is under 60 seconds</li>
                  <li>Check that the player is clearly visible in the video</li>
                  <li>Try uploading a different video</li>
                </ul>
                <p className="mt-2 text-xs text-gray-500">
                  Browser console may have more details. Press F12 to view.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
