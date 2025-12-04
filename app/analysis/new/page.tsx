import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { NewAnalysisClient } from './new-analysis-client';

export default async function NewAnalysisPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: {
      height: true,
      bats: true,
    },
  });

  return <NewAnalysisClient 
    userHeight={user?.height || undefined}
    userHandedness={user?.bats?.toLowerCase() === 'left' ? 'left' : 'right'}
  />;
}
