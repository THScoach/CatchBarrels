import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { calculateTimingMetrics } from '@/lib/timing-calculations';

export const dynamic = 'force-dynamic';

// POST /api/timing-pitches - Add pitch to session
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
      sessionId,
      pitchNumber,
      speedLabel,
      machineSpeedMph,
      frameRelease,
      frameLaunch,
      frameContact,
      outcome,
      exitVelo,
      contactType,
      resultType,
      resultLocation,
      launchAngle,
      distance,
    } = body;

    // Validation
    if (!sessionId || !pitchNumber || !speedLabel || !machineSpeedMph) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify session ownership
    const timingSession = await prisma.timingSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id,
      },
    });

    if (!timingSession) {
      return NextResponse.json(
        { error: 'Timing session not found' },
        { status: 404 }
      );
    }

    // Get previous pitch for transition analysis
    const previousPitch = await prisma.timingPitch.findFirst({
      where: {
        sessionId,
        pitchNumber: pitchNumber - 1,
      },
      select: { speedLabel: true },
    });

    // Calculate timing metrics
    const metrics = calculateTimingMetrics({
      machineDistanceFt: Number(timingSession.machineDistanceFt),
      machineSpeedMph: Number(machineSpeedMph),
      videoFps: timingSession.videoFps,
      frameRelease,
      frameLaunch,
      frameContact,
    });

    const pitch = await prisma.timingPitch.create({
      data: {
        sessionId,
        pitchNumber,
        speedLabel,
        machineSpeedMph,
        frameRelease,
        frameLaunch,
        frameContact,
        timeToPlatMs: metrics.timeToPlatMs,
        decisionTimeMs: metrics.decisionTimeMs,
        bufferMs: metrics.bufferMs,
        swingTimeMs: metrics.swingTimeMs,
        outcome,
        exitVelo,
        contactType,
        resultType,
        resultLocation,
        launchAngle,
        distance,
        previousPitchSpeedLabel: previousPitch?.speedLabel || null,
      },
    });

    return NextResponse.json(pitch, { status: 201 });
  } catch (error) {
    console.error('Error creating timing pitch:', error);
    return NextResponse.json(
      { error: 'Failed to create timing pitch', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
