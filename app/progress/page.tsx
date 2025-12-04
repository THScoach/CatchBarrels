import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { ProgressClient } from './progress-client';

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login');
  }

  const progress = await prisma.progressEntry.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { date: 'asc' },
  });

  return <ProgressClient progress={progress} />;
}
