'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Upload,
  X,
  PlayCircle,
  Clock,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BottomNav } from '@/components/bottom-nav';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

interface Video {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  overallScore: number | null;
  anchor: number | null;
  engine: number | null;
  whip: number | null;
  analyzed: boolean;
  uploadDate: Date;
}

interface Session {
  id: string;
  sessionName: string | null;
  location: string | null;
  createdAt: Date;
  endedAt: Date | null;
  videos: Video[];
  swingCount: number;
  avgScore: number | null;
}

interface SessionViewClientProps {
  session: Session;
  user: any;
}

export default function SessionViewClient({
  session,
  user,
}: SessionViewClientProps) {
  const router = useRouter();
  const [isEnding, setIsEnding] = useState(false);
  const isActive = !session.endedAt;

  const handleEndSession = async () => {
    if (!confirm('End this training session? You can still view it later in your history.')) {
      return;
    }

    setIsEnding(true);
    try {
      const response = await fetch(`/api/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endSession: true }),
      });

      if (!response.ok) throw new Error('Failed to end session');

      toast.success('Session ended successfully');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Failed to end session');
    } finally {
      setIsEnding(false);
    }
  };

  const sessionDate = format(new Date(session.createdAt), 'MMM dd, yyyy • h:mm a');
  const sessionTitle = session.sessionName || `Session - ${sessionDate}`;

  return (
    <div className="min-h-screen bg-[#1a2332] pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#1a2332] to-[#2d3a4f] p-6 border-b border-gray-800"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                {isActive && (
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                )}
                {sessionTitle}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {isActive ? 'Active Session' : `Ended ${format(new Date(session.endedAt!), 'MMM dd, h:mm a')}`}
              </p>
              {session.location && (
                <p className="text-gray-400 text-sm">📍 {session.location}</p>
              )}
            </div>
            {isActive && (
              <Button
                onClick={handleEndSession}
                disabled={isEnding}
                variant="outline"
                className="bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                End Session
              </Button>
            )}
          </div>

          {/* Session Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gray-800/50 border-gray-700 p-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <PlayCircle className="w-4 h-4" />
                Total Swings
              </div>
              <div className="text-3xl font-bold text-white">{session.swingCount}</div>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700 p-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <TrendingUp className="w-4 h-4" />
                Avg BARREL Score
              </div>
              <div className="text-3xl font-bold text-white">
                {session.avgScore || '—'}
              </div>
            </Card>
          </div>
        </div>
      </motion.div>

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Action Button */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link href={`/video/upload?sessionId=${session.id}`}>
              <Button className="w-full bg-gradient-to-r from-[#F5A623] to-[#E89815] hover:from-[#E89815] hover:to-[#D68710] text-white py-6 text-lg">
                <Upload className="w-5 h-5 mr-2" />
                Analyze New Swing
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Swings List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-white mb-4">
            Swings in this Session ({session.swingCount})
          </h2>

          {session.videos.length === 0 ? (
            <Card className="bg-gray-800/30 border-gray-700 p-8 text-center">
              <Upload className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">
                No swings yet. Start analyzing to build your session!
              </p>
              {isActive && (
                <Link href={`/video/upload?sessionId=${session.id}`}>
                  <Button className="bg-[#F5A623] hover:bg-[#E89815] text-white">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload First Swing
                  </Button>
                </Link>
              )}
            </Card>
          ) : (
            <div className="space-y-3">
              {session.videos.map((video, index) => (
                <Link key={video.id} href={`/video/${video.id}`}>
                  <Card className="bg-gray-800/30 border-gray-700 hover:bg-gray-800/50 transition-all duration-200 overflow-hidden">
                    <div className="flex items-center gap-4 p-4">
                      {/* Thumbnail */}
                      <div className="relative w-24 h-16 bg-gray-900 rounded-lg overflow-hidden flex-shrink-0">
                        {video.thumbnailUrl ? (
                          <Image
                            src={video.thumbnailUrl}
                            alt={video.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <PlayCircle className="w-8 h-8 text-gray-600" />
                          </div>
                        )}
                        <div className="absolute top-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-xs text-white">
                          #{index + 1}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">
                          {video.title}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {format(new Date(video.uploadDate), 'h:mm a')}
                        </p>
                      </div>

                      {/* Score */}
                      {video.analyzed && video.overallScore ? (
                        <div className="text-right">
                          <Badge
                            className={`text-lg font-bold ${
                              video.overallScore >= 85
                                ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                : video.overallScore >= 75
                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                                : video.overallScore >= 65
                                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                                : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                            }`}
                          >
                            {video.overallScore}
                          </Badge>
                          <div className="text-xs text-gray-400 mt-1 space-x-2">
                            <span>A:{video.anchor}</span>
                            <span>E:{video.engine}</span>
                            <span>W:{video.whip}</span>
                          </div>
                        </div>
                      ) : (
                        <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50">
                          Analyzing...
                        </Badge>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
