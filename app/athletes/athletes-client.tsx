
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OnFormImportPanel } from '@/components/onform/onform-import-panel';
import {
  User,
  Video,
  Camera,
  TrendingUp,
  Calendar,
  BarChart3,
  Upload,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

interface AthletesClientProps {
  user: any; // Full user object with videos
}

export default function AthletesClient({ user }: AthletesClientProps) {
  const router = useRouter();
  const [showOnFormImport, setShowOnFormImport] = useState(false);

  const handleOnFormImported = (result: any) => {
    console.log('OnForm video imported:', result);
    router.refresh(); // Refresh to show new video
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pb-20">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Athlete Profile</h1>
          <p className="text-gray-400">Manage your training videos and sessions</p>
        </div>

        {/* Athlete Info Card */}
        <Card className="bg-gray-800/50 border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F5A623] to-[#E89815] flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{user.name || user.username}</h2>
                {user.email && <p className="text-gray-400">{user.email}</p>}
              </div>
            </div>
            <Link href="/profile">
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                Edit Profile
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-900/50 rounded-lg">
              <Video className="w-5 h-5 text-[#F5A623] mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{user.videos?.length || 0}</div>
              <div className="text-xs text-gray-400">Total Videos</div>
            </div>
            <div className="text-center p-3 bg-gray-900/50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">
                {user.videos?.filter((v: any) => v.analyzed).length || 0}
              </div>
              <div className="text-xs text-gray-400">Analyzed</div>
            </div>
            <div className="text-center p-3 bg-gray-900/50 rounded-lg">
              <Camera className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">
                {user.videos?.filter((v: any) => v.source === 'onform').length || 0}
              </div>
              <div className="text-xs text-gray-400">OnForm</div>
            </div>
            <div className="text-center p-3 bg-gray-900/50 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">
                {user.videos?.find((v: any) => v.analyzed)?.overallScore || '--'}
              </div>
              <div className="text-xs text-gray-400">Latest Score</div>
            </div>
          </div>
        </Card>

        {/* OnForm Capture Section */}
        <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-700/50 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center">
              <Camera className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                High-FPS Capture with OnForm
                <ExternalLink className="w-4 h-4 text-blue-400" />
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                Record high-quality swing videos (120-300 FPS) using OnForm's professional camera system.
                Perfect for detailed biomechanical analysis.
              </p>
              <Button
                onClick={() => setShowOnFormImport(true)}
                className="bg-[#F5A623] hover:bg-[#E89815] text-white"
              >
                <Camera className="w-4 h-4 mr-2" />
                Record with OnForm
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Link href="/video/upload">
            <Card className="bg-gray-800/50 border-gray-700 p-6 hover:bg-gray-800/70 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#F5A623]/20 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-[#F5A623]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Upload Video</h3>
                  <p className="text-sm text-gray-400">From camera roll or files</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/sessions">
            <Card className="bg-gray-800/50 border-gray-700 p-6 hover:bg-gray-800/70 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Training Sessions</h3>
                  <p className="text-sm text-gray-400">Organize by session</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Recent Videos */}
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Videos</h3>
          {user.videos && user.videos.length > 0 ? (
            <div className="space-y-3">
              {user.videos.slice(0, 5).map((video: any) => (
                <Link key={video.id} href={`/video/${video.id}`}>
                  <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 transition-colors">
                    <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center">
                      <Video className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{video.title}</p>
                      <p className="text-xs text-gray-400">
                        {video.source === 'onform' && '📹 OnForm • '}
                        {video.videoType} • {new Date(video.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                    {video.analyzed && (
                      <div className="text-right">
                        <div className="text-sm font-semibold text-[#F5A623]">
                          {video.overallScore}
                        </div>
                        <div className="text-xs text-gray-400">Score</div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No videos yet. Start by recording with OnForm or uploading a video.</p>
            </div>
          )}

          {user.videos && user.videos.length > 5 && (
            <Link href="/video">
              <Button variant="outline" className="w-full mt-4 border-gray-600 text-gray-300 hover:bg-gray-700">
                View All Videos
              </Button>
            </Link>
          )}
        </Card>
      </div>

      {/* OnForm Import Dialog */}
      <OnFormImportPanel
        athleteId={user.id}
        open={showOnFormImport}
        onOpenChange={setShowOnFormImport}
        onImported={handleOnFormImported}
      />

    </div>
  );
}
