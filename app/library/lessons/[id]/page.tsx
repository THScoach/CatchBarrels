
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import LessonDetailClient from './lesson-detail-client';

export default async function LessonPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/auth/login');
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    include: {
      module: {
        include: {
          course: true
        }
      },
      assets: true
    }
  });

  if (!lesson) {
    redirect('/library');
  }

  return <LessonDetailClient lesson={lesson} />;
}
