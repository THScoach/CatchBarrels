
'use client';

/**
 * Skeleton Overlay Video Player
 * - Synchronized skeleton rendering (green = model, yellow = player)
 * - Frame-by-frame playback with skeleton tracking
 * - Toggle model/player visibility
 * - Side-by-side or overlay comparison modes
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Play, Pause, SkipBack, SkipForward, Eye, EyeOff,
  Layers, SplitSquareHorizontal, Sparkles, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { analyzeSwingBiomechanics, compareSwings } from '@/lib/biomechanical-analysis';

interface SkeletonData {
  frame: number;
  timestamp: number;
  keypoints: Array<{
    x: number;
    y: number;
    z: number;
    visibility: number;
    name: string;
  }>;
}

interface IsolatedFrame {
  frame: number;
  mask: {
    width: number;
    height: number;
    data: Uint8ClampedArray;
  };
  bbox: { x: number; y: number; width: number; height: number };
}

interface SkeletonOverlayPlayerProps {
  videoUrl: string;
  playerSkeleton?: SkeletonData[] | null;
  modelSkeleton?: SkeletonData[] | null;
  playerIsolation?: IsolatedFrame[] | null;
  modelIsolation?: IsolatedFrame[] | null;
  impactFrame?: number | null;
  onTimeUpdate?: (currentTime: number, currentFrame: number) => void;
}

// MediaPipe Pose connections (which joints to connect with lines)
const POSE_CONNECTIONS = [
  [11, 12], // shoulders
  [11, 13], [13, 15], // left arm
  [12, 14], [14, 16], // right arm
  [11, 23], [12, 24], // torso
  [23, 24], // hips
  [23, 25], [25, 27], [27, 29], [29, 31], // left leg
  [24, 26], [26, 28], [28, 30], [30, 32], // right leg
];

export function SkeletonOverlayPlayer({
  videoUrl,
  playerSkeleton,
  modelSkeleton,
  playerIsolation,
  modelIsolation,
  impactFrame = 0,
  onTimeUpdate
}: SkeletonOverlayPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  
  // Visibility toggles
  const [showPlayerSkeleton, setShowPlayerSkeleton] = useState(true);
  const [showModelSkeleton, setShowModelSkeleton] = useState(true);
  const [showIsolation, setShowIsolation] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  
  // Display modes
  const [viewMode, setViewMode] = useState<'overlay' | 'side-by-side'>('overlay');
  
  // Frame rate (120 FPS normalized)
  const fps = 120;
  
  // Biomechanical metrics
  const [currentMetrics, setCurrentMetrics] = useState<any>(null);
  
  // Check if isolation data is available
  const hasIsolation = (playerIsolation && playerIsolation.length > 0) || 
                       (modelIsolation && modelIsolation.length > 0);

  /**
   * Apply isolation mask to canvas
   */
  const applyIsolationMask = useCallback((
    ctx: CanvasRenderingContext2D,
    mask: Uint8ClampedArray,
    width: number,
    height: number,
    darkBackground: boolean = true
  ) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Apply mask to alpha channel
    for (let i = 0; i < mask.length; i++) {
      if (darkBackground) {
        // Darken background, keep foreground
        if (mask[i] === 0) {
          data[i * 4 + 3] = 50; // Semi-transparent background
        }
      } else {
        // Transparent background, keep foreground
        data[i * 4 + 3] = mask[i];
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }, []);

  /**
   * Draw skeleton on canvas
   */
  const drawSkeleton = useCallback((
    ctx: CanvasRenderingContext2D,
    keypoints: any[],
    color: string,
    offsetX: number = 0,
    offsetY: number = 0,
    scale: number = 1
  ) => {
    if (!keypoints || keypoints.length === 0) return;

    // Draw connections (lines between joints)
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const start = keypoints[startIdx];
      const end = keypoints[endIdx];

      if (!start || !end || start.visibility < 0.5 || end.visibility < 0.5) {
        return;
      }

      ctx.beginPath();
      ctx.moveTo(
        offsetX + start.x * scale,
        offsetY + start.y * scale
      );
      ctx.lineTo(
        offsetX + end.x * scale,
        offsetY + end.y * scale
      );
      ctx.stroke();
    });

    // Draw keypoints (joints)
    ctx.fillStyle = color;
    keypoints.forEach((kp) => {
      if (!kp || kp.visibility < 0.5) return;

      ctx.beginPath();
      ctx.arc(
        offsetX + kp.x * scale,
        offsetY + kp.y * scale,
        6,
        0,
        2 * Math.PI
      );
      ctx.fill();
      
      // Draw inner circle for better visibility
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(
        offsetX + kp.x * scale,
        offsetY + kp.y * scale,
        3,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.fillStyle = color;
    });
  }, []);

  /**
   * Render frame - draw video and skeletons
   * OPTIMIZED: Uses requestAnimationFrame for smooth rendering
   */
  const renderFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const frame = Math.floor(currentTime * fps);

    if (viewMode === 'overlay') {
      // Overlay mode: draw video once, both skeletons on top
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Apply player isolation if enabled
      if (showIsolation && playerIsolation) {
        const isolationFrame = playerIsolation.find(f => f.frame === frame);
        if (isolationFrame) {
          applyIsolationMask(ctx, isolationFrame.mask.data, canvas.width, canvas.height, true);
        }
      }

      // Draw model skeleton (GREEN)
      if (showModelSkeleton && modelSkeleton) {
        const modelFrame = modelSkeleton.find(f => f.frame === frame);
        if (modelFrame) {
          drawSkeleton(ctx, modelFrame.keypoints, '#10B981', 0, 0, 1); // Green
        }
      }

      // Draw player skeleton (YELLOW)
      if (showPlayerSkeleton && playerSkeleton) {
        const playerFrame = playerSkeleton.find(f => f.frame === frame);
        if (playerFrame) {
          drawSkeleton(ctx, playerFrame.keypoints, '#FBBF24', 0, 0, 1); // Yellow
        }
      }

    } else {
      // Side-by-side mode
      const halfWidth = canvas.width / 2;

      // Left side: Model skeleton
      if (showModelSkeleton && modelSkeleton) {
        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, halfWidth, canvas.height);
        const modelFrame = modelSkeleton.find(f => f.frame === frame);
        if (modelFrame) {
          drawSkeleton(ctx, modelFrame.keypoints, '#10B981', 0, 0, 0.5); // Scale down for half view
        }
        
        // Label
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(10, 10, 100, 30);
        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('MODEL', 20, 32);
      }

      // Right side: Player skeleton
      if (showPlayerSkeleton && playerSkeleton) {
        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, halfWidth, 0, halfWidth, canvas.height);
        const playerFrame = playerSkeleton.find(f => f.frame === frame);
        if (playerFrame) {
          drawSkeleton(ctx, playerFrame.keypoints, '#FBBF24', halfWidth, 0, 0.5); // Scale down for half view
        }
        
        // Label
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(halfWidth + 10, 10, 100, 30);
        ctx.fillStyle = '#FBBF24';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('PLAYER', halfWidth + 20, 32);
      }

      // Divider line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(halfWidth, 0);
      ctx.lineTo(halfWidth, canvas.height);
      ctx.stroke();
    }

    // Draw impact marker
    if (frame === impactFrame) {
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 5]);
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
      ctx.setLineDash([]);
      
      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('⚾ IMPACT', canvas.width / 2 - 50, 40);
    }

  }, [currentTime, fps, viewMode, showPlayerSkeleton, showModelSkeleton, showIsolation, playerSkeleton, modelSkeleton, playerIsolation, modelIsolation, impactFrame, drawSkeleton, applyIsolationMask]);

  /**
   * Handle video time updates
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      const frame = Math.floor(video.currentTime * fps);
      setCurrentFrame(frame);
      
      if (onTimeUpdate) {
        onTimeUpdate(video.currentTime, frame);
      }
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
  }, [fps, onTimeUpdate]);

  /**
   * Render skeleton overlay whenever time changes
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
      </div>

      {/* Controls */}
      <div className="space-y-3">
        {/* Timeline */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 font-mono">
            {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
          </span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1 / fps}
            onValueChange={handleSeek}
            className="flex-1"
          />
          <span className="text-sm text-gray-400 font-mono">
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
            className="h-12 w-12 bg-[#F5A623] hover:bg-[#E89815]"
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

        {/* Skeleton Visibility & View Mode Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={showModelSkeleton ? 'default' : 'outline'}
                onClick={() => setShowModelSkeleton(!showModelSkeleton)}
                className={cn(
                  showModelSkeleton && 'bg-green-600 hover:bg-green-700'
                )}
              >
                {showModelSkeleton ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
                Model
              </Button>

              <Button
                size="sm"
                variant={showPlayerSkeleton ? 'default' : 'outline'}
                onClick={() => setShowPlayerSkeleton(!showPlayerSkeleton)}
                className={cn(
                  showPlayerSkeleton && 'bg-yellow-600 hover:bg-yellow-700'
                )}
              >
                {showPlayerSkeleton ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
                Player
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant={viewMode === 'overlay' ? 'default' : 'outline'}
                onClick={() => setViewMode('overlay')}
                className={cn(
                  viewMode === 'overlay' && 'bg-[#F5A623] hover:bg-[#E89815]'
                )}
              >
                <Layers className="w-4 h-4 mr-1" />
                Overlay
              </Button>

              <Button
                size="sm"
                variant={viewMode === 'side-by-side' ? 'default' : 'outline'}
                onClick={() => setViewMode('side-by-side')}
                className={cn(
                  viewMode === 'side-by-side' && 'bg-[#F5A623] hover:bg-[#E89815]'
                )}
              >
                <SplitSquareHorizontal className="w-4 h-4 mr-1" />
                Side-by-Side
              </Button>
            </div>
          </div>

          {/* Player Isolation Toggle */}
          {hasIsolation && (
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F5A623]" />
                <Label htmlFor="show-isolation" className="text-sm cursor-pointer">
                  Player Isolation
                </Label>
              </div>
              <Switch
                id="show-isolation"
                checked={showIsolation}
                onCheckedChange={setShowIsolation}
              />
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full" />
          <span className="text-gray-400">Model Swing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded-full" />
          <span className="text-gray-400">Your Swing</span>
        </div>
      </div>

      {/* Biomechanical Metrics Panel */}
      {playerSkeleton && modelSkeleton && impactFrame && (
        <div className="space-y-3">
          <Button
            size="sm"
            variant={showMetrics ? 'default' : 'outline'}
            onClick={() => {
              if (!showMetrics && !currentMetrics) {
                // Calculate metrics once when first opened
                const playerAnalysis = analyzeSwingBiomechanics(playerSkeleton, impactFrame, 'right');
                const modelAnalysis = analyzeSwingBiomechanics(modelSkeleton, impactFrame, 'right');
                const comparison = compareSwings(playerAnalysis, modelAnalysis);
                
                setCurrentMetrics({
                  player: playerAnalysis,
                  model: modelAnalysis,
                  comparison
                });
              }
              setShowMetrics(!showMetrics);
            }}
            className={cn(
              'w-full',
              showMetrics && 'bg-[#F5A623] hover:bg-[#E89815]'
            )}
          >
            <Activity className="w-4 h-4 mr-2" />
            {showMetrics ? 'Hide' : 'Show'} Swing Metrics
          </Button>

          {showMetrics && currentMetrics && (
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 space-y-3">
              <h4 className="text-sm font-semibold text-[#F5A623] flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Biomechanical Analysis
              </h4>

              {/* Bat Speed */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Bat Speed</span>
                  <span className={cn(
                    'font-semibold',
                    currentMetrics.comparison.batSpeedDiff >= 0 ? 'text-green-400' : 'text-orange-400'
                  )}>
                    {currentMetrics.comparison.batSpeedDiff >= 0 ? '+' : ''}
                    {currentMetrics.comparison.batSpeedDiff.toFixed(1)} px/s
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 text-xs text-center p-2 bg-yellow-900/20 rounded border border-yellow-700/30">
                    <div className="text-yellow-400">You</div>
                    <div className="font-mono">{currentMetrics.player.batSpeed.batSpeed.toFixed(1)}</div>
                  </div>
                  <div className="flex-1 text-xs text-center p-2 bg-green-900/20 rounded border border-green-700/30">
                    <div className="text-green-400">Model</div>
                    <div className="font-mono">{currentMetrics.model.batSpeed.batSpeed.toFixed(1)}</div>
                  </div>
                </div>
              </div>

              {/* Hip Rotation */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Hip Rotation</span>
                  <span className={cn(
                    'font-semibold',
                    Math.abs(currentMetrics.comparison.hipRotationDiff) < 10 ? 'text-green-400' : 'text-orange-400'
                  )}>
                    {currentMetrics.comparison.hipRotationDiff >= 0 ? '+' : ''}
                    {currentMetrics.comparison.hipRotationDiff.toFixed(1)}°
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 text-xs text-center p-2 bg-yellow-900/20 rounded border border-yellow-700/30">
                    <div className="text-yellow-400">You</div>
                    <div className="font-mono">{currentMetrics.player.hipRotation.rotationAngle.toFixed(1)}°</div>
                  </div>
                  <div className="flex-1 text-xs text-center p-2 bg-green-900/20 rounded border border-green-700/30">
                    <div className="text-green-400">Model</div>
                    <div className="font-mono">{currentMetrics.model.hipRotation.rotationAngle.toFixed(1)}°</div>
                  </div>
                </div>
              </div>

              {/* Front Knee Angle */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Front Knee Angle</span>
                  <span className={cn(
                    'font-semibold',
                    Math.abs(currentMetrics.comparison.frontKneeDiff) < 15 ? 'text-green-400' : 'text-orange-400'
                  )}>
                    {currentMetrics.comparison.frontKneeDiff >= 0 ? '+' : ''}
                    {currentMetrics.comparison.frontKneeDiff.toFixed(1)}°
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 text-xs text-center p-2 bg-yellow-900/20 rounded border border-yellow-700/30">
                    <div className="text-yellow-400">You</div>
                    <div className="font-mono">{currentMetrics.player.frontKneeAngle.toFixed(1)}°</div>
                  </div>
                  <div className="flex-1 text-xs text-center p-2 bg-green-900/20 rounded border border-green-700/30">
                    <div className="text-green-400">Model</div>
                    <div className="font-mono">{currentMetrics.model.frontKneeAngle.toFixed(1)}°</div>
                  </div>
                </div>
              </div>

              {/* Elbow Angles */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Lead Elbow / Rear Elbow</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 text-xs text-center p-2 bg-yellow-900/20 rounded border border-yellow-700/30">
                    <div className="text-yellow-400">You</div>
                    <div className="font-mono">
                      {currentMetrics.player.elbowAngles.leadElbow.toFixed(0)}° / {currentMetrics.player.elbowAngles.rearElbow.toFixed(0)}°
                    </div>
                  </div>
                  <div className="flex-1 text-xs text-center p-2 bg-green-900/20 rounded border border-green-700/30">
                    <div className="text-green-400">Model</div>
                    <div className="font-mono">
                      {currentMetrics.model.elbowAngles.leadElbow.toFixed(0)}° / {currentMetrics.model.elbowAngles.rearElbow.toFixed(0)}°
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center pt-2 border-t border-gray-700">
                Metrics calculated at impact frame {impactFrame}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
