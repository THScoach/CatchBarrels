
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import CoachingClient from './coaching-client';

export default async function CoachingPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login');
  }
  
  // Fetch all coaching sessions
  const sessions = await prisma.coachingCall.findMany({
    orderBy: {
      callDate: 'desc'
    }
  });
  
  return <CoachingClient sessions={sessions} />;
}
