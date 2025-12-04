import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/sessions - List all sessions for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await prisma.trainingSession.findMany({
      where: {
        userId: session.user.id,
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

    // Calculate average scores for each session
    const sessionsWithStats = sessions.map((session) => {
      const analyzedVideos = session.videos.filter((v) => v.analyzed && v.overallScore);
      const avgScore = analyzedVideos.length > 0
        ? Math.round(
            analyzedVideos.reduce((sum, v) => sum + (v.overallScore || 0), 0) / analyzedVideos.length
          )
        : null;

      return {
        ...session,
        swingCount: session._count.videos,
        avgScore,
      };
    });

    return NextResponse.json(sessionsWithStats);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST /api/sessions - Create a new training session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionName, location } = body;

    const trainingSession = await prisma.trainingSession.create({
      data: {
        userId: session.user.id,
        sessionName: sessionName || null,
        location: location || null,
      },
    });

    return NextResponse.json(
      {
        id: trainingSession.id,
        message: 'Training session created successfully',
        session: trainingSession,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
