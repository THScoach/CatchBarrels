'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Upload, Loader2, Video as VideoIcon, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';
import { EnhancedVideoPlayer } from '@/components/enhanced-video-player';
import { Card } from '@/components/ui/card';
import { AnalysisResultsCard } from '@/components/analysis/analysis-results-card';
import { AEWCardsSection } from '@/components/analysis/aew-cards-section';
import { JointOverlayPlaceholder } from '@/components/analysis/joint-overlay-placeholder';
import { RecommendationEnginePlaceholder } from '@/components/analysis/recommendation-engine-placeholder';
import { SpineTracerTile } from '@/components/analysis/spine-tracer-tile';
import { NewAnalysisButton } from '@/components/analysis/new-analysis-button';
import { mapEngineMetricsFromScores, mapAnchorMetricsFromScores, mapWhipMetricsFromScores } from '@/lib/engine-metrics-config';
import Link from 'next/link';

interface VideoData {
  id: string;
  videoUrl: string;
  analyzed: boolean;
  overallScore: number | null;
  anchor: number | null;
  engine: number | null;
  whip: number | null;
  anchorStance?: number | null;
  anchorWeightShift?: number | null;
  anchorGroundConnection?: number | null;
  anchorLowerBodyMechanics?: number | null;
  engineHipRotation?: number | null;
  engineSeparation?: number | null;
  engineCorePower?: number | null;
  engineTorsoMechanics?: number | null;
  whipBatSpeed?: number | null;
  whipArmPath?: number | null;
  whipConnection?: number | null;
  whipBatPath?: number | null;
  coachFeedback?: string | null;
}

interface NewAnalysisClientProps {
  userHeight?: number;
  userHandedness: 'left' | 'right';
}

export function NewAnalysisClient({ userHeight, userHandedness }: NewAnalysisClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done'>('idle');
  const [analysisData, setAnalysisData] = useState<VideoData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoType, setVideoType] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        setError('Please select a video file');
        return;
      }

      // Validate file size (max 500MB)
      const maxSize = 500 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('Video file is too large. Maximum size is 500MB');
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) {
      setError('Please select a video file');
      return;
    }

    if (!videoType) {
      setError('Please select a video type before uploading');
      return;
    }

    setStatus('uploading');
    setProgress(0);
    setError(null);

    try {
      // 1. Upload video and start analysis
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('videoType', videoType);

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(Math.round(percentComplete));
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          const videoId = result.video.id;

          toast.success('Upload successful!', {
            description: 'Analyzing your swing...',
          });

          setStatus('processing');

          // 2. Poll until analysis complete
          await pollForAnalysisCompletion(videoId);
        } else {
          setError('Upload failed. Please try again.');
          setStatus('idle');
          toast.error('Upload failed', {
            description: 'Please check your file and try again.',
          });
        }
      });

      xhr.addEventListener('error', () => {
        setError('Upload failed. Please check your internet connection and try again.');
        setStatus('idle');
        toast.error('Network error', {
          description: 'Please check your internet connection and try again.',
        });
      });

      xhr.open('POST', '/api/videos/upload');
      xhr.timeout = 300000; // 5 minute timeout
      xhr.send(formData);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed. Please try again.');
      setStatus('idle');
    }
  };

  const pollForAnalysisCompletion = async (videoId: string) => {
    let done = false;
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes max (2s * 60)

    while (!done && attempts < maxAttempts) {
      attempts++;

      try {
        const statusRes = await fetch(`/api/videos/${videoId}/status`);
        const statusData = await statusRes.json();

        if (statusData.state === 'completed') {
          done = true;

          // Fetch full video data including signed URL
          const videoRes = await fetch(`/api/videos/${videoId}`);
          const videoData = await videoRes.json();

          // Fetch signed URL
          const urlRes = await fetch(`/api/videos/${videoId}/signed-url`);
          const urlData = await urlRes.json();

          setAnalysisData(videoData.video);
          setVideoUrl(urlData.url);
          setStatus('done');

          toast.success('Analysis complete!', {
            description: 'Your swing has been analyzed.',
          });
        } else if (statusData.state === 'failed') {
          done = true;
          setStatus('idle');
          setError('Analysis failed. Please try again.');
          toast.error('Analysis failed', {
            description: 'Something went wrong. Please try again.',
          });
        } else {
          // Still processing, wait and retry
          await new Promise((r) => setTimeout(r, 2000));
        }
      } catch (error) {
        console.error('Error polling status:', error);
        // Continue polling on error
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    if (attempts >= maxAttempts) {
      setStatus('idle');
      setError('Analysis is taking longer than expected. Please check back later.');
      toast.error('Analysis timeout', {
        description: 'This is taking longer than expected. Please check your video list.',
      });
    }
  };

  const resetForm = () => {
    setStatus('idle');
    setAnalysisData(null);
    setSelectedFile(null);
    setVideoType('');
    setError(null);
    setProgress(0);
    setVideoUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-[#1a2332] pb-20">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">New Analysis</h1>
          {status === 'done' && (
            <button
              onClick={resetForm}
              className="text-barrels-gold hover:text-barrels-gold-light text-sm font-medium transition-colors"
            >
              ← Start Another
            </button>
          )}
        </div>

        {/* Upload State */}
        {status === 'idle' && (
          <div className="space-y-6">
            {/* Baseball Hitting Only Notice */}
            <div className="bg-barrels-gold/10 border border-barrels-gold rounded-lg p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-barrels-gold flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium">Baseball Hitting Videos Only</p>
                <p className="text-gray-300 text-sm mt-1">
                  This tool is designed specifically for baseball swing analysis. Please upload videos of batting practice, cage work, tee work, or game swings only.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-200">{error}</p>
              </div>
            )}

            {/* Video Type Selector */}
            <div>
              <label className="block text-white font-medium mb-2">
                Video Type <span className="text-red-400">*</span>
              </label>
              <select
                value={videoType}
                onChange={(e) => setVideoType(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-barrels-gold focus:outline-none focus:ring-2 focus:ring-barrels-gold/20"
              >
                <option value="">Select video type...</option>
                <option value="Tee Work">Tee Work</option>
                <option value="Front Toss">Front Toss</option>
                <option value="Cage Work">Cage Work</option>
                <option value="Live BP">Live BP</option>
                <option value="Game Swings">Game Swings</option>
                <option value="Other">Other Hitting Drills</option>
              </select>
              <p className="text-gray-400 text-sm mt-2">
                This helps categorize your swings and provides better analysis context.
              </p>
            </div>

            {/* Upload Box */}
            <div className="bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-lg p-12 text-center">
              {selectedFile ? (
                <div className="space-y-4">
                  <VideoIcon className="w-16 h-16 text-barrels-gold mx-auto" />
                  <div className="bg-gray-900/50 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-white font-medium">{selectedFile.name}</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleStartAnalysis}
                      className="bg-gradient-to-r from-barrels-gold to-barrels-gold-light hover:opacity-90 text-barrels-black font-semibold px-8 py-3 rounded-lg transition-all"
                    >
                      Start Analysis
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-16 h-16 text-gray-600 mx-auto" />
                  <p className="text-white text-lg">Select your swing video</p>
                  <p className="text-gray-400 text-sm">MP4, MOV, AVI up to 500MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 bg-gradient-to-r from-barrels-gold to-barrels-gold-light hover:opacity-90 text-barrels-black font-semibold px-8 py-3 rounded-lg transition-all"
                  >
                    Select Video
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Uploading State */}
        {status === 'uploading' && (
          <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-12 text-center">
            <div className="space-y-4">
              <Loader2 className="w-16 h-16 text-barrels-gold mx-auto animate-spin" />
              <p className="text-white text-lg">Uploading... {progress}%</p>
              <div className="w-full max-w-md mx-auto bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-barrels-gold to-barrels-gold-light h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-gray-400 text-sm">Please don't close this page</p>
            </div>
          </div>
        )}

        {/* Processing State */}
        {status === 'processing' && (
          <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-12 text-center">
            <div className="space-y-4">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-barrels-gold mx-auto animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-barrels-gold/20 rounded-full animate-ping" />
                </div>
              </div>
              <p className="text-white text-lg font-semibold">Processing your swing...</p>
              <p className="text-gray-400 text-sm">Analyzing biomechanics and generating metrics</p>
              <p className="text-gray-500 text-xs mt-4">This usually takes 30-60 seconds</p>
            </div>
          </div>
        )}

        {/* Analysis Complete - Show Results */}
        {status === 'done' && analysisData && videoUrl && (
          <div className="space-y-4">
            {/* Success Banner */}
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-white font-semibold">Analysis Complete!</p>
                <p className="text-gray-300 text-sm">Your swing has been analyzed successfully.</p>
              </div>
            </div>

            {/* 1. Video Player */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Swing Video</h2>
              <EnhancedVideoPlayer 
                videoUrl={videoUrl} 
                userHandedness={userHandedness}
                userHeight={userHeight}
                onError={() => toast.error('Failed to load video')} 
              />
            </div>

            {/* 2. Coach Rick Analysis */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Coach Rick Analysis</h2>
              <Card className="bg-gray-800/50 border-gray-700 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-barrels-gold/20 border-2 border-barrels-gold flex items-center justify-center flex-shrink-0 text-2xl">
                    🐐
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">Coach Rick's Breakdown</h3>
                    <p className="text-gray-300 text-sm">
                      {analysisData.coachFeedback || 'Great swing! Keep working on your mechanics.'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* 3. Metrics Summary */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Metrics Summary</h2>
              <AnalysisResultsCard
                scores={{
                  goat: analysisData.overallScore || 0,
                  anchor: analysisData.anchor || 0,
                  engine: analysisData.engine || 0,
                  whip: analysisData.whip || 0
                }}
              />
              <div className="mt-3">
                <AEWCardsSection
                  anchorScore={analysisData.anchor || 0}
                  engineScore={analysisData.engine || 0}
                  whipScore={analysisData.whip || 0}
                  anchorMetrics={mapAnchorMetricsFromScores({
                    anchorMotion: Math.round(((analysisData.anchorStance || 0) + (analysisData.anchorWeightShift || 0)) / 2),
                    anchorStability: Math.round(((analysisData.anchorGroundConnection || 0) + (analysisData.anchorLowerBodyMechanics || 0)) / 2),
                    anchorSequencing: analysisData.anchorLowerBodyMechanics || 0,
                    anchorStance: analysisData.anchorStance || 0,
                    anchorWeightShift: analysisData.anchorWeightShift || 0,
                    anchorGroundConnection: analysisData.anchorGroundConnection || 0,
                    anchorLowerBodyMechanics: analysisData.anchorLowerBodyMechanics || 0
                  })}
                  engineMetrics={mapEngineMetricsFromScores(analysisData as any)}
                  whipMetrics={mapWhipMetricsFromScores({
                    whipMotion: Math.round(((analysisData.whipBatSpeed || 0) + (analysisData.whipArmPath || 0)) / 2),
                    whipStability: analysisData.whipConnection || 0,
                    whipSequencing: analysisData.whipBatPath || 0,
                    whipBatSpeed: analysisData.whipBatSpeed || 0,
                    whipArmPath: analysisData.whipArmPath || 0,
                    whipConnection: analysisData.whipConnection || 0
                  })}
                />
              </div>
            </div>

            {/* 4. AI Joint Overlay (Placeholder) */}
            <div>
              <JointOverlayPlaceholder />
            </div>

            {/* 5. Recommendation Engine (Placeholder) */}
            <div>
              <RecommendationEnginePlaceholder />
            </div>

            {/* 6. Spine & Motion Tracer */}
            <div>
              <SpineTracerTile />
            </div>

            {/* 7. View Full Details Button */}
            <div className="space-y-3">
              <Link
                href={`/video/${analysisData.id}`}
                className="block w-full text-center bg-gradient-to-r from-barrels-gold to-barrels-gold-light hover:opacity-90 text-barrels-black font-semibold px-6 py-4 rounded-lg transition-all"
              >
                View Full Analysis Details
              </Link>
              <Link
                href="/video"
                className="block w-full text-center bg-gray-700 hover:bg-gray-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Back to Video Library
              </Link>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
