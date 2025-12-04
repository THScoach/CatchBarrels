import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/sessions/active - Get the current active session (endedAt is null)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activeSession = await prisma.trainingSession.findFirst({
      where: {
        userId: session.user.id,
        endedAt: null,
      },
      include: {
        videos: {
          orderBy: { uploadDate: 'desc' },
          select: {
            id: true,
            title: true,
            videoUrl: true,
            thumbnailUrl: true,
            overallScore: true,
            anchor: true,
            engine: true,
            whip: true,
            analyzed: true,
            uploadDate: true,
          },
        },
        _count: {
          select: { videos: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!activeSession) {
      return NextResponse.json({ activeSession: null });
    }

    // Calculate average scores
    const analyzedVideos = activeSession.videos.filter((v) => v.analyzed && v.overallScore);
    const avgScore = analyzedVideos.length > 0
      ? Math.round(
          analyzedVideos.reduce((sum, v) => sum + (v.overallScore || 0), 0) / analyzedVideos.length
        )
      : null;

    return NextResponse.json({
      activeSession: {
        ...activeSession,
        swingCount: activeSession._count.videos,
        avgScore,
      },
    });
  } catch (error) {
    console.error('Error fetching active session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active session' },
      { status: 500 }
    );
  }
}
