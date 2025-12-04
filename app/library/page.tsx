
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import LibraryClient from './library-client';

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  // Fetch athlete-facing courses
  const courses = await prisma.course.findMany({
    where: {
      visibility: 'athlete',
      published: true,
    },
    include: {
      modules: {
        include: {
          lessons: {
            include: {
              assets: true,
            },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
      tags: true,
    },
    orderBy: [
      { featured: 'desc' },
      { order: 'asc' },
      { createdAt: 'desc' },
    ],
  });

  return <LibraryClient courses={courses} />;
}
