import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import ReportsClient from './reports-client';

export const metadata = {
  title: 'Video Library & Reports | Coach Control Room',
  description: 'Browse analyzed sessions and reports',
};

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);

  // Fetch all analyzed videos with user and scoring data
  const videos = await prisma.video.findMany({
    where: {
      analyzed: true,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      uploadDate: 'desc',
    },
    take: 200, // Limit to last 200 videos
  });

  // Get unique players for filter
  const players = await prisma.user.findMany({
    where: {
      videos: {
        some: {
          analyzed: true,
        },
      },
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return <ReportsClient videos={videos} players={players} />;
}
