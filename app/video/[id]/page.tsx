import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { VideoDetailClient } from './video-detail-client';

export default async function VideoDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login');
  }

  const video = await prisma.video.findUnique({
    where: { id: params.id },
  });

  if (!video || video.userId !== (session.user as any).id) {
    redirect('/video');
  }

  // Fetch user profile for height (auto-calibration)
  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: {
      height: true,
      bats: true, // User's batting handedness
    },
  });

  // Fetch all analyzed videos for comparison
  const allVideos = await prisma.video.findMany({
    where: { 
      userId: (session.user as any).id,
      analyzed: true,
      overallScore: { not: null }
    },
    orderBy: { uploadDate: 'desc' },
  });

  // Calculate personal bests
  const personalBests = allVideos.length > 0 ? {
    overallScore: Math.max(...allVideos.map(v => v.overallScore || 0)),
    anchor: Math.max(...allVideos.map(v => v.anchor || 0)),
    engine: Math.max(...allVideos.map(v => v.engine || 0)),
    whip: Math.max(...allVideos.map(v => v.whip || 0)),
    exitVelocity: Math.max(...allVideos.map(v => v.exitVelocity || 0)),
  } : null;

  // Find previous video
  const currentVideoIndex = allVideos.findIndex(v => v.id === video.id);
  const previousVideo = currentVideoIndex !== -1 && currentVideoIndex < allVideos.length - 1 
    ? allVideos[currentVideoIndex + 1] 
    : null;

  const previousScores = previousVideo ? {
    overallScore: previousVideo.overallScore,
    anchor: previousVideo.anchor,
    engine: previousVideo.engine,
    whip: previousVideo.whip,
    exitVelocity: previousVideo.exitVelocity,
  } : null;

  return <VideoDetailClient 
    video={video} 
    previousScores={previousScores}
    personalBests={personalBests}
    userHeight={user?.height || undefined}
    userHandedness={user?.bats?.toLowerCase() === 'left' ? 'left' : 'right'}
  />;
}
