import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/assessments/sessions/[sessionId]/report
 * Get the assessment report
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const report = await prisma.assessmentReport.findFirst({
      where: {
        sessionId: params.sessionId,
        session: {
          userId: session.user.id,
        },
      },
      include: {
        metrics: true,
        session: {
          include: {
            swings: {
              include: {
                metrics: true,
                video: {
                  select: {
                    id: true,
                    title: true,
                    thumbnailUrl: true,
                  },
                },
              },
              orderBy: { swingNumber: 'asc' },
            },
            ballData: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (error: any) {
    console.error('[API] Get assessment report error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment report', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/assessments/sessions/[sessionId]/report
 * Update body recommendations in the assessment report
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const {
      lowerBodyNotes,
      upperBodyNotes,
      batPathNotes,
      movementNotes,
      plan,
      topPriorities,
    } = await req.json();

    // Verify session ownership
    const assessmentSession = await prisma.assessmentSession.findFirst({
      where: {
        id: params.sessionId,
        userId: session.user.id,
      },
    });

    if (!assessmentSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Update report
    const report = await prisma.assessmentReport.update({
      where: { sessionId: params.sessionId },
      data: {
        lowerBodyNotes,
        upperBodyNotes,
        batPathNotes,
        movementNotes,
        plan,
        topPriorities,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ report });
  } catch (error: any) {
    console.error('[API] Update assessment report error:', error);
    return NextResponse.json(
      { error: 'Failed to update assessment report', message: error.message },
      { status: 500 }
    );
  }
}
