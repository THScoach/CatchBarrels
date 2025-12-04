
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Share2, TrendingUp, Filter, Loader2, Zap, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface CommunityVideo {
  id: string;
  title: string;
  videoType: string | null;
  shareableLink: string | null;
  views: number;
  sharedAt: Date | null;
  uploadDate: Date;
  anchor: number | null;
  engine: number | null;
  whip: number | null;
  overallScore: number | null;
  tier: string | null;
  exitVelocity: number | null;
  user: {
    name: string | null;
    username: string;
    level: string | null;
    position: string | null;
    bats: string | null;
    membershipTier: string;
  };
}

export default function CommunityClient() {
  const [videos, setVideos] = useState<CommunityVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [tierFilter, setTierFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchCommunityFeed();
  }, [tierFilter]);

  const fetchCommunityFeed = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (tierFilter) params.append('tier', tierFilter);
      
      const res = await fetch(`/api/community?${params.toString()}`);
      const data = await res.json();
      
      if (data.videos) {
        setVideos(data.videos);
      }
    } catch (error) {
      console.error('Failed to fetch community feed:', error);
      toast.error('Failed to load community feed');
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string | null) => {
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

  const getMembershipBadge = (tier: string) => {
    switch (tier) {
      case 'elite':
        return <Badge className="bg-purple-600 border-none text-xs">Elite Member</Badge>;
      case 'pro':
        return <Badge className="bg-blue-600 border-none text-xs">Pro Member</Badge>;
      case 'athlete':
        return <Badge className="bg-green-600 border-none text-xs">Athlete</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#F5A623]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white pb-24">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#F5A623] to-[#E89815] bg-clip-text text-transparent mb-2">
            Community Feed
          </h1>
          <p className="text-gray-400">
            See how the BARRELS community is improving their swing
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <Button
            onClick={() => setTierFilter(null)}
            variant={tierFilter === null ? "default" : "outline"}
            className={tierFilter === null ? "bg-[#F5A623] hover:bg-[#E89815]" : "border-gray-700 hover:border-[#F5A623]"}
          >
            All Swings
          </Button>
          <Button
            onClick={() => setTierFilter('Elite')}
            variant={tierFilter === 'Elite' ? "default" : "outline"}
            className={tierFilter === 'Elite' ? "bg-purple-600 hover:bg-purple-700" : "border-gray-700 hover:border-purple-600"}
          >
            Elite
          </Button>
          <Button
            onClick={() => setTierFilter('Advanced')}
            variant={tierFilter === 'Advanced' ? "default" : "outline"}
            className={tierFilter === 'Advanced' ? "bg-blue-600 hover:bg-blue-700" : "border-gray-700 hover:border-blue-600"}
          >
            Advanced
          </Button>
          <Button
            onClick={() => setTierFilter('Intermediate')}
            variant={tierFilter === 'Intermediate' ? "default" : "outline"}
            className={tierFilter === 'Intermediate' ? "bg-green-600 hover:bg-green-700" : "border-gray-700 hover:border-green-600"}
          >
            Intermediate
          </Button>
          <Button
            onClick={() => setTierFilter('Developing')}
            variant={tierFilter === 'Developing' ? "default" : "outline"}
            className={tierFilter === 'Developing' ? "bg-yellow-600 hover:bg-yellow-700" : "border-gray-700 hover:border-yellow-600"}
          >
            Developing
          </Button>
        </div>

        {/* Video Grid */}
        {videos.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700 p-12 text-center">
            <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Public Swings Yet</h3>
            <p className="text-gray-400 mb-6">
              Be the first to share your swing with the community!
            </p>
            <Link href="/video">
              <Button className="bg-[#F5A623] hover:bg-[#E89815]">
                Upload & Share Your Swing
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Link
                key={video.id}
                href={`/share/${video.shareableLink}`}
                className="group"
              >
                <Card className="bg-gray-800/50 border-gray-700 hover:border-[#F5A623] transition-all duration-300 overflow-hidden h-full">
                  {/* Thumbnail Placeholder */}
                  <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center relative">
                    <div className="text-4xl font-bold text-gray-700">
                      {video.overallScore || '?'}
                    </div>
                    <div className="absolute top-3 right-3">
                      {video.tier && (
                        <Badge className={`${getTierColor(video.tier)} text-white border-none`}>
                          {video.tier}
                        </Badge>
                      )}
                    </div>
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs text-gray-400">
                      <Eye className="w-3 h-3" />
                      <span>{video.views}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* Athlete Info */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-white group-hover:text-[#F5A623] transition-colors">
                          {video.user.name || video.user.username}
                        </h3>
                        <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-[#F5A623] transition-colors" />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        {video.user.level && <span>{video.user.level}</span>}
                        {video.user.level && video.user.position && <span>•</span>}
                        {video.user.position && <span>{video.user.position}</span>}
                      </div>
                    </div>

                    {/* 4Bs Scores */}
                    {video.anchor !== null && video.engine !== null && video.whip !== null && (
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-gray-900/50 rounded p-2 text-center">
                          <div className="text-gray-400 mb-1">Anchor</div>
                          <div className="font-bold text-green-400">{video.anchor}</div>
                        </div>
                        <div className="bg-gray-900/50 rounded p-2 text-center">
                          <div className="text-gray-400 mb-1">Engine</div>
                          <div className="font-bold text-blue-400">{video.engine}</div>
                        </div>
                        <div className="bg-gray-900/50 rounded p-2 text-center">
                          <div className="text-gray-400 mb-1">Whip</div>
                          <div className="font-bold text-purple-400">{video.whip}</div>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                      {video.exitVelocity && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Zap className="w-3 h-3 text-yellow-400" />
                          <span>{video.exitVelocity} mph</span>
                        </div>
                      )}
                      {getMembershipBadge(video.user.membershipTier)}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Load More */}
        {videos.length > 0 && videos.length % 20 === 0 && (
          <div className="mt-8 text-center">
            <Button
              onClick={fetchCommunityFeed}
              variant="outline"
              className="border-gray-700 hover:border-[#F5A623]"
            >
              Load More
            </Button>
          </div>
        )}
      </div>

    </div>
  );
}
