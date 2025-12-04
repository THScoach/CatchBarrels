
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OnFormImportPanel } from '@/components/onform/onform-import-panel';
import {
  Calendar,
  Video,
  Camera,
  TrendingUp,
  Plus,
  BarChart3,
  Clock,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface Session {
  id: string;
  date: Date;
  title: string;
  videoCount: number;
  videos: any[];
  avgScore: number | null;
}

interface SessionsClientProps {
  sessions: Session[];
  userId: string;
}

export default function SessionsClient({ sessions, userId }: SessionsClientProps) {
  const router = useRouter();
  const [showOnFormImport, setShowOnFormImport] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>();

  const handleRecordForSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setShowOnFormImport(true);
  };

  const handleNewSession = () => {
    setSelectedSessionId(undefined);
    setShowOnFormImport(true);
  };

  const handleOnFormImported = (result: any) => {
    console.log('OnForm video imported for session:', result);
    router.refresh(); // Refresh to show new video
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pb-20">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Training Sessions</h1>
          <p className="text-gray-400">Organize and track your training progress over time</p>
        </div>

        {/* New Session CTA */}
        <Card className="bg-gradient-to-br from-[#F5A623]/20 to-[#E89815]/10 border-[#F5A623]/30 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#F5A623]/20 flex items-center justify-center">
                <Camera className="w-6 h-6 text-[#F5A623]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Start New Session</h3>
                <p className="text-sm text-gray-300">Record swings with OnForm for high-FPS analysis</p>
              </div>
            </div>
            <Button
              onClick={handleNewSession}
              className="bg-[#F5A623] hover:bg-[#E89815] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Session
            </Button>
          </div>
        </Card>

        {/* Sessions List */}
        {sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id} className="bg-gray-800/50 border-gray-700 p-6 hover:bg-gray-800/70 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white mb-1">{session.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDistanceToNow(new Date(session.date), { addSuffix: true })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Video className="w-4 h-4" />
                          {session.videoCount} video{session.videoCount !== 1 ? 's' : ''}
                        </span>
                        {session.avgScore && (
                          <span className="flex items-center gap-1">
                            <BarChart3 className="w-4 h-4" />
                            Avg: {session.avgScore}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleRecordForSession(session.id)}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 flex-shrink-0"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Add Video
                  </Button>
                </div>

                {/* Session Videos */}
                <div className="space-y-2">
                  {session.videos.slice(0, 3).map((video: any) => (
                    <Link key={video.id} href={`/video/${video.id}`}>
                      <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 transition-colors">
                        <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center">
                          <Video className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{video.title}</p>
                          <p className="text-xs text-gray-400">
                            {video.source === 'onform' && '📹 OnForm • '}
                            {video.videoType}
                          </p>
                        </div>
                        {video.analyzed && (
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-semibold text-[#F5A623]">
                              {video.overallScore}
                            </div>
                          </div>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      </div>
                    </Link>
                  ))}
                  {session.videoCount > 3 && (
                    <div className="text-center py-2">
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        + {session.videoCount - 3} more video{session.videoCount - 3 !== 1 ? 's' : ''}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-gray-800/50 border-gray-700 p-12">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Sessions Yet</h3>
              <p className="text-gray-400 mb-6">
                Start your first training session by recording with OnForm or uploading a video
              </p>
              <Button
                onClick={handleNewSession}
                className="bg-[#F5A623] hover:bg-[#E89815] text-white"
              >
                <Camera className="w-4 h-4 mr-2" />
                Start First Session
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* OnForm Import Dialog */}
      <OnFormImportPanel
        athleteId={userId}
        sessionId={selectedSessionId}
        open={showOnFormImport}
        onOpenChange={setShowOnFormImport}
        onImported={handleOnFormImported}
      />

    </div>
  );
}
