import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/sessions/[id] - Get a specific session with all videos
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const trainingSession = await prisma.trainingSession.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        videos: {
          orderBy: { uploadDate: 'desc' },
        },
        _count: {
          select: { videos: true },
        },
      },
    });

    if (!trainingSession) {
      return NextResponse.json(
        { error: 'Session not found or unauthorized' },
        { status: 404 }
      );
    }

    // Calculate average scores
    const analyzedVideos = trainingSession.videos.filter(
      (v) => v.analyzed && v.overallScore
    );
    const avgScore = analyzedVideos.length > 0
      ? Math.round(
          analyzedVideos.reduce((sum, v) => sum + (v.overallScore || 0), 0) /
            analyzedVideos.length
        )
      : null;

    return NextResponse.json({
      ...trainingSession,
      swingCount: trainingSession._count.videos,
      avgScore,
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

// PATCH /api/sessions/[id] - End a session or update its details
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { endSession, sessionName, location } = body;

    // Verify ownership
    const existingSession = await prisma.trainingSession.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Session not found or unauthorized' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};

    if (endSession) {
      updateData.endedAt = new Date();
    }

    if (sessionName !== undefined) {
      updateData.sessionName = sessionName || null;
    }

    if (location !== undefined) {
      updateData.location = location || null;
    }

    const updatedSession = await prisma.trainingSession.update({
      where: { id: params.id },
      data: updateData,
      include: {
        videos: {
          orderBy: { uploadDate: 'desc' },
          select: {
            id: true,
            title: true,
            overallScore: true,
            analyzed: true,
          },
        },
        _count: {
          select: { videos: true },
        },
      },
    });

    return NextResponse.json({
      message: endSession ? 'Session ended successfully' : 'Session updated successfully',
      session: updatedSession,
    });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

// DELETE /api/sessions/[id] - Delete a session (optional, for cleanup)
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const existingSession = await prisma.trainingSession.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Session not found or unauthorized' },
        { status: 404 }
      );
    }

    await prisma.trainingSession.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: 'Session deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
