import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { DrillsClient } from './drills-client';

export default async function DrillsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login');
  }

  const drills = await prisma.drill.findMany({
    orderBy: { name: 'asc' },
  });

  return <DrillsClient drills={drills} />;
}
