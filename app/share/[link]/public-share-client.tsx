
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Share2, TrendingUp, User, Award, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { ScoreCard } from '@/components/score-card';
import { mapEngineMetricsFromScores, mapAnchorMetricsFromScores, mapWhipMetricsFromScores } from '@/lib/engine-metrics-config';

interface PublicShareClientProps {
  video: any;
}

export default function PublicShareClient({ video }: PublicShareClientProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch signed URL for video playback
    fetch(`/api/videos/${video.id}/signed-url`)
      .then(res => res.json())
      .then(data => {
        setVideoUrl(data.signedUrl);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load video:', err);
        setLoading(false);
        toast.error('Failed to load video');
      });
  }, [video.id]);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${video.user.name || video.user.username}'s Swing`,
          text: `Check out this swing analysis on BARRELS! Overall Score: ${video.overallScore}/100`,
          url: shareUrl
        });
        toast.success('Shared successfully!');
      } catch (err) {
        // User cancelled share
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Elite':
        return 'bg-purple-500';
      case 'Advanced':
        return 'bg-blue-500';
      case 'Intermediate':
        return 'bg-green-500';
      case 'Developing':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#F5A623] to-[#E89815] bg-clip-text text-transparent">
                {video.user.name || video.user.username}'s Swing
              </h1>
              <p className="text-gray-400 mt-1">
                Shared {video.sharedAt ? new Date(video.sharedAt).toLocaleDateString() : 'recently'}
              </p>
            </div>
            <Button
              onClick={handleShare}
              className="bg-[#F5A623] hover:bg-[#E89815] text-white"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Eye className="w-4 h-4" />
              <span>{video.views} views</span>
            </div>
            {video.tier && (
              <Badge className={`${getTierColor(video.tier)} text-white border-none`}>
                {video.tier}
              </Badge>
            )}
            {video.exitVelocity && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>{video.exitVelocity} mph</span>
              </div>
            )}
            {video.videoType && (
              <Badge variant="outline" className="border-gray-700">
                {video.videoType}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-800/50 border-gray-700 overflow-hidden">
              {loading ? (
                <div className="aspect-video bg-gray-900 flex items-center justify-center">
                  <div className="text-gray-400">Loading video...</div>
                </div>
              ) : videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  className="w-full aspect-video bg-black"
                  preload="metadata"
                >
                  Your browser does not support video playback.
                </video>
              ) : (
                <div className="aspect-video bg-gray-900 flex items-center justify-center">
                  <div className="text-gray-400">Video unavailable</div>
                </div>
              )}
            </Card>

            {/* 4Bs Scores */}
            {video.analyzed && (
              <Card className="bg-gray-800/50 border-gray-700 p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#F5A623]" />
                  Performance Analysis
                </h2>
                <div className="space-y-4">
                  {/* Overall Score */}
                  {video.overallScore && (
                    <div className="bg-gradient-to-r from-[#F5A623]/20 to-[#E89815]/10 border border-[#F5A623]/30 rounded-lg p-4 text-center">
                      <div className="text-gray-400 text-sm mb-1">Overall Score</div>
                      <div className="text-4xl font-bold text-[#F5A623]">{video.overallScore}/100</div>
                    </div>
                  )}
                  
                  {/* 4Bs Metrics */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-400">Motion (Timing) • Stability • Sequencing</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {video.anchor && (
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
                    )}
                    
                    {video.engine && (
                      <ScoreCard
                        title="ENGINE (Hips & Shoulders)"
                        score={video.engine}
                        icon="🔄"
                        description="How well your hips and shoulders work together to create power"
                        color="green"
                        detailedMetrics={mapEngineMetricsFromScores({
                          engineMotion: Math.round(((video.engineHipRotation || 0) + (video.engineCorePower || 0)) / 2),
                          engineStability: video.engineSeparation || 0,
                          engineSequencing: video.engineTorsoMechanics || 0,
                          engineHipRotation: video.engineHipRotation || 0,
                          engineTorsoMechanics: video.engineTorsoMechanics || 0,
                          engineCorePower: video.engineCorePower || 0
                        })}
                      />
                    )}
                    
                    {video.whip && (
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
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Athlete Info Sidebar */}
          <div className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700 p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[#F5A623]" />
                Athlete Info
              </h3>
              <div className="space-y-3 text-sm">
                {video.user.name && (
                  <div>
                    <span className="text-gray-400">Name:</span>
                    <span className="ml-2 font-medium">{video.user.name}</span>
                  </div>
                )}
                {video.user.level && (
                  <div>
                    <span className="text-gray-400">Level:</span>
                    <span className="ml-2 font-medium">{video.user.level}</span>
                  </div>
                )}
                {video.user.position && (
                  <div>
                    <span className="text-gray-400">Position:</span>
                    <span className="ml-2 font-medium">{video.user.position}</span>
                  </div>
                )}
                {video.user.bats && (
                  <div>
                    <span className="text-gray-400">Bats:</span>
                    <span className="ml-2 font-medium">{video.user.bats}</span>
                  </div>
                )}
                {video.user.height && (
                  <div>
                    <span className="text-gray-400">Height:</span>
                    <span className="ml-2 font-medium">
                      {Math.floor(video.user.height / 12)}'
                      {video.user.height % 12}"
                    </span>
                  </div>
                )}
                {video.user.weight && (
                  <div>
                    <span className="text-gray-400">Weight:</span>
                    <span className="ml-2 font-medium">{video.user.weight} lbs</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Call to Action */}
            <Card className="bg-gradient-to-br from-[#F5A623]/20 to-[#E89815]/10 border-[#F5A623]/30 p-6">
              <h3 className="text-lg font-bold mb-2">Want Your Own Analysis?</h3>
              <p className="text-sm text-gray-300 mb-4">
                Join BARRELS and get AI-powered swing analysis, personalized coaching, and more!
              </p>
              <Button
                onClick={() => window.location.href = '/welcome'}
                className="w-full bg-[#F5A623] hover:bg-[#E89815] text-white"
              >
                Start Free Trial
              </Button>
            </Card>
          </div>
        </div>

        {/* Branding Footer */}
        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>Powered by <span className="text-[#F5A623] font-semibold">BARRELS</span></p>
          <p className="mt-1">Baseball Analysis & Performance Tracking</p>
        </div>
      </div>
    </div>
  );
}
