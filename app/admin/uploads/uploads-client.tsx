'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Upload,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Link as LinkIcon,
  Eye,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Video {
  id: string;
  title: string | null;
  videoType: string | null;
  analyzed: boolean;
  skeletonStatus: string | null;
  overallScore: number | null;
  uploadDate: Date;
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface Player {
  id: string;
  name: string | null;
  email: string | null;
}

interface UploadsClientProps {
  videos: Video[];
  players: Player[];
}

export default function UploadsClient({ videos, players }: UploadsClientProps) {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'pending' | 'processing' | 'failed' | 'completed'>(
    'pending'
  );
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');

  // Categorize videos
  const pending = videos.filter((v) => !v.analyzed && v.skeletonStatus === 'PENDING');
  const processing = videos.filter(
    (v) => !v.analyzed && (v.skeletonStatus === 'PROCESSING' || v.skeletonStatus === 'EXTRACTING')
  );
  const failed = videos.filter((v) => v.skeletonStatus === 'FAILED');
  const completed = videos.filter((v) => v.analyzed && v.skeletonStatus === 'COMPLETED');

  const currentVideos =
    selectedTab === 'pending'
      ? pending
      : selectedTab === 'processing'
      ? processing
      : selectedTab === 'failed'
      ? failed
      : completed;

  const handleRetryAnalysis = async (videoId: string) => {
    setRetryingId(videoId);
    try {
      const response = await fetch(`/api/videos/${videoId}/analyze`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to retry analysis');
      }

      toast.success('Analysis re-queued', {
        description: 'The video will be reanalyzed shortly.',
      });

      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error('Retry error:', error);
      toast.error('Failed to retry analysis', {
        description: 'Please try again or contact support.',
      });
    } finally {
      setRetryingId(null);
    }
  };

  const handleLinkToPlayer = async (videoId: string) => {
    if (!selectedPlayerId) {
      toast.error('Please select a player');
      return;
    }

    setLinkingId(videoId);
    try {
      // Update video's userId in database
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: selectedPlayerId }),
      });

      if (!response.ok) {
        throw new Error('Failed to link video');
      }

      toast.success('Video linked to player', {
        description: 'The video has been assigned successfully.',
      });

      router.refresh();
    } catch (error) {
      console.error('Link error:', error);
      toast.error('Failed to link video', {
        description: 'Please try again.',
      });
    } finally {
      setLinkingId(null);
      setSelectedPlayerId('');
    }
  };

  const getStatusIcon = (tab: typeof selectedTab) => {
    switch (tab) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (tab: typeof selectedTab) => {
    switch (tab) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'processing':
        return 'text-blue-400 bg-blue-900/20';
      case 'failed':
        return 'text-red-400 bg-red-900/20';
      case 'completed':
        return 'text-green-400 bg-green-900/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Upload className="w-6 h-6 text-[#9D6FDB]" />
            Upload Management
          </h1>
          <p className="text-gray-400 mt-1">
            Monitor and manage video uploads and analysis status
          </p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { id: 'pending' as const, label: 'Pending', count: pending.length },
          { id: 'processing' as const, label: 'Processing', count: processing.length },
          { id: 'failed' as const, label: 'Failed', count: failed.length },
          { id: 'completed' as const, label: 'Completed', count: completed.length },
        ].map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-xl border transition ${
              selectedTab === tab.id
                ? 'bg-[#9D6FDB]/10 border-[#9D6FDB] text-[#9D6FDB]'
                : 'bg-[#1A1A1A] border-gray-800 text-gray-400 hover:border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`${getStatusColor(tab.id)} p-2 rounded-lg`}>
                {getStatusIcon(tab.id)}
              </div>
              <span className="text-2xl font-bold">{tab.count}</span>
            </div>
            <p className="text-sm font-medium">{tab.label}</p>
          </motion.button>
        ))}
      </div>

      {/* Videos List */}
      <Card className="bg-[#1A1A1A] border-[#9D6FDB]/20">
        <CardHeader className="border-b border-[#9D6FDB]/10">
          <CardTitle className="text-white flex items-center justify-between">
            <span>
              {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} Uploads ({currentVideos.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {currentVideos.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Upload className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No {selectedTab} uploads found.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {currentVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="p-6 hover:bg-[#9D6FDB]/5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link
                          href={`/admin/players/${video.user.id}`}
                          className="text-white hover:text-[#9D6FDB] font-semibold transition"
                        >
                          {video.user.name || 'Unknown Player'}
                        </Link>
                        {video.videoType && (
                          <Badge className="bg-[#9D6FDB]/20 text-[#9D6FDB] border-[#9D6FDB]/30">
                            {video.videoType}
                          </Badge>
                        )}
                        <Badge className={getStatusColor(selectedTab)}>
                          {selectedTab.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Uploaded {formatDistanceToNow(new Date(video.uploadDate), { addSuffix: true })}</span>
                        {video.analyzed && video.overallScore && (
                          <>
                            <span>•</span>
                            <span>
                              Score:{' '}
                              <span
                                className={`font-bold ${
                                  video.overallScore >= 80
                                    ? 'text-green-400'
                                    : video.overallScore >= 60
                                    ? 'text-[#E8B14E]'
                                    : 'text-red-400'
                                }`}
                              >
                                {video.overallScore}
                              </span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      {selectedTab === 'failed' && (
                        <button
                          onClick={() => handleRetryAnalysis(video.id)}
                          disabled={retryingId === video.id}
                          className="flex items-center gap-2 px-3 py-1.5 bg-[#9D6FDB]/10 hover:bg-[#9D6FDB]/20 text-[#9D6FDB] rounded-lg transition text-sm disabled:opacity-50"
                        >
                          <RefreshCw className={`w-4 h-4 ${retryingId === video.id ? 'animate-spin' : ''}`} />
                          Retry
                        </button>
                      )}

                      {selectedTab === 'pending' && (
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedPlayerId}
                            onChange={(e) => setSelectedPlayerId(e.target.value)}
                            className="px-3 py-1.5 bg-black border border-gray-700 rounded-lg text-white text-sm"
                          >
                            <option value="">Reassign to...</option>
                            {players.map((player) => (
                              <option key={player.id} value={player.id}>
                                {player.name || player.email}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleLinkToPlayer(video.id)}
                            disabled={!selectedPlayerId || linkingId === video.id}
                            className="flex items-center gap-2 px-3 py-1.5 bg-[#9D6FDB]/10 hover:bg-[#9D6FDB]/20 text-[#9D6FDB] rounded-lg transition text-sm disabled:opacity-50"
                          >
                            <LinkIcon className="w-4 h-4" />
                            Link
                          </button>
                        </div>
                      )}

                      {video.analyzed && (
                        <Link
                          href={`/video/${video.id}`}
                          className="flex items-center gap-2 px-3 py-1.5 bg-[#9D6FDB]/10 hover:bg-[#9D6FDB]/20 text-[#9D6FDB] rounded-lg transition text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
