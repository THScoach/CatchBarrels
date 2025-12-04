import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import AssessmentsAdminClient from './assessments-admin-client';

export default async function AssessmentsAdminPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login');
  }

  // Fetch all users for dropdown
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
    },
    orderBy: {
      username: 'asc',
    },
  });

  return <AssessmentsAdminClient users={users} />;
}
