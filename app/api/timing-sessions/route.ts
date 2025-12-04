import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST /api/timing-sessions - Create new timing session
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      sessionDate,
      testType = '52_pitch_timing',
      machineDistanceFt,
      videoFps,
      notes,
    } = body;

    // Validation
    if (!sessionDate || !machineDistanceFt || !videoFps) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionDate, machineDistanceFt, videoFps' },
        { status: 400 }
      );
    }

    const timingSession = await prisma.timingSession.create({
      data: {
        userId: user.id,
        sessionDate: new Date(sessionDate),
        testType,
        machineDistanceFt,
        videoFps: parseInt(videoFps),
        notes,
      },
    });

    return NextResponse.json(timingSession, { status: 201 });
  } catch (error) {
    console.error('Error creating timing session:', error);
    return NextResponse.json(
      { error: 'Failed to create timing session', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// GET /api/timing-sessions - List all timing sessions for user
export async function GET() {
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

    const timingSessions = await prisma.timingSession.findMany({
      where: { userId: user.id },
      include: {
        pitches: {
          orderBy: { pitchNumber: 'asc' },
        },
      },
      orderBy: { sessionDate: 'desc' },
    });

    return NextResponse.json(timingSessions);
  } catch (error) {
    console.error('Error fetching timing sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timing sessions', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
