'use client';

/**
 * Joint Overlay Video Player
 * 
 * Video player with joint overlay functionality.
 * Wraps the existing skeleton-overlay-player and adapts it to work with
 * the new standardized JointData format.
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { JointData, convertJointDataToMediaPipe } from '@/types/pose';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMediaPipePoseConnections } from '@/services/mediaPipePose';

interface JointOverlayVideoPlayerProps {
  videoUrl: string;
  jointData?: JointData | null;
  showOverlay?: boolean;
  impactFrame?: number | null;
}

const POSE_CONNECTIONS = getMediaPipePoseConnections();

export function JointOverlayVideoPlayer({
  videoUrl,
  jointData,
  showOverlay = false,
  impactFrame
}: JointOverlayVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [overlayVisible, setOverlayVisible] = useState(showOverlay);

  const fps = 30; // Standard FPS for joint data

  // Sync overlay visibility with prop
  useEffect(() => {
    setOverlayVisible(showOverlay);
  }, [showOverlay]);

  /**
   * Draw joints on canvas
   */
  const drawJoints = useCallback((
    ctx: CanvasRenderingContext2D,
    joints: any[],
    color: string = '#FBBF24' // Yellow
  ) => {
    if (!joints || joints.length === 0) return;

    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    // Draw connections (lines between joints)
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const start = joints[startIdx];
      const end = joints[endIdx];

      if (!start || !end || start.confidence < 0.5 || end.confidence < 0.5) {
        return;
      }

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    });

    // Draw keypoints (joints)
    ctx.fillStyle = color;
    joints.forEach((joint) => {
      if (!joint || joint.confidence < 0.5) return;

      // Outer circle
      ctx.beginPath();
      ctx.arc(joint.x, joint.y, 6, 0, 2 * Math.PI);
      ctx.fill();

      // Inner circle for visibility
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(joint.x, joint.y, 3, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = color;
    });
  }, []);

  /**
   * Render current frame with overlay
   */
  const renderFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw joint overlay if enabled and data exists
    if (overlayVisible && jointData && jointData.length > 0) {
      // Find frame closest to current time
      const currentJointFrame = jointData.find(frame => 
        Math.abs(frame.timestamp - currentTime) < 0.05 // 50ms tolerance
      ) || jointData.reduce((prev, curr) => 
        Math.abs(curr.timestamp - currentTime) < Math.abs(prev.timestamp - currentTime) ? curr : prev
      );

      if (currentJointFrame && currentJointFrame.joints) {
        drawJoints(ctx, currentJointFrame.joints);
      }
    }

    // Draw impact marker
    if (impactFrame !== null && currentFrame === impactFrame) {
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 5]);
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
      ctx.setLineDash([]);

      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('⚾ IMPACT', canvas.width / 2 - 50, 40);
    }
  }, [currentTime, currentFrame, overlayVisible, jointData, impactFrame, drawJoints]);

  /**
   * Handle video time updates
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setCurrentFrame(Math.floor(video.currentTime * fps));
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);

      // Set canvas size to match video
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [fps]);

  /**
   * Render frame whenever time or overlay state changes
   */
  useEffect(() => {
    renderFrame();
  }, [renderFrame]);

  /**
   * Playback controls
   */
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const skipFrames = (frames: number) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = Math.max(0, Math.min(duration, currentTime + (frames / fps)));
    video.currentTime = newTime;
  };

  return (
    <div className="space-y-4">
      {/* Video and Canvas Container */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        <video
          ref={videoRef}
          src={videoUrl}
          className="absolute top-0 left-0 w-full h-full object-contain opacity-0"
          crossOrigin="anonymous"
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
        />
        
        {/* Overlay indicator */}
        {overlayVisible && jointData && (
          <div className="absolute top-3 right-3 bg-black/60 px-3 py-1 rounded-full text-xs text-yellow-400 flex items-center gap-2">
            <Eye className="w-3 h-3" />
            <span>Joint Overlay Active</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-3">
        {/* Timeline */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 font-mono min-w-[45px]">
            {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
          </span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1 / fps}
            onValueChange={handleSeek}
            className="flex-1"
          />
          <span className="text-sm text-gray-400 font-mono min-w-[45px]">
            {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
          </span>
        </div>

        {/* Frame Info */}
        <div className="text-xs text-gray-500 text-center font-mono">
          Frame {currentFrame} {impactFrame && currentFrame === impactFrame ? '⚾ IMPACT' : ''}
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => skipFrames(-5)}
            className="h-10 w-10"
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button
            size="icon"
            variant="default"
            onClick={togglePlayPause}
            className="h-12 w-12 bg-barrels-gold hover:bg-barrels-gold-light text-barrels-black"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </Button>

          <Button
            size="icon"
            variant="outline"
            onClick={() => skipFrames(5)}
            className="h-10 w-10"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Overlay Toggle */}
        {jointData && (
          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant={overlayVisible ? 'default' : 'outline'}
              onClick={() => setOverlayVisible(!overlayVisible)}
              className={cn(
                overlayVisible && 'bg-yellow-600 hover:bg-yellow-700'
              )}
            >
              {overlayVisible ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
              {overlayVisible ? 'Hide' : 'Show'} Joints
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
