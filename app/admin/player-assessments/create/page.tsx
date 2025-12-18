import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import CreateAssessmentClient from './create-assessment-client';

export default async function CreateAssessmentPage({
  searchParams,
}: {
  searchParams: { athleteId?: string };
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

  // Get all athletes
  const athletes = await prisma.user.findMany({
    where: {
      role: 'player',
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
    },
    orderBy: {
      username: 'asc',
    },
  });

  return (
    <CreateAssessmentClient 
      athletes={athletes} 
      preSelectedAthleteId={searchParams.athleteId}
    />
  );
}
