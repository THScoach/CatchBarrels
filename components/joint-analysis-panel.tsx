'use client';

/**
 * Joint Analysis Panel
 * 
 * Provides UI for:
 * - Analyzing joints using MediaPipe (browser-based)
 * - Viewing joint analysis status
 * - Toggling joint overlay on video
 * 
 * Uses existing MediaPipe extraction + new standardized API
 */

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Activity, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { extractJointsWithMediaPipe, isMediaPipeAvailable } from '@/services/mediaPipePose';
import { JointData } from '@/types/pose';

interface JointAnalysisPanelProps {
  videoId: string;
  videoUrl: string;
  initialJointData?: JointData | null;
  initialAnalyzed?: boolean;
  onAnalysisComplete?: (jointData: JointData) => void;
  onToggleOverlay?: (show: boolean) => void;
}

export function JointAnalysisPanel({
  videoId,
  videoUrl,
  initialJointData,
  initialAnalyzed = false,
  onAnalysisComplete,
  onToggleOverlay
}: JointAnalysisPanelProps) {
  const [isAnalyzed, setIsAnalyzed] = useState(initialAnalyzed);
  const [jointData, setJointData] = useState<JointData | null>(initialJointData || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check if MediaPipe is available
  const mediaPipeAvailable = isMediaPipeAvailable();

  // Check analysis status on mount
  useEffect(() => {
    if (!isAnalyzed) {
      checkAnalysisStatus();
    }
  }, [videoId]);

  /**
   * Check if joints are already analyzed
   */
  const checkAnalysisStatus = async () => {
    try {
      const response = await fetch(`/api/videos/${videoId}/analyze-joints`);
      if (response.ok) {
        const data = await response.json();
        if (data.jointAnalyzed && data.jointData) {
          setIsAnalyzed(true);
          setJointData(data.jointData);
        }
      }
    } catch (error) {
      console.error('Failed to check analysis status:', error);
    }
  };

  /**
   * Analyze joints using MediaPipe
   */
  const analyzeJoints = async () => {
    if (!videoRef.current || !mediaPipeAvailable) {
      toast.error('MediaPipe not available in this browser');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setProgress(0);
    setStatus('Initializing...');

    try {
      // Extract joints using MediaPipe
      const extractedJointData = await extractJointsWithMediaPipe(
        videoRef.current,
        { targetFps: 30, modelComplexity: 1 },
        (prog, stat) => {
          setProgress(prog);
          setStatus(stat);
        }
      );

      setStatus('Saving joint data...');

      // Save to database
      const response = await fetch(`/api/videos/${videoId}/analyze-joints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jointData: extractedJointData,
          source: 'mediapipe'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save joint data');
      }

      const result = await response.json();

      setJointData(result.jointData);
      setIsAnalyzed(true);
      setProgress(100);
      setStatus('Analysis complete!');

      toast.success('Joint analysis complete!', {
        description: `${extractedJointData.length} frames analyzed`
      });

      onAnalysisComplete?.(result.jointData);

    } catch (error) {
      console.error('Joint analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      setStatus('Analysis failed');
      
      toast.error('Joint analysis failed', {
        description: errorMessage
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Toggle overlay visibility
   */
  const handleToggleOverlay = (checked: boolean) => {
    setShowOverlay(checked);
    onToggleOverlay?.(checked);
  };

  return (
    <Card className="p-4 bg-gray-800/50 border-gray-700 space-y-4">
      {/* Hidden video element for analysis */}
      <video
        ref={videoRef}
        src={videoUrl}
        crossOrigin="anonymous"
        className="hidden"
        preload="metadata"
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-barrels-gold" />
          <h3 className="font-semibold text-white">Joint Analysis</h3>
        </div>
        {isAnalyzed && (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        )}
      </div>

      {/* Not analyzed state */}
      {!isAnalyzed && !isAnalyzing && (
        <div className="space-y-3">
          <p className="text-sm text-gray-400">
            Analyze this video to extract joint positions and overlay them on the video player.
          </p>
          
          {!mediaPipeAvailable ? (
            <div className="p-3 bg-orange-900/20 border border-orange-700/30 rounded-lg">
              <p className="text-sm text-orange-300">
                MediaPipe not supported in this browser. Please use a modern browser (Chrome, Edge, or Firefox).
              </p>
            </div>
          ) : (
            <Button
              onClick={analyzeJoints}
              className="w-full bg-barrels-gold hover:bg-barrels-gold-light text-barrels-black font-semibold"
            >
              <Activity className="w-4 h-4 mr-2" />
              Analyze Joints
            </Button>
          )}
        </div>
      )}

      {/* Analyzing state */}
      {isAnalyzing && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">{status}</span>
            <span className="text-sm font-mono text-white">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>This may take 30-60 seconds...</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isAnalyzing && (
        <div className="p-3 bg-red-900/20 border border-red-700/30 rounded-lg space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm text-red-300 font-medium">Analysis Failed</p>
              <p className="text-xs text-red-400">{error}</p>
            </div>
          </div>
          <Button
            onClick={analyzeJoints}
            size="sm"
            variant="outline"
            className="w-full border-red-700/30 text-red-300 hover:bg-red-900/20"
          >
            <RefreshCw className="w-3 h-3 mr-2" />
            Try Again
          </Button>
        </div>
      )}

      {/* Analyzed state - overlay toggle */}
      {isAnalyzed && jointData && !isAnalyzing && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-900/10 border border-green-700/30 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-300">Analysis complete</span>
            </div>
            <span className="text-xs text-gray-400">
              {jointData.length} frames
            </span>
          </div>

          {/* Overlay toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2">
              {showOverlay ? (
                <Eye className="w-4 h-4 text-barrels-gold" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-400" />
              )}
              <Label htmlFor="toggle-overlay" className="cursor-pointer text-sm">
                Show Joint Overlay
              </Label>
            </div>
            <Switch
              id="toggle-overlay"
              checked={showOverlay}
              onCheckedChange={handleToggleOverlay}
            />
          </div>

          <p className="text-xs text-gray-500">
            Toggle overlay to see joint positions on the video player above.
          </p>
        </div>
      )}
    </Card>
  );
}
