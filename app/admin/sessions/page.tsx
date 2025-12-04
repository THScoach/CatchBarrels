import { prisma } from '@/lib/db';
import SessionsClient from './sessions-client';

export default async function SessionsPage() {
  const sessions = await prisma.video.findMany({
    where: {
      analyzed: true,
    },
    take: 50,
    orderBy: { uploadDate: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
        },
      },
    },
  });

  return <SessionsClient sessions={sessions} />;
}
