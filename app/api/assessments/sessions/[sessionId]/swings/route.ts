import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * POST /api/assessments/sessions/[sessionId]/swings
 * Add a swing to an assessment session
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
    const { videoId, swingNumber, swingType } = await req.json();
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

    // Verify video ownership if videoId provided
    if (videoId) {
      const video = await prisma.video.findFirst({
        where: {
          id: videoId,
          userId: session.user.id,
        },
      });

      if (!video) {
        return NextResponse.json({ error: 'Video not found' }, { status: 404 });
      }
    }

    // Create swing record
    const swing = await prisma.swingAnalysis.create({
      data: {
        sessionId,
        videoId,
        swingNumber: swingNumber || assessmentSession.totalSwings + 1,
        swingType,
        analyzed: false,
        analysisStatus: 'pending',
      },
    });

    // Update session totals
    await prisma.assessmentSession.update({
      where: { id: sessionId },
      data: {
        totalSwings: { increment: 1 },
      },
    });

    return NextResponse.json({
      swingId: swing.id,
      analyzed: false,
      status: 'pending',
    });
  } catch (error: any) {
    console.error('[API] Add swing to session error:', error);
    return NextResponse.json(
      { error: 'Failed to add swing to session', message: error.message },
      { status: 500 }
    );
  }
}
