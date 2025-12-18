import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import EditAssessmentClient from './edit-assessment-client';

export default async function EditAssessmentPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login');
  }

  const userRole = (session.user as any).role || 'player';
  const isAdmin = userRole === 'admin' || userRole === 'coach';

  if (!isAdmin) {
    redirect('/dashboard');
  }

  // Get assessment
  const assessment = await prisma.playerAssessment.findUnique({
    where: { id: params.id },
    include: {
      athlete: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
        },
      },
      createdByUser: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
  });

  if (!assessment) {
    redirect('/admin/player-assessments');
  }

  return <EditAssessmentClient assessment={assessment as any} />;
}
