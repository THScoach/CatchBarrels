import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import LessonHistoryClient from './lesson-history-client';

export default async function LessonHistoryPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  // Fetch completed lessons
  const lessons = await prisma.playerLesson.findMany({
    where: {
      userId: session.user.id,
      status: 'COMPLETED',
    },
    include: {
      videos: {
        select: {
          id: true,
          title: true,
          uploadDate: true,
        },
        orderBy: { uploadDate: 'desc' },
      },
    },
    orderBy: { completedAt: 'desc' },
    take: 50,
  });

  return <LessonHistoryClient lessons={lessons} user={session.user} />;
}
