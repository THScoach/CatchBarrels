'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Maximize2,
  Minimize2,
  PenTool,
  Triangle,
  Eraser,
  MousePointer,
  Save,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

interface ABCTags {
  tagA: number | null; // Trigger/Load Start
  tagB: number | null; // Fire/Launch
  tagC: number | null; // Contact
}

interface DrawingShape {
  id: string;
  type: 'line' | 'angle';
  points: { x: number; y: number }[];
  frameTime: number; // Which frame this drawing belongs to
  color: string;
}

interface AdvancedVideoPlayerProps {
  videoUrl: string;
  videoId: string;
  initialTags?: ABCTags;
  allowEditing?: boolean;
  role?: 'player' | 'coach' | 'admin';
  onTagsChange?: (tags: ABCTags) => void;
  accentColor?: string; // 'gold' for players, 'purple' for coaches
}

export default function AdvancedVideoPlayer({
  videoUrl,
  videoId,
  initialTags = { tagA: null, tagB: null, tagC: null },
  allowEditing = true,
  role = 'player',
  onTagsChange,
  accentColor = 'gold',
}: AdvancedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Video playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // A-B-C tagging state
  const [tags, setTags] = useState<ABCTags>(initialTags);
  const [savingTags, setSavingTags] = useState(false);
  const [activeTagButton, setActiveTagButton] = useState<'A' | 'B' | 'C' | null>(null);

  // Drawing tools state
  const [drawings, setDrawings] = useState<DrawingShape[]>([]);
  const [activeTool, setActiveTool] = useState<'pointer' | 'line' | 'angle' | 'eraser'>('pointer');
  const [currentDrawing, setCurrentDrawing] = useState<{ x: number; y: number }[] | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Video controls
  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const stepFrame = useCallback((direction: 'forward' | 'backward') => {
    if (videoRef.current) {
      const video = videoRef.current;
      const fps = 30; // Assume 30fps for frame stepping
      const frameTime = 1 / fps;
      
      if (direction === 'forward') {
        video.currentTime = Math.min(video.currentTime + frameTime, duration);
      } else {
        video.currentTime = Math.max(video.currentTime - frameTime, 0);
      }
    }
  }, [duration]);

  const handleSeek = useCallback((value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  }, []);

  // A-B-C tagging
  const setTag = useCallback(
    (tag: 'A' | 'B' | 'C') => {
      const newTags = {
        ...tags,
        [`tag${tag}`]: currentTime,
      };
      setTags(newTags);
      setActiveTagButton(tag);
      setTimeout(() => setActiveTagButton(null), 500);
      toast.success(`${tag} Tag set at ${currentTime.toFixed(2)}s`);
      onTagsChange?.(newTags);
    },
    [currentTime, tags, onTagsChange]
  );

  const saveTags = useCallback(async () => {
    setSavingTags(true);
    try {
      const response = await fetch(`/api/videos/${videoId}/tags`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tags, tagSource: role }),
      });

      if (!response.ok) throw new Error('Failed to save tags');

      toast.success('Tags saved successfully');
    } catch (error) {
      console.error('Error saving tags:', error);
      toast.error('Failed to save tags');
    } finally {
      setSavingTags(false);
    }
  }, [tags, videoId, role]);

  // Calculate timing intervals
  const getTimingIntervals = useCallback(() => {
    if (!tags.tagA || !tags.tagB || !tags.tagC) return null;

    const loadDuration = tags.tagB - tags.tagA;
    const fireDuration = tags.tagC - tags.tagB;
    const ratio = loadDuration / fireDuration;

    return {
      loadDuration,
      fireDuration,
      ratio,
    };
  }, [tags]);

  // Drawing tools
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (activeTool === 'pointer' || activeTool === 'eraser') return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100; // Normalize to 0-100
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setIsDrawing(true);
      setCurrentDrawing([{ x, y }]);
    },
    [activeTool]
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !currentDrawing) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      if (activeTool === 'line' && currentDrawing.length === 1) {
        // For line, just update the second point
        setCurrentDrawing([currentDrawing[0], { x, y }]);
      } else if (activeTool === 'angle' && currentDrawing.length < 3) {
        // For angle, collect up to 3 points
        setCurrentDrawing([...currentDrawing, { x, y }]);
      }
    },
    [isDrawing, currentDrawing, activeTool]
  );

  const handleCanvasMouseUp = useCallback(() => {
    if (!isDrawing || !currentDrawing) return;

    // Save the drawing
    const newDrawing: DrawingShape = {
      id: `${Date.now()}-${Math.random()}`,
      type: activeTool as 'line' | 'angle',
      points: currentDrawing,
      frameTime: currentTime,
      color: accentColor === 'gold' ? '#E8B14E' : '#9D6FDB',
    };

    setDrawings([...drawings, newDrawing]);
    setIsDrawing(false);
    setCurrentDrawing(null);
  }, [isDrawing, currentDrawing, activeTool, currentTime, drawings, accentColor]);

  const clearDrawings = useCallback(() => {
    setDrawings([]);
    toast.success('All drawings cleared');
  }, []);

  // Render drawings on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw saved drawings for current frame (within 0.05s tolerance)
    const frameDrawings = drawings.filter(
      (d) => Math.abs(d.frameTime - currentTime) < 0.05
    );

    frameDrawings.forEach((drawing) => {
      ctx.strokeStyle = drawing.color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';

      if (drawing.type === 'line' && drawing.points.length === 2) {
        const [p1, p2] = drawing.points;
        ctx.beginPath();
        ctx.moveTo((p1.x / 100) * canvas.width, (p1.y / 100) * canvas.height);
        ctx.lineTo((p2.x / 100) * canvas.width, (p2.y / 100) * canvas.height);
        ctx.stroke();
      } else if (drawing.type === 'angle' && drawing.points.length === 3) {
        const [p1, p2, p3] = drawing.points;
        ctx.beginPath();
        ctx.moveTo((p1.x / 100) * canvas.width, (p1.y / 100) * canvas.height);
        ctx.lineTo((p2.x / 100) * canvas.width, (p2.y / 100) * canvas.height);
        ctx.lineTo((p3.x / 100) * canvas.width, (p3.y / 100) * canvas.height);
        ctx.stroke();

        // Draw angle arc
        const angle = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
        ctx.fillStyle = drawing.color;
        ctx.font = '16px Arial';
        ctx.fillText(
          `${Math.abs(Math.round((angle * 180) / Math.PI))}°`,
          (p2.x / 100) * canvas.width + 10,
          (p2.y / 100) * canvas.height - 10
        );
      }
    });

    // Draw current drawing in progress
    if (currentDrawing && currentDrawing.length > 0) {
      ctx.strokeStyle = accentColor === 'gold' ? '#E8B14E' : '#9D6FDB';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';

      if (activeTool === 'line' && currentDrawing.length === 2) {
        const [p1, p2] = currentDrawing;
        ctx.beginPath();
        ctx.moveTo((p1.x / 100) * canvas.width, (p1.y / 100) * canvas.height);
        ctx.lineTo((p2.x / 100) * canvas.width, (p2.y / 100) * canvas.height);
        ctx.stroke();
      }
    }
  }, [drawings, currentDrawing, currentTime, activeTool, accentColor]);

  // Update time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const timingIntervals = getTimingIntervals();
  const accentClasses = accentColor === 'gold' 
    ? 'text-barrels-gold border-barrels-gold bg-barrels-gold'
    : 'text-purple-400 border-purple-400 bg-purple-400';

  return (
    <div ref={containerRef} className="relative w-full bg-black rounded-lg overflow-hidden">
      {/* Video Container with Canvas Overlay */}
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Drawing Canvas Overlay */}
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full pointer-events-auto cursor-crosshair"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={() => {
            setIsDrawing(false);
            setCurrentDrawing(null);
          }}
          style={{
            pointerEvents: activeTool === 'pointer' ? 'none' : 'auto',
          }}
        />
      </div>

      {/* Controls Container */}
      <div className="bg-[#1A1A1A] p-4 space-y-4">
        {/* Timeline with A-B-C Markers */}
        <div className="space-y-2">
          <div className="relative">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.01}
              onValueChange={handleSeek}
              className="w-full"
            />

            {/* A-B-C Markers on Timeline */}
            {tags.tagA && (
              <div
                className={`absolute top-0 w-0.5 h-4 ${accentClasses.split(' ')[2]}/80`}
                style={{ left: `${(tags.tagA / duration) * 100}%` }}
              >
                <span className="absolute -top-5 -left-2 text-xs font-bold text-red-400">A</span>
              </div>
            )}
            {tags.tagB && (
              <div
                className={`absolute top-0 w-0.5 h-4 ${accentClasses.split(' ')[2]}/80`}
                style={{ left: `${(tags.tagB / duration) * 100}%` }}
              >
                <span className="absolute -top-5 -left-2 text-xs font-bold text-blue-400">B</span>
              </div>
            )}
            {tags.tagC && (
              <div
                className={`absolute top-0 w-0.5 h-4 ${accentClasses.split(' ')[2]}/80`}
                style={{ left: `${(tags.tagC / duration) * 100}%` }}
              >
                <span className="absolute -top-5 -left-2 text-xs font-bold text-green-400">C</span>
              </div>
            )}
          </div>

          {/* Time Display */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>
              {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
            </span>
            <span>
              {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Main Controls Row */}
        <div className="flex items-center justify-between">
          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => stepFrame('backward')}
              className="bg-black border-gray-700 text-white hover:bg-gray-800"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={togglePlayPause}
              className={`${accentClasses.split(' ')[2]} hover:opacity-80`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => stepFrame('forward')}
              className="bg-black border-gray-700 text-white hover:bg-gray-800"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Speed Controls */}
          <div className="flex items-center gap-2">
            {[0.25, 0.5, 1, 1.5].map((speed) => (
              <button
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                className={`px-2 py-1 text-xs rounded ${
                  playbackSpeed === speed
                    ? `${accentClasses.split(' ')[2]}/20 ${accentClasses.split(' ')[0]} border ${accentClasses.split(' ')[1]}/30`
                    : 'bg-black text-gray-400 border border-gray-700 hover:bg-gray-800'
                } transition`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Fullscreen */}
          <Button
            size="sm"
            variant="outline"
            onClick={toggleFullscreen}
            className="bg-black border-gray-700 text-white hover:bg-gray-800"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>

        {/* A-B-C Tagging Row */}
        {allowEditing && (
          <div className="flex items-center justify-between gap-4 p-3 bg-black rounded-lg border border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Timing Tags:</span>
              {['A', 'B', 'C'].map((tag) => (
                <Button
                  key={tag}
                  size="sm"
                  onClick={() => setTag(tag as 'A' | 'B' | 'C')}
                  className={`${
                    activeTagButton === tag
                      ? `${accentClasses.split(' ')[2]} scale-110`
                      : `bg-gray-800 hover:${accentClasses.split(' ')[2]}/20`
                  } transition-all`}
                >
                  Set {tag}
                </Button>
              ))}
            </div>

            {timingIntervals && (
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>A→B: {timingIntervals.loadDuration.toFixed(2)}s</span>
                <span>B→C: {timingIntervals.fireDuration.toFixed(2)}s</span>
                <span className={accentClasses.split(' ')[0]}>
                  Ratio: {timingIntervals.ratio.toFixed(2)}:1
                </span>
              </div>
            )}

            <Button
              size="sm"
              onClick={saveTags}
              disabled={savingTags}
              className={`${accentClasses.split(' ')[2]} hover:opacity-80`}
            >
              {savingTags ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            </Button>
          </div>
        )}

        {/* Drawing Tools Row */}
        <div className="flex items-center justify-between gap-4 p-3 bg-black rounded-lg border border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Drawing Tools:</span>
            {[
              { id: 'pointer', icon: MousePointer, label: 'Select' },
              { id: 'line', icon: PenTool, label: 'Line' },
              { id: 'angle', icon: Triangle, label: 'Angle' },
              { id: 'eraser', icon: Eraser, label: 'Clear' },
            ].map((tool) => {
              const Icon = tool.icon;
              return (
                <Button
                  key={tool.id}
                  size="sm"
                  onClick={() => {
                    if (tool.id === 'eraser') {
                      clearDrawings();
                    } else {
                      setActiveTool(tool.id as any);
                    }
                  }}
                  className={`${
                    activeTool === tool.id
                      ? `${accentClasses.split(' ')[2]}/20 ${accentClasses.split(' ')[0]} border ${accentClasses.split(' ')[1]}/30`
                      : 'bg-gray-800 hover:bg-gray-700'
                  } transition`}
                  title={tool.label}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              );
            })}
          </div>

          <div className="text-xs text-gray-500">
            {drawings.length} drawing(s) at this frame
          </div>
        </div>
      </div>
    </div>
  );
}
