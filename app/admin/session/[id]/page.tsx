import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import { getSessionDetail } from '@/lib/admin/getSessionDetail';
import SessionDetailClient from './session-detail-client';

export const metadata = {
  title: 'Session Detail - Coach Admin',
  description: 'Deep dive into session metrics and AI analysis',
};

interface PageProps {
  params: {
    id: string;
  };
}

export default async function AdminSessionDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login?callbackUrl=/admin');
  }

  const isCoach = (session.user as any)?.isCoach || false;

  if (!isCoach) {
    redirect('/dashboard?error=unauthorized');
  }

  // Fetch session detail
  const sessionDetail = await getSessionDetail(params.id);

  if (!sessionDetail) {
    redirect('/admin?error=session-not-found');
  }

  return <SessionDetailClient session={sessionDetail} />;
}
