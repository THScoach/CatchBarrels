import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { calculateTimingMetrics } from '@/lib/timing-calculations';

export const dynamic = 'force-dynamic';

// PUT /api/timing-pitches/[id] - Update pitch
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

    // Verify ownership via session
    const existingPitch = await prisma.timingPitch.findUnique({
      where: { id: params.id },
      include: {
        session: true,
      },
    });

    if (!existingPitch || existingPitch.session.userId !== user.id) {
      return NextResponse.json(
        { error: 'Timing pitch not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
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

    // Recalculate timing metrics if frame data changed
    let metrics = {};
    if (frameRelease !== undefined || frameLaunch !== undefined || frameContact !== undefined || machineSpeedMph !== undefined) {
      const calculatedMetrics = calculateTimingMetrics({
        machineDistanceFt: Number(existingPitch.session.machineDistanceFt),
        machineSpeedMph: Number(machineSpeedMph || existingPitch.machineSpeedMph),
        videoFps: existingPitch.session.videoFps,
        frameRelease: frameRelease ?? existingPitch.frameRelease ?? undefined,
        frameLaunch: frameLaunch ?? existingPitch.frameLaunch ?? undefined,
        frameContact: frameContact ?? existingPitch.frameContact ?? undefined,
      });
      metrics = {
        timeToPlatMs: calculatedMetrics.timeToPlatMs,
        decisionTimeMs: calculatedMetrics.decisionTimeMs,
        bufferMs: calculatedMetrics.bufferMs,
        swingTimeMs: calculatedMetrics.swingTimeMs,
      };
    }

    const updatedPitch = await prisma.timingPitch.update({
      where: { id: params.id },
      data: {
        ...(speedLabel && { speedLabel }),
        ...(machineSpeedMph && { machineSpeedMph }),
        ...(frameRelease !== undefined && { frameRelease }),
        ...(frameLaunch !== undefined && { frameLaunch }),
        ...(frameContact !== undefined && { frameContact }),
        ...(outcome !== undefined && { outcome }),
        ...(exitVelo !== undefined && { exitVelo }),
        ...(contactType !== undefined && { contactType }),
        ...(resultType !== undefined && { resultType }),
        ...(resultLocation !== undefined && { resultLocation }),
        ...(launchAngle !== undefined && { launchAngle }),
        ...(distance !== undefined && { distance }),
        ...metrics,
      },
    });

    return NextResponse.json(updatedPitch);
  } catch (error) {
    console.error('Error updating timing pitch:', error);
    return NextResponse.json(
      { error: 'Failed to update timing pitch', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/timing-pitches/[id] - Delete pitch
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

    // Verify ownership via session
    const existingPitch = await prisma.timingPitch.findUnique({
      where: { id: params.id },
      include: {
        session: true,
      },
    });

    if (!existingPitch || existingPitch.session.userId !== user.id) {
      return NextResponse.json(
        { error: 'Timing pitch not found' },
        { status: 404 }
      );
    }

    await prisma.timingPitch.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Timing pitch deleted successfully' });
  } catch (error) {
    console.error('Error deleting timing pitch:', error);
    return NextResponse.json(
      { error: 'Failed to delete timing pitch', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
