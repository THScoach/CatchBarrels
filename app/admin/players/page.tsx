import { prisma } from '@/lib/db';
import PlayersClient from './players-client';

export default async function PlayersPage() {
  // Fetch all users with active memberships
  const players = await prisma.user.findMany({
    where: {
      OR: [
        { membershipStatus: 'active' },
        { role: { in: ['admin', 'coach'] } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      whopUserId: true,
      whopMembershipId: true,
      membershipTier: true,
      membershipStatus: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      lastWhopSync: true,
      assessmentCompletedAt: true,
      assessmentVipExpiresAt: true,
      assessmentVipActive: true,
      _count: {
        select: {
          videos: true,
          playerLessons: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  // Get last session date for each player
  const playersWithSessions = await Promise.all(
    players.map(async (player) => {
      const lastVideo = await prisma.video.findFirst({
        where: { userId: player.id },
        orderBy: { uploadDate: 'desc' },
        select: { uploadDate: true },
      });

      return {
        ...player,
        lastSessionDate: lastVideo?.uploadDate || null,
        sessionCount: player._count.videos,
        lessonCount: player._count.playerLessons,
      };
    })
  );

  return <PlayersClient players={playersWithSessions} />;
}
