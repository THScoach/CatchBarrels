import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import NewAssessmentClient from './new-assessment-client';

export default async function NewAssessmentPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  return <NewAssessmentClient />;
}
