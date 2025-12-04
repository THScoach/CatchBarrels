import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import AssessmentSessionClient from './assessment-session-client';

export default async function AssessmentSessionPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  // Fetch session with all related data
  const assessmentSession = await prisma.assessmentSession.findUnique({
    where: { id: params.id },
    include: {
      swings: {
        include: {
          video: {
            select: {
              id: true,
              title: true,
              videoType: true,
              skeletonExtracted: true,
            },
          },
          metrics: true,
        },
        orderBy: { swingNumber: 'asc' },
      },
      ballData: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!assessmentSession || assessmentSession.userId !== session.user.id) {
    redirect('/assessments');
  }

  // Fetch user's videos for the swing picker
  const userVideos = await prisma.video.findMany({
    where: {
      userId: session.user.id,
      skeletonExtracted: true, // Only show videos with skeleton data
    },
    select: {
      id: true,
      title: true,
      videoType: true,
      uploadDate: true,
    },
    orderBy: { uploadDate: 'desc' },
  });

  return (
    <AssessmentSessionClient
      session={assessmentSession as any}
      availableVideos={userVideos}
    />
  );
}
