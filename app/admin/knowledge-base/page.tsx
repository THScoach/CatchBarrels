
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import KnowledgeBaseAdminClient from './knowledge-base-admin-client';

export default async function KnowledgeBaseAdminPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  // TODO: Add admin role check
  // For now, any authenticated user can access

  return <KnowledgeBaseAdminClient />;
}
