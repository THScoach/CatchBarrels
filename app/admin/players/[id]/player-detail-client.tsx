'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Mail, Calendar, BarChart, Video, Target, Crown, Clock, Link2, Unlink, Database } from 'lucide-react';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { REBOOT_SYNC_ENABLED } from '@/lib/config/reboot-flags';

interface PlayerDetailClientProps {
  player: any;
}

export default function PlayerDetailClient({ player }: PlayerDetailClientProps) {
  const [unlinking, setUnlinking] = useState(false);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'elite':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'pro':
        return 'bg-[#E8B14E]/20 text-[#E8B14E] border-[#E8B14E]/30';
      case 'athlete':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Handle unlinking Reboot athlete
  const handleUnlink = async () => {
    if (!confirm('Are you sure you want to unlink this Reboot athlete profile?')) {
      return;
    }

    setUnlinking(true);
    try {
      const response = await fetch(`/api/admin/players/${player.id}/reboot-link`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to unlink');
      }

      toast.success('Reboot profile unlinked');
      window.location.reload(); // Refresh to show updated state
    } catch (error: any) {
      console.error('[Reboot Unlink] Error:', error);
      toast.error(error.message || 'Failed to unlink Reboot profile');
    } finally {
      setUnlinking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/admin/players"
        className="inline-flex items-center text-gray-400 hover:text-[#E8B14E] transition"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Players
      </Link>

      {/* Player Header */}
      <div className="bg-[#1A1A1A] border border-[#E8B14E]/20 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{player.name || player.username}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>{player.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Joined {format(new Date(player.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border capitalize ${getTierColor(
              player.membershipTier
            )}`}
          >
            {player.membershipTier}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#E8B14E]/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#E8B14E]/20 rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-[#E8B14E]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{player.videos?.length || 0}</p>
              <p className="text-sm text-gray-400">Total Sessions</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{player.playerLessons?.length || 0}</p>
              <p className="text-sm text-gray-400">Lessons</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <BarChart className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {player.videos?.filter((v: any) => v.analyzed).length || 0}
              </p>
              <p className="text-sm text-gray-400">Analyzed</p>
            </div>
          </div>
        </div>
        
        {/* VIP Status (if applicable) */}
        {player.assessmentCompletedAt && (
          <div className="mt-6 pt-6 border-t border-[#E8B14E]/10">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Assessment VIP Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#E8B14E]/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#E8B14E]" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Assessment Completed</p>
                  <p className="text-sm font-medium text-white">
                    {format(new Date(player.assessmentCompletedAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              
              {player.assessmentVipExpiresAt && (
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${player.assessmentVipActive ? 'bg-green-500/20' : 'bg-gray-500/20'} rounded-lg flex items-center justify-center`}>
                    <Clock className={`w-5 h-5 ${player.assessmentVipActive ? 'text-green-400' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">VIP Offer Status</p>
                    <p className={`text-sm font-medium ${player.assessmentVipActive ? 'text-green-400' : 'text-gray-400'}`}>
                      {player.assessmentVipActive ? (
                        <>
                          {differenceInDays(new Date(player.assessmentVipExpiresAt), new Date())} days remaining
                        </>
                      ) : (
                        'Expired'
                      )}
                    </p>
                  </div>
                </div>
              )}
              
              {player.assessmentVipExpiresAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#E8B14E]/20 rounded-lg flex items-center justify-center">
                    <Crown className="w-5 h-5 text-[#E8B14E]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">VIP Expires</p>
                    <p className="text-sm font-medium text-white">
                      {format(new Date(player.assessmentVipExpiresAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reboot Motion Link (Feature-Flagged) */}
      {REBOOT_SYNC_ENABLED && (
        <div className="bg-[#1A1A1A] border border-purple-500/20 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Reboot Motion Integration
          </h3>
          
          {player.rebootAthleteId ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Linked to Reboot Athlete</p>
                  <p className="text-sm font-medium text-white font-mono">
                    {player.rebootAthleteId}
                  </p>
                </div>
              </div>
              <button
                onClick={handleUnlink}
                disabled={unlinking}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Unlink className="w-4 h-4" />
                {unlinking ? 'Unlinking...' : 'Unlink'}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-500/20 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Not linked to Reboot</p>
                  <p className="text-xs text-gray-500">
                    Link this user to a Reboot athlete profile for comparison and benchmarking
                  </p>
                </div>
              </div>
              <Link
                href={`/admin/reboot`}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-colors text-sm"
              >
                <Link2 className="w-4 h-4" />
                Link Profile
              </Link>
            </div>
          )}
          
          <div className="mt-3 text-xs text-gray-500">
            <p>
              Note: Linking allows you to compare this player's swings to Reboot Motion data
              (MLB, college, HS benchmarks). This does not affect the player's dashboard or scoring.
            </p>
          </div>
        </div>
      )}

      {/* Diamond Kinetics Integration (WO15) */}
      <div className="bg-[#1A1A1A] border border-purple-500/20 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
          <Database className="w-4 h-4" />
          Diamond Kinetics Integration
        </h3>
        
        {player.dkPlayerId ? (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Link2 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">DK Player ID</p>
              <p className="text-sm font-medium text-white font-mono">
                {player.dkPlayerId}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-500/20 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">No DK Player ID set</p>
              <p className="text-xs text-gray-500">POD swing metrics require DK Player ID to be configured</p>
            </div>
          </div>
        )}
        
        <div className="mt-3 text-xs text-gray-500">
          <p>
            Note: When a POD session is marked as "Attended", BARRELS automatically pulls Diamond Kinetics
            swing data for the athlete and displays metrics (swings, barrel speed, momentum, etc.) in the POD management view.
            DK Player ID can be set via database or future admin tools.
          </p>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-[#1A1A1A] border border-[#E8B14E]/20 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Recent Sessions</h2>
        {player.videos && player.videos.length > 0 ? (
          <div className="space-y-3">
            {player.videos.map((video: any) => (
              <Link
                key={video.id}
                href={`/video/${video.id}`}
                className="block p-4 bg-black/50 rounded-lg hover:bg-[#E8B14E]/5 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white font-medium">{video.title || 'Untitled'}</p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                      <span>{video.videoType}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(video.uploadDate), { addSuffix: true })}</span>
                    </div>
                  </div>
                  {video.analyzed && (
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="text-center">
                        <p className="text-[#E8B14E] font-bold">{video.overallScore || 'N/A'}</p>
                        <p className="text-gray-500 text-xs">BARREL</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-300">{video.anchor || 'N/A'}</p>
                        <p className="text-gray-500 text-xs">Anchor</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-300">{video.engine || 'N/A'}</p>
                        <p className="text-gray-500 text-xs">Engine</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-300">{video.whip || 'N/A'}</p>
                        <p className="text-gray-500 text-xs">Whip</p>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Video className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No sessions yet</p>
          </div>
        )}
      </div>

      {/* Recent Lessons */}
      {player.playerLessons && player.playerLessons.length > 0 && (
        <div className="bg-[#1A1A1A] border border-[#E8B14E]/20 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Recent Lessons</h2>
          <div className="space-y-3">
            {player.playerLessons.map((lesson: any) => (
              <div key={lesson.id} className="p-4 bg-black/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{lesson.goal || 'No goal set'}</p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                      <span>{lesson.swingCount} swings</span>
                      <span>•</span>
                      <span>
                        {lesson.completedAt
                          ? `Completed ${formatDistanceToNow(new Date(lesson.completedAt), { addSuffix: true })}`
                          : 'In progress'}
                      </span>
                    </div>
                  </div>
                  {lesson.lessonBarrelScore && (
                    <div className="text-center">
                      <p className="text-[#E8B14E] text-xl font-bold">{lesson.lessonBarrelScore}</p>
                      <p className="text-gray-500 text-xs">Avg Score</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
