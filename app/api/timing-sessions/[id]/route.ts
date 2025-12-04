import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/timing-sessions/[id] - Get single timing session with all pitches
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { username: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const timingSession = await prisma.timingSession.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        pitches: {
          orderBy: { pitchNumber: 'asc' },
        },
      },
    });

    if (!timingSession) {
      return NextResponse.json(
        { error: 'Timing session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(timingSession);
  } catch (error) {
    console.error('Error fetching timing session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timing session', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT /api/timing-sessions/[id] - Update timing session
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { username: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify ownership
    const existingSession = await prisma.timingSession.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Timing session not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { sessionDate, machineDistanceFt, videoFps, notes } = body;

    const updatedSession = await prisma.timingSession.update({
      where: { id: params.id },
      data: {
        ...(sessionDate && { sessionDate: new Date(sessionDate) }),
        ...(machineDistanceFt && { machineDistanceFt }),
        ...(videoFps && { videoFps: parseInt(videoFps) }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error('Error updating timing session:', error);
    return NextResponse.json(
      { error: 'Failed to update timing session', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/timing-sessions/[id] - Delete timing session
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { username: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify ownership
    const existingSession = await prisma.timingSession.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Timing session not found' },
        { status: 404 }
      );
    }

    await prisma.timingSession.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Timing session deleted successfully' });
  } catch (error) {
    console.error('Error deleting timing session:', error);
    return NextResponse.json(
      { error: 'Failed to delete timing session', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
