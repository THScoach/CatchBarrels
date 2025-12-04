import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { ProfileClient } from './profile-client';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
  });

  // Fetch user's assessment sessions with reports
  const assessments = await prisma.assessmentSession.findMany({
    where: { 
      userId: (session.user as any).id,
      status: 'completed',
    },
    include: {
      report: {
        include: {
          metrics: {
            select: {
              anchorScore: true,
              engineScore: true,
              whipScore: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return <ProfileClient user={user} assessments={assessments} />;
}
