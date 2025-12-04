
'use client';

/**
 * Joint-Only Overlay Comparison (v1)
 * 
 * Simple, stable skeleton comparison without video-on-video overlay.
 * - Compares two SwingJointSeries (reference vs current)
 * - Scales both to same virtual height
 * - Syncs by impact frame
 * - Basic playback controls
 * - Camera angle validation
 * 
 * NO video overlay complexity = NO crashes!
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { 
  Play, Pause, SkipBack, SkipForward, AlertCircle, 
  Eye, EyeOff, RotateCcw, Info
} from 'lucide-react';
import { SwingJointSeries, Joint2D } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface JointOverlayCompareProps {
  referenceSwing: SwingJointSeries | null;
  currentSwing: SwingJointSeries | null;
  videoUrl?: string; // Optional: show faint video in background
  className?: string;
}

// MediaPipe Pose 33 keypoint indices
const POSE_CONNECTIONS = [
  [11, 12], // shoulders
  [11, 13], [13, 15], // left arm
  [12, 14], [14, 16], // right arm
  [11, 23], [12, 24], // torso
  [23, 24], // hips
  [23, 25], [25, 27], [27, 29], [29, 31], // left leg
  [24, 26], [26, 28], [28, 30], [30, 32], // right leg
];

export function JointOverlayCompare({
  referenceSwing,
  currentSwing,
  videoUrl,
  className
}: JointOverlayCompareProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  
  // Visibility toggles
  const [showReference, setShowReference] = useState(true);
  const [showCurrent, setShowCurrent] = useState(true);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  /**
   * Validation: Check if both swings are compatible
   */
  useEffect(() => {
    setError(null);
    
    if (!referenceSwing && !currentSwing) {
      setError('No swing data available. Please extract skeleton data first.');
      return;
    }
    
    if (!referenceSwing) {
      setError('Reference swing not selected. Please choose a comparison swing.');
      return;
    }
    
    if (!currentSwing) {
      setError('Current swing data missing.');
      return;
    }
    
    // Critical: Camera angles must match
    if (referenceSwing.cameraAngle !== currentSwing.cameraAngle) {
      setError(
        `Camera angle mismatch: Reference is "${referenceSwing.cameraAngle}", ` +
        `but current is "${currentSwing.cameraAngle}". Overlay only works when ` +
        `both swings are recorded from the same camera angle.`
      );
      return;
    }
    
    // Check for low confidence data
    if (!referenceSwing.frames || referenceSwing.frames.length === 0) {
      setError('Reference swing has no joint data.');
      return;
    }
    
    if (!currentSwing.frames || currentSwing.frames.length === 0) {
      setError('Current swing has no joint data.');
      return;
    }
    
    // All good!
    const maxFrames = Math.max(referenceSwing.frames.length, currentSwing.frames.length);
    setTotalFrames(maxFrames);
    
  }, [referenceSwing, currentSwing]);

  /**
   * Normalize joint positions to 0-1 range (if not already)
   */
  const normalizeJoints = useCallback((joints: Joint2D[], width: number, height: number): Joint2D[] => {
    return joints.map(joint => ({
      ...joint,
      x: joint.x > 1 ? joint.x / width : joint.x,
      y: joint.y > 1 ? joint.y / height : joint.y,
    }));
  }, []);

  /**
   * Draw skeleton on canvas
   */
  const drawSkeleton = useCallback((
    ctx: CanvasRenderingContext2D,
    joints: Joint2D[],
    color: string,
    canvasWidth: number,
    canvasHeight: number,
    scale: number = 1.0
  ) => {
    if (!joints || joints.length === 0) return;

    // Normalize joints if needed
    const normalized = normalizeJoints(joints, canvasWidth, canvasHeight);

    // Draw connections (lines between joints)
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const start = normalized[startIdx];
      const end = normalized[endIdx];

      if (!start || !end) return;
      if (start.confidence !== undefined && start.confidence < 0.5) return;
      if (end.confidence !== undefined && end.confidence < 0.5) return;

      ctx.beginPath();
      ctx.moveTo(start.x * canvasWidth * scale, start.y * canvasHeight * scale);
      ctx.lineTo(end.x * canvasWidth * scale, end.y * canvasHeight * scale);
      ctx.stroke();
    });

    // Draw keypoints (joints)
    ctx.fillStyle = color;
    normalized.forEach((joint) => {
      if (!joint) return;
      if (joint.confidence !== undefined && joint.confidence < 0.5) return;

      ctx.beginPath();
      ctx.arc(
        joint.x * canvasWidth * scale,
        joint.y * canvasHeight * scale,
        5,
        0,
        2 * Math.PI
      );
      ctx.fill();
      
      // Draw inner dot for visibility
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(
        joint.x * canvasWidth * scale,
        joint.y * canvasHeight * scale,
        2,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.fillStyle = color;
    });
  }, [normalizeJoints]);

  /**
   * Render current frame
   */
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#1a2332'; // Dark background
    ctx.fillRect(0, 0, width, height);

    // Draw faint video frame if provided
    if (videoRef.current && videoUrl) {
      ctx.globalAlpha = 0.2;
      ctx.drawImage(videoRef.current, 0, 0, width, height);
      ctx.globalAlpha = 1.0;
    }

    // Get joint data for current frame (synced by impact)
    const refFrame = referenceSwing?.frames?.[currentFrame];
    const curFrame = currentSwing?.frames?.[currentFrame];

    // Draw reference skeleton (gray)
    if (showReference && refFrame) {
      drawSkeleton(ctx, refFrame.joints, '#9CA3AF', width, height);
    }

    // Draw current skeleton (blue)
    if (showCurrent && curFrame) {
      drawSkeleton(ctx, curFrame.joints, '#3B82F6', width, height);
    }

    // Draw impact frame indicator
    const impactFrame = currentSwing?.impactFrame ?? referenceSwing?.impactFrame;
    if (impactFrame !== undefined && currentFrame === impactFrame) {
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, width, height);
      
      ctx.fillStyle = '#EF4444';
      ctx.font = '16px sans-serif';
      ctx.fillText('IMPACT', 10, 30);
    }

    // Draw frame counter
    ctx.fillStyle = '#F5A623';
    ctx.font = '14px monospace';
    ctx.fillText(`Frame ${currentFrame + 1} / ${totalFrames}`, 10, height - 10);

  }, [currentFrame, referenceSwing, currentSwing, showReference, showCurrent, videoUrl, totalFrames, drawSkeleton]);

  /**
   * Resize canvas to match video dimensions
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size (16:9 aspect ratio)
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientWidth * (9 / 16);
    }

    renderFrame();
  }, [renderFrame]);

  /**
   * Playback loop
   */
  useEffect(() => {
    if (!isPlaying || error) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        if (prev >= totalFrames - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / 60); // 60 FPS playback

    return () => clearInterval(interval);
  }, [isPlaying, totalFrames, error]);

  /**
   * Re-render when frame changes
   */
  useEffect(() => {
    renderFrame();
  }, [currentFrame, renderFrame]);

  /**
   * Error state UI
   */
  if (error) {
    return (
      <Card className={cn("bg-gray-900 border-gray-700 p-6", className)}>
        <div className="flex items-start gap-3 text-yellow-400">
          <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold mb-2">Cannot Compare Swings</h3>
            <p className="text-sm text-gray-300">{error}</p>
            {error.includes('angle') && (
              <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded text-sm text-blue-300">
                <Info className="w-4 h-4 inline mr-2" />
                <strong>Tip:</strong> For accurate comparison, record both swings from the same camera angle (e.g., both from the side).
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Legend */}
      <Card className="bg-gray-900/50 border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-400"></div>
              <span className="text-sm text-gray-300">Reference Swing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-300">Your Swing Today</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="show-reference"
                checked={showReference}
                onCheckedChange={setShowReference}
              />
              <Label htmlFor="show-reference" className="text-sm cursor-pointer">
                Reference
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="show-current"
                checked={showCurrent}
                onCheckedChange={setShowCurrent}
              />
              <Label htmlFor="show-current" className="text-sm cursor-pointer">
                Current
              </Label>
            </div>
          </div>
        </div>
      </Card>

      {/* Canvas */}
      <div className="relative bg-[#1a2332] rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-auto"
        />
        
        {/* Hidden video for optional background */}
        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            className="hidden"
            muted
            playsInline
          />
        )}
      </div>

      {/* Controls */}
      <Card className="bg-gray-900/50 border-gray-700 p-4">
        <div className="space-y-4">
          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentFrame(0)}
              disabled={currentFrame === 0}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))}
              disabled={currentFrame === 0}
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-[#F5A623] hover:bg-[#E89815]"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentFrame(Math.min(totalFrames - 1, currentFrame + 1))}
              disabled={currentFrame >= totalFrames - 1}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Scrub Slider */}
          <div className="px-2">
            <Slider
              value={[currentFrame]}
              onValueChange={(value) => setCurrentFrame(value[0])}
              min={0}
              max={totalFrames - 1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Frame Info */}
          <div className="text-center text-xs text-gray-400">
            Frame {currentFrame + 1} of {totalFrames} 
            {currentSwing?.impactFrame !== undefined && currentFrame === currentSwing.impactFrame && (
              <span className="ml-2 text-red-400 font-semibold">• IMPACT</span>
            )}
          </div>
        </div>
      </Card>

      {/* Tips */}
      <Card className="bg-gray-800/30 border-gray-700 p-4">
        <h4 className="text-white text-sm font-semibold mb-2">Analysis Tips:</h4>
        <ul className="text-gray-400 text-sm space-y-1">
          <li>• Use frame-by-frame controls to examine specific positions</li>
          <li>• Toggle reference/current visibility to isolate movements</li>
          <li>• Watch for differences in joint angles at impact (red border)</li>
          <li>• Compare hip and shoulder rotation timing</li>
        </ul>
      </Card>
    </div>
  );
}
