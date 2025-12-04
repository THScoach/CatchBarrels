import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import SessionViewClient from './session-view-client';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function SessionViewPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  // Fetch the training session
  const trainingSession = await prisma.trainingSession.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      videos: {
        orderBy: { uploadDate: 'desc' },
      },
    },
  });

  if (!trainingSession) {
    redirect('/dashboard');
  }

  // Calculate average scores
  const analyzedVideos = trainingSession.videos.filter(
    (v) => v.analyzed && v.overallScore
  );
  const avgScore = analyzedVideos.length > 0
    ? Math.round(
        analyzedVideos.reduce((sum, v) => sum + (v.overallScore || 0), 0) /
          analyzedVideos.length
      )
    : null;

  const sessionData = {
    ...trainingSession,
    swingCount: trainingSession.videos.length,
    avgScore,
  };

  return <SessionViewClient session={sessionData} user={session.user} />;
}
