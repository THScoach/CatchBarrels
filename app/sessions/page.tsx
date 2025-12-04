import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import SessionsHistoryClient from './sessions-history-client';

export default async function SessionsHistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  // Fetch all training sessions for the user
  const trainingSessions = await prisma.trainingSession.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      videos: {
        select: {
          id: true,
          overallScore: true,
          analyzed: true,
        },
      },
      _count: {
        select: { videos: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Calculate average scores for each session
  const sessionsWithStats = trainingSessions.map((trainingSession) => {
    const analyzedVideos = trainingSession.videos.filter(
      (v) => v.analyzed && v.overallScore
    );
    const avgScore = analyzedVideos.length > 0
      ? Math.round(
          analyzedVideos.reduce((sum, v) => sum + (v.overallScore || 0), 0) /
            analyzedVideos.length
        )
      : null;

    return {
      id: trainingSession.id,
      sessionName: trainingSession.sessionName,
      location: trainingSession.location,
      createdAt: trainingSession.createdAt,
      endedAt: trainingSession.endedAt,
      swingCount: trainingSession._count.videos,
      avgScore,
    };
  });

  return <SessionsHistoryClient sessions={sessionsWithStats} user={session.user} />;
}
