import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import LessonNewClient from './lesson-new-client';

export default async function NewLessonPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  // Check for active lesson
  const activeLesson = await prisma.playerLesson.findFirst({
    where: {
      userId: session.user.id,
      status: 'ACTIVE',
    },
    include: {
      videos: {
        orderBy: { uploadDate: 'desc' },
        take: 10,
      },
    },
  });

  return <LessonNewClient activeLesson={activeLesson} user={session.user} />;
}
