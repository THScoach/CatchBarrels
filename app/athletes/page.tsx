
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import AthletesClient from './athletes-client';

/**
 * Athletes Page - Shows list of athletes (for coaches) or redirects to own profile
 * In single-athlete mode, this shows the current user's athlete profile
 */
export default async function AthletesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  const userId = (session.user as any).id;

  // Fetch current user's data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      videos: {
        orderBy: { uploadDate: 'desc' },
        take: 10,
      },
    },
  });

  if (!user) {
    redirect('/auth/login');
  }

  // For now, treat the current user as the athlete
  // Future: Support multiple athletes for coaching accounts
  return <AthletesClient user={user} />;
}
