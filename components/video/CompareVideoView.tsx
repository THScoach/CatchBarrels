'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link2, Link2Off, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AdvancedVideoPlayer from './AdvancedVideoPlayer';

interface VideoInfo {
  id: string;
  url: string;
  title: string;
  playerName: string;
  uploadDate: Date;
  score?: number;
  tags?: {
    tagA: number | null;
    tagB: number | null;
    tagC: number | null;
  };
}

interface CompareVideoViewProps {
  leftVideo: VideoInfo;
  rightVideo: VideoInfo;
  role?: 'player' | 'coach' | 'admin';
}

export default function CompareVideoView({
  leftVideo,
  rightVideo,
  role = 'player',
}: CompareVideoViewProps) {
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [leftTime, setLeftTime] = useState(0);
  const [rightTime, setRightTime] = useState(0);
  const [leftDuration, setLeftDuration] = useState(0);
  const [rightDuration, setRightDuration] = useState(0);

  const leftVideoRef = useRef<HTMLVideoElement>(null);
  const rightVideoRef = useRef<HTMLVideoElement>(null);

  // Sync videos based on percentage through each video
  const handleTimeUpdate = useCallback(
    (side: 'left' | 'right', time: number, duration: number) => {
      if (!syncEnabled) return;

      const percentage = duration > 0 ? time / duration : 0;

      if (side === 'left') {
        setLeftTime(time);
        if (rightVideoRef.current && rightDuration > 0) {
          const targetTime = percentage * rightDuration;
          if (Math.abs(rightVideoRef.current.currentTime - targetTime) > 0.1) {
            rightVideoRef.current.currentTime = targetTime;
          }
        }
      } else {
        setRightTime(time);
        if (leftVideoRef.current && leftDuration > 0) {
          const targetTime = percentage * leftDuration;
          if (Math.abs(leftVideoRef.current.currentTime - targetTime) > 0.1) {
            leftVideoRef.current.currentTime = targetTime;
          }
        }
      }
    },
    [syncEnabled, leftDuration, rightDuration]
  );

  const accentColor = role === 'player' ? 'gold' : 'purple';
  const accentClass = accentColor === 'gold' ? 'barrels-gold' : 'purple-400';

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-[#1A1A1A] border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={role === 'player' ? '/dashboard' : '/admin/sessions'}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <h1 className="text-xl font-bold text-white">Swing Comparison</h1>
          </div>

          {/* Sync Toggle */}
          <Button
            onClick={() => setSyncEnabled(!syncEnabled)}
            className={`${
              syncEnabled
                ? `bg-${accentClass} hover:opacity-80`
                : 'bg-gray-800 hover:bg-gray-700'
            } transition flex items-center gap-2`}
          >
            {syncEnabled ? (
              <>
                <Link2 className="w-4 h-4" />
                Synced
              </>
            ) : (
              <>
                <Link2Off className="w-4 h-4" />
                Independent
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Video */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <div className="bg-[#1A1A1A] p-3 rounded-lg border border-gray-800">
              <h2 className="text-lg font-semibold text-white mb-1">{leftVideo.playerName}</h2>
              <p className="text-sm text-gray-400">{leftVideo.title}</p>
              {leftVideo.score !== undefined && (
                <p className={`text-sm mt-1 text-${accentClass}`}>
                  BARREL Score: {leftVideo.score}
                </p>
              )}
            </div>

            <AdvancedVideoPlayer
              videoUrl={leftVideo.url}
              videoId={leftVideo.id}
              initialTags={leftVideo.tags}
              allowEditing={role !== 'player'}
              role={role}
              accentColor={accentColor}
            />
          </motion.div>

          {/* Right Video */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-3"
          >
            <div className="bg-[#1A1A1A] p-3 rounded-lg border border-gray-800">
              <h2 className="text-lg font-semibold text-white mb-1">{rightVideo.playerName}</h2>
              <p className="text-sm text-gray-400">{rightVideo.title}</p>
              {rightVideo.score !== undefined && (
                <p className={`text-sm mt-1 text-${accentClass}`}>
                  BARREL Score: {rightVideo.score}
                </p>
              )}
            </div>

            <AdvancedVideoPlayer
              videoUrl={rightVideo.url}
              videoId={rightVideo.id}
              initialTags={rightVideo.tags}
              allowEditing={role !== 'player'}
              role={role}
              accentColor={accentColor}
            />
          </motion.div>
        </div>

        {/* Sync Instructions */}
        {syncEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-[#1A1A1A] rounded-lg border border-gray-800 text-center text-gray-400 text-sm"
          >
            🔗 Videos are synced by percentage. Scrubbing or stepping on either video will move the other to the
            same relative position.
          </motion.div>
        )}
      </div>
    </div>
  );
}
