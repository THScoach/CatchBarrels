import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import AssessmentRequiredClient from './assessment-required-client';

export default async function AssessmentRequiredPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login');
  }

  const userRole = (session.user as any).role || 'player';
  const isAdmin = userRole === 'admin' || userRole === 'coach';

  // Admins shouldn't see this page
  if (isAdmin) {
    redirect('/dashboard');
  }

  return <AssessmentRequiredClient />;
}
