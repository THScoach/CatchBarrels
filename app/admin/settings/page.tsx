import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import SettingsClient from './settings-client';

export const metadata = {
  title: 'Settings | Coach Control Room',
  description: 'Configure coach profile, branding, and integrations',
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  // Fetch current user details
  const user = session?.user
    ? await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          lastWhopSync: true,
        },
      })
    : null;

  return <SettingsClient user={user} />;
}
