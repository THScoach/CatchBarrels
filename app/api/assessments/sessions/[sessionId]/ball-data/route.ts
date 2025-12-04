import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * POST /api/assessments/sessions/[sessionId]/ball-data
 * Add ball data (HitTrax/Rapsodo/etc.) to an assessment session
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const {
      swingId,
      exitVelocity,
      launchAngle,
      distance,
      direction,
      hangTime,
      spinRate,
      spinAxis,
      result,
      hitType,
      pitchSpeed,
      pitchType,
      source,
    } = await req.json();

    const { sessionId } = params;

    // Verify session ownership
    const assessmentSession = await prisma.assessmentSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
    });

    if (!assessmentSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Create ball data point
    const ballData = await prisma.ballDataPoint.create({
      data: {
        sessionId,
        exitVelocity,
        launchAngle,
        distance,
        direction,
        hangTime,
        spinRate,
        spinAxis,
        result,
        hitType,
        pitchSpeed,
        pitchType,
        source: source || 'manual',
      },
    });

    // If swingId provided, link to swing
    if (swingId) {
      // Verify swing belongs to this session
      const swing = await prisma.swingAnalysis.findFirst({
        where: {
          id: swingId,
          sessionId,
        },
      });

      if (swing) {
        await prisma.swingAnalysis.update({
          where: { id: swingId },
          data: { ballDataId: ballData.id },
        });
      }
    }

    return NextResponse.json({
      ballDataId: ballData.id,
    });
  } catch (error: any) {
    console.error('[API] Add ball data to session error:', error);
    return NextResponse.json(
      { error: 'Failed to add ball data to session', message: error.message },
      { status: 500 }
    );
  }
}
