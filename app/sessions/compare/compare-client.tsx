'use client';

import CompareVideoView from '@/components/video/CompareVideoView';

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

interface CompareClientProps {
  leftVideo: VideoInfo;
  rightVideo: VideoInfo;
  role: 'player' | 'coach' | 'admin';
}

export default function CompareClient({ leftVideo, rightVideo, role }: CompareClientProps) {
  return <CompareVideoView leftVideo={leftVideo} rightVideo={rightVideo} role={role} />;
}
