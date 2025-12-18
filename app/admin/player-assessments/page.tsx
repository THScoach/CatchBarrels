import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import PlayerAssessmentsAdminClient from './player-assessments-admin-client';

export default async function PlayerAssessmentsAdminPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login');
  }

  const userRole = (session.user as any).role || 'player';
  const isAdmin = userRole === 'admin' || userRole === 'coach';

  if (!isAdmin) {
    redirect('/dashboard');
  }

  return <PlayerAssessmentsAdminClient />;
}
