'use client';

import { useState, useEffect } from 'react';
import { BottomNav } from '@/components/bottom-nav';
import { ScoreCard } from '@/components/score-card';
import { EnhancedVideoPlayer } from '@/components/enhanced-video-player';
import { SkeletonExtractor } from '@/components/skeleton-extractor';
// Removed AutoSkeletonExtractor - replaced with opt-in only
import { JointOverlayCompare } from '@/components/joint-overlay-compare';
import { FlowOverlayReport } from '@/components/flow-overlay-report';
import { VideoLoadErrorState } from '@/components/ui/error-state';
import { BarrelsTabs } from '@/components/ui/barrels-tabs';
import { RickTip } from '@/components/ui/rick-tip';
import { toast } from 'sonner';
import { ChevronLeft, Video, Loader2, Sparkles, RefreshCw, Award, TrendingUp, Share2, Eye, Link2, Globe, Lock } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { calculateProgress, formatProgressChange, getProgressIcon, getProgressColor } from '@/lib/utils';
import { convertToSwingJointSeries } from '@/lib/joint-utils';
import { SwingJointSeries } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { HelpBeacon } from '@/components/help/HelpBeacon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { mapEngineMetricsFromScores, mapAnchorMetricsFromScores, mapWhipMetricsFromScores } from '@/lib/engine-metrics-config';
import dynamic from 'next/dynamic';
// New mobile-first components
import { AnalysisHeader } from '@/components/analysis/analysis-header';
import { MiniDashboardStrip } from '@/components/analysis/mini-dashboard-strip';
import { AnalysisResultsCard } from '@/components/analysis/analysis-results-card';
import { PlayerReflectionBox } from '@/components/analysis/player-reflection-box';
import { GoatyFeedbackBlock } from '@/components/analysis/goaty-feedback-block';
import { DrillCard } from '@/components/analysis/drill-card';
import { AEWCardsSection } from '@/components/analysis/aew-cards-section';
import { CoachRickStructuredReport } from '@/components/coach-rick-structured-report';
import type { StructuredCoachReport } from '@/lib/momentum-coaching';

// Dynamic import with ssr: false to avoid chunk loading issues with recharts
const ProgressCharts = dynamic(() => import('@/components/progress-charts').then(mod => ({ default: mod.ProgressCharts })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
  ),
});

export function VideoDetailClient({ video, previousScores, personalBests, userHeight, userHandedness }: any) {
  const [activeTab, setActiveTab] = useState<'overview' | 'flow' | 'breakdown' | 'drills' | 'history'>('overview');
  const [assessmentHistory, setAssessmentHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [coachFeedback, setCoachFeedback] = useState(video?.coachFeedback || '');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [isOnFormLink, setIsOnFormLink] = useState(false);
  const [onformUrl, setOnformUrl] = useState<string | null>(null);
  
  // Skeleton analysis state (v2 - joint-only comparison)
  const [skeletonExtracted, setSkeletonExtracted] = useState(video?.skeletonExtracted || false);
  const [currentSwing, setCurrentSwing] = useState<SwingJointSeries | null>(null);
  const [referenceSwing, setReferenceSwing] = useState<SwingJointSeries | null>(null);
  const [extractingSkeleton, setExtractingSkeleton] = useState(false);
  
  // Convert existing skeleton data to new format on mount
  useEffect(() => {
    if (video?.skeletonData && video?.skeletonExtracted) {
      const converted = convertToSwingJointSeries(video.skeletonData, video.id, {
        cameraAngle: video.cameraAngle as any || 'unknown',
        impactFrame: video.impactFrame,
        fps: video.fps,
        normalizedFps: video.normalizedFps,
        playerHeight: userHeight,
        handedness: userHandedness,
        videoType: video.videoType
      });
      setCurrentSwing(converted);
    }
  }, [video, userHeight, userHandedness]);
  
  // Sharing state
  const [isPublic, setIsPublic] = useState(video?.isPublic || false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharingVideo, setSharingVideo] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  
  // Player reflection and GOATY chat state
  const [playerReflection, setPlayerReflection] = useState('');
  const [goatyMessages, setGoatyMessages] = useState<Array<{role: 'system' | 'user' | 'assistant', content: string}>>([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Structured Coach Report state
  const [structuredReport, setStructuredReport] = useState<StructuredCoachReport | null>(null);
  const [loadingStructuredReport, setLoadingStructuredReport] = useState(false);
  const [showStructuredReport, setShowStructuredReport] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch signed URL for video playback
  useEffect(() => {
    const fetchVideoUrl = async () => {
      try {
        setVideoError(false);
        setIsOnFormLink(false);
        setLoadingUrl(true);
        
        const response = await fetch(`/api/videos/${video.id}/signed-url`);
        const data = await response.json();
        
        // Check if this is an OnForm link import (now returns 200 with flag)
        if (data.isOnFormLink) {
          setIsOnFormLink(true);
          setOnformUrl(data.onformUrl);
          setLoadingUrl(false);
          return; // Exit gracefully - OnForm videos are handled separately
        }
        
        if (!response.ok) {
          throw new Error(data.error || `Failed to load video: ${response.status}`);
        }
        
        setVideoUrl(data.signedUrl);
      } catch (error) {
        console.error('Error fetching video URL:', error);
        setVideoError(true);
      } finally {
        setLoadingUrl(false);
      }
    };

    if (video?.id) {
      fetchVideoUrl();
    }
  }, [video?.id]);

  const handleRetryVideo = () => {
    setVideoError(false);
    setLoadingUrl(true);
    toast.info('Retrying...', {
      description: 'Attempting to load your video again.',
    });
    
    // Trigger re-fetch by updating a dependency
    const fetchVideoUrl = async () => {
      try {
        const response = await fetch(`/api/videos/${video.id}/signed-url`);
        if (!response.ok) {
          throw new Error(`Failed to load video: ${response.status}`);
        }
        
        const data = await response.json();
        setVideoUrl(data.signedUrl);
        toast.success('Video loaded!', {
          description: 'Your video is ready to play.',
        });
      } catch (error) {
        console.error('Error fetching video URL:', error);
        setVideoError(true);
        toast.error('Still unavailable', {
          description: 'Please try again in a moment or contact support.',
        });
      } finally {
        setLoadingUrl(false);
      }
    };
    fetchVideoUrl();
  };

  // Sharing functions
  const toggleVideoPrivacy = async (makePublic: boolean) => {
    setSharingVideo(true);
    try {
      const response = await fetch(`/api/videos/${video.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: makePublic })
      });

      if (!response.ok) {
        throw new Error('Failed to update video privacy');
      }

      const data = await response.json();
      setIsPublic(makePublic);
      setShareUrl(data.shareUrl);
      
      if (makePublic) {
        setShowShareCard(true);
        toast.success('🌍 Video is now public!', {
          description: 'Your swing is now visible in the community feed.',
          duration: 4000
        });
      } else {
        setShowShareCard(false);
        toast.success('🔒 Video is now private', {
          description: 'Only you can see this video.',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error toggling video privacy:', error);
      toast.error('Failed to update privacy settings');
      // Revert the toggle
      setIsPublic(!makePublic);
    } finally {
      setSharingVideo(false);
    }
  };

  const shareVideo = async () => {
    if (!shareUrl) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${video.title} - BARRELS`,
          text: `Check out my swing analysis on BARRELS! Overall Score: ${video.overallScore}/100`,
          url: shareUrl
        });
        toast.success('Shared successfully!');
      } catch (err) {
        // User cancelled
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      toast.success('📋 Link copied to clipboard!', {
        description: 'Share this link with your teammates',
        duration: 3000
      });
    }
  };

  const getAIFeedback = async () => {
    setLoadingFeedback(true);
    try {
      const response = await fetch('/api/coach-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: video?.id,
          scores: {
            anchor: video?.anchor,
            engine: video?.engine,
            whip: video?.whip,
            overallScore: video?.overallScore,
            exitVelocity: video?.exitVelocity,
          },
        }),
      });

      const data = await response.json();
      setCoachFeedback(data?.feedback || 'Great swing! Keep practicing.');
    } catch (error) {
      console.error('Error getting coach feedback:', error);
      setCoachFeedback('Keep working on your mechanics. Practice makes perfect!');
    } finally {
      setLoadingFeedback(false);
    }
  };
  
  // Get structured Coach Rick report
  const getStructuredReport = async () => {
    setLoadingStructuredReport(true);
    try {
      const response = await fetch(`/api/videos/${video?.id}/structured-report`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch structured report');
      }
      
      const data = await response.json();
      setStructuredReport(data.report);
      setIsAdmin(data.isAdmin || false);
      setShowStructuredReport(true);
      
      toast.success('Full analysis loaded!', {
        description: 'Coach Rick has analyzed your swing in detail.',
      });
    } catch (error) {
      console.error('Error getting structured report:', error);
      toast.error('Failed to load analysis', {
        description: 'Please try again later.',
      });
    } finally {
      setLoadingStructuredReport(false);
    }
  };

  // Fetch assessment history for progress tracking
  const fetchAssessmentHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch('/api/assessments/progress');
      if (!response.ok) {
        throw new Error('Failed to fetch assessment history');
      }
      const data = await response.json();
      setAssessmentHistory(data.assessments || []);
    } catch (error) {
      console.error('Error fetching assessment history:', error);
      setAssessmentHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Load assessment history when history tab is selected
  useEffect(() => {
    if (activeTab === 'history' && assessmentHistory.length === 0) {
      fetchAssessmentHistory();
    }
  }, [activeTab]);

  // Handle skeleton extraction completion (v2 - joint-only)
  const handleSkeletonExtracted = async (data: { skeletonData: any[]; fps: number }) => {
    try {
      setExtractingSkeleton(true);
      toast.info('Processing skeleton data...');

      // Send skeleton data to API for processing (trim, normalize, detect impact)
      const response = await fetch(`/api/videos/${video.id}/process-skeleton`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skeletonData: data.skeletonData,
          fps: data.fps
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process skeleton data');
      }

      const result = await response.json();
      
      // Convert to new SwingJointSeries format
      const converted = convertToSwingJointSeries(result.video.skeletonData, video.id, {
        cameraAngle: video.cameraAngle as any || 'unknown',
        impactFrame: result.video.impactFrame,
        fps: result.video.fps,
        normalizedFps: result.video.normalizedFps,
        playerHeight: userHeight,
        handedness: userHandedness,
        videoType: video.videoType
      });
      
      setCurrentSwing(converted);
      setSkeletonExtracted(true);

      toast.success('Skeleton extracted successfully!', {
        description: `Impact detected at frame ${result.processing.impactDetection.impactFrame}`
      });

      // Fetch matching model skeleton for comparison
      if (userHandedness) {
        fetchModelSkeleton(userHandedness);
      }

    } catch (error) {
      console.error('Error processing skeleton:', error);
      toast.error('Failed to process skeleton data');
    } finally {
      setExtractingSkeleton(false);
    }
  };

  // Handle sending GOATY chat messages
  const handleSendGoatyMessage = async (message: string) => {
    if (!message.trim() || sendingMessage) return;

    try {
      setSendingMessage(true);
      
      // Add user message to chat
      const userMessage = { role: 'user' as const, content: message };
      setGoatyMessages(prev => [...prev, userMessage]);

      // Call Coach Rick API with video context
      const response = await fetch('/api/coach-rick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          videoId: video.id,
          context: {
            scores: {
              overall: video.overallScore,
              anchor: video.anchor,
              engine: video.engine,
              whip: video.whip
            },
            playerReflection
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from GOATY');
      }

      const data = await response.json();
      
      // Add assistant response to chat
      const assistantMessage = { role: 'assistant' as const, content: data.response };
      setGoatyMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message to GOATY');
    } finally {
      setSendingMessage(false);
    }
  };

  // Fetch model skeleton for comparison (v2 - joint-only)
  const fetchModelSkeleton = async (handedness: string) => {
    try {
      const response = await fetch(`/api/model-videos/by-handedness/${handedness.toLowerCase()}`);
      if (!response.ok) {
        throw new Error('No model video found');
      }

      const modelVideo = await response.json();
      
      // Convert model skeleton to new format
      if (modelVideo.modelVideo?.skeletonData) {
        const converted = convertToSwingJointSeries(modelVideo.modelVideo.skeletonData, modelVideo.modelVideo.id, {
          cameraAngle: video.cameraAngle as any || 'unknown',
          impactFrame: modelVideo.modelVideo.impactFrame,
          fps: modelVideo.modelVideo.fps,
          normalizedFps: modelVideo.modelVideo.normalizedFps,
          playerHeight: modelVideo.modelVideo.playerHeight,
          handedness: modelVideo.modelVideo.handedness || handedness as any,
          videoType: 'Pro Model'
        });
        setReferenceSwing(converted);
        toast.success('Model swing loaded for comparison!');
      }

    } catch (error) {
      console.error('Error fetching model skeleton:', error);
      toast.error('No model swing available for comparison');
    }
  };

  return (
    <div className="min-h-screen bg-[#1a2332] pb-20">
      <div className="p-6 max-w-7xl mx-auto">
        <Link
          href="/video"
          className="inline-flex items-center text-gray-400 hover:text-white mb-4"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Videos
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-white">{video?.title}</h1>
          {video?.videoType && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#F5A623]/20 text-[#F5A623] border border-[#F5A623]/30">
              {video.videoType}
            </span>
          )}
        </div>
        <p className="text-gray-400 text-sm mb-4">
          {formatDistanceToNow(new Date(video?.uploadDate), { addSuffix: true })}
        </p>

        {/* Automatic skeleton extraction removed - users now opt-in via Skeleton tab */}

        {/* Share Controls */}
        <Card className="bg-gray-800/50 border-gray-700 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {isPublic ? (
                  <Globe className="w-5 h-5 text-green-400" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <Label htmlFor="privacy-toggle" className="text-sm font-medium cursor-pointer">
                    {isPublic ? 'Public' : 'Private'}
                  </Label>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {isPublic ? 'Visible in community feed' : 'Only you can see this'}
                  </p>
                </div>
              </div>
              <Switch
                id="privacy-toggle"
                checked={isPublic}
                onCheckedChange={toggleVideoPrivacy}
                disabled={sharingVideo}
              />
            </div>
            
            {isPublic && shareUrl && (
              <Button
                onClick={shareVideo}
                className="bg-[#F5A623] hover:bg-[#E89815] text-white"
                size="sm"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            )}
          </div>
          
          {/* Share Card (shown when video is made public) */}
          {showShareCard && shareUrl && (
            <div className="mt-4 p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
              <div className="flex items-start gap-3">
                <Link2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-green-400 mb-1">
                    Your swing is now public!
                  </h4>
                  <p className="text-xs text-gray-300 mb-2">
                    Share this link with your teammates or on social media
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-1 text-xs text-gray-300 font-mono"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <Button
                      onClick={shareVideo}
                      variant="outline"
                      size="sm"
                      className="border-green-700 hover:bg-green-900/20"
                    >
                      <Share2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* View Count */}
          {isPublic && video?.views > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-700 flex items-center gap-2 text-sm text-gray-400">
              <Eye className="w-4 h-4" />
              <span>{video.views} {video.views === 1 ? 'view' : 'views'}</span>
            </div>
          )}
        </Card>

        {/* Video Player with Enhanced Controls */}
        <div className="mb-6">
          {isOnFormLink ? (
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg aspect-video flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 p-8 max-w-md">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                  <Link2 className="w-8 h-8 text-blue-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-white font-semibold mb-2">OnForm Video Link (View-Only)</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    This video is hosted on OnForm and cannot be analyzed directly in BARRELS.
                  </p>
                  <div className="text-left bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-4">
                    <p className="text-blue-400 font-medium text-sm mb-2">
                      To analyze this swing in BARRELS:
                    </p>
                    <ol className="text-gray-300 text-sm space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-[#F5A623] font-bold">1.</span>
                        <span>Open this video in the OnForm app</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#F5A623] font-bold">2.</span>
                        <span>Download or export the video to your phone/iPad</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#F5A623] font-bold">3.</span>
                        <span>Return to BARRELS → OnForm Import → <span className="text-blue-400 font-medium">Upload File</span> tab</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#F5A623] font-bold">4.</span>
                        <span>Upload the downloaded video file to run full analysis</span>
                      </li>
                    </ol>
                  </div>
                </div>
                <a
                  href={onformUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 font-medium"
                >
                  <Globe className="w-5 h-5" />
                  Open in OnForm
                </a>
                <Link
                  href="/video/upload"
                  className="text-[#F5A623] hover:text-[#E89815] text-sm font-medium flex items-center gap-1 transition-colors"
                >
                  Import file for analysis →
                </Link>
              </div>
            </div>
          ) : videoError ? (
            <div className="bg-gray-900 border border-gray-700 rounded-lg aspect-video flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 p-8">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <Video className="w-8 h-8 text-red-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-white font-semibold mb-2">Video Unavailable</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    We couldn't load this video. It might be processing or temporarily unavailable.
                  </p>
                </div>
                <button
                  onClick={handleRetryVideo}
                  className="bg-[#F5A623] hover:bg-[#E89815] text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            </div>
          ) : loadingUrl ? (
            <div className="bg-gray-900 border border-gray-700 rounded-lg aspect-video flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-12 h-12 text-[#F5A623] animate-spin" />
                <p className="text-gray-400 text-sm">Loading video...</p>
              </div>
            </div>
          ) : videoUrl ? (
            <EnhancedVideoPlayer 
              videoUrl={videoUrl} 
              userHandedness={userHandedness}
              userHeight={userHeight}
              onError={() => setVideoError(true)} 
            />
          ) : (
            <div className="bg-gray-900 border border-gray-700 rounded-lg aspect-video flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Video className="w-16 h-16 text-gray-600" />
                <p className="text-gray-400 text-sm">Unable to load video</p>
              </div>
            </div>
          )}
          
          {/* Feature Callout */}
          {videoUrl && !videoError && !loadingUrl && (
            <div className="mt-4 p-4 bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-lg">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#F5A623] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Pro Biomechanics Tools</h4>
                  <p className="text-gray-300 text-sm mb-2">
                    Use advanced drawing and biomechanics tools to analyze your swing like a pro!
                  </p>
                  <ul className="text-gray-300 text-xs space-y-1 ml-4">
                    <li>🦴 <strong>Skeleton Overlay</strong> - Place joint markers (ankle to head)</li>
                    <li>📐 <strong>Spine Angle</strong> - Measure spine tilt like Kwon</li>
                    <li>🔄 <strong>Hip Rotation</strong> - Visualize hip rotation arc</li>
                    <li>⚾ <strong>Bat Path</strong> - Trace bat through the zone with attack angle</li>
                    <li>⏯️ <strong>Slow Motion</strong> - 0.25x speed + frame-by-frame</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <BarrelsTabs
          tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'flow', label: 'Flow' },
            { id: 'breakdown', label: 'Breakdown' },
            { id: 'drills', label: 'Drills' },
            { id: 'history', label: 'History' },
          ]}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as any)}
          className="mb-6"
        />

        {activeTab === 'overview' ? (
          <div className="space-y-6">
            <RickTip
              variant="compact"
              text="Look at your Flow Path strengths first — that's where your swing creates or leaks energy."
            />
            
            {video?.analyzed ? (
              <div className="space-y-6">
                {/* Calculate Progress Indicators */}
                {(() => {
                  const overallProgress = calculateProgress(
                    video?.overallScore,
                    previousScores?.overallScore,
                    personalBests?.overallScore
                  );
                  const anchorProgress = calculateProgress(
                    video?.anchor,
                    previousScores?.anchor,
                    personalBests?.anchor
                  );
                  const engineProgress = calculateProgress(
                    video?.engine,
                    previousScores?.engine,
                    personalBests?.engine
                  );
                  const whipProgress = calculateProgress(
                    video?.whip,
                    previousScores?.whip,
                    personalBests?.whip
                  );
                  const exitVelocityProgress = calculateProgress(
                    video?.exitVelocity,
                    previousScores?.exitVelocity,
                    personalBests?.exitVelocity
                  );

                  return (
                    <>
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <h2 className="text-xl font-bold text-white">Overall Score</h2>
                          {overallProgress.isPersonalBest && (
                            <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full">
                              <Award className="w-4 h-4" />
                              <span className="text-sm font-semibold">Personal Best!</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-4">
                              <div className="text-5xl font-bold text-white">{video.overallScore}</div>
                              {overallProgress.change !== 0 && (
                                <div className="flex flex-col">
                                  <span className={`text-2xl font-bold ${getProgressColor(overallProgress.direction, overallProgress.isPersonalBest)}`}>
                                    {getProgressIcon(overallProgress.direction)} {formatProgressChange(overallProgress.change)}
                                  </span>
                                  {previousScores && (
                                    <span className="text-xs text-gray-500">vs. last swing</span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="text-2xl font-semibold text-[#F5A623] mt-1">{video.tier}</div>
                          </div>
                          {video?.exitVelocity && (
                            <div className="text-right">
                              <div className="text-gray-400 text-sm">Exit Velocity</div>
                              <div className="flex items-center gap-2 justify-end">
                                <div className="text-3xl font-bold text-white">{video.exitVelocity}</div>
                                {exitVelocityProgress.change !== 0 && (
                                  <span className={`text-lg font-bold ${getProgressColor(exitVelocityProgress.direction, exitVelocityProgress.isPersonalBest)}`}>
                                    {getProgressIcon(exitVelocityProgress.direction)}{formatProgressChange(exitVelocityProgress.change)}
                                  </span>
                                )}
                              </div>
                              <div className="text-gray-400 text-sm">mph</div>
                            </div>
                          )}
                        </div>

                        {/* Progress Summary */}
                        {previousScores && (
                          <div className="mt-4 pt-4 border-t border-gray-700">
                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                              <TrendingUp className="w-4 h-4" />
                              <span>Progress vs. Previous Swing:</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="bg-gray-900/50 rounded p-2 text-center">
                                <div className="text-xs text-gray-500 mb-1">Anchor</div>
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-white font-semibold">{video.anchor}</span>
                                  {anchorProgress.change !== 0 && (
                                    <span className={`text-xs ${getProgressColor(anchorProgress.direction)}`}>
                                      {getProgressIcon(anchorProgress.direction)}{formatProgressChange(anchorProgress.change)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="bg-gray-900/50 rounded p-2 text-center">
                                <div className="text-xs text-gray-500 mb-1">Engine</div>
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-white font-semibold">{video.engine}</span>
                                  {engineProgress.change !== 0 && (
                                    <span className={`text-xs ${getProgressColor(engineProgress.direction)}`}>
                                      {getProgressIcon(engineProgress.direction)}{formatProgressChange(engineProgress.change)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="bg-gray-900/50 rounded p-2 text-center">
                                <div className="text-xs text-gray-500 mb-1">Whip</div>
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-white font-semibold">{video.whip}</span>
                                  {whipProgress.change !== 0 && (
                                    <span className={`text-xs ${getProgressColor(whipProgress.direction)}`}>
                                      {getProgressIcon(whipProgress.direction)}{formatProgressChange(whipProgress.change)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}

                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">Body Metrics Breakdown</h2>
                  <p className="text-sm text-gray-400 mb-4">Motion (Timing) • Stability • Sequencing</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ScoreCard 
                      title="ANCHOR (Feet & Ground)" 
                      score={video.anchor} 
                      icon="⚓" 
                      description="How well you use the ground to stay balanced and create power" 
                      color="blue"
                      detailedMetrics={mapAnchorMetricsFromScores({
                        anchorMotion: Math.round(((video.anchorStance || 0) + (video.anchorWeightShift || 0)) / 2),
                        anchorStability: Math.round(((video.anchorGroundConnection || 0) + (video.anchorLowerBodyMechanics || 0)) / 2),
                        anchorSequencing: video.anchorLowerBodyMechanics || 0,
                        anchorStance: video.anchorStance || 0,
                        anchorWeightShift: video.anchorWeightShift || 0,
                        anchorGroundConnection: video.anchorGroundConnection || 0,
                        anchorLowerBodyMechanics: video.anchorLowerBodyMechanics || 0
                      })}
                    />
                    <ScoreCard 
                      title="ENGINE (Hips & Shoulders)" 
                      score={video.engine} 
                      icon="🔄" 
                      description="How well your hips and shoulders work together to create power" 
                      color="green"
                      detailedMetrics={mapEngineMetricsFromScores(video)}
                    />
                    <ScoreCard 
                      title="WHIP (Arms & Bat)" 
                      score={video.whip} 
                      icon="⚡" 
                      description="How well your arms and bat snap through the zone at the right time" 
                      color="purple"
                      detailedMetrics={mapWhipMetricsFromScores({
                        whipMotion: Math.round(((video.whipBatSpeed || 0) + (video.whipArmPath || 0)) / 2),
                        whipStability: video.whipConnection || 0,
                        whipSequencing: video.whipBatPath || 0,
                        whipBatSpeed: video.whipBatSpeed || 0,
                        whipArmPath: video.whipArmPath || 0,
                        whipConnection: video.whipConnection || 0
                      })}
                    />
                  </div>
                </div>
                
                {/* Structured Coach Rick Report Section */}
                <div className="bg-gradient-to-br from-barrels-gold/10 to-barrels-gold-light/5 border border-barrels-gold/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-white">Coach Rick's Full Analysis</h2>
                      <p className="text-sm text-gray-400 mt-1">
                        Get a detailed breakdown with strengths, opportunities, and next session focus
                      </p>
                    </div>
                    {!showStructuredReport && (
                      <Button
                        onClick={getStructuredReport}
                        disabled={loadingStructuredReport}
                        className="bg-gradient-to-r from-barrels-gold to-barrels-gold-light text-barrels-black font-semibold hover:opacity-90 transition-opacity"
                      >
                        {loadingStructuredReport ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            View Full Analysis
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  
                  {showStructuredReport && structuredReport && (
                    <CoachRickStructuredReport 
                      report={structuredReport} 
                      isAdmin={isAdmin} 
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-8 text-center">
                <Loader2 className="w-12 h-12 text-[#F5A623] mx-auto mb-4 animate-spin" />
                <p className="text-white text-lg">Analyzing your swing...</p>
                <p className="text-gray-400 text-sm mt-2">This usually takes 30-60 seconds</p>
              </div>
            )}
          </div>
        ) : activeTab === 'flow' ? (
          <div className="space-y-6">
            <RickTip
              variant="compact"
              text="Watch your momentum transfer from Ground → Engine → Barrel. The overlay shows key timing points (A-B-C) and flow efficiency."
            />
            <FlowOverlayReport
              videoId={video.id}
              videoUrl={videoUrl || ''}
            />
          </div>
        ) : activeTab === 'breakdown' ? (
          <div className="space-y-6">
            <RickTip
              variant="compact"
              text="This is the simplified version of your biomechanics. Use it to guide your next reps."
            />
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-[#F5A623] rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Coach Rick</h3>
                <p className="text-gray-400 text-sm">AI Hitting Coach</p>
              </div>
            </div>

            {coachFeedback ? (
              <div className="bg-gray-900 rounded-lg p-4 text-gray-300">
                {coachFeedback}
              </div>
            ) : (
              <div className="text-center py-8">
                {loadingFeedback ? (
                  <div>
                    <Loader2 className="w-8 h-8 text-[#F5A623] mx-auto mb-3 animate-spin" />
                    <p className="text-gray-400">Generating personalized feedback...</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-400 mb-4">Get personalized coaching feedback from Coach Rick</p>
                    <button
                      onClick={getAIFeedback}
                      className="bg-[#F5A623] hover:bg-[#E89815] text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      Get AI Feedback
                    </button>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        ) : activeTab === 'drills' ? (
          <div className="space-y-6">
            <RickTip
              variant="compact"
              text="Pick one drill and stay with it for a week. Consistency builds movement patterns."
            />
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <h3 className="text-white font-semibold text-xl mb-4">Recommended Drills</h3>
            <div className="space-y-4">
              {/* Placeholder for drill recommendations based on analysis */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h4 className="text-barrels-gold font-medium mb-2">Hip Rotation Drill</h4>
                <p className="text-gray-300 text-sm">
                  Focus on improving hip-shoulder separation for better power transfer.
                </p>
              </div>
              <div className="bg-gray-900 rounded-lg p-4">
                <h4 className="text-barrels-gold font-medium mb-2">Bat Path Optimization</h4>
                <p className="text-gray-300 text-sm">
                  Work on maintaining a more efficient bat path through the zone.
                </p>
              </div>
              <div className="bg-gray-900 rounded-lg p-4">
                <h4 className="text-barrels-gold font-medium mb-2">Balance & Stability</h4>
                <p className="text-gray-300 text-sm">
                  Strengthen your foundation with lower body stability exercises.
                </p>
              </div>
            </div>
            </div>
          </div>
        ) : activeTab === 'history' ? (
          <div className="space-y-6">
            {loadingHistory ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-[#F5A623] mx-auto mb-4 animate-spin" />
                <p className="text-white text-lg">Loading progress data...</p>
              </div>
            ) : (
              <ProgressCharts assessments={assessmentHistory} />
            )}
          </div>
        ) : null}
      </div>

      <BottomNav />

      {/* Help Beacon */}
      <HelpBeacon 
        pageId="video-detail"
        contextData={{
          sessionId: video.id,
          momentumTransferScore: video.overallScore || 0,
          weakestFlowPath: 'Timing & Rhythm', // Could be calculated from scores
          strongestFlowPath: 'Sequence & Braking', // Could be calculated from scores
        }}
        variant="icon"
      />
    </div>
  );
}
