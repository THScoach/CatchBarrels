import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import UploadsClient from './uploads-client';

export const metadata = {
  title: 'Upload Management | Coach Control Room',
  description: 'Manage uploaded videos and analysis status',
};

export default async function UploadsPage() {
  const session = await getServerSession(authOptions);

  // Fetch all videos (analyzed and unanalyzed)
  const videos = await prisma.video.findMany({
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
    take: 100, // Limit to last 100 uploads
  });

  // Get all players for linking unassigned uploads
  const players = await prisma.user.findMany({
    where: {
      role: 'player',
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return <UploadsClient videos={videos} players={players} />;
}
