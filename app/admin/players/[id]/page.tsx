import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import PlayerDetailClient from './player-detail-client';

export default async function PlayerDetailPage({ params }: { params: { id: string } }) {
  const player = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      videos: {
        take: 10,
        orderBy: { uploadDate: 'desc' },
        select: {
          id: true,
          title: true,
          videoType: true,
          analyzed: true,
          overallScore: true,
          anchor: true,
          engine: true,
          whip: true,
          uploadDate: true,
        },
      },
      playerLessons: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          goal: true,
          status: true,
          lessonBarrelScore: true,
          swingCount: true,
          createdAt: true,
          completedAt: true,
        },
      },
    },
  });

  if (!player) {
    notFound();
  }

  return <PlayerDetailClient player={player} />;
}
