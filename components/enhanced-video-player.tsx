
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, Pause, RotateCcw, ChevronLeft, ChevronRight,
  Minus, Circle, Slash, Type, Undo2, Trash2, Palette,
  Users, Eye, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

interface Point {
  x: number;
  y: number;
}

interface Drawing {
  id: string;
  type: 'line' | 'circle' | 'angle' | 'freehand' | 'text' | 'skeleton' | 'batPath' | 'spineAngle' | 'hipRotation';
  points: Point[];
  color: string;
  label?: string;
  jointType?: 'ankle' | 'knee' | 'hip' | 'shoulder' | 'elbow' | 'wrist' | 'head';
}

interface EnhancedVideoPlayerProps {
  videoUrl: string;
  userHandedness?: 'right' | 'left'; // User's batting handedness
  userHeight?: number; // User's height in inches for auto-calibration
  onError?: () => void;
}

export function EnhancedVideoPlayer({ videoUrl, userHandedness = 'right', userHeight, onError }: EnhancedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const modelVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  // Drawing state
  const [activeTool, setActiveTool] = useState<Drawing['type'] | null>(null);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#F5A623');
  
  // Phase 2: Skeleton & Bat Path state
  const [skeletonMode, setSkeletonMode] = useState(false);
  const [batPathPoints, setBatPathPoints] = useState<Point[]>([]);
  const [skeletonJoints, setSkeletonJoints] = useState<{[key: string]: Point}>({});
  
  // Phase 3: Model Overlay state (FEATURE FLAG: DISABLED - unstable)
  // TODO: Re-enable after v2 joint-only overlay is stable
  const ENABLE_VIDEO_OVERLAY = false; // Feature flag
  const [showModelOverlay, setShowModelOverlay] = useState(false);
  const [modelVideoUrl, setModelVideoUrl] = useState<string | null>(null);
  const [overlayOpacity, setOverlayOpacity] = useState(50); // 0-100
  const [loadingModel, setLoadingModel] = useState(false);
  const [modelPlayerHeight, setModelPlayerHeight] = useState<number | null>(null); // Model player's height in inches
  
  // Calibration state
  const [calibrationMode, setCalibrationMode] = useState(false);
  const [overlayScale, setOverlayScale] = useState(1.0); // 0.5 to 1.5
  const [overlayOffsetX, setOverlayOffsetX] = useState(0); // -200 to 200
  const [overlayOffsetY, setOverlayOffsetY] = useState(0); // -200 to 200
  const [savingCalibration, setSavingCalibration] = useState(false);
  
  const colors = ['#F5A623', '#EF4444', '#3B82F6', '#10B981', '#FFFFFF', '#F59E0B'];
  
  // Joint order for skeleton connections
  const jointOrder = ['ankle', 'knee', 'hip', 'shoulder', 'elbow', 'wrist', 'head'];

  const fetchModelVideo = useCallback(async () => {
    setLoadingModel(true);
    try {
      const response = await fetch(`/api/model-videos/by-handedness/${userHandedness}`);
      if (!response.ok) {
        throw new Error('No model video found');
      }
      const data = await response.json();
      setModelVideoUrl(data.modelVideo.signedUrl);
      setModelPlayerHeight(data.modelVideo.playerHeight || null);
      
      const modelName = data.modelVideo.playerName || 'Pro';
      toast.success(`${modelName} model loaded!`);
    } catch (error) {
      console.error('Error fetching model video:', error);
      toast.error('No model video available for comparison');
      setShowModelOverlay(false);
    } finally {
      setLoadingModel(false);
    }
  }, [userHandedness]);

  // Save calibration settings
  const saveCalibration = async () => {
    setSavingCalibration(true);
    try {
      const response = await fetch('/api/model-videos/calibration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scale: overlayScale,
          offsetX: overlayOffsetX,
          offsetY: overlayOffsetY,
        }),
      });
      
      if (response.ok) {
        toast.success('Calibration saved!');
        setCalibrationMode(false);
      } else {
        toast.error('Failed to save calibration');
      }
    } catch (error) {
      console.error('Error saving calibration:', error);
      toast.error('Failed to save calibration');
    } finally {
      setSavingCalibration(false);
    }
  };

  // Reset calibration to defaults
  const resetCalibration = () => {
    setOverlayScale(1.0);
    setOverlayOffsetX(0);
    setOverlayOffsetY(0);
    toast.info('Calibration reset to defaults');
  };

  // Auto-calibrate based on user height vs model height
  const autoCalibrate = () => {
    if (!userHeight || !modelPlayerHeight) {
      toast.error('Height data not available for auto-calibration');
      return;
    }
    
    // Calculate scale based on height ratio
    const heightRatio = userHeight / modelPlayerHeight;
    const clampedScale = Math.max(0.5, Math.min(1.5, heightRatio));
    
    setOverlayScale(clampedScale);
    setOverlayOffsetX(0); // Reset offsets to center
    setOverlayOffsetY(0);
    
    const userFeet = Math.floor(userHeight / 12);
    const userInches = userHeight % 12;
    const modelFeet = Math.floor(modelPlayerHeight / 12);
    const modelInches = modelPlayerHeight % 12;
    
    toast.success(
      `Auto-calibrated!`,
      { 
        description: `Your ${userFeet}'${userInches}" scaled to match ${modelFeet}'${modelInches}" model (${Math.round(clampedScale * 100)}%)`
      }
    );
  };

  // Fetch model video when overlay is toggled
  useEffect(() => {
    if (showModelOverlay && !modelVideoUrl) {
      fetchModelVideo();
    }
  }, [showModelOverlay, modelVideoUrl, fetchModelVideo]);

  // Sync model video playback with main video
  useEffect(() => {
    if (modelVideoRef.current && videoRef.current && showModelOverlay) {
      // Sync play/pause
      if (isPlaying) {
        modelVideoRef.current.play();
      } else {
        modelVideoRef.current.pause();
      }
      
      // Sync time
      modelVideoRef.current.currentTime = videoRef.current.currentTime;
      
      // Sync playback speed
      modelVideoRef.current.playbackRate = playbackSpeed;
    }
  }, [isPlaying, currentTime, playbackSpeed, showModelOverlay]);

  // Load user's calibration settings
  useEffect(() => {
    const loadCalibration = async () => {
      try {
        const response = await fetch('/api/model-videos/calibration');
        if (response.ok) {
          const data = await response.json();
          setOverlayScale(data.scale ?? 1.0);
          setOverlayOffsetX(data.offsetX ?? 0);
          setOverlayOffsetY(data.offsetY ?? 0);
        }
      } catch (error) {
        console.error('Failed to load calibration:', error);
      }
    };
    loadCalibration();
  }, []);

  // Initialize canvas size to match video
  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasRef.current && videoRef.current) {
        const video = videoRef.current;
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
        redrawCanvas();
      }
    };

    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadedmetadata', resizeCanvas);
      return () => video.removeEventListener('loadedmetadata', resizeCanvas);
    }
  }, []);

  // Redraw all drawings on canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawings.forEach(drawing => {
      ctx.strokeStyle = drawing.color;
      ctx.fillStyle = drawing.color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (drawing.type === 'line' && drawing.points.length === 2) {
        ctx.beginPath();
        ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
        ctx.lineTo(drawing.points[1].x, drawing.points[1].y);
        ctx.stroke();
      } else if (drawing.type === 'circle' && drawing.points.length === 2) {
        const radius = Math.sqrt(
          Math.pow(drawing.points[1].x - drawing.points[0].x, 2) +
          Math.pow(drawing.points[1].y - drawing.points[0].y, 2)
        );
        ctx.beginPath();
        ctx.arc(drawing.points[0].x, drawing.points[0].y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (drawing.type === 'angle' && drawing.points.length === 3) {
        // Draw angle between 3 points
        ctx.beginPath();
        ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
        ctx.lineTo(drawing.points[1].x, drawing.points[1].y);
        ctx.lineTo(drawing.points[2].x, drawing.points[2].y);
        ctx.stroke();
        
        // Calculate and display angle
        const angle = calculateAngle(drawing.points[0], drawing.points[1], drawing.points[2]);
        ctx.font = '16px Arial';
        ctx.fillText(`${angle.toFixed(1)}°`, drawing.points[1].x + 10, drawing.points[1].y - 10);
      } else if (drawing.type === 'freehand' && drawing.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
        drawing.points.forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      } else if (drawing.type === 'text' && drawing.points.length === 1 && drawing.label) {
        ctx.font = '20px Arial';
        ctx.fillText(drawing.label, drawing.points[0].x, drawing.points[0].y);
      } else if (drawing.type === 'skeleton' && drawing.points.length > 1) {
        // Draw skeleton overlay with joint markers
        ctx.lineWidth = 4;
        ctx.strokeStyle = drawing.color;
        
        // Connect joints in order
        ctx.beginPath();
        ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
        for (let i = 1; i < drawing.points.length; i++) {
          ctx.lineTo(drawing.points[i].x, drawing.points[i].y);
        }
        ctx.stroke();
        
        // Draw joint markers
        drawing.points.forEach((point, idx) => {
          ctx.fillStyle = drawing.color;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
          ctx.fill();
          
          // Label joints
          ctx.font = '12px Arial';
          ctx.fillText(jointOrder[idx] || `J${idx}`, point.x + 10, point.y - 10);
        });
      } else if (drawing.type === 'batPath' && drawing.points.length > 2) {
        // Draw bat path with smooth curve
        ctx.lineWidth = 4;
        ctx.strokeStyle = drawing.color;
        ctx.setLineDash([5, 5]);
        
        ctx.beginPath();
        ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
        
        // Draw smooth curve through points
        for (let i = 1; i < drawing.points.length - 1; i++) {
          const xc = (drawing.points[i].x + drawing.points[i + 1].x) / 2;
          const yc = (drawing.points[i].y + drawing.points[i + 1].y) / 2;
          ctx.quadraticCurveTo(drawing.points[i].x, drawing.points[i].y, xc, yc);
        }
        
        // Draw to last point
        const lastPoint = drawing.points[drawing.points.length - 1];
        const secondLast = drawing.points[drawing.points.length - 2];
        ctx.quadraticCurveTo(secondLast.x, secondLast.y, lastPoint.x, lastPoint.y);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw bat position markers
        drawing.points.forEach((point, idx) => {
          ctx.fillStyle = drawing.color;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
          ctx.fill();
        });
        
        // Calculate and show attack angle (if enough points)
        if (drawing.points.length >= 3) {
          const attackAngle = calculateAttackAngle(drawing.points);
          ctx.font = '16px Arial';
          ctx.fillStyle = drawing.color;
          ctx.fillText(`Attack: ${attackAngle.toFixed(1)}°`, drawing.points[0].x + 15, drawing.points[0].y);
        }
      } else if (drawing.type === 'spineAngle' && drawing.points.length === 2) {
        // Draw spine angle line with measurement
        ctx.lineWidth = 4;
        ctx.strokeStyle = drawing.color;
        ctx.beginPath();
        ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
        ctx.lineTo(drawing.points[1].x, drawing.points[1].y);
        ctx.stroke();
        
        // Calculate spine angle from vertical
        const angleFromVertical = calculateSpineAngle(drawing.points[0], drawing.points[1]);
        ctx.font = '18px Arial';
        ctx.fillStyle = drawing.color;
        ctx.fillText(`Spine: ${angleFromVertical.toFixed(1)}°`, drawing.points[0].x + 15, drawing.points[0].y - 15);
        
        // Draw vertical reference line
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = '#888';
        ctx.beginPath();
        ctx.moveTo(drawing.points[0].x, drawing.points[0].y - 50);
        ctx.lineTo(drawing.points[0].x, drawing.points[0].y + 50);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (drawing.type === 'hipRotation' && drawing.points.length === 3) {
        // Draw hip rotation arc
        ctx.lineWidth = 3;
        ctx.strokeStyle = drawing.color;
        
        // Draw lines from center to endpoints
        ctx.beginPath();
        ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
        ctx.lineTo(drawing.points[1].x, drawing.points[1].y);
        ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
        ctx.lineTo(drawing.points[2].x, drawing.points[2].y);
        ctx.stroke();
        
        // Draw arc
        const radius = Math.sqrt(
          Math.pow(drawing.points[1].x - drawing.points[0].x, 2) +
          Math.pow(drawing.points[1].y - drawing.points[0].y, 2)
        );
        const startAngle = Math.atan2(drawing.points[1].y - drawing.points[0].y, drawing.points[1].x - drawing.points[0].x);
        const endAngle = Math.atan2(drawing.points[2].y - drawing.points[0].y, drawing.points[2].x - drawing.points[0].x);
        
        ctx.beginPath();
        ctx.arc(drawing.points[0].x, drawing.points[0].y, radius, startAngle, endAngle, false);
        ctx.stroke();
        
        // Calculate rotation angle
        const rotationAngle = calculateAngle(drawing.points[1], drawing.points[0], drawing.points[2]);
        ctx.font = '16px Arial';
        ctx.fillStyle = drawing.color;
        ctx.fillText(`Hip Rotation: ${rotationAngle.toFixed(1)}°`, drawing.points[0].x + 15, drawing.points[0].y);
      }
    });
    
    // Draw skeleton joints if in skeleton mode
    if (skeletonMode && Object.keys(skeletonJoints).length > 0) {
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#F5A623';
      
      // Connect joints
      const joints = jointOrder.filter(j => skeletonJoints[j]);
      if (joints.length > 1) {
        ctx.beginPath();
        const firstJoint = skeletonJoints[joints[0]];
        ctx.moveTo(firstJoint.x, firstJoint.y);
        for (let i = 1; i < joints.length; i++) {
          const joint = skeletonJoints[joints[i]];
          ctx.lineTo(joint.x, joint.y);
        }
        ctx.stroke();
      }
      
      // Draw joint markers
      Object.entries(skeletonJoints).forEach(([jointName, point]) => {
        ctx.fillStyle = '#F5A623';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#FFF';
        ctx.fillText(jointName, point.x + 12, point.y - 12);
      });
    }
    
    // Draw bat path if in progress
    if (batPathPoints.length > 0) {
      ctx.strokeStyle = '#F5A623';
      ctx.lineWidth = 4;
      ctx.setLineDash([5, 5]);
      
      ctx.beginPath();
      ctx.moveTo(batPathPoints[0].x, batPathPoints[0].y);
      batPathPoints.slice(1).forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw markers
      batPathPoints.forEach(point => {
        ctx.fillStyle = '#F5A623';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
    
    // Draw current drawing in progress
    if (currentDrawing.length > 0 && activeTool) {
      ctx.strokeStyle = selectedColor;
      ctx.fillStyle = selectedColor;
      ctx.lineWidth = 3;
      
      if (activeTool === 'line' && currentDrawing.length === 2) {
        ctx.beginPath();
        ctx.moveTo(currentDrawing[0].x, currentDrawing[0].y);
        ctx.lineTo(currentDrawing[1].x, currentDrawing[1].y);
        ctx.stroke();
      } else if (activeTool === 'circle' && currentDrawing.length === 2) {
        const radius = Math.sqrt(
          Math.pow(currentDrawing[1].x - currentDrawing[0].x, 2) +
          Math.pow(currentDrawing[1].y - currentDrawing[0].y, 2)
        );
        ctx.beginPath();
        ctx.arc(currentDrawing[0].x, currentDrawing[0].y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (activeTool === 'angle') {
        ctx.beginPath();
        ctx.moveTo(currentDrawing[0].x, currentDrawing[0].y);
        currentDrawing.slice(1).forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      } else if (activeTool === 'freehand' && currentDrawing.length > 1) {
        ctx.beginPath();
        ctx.moveTo(currentDrawing[0].x, currentDrawing[0].y);
        currentDrawing.forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      }
    }
  }, [drawings, currentDrawing, activeTool, selectedColor, skeletonMode, skeletonJoints, batPathPoints, jointOrder]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const calculateAngle = (p1: Point, vertex: Point, p2: Point): number => {
    const angle1 = Math.atan2(p1.y - vertex.y, p1.x - vertex.x);
    const angle2 = Math.atan2(p2.y - vertex.y, p2.x - vertex.x);
    let angle = Math.abs((angle1 - angle2) * (180 / Math.PI));
    if (angle > 180) angle = 360 - angle;
    return angle;
  };

  const calculateSpineAngle = (top: Point, bottom: Point): number => {
    // Calculate angle from vertical (90° = horizontal, 0° = vertical)
    const dx = bottom.x - top.x;
    const dy = bottom.y - top.y;
    const angleFromHorizontal = Math.atan2(dy, dx) * (180 / Math.PI);
    return Math.abs(90 - angleFromHorizontal);
  };

  const calculateAttackAngle = (points: Point[]): number => {
    // Calculate attack angle from first 3 bat positions
    if (points.length < 3) return 0;
    
    // Use first and last points to determine swing plane
    const start = points[0];
    const end = points[points.length - 1];
    
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Normalize to attack angle convention (negative = downward, positive = upward)
    return -angle; // Invert for baseball convention
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeTool) return;
    
    const point = getCanvasCoordinates(e);
    
    if (activeTool === 'line' || activeTool === 'circle') {
      if (currentDrawing.length === 0) {
        setCurrentDrawing([point]);
      } else if (currentDrawing.length === 1) {
        const newDrawing: Drawing = {
          id: Date.now().toString(),
          type: activeTool,
          points: [...currentDrawing, point],
          color: selectedColor,
        };
        setDrawings([...drawings, newDrawing]);
        setCurrentDrawing([]);
      }
    } else if (activeTool === 'angle') {
      if (currentDrawing.length < 2) {
        setCurrentDrawing([...currentDrawing, point]);
      } else {
        const newDrawing: Drawing = {
          id: Date.now().toString(),
          type: 'angle',
          points: [...currentDrawing, point],
          color: selectedColor,
        };
        setDrawings([...drawings, newDrawing]);
        setCurrentDrawing([]);
      }
    } else if (activeTool === 'text') {
      const label = prompt('Enter label:');
      if (label) {
        const newDrawing: Drawing = {
          id: Date.now().toString(),
          type: 'text',
          points: [point],
          color: selectedColor,
          label,
        };
        setDrawings([...drawings, newDrawing]);
      }
    } else if (activeTool === 'skeleton') {
      // Add joint to skeleton
      const nextJoint = jointOrder.find(j => !skeletonJoints[j]);
      if (nextJoint) {
        setSkeletonJoints({ ...skeletonJoints, [nextJoint]: point });
        toast.success(`${nextJoint} placed`, { description: `${Object.keys(skeletonJoints).length + 1} / ${jointOrder.length} joints` });
        
        // If all joints placed, save as drawing
        if (Object.keys(skeletonJoints).length + 1 === jointOrder.length) {
          const jointPoints = jointOrder.map(j => skeletonJoints[j] || point);
          const newDrawing: Drawing = {
            id: Date.now().toString(),
            type: 'skeleton',
            points: jointPoints,
            color: selectedColor,
          };
          setDrawings([...drawings, newDrawing]);
          setSkeletonJoints({});
          setSkeletonMode(false);
          setActiveTool(null);
          toast.success('Skeleton overlay complete!');
        }
      }
    } else if (activeTool === 'batPath') {
      // Add point to bat path
      setBatPathPoints([...batPathPoints, point]);
      toast.info(`Bat position ${batPathPoints.length + 1} marked`);
    } else if (activeTool === 'spineAngle') {
      if (currentDrawing.length === 0) {
        setCurrentDrawing([point]);
        toast.info('Click bottom of spine');
      } else {
        const newDrawing: Drawing = {
          id: Date.now().toString(),
          type: 'spineAngle',
          points: [...currentDrawing, point],
          color: selectedColor,
        };
        setDrawings([...drawings, newDrawing]);
        setCurrentDrawing([]);
        toast.success('Spine angle measured!');
      }
    } else if (activeTool === 'hipRotation') {
      if (currentDrawing.length === 0) {
        setCurrentDrawing([point]);
        toast.info('Click hip start position');
      } else if (currentDrawing.length === 1) {
        setCurrentDrawing([...currentDrawing, point]);
        toast.info('Click hip end position');
      } else {
        const newDrawing: Drawing = {
          id: Date.now().toString(),
          type: 'hipRotation',
          points: [...currentDrawing, point],
          color: selectedColor,
        };
        setDrawings([...drawings, newDrawing]);
        setCurrentDrawing([]);
        toast.success('Hip rotation measured!');
      }
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'freehand') {
      setIsDrawing(true);
      const point = getCanvasCoordinates(e);
      setCurrentDrawing([point]);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeTool) return;
    
    const point = getCanvasCoordinates(e);
    
    if (activeTool === 'freehand' && isDrawing) {
      setCurrentDrawing([...currentDrawing, point]);
    } else if ((activeTool === 'line' || activeTool === 'circle') && currentDrawing.length === 1) {
      // Show preview
      redrawCanvas();
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = selectedColor;
        ctx.lineWidth = 3;
        if (activeTool === 'line') {
          ctx.beginPath();
          ctx.moveTo(currentDrawing[0].x, currentDrawing[0].y);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
        } else if (activeTool === 'circle') {
          const radius = Math.sqrt(
            Math.pow(point.x - currentDrawing[0].x, 2) +
            Math.pow(point.y - currentDrawing[0].y, 2)
          );
          ctx.beginPath();
          ctx.arc(currentDrawing[0].x, currentDrawing[0].y, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }
    }
  };

  const handleCanvasMouseUp = () => {
    if (activeTool === 'freehand' && isDrawing) {
      const newDrawing: Drawing = {
        id: Date.now().toString(),
        type: 'freehand',
        points: currentDrawing,
        color: selectedColor,
      };
      setDrawings([...drawings, newDrawing]);
      setCurrentDrawing([]);
      setIsDrawing(false);
    }
  };

  // Video controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const changeSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      toast.success(`Playback speed: ${speed}x`);
    }
  };

  const frameStep = (direction: 'forward' | 'backward') => {
    if (videoRef.current) {
      const frameTime = 1 / 30; // Assume 30fps
      videoRef.current.currentTime += direction === 'forward' ? frameTime : -frameTime;
      toast.info(direction === 'forward' ? 'Next frame' : 'Previous frame');
    }
  };

  const undoLastDrawing = () => {
    if (drawings.length > 0) {
      setDrawings(drawings.slice(0, -1));
      toast.success('Undo drawing');
    }
  };

  const clearAllDrawings = () => {
    setDrawings([]);
    setCurrentDrawing([]);
    toast.success('Cleared all drawings');
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div ref={containerRef} className="relative bg-black rounded-lg overflow-hidden">
      <div className="relative aspect-video">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={onError}
        />
        
        {/* Phase 3: Model Video Overlay (DISABLED - unstable, use joint-only overlay instead) */}
        {ENABLE_VIDEO_OVERLAY && showModelOverlay && modelVideoUrl && (
          <video
            ref={modelVideoRef}
            src={modelVideoUrl}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ 
              opacity: overlayOpacity / 100,
              mixBlendMode: 'lighten', // Blend mode for better overlay visibility
              transform: `scale(${overlayScale}) translate(${overlayOffsetX}px, ${overlayOffsetY}px)`,
              transformOrigin: 'center center',
            }}
            muted
          />
        )}
        
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onClick={handleCanvasClick}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        />
      </div>

      {/* Drawing Toolbar */}
      <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-2 flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <Button
            variant={activeTool === 'line' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTool(activeTool === 'line' ? null : 'line')}
            className={activeTool === 'line' ? 'bg-[#F5A623] hover:bg-[#E89815]' : ''}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button
            variant={activeTool === 'circle' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTool(activeTool === 'circle' ? null : 'circle')}
            className={activeTool === 'circle' ? 'bg-[#F5A623] hover:bg-[#E89815]' : ''}
          >
            <Circle className="w-4 h-4" />
          </Button>
          <Button
            variant={activeTool === 'angle' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTool(activeTool === 'angle' ? null : 'angle')}
            className={activeTool === 'angle' ? 'bg-[#F5A623] hover:bg-[#E89815]' : ''}
            title="Angle (3 points)"
          >
            <Slash className="w-4 h-4" />
          </Button>
          <Button
            variant={activeTool === 'freehand' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTool(activeTool === 'freehand' ? null : 'freehand')}
            className={activeTool === 'freehand' ? 'bg-[#F5A623] hover:bg-[#E89815]' : ''}
          >
            <span className="text-lg">✏️</span>
          </Button>
          <Button
            variant={activeTool === 'text' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTool(activeTool === 'text' ? null : 'text')}
            className={activeTool === 'text' ? 'bg-[#F5A623] hover:bg-[#E89815]' : ''}
          >
            <Type className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Phase 2: Biomechanics Tools */}
        <div className="border-t border-gray-700 pt-2 flex flex-col gap-1">
          <div className="text-[10px] text-gray-400 px-1 mb-1">BIOMECHANICS</div>
          <Button
            variant={activeTool === 'skeleton' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              if (activeTool === 'skeleton') {
                setActiveTool(null);
                setSkeletonMode(false);
                setSkeletonJoints({});
              } else {
                setActiveTool('skeleton');
                setSkeletonMode(true);
                toast.info('Skeleton Mode', { description: 'Click to place joints in order' });
              }
            }}
            className={activeTool === 'skeleton' ? 'bg-[#F5A623] hover:bg-[#E89815]' : ''}
            title="Skeleton Overlay"
          >
            <span className="text-lg">🦴</span>
          </Button>
          <Button
            variant={activeTool === 'spineAngle' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              setActiveTool(activeTool === 'spineAngle' ? null : 'spineAngle');
              if (activeTool !== 'spineAngle') {
                toast.info('Spine Angle', { description: 'Click top, then bottom of spine' });
              }
            }}
            className={activeTool === 'spineAngle' ? 'bg-[#F5A623] hover:bg-[#E89815]' : ''}
            title="Spine Angle"
          >
            <span className="text-lg">📐</span>
          </Button>
          <Button
            variant={activeTool === 'hipRotation' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              setActiveTool(activeTool === 'hipRotation' ? null : 'hipRotation');
              if (activeTool !== 'hipRotation') {
                toast.info('Hip Rotation', { description: 'Click hip center, start, then end position' });
              }
            }}
            className={activeTool === 'hipRotation' ? 'bg-[#F5A623] hover:bg-[#E89815]' : ''}
            title="Hip Rotation Arc"
          >
            <span className="text-lg">🔄</span>
          </Button>
          <Button
            variant={activeTool === 'batPath' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              if (activeTool === 'batPath') {
                // Finish bat path
                if (batPathPoints.length >= 3) {
                  const newDrawing: Drawing = {
                    id: Date.now().toString(),
                    type: 'batPath',
                    points: batPathPoints,
                    color: selectedColor,
                  };
                  setDrawings([...drawings, newDrawing]);
                  setBatPathPoints([]);
                  toast.success('Bat path saved!');
                }
                setActiveTool(null);
              } else {
                setActiveTool('batPath');
                setBatPathPoints([]);
                toast.info('Bat Path', { description: 'Click bat positions through the swing. Click again to finish.' });
              }
            }}
            className={activeTool === 'batPath' ? 'bg-[#F5A623] hover:bg-[#E89815]' : ''}
            title="Bat Path Trace"
          >
            <span className="text-lg">⚾</span>
          </Button>
        </div>
        
        {/* Phase 3: Model Overlay Controls (HIDDEN - feature disabled for stability) */}
        {ENABLE_VIDEO_OVERLAY && (
          <div className="border-t border-gray-700 pt-2 flex flex-col gap-1">
            <div className="text-[10px] text-gray-400 px-1 mb-1">MODEL OVERLAY</div>
            <Button
              variant={showModelOverlay ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setShowModelOverlay(!showModelOverlay)}
              className={showModelOverlay ? 'bg-[#F5A623] hover:bg-[#E89815]' : ''}
              disabled={loadingModel}
              title="Toggle Pro Model Overlay"
            >
              {loadingModel ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : showModelOverlay ? (
                <Eye className="w-4 h-4" />
              ) : (
                <Users className="w-4 h-4" />
              )}
            </Button>
            
            {showModelOverlay && (
              <div className="px-1 py-2 space-y-2">
                <div className="text-[9px] text-gray-400">Opacity</div>
                <Slider
                  value={[overlayOpacity]}
                  onValueChange={(value) => setOverlayOpacity(value[0])}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="text-[9px] text-center text-gray-400">{overlayOpacity}%</div>
                
                {/* Calibration Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCalibrationMode(!calibrationMode)}
                  className="w-full mt-2 text-[10px]"
                >
                  {calibrationMode ? '✓ Done' : '⚙️ Calibrate Fit'}
                </Button>
                
                {/* Calibration Controls */}
                {calibrationMode && (
                  <div className="space-y-3 pt-2 border-t border-gray-700">
                    {/* Scale Control */}
                    <div>
                      <div className="text-[9px] text-gray-400 mb-1">Size: {Math.round(overlayScale * 100)}%</div>
                      <Slider
                        value={[overlayScale * 100]}
                        onValueChange={(value) => setOverlayScale(value[0] / 100)}
                        min={50}
                        max={150}
                        step={5}
                        className="w-full"
                      />
                    </div>
                    
                    {/* Horizontal Position */}
                    <div>
                      <div className="text-[9px] text-gray-400 mb-1">↔️ Position: {overlayOffsetX}px</div>
                      <Slider
                        value={[overlayOffsetX + 200]}
                        onValueChange={(value) => setOverlayOffsetX(value[0] - 200)}
                        min={0}
                        max={400}
                        step={5}
                        className="w-full"
                      />
                    </div>
                    
                    {/* Vertical Position */}
                    <div>
                      <div className="text-[9px] text-gray-400 mb-1">↕️ Position: {overlayOffsetY}px</div>
                      <Slider
                        value={[overlayOffsetY + 200]}
                        onValueChange={(value) => setOverlayOffsetY(value[0] - 200)}
                        min={0}
                        max={400}
                        step={5}
                        className="w-full"
                      />
                    </div>
                    
                    {/* Auto-Fit Button */}
                    {userHeight && modelPlayerHeight && (
                      <Button
                        size="sm"
                        onClick={autoCalibrate}
                        className="w-full text-[10px] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        ⚡ Auto-Fit to My Height
                      </Button>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={resetCalibration}
                        variant="outline"
                        className="flex-1 text-[10px]"
                      >
                        Reset
                      </Button>
                      <Button
                        size="sm"
                        onClick={saveCalibration}
                        disabled={savingCalibration}
                        className="flex-1 text-[10px] bg-[#F5A623] hover:bg-[#E89815]"
                      >
                        {savingCalibration ? '...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        <div className="border-t border-gray-700 pt-2 flex flex-col gap-1">
          <div className="flex gap-1">
            {colors.slice(0, 3).map(color => (
              <button
                key={color}
                className={`w-6 h-6 rounded border-2 ${
                  selectedColor === color ? 'border-white' : 'border-gray-600'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
          <div className="flex gap-1">
            {colors.slice(3).map(color => (
              <button
                key={color}
                className={`w-6 h-6 rounded border-2 ${
                  selectedColor === color ? 'border-white' : 'border-gray-600'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-2 flex flex-col gap-1">
          <Button variant="ghost" size="sm" onClick={undoLastDrawing} disabled={drawings.length === 0}>
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAllDrawings} disabled={drawings.length === 0}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm p-4">
        <div className="flex items-center gap-4 mb-3">
          <Button variant="ghost" size="sm" onClick={togglePlay}>
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          
          <Button variant="ghost" size="sm" onClick={() => frameStep('backward')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={() => frameStep('forward')}>
            <ChevronRight className="w-5 h-5" />
          </Button>
          
          <div className="text-sm text-gray-300">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          
          <div className="flex-1" />
          
          <div className="flex gap-2">
            {[0.25, 0.5, 0.75, 1, 1.5, 2].map(speed => (
              <Button
                key={speed}
                variant={playbackSpeed === speed ? 'default' : 'ghost'}
                size="sm"
                onClick={() => changeSpeed(speed)}
                className={playbackSpeed === speed ? 'bg-[#F5A623] hover:bg-[#E89815]' : ''}
              >
                {speed}x
              </Button>
            ))}
          </div>
        </div>
        
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="w-full"
        />
      </div>
    </div>
  );
}
