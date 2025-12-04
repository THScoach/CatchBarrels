import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { DrillDetailClient } from './drill-detail-client';

export default async function DrillDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login');
  }

  const drill = await prisma.drill.findUnique({
    where: { id: params.id },
  });

  if (!drill) {
    redirect('/drills');
  }

  return <DrillDetailClient drill={drill} />;
}
